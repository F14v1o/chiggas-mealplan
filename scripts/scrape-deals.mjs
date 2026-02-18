#!/usr/bin/env node
/**
 * Deal-Scraper für Denner & Migros Aktionen
 * Läuft als GitHub Action (cron) und generiert public/deals.json
 *
 * Strategien:
 * 1. Denner: Fetch HTML → parse __NUXT_DATA__ → finde Produkt-URLs (~pXXXXX)
 *    - Scrape 3 Seiten: aktuelle Woche, ab Donnerstag, Homepage
 * 2. Migros: playwright-core + System-Chrome → Seite laden → API-Response abfangen
 *    - Kein Browser-Download nötig — nutzt den Chrome der auf dem System/CI installiert ist
 * 3. Fallback: Leere deals.json (Build bricht nie)
 */

import { writeFileSync, mkdirSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUTPUT = join(__dirname, '..', 'public', 'deals.json');

const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';

// ─── Mealplan-relevante Keywords ─────────────────────────────────
const KEYWORDS = [
  'hackfleisch', 'rindfleisch', 'schweinefleisch', 'poulet', 'hähnchen', 'chicken',
  'lachs', 'thunfisch', 'fisch', 'crevetten', 'garnelen',
  'reis', 'haferflocken', 'linsen', 'edamame', 'erbsen',
  'eier', 'milch', 'joghurt', 'quark', 'hüttenkäse', 'mozzarella', 'käse',
  'avocado', 'brokkoli', 'broccoli', 'spinat', 'kartoffel', 'süsskartoffel',
  'banane', 'blaubeeren', 'apfel', 'beeren',
  'erdnussbutter', 'erdnussmus', 'nussmus', 'mandelmus', 'nüsse', 'mandeln', 'walnüsse',
  'olivenöl', 'kokosöl', 'butter',
  'whey', 'protein', 'kreatin',
  'vollkornbrot', 'knäckebrot', 'tortilla', 'pasta', 'spaghetti',
  'tomaten', 'passata', 'kokosmilch', 'sojasauce',
  'tiefkühl', 'tk-gemüse', 'gefrier',
  'hamburger', 'schinken', 'bacon', 'wurst', 'cervelat',
  'schnitzel', 'geschnetzeltes', 'filet', 'steak', 'braten',
  'entrecote', 'nierstück', 'crevett', 'shrimp', 'pouletbrust',
  'mehl', 'brot', 'rind', 'schwein', 'fleisch',
  'meatball', 'rindsburger', 'kabeljau', 'pangasius', 'rahm',
  'wienerli', 'rippli', 'lammfilet', 'schweinsfilet', 'bratwurst',
  'voressen', 'mortadella',
];

function isRelevant(name) {
  if (!name) return false;
  const lower = name.toLowerCase();
  return KEYWORDS.some(kw => lower.includes(kw));
}

function detectCategory(name) {
  const n = name.toLowerCase();
  if (/hack|rind|schwein|poulet|hähnchen|chicken|steak|filet|wurst|schinken|schnitzel|nierstück|braten|burger|entrecote|lamm|ripp|wiener|geschnetzelt|meatball|bratwurst|voressen|mortadella|cordon/i.test(n)) return 'Fleisch';
  if (/lachs|thunfisch|fisch|crevetten|garnelen|shrimp|kabeljau|pangasius|muschel/i.test(n)) return 'Fisch';
  if (/milch|joghurt|quark|käse|mozzarella|butter|rahm|hüttenkäse|gruyère|emmentaler|tilsiter|babybel|feta|frischkäse|cantadou/i.test(n)) return 'Milchprodukte';
  if (/eier|ei\b/i.test(n)) return 'Eier';
  if (/reis|hafer|pasta|brot|knäcke|tortilla|mehl|zucker/i.test(n)) return 'Getreide';
  if (/avocado|brokk|broccoli|spinat|kartoffel|tomaten|gemüse|erbsen|edamame|linsen|mais|chicoree|salat/i.test(n)) return 'Gemüse';
  if (/banane|apfel|beeren|blau|mango|orange|grapefruit/i.test(n)) return 'Früchte';
  if (/erdnuss|nuss|mandel|öl|kokos/i.test(n)) return 'Fette & Nüsse';
  if (/protein|whey|kreatin/i.test(n)) return 'Supplements';
  return 'Sonstiges';
}

function getWeekStart() {
  const now = new Date();
  const day = now.getDay();
  const diff = now.getDate() - day + (day === 0 ? -6 : 1);
  return new Date(now.getFullYear(), now.getMonth(), diff).toISOString().split('T')[0];
}

function getWeekEnd() {
  const now = new Date();
  const day = now.getDay();
  const diff = now.getDate() - day + (day === 0 ? 0 : 7);
  return new Date(now.getFullYear(), now.getMonth(), diff).toISOString().split('T')[0];
}

/** Parse Denner "statt X.XX" / "statt X.–" Preis-String */
function parseStattPrice(str) {
  if (!str) return null;
  const cleaned = str
    .replace('statt ', '')
    .replace('–', '00')
    .replace(',', '.')
    .replace(/[^\d.]/g, '');
  const val = parseFloat(cleaned);
  return isNaN(val) ? null : val.toFixed(2);
}

async function fetchWithTimeout(url, options = {}, timeout = 20000) {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);
  try {
    const res = await fetch(url, { ...options, signal: controller.signal });
    clearTimeout(id);
    return res;
  } catch (e) {
    clearTimeout(id);
    throw e;
  }
}


// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// DENNER — via __NUXT_DATA__ Produkt-URL-Parsing
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

async function scrapeDennerPage(url) {
  const res = await fetchWithTimeout(url, {
    headers: { 'User-Agent': UA, 'Accept': 'text/html,application/xhtml+xml' }
  });

  if (!res.ok) throw new Error(`Status ${res.status}`);

  const html = await res.text();
  const match = html.match(/<script type="application\/json" id="__NUXT_DATA__"[^>]*>([\s\S]*?)<\/script>/);
  if (!match) throw new Error('Kein __NUXT_DATA__');

  const nuxtData = JSON.parse(match[1]);
  if (!Array.isArray(nuxtData)) throw new Error('__NUXT_DATA__ ist kein Array');

  const deals = [];

  for (let i = 0; i < nuxtData.length; i++) {
    const val = nuxtData[i];
    if (typeof val !== 'string') continue;

    // Finde Produkt-URLs: /de/aktionen-und-sortiment/PRODUCT~pXXXXXX
    const urlMatch = val.match(/\/de\/aktionen-und-sortiment\/([^~]+)~p(\d+)/);
    if (!urlMatch) continue;

    const productSlug = urlMatch[1];
    const productUrl = `https://www.denner.ch${val.split('?')[0]}`;

    // Suche Produktname, Preise und Labels in der Umgebung
    let productName = null;
    let newPriceStr = null;
    let oldPriceStr = null;
    let oldPriceIndex = -1;
    let discountLabel = null;

    // Rückwärts: Suche "statt X.XX" (alter Preis)
    for (let j = Math.max(0, i - 15); j < i; j++) {
      const v = nuxtData[j];
      if (typeof v === 'string' && v.startsWith('statt ')) {
        oldPriceStr = v;
        oldPriceIndex = j;
      }
    }

    // Vorwärts: Suche Produktname und aktuellen Preis
    for (let j = i + 1; j < Math.min(nuxtData.length, i + 30); j++) {
      const v = nuxtData[j];
      if (typeof v !== 'string') continue;

      // Produktname: Lesbar, startet mit Grossbuchstabe, keine URL/Technik-Strings
      if (!productName && v.length > 3 && v.length < 100
          && !v.startsWith('/') && !v.startsWith('http')
          && !v.includes('attribute') && !v.includes('{')
          && !v.includes('banner') && !v.includes('automatic')
          && v[0] === v[0].toUpperCase()
          && !/^[A-Z_]+$/.test(v)) {
        productName = v;
      }
    }

    // Rabatt-Labels suchen (z.B. "20%", "½ PREIS")
    for (let j = Math.max(0, i - 20); j < Math.min(nuxtData.length, i + 20); j++) {
      const v = nuxtData[j];
      if (typeof v === 'string') {
        const pctMatch = v.match(/(\d+)\s*%/);
        if (pctMatch) discountLabel = parseInt(pctMatch[1]);
        if (v.includes('½ PREIS') || v.includes('HALBPREIS')) discountLabel = 50;
      }
    }

    // Alle Preis-Kandidaten sammeln
    const priceCandidates = [];
    for (let j = Math.max(0, i - 8); j < Math.min(nuxtData.length, i + 40); j++) {
      const v = nuxtData[j];
      if (typeof v === 'string' && /^\d{1,3}\.\d{2}$/.test(v)) {
        const p = parseFloat(v);
        if (p > 0 && p < 500) {
          priceCandidates.push({ value: v, index: j, numVal: p });
        }
      }
    }

    const oldPrice = parseStattPrice(oldPriceStr);
    const oldPriceNum = oldPrice ? parseFloat(oldPrice) : null;

    // Strategie 1: Wenn Rabatt-Label UND alter Preis bekannt, erwarteten Preis berechnen
    if (discountLabel && oldPriceNum) {
      const expectedPrice = oldPriceNum * (1 - discountLabel / 100);
      let bestCandidate = null;
      let bestDiff = Infinity;
      for (const c of priceCandidates) {
        const diff = Math.abs(c.numVal - expectedPrice);
        if (diff < bestDiff && diff < 1.0) {
          bestDiff = diff;
          bestCandidate = c;
        }
      }
      if (bestCandidate) newPriceStr = bestCandidate.value;
    }

    // Strategie 2: Alter Preis bekannt, suche Preis der vernünftigen Rabatt ergibt (5-60%)
    if (!newPriceStr && oldPriceNum) {
      const validPrices = priceCandidates
        .filter(c => {
          const disc = Math.round((1 - c.numVal / oldPriceNum) * 100);
          return disc >= 5 && disc <= 60 && c.numVal < oldPriceNum;
        })
        .sort((a, b) => {
          const distA = oldPriceIndex >= 0 ? Math.abs(a.index - oldPriceIndex) : a.index;
          const distB = oldPriceIndex >= 0 ? Math.abs(b.index - oldPriceIndex) : b.index;
          return distA - distB;
        });
      if (validPrices.length > 0) {
        newPriceStr = validPrices[0].value;
      }
    }

    // Strategie 3: Fallback — nimm den Preis der am nächsten zur Produkt-URL liegt
    if (!newPriceStr && priceCandidates.length > 0) {
      const sorted = [...priceCandidates].sort((a, b) => Math.abs(a.index - i) - Math.abs(b.index - i));
      newPriceStr = sorted[0].value;
    }

    if (!productName) continue;
    // Filtere Banner/Werbung
    if (productName.toLowerCase().includes('banner') || productName.toLowerCase().includes('tela')) continue;

    const price = newPriceStr || null;
    let discount = discountLabel || 0;

    // Berechne Rabatt aus Preisen falls nicht explizit
    if (!discount && oldPrice && price) {
      discount = Math.round((1 - parseFloat(price) / parseFloat(oldPrice)) * 100);
    }
    if (discount < 0) discount = Math.abs(discount);

    // Validierung: Rabatt >65% ist bei Lebensmitteln fast immer ein Parsing-Fehler
    if (discount > 65) {
      if (discountLabel && discountLabel <= 65) {
        discount = discountLabel;
      } else {
        discount = 0;
      }
    }

    // Nur Deals mit Preis aufnehmen
    if (!price) continue;

    deals.push({
      product: productName,
      store: 'Denner',
      price,
      oldPrice: oldPrice || null,
      discount,
      validFrom: getWeekStart(),
      validUntil: getWeekEnd(),
      category: detectCategory(productName),
      url: productUrl,
    });
  }

  return deals;
}

