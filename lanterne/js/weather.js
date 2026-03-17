import { get, set } from './storage.js';

const CACHE_DURATION = 30 * 60 * 1000; // 30 minutes

const WEATHER_MAP = {
  0: { icon: 'sun', da: 'Klar himmel' },
  1: { icon: 'cloud-sun', da: 'Overvejende klart' },
  2: { icon: 'cloud-sun', da: 'Delvist skyet' },
  3: { icon: 'cloud', da: 'Overskyet' },
  45: { icon: 'cloud', da: 'T\u00e5ge' },
  48: { icon: 'cloud', da: 'Rimt\u00e5ge' },
  51: { icon: 'cloud-drizzle', da: 'Let st\u00f8vregn' },
  53: { icon: 'cloud-drizzle', da: 'St\u00f8vregn' },
  55: { icon: 'cloud-drizzle', da: 'Kraftig st\u00f8vregn' },
  61: { icon: 'cloud-rain', da: 'Let regn' },
  63: { icon: 'cloud-rain', da: 'Regn' },
  65: { icon: 'cloud-rain', da: 'Kraftig regn' },
  66: { icon: 'cloud-rain', da: 'Let isregn' },
  67: { icon: 'cloud-rain', da: 'Kraftig isregn' },
  71: { icon: 'snowflake', da: 'Let sne' },
  73: { icon: 'snowflake', da: 'Sne' },
  75: { icon: 'snowflake', da: 'Kraftig sne' },
  77: { icon: 'snowflake', da: 'Snekorn' },
  80: { icon: 'cloud-rain', da: 'Lette regnbyger' },
  81: { icon: 'cloud-rain', da: 'Regnbyger' },
  82: { icon: 'cloud-rain', da: 'Kraftige regnbyger' },
  85: { icon: 'snowflake', da: 'Lette snebyger' },
  86: { icon: 'snowflake', da: 'Kraftige snebyger' },
  95: { icon: 'cloud-lightning', da: 'Tordenvejr' },
  96: { icon: 'cloud-lightning', da: 'Tordenvejr med hagl' },
  99: { icon: 'cloud-lightning', da: 'Kraftigt tordenvejr med hagl' }
};

// Inline SVG icons (Lucide-style, 18x18)
const ICONS = {
  'sun': '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>',
  'cloud-sun': '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="M20 12h2"/><path d="m19.07 4.93-1.41 1.41"/><path d="M15.947 12.65a4 4 0 0 0-5.925-4.128"/><path d="M13 22H7a5 5 0 1 1 4.9-6H13a3 3 0 0 1 0 6Z"/></svg>',
  'cloud': '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z"/></svg>',
  'cloud-drizzle': '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 14.899A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 2.5 8.242"/><path d="M8 19v1"/><path d="M8 14v1"/><path d="M16 19v1"/><path d="M16 14v1"/><path d="M12 21v1"/><path d="M12 16v1"/></svg>',
  'cloud-rain': '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 14.899A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 2.5 8.242"/><path d="M16 14v6"/><path d="M8 14v6"/><path d="M12 16v6"/></svg>',
  'snowflake': '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="2" y1="12" x2="22" y2="12"/><line x1="12" y1="2" x2="12" y2="22"/><path d="m20 16-4-4 4-4"/><path d="m4 8 4 4-4 4"/><path d="m16 4-4 4-4-4"/><path d="m8 20 4-4 4 4"/></svg>',
  'cloud-lightning': '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 16.326A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 .5 8.973"/><path d="m13 12-3 5h4l-3 5"/></svg>',
  'wind': '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17.7 7.7a2.5 2.5 0 1 1 1.8 4.3H2"/><path d="M9.6 4.6A2 2 0 1 1 11 8H2"/><path d="M12.6 19.4A2 2 0 1 0 14 16H2"/></svg>'
};

// Wind chill / heat index approximation for "feels like"
function feelsLike(tempC, windKmh) {
  if (tempC <= 10 && windKmh > 4.8) {
    // Wind chill (Environment Canada formula)
    return Math.round(13.12 + 0.6215 * tempC - 11.37 * Math.pow(windKmh, 0.16) + 0.3965 * tempC * Math.pow(windKmh, 0.16));
  }
  return tempC; // No significant correction
}

function getWeatherInfo(code) {
  return WEATHER_MAP[code] || { icon: 'cloud', da: 'Ukendt' };
}

