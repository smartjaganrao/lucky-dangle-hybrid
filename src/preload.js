// preload.js - Secure Electron Context Bridge
const { contextBridge, ipcRenderer } = require('electron');

const isMac = process.platform === 'darwin';
const MOD = isMac ? '⌘' : 'Ctrl';

// Rewrite shortcut labels in the UI to match the current OS (⌘ on Mac, Ctrl elsewhere)
window.addEventListener('DOMContentLoaded', () => {
  const swap = (s) => s.replace(/Ctrl\+(Shift\+)?/g, `${MOD}+Shift+`);
  document.querySelectorAll('kbd').forEach((k) => { k.textContent = swap(k.textContent); });
  document.querySelectorAll('[title]').forEach((el) => { el.title = swap(el.title); });
});

contextBridge.exposeInMainWorld('electronAPI', {
  platform: process.platform,
  setIgnoreMouseEvents: (ignore, options) => {
    ipcRenderer.send('set-ignore-mouse-events', ignore, options);
  },
  openGallery: () => {
    ipcRenderer.send('open-gallery');
  },
  getSettings: () => {
    return ipcRenderer.invoke('get-settings');
  },
  saveSettings: (settings) => {
    return ipcRenderer.invoke('save-settings', settings);
  },
  selectCharm: (slug, emoji, customImage, customImageAspect) => {
    ipcRenderer.send('select-charm', { slug, emoji, customImage, customImageAspect });
  },
  triggerRitual: () => {
    ipcRenderer.send('trigger-ritual');
  },
  toggleDangle: () => {
    ipcRenderer.send('toggle-dangle');
  },
  onCharmChanged: (callback) => {
    ipcRenderer.on('charm-changed', (_event, data) => callback(data));
  },
  onToggleDangle: (callback) => {
    ipcRenderer.on('toggle-dangle-event', () => callback());
  },
  onPerformRitual: (callback) => {
    ipcRenderer.on('perform-ritual-event', () => callback());
  },
  quitApp: () => {
    ipcRenderer.send('quit-app');
  }
});
