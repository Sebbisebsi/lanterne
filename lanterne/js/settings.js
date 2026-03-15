import { get, set } from './storage.js';

const DEFAULT_SETTINGS = {
  theme: 'dark',
  clockFormat: '24h',
  greeting: true,
  userName: '',
  background: 'default',
  backgroundColor: '#1a1410',
  weatherUnit: 'celsius'
};

export async function initSettings(triggerBtn, panel) {
  let settings = await get('settings', DEFAULT_SETTINGS);
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
        applyBackground();
        break;
    }
  }

  function applyBackground() {
    const bgLayer = document.getElementById('bg-layer');
    const overlay = document.getElementById('bg-overlay');

    if (settings.background === 'solid') {
      bgLayer.style.background = settings.backgroundColor;
      bgLayer.style.backgroundImage = 'none';
      overlay.style.display = 'none';
    } else {
      // Default: warm gradient
      bgLayer.style.background = '';
      bgLayer.style.backgroundImage = '';
      overlay.style.display = '';
    }
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
            </div>
          </div>

          <div class="settings-row">
            <label>Baggrund</label>
            <div class="settings-toggle-group">
              <button class="settings-toggle-btn ${settings.background === 'default' ? 'active' : ''}" data-bg-val="default">Standard</button>
              <button class="settings-toggle-btn ${settings.background === 'solid' ? 'active' : ''}" data-bg-val="solid">Farve</button>
            </div>
          </div>

          ${settings.background === 'solid' ? `
          <div class="settings-row">
            <label>Baggrundsfarve</label>
            <input type="color" class="settings-color-input" value="${settings.backgroundColor}" />
          </div>
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
          <h4>Personligt</h4>

          <div class="settings-row">
            <label>Dit navn</label>
            <input type="text" class="settings-text-input" value="${settings.userName}" placeholder="Til hilsenen..." maxlength="20" />
          </div>
        </div>

        <div class="settings-footer">
          <span class="settings-version">Lanterne v0.1.0</span>
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
      btn.addEventListener('click', () => updateSetting('theme', btn.dataset.themeVal).then(render));
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

    // Name input
    const nameInput = panel.querySelector('.settings-text-input');
    if (nameInput) {
      let debounce;
      nameInput.addEventListener('input', (e) => {
        clearTimeout(debounce);
        debounce = setTimeout(() => {
          updateSetting('userName', e.target.value.trim());
        }, 500);
      });
    }
  }

  // Apply initial settings
  applyBackground();
}
