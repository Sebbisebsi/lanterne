# Lanterne Widget API

Dokumentation for Lanternes widget-system. Alt du skal bruge for at oprette, tilpasse og administrere widgets.

---

## Arkitektur

```
newtab.html          Entry point — lader CSS + JS
  js/main.js         Orchestrator — initialiserer alle moduler
    js/widgets.js    Widget registry, renderers, galleri, indstillingsmodaler
    js/drag.js       Drag-and-drop med viewport-clamping
    js/storage.js    Wrapper over chrome.storage.local (med localStorage fallback)
```

### Dataflow

```
chrome.storage.local
  enabledWidgets    → string[]           (fx ['quote','timer','notepad'])
  widgetConfigs     → { [id]: config }   (fx { youtube: { videoUrl: '...' } })
  widgetPositions   → { [id]: {x,y} }   (drag-offsets i pixels)
```

---

## Opret en ny widget

### 1. Definer widgeten i `WIDGET_DEFS`

```js
// js/widgets.js — tilfoej til WIDGET_DEFS objektet:

mywidget: {
  name: 'Mit Widget',                    // Vist i galleri + header
  description: 'Kort beskrivelse',       // Vist i galleri
  icon: 'star',                          // Noegle i ICONS objektet
  category: 'produktivitet',             // 'produktivitet' | 'vaerktoejer' | 'info'
  defaultConfig: { color: 'blue' },      // Standard-konfiguration
  render: renderMyWidget,                // Renderer-funktion
  hasSettings: true                      // Vis tandhjul-ikon (valgfri)
}
```

### 2. Skriv render-funktionen

```js
function renderMyWidget(container, config, widgetId) {
  // container: HTMLElement — indholdsomraadet i widget-kortet
  // config:    Object      — merged defaultConfig + brugerens gemte config
  // widgetId:  string      — ID'et (fx 'mywidget')

  container.innerHTML = `
    <div class="widget-body">
      <p>Farve: ${config.color}</p>
      <button class="my-btn">Klik mig</button>
    </div>
  `;

  // Tilfoej interaktivitet
  container.querySelector('.my-btn').addEventListener('click', () => {
    alert('Hej fra widget!');
  });
}
```

### 3. (Valgfrit) Tilfoej indstillingsmodal

Hvis `hasSettings: true`, tilfoej en case i `showWidgetSettingsModal()`:

```js
// I showWidgetSettingsModal funktionen:
else if (widgetId === 'mywidget') {
  formHTML = `
    <label class="ws-label">Farve</label>
    <input class="ws-input" type="text" id="ws-my-color"
           value="${currentConfig.color || ''}" placeholder="blue" />
  `;
}

// I save-handleren:
else if (widgetId === 'mywidget') {
  nc.color = overlay.querySelector('#ws-my-color').value.trim();
}
```

### 4. Tilfoej et ikon

Tilfoej en SVG til `ICONS` objektet:

```js
const ICONS = {
  // ...eksisterende ikoner...
  star: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>',
};
```

---

## Kategorier

Widgets grupperes i galleriet efter kategori:

| Noegle           | Vist som              |
|------------------|-----------------------|
| `produktivitet`  | Produktivitet         |
| `vaerktoejer`    | Vaerktoejer           |
| `info`           | Info & Underholdning  |

Tilfoej nye kategorier i `CATEGORIES` objektet:

```js
const CATEGORIES = {
  produktivitet: 'Produktivitet',
  vaerktoejer: 'Vaerktoejer',
  info: 'Info & Underholdning',
  // nykategori: 'Ny Kategori'
};
```

---

## Storage API

Alle widgets bruger `storage.js` til at gemme data:

```js
import { get, set } from './storage.js';

// Laes med default-vaerdi
const data = await get('myKey', { count: 0 });

// Gem
await set('myKey', { count: data.count + 1 });
```

**Vigtig**: `storage.js` bruger `chrome.storage.local` naar det er tilgaengeligt, ellers `localStorage`. Alle vaerdier serialiseres som JSON.

### Reserverede storage-noegler

| Noegle                | Bruges af        | Type                      |
|-----------------------|------------------|---------------------------|
| `settings`            | settings.js      | Settings-objekt           |
| `enabledWidgets`      | widgets.js       | string[]                  |
| `widgetConfigs`       | widgets.js       | { [id]: config }          |
| `widgetPositions`     | drag.js          | { [id]: {x: num, y: num}} |
| `quickNote`           | widgets.js       | string                    |
| `widgetTodos`         | widgets.js       | Todo[]                    |
| `habitData`           | widgets.js       | { [dato]: { [vane]: bool}}|
| `timerState`          | widgets.js       | TimerState-objekt         |
| `checklistItems`      | checklist.js     | ChecklistItem[]           |
| `checklistCompletions`| checklist.js     | { [id]: bool }            |
| `checklistDate`       | checklist.js     | string (YYYY-MM-DD)       |
| `tabOpenCount`        | stats.js         | number                    |
| `tabCountDate`        | stats.js         | string (YYYY-MM-DD)       |
| `scrapbookItems`      | scrapbook.js     | ScrapbookItem[]           |
| `quicklinks`          | quicklinks.js    | Quicklink[]               |

