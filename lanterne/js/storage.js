// Thin wrapper around chrome.storage.local with fallback to localStorage for development
const isExtension = typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local;

export async function get(key, fallback = null) {
  if (!isExtension) {
    const val = localStorage.getItem(key);
    return val ? JSON.parse(val) : fallback;
  }
  return new Promise((resolve) => {
    chrome.storage.local.get(key, (result) => {
      resolve(result[key] !== undefined ? result[key] : fallback);
    });
  });
}

export async function set(key, value) {
  if (!isExtension) {
    localStorage.setItem(key, JSON.stringify(value));
    return;
  }
  return new Promise((resolve) => {
    chrome.storage.local.set({ [key]: value }, resolve);
  });
}

export async function remove(key) {
  if (!isExtension) {
    localStorage.removeItem(key);
    return;
  }
  return new Promise((resolve) => {
    chrome.storage.local.remove(key, resolve);
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
  return new Promise((resolve) => {
    chrome.storage.local.get(null, resolve);
  });
}
