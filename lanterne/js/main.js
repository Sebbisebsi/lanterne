import { get, set } from './storage.js';
import { initSearch } from './search.js';
import { initAmbience } from './ambience.js';
import { initClock } from './clock.js';
import { initWeather } from './weather.js';
import { initChecklist } from './checklist.js';
import { initQuickLinks } from './quicklinks.js';
import { initScrapbook } from './scrapbook.js';
import { initSettings } from './settings.js';
import { initWidgets } from './widgets.js';
import { initSounds } from './sounds.js';
import { initStats } from './stats.js';
import { initDayNight } from './daynight.js';

document.addEventListener('DOMContentLoaded', async () => {
  const settings = await get('settings', {
    theme: 'dark',
    clockFormat: '24h',
    greeting: true,
    userName: '',
    background: 'default',
    backgroundColor: '#1a1410',
    weatherUnit: 'celsius',
    focusMode: false,
    effectType: 'embers',
    effectAmount: 'medium',
    showChecklist: true
  });

  if (settings.theme === 'light') {
    document.documentElement.setAttribute('data-theme', 'light');
  }
  // Auto theme handled by daynight.js

  // Aggressively remove Chrome's injected new tab page elements
  const OUR_IDS = new Set([
    'bg-layer', 'bg-overlay', 'daynight-canvas', 'ambience-canvas', 'clock-section',
    'clock', 'greeting', 'date-display', 'weather', 'stats-section',
    'search-section', 'quicklinks-section', 'checklist-section', 'widgets-section',
    'scrapbook-btn', 'scrapbook-panel', 'settings-trigger',
    'settings-panel', 'sound-trigger', 'focus-toggle',
    'widget-add-trigger', 'widget-reset-trigger'
  ]);

  const OUR_CLASSES = new Set([
    'background-layer', 'background-overlay', 'daynight-canvas', 'ambience-canvas',
    'content', 'top-bar', 'scrapbook-panel', 'settings-panel',
    'widget-settings-overlay', 'widget-gallery-overlay',
    'quicklink-modal-overlay', 'sound-panel',
    'checklist-modal-overlay'
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
  initStats(document.getElementById('stats-section'));
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
      settings.focusMode = focusMode;
      await set('settings', settings);
      applyFocusMode();
      focusToggle.classList.toggle('active', focusMode);
    });
    focusToggle.classList.toggle('active', focusMode);
  }
});
