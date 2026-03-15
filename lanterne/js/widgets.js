import { get, set } from './storage.js';

// ============================================================
//  WIDGET REGISTRY — every widget type lives here
// ============================================================

const QUOTES = [
  { text: "Simplicity is the ultimate sophistication.", author: "Leonardo da Vinci" },
  { text: "The only way to do great work is to love what you do.", author: "Steve Jobs" },
  { text: "In the middle of difficulty lies opportunity.", author: "Albert Einstein" },
  { text: "Less is more.", author: "Ludwig Mies van der Rohe" },
  { text: "Do what you can, with what you have, where you are.", author: "Theodore Roosevelt" },
  { text: "The best time to plant a tree was 20 years ago. The second best time is now.", author: "Kinesisk ordsprog" },
  { text: "It does not matter how slowly you go as long as you do not stop.", author: "Confucius" },
  { text: "Be yourself; everyone else is already taken.", author: "Oscar Wilde" },
  { text: "Strive not to be a success, but rather to be of value.", author: "Albert Einstein" },
  { text: "The mind is everything. What you think you become.", author: "Buddha" },
  { text: "An unexamined life is not worth living.", author: "Socrates" },
  { text: "Happiness is not something ready made. It comes from your own actions.", author: "Dalai Lama" },
  { text: "The journey of a thousand miles begins with one step.", author: "Lao Tzu" },
  { text: "What we think, we become.", author: "Buddha" },
  { text: "Turn your wounds into wisdom.", author: "Oprah Winfrey" },
  { text: "Every moment is a fresh beginning.", author: "T.S. Eliot" },
  { text: "Not all those who wander are lost.", author: "J.R.R. Tolkien" },
  { text: "The secret of getting ahead is getting started.", author: "Mark Twain" },
  { text: "It is during our darkest moments that we must focus to see the light.", author: "Aristotle" },
  { text: "Life is what happens when you're busy making other plans.", author: "John Lennon" },
  { text: "You must be the change you wish to see in the world.", author: "Mahatma Gandhi" },
  { text: "Wherever you go, go with all your heart.", author: "Confucius" },
  { text: "The only impossible journey is the one you never begin.", author: "Tony Robbins" },
  { text: "What you do today can improve all your tomorrows.", author: "Ralph Marston" },
  { text: "Believe you can and you're halfway there.", author: "Theodore Roosevelt" },
  { text: "Act as if what you do makes a difference. It does.", author: "William James" },
  { text: "Everything you've ever wanted is on the other side of fear.", author: "George Addair" },
  { text: "Start where you are. Use what you have. Do what you can.", author: "Arthur Ashe" },
  { text: "The best preparation for tomorrow is doing your best today.", author: "H. Jackson Brown Jr." },
  { text: "Keep your face always toward the sunshine and shadows will fall behind you.", author: "Walt Whitman" }
];

function getDailyQuote() {
  const today = new Date();
  const dayOfYear = Math.floor((today - new Date(today.getFullYear(), 0, 0)) / 86400000);
  return QUOTES[dayOfYear % QUOTES.length];
}

// Icons used throughout widgets
const ICONS = {
  quote: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 21c3 0 7-1 7-8V5c0-1.25-.756-2.017-2-2H4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2 1 0 1 0 1 1v1c0 1-1 2-2 2s-1 .008-1 1.031V20c0 1 0 1 1 1z"/><path d="M15 21c3 0 7-1 7-8V5c0-1.25-.757-2.017-2-2h-4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2h.75c0 2.25.25 4-2.75 4v3c0 1 0 1 1 1z"/></svg>',
  timer: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>',
  notepad: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>',
  youtube: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2.5 17a24.12 24.12 0 0 1 0-10 2 2 0 0 1 1.4-1.4 49.56 49.56 0 0 1 16.2 0A2 2 0 0 1 21.5 7a24.12 24.12 0 0 1 0 10 2 2 0 0 1-1.4 1.4 49.55 49.55 0 0 1-16.2 0A2 2 0 0 1 2.5 17"/><path d="m10 15 5-3-5-3z"/></svg>',
  worldclock: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>',
  countdown: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 22h14"/><path d="M5 2h14"/><path d="M17 22v-4.172a2 2 0 0 0-.586-1.414L12 12l-4.414 4.414A2 2 0 0 0 7 17.828V22"/><path d="M7 2v4.172a2 2 0 0 0 .586 1.414L12 12l4.414-4.414A2 2 0 0 0 17 6.172V2"/></svg>',
  bookmark: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z"/></svg>',
  dice: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><path d="M16 8h.01"/><path d="M12 12h.01"/><path d="M8 16h.01"/></svg>',
  plus: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>',
  close: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>',
  settings: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06A1.65 1.65 0 0 0 19.32 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>'
};

