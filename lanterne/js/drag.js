import { get, set } from './storage.js';

let positions = null;

/**
 * Reset all widget positions to default.
 */
export async function resetPositions(container) {
  positions = {};
  await set('widgetPositions', {});
  container.querySelectorAll('.widget-draggable').forEach(el => {
    el.style.transform = '';
    if (el._dragState) el._dragState.setOffset(0, 0);
  });
}

/**
 * Called after every widget render to attach drag handles.
 * Drag is always active — no edit mode needed.
 * Keeps widgets fully within the viewport at all times.
 */
export async function setupDrag(container) {
  if (!positions) {
    positions = await get('widgetPositions', {});
  }

  const widgets = container.querySelectorAll('.widget-card');
  widgets.forEach((widget, i) => {
    if (widget.querySelector('.widget-drag-handle')) return;

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

    // Track the current transform offset for this widget
    let currentX = positions[id]?.x || 0;
    let currentY = positions[id]?.y || 0;

    // Apply saved position (clamped to current viewport)
    if (positions[id]) {
      const clamped = clampToViewport(widget, currentX, currentY);
      currentX = clamped.x;
      currentY = clamped.y;
      widget.style.transform = `translate(${currentX}px, ${currentY}px)`;
      positions[id] = { x: currentX, y: currentY };
    }

    let startX, startY;
    let isDragging = false;

    handle.addEventListener('mousedown', onStart);
    handle.addEventListener('touchstart', onStart, { passive: false });

    function onStart(e) {
      e.preventDefault();
      e.stopPropagation();
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
      let rawX = point.clientX - startX;
      let rawY = point.clientY - startY;

      const clamped = clampToViewport(widget, rawX, rawY);
      currentX = clamped.x;
      currentY = clamped.y;
      widget.style.transform = `translate(${currentX}px, ${currentY}px)`;
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

    widget._dragState = {
      getCurrentOffset: () => ({ x: currentX, y: currentY }),
      setOffset: (x, y) => { currentX = x; currentY = y; }
    };
  });

  // Listen for resize to clamp widgets back into bounds
  if (!container._resizeListenerAdded) {
    container._resizeListenerAdded = true;
    window.addEventListener('resize', () => {
      container.querySelectorAll('.widget-draggable').forEach(w => {
        const dragId = w.getAttribute('data-drag-id');
        if (!dragId || !w._dragState) return;
        const current = w._dragState.getCurrentOffset();
        if (current.x === 0 && current.y === 0) return;
        const clamped = clampToViewport(w, current.x, current.y);
        w.style.transform = `translate(${clamped.x}px, ${clamped.y}px)`;
        w._dragState.setOffset(clamped.x, clamped.y);
        if (positions[dragId]) positions[dragId] = { x: clamped.x, y: clamped.y };
      });
    });
  }
}

/**
 * Clamp a translate offset so the widget stays fully within the viewport.
 */
function clampToViewport(widget, newX, newY) {
  const rect = widget.getBoundingClientRect();
  const w = rect.width;
  const h = rect.height;

  const style = widget.style.transform;
  let curTx = 0, curTy = 0;
  if (style) {
    const match = style.match(/translate\(\s*(-?[\d.]+)px\s*,\s*(-?[\d.]+)px\s*\)/);
    if (match) {
      curTx = parseFloat(match[1]);
      curTy = parseFloat(match[2]);
    }
  }

  const naturalLeft = rect.left - curTx;
  const naturalTop = rect.top - curTy;

  const vw = window.innerWidth;
  const vh = window.innerHeight;

  const pad = 8;
  const minX = pad - naturalLeft;
  const maxX = vw - pad - naturalLeft - w;
  const minY = pad - naturalTop;
  const maxY = vh - pad - naturalTop - h;

  return {
    x: Math.round(Math.max(minX, Math.min(maxX, newX))),
    y: Math.round(Math.max(minY, Math.min(maxY, newY)))
  };
}
