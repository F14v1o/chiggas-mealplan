#!/usr/bin/env node
/**
 * Deal-Scraper für Migros & Denner Aktionen
 * Läuft als GitHub Action (cron) und generiert public/deals.json
 * 
 * Strategien:
 * 1. Migros: Fetch HTML → parse __NEXT_DATA__ oder JSON-LD
 * 2. Denner: Fetch HTML → parse strukturierte Daten
 * 3. Fallback: Leere deals.json
 */

import { writeFileSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUTPUT = join(__dirname, '..', 'public', 'deals.json');

// Mealplan-relevante Keywords für Filterung
const KEYWORDS = [
  'hackfleisch', 'rindfleisch', 'schweinefleisch', 'poulet', 'hähnchen', 'chicken',
  'lachs', 'thunfisch', 'fisch', 'crevetten', 'garnelen',
  'reis', 'haferflocken', 'linsen', 'edamame', 'erbsen',
  'eier', 'milch', 'joghurt', 'quark', 'hüttenkäse', 'mozzarella', 'käse',
  'avocado', 'brokkoli', 'spinat', 'kartoffel', 'süsskartoffel',
  'banane', 'blaubeeren', 'apfel', 'beeren',
  'erdnussbutter', 'nussmus', 'mandelmus', 'nüsse', 'mandeln', 'walnüsse',
  'olivenöl', 'kokosöl', 'butter',
  'whey', 'protein', 'kreatin',
  'vollkornbrot', 'knäckebrot', 'tortilla', 'pasta', 'spaghetti',
  'tomaten', 'passata', 'kokosmilch', 'sojasauce',
  'tiefkühl', 'tk-gemüse', 'gefrier'
];

function isRelevant(productName) {
  const lower = productName.toLowerCase();
  return KEYWORDS.some(kw => lower.includes(kw));
}

async function fetchWithTimeout(url, timeout = 15000) {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);
  try {
    const res = await fetch(url, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'de-CH,de;q=0.9,en;q=0.8',
      }
    });
    clearTimeout(id);
    return res;
  } catch (e) {
    clearTimeout(id);
    throw e;
  }
}

// ─── Strategie 1: Migros Angebote ───────────────────────────────
async function scrapeMigros() {
  const deals = [];
  console.log('🔍 [Migros] Scraping Angebote...');

  try {
    // Versuch 1: Migros Angebote-Seite
    const urls = [
      'https://www.migros.ch/de/angebote',
      'https://www.migros.ch/de/angebote.html'
    ];

    for (const url of urls) {
      try {
        const res = await fetchWithTimeout(url);
        if (!res.ok) continue;
        const html = await res.text();

        // Strategie A: __NEXT_DATA__ JSON parsen
        const nextDataMatch = html.match(/<script id="__NEXT_DATA__"[^>]*>([\s\S]*?)<\/script>/);
        if (nextDataMatch) {
          try {
            const nextData = JSON.parse(nextDataMatch[1]);
            const offers = extractMigrosOffersFromNextData(nextData);
            deals.push(...offers);
            if (offers.length > 0) {
              console.log(`  ✅ [Migros] ${offers.length} Deals via __NEXT_DATA__`);
              break;
            }
          } catch (e) {
            console.log(`  ⚠ [Migros] __NEXT_DATA__ parse error: ${e.message}`);
          }
        }

        // Strategie B: JSON-LD Schema parsen
        const jsonLdMatches = html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g);
        for (const match of jsonLdMatches) {
          try {
            const ld = JSON.parse(match[1]);
            const offers = extractFromJsonLd(ld, 'Migros');
            deals.push(...offers);
          } catch (e) { /* ignore */ }
        }

        // Strategie C: Embedded JSON in script tags
        const scriptMatches = html.matchAll(/<script[^>]*>[\s\S]*?(\{[\s\S]*?"offers?"[\s\S]*?\})[\s\S]*?<\/script>/gi);
        for (const match of scriptMatches) {
          try {
            const data = JSON.parse(match[1]);
            if (data.offers || data.products) {
              const items = data.offers || data.products || [];
              for (const item of items) {
                if (item.name && isRelevant(item.name)) {
                  deals.push(formatDeal(item, 'Migros'));
                }
              }
            }
          } catch (e) { /* ignore */ }
        }

        if (deals.length > 0) break;
      } catch (e) {
        console.log(`  ⚠ [Migros] Fetch error for ${url}: ${e.message}`);
      }
    }
  } catch (e) {
    console.log(`  ❌ [Migros] General error: ${e.message}`);
  }

  console.log(`  📦 [Migros] Total: ${deals.length} relevante Deals`);
  return deals;
}

