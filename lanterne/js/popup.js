// Scrapbook popup — shares data with newtab via chrome.storage.local

function escapeHTML(str) {
  const div = document.createElement('div');
  div.appendChild(document.createTextNode(str));
  return div.innerHTML;
}

function sanitizeURL(url) {
  try {
    const u = new URL(url);
    if (u.protocol === 'http:' || u.protocol === 'https:') return u.href;
    return '';
  } catch {
    return '';
  }
}

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

function truncateUrl(url, maxLen = 35) {
  try {
    const u = new URL(url);
    const short = u.hostname + u.pathname;
    return short.length > maxLen ? short.substring(0, maxLen) + '...' : short;
  } catch {
    return url;
  }
}

async function getItems() {
  return new Promise(resolve => {
    chrome.storage.local.get('scrapbook', result => {
      resolve(result.scrapbook || []);
    });
  });
}

async function saveItems(items) {
  return new Promise(resolve => {
    chrome.storage.local.set({ scrapbook: items }, resolve);
  });
}

let items = [];

async function init() {
  items = await getItems();

  // Open new tab button
  document.getElementById('open-newtab').addEventListener('click', () => {
    chrome.tabs.create({ url: 'chrome://newtab' });
    window.close();
  });

  // Toggle add form
  const addForm = document.getElementById('add-form');
  const addToggle = document.getElementById('add-toggle');

  addToggle.addEventListener('click', () => {
    const showing = addForm.style.display !== 'none';
    addForm.style.display = showing ? 'none' : 'flex';
    if (!showing) document.getElementById('add-title').focus();
  });

  document.getElementById('add-cancel').addEventListener('click', () => {
    addForm.style.display = 'none';
  });

  document.getElementById('add-save').addEventListener('click', async () => {
    const title = document.getElementById('add-title').value.trim();
    const url = document.getElementById('add-url').value.trim();
    const note = document.getElementById('add-note').value.trim();
    if (!title && !url) return;

    items.unshift({
      id: 's_' + Date.now(),
      title: title || 'Unavngivet klip',
      url: url || '',
      note: note,
      savedAt: new Date().toISOString()
    });

    await saveItems(items);
    document.getElementById('add-title').value = '';
    document.getElementById('add-url').value = '';
    document.getElementById('add-note').value = '';
    addForm.style.display = 'none';
    renderList();
  });

  renderList();
}

function renderList() {
  const list = document.getElementById('scrapbook-list');

  if (items.length === 0) {
    list.innerHTML = `
      <div class="popup-empty">
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z"/></svg>
        <p>Din scrapbook er tom</p>
        <p class="popup-hint">Gem links, noter og ideer</p>
      </div>`;
    return;
  }

  list.innerHTML = items.map(item => `
    <div class="popup-item" data-id="${item.id}">
      <div class="popup-item-top">
        ${item.url
          ? `<a class="popup-item-title" href="${sanitizeURL(item.url)}" target="_blank" rel="noopener">${escapeHTML(item.title)}</a>`
          : `<span class="popup-item-title">${escapeHTML(item.title)}</span>`
        }
        <button class="popup-item-delete" data-id="${item.id}" title="Slet">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        </button>
      </div>
      ${item.url ? `<span class="popup-item-url">${escapeHTML(truncateUrl(item.url))}</span>` : ''}
      ${item.note ? `<p class="popup-item-note">${escapeHTML(item.note)}</p>` : ''}
      <span class="popup-item-time">${timeAgo(item.savedAt)}</span>
    </div>
  `).join('');

  // Delete handlers
  list.querySelectorAll('.popup-item-delete').forEach(btn => {
    btn.addEventListener('click', async () => {
      items = items.filter(i => i.id !== btn.dataset.id);
      await saveItems(items);
      renderList();
    });
  });
}

document.addEventListener('DOMContentLoaded', init);
