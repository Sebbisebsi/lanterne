// Thin wrapper around chrome.storage with sync support
const isExtension = typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local;

// Keys that should NEVER be synced (too large or ephemeral)
const LOCAL_ONLY = new Set(['backgroundImage', 'checklistCompletions', 'checklistDate']);

// Cache syncEnabled so we don't have to async-check every call
let _syncEnabled = false;
let _syncLoaded = false;

async function loadSyncFlag() {
  if (_syncLoaded) return _syncEnabled;
  if (!isExtension) { _syncLoaded = true; return false; }
  return new Promise((resolve) => {
    chrome.storage.local.get('syncEnabled', (result) => {
      _syncEnabled = result.syncEnabled === true;
      _syncLoaded = true;
      resolve(_syncEnabled);
    });
  });
}

function pickStore(key) {
  // syncEnabled flag itself always lives in local
  if (key === 'syncEnabled') return chrome.storage.local;
  if (!_syncEnabled || LOCAL_ONLY.has(key)) return chrome.storage.local;
  return chrome.storage.sync;
}

export async function getSyncEnabled() {
  await loadSyncFlag();
  return _syncEnabled;
}

export async function setSyncEnabled(enabled) {
  _syncEnabled = enabled;
  _syncLoaded = true;
  if (!isExtension) return;

  if (enabled) {
    // Migrate eligible data from local → sync
    const localData = await new Promise(r => chrome.storage.local.get(null, r));
    const toSync = {};
    for (const [k, v] of Object.entries(localData)) {
      if (!LOCAL_ONLY.has(k) && k !== 'syncEnabled') {
        toSync[k] = v;
      }
    }
    if (Object.keys(toSync).length > 0) {
      await new Promise(r => chrome.storage.sync.set(toSync, r));
    }
  } else {
    // Migrate data from sync → local, then clear sync
    const syncData = await new Promise(r => chrome.storage.sync.get(null, r));
    if (Object.keys(syncData).length > 0) {
      await new Promise(r => chrome.storage.local.set(syncData, r));
      await new Promise(r => chrome.storage.sync.clear(r));
    }
  }

  return new Promise(r => chrome.storage.local.set({ syncEnabled: enabled }, r));
}

export async function get(key, fallback = null) {
  if (!isExtension) {
    const val = localStorage.getItem(key);
    return val ? JSON.parse(val) : fallback;
  }
  await loadSyncFlag();
  const store = pickStore(key);
  return new Promise((resolve) => {
    store.get(key, (result) => {
      resolve(result[key] !== undefined ? result[key] : fallback);
    });
  });
}

export async function set(key, value) {
  if (!isExtension) {
    localStorage.setItem(key, JSON.stringify(value));
    return;
  }
  await loadSyncFlag();
  const store = pickStore(key);
  return new Promise((resolve) => {
    store.set({ [key]: value }, resolve);
  });
}

export async function remove(key) {
  if (!isExtension) {
    localStorage.removeItem(key);
    return;
  }
  await loadSyncFlag();
  const store = pickStore(key);
  return new Promise((resolve) => {
    store.remove(key, resolve);
  });
}

export async function getAll() {
  if (!isExtension) {
    const all = {};
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      try { all[k] = JSON.parse(localStorage.getItem(k)); } catch { all[k] = localStorage.getItem(k); }
    }
    return all;
  }
  await loadSyncFlag();
  if (!_syncEnabled) {
    return new Promise((resolve) => {
      chrome.storage.local.get(null, resolve);
    });
  }
  // Merge: local (for LOCAL_ONLY keys) + sync (for everything else)
  const [localData, syncData] = await Promise.all([
    new Promise(r => chrome.storage.local.get(null, r)),
    new Promise(r => chrome.storage.sync.get(null, r))
  ]);
  return { ...localData, ...syncData };
}

export function escapeHTML(str) {
  const div = document.createElement('div');
  div.appendChild(document.createTextNode(str));
  return div.innerHTML;
}

export function sanitizeURL(url) {
  if (!url) return '';
  let target = url.trim();
  if (!/^https?:\/\//i.test(target)) target = 'https://' + target;
  try {
    const u = new URL(target);
    return u.href;
  } catch {
    return '';
  }
}
