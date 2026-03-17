import { get, set, escapeHTML, sanitizeURL } from './storage.js';
import { setupDrag } from './drag.js';

// ============================================================
//  QUOTES
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
  { text: "Not all those who wander are lost.", author: "J.R.R. Tolkien" },
  { text: "The secret of getting ahead is getting started.", author: "Mark Twain" },
  { text: "You must be the change you wish to see in the world.", author: "Mahatma Gandhi" },
  { text: "Wherever you go, go with all your heart.", author: "Confucius" },
  { text: "Believe you can and you're halfway there.", author: "Theodore Roosevelt" },
  { text: "Act as if what you do makes a difference. It does.", author: "William James" },
  { text: "Start where you are. Use what you have. Do what you can.", author: "Arthur Ashe" },
  { text: "Keep your face always toward the sunshine and shadows will fall behind you.", author: "Walt Whitman" }
];

function getDailyQuote() {
  const today = new Date();
  const dayOfYear = Math.floor((today - new Date(today.getFullYear(), 0, 0)) / 86400000);
  return QUOTES[dayOfYear % QUOTES.length];
}

// ============================================================
//  ICONS
// ============================================================

const ICONS = {
  quote: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 21c3 0 7-1 7-8V5c0-1.25-.756-2.017-2-2H4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2 1 0 1 0 1 1v1c0 1-1 2-2 2s-1 .008-1 1.031V20c0 1 0 1 1 1z"/><path d="M15 21c3 0 7-1 7-8V5c0-1.25-.757-2.017-2-2h-4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2h.75c0 2.25.25 4-2.75 4v3c0 1 0 1 1 1z"/></svg>',
  timer: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>',
  notepad: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>',
  youtube: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M2.5 17a24.12 24.12 0 0 1 0-10 2 2 0 0 1 1.4-1.4 49.56 49.56 0 0 1 16.2 0A2 2 0 0 1 21.5 7a24.12 24.12 0 0 1 0 10 2 2 0 0 1-1.4 1.4 49.55 49.55 0 0 1-16.2 0A2 2 0 0 1 2.5 17"/><path d="m10 15 5-3-5-3z"/></svg>',
  worldclock: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>',
  countdown: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 22h14"/><path d="M5 2h14"/><path d="M17 22v-4.172a2 2 0 0 0-.586-1.414L12 12l-4.414 4.414A2 2 0 0 0 7 17.828V22"/><path d="M7 2v4.172a2 2 0 0 0 .586 1.414L12 12l4.414-4.414A2 2 0 0 0 17 6.172V2"/></svg>',
  bookmark: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z"/></svg>',
  dice: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><path d="M16 8h.01"/><path d="M12 12h.01"/><path d="M8 16h.01"/></svg>',
  calculator: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect width="16" height="20" x="4" y="2" rx="2"/><line x1="8" x2="16" y1="6" y2="6"/><line x1="16" x2="16.01" y1="10" y2="10"/><line x1="12" x2="12.01" y1="10" y2="10"/><line x1="8" x2="8.01" y1="10" y2="10"/><line x1="12" x2="12.01" y1="14" y2="14"/><line x1="8" x2="8.01" y1="14" y2="14"/><line x1="12" x2="12.01" y1="18" y2="18"/><line x1="8" x2="8.01" y1="18" y2="18"/></svg>',
  todo: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>',
  habit: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M8 2v4"/><path d="M16 2v4"/><rect width="18" height="18" x="3" y="4" rx="2"/><path d="M3 10h18"/><path d="m9 16 2 2 4-4"/></svg>',
  converter: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M16 3h5v5"/><path d="M8 3H3v5"/><path d="M12 22v-8.3a4 4 0 0 0-1.172-2.872L3 3"/><path d="m15 9 6-6"/></svg>',
  palette: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="13.5" cy="6.5" r=".5"/><circle cx="17.5" cy="10.5" r=".5"/><circle cx="8.5" cy="7.5" r=".5"/><circle cx="6.5" cy="12.5" r=".5"/><path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.555-2.503 5.555-5.554C21.965 6.012 17.461 2 12 2z"/></svg>',
  breathe: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="4"/></svg>',
  plus: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>',
  close: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>',
  settings: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06A1.65 1.65 0 0 0 19.32 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>',
  search: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>',
  externalLink: '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>',
  trash: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>',
  check: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="20 6 9 17 4 12"/></svg>',
  password: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>',
  texttools: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="4 7 4 4 20 4 20 7"/><line x1="9" y1="20" x2="15" y2="20"/><line x1="12" y1="4" x2="12" y2="20"/></svg>',
  base64: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M16 18l6-6-6-6"/><path d="M8 6l-6 6 6 6"/></svg>',
  lorem: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="17" y1="10" x2="3" y2="10"/><line x1="21" y1="6" x2="3" y2="6"/><line x1="21" y1="14" x2="3" y2="14"/><line x1="17" y1="18" x2="3" y2="18"/></svg>',
  weather: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z"/></svg>',
  snake: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="2" width="20" height="20" rx="2"/><path d="M6 12h4l2-4 2 8 2-4h2"/></svg>',
  netinfo: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12.55a11 11 0 0 1 14.08 0"/><path d="M1.42 9a16 16 0 0 1 21.16 0"/><path d="M8.53 16.11a6 6 0 0 1 6.95 0"/><line x1="12" y1="20" x2="12.01" y2="20"/></svg>',
  tabmemory: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>',
  flashmath: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>',
  timetrack: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/><path d="M22 12h-2"/><path d="M4 12H2"/></svg>',
  readinglist: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>',
  idlegame: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2l3 5H9l3-5zM9 7h6v12H9V7zm-2 4h2m6 0h2m-6 4h2m2 0h2m-10 4h10"/></svg>',
  lectio: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/><line x1="8" y1="7" x2="16" y2="7"/><line x1="8" y1="11" x2="14" y2="11"/></svg>'
};

// ============================================================
//  WIDGET DEFINITIONS — categorized
// ============================================================

const CATEGORIES = {
  skole: 'Skole',
  produktivitet: 'Produktivitet',
  vaerktoejer: 'Værktøjer',
  info: 'Info & Underholdning'
};

const WIDGET_DEFS = {
  // ---- SKOLE ----
  lectio: {
    name: 'Lectio',
    description: 'Skema, lektier, opgaver og karakterer fra Lectio',
    icon: 'lectio', category: 'skole',
    defaultConfig: { schoolId: '', sessionId: '', autoKey: '', elevId: '' },
    render: renderLectio, hasSettings: true
  },

  // ---- PRODUKTIVITET ----
  timer: {
    name: 'Fokus Timer',
    description: 'Pomodoro-timer med presets',
    icon: 'timer', category: 'produktivitet',
    defaultConfig: {}, render: renderTimer
  },
  notepad: {
    name: 'Hurtige noter',
    description: 'Skriveblok til hurtige tanker',
    icon: 'notepad', category: 'produktivitet',
    defaultConfig: {}, render: renderNotepad
  },
  todolist: {
    name: 'Huskeliste',
    description: 'To-do liste med afkrydsning',
    icon: 'todo', category: 'produktivitet',
    defaultConfig: {}, render: renderTodoList
  },
  habits: {
    name: 'Vane Tracker',
    description: 'Spor daglige vaner og byg streaks',
    icon: 'habit', category: 'produktivitet',
    defaultConfig: { habits: ['Træning', 'Læsning', 'Meditation'] },
    render: renderHabits, hasSettings: true
  },
  bookmarks: {
    name: 'Bogmærker',
    description: 'Hurtige genveje til yndlingssider',
    icon: 'bookmark', category: 'produktivitet',
    defaultConfig: { links: [] },
    render: renderBookmarks, hasSettings: true
  },

  // ---- VÆRKTØJER ----
  calculator: {
    name: 'Lommeregner',
    description: 'Hurtig beregner',
    icon: 'calculator', category: 'vaerktoejer',
    defaultConfig: {}, render: renderCalculator
  },
  unitconverter: {
    name: 'Enhedskonverter',
    description: 'Konverter vægt, længde og temperatur',
    icon: 'converter', category: 'vaerktoejer',
    defaultConfig: {}, render: renderUnitConverter
  },
  colorpicker: {
    name: 'Farvevælger',
    description: 'Generér eller vælg farver',
    icon: 'palette', category: 'vaerktoejer',
    defaultConfig: {}, render: renderColorPicker
  },
  breathe: {
    name: 'Åndedræt',
    description: 'Guidet åndedrætsøvelse (4-4-4)',
    icon: 'breathe', category: 'vaerktoejer',
    defaultConfig: {}, render: renderBreathe
  },
  idlegame: {
    name: 'Lanterne Idle',
    description: 'Saml lys og opgrader din lanterne',
    icon: 'idlegame', category: 'info',
    defaultConfig: {}, render: renderIdleGame
  },
  // ---- INFO & UNDERHOLDNING ----
  quote: {
    name: 'Dagens citat',
    description: 'Et nyt inspirerende citat hver dag',
    icon: 'quote', category: 'info',
    defaultConfig: {}, render: renderQuote
  },
  youtube: {
    name: 'YouTube',
    description: 'Afspil YouTube videoer direkte',
    icon: 'youtube', category: 'info',
    defaultConfig: { videoUrl: '' },
    render: renderYouTube, hasSettings: true
  },
  worldclock: {
    name: 'Verdensur',
    description: 'Se klokken i andre tidszoner',
    icon: 'worldclock', category: 'info',
    defaultConfig: {
      zones: [
        { label: 'New York', tz: 'America/New_York' },
        { label: 'London', tz: 'Europe/London' },
        { label: 'Tokyo', tz: 'Asia/Tokyo' }
      ]
    },
    render: renderWorldClock, hasSettings: true
  },
  countdown: {
    name: 'Nedtælling',
    description: 'Tæl ned til en vigtig dato',
    icon: 'countdown', category: 'info',
    defaultConfig: { targetDate: '', label: 'Min begivenhed' },
    render: renderCountdown, hasSettings: true
  },
  randomizer: {
    name: 'Tilfældighedsgenerator',
    description: 'Terning, mønt og tilfældige tal',
    icon: 'dice', category: 'info',
    defaultConfig: {}, render: renderRandomizer
  },

  // ---- VÆRKTØJER (nye) ----
  password: {
    name: 'Kodeordsgenerator',
    description: 'Generér sikre tilfældige kodeord',
    icon: 'password', category: 'vaerktoejer',
    defaultConfig: {}, render: renderPassword
  },
  texttools: {
    name: 'Tekstværktøjer',
    description: 'Ordtæller, tegntæller og tekstkonvertering',
    icon: 'texttools', category: 'vaerktoejer',
    defaultConfig: {}, render: renderTextTools
  },
  base64: {
    name: 'Base64',
    description: 'Encode og decode Base64 tekst',
    icon: 'base64', category: 'vaerktoejer',
    defaultConfig: {}, render: renderBase64
  },
  lorem: {
    name: 'Lorem Ipsum',
    description: 'Generér placeholder-tekst',
    icon: 'lorem', category: 'vaerktoejer',
    defaultConfig: {}, render: renderLorem
  },

  // ---- INFO & UNDERHOLDNING (nye) ----
  deepweather: {
    name: 'Dybdegående Vejr',
    description: 'Detaljeret vejrudsigt med vind, fugt og UV',
    icon: 'weather', category: 'info',
    defaultConfig: {}, render: renderDeepWeather
  },
  snake: {
    name: 'Snake',
    description: 'Klassisk snake-spil direkte i din widget',
    icon: 'snake', category: 'info',
    defaultConfig: {}, render: renderSnake
  },
  netinfo: {
    name: 'Internetinformation',
    description: 'Vis din IP, forbindelsestype og hastighed',
    icon: 'netinfo', category: 'info',
    defaultConfig: {}, render: renderNetInfo
  },
  tabmemory: {
    name: 'Fane Hukommelse',
    description: 'Vis hukommelsesforbrug for åbne faner',
    icon: 'tabmemory', category: 'info',
    defaultConfig: {}, render: renderTabMemory
  },

  // ---- NYE PRODUKTIVITETS-WIDGETS ----
  flashmath: {
    name: 'Hurtig-matematik',
    description: 'Mentale regnestykker for skarp hjerne',
    icon: 'flashmath', category: 'produktivitet',
    defaultConfig: {}, render: renderFlashMath
  },
  timetrack: {
    name: 'Tidsregistrering',
    description: 'Log hvad du bruger tid på',
    icon: 'timetrack', category: 'produktivitet',
    defaultConfig: {}, render: renderTimeTrack
  },
  readinglist: {
    name: 'Læseliste',
    description: 'Gem artikler og links til senere',
    icon: 'readinglist', category: 'produktivitet',
    defaultConfig: {}, render: renderReadingList
  }
};

const DEFAULT_ENABLED = ['quote', 'timer', 'notepad'];

// ============================================================
//  RENDERERS
// ============================================================

function renderQuote(container) {
  const q = getDailyQuote();
  container.innerHTML = `<div class="widget-body widget-quote-body"><blockquote class="quote-text">"${q.text}"</blockquote><cite class="quote-author">&mdash; ${q.author}</cite></div>`;
}