export async function initWeather(container) {
  // Read weather unit preference
  const settings = await get('settings', {});
  const unit = settings.weatherUnit || 'celsius';

  // Check cache first
  const cached = await get('weatherCache', null);
  if (cached && (Date.now() - cached.timestamp < CACHE_DURATION)) {
    render(container, cached.data, unit);
    return;
  }

  // Get location
  if (!navigator.geolocation) {
    container.innerHTML = '';
    return;
  }

  try {
    const position = await new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(resolve, reject, {
        timeout: 10000,
        maximumAge: 600000
      });
    });

    const { latitude, longitude } = position.coords;
    const response = await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true&hourly=relativehumidity_2m,uv_index&forecast_days=1`
    );
    const data = await response.json();

    if (data.current_weather) {
      // Find current hour's humidity and UV from hourly data
      const currentHour = new Date().getHours();
      let humidity = null;
      let uvIndex = null;
      if (data.hourly) {
        if (data.hourly.relativehumidity_2m) humidity = data.hourly.relativehumidity_2m[currentHour];
        if (data.hourly.uv_index) uvIndex = data.hourly.uv_index[currentHour];
      }

      const weatherData = {
        temp: Math.round(data.current_weather.temperature),
        code: data.current_weather.weathercode,
        windSpeed: data.current_weather.windspeed,
        humidity: humidity,
        uvIndex: uvIndex != null ? Math.round(uvIndex * 10) / 10 : null
      };

      // Cache it
      await set('weatherCache', { data: weatherData, timestamp: Date.now() });
      render(container, weatherData, unit);
    }
  } catch (err) {
    console.log('Weather unavailable:', err.message);
    // Show nothing if weather fails -- not critical
    container.innerHTML = '';
  }
}

function render(container, data, unit = 'celsius') {
  const info = getWeatherInfo(data.code);
  let temp = data.temp; // Celsius from API
  const feels = feelsLike(data.temp, data.windSpeed || 0);
  let symbol = '\u00b0C';
  let displayTemp = temp;
  let displayFeels = feels;

  if (unit === 'fahrenheit') {
    displayTemp = Math.round(temp * 9 / 5 + 32);
    displayFeels = Math.round(feels * 9 / 5 + 32);
    symbol = '\u00b0F';
  }

  const showFeels = Math.abs(feels - temp) >= 2;
  const windDisplay = data.windSpeed ? `${Math.round(data.windSpeed)} km/t` : '';

  // Build tooltip rows
  let tooltipRows = '';
  if (windDisplay) {
    tooltipRows += `<div class="weather-tooltip-row">${ICONS['wind']} Vind: ${windDisplay}</div>`;
  }
  if (showFeels) {
    tooltipRows += `<div class="weather-tooltip-row"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 4v10.54a4 4 0 1 1-4 0V4a2 2 0 0 1 4 0Z"/></svg> F\u00f8les som: ${displayFeels}${symbol}</div>`;
  }
  if (data.humidity != null) {
    tooltipRows += `<div class="weather-tooltip-row"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22a7 7 0 0 0 7-7c0-2-1-3.9-3-5.5s-3.5-4-4-6.5c-.5 2.5-2 4.9-4 6.5C6 11.1 5 13 5 15a7 7 0 0 0 7 7z"/></svg> Luftfugtighed: ${data.humidity}%</div>`;
  }
  if (data.uvIndex != null) {
    const uvLabel = data.uvIndex < 3 ? 'Lav' : data.uvIndex < 6 ? 'Moderat' : data.uvIndex < 8 ? 'H\u00f8j' : 'Meget h\u00f8j';
    tooltipRows += `<div class="weather-tooltip-row"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/></svg> UV-indeks: ${data.uvIndex} (${uvLabel})</div>`;
  }

  container.innerHTML = `
    ${tooltipRows ? `<div class="weather-tooltip">${tooltipRows}</div>` : ''}
    <span class="weather-main">
      ${ICONS[info.icon] || ICONS['cloud']}
      <span>${displayTemp}${symbol}</span>
    </span>
    <span class="weather-separator">\u00b7</span>
    <span>${info.da}</span>
    ${windDisplay ? `
      <span class="weather-separator">\u00b7</span>
      <span class="weather-detail">${ICONS['wind']} ${windDisplay}</span>
    ` : ''}
    ${showFeels ? `
      <span class="weather-separator">\u00b7</span>
      <span class="weather-detail weather-feels">F\u00f8les som ${displayFeels}${symbol}</span>
    ` : ''}
  `;
}
