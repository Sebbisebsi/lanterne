import { get, set } from './storage.js';

const SNAP_SIZE = 20;
const SNAP_THRESHOLD = 12;

/**
 * Makes widget cards draggable within the widgets container.
 * Positions are saved to storage and restored on load.
 */
export async function initDrag(container) {
  const positions = await get('widgetPositions', {});
  let editMode = false;

  const editBtn = document.createElement('button');
  editBtn.className = 'widget-edit-btn';
  editBtn.title = 'Flyt widgets';
  editBtn.innerHTML = `
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M5 9l4-4 4 4"/>
      <path d="M5 15l4 4 4-4"/>
      <path d="M15 9l4-4"/>
      <path d="M15 15l4 4"/>
    </svg>
    <span>Flyt</span>
  `;

  const resetBtn = document.createElement('button');
  resetBtn.className = 'widget-reset-btn';
  resetBtn.title = 'Nulstil layout';
  resetBtn.style.display = 'none';
  resetBtn.innerHTML = `
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/>
      <path d="M3 3v5h5"/>
    </svg>
    Nulstil
  `;

  // Insert into existing toolbar
  const toolbar = container.querySelector('.widgets-toolbar');
  if (toolbar) {
    toolbar.prepend(resetBtn);
    toolbar.prepend(editBtn);
  }

  editBtn.addEventListener('click', () => {
    editMode = !editMode;
    container.classList.toggle('edit-mode', editMode);
    editBtn.classList.toggle('active', editMode);
    editBtn.querySelector('span').textContent = editMode ? 'Gem' : 'Flyt';
    resetBtn.style.display = editMode ? '' : 'none';
  });

  resetBtn.addEventListener('click', async () => {
    await set('widgetPositions', {});
    container.querySelectorAll('.widget-draggable').forEach(el => {
      el.style.transform = '';
    });
  });

  // Wait for widgets to render
  await new Promise(r => setTimeout(r, 100));

  const widgets = container.querySelectorAll('.widget-card');
  widgets.forEach((widget, i) => {
    const id = widget.closest('[data-widget-id]')?.dataset.widgetId ||
               widget.classList[1] || `widget-${i}`;

    widget.classList.add('widget-draggable');
    widget.setAttribute('data-drag-id', id);

    const handle = document.createElement('div');
    handle.className = 'widget-drag-handle';
    handle.innerHTML = `
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="9" cy="5" r="1"/><circle cx="15" cy="5" r="1"/>
        <circle cx="9" cy="12" r="1"/><circle cx="15" cy="12" r="1"/>
        <circle cx="9" cy="19" r="1"/><circle cx="15" cy="19" r="1"/>
      </svg>
    `;
    widget.prepend(handle);

    if (positions[id]) {
      widget.style.transform = `translate(${positions[id].x}px, ${positions[id].y}px)`;
    }

    let startX, startY, currentX = 0, currentY = 0, isDragging = false;

    if (positions[id]) {
      currentX = positions[id].x;
      currentY = positions[id].y;
    }

    handle.addEventListener('mousedown', onStart);
    handle.addEventListener('touchstart', onStart, { passive: false });

    function onStart(e) {
      if (!editMode) return;
      e.preventDefault();
      isDragging = true;
      widget.classList.add('dragging');

      const point = e.touches ? e.touches[0] : e;
      startX = point.clientX - currentX;
      startY = point.clientY - currentY;

      document.addEventListener('mousemove', onMove);
      document.addEventListener('mouseup', onEnd);
      document.addEventListener('touchmove', onMove, { passive: false });
      document.addEventListener('touchend', onEnd);
    }

    function onMove(e) {
      if (!isDragging) return;
      e.preventDefault();

      const point = e.touches ? e.touches[0] : e;
      let x = point.clientX - startX;
      let y = point.clientY - startY;

      if (Math.abs(x % SNAP_SIZE) < SNAP_THRESHOLD) {
        x = Math.round(x / SNAP_SIZE) * SNAP_SIZE;
      }
      if (Math.abs(y % SNAP_SIZE) < SNAP_THRESHOLD) {
        y = Math.round(y / SNAP_SIZE) * SNAP_SIZE;
      }

      currentX = x;
      currentY = y;
      widget.style.transform = `translate(${x}px, ${y}px)`;
    }

    async function onEnd() {
      isDragging = false;
      widget.classList.remove('dragging');

      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseup', onEnd);
      document.removeEventListener('touchmove', onMove);
      document.removeEventListener('touchend', onEnd);

      positions[id] = { x: currentX, y: currentY };
      await set('widgetPositions', positions);
    }
  });
}
