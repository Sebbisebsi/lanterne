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

    const finalOp = p.opacity * lifeFade * (isLight ? 0.4 : 1);

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
    ctx.strokeStyle = `rgba(${isLight ? '80,120,180' : '140,180,220'}, ${p.opacity})`;
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
    ctx.fillStyle = `hsla(${p.hue}, 50%, ${isLight ? '40%' : '60%'}, ${p.opacity})`;
    ctx.beginPath();
    ctx.ellipse(0, 0, p.size * 2, p.size, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    return p.x < width + 40;
  }

  // ---- INIT & ANIMATE ----
  function getBaseCount() {
    return Math.max(5, Math.round((width * height) / 25000 * amountMul));
  }

  function createParticle() {
    if (effectType === 'regn') return createRain();
    if (effectType === 'vind') return createWind();
    return createEmber();
  }

  function drawParticle(p) {
    if (p.type === 'rain') return drawRain(p);
    if (p.type === 'wind') return drawWind(p);
    return drawEmber(p);
  }

  function init() {
    resize();
    particles = [];
    const count = effectType === 'regn' ? getBaseCount() * 3 : getBaseCount();
    for (let i = 0; i < count; i++) {
      const p = createParticle();
      if (p.type === 'ember') p.life = Math.random() * p.maxLife;
      if (p.type === 'rain') p.y = Math.random() * height;
      if (p.type === 'wind') p.x = Math.random() * width;
      particles.push(p);
    }
  }

  function animate() {
    ctx.clearRect(0, 0, width, height);
    for (let i = particles.length - 1; i >= 0; i--) {
      if (!drawParticle(particles[i])) {
        particles[i] = createParticle();
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
