import { get, set, escapeHTML } from './storage.js';

const DEFAULT_ITEMS = [
  { id: 'c_1', text: 'Tjek e-mails', icon: 'mail' },
  { id: 'c_2', text: 'Planl\u00e6g dagens opgaver', icon: 'list' },
  { id: 'c_3', text: 'Tag en pause', icon: 'coffee' }
];

const CHECKLIST_ICONS = {
  mail: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>',
  list: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>',
  coffee: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 8h1a4 4 0 1 1 0 8h-1"/><path d="M3 8h14v9a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4Z"/><line x1="6" y1="2" x2="6" y2="4"/><line x1="10" y1="2" x2="10" y2="4"/><line x1="14" y1="2" x2="14" y2="4"/></svg>',
  star: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>',
  book: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>',
  gym: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m6.5 6.5 11 11"/><path d="m21 21-1-1"/><path d="m3 3 1 1"/><path d="m18 22 4-4"/><path d="m2 6 4-4"/><path d="m3 10 7-7"/><path d="m14 21 7-7"/></svg>',
  heart: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/></svg>',
  pencil: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/></svg>',
  check: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>'
};

export async function initChecklist(container) {
  let items = await get('checklistItems', DEFAULT_ITEMS);
  let completions = await get('checklistCompletions', {});
  let dragIdx = null;

  // Reset completions if it's a new day
  const today = new Date().toISOString().split('T')[0];
  const lastDate = await get('checklistDate', '');
  if (lastDate !== today) {
    completions = {};
    await set('checklistCompletions', {});
    await set('checklistDate', today);
  }

  function getProgress() {
    if (items.length === 0) return 0;
    const done = items.filter(i => completions[i.id]).length;
    return Math.round((done / items.length) * 100);
  }

  function render() {
    const progress = getProgress();
    const allDone = progress === 100 && items.length > 0;

    container.innerHTML = `
      <div class="checklist-wrap">
        <div class="checklist-header">
          <span class="checklist-title">Daglig tjekliste</span>
          <span class="checklist-progress ${allDone ? 'all-done' : ''}">${progress}%</span>
        </div>
        <div class="checklist-progress-bar">
          <div class="checklist-progress-fill" style="width: ${progress}%"></div>
        </div>
        <div class="checklist-items">
          ${items.map((item, idx) => {
            const done = completions[item.id] || false;
            return `
              <div class="checklist-item ${done ? 'done' : ''}" data-id="${item.id}" data-idx="${idx}" draggable="true">
                <span class="checklist-drag-handle" title="Tr&aelig;k for at flytte">
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="9" cy="6" r="1"/><circle cx="15" cy="6" r="1"/><circle cx="9" cy="12" r="1"/><circle cx="15" cy="12" r="1"/><circle cx="9" cy="18" r="1"/><circle cx="15" cy="18" r="1"/></svg>
                </span>
                <button class="checklist-check">${done ? '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="20 6 9 17 4 12"/></svg>' : ''}</button>
                <span class="checklist-icon">${CHECKLIST_ICONS[item.icon] || CHECKLIST_ICONS.check}</span>
                <span class="checklist-text">${escapeHTML(item.text)}</span>
                <button class="checklist-delete" title="Fjern">
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                </button>
              </div>
            `;
          }).join('')}
        </div>
        <button class="checklist-add-btn">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          <span>Tilf&oslash;j punkt</span>
        </button>
      </div>
    `;

    // Toggle completion
    container.querySelectorAll('.checklist-check').forEach(btn => {
      btn.addEventListener('click', async () => {
        const id = btn.closest('.checklist-item').dataset.id;
        completions[id] = !completions[id];
        await set('checklistCompletions', completions);
        render();
      });
    });

    // Delete item
    container.querySelectorAll('.checklist-delete').forEach(btn => {
      btn.addEventListener('click', async () => {
        const id = btn.closest('.checklist-item').dataset.id;
        items = items.filter(i => i.id !== id);
        delete completions[id];
        await set('checklistItems', items);
        await set('checklistCompletions', completions);
        render();
      });
    });

    // Drag reorder
    container.querySelectorAll('.checklist-item[draggable]').forEach(el => {
      el.addEventListener('dragstart', (e) => {
        dragIdx = parseInt(el.dataset.idx, 10);
        el.classList.add('dragging');
        e.dataTransfer.effectAllowed = 'move';
      });
      el.addEventListener('dragend', () => {
        el.classList.remove('dragging');
        dragIdx = null;
        container.querySelectorAll('.checklist-item').forEach(i => i.classList.remove('drag-over'));
      });
      el.addEventListener('dragover', (e) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
        el.classList.add('drag-over');
      });
      el.addEventListener('dragleave', () => el.classList.remove('drag-over'));
      el.addEventListener('drop', async (e) => {
        e.preventDefault();
        el.classList.remove('drag-over');
        const dropIdx = parseInt(el.dataset.idx, 10);
        if (dragIdx === null || dragIdx === dropIdx) return;
        const moved = items.splice(dragIdx, 1)[0];
        items.splice(dropIdx, 0, moved);
        await set('checklistItems', items);
        render();
      });
    });

    // Add item
    container.querySelector('.checklist-add-btn').addEventListener('click', () => {
      showAddModal();
    });
  }

  function showAddModal() {
    const overlay = document.createElement('div');
    overlay.className = 'checklist-modal-overlay';

    let selectedIcon = 'check';

    overlay.innerHTML = `
      <div class="checklist-modal">
        <h3>Tilf&oslash;j punkt</h3>
        <input type="text" class="checklist-input" placeholder="Hvad skal du g&oslash;re?" maxlength="40" />
        <label class="checklist-label">Ikon</label>
        <div class="checklist-icon-picker">
          ${Object.entries(CHECKLIST_ICONS).map(([name, svg]) =>
            `<button class="checklist-icon-option ${name === selectedIcon ? 'selected' : ''}" data-icon="${name}" title="${name}">${svg}</button>`
          ).join('')}
        </div>
        <div class="checklist-modal-actions">
          <button class="checklist-cancel">Annuller</button>
          <button class="checklist-save">Tilf&oslash;j</button>
        </div>
      </div>
    `;

    document.body.appendChild(overlay);
    setTimeout(() => overlay.querySelector('.checklist-input').focus(), 50);

    // Icon selection
    overlay.querySelectorAll('.checklist-icon-option').forEach(btn => {
      btn.addEventListener('click', () => {
        overlay.querySelectorAll('.checklist-icon-option').forEach(b => b.classList.remove('selected'));
        btn.classList.add('selected');
        selectedIcon = btn.dataset.icon;
      });
    });

    overlay.querySelector('.checklist-cancel').addEventListener('click', () => overlay.remove());
    overlay.addEventListener('click', (e) => { if (e.target === overlay) overlay.remove(); });

    function onKey(e) { if (e.key === 'Escape') { overlay.remove(); document.removeEventListener('keydown', onKey); } }
    document.addEventListener('keydown', onKey);

    overlay.querySelector('.checklist-save').addEventListener('click', async () => {
      const text = overlay.querySelector('.checklist-input').value.trim();
      if (!text) return;

      items.push({
        id: 'c_' + Date.now(),
        text,
        icon: selectedIcon
      });

      await set('checklistItems', items);
      document.removeEventListener('keydown', onKey);
      overlay.remove();
      render();
    });

    overlay.querySelector('.checklist-input').addEventListener('keydown', (e) => {
      if (e.key === 'Enter') overlay.querySelector('.checklist-save').click();
    });
  }

  render();
}
