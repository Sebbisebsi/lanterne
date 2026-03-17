import { get } from './storage.js';

const DA_DAYS = ['sondag', 'mandag', 'tirsdag', 'onsdag', 'torsdag', 'fredag', 'lordag'];
const DA_MONTHS = ['januar', 'februar', 'marts', 'april', 'maj', 'juni', 'juli', 'august', 'september', 'oktober', 'november', 'december'];

function getGreeting(hour) {
  if (hour >= 5 && hour < 12) return 'God morgen';
  if (hour >= 12 && hour < 17) return 'God eftermiddag';
  if (hour >= 17 && hour < 22) return 'God aften';
  return 'God nat';
}

export async function initClock(clockEl, greetingEl, dateEl) {
  const stored = await get('settings', {});
  const settings = { clockFormat: '24h', greeting: true, userName: '', ...stored };

  let lastTime = '';
  let lastDate = '';
  let lastGreeting = '';

  function update() {
    const now = new Date();
    const hour = now.getHours();
    const minute = now.getMinutes();
    const second = now.getSeconds();

    // Format time with seconds in muted style
    let timeMain;
    let timeSec = String(second).padStart(2, '0');
    if (settings.clockFormat === '12h') {
      const h = hour % 12 || 12;
      const ampm = hour >= 12 ? 'PM' : 'AM';
      timeMain = `${h}:${String(minute).padStart(2, '0')}`;
      timeSec = `${timeSec} ${ampm}`;
    } else {
      timeMain = `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
    }

    const timeStr = `${timeMain}:${timeSec}`;
    if (timeStr !== lastTime) {
      clockEl.innerHTML = `${timeMain}<span class="clock-seconds">:${timeSec}</span>`;
      lastTime = timeStr;
    }

    // Greeting
    if (settings.greeting) {
      let greet = getGreeting(hour);
      if (settings.userName) greet += `, ${settings.userName}`;
      if (greet !== lastGreeting) {
        greetingEl.textContent = greet;
        lastGreeting = greet;
      }
    }

    // Date
    const dayName = DA_DAYS[now.getDay()];
    const monthName = DA_MONTHS[now.getMonth()];
    const dateStr = `${dayName} den ${now.getDate()}. ${monthName} ${now.getFullYear()}`;
    if (dateStr !== lastDate) {
      dateEl.textContent = dateStr;
      lastDate = dateStr;
    }
  }

  update();
  setInterval(update, 1000);
}
