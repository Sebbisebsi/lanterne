import { get } from './storage.js';

export async function initSearch(container) {
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
          placeholder="Søg..."
          autofocus
        />
      </div>
    </form>
  `;

  const form = container.querySelector('.search-form');
  const input = container.querySelector('.search-input');

  // Use Chrome Search API — respects the user's chosen default search engine
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const query = input.value.trim();
    if (query) {
      chrome.search.query({ text: query, disposition: 'CURRENT_TAB' });
    }
  });

  // Focus search on any keypress when not in an input
  document.addEventListener('keydown', (e) => {
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
    if (e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey) {
      input.focus();
    }
  });
}
