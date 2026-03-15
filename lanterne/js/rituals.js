import { get, set } from './storage.js';

// Inline SVG icons for the ritual icon picker (Lucide-style)
const RITUAL_ICONS = {
  coffee: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 8h1a4 4 0 1 1 0 8h-1"/><path d="M3 8h14v9a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4Z"/><line x1="6" y1="2" x2="6" y2="4"/><line x1="10" y1="2" x2="10" y2="4"/><line x1="14" y1="2" x2="14" y2="4"/></svg>',
  'book-open': '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>',
  sun: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="m17.66 17.66 1.41 1.41"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="m6.34 17.66-1.41 1.41"/><path d="m19.07 4.93-1.41 1.41"/></svg>',
  moon: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>',
  heart: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/></svg>',
  music: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></svg>',
  dumbbell: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m6.5 6.5 11 11"/><path d="m21 21-1-1"/><path d="m3 3 1 1"/><path d="m18 22 4-4"/><path d="m2 6 4-4"/><path d="m3 10 7-7"/><path d="m14 21 7-7"/></svg>',
  pencil: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/><path d="m15 5 4 4"/></svg>',
  leaf: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 20A7 7 0 0 1 9.8 6.9C15.5 4.9 20 .5 20 .5s-1.5 9-5 13.5c-2 2.5-4 4-4 6z"/><path d="M10.7 13.8a7 7 0 0 0-5.9.4"/></svg>',
  droplets: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M7 16.3c2.2 0 4-1.83 4-4.05 0-1.16-.57-2.26-1.71-3.19S7.29 6.75 7 5.3c-.29 1.45-1.14 2.84-2.29 3.76S3 11.1 3 12.25c0 2.22 1.8 4.05 4 4.05z"/><path d="M12.56 6.6A10.97 10.97 0 0 0 14 3.02c.5 2.5 2 4.9 4 6.5s3 3.5 3 5.5a6.98 6.98 0 0 1-11.91 4.97"/></svg>',
  smile: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M8 14s1.5 2 4 2 4-2 4-2"/><line x1="9" y1="9" x2="9.01" y2="9"/><line x1="15" y1="9" x2="15.01" y2="9"/></svg>',
  star: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>'
};

// Available colors for the color picker
const RITUAL_COLORS = [
  '#e09030', '#d4783c', '#c25e4e', '#9b59b6',
  '#3498db', '#2ecc71', '#1abc9c', '#e74c3c',
  '#f39c12', '#8e6e53', '#607d8b', '#e8a84c'
];

function formatDate(date) {
  return date.toISOString().split('T')[0];
}

function subtractDays(date, days) {
  const d = new Date(date);
  d.setDate(d.getDate() - days);
  return d;
}

function getStreak(ritual) {
  let streak = 0;
  const today = new Date();
  for (let i = 0; i < 365; i++) {
    const dateStr = formatDate(subtractDays(today, i));
    if (ritual.completions.includes(dateStr)) {
      streak++;
    } else if (i > 0) {
      break; // Allow today to not be completed yet
    }
  }
  return streak;
}