// ============================================================
//  WIDGET DEFINITIONS
// ============================================================

const WIDGET_DEFS = {
  quote: {
    name: 'Dagens citat',
    description: 'Et nyt inspirerende citat hver dag',
    icon: 'quote',
    defaultConfig: {},
    render: renderQuote
  },
  timer: {
    name: 'Fokus Timer',
    description: 'Pomodoro-timer med presets og sekunder',
    icon: 'timer',
    defaultConfig: {},
    render: renderTimer
  },
  notepad: {
    name: 'Hurtige noter',
    description: 'Et lille skriveblok til tanker og noter',
    icon: 'notepad',
    defaultConfig: {},
    render: renderNotepad
  },
  youtube: {
    name: 'YouTube',
    description: 'Indlejr en YouTube video eller playliste',
    icon: 'youtube',
    defaultConfig: { videoUrl: '' },
    render: renderYouTube,
    hasSettings: true
  },
  worldclock: {
    name: 'Verdensur',
    description: 'Se klokken i andre tidszoner',
    icon: 'worldclock',
    defaultConfig: {
      zones: [
        { label: 'New York', tz: 'America/New_York' },
        { label: 'London', tz: 'Europe/London' },
        { label: 'Tokyo', tz: 'Asia/Tokyo' }
      ]
    },
    render: renderWorldClock,
    hasSettings: true
  },
  countdown: {
    name: 'Nedtælling',
    description: 'Tæl ned til en vigtig dato',
    icon: 'countdown',
    defaultConfig: { targetDate: '', label: 'Min begivenhed' },
    render: renderCountdown,
    hasSettings: true
  },
  bookmarks: {
    name: 'Bogmærker',
    description: 'Hurtige genveje til dine yndlingssider',
    icon: 'bookmark',
    defaultConfig: { links: [] },
    render: renderBookmarks,
    hasSettings: true
  },
  randomizer: {
    name: 'Tilfældighedsgenerator',
    description: 'Terningkast, møntkast og tilfældig tal',
    icon: 'dice',
    defaultConfig: {},
    render: renderRandomizer
  }
};

const DEFAULT_ENABLED = ['quote', 'timer', 'notepad'];

// ============================================================
//  WIDGET RENDERERS
// ============================================================

function renderQuote(container) {
  const quote = getDailyQuote();
  container.innerHTML = `
    <div class="widget-body widget-quote-body">
      <blockquote class="quote-text">"${quote.text}"</blockquote>
      <cite class="quote-author">&mdash; ${quote.author}</cite>
    </div>
  `;
}

