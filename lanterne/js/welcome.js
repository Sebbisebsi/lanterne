import { get, set, escapeHTML, setSyncEnabled } from './storage.js';

// ─── Welcome canvas animation (stars, shooting stars, embers) ───
function initWelcomeCanvas(canvas) {
  const ctx = canvas.getContext('2d');
  let w, h, animId;

  function resize() {
    w = canvas.width = window.innerWidth;
    h = canvas.height = window.innerHeight;
  }
  resize();
  window.addEventListener('resize', resize);

  // Stars
  const stars = [];
  for (let i = 0; i < 160; i++) {
    const tier = Math.random();
    stars.push({
      x: Math.random() * w,
      y: Math.random() * h,
      r: tier < 0.6 ? 0.5 + Math.random() * 0.5 : tier < 0.9 ? 1 + Math.random() * 0.8 : 1.8 + Math.random() * 1,
      brightness: 0.3 + Math.random() * 0.7,
      twinkleSpeed: 0.005 + Math.random() * 0.015,
      twinklePhase: Math.random() * Math.PI * 2,
      driftX: (Math.random() - 0.5) * 0.02,
      driftY: (Math.random() - 0.5) * 0.01,
    });
  }

  // Embers — warm floating sparks
  const embers = [];
  for (let i = 0; i < 25; i++) {
    embers.push(createEmber());
  }

  function createEmber() {
    return {
      x: Math.random() * w,
      y: h + Math.random() * 40,
      vx: (Math.random() - 0.5) * 0.4,
      vy: -(0.3 + Math.random() * 0.6),
      r: 1 + Math.random() * 2.5,
      life: 0,
      maxLife: 300 + Math.random() * 400,
      hue: 25 + Math.random() * 20, // warm orange-amber
    };
  }

  // Shooting stars
  const shoots = [];
  let shootTimer = 0;
  let nextShoot = 90 + Math.floor(Math.random() * 120);

  function createShoot() {
    const startX = Math.random() * w;
    const startY = Math.random() * h * 0.3;
    const angle = (Math.PI / 2) + (Math.random() - 0.5) * 0.6; // mostly downward
    const speed = 4 + Math.random() * 4;
    return {
      x: startX, y: startY,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      life: 0,
      maxLife: 40 + Math.random() * 30,
      tail: [],
      brightness: 0.7 + Math.random() * 0.3,
    };
  }

  function animate() {
    ctx.clearRect(0, 0, w, h);

    // Draw stars
    for (const s of stars) {
      s.twinklePhase += s.twinkleSpeed;
      const twinkle = 0.4 + 0.6 * (0.5 + 0.5 * Math.sin(s.twinklePhase));
      const alpha = s.brightness * twinkle;

      // Subtle drift
      s.x += s.driftX;
      s.y += s.driftY;
      if (s.x < 0) s.x = w;
      if (s.x > w) s.x = 0;
      if (s.y < 0) s.y = h;
      if (s.y > h) s.y = 0;

      // Glow
      if (s.r > 1.2) {
        ctx.beginPath();
        const grad = ctx.createRadialGradient(s.x, s.y, 0, s.x, s.y, s.r * 4);
        grad.addColorStop(0, `rgba(255, 220, 170, ${alpha * 0.15})`);
        grad.addColorStop(1, 'transparent');
        ctx.fillStyle = grad;
        ctx.arc(s.x, s.y, s.r * 4, 0, Math.PI * 2);
        ctx.fill();
      }

      // Core
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255, 235, 210, ${alpha})`;
      ctx.fill();
    }

    // Draw embers
    for (let i = embers.length - 1; i >= 0; i--) {
      const e = embers[i];
      e.x += e.vx + Math.sin(e.life * 0.02) * 0.3;
      e.y += e.vy;
      e.life++;

      const progress = e.life / e.maxLife;
      const alpha = progress < 0.1 ? progress / 0.1 : progress > 0.7 ? (1 - progress) / 0.3 : 1;

      if (e.life >= e.maxLife || e.y < -20) {
        embers[i] = createEmber();
        continue;
      }

      // Glow
      const grad = ctx.createRadialGradient(e.x, e.y, 0, e.x, e.y, e.r * 6);
      grad.addColorStop(0, `hsla(${e.hue}, 90%, 60%, ${alpha * 0.2})`);
      grad.addColorStop(1, 'transparent');
      ctx.beginPath();
      ctx.arc(e.x, e.y, e.r * 6, 0, Math.PI * 2);
      ctx.fillStyle = grad;
      ctx.fill();

      // Core
      ctx.beginPath();
      ctx.arc(e.x, e.y, e.r * (1 - progress * 0.5), 0, Math.PI * 2);
      ctx.fillStyle = `hsla(${e.hue}, 95%, 70%, ${alpha * 0.8})`;
      ctx.fill();
    }

    // Shooting stars
    shootTimer++;
    if (shootTimer >= nextShoot) {
      shoots.push(createShoot());
      shootTimer = 0;
      nextShoot = 60 + Math.floor(Math.random() * 100);
    }

    for (let i = shoots.length - 1; i >= 0; i--) {
      const s = shoots[i];
      s.x += s.vx;
      s.y += s.vy;
      s.life++;
      s.tail.push({ x: s.x, y: s.y });
      if (s.tail.length > 18) s.tail.shift();

      const progress = s.life / s.maxLife;
      if (progress >= 1) { shoots.splice(i, 1); continue; }

      const alpha = progress < 0.2 ? progress / 0.2 : (1 - progress) / 0.8;

      // Tail
      if (s.tail.length > 1) {
        for (let j = 1; j < s.tail.length; j++) {
          const t = j / s.tail.length;
          ctx.beginPath();
          ctx.moveTo(s.tail[j - 1].x, s.tail[j - 1].y);
          ctx.lineTo(s.tail[j].x, s.tail[j].y);
          ctx.strokeStyle = `rgba(255, 220, 160, ${alpha * t * s.brightness * 0.6})`;
          ctx.lineWidth = (1 + t * 2);
          ctx.stroke();
        }
      }

      // Head glow
      const headGrad = ctx.createRadialGradient(s.x, s.y, 0, s.x, s.y, 8);
      headGrad.addColorStop(0, `rgba(255, 230, 180, ${alpha * s.brightness * 0.5})`);
      headGrad.addColorStop(1, 'transparent');
      ctx.beginPath();
      ctx.arc(s.x, s.y, 8, 0, Math.PI * 2);
      ctx.fillStyle = headGrad;
      ctx.fill();

      // Head core
      ctx.beginPath();
      ctx.arc(s.x, s.y, 1.5, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255, 245, 220, ${alpha * s.brightness})`;
      ctx.fill();
    }

    animId = requestAnimationFrame(animate);
  }

  animate();

  return () => {
    cancelAnimationFrame(animId);
    window.removeEventListener('resize', resize);
  };
}