function extractMigrosOffersFromNextData(data) {
  const deals = [];
  // Rekursiv durch das NextData-Objekt suchen
  const search = (obj, depth = 0) => {
    if (depth > 10 || !obj || typeof obj !== 'object') return;
    
    // Prüfe ob dieses Objekt ein Produkt/Angebot ist
    if (obj.name && (obj.price || obj.offer || obj.promotion || obj.discount)) {
      if (isRelevant(obj.name)) {
        deals.push(formatDeal(obj, 'Migros'));
      }
    }
    
    // Array durchsuchen
    if (Array.isArray(obj)) {
      for (const item of obj) search(item, depth + 1);
    } else {
      for (const key of Object.keys(obj)) {
        if (['products', 'offers', 'items', 'promotions', 'teasers', 'content', 'data', 'props', 'pageProps'].includes(key)) {
          search(obj[key], depth + 1);
        }
      }
    }
  };
  
  search(data);
  return deals;
}

// ─── Strategie 2: Denner Angebote ───────────────────────────────
async function scrapeDenner() {
  const deals = [];
  console.log('🔍 [Denner] Scraping Angebote...');

  try {
    const urls = [
      'https://www.denner.ch/de/angebote/',
      'https://www.denner.ch/de/aktionen/'
    ];

    for (const url of urls) {
      try {
        const res = await fetchWithTimeout(url);
        if (!res.ok) continue;
        const html = await res.text();

        // Strategie A: __NEXT_DATA__
        const nextDataMatch = html.match(/<script id="__NEXT_DATA__"[^>]*>([\s\S]*?)<\/script>/);
        if (nextDataMatch) {
          try {
            const nextData = JSON.parse(nextDataMatch[1]);
            const offers = extractDennerOffersFromNextData(nextData);
            deals.push(...offers);
            if (offers.length > 0) {
              console.log(`  ✅ [Denner] ${offers.length} Deals via __NEXT_DATA__`);
              break;
            }
          } catch (e) {
            console.log(`  ⚠ [Denner] __NEXT_DATA__ parse error: ${e.message}`);
          }
        }

        // Strategie B: JSON-LD
        const jsonLdMatches = html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g);
        for (const match of jsonLdMatches) {
          try {
            const ld = JSON.parse(match[1]);
            const offers = extractFromJsonLd(ld, 'Denner');
            deals.push(...offers);
          } catch (e) { /* ignore */ }
        }

        // Strategie C: HTML parsing - Denner Angebotskarten
        const productMatches = html.matchAll(/class="[^"]*product[^"]*"[\s\S]*?<[^>]*class="[^"]*name[^"]*"[^>]*>([^<]+)<[\s\S]*?(?:CHF|Fr\.?)\s*([\d.,]+)/gi);
        for (const match of productMatches) {
          const name = match[1].trim();
          const price = match[2].replace(',', '.');
          if (isRelevant(name)) {
            deals.push({
              product: name,
              store: 'Denner',
              price: price,
              oldPrice: null,
              discount: 0,
              validFrom: getWeekStart(),
              validUntil: getWeekEnd(),
              category: detectCategory(name)
            });
          }
        }

        if (deals.length > 0) break;
      } catch (e) {
        console.log(`  ⚠ [Denner] Fetch error for ${url}: ${e.message}`);
      }
    }
  } catch (e) {
    console.log(`  ❌ [Denner] General error: ${e.message}`);
  }

  console.log(`  📦 [Denner] Total: ${deals.length} relevante Deals`);
  return deals;
}

function extractDennerOffersFromNextData(data) {
  const deals = [];
  const search = (obj, depth = 0) => {
    if (depth > 10 || !obj || typeof obj !== 'object') return;
    
    if (obj.title && (obj.price || obj.salePrice || obj.promotionPrice)) {
      const name = obj.title || obj.name;
      if (name && isRelevant(name)) {
        deals.push({
          product: name,
          store: 'Denner',
          price: String(obj.salePrice || obj.promotionPrice || obj.price || ''),
          oldPrice: obj.regularPrice || obj.originalPrice || null,
          discount: obj.discountPercentage || obj.discount || 0,
          validFrom: obj.validFrom || obj.startDate || getWeekStart(),
          validUntil: obj.validUntil || obj.endDate || getWeekEnd(),
          category: detectCategory(name)
        });
      }
    }
    
    if (Array.isArray(obj)) {
      for (const item of obj) search(item, depth + 1);
    } else {
      for (const key of Object.keys(obj)) {
        search(obj[key], depth + 1);
      }
    }
  };
  
  search(data);
  return deals;
}

// ─── Hilfsfunktionen ─────────────────────────────────────────────
function extractFromJsonLd(ld, store) {
  const deals = [];
  if (!ld) return deals;
  
  const items = Array.isArray(ld) ? ld : [ld];
  for (const item of items) {
    if (item['@type'] === 'Product' || item['@type'] === 'Offer') {
      const name = item.name || '';
      if (isRelevant(name)) {
        const offer = item.offers || item;
        deals.push({
          product: name,
          store,
          price: String(offer.price || offer.lowPrice || ''),
          oldPrice: offer.highPrice || null,
          discount: 0,
          validFrom: offer.validFrom || getWeekStart(),
          validUntil: offer.validThrough || getWeekEnd(),
          category: detectCategory(name)
        });
      }
    }
  }
  return deals;
}