async function renderTimer(container) {
  let timerState = await get('timerState', { running: false, endTime: null, duration: 25 });
  let intervalId = null;

  function render() {
    let remaining = 0;
    let isRunning = false;

    if (timerState.running && timerState.endTime) {
      remaining = Math.max(0, timerState.endTime - Date.now());
      isRunning = remaining > 0;
      if (!isRunning) {
        timerState.running = false;
        set('timerState', timerState);
      }
    }

    const minutes = Math.floor(remaining / 60000);
    const seconds = Math.floor((remaining % 60000) / 1000);
    const progress = isRunning ? (1 - remaining / (timerState.duration * 60000)) * 100 : 0;

    container.innerHTML = `
      <div class="widget-body widget-timer-body ${isRunning ? 'timer-active' : ''}">
        <div class="timer-display">
          ${isRunning
            ? `<span class="timer-time">${String(minutes).padStart(2, '0')}<span class="timer-colon">:</span><span class="timer-seconds">${String(seconds).padStart(2, '0')}</span></span>`
            : `<span class="timer-label">Fokus</span>`
          }
        </div>
        ${isRunning
          ? `<div class="timer-progress"><div class="timer-progress-bar" style="width: ${progress}%"></div></div>
             <button class="timer-btn timer-stop">Stop</button>`
          : `<div class="timer-presets">
               <button class="timer-preset" data-min="5">5m</button>
               <button class="timer-preset" data-min="15">15m</button>
               <button class="timer-preset" data-min="25">25m</button>
               <button class="timer-preset" data-min="45">45m</button>
               <button class="timer-preset" data-min="60">60m</button>
             </div>`
        }
      </div>
    `;

    if (isRunning) {
      container.querySelector('.timer-stop').addEventListener('click', async () => {
        timerState = { running: false, endTime: null, duration: 25 };
        await set('timerState', timerState);
        clearInterval(intervalId);
        render();
      });
    } else {
      container.querySelectorAll('.timer-preset').forEach(btn => {
        btn.addEventListener('click', async () => {
          const min = parseInt(btn.dataset.min);
          timerState = { running: true, endTime: Date.now() + min * 60000, duration: min };
          await set('timerState', timerState);
          startInterval();
          render();
        });
      });
    }
  }

  function startInterval() {
    clearInterval(intervalId);
    intervalId = setInterval(render, 1000);
  }

  if (timerState.running && timerState.endTime > Date.now()) {
    startInterval();
  }

  render();
}

async function renderNotepad(container) {
  const note = await get('quickNote', '');

  container.innerHTML = `
    <div class="widget-body widget-notepad-body">
      <textarea class="notepad-textarea" placeholder="Hurtige noter...">${note}</textarea>
    </div>
  `;

  const textarea = container.querySelector('.notepad-textarea');
  let debounce;
  textarea.addEventListener('input', () => {
    clearTimeout(debounce);
    debounce = setTimeout(() => set('quickNote', textarea.value), 300);
    textarea.style.height = 'auto';
    textarea.style.height = Math.min(textarea.scrollHeight, 150) + 'px';
  });

  if (note) {
    setTimeout(() => {
      textarea.style.height = 'auto';
      textarea.style.height = Math.min(textarea.scrollHeight, 150) + 'px';
    }, 50);
  }
}

function renderYouTube(container, config) {
  const url = config.videoUrl || '';
  const videoId = extractYouTubeId(url);

  if (!videoId) {
    container.innerHTML = `
      <div class="widget-body widget-youtube-body widget-empty-state">
        <div class="widget-empty-icon">${ICONS.youtube}</div>
        <p>Tilf&oslash;j en YouTube URL</p>
        <p class="widget-empty-hint">Brug tandhjulet for at indstille</p>
      </div>
    `;
    return;
  }

  container.innerHTML = `
    <div class="widget-body widget-youtube-body">
      <div class="youtube-embed">
        <iframe
          src="https://www.youtube.com/embed/${videoId}?rel=0&modestbranding=1"
          frameborder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowfullscreen
        ></iframe>
      </div>
    </div>
  `;
}

function extractYouTubeId(url) {
  if (!url) return null;
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
    /^([a-zA-Z0-9_-]{11})$/
  ];
  for (const p of patterns) {
    const m = url.match(p);
    if (m) return m[1];
  }
  return null;
}

function renderWorldClock(container, config) {
  const zones = config.zones || [];

  function render() {
    const now = new Date();
    container.innerHTML = `
      <div class="widget-body widget-worldclock-body">
        ${zones.map(z => {
          let timeStr;
          try {
            timeStr = now.toLocaleTimeString('da-DK', {
              timeZone: z.tz,
              hour: '2-digit',
              minute: '2-digit',
              second: '2-digit'
            });
          } catch {
            timeStr = '--:--';
          }
          return `
            <div class="worldclock-zone">
              <span class="worldclock-label">${z.label}</span>
              <span class="worldclock-time">${timeStr}</span>
            </div>
          `;
        }).join('')}
      </div>
    `;
  }

  render();
  setInterval(render, 1000);
}

