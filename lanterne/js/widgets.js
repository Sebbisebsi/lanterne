import { get, set } from './storage.js';

// Curated quotes — NOT AI generated, real quotes
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
  // Use date as seed so everyone gets the same quote per day
  const today = new Date();
  const dayOfYear = Math.floor((today - new Date(today.getFullYear(), 0, 0)) / 86400000);
  return QUOTES[dayOfYear % QUOTES.length];
}

// ========== QUOTE WIDGET ==========
function renderQuote(container) {
  const quote = getDailyQuote();
  container.innerHTML = `
    <div class="widget-card widget-quote">
      <div class="widget-icon">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M3 21c3 0 7-1 7-8V5c0-1.25-.756-2.017-2-2H4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2 1 0 1 0 1 1v1c0 1-1 2-2 2s-1 .008-1 1.031V20c0 1 0 1 1 1z"/>
          <path d="M15 21c3 0 7-1 7-8V5c0-1.25-.757-2.017-2-2h-4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2h.75c0 2.25.25 4-2.75 4v3c0 1 0 1 1 1z"/>
        </svg>
      </div>
      <blockquote class="quote-text">"${quote.text}"</blockquote>
      <cite class="quote-author">— ${quote.author}</cite>
    </div>
  `;
}

// ========== FOCUS TIMER ==========
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
      <div class="widget-card widget-timer">
        <div class="widget-icon">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="10"/>
            <polyline points="12 6 12 12 16 14"/>
          </svg>
        </div>
        <div class="timer-display">
          ${isRunning
            ? `<span class="timer-time">${String(minutes).padStart(2,'0')}:${String(seconds).padStart(2,'0')}</span>`
            : `<span class="timer-label">Fokus</span>`
          }
        </div>
        ${isRunning
          ? `<div class="timer-progress"><div class="timer-progress-bar" style="width: ${progress}%"></div></div>
             <button class="timer-btn timer-stop">Stop</button>`
          : `<div class="timer-presets">
               <button class="timer-preset" data-min="15">15m</button>
               <button class="timer-preset" data-min="25">25m</button>
               <button class="timer-preset" data-min="45">45m</button>
             </div>`
        }
      </div>
    `;

    // Event listeners
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

  // If timer was running, resume
  if (timerState.running && timerState.endTime > Date.now()) {
    startInterval();
  }

  render();
}

// ========== NOTEPAD ==========
async function renderNotepad(container) {
  const note = await get('quickNote', '');

  container.innerHTML = `
    <div class="widget-card widget-notepad">
      <div class="widget-icon">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/>
          <polyline points="14 2 14 8 20 8"/>
          <line x1="16" y1="13" x2="8" y2="13"/>
          <line x1="16" y1="17" x2="8" y2="17"/>
          <line x1="10" y1="9" x2="8" y2="9"/>
        </svg>
      </div>
      <textarea class="notepad-textarea" placeholder="Hurtige noter...">${note}</textarea>
    </div>
  `;

  const textarea = container.querySelector('.notepad-textarea');
  let debounce;
  textarea.addEventListener('input', () => {
    clearTimeout(debounce);
    debounce = setTimeout(() => {
      set('quickNote', textarea.value);
    }, 300);
    // Auto-resize
    textarea.style.height = 'auto';
    textarea.style.height = Math.min(textarea.scrollHeight, 120) + 'px';
  });

  // Initial auto-resize
  if (note) {
    setTimeout(() => {
      textarea.style.height = 'auto';
      textarea.style.height = Math.min(textarea.scrollHeight, 120) + 'px';
    }, 50);
  }
}

// ========== MAIN INIT ==========
export async function initWidgets(container) {
  container.innerHTML = `
    <div class="widgets-row">
      <div id="widget-quote" data-widget-id="quote"></div>
      <div id="widget-timer" data-widget-id="timer"></div>
      <div id="widget-notepad" data-widget-id="notepad"></div>
    </div>
  `;

  renderQuote(document.getElementById('widget-quote'));
  renderTimer(document.getElementById('widget-timer'));
  renderNotepad(document.getElementById('widget-notepad'));
}
