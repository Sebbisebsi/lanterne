import { get } from './storage.js';

const DA_DAYS = ['søndag', 'mandag', 'tirsdag', 'onsdag', 'torsdag', 'fredag', 'lørdag'];
const DA_MONTHS = ['januar', 'februar', 'marts', 'april', 'maj', 'juni', 'juli', 'august', 'september', 'oktober', 'november', 'december'];

// Daily inspirational quotes (Danish)
const QUOTES = [
  'Det eneste umulige er det, du ikke prøver.',
  'Hver dag er en ny begyndelse.',
  'Små skridt fører til store forandringer.',
  'Vær den forandring, du ønsker at se.',
  'Mod er ikke fravær af frygt, men handling trods den.',
  'Den bedste tid at plante et træ var for 20 år siden. Den næstbedste tid er nu.',
  'Succes er summen af små indsatser, gentaget dag efter dag.',
  'Du behøver ikke se hele trappen. Tag bare det første skridt.',
  'Det du gør i dag, former den du er i morgen.',
  'Kreativitet er intelligens, der har det sjovt.',
  'Livet begynder ved enden af din komfortzone.',
  'Fokus er kunsten at vide, hvad man skal ignorere.',
  'Tålmodighed er også en form for handling.',
  'Den største risiko er ikke at tage nogen.',
  'Enkelhed er den ultimative sofistikering.',
  'Gør det med passion, eller lad helt være.',
  'Et godt mål er som frisk luft — det behøver man altid.',
  'Drømme uden handling er bare ønsker.',
  'Den eneste grænse er den, du sætter for dig selv.',
  'Hvert sekund er en chance for at ændre kurs.',
  'Viden er magt, men handling er nøglen.',
  'Intet stort blev nogensinde opnået uden begejstring.',
  'Tag dig tid til at gøre det, der gør din sjæl glad.',
  'Man behøver ikke være perfekt for at være fantastisk.',
  'I dag er en god dag til en god dag.',
  'Styrke vokser ikke af det, du kan. Den vokser af det, du overvinder.',
  'Lev simpelt, drøm stort, vær taknemmelig.',
  'Det handler ikke om at have tid. Det handler om at tage den.',
  'Fejl er bevis på, at du prøver.',
  'Den største opdagelse er, at man kan ændre sin fremtid ved at ændre sin holdning.'
];

function getDailyQuote() {
  // Deterministic: same quote all day, changes at midnight
  const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0)) / 86400000);
  return QUOTES[dayOfYear % QUOTES.length];
}

function getGreeting(hour) {
  if (hour >= 5 && hour < 12) return 'God morgen';
  if (hour >= 12 && hour < 17) return 'God eftermiddag';
  if (hour >= 17 && hour < 22) return 'God aften';
  return 'God nat';
}

let clockInterval = null;

export async function initClock(clockEl, greetingEl, dateEl) {
  // Clear previous interval so re-init doesn't stack timers
  if (clockInterval) clearInterval(clockInterval);

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
      greetingEl.style.display = '';
      let greet;
      if (settings.greetingStyle === 'custom' && settings.customGreeting) {
        greet = settings.customGreeting.replace(/\{navn\}/gi, settings.userName || '');
      } else {
        greet = getGreeting(hour);
        if (settings.userName) greet += `, ${settings.userName}`;
      }
      if (greet !== lastGreeting) {
        greetingEl.textContent = greet;
        lastGreeting = greet;
      }
    } else {
      greetingEl.style.display = 'none';
    }

    // Date
    const dayName = DA_DAYS[now.getDay()];
    const monthName = DA_MONTHS[now.getMonth()];
    let dateStr;
    if (settings.dateFormat === 'short') {
      dateStr = `${now.getDate()}/${now.getMonth() + 1}/${now.getFullYear()}`;
    } else {
      dateStr = `${dayName} den ${now.getDate()}. ${monthName} ${now.getFullYear()}`;
    }
    if (dateStr !== lastDate) {
      dateEl.textContent = dateStr;
      lastDate = dateStr;
    }
  }

  update();
  clockInterval = setInterval(update, 1000);

  // Daily quote (insert below date if not already there)
  let quoteEl = document.querySelector('.daily-quote');
  if (!quoteEl) {
    quoteEl = document.createElement('div');
    quoteEl.className = 'daily-quote';
    dateEl.parentNode.insertBefore(quoteEl, dateEl.nextSibling);
  }
  quoteEl.textContent = `"${getDailyQuote()}"`;
}
