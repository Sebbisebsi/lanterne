import { get, set, escapeHTML } from './storage.js';

export async function initWelcome() {
  const done = await get('welcomeDone', false);
  if (done) return;

  const overlay = document.createElement('div');
  overlay.className = 'welcome-overlay';

  // State
  let currentStep = 0;
  let userName = '';
  let theme = 'dark';
  let clockFormat = '24h';
  let searchEngine = 'google';
  let effectType = 'embers';
  let layoutPos = 'top';
  let weatherUnit = 'celsius';

  const steps = [
    // 0: Welcome
    {
      render: () => `
        <div class="welcome-icon">&#128294;</div>
        <h1 class="welcome-title">Velkommen til Lanterne</h1>
        <p class="welcome-desc">Din personlige ny fane-side. Lad os hurtigt sætte det op.</p>
        <button class="welcome-btn welcome-btn-primary" data-action="next">Kom i gang</button>
      `,
      save: () => {}
    },
    // 1: Name
    {
      render: () => `
        <h2 class="welcome-step-title">Hvad hedder du?</h2>
        <p class="welcome-desc">Bruges til hilsenen på forsiden.</p>
        <input type="text" class="welcome-input" id="welcome-name" placeholder="Dit navn" autocomplete="off" spellcheck="false">
        <div class="welcome-btns">
          <button class="welcome-btn welcome-btn-secondary" data-action="back">Tilbage</button>
          <button class="welcome-btn welcome-btn-primary" data-action="next">Næste</button>
        </div>
      `,
      save: () => {
        const input = overlay.querySelector('#welcome-name');
        userName = input ? input.value.trim() : '';
      }
    },
    // 2: Theme
    {
      render: () => `
        <h2 class="welcome-step-title">Vælg tema</h2>
        <p class="welcome-desc">Du kan altid ændre det senere i indstillinger.</p>
        <div class="welcome-options welcome-options-3">
          <button class="welcome-option ${theme === 'dark' ? 'selected' : ''}" data-value="dark">
            <span class="welcome-option-big">&#127769;</span>
            <span class="welcome-option-label">Mørkt</span>
          </button>
          <button class="welcome-option ${theme === 'light' ? 'selected' : ''}" data-value="light">
            <span class="welcome-option-big">&#9728;&#65039;</span>
            <span class="welcome-option-label">Lyst</span>
          </button>
          <button class="welcome-option ${theme === 'auto' ? 'selected' : ''}" data-value="auto">
            <span class="welcome-option-big">&#127763;</span>
            <span class="welcome-option-label">Dag/Nat</span>
          </button>
        </div>
        <div class="welcome-btns">
          <button class="welcome-btn welcome-btn-secondary" data-action="back">Tilbage</button>
          <button class="welcome-btn welcome-btn-primary" data-action="next">Næste</button>
        </div>
      `,
      field: 'theme',
      save: () => {}
    },
    // 3: Clock + weather
    {
      render: () => `
        <h2 class="welcome-step-title">Ur og vejr</h2>
        <div class="welcome-group">
          <p class="welcome-group-label">Tidsformat</p>
          <div class="welcome-options">
            <button class="welcome-option ${clockFormat === '24h' ? 'selected' : ''}" data-group="clock" data-value="24h">
              <span class="welcome-option-big">14:30</span>
              <span class="welcome-option-label">24-timer</span>
            </button>
            <button class="welcome-option ${clockFormat === '12h' ? 'selected' : ''}" data-group="clock" data-value="12h">
              <span class="welcome-option-big">2:30 PM</span>
              <span class="welcome-option-label">12-timer</span>
            </button>
          </div>
        </div>
        <div class="welcome-group">
          <p class="welcome-group-label">Temperatur</p>
          <div class="welcome-options">
            <button class="welcome-option ${weatherUnit === 'celsius' ? 'selected' : ''}" data-group="weather" data-value="celsius">
              <span class="welcome-option-big">&deg;C</span>
              <span class="welcome-option-label">Celsius</span>
            </button>
            <button class="welcome-option ${weatherUnit === 'fahrenheit' ? 'selected' : ''}" data-group="weather" data-value="fahrenheit">
              <span class="welcome-option-big">&deg;F</span>
              <span class="welcome-option-label">Fahrenheit</span>
            </button>
          </div>
        </div>
        <div class="welcome-btns">
          <button class="welcome-btn welcome-btn-secondary" data-action="back">Tilbage</button>
          <button class="welcome-btn welcome-btn-primary" data-action="next">Næste</button>
        </div>
      `,
      save: () => {}
    },
    // 4: Search engine
    {
      render: () => `
        <h2 class="welcome-step-title">Søgemaskine</h2>
        <p class="welcome-desc">Bruges når du søger fra forsiden.</p>
        <div class="welcome-options welcome-options-grid">
          <button class="welcome-option welcome-option-sm ${searchEngine === 'google' ? 'selected' : ''}" data-value="google">
            <span class="welcome-option-label">Google</span>
          </button>
          <button class="welcome-option welcome-option-sm ${searchEngine === 'duckduckgo' ? 'selected' : ''}" data-value="duckduckgo">
            <span class="welcome-option-label">DuckDuckGo</span>
          </button>
          <button class="welcome-option welcome-option-sm ${searchEngine === 'brave' ? 'selected' : ''}" data-value="brave">
            <span class="welcome-option-label">Brave</span>
          </button>
          <button class="welcome-option welcome-option-sm ${searchEngine === 'startpage' ? 'selected' : ''}" data-value="startpage">
            <span class="welcome-option-label">Startpage</span>
          </button>
          <button class="welcome-option welcome-option-sm ${searchEngine === 'youtube' ? 'selected' : ''}" data-value="youtube">
            <span class="welcome-option-label">YouTube</span>
          </button>
          <button class="welcome-option welcome-option-sm ${searchEngine === 'wikipedia' ? 'selected' : ''}" data-value="wikipedia">
            <span class="welcome-option-label">Wikipedia</span>
          </button>
        </div>
        <div class="welcome-btns">
          <button class="welcome-btn welcome-btn-secondary" data-action="back">Tilbage</button>
          <button class="welcome-btn welcome-btn-primary" data-action="next">Næste</button>
        </div>
      `,
      field: 'searchEngine',
      save: () => {}
    },
    // 5: Effects
    {
      render: () => `
        <h2 class="welcome-step-title">Partikeleffekt</h2>
        <p class="welcome-desc">Animerede effekter i baggrunden.</p>
        <div class="welcome-options welcome-options-grid">
          <button class="welcome-option welcome-option-sm ${effectType === 'embers' ? 'selected' : ''}" data-value="embers">
            <span class="welcome-option-big">&#128293;</span>
            <span class="welcome-option-label">Gløder</span>
          </button>
          <button class="welcome-option welcome-option-sm ${effectType === 'sne' ? 'selected' : ''}" data-value="sne">
            <span class="welcome-option-big">&#10052;&#65039;</span>
            <span class="welcome-option-label">Sne</span>
          </button>
          <button class="welcome-option welcome-option-sm ${effectType === 'regn' ? 'selected' : ''}" data-value="regn">
            <span class="welcome-option-big">&#127783;&#65039;</span>
            <span class="welcome-option-label">Regn</span>
          </button>
          <button class="welcome-option welcome-option-sm ${effectType === 'stjerner' ? 'selected' : ''}" data-value="stjerner">
            <span class="welcome-option-big">&#11088;</span>
            <span class="welcome-option-label">Stjerner</span>
          </button>
          <button class="welcome-option welcome-option-sm ${effectType === 'ildfluer' ? 'selected' : ''}" data-value="ildfluer">
            <span class="welcome-option-big">&#10024;</span>
            <span class="welcome-option-label">Ildfluer</span>
          </button>
          <button class="welcome-option welcome-option-sm ${effectType === 'ingen' ? 'selected' : ''}" data-value="ingen">
            <span class="welcome-option-big">&#128683;</span>
            <span class="welcome-option-label">Ingen</span>
          </button>
        </div>
        <div class="welcome-btns">
          <button class="welcome-btn welcome-btn-secondary" data-action="back">Tilbage</button>
          <button class="welcome-btn welcome-btn-primary" data-action="next">Næste</button>
        </div>
      `,
      field: 'effectType',
      save: () => {}
    },
    // 6: Layout
    {
      render: () => `
        <h2 class="welcome-step-title">Layout</h2>
        <p class="welcome-desc">Hvor skal indholdet placeres?</p>
        <div class="welcome-options welcome-options-3">
          <button class="welcome-option ${layoutPos === 'top' ? 'selected' : ''}" data-value="top">
            <span class="welcome-option-big">&#9650;</span>
            <span class="welcome-option-label">Top</span>
          </button>
          <button class="welcome-option ${layoutPos === 'center' ? 'selected' : ''}" data-value="center">
            <span class="welcome-option-big">&#9679;</span>
            <span class="welcome-option-label">Center</span>
          </button>
          <button class="welcome-option ${layoutPos === 'bottom' ? 'selected' : ''}" data-value="bottom">
            <span class="welcome-option-big">&#9660;</span>
            <span class="welcome-option-label">Bund</span>
          </button>
        </div>
        <div class="welcome-btns">
          <button class="welcome-btn welcome-btn-secondary" data-action="back">Tilbage</button>
          <button class="welcome-btn welcome-btn-primary" data-action="next">Færdig</button>
        </div>
      `,
      field: 'layoutPos',
      save: () => {}
    }
  ];

  function renderStep() {
    overlay.innerHTML = `
      <div class="welcome-card">
        <div class="welcome-dots">
          ${steps.map((_, i) => `<span class="welcome-dot ${i === currentStep ? 'active' : i < currentStep ? 'done' : ''}"></span>`).join('')}
        </div>
        ${steps[currentStep].render()}
      </div>
    `;

    // Wire up nav buttons
    overlay.querySelectorAll('[data-action]').forEach(btn => {
      btn.addEventListener('click', () => {
        if (btn.dataset.action === 'back') { currentStep--; renderStep(); }
        else if (btn.dataset.action === 'next') { steps[currentStep].save(); advance(); }
      });
    });

    // Wire up option buttons (handle grouped and ungrouped)
    overlay.querySelectorAll('.welcome-option').forEach(btn => {
      btn.addEventListener('click', () => {
        const group = btn.dataset.group;
        // Deselect siblings in same group
        const siblings = group
          ? overlay.querySelectorAll(`.welcome-option[data-group="${group}"]`)
          : overlay.querySelectorAll('.welcome-option:not([data-group])');
        siblings.forEach(b => b.classList.remove('selected'));
        btn.classList.add('selected');

        const val = btn.dataset.value;
        if (group === 'clock') clockFormat = val;
        else if (group === 'weather') weatherUnit = val;
        else {
          // Ungrouped — determine by step
          const step = steps[currentStep];
          if (step.field === 'theme') theme = val;
          else if (step.field === 'searchEngine') searchEngine = val;
          else if (step.field === 'effectType') effectType = val;
          else if (step.field === 'layoutPos') layoutPos = val;
        }
      });
    });

    // Auto-focus name input
    const nameInput = overlay.querySelector('#welcome-name');
    if (nameInput) {
      nameInput.value = userName;
      setTimeout(() => nameInput.focus(), 100);
      nameInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') { steps[currentStep].save(); advance(); }
      });
    }
  }

  async function advance() {
    if (currentStep < steps.length - 1) {
      currentStep++;
      renderStep();
    } else {
      // Save all settings
      const settings = await get('settings', {});
      if (userName) settings.userName = userName;
      settings.theme = theme;
      settings.clockFormat = clockFormat;
      settings.weatherUnit = weatherUnit;
      settings.searchEngine = searchEngine;
      settings.effectType = effectType;
      settings.layoutPosition = layoutPos;
      await set('settings', settings);
      await set('welcomeDone', true);

      // Show farewell splash
      const displayName = userName || 'du';
      const safeName = escapeHTML(displayName);
      overlay.innerHTML = `
        <div class="welcome-card welcome-farewell">
          <h1 class="welcome-farewell-greeting">Hej ${safeName}</h1>
          <p class="welcome-farewell-sub">Velkommen</p>
        </div>
      `;

      // Fade out after a moment, then reload
      setTimeout(() => {
        overlay.classList.add('welcome-exit');
        setTimeout(() => location.reload(), 600);
      }, 1800);
    }
  }

  document.body.appendChild(overlay);
  requestAnimationFrame(() => {
    overlay.classList.add('welcome-visible');
    renderStep();
  });
}