async function renderTimer(container) {
  let ts = await get('timerState', { running: false, paused: false, endTime: null, duration: 25, remaining: 0 });
  let intId = null;

  function render() {
    let rem = 0, run = false, paused = ts.paused || false;

    if (paused && ts.remaining > 0) {
      rem = ts.remaining;
    } else if (ts.running && ts.endTime) {
      rem = Math.max(0, ts.endTime - Date.now());
      run = rem > 0;
      if (!run) { ts.running = false; ts.paused = false; set('timerState', ts); }
    }

    const active = run || paused;
    const m = Math.floor(rem / 60000), s = Math.floor((rem % 60000) / 1000);
    const prog = active ? (1 - rem / (ts.duration * 60000)) * 100 : 0;

    container.innerHTML = `<div class="widget-body widget-timer-body ${run ? 'timer-active' : ''}">
      <div class="timer-display">${active
        ? `<span class="timer-time">${String(m).padStart(2, '0')}<span class="timer-colon">:</span><span class="timer-seconds">${String(s).padStart(2, '0')}</span></span>`
        : `<span class="timer-label">Fokus</span>`}</div>
      ${active
        ? `<div class="timer-progress"><div class="timer-progress-bar" style="width:${prog}%"></div></div>
           <div class="timer-presets">
             <button class="timer-btn timer-pause">${paused ? 'Fortsæt' : 'Pause'}</button>
             <button class="timer-btn timer-stop">Stop</button>
           </div>`
        : `<div class="timer-presets">${[5, 15, 25, 45].map(v => `<button class="timer-preset" data-min="${v}">${v}m</button>`).join('')}</div>
           <div class="timer-presets"><button class="timer-preset" data-min="60">60m</button></div>`}
    </div>`;

    if (active) {
      container.querySelector('.timer-pause').addEventListener('click', async () => {
        if (paused) {
          ts = { running: true, paused: false, endTime: Date.now() + ts.remaining, duration: ts.duration, remaining: 0 };
          await set('timerState', ts); startInt(); render();
        } else {
          const remaining = Math.max(0, ts.endTime - Date.now());
          ts = { running: false, paused: true, endTime: null, duration: ts.duration, remaining };
          await set('timerState', ts); clearInterval(intId); render();
        }
      });
      container.querySelector('.timer-stop').addEventListener('click', async () => {
        ts = { running: false, paused: false, endTime: null, duration: 25, remaining: 0 };
        await set('timerState', ts); clearInterval(intId); render();
      });
    } else {
      container.querySelectorAll('.timer-preset').forEach(btn => {
        btn.addEventListener('click', async () => {
          const min = parseInt(btn.dataset.min);
          ts = { running: true, paused: false, endTime: Date.now() + min * 60000, duration: min, remaining: 0 };
          await set('timerState', ts); startInt(); render();
        });
      });
    }
  }
  function startInt() { clearInterval(intId); intId = setInterval(() => { if (!container.isConnected) { clearInterval(intId); return; } render(); }, 1000); }
  if (ts.running && ts.endTime > Date.now()) startInt();
  render();
}

async function renderNotepad(container) {
  const note = await get('quickNote', '');
  container.innerHTML = `<div class="widget-body widget-notepad-body"><textarea class="notepad-textarea" placeholder="Hurtige noter...">${note}</textarea></div>`;
  const ta = container.querySelector('.notepad-textarea');
  let db;
  ta.addEventListener('input', () => { clearTimeout(db); db = setTimeout(() => set('quickNote', ta.value), 300); ta.style.height = 'auto'; ta.style.height = Math.min(ta.scrollHeight, 150) + 'px'; });
  if (note) setTimeout(() => { ta.style.height = 'auto'; ta.style.height = Math.min(ta.scrollHeight, 150) + 'px'; }, 50);
}

function renderYouTube(container, config) {
  const url = config.videoUrl || '';
  const videoId = extractYouTubeId(url);

  function buildPlayer(id) {
    if (!id) return '';
    return `<div class="youtube-player-wrap"><iframe class="youtube-iframe" src="https://www.youtube.com/embed/${id}" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe></div>`;
  }

  container.innerHTML = `<div class="widget-body widget-youtube-body">
    ${buildPlayer(videoId)}
    <div class="youtube-search-row">
      <input type="text" class="youtube-search-input" placeholder="Inds\u00e6t YouTube URL eller s\u00f8g..." value="${url}" />
      <button class="youtube-search-btn" title="Afspil / S\u00f8g">${ICONS.search}</button>
      <button class="youtube-open-btn" title="\u00c5bn p\u00e5 YouTube">${ICONS.externalLink}</button>
    </div>
  </div>`;

  const input = container.querySelector('.youtube-search-input');
  const body = container.querySelector('.widget-youtube-body');

  async function persistVideoUrl(val) {
    const configs = await get('widgetConfigs', {});
    configs.youtube = { ...(configs.youtube || {}), videoUrl: val };
    await set('widgetConfigs', configs);
  }

  function loadVideo(val) {
    if (!val) return;
    const id = extractYouTubeId(val);
    if (id) {
      // Remove existing player
      const old = body.querySelector('.youtube-player-wrap');
      if (old) old.remove();
      // Insert new player before search row
      const searchRow = body.querySelector('.youtube-search-row');
      searchRow.insertAdjacentHTML('beforebegin', buildPlayer(id));
      // Save the URL so it persists across tabs
      persistVideoUrl(val);
    } else {
      // Not a URL — search on YouTube
      window.open(`https://www.youtube.com/results?search_query=${encodeURIComponent(val)}`, '_blank');
    }
  }

  container.querySelector('.youtube-open-btn').addEventListener('click', () => {
    const id = extractYouTubeId(input.value.trim());
    window.open(id ? `https://www.youtube.com/watch?v=${id}` : 'https://www.youtube.com', '_blank');
  });

  container.querySelector('.youtube-search-btn').addEventListener('click', () => loadVideo(input.value.trim()));
  input.addEventListener('keydown', (e) => { if (e.key === 'Enter') { e.preventDefault(); loadVideo(input.value.trim()); } });
}

function extractYouTubeId(url) {
  if (!url) return null;
  for (const p of [/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/, /^([a-zA-Z0-9_-]{11})$/]) {
    const m = url.match(p); if (m) return m[1];
  }
  return null;
}

function renderWorldClock(container, config) {
  const zones = config.zones || [];
  function render() {
    const now = new Date();
    container.innerHTML = `<div class="widget-body widget-worldclock-body">${zones.map(z => {
      let t; try { t = now.toLocaleTimeString('da-DK', { timeZone: z.tz, hour: '2-digit', minute: '2-digit', second: '2-digit' }); } catch { t = '--:--'; }
      return `<div class="worldclock-zone"><span class="worldclock-label">${z.label}</span><span class="worldclock-time">${t}</span></div>`;
    }).join('')}</div>`;
  }
  render(); 
  const intId = setInterval(() => {
    if (!container.isConnected) { clearInterval(intId); return; }
    render();
  }, 1000);
}

function renderCountdown(container, config) {
  const target = config.targetDate ? new Date(config.targetDate) : null;
  const label = config.label || 'Begivenhed';
  if (!target || isNaN(target.getTime())) {
    container.innerHTML = `<div class="widget-body widget-countdown-body widget-empty-state"><div class="widget-empty-icon">${ICONS.countdown}</div><p>Indstil en dato</p><p class="widget-empty-hint">Brug tandhjulet for at vælge</p></div>`;
    return;
  }
  function render() {
    const diff = target.getTime() - Date.now();
    if (diff <= 0) { container.innerHTML = `<div class="widget-body widget-countdown-body"><div class="countdown-label">${label}</div><div class="countdown-reached">Det er i dag!</div></div>`; return; }
    const d = Math.floor(diff / 86400000), h = Math.floor((diff % 86400000) / 3600000), min = Math.floor((diff % 3600000) / 60000);
    container.innerHTML = `<div class="widget-body widget-countdown-body"><div class="countdown-label">${label}</div><div class="countdown-grid"><div class="countdown-unit"><span class="countdown-number">${d}</span><span class="countdown-unit-label">dage</span></div><div class="countdown-unit"><span class="countdown-number">${h}</span><span class="countdown-unit-label">timer</span></div><div class="countdown-unit"><span class="countdown-number">${min}</span><span class="countdown-unit-label">min</span></div></div></div>`;
  }
  render();
  const intId = setInterval(() => {
    if (!container.isConnected) { clearInterval(intId); return; }
    render();
  }, 60000);
}

function renderBookmarks(container, config) {
  const links = config.links || [];
  container.innerHTML = `<div class="widget-body widget-bookmarks-body">${links.length === 0
    ? `<div class="widget-empty-state"><div class="widget-empty-icon">${ICONS.bookmark}</div><p>Ingen bogmærker</p><p class="widget-empty-hint">Brug tandhjulet for at tilføje</p></div>`
    : `<div class="bookmarks-list">${links.map(l => { const u = sanitizeUrl(l.url); let h = ''; try { h = new URL(u).hostname } catch { } return `<a href="${u}" class="bookmark-item"><img class="bookmark-favicon" src="https://www.google.com/s2/favicons?domain=${encodeURIComponent(h)}&sz=32" alt="" width="16" height="16" /><span>${l.name}</span></a>`; }).join('')}</div>`
    }</div>`;
}

function sanitizeUrl(url) { if (!url) return '#'; if (!/^https?:\/\//i.test(url)) return 'https://' + url; return url; }

function renderRandomizer(container) {
  container.innerHTML = `<div class="widget-body widget-randomizer-body"><div class="randomizer-result">?</div><div class="randomizer-actions"><button class="randomizer-btn" data-type="dice">${ICONS.dice} <span>Terning</span></button><button class="randomizer-btn" data-type="coin"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="8"/></svg><span>Mønt</span></button><button class="randomizer-btn" data-type="number"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="4" y="4" width="16" height="16" rx="2"/></svg><span>1-100</span></button></div></div>`;
  const r = container.querySelector('.randomizer-result');
  container.querySelectorAll('.randomizer-btn').forEach(btn => {
    btn.addEventListener('click', () => { r.classList.add('randomizer-spin'); setTimeout(() => { r.classList.remove('randomizer-spin'); const t = btn.dataset.type; r.textContent = t === 'dice' ? Math.ceil(Math.random() * 6) : t === 'coin' ? (Math.random() < 0.5 ? 'Plat' : 'Krone') : Math.ceil(Math.random() * 100); }, 300); });
  });
}

// ---- CALCULATOR (safe expression evaluator) ----
// Recursive descent parser — no eval/Function needed
function evalTokens(tokens) {
  let pos = 0;
  function peek() { return tokens[pos]; }
  function next() { return tokens[pos++]; }
  function parseExpr() {
    let val = parseTerm();
    while (peek() === '+' || peek() === '-') {
      const op = next();
      const r = parseTerm();
      val = op === '+' ? val + r : val - r;
    }
    return val;
  }
  function parseTerm() {
    let val = parseFactor();
    while (peek() === '*' || peek() === '/') {
      const op = next();
      const r = parseFactor();
      val = op === '*' ? val * r : val / r;
    }
    return val;
  }
  function parseFactor() {
    if (peek() === '(') { next(); const val = parseExpr(); if (peek() === ')') next(); return val; }
    if (peek() === '-') { next(); return -parseFactor(); }
    return parseFloat(next()) || 0;
  }
  return parseExpr();
}

function renderCalculator(container) {
  container.innerHTML = `<div class="widget-body widget-calc-body"><div class="calc-display">0</div><div class="calc-grid">
    <button class="calc-btn calc-op" data-v="C">C</button><button class="calc-btn calc-op" data-v="(">(</button><button class="calc-btn calc-op" data-v=")">)</button><button class="calc-btn calc-op calc-accent" data-v="/">÷</button>
    <button class="calc-btn" data-v="7">7</button><button class="calc-btn" data-v="8">8</button><button class="calc-btn" data-v="9">9</button><button class="calc-btn calc-op calc-accent" data-v="*">×</button>
    <button class="calc-btn" data-v="4">4</button><button class="calc-btn" data-v="5">5</button><button class="calc-btn" data-v="6">6</button><button class="calc-btn calc-op calc-accent" data-v="-">−</button>
    <button class="calc-btn" data-v="1">1</button><button class="calc-btn" data-v="2">2</button><button class="calc-btn" data-v="3">3</button><button class="calc-btn calc-op calc-accent" data-v="+">+</button>
    <button class="calc-btn calc-zero" data-v="0">0</button><button class="calc-btn" data-v=".">.</button><button class="calc-btn calc-op calc-equals" data-v="=">=</button>
  </div></div>`;

  const display = container.querySelector('.calc-display');
  let expr = '', justCalc = false;

  container.querySelectorAll('.calc-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const v = btn.dataset.v;
      if (v === 'C') { expr = ''; display.textContent = '0'; justCalc = false; return; }
      if (v === '=') {
        try {
          // Only allow safe math characters
          const safe = expr.replace(/[^0-9+\-*/().]/g, '');
          if (!safe) { display.textContent = '0'; return; }
          const tokens = safe.match(/(\d+\.?\d*|[+\-*/()])/g);
          if (!tokens) { display.textContent = '0'; return; }
          const result = evalTokens(tokens);
          if (typeof result === 'number' && isFinite(result)) {
            display.textContent = parseFloat(result.toFixed(10));
            expr = String(result);
          } else {
            display.textContent = 'Fejl';
            expr = '';
          }
        } catch {
          display.textContent = 'Fejl';
          expr = '';
        }
        justCalc = true;
        return;
      }
      // Start fresh after calculation if typing a number
      if (justCalc && /[0-9.]/.test(v)) { expr = ''; }
      justCalc = false;
      expr += v;
      // Show a readable version
      display.textContent = expr.replace(/\*/g, '×').replace(/\//g, '÷');
    });
  });
}

