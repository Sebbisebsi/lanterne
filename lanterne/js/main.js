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
    'widget-add-trigger', 'widget-reset-trigger', 'stats-topbar', 'stats-above'
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
  let destroyDayNight = null;
  if (settings.theme === 'auto') {
    destroyDayNight = initDayNight(daynightCanvas);
  } else {
    daynightCanvas.style.display = 'none';
  }

  const ambienceCanvas = document.getElementById('ambience-canvas');
  let destroyAmbience = await initAmbience(ambienceCanvas, settings);
  initSearch(document.getElementById('search-section'));
  initWeather(document.getElementById('weather'));

  // Stats position: 'above' = above search, 'below' = below search, 'topbar' = top bar center
  const statsIds = ['stats-above', 'stats-section', 'stats-topbar'];
  const statsMap = { above: 'stats-above', below: 'stats-section', topbar: 'stats-topbar', content: 'stats-section' };
  const activeStatsId = statsMap[settings.statsPosition] || 'stats-section';
  for (const id of statsIds) {
    const el = document.getElementById(id);
    if (el) el.style.display = id === activeStatsId ? '' : 'none';
  }
  initStats(document.getElementById(activeStatsId));

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

  // Live settings callbacks — no more page reloads
  const liveCallbacks = {
    onThemeChange(theme) {
      if (theme === 'light') {
        document.documentElement.setAttribute('data-theme', 'light');
      } else {
        document.documentElement.removeAttribute('data-theme');
      }
      // Toggle day-night canvas
      if (theme === 'auto') {
        daynightCanvas.style.display = '';
        if (destroyDayNight) destroyDayNight();
        destroyDayNight = initDayNight(daynightCanvas);
      } else {
        if (destroyDayNight) { destroyDayNight(); destroyDayNight = null; }
        daynightCanvas.style.display = 'none';
      }
    },
    async onEffectChange(s) {
      // Destroy old ambience and start new one
      if (destroyAmbience) destroyAmbience();
      destroyAmbience = await initAmbience(ambienceCanvas, s);
    },
    onClockChange(s) {
      // Re-init clock with new format
      const clockEl = document.getElementById('clock');
      const greetEl = document.getElementById('greeting');
      const dateEl = document.getElementById('date-display');
      initClock(clockEl, greetEl, dateEl);
    },
    onWeatherChange(s) {
      initWeather(document.getElementById('weather'));
    },
    onStatsChange(s) {
      const map = { above: 'stats-above', below: 'stats-section', topbar: 'stats-topbar', content: 'stats-section' };
      const newId = map[s.statsPosition] || 'stats-section';
      for (const id of statsIds) {
        const el = document.getElementById(id);
        if (el) { el.style.display = id === newId ? '' : 'none'; el.innerHTML = ''; }
      }
      initStats(document.getElementById(newId));
    }
  };

  initSettings(
    document.getElementById('settings-trigger'),
    document.getElementById('settings-panel'),
    liveCallbacks
  );

  // Welcome screen (first launch only)
  // On completion, re-init all modules with the new settings instead of reloading
  await initWelcome(async (newSettings) => {
    // Theme
    liveCallbacks.onThemeChange(newSettings.theme);
    // Effects
    await liveCallbacks.onEffectChange(newSettings);
    // Clock, greeting, date
    liveCallbacks.onClockChange(newSettings);
    // Weather (unit may have changed)
    liveCallbacks.onWeatherChange(newSettings);
    // Layout position
    const content = document.querySelector('.content');
    if (content) content.setAttribute('data-position', newSettings.layoutPosition || 'top');
  });

  // Global keyboard shortcuts (Alt-based, no Ctrl to avoid zoom conflicts)
  document.addEventListener('keydown', (e) => {
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
    if (!e.altKey) return;

    switch (e.key.toLowerCase()) {
      case 's': // Alt+S → Settings
        e.preventDefault();
        document.getElementById('settings-trigger')?.click();
        break;
      case 'b': // Alt+B → Scrapbook
        e.preventDefault();
        document.getElementById('scrapbook-btn')?.click();
        break;
      case 'f': // Alt+F → Focus mode
        e.preventDefault();
        document.getElementById('focus-toggle')?.click();
        break;
      case 'a': // Alt+A → Ambient sounds
        e.preventDefault();
        document.getElementById('sound-trigger')?.click();
        break;
    }
  });

  // Auto-focus search (disabled by default)
  if (settings.autoFocusSearch) {
    const searchInput = document.querySelector('.search-input');
    if (searchInput) searchInput.focus();
  }

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
