import { get, set, getAll, getSyncEnabled, setSyncEnabled } from './storage.js';

export const DEFAULT_SETTINGS = {
  theme: 'dark',
  clockFormat: '24h',
  greeting: true,
  userName: '',
  background: 'default',
  backgroundColor: '#1a1410',
  backgroundOpacity: 0.5,
  backgroundBlur: 0,
  backgroundFit: 'cover',
  layoutPosition: 'top',
  weatherUnit: 'celsius',
  statsPosition: 'below',
  focusMode: false,
  effectType: 'embers',
  effectAmount: 'medium',
  showChecklist: true,
  // Accent & display
  accentColor: '#e09030',
  fontSize: 100,
  autoHideBar: false,
  showSearch: true,
  showQuicklinks: true,
  autoFocusSearch: false,
  // Date
  dateFormat: 'long',           // 'long' = tirsdag den 17. marts 2026, 'short' = 17/3/2026
  // Greeting
  greetingStyle: 'auto',       // 'auto' = time-based, 'custom' = user text
  customGreeting: '',
  // Star-specific settings
  starsShootFreq: 'normal',
  starsDeepSky: true,
  starsTwinkle: 'normal'
};

// Accent color presets
const ACCENT_PRESETS = [
  { name: 'Ember', value: '#e09030' },
  { name: 'Rose', value: '#d4607a' },
  { name: 'Lavendel', value: '#9070d0' },
  { name: 'Hav', value: '#3090c0' },
  { name: 'Smaragd', value: '#40a070' },
  { name: 'Guld', value: '#c8a840' },
  { name: 'Koral', value: '#e06050' },
  { name: 'Himmel', value: '#60a0d8' },
];

