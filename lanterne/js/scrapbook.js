import { get, set, escapeHTML, sanitizeURL } from './storage.js';

function timeAgo(dateStr) {
  const seconds = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
  if (seconds < 60) return 'lige nu';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes} min siden`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} time${hours > 1 ? 'r' : ''} siden`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days} dag${days > 1 ? 'e' : ''} siden`;
  return new Date(dateStr).toLocaleDateString('da-DK');
}

function truncateUrl(url, maxLen = 40) {
  try {
    const u = new URL(url);
    const short = u.hostname + u.pathname;
    return short.length > maxLen ? short.substring(0, maxLen) + '...' : short;
  } catch {
    return url;
  }
}

export async function initScrapbook(triggerBtn, panel) {
  let items = await get('scrapbook', []);
  let isOpen = false;
  let searchQuery = '';

  triggerBtn.addEventListener('click', () => {
    isOpen = !isOpen;
    panel.classList.toggle('open', isOpen);
    if (isOpen) render();
  });

  document.addEventListener('click', (e) => {
    if (isOpen && !panel.contains(e.target) && !triggerBtn.contains(e.target)) {
      isOpen = false;
      panel.classList.remove('open');
    }
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && isOpen) {
      isOpen = false;
      panel.classList.remove('open');
    }
  });

  async function saveItem(title, url, note = '') {
    const item = {
      id: 's_' + Date.now(),
      title: title || 'Unavngivet klip',
      url: url || '',
      note: note,
      savedAt: new Date().toISOString()
    };
    items.unshift(item);
    await set('scrapbook', items);
    render();
  }

  function getFiltered() {
    if (!searchQuery) return items;
    const q = searchQuery.toLowerCase();
    return items.filter(item =>
      (item.title && item.title.toLowerCase().includes(q)) ||
      (item.url && item.url.toLowerCase().includes(q)) ||
      (item.note && item.note.toLowerCase().includes(q))
    );
  }

  function render() {
    const filtered = getFiltered();

    panel.innerHTML = `
      <div class="scrapbook-inner">
        <div class="scrapbook-header">
          <h3>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z"/></svg>
            Scrapbook
            ${items.length > 0 ? `<span class="scrapbook-count">${items.length}</span>` : ''}
          </h3>
          <button class="scrapbook-close-btn" title="Luk">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>

        ${items.length > 3 ? `
        <div class="scrapbook-search">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          <input class="scrapbook-search-input" type="text" placeholder="S&oslash;g i scrapbook..." value="${escapeHTML(searchQuery)}" />
        </div>
        ` : ''}

        <div class="scrapbook-add-section">
          <button class="scrapbook-add-toggle">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            Tilf&oslash;j nyt klip
          </button>
          <div class="scrapbook-add-form" style="display:none">
            <input class="scrapbook-add-title" type="text" placeholder="Titel..." />
            <input class="scrapbook-add-url" type="url" placeholder="URL (valgfrit)..." />
            <textarea class="scrapbook-add-note" placeholder="Note (valgfrit)..." rows="2"></textarea>
            <div class="scrapbook-add-actions">
              <button class="scrapbook-add-cancel">Annuller</button>
              <button class="scrapbook-add-save">Gem</button>
            </div>
          </div>
        </div>

        <div class="scrapbook-list">
          ${filtered.length === 0
            ? `<div class="scrapbook-empty">
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" style="color: var(--text-muted); opacity: 0.5;"><path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z"/></svg>
                <p>${searchQuery ? 'Ingen resultater' : 'Din scrapbook er tom'}</p>
                <p class="scrapbook-hint">${searchQuery ? 'Pr&oslash;v et andet s&oslash;geord' : 'Gem links, noter og ideer her'}</p>
              </div>`
            : filtered.map(item => `
              <div class="scrapbook-item" data-id="${item.id}">
                <div class="scrapbook-item-top">
                  ${item.url
                    ? `<a class="scrapbook-item-title" href="${sanitizeURL(item.url)}" target="_blank" rel="noopener">${escapeHTML(item.title)}</a>`
                    : `<span class="scrapbook-item-title">${escapeHTML(item.title)}</span>`
                  }
                  <button class="scrapbook-item-delete" title="Slet" data-id="${item.id}">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                  </button>
                </div>
                ${item.url ? `<span class="scrapbook-item-url">${escapeHTML(truncateUrl(item.url))}</span>` : ''}
                <textarea class="scrapbook-item-note" placeholder="Tilf&oslash;j en note..." rows="1" data-id="${item.id}">${escapeHTML(item.note || '')}</textarea>
                <span class="scrapbook-item-time">${timeAgo(item.savedAt)}</span>
              </div>
            `).join('')
          }
        </div>
      </div>
    `;

    // Close button
    panel.querySelector('.scrapbook-close-btn').addEventListener('click', () => {
      isOpen = false;
      panel.classList.remove('open');
    });

    // Search input
    const searchInput = panel.querySelector('.scrapbook-search-input');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        searchQuery = e.target.value;
        render();
        // Re-focus and restore cursor position
        const newInput = panel.querySelector('.scrapbook-search-input');
        if (newInput) {
          newInput.focus();
          newInput.setSelectionRange(newInput.value.length, newInput.value.length);
        }
      });
    }

    // Toggle add form
    const toggleBtn = panel.querySelector('.scrapbook-add-toggle');
    const addForm = panel.querySelector('.scrapbook-add-form');

    toggleBtn.addEventListener('click', () => {
      const showing = addForm.style.display !== 'none';
      addForm.style.display = showing ? 'none' : 'flex';
      if (!showing) {
        addForm.querySelector('.scrapbook-add-title').focus();
      }
    });

    // Cancel add
    panel.querySelector('.scrapbook-add-cancel')?.addEventListener('click', () => {
      addForm.style.display = 'none';
    });

    // Save new item
    panel.querySelector('.scrapbook-add-save')?.addEventListener('click', async () => {
      const title = addForm.querySelector('.scrapbook-add-title').value.trim();
      const url = addForm.querySelector('.scrapbook-add-url').value.trim();
      const note = addForm.querySelector('.scrapbook-add-note').value.trim();
      if (title || url) {
        searchQuery = ''; // Clear search on add
        await saveItem(title || 'Unavngivet', url, note);
      }
    });

    // Delete buttons (with confirm)
    panel.querySelectorAll('.scrapbook-item-delete').forEach(btn => {
      btn.addEventListener('click', async () => {
        const id = btn.dataset.id;
        const item = items.find(i => i.id === id);
        if (!confirm(`Slet "${item ? item.title : 'dette klip'}" fra scrapbook?`)) return;
        items = items.filter(i => i.id !== id);
        await set('scrapbook', items);
        render();
      });
    });

    // Note editing with auto-save
    panel.querySelectorAll('.scrapbook-item-note').forEach(textarea => {
      // Auto-resize
      if (textarea.value) {
        setTimeout(() => {
          textarea.style.height = 'auto';
          textarea.style.height = textarea.scrollHeight + 'px';
        }, 10);
      }

      let debounce;
      textarea.addEventListener('input', async () => {
        clearTimeout(debounce);
        textarea.style.height = 'auto';
        textarea.style.height = textarea.scrollHeight + 'px';

        debounce = setTimeout(async () => {
          const id = textarea.dataset.id;
          const item = items.find(i => i.id === id);
          if (item) {
            item.note = textarea.value;
            await set('scrapbook', items);
          }
        }, 300);
      });
    });
  }

  render();
}
