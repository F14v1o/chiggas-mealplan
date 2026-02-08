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
  Shield
} from 'lucide-react';

const App = () => {
  const [servings, setServings] = useState(3);
  const [activeTab, setActiveTab] = useState('mon'); 
  const [activePlan, setActivePlan] = useState(1); // Plan 1, 2 oder 3

  const profileName = "Chiggas and White's";
  
  // Gemeinsame Protein-Quellen (Thunfisch hinzugefügt)
  const fishOptions = "Lachs, Weissfisch oder Thunfisch";

  // Die 3 Plan-Variationen
  const planData = {
    1: [ // ORIGINAL: Bowls & Recovery
      { id: 'mon', name: 'MO', fullName: 'Montag', lunch: 'The Big Bowl', lunchDesc: 'Wildreis, Rinderstreifen, Brokkoli, Linsen.', snack: '2 Kiwis & Walnüsse', dinner: 'Rührei mit viel Spinat.', type: 'meat' },
      { id: 'tue', name: 'DI', fullName: 'Dienstag', lunch: 'Omega-3 Fokus', lunchDesc: 'Süßkartoffel, Lachsfilet, Grünkohl.', snack: 'Cashews & Beeren', dinner: 'Salat mit 3 Eiern & Linsen.', type: 'fish' },
      { id: 'wed', name: 'MI', fullName: 'Mittwoch', lunch: 'Hähnchen-Mitte', lunchDesc: 'Brauner Reis, Pouletbrust, Pak Choi, Linsen.', snack: 'Calcium-Milch & Apfel', dinner: 'Omelett mit Pilzen & Vollkornbrot.', type: 'poultry' },
      { id: 'thu', name: 'DO', fullName: 'Donnerstag', lunch: 'Rind & Power', lunchDesc: 'Süßkartoffel-Wedges, Rinderhack, Grünkohl.', snack: 'Vit D3+K2 & Banane', dinner: 'Spiegeleier auf Linsen/Spinat.', type: 'meat' },
      { id: 'fri', name: 'FR', fullName: 'Freitag', lunch: 'Fish Friday', lunchDesc: 'Wildreis, Weissfisch, Brokkoli, Pak Choi.', snack: 'Dunkle Schoggi & Nüsse', dinner: 'Rührei mit Räucherlachs.', type: 'fish' },
      { id: 'sat', name: 'SA', fullName: 'Samstag', lunch: 'Big Workout Bowl', lunchDesc: 'Reis/Süßkartoffel Mix, doppelt Poulet, Grünkohl.', snack: 'Nüsse & Whey Shake', dinner: 'Gekochte Eier mit Rohkost.', type: 'poultry' },
      { id: 'sun', name: 'SO', fullName: 'Sonntag', lunch: 'Linsen-Bolo', lunchDesc: 'Süßkartoffel gefüllt mit Linsen-Bolo & Brokkoli.', snack: 'CHEAT SNACK', dinner: 'Resterwertung Omelett.', type: 'veggie', isCheat: true }
    ],
    2: [ // VARIANTE 2: Pfannengerichte & Salate
      { id: 'mon', name: 'MO', fullName: 'Montag', lunch: 'Beef & Pak Choi Stir-fry', lunchDesc: 'Rinderstreifen scharf angebraten mit Pak Choi & Reis.', snack: 'Handvoll Mandeln', dinner: 'Thunfisch-Salat mit 3 Eiern & Spinat.', type: 'meat' },
      { id: 'tue', name: 'DI', fullName: 'Dienstag', lunch: 'Süsskartoffel-Fisch-Pfanne', lunchDesc: 'Lachs & Weissfisch Würfel mit Süsskartoffeln & Brokkoli.', snack: 'Griechischer Joghurt', dinner: 'Linsensalat mit Feta & Gurke.', type: 'fish' },
      { id: 'wed', name: 'MI', fullName: 'Mittwoch', lunch: 'Poulet-Linsen Curry', lunchDesc: 'Pouletbrust in Linsen-Kokos-Sauce (ohne Reis).', snack: 'Birne & Cashews', dinner: '3 Spiegeleier auf Vollkornbrot.', type: 'poultry' },
      { id: 'thu', name: 'DO', fullName: 'Donnerstag', lunch: 'Protein-Power Reis', lunchDesc: 'Rinderhack mit Wildreis, Spinat und viel Knoblauch.', snack: 'Proteinriegel (Whey)', dinner: 'Thunfisch-Omelett mit Tomaten.', type: 'meat' },
      { id: 'fri', name: 'FR', fullName: 'Freitag', lunch: 'Zitronen-Fisch', lunchDesc: 'Weissfisch mit Wildreis und gedünstetem Pak Choi.', snack: 'Apfel & Erdnussmus', dinner: 'Grosser grüner Salat mit Eiern.', type: 'fish' },
      { id: 'sat', name: 'SA', fullName: 'Samstag', lunch: 'Poulet-Süsskartoffel Mash', lunchDesc: 'Gestampfte Süsskartoffel mit Poulet & Grünkohl.', snack: 'Whey & Beeren', dinner: 'Hüttenkäse mit Nüssen.', type: 'poultry' },
      { id: 'sun', name: 'SO', fullName: 'Sonntag', lunch: 'Veggie Burger Style', lunchDesc: 'Linsen-Patties mit Süsskartoffel-Spalten & Brokkoli.', snack: 'CHEAT SNACK', dinner: 'Gemüse-Pfanne mit Eiern.', type: 'veggie', isCheat: true }
    ],
    3: [ // VARIANTE 3: Ofen-Gerichte & Einfachheit
      { id: 'mon', name: 'MO', fullName: 'Montag', lunch: 'Ofen-Rind & Gemüse', lunchDesc: 'Rinderstreifen mit Brokkoli & Süsskartoffeln vom Blech.', snack: 'Dunkle Schoggi', dinner: '3 Eier mit Linsen-Topping.', type: 'meat' },
      { id: 'tue', name: 'DI', fullName: 'Dienstag', lunch: 'Wildreis-Thunfisch Mix', lunchDesc: 'Reissalat mit Thunfisch, Linsen und frischem Pak Choi.', snack: 'Kiwis', dinner: 'Rührei mit Grünkohl.', type: 'fish' },
      { id: 'wed', name: 'MI', fullName: 'Mittwoch', lunch: 'Crispy Poulet', lunchDesc: 'Pouletbrust aus dem Ofen mit Reis und Brokkoli-Salat.', snack: 'Nussmix', dinner: 'Protein-Pancakes (Eier/Whey).', type: 'poultry' },
      { id: 'thu', name: 'DO', fullName: 'Donnerstag', lunch: 'Hackfleisch-Eintopf', lunchDesc: 'Rinderhack mit Linsen, Tomaten und Grünkohl.', snack: 'Banane', dinner: 'Thunfisch-Steak mit Spinat.', type: 'meat' },
      { id: 'fri', name: 'FR', fullName: 'Freitag', lunch: 'Fisch-Päckli', lunchDesc: 'Lachs in Folie mit Pak Choi & Reis gegart.', snack: 'Beerenmix', dinner: 'Eiersalat mit Linsen.', type: 'fish' },
      { id: 'sat', name: 'SA', fullName: 'Samstag', lunch: 'Fitness-Platte', lunchDesc: 'Poulet, Reis, Linsen & Brokkoli separat (Meal Prep Style).', snack: 'Whey Shake', dinner: '3 gekochte Eier.', type: 'poultry' },
      { id: 'sun', name: 'SO', fullName: 'Sonntag', lunch: 'Süsskartoffel-Linsen Suppe', lunchDesc: 'Cremige Suppe mit Brokkoli-Röschen.', snack: 'CHEAT SNACK', dinner: 'Resten-Omelett.', type: 'veggie', isCheat: true }
    ]
  };

  const activeDays = planData[activePlan];
  const currentDay = activeDays.find(d => d.id === activeTab) || activeDays[0];

  // Einkaufslisten (Thunfisch integriert)
  const shoppingWeekly = [
    { item: 'Rinderstreifen / Hack', qty: 1.2, unit: 'kg', price: '22.00', store: 'Denner' },
    { item: 'Pouletbrust (Gross-Pack)', qty: 1.5, unit: 'kg', price: '18.50', store: 'Migros' },
    { item: 'Lachs / Weissfisch / Thunfisch', qty: 1.5, unit: 'kg', price: '24.00', store: 'Denner/Migros' },
    { item: 'Eier (Freiland, 30er)', qty: 2, unit: 'Pack', price: '14.50', store: 'Migros' },
    { item: 'Süßkartoffeln', qty: 5, unit: 'kg', price: '12.00', store: 'Migros' },
    { item: 'Grünkohl / Spinat', qty: 2.5, unit: 'kg', price: '10.50', store: 'Migros' },
    { item: 'Brokkoli / Pak Choi', qty: 2.5, unit: 'kg', price: '12.00', store: 'Denner' },
    { item: 'Kiwis / Beeren (Mix)', qty: 1, unit: 'kg', price: '8.00', store: 'Migros' }
  ];

  const shoppingMonthly = [
    { item: 'Reis (M-Budget, 5kg)', qty: 2, unit: 'Sack', price: '11.80', store: 'Migros' },
    { item: 'Linsen (Trocken, 1kg)', qty: 4, unit: 'Pack', price: '10.00', store: 'Migros' },
    { item: 'Thunfisch Konserven (Vorrat)', qty: 10, unit: 'Dosen', price: '15.00', store: 'Denner' },
    { item: 'Whey Protein (2.5kg)', qty: 1, unit: 'Kübel', price: '75.00', store: 'Online' },
    { item: 'Kreatin (500g)', qty: 1, unit: 'Dose', price: '25.00', store: 'Online' },
    { item: 'Nüsse / Kerne Mix', qty: 2, unit: 'kg', price: '18.00', store: 'Denner' },
    { item: 'Olivenöl (1L)', qty: 2, unit: 'Fl.', price: '16.00', store: 'Migros' }
  ];

  // Helper für Zutaten (Simuliert gleiche Basis für alle Pläne)
  const getIngredients = (day) => {
    const base = [
      { item: 'Protein (Rind/Huhn/Fisch)', qty: 200, unit: 'g' },
      { item: 'Carbs (Reis/Süsskartoffel)', qty: 250, unit: 'g' },
      { item: 'Gemüse (Brokkoli/Spinat)', qty: 300, unit: 'g' },
      { item: 'Linsen (Trocken)', qty: 60, unit: 'g' }
    ];
    if (day.type === 'fish') base[0].item = fishOptions;
    if (day.type === 'poultry') base[0].item = 'Pouletbrust';
    if (day.type === 'meat') base[0].item = 'Rinderstreifen/Hack';
    return base;
  };

  // Dynamische Vitamin-Abdeckung basierend auf Tagesmahlzeiten
  const getVitaminCoverage = (day) => {
    const v = {};

    // Protein-Quelle
    if (day.type === 'meat') { v['B12'] = 130; v['Zink'] = 65; v['B6'] = 55; v['Eisen'] = 45; v['B3 (Niacin)'] = 60; }
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

    // Daily Post-Workout Shake (Whey + Kreatin)
    v['B2'] = (v['B2']||0)+30;
    v['Calcium'] = (v['Calcium']||0)+25;

    return Object.entries(v)
      .map(([name, percent]) => ({ name, percent: Math.min(percent, 150) }))
      .sort((a, b) => b.percent - a.percent);
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
                <button onClick={() => setServings(Math.max(1, servings - 1))} className="w-8 h-8 flex items-center justify-center bg-white/5 rounded-lg font-bold">-</button>
                <span className="text-xl font-black text-emerald-400 w-6 text-center">{servings}</span>
                <button onClick={() => setServings(Math.min(10, servings + 1))} className="w-8 h-8 flex items-center justify-center bg-white/5 rounded-lg font-bold">+</button>
              </div>
            </div>
          </div>
        </div>
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
              {(activeTab === 'weekly_list' ? shoppingWeekly : shoppingMonthly).map((item, idx) => (
                <div key={idx} className="bg-slate-50 p-4 rounded-xl border border-slate-100 flex justify-between items-center">
                  <div>
                    <p className="font-bold text-slate-800 text-sm">{item.item}</p>
                    <p className="text-[10px] font-bold text-slate-400 uppercase">{item.store}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-emerald-600 font-mono font-black text-sm">
                      {(item.qty * (servings/3)).toFixed(1)} {item.unit}
                    </p>
                    <p className="text-[10px] text-slate-400 font-bold">ca. CHF {(parseFloat(item.price) * (servings/3)).toFixed(2)}</p>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="mt-6 p-5 bg-slate-900 rounded-[1.5rem] text-white flex justify-between items-center shadow-lg">
              <div className="flex items-center gap-2 text-slate-400">
                <Coins size={20} />
                <span className="text-[10px] font-bold uppercase tracking-wider">Budget-Check</span>
              </div>
              <span className="text-2xl font-black text-emerald-400">
                CHF {( (activeTab === 'weekly_list' ? shoppingWeekly : shoppingMonthly).reduce((acc, curr) => acc + parseFloat(curr.price), 0) * (servings/3) ).toFixed(2)}
              </span>
            </div>
          </section>
        ) : (
          <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4">
            {/* Meal Header */}
            <div className="flex items-center justify-between px-1">
              <h2 className="text-2xl font-black text-slate-800">{currentDay.fullName} <span className="text-emerald-500">Plan {activePlan}</span></h2>
              <div className="flex items-center gap-1.5 text-slate-500 font-bold bg-white px-3 py-1.5 rounded-full shadow-sm border border-slate-100 text-xs">
                <Flame size={14} className="text-orange-500" />
                <span>~2350 kcal</span>
              </div>
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

              <div className={`rounded-[2rem] p-6 shadow-xl flex flex-col ${currentDay.isCheat ? 'bg-gradient-to-br from-purple-600 to-indigo-700 text-white' : 'bg-slate-900 text-white'}`}>
                <div className="flex items-center gap-3 mb-4">
                  <div className="bg-white/10 p-2 rounded-lg border border-white/20">
                    {currentDay.isCheat ? <IceCream size={18} /> : <Egg size={18} />}
                  </div>
                  <span className="font-bold text-white/50 uppercase text-[10px]">Abendessen</span>
                </div>
                <h3 className="text-xl font-black mb-3">{currentDay.isCheat ? 'Cheat Night' : 'Recovery Meal'}</h3>
                <p className="text-white/80 italic text-base mb-8 leading-relaxed">"{currentDay.dinner}"</p>
                <div className="mt-auto pt-4 border-t border-white/10 flex items-center justify-between">
                  <span className="text-[10px] text-white/50 font-bold uppercase">Consistency is Key</span>
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
                    <p className="text-white/50 text-[10px] font-bold uppercase tracking-wider">Täglich nach dem Training</p>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <div className="bg-white/10 backdrop-blur-sm p-3 rounded-xl text-center">
                  <p className="text-white/50 text-[9px] font-bold uppercase mb-1">Whey Protein</p>
                  <p className="font-black text-lg text-emerald-300">30g</p>
                </div>
                <div className="bg-white/10 backdrop-blur-sm p-3 rounded-xl text-center">
                  <p className="text-white/50 text-[9px] font-bold uppercase mb-1">Kreatin</p>
                  <p className="font-black text-lg text-emerald-300">5-10g</p>
                </div>
                <div className="bg-white/10 backdrop-blur-sm p-3 rounded-xl text-center">
                  <p className="text-white/50 text-[9px] font-bold uppercase mb-1">Wasser</p>
                  <p className="font-black text-lg text-emerald-300">300ml</p>
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
            </section>
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
              Die Pläne 1-3 nutzen die exakt gleichen Proteine und Carbs. <span className="text-slate-900 font-bold">Tipp:</span> Wenn du Thunfisch kaufst, achte auf "im eigenen Saft" für weniger Fett. Du kannst Fleisch/Fisch jederzeit untereinander tauschen, solange die Menge gleich bleibt.
            </p>
          </div>
        </section>
      </main>

      <footer className="text-center mt-8 text-slate-400 text-[10px] font-bold uppercase tracking-widest pb-10">
        <p>Built for Jil // v3.0 Multi-Plan</p>
      </footer>

      <style dangerouslySetInnerHTML={{ __html: `.no-scrollbar::-webkit-scrollbar { display: none; } .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }`}} />
    </div>
  );
};

export default App;