export async function initRituals(container) {
  let rituals = await get('rituals', []);
  let expandedId = null; // which ritual's heatmap is showing

  function render() {
    container.innerHTML = '';

    // Ritual orbs row
    const orbsRow = document.createElement('div');
    orbsRow.className = 'rituals-row';

    rituals.forEach(ritual => {
      const today = formatDate(new Date());
      const isCompletedToday = ritual.completions.includes(today);
      const streak = getStreak(ritual);

      const orb = document.createElement('button');
      orb.className = `ritual-orb ${isCompletedToday ? 'completed' : ''}`;
      orb.style.setProperty('--ritual-color', ritual.color);
      orb.title = ritual.name;

      orb.innerHTML = `
        <div class="ritual-icon">${RITUAL_ICONS[ritual.icon] || RITUAL_ICONS.star}</div>
        <span class="ritual-name">${ritual.name}</span>
        ${streak > 0 ? `<span class="ritual-streak">${streak}d</span>` : ''}
      `;

      // Click to toggle completion
      orb.addEventListener('click', async (e) => {
        e.stopPropagation();
        const idx = ritual.completions.indexOf(today);
        if (idx === -1) {
          ritual.completions.push(today);
        } else {
          ritual.completions.splice(idx, 1);
        }
        await set('rituals', rituals);
        render();
      });

      // Right-click context: show heatmap or delete
      orb.addEventListener('contextmenu', (e) => {
        e.preventDefault();
        expandedId = expandedId === ritual.id ? null : ritual.id;
        render();
      });

      orbsRow.appendChild(orb);
    });

    // Add ritual button
    const addBtn = document.createElement('button');
    addBtn.className = 'ritual-add-btn';
    addBtn.innerHTML = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>`;
    addBtn.title = 'Tilføj ritual';
    addBtn.addEventListener('click', () => showAddModal());
    orbsRow.appendChild(addBtn);

    container.appendChild(orbsRow);

    // Heatmap for expanded ritual
    if (expandedId) {
      const ritual = rituals.find(r => r.id === expandedId);
      if (ritual) {
        const heatmap = renderHeatmap(ritual);
        container.appendChild(heatmap);
      }
    }
  }

  function renderHeatmap(ritual) {
    const wrapper = document.createElement('div');
    wrapper.className = 'ritual-heatmap';

    const header = document.createElement('div');
    header.className = 'heatmap-header';
    header.innerHTML = `
      <span>${ritual.name} — sidste 30 dage</span>
      <button class="heatmap-delete" title="Slet ritual">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
      </button>
    `;
    header.querySelector('.heatmap-delete').addEventListener('click', async () => {
      if (confirm(`Slet "${ritual.name}"?`)) {
        rituals = rituals.filter(r => r.id !== ritual.id);
        expandedId = null;
        await set('rituals', rituals);
        render();
      }
    });
    wrapper.appendChild(header);

    const grid = document.createElement('div');
    grid.className = 'heatmap-grid';

    const today = new Date();
    for (let i = 29; i >= 0; i--) {
      const date = subtractDays(today, i);
      const dateStr = formatDate(date);
      const completed = ritual.completions.includes(dateStr);

      const cell = document.createElement('div');
      cell.className = `heatmap-cell ${completed ? 'filled' : ''}`;
      cell.style.setProperty('--ritual-color', ritual.color);
      cell.title = `${dateStr}${completed ? ' \u2713' : ''}`;
      grid.appendChild(cell);
    }

    wrapper.appendChild(grid);
    return wrapper;
  }

  function showAddModal() {
    // Create modal overlay
    const overlay = document.createElement('div');
    overlay.className = 'ritual-modal-overlay';

    const modal = document.createElement('div');
    modal.className = 'ritual-modal';

    let selectedIcon = 'star';
    let selectedColor = RITUAL_COLORS[0];

    modal.innerHTML = `
      <h3>Tilføj ritual</h3>
      <input type="text" class="ritual-input" placeholder="Navn på dit ritual..." maxlength="24" autofocus />

      <label class="ritual-label">Ikon</label>
      <div class="icon-picker">
        ${Object.entries(RITUAL_ICONS).map(([name, svg]) =>
          `<button class="icon-option ${name === selectedIcon ? 'selected' : ''}" data-icon="${name}" title="${name}">${svg}</button>`
        ).join('')}
      </div>

      <label class="ritual-label">Farve</label>
      <div class="color-picker">
        ${RITUAL_COLORS.map(color =>
          `<button class="color-option ${color === selectedColor ? 'selected' : ''}" data-color="${color}" style="background: ${color}"></button>`
        ).join('')}
      </div>

      <div class="ritual-modal-actions">
        <button class="ritual-cancel">Annuller</button>
        <button class="ritual-save">Tilføj</button>
      </div>
    `;

    overlay.appendChild(modal);
    document.body.appendChild(overlay);

    // Focus input
    setTimeout(() => modal.querySelector('.ritual-input').focus(), 50);

    // Icon selection
    modal.querySelectorAll('.icon-option').forEach(btn => {
      btn.addEventListener('click', () => {
        modal.querySelectorAll('.icon-option').forEach(b => b.classList.remove('selected'));
        btn.classList.add('selected');
        selectedIcon = btn.dataset.icon;
      });
    });

    // Color selection
    modal.querySelectorAll('.color-option').forEach(btn => {
      btn.addEventListener('click', () => {
        modal.querySelectorAll('.color-option').forEach(b => b.classList.remove('selected'));
        btn.classList.add('selected');
        selectedColor = btn.dataset.color;
      });
    });

    // Cancel
    modal.querySelector('.ritual-cancel').addEventListener('click', () => overlay.remove());
    overlay.addEventListener('click', (e) => { if (e.target === overlay) overlay.remove(); });

    // Save
    modal.querySelector('.ritual-save').addEventListener('click', async () => {
      const name = modal.querySelector('.ritual-input').value.trim();
      if (!name) return;

      rituals.push({
        id: 'r_' + Date.now(),
        name,
        icon: selectedIcon,
        color: selectedColor,
        createdAt: formatDate(new Date()),
        completions: []
      });

      await set('rituals', rituals);
      overlay.remove();
      render();
    });

    // Enter to save
    modal.querySelector('.ritual-input').addEventListener('keydown', (e) => {
      if (e.key === 'Enter') modal.querySelector('.ritual-save').click();
    });
  }

  render();
}
