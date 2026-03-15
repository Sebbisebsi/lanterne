import { get, set } from './storage.js';

const DEFAULT_LINKS = [
  { id: 'ql_1', name: 'Google', url: 'https://www.google.com' },
  { id: 'ql_2', name: 'YouTube', url: 'https://www.youtube.com' },
  { id: 'ql_3', name: 'Gmail', url: 'https://mail.google.com' }
];

function getDomain(url) {
  try {
    return new URL(url).hostname;
  } catch {
    return '';
  }
}

function getFaviconUrl(url) {
  const domain = getDomain(url);
  return domain ? `https://www.google.com/s2/favicons?domain=${domain}&sz=32` : '';
}

export async function initQuickLinks(container) {
  let links = await get('quicklinks', DEFAULT_LINKS);

  function render() {
    container.innerHTML = '';

    const row = document.createElement('div');
    row.className = 'quicklinks-row';

    links.forEach(link => {
      const wrap = document.createElement('div');
      wrap.className = 'quicklink-wrap';

      const el = document.createElement('a');
      el.className = 'quicklink';
      el.href = link.url;
      el.title = link.url;

      const favicon = getFaviconUrl(link.url);
      el.innerHTML = `
        ${favicon ? `<img class="quicklink-favicon" src="${favicon}" alt="" width="16" height="16" />` : ''}
        <span class="quicklink-name">${link.name}</span>
      `;

      // Delete button (visible on hover)
      const deleteBtn = document.createElement('button');
      deleteBtn.className = 'quicklink-delete';
      deleteBtn.title = `Fjern ${link.name}`;
      deleteBtn.innerHTML = `<svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>`;
      deleteBtn.addEventListener('click', async (e) => {
        e.preventDefault();
        e.stopPropagation();
        links = links.filter(l => l.id !== link.id);
        await set('quicklinks', links);
        render();
      });

      wrap.appendChild(el);
      wrap.appendChild(deleteBtn);
      row.appendChild(wrap);
    });

    // Add button
    const addBtn = document.createElement('button');
    addBtn.className = 'quicklink-add';
    addBtn.title = 'Tilfoej link';
    addBtn.innerHTML = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>`;
    addBtn.addEventListener('click', () => showAddModal());
    row.appendChild(addBtn);

    container.appendChild(row);
  }

  function showAddModal() {
    const overlay = document.createElement('div');
    overlay.className = 'quicklink-modal-overlay';

    const modal = document.createElement('div');
    modal.className = 'quicklink-modal';
    modal.innerHTML = `
      <h3>Tilfoej link</h3>
      <input type="text" class="quicklink-input" id="ql-name" placeholder="Navn (f.eks. Reddit)" maxlength="20" />
      <input type="url" class="quicklink-input" id="ql-url" placeholder="URL (f.eks. https://reddit.com)" />
      <div class="quicklink-modal-actions">
        <button class="quicklink-cancel">Annuller</button>
        <button class="quicklink-save">Tilfoej</button>
      </div>
    `;

    overlay.appendChild(modal);
    document.body.appendChild(overlay);

    setTimeout(() => modal.querySelector('#ql-name').focus(), 50);

    overlay.addEventListener('click', (e) => { if (e.target === overlay) overlay.remove(); });
    modal.querySelector('.quicklink-cancel').addEventListener('click', () => overlay.remove());

    // Escape to close
    function onKey(e) { if (e.key === 'Escape') { overlay.remove(); document.removeEventListener('keydown', onKey); } }
    document.addEventListener('keydown', onKey);

    modal.querySelector('.quicklink-save').addEventListener('click', async () => {
      const name = modal.querySelector('#ql-name').value.trim();
      let url = modal.querySelector('#ql-url').value.trim();
      if (!name || !url) return;

      if (!url.startsWith('http://') && !url.startsWith('https://')) {
        url = 'https://' + url;
      }

      links.push({
        id: 'ql_' + Date.now(),
        name,
        url
      });

      await set('quicklinks', links);
      document.removeEventListener('keydown', onKey);
      overlay.remove();
      render();
    });

    modal.querySelector('#ql-url').addEventListener('keydown', (e) => {
      if (e.key === 'Enter') modal.querySelector('.quicklink-save').click();
    });
  }

  render();
}
