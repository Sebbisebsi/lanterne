import { get, set } from './storage.js';

/**
 * Stats bar — shows 2-3 small real-time statistics below the clock.
 * Uses free APIs that need NO keys:
 *  - Battery status (Battery API)
 *  - Tab open count (tracked locally)
 *  - Day progress (% of day elapsed)
 */
export async function initStats(container) {
  if (!container) return;

  // Track tab opens
  let tabCount = await get('tabOpenCount', 0);
  tabCount++;
  await set('tabOpenCount', tabCount);

  // Check if it's a new day — reset counter
  const today = new Date().toISOString().split('T')[0];
  const lastDate = await get('tabCountDate', '');
  if (lastDate !== today) {
    tabCount = 1;
    await set('tabOpenCount', 1);
    await set('tabCountDate', today);
  }

  async function render() {
    const stats = [];

    // 1. Day progress
    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const dayProgress = Math.round(((now - startOfDay) / 86400000) * 100);
    stats.push({
      label: 'Dag',
      value: `${dayProgress}%`,
      icon: '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>'
    });

    // 2. Tabs opened today
    stats.push({
      label: 'Tabs i dag',
      value: `${tabCount}`,
      icon: '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18"/></svg>'
    });

    // 3. Battery (if available)
    if (navigator.getBattery) {
      try {
        const battery = await navigator.getBattery();
        const level = Math.round(battery.level * 100);
        const charging = battery.charging;
        stats.push({
          label: charging ? 'Oplader' : 'Batteri',
          value: `${level}%`,
          icon: '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="7" width="18" height="10" rx="2"/><line x1="22" y1="11" x2="22" y2="13"/></svg>'
        });
      } catch {}
    }

    // 4. Week number
    const onejan = new Date(now.getFullYear(), 0, 1);
    const weekNum = Math.ceil(((now - onejan) / 86400000 + onejan.getDay() + 1) / 7);
    stats.push({
      label: 'Uge',
      value: `${weekNum}`,
      icon: '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M8 2v4"/><path d="M16 2v4"/><rect width="18" height="18" x="3" y="4" rx="2"/><path d="M3 10h18"/></svg>'
    });

    container.innerHTML = `
      <div class="stats-row">
        ${stats.map(s => `
          <div class="stat-chip">
            <span class="stat-icon">${s.icon}</span>
            <span class="stat-value">${s.value}</span>
            <span class="stat-label">${s.label}</span>
          </div>
        `).join('')}
      </div>
    `;
  }

  render();
  // Update every minute
  setInterval(render, 60000);
}
