const {
  app,
  BrowserWindow,
  Tray,
  Menu,
  nativeImage,
  ipcMain,
  Notification,
} = require("electron");
const path = require("path");

// 设置应用名称
app.setName("Kitty Reminder");

let mainWindow;
let tray;

function createWindow() {
  // 根据平台选择合适的图标格式
  const iconPath = process.platform === 'darwin' 
    ? path.join(__dirname, "assets/cat.icns")
    : path.join(__dirname, "assets/cat.png");

  mainWindow = new BrowserWindow({
    width: 1000,
    height: 750,
    minWidth: 900,
    minHeight: 700,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    },
    icon: iconPath,
    show: true,
    frame: true,
    resizable: true,
    autoHideMenuBar: true,
  });

  // 移除默认菜单
  Menu.setApplicationMenu(null);

  mainWindow.loadFile("index.html");

  // 关闭窗口时隐藏到托盘而不是退出
  mainWindow.on("close", (event) => {
    if (!app.isQuitting) {
      event.preventDefault();
      mainWindow.hide();
    }
    return false;
  });
}

function createTray() {
  // 使用 cat.png 作为托盘图标
  const iconPath = path.join(__dirname, "assets/cat.png");
  const icon = nativeImage.createFromPath(iconPath);

  // 调整图标大小适配托盘
  const resizedIcon = icon.resize({ width: 16, height: 16 });
  tray = new Tray(resizedIcon);

  const contextMenu = Menu.buildFromTemplate([
    {
      label: "显示主窗口",
      click: () => {
        mainWindow.show();
        mainWindow.focus();
      },
    },
    {
      label: "关于",
      click: () => {
        mainWindow.show();
        mainWindow.webContents.send("switch-page", "about");
      },
    },
    {
      label: "退出",
      click: () => {
        app.isQuitting = true;
        app.quit();
      },
    },
  ]);

  tray.setToolTip("Kitty Reminder - 小猫提醒");
  tray.setContextMenu(contextMenu);

  // 点击托盘图标显示/隐藏窗口
  tray.on("click", () => {
    if (mainWindow.isVisible()) {
      mainWindow.hide();
    } else {
      mainWindow.show();
      mainWindow.focus();
    }
  });
}

// 在应用准备好之前设置图标
if (process.platform === 'darwin') {
  app.whenReady().then(() => {
    const iconPath = path.join(__dirname, "assets/cat.png");
    const icon = nativeImage.createFromPath(iconPath);
    // 调整图标大小以确保正确显示
    const resizedIcon = icon.resize({ width: 512, height: 512 });
    app.dock.setIcon(resizedIcon);
  });
}

app.whenReady().then(() => {
  
  // 设置 Windows 通知的 AppUserModelID
  // 使用应用名称而不是包名
  if (process.platform === "win32") {
    app.setAppUserModelId(app.getName());
  }

  createWindow();
  createTray();

  // 监听显示窗口的请求
  ipcMain.on("show-window", () => {
    if (mainWindow) {
      mainWindow.show();
      mainWindow.focus();
    }
  });

  // 监听显示通知的请求
  ipcMain.on("show-notification", (event, data) => {
    // 使用传递的图标路径，如果没有则使用默认图标
    const iconPath = data.icon 
      ? path.join(__dirname, data.icon) 
      : path.join(__dirname, "assets/cat-notification.png");
    const icon = nativeImage.createFromPath(iconPath);
    
    const notification = new Notification({
      title: data.title,
      body: data.body + "\n\n💡 点击完成",
      icon: icon,
      silent: true, // 总是静音，我们手动播放音效
      timeoutType: "default",
    });

    // 点击通知 - 标记为完成并显示窗口
    notification.on("click", () => {
      mainWindow.webContents.send("notification-action", {
        action: "complete",
        reminderId: data.reminderId,
      });
      mainWindow.show();
      mainWindow.focus();
    });

    notification.show();

    // 手动播放音效
    if (data.playSound) {
      mainWindow.webContents.send("play-sound");
    }
  });

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

// 防止应用多开
const gotTheLock = app.requestSingleInstanceLock();

if (!gotTheLock) {
  app.quit();
} else {
  app.on("second-instance", () => {
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore();
      mainWindow.show();
      mainWindow.focus();
    }
  });
}
