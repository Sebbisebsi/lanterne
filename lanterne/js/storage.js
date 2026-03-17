// Thin wrapper around chrome.storage with sync support
const isExtension = typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local;

// Keys that should NEVER be synced (too large or ephemeral)
const LOCAL_ONLY = new Set(['backgroundImage', 'checklistCompletions', 'checklistDate', 'weatherCache']);

// Cache syncEnabled so we don't have to async-check every call
let _syncEnabled = false;
let _syncLoaded = false;

// Helper: resolve with lastError check
function storageOp(fn) {
  return new Promise((resolve, reject) => {
    fn(() => {
      if (chrome.runtime.lastError) {
        console.warn('Storage error:', chrome.runtime.lastError.message);
        reject(new Error(chrome.runtime.lastError.message));
      } else {
        resolve();
      }
    });
  });
}

function storageGet(store, key) {
  return new Promise((resolve) => {
    store.get(key, (result) => {
      if (chrome.runtime.lastError) {
        console.warn('Storage read error:', chrome.runtime.lastError.message);
        resolve(key === null ? {} : {});
      } else {
        resolve(result);
      }
    });
  });
}

async function loadSyncFlag() {
  if (_syncLoaded) return _syncEnabled;
  if (!isExtension) { _syncLoaded = true; return false; }
  const result = await storageGet(chrome.storage.local, 'syncEnabled');
  _syncEnabled = result.syncEnabled === true;
  _syncLoaded = true;
  return _syncEnabled;
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
    // Migrate eligible data from local → sync (with quota check)
    const localData = await storageGet(chrome.storage.local, null);
    const toSync = {};
    let totalSize = 0;
    for (const [k, v] of Object.entries(localData)) {
      if (LOCAL_ONLY.has(k) || k === 'syncEnabled') continue;
      const itemJson = JSON.stringify({ [k]: v });
      const itemSize = new Blob([itemJson]).size;
      // chrome.storage.sync: 8,192 bytes per item, 102,400 bytes total
      if (itemSize > 8192) {
        console.warn(`Sync: skipping "${k}" (${itemSize} bytes > 8KB limit)`);
        continue;
      }
      if (totalSize + itemSize > 100000) {
        console.warn(`Sync: stopping migration, approaching 100KB total limit`);
        break;
      }
      toSync[k] = v;
      totalSize += itemSize;
    }
    if (Object.keys(toSync).length > 0) {
      try {
        await storageOp(cb => chrome.storage.sync.set(toSync, cb));
      } catch (e) {
        console.warn('Sync migration failed:', e.message);
      }
    }
  } else {
    // Migrate data from sync → local, then clear sync
    const syncData = await storageGet(chrome.storage.sync, null);
    if (Object.keys(syncData).length > 0) {
      await storageOp(cb => chrome.storage.local.set(syncData, cb)).catch(() => {});
      await storageOp(cb => chrome.storage.sync.clear(cb)).catch(() => {});
    }
  }

  return storageOp(cb => chrome.storage.local.set({ syncEnabled: enabled }, cb));
}

export async function get(key, fallback = null) {
  if (!isExtension) {
    const val = localStorage.getItem(key);
    return val ? JSON.parse(val) : fallback;
  }
  await loadSyncFlag();
  const store = pickStore(key);
  const result = await storageGet(store, key);
  return result[key] !== undefined ? result[key] : fallback;
}

export async function set(key, value) {
  if (!isExtension) {
    localStorage.setItem(key, JSON.stringify(value));
    return;
  }
  await loadSyncFlag();
  const store = pickStore(key);

  // Quota check for sync storage
  if (store === chrome.storage.sync) {
    const itemSize = new Blob([JSON.stringify({ [key]: value })]).size;
    if (itemSize > 8192) {
      console.warn(`Sync write skipped: "${key}" is ${itemSize} bytes (> 8KB). Storing locally.`);
      return storageOp(cb => chrome.storage.local.set({ [key]: value }, cb));
    }
  }

  return storageOp(cb => store.set({ [key]: value }, cb)).catch(() => {
    // Fallback to local if sync fails (e.g. quota exceeded)
    if (store === chrome.storage.sync) {
      console.warn(`Sync write failed for "${key}", falling back to local`);
      return storageOp(cb => chrome.storage.local.set({ [key]: value }, cb)).catch(() => {});
    }
  });
}

export async function remove(key) {
  if (!isExtension) {
    localStorage.removeItem(key);
    return;
  }
  await loadSyncFlag();
  const store = pickStore(key);
  return storageOp(cb => store.remove(key, cb)).catch(() => {});
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
    return storageGet(chrome.storage.local, null);
  }
  // Merge: local (for LOCAL_ONLY keys) + sync (for everything else)
  const [localData, syncData] = await Promise.all([
    storageGet(chrome.storage.local, null),
    storageGet(chrome.storage.sync, null)
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
  // Only allow http/https protocols
  if (/^(javascript|data|vbscript):/i.test(target)) return '';
  if (!/^https?:\/\//i.test(target)) target = 'https://' + target;
  try {
    const u = new URL(target);
    if (u.protocol !== 'https:' && u.protocol !== 'http:') return '';
    return u.href;
  } catch {
    return '';
  }
}
