import { get } from './storage.js';
import { initSearch } from './search.js';
import { initAmbience } from './ambience.js';
import { initClock } from './clock.js';
import { initWeather } from './weather.js';
import { initRituals } from './rituals.js';
import { initQuickLinks } from './quicklinks.js';
import { initScrapbook } from './scrapbook.js';
import { initSettings } from './settings.js';
import { initWidgets } from './widgets.js';
import { initSounds } from './sounds.js';

document.addEventListener('DOMContentLoaded', async () => {
  // Load saved settings
  const settings = await get('settings', {
    theme: 'dark',
    clockFormat: '24h',
    greeting: true,
    userName: '',
    background: 'default',
    backgroundColor: '#1a1410',
    weatherUnit: 'celsius'
  });

  // Apply theme immediately
  if (settings.theme === 'light') {
    document.documentElement.setAttribute('data-theme', 'light');
  }

  // Aggressively remove Chrome's injected new tab page elements
  const OUR_IDS = new Set([
    'bg-layer', 'bg-overlay', 'ambience-canvas', 'clock-section',
    'clock', 'greeting', 'date-display', 'weather', 'search-section',
    'quicklinks-section', 'rituals-section', 'widgets-section',
    'scrapbook-btn', 'scrapbook-panel', 'settings-trigger',
    'settings-panel', 'sound-trigger'
  ]);

  // Classes that our code dynamically appends to <body>
  const OUR_CLASSES = new Set([
    'background-layer', 'background-overlay', 'ambience-canvas',
    'content', 'top-bar', 'scrapbook-panel', 'settings-panel',
    // Dynamically appended modals/overlays
    'widget-settings-overlay', 'widget-gallery-overlay',
    'quicklink-modal-overlay', 'sound-panel'
  ]);

  function hideChromeCrap() {
    document.querySelectorAll('body > *').forEach(el => {
      if (el.tagName === 'SCRIPT' || el.tagName === 'LINK' || el.tagName === 'STYLE') return;
      if (el.tagName === 'CANVAS' && el.id === 'ambience-canvas') return;
      if (OUR_IDS.has(el.id)) return;
      // Check if any of the element's classes match our known classes
      for (const cls of el.classList) {
        if (OUR_CLASSES.has(cls)) return;
      }
      // It's not ours — hide it
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

  // Initialize ambient particles
  initAmbience(document.getElementById('ambience-canvas'));

  // Initialize search
  initSearch(document.getElementById('search-section'));

  initWeather(document.getElementById('weather'));

  initQuickLinks(document.getElementById('quicklinks-section'));

  initRituals(document.getElementById('rituals-section'));

  // Initialize widgets
  await initWidgets(document.getElementById('widgets-section'));

  // Initialize ambient sounds
  initSounds(document.getElementById('sound-trigger'));

  initScrapbook(
    document.getElementById('scrapbook-btn'),
    document.getElementById('scrapbook-panel')
  );

  initSettings(
    document.getElementById('settings-trigger'),
    document.getElementById('settings-panel')
  );
});