// ---- BREATHE ----
function renderBreathe(container) {
  container.innerHTML = `<div class="widget-body widget-breathe-body"><div class="breathe-circle"><div class="breathe-inner">Klar</div></div><button class="breathe-start-btn">Start øvelse</button></div>`;
  const circle = container.querySelector('.breathe-circle'), inner = container.querySelector('.breathe-inner'), btn = container.querySelector('.breathe-start-btn');
  let running = false, tid = null;
  function run(ph) {
    if (!running) return;
    if (ph === 'in') { inner.textContent = 'Indånd...'; circle.className = 'breathe-circle breathe-inhale'; tid = setTimeout(() => run('hold'), 4000); }
    else if (ph === 'hold') { inner.textContent = 'Hold...'; circle.className = 'breathe-circle breathe-hold'; tid = setTimeout(() => run('out'), 4000); }
    else { inner.textContent = 'Udånd...'; circle.className = 'breathe-circle breathe-exhale'; tid = setTimeout(() => run('in'), 4000); }
  }
  btn.addEventListener('click', () => {
    if (running) { running = false; clearTimeout(tid); circle.className = 'breathe-circle'; inner.textContent = 'Klar'; btn.textContent = 'Start øvelse'; }
    else { running = true; btn.textContent = 'Stop'; run('in'); }
  });
}

// ---- TODO LIST ----
async function renderTodoList(container) {
  let todos = await get('widgetTodos', []);
  function render() {
    container.innerHTML = `<div class="widget-body widget-todolist-body"><div class="todo-input-row"><input type="text" class="todo-input" placeholder="Ny opgave..." maxlength="60" /><button class="todo-add-btn">${ICONS.plus}</button></div><div class="todo-items">${todos.map((t, i) => `<div class="todo-item ${t.done ? 'todo-done' : ''}" data-idx="${i}"><button class="todo-check">${t.done ? ICONS.check : ''}</button><span class="todo-text">${t.text}</span><button class="todo-delete" title="Slet">${ICONS.trash}</button></div>`).join('')}${todos.length === 0 ? '<div class="todo-empty">Ingen opgaver endnu</div>' : ''}</div></div>`;
    const input = container.querySelector('.todo-input');
    function add() { const t = input.value.trim(); if (!t) return; todos.push({ text: t, done: false }); set('widgetTodos', todos); render(); }
    container.querySelector('.todo-add-btn').addEventListener('click', add);
    input.addEventListener('keydown', e => { if (e.key === 'Enter') add(); });
    container.querySelectorAll('.todo-check').forEach(b => b.addEventListener('click', () => { const i = parseInt(b.closest('.todo-item').dataset.idx); todos[i].done = !todos[i].done; set('widgetTodos', todos); render(); }));
    container.querySelectorAll('.todo-delete').forEach(b => b.addEventListener('click', () => { todos.splice(parseInt(b.closest('.todo-item').dataset.idx), 1); set('widgetTodos', todos); render(); }));
  }
  render();
}

// ---- HABITS ----
async function renderHabits(container, config) {
  const names = config.habits || ['Træning', 'Læsning', 'Meditation'];
  const today = new Date().toISOString().split('T')[0];
  let data = await get('habitData', {});
  if (!data[today]) data[today] = {};
  function streak(h) { let s = 0; const d = new Date(); if (data[today]?.[h]) s++; else return 0; for (let i = 1; i <= 30; i++) { d.setDate(d.getDate() - 1); if (data[d.toISOString().split('T')[0]]?.[h]) s++; else break; } return s; }
  function render() {
    container.innerHTML = `<div class="widget-body widget-habits-body">${names.map(h => { const done = data[today]?.[h] || false; const s = streak(h); return `<div class="habit-row ${done ? 'habit-done' : ''}" data-habit="${h}"><button class="habit-check">${done ? ICONS.check : ''}</button><span class="habit-name">${h}</span>${s > 0 ? `<span class="habit-streak">${s}d</span>` : ''}</div>`; }).join('')}</div>`;
    container.querySelectorAll('.habit-check').forEach(b => b.addEventListener('click', async () => { const h = b.closest('.habit-row').dataset.habit; data[today][h] = !data[today][h]; await set('habitData', data); render(); }));
  }
  render();
}

// ---- UNIT CONVERTER ----
function renderUnitConverter(container) {
  const cats = {
    length: { name: 'Længde', units: { m: 'Meter', km: 'Kilometer', cm: 'Centimeter', mi: 'Miles', ft: 'Fod', in: 'Tommer' }, toBase: { m: 1, km: 1000, cm: 0.01, mi: 1609.344, ft: 0.3048, in: 0.0254 } },
    weight: { name: 'Vægt', units: { kg: 'Kilogram', g: 'Gram', lb: 'Pounds', oz: 'Ounces' }, toBase: { kg: 1, g: 0.001, lb: 0.453592, oz: 0.0283495 } },
    temp: { name: 'Temp', units: { c: 'Celsius', f: 'Fahrenheit', k: 'Kelvin' }, custom: true }
  };
  let cur = 'length';
  function render() {
    const cat = cats[cur], keys = Object.keys(cat.units);
    container.innerHTML = `<div class="widget-body widget-converter-body"><div class="converter-tabs">${Object.entries(cats).map(([k, c]) => `<button class="converter-tab ${k === cur ? 'active' : ''}" data-cat="${k}">${c.name}</button>`).join('')}</div><div class="converter-fields"><div class="converter-row"><input type="number" class="converter-input" id="conv-val" value="1" step="any" /><select class="converter-select" id="conv-from">${keys.map(u => `<option value="${u}">${cat.units[u]}</option>`).join('')}</select></div><div class="converter-arrow"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 5v14"/><path d="m19 12-7 7-7-7"/></svg></div><div class="converter-row"><input type="text" class="converter-input converter-result" id="conv-result" readonly /><select class="converter-select" id="conv-to">${keys.map((u, i) => `<option value="${u}" ${i === 1 ? 'selected' : ''}>${cat.units[u]}</option>`).join('')}</select></div></div></div>`;
    container.querySelectorAll('.converter-tab').forEach(t => t.addEventListener('click', () => { cur = t.dataset.cat; render(); }));
    const val = container.querySelector('#conv-val'), from = container.querySelector('#conv-from'), to = container.querySelector('#conv-to'), res = container.querySelector('#conv-result');
    function conv() { const v = parseFloat(val.value); if (isNaN(v)) { res.value = ''; return; } let r; if (cur === 'temp') { let c; if (from.value === 'c') c = v; else if (from.value === 'f') c = (v - 32) * 5 / 9; else c = v - 273.15; r = to.value === 'c' ? c : to.value === 'f' ? c * 9 / 5 + 32 : c + 273.15; } else r = v * cat.toBase[from.value] / cat.toBase[to.value]; res.value = isFinite(r) ? parseFloat(r.toFixed(6)) : ''; }
    val.addEventListener('input', conv); from.addEventListener('change', conv); to.addEventListener('change', conv); conv();
  }
  render();
}

// ---- COLOR PICKER ----
function renderColorPicker(container) {
  function hsl(h, s, l) { s /= 100; l /= 100; const a = s * Math.min(l, 1 - l); const f = n => { const k = (n + h / 30) % 12; return Math.round(255 * (l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1))).toString(16).padStart(2, '0') }; return `#${f(0)}${f(8)}${f(4)}`; }
  function gen() { const b = Math.floor(Math.random() * 360), c = []; const s = ['a', 'c', 't', 's'][Math.floor(Math.random() * 4)]; if (s === 'a') for (let i = 0; i < 5; i++)c.push(hsl((b + i * 25) % 360, 55 + Math.random() * 20, 45 + Math.random() * 20)); else if (s === 'c') { c.push(hsl(b, 60, 40), hsl(b, 50, 55), hsl(b, 40, 70), hsl((b + 180) % 360, 55, 45), hsl((b + 180) % 360, 45, 60)) } else if (s === 't') for (let i = 0; i < 5; i++)c.push(hsl((b + Math.floor(i / 2) * 120 + (i % 2) * 15) % 360, 55 + Math.random() * 15, 45 + Math.random() * 15)); else { c.push(hsl(b, 60, 45), hsl(b, 50, 60), hsl((b + 150) % 360, 55, 50), hsl((b + 210) % 360, 55, 50), hsl(b, 20, 85)) } return c; }
  let pal = gen();
  function render() {
    container.innerHTML = `<div class="widget-body widget-color-body"><div class="color-palette">${pal.map(c => `<button class="color-swatch" style="background:${c}" data-color="${c}" title="Klik for at kopiere: ${c}"><span class="color-hex">${c}</span></button>`).join('')}</div><button class="color-generate-btn">Ny palet</button><div class="color-copied" style="display:none"></div></div>`;
    container.querySelector('.color-generate-btn').addEventListener('click', () => { pal = gen(); render(); });
    container.querySelectorAll('.color-swatch').forEach(s => s.addEventListener('click', () => { navigator.clipboard.writeText(s.dataset.color).then(() => { const c = container.querySelector('.color-copied'); c.style.display = 'block'; c.textContent = s.dataset.color + ' kopieret!'; setTimeout(() => c.style.display = 'none', 1500); }); }));
  }
  render();
}

// ============================================================
//  PASSWORD GENERATOR
// ============================================================

function renderPassword(container) {
  let length = 16;
  let opts = { upper: true, lower: true, digits: true, symbols: true };

  function generate() {
    const chars = [];
    if (opts.lower) chars.push('abcdefghijklmnopqrstuvwxyz');
    if (opts.upper) chars.push('ABCDEFGHIJKLMNOPQRSTUVWXYZ');
    if (opts.digits) chars.push('0123456789');
    if (opts.symbols) chars.push('!@#$%^&*_-+=?');
    const pool = chars.join('');
    if (!pool) return '---';
    const arr = new Uint32Array(length);
    crypto.getRandomValues(arr);
    return Array.from(arr, v => pool[v % pool.length]).join('');
  }

  function render() {
    const pw = generate();
    container.innerHTML = `<div class="widget-body widget-password-body">
      <div class="pw-output" title="Klik for at kopiere">${pw}</div>
      <div class="pw-strength">${length >= 20 ? 'Meget stærkt' : length >= 14 ? 'Stærkt' : length >= 10 ? 'Medium' : 'Svagt'}</div>
      <div class="pw-controls">
        <label class="pw-length-label">Længde: <strong>${length}</strong></label>
        <input type="range" class="pw-range" min="4" max="64" value="${length}" />
      </div>
      <div class="pw-toggles">
        <label class="pw-toggle"><input type="checkbox" ${opts.upper ? 'checked' : ''} data-opt="upper" /> A-Z</label>
        <label class="pw-toggle"><input type="checkbox" ${opts.lower ? 'checked' : ''} data-opt="lower" /> a-z</label>
        <label class="pw-toggle"><input type="checkbox" ${opts.digits ? 'checked' : ''} data-opt="digits" /> 0-9</label>
        <label class="pw-toggle"><input type="checkbox" ${opts.symbols ? 'checked' : ''} data-opt="symbols" /> !@#</label>
      </div>
      <div class="pw-actions">
        <button class="pw-btn pw-copy">Kopiér</button>
        <button class="pw-btn pw-regen">Ny</button>
      </div>
      <div class="pw-copied" style="display:none">Kopieret!</div>
    </div>`;

    container.querySelector('.pw-output').addEventListener('click', () => copyPw());
    container.querySelector('.pw-copy').addEventListener('click', () => copyPw());
    container.querySelector('.pw-regen').addEventListener('click', () => render());
    container.querySelector('.pw-range').addEventListener('input', e => {
      length = parseInt(e.target.value);
      render();
    });
    container.querySelectorAll('.pw-toggles input').forEach(cb => {
      cb.addEventListener('change', () => { opts[cb.dataset.opt] = cb.checked; render(); });
    });

    function copyPw() {
      navigator.clipboard.writeText(pw).then(() => {
        const msg = container.querySelector('.pw-copied');
        msg.style.display = 'block';
        setTimeout(() => msg.style.display = 'none', 1500);
      });
    }
  }
  render();
}

// ============================================================
//  TEXT TOOLS
// ============================================================

function renderTextTools(container) {
  container.innerHTML = `<div class="widget-body widget-texttools-body">
    <textarea class="tt-textarea" placeholder="Indsæt tekst her..."></textarea>
    <div class="tt-stats">
      <span class="tt-stat">Ord: <strong>0</strong></span>
      <span class="tt-stat">Tegn: <strong>0</strong></span>
      <span class="tt-stat">Linjer: <strong>0</strong></span>
    </div>
    <div class="tt-actions">
      <button class="tt-btn" data-action="upper">STORE</button>
      <button class="tt-btn" data-action="lower">sm&aring;</button>
      <button class="tt-btn" data-action="title">Titel</button>
      <button class="tt-btn" data-action="reverse">Omvend</button>
      <button class="tt-btn" data-action="trim">Trim</button>
      <button class="tt-btn" data-action="copy">Kopi&eacute;r</button>
    </div>
  </div>`;

  const ta = container.querySelector('.tt-textarea');
  const stats = container.querySelectorAll('.tt-stat strong');

  function updateStats() {
    const t = ta.value;
    const words = t.trim() ? t.trim().split(/\s+/).length : 0;
    const chars = t.length;
    const lines = t ? t.split('\n').length : 0;
    stats[0].textContent = words;
    stats[1].textContent = chars;
    stats[2].textContent = lines;
  }

  ta.addEventListener('input', updateStats);

  container.querySelectorAll('.tt-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const a = btn.dataset.action;
      if (a === 'upper') ta.value = ta.value.toUpperCase();
      else if (a === 'lower') ta.value = ta.value.toLowerCase();
      else if (a === 'title') ta.value = ta.value.replace(/\b\w/g, c => c.toUpperCase());
      else if (a === 'reverse') ta.value = ta.value.split('').reverse().join('');
      else if (a === 'trim') ta.value = ta.value.replace(/\s+/g, ' ').trim();
      else if (a === 'copy') navigator.clipboard.writeText(ta.value);
      updateStats();
    });
  });
}