async function scrapeDenner() {
  console.log('🔍 [Denner] Scraping Aktionen...');
  const allDeals = [];

  const pages = [
    { url: 'https://www.denner.ch/de/aktionen-und-sortiment/aktionen-aktuelle-woche', name: 'Aktuelle Woche' },
    { url: 'https://www.denner.ch/de/aktionen-und-sortiment/aktionen-ab-donnerstag', name: 'Ab Donnerstag' },
    { url: 'https://www.denner.ch/de/', name: 'Homepage' },
  ];

  for (const page of pages) {
    try {
      const deals = await scrapeDennerPage(page.url);
      const relevant = deals.filter(d => isRelevant(d.product));
      console.log(`  📄 ${page.name}: ${deals.length} Produkte, ${relevant.length} relevant`);
      allDeals.push(...relevant);
    } catch (e) {
      console.log(`  ⚠ ${page.name}: ${e.message}`);
    }
  }

  // Deduplizieren: selber Name → besten Deal (höchster Rabatt) behalten
  const seen = new Map();
  for (const deal of allDeals) {
    const key = deal.product.toLowerCase();
    if (!seen.has(key) || (deal.discount > (seen.get(key).discount || 0))) {
      seen.set(key, deal);
    }
  }

  const uniqueDeals = [...seen.values()];
  console.log(`  ✅ [Denner] ${uniqueDeals.length} einzigartige relevante Deals`);
  return uniqueDeals;
}


// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// MIGROS — via playwright-core + System-Chrome
// Intercepted die interne API-Response die der Browser macht
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

/**
 * Findet den Pfad zum installierten Chrome/Chromium
 * Funktioniert auf Windows, macOS, und Linux (GitHub Actions)
 */
function findChromePath() {
  // 1. Umgebungsvariable hat Priorität
  if (process.env.CHROME_PATH) return process.env.CHROME_PATH;

  const platform = process.platform;

  if (platform === 'linux') {
    // GitHub Actions: google-chrome-stable ist vorinstalliert
    const linuxPaths = [
      '/usr/bin/google-chrome-stable',
      '/usr/bin/google-chrome',
      '/usr/bin/chromium-browser',
      '/usr/bin/chromium',
    ];
    for (const p of linuxPaths) {
      if (existsSync(p)) return p;
    }
    // Fallback: which
    try {
      return execSync('which google-chrome-stable || which google-chrome || which chromium-browser || which chromium', { encoding: 'utf-8' }).trim();
    } catch { /* ignore */ }
  }

  if (platform === 'win32') {
    const winPaths = [
      join(process.env.PROGRAMFILES || '', 'Google', 'Chrome', 'Application', 'chrome.exe'),
      join(process.env['PROGRAMFILES(X86)'] || '', 'Google', 'Chrome', 'Application', 'chrome.exe'),
      join(process.env.LOCALAPPDATA || '', 'Google', 'Chrome', 'Application', 'chrome.exe'),
    ];
    for (const p of winPaths) {
      if (existsSync(p)) return p;
    }
  }

  if (platform === 'darwin') {
    const macPath = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
    if (existsSync(macPath)) return macPath;
  }

  return null;
}

