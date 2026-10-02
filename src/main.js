// main.js - Electron Main Process for Lucky Dangle

const { app, BrowserWindow, Tray, Menu, ipcMain, screen, globalShortcut, nativeImage } = require('electron');
const path = require('path');
const fs = require('fs');

const isMac = process.platform === 'darwin';
const isLinux = process.platform === 'linux';

// Linux compositors need these for transparent, click-through windows
if (isLinux) {
  app.commandLine.appendSwitch('enable-transparent-visuals');
  app.disableHardwareAcceleration();
}

// Shortcuts use Shift so we don't steal Save (Ctrl/⌘+S) and Bookmark (Ctrl/⌘+D) from every other app
const SHORTCUT_TOGGLE = 'CommandOrControl+Shift+D';
const SHORTCUT_RITUAL = 'CommandOrControl+Shift+S';
const MOD_LABEL = isMac ? '⌘' : 'Ctrl';

let overlayWindow = null;
let galleryWindow = null;
let tray = null;

// Persistent settings path
const settingsPath = path.join(app.getPath('userData'), 'settings.json');

function loadSettings() {
  try {
    if (fs.existsSync(settingsPath)) {
      let raw = fs.readFileSync(settingsPath, 'utf8');
      if (raw.charCodeAt(0) === 0xFEFF) {
        raw = raw.slice(1);
      }
      return JSON.parse(raw.trim());
    }
  } catch (e) {
    console.error('Error loading settings:', e);
  }
  return {
    slug: 'nazar',
    emoji: '🍀',
    anchorXRatio: 0.75,
    darumaState: 0,
    drishtiColorIndex: 0
  };
}

function saveSettings(data) {
  try {
    const current = loadSettings();
    const updated = { ...current, ...data };
    fs.writeFileSync(settingsPath, JSON.stringify(updated, null, 2), 'utf8');
    return updated;
  } catch (e) {
    console.error('Error saving settings:', e);
    return null;
  }
}

// Create the Fullscreen Transparent Overlay Window
function createOverlayWindow() {
  const primaryDisplay = screen.getPrimaryDisplay();
  const { width, height } = primaryDisplay.bounds;
  // On macOS hang below the menu bar / notch; workArea.y is 0 on Windows and most Linux setups
  const topY = isMac ? primaryDisplay.workArea.y : primaryDisplay.bounds.y;

  overlayWindow = new BrowserWindow({
    x: primaryDisplay.bounds.x,
    y: topY,
    width: width,
    height: Math.min(height, 760), // Screen zone where charms hang and swing
    transparent: true,
    frame: false,
    alwaysOnTop: true,
    skipTaskbar: true,
    hasShadow: false,
    resizable: false,
    focusable: false,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true
    }
  });

  overlayWindow.setAlwaysOnTop(true, 'screen-saver');
  overlayWindow.setVisibleOnAllWorkspaces(true, { visibleOnFullScreen: true });
  overlayWindow.setIgnoreMouseEvents(true, { forward: true });

  overlayWindow.loadFile(path.join(__dirname, 'overlay.html'));

  overlayWindow.on('closed', () => {
    overlayWindow = null;
  });
}

// Create the Charm Gallery & Settings Window
function createGalleryWindow() {
  if (galleryWindow) {
    galleryWindow.show();
    galleryWindow.focus();
    return;
  }

  galleryWindow = new BrowserWindow({
    width: 960,
    height: 720,
    minWidth: 700,
    minHeight: 500,
    title: 'Lucky Dangle — Charm Gallery',
    backgroundColor: '#0f1322',
    icon: path.join(__dirname, '..', 'assets', 'apple-touch-icon.png'),
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true
    }
  });

  galleryWindow.setMenuBarVisibility(false);
  galleryWindow.loadFile(path.join(__dirname, 'gallery.html'));

  galleryWindow.on('closed', () => {
    galleryWindow = null;
  });
}

