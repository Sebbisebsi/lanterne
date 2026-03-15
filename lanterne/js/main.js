import { get } from './storage.js';
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

  // Initialize all modules
  await initClock(
    document.getElementById('clock'),
    document.getElementById('greeting'),
    document.getElementById('date-display')
  );

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