---

## Drag-and-Drop

Haandteres automatisk af `drag.js`. Naar `setupDrag(container)` kaldes:

1. Hver `.widget-card` faar en drag-handle (6-prikker ikon)
2. Handles vises paa hover
3. Drag clampes til viewport (8px padding)
4. Positioner gemmes i `widgetPositions`
5. Ved window resize clampes alle widgets automatisk

### API

```js
import { setupDrag, resetPositions } from './drag.js';

// Attach drag til alle widget-cards i container
await setupDrag(container);

// Nulstil alle positioner
await resetPositions(container);
```

---

## Render-kontrakt

En render-funktion skal:

1. **Modtage** `(container, config, widgetId)` — alle tre parametre
2. **Sætte** `container.innerHTML` med widget-indhold
3. **Tilføje** event listeners efter DOM-oprettelse
4. **Være** enten sync eller async (begge understøttes)

```js
// Sync eksempel
function renderSimple(container, config) {
  container.innerHTML = `<div class="widget-body">Hej!</div>`;
}

// Async eksempel (med storage)
async function renderWithData(container, config) {
  const data = await get('myData', []);
  container.innerHTML = `<div class="widget-body">${data.length} elementer</div>`;
}
```

### CSS-konventioner

- Widget body: `.widget-body.widget-NAVN-body`
- Brug eksisterende CSS-variabler: `var(--bg-card)`, `var(--border)`, `var(--accent)`, etc.
- Brug eksisterende border-radius: `var(--radius)`, `var(--radius-sm)`, `var(--radius-xs)`
- Brug font-variabler: `var(--font-display)` (serif), `var(--font-body)` (sans-serif)

---

## Eksisterende widgets

| ID             | Navn                     | Kategori        | Settings |
|----------------|--------------------------|-----------------|----------|
| `quote`        | Dagens citat             | info            | Nej      |
| `timer`        | Fokus Timer              | produktivitet   | Nej      |
| `notepad`      | Hurtige noter            | produktivitet   | Nej      |
| `todolist`     | Huskeliste               | produktivitet   | Nej      |
| `habits`       | Vane Tracker             | produktivitet   | Ja       |
| `bookmarks`    | Bogmaerker               | produktivitet   | Ja       |
| `calculator`   | Lommeregner              | vaerktoejer     | Nej      |
| `unitconverter`| Enhedskonverter          | vaerktoejer     | Nej      |
| `colorpicker`  | Farvepalet               | vaerktoejer     | Nej      |
| `breathe`      | Aandedraet               | vaerktoejer     | Nej      |
| `youtube`      | YouTube                  | info            | Ja       |
| `worldclock`   | Verdensur                | info            | Ja       |
| `countdown`    | Nedtaelling              | info            | Ja       |
| `randomizer`   | Tilfaeldighedsgenerator  | info            | Nej      |

---

## hideChromeCrap — Vigtig arkitektur-note

Chrome injicerer elementer i `document.body` paa nye faner. `main.js` bruger en `MutationObserver` der skjuler alt der ikke er i `OUR_IDS` eller `OUR_CLASSES`.

**Konsekvens**: Hvis din widget appender en overlay/modal til `document.body`, SKAL dens klasse vaere i `OUR_CLASSES`:

```js
// I main.js:
const OUR_CLASSES = new Set([
  // ...eksisterende klasser...
  'min-nye-overlay'  // <-- Tilfoej din overlay-klasse her!
]);
```

Ellers bliver overlayet oejeblikkeligt skjult af observeren.

---

## Tjekliste for nye widgets

- [ ] Widget defineret i `WIDGET_DEFS` med alle felter
- [ ] Render-funktion oprettet og testet
- [ ] Ikon tilfojet til `ICONS`
- [ ] CSS-styles tilfojet til `css/widgets.css`
- [ ] (Hvis settings) Case tilfojet i `showWidgetSettingsModal`
- [ ] (Hvis overlay) Klasse tilfojet til `OUR_CLASSES` i `main.js`
- [ ] Bruger korrekte danske tegn i UI-tekst
- [ ] Storage-noegler dokumenteret i tabellen ovenfor
