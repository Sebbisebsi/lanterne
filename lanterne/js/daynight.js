import { get } from './storage.js';

/**
 * Dynamisk dag-nat belysningssystem.
 *
 * Tegner en sol/maane der bevaeger sig i en bue henover skaermen
 * baseret paa klokkeslaettet, plus dynamiske lysgradienter der
 * skifter farvetemperatur hen over doegnet.
 *
 * Solopgang (06-08): varm orange/pink fra venstre
 * Dag (08-16): lyst gult lys oppefra
 * Solnedgang (16-19): dybt orange/roedt fra hoejre
 * Nat (19-06): moerkeblaat med subtilt maanelys
 */

export function initDayNight(canvas) {
  const ctx = canvas.getContext('2d');
  let width, height;
  let animId;

  function resize() {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
  }

  // Get time progress through the day (0-24 as float)
  function getTimeFloat() {
    const now = new Date();
    return now.getHours() + now.getMinutes() / 60 + now.getSeconds() / 3600;
  }

  // Returns true if it's "daytime" (for theme switching)
  function isDaytime(t) {
    return t >= 6.5 && t < 18.5;
  }

  // Smooth interpolation
  function lerp(a, b, t) {
    return a + (b - a) * Math.max(0, Math.min(1, t));
  }

  // Ease in-out for smoother transitions
  function easeInOut(t) {
    return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
  }

  // Get the sun/moon position on an arc across the screen
  // sunProgress: 0 = left horizon, 0.5 = top center, 1 = right horizon
  function getCelestialPosition(progress) {
    const pad = width * 0.08;
    const x = pad + progress * (width - 2 * pad);
    // Arc: parabola peaking at 15% from top
    const peakY = height * 0.12;
    const horizonY = height * 0.55;
    const t = (progress - 0.5) * 2; // -1 to 1
    const y = peakY + (horizonY - peakY) * t * t;
    return { x, y };
  }

  // Color phases of the day
  function getPhase(t) {
    // Returns { phase, blend } where blend is 0-1 transition into that phase
    if (t >= 5 && t < 6.5) {
      // Pre-dawn → sunrise
      return { phase: 'dawn', blend: (t - 5) / 1.5 };
    } else if (t >= 6.5 && t < 8) {
      // Sunrise → morning
      return { phase: 'sunrise', blend: (t - 6.5) / 1.5 };
    } else if (t >= 8 && t < 16) {
      // Full day
      return { phase: 'day', blend: 1 };
    } else if (t >= 16 && t < 18) {
      // Afternoon → sunset
      return { phase: 'sunset', blend: (t - 16) / 2 };
    } else if (t >= 18 && t < 19.5) {
      // Sunset → dusk
      return { phase: 'dusk', blend: (t - 18) / 1.5 };
    } else {
      // Night
      return { phase: 'night', blend: 1 };
    }
  }

  // Draw the sun
  function drawSun(x, y, size, opacity) {
    // Outer glow
    const glow = ctx.createRadialGradient(x, y, 0, x, y, size * 6);
    glow.addColorStop(0, `rgba(255, 200, 80, ${opacity * 0.15})`);
    glow.addColorStop(0.3, `rgba(255, 180, 60, ${opacity * 0.08})`);
    glow.addColorStop(0.6, `rgba(255, 160, 40, ${opacity * 0.03})`);
    glow.addColorStop(1, 'rgba(255, 160, 40, 0)');
    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.arc(x, y, size * 6, 0, Math.PI * 2);
    ctx.fill();

    // Medium glow
    const midGlow = ctx.createRadialGradient(x, y, 0, x, y, size * 2.5);
    midGlow.addColorStop(0, `rgba(255, 220, 120, ${opacity * 0.4})`);
    midGlow.addColorStop(0.5, `rgba(255, 200, 80, ${opacity * 0.15})`);
    midGlow.addColorStop(1, 'rgba(255, 180, 60, 0)');
    ctx.fillStyle = midGlow;
    ctx.beginPath();
    ctx.arc(x, y, size * 2.5, 0, Math.PI * 2);
    ctx.fill();

    // Sun body
    const sunGrad = ctx.createRadialGradient(x, y, 0, x, y, size);
    sunGrad.addColorStop(0, `rgba(255, 240, 200, ${opacity * 0.9})`);
    sunGrad.addColorStop(0.7, `rgba(255, 210, 120, ${opacity * 0.7})`);
    sunGrad.addColorStop(1, `rgba(255, 180, 60, ${opacity * 0.3})`);
    ctx.fillStyle = sunGrad;
    ctx.beginPath();
    ctx.arc(x, y, size, 0, Math.PI * 2);
    ctx.fill();
  }

  // Draw the moon
  function drawMoon(x, y, size, opacity) {
    // Outer glow
    const glow = ctx.createRadialGradient(x, y, 0, x, y, size * 5);
    glow.addColorStop(0, `rgba(180, 200, 240, ${opacity * 0.1})`);
    glow.addColorStop(0.4, `rgba(150, 170, 220, ${opacity * 0.04})`);
    glow.addColorStop(1, 'rgba(130, 150, 200, 0)');
    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.arc(x, y, size * 5, 0, Math.PI * 2);
    ctx.fill();

    // Moon body
    const moonGrad = ctx.createRadialGradient(x - size * 0.2, y - size * 0.2, 0, x, y, size);
    moonGrad.addColorStop(0, `rgba(230, 235, 250, ${opacity * 0.85})`);
    moonGrad.addColorStop(0.8, `rgba(200, 210, 235, ${opacity * 0.6})`);
    moonGrad.addColorStop(1, `rgba(180, 195, 225, ${opacity * 0.3})`);
    ctx.fillStyle = moonGrad;
    ctx.beginPath();
    ctx.arc(x, y, size, 0, Math.PI * 2);
    ctx.fill();

    // Crescent shadow (dark side)
    ctx.fillStyle = `rgba(20, 25, 50, ${opacity * 0.7})`;
    ctx.beginPath();
    ctx.arc(x + size * 0.35, y - size * 0.1, size * 0.85, 0, Math.PI * 2);
    ctx.fill();
  }

  // Draw light rays from a celestial body
  function drawLightRays(x, y, intensity, color) {
    // Cone of light shining downward
    const grad = ctx.createRadialGradient(x, y, 0, x, height, height - y);
    grad.addColorStop(0, color.replace('ALPHA', (intensity * 0.12).toFixed(3)));
    grad.addColorStop(0.3, color.replace('ALPHA', (intensity * 0.06).toFixed(3)));
    grad.addColorStop(0.6, color.replace('ALPHA', (intensity * 0.02).toFixed(3)));
    grad.addColorStop(1, color.replace('ALPHA', '0'));

    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.moveTo(x, y);
    // Spread angle
    const spread = width * 0.4;
    ctx.lineTo(x - spread, height);
    ctx.lineTo(x + spread, height);
    ctx.closePath();
    ctx.fill();
  }

  // Ambient gradient overlay for time of day
  function drawAmbientLight(phase) {
    const { phase: p, blend } = phase;
    const b = easeInOut(blend);

    if (p === 'dawn') {
      // Dark blue → warm pre-dawn glow from left-bottom
      const grad = ctx.createRadialGradient(0, height * 0.8, 0, 0, height * 0.8, width * 0.7);
      grad.addColorStop(0, `rgba(180, 100, 60, ${b * 0.06})`);
      grad.addColorStop(0.5, `rgba(120, 60, 80, ${b * 0.03})`);
      grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, width, height);
    } else if (p === 'sunrise') {
      // Warm orange/pink wash from the left
      const grad = ctx.createLinearGradient(0, 0, width * 0.6, 0);
      grad.addColorStop(0, `rgba(255, 150, 80, ${b * 0.08})`);
      grad.addColorStop(0.4, `rgba(255, 120, 80, ${b * 0.04})`);
      grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, width, height);
    } else if (p === 'day') {
      // Subtle warm light from top
      const grad = ctx.createLinearGradient(width / 2, 0, width / 2, height);
      grad.addColorStop(0, 'rgba(255, 230, 160, 0.04)');
      grad.addColorStop(0.4, 'rgba(255, 220, 140, 0.02)');
      grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, width, height);
    } else if (p === 'sunset') {
      // Deep orange/red from the right
      const grad = ctx.createLinearGradient(width, 0, width * 0.4, 0);
      grad.addColorStop(0, `rgba(255, 100, 50, ${b * 0.1})`);
      grad.addColorStop(0.3, `rgba(220, 80, 60, ${b * 0.06})`);
      grad.addColorStop(0.7, `rgba(180, 60, 80, ${b * 0.03})`);
      grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, width, height);
    } else if (p === 'dusk') {
      // Purple/deep blue settling
      const grad = ctx.createLinearGradient(width, height * 0.3, 0, height);
      grad.addColorStop(0, `rgba(100, 50, 120, ${b * 0.06})`);
      grad.addColorStop(0.5, `rgba(40, 30, 80, ${b * 0.04})`);
      grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, width, height);
    } else {
      // Night — very subtle deep blue
      const grad = ctx.createRadialGradient(width / 2, 0, 0, width / 2, 0, height);
      grad.addColorStop(0, 'rgba(30, 40, 80, 0.04)');
      grad.addColorStop(1, 'rgba(10, 15, 40, 0.02)');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, width, height);
    }
  }

  // Stars at night
  let stars = [];
  function initStars() {
    stars = [];
    const count = Math.round((width * height) / 15000);
    for (let i = 0; i < count; i++) {
      stars.push({
        x: Math.random() * width,
        y: Math.random() * height * 0.6,
        size: Math.random() * 1.5 + 0.3,
        twinkleSpeed: 0.003 + Math.random() * 0.008,
        twinkleOffset: Math.random() * Math.PI * 2,
        brightness: 0.3 + Math.random() * 0.7
      });
    }
  }

  function drawStars(opacity) {
    if (opacity <= 0) return;
    const now = Date.now() / 1000;
    for (const s of stars) {
      const twinkle = 0.5 + 0.5 * Math.sin(now * s.twinkleSpeed * 10 + s.twinkleOffset);
      const alpha = opacity * s.brightness * twinkle;
      if (alpha < 0.01) continue;
      ctx.fillStyle = `rgba(220, 230, 255, ${alpha})`;
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.size, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // Main render
  function render() {
    ctx.clearRect(0, 0, width, height);

    const t = getTimeFloat();
    const phase = getPhase(t);
    const day = isDaytime(t);

    // Draw ambient light overlay
    drawAmbientLight(phase);

    // Calculate sun position (sun is visible roughly 06-18)
    // sunProgress: 0 (left, sunrise) to 1 (right, sunset)
    if (t >= 5.5 && t < 19) {
      const sunProgress = Math.max(0, Math.min(1, (t - 5.5) / 13.5));
      const pos = getCelestialPosition(sunProgress);

      // Fade sun in/out at edges
      let sunOpacity = 1;
      if (t < 6.5) sunOpacity = (t - 5.5) / 1;
      else if (t > 17.5) sunOpacity = (19 - t) / 1.5;
      sunOpacity = Math.max(0, Math.min(1, sunOpacity));

      // Only draw if above "horizon"
      if (pos.y < height * 0.7) {
        // Light rays first (behind sun)
        drawLightRays(pos.x, pos.y, sunOpacity * 0.8, 'rgba(255, 200, 100, ALPHA)');

        // Sun size based on position (bigger near horizon for dramatic effect)
        const horizonFactor = 1 + Math.abs(sunProgress - 0.5) * 0.6;
        const baseSize = Math.min(width, height) * 0.018;
        drawSun(pos.x, pos.y, baseSize * horizonFactor, sunOpacity);
      }
    }

    // Moon (visible roughly 19-05.5, with transitions)
    if (t >= 18 || t < 6.5) {
      // Moon travels from left to right during the night
      let moonT;
      if (t >= 18) {
        moonT = (t - 18) / 12; // 18 → 0, 06 → 1
      } else {
        moonT = (t + 6) / 12;
      }
      const moonProgress = Math.max(0, Math.min(1, moonT));
      const pos = getCelestialPosition(moonProgress);

      let moonOpacity = 1;
      if (t >= 18 && t < 19.5) moonOpacity = (t - 18) / 1.5;
      else if (t >= 5 && t < 6.5) moonOpacity = (6.5 - t) / 1.5;
      moonOpacity = Math.max(0, Math.min(1, moonOpacity));

      if (pos.y < height * 0.7) {
        drawLightRays(pos.x, pos.y, moonOpacity * 0.4, 'rgba(150, 170, 220, ALPHA)');
        const baseSize = Math.min(width, height) * 0.014;
        drawMoon(pos.x, pos.y, baseSize, moonOpacity);
      }

      // Stars at night
      let starOpacity = 0;
      if (t >= 19.5 || t < 5) starOpacity = 0.6;
      else if (t >= 18) starOpacity = ((t - 18) / 1.5) * 0.6;
      else if (t < 6.5) starOpacity = ((6.5 - t) / 1.5) * 0.6;
      drawStars(Math.min(0.6, starOpacity));
    }

    animId = requestAnimationFrame(render);
  }

  // Theme auto-switching
  let lastThemeState = null;

  function checkTheme() {
    const t = getTimeFloat();
    const shouldBeLight = isDaytime(t);

    if (lastThemeState !== shouldBeLight) {
      lastThemeState = shouldBeLight;
      if (shouldBeLight) {
        document.documentElement.setAttribute('data-theme', 'light');
      } else {
        document.documentElement.removeAttribute('data-theme');
      }
    }
  }

  // Init
  resize();
  initStars();
  checkTheme();
  render();

  // Check theme every 30 seconds
  const themeInterval = setInterval(checkTheme, 30000);

  window.addEventListener('resize', () => {
    resize();
    initStars();
  });

  return () => {
    cancelAnimationFrame(animId);
    clearInterval(themeInterval);
  };
}
