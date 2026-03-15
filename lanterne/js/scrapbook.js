import { get, set } from './storage.js';

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

  // Keyboard shortcut: Escape closes
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && isOpen) {
      isOpen = false;
      panel.classList.remove('open');
    }
  });

  async function addManualClip() {
    // Show inline add form
    const form = panel.querySelector('.scrapbook-add-form');
    if (form) {
      form.style.display = form.style.display === 'none' ? 'flex' : 'none';
      if (form.style.display === 'flex') {
        form.querySelector('.scrapbook-add-title').focus();
      }
      return;
    }
  }

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

  function render() {
    panel.innerHTML = `
      <div class="scrapbook-inner">
        <div class="scrapbook-header">
          <h3>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z"/></svg>
            Scrapbook
          </h3>
          <button class="scrapbook-close-btn" title="Luk">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>

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
          ${items.length === 0
            ? `<div class="scrapbook-empty">
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" style="color: var(--text-muted); opacity: 0.5;"><path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z"/></svg>
                <p>Din scrapbook er tom</p>
                <p class="scrapbook-hint">Gem links, noter og ideer her</p>
              </div>`
            : items.map(item => `
              <div class="scrapbook-item" data-id="${item.id}">
                <div class="scrapbook-item-top">
                  ${item.url
                    ? `<a class="scrapbook-item-title" href="${item.url}" target="_blank" rel="noopener">${item.title}</a>`
                    : `<span class="scrapbook-item-title">${item.title}</span>`
                  }
                  <button class="scrapbook-item-delete" title="Slet" data-id="${item.id}">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                  </button>
                </div>
                ${item.url ? `<span class="scrapbook-item-url">${truncateUrl(item.url)}</span>` : ''}
                <textarea class="scrapbook-item-note" placeholder="Tilf&oslash;j en note..." rows="1" data-id="${item.id}">${item.note || ''}</textarea>
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
        await saveItem(title || 'Unavngivet', url, note);
      }
    });

    // Delete buttons
    panel.querySelectorAll('.scrapbook-item-delete').forEach(btn => {
      btn.addEventListener('click', async () => {
        const id = btn.dataset.id;
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
