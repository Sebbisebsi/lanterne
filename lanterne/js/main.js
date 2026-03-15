import { get } from './storage.js';
import { initSearch } from './search.js';
import { initAmbience } from './ambience.js';
import { initClock } from './clock.js';
import { initWeather } from './weather.js';
import { initRituals } from './rituals.js';
import { initQuickLinks } from './quicklinks.js';
import { initScrapbook } from './scrapbook.js';
import { initSettings } from './settings.js';

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

  // Remove Chrome's injected new tab page elements
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      mutation.addedNodes.forEach((node) => {
        if (node.nodeType === 1) {
          // Hide any elements Chrome injects outside our content
          if (node.id && ['ntp-contents', 'oneGoogleBar', 'content'].includes(node.id)) {
            node.style.display = 'none';
          }
          // Hide elements with fixed positioning at the bottom (Chrome's overlay)
          if (node.style && node.style.position === 'fixed' && node.style.bottom !== undefined) {
            node.style.display = 'none';
          }
        }
      });
    });
  });
  observer.observe(document.body, { childList: true, subtree: true });

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

  initScrapbook(
    document.getElementById('scrapbook-btn'),
    document.getElementById('scrapbook-panel')
  );

  initSettings(
    document.getElementById('settings-trigger'),
    document.getElementById('settings-panel')
  );
});
