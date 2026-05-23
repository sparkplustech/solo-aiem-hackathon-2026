const { app, BrowserWindow, globalShortcut, Tray, Menu, Notification } = require('electron');
const path = require('path');

let mainWindow;
let tray = null;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    },
    icon: path.join(__dirname, 'icon.png'),
    title: 'DRISHTI Enterprise'
  });

  // Load the Next.js local server
  mainWindow.loadURL('http://localhost:3000');
  
  // Hide the default menu bar
  mainWindow.setMenuBarVisibility(false);

  mainWindow.on('close', (event) => {
    if (!app.isQuitting) {
      event.preventDefault();
      mainWindow.hide();
    }
  });
}

function createTray() {
  // Use a simple native image or empty tray for now if icon.png is missing
  tray = new Tray(path.join(__dirname, 'icon.png'));
  const contextMenu = Menu.buildFromTemplate([
    { label: 'Show Dashboard', click: () => mainWindow.show() },
    { label: 'Simulate Fraud Alert', click: () => showNotification() },
    { type: 'separator' },
    { label: 'Quit DRISHTI', click: () => {
        app.isQuitting = true;
        app.quit();
      } 
    }
  ]);
  tray.setToolTip('DRISHTI Fraud Monitoring');
  tray.setContextMenu(contextMenu);
  
  tray.on('click', () => {
    mainWindow.isVisible() ? mainWindow.hide() : mainWindow.show();
  });
}

function showNotification() {
  new Notification({
    title: 'HIGH RISK: Mule Ring Detected',
    body: 'A new 5-node layering funnel was just detected. Click to investigate.',
  }).show();
}

app.disableHardwareAcceleration();
app.commandLine.appendSwitch('disable-gpu');
app.commandLine.appendSwitch('disable-software-rasterizer');
app.commandLine.appendSwitch('no-sandbox');

app.whenReady().then(() => {
  createWindow();
  
  try {
    createTray();
  } catch (e) {
    console.log("Could not load tray icon. Proceeding without it.");
  }

  // Global hotkey to instantly pop up the app
  globalShortcut.register('CommandOrControl+Shift+D', () => {
    if (mainWindow) {
      if (mainWindow.isVisible() && mainWindow.isFocused()) {
        mainWindow.hide();
      } else {
        mainWindow.show();
        mainWindow.focus();
      }
    }
  });

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('will-quit', () => {
  globalShortcut.unregisterAll();
});