function formatDeal(item, store) {
  const name = item.name || item.title || item.description || 'Produkt';
  const price = item.price?.current || item.salePrice || item.promotionPrice || item.price?.value || item.price || 0;
  const oldPrice = item.price?.original || item.price?.was || item.regularPrice || item.originalPrice || null;
  const discount = item.discount || item.discountPercentage || 
    (oldPrice && price ? Math.round((1 - Number(price) / Number(oldPrice)) * 100) : 0);

  return {
    product: name,
    store,
    price: typeof price === 'number' ? price.toFixed(2) : String(price),
    oldPrice: oldPrice ? (typeof oldPrice === 'number' ? oldPrice.toFixed(2) : String(oldPrice)) : null,
    discount: Math.abs(discount),
    validFrom: item.validFrom || item.startDate || getWeekStart(),
    validUntil: item.validUntil || item.validThrough || item.endDate || getWeekEnd(),
    category: detectCategory(name)
  };
}

function detectCategory(name) {
  const n = name.toLowerCase();
  if (/hack|rind|schwein|poulet|hähnchen|chicken|steak|filet|wurst|schinken/.test(n)) return 'Fleisch';
  if (/lachs|thunfisch|fisch|crevetten|garnelen/.test(n)) return 'Fisch';
  if (/milch|joghurt|quark|käse|mozzarella|butter|rahm/.test(n)) return 'Milchprodukte';
  if (/eier|ei\b/.test(n)) return 'Eier';
  if (/reis|hafer|pasta|brot|knäcke|tortilla/.test(n)) return 'Getreide';
  if (/avocado|brokk|spinat|kartoffel|tomaten|gemüse/.test(n)) return 'Gemüse';
  if (/banane|apfel|beeren|blau/.test(n)) return 'Früchte';
  if (/erdnuss|nuss|mandel|öl|kokos/.test(n)) return 'Fette & Nüsse';
  return 'Sonstiges';
}

function getWeekStart() {
  const now = new Date();
  const day = now.getDay();
  const diff = now.getDate() - day + (day === 0 ? -6 : 1);
  return new Date(now.setDate(diff)).toISOString().split('T')[0];
}

function getWeekEnd() {
  const now = new Date();
  const day = now.getDay();
  const diff = now.getDate() - day + (day === 0 ? 0 : 7);
  return new Date(now.setDate(diff)).toISOString().split('T')[0];
}

// ─── Main ────────────────────────────────────────────────────────
async function main() {
  console.log('🛒 Chiggas Mealplan — Deal Scraper');
  console.log(`📅 ${new Date().toISOString()}`);
  console.log('─'.repeat(50));

  const migrosDeals = await scrapeMigros();
  const dennerDeals = await scrapeDenner();

  const allDeals = [...migrosDeals, ...dennerDeals];

  // Duplikate entfernen
  const seen = new Set();
  const uniqueDeals = allDeals.filter(d => {
    const key = `${d.store}-${d.product}`.toLowerCase();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  // Nach Rabatt sortieren (höchster zuerst)
  uniqueDeals.sort((a, b) => (b.discount || 0) - (a.discount || 0));

  const output = {
    lastUpdated: new Date().toISOString(),
    deals: uniqueDeals
  };

  // Sicherstellen dass public/ existiert
  mkdirSync(join(__dirname, '..', 'public'), { recursive: true });
  writeFileSync(OUTPUT, JSON.stringify(output, null, 2), 'utf-8');

  console.log('─'.repeat(50));
  console.log(`✅ Fertig! ${uniqueDeals.length} Deals gespeichert → public/deals.json`);
  
  if (uniqueDeals.length > 0) {
    console.log('\nTop Deals:');
    for (const d of uniqueDeals.slice(0, 5)) {
      console.log(`  🏷️  ${d.store} | ${d.product} | CHF ${d.price}${d.discount ? ` (-${d.discount}%)` : ''}`);
    }
  } else {
    console.log('\n⚠ Keine Deals gefunden — Seiten möglicherweise geändert.');
    console.log('  → Prüfe die Scraping-Strategien oder update die URLs.');
  }
}

main().catch(e => {
  console.error('❌ Scraper crashed:', e.message);
  // Trotzdem eine leere deals.json schreiben damit der Build nicht bricht
  mkdirSync(join(__dirname, '..', 'public'), { recursive: true });
  writeFileSync(OUTPUT, JSON.stringify({ lastUpdated: new Date().toISOString(), deals: [] }, null, 2), 'utf-8');
  process.exit(0); // Kein Fehler-Exit, damit die Action weiterläuft
});