// ─── Welcome flow ───
export async function initWelcome() {
  const done = await get('welcomeDone', false);
  if (done) return;

  const overlay = document.createElement('div');
  overlay.className = 'welcome-overlay';

  // Add canvas for background animation
  const canvas = document.createElement('canvas');
  canvas.className = 'welcome-canvas';
  overlay.appendChild(canvas);

  // State
  let currentStep = 0;
  let userName = '';
  let theme = 'dark';
  let clockFormat = '24h';
  let effectType = 'embers';
  let layoutPos = 'top';
  let weatherUnit = 'celsius';
  let syncEnabled = false;

  const steps = [
    // 0: Welcome
    {
      render: () => `
        <div class="welcome-icon">&#128294;</div>
        <h1 class="welcome-title">Velkommen til Lanterne</h1>
        <p class="welcome-desc">Din personlige ny fane-side. Lad os hurtigt s&aelig;tte det op.</p>
        <button class="welcome-btn welcome-btn-primary" data-action="next">Kom i gang</button>
      `,
      save: () => {}
    },
    // 1: Name
    {
      render: () => `
        <h2 class="welcome-step-title">Hvad hedder du?</h2>
        <p class="welcome-desc">Bruges til hilsenen p&aring; forsiden.</p>
        <input type="text" class="welcome-input" id="welcome-name" placeholder="Dit navn" autocomplete="off" spellcheck="false">
        <div class="welcome-btns">
          <button class="welcome-btn welcome-btn-secondary" data-action="back">Tilbage</button>
          <button class="welcome-btn welcome-btn-primary" data-action="next">N&aelig;ste</button>
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
        <h2 class="welcome-step-title">V&aelig;lg tema</h2>
        <p class="welcome-desc">Du kan altid &aelig;ndre det senere i indstillinger.</p>
        <div class="welcome-options welcome-options-3">
          <button class="welcome-option ${theme === 'dark' ? 'selected' : ''}" data-value="dark">
            <span class="welcome-option-big">&#127769;</span>
            <span class="welcome-option-label">M&oslash;rkt</span>
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
          <button class="welcome-btn welcome-btn-primary" data-action="next">N&aelig;ste</button>
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
          <button class="welcome-btn welcome-btn-primary" data-action="next">N&aelig;ste</button>
        </div>
      `,
      save: () => {}
    },
    // 4: Effects
    {
      render: () => `
        <h2 class="welcome-step-title">Partikeleffekt</h2>
        <p class="welcome-desc">Animerede effekter i baggrunden.</p>
        <div class="welcome-options welcome-options-grid">
          <button class="welcome-option welcome-option-sm ${effectType === 'embers' ? 'selected' : ''}" data-value="embers">
            <span class="welcome-option-big">&#128293;</span>
            <span class="welcome-option-label">Gl&oslash;der</span>
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
          <button class="welcome-btn welcome-btn-primary" data-action="next">N&aelig;ste</button>
        </div>
      `,
      field: 'effectType',
      save: () => {}
    },
    // 5: Layout
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
          <button class="welcome-btn welcome-btn-primary" data-action="next">N&aelig;ste</button>
        </div>
      `,
      field: 'layoutPos',
      save: () => {}
    },
    // 6: Sync
    {
      render: () => `
        <h2 class="welcome-step-title">Synkronisering</h2>
        <p class="welcome-desc">Vil du synkronisere dine indstillinger p&aring; tv&aelig;rs af enheder med din Google-konto?</p>
        <div class="welcome-options">
          <button class="welcome-option ${syncEnabled ? 'selected' : ''}" data-value="yes">
            <span class="welcome-option-big"><svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12a9 9 0 0 1-9 9m9-9a9 9 0 0 0-9-9m9 9H3m9 9a9 9 0 0 1-9-9m9 9c1.66 0 3-4.03 3-9s-1.34-9-3-9m0 18c-1.66 0-3-4.03-3-9s1.34-9 3-9m-9 9a9 9 0 0 1 9-9"/></svg></span>
            <span class="welcome-option-label">Ja, synkroniser</span>
          </button>
          <button class="welcome-option ${!syncEnabled ? 'selected' : ''}" data-value="no">
            <span class="welcome-option-big"><svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="12" x="3" y="4" rx="2"/><line x1="2" y1="20" x2="22" y2="20"/></svg></span>
            <span class="welcome-option-label">Nej, kun lokalt</span>
          </button>
        </div>
        <p class="welcome-desc" style="font-size: 0.85em; opacity: 0.6; margin-top: 0.8em;"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align: -2px; margin-right: 4px;"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>Baggrundsbilleder synkroniseres ikke (for store til Chrome Sync).</p>
        <div class="welcome-btns">
          <button class="welcome-btn welcome-btn-secondary" data-action="back">Tilbage</button>
          <button class="welcome-btn welcome-btn-primary" data-action="next">F&aelig;rdig</button>
        </div>
      `,
      field: 'sync',
      save: () => {}
    }
  ];

  function renderStep() {
    // Get/create the card container (canvas stays)
    let card = overlay.querySelector('.welcome-card');
    if (!card) {
      card = document.createElement('div');
      card.className = 'welcome-card';
      overlay.appendChild(card);
    }

    // Animate step transition
    card.classList.remove('welcome-step-enter');
    // Force reflow to restart animation
    void card.offsetWidth;
    card.classList.add('welcome-step-enter');

    card.innerHTML = `
      <div class="welcome-dots">
        ${steps.map((_, i) => `<span class="welcome-dot ${i === currentStep ? 'active' : i < currentStep ? 'done' : ''}"></span>`).join('')}
      </div>
      ${steps[currentStep].render()}
    `;

    // Wire up nav buttons
    card.querySelectorAll('[data-action]').forEach(btn => {
      btn.addEventListener('click', () => {
        if (btn.dataset.action === 'back') { currentStep--; renderStep(); }
        else if (btn.dataset.action === 'next') { steps[currentStep].save(); advance(); }
      });
    });

    // Wire up option buttons (handle grouped and ungrouped)
    card.querySelectorAll('.welcome-option').forEach(btn => {
      btn.addEventListener('click', () => {
        const group = btn.dataset.group;
        const siblings = group
          ? card.querySelectorAll(`.welcome-option[data-group="${group}"]`)
          : card.querySelectorAll('.welcome-option:not([data-group])');
        siblings.forEach(b => b.classList.remove('selected'));
        btn.classList.add('selected');

        const val = btn.dataset.value;
        if (group === 'clock') clockFormat = val;
        else if (group === 'weather') weatherUnit = val;
        else {
          const step = steps[currentStep];
          if (step.field === 'theme') theme = val;
          else if (step.field === 'effectType') effectType = val;
          else if (step.field === 'layoutPos') layoutPos = val;
          else if (step.field === 'sync') syncEnabled = val === 'yes';
        }
      });
    });

    // Auto-focus name input
    const nameInput = card.querySelector('#welcome-name');
    if (nameInput) {
      nameInput.value = userName;
      setTimeout(() => nameInput.focus(), 100);
      nameInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') { steps[currentStep].save(); advance(); }
      });
    }
  }

  let destroyCanvas = null;

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
      settings.effectType = effectType;
      settings.layoutPosition = layoutPos;
      await set('settings', settings);
      // Enable sync if chosen (migrates data to chrome.storage.sync)
      if (syncEnabled) {
        await setSyncEnabled(true);
      }
      await set('welcomeDone', true);

      // Show farewell splash
      const displayName = userName || 'du';
      const safeName = escapeHTML(displayName);
      const card = overlay.querySelector('.welcome-card');
      if (card) {
        card.classList.remove('welcome-step-enter');
        void card.offsetWidth;
        card.classList.add('welcome-step-enter');
        card.innerHTML = `
          <div class="welcome-farewell">
            <h1 class="welcome-farewell-greeting">Hej ${safeName}</h1>
            <p class="welcome-farewell-sub">Velkommen</p>
          </div>
        `;
      }

      // Fade out after a moment, then reload
      setTimeout(() => {
        overlay.classList.add('welcome-exit');
        if (destroyCanvas) destroyCanvas();
        setTimeout(() => location.reload(), 600);
      }, 1800);
    }
  }

  document.body.appendChild(overlay);
  requestAnimationFrame(() => {
    overlay.classList.add('welcome-visible');
    destroyCanvas = initWelcomeCanvas(canvas);
    renderStep();
  });
}
