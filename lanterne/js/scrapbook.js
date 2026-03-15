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

  // Toggle panel
  triggerBtn.addEventListener('click', () => {
    isOpen = !isOpen;
    panel.classList.toggle('open', isOpen);
    if (isOpen) render();
  });

  // Close when clicking outside
  document.addEventListener('click', (e) => {
    if (isOpen && !panel.contains(e.target) && !triggerBtn.contains(e.target)) {
      isOpen = false;
      panel.classList.remove('open');
    }
  });

  async function saveCurrentPage() {
    try {
      // Try Chrome extension API first
      if (typeof chrome !== 'undefined' && chrome.tabs) {
        const tabs = await chrome.tabs.query({ active: true, lastFocusedWindow: true });
        // The new tab itself is active, so get the second most recent
        const allTabs = await chrome.tabs.query({ lastFocusedWindow: true });
        const otherTabs = allTabs.filter(t => !t.url.startsWith('chrome://newtab') && !t.url.includes('newtab.html'));
        const tab = otherTabs[otherTabs.length - 1];

        if (tab) {
          return { title: tab.title || 'Unavngivet', url: tab.url };
        }
      }
    } catch (e) {
      console.log('Tab access limited:', e.message);
    }
    return { title: 'Gemt klip', url: '' };
  }

  function render() {
    panel.innerHTML = `
      <div class="scrapbook-header">
        <h3>Scrapbook</h3>
        <button class="scrapbook-save-btn" title="Gem denne side">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          Gem side
        </button>
      </div>
      <div class="scrapbook-items"></div>
    `;

    if (items.length === 0) {
      panel.querySelector('.scrapbook-items').innerHTML = `
        <div class="scrapbook-empty">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" style="color: var(--text-muted); margin-bottom: 0.5rem;"><path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z"/></svg>
          <p>Ingen gemte sider endnu</p>
          <p class="scrapbook-hint">Klik "Gem side" for at gemme</p>
        </div>
      `;
    }

    // Save button handler
    panel.querySelector('.scrapbook-save-btn').addEventListener('click', async () => {
      const pageInfo = await saveCurrentPage();

      const item = {
        id: 's_' + Date.now(),
        title: pageInfo.title,
        url: pageInfo.url,
        note: '',
        savedAt: new Date().toISOString()
      };

      items.unshift(item);
      await set('scrapbook', items);
      render();
    });

    // Render items
    const itemsContainer = panel.querySelector('.scrapbook-items');
    items.forEach(item => {
      const el = document.createElement('div');
      el.className = 'scrapbook-item';
      el.innerHTML = `
        <div class="scrapbook-item-header">
          <a class="scrapbook-item-title" href="${item.url}" title="${item.url}">${item.title}</a>
          <button class="scrapbook-item-delete" title="Slet">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>
        ${item.url ? `<span class="scrapbook-item-url">${truncateUrl(item.url)}</span>` : ''}
        <textarea class="scrapbook-item-note" placeholder="Tilf&oslash;j en note..." rows="1">${item.note || ''}</textarea>
        <span class="scrapbook-item-time">${timeAgo(item.savedAt)}</span>
      `;

      // Delete
      el.querySelector('.scrapbook-item-delete').addEventListener('click', async () => {
        items = items.filter(i => i.id !== item.id);
        await set('scrapbook', items);
        render();
      });

      // Note editing
      const textarea = el.querySelector('.scrapbook-item-note');
      textarea.addEventListener('input', async () => {
        item.note = textarea.value;
        await set('scrapbook', items);
        // Auto-resize
        textarea.style.height = 'auto';
        textarea.style.height = textarea.scrollHeight + 'px';
      });

      itemsContainer.appendChild(el);
    });
  }

  render();
}