// ============================================================
//  BASE64 ENCODER/DECODER
// ============================================================

function renderBase64(container) {
  container.innerHTML = `<div class="widget-body widget-base64-body">
    <textarea class="b64-input" placeholder="Tekst at encode/decode..."></textarea>
    <div class="b64-actions">
      <button class="b64-btn b64-encode">Encode</button>
      <button class="b64-btn b64-decode">Decode</button>
      <button class="b64-btn b64-copy">Kopiér</button>
    </div>
    <textarea class="b64-output" placeholder="Resultat..." readonly></textarea>
  </div>`;

  const input = container.querySelector('.b64-input');
  const output = container.querySelector('.b64-output');

  container.querySelector('.b64-encode').addEventListener('click', () => {
    try { output.value = btoa(unescape(encodeURIComponent(input.value))); }
    catch { output.value = 'Fejl ved encoding'; }
  });
  container.querySelector('.b64-decode').addEventListener('click', () => {
    try { output.value = decodeURIComponent(escape(atob(input.value))); }
    catch { output.value = 'Ugyldig Base64'; }
  });
  container.querySelector('.b64-copy').addEventListener('click', () => {
    navigator.clipboard.writeText(output.value);
  });
}

// ============================================================
//  LOREM IPSUM GENERATOR
// ============================================================

function renderLorem(container) {
  const LOREM = [
    'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
    'Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
    'Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris.',
    'Duis aute irure dolor in reprehenderit in voluptate velit esse cillum.',
    'Excepteur sint occaecat cupidatat non proident, sunt in culpa.',
    'Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit.',
    'Neque porro quisquam est, qui dolorem ipsum quia dolor sit amet.',
    'Ut enim ad minima veniam, quis nostrum exercitationem ullam corporis.',
    'Quis autem vel eum iure reprehenderit qui in ea voluptate velit esse.',
    'At vero eos et accusamus et iusto odio dignissimos ducimus qui blanditiis.'
  ];

  let count = 3;
  let mode = 'paragraphs';

  function generate() {
    const result = [];
    for (let i = 0; i < count; i++) {
      if (mode === 'paragraphs') {
        const sentences = [];
        const num = 3 + Math.floor(Math.random() * 4);
        for (let j = 0; j < num; j++) sentences.push(LOREM[(i * 7 + j) % LOREM.length]);
        result.push(sentences.join(' '));
      } else {
        result.push(LOREM[i % LOREM.length]);
      }
    }
    return result.join(mode === 'paragraphs' ? '\n\n' : ' ');
  }

  function render() {
    const text = generate();
    container.innerHTML = `<div class="widget-body widget-lorem-body">
      <div class="lorem-controls">
        <select class="lorem-select">
          <option value="paragraphs" ${mode === 'paragraphs' ? 'selected' : ''}>Afsnit</option>
          <option value="sentences" ${mode === 'sentences' ? 'selected' : ''}>Sætninger</option>
        </select>
        <input type="number" class="lorem-count" value="${count}" min="1" max="20" />
        <button class="lorem-gen-btn">Generér</button>
      </div>
      <div class="lorem-output">${text}</div>
      <button class="lorem-copy-btn">Kopiér tekst</button>
    </div>`;

    container.querySelector('.lorem-select').addEventListener('change', e => { mode = e.target.value; });
    container.querySelector('.lorem-count').addEventListener('change', e => { count = Math.max(1, Math.min(20, parseInt(e.target.value) || 3)); });
    container.querySelector('.lorem-gen-btn').addEventListener('click', render);
    container.querySelector('.lorem-copy-btn').addEventListener('click', () => navigator.clipboard.writeText(text));
  }
  render();
}

// ============================================================
//  DEEP WEATHER
// ============================================================

