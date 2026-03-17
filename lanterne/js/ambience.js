import { get } from './storage.js';

export async function initAmbience(canvas, settingsOverride) {
  const ctx = canvas.getContext('2d');
  let particles = [];
  let animId;
  let width, height;

  const settings = settingsOverride || await get('settings', {});
  const effectType = settings.effectType || 'embers';
  const effectAmount = settings.effectAmount || 'medium';
  const amountMul = { lav: 0.4, medium: 1, høj: 2 }[effectAmount] || 1;

  // Star-specific settings
  const starsShootFreq = settings.starsShootFreq || 'normal';
  const starsDeepSky = settings.starsDeepSky !== false;
  const starsTwinkle = settings.starsTwinkle || 'normal';
  const twinkleMul = { rolig: 0.4, normal: 1, intens: 2.2 }[starsTwinkle] || 1;
  // Shooting star spawn intervals (in frames @ 60fps)
  const shootIntervals = {
    ingen: Infinity,
    sjælden: { base: 600, range: 600 },
    normal: { base: 360, range: 480 },
    hyppig: { base: 120, range: 180 }
  };
  const shootCfg = shootIntervals[starsShootFreq] || shootIntervals.normal;

  function resize() {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
  }

  // ---- EMBERS ----
  function createEmber() {
    return {
      type: 'ember',
      x: Math.random() * width,
      y: Math.random() * height,
      size: Math.random() * 2.5 + 0.5,
      speedX: (Math.random() - 0.5) * 0.3,
      speedY: (Math.random() - 0.5) * 0.2 - 0.1,
      opacity: Math.random() * 0.4 + 0.1,
      opacitySpeed: (Math.random() - 0.5) * 0.005,
      hue: 30 + Math.random() * 20,
      life: 0,
      maxLife: 300 + Math.random() * 600
    };
  }

  function drawEmber(p) {
    const isLight = document.documentElement.getAttribute('data-theme') === 'light';
    p.life++;
    p.x += p.speedX;
    p.y += p.speedY;
    p.opacity += p.opacitySpeed;

    let lifeFade = 1;
    if (p.life < 60) lifeFade = p.life / 60;
    if (p.life > p.maxLife - 60) lifeFade = (p.maxLife - p.life) / 60;
    if (p.opacity > 0.5) p.opacitySpeed = -Math.abs(p.opacitySpeed);
    if (p.opacity < 0.05) p.opacitySpeed = Math.abs(p.opacitySpeed);

    const finalOp = p.opacity * lifeFade * (isLight ? 0.75 : 1);

    const gradient = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size * 4);
    gradient.addColorStop(0, `hsla(${p.hue}, 80%, ${isLight ? '50%' : '70%'}, ${finalOp * 0.3})`);
    gradient.addColorStop(1, `hsla(${p.hue}, 80%, ${isLight ? '50%' : '70%'}, 0)`);
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.size * 4, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = `hsla(${p.hue}, 90%, ${isLight ? '60%' : '80%'}, ${finalOp})`;
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
    ctx.fill();

    return p.life <= p.maxLife && p.x > -20 && p.x < width + 20 && p.y > -20 && p.y < height + 20;
  }

  // ---- RAIN ----
  function createRain() {
    return {
      type: 'rain',
      x: Math.random() * (width + 100) - 50,
      y: Math.random() * -height,
      length: 10 + Math.random() * 20,
      speed: 8 + Math.random() * 8,
      opacity: 0.08 + Math.random() * 0.2,
      windOffset: -1.5
    };
  }

  function drawRain(p) {
    p.y += p.speed;
    p.x += p.windOffset;
    const isLight = document.documentElement.getAttribute('data-theme') === 'light';
    ctx.strokeStyle = `rgba(${isLight ? '60,95,150' : '140,180,220'}, ${isLight ? p.opacity * 1.5 : p.opacity})`;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(p.x, p.y);
    ctx.lineTo(p.x + p.windOffset * 2, p.y + p.length);
    ctx.stroke();
    return p.y < height + 30;
  }

  // ---- WIND (floating dust/leaves) ----
  function createWind() {
    return {
      type: 'wind',
      x: -20,
      y: Math.random() * height,
      size: 1.5 + Math.random() * 3,
      speedX: 1.5 + Math.random() * 3,
      speedY: (Math.random() - 0.5) * 1.5,
      wobble: Math.random() * Math.PI * 2,
      wobbleSpeed: 0.02 + Math.random() * 0.03,
      opacity: 0.12 + Math.random() * 0.25,
      hue: Math.random() > 0.5 ? (25 + Math.random() * 20) : (90 + Math.random() * 40),
      rotation: Math.random() * Math.PI * 2,
      rotSpeed: (Math.random() - 0.5) * 0.05
    };
  }

  function drawWind(p) {
    p.x += p.speedX;
    p.wobble += p.wobbleSpeed;
    p.y += p.speedY + Math.sin(p.wobble) * 0.8;
    p.rotation += p.rotSpeed;
    const isLight = document.documentElement.getAttribute('data-theme') === 'light';

    ctx.save();
    ctx.translate(p.x, p.y);
    ctx.rotate(p.rotation);
    ctx.fillStyle = `hsla(${p.hue}, 50%, ${isLight ? '40%' : '60%'}, ${isLight ? p.opacity * 1.5 : p.opacity})`;
    ctx.beginPath();
    ctx.ellipse(0, 0, p.size * 2, p.size, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    return p.x < width + 40;
  }

  // ---- SNOW ----
  function createSnow() {
    return {
      type: 'snow',
      x: Math.random() * (width + 60) - 30,
      y: Math.random() * -height,
      size: 1 + Math.random() * 3.5,
      speed: 0.6 + Math.random() * 1.8,
      wobble: Math.random() * Math.PI * 2,
      wobbleSpeed: 0.01 + Math.random() * 0.02,
      wobbleAmp: 0.3 + Math.random() * 0.8,
      opacity: 0.15 + Math.random() * 0.45
    };
  }

  function drawSnow(p) {
    p.y += p.speed;
    p.wobble += p.wobbleSpeed;
    p.x += Math.sin(p.wobble) * p.wobbleAmp;
    const isLight = document.documentElement.getAttribute('data-theme') === 'light';
    const baseColor = isLight ? '80,100,120' : '200,210,230';
    const gradient = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size);
    gradient.addColorStop(0, `rgba(${baseColor}, ${p.opacity})`);
    gradient.addColorStop(1, `rgba(${baseColor}, 0)`);
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
    ctx.fill();
    // Bright core
    ctx.fillStyle = `rgba(${isLight ? '100,120,140' : '255,255,255'}, ${isLight ? p.opacity * 0.8 : p.opacity * 0.6})`;
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.size * 0.3, 0, Math.PI * 2);
    ctx.fill();
    return p.y < height + 20;
  }

  // ---- FIREFLIES ----
  function createFirefly() {
    return {
      type: 'firefly',
      x: Math.random() * width,
      y: Math.random() * height,
      size: 1.5 + Math.random() * 2,
      vx: (Math.random() - 0.5) * 0.6,
      vy: (Math.random() - 0.5) * 0.6,
      pulse: Math.random() * Math.PI * 2,
      pulseSpeed: 0.015 + Math.random() * 0.03,
      baseOpacity: 0.1 + Math.random() * 0.15,
      hue: 45 + Math.random() * 30,
      turnTimer: 0,
      turnInterval: 100 + Math.random() * 200,
      life: 0,
      maxLife: 500 + Math.random() * 800
    };
  }

  function drawFirefly(p) {
    p.life++;
    p.pulse += p.pulseSpeed;
    p.turnTimer++;
    // Randomly change direction
    if (p.turnTimer > p.turnInterval) {
      p.vx += (Math.random() - 0.5) * 0.4;
      p.vy += (Math.random() - 0.5) * 0.4;
      p.vx = Math.max(-1, Math.min(1, p.vx));
      p.vy = Math.max(-1, Math.min(1, p.vy));
      p.turnTimer = 0;
      p.turnInterval = 100 + Math.random() * 200;
    }
    p.x += p.vx;
    p.y += p.vy;
    // Keep in bounds with soft wrapping
    if (p.x < -30) p.x = width + 20;
    if (p.x > width + 30) p.x = -20;
    if (p.y < -30) p.y = height + 20;
    if (p.y > height + 30) p.y = -20;

    const glow = (Math.sin(p.pulse) + 1) / 2; // 0..1
    const isLight = document.documentElement.getAttribute('data-theme') === 'light';
    let lifeFade = 1;
    if (p.life < 80) lifeFade = p.life / 80;
    if (p.life > p.maxLife - 80) lifeFade = (p.maxLife - p.life) / 80;
    const op = (p.baseOpacity + glow * 0.5) * lifeFade * (isLight ? 0.8 : 1);

    // Outer glow
    const grad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size * 6);
    grad.addColorStop(0, `hsla(${p.hue}, 90%, ${isLight ? '55%' : '75%'}, ${op * 0.3})`);
    grad.addColorStop(1, `hsla(${p.hue}, 90%, ${isLight ? '55%' : '75%'}, 0)`);
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.size * 6, 0, Math.PI * 2);
    ctx.fill();
    // Core
    ctx.fillStyle = `hsla(${p.hue}, 100%, ${isLight ? '65%' : '85%'}, ${op})`;
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.size * (0.6 + glow * 0.4), 0, Math.PI * 2);
    ctx.fill();

    return p.life <= p.maxLife;
  }

  // ---- STARS (starry sky with shooting stars, nebula, galaxy) ----
  let shootingStars = [];
  let shootTimer = 0;
  let nextShootAt = shootCfg === Infinity ? Infinity :
    shootCfg.base + Math.floor(Math.random() * shootCfg.range);

  // Deep-sky objects — slow-moving background features
  const deepSky = [];
  function initDeepSky() {
    // Milky Way band — a wide, faint glowing strip across the sky
    deepSky.push({
      kind: 'milkyway',
      angle: -0.3 + Math.random() * 0.6, // slight diagonal
      offset: height * (0.3 + Math.random() * 0.2),
      bandWidth: height * (0.15 + Math.random() * 0.1),
      opacity: 0.018 + Math.random() * 0.012,
      drift: 0.003 + Math.random() * 0.003,
      // Embedded star clusters within the band
      clusters: Array.from({ length: 6 + Math.floor(Math.random() * 5) }, () => ({
        t: Math.random(), // position along band (0-1)
        spread: 8 + Math.random() * 20,
        count: 4 + Math.floor(Math.random() * 8),
        opacity: 0.15 + Math.random() * 0.25,
        seeds: Array.from({ length: 12 }, () => ({
          dx: (Math.random() - 0.5) * 2,
          dy: (Math.random() - 0.5) * 2,
          s: 0.3 + Math.random() * 0.8
        }))
      }))
    });

    // Large spiral galaxy
    deepSky.push({
      kind: 'galaxy',
      x: width * (0.12 + Math.random() * 0.35),
      y: height * (0.08 + Math.random() * 0.3),
      size: 45 + Math.random() * 60,
      angle: Math.random() * Math.PI * 2,
      rotSpeed: 0.00008 + Math.random() * 0.00015,
      tilt: 0.25 + Math.random() * 0.45,
      opacity: 0.035 + Math.random() * 0.04,
      hue: Math.random() > 0.5 ? 220 : 270,
      arms: 2,
      armCurve: 1.2 + Math.random() * 0.4
    });

    // Smaller edge-on galaxy
    deepSky.push({
      kind: 'galaxy',
      x: width * (0.55 + Math.random() * 0.35),
      y: height * (0.1 + Math.random() * 0.25),
      size: 20 + Math.random() * 30,
      angle: Math.random() * Math.PI * 2,
      rotSpeed: 0.0001 + Math.random() * 0.0002,
      tilt: 0.1 + Math.random() * 0.2, // very thin = edge-on
      opacity: 0.025 + Math.random() * 0.03,
      hue: 200 + Math.random() * 40,
      arms: 2,
      armCurve: 1.0 + Math.random() * 0.3
    });

    // Large nebula — emission nebula (red/pink/magenta)
    deepSky.push({
      kind: 'nebula',
      x: width * (0.15 + Math.random() * 0.35),
      y: height * (0.2 + Math.random() * 0.4),
      size: 100 + Math.random() * 140,
      opacity: 0.018 + Math.random() * 0.025,
      hue: 340 + Math.random() * 30, // pinkish-red
      hue2: 270 + Math.random() * 30, // purple fringe
      pulse: Math.random() * Math.PI * 2,
      pulseSpeed: 0.0008 + Math.random() * 0.0012,
      drift: (Math.random() - 0.5) * 0.003,
      lobes: 2 + Math.floor(Math.random() * 3), // organic shape
      lobeSeeds: Array.from({ length: 5 }, () => ({
        angle: Math.random() * Math.PI * 2,
        dist: 0.3 + Math.random() * 0.5,
        size: 0.4 + Math.random() * 0.4
      }))
    });

    // Reflection nebula (blue/cyan)
    deepSky.push({
      kind: 'nebula',
      x: width * (0.55 + Math.random() * 0.35),
      y: height * (0.25 + Math.random() * 0.45),
      size: 50 + Math.random() * 70,
      opacity: 0.012 + Math.random() * 0.02,
      hue: 200 + Math.random() * 40,
      hue2: 180 + Math.random() * 30,
      pulse: Math.random() * Math.PI * 2,
      pulseSpeed: 0.001 + Math.random() * 0.002,
      drift: (Math.random() - 0.5) * 0.005,
      lobes: 1 + Math.floor(Math.random() * 2),
      lobeSeeds: Array.from({ length: 3 }, () => ({
        angle: Math.random() * Math.PI * 2,
        dist: 0.2 + Math.random() * 0.4,
        size: 0.3 + Math.random() * 0.5
      }))
    });

    // Open star cluster — a bright knot of stars
    deepSky.push({
      kind: 'cluster',
      x: width * (0.3 + Math.random() * 0.4),
      y: height * (0.15 + Math.random() * 0.5),
      size: 25 + Math.random() * 35,
      opacity: 0.06 + Math.random() * 0.06,
      starCount: 15 + Math.floor(Math.random() * 20),
      stars: Array.from({ length: 35 }, () => ({
        angle: Math.random() * Math.PI * 2,
        dist: Math.random() ** 0.6, // concentrated toward center
        size: 0.3 + Math.random() * 1.2,
        phase: Math.random() * Math.PI * 2,
        speed: 0.005 + Math.random() * 0.01,
        hue: Math.random() > 0.7 ? 210 + Math.random() * 30 : Math.random() > 0.4 ? 40 + Math.random() * 20 : 0
      }))
    });
  }

  function drawDeepSky() {
    const isLight = document.documentElement.getAttribute('data-theme') === 'light';
    if (isLight) return;

    for (const obj of deepSky) {
      if (obj.kind === 'milkyway') {
        // Faint luminous band across the sky
        obj.offset += obj.drift;
        const cos = Math.cos(obj.angle);
        const sin = Math.sin(obj.angle);
        // Draw as a series of overlapping transparent ellipses
        for (let i = 0; i < 12; i++) {
          const t = i / 11;
          const cx = width * t;
          const cy = obj.offset + sin * (cx - width / 2);
          const bw = obj.bandWidth * (0.7 + Math.sin(t * Math.PI) * 0.5);
          const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, bw);
          const op = obj.opacity * (0.6 + Math.sin(t * Math.PI) * 0.4);
          grad.addColorStop(0, `hsla(220, 15%, 80%, ${op * 0.6})`);
          grad.addColorStop(0.3, `hsla(230, 12%, 70%, ${op * 0.3})`);
          grad.addColorStop(1, `hsla(220, 10%, 60%, 0)`);
          ctx.fillStyle = grad;
          ctx.beginPath();
          ctx.ellipse(cx, cy, bw * 1.8, bw, obj.angle, 0, Math.PI * 2);
          ctx.fill();
        }
        // Embedded star clusters
        for (const cl of obj.clusters) {
          const cx = width * cl.t;
          const cy = obj.offset + sin * (cx - width / 2);
          for (const seed of cl.seeds) {
            const sx = cx + seed.dx * cl.spread;
            const sy = cy + seed.dy * cl.spread;
            ctx.fillStyle = `hsla(40, 10%, 95%, ${cl.opacity * 0.6})`;
            ctx.beginPath();
            ctx.arc(sx, sy, seed.s, 0, Math.PI * 2);
            ctx.fill();
          }
        }
      } else if (obj.kind === 'nebula') {
        obj.pulse += obj.pulseSpeed;
        obj.x += obj.drift;
        if (obj.x < -obj.size) obj.x = width + obj.size;
        if (obj.x > width + obj.size) obj.x = -obj.size;
        const breathe = 0.7 + Math.sin(obj.pulse) * 0.3;
        const op = obj.opacity * breathe;
        // Main body — irregular shape via overlapping lobes
        const lobes = obj.lobeSeeds || [];
        for (const lobe of lobes) {
          const lx = obj.x + Math.cos(lobe.angle) * obj.size * lobe.dist;
          const ly = obj.y + Math.sin(lobe.angle) * obj.size * lobe.dist;
          const lr = obj.size * lobe.size;
          const g = ctx.createRadialGradient(lx, ly, 0, lx, ly, lr);
          g.addColorStop(0, `hsla(${obj.hue}, 55%, 60%, ${op * 0.7})`);
          g.addColorStop(0.35, `hsla(${obj.hue2 || obj.hue + 30}, 45%, 50%, ${op * 0.3})`);
          g.addColorStop(1, `hsla(${obj.hue}, 35%, 40%, 0)`);
          ctx.fillStyle = g;
          ctx.beginPath();
          ctx.arc(lx, ly, lr, 0, Math.PI * 2);
          ctx.fill();
        }
        // Central core
        const g1 = ctx.createRadialGradient(obj.x, obj.y, 0, obj.x, obj.y, obj.size * 0.6);
        g1.addColorStop(0, `hsla(${obj.hue}, 60%, 65%, ${op * 0.9})`);
        g1.addColorStop(0.5, `hsla(${obj.hue + 15}, 50%, 55%, ${op * 0.35})`);
        g1.addColorStop(1, `hsla(${obj.hue}, 40%, 40%, 0)`);
        ctx.fillStyle = g1;
        ctx.beginPath();
        ctx.arc(obj.x, obj.y, obj.size * 0.6, 0, Math.PI * 2);
        ctx.fill();
        // Hot bright core
        const g2 = ctx.createRadialGradient(obj.x, obj.y, 0, obj.x, obj.y, obj.size * 0.15);
        g2.addColorStop(0, `hsla(${obj.hue + 10}, 70%, 80%, ${op * 1.5})`);
        g2.addColorStop(1, `hsla(${obj.hue}, 50%, 55%, 0)`);
        ctx.fillStyle = g2;
        ctx.beginPath();
        ctx.arc(obj.x, obj.y, obj.size * 0.15, 0, Math.PI * 2);
        ctx.fill();
      } else if (obj.kind === 'galaxy') {
        obj.angle += obj.rotSpeed;
        const op = obj.opacity;
        const curve = obj.armCurve || 1.2;
        ctx.save();
        ctx.translate(obj.x, obj.y);
        ctx.rotate(obj.angle);
        ctx.scale(1, obj.tilt);
        // Outer diffuse halo
        const haloGrad = ctx.createRadialGradient(0, 0, obj.size * 0.2, 0, 0, obj.size * 1.2);
        haloGrad.addColorStop(0, `hsla(${obj.hue}, 25%, 65%, ${op * 0.4})`);
        haloGrad.addColorStop(1, `hsla(${obj.hue}, 15%, 50%, 0)`);
        ctx.fillStyle = haloGrad;
        ctx.beginPath();
        ctx.arc(0, 0, obj.size * 1.2, 0, Math.PI * 2);
        ctx.fill();
        // Spiral arms — thicker with dust lanes
        const arms = obj.arms || 2;
        for (let arm = 0; arm < arms; arm++) {
          const armAngle = (arm / arms) * Math.PI * 2;
          // Outer glow arm
          ctx.strokeStyle = `hsla(${obj.hue}, 35%, 70%, ${op * 0.5})`;
          ctx.lineWidth = obj.size * 0.12;
          ctx.lineCap = 'round';
          ctx.beginPath();
          for (let t = 0; t < 3; t += 0.04) {
            const r = obj.size * 0.12 * (1 + t);
            const a = armAngle + t * curve;
            const px = Math.cos(a) * r;
            const py = Math.sin(a) * r;
            if (t === 0) ctx.moveTo(px, py);
            else ctx.lineTo(px, py);
          }
          ctx.stroke();
          // Brighter inner arm
          ctx.strokeStyle = `hsla(${obj.hue + 20}, 50%, 80%, ${op * 0.7})`;
          ctx.lineWidth = obj.size * 0.04;
          ctx.beginPath();
          for (let t = 0.2; t < 2.5; t += 0.04) {
            const r = obj.size * 0.12 * (1 + t);
            const a = armAngle + t * curve;
            const px = Math.cos(a) * r;
            const py = Math.sin(a) * r;
            if (t === 0.2) ctx.moveTo(px, py);
            else ctx.lineTo(px, py);
          }
          ctx.stroke();
        }
        // Bright core
        const coreGrad = ctx.createRadialGradient(0, 0, 0, 0, 0, obj.size * 0.25);
        coreGrad.addColorStop(0, `hsla(40, 35%, 92%, ${op * 2.5})`);
        coreGrad.addColorStop(0.4, `hsla(35, 25%, 80%, ${op * 1})`);
        coreGrad.addColorStop(1, `hsla(40, 20%, 70%, 0)`);
        ctx.fillStyle = coreGrad;
        ctx.beginPath();
        ctx.arc(0, 0, obj.size * 0.25, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      } else if (obj.kind === 'cluster') {
        // Open star cluster — a tight group of twinkling stars
        const op = obj.opacity;
        // Faint glow behind the cluster
        const clGrad = ctx.createRadialGradient(obj.x, obj.y, 0, obj.x, obj.y, obj.size);
        clGrad.addColorStop(0, `hsla(220, 15%, 80%, ${op * 0.15})`);
        clGrad.addColorStop(1, `hsla(220, 10%, 70%, 0)`);
        ctx.fillStyle = clGrad;
        ctx.beginPath();
        ctx.arc(obj.x, obj.y, obj.size, 0, Math.PI * 2);
        ctx.fill();
        // Individual cluster stars
        for (const s of obj.stars) {
          s.phase += s.speed;
          const twinkle = (Math.sin(s.phase) + 1) / 2;
          const sx = obj.x + Math.cos(s.angle) * s.dist * obj.size;
          const sy = obj.y + Math.sin(s.angle) * s.dist * obj.size;
          const sop = op * (0.4 + twinkle * 0.6);
          // Glow
          if (s.size > 0.6) {
            const sg = ctx.createRadialGradient(sx, sy, 0, sx, sy, s.size * 3);
            sg.addColorStop(0, `hsla(${s.hue}, 20%, 90%, ${sop * 0.3})`);
            sg.addColorStop(1, `hsla(${s.hue}, 15%, 85%, 0)`);
            ctx.fillStyle = sg;
            ctx.beginPath();
            ctx.arc(sx, sy, s.size * 3, 0, Math.PI * 2);
            ctx.fill();
          }
          ctx.fillStyle = `hsla(${s.hue}, 15%, 95%, ${sop})`;
          ctx.beginPath();
          ctx.arc(sx, sy, s.size * (0.8 + twinkle * 0.2), 0, Math.PI * 2);
          ctx.fill();
        }
      }
    }
  }

  function createStar() {
    const brightness = Math.random();
    const isBright = brightness > 0.85;
    const isMedium = brightness > 0.6;
    return {
      type: 'star',
      x: Math.random() * width,
      y: Math.random() * height,
      size: isBright ? (1.2 + Math.random() * 1.5) : isMedium ? (0.6 + Math.random() * 0.8) : (0.3 + Math.random() * 0.5),
      pulse: Math.random() * Math.PI * 2,
      pulseSpeed: (0.003 + Math.random() * 0.015) * twinkleMul,
      pulse2: Math.random() * Math.PI * 2,
      pulseSpeed2: (0.001 + Math.random() * 0.004) * twinkleMul,
      baseOpacity: isBright ? (0.6 + Math.random() * 0.4) : isMedium ? (0.2 + Math.random() * 0.3) : (0.05 + Math.random() * 0.15),
      isBright,
      hue: Math.random() > 0.8 ? (210 + Math.random() * 30) : Math.random() > 0.5 ? (40 + Math.random() * 20) : 0,
      sat: Math.random() > 0.8 ? 40 : Math.random() > 0.5 ? 15 : 0,
      driftX: (Math.random() - 0.5) * 0.015,
      driftY: (Math.random() - 0.5) * 0.01
    };
  }

  function createShootingStar() {
    // Shooting stars streak downward diagonally
    const startX = Math.random() * width;
    const startY = -10;
    const angle = (Math.PI / 2) + (Math.random() - 0.5) * 0.8; // mostly downward
    const speed = 5 + Math.random() * 6;
    const vx = Math.cos(angle) * speed;
    const vy = Math.sin(angle) * speed;
    return {
      x: startX,
      y: startY,
      vx, vy,
      size: 1 + Math.random() * 1.5,
      tailLen: 50 + Math.random() * 100,
      opacity: 0.5 + Math.random() * 0.5,
      life: 0,
      maxLife: Math.ceil(Math.max(width, height) / speed) + 20
    };
  }

  function drawStar(p) {
    p.pulse += p.pulseSpeed;
    p.pulse2 += p.pulseSpeed2;
    p.x += p.driftX;
    p.y += p.driftY;
    if (p.x < -10) p.x = width + 10;
    if (p.x > width + 10) p.x = -10;
    if (p.y < -10) p.y = height + 10;
    if (p.y > height + 10) p.y = -10;

    const isLight = document.documentElement.getAttribute('data-theme') === 'light';
    const t1 = (Math.sin(p.pulse) + 1) / 2;
    const t2 = (Math.sin(p.pulse2) + 1) / 2;
    const twinkle = t1 * 0.7 + t2 * 0.3;
    const op = p.baseOpacity * (0.3 + twinkle * 0.7) * (isLight ? 0.5 : 1);

    // Diffraction spikes on bright stars
    if (p.isBright && twinkle > 0.65) {
      const spikeLen = p.size * (2 + twinkle * 6);
      const spikeOp = op * 0.2 * ((twinkle - 0.65) / 0.35);
      ctx.strokeStyle = `hsla(${p.hue}, ${p.sat}%, ${isLight ? '50%' : '85%'}, ${spikeOp})`;
      ctx.lineWidth = 0.5;
      ctx.beginPath();
      ctx.moveTo(p.x - spikeLen, p.y);
      ctx.lineTo(p.x + spikeLen, p.y);
      ctx.moveTo(p.x, p.y - spikeLen);
      ctx.lineTo(p.x, p.y + spikeLen);
      ctx.stroke();
      if (twinkle > 0.8) {
        const d = spikeLen * 0.5;
        ctx.strokeStyle = `hsla(${p.hue}, ${p.sat}%, ${isLight ? '50%' : '85%'}, ${spikeOp * 0.4})`;
        ctx.beginPath();
        ctx.moveTo(p.x - d, p.y - d);
        ctx.lineTo(p.x + d, p.y + d);
        ctx.moveTo(p.x + d, p.y - d);
        ctx.lineTo(p.x - d, p.y + d);
        ctx.stroke();
      }
    }

    // Glow halo
    if (p.size > 0.5) {
      const glowR = p.size * (2.5 + twinkle * 1.5);
      const grad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, glowR);
      grad.addColorStop(0, `hsla(${p.hue}, ${p.sat}%, ${isLight ? '60%' : '92%'}, ${op * 0.25})`);
      grad.addColorStop(1, `hsla(${p.hue}, ${p.sat}%, ${isLight ? '60%' : '92%'}, 0)`);
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(p.x, p.y, glowR, 0, Math.PI * 2);
      ctx.fill();
    }

    // Core
    ctx.fillStyle = `hsla(${p.hue}, ${Math.min(p.sat + 10, 50)}%, ${isLight ? '70%' : '97%'}, ${op})`;
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.size * (0.8 + twinkle * 0.2), 0, Math.PI * 2);
    ctx.fill();

    return true; // Permanent
  }

  function drawShootingStar(s) {
    s.life++;
    s.x += s.vx;
    s.y += s.vy;
    const isLight = document.documentElement.getAttribute('data-theme') === 'light';

    let fade = 1;
    if (s.life < 8) fade = s.life / 8;
    if (s.life > s.maxLife - 15) fade = Math.max(0, (s.maxLife - s.life) / 15);
    const op = s.opacity * fade * (isLight ? 0.6 : 1);

    // Tail — line opposite to velocity direction
    const speed = Math.sqrt(s.vx * s.vx + s.vy * s.vy);
    const nx = s.vx / speed;
    const ny = s.vy / speed;
    const tailX = s.x - nx * s.tailLen;
    const tailY = s.y - ny * s.tailLen;

    const tailGrad = ctx.createLinearGradient(tailX, tailY, s.x, s.y);
    tailGrad.addColorStop(0, `hsla(40, 20%, 90%, 0)`);
    tailGrad.addColorStop(0.6, `hsla(40, 30%, 92%, ${op * 0.12})`);
    tailGrad.addColorStop(1, `hsla(45, 50%, 95%, ${op * 0.5})`);
    ctx.strokeStyle = tailGrad;
    ctx.lineWidth = s.size * 0.7;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(tailX, tailY);
    ctx.lineTo(s.x, s.y);
    ctx.stroke();

    // Head glow
    const hg = ctx.createRadialGradient(s.x, s.y, 0, s.x, s.y, s.size * 3);
    hg.addColorStop(0, `hsla(45, 50%, 96%, ${op * 0.7})`);
    hg.addColorStop(1, `hsla(45, 50%, 96%, 0)`);
    ctx.fillStyle = hg;
    ctx.beginPath();
    ctx.arc(s.x, s.y, s.size * 3, 0, Math.PI * 2);
    ctx.fill();

    // Core
    ctx.fillStyle = `hsla(40, 15%, 98%, ${op})`;
    ctx.beginPath();
    ctx.arc(s.x, s.y, s.size, 0, Math.PI * 2);
    ctx.fill();

    return s.life < s.maxLife && s.y < height + 30 && s.x > -30 && s.x < width + 30;
  }

  // ---- INIT & ANIMATE ----
  function getBaseCount() {
    return Math.max(5, Math.round((width * height) / 25000 * amountMul));
  }

  function createParticle() {
    if (effectType === 'regn') return createRain();
    if (effectType === 'vind') return createWind();
    if (effectType === 'sne') return createSnow();
    if (effectType === 'ildfluer') return createFirefly();
    if (effectType === 'stjerner') return createStar();
    return createEmber();
  }

  function drawParticle(p) {
    if (p.type === 'rain') return drawRain(p);
    if (p.type === 'wind') return drawWind(p);
    if (p.type === 'snow') return drawSnow(p);
    if (p.type === 'firefly') return drawFirefly(p);
    if (p.type === 'star') return drawStar(p);
    return drawEmber(p);
  }

  function init() {
    resize();
    particles = [];
    shootingStars = [];
    shootTimer = 0;
    if (effectType === 'stjerner' && starsDeepSky) initDeepSky();
    let count = getBaseCount();
    if (effectType === 'regn') count *= 3;
    if (effectType === 'sne') count *= 2;
    if (effectType === 'stjerner') count *= 2.5;
    if (effectType === 'ildfluer') count = Math.max(8, Math.round(count * 0.5));
    count = Math.round(count);
    for (let i = 0; i < count; i++) {
      const p = createParticle();
      if (p.type === 'ember') p.life = Math.random() * p.maxLife;
      if (p.type === 'rain') p.y = Math.random() * height;
      if (p.type === 'wind') p.x = Math.random() * width;
      if (p.type === 'snow') p.y = Math.random() * height;
      if (p.type === 'firefly') p.life = Math.random() * p.maxLife;
      // Stars start with randomized pulse phases (already set in createStar)
      particles.push(p);
    }
  }

  function animate() {
    ctx.clearRect(0, 0, width, height);
    // Draw deep-sky objects behind everything else
    if (effectType === 'stjerner' && starsDeepSky) drawDeepSky();
    for (let i = particles.length - 1; i >= 0; i--) {
      if (!drawParticle(particles[i])) {
        particles[i] = createParticle();
      }
    }
    // Shooting stars for starry sky
    if (effectType === 'stjerner' && starsShootFreq !== 'ingen') {
      shootTimer++;
      if (shootTimer >= nextShootAt) {
        shootingStars.push(createShootingStar());
        shootTimer = 0;
        nextShootAt = shootCfg.base + Math.floor(Math.random() * shootCfg.range);
      }
      for (let i = shootingStars.length - 1; i >= 0; i--) {
        if (!drawShootingStar(shootingStars[i])) {
          shootingStars.splice(i, 1);
        }
      }
    }
    animId = requestAnimationFrame(animate);
  }

  window.addEventListener('resize', resize);

  if (effectType !== 'ingen') {
    init();
    animate();
  }

  return () => cancelAnimationFrame(animId);
}