function renderCountdown(container, config) {
  const target = config.targetDate ? new Date(config.targetDate) : null;
  const label = config.label || 'Begivenhed';

  if (!target || isNaN(target.getTime())) {
    container.innerHTML = `
      <div class="widget-body widget-countdown-body widget-empty-state">
        <div class="widget-empty-icon">${ICONS.countdown}</div>
        <p>Indstil en dato</p>
        <p class="widget-empty-hint">Brug tandhjulet for at v&aelig;lge</p>
      </div>
    `;
    return;
  }

  function render() {
    const now = Date.now();
    const diff = target.getTime() - now;

    if (diff <= 0) {
      container.innerHTML = `
        <div class="widget-body widget-countdown-body">
          <div class="countdown-label">${label}</div>
          <div class="countdown-reached">Det er i dag!</div>
        </div>
      `;
      return;
    }

    const days = Math.floor(diff / 86400000);
    const hours = Math.floor((diff % 86400000) / 3600000);
    const mins = Math.floor((diff % 3600000) / 60000);

    container.innerHTML = `
      <div class="widget-body widget-countdown-body">
        <div class="countdown-label">${label}</div>
        <div class="countdown-grid">
          <div class="countdown-unit">
            <span class="countdown-number">${days}</span>
            <span class="countdown-unit-label">dage</span>
          </div>
          <div class="countdown-unit">
            <span class="countdown-number">${hours}</span>
            <span class="countdown-unit-label">timer</span>
          </div>
          <div class="countdown-unit">
            <span class="countdown-number">${mins}</span>
            <span class="countdown-unit-label">min</span>
          </div>
        </div>
      </div>
    `;
  }

  render();
  setInterval(render, 60000);
}

function renderBookmarks(container, config) {
  const links = config.links || [];

  container.innerHTML = `
    <div class="widget-body widget-bookmarks-body">
      ${links.length === 0
        ? `<div class="widget-empty-state">
            <div class="widget-empty-icon">${ICONS.bookmark}</div>
            <p>Ingen bogm&aelig;rker endnu</p>
            <p class="widget-empty-hint">Brug tandhjulet for at tilf&oslash;je</p>
           </div>`
        : `<div class="bookmarks-list">
            ${links.map(l => {
              const safeUrl = sanitizeUrl(l.url);
              let hostname = '';
              try { hostname = new URL(safeUrl).hostname; } catch {}
              return `
                <a href="${safeUrl}" class="bookmark-item" title="${l.url}">
                  <img class="bookmark-favicon" src="https://www.google.com/s2/favicons?domain=${encodeURIComponent(hostname)}&sz=32" alt="" width="16" height="16" />
                  <span>${l.name}</span>
                </a>
              `;
            }).join('')}
           </div>`
      }
    </div>
  `;
}

function sanitizeUrl(url) {
  if (!url) return '#';
  if (!/^https?:\/\//i.test(url)) return 'https://' + url;
  return url;
}

function renderRandomizer(container) {
  container.innerHTML = `
    <div class="widget-body widget-randomizer-body">
      <div class="randomizer-result">?</div>
      <div class="randomizer-actions">
        <button class="randomizer-btn" data-type="dice" title="Terningkast">
          ${ICONS.dice} <span>Terning</span>
        </button>
        <button class="randomizer-btn" data-type="coin" title="Møntkast">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="8"/></svg>
          <span>M&oslash;nt</span>
        </button>
        <button class="randomizer-btn" data-type="number" title="Tilfældigt tal 1-100">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="4" y="4" width="16" height="16" rx="2"/></svg>
          <span>1-100</span>
        </button>
      </div>
    </div>
  `;

  const resultEl = container.querySelector('.randomizer-result');

  container.querySelectorAll('.randomizer-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      resultEl.classList.add('randomizer-spin');
      setTimeout(() => {
        resultEl.classList.remove('randomizer-spin');
        const type = btn.dataset.type;
        if (type === 'dice') resultEl.textContent = Math.ceil(Math.random() * 6);
        else if (type === 'coin') resultEl.textContent = Math.random() < 0.5 ? 'Plat' : 'Krone';
        else resultEl.textContent = Math.ceil(Math.random() * 100);
      }, 300);
    });
  });
}


// ============================================================
//  WIDGET SETTINGS MODALS
// ============================================================

