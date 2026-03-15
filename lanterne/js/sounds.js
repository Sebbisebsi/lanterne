import { get, set } from './storage.js';

export async function initSounds(triggerBtn) {
  let isPlaying = false;
  let audioCtx = null;
  let nodes = {};
  let settings = await get('soundSettings', {
    volume: 0.3,
    activeSound: 'campfire'
  });

  const SOUNDS = {
    campfire: { name: 'B\u00e5l', icon: 'flame', generate: generateCampfire },
    rain: { name: 'Regn', icon: 'droplets', generate: generateRain },
    wind: { name: 'Vind', icon: 'wind', generate: generateWind },
    forest: { name: 'Skov', icon: 'trees', generate: generateForest },
    waves: { name: 'B\u00f8lger', icon: 'waves', generate: generateWaves }
  };

  // SVG icons for the sounds
  const SOUND_ICONS = {
    flame: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"/></svg>',
    droplets: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M7 16.3c2.2 0 4-1.83 4-4.05 0-1.16-.57-2.26-1.71-3.19S7.29 6.75 7 5.3c-.29 1.45-1.14 2.84-2.29 3.76S3 11.1 3 12.25c0 2.22 1.8 4.05 4 4.05z"/><path d="M12.56 6.6A10.97 10.97 0 0 0 14 3.02c.5 2.5 2 4.9 4 6.5s3 3.5 3 5.5a6.98 6.98 0 0 1-11.91 4.97"/></svg>',
    wind: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17.7 7.7a2.5 2.5 0 1 1 1.8 4.3H2"/><path d="M9.6 4.6A2 2 0 1 1 11 8H2"/><path d="M12.6 19.4A2 2 0 1 0 14 16H2"/></svg>',
    trees: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10 10v.2A3 3 0 0 1 8.9 16v0H5v0h0a3 3 0 0 1-1-5.8V10a3 3 0 0 1 6 0z"/><path d="M7 16v6"/><path d="M13 19v3"/><path d="M18 10v.2A3 3 0 0 1 16.9 16v0H13v0h0a3 3 0 0 1-1-5.8V10a3 3 0 0 1 6 0z"/><path d="M15 16v6"/></svg>',
    waves: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 6c.6.5 1.2 1 2.5 1C7 7 7 5 9.5 5c2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1"/><path d="M2 12c.6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2 2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1"/><path d="M2 18c.6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2 2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1"/></svg>'
  };

  // Web Audio API procedural sound generators
  function createNoiseBuffer(ctx, seconds = 2) {
    const bufferSize = ctx.sampleRate * seconds;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }
    return buffer;
  }

  function generateCampfire(ctx, masterGain) {
    // Crackling fire: filtered noise with random pops
    const noiseBuffer = createNoiseBuffer(ctx, 4);

    const noise = ctx.createBufferSource();
    noise.buffer = noiseBuffer;
    noise.loop = true;

    // Bandpass filter for fire-like sound
    const bandpass = ctx.createBiquadFilter();
    bandpass.type = 'bandpass';
    bandpass.frequency.value = 800;
    bandpass.Q.value = 0.5;

    // Low-pass for warmth
    const lowpass = ctx.createBiquadFilter();
    lowpass.type = 'lowpass';
    lowpass.frequency.value = 2000;

    const gain = ctx.createGain();
    gain.gain.value = 0.15;

    noise.connect(bandpass);
    bandpass.connect(lowpass);
    lowpass.connect(gain);
    gain.connect(masterGain);
    noise.start();

    // Add crackle pops
    function addCrackle() {
      if (!isPlaying) return;
      const pop = ctx.createBufferSource();
      const popBuffer = ctx.createBuffer(1, ctx.sampleRate * 0.02, ctx.sampleRate);
      const popData = popBuffer.getChannelData(0);
      for (let i = 0; i < popData.length; i++) {
        popData[i] = (Math.random() * 2 - 1) * Math.exp(-i / (ctx.sampleRate * 0.005));
      }
      pop.buffer = popBuffer;

      const popGain = ctx.createGain();
      popGain.gain.value = Math.random() * 0.1 + 0.02;

      const popFilter = ctx.createBiquadFilter();
      popFilter.type = 'highpass';
      popFilter.frequency.value = 1000 + Math.random() * 3000;

      pop.connect(popFilter);
      popFilter.connect(popGain);
      popGain.connect(masterGain);
      pop.start();

      setTimeout(addCrackle, 100 + Math.random() * 400);
    }
    addCrackle();

    return { noise, bandpass, lowpass, gain };
  }

  function generateRain(ctx, masterGain) {
    const noiseBuffer = createNoiseBuffer(ctx, 4);
    const noise = ctx.createBufferSource();
    noise.buffer = noiseBuffer;
    noise.loop = true;

    const highpass = ctx.createBiquadFilter();
    highpass.type = 'highpass';
    highpass.frequency.value = 400;

    const lowpass = ctx.createBiquadFilter();
    lowpass.type = 'lowpass';
    lowpass.frequency.value = 8000;

    const gain = ctx.createGain();
    gain.gain.value = 0.08;

    noise.connect(highpass);
    highpass.connect(lowpass);
    lowpass.connect(gain);
    gain.connect(masterGain);
    noise.start();

    return { noise, gain };
  }

  function generateWind(ctx, masterGain) {
    const noiseBuffer = createNoiseBuffer(ctx, 4);
    const noise = ctx.createBufferSource();
    noise.buffer = noiseBuffer;
    noise.loop = true;

    const bandpass = ctx.createBiquadFilter();
    bandpass.type = 'bandpass';
    bandpass.frequency.value = 300;
    bandpass.Q.value = 1.5;

    // Modulate the filter frequency for wind gusts
    const lfo = ctx.createOscillator();
    lfo.frequency.value = 0.15;
    const lfoGain = ctx.createGain();
    lfoGain.gain.value = 200;
    lfo.connect(lfoGain);
    lfoGain.connect(bandpass.frequency);
    lfo.start();

    const gain = ctx.createGain();
    gain.gain.value = 0.12;

    noise.connect(bandpass);
    bandpass.connect(gain);
    gain.connect(masterGain);
    noise.start();

    return { noise, lfo, gain };
  }

  function generateForest(ctx, masterGain) {
    // Gentle breeze + occasional bird-like chirps
    const noiseBuffer = createNoiseBuffer(ctx, 4);
    const noise = ctx.createBufferSource();
    noise.buffer = noiseBuffer;
    noise.loop = true;

    const bandpass = ctx.createBiquadFilter();
    bandpass.type = 'bandpass';
    bandpass.frequency.value = 500;
    bandpass.Q.value = 0.3;

    const gain = ctx.createGain();
    gain.gain.value = 0.06;

    noise.connect(bandpass);
    bandpass.connect(gain);
    gain.connect(masterGain);
    noise.start();

    // Bird chirps
    function addChirp() {
      if (!isPlaying) return;
      const osc = ctx.createOscillator();
      osc.type = 'sine';
      osc.frequency.value = 2000 + Math.random() * 2000;

      const chirpGain = ctx.createGain();
      chirpGain.gain.value = 0;
      chirpGain.gain.setValueAtTime(0, ctx.currentTime);
      chirpGain.gain.linearRampToValueAtTime(0.02, ctx.currentTime + 0.05);
      chirpGain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.15);

      osc.connect(chirpGain);
      chirpGain.connect(masterGain);
      osc.start();
      osc.stop(ctx.currentTime + 0.2);

      setTimeout(addChirp, 2000 + Math.random() * 5000);
    }
    setTimeout(addChirp, 1000 + Math.random() * 3000);

    return { noise, gain };
  }

  function generateWaves(ctx, masterGain) {
    const noiseBuffer = createNoiseBuffer(ctx, 4);
    const noise = ctx.createBufferSource();
    noise.buffer = noiseBuffer;
    noise.loop = true;

    const lowpass = ctx.createBiquadFilter();
    lowpass.type = 'lowpass';
    lowpass.frequency.value = 1000;

    // Slow amplitude modulation for wave rhythm
    const lfo = ctx.createOscillator();
    lfo.frequency.value = 0.08;
    const lfoGain = ctx.createGain();
    lfoGain.gain.value = 0.5;
    const lfoOffset = ctx.createConstantSource();
    lfoOffset.offset.value = 0.5;

    const ampMod = ctx.createGain();
    ampMod.gain.value = 0.5;
    lfo.connect(lfoGain);
    lfoGain.connect(ampMod.gain);
    lfo.start();

    const gain = ctx.createGain();
    gain.gain.value = 0.1;

    noise.connect(lowpass);
    lowpass.connect(ampMod);
    ampMod.connect(gain);
    gain.connect(masterGain);
    noise.start();

    return { noise, lfo, gain };
  }

  function startSound(soundKey) {
    stopSound();

    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    const masterGain = audioCtx.createGain();
    masterGain.gain.value = settings.volume;
    masterGain.connect(audioCtx.destination);

    const sound = SOUNDS[soundKey];
    if (sound) {
      nodes = sound.generate(audioCtx, masterGain);
      nodes.masterGain = masterGain;
    }

    isPlaying = true;
    settings.activeSound = soundKey;
    set('soundSettings', settings);
    updateUI();
  }

  function stopSound() {
    isPlaying = false;
    if (audioCtx) {
      audioCtx.close().catch(() => {});
      audioCtx = null;
    }
    nodes = {};
    updateUI();
  }

  function setVolume(vol) {
    settings.volume = vol;
    if (nodes.masterGain) {
      nodes.masterGain.gain.value = vol;
    }
    set('soundSettings', settings);
  }

  // Build UI
  const panel = document.createElement('div');
  panel.className = 'sound-panel';
  panel.style.display = 'none';

  function updateUI() {
    triggerBtn.classList.toggle('active', isPlaying);

    panel.innerHTML = `
      <div class="sound-header">
        <span>Ambient lyde</span>
      </div>
      <div class="sound-options">
        ${Object.entries(SOUNDS).map(([key, s]) => `
          <button class="sound-option ${isPlaying && settings.activeSound === key ? 'active' : ''}" data-sound="${key}">
            ${SOUND_ICONS[s.icon] || ''}
            <span>${s.name}</span>
          </button>
        `).join('')}
      </div>
      <div class="sound-volume">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/></svg>
        <input type="range" class="sound-volume-slider" min="0" max="100" value="${Math.round(settings.volume * 100)}" />
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M15.54 8.46a5 5 0 0 1 0 7.07"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14"/></svg>
      </div>
    `;

    // Sound selection
    panel.querySelectorAll('.sound-option').forEach(btn => {
      btn.addEventListener('click', () => {
        const key = btn.dataset.sound;
        if (isPlaying && settings.activeSound === key) {
          stopSound();
        } else {
          startSound(key);
        }
      });
    });

    // Volume slider
    const slider = panel.querySelector('.sound-volume-slider');
    if (slider) {
      slider.addEventListener('input', (e) => {
        setVolume(parseInt(e.target.value) / 100);
      });
    }
  }

  // Toggle panel
  triggerBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    const isVisible = panel.style.display !== 'none';
    panel.style.display = isVisible ? 'none' : 'block';
    if (!isVisible) updateUI();
  });

  // Close panel when clicking elsewhere
  document.addEventListener('click', (e) => {
    if (!panel.contains(e.target) && e.target !== triggerBtn) {
      panel.style.display = 'none';
    }
  });

  triggerBtn.parentElement.appendChild(panel);
  updateUI();
}
