export function initAmbience(canvas) {
  const ctx = canvas.getContext('2d');
  let particles = [];
  let animId;
  let width, height;

  function resize() {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
  }

  function createParticle() {
    const isLight = document.documentElement.getAttribute('data-theme') === 'light';
    return {
      x: Math.random() * width,
      y: Math.random() * height,
      size: Math.random() * 2.5 + 0.5,
      speedX: (Math.random() - 0.5) * 0.3,
      speedY: (Math.random() - 0.5) * 0.2 - 0.1, // slight upward drift
      opacity: Math.random() * 0.4 + 0.1,
      opacitySpeed: (Math.random() - 0.5) * 0.005,
      hue: 30 + Math.random() * 20, // warm amber range
      life: 0,
      maxLife: 300 + Math.random() * 600
    };
  }

  function init() {
    resize();
    particles = [];
    const count = Math.floor((width * height) / 25000); // ~60-80 on 1080p
    for (let i = 0; i < count; i++) {
      const p = createParticle();
      p.life = Math.random() * p.maxLife; // stagger initial life
      particles.push(p);
    }
  }

  function animate() {
    ctx.clearRect(0, 0, width, height);

    const isLight = document.documentElement.getAttribute('data-theme') === 'light';

    particles.forEach((p, i) => {
      p.life++;
      p.x += p.speedX;
      p.y += p.speedY;
      p.opacity += p.opacitySpeed;

      // Fade in/out based on life
      let lifeFade = 1;
      if (p.life < 60) lifeFade = p.life / 60;
      if (p.life > p.maxLife - 60) lifeFade = (p.maxLife - p.life) / 60;

      // Clamp opacity
      if (p.opacity > 0.5) p.opacitySpeed = -Math.abs(p.opacitySpeed);
      if (p.opacity < 0.05) p.opacitySpeed = Math.abs(p.opacitySpeed);

      const finalOpacity = p.opacity * lifeFade * (isLight ? 0.4 : 1);

      // Draw glow
      const gradient = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size * 4);
      gradient.addColorStop(0, `hsla(${p.hue}, 80%, ${isLight ? '50%' : '70%'}, ${finalOpacity * 0.3})`);
      gradient.addColorStop(1, `hsla(${p.hue}, 80%, ${isLight ? '50%' : '70%'}, 0)`);
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size * 4, 0, Math.PI * 2);
      ctx.fill();

      // Draw core
      ctx.fillStyle = `hsla(${p.hue}, 90%, ${isLight ? '60%' : '80%'}, ${finalOpacity})`;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fill();

      // Reset if dead or off screen
      if (p.life > p.maxLife || p.x < -20 || p.x > width + 20 || p.y < -20 || p.y > height + 20) {
        particles[i] = createParticle();
      }
    });

    animId = requestAnimationFrame(animate);
  }

  window.addEventListener('resize', () => {
    resize();
  });

  init();
  animate();

  // Return cleanup function
  return () => {
    cancelAnimationFrame(animId);
  };
}
