import { get, set } from './storage.js';

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
  searchEngine: 'google',
  statsPosition: 'below',
  focusMode: false,
  effectType: 'embers',
  effectAmount: 'medium',
  showChecklist: true,
  // Star-specific settings
  starsShootFreq: 'normal',
  starsDeepSky: true,
  starsTwinkle: 'normal'
};

export async function initSettings(triggerBtn, panel) {
  // Merge stored settings with defaults so new keys always get their default value
  const stored = await get('settings', {});
  let settings = { ...DEFAULT_SETTINGS, ...stored };
  // Persist merged settings back (fills in any missing keys for other modules)
  if (Object.keys(stored).length > 0 && Object.keys(stored).length < Object.keys(DEFAULT_SETTINGS).length) {
    await set('settings', settings);
  }
  let isOpen = false;

  triggerBtn.addEventListener('click', () => {
    isOpen = !isOpen;
    panel.classList.toggle('open', isOpen);
    if (isOpen) render();
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
    }
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
            <label>Vejrenhed</label>
            <div class="settings-toggle-group">
              <button class="settings-toggle-btn ${settings.weatherUnit === 'celsius' ? 'active' : ''}" data-weather-val="celsius">&deg;C</button>
              <button class="settings-toggle-btn ${settings.weatherUnit === 'fahrenheit' ? 'active' : ''}" data-weather-val="fahrenheit">&deg;F</button>
            </div>
          </div>
        </div>

        <div class="settings-section">
          <h4>S&oslash;gning</h4>

          <div class="settings-row settings-row-stack">
            <label>S&oslash;gemaskine</label>
            <div class="settings-toggle-group">
              <button class="settings-toggle-btn ${(settings.searchEngine || 'google') === 'google' ? 'active' : ''}" data-search-val="google">Google</button>
              <button class="settings-toggle-btn ${settings.searchEngine === 'duckduckgo' ? 'active' : ''}" data-search-val="duckduckgo">DuckDuckGo</button>
              <button class="settings-toggle-btn ${settings.searchEngine === 'brave' ? 'active' : ''}" data-search-val="brave">Brave</button>
            </div>
            <div class="settings-toggle-group" style="margin-top:0.3rem;">
              <button class="settings-toggle-btn ${settings.searchEngine === 'startpage' ? 'active' : ''}" data-search-val="startpage">Startpage</button>
              <button class="settings-toggle-btn ${settings.searchEngine === 'youtube' ? 'active' : ''}" data-search-val="youtube">YouTube</button>
              <button class="settings-toggle-btn ${settings.searchEngine === 'wikipedia' ? 'active' : ''}" data-search-val="wikipedia">Wikipedia</button>
            </div>
          </div>
        </div>

        <div class="settings-section">
          <h4>Personligt</h4>

          <div class="settings-row">
            <label>Dit navn</label>
            <input type="text" class="settings-text-input" value="${settings.userName}" placeholder="Til hilsenen..." maxlength="20" />
          </div>
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

        <div class="settings-footer">
          <span class="settings-version">Lanterne v0.7.0</span>
        </div>
      </div>
    `;

    // Event listeners
    panel.querySelector('.settings-close').addEventListener('click', () => {
      isOpen = false;
      panel.classList.remove('open');
    });

    // Theme toggles
    panel.querySelectorAll('[data-theme-val]').forEach(btn => {
      btn.addEventListener('click', () => updateSetting('theme', btn.dataset.themeVal).then(() => location.reload()));
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

    // Clock format
    panel.querySelectorAll('[data-clock-val]').forEach(btn => {
      btn.addEventListener('click', () => {
        updateSetting('clockFormat', btn.dataset.clockVal).then(() => {
          location.reload();
        });
      });
    });

    // Weather unit
    panel.querySelectorAll('[data-weather-val]').forEach(btn => {
      btn.addEventListener('click', () => {
        updateSetting('weatherUnit', btn.dataset.weatherVal).then(() => {
          location.reload();
        });
      });
    });

    // Greeting toggle
    const greetingBtn = panel.querySelector('[data-setting="greeting"]');
    if (greetingBtn) {
      greetingBtn.addEventListener('click', () => {
        updateSetting('greeting', !settings.greeting).then(() => location.reload());
      });
    }

    // Focus mode toggle
    const focusModeBtn = panel.querySelector('[data-setting="focusMode"]');
    if (focusModeBtn) {
      focusModeBtn.addEventListener('click', () => {
        updateSetting('focusMode', !settings.focusMode).then(() => location.reload());
      });
    }

    // Layout position toggle
    panel.querySelectorAll('[data-pos-val]').forEach(btn => {
      btn.addEventListener('click', () => {
        updateSetting('layoutPosition', btn.dataset.posVal).then(render);
      });
    });

    // Checklist toggle
    const checklistBtn = panel.querySelector('[data-setting="showChecklist"]');
    if (checklistBtn) {
      checklistBtn.addEventListener('click', () => {
        const newVal = settings.showChecklist === false ? true : false;
        updateSetting('showChecklist', newVal).then(() => location.reload());
      });
    }

    // Effect type
    panel.querySelectorAll('[data-effect-val]').forEach(btn => {
      btn.addEventListener('click', () => {
        updateSetting('effectType', btn.dataset.effectVal).then(() => location.reload());
      });
    });

    // Effect amount
    panel.querySelectorAll('[data-amount-val]').forEach(btn => {
      btn.addEventListener('click', () => {
        updateSetting('effectAmount', btn.dataset.amountVal).then(() => location.reload());
      });
    });

    // Star-specific: shooting star frequency
    panel.querySelectorAll('[data-shoot-val]').forEach(btn => {
      btn.addEventListener('click', () => {
        updateSetting('starsShootFreq', btn.dataset.shootVal).then(() => location.reload());
      });
    });

    // Star-specific: twinkle intensity
    panel.querySelectorAll('[data-twinkle-val]').forEach(btn => {
      btn.addEventListener('click', () => {
        updateSetting('starsTwinkle', btn.dataset.twinkleVal).then(() => location.reload());
      });
    });

    // Star-specific: deep sky toggle
    const deepSkyBtn = panel.querySelector('[data-setting="starsDeepSky"]');
    if (deepSkyBtn) {
      deepSkyBtn.addEventListener('click', () => {
        const newVal = settings.starsDeepSky === false ? true : false;
        updateSetting('starsDeepSky', newVal).then(() => location.reload());
      });
    }

    // Stats position
    const statsSelect = panel.querySelector('#stats-position-select');
    if (statsSelect) {
      statsSelect.addEventListener('change', () => {
        updateSetting('statsPosition', statsSelect.value).then(() => location.reload());
      });
    }

    // Search engine
    panel.querySelectorAll('[data-search-val]').forEach(btn => {
      btn.addEventListener('click', () => {
        updateSetting('searchEngine', btn.dataset.searchVal).then(() => location.reload());
      });
    });

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
  }

  // Apply initial settings
  applyBackground();
  applyLayoutPosition();
}