function showWidgetSettingsModal(widgetId, currentConfig, onSave) {
  const def = WIDGET_DEFS[widgetId];
  if (!def) return;

  const overlay = document.createElement('div');
  overlay.className = 'widget-settings-overlay';

  let formHTML = '';

  if (widgetId === 'youtube') {
    formHTML = `
      <label class="ws-label">YouTube URL</label>
      <input class="ws-input" type="url" id="ws-video-url" value="${currentConfig.videoUrl || ''}" placeholder="https://youtube.com/watch?v=..." />
    `;
  } else if (widgetId === 'countdown') {
    formHTML = `
      <label class="ws-label">Begivenhed</label>
      <input class="ws-input" type="text" id="ws-cd-label" value="${currentConfig.label || ''}" placeholder="Min begivenhed" />
      <label class="ws-label">Dato</label>
      <input class="ws-input" type="date" id="ws-cd-date" value="${currentConfig.targetDate || ''}" />
    `;
  } else if (widgetId === 'worldclock') {
    const zones = currentConfig.zones || [];
    formHTML = `
      <label class="ws-label">Tidszoner (en per linje: Label, Tidszone)</label>
      <textarea class="ws-textarea" id="ws-wc-zones" rows="4" placeholder="New York, America/New_York&#10;London, Europe/London&#10;Tokyo, Asia/Tokyo">${zones.map(z => `${z.label}, ${z.tz}`).join('\n')}</textarea>
      <p class="ws-hint">Eksempler: America/New_York, Europe/London, Asia/Tokyo, Australia/Sydney</p>
    `;
  } else if (widgetId === 'bookmarks') {
    const links = currentConfig.links || [];
    formHTML = `
      <label class="ws-label">Bogm&aelig;rker (en per linje: Navn, URL)</label>
      <textarea class="ws-textarea" id="ws-bm-links" rows="5" placeholder="Google, https://google.com&#10;GitHub, https://github.com">${links.map(l => `${l.name}, ${l.url}`).join('\n')}</textarea>
    `;
  }

  overlay.innerHTML = `
    <div class="widget-settings-modal">
      <div class="ws-header">
        <span class="ws-icon">${ICONS[def.icon] || ''}</span>
        <h3>${def.name}</h3>
      </div>
      <div class="ws-form">
        ${formHTML}
      </div>
      <div class="ws-actions">
        <button class="ws-cancel">Annuller</button>
        <button class="ws-save">Gem</button>
      </div>
    </div>
  `;

  document.body.appendChild(overlay);
  // Focus first input
  const firstInput = overlay.querySelector('input, textarea');
  if (firstInput) setTimeout(() => firstInput.focus(), 50);

  overlay.querySelector('.ws-cancel').addEventListener('click', () => overlay.remove());
  overlay.addEventListener('click', (e) => { if (e.target === overlay) overlay.remove(); });

  overlay.querySelector('.ws-save').addEventListener('click', () => {
    let newConfig = { ...currentConfig };

    if (widgetId === 'youtube') {
      newConfig.videoUrl = overlay.querySelector('#ws-video-url').value.trim();
    } else if (widgetId === 'countdown') {
      newConfig.label = overlay.querySelector('#ws-cd-label').value.trim() || 'Begivenhed';
      newConfig.targetDate = overlay.querySelector('#ws-cd-date').value;
    } else if (widgetId === 'worldclock') {
      const text = overlay.querySelector('#ws-wc-zones').value;
      newConfig.zones = text.split('\n').filter(l => l.trim()).map(line => {
        const parts = line.split(',').map(s => s.trim());
        return { label: parts[0] || 'Zone', tz: parts[1] || 'UTC' };
      });
    } else if (widgetId === 'bookmarks') {
      const text = overlay.querySelector('#ws-bm-links').value;
      newConfig.links = text.split('\n').filter(l => l.trim()).map(line => {
        const parts = line.split(',').map(s => s.trim());
        return { name: parts[0] || 'Link', url: parts.slice(1).join(',').trim() || '#' };
      });
    }

    onSave(newConfig);
    overlay.remove();
  });
}


// ============================================================
//  WIDGET GALLERY (add menu)
// ============================================================

