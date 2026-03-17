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
          placeholder="S&oslash;g..."
        />
        <span class="search-shortcut-hint">/</span>
      </div>
    </form>
  `;

  const form = container.querySelector('.search-form');
  const input = container.querySelector('.search-input');
  const hint = container.querySelector('.search-shortcut-hint');

  // Hide hint when focused or has text
  input.addEventListener('focus', () => hint.classList.add('hidden'));
  input.addEventListener('blur', () => {
    if (!input.value) hint.classList.remove('hidden');
  });

  // Use Chrome Search API — respects the user's chosen default search engine
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const query = input.value.trim();
    if (query) {
      chrome.search.query({ text: query, disposition: 'CURRENT_TAB' });
    }
  });

  // Focus search on "/" or any printable keypress when not in an input
  document.addEventListener('keydown', (e) => {
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
    // Don't steal focus when settings or other panels are open
    if (document.querySelector('.settings-panel.open, .scrapbook-panel.open, .sound-panel.open')) return;
    if (e.key === '/' && !e.ctrlKey && !e.metaKey) {
      e.preventDefault();
      input.focus();
      return;
    }
    if (e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey) {
      input.focus();
    }
  });

  // Escape blurs the search input and clears it
  input.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      input.value = '';
      input.blur();
      hint.classList.remove('hidden');
    }
  });
}