// Create the system tray (Windows/Linux) or menu-bar icon (macOS)
function createTray() {
  const iconPath = path.join(__dirname, '..', 'assets', 'favicon-32x32.png');
  let icon = nativeImage.createFromPath(iconPath);
  if (isMac) icon = icon.resize({ width: 18, height: 18 }); // menu-bar size
  tray = new Tray(icon);
  tray.setToolTip('Lucky Dangle - Screen Charm');

  const { CHARMS } = require('./charms.js');

  function updateTrayMenu() {
    const currentSettings = loadSettings();

    const charmSubmenu = CHARMS.map((c) => ({
      label: c.slug === 'custom' ? `Custom Emoji (${currentSettings.emoji || '🍀'})` : `${c.name} (${c.origin})`,
      type: 'radio',
      checked: c.slug === currentSettings.slug,
      click: () => {
        saveSettings({ slug: c.slug });
        if (overlayWindow) {
          overlayWindow.webContents.send('charm-changed', {
            slug: c.slug,
            emoji: currentSettings.emoji || '🍀'
          });
        }
        if (galleryWindow) {
          galleryWindow.webContents.send('charm-changed', {
            slug: c.slug,
            emoji: currentSettings.emoji || '🍀'
          });
        }
        updateTrayMenu();
      }
    }));

    const contextMenu = Menu.buildFromTemplate([
      { label: '✨ Lucky Dangle', enabled: false },
      { type: 'separator' },
      {
        label: `Dangle / Hide (${MOD_LABEL}+Shift+D)`,
        click: () => {
          if (overlayWindow) overlayWindow.webContents.send('toggle-dangle-event');
        }
      },
      {
        label: `Perform Ritual (${MOD_LABEL}+Shift+S)`,
        click: () => {
          if (overlayWindow) overlayWindow.webContents.send('perform-ritual-event');
        }
      },
      { type: 'separator' },
      {
        label: 'Choose Charm',
        submenu: charmSubmenu
      },
      {
        label: 'Charm Gallery & Settings...',
        click: () => createGalleryWindow()
      },
      { type: 'separator' },
      {
        label: 'Quit',
        click: () => {
          app.isQuitting = true;
          app.quit();
        }
      }
    ]);
    tray.setContextMenu(contextMenu);
  }

  updateTrayMenu();

  tray.on('double-click', () => {
    createGalleryWindow();
  });
}

// Register Global System Hotkeys
function registerHotkeys() {
  globalShortcut.register(SHORTCUT_TOGGLE, () => {
    if (overlayWindow) {
      overlayWindow.webContents.send('toggle-dangle-event');
    }
  });

  globalShortcut.register(SHORTCUT_RITUAL, () => {
    if (overlayWindow) {
      overlayWindow.webContents.send('perform-ritual-event');
    }
  });
}

// IPC Handlers
ipcMain.on('set-ignore-mouse-events', (_event, ignore, options) => {
  if (overlayWindow && !overlayWindow.isDestroyed()) {
    overlayWindow.setIgnoreMouseEvents(ignore, options);
  }
});

ipcMain.on('open-gallery', () => {
  createGalleryWindow();
});

ipcMain.on('select-charm', (_event, data) => {
  saveSettings({
    slug: data.slug,
    emoji: data.emoji,
    customImage: data.customImage,
    customImageAspect: data.customImageAspect
  });
  if (overlayWindow) {
    overlayWindow.webContents.send('charm-changed', data);
  }
});

ipcMain.on('trigger-ritual', () => {
  if (overlayWindow) {
    overlayWindow.webContents.send('perform-ritual-event');
  }
});

ipcMain.on('toggle-dangle', () => {
  if (overlayWindow) {
    overlayWindow.webContents.send('toggle-dangle-event');
  }
});

ipcMain.handle('get-settings', () => {
  return loadSettings();
});

ipcMain.handle('save-settings', (_event, data) => {
  return saveSettings(data);
});

ipcMain.on('quit-app', () => {
  app.isQuitting = true;
  app.quit();
});

// App Lifecycle
app.whenReady().then(() => {
  // macOS: live in the menu bar only, no Dock icon
  if (isMac && app.dock) app.dock.hide();

  // Linux needs a short delay before transparent windows render correctly
  const start = () => {
    createOverlayWindow();
    createTray();
    registerHotkeys();
    // Open gallery window on first launch so user can choose their charm!
    createGalleryWindow();
  };
  isLinux ? setTimeout(start, 300) : start();

  app.on('activate', () => {
    // macOS: clicking the app again re-opens the gallery
    if (!overlayWindow) createOverlayWindow();
    createGalleryWindow();
  });
});

app.on('will-quit', () => {
  globalShortcut.unregisterAll();
});

app.on('window-all-closed', () => {
  // On every OS, keep running in the tray / menu bar when the gallery window is closed
});
