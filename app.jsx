import React, { useState, useEffect } from 'react';
import { 
  Zap, 
  Flame, 
  Target, 
  CheckCircle2, 
  Info, 
  Egg, 
  Users, 
  ShoppingCart, 
  CalendarDays, 
  UtensilsCrossed, 
  Coins, 
  IceCream,
  RefreshCw,
  Layers,
  Shield,
  Coffee,
  Dumbbell,
  Pill,
  Tag,
  X,
  Bell,
  Percent,
  ExternalLink,
  User
} from 'lucide-react';

// LocalStorage Helper: Einstellungen pro Browser/User persistent speichern
const STORAGE_KEY = 'chiggas-mealplan-settings';

const loadSettings = () => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) return JSON.parse(saved);
  } catch (e) { /* Falls localStorage nicht verfügbar */ }
  return null;
};

const saveSettings = (settings) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  } catch (e) { /* Ignorieren falls voll/blockiert */ }
};

const App = () => {
  const saved = loadSettings();
  const [servings, setServings] = useState(saved?.servings ?? 3);
  const [activeTab, setActiveTab] = useState(saved?.activeTab ?? 'mon'); 
  const [activePlan, setActivePlan] = useState(saved?.activePlan ?? 1);
  const [bulkingMode, setBulkingMode] = useState(saved?.bulkingMode ?? false);
  const [jamainMode, setJamainMode] = useState(saved?.jamainMode ?? false);
  const [breakfastMode, setBreakfastMode] = useState(saved?.breakfastMode ?? false);
  const [deals, setDeals] = useState([]);
  const [showDeals, setShowDeals] = useState(false);

  // Einstellungen bei Änderung speichern
  useEffect(() => {
    saveSettings({ servings, activeTab, activePlan, bulkingMode, jamainMode, breakfastMode });
  }, [servings, activeTab, activePlan, bulkingMode, jamainMode, breakfastMode]);

  // Deals von Migros/Denner laden
  useEffect(() => {
    const fetchDeals = async () => {
      try {
        const res = await fetch('./deals.json?' + Date.now());
        if (res.ok) {
          const data = await res.json();
          const today = new Date();
          // Nur aktuelle Deals zeigen (gültig heute oder in naher Zukunft)
          const activeDeals = (data.deals || []).filter(d => {
            const end = new Date(d.validUntil);
            const start = new Date(d.validFrom);
            if (today < start || today > end) return false;
            // Unrealistische Deals rausfiltern (Parsing-Fehler im Scraper)
            if (d.discount > 65) return false;
            if (d.oldPrice && d.price && parseFloat(d.price) >= parseFloat(d.oldPrice)) return false;
            return true;
          });
          if (activeDeals.length > 0) {
            setDeals(activeDeals);
            setShowDeals(true);
          }
        }
      } catch (e) {
        // Keine Deals verfügbar — kein Fehler anzeigen
      }
    };
    fetchDeals();
  }, []);

  const profileName = "Chiggas and White's";
  
  // Gemeinsame Protein-Quellen (Thunfisch hinzugefügt)
  const fishOptions = "Lachs, Weissfisch oder Thunfisch";

  // Die 3 Plan-Variationen
  const planData = {
    1: [ // ORIGINAL: Bowls & Recovery
      { id: 'mon', name: 'MO', fullName: 'Montag', lunch: 'The Big Bowl', lunchDesc: 'Wildreis, Rinderstreifen, Brokkoli, Linsen.', snack: '2 Kiwis & Handvoll Nüsse', dinner: 'Rührei mit viel Spinat.', type: 'meat' },
      { id: 'tue', name: 'DI', fullName: 'Dienstag', lunch: 'Omega-3 Fokus', lunchDesc: 'Süßkartoffel, Lachsfilet, Grünkohl.', snack: 'Blaubeeren & Handvoll Nüsse', dinner: 'Salat mit 3 Eiern & Edamame.', type: 'fish' },
      { id: 'wed', name: 'MI', fullName: 'Mittwoch', lunch: 'Hähnchen-Mitte', lunchDesc: 'Brauner Reis, Pouletbrust, Pak Choi, Linsen.', snack: '2 Kiwis & Handvoll Nüsse', dinner: 'Omelett mit Pilzen & Vollkornbrot.', type: 'poultry' },
      { id: 'thu', name: 'DO', fullName: 'Donnerstag', lunch: 'Schwein & Power', lunchDesc: 'Süsskartoffel-Wedges, Schweinsnierstücke, Grünkohl.', snack: 'Orangen & Handvoll Nüsse', dinner: 'Spiegeleier auf Erbsen/Spinat.', type: 'pork' },
      { id: 'fri', name: 'FR', fullName: 'Freitag', lunch: 'Fish Friday', lunchDesc: 'Wildreis, Weissfisch, Brokkoli, Pak Choi.', snack: 'Blaubeeren & Handvoll Nüsse', dinner: 'Rührei mit Räucherlachs.', type: 'fish' },
      { id: 'sat', name: 'SA', fullName: 'Samstag', lunch: 'Big Workout Bowl', lunchDesc: 'Reis/Süßkartoffel Mix, doppelt Poulet, Grünkohl.', snack: 'Orangen & Handvoll Nüsse', dinner: 'Gekochte Eier mit Rohkost.', type: 'poultry' },
      { id: 'sun', name: 'SO', fullName: 'Sonntag', lunch: 'Linsen-Bolo', lunchDesc: 'Süßkartoffel gefüllt mit Linsen-Bolo & Brokkoli.', snack: 'CHEAT SNACK', dinner: 'Resterwertung Omelett.', type: 'veggie', isCheat: true }
    ],
    2: [ // VARIANTE 2: Pfannengerichte & Salate
      { id: 'mon', name: 'MO', fullName: 'Montag', lunch: 'Schweine-Pfanne Asia', lunchDesc: 'Schweinsnierstücke scharf angebraten mit Pak Choi & Reis.', snack: 'Orangen & Handvoll Nüsse', dinner: 'Thunfisch-Salat mit 3 Eiern & Spinat.', type: 'pork' },
      { id: 'tue', name: 'DI', fullName: 'Dienstag', lunch: 'Süsskartoffel-Fisch-Pfanne', lunchDesc: 'Lachs & Weissfisch Würfel mit Süsskartoffeln & Brokkoli.', snack: '2 Kiwis & Handvoll Nüsse', dinner: 'Edamame-Salat mit Feta & Gurke.', type: 'fish' },
      { id: 'wed', name: 'MI', fullName: 'Mittwoch', lunch: 'Poulet-Erbsen Curry', lunchDesc: 'Pouletbrust in Erbsen-Kokos-Sauce (ohne Reis).', snack: 'Blaubeeren & Handvoll Nüsse', dinner: '3 Spiegeleier auf Vollkornbrot.', type: 'poultry' },
      { id: 'thu', name: 'DO', fullName: 'Donnerstag', lunch: 'Protein-Power Reis', lunchDesc: 'Rinderhack mit Wildreis, Spinat und viel Knoblauch.', snack: '2 Kiwis & Handvoll Nüsse', dinner: 'Thunfisch-Omelett mit Tomaten.', type: 'meat' },
      { id: 'fri', name: 'FR', fullName: 'Freitag', lunch: 'Zitronen-Fisch', lunchDesc: 'Weissfisch mit Wildreis und gedünstetem Pak Choi.', snack: 'Orangen & Handvoll Nüsse', dinner: 'Grosser grüner Salat mit Eiern.', type: 'fish' },
      { id: 'sat', name: 'SA', fullName: 'Samstag', lunch: 'Poulet-Süsskartoffel Mash', lunchDesc: 'Gestampfte Süsskartoffel mit Poulet & Grünkohl.', snack: 'Blaubeeren & Handvoll Nüsse', dinner: 'Hüttenkäse mit Nüssen.', type: 'poultry' },
      { id: 'sun', name: 'SO', fullName: 'Sonntag', lunch: 'Veggie Burger Style', lunchDesc: 'Linsen-Patties mit Süsskartoffel-Spalten & Brokkoli.', snack: 'CHEAT SNACK', dinner: 'Gemüse-Pfanne mit Eiern.', type: 'veggie', isCheat: true }
    ],
    3: [ // VARIANTE 3: Ofen-Gerichte & Einfachheit
      { id: 'mon', name: 'MO', fullName: 'Montag', lunch: 'Ofen-Rind & Gemüse', lunchDesc: 'Rinderstreifen mit Brokkoli & Süsskartoffeln vom Blech.', snack: 'Blaubeeren & Handvoll Nüsse', dinner: '3 Eier mit Linsen-Topping.', type: 'meat' },
      { id: 'tue', name: 'DI', fullName: 'Dienstag', lunch: 'Wildreis-Thunfisch Mix', lunchDesc: 'Reissalat mit Thunfisch, Edamame und frischem Pak Choi.', snack: 'Orangen & Handvoll Nüsse', dinner: 'Rührei mit Grünkohl.', type: 'fish' },
      { id: 'wed', name: 'MI', fullName: 'Mittwoch', lunch: 'Crispy Poulet', lunchDesc: 'Pouletbrust aus dem Ofen mit Reis und Brokkoli-Salat.', snack: '2 Kiwis & Handvoll Nüsse', dinner: 'Protein-Pancakes (Eier/Whey).', type: 'poultry' },
      { id: 'thu', name: 'DO', fullName: 'Donnerstag', lunch: 'Schweine-Eintopf', lunchDesc: 'Schweinsnierstücke mit Linsen, Tomaten und Grünkohl.', snack: 'Blaubeeren & Handvoll Nüsse', dinner: 'Thunfisch-Steak mit Spinat.', type: 'pork' },
      { id: 'fri', name: 'FR', fullName: 'Freitag', lunch: 'Fisch-Päckli', lunchDesc: 'Lachs in Folie mit Pak Choi & Reis gegart.', snack: '2 Kiwis & Handvoll Nüsse', dinner: 'Eiersalat mit Erbsen.', type: 'fish' },
      { id: 'sat', name: 'SA', fullName: 'Samstag', lunch: 'Fitness-Platte', lunchDesc: 'Poulet, Reis, Edamame & Brokkoli separat (Meal Prep Style).', snack: 'Orangen & Handvoll Nüsse', dinner: '3 gekochte Eier.', type: 'poultry' },
      { id: 'sun', name: 'SO', fullName: 'Sonntag', lunch: 'Süsskartoffel-Linsen Suppe', lunchDesc: 'Cremige Suppe mit Brokkoli-Röschen.', snack: 'CHEAT SNACK', dinner: 'Resten-Omelett.', type: 'veggie', isCheat: true }
    ]
  };

  // Jamain-Modus: Schweinefleisch durch Poulet ersetzen
  const effectivePlanData = (() => {
    if (!jamainMode) return planData;
    const modified = {};
    for (const [key, days] of Object.entries(planData)) {
      modified[key] = days.map(day => {
        if (day.type !== 'pork') return day;
        return {
          ...day,
          type: 'poultry',
          lunch: day.lunch
            .replace('Schweine-Pfanne Asia', 'Poulet-Pfanne Asia')
            .replace('Schwein & Power', 'Poulet & Power')
            .replace('Schweine-Eintopf', 'Poulet-Eintopf'),
          lunchDesc: day.lunchDesc
            .replace(/Schweinsnierstücke/g, 'Pouletbrust')
            .replace(/Schweinefleisch/g, 'Pouletbrust'),
        };
      });
    }
    return modified;
  })();

  const activeDays = effectivePlanData[activePlan];
  const currentDay = activeDays.find(d => d.id === activeTab) || activeDays[0];

  // Bulking Frühstück-Optionen pro Plan (~550 kcal)
  const bulkingBreakfasts = {
    1: {
      mon: { name: 'Banana PB Bites', desc: 'Banana-Scheiben mit Erdnussbutter, Haferflocken-Crunch & Honig.' },
      tue: { name: 'Mini Banana Muffins', desc: 'Haferflocken, Bananen, Eier, Milch, Zimt & Schoko-Chips. Prep: 12 Stück.' },
      wed: { name: 'Blueberry Joghurt Bites', desc: 'Joghurt-Blaubeer Bites mit dunkler Schokolade überzogen.' },
      thu: { name: 'Apfel Bites', desc: 'Geriebener Apfel, Haferflocken, Mandelmus, Zimt & Honig.' },
      fri: { name: 'Knäckebrot & Frischkäse', desc: 'Knäckebrot mit Kräuterfrischkäse & Gurke.' },
      sat: { name: 'Power-Oats', desc: 'Haferflocken mit Banane, Honig & Whey Protein.' },
      sun: { name: 'Big Breakfast', desc: 'Vollkornbrot, Eier, Avocado & Hüttenkäse.' }
    },
    2: {
      mon: { name: 'Avocado Toast', desc: 'Vollkornbrot mit Avocado, 3 Eiern & Tomaten.' },
      tue: { name: 'Banana PB Bites', desc: 'Banana-Scheiben mit Erdnussbutter, Haferflocken-Crunch & Honig.' },
      wed: { name: 'Protein Pancakes', desc: 'Pancakes aus Haferflocken, Eiern & Whey mit Beeren.' },
      thu: { name: 'Müsli Bowl', desc: 'Griechischer Joghurt, Haferflocken, Nüsse & Beeren.' },
      fri: { name: 'Rührei Deluxe', desc: '4 Eier mit Vollkornbrot, Käse & Spinat.' },
      sat: { name: 'Blueberry Joghurt Bites', desc: 'Joghurt-Blaubeer Bites mit dunkler Schokolade überzogen.' },
      sun: { name: 'Big Breakfast', desc: 'Vollkornbrot, Eier, Avocado & Hüttenkäse.' }
    },
    3: {
      mon: { name: 'Apfel Bites', desc: 'Geriebener Apfel, Haferflocken, Mandelmus, Zimt & Honig.' },
      tue: { name: 'Knäckebrot & Frischkäse', desc: 'Knäckebrot mit Kräuterfrischkäse & Gurke.' },
      wed: { name: 'Mini Banana Muffins', desc: 'Haferflocken, Bananen, Eier, Milch, Zimt & Schoko-Chips.' },
      thu: { name: 'Shake & Oats', desc: 'Overnight Oats mit Whey, Erdnussmus & Banane.' },
      fri: { name: 'Banana PB Bites', desc: 'Banana-Scheiben mit Erdnussbutter, Haferflocken-Crunch & Honig.' },
      sat: { name: 'Blueberry Joghurt Bites', desc: 'Joghurt-Blaubeer Bites mit dunkler Schokolade überzogen.' },
      sun: { name: 'Big Breakfast', desc: 'Vollkornbrot, Eier, Avocado & Hüttenkäse.' }
    }
  };

  // Einkaufslisten (Mittag + Abendessen komplett)
  const shoppingWeekly = [
    // Proteine (Mittag)
    { item: 'Rinderstreifen / Hack', qty: 0.8, unit: 'kg', price: '15.90', store: 'Denner' },
    { item: 'Schweinsnierstücke', qty: 0.8, unit: 'kg', price: '11.90', store: 'Denner' },
    { item: 'Pouletbrust (Gross-Pack)', qty: 1.5, unit: 'kg', price: '17.90', store: 'Migros' },
    { item: 'Lachs / Weissfisch', qty: 1.2, unit: 'kg', price: '22.50', store: 'Migros' },
    // Proteine (Abend)
    { item: 'Eier (Freiland, 30er)', qty: 2, unit: 'Pack', price: '17.00', store: 'Migros' },
    { item: 'Räucherlachs (100g)', qty: 2, unit: 'Pack', price: '7.90', store: 'Denner' },
    { item: 'Hüttenkäse (250g)', qty: 3, unit: 'Becher', price: '5.85', store: 'Migros' },
    { item: 'Feta (200g)', qty: 1, unit: 'Pack', price: '2.95', store: 'Denner' },
    // Gemüse & Carbs
    { item: 'Süsskartoffeln', qty: 5, unit: 'kg', price: '14.90', store: 'Migros' },
    { item: 'Grünkohl / Spinat', qty: 3, unit: 'kg', price: '11.90', store: 'Migros' },
    { item: 'Brokkoli / Pak Choi', qty: 2.5, unit: 'kg', price: '11.50', store: 'Denner' },
    { item: 'Champignons', qty: 0.5, unit: 'kg', price: '3.90', store: 'Migros' },
    { item: 'Salat-Gemüse (Gurke, Tomaten, Salat)', qty: 2, unit: 'kg', price: '7.50', store: 'Denner' },
    { item: 'Avocados', qty: 4, unit: 'Stk', price: '5.40', store: 'Migros' },
    { item: 'Vollkornbrot', qty: 1, unit: 'Pack', price: '2.90', store: 'Migros' },
    // Snacks & Früchte
    { item: 'Kiwis (frisch)', qty: 1.5, unit: 'kg', price: '6.50', store: 'Migros' },
    { item: 'Blaubeeren (frisch/TK)', qty: 0.6, unit: 'kg', price: '5.90', store: 'Migros' },
    { item: 'Orangen', qty: 1.5, unit: 'kg', price: '4.50', store: 'Denner' }
  ];

  const shoppingMonthly = [
    { item: 'Reis (M-Budget, 5kg)', qty: 2, unit: 'Sack', price: '11.80', store: 'Migros' },
    { item: 'Linsen (Trocken, 1kg)', qty: 2, unit: 'Pack', price: '4.80', store: 'Migros' },
    { item: 'Edamame (TK, 500g)', qty: 3, unit: 'Pack', price: '8.85', store: 'Migros' },
    { item: 'Erbsen (TK, 1kg)', qty: 2, unit: 'Pack', price: '4.60', store: 'Denner' },
    { item: 'Thunfisch Konserven (Mittag + Abend)', qty: 12, unit: 'Dosen', price: '19.80', store: 'Denner' },
    { item: 'Whey Protein (2.5kg)', qty: 1, unit: 'Kübel', price: '74.90', store: 'Online' },
    { item: 'Kreatin (500g)', qty: 1, unit: 'Dose', price: '24.90', store: 'Online' },
    { item: 'Nüsse / Kerne Mix', qty: 2, unit: 'kg', price: '17.80', store: 'Denner' },
    { item: 'Olivenöl Extra Virgin (1L)', qty: 2, unit: 'Fl.', price: '15.80', store: 'Migros' },
    { item: 'Erdnussmus (350g)', qty: 2, unit: 'Glas', price: '7.80', store: 'Denner' }
  ];

  // Frühstück-Einkaufslisten (nur wenn Frühstück-Toggle aktiv)
  const breakfastShoppingWeekly = [
    { item: 'Bananen', qty: 2, unit: 'kg', price: '3.50', store: 'Denner', isBreakfast: true },
    { item: 'Griechischer Joghurt (500g)', qty: 3, unit: 'Becher', price: '5.85', store: 'Migros', isBreakfast: true },
    { item: 'Äpfel', qty: 1, unit: 'kg', price: '3.50', store: 'Migros', isBreakfast: true },
    { item: 'Frischkäse Kräuter (200g)', qty: 1, unit: 'Pack', price: '2.50', store: 'Denner', isBreakfast: true },
    { item: 'Milch (1L)', qty: 2, unit: 'Pack', price: '3.30', store: 'Denner', isBreakfast: true },
    { item: 'Blaubeeren Frühstück (TK, 300g)', qty: 2, unit: 'Pack', price: '5.90', store: 'Migros', isBreakfast: true },
  ];

  const breakfastShoppingMonthly = [
    { item: 'Haferflocken (Grosspack, 1kg)', qty: 2, unit: 'Pack', price: '3.90', store: 'Migros', isBreakfast: true },
    { item: 'Honig (500g)', qty: 1, unit: 'Glas', price: '5.90', store: 'Denner', isBreakfast: true },
    { item: 'Dunkle Schokolade / Schoko-Chips', qty: 1, unit: 'Pack', price: '3.50', store: 'Denner', isBreakfast: true },
    { item: 'Knäckebrot', qty: 2, unit: 'Pack', price: '3.80', store: 'Denner', isBreakfast: true },
    { item: 'Mandelmus (250g)', qty: 1, unit: 'Glas', price: '5.90', store: 'Migros', isBreakfast: true },
    { item: 'Zimt (gemahlen)', qty: 1, unit: 'Dose', price: '2.90', store: 'Migros', isBreakfast: true },
  ];

  // Bulking-Faktor: 1.7x grössere Portionen → ~3000 kcal ohne Frühstück, ~3550 mit Frühstück
  const bulkFactor = bulkingMode ? 1.7 : 1;

  // Jamain-Modus: Schwein aus Einkaufsliste entfernen, Poulet-Menge erhöhen
  // Frühstück-Modus: Frühstücks-Items zur Liste hinzufügen
  const effectiveShoppingWeekly = (() => {
    let list = [...shoppingWeekly];
    if (jamainMode) {
      const porkItem = list.find(i => i.item.toLowerCase().includes('schwein'));
      list = list.filter(i => !i.item.toLowerCase().includes('schwein'));
      if (porkItem) {
        list = list.map(i => {
          if (i.item.includes('Pouletbrust')) {
            const newQty = i.qty + porkItem.qty;
            const pricePerUnit = parseFloat(i.price) / i.qty;
            return { ...i, qty: newQty, price: (pricePerUnit * newQty).toFixed(2) };
          }
          return i;
        });
      }
    }
    if (breakfastMode) {
      list = [...list, ...breakfastShoppingWeekly];
    }
    return list;
  })();

  const effectiveShoppingMonthly = (() => {
    let list = [...shoppingMonthly];
    if (breakfastMode) {
      list = [...list, ...breakfastShoppingMonthly];
    }
    return list;
  })();

  // Helper für Zutaten (Simuliert gleiche Basis für alle Pläne)
  const getIngredients = (day) => {
    const m = bulkFactor;
    const lunchLower = day.lunchDesc.toLowerCase();
    const hasReis = lunchLower.includes('reis') && !lunchLower.includes('ohne reis');
    const hasKartoffel = lunchLower.includes('kartoffel');

    let carbItem;
    if (hasReis && hasKartoffel) {
      carbItem = { item: 'Reis (trocken) + Süsskartoffel (roh)', qty: Math.round(170 * m), unit: 'g' };
    } else if (hasReis) {
      carbItem = { item: 'Reis (trocken)', qty: Math.round(120 * m), unit: 'g' };
    } else if (hasKartoffel) {
      carbItem = { item: 'Süsskartoffel (roh)', qty: Math.round(300 * m), unit: 'g' };
    } else {
      carbItem = { item: 'Carbs (Reis trocken / Süsskartoffel roh)', qty: Math.round(200 * m), unit: 'g' };
    }

    const base = [
      { item: 'Protein (Rind/Huhn/Fisch)', qty: Math.round(200 * m), unit: 'g' },
      carbItem,
      { item: 'Gemüse (Brokkoli/Spinat)', qty: Math.round(300 * m), unit: 'g' },
      { item: 'Linsen (Trocken)', qty: Math.round(60 * m), unit: 'g' }
    ];
    if (day.type === 'fish') base[0].item = fishOptions;
    if (day.type === 'poultry') base[0].item = 'Pouletbrust';
    if (day.type === 'meat') base[0].item = 'Rinderstreifen/Hack';
    if (day.type === 'pork') base[0].item = 'Schweinsnierstücke';
    // Hülsenfrucht dynamisch erkennen
    const mealText = (day.lunchDesc + ' ' + day.dinner).toLowerCase();
    if (mealText.includes('edamame')) { base[3].item = 'Edamame (TK)'; base[3].qty = Math.round(80 * m); }
    else if (mealText.includes('erbsen')) { base[3].item = 'Erbsen (TK)'; base[3].qty = Math.round(100 * m); }
    return base;
  };

  // Dynamische Vitamin-Abdeckung basierend auf Tagesmahlzeiten
  const getVitaminCoverage = (day) => {
    const v = {};

    // Protein-Quelle
    if (day.type === 'meat') { v['B12'] = 130; v['Zink'] = 65; v['B6'] = 55; v['Eisen'] = 45; v['B3 (Niacin)'] = 60; }
    else if (day.type === 'pork') { v['B1'] = 120; v['B6'] = 65; v['B12'] = 55; v['Zink'] = 50; v['Selen'] = 70; v['B3 (Niacin)'] = 75; v['Phosphor'] = (v['Phosphor']||0)+45; }
    else if (day.type === 'fish') { v['B12'] = 120; v['D3'] = 85; v['Selen'] = 90; v['Omega-3'] = 100; v['B6'] = 45; }
    else if (day.type === 'poultry') { v['B6'] = 70; v['B3 (Niacin)'] = 85; v['Selen'] = 75; v['B12'] = 40; }
    else if (day.type === 'veggie') { v['Eisen'] = 50; v['Folsäure'] = 80; v['B1'] = 55; v['Mangan'] = 70; }

    const text = (day.lunchDesc + ' ' + day.dinner + ' ' + day.snack).toLowerCase();

    // Gemüse & Beilagen
    if (text.includes('brokkoli')) { v['Vitamin C'] = (v['Vitamin C']||0)+70; v['Vitamin K'] = (v['Vitamin K']||0)+85; v['Folsäure'] = (v['Folsäure']||0)+30; }
    if (text.includes('spinat')) { v['Vitamin K'] = (v['Vitamin K']||0)+120; v['Vitamin A'] = (v['Vitamin A']||0)+55; v['Folsäure'] = (v['Folsäure']||0)+40; v['Magnesium'] = (v['Magnesium']||0)+35; }
    if (text.includes('grünkohl')) { v['Vitamin K'] = (v['Vitamin K']||0)+130; v['Vitamin C'] = (v['Vitamin C']||0)+60; v['Vitamin A'] = (v['Vitamin A']||0)+50; }
    if (text.includes('pak choi')) { v['Vitamin C'] = (v['Vitamin C']||0)+40; v['Vitamin K'] = (v['Vitamin K']||0)+45; v['Calcium'] = (v['Calcium']||0)+20; }
    if (text.includes('süsskartoffel') || text.includes('süßkartoffel')) { v['Vitamin A'] = (v['Vitamin A']||0)+120; v['Vitamin C'] = (v['Vitamin C']||0)+25; v['B6'] = (v['B6']||0)+20; }
    if (text.includes('linsen')) { v['Eisen'] = (v['Eisen']||0)+35; v['Folsäure'] = (v['Folsäure']||0)+45; v['B1'] = (v['B1']||0)+25; }
    if (text.includes('edamame')) { v['Vitamin K'] = (v['Vitamin K']||0)+40; v['Folsäure'] = (v['Folsäure']||0)+60; v['Eisen'] = (v['Eisen']||0)+25; v['Vitamin C'] = (v['Vitamin C']||0)+15; v['Mangan'] = (v['Mangan']||0)+35; }
    if (text.includes('erbsen')) { v['Vitamin C'] = (v['Vitamin C']||0)+30; v['Vitamin K'] = (v['Vitamin K']||0)+30; v['B1'] = (v['B1']||0)+35; v['Folsäure'] = (v['Folsäure']||0)+35; v['Mangan'] = (v['Mangan']||0)+25; }
    if (text.includes('tomaten')) { v['Vitamin C'] = (v['Vitamin C']||0)+20; v['Vitamin A'] = (v['Vitamin A']||0)+15; }

    // Eier (Abendessen)
    const hasEggs = text.includes('eier') || text.includes('omelett') || text.includes('rührei') || text.includes('spiegel');
    if (hasEggs) { v['B12'] = (v['B12']||0)+25; v['D3'] = (v['D3']||0)+15; v['Selen'] = (v['Selen']||0)+30; v['Vitamin A'] = (v['Vitamin A']||0)+15; }

    // Snack-Beiträge
    if (text.includes('kiwi')) v['Vitamin C'] = (v['Vitamin C']||0)+130;
    if (text.includes('beeren')) v['Vitamin C'] = (v['Vitamin C']||0)+35;
    if (text.includes('nüss') || text.includes('nuss') || text.includes('cashews') || text.includes('mandeln')) { v['Vitamin E'] = (v['Vitamin E']||0)+35; v['Magnesium'] = (v['Magnesium']||0)+25; }
    if (text.includes('banane')) { v['B6'] = (v['B6']||0)+25; v['Kalium'] = (v['Kalium']||0)+20; }
    if (text.includes('schoggi')) { v['Magnesium'] = (v['Magnesium']||0)+20; v['Eisen'] = (v['Eisen']||0)+15; }
    if (text.includes('milch')) { v['Calcium'] = (v['Calcium']||0)+30; v['B2'] = (v['B2']||0)+20; }
    if (text.includes('joghurt')) { v['Calcium'] = (v['Calcium']||0)+25; v['B2'] = (v['B2']||0)+15; }

    // Daily Post-Workout Shake (30g Whey Protein)
    v['Calcium'] = (v['Calcium']||0)+30;
    v['B2'] = (v['B2']||0)+35;
    v['B6'] = (v['B6']||0)+20;
    v['B1'] = (v['B1']||0)+15;
    v['B12'] = (v['B12']||0)+15;
    v['Magnesium'] = (v['Magnesium']||0)+15;
    v['Phosphor'] = (v['Phosphor']||0)+20;

    return Object.entries(v)
      .map(([name, percent]) => ({ name, percent: Math.min(percent, 150) }))
      .sort((a, b) => b.percent - a.percent);
  };

  // Bulking Dinner Enhancement
  const getBulkDinner = (day) => {
    const extras = {
      meat: ' Dazu: Extra Reis & Avocado.',
      pork: ' Dazu: Reis, Brokkoli & Erdnussmus.',
      fish: ' Dazu: Süsskartoffel & Olivenöl.',
      poultry: ' Dazu: Vollkornbrot & Erdnussmus.',
      veggie: ' Dazu: Reis & Hüttenkäse.'
    };
    return day.dinner.replace(/\.$/, '') + (extras[day.type] || '') ;
  };

  // Abendessen-Zutaten (dynamisch aus Beschreibung)
  const getDinnerIngredients = (day) => {
    const text = (bulkingMode ? getBulkDinner(day) : day.dinner).toLowerCase();
    const m = bulkFactor;
    const ingredients = [];

    // Eier-basierte Gerichte
    if (text.includes('eier') || text.includes('omelett') || text.includes('rührei') || text.includes('spiegel')) {
      const count = text.includes('4 eier') ? 4 : 3;
      ingredients.push({ item: 'Eier', qty: Math.round(count * m), unit: 'Stk' });
    }

    // Protein-Quellen
    if (text.includes('räucherlachs')) ingredients.push({ item: 'Räucherlachs', qty: Math.round(80 * m), unit: 'g' });
    if (text.includes('thunfisch')) ingredients.push({ item: 'Thunfisch (Dose)', qty: Math.round(150 * m), unit: 'g' });
    if (text.includes('hüttenkäse')) ingredients.push({ item: 'Hüttenkäse', qty: Math.round(200 * m), unit: 'g' });
    if (text.includes('feta')) ingredients.push({ item: 'Feta', qty: Math.round(60 * m), unit: 'g' });

    // Gemüse
    if (text.includes('spinat')) ingredients.push({ item: 'Spinat', qty: Math.round(150 * m), unit: 'g' });
    if (text.includes('grünkohl')) ingredients.push({ item: 'Grünkohl', qty: Math.round(100 * m), unit: 'g' });
    if (text.includes('edamame')) ingredients.push({ item: 'Edamame (TK)', qty: Math.round(80 * m), unit: 'g' });
    if (text.includes('erbsen')) ingredients.push({ item: 'Erbsen (TK)', qty: Math.round(100 * m), unit: 'g' });
    if (text.includes('pilz')) ingredients.push({ item: 'Champignons', qty: Math.round(100 * m), unit: 'g' });
    if (text.includes('tomaten')) ingredients.push({ item: 'Tomaten', qty: Math.round(100 * m), unit: 'g' });
    if (text.includes('gurke')) ingredients.push({ item: 'Gurke', qty: Math.round(100 * m), unit: 'g' });
    if (text.includes('linsen')) ingredients.push({ item: 'Linsen (gekocht)', qty: Math.round(80 * m), unit: 'g' });
    if (text.includes('rohkost')) ingredients.push({ item: 'Rohkost-Mix', qty: Math.round(200 * m), unit: 'g' });
    if (text.includes('salat') && !text.includes('eiersalat')) ingredients.push({ item: 'Blattsalat', qty: Math.round(100 * m), unit: 'g' });
    if (text.includes('gemüse') && !ingredients.some(i => i.item.includes('Rohkost'))) ingredients.push({ item: 'Gemüse-Mix', qty: Math.round(200 * m), unit: 'g' });
    if (text.includes('brokkoli') && !ingredients.some(i => i.item.includes('Brokkoli'))) ingredients.push({ item: 'Brokkoli', qty: Math.round(100 * m), unit: 'g' });

    // Carbs
    if (text.includes('vollkornbrot')) ingredients.push({ item: 'Vollkornbrot', qty: Math.round(200 * m), unit: 'g', note: 'KEIN TOAST' });
    if (text.includes('reis') && !text.includes('eiersalat')) ingredients.push({ item: 'Reis (trocken)', qty: Math.round(60 * m), unit: 'g' });
    if (text.includes('süsskartoffel')) ingredients.push({ item: 'Süsskartoffel', qty: Math.round(150 * m), unit: 'g' });
    if (text.includes('pancake')) {
      ingredients.push({ item: 'Haferflocken', qty: Math.round(40 * m), unit: 'g' });
      ingredients.push({ item: 'Whey Protein', qty: Math.round(30 * m), unit: 'g' });
    }

    // Fette & Extras
    if (text.includes('nüss') || text.includes('nüssen')) ingredients.push({ item: 'Nüsse', qty: Math.round(30 * m), unit: 'g' });
    if (text.includes('avocado')) ingredients.push({ item: 'Avocado', qty: 0.5, unit: 'Stk' });
    if (text.includes('erdnussmus')) ingredients.push({ item: 'Erdnussmus', qty: Math.round(20 * m), unit: 'g' });
    if (text.includes('käse') && !text.includes('hüttenkäse') && !text.includes('frischkäse')) ingredients.push({ item: 'Käse', qty: Math.round(30 * m), unit: 'g' });

    // Olivenöl für gebratene Gerichte
    if (text.includes('rührei') || text.includes('spiegel') || text.includes('omelett') || text.includes('pfanne')) {
      ingredients.push({ item: 'Olivenöl', qty: Math.round(10 * m), unit: 'ml' });
    }

    // Fallback
    if (ingredients.length === 0) {
      ingredients.push({ item: 'Eier', qty: Math.round(3 * m), unit: 'Stk' });
      ingredients.push({ item: 'Gemüse-Reste', qty: Math.round(150 * m), unit: 'g' });
    }

    return ingredients;
  };

  // Deal-Matching: Findet passende Aktionen für Einkaufslisteneinträge
  const ITEM_KEYWORDS = {
    'Rinderstreifen / Hack': ['rind', 'hack', 'entrecote', 'rindsbraten', 'burger', 'rindsburger', 'angus', 'voressen'],
    'Schweinsnierstücke': ['schwein', 'nierstück', 'kotlett', 'schnitzel', 'bratwurst', 'schweinefleisch'],
    'Pouletbrust (Gross-Pack)': ['poulet', 'hähnchen', 'chicken', 'pouletbrust', 'pouletschnitzel', 'geschnetzelt', 'truten', 'crispy'],
    'Lachs / Weissfisch': ['lachs', 'fisch', 'pangasius', 'kabeljau', 'lachsrücken', 'weissfisch'],
    'Eier (Freiland, 30er)': ['eier'],
    'Räucherlachs (100g)': ['räucherlachs', 'lachs'],
    'Hüttenkäse (250g)': ['hüttenkäse', 'cottage', 'frischkäse'],
    'Feta (200g)': ['feta', 'käse'],
    'Süsskartoffeln': ['süsskartoffel', 'kartoffel'],
    'Grünkohl / Spinat': ['grünkohl', 'spinat'],
    'Brokkoli / Pak Choi': ['broccoli', 'brokkoli', 'pak choi'],
    'Champignons': ['champignon', 'pilz'],
    'Salat-Gemüse (Gurke, Tomaten, Salat)': ['tomaten', 'gurke', 'salat', 'cherry'],
    'Avocados': ['avocado'],
    'Vollkornbrot': ['brot', 'vollkorn'],
    'Kiwis (frisch)': ['kiwi'],
    'Blaubeeren (frisch/TK)': ['blaubeer', 'heidelbeer'],
    'Orangen': ['orange', 'orangen', 'clementine'],
    'Reis (M-Budget, 5kg)': ['reis', 'jasmin'],
    'Linsen (Trocken, 1kg)': ['linsen'],
    'Edamame (TK, 500g)': ['edamame'],
    'Erbsen (TK, 1kg)': ['erbsen'],
    'Thunfisch Konserven (Mittag + Abend)': ['thunfisch', 'thun'],
    'Whey Protein (2.5kg)': ['whey', 'protein'],
    'Nüsse / Kerne Mix': ['nüsse', 'nuss', 'mandel', 'cashew', 'walnuss'],
    'Olivenöl Extra Virgin (1L)': ['olivenöl', 'öl'],
    'Erdnussmus (350g)': ['erdnuss', 'erdnussmus'],
    'Milch': ['milch', 'vollmilch', 'halbrahm', 'rahm'],
    'Bananen': ['banane', 'banana'],
    'Griechischer Joghurt (500g)': ['joghurt', 'griechisch', 'yoghurt'],
    'Äpfel': ['apfel', 'äpfel'],
    'Frischkäse Kräuter (200g)': ['frischkäse', 'philadelphia'],
    'Milch (1L)': ['milch', 'vollmilch'],
    'Blaubeeren (TK, 300g)': ['blaubeer', 'heidelbeer'],
    'Haferflocken (Grosspack, 1kg)': ['haferflock', 'hafer', 'porridge'],
    'Honig (500g)': ['honig'],
    'Knäckebrot': ['knäcke', 'knäckebrot'],
    'Mandelmus (250g)': ['mandelmus', 'mandel'],
  };

  const getMatchingDeals = (itemName) => {
    if (deals.length === 0) return [];
    const keywords = ITEM_KEYWORDS[itemName] || [];
    if (keywords.length === 0) {
      // Fallback: Versuche direktes Keyword-Matching aus dem Item-Namen
      const itemLower = itemName.toLowerCase();
      return deals.filter(d => {
        const dealLower = d.product.toLowerCase();
        return itemLower.split(/[\s\/,()]+/).some(w => w.length > 3 && dealLower.includes(w));
      }).filter(d => d.discount >= 15).slice(0, 2);
    }
    return deals
      .filter(d => {
        const dealLower = d.product.toLowerCase();
        return keywords.some(kw => dealLower.includes(kw));
      })
      .filter(d => d.discount >= 10) // Nur Deals ab 10% anzeigen
      .sort((a, b) => b.discount - a.discount)
      .slice(0, 2); // Max 2 Deals pro Item
  };

  // Supplement-Empfehlungen basierend auf Vitaminwerten
  const getSupplementRecs = (vitamins) => {
    const vMap = {};
    vitamins.forEach(vi => vMap[vi.name] = vi.percent);
    const recs = [];
    if ((vMap['D3']||0) < 80) recs.push({ name: 'Vitamin D3', dose: '2000–4000 IU / Tag', reason: 'Knochen, Immunsystem & Hormonhaushalt', priority: 'high' });
    if ((vMap['Omega-3']||0) < 80) recs.push({ name: 'Omega-3 (Fischöl)', dose: '1000–2000mg EPA/DHA', reason: 'Entzündungshemmend & Herzgesundheit', priority: 'high' });
    if ((vMap['Magnesium']||0) < 60) recs.push({ name: 'Magnesium', dose: '200–400mg / Tag', reason: 'Muskelregeneration & Schlafqualität', priority: 'medium' });
    if ((vMap['Zink']||0) < 60) recs.push({ name: 'Zink', dose: '15–30mg / Tag', reason: 'Immunsystem & Testosteron', priority: 'medium' });
    if ((vMap['Vitamin C']||0) < 80) recs.push({ name: 'Vitamin C', dose: '500–1000mg / Tag', reason: 'Immunsystem & Antioxidans', priority: 'low' });
    if ((vMap['Eisen']||0) < 50) recs.push({ name: 'Eisen', dose: '14mg / Tag', reason: 'Sauerstofftransport & Energie', priority: 'medium' });
    if ((vMap['Calcium']||0) < 60) recs.push({ name: 'Calcium', dose: '500–1000mg / Tag', reason: 'Knochen & Muskelfunktion', priority: 'low' });
    if ((vMap['Vitamin E']||0) < 50) recs.push({ name: 'Vitamin E', dose: '15mg / Tag', reason: 'Zellschutz & Antioxidans', priority: 'low' });
    return recs;
  };

  // Makronährstoffe berechnen (Protein, Carbs, Fett in Gramm pro Person)
  const getMacros = (day) => {
    const m = bulkFactor;
    let protein = 0, carbs = 0, fat = 0;

    // Mittagessen — Protein-Quelle (200g Rohgewicht Basis)
    if (day.type === 'meat') { protein += 52 * m; fat += 16 * m; }
    else if (day.type === 'fish') { protein += 44 * m; fat += 16 * m; }
    else if (day.type === 'poultry') { protein += 46 * m; fat += 6 * m; }
    else if (day.type === 'pork') { protein += 42 * m; fat += 20 * m; }
    else if (day.type === 'veggie') { protein += 18 * m; fat += 3 * m; carbs += 25 * m; }

    // Mittagessen — Carbs (Reis trocken / Süsskartoffel roh)
    const lunchLower = day.lunchDesc.toLowerCase();
    const hasLunchReis = lunchLower.includes('reis') && !lunchLower.includes('ohne reis');
    const hasLunchKartoffel = lunchLower.includes('kartoffel');
    if (hasLunchReis && hasLunchKartoffel) { carbs += 72 * m; protein += 6 * m; }
    else if (hasLunchReis) { carbs += 93 * m; protein += 9 * m; fat += 1 * m; }
    else if (hasLunchKartoffel) { carbs += 63 * m; protein += 2 * m; }
    else { carbs += 72 * m; protein += 5 * m; }
    // Mittagessen — Gemüse (300g)
    carbs += 12 * m; protein += 5 * m;
    // Mittagessen — Hülsenfrüchte (60g trocken)
    protein += 15 * m; carbs += 36 * m; fat += 1 * m;
    // Olivenöl zum Kochen
    fat += 10 * m;

    // Abendessen — Eier + Beilagen
    const dinnerText = (bulkingMode ? getBulkDinner(day) : day.dinner).toLowerCase();
    const eggCount = dinnerText.includes('4 eier') ? 4 : 3;
    protein += eggCount * 6.3 * m; fat += eggCount * 4.8 * m; carbs += 1 * m;

    if (dinnerText.includes('spinat') || dinnerText.includes('grünkohl')) { protein += 3 * m; carbs += 4 * m; }
    if (dinnerText.includes('vollkornbrot')) { carbs += 48 * m; protein += 8 * m; fat += 2 * m; }
    if (dinnerText.includes('reis') && !dinnerText.includes('eiersalat')) { carbs += 47 * m; protein += 4 * m; }
    if (dinnerText.includes('süsskartoffel')) { carbs += 28 * m; }
    if (dinnerText.includes('edamame')) { protein += 8 * m; carbs += 5 * m; fat += 4 * m; }
    if (dinnerText.includes('erbsen')) { protein += 5 * m; carbs += 10 * m; }
    if (dinnerText.includes('hüttenkäse')) { protein += 14 * m; fat += 5 * m; carbs += 3 * m; }
    if (dinnerText.includes('räucherlachs')) { protein += 15 * m; fat += 8 * m; }
    if (dinnerText.includes('thunfisch')) { protein += 20 * m; fat += 3 * m; }
    if (dinnerText.includes('feta')) { protein += 7 * m; fat += 10 * m; }
    if (dinnerText.includes('avocado')) { fat += 15 * m; protein += 2 * m; carbs += 5 * m; }
    if (dinnerText.includes('erdnussmus')) { fat += 8 * m; protein += 4 * m; carbs += 3 * m; }
    if (dinnerText.includes('nüsse') || dinnerText.includes('nüssen')) { fat += 12 * m; protein += 4 * m; carbs += 3 * m; }
    if (dinnerText.includes('olivenöl')) { fat += 10 * m; }
    if (dinnerText.includes('linsen')) { protein += 9 * m; carbs += 20 * m; }
    if (dinnerText.includes('pancake')) { protein += 10 * m; carbs += 15 * m; fat += 3 * m; }

    // Snack (Obst + Nüsse) — mit Bulking-Faktor skaliert
    const snackText = day.snack.toLowerCase();
    if (snackText.includes('kiwi')) { carbs += 22 * m; }
    else if (snackText.includes('blaubeeren')) { carbs += 18 * m; }
    else if (snackText.includes('orangen')) { carbs += 20 * m; }
    else { carbs += 20 * m; }
    protein += 5 * m; fat += 14 * m; carbs += 4 * m;

    // Post-Workout Shake (Whey Protein) — mit Bulking-Faktor skaliert
    protein += 25 * m; carbs += 2 * m; fat += 1 * m;

    // Frühstück (~550 kcal)
    if (breakfastMode) {
      protein += 18; carbs += 68; fat += 20;
    }

    return {
      protein: Math.round(protein),
      carbs: Math.round(carbs),
      fat: Math.round(fat),
    };
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans pb-20 md:pb-12">
      {/* Header Section */}
      <header className="bg-slate-900 text-white pt-6 pb-16 md:pt-8 md:pb-20 px-4 md:px-6 rounded-b-[2.5rem] md:rounded-b-[3.5rem] shadow-2xl relative overflow-hidden text-center md:text-left">
        <div className="max-w-4xl mx-auto relative z-10 flex flex-col md:flex-row justify-between items-center gap-6">
          <div>
            <h1 className="text-3xl md:text-4xl font-black mb-1 tracking-tight">{profileName}</h1>
            <p className="text-slate-400 flex items-center justify-center md:justify-start gap-2 text-sm">
              <RefreshCw size={14} className="text-emerald-400" /> Interaktiver Performance-Plan
            </p>
          </div>

          <div className="flex flex-col gap-3 w-full md:w-auto">
            {/* Person Selector */}
            <div className="bg-white/10 backdrop-blur-md border border-white/20 p-3 rounded-2xl flex items-center gap-4 justify-between">
              <div className="flex items-center gap-2">
                <Users size={18} className="text-emerald-400" />
                <span className="text-xs font-bold uppercase tracking-wider">Personen</span>
              </div>
              <div className="flex items-center gap-4">
                <button onClick={() => setServings(Math.max(0.5, servings - 0.5))} className="w-8 h-8 flex items-center justify-center bg-white/5 rounded-lg font-bold">-</button>
                <span className="text-xl font-black text-emerald-400 w-8 text-center">{servings}</span>
                <button onClick={() => setServings(Math.min(10, servings + 0.5))} className="w-8 h-8 flex items-center justify-center bg-white/5 rounded-lg font-bold">+</button>
              </div>
            </div>
            {/* Bulking Modus Toggle */}
            <button 
              onClick={() => setBulkingMode(!bulkingMode)}
              className={`p-3 rounded-2xl flex items-center gap-3 justify-between transition-all ${bulkingMode ? 'bg-orange-500/20 border border-orange-400/40' : 'bg-white/10 border border-white/20'}`}
            >
              <div className="flex items-center gap-2">
                <Dumbbell size={18} className={bulkingMode ? 'text-orange-400' : 'text-slate-400'} />
                <span className="text-xs font-bold uppercase tracking-wider">Bulking Modus</span>
              </div>
              <div className={`w-10 h-5 rounded-full relative transition-all ${bulkingMode ? 'bg-orange-500' : 'bg-white/20'}`}>
                <div className={`w-4 h-4 bg-white rounded-full absolute top-0.5 transition-all ${bulkingMode ? 'left-[22px]' : 'left-[2px]'}`}></div>
              </div>
            </button>
            {/* Frühstück Toggle */}
            <button 
              onClick={() => setBreakfastMode(!breakfastMode)}
              className={`p-3 rounded-2xl flex items-center gap-3 justify-between transition-all ${breakfastMode ? 'bg-amber-500/20 border border-amber-400/40' : 'bg-white/10 border border-white/20'}`}
            >
              <div className="flex items-center gap-2">
                <Egg size={18} className={breakfastMode ? 'text-amber-400' : 'text-slate-400'} />
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider block">Frühstück</span>
                  {breakfastMode && <span className="text-[8px] text-amber-300 font-bold uppercase">+550 kcal · Auf Einkaufsliste</span>}
                </div>
              </div>
              <div className={`w-10 h-5 rounded-full relative transition-all ${breakfastMode ? 'bg-amber-500' : 'bg-white/20'}`}>
                <div className={`w-4 h-4 bg-white rounded-full absolute top-0.5 transition-all ${breakfastMode ? 'left-[22px]' : 'left-[2px]'}`}></div>
              </div>
            </button>
            {/* Jamain Modus Toggle (kein Schweinefleisch) */}
            <button 
              onClick={() => setJamainMode(!jamainMode)}
              className={`p-3 rounded-2xl flex items-center gap-3 justify-between transition-all ${jamainMode ? 'bg-indigo-500/20 border border-indigo-400/40' : 'bg-white/10 border border-white/20'}`}
            >
              <div className="flex items-center gap-2">
                <User size={18} className={jamainMode ? 'text-indigo-400' : 'text-slate-400'} />
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider block">Jamain</span>
                  {jamainMode && <span className="text-[8px] text-indigo-300 font-bold uppercase">Kein Schweinefleisch</span>}
                </div>
              </div>
              <div className={`w-10 h-5 rounded-full relative transition-all ${jamainMode ? 'bg-indigo-500' : 'bg-white/20'}`}>
                <div className={`w-4 h-4 bg-white rounded-full absolute top-0.5 transition-all ${jamainMode ? 'left-[22px]' : 'left-[2px]'}`}></div>
              </div>
            </button>
          </div>
        </div>
        {/* Deals Button (immer sichtbar) */}
        <button 
          onClick={() => setShowDeals(true)}
          className="absolute top-4 left-4 bg-white/15 hover:bg-white/25 p-2.5 rounded-xl transition-all z-10 group"
          title="Aktuelle Aktionen anzeigen"
        >
          <Percent size={16} className="text-white/70 group-hover:text-white transition-colors" />
          {deals.length > 0 && (
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-[8px] text-white font-black flex items-center justify-center animate-pulse">{deals.length}</span>
          )}
        </button>
        <div className="absolute top-[-50px] right-[-50px] w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl"></div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-4xl mx-auto px-4 md:px-6 -mt-8 space-y-4 md:space-y-6 relative z-20">
        
        {/* Plan Selection Slider */}
        <section className="bg-white rounded-2xl shadow-lg border border-slate-100 p-2 flex flex-col gap-2">
          <div className="flex items-center gap-2 px-3 py-1">
            <Layers size={14} className="text-slate-400" />
            <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Wochen-Variante wählen</span>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {[1, 2, 3].map(p => (
              <button 
                key={p} 
                onClick={() => setActivePlan(p)}
                className={`py-3 rounded-xl font-black text-sm transition-all ${activePlan === p ? 'bg-emerald-600 text-white shadow-md' : 'bg-slate-50 text-slate-400 hover:bg-slate-100'}`}
              >
                PLAN {p}
              </button>
            ))}
          </div>
        </section>

        {/* Navigation Tabs */}
        <section className="grid grid-cols-2 gap-3">
          <button 
            onClick={() => setActiveTab('weekly_list')}
            className={`p-4 rounded-2xl flex items-center justify-center gap-2 font-bold transition-all border-2 text-sm ${activeTab === 'weekly_list' ? 'bg-emerald-600 border-emerald-600 text-white shadow-lg' : 'bg-white border-white text-slate-500'}`}
          >
            <ShoppingCart size={18} /> Wochen-Einkauf
          </button>
          <button 
            onClick={() => setActiveTab('monthly_list')}
            className={`p-4 rounded-2xl flex items-center justify-center gap-2 font-bold transition-all border-2 text-sm ${activeTab === 'monthly_list' ? 'bg-blue-600 border-blue-600 text-white shadow-lg' : 'bg-white border-white text-slate-500'}`}
          >
            <CalendarDays size={18} /> Monats-Einkauf
          </button>
        </section>

        {/* Day Selector */}
        <section className="bg-white p-1.5 rounded-2xl shadow-sm border border-slate-100 flex gap-1 overflow-x-auto no-scrollbar scroll-smooth">
          {activeDays.map((day) => (
            <button
              key={day.id}
              onClick={() => setActiveTab(day.id)}
              className={`px-5 py-3 rounded-xl font-bold transition-all shrink-0 text-xs ${activeTab === day.id ? 'bg-slate-900 text-white shadow-md' : 'text-slate-400 hover:bg-slate-50'}`}
            >
              {day.name}
            </button>
          ))}
        </section>

        {/* Content View */}
        {(activeTab === 'weekly_list' || activeTab === 'monthly_list') ? (
          <section className="bg-white rounded-[2rem] p-5 md:p-8 shadow-sm border border-slate-100 animate-in fade-in slide-in-from-bottom-4">
            <div className="flex items-center gap-3 mb-6">
              <div className={`p-3 rounded-xl ${activeTab === 'weekly_list' ? 'bg-emerald-100 text-emerald-600' : 'bg-blue-100 text-blue-600'}`}>
                {activeTab === 'weekly_list' ? <ShoppingCart size={24} /> : <CalendarDays size={24} />}
              </div>
              <div>
                <h2 className="text-xl font-black text-slate-800">{activeTab === 'weekly_list' ? `Einkauf für Plan ${activePlan}` : 'Monatlicher Vorrat'}</h2>
                <p className="text-slate-400 text-[10px] font-bold uppercase tracking-wider">Fokus: {activeTab === 'weekly_list' ? 'Frische & Protein' : 'Bulk-Kauf & Supplements'}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-3">
              {(activeTab === 'weekly_list' ? effectiveShoppingWeekly : effectiveShoppingMonthly).map((item, idx) => {
                const matchingDeals = getMatchingDeals(item.item);
                const itemFactor = item.isBreakfast ? 1 : bulkFactor;
                return (
                  <div key={idx} className={`rounded-xl overflow-hidden border ${item.isBreakfast ? 'border-amber-200' : 'border-slate-100'}`}>
                    <div className={`p-4 flex justify-between items-center ${item.isBreakfast ? 'bg-amber-50' : 'bg-slate-50'}`}>
                      <div>
                        <p className="font-bold text-slate-800 text-sm">{item.item}</p>
                        <p className="text-[10px] font-bold text-slate-400 uppercase">{item.store}{item.isBreakfast ? ' · Frühstück' : ''}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-emerald-600 font-mono font-black text-sm">
                          {(item.qty * (servings/3) * itemFactor).toFixed(1)} {item.unit}
                        </p>
                        <p className="text-[10px] text-slate-400 font-bold">ca. CHF {(parseFloat(item.price) * (servings/3) * itemFactor).toFixed(2)}</p>
                      </div>
                    </div>
                    {matchingDeals.length > 0 && (
                      <div className="bg-red-50/60 border-t border-red-100 px-4 py-2.5 space-y-1.5">
                        <div className="flex items-center gap-1.5">
                          <Tag size={10} className="text-red-400" />
                          <span className="text-[9px] font-black uppercase text-red-400 tracking-wider">Spar-Tipp diese Woche</span>
                        </div>
                        {matchingDeals.map((deal, dIdx) => {
                          const dealUrl = deal.url || (
                            deal.store === 'Migros'
                              ? `https://www.migros.ch/de/search?q=${encodeURIComponent(deal.product)}`
                              : `https://www.denner.ch/de/search?q=${encodeURIComponent(deal.product)}`
                          );
                          return (
                            <a key={dIdx} href={dealUrl} target="_blank" rel="noopener noreferrer" className="flex items-center justify-between gap-2 group" style={{ textDecoration: 'none', color: 'inherit' }}>
                              <div className="flex items-center gap-2 min-w-0">
                                <span className="bg-red-500 text-white text-[9px] font-black px-1.5 py-0.5 rounded shrink-0">-{deal.discount}%</span>
                                <span className="text-slate-700 text-xs font-bold truncate group-hover:text-red-600 transition-colors">{deal.product}</span>
                              </div>
                              <div className="flex items-center gap-1.5 shrink-0">
                                <span className="text-red-600 font-mono font-black text-xs">CHF {deal.price}</span>
                                <span className="text-[9px] text-slate-400 font-bold uppercase">{deal.store}</span>
                                <ExternalLink size={10} className="text-slate-300 group-hover:text-red-400 transition-colors" />
                              </div>
                            </a>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
            
            <div className="mt-6 p-5 bg-slate-900 rounded-[1.5rem] text-white flex justify-between items-center shadow-lg">
              <div className="flex items-center gap-2 text-slate-400">
                <Coins size={20} />
                <span className="text-[10px] font-bold uppercase tracking-wider">Budget-Check</span>
              </div>
              <span className="text-2xl font-black text-emerald-400">
                CHF {( (activeTab === 'weekly_list' ? effectiveShoppingWeekly : effectiveShoppingMonthly).reduce((acc, curr) => acc + parseFloat(curr.price) * (servings/3) * (curr.isBreakfast ? 1 : bulkFactor), 0) ).toFixed(2)}
              </span>
            </div>
          </section>
        ) : (
          <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4">
            {/* Meal Header */}
            <div className="flex items-center justify-between px-1">
              <h2 className="text-2xl font-black text-slate-800">{currentDay.fullName} <span className="text-emerald-500">Plan {activePlan}</span></h2>
              <div className={`flex items-center gap-1.5 font-bold px-3 py-1.5 rounded-full shadow-sm border text-xs ${bulkingMode ? 'bg-orange-50 border-orange-200 text-orange-600' : 'bg-white border-slate-100 text-slate-500'}`}>
                <Flame size={14} className="text-orange-500" />
                <span>~{(bulkingMode ? 3000 : 2350) + (breakfastMode ? 550 : 0)} kcal</span>
              </div>
            </div>

            {/* Frühstück */}
            <div className={`rounded-2xl p-4 flex items-center gap-4 ${breakfastMode ? 'bg-amber-50 border border-amber-200' : 'bg-slate-50 border border-slate-100'}`}>
              <div className={`p-2.5 rounded-xl shrink-0 ${breakfastMode ? 'bg-amber-100 text-amber-600' : 'bg-slate-200 text-slate-400'}`}>
                {breakfastMode ? <Egg size={18} /> : <Coffee size={18} />}
              </div>
              <div className="flex-1">
                <p className="text-[9px] font-bold uppercase tracking-wider text-slate-400 mb-0.5">Frühstück {breakfastMode && (bulkingMode ? '· Bulking' : '· Aktiv')}</p>
                {breakfastMode ? (
                  <>
                    <p className="font-black text-slate-900 text-sm">{bulkingBreakfasts[activePlan]?.[currentDay.id]?.name || 'Power-Oats'}</p>
                    <p className="text-slate-500 text-xs">{bulkingBreakfasts[activePlan]?.[currentDay.id]?.desc}</p>
                  </>
                ) : (
                  <p className="font-bold text-slate-500 text-xs">Schwarzer Kaffee oder Tee <span className="text-slate-300">· 0 kcal · Intervallfasten</span></p>
                )}
              </div>
              {breakfastMode && <span className="text-amber-500 font-mono font-black text-xs shrink-0">~550 kcal</span>}
            </div>

            {/* Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-slate-100 flex flex-col">
                <div className="flex items-center gap-3 mb-4">
                  <div className="bg-emerald-100 p-2 rounded-lg text-emerald-600">
                    <UtensilsCrossed size={18} />
                  </div>
                  <span className="font-bold text-slate-400 uppercase text-[10px]">Mittagessen</span>
                </div>
                <h3 className="text-xl font-black text-slate-900 mb-1">{currentDay.lunch}</h3>
                <p className="text-slate-500 text-sm mb-6">{currentDay.lunchDesc}</p>

                <div className="space-y-2 mb-6">
                  {getIngredients(currentDay).map((ing, idx) => (
                    <div key={idx} className="flex justify-between items-center bg-slate-50 p-2.5 rounded-xl text-xs">
                      <span className="font-bold text-slate-700">{ing.item}</span>
                      <span className="text-emerald-600 font-mono font-bold">{(ing.qty * servings).toLocaleString()} {ing.unit}</span>
                    </div>
                  ))}
                </div>

                <div className="bg-amber-50 rounded-2xl p-4 flex items-center gap-4 mt-auto">
                  <Zap size={18} className="text-amber-500 shrink-0" />
                  <div>
                    <p className="text-[9px] text-amber-600 font-bold uppercase">Snack-Option</p>
                    <p className="font-bold text-slate-800 text-xs">{currentDay.snack}</p>
                  </div>
                </div>
              </div>

              <div className={`rounded-[2rem] p-6 shadow-xl flex flex-col ${currentDay.isCheat ? 'bg-gradient-to-br from-purple-600 to-indigo-700 text-white' : 'bg-[#0f1b3d] text-white'}`}>
                <div className="flex items-center gap-3 mb-4">
                  <div className="bg-white/10 p-2 rounded-lg border border-white/20">
                    {currentDay.isCheat ? <IceCream size={18} /> : <Egg size={18} />}
                  </div>
                  <span className="font-bold text-white/50 uppercase text-[10px]">Abendessen</span>
                </div>
                <h3 className="text-xl font-black mb-1">{currentDay.isCheat ? 'Cheat Night' : (bulkingMode ? 'Heavy Recovery Meal' : 'Recovery Meal')}</h3>
                <p className="text-white/70 text-sm mb-4 leading-relaxed">{bulkingMode ? getBulkDinner(currentDay) : currentDay.dinner}</p>

                <div className="space-y-2 mb-4">
                  {getDinnerIngredients(currentDay).map((ing, idx) => (
                    <div key={idx}>
                      <div className="flex justify-between items-center bg-white/[0.07] p-2.5 rounded-xl text-xs">
                        <span className="font-bold text-white/80">{ing.item}</span>
                        <span className="text-emerald-400 font-mono font-bold">{typeof ing.qty === 'number' && ing.qty % 1 !== 0 ? (ing.qty * servings).toFixed(1) : (ing.qty * servings).toLocaleString()} {ing.unit}</span>
                      </div>
                      {ing.note && <p className="text-[9px] font-black text-red-400 uppercase tracking-wider mt-0.5 ml-2.5">⚠ {ing.note}</p>}
                    </div>
                  ))}
                </div>

                <div className="mt-auto pt-3 border-t border-white/10 flex items-center justify-between">
                  <span className="text-[10px] text-white/40 font-bold uppercase">Consistency is Key</span>
                  <CheckCircle2 className="text-emerald-400" size={20} />
                </div>
              </div>
            </div>

            {/* Daily Post-Workout Shake */}
            <div className="bg-gradient-to-r from-violet-600 to-purple-700 rounded-[2rem] p-5 md:p-6 shadow-xl text-white">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="bg-white/10 p-2.5 rounded-xl border border-white/20">
                    <Zap size={20} />
                  </div>
                  <div>
                    <h3 className="text-lg font-black">Post-Workout Shake</h3>
                    <p className="text-white/50 text-[10px] font-bold uppercase tracking-wider">Täglich nach dem Training · {servings} {servings === 1 ? 'Person' : 'Personen'}</p>
                  </div>
                </div>
              </div>
                <div className="grid grid-cols-3 gap-2">
                <div className="bg-white/10 backdrop-blur-sm p-3 rounded-xl text-center">
                  <p className="text-white/50 text-[9px] font-bold uppercase mb-1">Whey Protein</p>
                  <p className="font-black text-lg text-emerald-300">{Math.round(30 * bulkFactor) * servings}g</p>
                </div>
                <div className="bg-white/10 backdrop-blur-sm p-3 rounded-xl text-center">
                  <p className="text-white/50 text-[9px] font-bold uppercase mb-1">Kreatin</p>
                  <p className="font-black text-lg text-emerald-300">{5 * servings}-{10 * servings}g</p>
                </div>
                <div className="bg-white/10 backdrop-blur-sm p-3 rounded-xl text-center">
                  <p className="text-white/50 text-[9px] font-bold uppercase mb-1">Wasser</p>
                  <p className="font-black text-lg text-emerald-300">{Math.round(300 * bulkFactor) * servings}ml</p>
                </div>
              </div>
            </div>

            {/* Vitamin-Abdeckung */}
            <section className="bg-white rounded-[2rem] p-5 md:p-8 shadow-sm border border-slate-100">
              <div className="flex items-center gap-3 mb-6">
                <div className="bg-emerald-100 p-3 rounded-xl text-emerald-600">
                  <Shield size={24} />
                </div>
                <div>
                  <h2 className="text-xl font-black text-slate-800">Vitamin-Abdeckung</h2>
                  <p className="text-slate-400 text-[10px] font-bold uppercase tracking-wider">{currentDay.fullName} — Plan {activePlan}</p>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {getVitaminCoverage(currentDay).map((vitItem, idx) => (
                  <div key={idx} className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                    <div className="flex justify-between items-center mb-1.5">
                      <span className="font-bold text-slate-700 text-sm">{vitItem.name}</span>
                      <span className={`font-mono font-black text-sm ${vitItem.percent >= 80 ? 'text-emerald-600' : vitItem.percent >= 50 ? 'text-amber-500' : 'text-red-400'}`}>
                        {vitItem.percent}%
                      </span>
                    </div>
                    <div className="w-full bg-slate-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full transition-all ${vitItem.percent >= 80 ? 'bg-emerald-500' : vitItem.percent >= 50 ? 'bg-amber-400' : 'bg-red-400'}`}
                        style={{ width: `${Math.min(vitItem.percent, 100)}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Supplement-Empfehlungen */}
              {(() => {
                const recs = getSupplementRecs(getVitaminCoverage(currentDay));
                return recs.length > 0 ? (
                  <div className="mt-6 pt-6 border-t border-slate-100">
                    <div className="flex items-center gap-2 mb-4">
                      <Pill size={16} className="text-blue-500" />
                      <h3 className="font-black text-slate-800 text-sm">Empfohlene Supplements</h3>
                      <span className="text-[9px] text-slate-400 font-bold uppercase ml-auto">Basierend auf Tageswerten</span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {recs.map((rec, idx) => (
                        <div key={idx} className="bg-blue-50 p-3 rounded-xl border border-blue-100 flex items-start gap-3">
                          <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${rec.priority === 'high' ? 'bg-red-400' : rec.priority === 'medium' ? 'bg-amber-400' : 'bg-blue-400'}`}></div>
                          <div>
                            <p className="font-bold text-slate-800 text-sm">{rec.name}</p>
                            <p className="text-blue-600 font-mono text-[11px] font-bold">{rec.dose}</p>
                            <p className="text-slate-400 text-[10px]">{rec.reason}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : null;
              })()}
            </section>

            {/* Makronährstoffe */}
            {(() => {
              const macros = getMacros(currentDay);
              const totalKcal = macros.protein * 4 + macros.carbs * 4 + macros.fat * 9;
              return (
                <section className="bg-white rounded-[2rem] p-5 md:p-8 shadow-sm border border-slate-100">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="bg-orange-100 p-3 rounded-xl text-orange-600">
                      <Target size={24} />
                    </div>
                    <div>
                      <h2 className="text-xl font-black text-slate-800">Makronährstoffe</h2>
                      <p className="text-slate-400 text-[10px] font-bold uppercase tracking-wider">{currentDay.fullName} — pro Person · ~{totalKcal} kcal</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    <div className="bg-red-50 p-4 rounded-2xl border border-red-100 text-center">
                      <p className="text-[9px] font-black uppercase text-red-400 tracking-wider mb-1">Protein</p>
                      <p className="text-3xl font-black text-red-600">{macros.protein}<span className="text-lg">g</span></p>
                      <p className="text-[10px] text-red-300 font-bold mt-1">{Math.round(macros.protein * 4 / totalKcal * 100)}% der kcal</p>
                    </div>
                    <div className="bg-amber-50 p-4 rounded-2xl border border-amber-100 text-center">
                      <p className="text-[9px] font-black uppercase text-amber-500 tracking-wider mb-1">Kohlenhydrate</p>
                      <p className="text-3xl font-black text-amber-600">{macros.carbs}<span className="text-lg">g</span></p>
                      <p className="text-[10px] text-amber-300 font-bold mt-1">{Math.round(macros.carbs * 4 / totalKcal * 100)}% der kcal</p>
                    </div>
                    <div className="bg-blue-50 p-4 rounded-2xl border border-blue-100 text-center">
                      <p className="text-[9px] font-black uppercase text-blue-400 tracking-wider mb-1">Fett</p>
                      <p className="text-3xl font-black text-blue-600">{macros.fat}<span className="text-lg">g</span></p>
                      <p className="text-[10px] text-blue-300 font-bold mt-1">{Math.round(macros.fat * 9 / totalKcal * 100)}% der kcal</p>
                    </div>
                  </div>
                  <div className="mt-4 bg-slate-50 rounded-xl p-3 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Flame size={14} className="text-orange-500" />
                      <span className="text-xs font-bold text-slate-500">Gesamt Kalorien</span>
                    </div>
                    <span className="text-lg font-black text-slate-800">~{totalKcal} kcal</span>
                  </div>
                </section>
              );
            })()}
          </div>
        )}

        {/* Footer Info */}
        <section className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 flex items-start gap-4">
          <div className="bg-blue-50 p-2 rounded-xl text-blue-600 shrink-0">
            <Info size={20} />
          </div>
          <div>
            <h4 className="font-black text-slate-800 uppercase text-[10px] tracking-widest mb-1">Variation & Info</h4>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              {jamainMode ? (
                <>Die Pläne 1-3 nutzen die exakt gleichen Proteine und Carbs. Proteinquellen: Rind, Poulet & Fisch. <span className="text-indigo-600 font-bold">Jamain-Modus aktiv:</span> Alle Schweinefleisch-Gerichte wurden durch Poulet ersetzt. Du kannst Fleisch/Fisch jederzeit untereinander tauschen, solange die Menge gleich bleibt.</>
              ) : (
                <>Die Pläne 1-3 nutzen die exakt gleichen Proteine und Carbs. Proteinquellen: Rind, Schwein, Poulet & Fisch. <span className="text-slate-900 font-bold">Tipp:</span> Schweinsnierstücke sind Top für B1 (Thiamin) und günstiger als Rind. Du kannst Fleisch/Fisch jederzeit untereinander tauschen, solange die Menge gleich bleibt.</>
              )}
            </p>
          </div>
        </section>
      </main>

      <footer className="text-center mt-8 text-slate-400 text-[10px] font-bold uppercase tracking-widest pb-10">
        <p>Built for Jill // v3.0 Multi-Plan</p>
      </footer>

      {/* Deals Popup */}
      {showDeals && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 backdrop-blur-sm p-4" onClick={() => setShowDeals(false)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-slide-up" onClick={e => e.stopPropagation()}>
            <div className="bg-gradient-to-r from-red-500 to-orange-500 p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="bg-white/20 p-2 rounded-xl">
                  <Tag size={20} className="text-white" />
                </div>
                <div>
                  <p className="text-white font-black text-sm">Aktuelle Aktionen</p>
                  <p className="text-white/70 text-[10px] font-bold uppercase tracking-wider">Migros & Denner · Zürich</p>
                </div>
              </div>
              <button onClick={() => setShowDeals(false)} className="bg-white/20 hover:bg-white/30 p-1.5 rounded-xl transition-colors">
                <X size={16} className="text-white" />
              </button>
            </div>
            <div className="p-4 space-y-3 max-h-[60vh] overflow-y-auto">
              {deals.length > 0 ? deals.map((deal, idx) => {
                // Fallback: Migros-Suche oder Denner-Suche falls keine direkte URL vorhanden
                const dealUrl = deal.url || (
                  deal.store === 'Migros' 
                    ? `https://www.migros.ch/de/search?q=${encodeURIComponent(deal.product)}`
                    : `https://www.denner.ch/de/search?q=${encodeURIComponent(deal.product)}`
                );
                return (
                  <a key={idx} href={dealUrl} target="_blank" rel="noopener noreferrer" className="bg-slate-50 rounded-xl p-3 border border-slate-100 flex items-center gap-3 cursor-pointer hover:bg-slate-100 hover:border-slate-200 transition-all active:scale-[0.98] block" style={{ textDecoration: 'none', color: 'inherit' }}>
                    <div className="bg-red-50 text-red-500 font-black text-xs rounded-lg p-2 shrink-0 text-center min-w-[52px]">
                      <span className="text-lg leading-none block">-{deal.discount}%</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-slate-800 text-sm truncate">{deal.product}</p>
                      <p className="text-slate-400 text-[10px] font-bold uppercase">{deal.store} · bis {new Date(deal.validUntil).toLocaleDateString('de-CH')}</p>
                    </div>
                    <div className="text-right shrink-0 flex items-center gap-2">
                      <div>
                        <p className="text-red-500 font-black text-sm">CHF {deal.price}</p>
                        {deal.oldPrice && <p className="text-slate-300 text-[10px] line-through">CHF {deal.oldPrice}</p>}
                      </div>
                      <ExternalLink size={14} className="text-slate-300" />
                    </div>
                  </a>
                );
              }) : (
                <div className="text-center py-8">
                  <Percent size={32} className="text-slate-200 mx-auto mb-3" />
                  <p className="font-bold text-slate-400 text-sm">Keine aktuellen Aktionen</p>
                  <p className="text-slate-300 text-xs mt-1">Deals werden täglich automatisch aktualisiert.</p>
                </div>
              )}
            </div>
            <div className="p-3 border-t border-slate-100 text-center">
              <button onClick={() => setShowDeals(false)} className="text-slate-400 text-xs font-bold hover:text-slate-600 transition-colors">
                Schliessen
              </button>
            </div>
          </div>
        </div>
      )}

      <style dangerouslySetInnerHTML={{ __html: `
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        @keyframes slide-up { from { transform: translateY(100px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
        .animate-slide-up { animation: slide-up 0.3s ease-out; }
      `}} />
    </div>
  );
};

export default App;