function showWidgetGallery(enabledWidgets, onAdd) {
  const overlay = document.createElement('div');
  overlay.className = 'widget-gallery-overlay';

  const available = Object.entries(WIDGET_DEFS).filter(([id]) => !enabledWidgets.includes(id));

  overlay.innerHTML = `
    <div class="widget-gallery-modal">
      <div class="wg-header">
        <h3>Tilf&oslash;j widget</h3>
        <button class="wg-close">${ICONS.close}</button>
      </div>
      <div class="wg-grid">
        ${available.length === 0
          ? '<p class="wg-empty">Alle widgets er allerede tilf&oslash;jet</p>'
          : available.map(([id, def]) => `
            <button class="wg-item" data-widget-id="${id}">
              <div class="wg-item-icon">${ICONS[def.icon] || ''}</div>
              <div class="wg-item-info">
                <span class="wg-item-name">${def.name}</span>
                <span class="wg-item-desc">${def.description}</span>
              </div>
            </button>
          `).join('')
        }
      </div>
    </div>
  `;

  document.body.appendChild(overlay);

  overlay.querySelector('.wg-close').addEventListener('click', () => overlay.remove());
  overlay.addEventListener('click', (e) => { if (e.target === overlay) overlay.remove(); });

  overlay.querySelectorAll('.wg-item').forEach(btn => {
    btn.addEventListener('click', () => {
      onAdd(btn.dataset.widgetId);
      overlay.remove();
    });
  });
}

// ============================================================
//  MAIN INIT
// ============================================================

export async function initWidgets(container) {
  let enabledWidgets = await get('enabledWidgets', [...DEFAULT_ENABLED]);
  let widgetConfigs = await get('widgetConfigs', {});

  async function saveState() {
    await set('enabledWidgets', enabledWidgets);
    await set('widgetConfigs', widgetConfigs);
  }

  function getConfig(widgetId) {
    const def = WIDGET_DEFS[widgetId];
    return { ...(def?.defaultConfig || {}), ...(widgetConfigs[widgetId] || {}) };
  }

  async function renderAll() {
    container.innerHTML = `
      <div class="widgets-toolbar">
        <button class="widget-add-btn" title="Tilf&oslash;j widget">
          ${ICONS.plus}
          <span>Tilf&oslash;j</span>
        </button>
      </div>
      <div class="widgets-row">
        ${enabledWidgets.map(id => {
          const def = WIDGET_DEFS[id];
          if (!def) return '';
          return `
            <div class="widget-slot" data-widget-id="${id}">
              <div class="widget-card">
                <div class="widget-card-header">
                  <div class="widget-card-icon">${ICONS[def.icon] || ''}</div>
                  <span class="widget-card-title">${def.name}</span>
                  <div class="widget-card-actions">
                    ${def.hasSettings ? `<button class="widget-action-btn widget-settings-btn" title="Indstillinger" data-wid="${id}">${ICONS.settings}</button>` : ''}
                    <button class="widget-action-btn widget-remove-btn" title="Fjern widget" data-wid="${id}">${ICONS.close}</button>
                  </div>
                </div>
                <div class="widget-card-content" data-content-for="${id}"></div>
              </div>
            </div>
          `;
        }).join('')}
      </div>
    `;

    // Render each widget content
    for (const id of enabledWidgets) {
      const def = WIDGET_DEFS[id];
      if (!def) continue;
      const contentEl = container.querySelector(`[data-content-for="${id}"]`);
      if (contentEl) {
        await def.render(contentEl, getConfig(id), id);
      }
    }

    // Add widget button
    container.querySelector('.widget-add-btn')?.addEventListener('click', () => {
      showWidgetGallery(enabledWidgets, async (newId) => {
        enabledWidgets.push(newId);
        await saveState();
        await renderAll();
      });
    });

    // Remove buttons
    container.querySelectorAll('.widget-remove-btn').forEach(btn => {
      btn.addEventListener('click', async () => {
        const wid = btn.dataset.wid;
        enabledWidgets = enabledWidgets.filter(id => id !== wid);
        await saveState();
        await renderAll();
      });
    });

    // Settings buttons
    container.querySelectorAll('.widget-settings-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const wid = btn.dataset.wid;
        showWidgetSettingsModal(wid, getConfig(wid), async (newConfig) => {
          widgetConfigs[wid] = newConfig;
          await saveState();
          await renderAll();
        });
      });
    });
  }

  await renderAll();
}
