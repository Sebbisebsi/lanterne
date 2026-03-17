import { get, set } from './storage.js';

export async function initSounds(triggerBtn) {
  let currentAudio = null;
  let settings = await get('soundSettings', {
    volume: 0.3,
    activeSound: 'campfire'
  });

  const SOUNDS = {
    campfire: { name: 'Bål', icon: 'flame', file: 'sounds/campfire.mp3' },
    forest:   { name: 'Skov', icon: 'trees', file: 'sounds/forest.mp3' },
    lake:     { name: 'Sø', icon: 'droplets', file: 'sounds/lake.mp3' },
    medieval: { name: 'Middelaldertoner', icon: 'music', file: 'sounds/medieval.mp3' }
  };

  const SOUND_ICONS = {
    flame: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"/></svg>',
    droplets: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M7 16.3c2.2 0 4-1.83 4-4.05 0-1.16-.57-2.26-1.71-3.19S7.29 6.75 7 5.3c-.29 1.45-1.14 2.84-2.29 3.76S3 11.1 3 12.25c0 2.22 1.8 4.05 4 4.05z"/><path d="M12.56 6.6A10.97 10.97 0 0 0 14 3.02c.5 2.5 2 4.9 4 6.5s3 3.5 3 5.5a6.98 6.98 0 0 1-11.91 4.97"/></svg>',
    trees: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10 10v.2A3 3 0 0 1 8.9 16v0H5v0h0a3 3 0 0 1-1-5.8V10a3 3 0 0 1 6 0z"/><path d="M7 16v6"/><path d="M13 19v3"/><path d="M18 10v.2A3 3 0 0 1 16.9 16v0H13v0h0a3 3 0 0 1-1-5.8V10a3 3 0 0 1 6 0z"/><path d="M15 16v6"/></svg>',
    music: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></svg>'
  };

  function getAudioUrl(file) {
    // Works both in extension and local dev
    if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.getURL) {
      return chrome.runtime.getURL(file);
    }
    return file;
  }

  function startSound(soundKey) {
    stopSound();
    const sound = SOUNDS[soundKey];
    if (!sound) return;

    currentAudio = new Audio(getAudioUrl(sound.file));
    currentAudio.loop = true;
    currentAudio.volume = settings.volume;
    currentAudio.play().catch(e => console.warn('Audio play failed:', e));

    settings.activeSound = soundKey;
    set('soundSettings', settings);
    updateUI();
  }

  function stopSound() {
    if (currentAudio) {
      currentAudio.pause();
      currentAudio.src = '';
      currentAudio = null;
    }
    updateUI();
  }

  function setVolume(vol) {
    settings.volume = vol;
    if (currentAudio) {
      currentAudio.volume = vol;
    }
    set('soundSettings', settings);
  }

  function isPlaying() {
    return currentAudio && !currentAudio.paused;
  }

  // Build UI
  const panel = document.createElement('div');
  panel.className = 'sound-panel';
  panel.style.display = 'none';

  function updateUI() {
    const playing = isPlaying();
    triggerBtn.classList.toggle('active', playing);

    panel.innerHTML = `
      <div class="sound-header">
        <span>Ambient lyde</span>
        ${playing ? '<span class="sound-now-playing">Spiller nu</span>' : ''}
      </div>
      <div class="sound-options">
        ${Object.entries(SOUNDS).map(([key, s]) => `
          <button class="sound-option ${playing && settings.activeSound === key ? 'active' : ''}" data-sound="${key}">
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

    panel.querySelectorAll('.sound-option').forEach(btn => {
      btn.addEventListener('click', () => {
        const key = btn.dataset.sound;
        if (isPlaying() && settings.activeSound === key) {
          stopSound();
        } else {
          startSound(key);
        }
      });
    });

    const slider = panel.querySelector('.sound-volume-slider');
    if (slider) {
      slider.addEventListener('input', (e) => {
        setVolume(parseInt(e.target.value) / 100);
      });
    }
  }

  triggerBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    const isVisible = panel.style.display !== 'none';
    panel.style.display = isVisible ? 'none' : 'block';
    if (!isVisible) updateUI();
  });

  document.addEventListener('click', (e) => {
    if (!panel.contains(e.target) && e.target !== triggerBtn) {
      panel.style.display = 'none';
    }
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && panel.style.display !== 'none') {
      panel.style.display = 'none';
    }
  });

  triggerBtn.parentElement.appendChild(panel);
  updateUI();
}
