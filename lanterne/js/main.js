// Q29weXJpZ2h0IDIwMjYgLSBTZWJiaXNlYnNp
// Primary key
import { get, set } from './storage.js';
import { initSearch } from './search.js';
import { initAmbience } from './ambience.js';
import { initClock } from './clock.js';
import { initWeather } from './weather.js';
import { initChecklist } from './checklist.js';
import { initQuickLinks } from './quicklinks.js';
import { initScrapbook } from './scrapbook.js';
import { initSettings, DEFAULT_SETTINGS } from './settings.js';
import { initWidgets } from './widgets.js';
import { initSounds } from './sounds.js';
import { initStats } from './stats.js';
import { initDayNight } from './daynight.js';
import { initWelcome } from './welcome.js';

document.addEventListener('DOMContentLoaded', async () => {
  // Merge stored settings with defaults so new keys always have values
  const stored = await get('settings', {});
  const settings = { ...DEFAULT_SETTINGS, ...stored };

  if (settings.theme === 'light') {
    document.documentElement.setAttribute('data-theme', 'light');
  }
  // Auto theme handled by daynight.js

  // Apply layout position early to prevent layout shift
  const layoutPos = settings.layoutPosition || 'top';
  document.querySelector('.content')?.setAttribute('data-position', layoutPos);

  // Aggressively remove Chrome's injected new tab page elements
  const OUR_IDS = new Set([
    'bg-layer', 'bg-overlay', 'daynight-canvas', 'ambience-canvas', 'clock-section',
    'clock', 'greeting', 'date-display', 'weather', 'stats-section',
    'search-section', 'quicklinks-section', 'checklist-section', 'widgets-section',
    'scrapbook-btn', 'scrapbook-panel', 'settings-trigger',
    'settings-panel', 'sound-trigger', 'focus-toggle',
    'widget-add-trigger', 'widget-reset-trigger', 'stats-topbar'
  ]);

  const OUR_CLASSES = new Set([
    'background-layer', 'background-overlay', 'daynight-canvas', 'ambience-canvas',
    'content', 'top-bar', 'scrapbook-panel', 'settings-panel',
    'widget-settings-overlay', 'widget-gallery-overlay',
    'quicklink-modal-overlay', 'sound-panel',
    'checklist-modal-overlay',
    'welcome-overlay'
  ]);

  function hideChromeCrap() {
    document.querySelectorAll('body > *').forEach(el => {
      if (el.tagName === 'SCRIPT' || el.tagName === 'LINK' || el.tagName === 'STYLE') return;
      if (el.tagName === 'CANVAS' && (el.id === 'ambience-canvas' || el.id === 'daynight-canvas')) return;
      if (OUR_IDS.has(el.id)) return;
      for (const cls of el.classList) {
        if (OUR_CLASSES.has(cls)) return;
      }
      el.style.cssText = 'display:none!important;visibility:hidden!important;';
    });
  }

  hideChromeCrap();
  const observer = new MutationObserver(() => hideChromeCrap());
  observer.observe(document.body, { childList: true, subtree: false });

  // Initialize all modules
  await initClock(
    document.getElementById('clock'),
    document.getElementById('greeting'),
    document.getElementById('date-display')
  );

  // Day-night system (only when theme is 'auto')
  const daynightCanvas = document.getElementById('daynight-canvas');
  if (settings.theme === 'auto') {
    initDayNight(daynightCanvas);
  } else {
    daynightCanvas.style.display = 'none';
  }

  initAmbience(document.getElementById('ambience-canvas'), settings);
  initSearch(document.getElementById('search-section'));
  initWeather(document.getElementById('weather'));

  // Stats position: 'content' = above search, 'topbar' = in top bar center
  const statsContainer = settings.statsPosition === 'topbar'
    ? document.getElementById('stats-topbar')
    : document.getElementById('stats-section');
  const hideStats = settings.statsPosition === 'topbar'
    ? document.getElementById('stats-section')
    : document.getElementById('stats-topbar');
  if (hideStats) hideStats.style.display = 'none';
  initStats(statsContainer);

  initQuickLinks(document.getElementById('quicklinks-section'));

  // Checklist (can be disabled in settings)
  const checklistEl = document.getElementById('checklist-section');
  if (settings.showChecklist !== false) {
    initChecklist(checklistEl);
  } else {
    checklistEl.style.display = 'none';
  }
  await initWidgets(
    document.getElementById('widgets-section'),
    document.getElementById('widget-add-trigger'),
    document.getElementById('widget-reset-trigger')
  );
  initSounds(document.getElementById('sound-trigger'));

  initScrapbook(
    document.getElementById('scrapbook-btn'),
    document.getElementById('scrapbook-panel')
  );

  initSettings(
    document.getElementById('settings-trigger'),
    document.getElementById('settings-panel')
  );

  // Welcome screen (first launch only)
  await initWelcome();

  // Focus mode
  const focusToggle = document.getElementById('focus-toggle');
  let focusMode = settings.focusMode || false;

  function applyFocusMode() {
    document.body.classList.toggle('focus-mode', focusMode);
  }

  applyFocusMode();

  if (focusToggle) {
    focusToggle.addEventListener('click', async () => {
      focusMode = !focusMode;
      // Read fresh settings to avoid overwriting concurrent changes
      const fresh = await get('settings', {});
      fresh.focusMode = focusMode;
      await set('settings', fresh);
      applyFocusMode();
      focusToggle.classList.toggle('active', focusMode);
    });
    focusToggle.classList.toggle('active', focusMode);
  }
});