export async function initSettings(triggerBtn, panel, liveCallbacks = {}) {
  // Merge stored settings with defaults so new keys always get their default value
  const stored = await get('settings', {});
  let settings = { ...DEFAULT_SETTINGS, ...stored };
  // Persist merged settings back (fills in any missing keys for other modules)
  if (Object.keys(stored).length > 0 && Object.keys(stored).length < Object.keys(DEFAULT_SETTINGS).length) {
    await set('settings', settings);
  }
  // Track sync state separately (not part of the settings object)
  settings._syncEnabled = await getSyncEnabled();
  let isOpen = false;

  function closePanel() {
    isOpen = false;
    panel.classList.remove('open');
  }

  triggerBtn.addEventListener('click', () => {
    isOpen = !isOpen;
    panel.classList.toggle('open', isOpen);
    if (isOpen) render();
  });

  // Close on Escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && isOpen) closePanel();
  });

  // Close on click outside
  document.addEventListener('mousedown', (e) => {
    if (isOpen && !panel.contains(e.target) && e.target !== triggerBtn && !triggerBtn.contains(e.target)) {
      closePanel();
    }
  });

  async function updateSetting(key, value) {
    settings[key] = value;
    await set('settings', settings);
    applySetting(key, value);
  }

  function applySetting(key, value) {
    switch (key) {
      case 'theme':
        if (value === 'light') {
          document.documentElement.setAttribute('data-theme', 'light');
        } else {
          document.documentElement.removeAttribute('data-theme');
        }
        break;
      case 'background':
      case 'backgroundColor':
      case 'backgroundOpacity':
      case 'backgroundBlur':
      case 'backgroundFit':
        applyBackground();
        break;
      case 'layoutPosition':
        applyLayoutPosition();
        break;
      case 'accentColor':
        applyAccent(value);
        break;
      case 'fontSize':
        applyFontSize(value);
        break;
      case 'autoHideBar':
        document.body.classList.toggle('auto-hide-bar', !!value);
        break;
      case 'showSearch':
        { const el = document.getElementById('search-section'); if (el) el.style.display = value ? '' : 'none'; }
        break;
      case 'showQuicklinks':
        { const el = document.getElementById('quicklinks-section'); if (el) el.style.display = value ? '' : 'none'; }
        break;
    }
  }

  function applyAccent(hex) {
    const r = parseInt(hex.slice(1, 3), 16), g = parseInt(hex.slice(3, 5), 16), b = parseInt(hex.slice(5, 7), 16);
    const root = document.documentElement;
    root.style.setProperty('--accent', hex);
    root.style.setProperty('--accent-warm', hex);
    root.style.setProperty('--accent-soft', `rgba(${r}, ${g}, ${b}, 0.12)`);
    root.style.setProperty('--accent-glow', `rgba(${r}, ${g}, ${b}, 0.06)`);
    root.style.setProperty('--glow', `0 0 80px rgba(${r}, ${g}, ${b}, 0.08)`);
    root.style.setProperty('--glow-strong', `0 0 120px rgba(${r}, ${g}, ${b}, 0.15)`);
  }

  function applyFontSize(pct) {
    document.documentElement.style.fontSize = (pct / 100 * 15) + 'px';
  }

  async function applyBackground() {
    const bgLayer = document.getElementById('bg-layer');
    const overlay = document.getElementById('bg-overlay');

    // Reset all inline styles first
    bgLayer.style.cssText = '';
    overlay.style.cssText = '';
    overlay.classList.remove('image-mode');

    if (settings.background === 'solid') {
      bgLayer.style.backgroundColor = settings.backgroundColor;
      bgLayer.style.backgroundImage = 'none';
      overlay.style.display = 'none';
    } else if (settings.background === 'image') {
      const bgImage = await get('backgroundImage', null);
      if (bgImage) {
        const fit = settings.backgroundFit || 'cover';
        bgLayer.style.backgroundImage = `url(${bgImage})`;
        bgLayer.style.backgroundSize = fit;
        bgLayer.style.backgroundPosition = 'center';
        bgLayer.style.backgroundRepeat = 'no-repeat';
        bgLayer.style.backgroundColor = 'var(--bg-primary)';

        // Overlay acts as a controllable veil/blur over the image
        overlay.classList.add('image-mode');
        const opacity = settings.backgroundOpacity ?? 0.5;
        overlay.style.opacity = opacity;
        const blur = settings.backgroundBlur ?? 0;
        if (blur > 0) {
          overlay.style.backdropFilter = `blur(${blur}px)`;
          overlay.style.webkitBackdropFilter = `blur(${blur}px)`;
        }
      }
    }
    // else: default — all inline styles cleared, CSS classes handle it
  }

  function applyLayoutPosition() {
    const content = document.querySelector('.content');
    if (!content) return;
    content.removeAttribute('data-position');
    const pos = settings.layoutPosition || 'top';
    content.setAttribute('data-position', pos);
  }

  function render() {
    panel.innerHTML = `
      <div class="settings-inner">
        <div class="settings-header">
          <h3>Indstillinger</h3>
          <button class="settings-close" title="Luk">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>

        <div class="settings-section">
          <h4>Udseende</h4>

          <div class="settings-row">
            <label>Tema</label>
            <div class="settings-toggle-group">
              <button class="settings-toggle-btn ${settings.theme === 'dark' ? 'active' : ''}" data-theme-val="dark">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/></svg>
                M&oslash;rkt
              </button>
              <button class="settings-toggle-btn ${settings.theme === 'light' ? 'active' : ''}" data-theme-val="light">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>
                Lyst
              </button>
              <button class="settings-toggle-btn ${settings.theme === 'auto' ? 'active' : ''}" data-theme-val="auto">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="5"/><path d="M12 1v2"/><path d="M12 21v2"/><path d="M4.22 4.22l1.42 1.42"/><path d="M18.36 18.36l1.42 1.42"/><path d="M1 12h2"/><path d="M21 12h2"/><path d="M16 12a4 4 0 0 0 6 6 6 6 0 1 1-6-6Z"/></svg>
                Dag-Nat
              </button>
            </div>
            ${settings.theme === 'auto' ? '<p class="settings-hint">Skifter automatisk mellem lyst og m&oslash;rkt tema efter klokkeslaet, med dynamisk sol og m&aring;ne</p>' : ''}
          </div>

          <div class="settings-row settings-row-stack">
            <label>Accentfarve</label>
            <div class="settings-accent-row">
              ${ACCENT_PRESETS.map(p => `<button class="settings-accent-dot ${(settings.accentColor || '#e09030') === p.value ? 'active' : ''}" data-accent="${p.value}" style="background:${p.value}" title="${p.name}"></button>`).join('')}
              <label class="settings-accent-custom" title="Vælg egen farve">
                <input type="color" class="settings-accent-input" value="${settings.accentColor || '#e09030'}" />
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/></svg>
              </label>
            </div>
          </div>

          <div class="settings-row">
            <label>Skriftst&oslash;rrelse</label>
            <div class="settings-range-wrap">
              <input type="range" class="settings-range" data-range="fontSize" min="80" max="130" step="5" value="${settings.fontSize ?? 100}" />
              <span class="settings-range-val" data-val="fontSize">${settings.fontSize ?? 100}%</span>
            </div>
          </div>

          <div class="settings-row">
            <label>Baggrund</label>
            <div class="settings-toggle-group">
              <button class="settings-toggle-btn ${settings.background === 'default' ? 'active' : ''}" data-bg-val="default">Standard</button>
              <button class="settings-toggle-btn ${settings.background === 'solid' ? 'active' : ''}" data-bg-val="solid">Farve</button>
              <button class="settings-toggle-btn ${settings.background === 'image' ? 'active' : ''}" data-bg-val="image">Billede</button>
            </div>
          </div>

          ${settings.background === 'solid' ? `
          <div class="settings-row">
            <label>Baggrundsfarve</label>
            <input type="color" class="settings-color-input" value="${settings.backgroundColor}" />
          </div>
          ` : ''}

          ${settings.background === 'image' ? `
          <div class="settings-row">
            <label>V&aelig;lg billede</label>
            <label class="settings-file-btn" title="Upload baggrundsbillede">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
              Upload
              <input type="file" class="settings-file-input" accept="image/*" style="display:none" />
            </label>
          </div>
          <div class="settings-row">
            <label>Udfyldning</label>
            <div class="settings-toggle-group">
              <button class="settings-toggle-btn ${(settings.backgroundFit || 'cover') === 'cover' ? 'active' : ''}" data-fit-val="cover">Udfyld</button>
              <button class="settings-toggle-btn ${settings.backgroundFit === 'contain' ? 'active' : ''}" data-fit-val="contain">Tilpas</button>
            </div>
          </div>
          <p class="settings-hint">Udfyld d&aelig;kker hele sk&aelig;rmen. Tilpas viser hele billedet.</p>
          <div class="settings-row">
            <label>Sl&oslash;r</label>
            <div class="settings-range-wrap">
              <input type="range" class="settings-range" data-range="blur" min="0" max="30" step="1" value="${settings.backgroundBlur ?? 0}" />
              <span class="settings-range-val" data-val="blur">${settings.backgroundBlur ?? 0}px</span>
            </div>
          </div>
          <div class="settings-row">
            <label>M&oslash;rkne</label>
            <div class="settings-range-wrap">
              <input type="range" class="settings-range" data-range="opacity" min="0" max="1" step="0.05" value="${settings.backgroundOpacity ?? 0.5}" />
              <span class="settings-range-val" data-val="opacity">${Math.round((settings.backgroundOpacity ?? 0.5) * 100)}%</span>
            </div>
          </div>
          <p class="settings-hint">Sl&oslash;r g&oslash;r billedet frostet. M&oslash;rkne l&aelig;gger et farvet overlay hen over.</p>
          ` : ''}
        </div>

        <div class="settings-section">
          <h4>Ur & Vejr</h4>

          <div class="settings-row">
            <label>Urformat</label>
            <div class="settings-toggle-group">
              <button class="settings-toggle-btn ${settings.clockFormat === '24h' ? 'active' : ''}" data-clock-val="24h">24h</button>
              <button class="settings-toggle-btn ${settings.clockFormat === '12h' ? 'active' : ''}" data-clock-val="12h">12h</button>
            </div>
          </div>

          <div class="settings-row">
            <label>Vis hilsen</label>
            <button class="settings-checkbox ${settings.greeting ? 'checked' : ''}" data-setting="greeting">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
            </button>
          </div>

          <div class="settings-row">
            <label>Datoformat</label>
            <div class="settings-toggle-group">
              <button class="settings-toggle-btn ${(settings.dateFormat || 'long') === 'long' ? 'active' : ''}" data-date-val="long">Lang</button>
              <button class="settings-toggle-btn ${settings.dateFormat === 'short' ? 'active' : ''}" data-date-val="short">Kort</button>
            </div>
          </div>
          <p class="settings-hint">Lang: tirsdag den 17. marts &mdash; Kort: 17/3/2026</p>

          <div class="settings-row">
            <label>Vejrenhed</label>
            <div class="settings-toggle-group">
              <button class="settings-toggle-btn ${settings.weatherUnit === 'celsius' ? 'active' : ''}" data-weather-val="celsius">&deg;C</button>
              <button class="settings-toggle-btn ${settings.weatherUnit === 'fahrenheit' ? 'active' : ''}" data-weather-val="fahrenheit">&deg;F</button>
            </div>
          </div>
        </div>

        <div class="settings-section">
          <h4>Personligt</h4>

          <div class="settings-row">
            <label>Dit navn</label>
            <input type="text" class="settings-text-input" value="${settings.userName}" placeholder="Til hilsenen..." maxlength="20" />
          </div>

          <div class="settings-row">
            <label>Hilsen</label>
            <div class="settings-toggle-group">
              <button class="settings-toggle-btn ${(settings.greetingStyle || 'auto') === 'auto' ? 'active' : ''}" data-greet-val="auto">Automatisk</button>
              <button class="settings-toggle-btn ${settings.greetingStyle === 'custom' ? 'active' : ''}" data-greet-val="custom">Egen tekst</button>
            </div>
          </div>
          ${settings.greetingStyle === 'custom' ? `
          <div class="settings-row">
            <label>Egen hilsen</label>
            <input type="text" class="settings-text-input settings-custom-greeting" value="${settings.customGreeting || ''}" placeholder="F.eks. Hej med dig" maxlength="40" />
          </div>
          <p class="settings-hint">Brug {navn} for dit navn, f.eks. "Hej {navn}"</p>
          ` : ''}
          <p class="settings-hint">Automatisk skifter mellem god morgen, god eftermiddag, god aften og god nat</p>
        </div>

        <div class="settings-section">
          <h4>Visning</h4>

          <div class="settings-row">
            <label>Fokus tilstand</label>
            <button class="settings-checkbox ${settings.focusMode ? 'checked' : ''}" data-setting="focusMode">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
            </button>
          </div>
          <p class="settings-hint">Viser kun klokke, hilsen og dato</p>

          <div class="settings-row">
            <label>Placering</label>
            <div class="settings-toggle-group">
              <button class="settings-toggle-btn ${(settings.layoutPosition || 'top') === 'top' ? 'active' : ''}" data-pos-val="top">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><line x1="4" y1="4" x2="20" y2="4"/><line x1="8" y1="9" x2="16" y2="9"/><line x1="10" y1="14" x2="14" y2="14"/></svg>
                Top
              </button>
              <button class="settings-toggle-btn ${settings.layoutPosition === 'center' ? 'active' : ''}" data-pos-val="center">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><line x1="8" y1="8" x2="16" y2="8"/><line x1="4" y1="12" x2="20" y2="12"/><line x1="8" y1="16" x2="16" y2="16"/></svg>
                Midt
              </button>
              <button class="settings-toggle-btn ${settings.layoutPosition === 'bottom' ? 'active' : ''}" data-pos-val="bottom">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><line x1="10" y1="10" x2="14" y2="10"/><line x1="8" y1="15" x2="16" y2="15"/><line x1="4" y1="20" x2="20" y2="20"/></svg>
                Bund
              </button>
            </div>
          </div>
          <p class="settings-hint">Bestemmer hvor indholdet placeres p&aring; sk&aelig;rmen</p>
        </div>

        <div class="settings-section">
          <h4>Sektioner</h4>

          <div class="settings-row">
            <label>Statistik placering</label>
            <select class="settings-select" id="stats-position-select">
              <option value="above" ${settings.statsPosition === 'above' ? 'selected' : ''}>Over s&oslash;gning</option>
              <option value="below" ${(!settings.statsPosition || settings.statsPosition === 'below' || settings.statsPosition === 'content') ? 'selected' : ''}>Under s&oslash;gning</option>
              <option value="topbar" ${settings.statsPosition === 'topbar' ? 'selected' : ''}>Topbar</option>
            </select>
          </div>

          <div class="settings-row">
            <label>Daglig tjekliste</label>
            <button class="settings-checkbox ${settings.showChecklist !== false ? 'checked' : ''}" data-setting="showChecklist">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
            </button>
          </div>
          <p class="settings-hint">Vis/skjul den daglige tjekliste</p>

          <div class="settings-row">
            <label>S&oslash;gebar</label>
            <button class="settings-checkbox ${settings.showSearch !== false ? 'checked' : ''}" data-setting="showSearch">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
            </button>
          </div>

          <div class="settings-row">
            <label>Auto-fokus s&oslash;gebar</label>
            <button class="settings-checkbox ${settings.autoFocusSearch ? 'checked' : ''}" data-setting="autoFocusSearch">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
            </button>
          </div>
          <p class="settings-hint">Fokuserer automatisk s&oslash;gefeltet n&aring;r en ny fane &aring;bnes</p>

          <div class="settings-row">
            <label>Genveje</label>
            <button class="settings-checkbox ${settings.showQuicklinks !== false ? 'checked' : ''}" data-setting="showQuicklinks">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
            </button>
          </div>

          <div class="settings-row">
            <label>Autoskjul topbar</label>
            <button class="settings-checkbox ${settings.autoHideBar ? 'checked' : ''}" data-setting="autoHideBar">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
            </button>
          </div>
          <p class="settings-hint">Topbar skjules automatisk og vises n&aring;r musen n&aelig;rmer sig</p>
        </div>

        <div class="settings-section">
          <h4>Effekter</h4>

          <div class="settings-row settings-row-stack">
            <label>Type</label>
            <div class="settings-toggle-group">
              <button class="settings-toggle-btn ${settings.effectType === 'embers' ? 'active' : ''}" data-effect-val="embers">Gl&oslash;der</button>
              <button class="settings-toggle-btn ${settings.effectType === 'regn' ? 'active' : ''}" data-effect-val="regn">Regn</button>
              <button class="settings-toggle-btn ${settings.effectType === 'vind' ? 'active' : ''}" data-effect-val="vind">Vind</button>
              <button class="settings-toggle-btn ${settings.effectType === 'sne' ? 'active' : ''}" data-effect-val="sne">Sne</button>
              <button class="settings-toggle-btn ${settings.effectType === 'ildfluer' ? 'active' : ''}" data-effect-val="ildfluer">Ildfluer</button>
              <button class="settings-toggle-btn ${settings.effectType === 'stjerner' ? 'active' : ''}" data-effect-val="stjerner">Stjerner</button>
              <button class="settings-toggle-btn ${settings.effectType === 'ingen' ? 'active' : ''}" data-effect-val="ingen">Ingen</button>
            </div>
          </div>

          <div class="settings-row">
            <label>Mængde</label>
            <div class="settings-toggle-group">
              <button class="settings-toggle-btn ${settings.effectAmount === 'lav' ? 'active' : ''}" data-amount-val="lav">Lav</button>
              <button class="settings-toggle-btn ${settings.effectAmount === 'medium' ? 'active' : ''}" data-amount-val="medium">Medium</button>
              <button class="settings-toggle-btn ${settings.effectAmount === 'høj' ? 'active' : ''}" data-amount-val="høj">Høj</button>
            </div>
          </div>

          ${settings.effectType === 'stjerner' ? `
          <div class="settings-row">
            <label>Stjerneskud</label>
            <div class="settings-toggle-group">
              <button class="settings-toggle-btn ${settings.starsShootFreq === 'ingen' ? 'active' : ''}" data-shoot-val="ingen">Ingen</button>
              <button class="settings-toggle-btn ${settings.starsShootFreq === 'sjælden' ? 'active' : ''}" data-shoot-val="sjælden">Sjælden</button>
              <button class="settings-toggle-btn ${(settings.starsShootFreq || 'normal') === 'normal' ? 'active' : ''}" data-shoot-val="normal">Normal</button>
              <button class="settings-toggle-btn ${settings.starsShootFreq === 'hyppig' ? 'active' : ''}" data-shoot-val="hyppig">Hyppig</button>
            </div>
          </div>

          <div class="settings-row">
            <label>Blinken</label>
            <div class="settings-toggle-group">
              <button class="settings-toggle-btn ${settings.starsTwinkle === 'rolig' ? 'active' : ''}" data-twinkle-val="rolig">Rolig</button>
              <button class="settings-toggle-btn ${(settings.starsTwinkle || 'normal') === 'normal' ? 'active' : ''}" data-twinkle-val="normal">Normal</button>
              <button class="settings-toggle-btn ${settings.starsTwinkle === 'intens' ? 'active' : ''}" data-twinkle-val="intens">Intens</button>
            </div>
          </div>

          <div class="settings-row">
            <label>Dybhimmel</label>
            <button class="settings-checkbox ${settings.starsDeepSky !== false ? 'checked' : ''}" data-setting="starsDeepSky">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
            </button>
          </div>
          <p class="settings-hint">Galakse og tåger i baggrunden</p>
          ` : ''}
        </div>

        <div class="settings-section">
          <h4>Synkronisering</h4>

          <div class="settings-row">
            <label>Synkroniser p&aring; tv&aelig;rs af enheder</label>
            <button class="settings-checkbox ${settings._syncEnabled ? 'checked' : ''}" data-setting="syncEnabled">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
            </button>
          </div>
          <p class="settings-hint">Synkroniserer dine indstillinger, genveje, tjekliste, scrapbook og widgets via din Google-konto.</p>
          <p class="settings-hint" style="opacity:0.6"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align: -1px; margin-right: 3px;"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>Baggrundsbilleder synkroniseres <strong>ikke</strong> (for store til Chrome Sync).</p>
        </div>

        <div class="settings-section">
          <h4>Data</h4>
          <div class="settings-row">
            <label>Eksporter indstillinger</label>
            <button class="settings-action-btn" id="settings-export">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
              Eksporter
            </button>
          </div>
          <div class="settings-row">
            <label>Importer indstillinger</label>
            <label class="settings-action-btn" id="settings-import-label">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
              Importer
              <input type="file" id="settings-import" accept=".json" style="display:none" />
            </label>
          </div>
          <p class="settings-hint">Eksporter/importer alle indstillinger, genveje, tjekliste og scrapbook som JSON.</p>

          <div class="settings-row">
            <label>Nulstil alt</label>
            <button class="settings-action-btn settings-action-btn-danger" id="settings-reset">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
              Nulstil
            </button>
          </div>
          <p class="settings-hint">Sletter alle data og nulstiller til standard. Kan ikke fortrydes.</p>
        </div>

        <div class="settings-footer">
          <span class="settings-version">Lanterne v0.9.9</span>
        </div>
      </div>
    `;

    // Event listeners
    panel.querySelector('.settings-close').addEventListener('click', closePanel);

    // Theme toggles — live switch without reload
    panel.querySelectorAll('[data-theme-val]').forEach(btn => {
      btn.addEventListener('click', () => {
        updateSetting('theme', btn.dataset.themeVal).then(() => {
          if (liveCallbacks.onThemeChange) liveCallbacks.onThemeChange(settings.theme);
          render();
        });
      });
    });

    // Background toggles
    panel.querySelectorAll('[data-bg-val]').forEach(btn => {
      btn.addEventListener('click', () => updateSetting('background', btn.dataset.bgVal).then(render));
    });

    // Background color
    const colorInput = panel.querySelector('.settings-color-input');
    if (colorInput) {
      colorInput.addEventListener('input', (e) => updateSetting('backgroundColor', e.target.value));
    }

    // Background image upload
    const fileInput = panel.querySelector('.settings-file-input');
    if (fileInput) {
      fileInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (!file || !file.type.startsWith('image/')) return;
        const reader = new FileReader();
        reader.onload = async () => {
          await set('backgroundImage', reader.result);
          applyBackground();
        };
        reader.readAsDataURL(file);
      });
    }

    // Background fit toggle
    panel.querySelectorAll('[data-fit-val]').forEach(btn => {
      btn.addEventListener('click', () => updateSetting('backgroundFit', btn.dataset.fitVal).then(render));
    });

    // Background blur slider
    const blurRange = panel.querySelector('[data-range="blur"]');
    if (blurRange) {
      const blurVal = panel.querySelector('[data-val="blur"]');
      blurRange.addEventListener('input', (e) => {
        const val = parseInt(e.target.value, 10);
        if (blurVal) blurVal.textContent = val + 'px';
        updateSetting('backgroundBlur', val);
      });
    }

    // Background opacity slider
    const opacityRange = panel.querySelector('[data-range="opacity"]');
    if (opacityRange) {
      const opacityVal = panel.querySelector('[data-val="opacity"]');
      opacityRange.addEventListener('input', (e) => {
        const val = parseFloat(e.target.value);
        if (opacityVal) opacityVal.textContent = Math.round(val * 100) + '%';
        updateSetting('backgroundOpacity', val);
      });
    }

    // Date format toggle — live
    panel.querySelectorAll('[data-date-val]').forEach(btn => {
      btn.addEventListener('click', () => {
        updateSetting('dateFormat', btn.dataset.dateVal).then(() => {
          if (liveCallbacks.onClockChange) liveCallbacks.onClockChange(settings);
          render();
        });
      });
    });

    // Auto-focus search toggle
    const autoFocusBtn = panel.querySelector('[data-setting="autoFocusSearch"]');
    if (autoFocusBtn) {
      autoFocusBtn.addEventListener('click', () => {
        updateSetting('autoFocusSearch', !settings.autoFocusSearch).then(render);
      });
    }

    // Clock format — live
    panel.querySelectorAll('[data-clock-val]').forEach(btn => {
      btn.addEventListener('click', () => {
        updateSetting('clockFormat', btn.dataset.clockVal).then(() => {
          if (liveCallbacks.onClockChange) liveCallbacks.onClockChange(settings);
          render();
        });
      });
    });

    // Weather unit — live
    panel.querySelectorAll('[data-weather-val]').forEach(btn => {
      btn.addEventListener('click', () => {
        updateSetting('weatherUnit', btn.dataset.weatherVal).then(() => {
          if (liveCallbacks.onWeatherChange) liveCallbacks.onWeatherChange(settings);
          render();
        });
      });
    });

    // Greeting toggle — live
    const greetingBtn = panel.querySelector('[data-setting="greeting"]');
    if (greetingBtn) {
      greetingBtn.addEventListener('click', () => {
        updateSetting('greeting', !settings.greeting).then(() => {
          const greetEl = document.getElementById('greeting');
          if (greetEl) greetEl.style.display = settings.greeting ? '' : 'none';
          render();
        });
      });
    }

    // Focus mode toggle — live
    const focusModeBtn = panel.querySelector('[data-setting="focusMode"]');
    if (focusModeBtn) {
      focusModeBtn.addEventListener('click', () => {
        updateSetting('focusMode', !settings.focusMode).then(() => {
          document.body.classList.toggle('focus-mode', settings.focusMode);
          const focusToggle = document.getElementById('focus-toggle');
          if (focusToggle) focusToggle.classList.toggle('active', settings.focusMode);
          render();
        });
      });
    }

    // Layout position toggle
    panel.querySelectorAll('[data-pos-val]').forEach(btn => {
      btn.addEventListener('click', () => {
        updateSetting('layoutPosition', btn.dataset.posVal).then(render);
      });
    });

    // Checklist toggle — live
    const checklistBtn = panel.querySelector('[data-setting="showChecklist"]');
    if (checklistBtn) {
      checklistBtn.addEventListener('click', () => {
        const newVal = settings.showChecklist === false ? true : false;
        updateSetting('showChecklist', newVal).then(() => {
          const el = document.getElementById('checklist-section');
          if (el) el.style.display = newVal ? '' : 'none';
          render();
        });
      });
    }

    // Effect type — live reinit
    panel.querySelectorAll('[data-effect-val]').forEach(btn => {
      btn.addEventListener('click', () => {
        updateSetting('effectType', btn.dataset.effectVal).then(() => {
          if (liveCallbacks.onEffectChange) liveCallbacks.onEffectChange(settings);
          render();
        });
      });
    });

    // Effect amount — live reinit
    panel.querySelectorAll('[data-amount-val]').forEach(btn => {
      btn.addEventListener('click', () => {
        updateSetting('effectAmount', btn.dataset.amountVal).then(() => {
          if (liveCallbacks.onEffectChange) liveCallbacks.onEffectChange(settings);
          render();
        });
      });
    });

    // Star-specific: shooting star frequency — live reinit
    panel.querySelectorAll('[data-shoot-val]').forEach(btn => {
      btn.addEventListener('click', () => {
        updateSetting('starsShootFreq', btn.dataset.shootVal).then(() => {
          if (liveCallbacks.onEffectChange) liveCallbacks.onEffectChange(settings);
          render();
        });
      });
    });

    // Star-specific: twinkle intensity — live reinit
    panel.querySelectorAll('[data-twinkle-val]').forEach(btn => {
      btn.addEventListener('click', () => {
        updateSetting('starsTwinkle', btn.dataset.twinkleVal).then(() => {
          if (liveCallbacks.onEffectChange) liveCallbacks.onEffectChange(settings);
          render();
        });
      });
    });

    // Star-specific: deep sky toggle — live reinit
    const deepSkyBtn = panel.querySelector('[data-setting="starsDeepSky"]');
    if (deepSkyBtn) {
      deepSkyBtn.addEventListener('click', () => {
        const newVal = settings.starsDeepSky === false ? true : false;
        updateSetting('starsDeepSky', newVal).then(() => {
          if (liveCallbacks.onEffectChange) liveCallbacks.onEffectChange(settings);
          render();
        });
      });
    }

    // Stats position — live
    const statsSelect = panel.querySelector('#stats-position-select');
    if (statsSelect) {
      statsSelect.addEventListener('change', () => {
        updateSetting('statsPosition', statsSelect.value).then(() => {
          if (liveCallbacks.onStatsChange) liveCallbacks.onStatsChange(settings);
          render();
        });
      });
    }

    // Name input (debounced while typing, immediate on blur for tab-close safety)
    const nameInput = panel.querySelector('.settings-text-input');
    if (nameInput) {
      let debounce;
      nameInput.addEventListener('input', (e) => {
        clearTimeout(debounce);
        debounce = setTimeout(() => {
          updateSetting('userName', e.target.value.trim());
        }, 500);
      });
      nameInput.addEventListener('blur', (e) => {
        clearTimeout(debounce);
        updateSetting('userName', e.target.value.trim());
      });
    }

    // Greeting style toggle
    panel.querySelectorAll('[data-greet-val]').forEach(btn => {
      btn.addEventListener('click', () => {
        updateSetting('greetingStyle', btn.dataset.greetVal).then(() => {
          if (liveCallbacks.onClockChange) liveCallbacks.onClockChange(settings);
          render();
        });
      });
    });

    // Custom greeting input
    const customGreetInput = panel.querySelector('.settings-custom-greeting');
    if (customGreetInput) {
      let debounceGreet;
      customGreetInput.addEventListener('input', (e) => {
        clearTimeout(debounceGreet);
        debounceGreet = setTimeout(() => {
          updateSetting('customGreeting', e.target.value.trim()).then(() => {
            if (liveCallbacks.onClockChange) liveCallbacks.onClockChange(settings);
          });
        }, 400);
      });
      customGreetInput.addEventListener('blur', (e) => {
        clearTimeout(debounceGreet);
        updateSetting('customGreeting', e.target.value.trim()).then(() => {
          if (liveCallbacks.onClockChange) liveCallbacks.onClockChange(settings);
        });
      });
    }

    // Accent color presets
    panel.querySelectorAll('[data-accent]').forEach(btn => {
      btn.addEventListener('click', () => {
        updateSetting('accentColor', btn.dataset.accent).then(render);
      });
    });

    // Accent custom color picker
    const accentInput = panel.querySelector('.settings-accent-input');
    if (accentInput) {
      accentInput.addEventListener('input', (e) => {
        updateSetting('accentColor', e.target.value);
      });
      accentInput.addEventListener('change', render);
    }

    // Font size slider
    const fontRange = panel.querySelector('[data-range="fontSize"]');
    if (fontRange) {
      const fontVal = panel.querySelector('[data-val="fontSize"]');
      fontRange.addEventListener('input', (e) => {
        const val = parseInt(e.target.value, 10);
        if (fontVal) fontVal.textContent = val + '%';
        updateSetting('fontSize', val);
      });
    }

    // Search toggle
    const searchBtn = panel.querySelector('[data-setting="showSearch"]');
    if (searchBtn) {
      searchBtn.addEventListener('click', () => {
        updateSetting('showSearch', settings.showSearch === false ? true : false).then(render);
      });
    }

    // Quicklinks toggle
    const qlBtn = panel.querySelector('[data-setting="showQuicklinks"]');
    if (qlBtn) {
      qlBtn.addEventListener('click', () => {
        updateSetting('showQuicklinks', settings.showQuicklinks === false ? true : false).then(render);
      });
    }

    // Auto-hide bar toggle
    const barBtn = panel.querySelector('[data-setting="autoHideBar"]');
    if (barBtn) {
      barBtn.addEventListener('click', () => {
        updateSetting('autoHideBar', !settings.autoHideBar).then(render);
      });
    }

    // Sync toggle
    const syncBtn = panel.querySelector('[data-setting="syncEnabled"]');
    if (syncBtn) {
      syncBtn.addEventListener('click', async () => {
        const newVal = !settings._syncEnabled;
        await setSyncEnabled(newVal);
        settings._syncEnabled = newVal;
        render();
      });
    }

    // Export settings
    const exportBtn = panel.querySelector('#settings-export');
    if (exportBtn) {
      exportBtn.addEventListener('click', async () => {
        const allData = await getAll();
        // Remove ephemeral/large keys
        delete allData.backgroundImage;
        delete allData.weatherCache;
        const blob = new Blob([JSON.stringify(allData, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `lanterne-backup-${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        URL.revokeObjectURL(url);
      });
    }

    // Import settings
    const importInput = panel.querySelector('#settings-import');
    if (importInput) {
      importInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = async () => {
          try {
            const data = JSON.parse(reader.result);
            if (typeof data !== 'object' || data === null) throw new Error('Ugyldigt format');
            for (const [k, v] of Object.entries(data)) {
              if (k === 'backgroundImage') continue; // Skip large data
              await set(k, v);
            }
            location.reload();
          } catch (err) {
            alert('Kunne ikke importere: ' + err.message);
          }
        };
        reader.readAsText(file);
      });
    }

    // Reset all
    const resetBtn = panel.querySelector('#settings-reset');
    if (resetBtn) {
      resetBtn.addEventListener('click', async () => {
        if (!confirm('Er du sikker? Dette sletter ALLE dine indstillinger, genveje, tjekliste og scrapbook. Kan ikke fortrydes.')) return;
        if (!confirm('Helt sikker? Der er ingen vej tilbage.')) return;
        if (typeof chrome !== 'undefined' && chrome.storage) {
          await new Promise(r => chrome.storage.local.clear(r));
          await new Promise(r => chrome.storage.sync.clear(r));
        } else {
          localStorage.clear();
        }
        location.reload();
      });
    }
  }

  // Apply initial settings
  applyBackground();
  applyLayoutPosition();
  if (settings.accentColor && settings.accentColor !== '#e09030') applyAccent(settings.accentColor);
  if (settings.fontSize && settings.fontSize !== 100) applyFontSize(settings.fontSize);
  if (settings.autoHideBar) document.body.classList.add('auto-hide-bar');
  if (settings.showSearch === false) { const el = document.getElementById('search-section'); if (el) el.style.display = 'none'; }
  if (settings.showQuicklinks === false) { const el = document.getElementById('quicklinks-section'); if (el) el.style.display = 'none'; }
}
