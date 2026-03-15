import { get, set } from './storage.js';

const ENGINES = {
  google: { name: 'Google', url: 'https://www.google.com/search?q=' },
  duckduckgo: { name: 'DuckDuckGo', url: 'https://duckduckgo.com/?q=' },
  bing: { name: 'Bing', url: 'https://www.bing.com/search?q=' },
  ecosia: { name: 'Ecosia', url: 'https://www.ecosia.org/search?q=' }
};

export async function initSearch(container) {
  const settings = await get('settings', {});
  const engineKey = settings.searchEngine || 'google';
  const engine = ENGINES[engineKey] || ENGINES.google;

  container.innerHTML = `
    <form class="search-form" autocomplete="off">
      <div class="search-wrapper">
        <svg class="search-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="11" cy="11" r="8"/>
          <line x1="21" y1="21" x2="16.65" y2="16.65"/>
        </svg>
        <input
          type="text"
          class="search-input"
          placeholder="S\u00f8g p\u00e5 ${engine.name}..."
          autofocus
        />
        <button type="button" class="search-engine-btn" title="Skift s\u00f8gemaskine">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="6 9 12 15 18 9"/>
          </svg>
        </button>
      </div>
      <div class="search-engines" style="display: none;">
        ${Object.entries(ENGINES).map(([key, e]) =>
          `<button type="button" class="search-engine-option ${key === engineKey ? 'active' : ''}" data-engine="${key}">${e.name}</button>`
        ).join('')}
      </div>
    </form>
  `;

  const form = container.querySelector('.search-form');
  const input = container.querySelector('.search-input');
  const engineBtn = container.querySelector('.search-engine-btn');
  const enginesPanel = container.querySelector('.search-engines');

  // Submit search
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const query = input.value.trim();
    if (query) {
      window.location.href = engine.url + encodeURIComponent(query);
    }
  });

  // Toggle engine picker
  engineBtn.addEventListener('click', () => {
    enginesPanel.style.display = enginesPanel.style.display === 'none' ? 'flex' : 'none';
  });

  // Select engine
  container.querySelectorAll('.search-engine-option').forEach(btn => {
    btn.addEventListener('click', async () => {
      const newSettings = await get('settings', {});
      newSettings.searchEngine = btn.dataset.engine;
      await set('settings', newSettings);
      location.reload();
    });
  });

  // Focus search on any keypress when not in an input
  document.addEventListener('keydown', (e) => {
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
    if (e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey) {
      input.focus();
    }
  });
}