async function renderDeepWeather(container) {
  container.innerHTML = `<div class="widget-body widget-deepweather-body"><div class="dw-loading">Henter vejrdata...</div></div>`;

  try {
    const pos = await new Promise((res, rej) => navigator.geolocation.getCurrentPosition(res, rej, { timeout: 5000 }));
    const { latitude: lat, longitude: lon } = pos.coords;
    const resp = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,wind_speed_10m,wind_direction_10m,weather_code,uv_index,surface_pressure&daily=temperature_2m_max,temperature_2m_min,weather_code&timezone=auto&forecast_days=5`);
    const data = await resp.json();
    const c = data.current;

    const weatherDesc = {
      0: 'Klar himmel', 1: 'Overvejende klar', 2: 'Delvist skyet', 3: 'Overskyet',
      45: 'Tåge', 48: 'Rimtåge', 51: 'Let regn', 53: 'Moderat regn', 55: 'Kraftig regn',
      61: 'Let regn', 63: 'Moderat regn', 65: 'Kraftig regn', 71: 'Let sne', 73: 'Moderat sne',
      75: 'Kraftig sne', 80: 'Regnbyger', 81: 'Moderate byger', 82: 'Voldsomme byger',
      95: 'Tordenvejr', 96: 'Tordenvejr m. hagl', 99: 'Kraftigt tordenvejr'
    };

    const windDir = ['N', 'NØ', 'Ø', 'SØ', 'S', 'SV', 'V', 'NV'];
    const dir = windDir[Math.round(c.wind_direction_10m / 45) % 8];

    const daily = data.daily;
    let forecastHTML = '';
    const dayNames = ['Søn', 'Man', 'Tir', 'Ons', 'Tor', 'Fre', 'Lør'];
    for (let i = 1; i < Math.min(5, daily.time.length); i++) {
      const d = new Date(daily.time[i]);
      forecastHTML += `<div class="dw-forecast-day">
        <span class="dw-day-name">${dayNames[d.getDay()]}</span>
        <span class="dw-day-temps">${Math.round(daily.temperature_2m_min[i])}° / ${Math.round(daily.temperature_2m_max[i])}°</span>
        <span class="dw-day-desc">${weatherDesc[daily.weather_code[i]] || '?'}</span>
      </div>`;
    }

    container.innerHTML = `<div class="widget-body widget-deepweather-body">
      <div class="dw-current">
        <div class="dw-temp">${Math.round(c.temperature_2m)}°C</div>
        <div class="dw-desc">${weatherDesc[c.weather_code] || 'Ukendt'}</div>
        <div class="dw-feels">Føles som ${Math.round(c.apparent_temperature)}°C</div>
      </div>
      <div class="dw-details">
        <div class="dw-detail"><span class="dw-detail-label">Vind</span><span class="dw-detail-value">${Math.round(c.wind_speed_10m)} km/t ${dir}</span></div>
        <div class="dw-detail"><span class="dw-detail-label">Fugtighed</span><span class="dw-detail-value">${c.relative_humidity_2m}%</span></div>
        <div class="dw-detail"><span class="dw-detail-label">UV-index</span><span class="dw-detail-value">${c.uv_index}</span></div>
        <div class="dw-detail"><span class="dw-detail-label">Lufttryk</span><span class="dw-detail-value">${Math.round(c.surface_pressure)} hPa</span></div>
      </div>
      <div class="dw-forecast">${forecastHTML}</div>
    </div>`;
  } catch (err) {
    container.innerHTML = `<div class="widget-body widget-deepweather-body">
      <div class="widget-empty-state">
        <div class="widget-empty-icon">${ICONS.weather}</div>
        <p>Kunne ikke hente vejrdata</p>
        <p class="widget-empty-hint">Tillad lokation for at se vejret</p>
      </div>
    </div>`;
  }
}

// ============================================================
//  SNAKE GAME
// ============================================================

function renderSnake(container) {
  const CELL = 12, COLS = 16, ROWS = 14;
  const W = COLS * CELL, H = ROWS * CELL;

  container.innerHTML = `<div class="widget-body widget-snake-body">
    <div class="snake-header">
      <span class="snake-score">Score: 0</span>
      <div class="snake-controls" style="display:flex; gap:0.4rem;">
        <button class="snake-pause-btn" style="display:none">Pause</button>
        <button class="snake-start-btn">Start</button>
      </div>
    </div>
    <canvas class="snake-canvas" width="${W}" height="${H}" tabindex="0"></canvas>
    <div class="snake-hint">Klik på spillet og brug piletaster</div>
  </div>`;

  const canvas = container.querySelector('.snake-canvas');
  const ctx = canvas.getContext('2d');
  const scoreEl = container.querySelector('.snake-score');
  const startBtn = container.querySelector('.snake-start-btn');
  const pauseBtn = container.querySelector('.snake-pause-btn');

  let snake = [{ x: 8, y: 7 }, { x: 7, y: 7 }, { x: 6, y: 7 }];
  let food = { x: 10, y: 7 };
  let dir = { x: 1, y: 0 };
  let nextDir = { ...dir };
  let score = 0, gameLoop = null, running = false, isPaused = false;

  function togglePause() {
    if (!running) return;
    isPaused = !isPaused;
    pauseBtn.textContent = isPaused ? 'Fortsæt' : 'Pause';
    if (!isPaused) canvas.focus();
  }

  function init() {
    snake = [{ x: 8, y: 7 }, { x: 7, y: 7 }, { x: 6, y: 7 }];
    dir = { x: 1, y: 0 }; 
    nextDir = { ...dir };
    score = 0; 
    running = true;
    isPaused = false;
    placeFood();
    scoreEl.textContent = 'Score: 0';
    startBtn.textContent = 'Genstart';
    pauseBtn.style.display = 'block';
    pauseBtn.textContent = 'Pause';
  }

  function placeFood() {
    do { food = { x: Math.floor(Math.random() * COLS), y: Math.floor(Math.random() * ROWS) }; }
    while (snake.some(s => s.x === food.x && s.y === food.y));
  }

  function draw() {
    if (!canvas.isConnected) return;
    
    // Clear everything first
    ctx.clearRect(0, 0, W, H);

    // Background - use a solid color to prevent transparency issues
    const isDark = document.documentElement.classList.contains('dark') || matchMedia('(prefers-color-scheme: dark)').matches;
    ctx.fillStyle = isDark ? '#1a1410' : '#f5f0e8';
    ctx.fillRect(0, 0, W, H);

    if (isPaused) {
      ctx.fillStyle = 'rgba(0,0,0,0.3)';
      ctx.fillRect(0, 0, W, H);
      ctx.fillStyle = '#fff';
      ctx.font = '14px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('PAUSED', W / 2, H / 2);
    }

    // Food
    ctx.fillStyle = '#e74c3c';
    ctx.beginPath();
    ctx.arc(food.x * CELL + CELL / 2, food.y * CELL + CELL / 2, CELL / 2 - 1, 0, Math.PI * 2);
    ctx.fill();

    // Snake
    const style = getComputedStyle(document.documentElement);
    let accent = style.getPropertyValue('--accent').trim();
    if (!accent || accent === 'initial') accent = '#d4a35a';
    
    snake.forEach((s, i) => {
      ctx.globalAlpha = i === 0 ? 1 : 0.8;
      ctx.fillStyle = accent;
      ctx.fillRect(s.x * CELL + 1, s.y * CELL + 1, CELL - 2, CELL - 2);
    });
    ctx.globalAlpha = 1;
  }

  function tick() {
    if (!running || isPaused || !canvas.isConnected) { 
      if (!canvas.isConnected) clearInterval(gameLoop);
      if (isPaused) draw();
      return; 
    }
    dir = { ...nextDir };
    const head = { x: snake[0].x + dir.x, y: snake[0].y + dir.y };

    // Wall collision — wrap around
    if (head.x < 0) head.x = COLS - 1;
    if (head.x >= COLS) head.x = 0;
    if (head.y < 0) head.y = ROWS - 1;
    if (head.y >= ROWS) head.y = 0;

    // Self collision (check all segments)
    const hitSelf = snake.some(s => s.x === head.x && s.y === head.y);
    if (hitSelf) {
      running = false;
      startBtn.textContent = 'Prøv igen';
      pauseBtn.style.display = 'none';
      clearInterval(gameLoop);
      return;
    }

    snake.unshift(head);
    if (head.x === food.x && head.y === food.y) {
      score++;
      scoreEl.textContent = `Score: ${score}`;
      placeFood();
    } else {
      snake.pop();
    }
    draw();
  }

  function start() {
    clearInterval(gameLoop);
    init();
    draw();
    gameLoop = setInterval(tick, 120);
  }
  // Keyboard controls
  const keyHandler = (e) => {
    if (!running) return;
    if (e.code === 'Space') {
      e.preventDefault();
      e.stopPropagation();
      togglePause();
      return;
    }

    if (isPaused) return;

    const map = {
      ArrowUp: { x: 0, y: -1 }, ArrowDown: { x: 0, y: 1 }, ArrowLeft: { x: -1, y: 0 }, ArrowRight: { x: 1, y: 0 },
      w: { x: 0, y: -1 }, s: { x: 0, y: 1 }, a: { x: -1, y: 0 }, d: { x: 1, y: 0 },
      W: { x: 0, y: -1 }, S: { x: 0, y: 1 }, A: { x: -1, y: 0 }, D: { x: 1, y: 0 }
    };
    const nd = map[e.key];
    if (nd && !(nd.x === -dir.x && nd.y === -dir.y)) {
      nextDir = nd;
      e.preventDefault();
      e.stopPropagation();
    }
  };

  canvas.addEventListener('keydown', keyHandler);
  pauseBtn.addEventListener('click', togglePause);

  // Focus on start
  startBtn.addEventListener('click', () => {
    start();
    canvas.focus();
  });

  // Cleanup loop when removed
  const intId = setInterval(() => {
    if (!canvas.isConnected) {
      clearInterval(intId);
      clearInterval(gameLoop);
    }
  }, 2000);

  // Draw initial empty board
  draw();
}

// ============================================================
//  NET INFO
// ============================================================

function renderNetInfo(container) {
  const conn = navigator.connection || navigator.mozConnection || navigator.webkitConnection;

  async function render() {
    let ip = 'Ukendt';
    try {
      const resp = await fetch('https://api.ipify.org?format=json');
      const data = await resp.json();
      ip = data.ip;
    } catch { }

    const type = conn ? (conn.effectiveType || conn.type || 'Ukendt') : 'Ukendt';
    const downlink = conn ? (conn.downlink || '?') : '?';
    const rtt = conn ? (conn.rtt || '?') : '?';
    const online = navigator.onLine;

    container.innerHTML = `<div class="widget-body widget-netinfo-body">
      <div class="ni-status ${online ? 'ni-online' : 'ni-offline'}">${online ? 'Online' : 'Offline'}</div>
      <div class="ni-details">
        <div class="ni-row"><span class="ni-label">IP-adresse</span><span class="ni-value ni-ip">${ip}</span></div>
        <div class="ni-row"><span class="ni-label">Forbindelse</span><span class="ni-value">${type.toUpperCase()}</span></div>
        <div class="ni-row"><span class="ni-label">Hastighed</span><span class="ni-value">${downlink} Mbps</span></div>
        <div class="ni-row"><span class="ni-label">Latens</span><span class="ni-value">${rtt} ms</span></div>
      </div>
      <button class="ni-copy-ip" title="Kopiér IP">Kopiér IP</button>
    </div>`;

    container.querySelector('.ni-copy-ip')?.addEventListener('click', () => {
      navigator.clipboard.writeText(ip);
      const btn = container.querySelector('.ni-copy-ip');
      btn.textContent = 'Kopieret!';
      setTimeout(() => btn.textContent = 'Kopiér IP', 1500);
    });
  }
  render();
}

// ============================================================
//  TAB MEMORY USAGE
// ============================================================

function renderTabMemory(container) {
  function render() {
    const perf = performance.memory;
    const hasMemoryAPI = !!perf;

    if (!hasMemoryAPI) {
      // Fallback: show basic performance info
      const entries = performance.getEntriesByType('navigation');
      const nav = entries[0];
      const loadTime = nav ? Math.round(nav.loadEventEnd - nav.startTime) : '?';
      const domReady = nav ? Math.round(nav.domContentLoadedEventEnd - nav.startTime) : '?';

      container.innerHTML = `<div class="widget-body widget-tabmemory-body">
        <div class="tm-header">Fane Ydelse</div>
        <div class="tm-details">
          <div class="tm-row"><span class="tm-label">Side indlæst</span><span class="tm-value">${loadTime} ms</span></div>
          <div class="tm-row"><span class="tm-label">DOM klar</span><span class="tm-value">${domReady} ms</span></div>
          <div class="tm-row"><span class="tm-label">Ressourcer</span><span class="tm-value">${performance.getEntriesByType('resource').length}</span></div>
          <div class="tm-row"><span class="tm-label">Opløsning</span><span class="tm-value">${screen.width}x${screen.height}</span></div>
          <div class="tm-row"><span class="tm-label">Pixel ratio</span><span class="tm-value">${devicePixelRatio}x</span></div>
          <div class="tm-row"><span class="tm-label">Farveskema</span><span class="tm-value">${matchMedia('(prefers-color-scheme:dark)').matches ? 'Mørk' : 'Lys'}</span></div>
        </div>
      </div>`;
      return;
    }

    const used = (perf.usedJSHeapSize / 1048576).toFixed(1);
    const total = (perf.totalJSHeapSize / 1048576).toFixed(1);
    const limit = (perf.jsHeapSizeLimit / 1048576).toFixed(0);
    const pct = ((perf.usedJSHeapSize / perf.jsHeapSizeLimit) * 100).toFixed(1);

    container.innerHTML = `<div class="widget-body widget-tabmemory-body">
      <div class="tm-header">JS Hukommelse</div>
      <div class="tm-bar-wrap"><div class="tm-bar" style="width:${pct}%"></div></div>
      <div class="tm-pct">${pct}% brugt</div>
      <div class="tm-details">
        <div class="tm-row"><span class="tm-label">Brugt</span><span class="tm-value">${used} MB</span></div>
        <div class="tm-row"><span class="tm-label">Allokeret</span><span class="tm-value">${total} MB</span></div>
        <div class="tm-row"><span class="tm-label">Grænse</span><span class="tm-value">${limit} MB</span></div>
        <div class="tm-row"><span class="tm-label">Ressourcer</span><span class="tm-value">${performance.getEntriesByType('resource').length}</span></div>
      </div>
    </div>`;
  }

  render();
  const intId = setInterval(() => {
    if (!container.isConnected) { clearInterval(intId); return; }
    render();
  }, 5000);
}

// ============================================================
//  FLASH MATH WIDGET
// ============================================================

async function renderFlashMath(container) {
  let stats = await get('flashmathStats', { correct: 0, total: 0, streak: 0, bestStreak: 0 });
  let currentProblem = null;

  function generateProblem() {
    const ops = ['+', '-', '×'];
    const op = ops[Math.floor(Math.random() * ops.length)];
    let a, b;
    if (op === '+') { a = Math.floor(Math.random() * 50) + 5; b = Math.floor(Math.random() * 50) + 5; }
    else if (op === '-') { a = Math.floor(Math.random() * 50) + 20; b = Math.floor(Math.random() * a) + 1; }
    else { a = Math.floor(Math.random() * 12) + 2; b = Math.floor(Math.random() * 12) + 2; }
    const answer = op === '+' ? a + b : op === '-' ? a - b : a * b;
    return { a, b, op, answer };
  }

  function render(feedback) {
    if (!currentProblem) currentProblem = generateProblem();
    const p = currentProblem;
    const feedbackHTML = feedback === 'correct'
      ? '<div class="fm-feedback fm-correct">Rigtigt!</div>'
      : feedback === 'wrong'
      ? '<div class="fm-feedback fm-wrong">Forkert</div>'
      : '';

    container.innerHTML = `<div class="widget-body widget-flashmath-body">
      <div class="fm-problem">${p.a} ${p.op} ${p.b} = ?</div>
      ${feedbackHTML}
      <div class="fm-input-row">
        <input type="number" class="fm-input" placeholder="Svar..." autofocus />
        <button class="fm-submit-btn">${ICONS.check}</button>
      </div>
      <div class="fm-stats">
        <span class="fm-stat"><strong>${stats.correct}</strong>/${stats.total}</span>
        <span class="fm-stat">Streak: <strong>${stats.streak}</strong></span>
        <span class="fm-stat">Bedste: <strong>${stats.bestStreak}</strong></span>
      </div>
      <button class="fm-skip">Spring over</button>
    </div>`;

    const input = container.querySelector('.fm-input');
    const submitBtn = container.querySelector('.fm-submit-btn');
    const skipBtn = container.querySelector('.fm-skip');

    async function checkAnswer() {
      const val = parseInt(input.value, 10);
      if (isNaN(val)) return;
      stats.total++;
      if (val === currentProblem.answer) {
        stats.correct++;
        stats.streak++;
        if (stats.streak > stats.bestStreak) stats.bestStreak = stats.streak;
        await set('flashmathStats', stats);
        currentProblem = generateProblem();
        render('correct');
      } else {
        stats.streak = 0;
        await set('flashmathStats', stats);
        render('wrong');
      }
    }

    input.addEventListener('keydown', e => { if (e.key === 'Enter') checkAnswer(); });
    submitBtn.addEventListener('click', checkAnswer);
    skipBtn.addEventListener('click', () => { currentProblem = generateProblem(); render(); });
    setTimeout(() => input.focus(), 50);
  }

  render();
}

// ============================================================
//  TIME TRACKING WIDGET
// ============================================================

async function renderTimeTrack(container) {
  let logs = await get('timetrackLogs', []);
  let activeTimer = await get('timetrackActive', null);

  function formatDuration(ms) {
    const s = Math.floor(ms / 1000);
    const h = Math.floor(s / 3600);
    const m = Math.floor((s % 3600) / 60);
    if (h > 0) return `${h}t ${m}m`;
    return `${m}m`;
  }

  function getTodayTotal() {
    const today = new Date().toISOString().split('T')[0];
    return logs
      .filter(l => l.date === today)
      .reduce((sum, l) => sum + l.duration, 0);
  }

  function render() {
    const isRunning = activeTimer && activeTimer.start;
    const elapsed = isRunning ? Date.now() - activeTimer.start : 0;
    const todayTotal = getTodayTotal() + elapsed;
    const today = new Date().toISOString().split('T')[0];
    const todayLogs = logs.filter(l => l.date === today).slice(-5).reverse();

    container.innerHTML = `<div class="widget-body widget-timetrack-body">
      <div class="tt-today">I dag: <strong>${formatDuration(todayTotal)}</strong></div>
      ${isRunning
        ? `<div class="tt-active">
            <span class="tt-active-label">${escapeHTML(activeTimer.label)}</span>
            <span class="tt-active-time">${formatDuration(elapsed)}</span>
           </div>
           <button class="tt-stop-btn">Stop</button>`
        : `<div class="tt-start-row">
            <input type="text" class="tt-label-input" placeholder="Hvad arbejder du på?" maxlength="30" />
            <button class="tt-start-btn">Start</button>
           </div>`
      }
      ${todayLogs.length > 0 ? `<div class="tt-log-list">
        ${todayLogs.map(l => `<div class="tt-log-item">
          <span class="tt-log-label">${escapeHTML(l.label)}</span>
          <span class="tt-log-dur">${formatDuration(l.duration)}</span>
        </div>`).join('')}
      </div>` : ''}
    </div>`;

    if (isRunning) {
      container.querySelector('.tt-stop-btn').addEventListener('click', async () => {
        const dur = Date.now() - activeTimer.start;
        if (dur > 60000) {
          logs.push({ id: 'tt_' + Date.now(), label: activeTimer.label, duration: dur, date: today });
          await set('timetrackLogs', logs);
        }
        activeTimer = null;
        await set('timetrackActive', null);
        render();
      });
    } else {
      const input = container.querySelector('.tt-label-input');
      const startBtn = container.querySelector('.tt-start-btn');
      async function startTimer() {
        const label = input.value.trim() || 'Unavngivet';
        activeTimer = { label, start: Date.now() };
        await set('timetrackActive', activeTimer);
        render();
      }
      startBtn.addEventListener('click', startTimer);
      input.addEventListener('keydown', e => { if (e.key === 'Enter') startTimer(); });
    }

    if (isRunning) {
      const elapsedEl = container.querySelector('.tt-active-time');
      const todayEl = container.querySelector('.tt-today strong');
      const intId = setInterval(() => {
        if (!container.isConnected) { clearInterval(intId); return; }
        const now = Date.now() - activeTimer.start;
        if (elapsedEl) elapsedEl.textContent = formatDuration(now);
        if (todayEl) todayEl.textContent = formatDuration(getTodayTotal() + now);
      }, 10000);
    }
  }

  render();
}

// ============================================================
//  READING LIST WIDGET
// ============================================================

async function renderReadingList(container) {
  let items = await get('readingList', []);

  function render() {
    const unread = items.filter(i => !i.read);
    const readItems = items.filter(i => i.read);

    container.innerHTML = `<div class="widget-body widget-readinglist-body">
      <div class="rl-add-row">
        <input type="text" class="rl-title-input" placeholder="Titel..." maxlength="60" />
        <input type="url" class="rl-url-input" placeholder="URL (valgfrit)..." />
        <button class="rl-add-btn">${ICONS.plus}</button>
      </div>
      <div class="rl-items">
        ${unread.length === 0 && readItems.length === 0
          ? '<div class="rl-empty">Din læseliste er tom</div>'
          : ''}
        ${unread.map(item => `<div class="rl-item" data-id="${item.id}">
          <button class="rl-check" title="Markér som læst">${ICONS.check}</button>
          ${item.url
            ? `<a class="rl-link" href="${sanitizeURL(item.url)}" target="_blank" rel="noopener">${escapeHTML(item.title)}</a>`
            : `<span class="rl-title">${escapeHTML(item.title)}</span>`
          }
          <button class="rl-delete" data-id="${item.id}">${ICONS.close}</button>
        </div>`).join('')}
        ${readItems.length > 0 ? `<div class="rl-done-header">Læst (${readItems.length})</div>` : ''}
        ${readItems.map(item => `<div class="rl-item rl-read" data-id="${item.id}">
          <button class="rl-uncheck" title="Markér som ulæst">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg>
          </button>
          ${item.url
            ? `<a class="rl-link rl-link-done" href="${sanitizeURL(item.url)}" target="_blank" rel="noopener">${escapeHTML(item.title)}</a>`
            : `<span class="rl-title rl-title-done">${escapeHTML(item.title)}</span>`
          }
          <button class="rl-delete" data-id="${item.id}">${ICONS.close}</button>
        </div>`).join('')}
      </div>
    </div>`;

    // Add item
    const titleInput = container.querySelector('.rl-title-input');
    const urlInput = container.querySelector('.rl-url-input');
    const addBtn = container.querySelector('.rl-add-btn');

    async function addItem() {
      const title = titleInput.value.trim();
      const url = urlInput.value.trim();
      if (!title && !url) return;
      items.unshift({ id: 'rl_' + Date.now(), title: title || url, url, read: false, addedAt: new Date().toISOString() });
      await set('readingList', items);
      render();
    }

    addBtn.addEventListener('click', addItem);
    urlInput.addEventListener('keydown', e => { if (e.key === 'Enter') addItem(); });
    titleInput.addEventListener('keydown', e => { if (e.key === 'Enter') urlInput.focus(); });

    // Mark as read
    container.querySelectorAll('.rl-check').forEach(btn => {
      btn.addEventListener('click', async () => {
        const id = btn.closest('.rl-item').dataset.id;
        const item = items.find(i => i.id === id);
        if (item) { item.read = true; await set('readingList', items); render(); }
      });
    });

    // Mark as unread
    container.querySelectorAll('.rl-uncheck').forEach(btn => {
      btn.addEventListener('click', async () => {
        const id = btn.closest('.rl-item').dataset.id;
        const item = items.find(i => i.id === id);
        if (item) { item.read = false; await set('readingList', items); render(); }
      });
    });

    // Delete
    container.querySelectorAll('.rl-delete').forEach(btn => {
      btn.addEventListener('click', async () => {
        items = items.filter(i => i.id !== btn.dataset.id);
        await set('readingList', items);
        render();
      });
    });

    // Handle link clicks explicitly for Chrome Extension reliability
    container.querySelectorAll('.rl-link').forEach(link => {
      link.addEventListener('click', e => {
        const url = link.getAttribute('href');
        if (url) {
          e.preventDefault();
          if (typeof chrome !== 'undefined' && chrome.tabs) {
            chrome.tabs.create({ url });
          } else {
            window.open(url, '_blank');
          }
        }
      });
    });
  }

  render();
}

async function renderIdleGame(container) {
  let state = await get('idlegame_state', { lys: 0, wicks: 0, oil: 1 });

  function render() {
    container.innerHTML = `
      <div class="widget-body idle-body">
        <div class="idle-stats">
          <div class="idle-count">
            <span class="idle-value">${Math.floor(state.lys)}</span>
            <span class="idle-label">Lys</span>
          </div>
          <div class="idle-income">${(state.wicks * 0.1).toFixed(1)}/s</div>
        </div>
        
        <button class="idle-lantern">
          <div class="lantern-glow"></div>
          ${ICONS.idlegame}
        </button>

        <div class="idle-upgrades">
          <button class="idle-upgrade" data-type="oil">
            <span class="up-name">Olie Lvl ${state.oil}</span>
            <span class="up-cost">${Math.floor(10 * Math.pow(1.5, state.oil - 1))} Lys</span>
          </button>
          <button class="idle-upgrade" data-type="wicks">
            <span class="up-name">Væge x${state.wicks}</span>
            <span class="up-cost">${Math.floor(15 * Math.pow(1.3, state.wicks))} Lys</span>
          </button>
        </div>
      </div>
    `;

    container.querySelector('.idle-lantern').onclick = () => {
      state.lys += state.oil;
      save();
      render();
    };

    container.querySelectorAll('.idle-upgrade').forEach(btn => {
      const type = btn.dataset.type;
      const cost = type === 'oil' 
        ? Math.floor(10 * Math.pow(1.5, state.oil - 1))
        : Math.floor(15 * Math.pow(1.3, state.wicks));

      if (state.lys < cost) btn.disabled = true;

      btn.onclick = () => {
        if (state.lys >= cost) {
          state.lys -= cost;
          if (type === 'oil') state.oil++;
          else state.wicks++;
          save();
          render();
        }
      };
    });
  }

  async function save() { await set('idlegame_state', state); }

  const interval = setInterval(() => {
    if (!container.isConnected) {
      clearInterval(interval);
      return;
    }
    if (state.wicks > 0) {
      state.lys += state.wicks * 0.1;
      const valEl = container.querySelector('.idle-value');
      if (valEl) valEl.textContent = Math.floor(state.lys);
      // Auto-save occasionally
      if (Math.random() < 0.1) save();
      
      // Update button disabled state
      container.querySelectorAll('.idle-upgrade').forEach(btn => {
        const type = btn.dataset.type;
        const cost = type === 'oil' 
          ? Math.floor(10 * Math.pow(1.5, state.oil - 1))
          : Math.floor(15 * Math.pow(1.3, state.wicks));
        btn.disabled = (state.lys < cost);
      });
    }
  }, 1000);

  render();
}

// ============================================================
//  LECTIO WIDGET
// ============================================================

async function renderLectio(container, config) {
  const { schoolId, sessionId, autoKey } = config;
  if (!schoolId || !sessionId || !autoKey) {
    container.innerHTML = `<div class="widget-body" style="text-align:center;padding:1rem;color:var(--text-muted);font-size:.8rem;">
      Klik <strong>tandhjulet</strong> ovenfor for at indtaste dine Lectio-oplysninger (Skole-ID, SessionId, autologinkeyV2).
    </div>`;
    return;
  }

  let currentTab = 'skema';
  let dayOffset = 0;
  const cache = {};

  function getISOWeek(d) {
    const date = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
    const day = date.getUTCDay() || 7;
    date.setUTCDate(date.getUTCDate() + 4 - day);
    const yearStart = new Date(Date.UTC(date.getUTCFullYear(), 0, 1));
    return Math.ceil(((date - yearStart) / 86400000 + 1) / 7);
  }

  function getTargetDate() {
    const d = new Date();
    d.setDate(d.getDate() + dayOffset);
    return d;
  }

  let studentId = config.elevId || null;

  async function fetchPage(path) {
    const resp = await chrome.runtime.sendMessage({ type: 'lectio-fetch', schoolId, sessionId, autoKey, path });
    if (!resp) throw new Error('No response from background worker');
    if (resp.error) throw new Error(resp.error);
    const html = resp.html;
    if (html.includes('Log ind') && html.includes('m_Content_username')) throw new Error('SESSION_EXPIRED');
    return new DOMParser().parseFromString(html, 'text/html');
  }

  async function getStudentId() {
    if (studentId) return studentId;
    const doc = await fetchPage('forside.aspx');
    const el = doc.querySelector('div#s_m_HeaderContent_MainTitle[data-lectiocontextcard]');
    if (el) {
      studentId = (el.getAttribute('data-lectiocontextcard') || '').replace('S', '');
    }
    if (!studentId) {
      const links = doc.querySelectorAll('a[href*="elevid="]');
      for (const link of links) {
        const m = (link.getAttribute('href') || '').match(/elevid=(\d+)/);
        if (m) { studentId = m[1]; break; }
      }
    }
    if (!studentId) {
      const elevM = (doc.body?.innerHTML || '').match(/elevid=(\d+)/);
      if (elevM) studentId = elevM[1];
    }
    return studentId;
  }

  function esc(s) { if (!s) return ''; const d = document.createElement('div'); d.appendChild(document.createTextNode(s)); return d.innerHTML; }

  function parseLessonInfo(info) {
    if (!info) return null;
    let status = 'normal';
    if (info.includes('Ændret!')) status = 'changed';
    if (info.includes('Aflyst!')) status = 'cancelled';
    // Try multiple time formats
    let startTime = '', endTime = '', dateStr = '';
    const tm1 = info.match(/(\d{1,2}\/\d{1,2}-\d{4})\s+(\d{1,2}:\d{2})\s+til\s+(\d{1,2}:\d{2})/);
    if (tm1) { dateStr = tm1[1]; startTime = tm1[2]; endTime = tm1[3]; }
    else {
      const tm2 = info.match(/(\d{1,2}:\d{2})\s*(?:til|-)\s*(\d{1,2}:\d{2})/);
      if (tm2) { startTime = tm2[1]; endTime = tm2[2]; }
    }
    // Detect all-day events
    const isAllDay = /Hele dagen/i.test(info);
    // Date fallback
    if (!dateStr) {
      const dm = info.match(/(\d{1,2}\/\d{1,2}-\d{4})/);
      if (dm) dateStr = dm[1];
    }
    const holdM = info.match(/Hold:\s*(.+)/);
    const subject = holdM ? holdM[1].trim().split('\n')[0].trim() : '';
    const teacherM = info.match(/Lærer(?:e)?:\s*(.+)/);
    const teachers = teacherM ? teacherM[1].trim().split('\n')[0].trim() : '';
    const roomM = info.match(/Lokale(?:r)?:\s*(.+)/);
    const room = roomM ? roomM[1].trim().split('\n')[0].trim() : '';
    // Fallback: first line as title
    const lines = info.split('\n').map(l => l.trim()).filter(Boolean);
    const title = lines[0] || '';
    return { status, startTime, endTime, dateStr, subject, teachers, room, title, isAllDay };
  }

  async function loadSchedule() {
    const target = getTargetDate();
    const w = getISOWeek(target);
    const y = target.getFullYear();
    const cacheKey = `skema-${w}-${y}`;

    if (!cache[cacheKey]) {
      const sid = await getStudentId();
      const weekStr = String(w).padStart(2, '0') + y;
      const path = sid ? `SkemaNy.aspx?week=${weekStr}&elevid=${sid}` : `SkemaNy.aspx?week=${weekStr}`;
      const doc = await fetchPage(path);

      // Lectio uses data-tooltip on a.s2skemabrik elements
      const allBriks = doc.querySelectorAll('a.s2skemabrik[data-tooltip]');

      const allLessons = [];
      allBriks.forEach(a => {
        const info = a.getAttribute('data-tooltip') || '';
        const l = parseLessonInfo(info);
        if (l && (l.startTime || l.subject || l.title)) allLessons.push(l);
      });

      // Fallback: also try data-additionalinfo and title attrs
      if (allLessons.length === 0) {
        doc.querySelectorAll('[data-additionalinfo], [data-tooltip], [title]').forEach(el => {
          const info = el.getAttribute('data-additionalinfo') || el.getAttribute('data-tooltip') || el.getAttribute('title') || '';
          if (info.length > 20 && (info.includes('Hold:') || info.includes('Lokale') || info.includes('til'))) {
            const l = parseLessonInfo(info);
            if (l && (l.startTime || l.subject || l.title)) allLessons.push(l);
          }
        });
      }

      // Deduplicate by startTime+subject
      const seen = new Set();
      const unique = allLessons.filter(l => {
        const key = `${l.dateStr}-${l.startTime}-${l.subject}`;
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      });

      cache[cacheKey] = unique;
    }

    // Filter to target day
    const targetDay = target.getDate();
    const targetMonth = target.getMonth() + 1;
    const targetYear = target.getFullYear();

    const allLessons = cache[cacheKey];
    let todayLessons = allLessons.filter(l => {
      if (!l.dateStr) return false;
      const m = l.dateStr.match(/(\d{1,2})\/(\d{1,2})-(\d{4})/);
      if (!m) return false;
      return parseInt(m[1]) === targetDay && parseInt(m[2]) === targetMonth && parseInt(m[3]) === targetYear;
    });

    // If no date-filtered results, show all (fallback — better than empty)
    if (todayLessons.length === 0 && allLessons.length > 0 && dayOffset === 0) {
      todayLessons = allLessons;
    }

    todayLessons.sort((a, b) => a.startTime.localeCompare(b.startTime));

    // Collect recurring time slots across the week (for gap placeholders)
    // Only slots that appear on 2+ different days count as regular modules
    const slotDays = new Map(); // startTime -> Set of dateStr
    const slotEnd = new Map();  // startTime -> endTime
    allLessons.forEach(l => {
      if (l.startTime && l.endTime && !l.isAllDay && l.dateStr) {
        if (!slotDays.has(l.startTime)) slotDays.set(l.startTime, new Set());
        slotDays.get(l.startTime).add(l.dateStr);
        slotEnd.set(l.startTime, l.endTime);
      }
    });
    const weekSlots = [...slotDays.entries()]
      .filter(([, days]) => days.size >= 2)
      .map(([s]) => ({ startTime: s, endTime: slotEnd.get(s) }))
      .sort((a, b) => a.startTime.localeCompare(b.startTime));

    return { lessons: todayLessons, weekSlots };
  }

  async function loadHomework() {
    if (cache.lektier) return cache.lektier;
    const doc = await fetchPage('material_lektieoversigt.aspx');
    const items = [];
    // Try primary selector
    doc.querySelectorAll('#s_m_Content_Content_MaterialLektworklist_grid tbody tr').forEach(row => {
      const cells = row.querySelectorAll('td');
      if (cells.length < 3) return;
      items.push({ date: cells[0]?.textContent?.trim() || '', subject: cells[1]?.textContent?.trim() || '', desc: cells[2]?.textContent?.trim() || '' });
    });
    // Broader fallback — any table rows with lesson-looking data
    if (items.length === 0) {
      doc.querySelectorAll('table tbody tr').forEach(row => {
        const cells = row.querySelectorAll('td');
        if (cells.length < 2) return;
        const text = row.textContent || '';
        if (text.includes('/') && text.length > 10) {
          items.push({ date: cells[0]?.textContent?.trim() || '', subject: cells[1]?.textContent?.trim() || '', desc: cells.length > 2 ? cells[2]?.textContent?.trim() || '' : '' });
        }
      });
    }
    cache.lektier = items;
    return items;
  }

  async function loadAssignments() {
    if (cache.opgaver) return cache.opgaver;
    const doc = await fetchPage('OpgaverElev.aspx');
    const items = [];
    doc.querySelectorAll('#s_m_Content_Content_ExerciseGV tbody tr:not(:first-child)').forEach(row => {
      const c = row.querySelectorAll('td');
      if (c.length < 6) return;
      let status = 'venter';
      const st = c[5]?.textContent?.trim()?.toLowerCase() || '';
      if (st.includes('afleveret')) status = 'afleveret';
      else if (st.includes('mangler')) status = 'mangler';
      items.push({ team: c[1]?.textContent?.trim() || '', title: c[2]?.textContent?.trim() || '', deadline: c[3]?.textContent?.trim() || '', status, grade: c.length > 8 ? c[8]?.textContent?.trim() || '' : '' });
    });
    // Fallback
    if (items.length === 0) {
      doc.querySelectorAll('table.ls-table-layout1 tbody tr').forEach(row => {
        const c = row.querySelectorAll('td');
        if (c.length < 3) return;
        items.push({ team: '', title: c[0]?.textContent?.trim() || '', deadline: c[1]?.textContent?.trim() || '', status: 'venter', grade: '' });
      });
    }
    cache.opgaver = items;
    return items;
  }

  async function loadGrades() {
    if (cache.karakterer) return cache.karakterer;
    const doc = await fetchPage('grades/grade_report.aspx');
    const result = { standpunkt: [], eksamen: [] };

    // Parse tooltips (data-tooltip or data-additionalinfo)
    doc.querySelectorAll('[data-tooltip], [data-additionalinfo]').forEach(el => {
      const info = el.getAttribute('data-tooltip') || el.getAttribute('data-additionalinfo') || '';
      const holdM = info.match(/Hold:\s*(.+)/);
      const fagM = info.match(/Fag:\s*(.+)/);
      const standM = info.match(/(?:1\.|2\.|3\.)\s*standpunkt[^:]*:\s*([^\n]+)/i);
      const karakterM = info.match(/Karakter:\s*([^\n]+)/i);
      const subj = fagM ? fagM[1].trim().split('\n')[0].trim() : (holdM ? holdM[1].trim().split('\n')[0].trim() : '');
      if (subj && standM) result.standpunkt.push({ subject: subj, grade: standM[1].trim() });
      if (subj && karakterM) result.eksamen.push({ subject: subj, grade: karakterM[1].trim() });
    });

    // Parse tables — look for rows with grade-like data
    const tables = doc.querySelectorAll('table');
    console.log('[Lectio Widget] Grade tables found:', tables.length);

    tables.forEach((table, ti) => {
      const rows = table.querySelectorAll('tr');
      if (rows.length < 2) return;

      // Try to identify header row to find column indices
      const headerRow = rows[0];
      const headers = [...headerRow.querySelectorAll('th, td')].map(c => c.textContent?.trim()?.toLowerCase() || '');
      console.log(`[Lectio Widget] Grade table[${ti}] headers:`, headers.join(' | '), `rows: ${rows.length}`);

      // Find column indices
      const fagIdx = headers.findIndex(h => h.includes('fag'));
      const typeIdx = headers.findIndex(h => h === 'type' || h.includes('prøveform'));

      // Find grade columns — look for "1. standpunkt", "2. standpunkt", "eksamen", "årskarakter"
      const standpunktCols = [];
      const eksamenCols = [];
      headers.forEach((h, i) => {
        if (h.includes('standpunkt') || h.includes('årskarakter')) standpunktCols.push(i);
        if (h.includes('eksamen') || h.includes('prøve')) eksamenCols.push(i);
      });

      if (fagIdx === -1 && standpunktCols.length === 0 && eksamenCols.length === 0) return;

      for (let r = 1; r < rows.length; r++) {
        const cells = [...rows[r].querySelectorAll('td')];
        if (cells.length < 2) continue;
        const fag = cells[fagIdx >= 0 ? fagIdx : 0]?.textContent?.trim() || '';
        if (!fag || fag.length < 2 || /^(Hold|Fag|Dato|Vægt|Termin)$/i.test(fag)) continue;

        // Extract standpunkt grades
        for (const ci of standpunktCols) {
          const v = cells[ci]?.textContent?.trim();
          if (v && v !== '-' && v.length <= 3) {
            result.standpunkt.push({ subject: fag, grade: v });
          }
        }

        // Extract eksamen grades
        for (const ci of eksamenCols) {
          const v = cells[ci]?.textContent?.trim();
          if (v && v !== '-' && v.length <= 3) {
            result.eksamen.push({ subject: fag, grade: v });
          }
        }

        // Fallback: if no specific columns found, look for any short grade-like values
        if (standpunktCols.length === 0 && eksamenCols.length === 0) {
          for (let i = cells.length - 1; i >= 1; i--) {
            const v = cells[i]?.textContent?.trim() || '';
            if (v && /^[A-F0-9]{1,2}$/.test(v)) {
              result.standpunkt.push({ subject: fag, grade: v });
              break;
            }
          }
        }
      }
    });

    // Deduplicate
    const dedup = (arr) => {
      const seen = new Set();
      return arr.filter(g => {
        const key = `${g.subject}-${g.grade}`;
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      });
    };
    result.standpunkt = dedup(result.standpunkt);
    result.eksamen = dedup(result.eksamen);

    console.log('[Lectio Widget] Grades parsed — standpunkt:', result.standpunkt.length, 'eksamen:', result.eksamen.length);
    cache.karakterer = result;
    return result;
  }

  function renderTabs() {
    const tabs = [
      { id: 'skema', label: 'Skema' },
      { id: 'lektier', label: 'Lektier' },
      { id: 'opgaver', label: 'Opgaver' },
      { id: 'karakterer', label: 'Karakterer' }
    ];
    return `<div class="lectio-tabs">${tabs.map(t =>
      `<button class="lectio-tab${currentTab === t.id ? ' active' : ''}" data-ltab="${t.id}">${esc(t.label)}</button>`
    ).join('')}</div>`;
  }

  function renderDayNav() {
    const target = getTargetDate();
    const dayNames = ['søndag', 'mandag', 'tirsdag', 'onsdag', 'torsdag', 'fredag', 'lørdag'];
    const dayName = dayNames[target.getDay()];
    const dateStr = `${target.getDate()}/${target.getMonth() + 1}`;
    const label = dayOffset === 0 ? `I dag · ${dayName}` : `${dayName} ${dateStr}`;
    return `<div class="lectio-week-nav">
      <button class="lectio-week-btn" data-dir="-1">&larr;</button>
      <span class="lectio-week-label">${esc(label)}</span>
      <button class="lectio-week-btn" data-dir="1">&rarr;</button>
    </div>`;
  }

  async function renderContent() {
    const body = container.querySelector('.lectio-body');
    if (!body) return;
    body.innerHTML = `<div style="text-align:center;padding:.5rem;font-size:.75rem;">Henter...</div>`;

    try {
      if (currentTab === 'skema') {
        const { lessons, weekSlots } = await loadSchedule();
        let html = renderDayNav();
        if (!lessons.length && !weekSlots.length) {
          html += `<div class="lectio-empty">Ingen lektioner i dag</div>`;
        } else {
          // Separate all-day events from timed lessons
          const allDay = lessons.filter(l => l.isAllDay || (!l.startTime && !l.endTime));
          const timed = lessons.filter(l => !l.isAllDay && (l.startTime || l.endTime));

          // Group timed lessons by startTime
          const byStart = new Map();
          timed.forEach(l => {
            if (!byStart.has(l.startTime)) byStart.set(l.startTime, []);
            byStart.get(l.startTime).push(l);
          });

          // Walk through all week slots, rendering lessons or empty placeholders
          const todayStarts = new Set(timed.map(l => l.startTime));
          const slotsToRender = weekSlots.length ? weekSlots : timed.map(l => ({ startTime: l.startTime, endTime: l.endTime }));

          slotsToRender.forEach(slot => {
            const group = byStart.get(slot.startTime);
            if (!group) {
              // Empty slot placeholder
              html += `<div class="lectio-lesson lectio-empty-slot">
                <span class="lectio-time">${esc(slot.startTime)}–${esc(slot.endTime)}</span>
                <span class="lectio-subj lectio-no-lesson">Intet modul</span>
              </div>`;
              return;
            }
            // Sort: non-cancelled first
            group.sort((a, b) => (a.status === 'cancelled' ? 1 : 0) - (b.status === 'cancelled' ? 1 : 0));

            if (group.length > 1) {
              // Split view: time once, then active + cancelled side by side
              const active = group.find(l => l.status !== 'cancelled') || group[0];
              const cancelled = group.filter(l => l !== active);
              html += `<div class="lectio-lesson-split">
                <span class="lectio-time">${esc(active.startTime)}–${esc(active.endTime)}</span>
                <div class="lectio-split-subjects">
                  <span class="lectio-split-active">${esc(active.subject || active.title || '—')}</span>
                  ${cancelled.map(c => `<span class="lectio-split-cancelled">${esc(c.subject || c.title || '—')}</span>`).join('')}
                </div>
                ${active.room ? `<span class="lectio-room">${esc(active.room)}</span>` : ''}
              </div>`;
            } else {
              const l = group[0];
              const cls = l.status !== 'normal' ? ` lectio-${l.status}` : '';
              html += `<div class="lectio-lesson${cls}">
                <span class="lectio-time">${esc(l.startTime)}–${esc(l.endTime)}</span>
                <span class="lectio-subj">${esc(l.subject || l.title || '—')}</span>
                ${l.room ? `<span class="lectio-room">${esc(l.room)}</span>` : ''}
              </div>`;
            }
          });

          // Render all-day events below the schedule
          if (allDay.length) {
            html += `<div class="lectio-allday-section">`;
            allDay.forEach(l => {
              const cls = l.status !== 'normal' ? ` lectio-${l.status}` : '';
              html += `<div class="lectio-allday${cls}">${esc(l.subject || l.title || '—')}</div>`;
            });
            html += `</div>`;
          }
        }
        body.innerHTML = html;
        body.querySelectorAll('.lectio-week-btn').forEach(btn => {
          btn.addEventListener('click', () => { dayOffset += parseInt(btn.dataset.dir); renderContent(); });
        });

      } else if (currentTab === 'lektier') {
        const items = await loadHomework();
        if (!items.length) { body.innerHTML = `<div class="lectio-empty">Ingen lektier</div>`; return; }
        body.innerHTML = items.map(i => `<div class="lectio-item"><strong>${esc(i.subject)}</strong>${i.date ? ` <span class="lectio-meta">${esc(i.date)}</span>` : ''}${i.desc ? `<div class="lectio-desc">${esc(i.desc)}</div>` : ''}</div>`).join('');

      } else if (currentTab === 'opgaver') {
        const items = await loadAssignments();
        if (!items.length) { body.innerHTML = `<div class="lectio-empty">Ingen opgaver</div>`; return; }
        body.innerHTML = items.map(i => {
          const sc = i.status === 'afleveret' ? 'lectio-ok' : i.status === 'mangler' ? 'lectio-warn' : '';
          return `<div class="lectio-item"><div style="display:flex;justify-content:space-between;align-items:center;"><strong>${esc(i.title)}</strong><span class="lectio-badge ${sc}">${esc(i.status)}</span></div><div class="lectio-meta">${esc(i.team)}${i.deadline ? ` · Frist: ${esc(i.deadline)}` : ''}${i.grade ? ` · <strong>${esc(i.grade)}</strong>` : ''}</div></div>`;
        }).join('');

      } else if (currentTab === 'karakterer') {
        const grades = await loadGrades();
        const hasStand = grades.standpunkt?.length > 0;
        const hasEks = grades.eksamen?.length > 0;
        if (!hasStand && !hasEks) { body.innerHTML = `<div class="lectio-empty">Ingen karakterer fundet</div>`; return; }
        let html = '';
        const renderGradeList = (list) => list.map(g => {
          const gradeColor = g.grade === '-' ? 'var(--text-muted)' : 'var(--accent)';
          return `<div class="lectio-grade-row"><span class="lectio-grade-subj">${esc(g.subject)}</span><span class="lectio-grade-val" style="color:${gradeColor}">${esc(g.grade)}</span></div>`;
        }).join('');
        if (hasStand) {
          html += `<div class="lectio-section-header">Standpunkt</div>`;
          html += renderGradeList(grades.standpunkt);
        }
        if (hasEks) {
          html += `<div class="lectio-section-header" style="margin-top:0.5rem;">Eksamen</div>`;
          html += renderGradeList(grades.eksamen);
        }
        body.innerHTML = html;
      }
    } catch (err) {
      body.innerHTML = `<div class="lectio-empty" style="color:#fb923c;">${err.message === 'SESSION_EXPIRED' ? 'Session udløbet — opdater cookies i indstillinger' : `Fejl: ${esc(err.message)}`}</div>`;
    }
  }

  // Initial render
  container.innerHTML = `<div class="widget-body lectio-widget">${renderTabs()}<div class="lectio-body"></div></div>`;
  container.querySelectorAll('.lectio-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      currentTab = tab.dataset.ltab;
      container.querySelectorAll('.lectio-tab').forEach(t => t.classList.toggle('active', t.dataset.ltab === currentTab));
      renderContent();
    });
  });
  renderContent();
}

// ============================================================
//  SETTINGS MODALS
// ============================================================

function showWidgetSettingsModal(widgetId, currentConfig, onSave) {
  const def = WIDGET_DEFS[widgetId]; if (!def) return;
  const overlay = document.createElement('div');
  overlay.className = 'widget-settings-overlay';
  let formHTML = '';

  if (widgetId === 'youtube') formHTML = `<label class="ws-label">YouTube URL (vises som thumbnail)</label><input class="ws-input" type="url" id="ws-video-url" value="${currentConfig.videoUrl || ''}" placeholder="https://youtube.com/watch?v=..." /><p class="ws-hint">Videoen åbnes i en ny fane.</p>`;
  else if (widgetId === 'countdown') formHTML = `<label class="ws-label">Begivenhed</label><input class="ws-input" type="text" id="ws-cd-label" value="${currentConfig.label || ''}" placeholder="Min begivenhed" /><label class="ws-label">Dato</label><input class="ws-input" type="date" id="ws-cd-date" value="${currentConfig.targetDate || ''}" />`;
  else if (widgetId === 'worldclock') { const z = currentConfig.zones || []; formHTML = `<label class="ws-label">Tidszoner (én per linje: Navn, Tidszone)</label><textarea class="ws-textarea" id="ws-wc-zones" rows="4">${z.map(x => `${x.label}, ${x.tz}`).join('\n')}</textarea><p class="ws-hint">Eks: America/New_York, Europe/London</p>`; }
  else if (widgetId === 'bookmarks') { const l = currentConfig.links || []; formHTML = `<label class="ws-label">Bogmærker (én per linje: Navn, URL)</label><textarea class="ws-textarea" id="ws-bm-links" rows="5">${l.map(x => `${x.name}, ${x.url}`).join('\n')}</textarea>`; }
  else if (widgetId === 'habits') { const h = currentConfig.habits || []; formHTML = `<label class="ws-label">Vaner (én per linje)</label><textarea class="ws-textarea" id="ws-habits-list" rows="4">${h.join('\n')}</textarea>`; }
  else if (widgetId === 'lectio') { formHTML = `<label class="ws-label">Skole-ID</label><input class="ws-input" type="text" id="ws-lectio-school" value="${currentConfig.schoolId || ''}" placeholder="f.eks. 572" /><p class="ws-hint">Findes i din Lectio-URL: lectio.dk/lectio/<strong>[SKOLE-ID]</strong>/forside.aspx</p><label class="ws-label">ASP.NET_SessionId</label><input class="ws-input" type="password" id="ws-lectio-session" value="${currentConfig.sessionId || ''}" placeholder="f.eks. 2ALO2M7HWPU4FL..." autocomplete="off" /><p class="ws-hint">Log ind p\u00e5 Lectio \u2192 H\u00f8jreklik \u2192 Inspic\u00e9r \u2192 Application \u2192 Cookies \u2192 lectio.dk \u2192 <strong>ASP.NET_SessionId</strong></p><label class="ws-label">autologinkeyV2</label><input class="ws-input" type="password" id="ws-lectio-autokey" value="${currentConfig.autoKey || ''}" placeholder="f.eks. PdUjLjN0F6Jc..." autocomplete="off" /><p class="ws-hint">Samme sted som ovenfor \u2192 find <strong>autologinkeyV2</strong> i cookie-listen</p><label class="ws-label">Elev-ID (valgfrit)</label><input class="ws-input" type="text" id="ws-lectio-elevid" value="${currentConfig.elevId || ''}" placeholder="Hentes automatisk hvis tomt" /><p class="ws-hint">Hentes automatisk fra Lectio. Kan ogs\u00e5 findes i URL\u2019en n\u00e5r du klikker p\u00e5 dit skema: elevid=<strong>[DIT ID]</strong></p>`; }

  overlay.innerHTML = `<div class="widget-settings-modal"><div class="ws-header"><span class="ws-icon">${ICONS[def.icon] || ''}</span><h3>${def.name}</h3></div><div class="ws-form">${formHTML}</div><div class="ws-actions"><button class="ws-cancel">Annuller</button><button class="ws-save">Gem</button></div></div>`;
  document.body.appendChild(overlay);
  const fi = overlay.querySelector('input, textarea'); if (fi) setTimeout(() => fi.focus(), 50);
  const close = () => overlay.remove();
  overlay.querySelector('.ws-cancel').addEventListener('click', close);
  overlay.addEventListener('click', e => { if (e.target === overlay) close(); });

  overlay.querySelector('.ws-save').addEventListener('click', () => {
    let nc = { ...currentConfig };
    if (widgetId === 'youtube') nc.videoUrl = overlay.querySelector('#ws-video-url').value.trim();
    else if (widgetId === 'countdown') { nc.label = overlay.querySelector('#ws-cd-label').value.trim() || 'Begivenhed'; nc.targetDate = overlay.querySelector('#ws-cd-date').value; }
    else if (widgetId === 'worldclock') nc.zones = overlay.querySelector('#ws-wc-zones').value.split('\n').filter(l => l.trim()).map(l => { const p = l.split(',').map(s => s.trim()); return { label: p[0] || 'Zone', tz: p[1] || 'UTC' }; });
    else if (widgetId === 'bookmarks') nc.links = overlay.querySelector('#ws-bm-links').value.split('\n').filter(l => l.trim()).map(l => { const p = l.split(',').map(s => s.trim()); return { name: p[0] || 'Link', url: p.slice(1).join(',').trim() || '#' }; });
    else if (widgetId === 'habits') nc.habits = overlay.querySelector('#ws-habits-list').value.split('\n').map(s => s.trim()).filter(Boolean);
    else if (widgetId === 'lectio') { nc.schoolId = overlay.querySelector('#ws-lectio-school').value.trim(); nc.sessionId = overlay.querySelector('#ws-lectio-session').value.trim(); nc.autoKey = overlay.querySelector('#ws-lectio-autokey').value.trim(); nc.elevId = overlay.querySelector('#ws-lectio-elevid').value.trim(); }
    onSave(nc); close();
  });
}

// ============================================================
//  WIDGET GALLERY — categorized
// ============================================================

function showWidgetGallery(enabledWidgets, onAdd) {
  const overlay = document.createElement('div');
  overlay.className = 'widget-gallery-overlay';
  const available = Object.entries(WIDGET_DEFS).filter(([id]) => !enabledWidgets.includes(id));

  // Group by category
  const grouped = {};
  for (const [id, def] of available) {
    const cat = def.category || 'info';
    if (!grouped[cat]) grouped[cat] = [];
    grouped[cat].push([id, def]);
  }

  let gridHTML = '';
  if (available.length === 0) {
    gridHTML = '<p class="wg-empty">Alle widgets er allerede tilføjet</p>';
  } else {
    for (const [catKey, catName] of Object.entries(CATEGORIES)) {
      if (!grouped[catKey] || grouped[catKey].length === 0) continue;
      gridHTML += `<div class="wg-category-title">${catName}</div>`;
      gridHTML += grouped[catKey].map(([id, def]) => `
        <button class="wg-item" data-widget-id="${id}">
          <div class="wg-item-icon">${ICONS[def.icon] || ''}</div>
          <div class="wg-item-info"><span class="wg-item-name">${def.name}</span><span class="wg-item-desc">${def.description}</span></div>
        </button>
      `).join('');
    }
  }

  overlay.innerHTML = `<div class="widget-gallery-modal"><div class="wg-header"><h3>Tilføj widget</h3><button class="wg-close">${ICONS.close}</button></div><div class="wg-grid">${gridHTML}</div></div>`;
  document.body.appendChild(overlay);
  overlay.querySelector('.wg-close').addEventListener('click', () => overlay.remove());
  overlay.addEventListener('click', e => { if (e.target === overlay) overlay.remove(); });
  overlay.querySelectorAll('.wg-item').forEach(btn => btn.addEventListener('click', () => { onAdd(btn.dataset.widgetId); overlay.remove(); }));
}

// ============================================================
//  MAIN INIT
// ============================================================

export async function initWidgets(container, addBtn, resetBtn) {
  let enabledWidgets = await get('enabledWidgets', [...DEFAULT_ENABLED]);
  let widgetConfigs = await get('widgetConfigs', {});
  let widgetPositions = await get('widgetPositions', {});
  let widgetSizes = await get('widgetSizes', {});

  async function saveState() { await set('enabledWidgets', enabledWidgets); await set('widgetConfigs', widgetConfigs); }
  function getConfig(id) { const d = WIDGET_DEFS[id]; return { ...(d?.defaultConfig || {}), ...(widgetConfigs[id] || {}) }; }

    async function renderAll(newWidgetId = null) {
    widgetPositions = await get('widgetPositions', {});
    widgetSizes = await get('widgetSizes', {});
    container.innerHTML = `
      <div class="widgets-row">
        ${enabledWidgets.map(id => {
      const def = WIDGET_DEFS[id]; if (!def) return '';
      const pos = widgetPositions[id];
      const size = widgetSizes[id];
      const isNew = id === newWidgetId;
      const styles = [];
      if (pos) styles.push(`transform: translate(${pos.x}px, ${pos.y}px)`);
      if (size) { if (size.w) styles.push(`width: ${size.w}px`); if (size.h) styles.push(`height: ${size.h}px`); }
      const styleAttr = styles.length ? `style="${styles.join(';')}"` : '';
      const animClass = isNew ? 'widget-new' : '';

      return `
          <div class="widget-slot" data-widget-id="${id}">
            <div class="widget-card ${animClass}" ${styleAttr}>
              <div class="widget-card-header">
                <div class="widget-card-icon">${ICONS[def.icon] || ''}</div>
                <span class="widget-card-title">${def.name}</span>
                <div class="widget-card-actions">
                  ${def.hasSettings ? `<button class="widget-action-btn widget-settings-btn" title="Indstillinger" data-wid="${id}">${ICONS.settings}</button>` : ''}
                  <button class="widget-action-btn widget-remove-btn" title="Fjern widget" data-wid="${id}">${ICONS.close}</button>
                </div>
              </div>
              <div class="widget-card-content" data-content-for="${id}"></div>
              <div class="widget-resize-handle" data-wid="${id}"></div>
            </div>
          </div>`;
    }).join('')}
      </div>`;

    for (const id of enabledWidgets) { 
      const def = WIDGET_DEFS[id]; 
      if (!def) continue; 
      const el = container.querySelector(`[data-content-for="${id}"]`); 
      if (el) {
        try {
          await def.render(el, getConfig(id), id);
        } catch (err) {
          console.error(`Error rendering widget ${id}:`, err);
          el.innerHTML = `<div class="widget-error">Kunne ikke indlæse widget</div>`;
        }
      } 
    }

    container.querySelectorAll('.widget-remove-btn').forEach(btn => {
      btn.addEventListener('click', async () => { 
        const card = btn.closest('.widget-card');
        if (card) card.classList.add('removing');
        setTimeout(async () => {
          enabledWidgets = enabledWidgets.filter(id => id !== btn.dataset.wid); 
          await saveState(); 
          await renderAll(); 
        }, 250);
      });
    });

    container.querySelectorAll('.widget-settings-btn').forEach(btn => {
      btn.addEventListener('click', () => { const wid = btn.dataset.wid; showWidgetSettingsModal(wid, getConfig(wid), async (nc) => { widgetConfigs[wid] = nc; await saveState(); await renderAll(); }); });
    });

    setupDrag(container, widgetPositions);

    // Resize handles
    container.querySelectorAll('.widget-resize-handle').forEach(handle => {
      handle.addEventListener('mousedown', (e) => {
        e.preventDefault();
        e.stopPropagation();
        const wid = handle.dataset.wid;
        const card = handle.closest('.widget-card');
        if (!card) return;
        const startX = e.clientX;
        const startY = e.clientY;
        const startW = card.offsetWidth;
        const startH = card.offsetHeight;
        card.classList.add('resizing');

        function onMove(ev) {
          const w = Math.max(180, startW + ev.clientX - startX);
          const h = Math.max(80, startH + ev.clientY - startY);
          card.style.width = w + 'px';
          card.style.height = h + 'px';
        }
        function onUp(ev) {
          document.removeEventListener('mousemove', onMove);
          document.removeEventListener('mouseup', onUp);
          card.classList.remove('resizing');
          widgetSizes[wid] = { w: card.offsetWidth, h: card.offsetHeight };
          set('widgetSizes', widgetSizes);
        }
        document.addEventListener('mousemove', onMove);
        document.addEventListener('mouseup', onUp);
      });
    });
  }

  // Wire up top-bar buttons 
  if (addBtn) {
    addBtn.addEventListener('click', () => {
      showWidgetGallery(enabledWidgets, async (newId) => { 
        enabledWidgets.push(newId); 
        await saveState(); 
        await renderAll(newId); 
      });
    });
  }

  if (resetBtn) {
    resetBtn.addEventListener('click', async () => {
      const { resetPositions } = await import('./drag.js');
      if (resetPositions) await resetPositions(container);
    });
  }
  // 
  await renderAll();
}