async function scrapeMigros() {
  const deals = [];
  console.log('🔍 [Migros] Scraping via Playwright + System-Chrome...');

  // 1. Prüfe ob playwright-core verfügbar ist
  let chromium;
  try {
    const pw = await import('playwright-core');
    chromium = pw.chromium;
  } catch {
    console.log('  ⚠ [Migros] playwright-core nicht installiert. Skip.');
    return deals;
  }

  // 2. Finde Chrome auf dem System
  const chromePath = findChromePath();
  if (!chromePath) {
    console.log('  ⚠ [Migros] Kein Chrome/Chromium gefunden. Skip.');
    console.log('  ℹ️  Setze CHROME_PATH oder installiere Chrome.');
    return deals;
  }
  console.log(`  🌐 Chrome gefunden: ${chromePath}`);

  let browser = null;
  try {
    // 3. Browser starten (headless)
    browser = await chromium.launch({
      executablePath: chromePath,
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
    });

    const context = await browser.newContext({
      userAgent: UA,
      locale: 'de-CH',
    });
    const page = await context.newPage();

    // 4. API-Responses abfangen (Migros nutzt mehrere Endpunkte)
    const apiResponses = [];
    page.on('response', async (response) => {
      const url = response.url();
      if (url.includes('product-display/public') && response.status() === 200) {
        try {
          const json = await response.json();
          apiResponses.push({ url, data: json });
        } catch { /* nicht-JSON Response, ignorieren */ }
      }
    });

    // 5. Navigiere zur Angebotsseite
    console.log('  📄 Lade https://www.migros.ch/de/offers/home ...');
    await page.goto('https://www.migros.ch/de/offers/home', {
      waitUntil: 'networkidle',
      timeout: 45000,
    });

    // 6. Warte kurz für dynamische Inhalte
    await page.waitForTimeout(3000);

    // 7. Parse API-Daten falls abgefangen
    console.log(`  📡 ${apiResponses.length} API-Responses abgefangen`);

    for (const { url, data } of apiResponses) {
      // Versuche verschiedene Strukturen zu parsen
      const candidates = [];

      // Direkte Arrays
      if (Array.isArray(data)) candidates.push(...data);
      // products/items/results Felder
      if (data.products) candidates.push(...(Array.isArray(data.products) ? data.products : []));
      if (data.items) candidates.push(...(Array.isArray(data.items) ? data.items : []));
      if (data.results) candidates.push(...(Array.isArray(data.results) ? data.results : []));

      // Für product-cards: verschachtelte Strukturen
      if (data.productCards) candidates.push(...data.productCards);

      // Rekursiv suchen nach Arrays von Objekten mit name/price
      const deepSearch = (obj, depth = 0) => {
        if (depth > 5 || !obj) return;
        if (typeof obj !== 'object') return;
        if (Array.isArray(obj)) {
          for (const item of obj) {
            if (item && typeof item === 'object' && (item.name || item.title || item.productName)) {
              candidates.push(item);
            }
            deepSearch(item, depth + 1);
          }
        } else {
          for (const key of Object.keys(obj)) {
            deepSearch(obj[key], depth + 1);
          }
        }
      };
      deepSearch(data);

      if (candidates.length > 0) {
        console.log(`  → API ${url.split('/').slice(-2).join('/')}: ${candidates.length} Kandidaten`);
      }

      for (const p of candidates) {
        // Flexibles Name-Parsing
        const name = p.name || p.title || p.productName || p.description || p.label || '';
        if (!name || !isRelevant(name)) continue;

        let price = '', oldPrice = null, discount = 0;

        // ─── Migros v4/product-cards Format ───
        // offer.promotionPrice = Aktionspreis, offer.price = Originalpreis
        // Bevorzuge effectiveValue (Number) vor advertisedDisplayValue (kann "5.-" sein)
        if (p.offer) {
          // Aktionspreis (promotionPrice hat Vorrang)
          if (p.offer.promotionPrice) {
            const pp = p.offer.promotionPrice;
            price = pp.effectiveValue ? String(pp.effectiveValue) : (pp.advertisedDisplayValue || pp.effectiveDisplayValue || '');
          }
          // Originalpreis
          if (p.offer.price && typeof p.offer.price === 'object') {
            const op = p.offer.price;
            const origPrice = op.effectiveValue ? String(op.effectiveValue) : (op.advertisedDisplayValue || op.effectiveDisplayValue || '');
            // Wenn promotionPrice existiert und "statt"-Label da ist → das ist der alte Preis
            if (p.offer.promotionPrice && p.offer.priceInsteadOfLabel) {
              oldPrice = origPrice;
            } else if (!price) {
              price = origPrice; // Kein Aktionspreis → normaler Preis
            }
          }
          // Fallback: displayPrice direkt
          if (!price && typeof p.offer.price === 'number') {
            price = String(p.offer.price);
          }
        }
        // ─── Generische Formate ───
        if (!price && p.price) {
          if (typeof p.price === 'object') {
            price = String(p.price.effectiveValue || p.price.value || p.price.advertisedDisplayValue || '');
          } else {
            price = String(p.price);
          }
        }
        if (!price && p.currentPrice) price = String(p.currentPrice);
        if (!oldPrice && p.oldPrice) oldPrice = String(p.oldPrice);
        if (!discount && p.discountPercentage) discount = p.discountPercentage;

        // Preise normalisieren: "5.-" → "5.00", sicherstellen dass es Zahlen sind
        const cleanPrice = (s) => {
          if (!s) return null;
          s = String(s).replace('.-', '.00').replace('–', '.00').replace(',', '.');
          const num = parseFloat(s);
          return isNaN(num) || num <= 0 ? null : num.toFixed(2);
        };
        price = cleanPrice(price);
        oldPrice = cleanPrice(oldPrice);

        // Discount berechnen
        if (oldPrice && price && !discount) {
          const pNum = parseFloat(price);
          const oNum = parseFloat(oldPrice);
          if (pNum > 0 && oNum > pNum) {
            discount = Math.round((1 - pNum / oNum) * 100);
          }
        }

        if (!price) continue;
        // Nur echte Deals: muss einen Rabatt haben (price < oldPrice)
        if (oldPrice && price === oldPrice && discount === 0) continue;

        // Duplikate vermeiden
        const key = name.toLowerCase();
        if (deals.some(d => d.product.toLowerCase() === key)) continue;

        // Migros Produkt-URL konstruieren
        const migrosSlug = p.slug || p.migrosId || p.productId || p.id || '';
        const migrosUrl = migrosSlug 
          ? `https://www.migros.ch/de/product/${migrosSlug}`
          : (p.url ? `https://www.migros.ch${p.url.startsWith('/') ? '' : '/'}${p.url}` : null);

        deals.push({
          product: name,
          store: 'Migros',
          price,
          oldPrice,
          discount: Math.abs(discount),
          validFrom: p.validFrom || p.promotionStartDate || getWeekStart(),
          validUntil: p.validUntil || p.promotionEndDate || getWeekEnd(),
          category: detectCategory(name),
          url: migrosUrl || `https://www.migros.ch/de/search?q=${encodeURIComponent(name)}`,
        });
      }
    }

    // 8. Fallback: Daten direkt aus dem DOM extrahieren
    if (deals.length === 0) {
      console.log('  🔄 Keine API-Deals — versuche DOM-Extraktion...');

      const domDeals = await page.evaluate(() => {
        const items = [];

        // Migros Product Cards: finde alle Artikel-Links
        const links = document.querySelectorAll('a[href*="/product/"]');
        for (const link of links) {
          // Gehe zum übergeordneten Card-Element
          const card = link.closest('[class*="card"], [class*="Card"], article, li') || link;

          // Produkt-URL aus dem Link extrahieren
          const productUrl = link.href || '';

          // Name aus dem Link-Text oder Bild-Alt
          const img = card.querySelector('img');
          const nameFromImg = img?.alt || '';
          const nameFromText = card.querySelector('span, p, h3, h2')?.textContent?.trim() || '';
          const name = nameFromImg || nameFromText;

          // Preis: suche nach Elementen mit CHF oder Zahlen im Format X.XX
          const allText = card.innerText || '';
          const priceMatches = allText.match(/(\d{1,3}\.\d{2})/g);

          if (name && priceMatches && priceMatches.length > 0) {
            const prices = priceMatches.map(p => parseFloat(p)).filter(p => p > 0 && p < 500);
            prices.sort((a, b) => a - b); // Kleinster Preis = aktueller Preis

            items.push({
              name: name.trim(),
              price: prices[0]?.toFixed(2) || '',
              oldPrice: prices.length > 1 ? prices[prices.length - 1].toFixed(2) : '',
              url: productUrl,
            });
          }
        }

        return items;
      });

      console.log(`  → ${domDeals.length} Produkte via DOM`);

      for (const item of domDeals) {
        if (!isRelevant(item.name)) continue;

        const price = item.price || '';
        const oldPrice = item.oldPrice && item.oldPrice !== item.price ? item.oldPrice : null;

        let discount = 0;
        if (oldPrice && price) {
          discount = Math.round((1 - parseFloat(price) / parseFloat(oldPrice)) * 100);
        }

        if (!price) continue;

        deals.push({
          product: item.name,
          store: 'Migros',
          price,
          oldPrice,
          discount: Math.abs(discount),
          validFrom: getWeekStart(),
          validUntil: getWeekEnd(),
          category: detectCategory(item.name),
          url: item.url || `https://www.migros.ch/de/search?q=${encodeURIComponent(item.name)}`,
        });
      }
    }

    if (deals.length > 0) {
      console.log(`  ✅ [Migros] ${deals.length} relevante Deals!`);
    } else {
      console.log('  ⚠ [Migros] Keine relevanten Deals extrahiert.');
    }

  } catch (e) {
    console.log(`  ❌ [Migros] Playwright-Fehler: ${e.message}`);
  } finally {
    if (browser) {
      try { await browser.close(); } catch { /* ignore */ }
    }
  }

  console.log(`  📦 [Migros] Total: ${deals.length} Deals`);
  return deals;
}


// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// MAIN
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

async function main() {
  console.log('🛒 Chiggas Mealplan — Deal Scraper v2');
  console.log(`📅 ${new Date().toISOString()}`);
  console.log('─'.repeat(50));

  const dennerDeals = await scrapeDenner();
  console.log('─'.repeat(50));
  const migrosDeals = await scrapeMigros();
  console.log('─'.repeat(50));

  const allDeals = [...dennerDeals, ...migrosDeals];

  // Globale Deduplizierung
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
    deals: uniqueDeals,
  };

  mkdirSync(join(__dirname, '..', 'public'), { recursive: true });
  writeFileSync(OUTPUT, JSON.stringify(output, null, 2), 'utf-8');

  console.log(`✅ Fertig! ${uniqueDeals.length} Deals → public/deals.json`);

  if (uniqueDeals.length > 0) {
    console.log('\n🏷️  Top Deals:');
    for (const d of uniqueDeals.slice(0, 15)) {
      const disc = d.discount ? ` (-${d.discount}%)` : '';
      const old = d.oldPrice ? ` statt CHF ${d.oldPrice}` : '';
      console.log(`  ${d.store.padEnd(8)} | ${d.product.substring(0, 40).padEnd(40)} | CHF ${d.price}${old}${disc}`);
    }
  } else {
    console.log('\n⚠ Keine Deals gefunden.');
  }
}

main().catch(e => {
  console.error('❌ Scraper crashed:', e.message);
  mkdirSync(join(__dirname, '..', 'public'), { recursive: true });
  writeFileSync(OUTPUT, JSON.stringify({ lastUpdated: new Date().toISOString(), deals: [] }, null, 2), 'utf-8');
  process.exit(0);
});
