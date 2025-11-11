// 数据存储
let reminders = [];
let history = [];
let settings = {
  defaultInterval: 60,
  notificationEnabled: true,
  soundEnabled: true,
  soundFile: "noti1",
  showWindowOnClick: true,
  autoStart: false,
  darkMode: false,
  language: "en-US", // 默认英文
};

// 倒计时和专注时间的状态
let countdownTimer = null;
let countdownRemaining = 0;
let focusTimer = null;
let focusRemaining = 25 * 60;
let focusMode = "work"; // 'work' or 'break'

// 初始化
document.addEventListener("DOMContentLoaded", () => {
  // 初始化语言
  initLanguage();
  
  loadData();
  initEventListeners();
  updateStats();
  renderReminders();
  checkReminders();
  setInterval(checkReminders, 30000);

  // 初始化倒计时和专注时间
  initCountdown();
  initFocus();
  
  // 更新界面文本
  updateUIText();

  // 监听来自主进程的通知操作
  if (typeof require !== "undefined") {
    const { ipcRenderer } = require("electron");

    ipcRenderer.on("notification-action", (event, data) => {
      if (data.action === "complete") {
        completeReminderById(data.reminderId);
      }
    });

    // 监听播放音效请求
    ipcRenderer.on("play-sound", () => {
      playNotificationSound();
    });
  }
});

// 加载数据
function loadData() {
  const savedReminders = localStorage.getItem("reminders");
  const savedHistory = localStorage.getItem("history");
  const savedSettings = localStorage.getItem("settings");



  if (savedReminders) reminders = JSON.parse(savedReminders);
  if (savedHistory) history = JSON.parse(savedHistory);
  if (savedSettings) {
    settings = JSON.parse(savedSettings);
    if (settings.darkMode) {
      document.documentElement.classList.add("dark");
      document.getElementById("darkModeToggle").checked = true;
    }
    // 加载语言设置
    if (settings.language) {
      setLanguage(settings.language);
      document.getElementById("languageSelect").value = settings.language;
    }
  }

  document.getElementById("defaultInterval").value = settings.defaultInterval;
  document.getElementById("notificationEnabled").checked =
    settings.notificationEnabled;
  document.getElementById("soundEnabled").checked = settings.soundEnabled;
  document.getElementById("soundSelect").value = settings.soundFile;
  document.getElementById("showWindowOnClick").checked =
    settings.showWindowOnClick;
  document.getElementById("autoStart").checked = settings.autoStart;
  
  // 设置语言选择器的当前值
  document.getElementById("languageSelect").value = getCurrentLanguage();

  // 根据音效开关状态显示/隐藏音效选择
  toggleSoundSelect();
}

// 保存数据
function saveData() {
  localStorage.setItem("reminders", JSON.stringify(reminders));
  localStorage.setItem("history", JSON.stringify(history));
  localStorage.setItem("settings", JSON.stringify(settings));
}

// 初始化事件监听
function initEventListeners() {
  // 页面导航
  document.querySelectorAll(".nav-link").forEach((link) => {
    link.addEventListener("click", (e) => {
      const page = e.currentTarget.dataset.page;
      switchPage(page);
    });
  });

  // 新建提醒
  document
    .getElementById("addReminderBtn")
    .addEventListener("click", openAddReminderModal);
  document
    .getElementById("closeModalBtn")
    .addEventListener("click", closeAddReminderModal);
  document
    .getElementById("cancelModalBtn")
    .addEventListener("click", closeAddReminderModal);
  document
    .getElementById("saveReminderBtn")
    .addEventListener("click", saveReminder);

  // 提醒类型变化
  document.getElementById("reminderType").addEventListener("change", (e) => {
    const customGroup = document.getElementById("customTextGroup");
    customGroup.classList.toggle("hidden", e.target.value !== "custom");
  });

  // 重复类型变化
  document.getElementById("repeatType").addEventListener("change", (e) => {
    const intervalGroup = document.getElementById("intervalGroup");
    intervalGroup.classList.toggle("hidden", e.target.value !== "interval");
  });

  // 提醒弹窗
  document
    .getElementById("completeBtn")
    .addEventListener("click", completeReminder);
  document
    .getElementById("snoozeBtn")
    .addEventListener("click", toggleSnoozeOptions);

  document.querySelectorAll(".snooze-time").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      const minutes = parseInt(e.target.dataset.minutes);
      snoozeReminder(minutes);
    });
  });

  // 设置
  document
    .getElementById("defaultInterval")
    .addEventListener("change", updateSettings);
  document
    .getElementById("notificationEnabled")
    .addEventListener("change", updateSettings);
  document.getElementById("soundEnabled").addEventListener("change", () => {
    updateSettings();
    toggleSoundSelect();
  });
  document.getElementById("soundSelect").addEventListener("change", () => {
    updateSettings();
    playNotificationSound(); // 选择时自动播放
  });
  document
    .getElementById("showWindowOnClick")
    .addEventListener("change", updateSettings);
  document
    .getElementById("autoStart")
    .addEventListener("change", updateSettings);
  document
    .getElementById("clearHistoryBtn")
    .addEventListener("click", clearHistory);

  // 深色模式切换
  document.getElementById("darkModeToggle").addEventListener("change", (e) => {
    document.documentElement.classList.toggle("dark", e.target.checked);
    settings.darkMode = e.target.checked;
    saveData();
  });
  
  // 语言切换
  document.getElementById("languageSelect").addEventListener("change", (e) => {
    const newLang = e.target.value;
    console.log('Switching language to:', newLang);
    setLanguage(newLang);
    settings.language = newLang;
    saveData();
    
    // 强制更新所有界面文本
    updateUIText();
    renderReminders();
    renderHistory();
    
    console.log('Language switched to:', getCurrentLanguage());
  });

  // 历史筛选
  document
    .getElementById("historyFilter")
    .addEventListener("change", renderHistory);
  document
    .getElementById("historyDate")
    .addEventListener("change", renderHistory);
}

// 页面切换
function switchPage(page) {
  document
    .querySelectorAll(".page")
    .forEach((p) => p.classList.remove("active"));
  document
    .querySelectorAll(".nav-link")
    .forEach((l) => l.classList.remove("active"));

  document.getElementById(`${page}Page`).classList.add("active");
  document.querySelector(`[data-page="${page}"]`).classList.add("active");

  if (page === "history") {
    // 设置日期选择器为今天
    const today = new Date();
    const dateStr = today.toISOString().split("T")[0];
    document.getElementById("historyDate").value = dateStr;
    renderHistory();
  }
}

// 打开新建提醒弹窗
function openAddReminderModal() {
  document.getElementById("addReminderModal").classList.remove("hidden");
  const now = new Date();
  const timeStr = `${String(now.getHours()).padStart(2, "0")}:${String(
    now.getMinutes()
  ).padStart(2, "0")}`;
  document.getElementById("reminderTime").value = timeStr;
}

// 关闭新建提醒弹窗
function closeAddReminderModal() {
  document.getElementById("addReminderModal").classList.add("hidden");
  document.getElementById("reminderType").value = "water";
  document.getElementById("customText").value = "";
  document.getElementById("repeatType").value = "once";
  document.getElementById("reminderNote").value = "";
  document.getElementById("customTextGroup").classList.add("hidden");
  document.getElementById("intervalGroup").classList.add("hidden");

  // 清除编辑模式标记
  delete document.getElementById("addReminderModal").dataset.editId;
  document.querySelector("#addReminderModal .modal-header h2").textContent =
    "新建提醒";
}

// 保存提醒
function saveReminder() {
  const type = document.getElementById("reminderType").value;
  const customText = document.getElementById("customText").value;
  const time = document.getElementById("reminderTime").value;
  const repeatType = document.getElementById("repeatType").value;
  const intervalMinutes = parseInt(
    document.getElementById("intervalMinutes").value
  );
  const note = document.getElementById("reminderNote").value;

  if (!time) {
    showDialog({
      title: t('dialogTitle'),
      message: t('msgSetTime'),
      icon: "schedule",
      showCancel: false,
    });
    return;
  }

  if (type === "custom" && !customText) {
    showDialog({
      title: t('dialogTitle'),
      message: t('msgSetCustomText'),
      icon: "edit",
      showCancel: false,
    });
    return;
  }

  // 检查是否为编辑模式
  const modal = document.getElementById("addReminderModal");
  const editId = modal.dataset.editId;

  if (editId) {
    // 编辑模式：更新现有提醒
    const reminder = reminders.find((r) => r.id === parseInt(editId));
    if (reminder) {
      reminder.type = type;
      reminder.customText = customText;
      reminder.time = time;
      reminder.repeatType = repeatType;
      reminder.intervalMinutes = intervalMinutes;
      reminder.note = note;
      reminder.nextTrigger = calculateNextTrigger(
        time,
        repeatType,
        intervalMinutes
      );
    } else {
      showDialog({
        title: t('dialogTitle'),
        message: t('msgNotFoundReminder'),
        icon: 'error',
        showCancel: false
      });
      return;
    }
  } else {
    // 新建模式：创建新提醒
    const reminder = {
      id: Date.now(),
      type,
      customText,
      time,
      repeatType,
      intervalMinutes,
      note,
      enabled: true,
      lastTriggered: null,
      nextTrigger: calculateNextTrigger(time, repeatType, intervalMinutes),
    };
    reminders.push(reminder);
  }

  saveData();
  renderReminders();
  updateStats();
  closeAddReminderModal();
}

// 计算下次触发时间
function calculateNextTrigger(time, repeatType, intervalMinutes) {
  const now = new Date();
  const [hours, minutes] = time.split(":").map(Number);

  if (repeatType === "interval") {
    const next = new Date(now.getTime() + intervalMinutes * 60000);
    return next.toISOString();
  }

  const next = new Date();
  next.setHours(hours, minutes, 0, 0);

  if (next <= now) {
    next.setDate(next.getDate() + 1);
  }

  return next.toISOString();
}

// 渲染提醒列表
function renderReminders() {
  const list = document.getElementById("reminderList");

  if (reminders.length === 0) {
    list.innerHTML =
      `<div class="text-center py-12"><p class="text-[#9c7049] dark:text-gray-400 text-lg">${t('noReminders')}</p></div>`;
    return;
  }

  list.innerHTML = reminders
    .map((r) => {
      const typeText = getReminderTypeText(r.type, r.customText);
      const timeText =
        r.repeatType === "interval" 
          ? `${t('unitEvery')} ${r.intervalMinutes} ${t('unitMinutes')}` 
          : r.time;
      const repeatText = getRepeatText(r.repeatType);

      return `
      <div class="bg-white dark:bg-white/5 rounded-xl border border-[#f4ede7] dark:border-white/10 p-4 flex items-center justify-between hover:border-primary/50 transition-colors">
        <div class="flex items-center gap-4">
          <div class="text-primary flex items-center justify-center rounded-lg bg-primary/20 size-12">
            <span class="material-symbols-outlined">${getReminderIcon(
              r.type
            )}</span>
          </div>
          <div>
            <p class="text-[#1c140d] dark:text-white text-base font-medium">${typeText}</p>
            <p class="text-[#9c7049] dark:text-gray-400 text-sm">${timeText} - ${repeatText}</p>
            ${
              r.note
                ? `<p class="text-[#9c7049] dark:text-gray-400 text-sm mt-1">${r.note}</p>`
                : ""
            }
          </div>
        </div>
        <div class="flex items-center gap-3">
          <label class="toggle-switch-small">
            <input type="checkbox" ${r.enabled ? 'checked' : ''} onchange="toggleReminder(${r.id}, this.checked)">
            <span class="toggle-slider-small"></span>
          </label>
          <button onclick="editReminder(${
            r.id
          })" class="text-primary hover:text-primary/80 p-2">
            <span class="material-symbols-outlined">edit</span>
          </button>
          <button onclick="deleteReminder(${
            r.id
          })" class="text-red-600 hover:text-red-700 p-2">
            <span class="material-symbols-outlined">delete</span>
          </button>
        </div>
      </div>
    `;
    })
    .join("");
}

// 获取提醒图标
function getReminderIcon(type) {
  const icons = {
    water: "water_drop",
    standup: "directions_walk",
    exercise: "directions_run",
    eye: "visibility",
    custom: "edit_note",
  };
  return icons[type] || "notifications";
}

// 获取提醒类型文本 - 已移至文件末尾的国际化部分
// 获取重复类型文本 - 已移至文件末尾的国际化部分

// 编辑提醒
function editReminder(id) {
  const reminder = reminders.find((r) => r.id === id);
  if (!reminder) return;

  // 填充表单
  document.getElementById("reminderType").value = reminder.type;
  document.getElementById("customText").value = reminder.customText || "";
  document.getElementById("reminderTime").value = reminder.time || "";
  document.getElementById("repeatType").value = reminder.repeatType;
  document.getElementById("intervalMinutes").value =
    reminder.intervalMinutes || 60;
  document.getElementById("reminderNote").value = reminder.note || "";

  // 显示/隐藏相关字段
  const customGroup = document.getElementById("customTextGroup");
  customGroup.classList.toggle("hidden", reminder.type !== "custom");

  const intervalGroup = document.getElementById("intervalGroup");
  intervalGroup.classList.toggle("hidden", reminder.repeatType !== "interval");

  // 打开弹窗
  document.getElementById("addReminderModal").classList.remove("hidden");

  // 标记为编辑模式
  document.getElementById("addReminderModal").dataset.editId = id;
  document.querySelector("#addReminderModal .modal-header h2").textContent =
    "编辑提醒";
}

// 切换提醒开关
function toggleReminder(id, enabled) {
  const reminder = reminders.find((r) => r.id === id);
  if (reminder) {
    reminder.enabled = enabled;
    saveData();
    renderReminders();
    updateStats();
  }
}

// 删除提醒
function deleteReminder(id) {
  showDialog({
    title: t('dialogDelete'),
    message: t('msgDeleteReminder'),
    icon: "delete",
    confirmText: t('dialogDelete'),
    cancelText: t('dialogCancel'),
    onConfirm: () => {
      reminders = reminders.filter((r) => r.id !== id);
      saveData();
      renderReminders();
      updateStats();
    },
  });
}

// 检查提醒
function checkReminders() {
  const now = new Date();

  reminders.forEach((reminder) => {
    if (!reminder.enabled) return;

    const nextTrigger = new Date(reminder.nextTrigger);

    if (now >= nextTrigger) {
      // 先更新下次触发时间，防止重复触发
      if (reminder.repeatType === "interval") {
        reminder.nextTrigger = new Date(
          nextTrigger.getTime() + reminder.intervalMinutes * 60000
        ).toISOString();
      } else if (reminder.repeatType !== "once") {
        const [hours, minutes] = reminder.time.split(":").map(Number);
        const next = new Date(nextTrigger);
        next.setDate(next.getDate() + 1);
        next.setHours(hours, minutes, 0, 0);
        reminder.nextTrigger = next.toISOString();
      } else {
        reminder.enabled = false;
      }

      reminder.lastTriggered = now.toISOString();
      saveData();
      
      // 最后触发提醒
      triggerReminder(reminder);
    }
  });
}

// 触发提醒
function triggerReminder(reminder) {
  const typeText = getReminderTypeText(reminder.type, reminder.customText);
  const message = getReminderMessage(reminder.type, reminder.note);

  // 显示系统通知
  if (settings.notificationEnabled) {
    // 使用 Electron 的通知 API
    if (typeof require !== "undefined") {
      const { ipcRenderer } = require("electron");
      
      // 根据提醒类型选择图标
      const iconMap = {
        water: 'assets/image/drink_ water.png',
        standup: 'assets/image/relax.png',
        exercise: 'assets/image/sports.png',
        eye: 'assets/image/overlooking.png',
        custom: 'assets/cat.png'
      };
      
      ipcRenderer.send("show-notification", {
        title: typeText, // 只显示提醒类型，不加前缀
        body: message,
        reminderId: reminder.id,
        playSound: settings.soundEnabled, // 告诉主进程是否播放音效
        icon: iconMap[reminder.type] || 'assets/cat.png'
      });
    }
  }

  // 如果没有开启通知但开启了音效，直接播放
  if (settings.soundEnabled && !settings.notificationEnabled) {
    playNotificationSound();
  }
}

// 显示提醒弹窗
let currentReminderId = null;

function showReminderPopup(title, message, reminderId) {
  currentReminderId = reminderId;
  document.getElementById("popupTitle").textContent = title;
  document.getElementById("popupMessage").textContent = message;
  document.getElementById("reminderPopup").classList.remove("hidden");
  document.getElementById("snoozeOptions").classList.add("hidden");
}

// 完成提醒
function completeReminder() {
  if (currentReminderId) {
    completeReminderById(currentReminderId);
  }

  document.getElementById("reminderPopup").classList.add("hidden");
  currentReminderId = null;
}

// 根据ID完成提醒
function completeReminderById(reminderId) {
  const reminder = reminders.find((r) => r.id === reminderId);
  if (reminder) {
    history.push({
      id: Date.now(),
      reminderId: reminderId,
      type: reminder.type,
      customText: reminder.customText,
      completedAt: new Date().toISOString(),
      status: "completed",
    });
    saveData();
    updateStats();
  }
}

// 切换延迟选项
function toggleSnoozeOptions() {
  const options = document.getElementById("snoozeOptions");
  options.classList.toggle("hidden");
}

// 延迟提醒
function snoozeReminder(minutes) {
  if (currentReminderId) {
    snoozeReminderById(currentReminderId, minutes);
  }

  document.getElementById("reminderPopup").classList.add("hidden");
  currentReminderId = null;
}

// 根据ID延迟提醒
function snoozeReminderById(reminderId, minutes) {
  const reminder = reminders.find((r) => r.id === reminderId);
  if (reminder) {
    const now = new Date();
    reminder.nextTrigger = new Date(
      now.getTime() + minutes * 60000
    ).toISOString();
    saveData();
  }
}

// 播放通知声音
function playNotificationSound() {
  const soundFile = settings.soundFile || "noti1";
  const audio = new Audio(`assets/noti/${soundFile}.mp3`);
  audio.volume = 0.7;
  audio.play().catch((error) => {
    console.error("播放音效失败:", error);
  });
}

// 更新统计
function updateStats() {
  const today = new Date().toDateString();
  const todayHistory = history.filter((h) => {
    const date = new Date(h.completedAt).toDateString();
    return date === today;
  });

  const completed = todayHistory.filter((h) => h.status === "completed").length;
  const pending = reminders.filter((r) => r.enabled).length;

  document.getElementById("completedCount").textContent = completed;
  document.getElementById("pendingCount").textContent = pending;
}

// 渲染历史记录
function renderHistory() {
  const list = document.getElementById("historyList");
  const filter = document.getElementById("historyFilter").value;
  const dateFilter = document.getElementById("historyDate").value;

  let filtered = [...history];

  if (filter !== "all") {
    filtered = filtered.filter((h) => h.type === filter);
  }

  // 默认显示今天的记录
  const targetDate = dateFilter
    ? new Date(dateFilter).toDateString()
    : new Date().toDateString();
  filtered = filtered.filter((h) => {
    const date = new Date(h.completedAt).toDateString();
    return date === targetDate;
  });

  filtered.sort((a, b) => new Date(b.completedAt) - new Date(a.completedAt));

  if (filtered.length === 0) {
    const displayDate = dateFilter ? new Date(dateFilter) : new Date();
    const dateText = getCurrentLanguage() === 'zh-CN' 
      ? `${displayDate.getMonth() + 1}月${displayDate.getDate()}日`
      : displayDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric' });
    list.innerHTML = `<div class="text-center py-12"><p class="text-[#9c7049] dark:text-gray-400 text-lg">${dateText} ${t('historyNoRecords')}</p></div>`;
    return;
  }

  list.innerHTML = filtered
    .map((h) => {
      const date = new Date(h.completedAt);
      // 只显示时间，不显示日期
      const timeStr = `${String(date.getHours()).padStart(2, "0")}:${String(
        date.getMinutes()
      ).padStart(2, "0")}`;
      const typeText = getReminderTypeText(h.type, h.customText);

      return `
      <div class="bg-white dark:bg-white/5 rounded-xl border border-[#f4ede7] dark:border-white/10 p-4 flex items-center justify-between">
        <div class="flex items-center gap-4">
          <div class="text-primary flex items-center justify-center rounded-lg bg-primary/20 size-12">
            <span class="material-symbols-outlined">${getReminderIcon(
              h.type
            )}</span>
          </div>
          <div>
            <p class="text-[#1c140d] dark:text-white text-base font-medium">${typeText}</p>
            <p class="text-[#9c7049] dark:text-gray-400 text-sm">${timeStr}</p>
          </div>
        </div>
        <span class="px-3 py-1 text-sm font-medium rounded-lg ${
          h.status === "completed"
            ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
            : "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"
        }">
          ${h.status === "completed" ? t('historyCompleted') : t('historyMissed')}
        </span>
      </div>
    `;
    })
    .join("");
}

// 更新设置
function updateSettings() {
  settings.defaultInterval = parseInt(
    document.getElementById("defaultInterval").value
  );
  settings.notificationEnabled = document.getElementById(
    "notificationEnabled"
  ).checked;
  settings.soundEnabled = document.getElementById("soundEnabled").checked;
  settings.soundFile = document.getElementById("soundSelect").value;
  settings.showWindowOnClick =
    document.getElementById("showWindowOnClick").checked;
  settings.autoStart = document.getElementById("autoStart").checked;
  saveData();
}

// 切换音效选择显示
function toggleSoundSelect() {
  const soundSelectRow = document.getElementById("soundSelectRow");
  const soundEnabled = document.getElementById("soundEnabled").checked;
  soundSelectRow.style.display = soundEnabled ? "flex" : "none";
}

// 清空历史记录
function clearHistory() {
  showDialog({
    title: t('settingClearHistory'),
    message: t('msgClearHistory'),
    icon: "delete_sweep",
    confirmText: t('btnClearHistory'),
    cancelText: t('dialogCancel'),
    onConfirm: () => {
      history = [];
      saveData();
      renderHistory();
      updateStats();
    },
  });
}

// 自定义对话框
function showDialog(options) {
  const {
    title = t('dialogTitle'),
    message = "",
    icon = "info",
    confirmText = t('dialogConfirm'),
    cancelText = t('dialogCancel'),
    showCancel = true,
    onConfirm = null,
    onCancel = null,
  } = options;

  const dialog = document.getElementById("customDialog");
  const dialogTitle = document.getElementById("dialogTitle");
  const dialogMessage = document.getElementById("dialogMessage");
  const dialogIcon = document.getElementById("dialogIcon");
  const confirmBtn = document.getElementById("dialogConfirmBtn");
  const cancelBtn = document.getElementById("dialogCancelBtn");

  // 设置内容
  dialogTitle.textContent = title;
  dialogMessage.textContent = message;
  dialogIcon.textContent = icon;
  confirmBtn.textContent = confirmText;
  cancelBtn.textContent = cancelText;

  // 显示/隐藏取消按钮
  cancelBtn.style.display = showCancel ? "block" : "none";

  // 显示对话框
  dialog.classList.remove("hidden");

  // 确定按钮事件
  const handleConfirm = () => {
    dialog.classList.add("hidden");
    if (onConfirm) onConfirm();
    cleanup();
  };

  // 取消按钮事件
  const handleCancel = () => {
    dialog.classList.add("hidden");
    if (onCancel) onCancel();
    cleanup();
  };

  // 清理事件监听
  const cleanup = () => {
    confirmBtn.removeEventListener("click", handleConfirm);
    cancelBtn.removeEventListener("click", handleCancel);
  };

  // 添加事件监听
  confirmBtn.addEventListener("click", handleConfirm);
  cancelBtn.addEventListener("click", handleCancel);
}

// ========== 倒计时功能 ==========
let countdownIsPaused = false;
let countdownTotalTime = 0;

function initCountdown() {
  document
    .getElementById("countdownStartBtn")
    .addEventListener("click", startCountdown);
  
  // 暂停/继续按钮
  document.getElementById("countdownPauseBtn").addEventListener("click", () => {
    if (countdownIsPaused) {
      resumeCountdown();
    } else {
      pauseCountdown();
    }
  });
  
  document
    .getElementById("countdownResetBtn")
    .addEventListener("click", resetCountdown);
}

function startCountdown() {
  if (countdownTimer) return;

  const hours = parseInt(document.getElementById("countdownHours").value) || 0;
  const minutes =
    parseInt(document.getElementById("countdownMinutes").value) || 0;
  const seconds =
    parseInt(document.getElementById("countdownSeconds").value) || 0;

  countdownRemaining = hours * 3600 + minutes * 60 + seconds;

  if (countdownRemaining === 0) {
    showDialog({
      title: t('dialogTitle'),
      message: t('countdownSubtitle'),
      icon: "schedule",
      showCancel: false,
    });
    return;
  }

  // 保存总时间
  countdownTotalTime = countdownRemaining;
  
  // 切换到倒计时界面
  document.getElementById('countdownSetup').classList.add('hidden');
  document.getElementById('countdownActive').classList.remove('hidden');
  document.getElementById('countdownActiveStatus').textContent = '倒计时中...';
  
  // 重置进度条
  updateCountdownProgress();
  
  countdownIsPaused = false;
  document.getElementById("countdownPauseBtn").innerHTML = `<span class="material-symbols-outlined">pause</span> ${t('btnPause')}`;

  countdownTimer = setInterval(() => {
    countdownRemaining--;
    updateCountdownActiveDisplay();
    updateCountdownProgress();

    if (countdownRemaining <= 0) {
      clearInterval(countdownTimer);
      countdownTimer = null;
      
      // 播放音效
      playNotificationSound();
      
      // 发送系统通知
      if (settings.notificationEnabled) {
        if (typeof require !== 'undefined') {
          const { ipcRenderer } = require('electron');
          ipcRenderer.send('show-notification', {
            title: '倒计时结束',
            body: '时间到！',
            reminderId: Date.now(),
            playSound: false,
            icon: 'assets/image/countdown.png'
          });
        }
      }
      
      // 显示对话框
      showDialog({
        title: "倒计时结束",
        message: "时间到！",
        icon: "alarm",
        showCancel: false,
        onConfirm: () => {
          resetCountdown();
        }
      });
    }
  }, 1000);
}

function pauseCountdown() {
  if (countdownTimer) {
    clearInterval(countdownTimer);
    countdownTimer = null;
    countdownIsPaused = true;
    document.getElementById('countdownActiveStatus').textContent = t('countdownPaused');
    document.getElementById("countdownPauseBtn").innerHTML = `<span class="material-symbols-outlined">play_arrow</span> ${t('btnResume')}`;
  }
}

function resumeCountdown() {
  countdownIsPaused = false;
  document.getElementById('countdownActiveStatus').textContent = t('countdownStatus');
  document.getElementById("countdownPauseBtn").innerHTML = `<span class="material-symbols-outlined">pause</span> ${t('btnPause')}`;
  
  countdownTimer = setInterval(() => {
    countdownRemaining--;
    updateCountdownActiveDisplay();
    updateCountdownProgress();

    if (countdownRemaining <= 0) {
      clearInterval(countdownTimer);
      countdownTimer = null;
      
      // 播放音效
      playNotificationSound();
      
      // 发送系统通知
      if (settings.notificationEnabled) {
        if (typeof require !== 'undefined') {
          const { ipcRenderer } = require('electron');
          ipcRenderer.send('show-notification', {
            title: '倒计时结束',
            body: '时间到！',
            reminderId: Date.now(),
            playSound: false,
            icon: 'assets/image/countdown.png'
          });
        }
      }
      
      // 显示对话框
      showDialog({
        title: "倒计时结束",
        message: "时间到！",
        icon: "alarm",
        showCancel: false,
        onConfirm: () => {
          resetCountdown();
        }
      });
    }
  }, 1000);
}

function resetCountdown() {
  if (countdownTimer) {
    clearInterval(countdownTimer);
    countdownTimer = null;
  }
  
  // 切换回设置界面
  document.getElementById('countdownSetup').classList.remove('hidden');
  document.getElementById('countdownActive').classList.add('hidden');
  
  countdownIsPaused = false;
  countdownRemaining = 0;
  countdownTotalTime = 0;
  document.getElementById("countdownDisplay").textContent = "00:00:00";
  document.getElementById("countdownPauseBtn").innerHTML = `<span class="material-symbols-outlined">pause</span> ${t('btnPause')}`;
  
  // 重置进度条
  const circle = document.getElementById('countdownProgressCircle');
  circle.style.strokeDashoffset = 910.6;
}

function updateCountdownDisplay() {
  const hours = Math.floor(countdownRemaining / 3600);
  const minutes = Math.floor((countdownRemaining % 3600) / 60);
  const seconds = countdownRemaining % 60;

  document.getElementById("countdownDisplay").textContent = `${String(
    hours
  ).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(
    seconds
  ).padStart(2, "0")}`;
}

function updateCountdownActiveDisplay() {
  const hours = Math.floor(countdownRemaining / 3600);
  const minutes = Math.floor((countdownRemaining % 3600) / 60);
  const seconds = countdownRemaining % 60;

  document.getElementById("countdownActiveDisplay").textContent = `${String(
    hours
  ).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(
    seconds
  ).padStart(2, "0")}`;
}

function updateCountdownProgress() {
  const circle = document.getElementById('countdownProgressCircle');
  const circumference = 2 * Math.PI * 145;
  const progress = countdownRemaining / countdownTotalTime;
  const offset = circumference * (1 - progress);
  circle.style.strokeDashoffset = offset;
}

// ========== 专注时间功能（重写） ==========
let focusTotalTime = 25 * 60;

// 新的专注时间功能
let focusIsPaused = false;

function initFocus() {
  document.getElementById('focusStartBtn').addEventListener('click', startFocus);
  
  // 暂停/继续按钮
  document.getElementById('focusActivePauseBtn').addEventListener('click', () => {
    if (focusIsPaused) {
      resumeFocus();
    } else {
      pauseFocus();
    }
  });
  
  document.getElementById('focusActiveStopBtn').addEventListener('click', stopFocus);
  
  // 预设时间按钮
  document.querySelectorAll('.focus-preset').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const minutes = parseInt(e.currentTarget.dataset.minutes);
      focusRemaining = minutes * 60;
      focusTotalTime = minutes * 60;
      updateFocusDisplay();
    });
  });

  // 自定义时间按钮
  document.getElementById('focusCustomBtn').addEventListener('click', () => {
    // 创建自定义输入对话框
    const modal = document.getElementById('customDialog');
    const dialogTitle = document.getElementById('dialogTitle');
    const dialogMessage = document.getElementById('dialogMessage');
    const dialogIcon = document.getElementById('dialogIcon');
    const confirmBtn = document.getElementById('dialogConfirmBtn');
    const cancelBtn = document.getElementById('dialogCancelBtn');

    // 设置内容
    dialogTitle.textContent = t('customFocusTime');
    dialogIcon.textContent = 'schedule';
    confirmBtn.textContent = t('dialogConfirm');
    cancelBtn.textContent = t('dialogCancel');
    cancelBtn.style.display = 'block';

    // 创建输入框
    dialogMessage.innerHTML = `
      <p class="mb-4">${t('customFocusPrompt')}</p>
      <input type="number" id="customFocusInput" min="1" max="180" value="30" 
        class="w-full rounded-lg border-[#f4ede7] dark:border-white/20 bg-white dark:bg-background-dark dark:text-white px-4 py-2 text-center text-2xl font-bold">
    `;

    // 显示对话框
    modal.classList.remove('hidden');

    // 聚焦输入框
    setTimeout(() => {
      document.getElementById('customFocusInput').focus();
      document.getElementById('customFocusInput').select();
    }, 100);

    // 确定按钮事件
    const handleConfirm = () => {
      const input = document.getElementById('customFocusInput');
      const minutes = parseInt(input.value);
      
      if (minutes && minutes > 0 && minutes <= 180) {
        focusRemaining = minutes * 60;
        focusTotalTime = minutes * 60;
        updateFocusDisplay();
      }
      
      modal.classList.add('hidden');
      dialogMessage.textContent = ''; // 清空内容
      cleanup();
    };

    // 取消按钮事件
    const handleCancel = () => {
      modal.classList.add('hidden');
      dialogMessage.textContent = ''; // 清空内容
      cleanup();
    };

    // 清理事件监听
    const cleanup = () => {
      confirmBtn.removeEventListener('click', handleConfirm);
      cancelBtn.removeEventListener('click', handleCancel);
    };

    // 添加事件监听
    confirmBtn.addEventListener('click', handleConfirm);
    cancelBtn.addEventListener('click', handleCancel);

    // 支持回车键确认
    document.getElementById('customFocusInput').addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        handleConfirm();
      }
    });
  });
  
  updateFocusDisplay();
}

function startFocus() {
  if (focusTimer) return;
  
  // 重置进度条
  focusTotalTime = focusRemaining;
  updateFocusProgress();
  
  // 切换到专注界面
  document.getElementById('focusSetup').classList.add('hidden');
  document.getElementById('focusActive').classList.remove('hidden');
  document.getElementById('focusActiveStatus').textContent = t('focusStatusActive');
  
  // 重置暂停按钮状态
  focusIsPaused = false;
  document.getElementById('focusActivePauseBtn').innerHTML = `<span class="material-symbols-outlined">pause</span> ${t('btnPause')}`;
  
  focusTimer = setInterval(() => {
    focusRemaining--;
    updateFocusActiveDisplay();
    updateFocusProgress();
    
    if (focusRemaining <= 0) {
      clearInterval(focusTimer);
      focusTimer = null;
      
      // 播放音效
      playNotificationSound();
      
      // 发送系统通知
      if (settings.notificationEnabled) {
        if (typeof require !== 'undefined') {
          const { ipcRenderer } = require('electron');
          ipcRenderer.send('show-notification', {
            title: '专注时间结束',
            body: '做得好！完成了一次专注',
            reminderId: Date.now(),
            playSound: false,
            icon: 'assets/image/focus.png'
          });
        }
      }
      
      // 添加到历史记录
      const focusDuration = Math.floor(focusTotalTime / 60);
      history.push({
        id: Date.now(),
        type: 'focus',
        customText: `${focusDuration}${t('unitMinutes')}`,
        completedAt: new Date().toISOString(),
        status: 'completed',
      });
      saveData();
      updateStats();
      
      // 显示对话框
      showDialog({
        title: '专注时间结束',
        message: '做得好！完成了一次专注',
        icon: 'celebration',
        showCancel: false,
        onConfirm: () => {
          stopFocus();
        }
      });
    }
  }, 1000);
}

function pauseFocus() {
  if (focusTimer) {
    clearInterval(focusTimer);
    focusTimer = null;
    focusIsPaused = true;
    document.getElementById('focusActiveStatus').textContent = t('focusStatusPaused');
    document.getElementById('focusActivePauseBtn').innerHTML = `<span class="material-symbols-outlined">play_arrow</span> ${t('btnResume')}`;
  }
}

function resumeFocus() {
  focusIsPaused = false;
  document.getElementById('focusActiveStatus').textContent = t('focusStatusActive');
  document.getElementById('focusActivePauseBtn').innerHTML = `<span class="material-symbols-outlined">pause</span> ${t('btnPause')}`;
  
  focusTimer = setInterval(() => {
    focusRemaining--;
    updateFocusActiveDisplay();
    updateFocusProgress();
    
    if (focusRemaining <= 0) {
      clearInterval(focusTimer);
      focusTimer = null;
      
      // 播放音效
      playNotificationSound();
      
      // 发送系统通知
      if (settings.notificationEnabled) {
        if (typeof require !== 'undefined') {
          const { ipcRenderer } = require('electron');
          ipcRenderer.send('show-notification', {
            title: '专注时间结束',
            body: '做得好！完成了一次专注',
            reminderId: Date.now(),
            playSound: false,
            icon: 'assets/image/focus.png'
          });
        }
      }
      
      // 添加到历史记录
      const focusDuration = Math.floor(focusTotalTime / 60);
      history.push({
        id: Date.now(),
        type: 'focus',
        customText: `${focusDuration}${t('unitMinutes')}`,
        completedAt: new Date().toISOString(),
        status: 'completed',
      });
      saveData();
      updateStats();
      
      // 显示对话框
      showDialog({
        title: '专注时间结束',
        message: '做得好！完成了一次专注',
        icon: 'celebration',
        showCancel: false,
        onConfirm: () => {
          stopFocus();
        }
      });
    }
  }, 1000);
}

function stopFocus() {
  if (focusTimer) {
    clearInterval(focusTimer);
    focusTimer = null;
  }
  
  // 切换回设置界面
  document.getElementById('focusSetup').classList.remove('hidden');
  document.getElementById('focusActive').classList.add('hidden');
  
  // 重置状态
  focusMode = 'work';
  focusRemaining = 25 * 60;
  focusTotalTime = 25 * 60;
  updateFocusDisplay();
  document.getElementById('focusStatus').textContent = '准备开始专注';
  
  // 重置进度条
  const circle = document.getElementById('focusProgressCircle');
  circle.style.strokeDashoffset = 910.6; // 完全重置 (2 * Math.PI * 145)
}

function updateFocusDisplay() {
  const minutes = Math.floor(focusRemaining / 60);
  const seconds = focusRemaining % 60;
  document.getElementById('focusDisplay').textContent = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

function updateFocusActiveDisplay() {
  const minutes = Math.floor(focusRemaining / 60);
  const seconds = focusRemaining % 60;
  document.getElementById('focusActiveDisplay').textContent = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  
  // 更新激励文字
  updateMotivationText(focusRemaining, focusTotalTime);
}

function updateFocusProgress() {
  const circle = document.getElementById('focusProgressCircle');
  const circumference = 2 * Math.PI * 145; // 2πr (半径改为145)
  const progress = focusRemaining / focusTotalTime;
  const offset = circumference * (1 - progress);
  circle.style.strokeDashoffset = offset;
}

function updateMotivationText(remaining, total) {
  const progress = (total - remaining) / total;
  const motivationEl = document.getElementById('focusMotivation');
  
  if (progress < 0.25) {
    motivationEl.textContent = '很好的开始，保持专注！';
  } else if (progress < 0.5) {
    motivationEl.textContent = '做得很棒，继续加油！';
  } else if (progress < 0.75) {
    motivationEl.textContent = '已经过半了，坚持住！';
  } else if (progress < 0.9) {
    motivationEl.textContent = '马上就要完成了！';
  } else {
    motivationEl.textContent = '最后冲刺，胜利在望！';
  }
}


// ========== 国际化支持 ==========
function updateUIText() {
  try {
    // 更新标题
    document.title = t('appTitle');
    
    // 更新应用副标题
    const appSubtitle = document.getElementById('appSubtitle');
    if (appSubtitle) appSubtitle.textContent = t('appSubtitle');
    
    // 更新导航
    const navRemindersText = document.getElementById('navRemindersText');
    const navFocusText = document.getElementById('navFocusText');
    const navCountdownText = document.getElementById('navCountdownText');
    const navHistoryText = document.getElementById('navHistoryText');
    const navSettingsText = document.getElementById('navSettingsText');
    const navAbout = document.getElementById('navAbout');
    
    if (navRemindersText) navRemindersText.textContent = t('navReminders');
    if (navFocusText) navFocusText.textContent = t('navFocus');
    if (navCountdownText) navCountdownText.textContent = t('navCountdown');
    if (navHistoryText) navHistoryText.textContent = t('navHistory');
    if (navSettingsText) navSettingsText.textContent = t('navSettings');
    if (navAbout) navAbout.textContent = t('navAbout');
    
    // 提醒页面
    const remindersTitle = document.querySelector('#remindersPage h2');
    const remindersSubtitle = document.querySelector('#remindersPage p');
    const addReminderBtn = document.querySelector('#addReminderBtn');
    
    if (remindersTitle) remindersTitle.textContent = t('remindersTitle');
    if (remindersSubtitle) remindersSubtitle.textContent = t('remindersSubtitle');
    if (addReminderBtn) addReminderBtn.innerHTML = `<span class="material-symbols-outlined">add</span> ${t('btnNewReminder')}`;
    
    // 倒计时页面
    const countdownTitle = document.querySelector('#countdownPage h2');
    const countdownSubtitle = document.querySelector('#countdownSetup p');
    const countdownStatus = document.querySelector('#countdownActiveStatus');
    const countdownStartBtn = document.querySelector('#countdownStartBtn');
    
    if (countdownTitle) countdownTitle.textContent = t('countdownTitle');
    if (countdownSubtitle) countdownSubtitle.textContent = t('countdownSubtitle');
    if (countdownStatus) countdownStatus.textContent = t('countdownStatus');
    if (countdownStartBtn) countdownStartBtn.innerHTML = `<span class="material-symbols-outlined">play_arrow</span> ${t('btnStart')}`;
    
    // 专注时间页面
    const focusTitle = document.querySelector('#focusPage h2');
    const focusSubtitle = document.querySelector('#focusSetup p');
    const focusStatus = document.querySelector('#focusStatus');
    const focusMotivation = document.querySelector('#focusMotivation');
    const focusActiveStatus = document.querySelector('#focusActiveStatus');
    const focusStartBtn = document.querySelector('#focusStartBtn');
    
    if (focusTitle) focusTitle.textContent = t('focusTitle');
    if (focusSubtitle) focusSubtitle.textContent = t('focusSubtitle');
    if (focusStatus) focusStatus.textContent = t('focusStatus');
    if (focusMotivation) focusMotivation.textContent = t('motivationStart');
    if (focusActiveStatus) focusActiveStatus.textContent = t('focusStatusActive');
    if (focusStartBtn) focusStartBtn.innerHTML = `<span class="material-symbols-outlined">play_arrow</span> ${t('btnStartFocus')}`;
    
    // 历史记录页面
    const historyTitle = document.querySelector('#historyPage h2');
    const historySubtitle = document.querySelector('#historyPage > div > p');
    
    if (historyTitle) historyTitle.textContent = t('historyTitle');
    if (historySubtitle) historySubtitle.textContent = t('historySubtitle');
    
    // 设置页面
    const settingsTitle = document.querySelector('#settingsPage h2');
    const settingsSubtitle = document.querySelector('#settingsPage > div > p');
    const settingsGeneralTitle = document.getElementById('settingsGeneralTitle');
    const settingsNotificationTitle = document.getElementById('settingsNotificationTitle');
    const settingsAppearanceTitle = document.getElementById('settingsAppearanceTitle');
    const settingsDataTitle = document.getElementById('settingsDataTitle');
    const darkModeLabel = document.getElementById('settingDarkModeLabel');
    const darkModeDesc = document.getElementById('settingDarkModeDesc');
    const languageLabel = document.getElementById('settingLanguageLabel');
    const languageDesc = document.getElementById('settingLanguageDesc');
    
    if (settingsTitle) settingsTitle.textContent = t('settingsTitle');
    if (settingsSubtitle) settingsSubtitle.textContent = t('settingsSubtitle');
    if (settingsGeneralTitle) settingsGeneralTitle.textContent = t('settingsGeneral');
    if (settingsNotificationTitle) settingsNotificationTitle.textContent = t('settingsNotification');
    if (settingsAppearanceTitle) settingsAppearanceTitle.textContent = t('settingsAppearance');
    if (settingsDataTitle) settingsDataTitle.textContent = t('settingsData');
    if (darkModeLabel) darkModeLabel.textContent = t('settingDarkMode');
    if (darkModeDesc) darkModeDesc.textContent = t('settingDarkModeDesc');
    if (languageLabel) languageLabel.textContent = t('settingLanguage');
    if (languageDesc) languageDesc.textContent = t('settingLanguageDesc');
    
    // 通用设置项
    const settingDefaultIntervalLabel = document.getElementById('settingDefaultIntervalLabel');
    const settingDefaultIntervalDesc = document.getElementById('settingDefaultIntervalDesc');
    const settingAutoStartLabel = document.getElementById('settingAutoStartLabel');
    const settingAutoStartDesc = document.getElementById('settingAutoStartDesc');
    const unitMinutesLabel1 = document.getElementById('unitMinutesLabel1');
    
    if (settingDefaultIntervalLabel) settingDefaultIntervalLabel.textContent = t('settingDefaultInterval');
    if (settingDefaultIntervalDesc) settingDefaultIntervalDesc.textContent = t('settingDefaultIntervalDesc');
    if (settingAutoStartLabel) settingAutoStartLabel.textContent = t('settingAutoStart');
    if (settingAutoStartDesc) settingAutoStartDesc.textContent = t('settingAutoStartDesc');
    if (unitMinutesLabel1) unitMinutesLabel1.textContent = t('unitMinutes');
    
    // 通知设置项
    const settingNotificationLabel = document.getElementById('settingNotificationLabel');
    const settingNotificationDesc = document.getElementById('settingNotificationDesc');
    const settingSoundLabel = document.getElementById('settingSoundLabel');
    const settingSoundDesc = document.getElementById('settingSoundDesc');
    const settingSoundSelectLabel = document.getElementById('settingSoundSelectLabel');
    const settingSoundSelectDesc = document.getElementById('settingSoundSelectDesc');
    
    if (settingNotificationLabel) settingNotificationLabel.textContent = t('settingEnableNotification');
    if (settingNotificationDesc) settingNotificationDesc.textContent = t('settingEnableNotificationDesc');
    if (settingSoundLabel) settingSoundLabel.textContent = t('settingEnableSound');
    if (settingSoundDesc) settingSoundDesc.textContent = t('settingEnableSoundDesc');
    if (settingSoundSelectLabel) settingSoundSelectLabel.textContent = t('settingSelectSound');
    if (settingSoundSelectDesc) settingSoundSelectDesc.textContent = t('settingSelectSoundDesc');
    
    // 数据设置项
    const settingClearHistoryLabel = document.getElementById('settingClearHistoryLabel');
    const settingClearHistoryDesc = document.getElementById('settingClearHistoryDescText');
    const btnClearHistoryText = document.getElementById('btnClearHistoryText');
    
    if (settingClearHistoryLabel) settingClearHistoryLabel.textContent = t('settingClearHistory');
    if (settingClearHistoryDesc) settingClearHistoryDesc.textContent = t('settingClearHistoryDesc');
    if (btnClearHistoryText) btnClearHistoryText.textContent = t('btnClearHistory');
    
    // 显示窗口设置
    const settingShowWindowLabel = document.getElementById('settingShowWindowLabel');
    const settingShowWindowDesc = document.getElementById('settingShowWindowDesc');
    
    if (settingShowWindowLabel) settingShowWindowLabel.textContent = t('settingShowWindow');
    if (settingShowWindowDesc) settingShowWindowDesc.textContent = t('settingShowWindowDesc');
    
    // 音效选项
    const sound1 = document.getElementById('sound1');
    const sound2 = document.getElementById('sound2');
    const sound3 = document.getElementById('sound3');
    const sound4 = document.getElementById('sound4');
    const sound5 = document.getElementById('sound5');
    const sound6 = document.getElementById('sound6');
    const sound7 = document.getElementById('sound7');
    const sound8 = document.getElementById('sound8');
    
    if (sound1) sound1.textContent = t('sound1');
    if (sound2) sound2.textContent = t('sound2');
    if (sound3) sound3.textContent = t('sound3');
    if (sound4) sound4.textContent = t('sound4');
    if (sound5) sound5.textContent = t('sound5');
    if (sound6) sound6.textContent = t('sound6');
    if (sound7) sound7.textContent = t('sound7');
    if (sound8) sound8.textContent = t('sound8');
    
    // 语言选项
    const langZhCN = document.getElementById('langZhCN');
    const langEnUS = document.getElementById('langEnUS');
    
    if (langZhCN) langZhCN.textContent = t('languageZhCN');
    if (langEnUS) langEnUS.textContent = t('languageEnUS');
    
    // 更新统计标签
    const completedLabel = document.getElementById('completedLabel');
    const pendingLabel = document.getElementById('pendingLabel');
    if (completedLabel) completedLabel.textContent = t('todayCompleted');
    if (pendingLabel) pendingLabel.textContent = t('todayPending');
    
    // 更新提醒页面标题和按钮
    const remindersPageTitle = document.getElementById('remindersTitle');
    const remindersPageSubtitle = document.getElementById('remindersSubtitle');
    const btnNewReminderText = document.getElementById('btnNewReminderText');
    if (remindersPageTitle) remindersPageTitle.textContent = t('remindersTitle');
    if (remindersPageSubtitle) remindersPageSubtitle.textContent = t('remindersSubtitle');
    if (btnNewReminderText) btnNewReminderText.textContent = t('btnNewReminder');
    
    // 更新倒计时页面
    const countdownPageTitle = document.getElementById('countdownTitle');
    const countdownPageSubtitle = document.getElementById('countdownSubtitle');
    const labelHoursText = document.getElementById('labelHoursText');
    const labelMinutesText = document.getElementById('labelMinutesText');
    const labelSecondsText = document.getElementById('labelSecondsText');
    const btnStartText = document.getElementById('btnStartText');
    
    if (countdownPageTitle) countdownPageTitle.textContent = t('countdownTitle');
    if (countdownPageSubtitle) countdownPageSubtitle.textContent = t('countdownSubtitle');
    if (labelHoursText) labelHoursText.textContent = t('labelHours');
    if (labelMinutesText) labelMinutesText.textContent = t('labelMinutes');
    if (labelSecondsText) labelSecondsText.textContent = t('labelSeconds');
    if (btnStartText) btnStartText.textContent = t('btnStart');
    
    // 更新专注时间页面
    const focusPageTitle = document.getElementById('focusTitle');
    const focusPageSubtitle = document.getElementById('focusSubtitle');
    const unitMinutesLabel2 = document.getElementById('unitMinutesLabel2');
    const unitMinutesLabel3 = document.getElementById('unitMinutesLabel3');
    const unitMinutesLabel4 = document.getElementById('unitMinutesLabel4');
    const btnCustomText = document.getElementById('btnCustomText');
    const btnStartFocusText = document.getElementById('btnStartFocusText');
    
    if (focusPageTitle) focusPageTitle.textContent = t('focusTitle');
    if (focusPageSubtitle) focusPageSubtitle.textContent = t('focusSubtitle');
    if (unitMinutesLabel2) unitMinutesLabel2.textContent = t('unitMinutes');
    if (unitMinutesLabel3) unitMinutesLabel3.textContent = t('unitMinutes');
    if (unitMinutesLabel4) unitMinutesLabel4.textContent = t('unitMinutes');
    if (btnCustomText) btnCustomText.textContent = t('btnCustom');
    if (btnStartFocusText) btnStartFocusText.textContent = t('btnStartFocus');
    
    // 更新历史记录页面
    const historyPageTitle = document.getElementById('historyTitle');
    const historyPageSubtitle = document.getElementById('historySubtitle');
    if (historyPageTitle) historyPageTitle.textContent = t('historyTitle');
    if (historyPageSubtitle) historyPageSubtitle.textContent = t('historySubtitle');
    
    // 更新关于页面
    const aboutTitleText = document.getElementById('aboutTitleText');
    const aboutVersionLabel = document.getElementById('aboutVersionLabel');
    const aboutDescriptionText = document.getElementById('aboutDescriptionText');
    const aboutFeaturesTitle = document.getElementById('aboutFeaturesTitle');
    const aboutFeature1 = document.getElementById('aboutFeature1');
    const aboutFeature2 = document.getElementById('aboutFeature2');
    const aboutFeature3 = document.getElementById('aboutFeature3');
    const aboutFeature4 = document.getElementById('aboutFeature4');
    
    if (aboutTitleText) aboutTitleText.textContent = t('aboutTitle');
    if (aboutVersionLabel) aboutVersionLabel.textContent = t('aboutVersion');
    if (aboutDescriptionText) aboutDescriptionText.innerHTML = t('aboutDescription') + '<br />' + t('aboutSubDescription');
    if (aboutFeaturesTitle) aboutFeaturesTitle.textContent = t('aboutFeaturesTitle');
    if (aboutFeature1) aboutFeature1.textContent = t('aboutFeature1');
    if (aboutFeature2) aboutFeature2.textContent = t('aboutFeature2');
    if (aboutFeature3) aboutFeature3.textContent = t('aboutFeature3');
    if (aboutFeature4) aboutFeature4.textContent = t('aboutFeature4');
    
    const aboutFeature5 = document.getElementById('aboutFeature5');
    if (aboutFeature5) aboutFeature5.textContent = t('aboutFeature5');
    
    // 更新按钮文本
    const btnPauseText = document.getElementById('btnPauseText');
    const btnResetText = document.getElementById('btnResetText');
    const btnFocusPauseText = document.getElementById('btnFocusPauseText');
    const btnStopText = document.getElementById('btnStopText');
  
    
    if (btnPauseText) btnPauseText.textContent = t('btnPause');
    if (btnResetText) btnResetText.textContent = t('btnReset');
    if (btnFocusPauseText) btnFocusPauseText.textContent = t('btnPause');
    if (btnStopText) btnStopText.textContent = t('btnStop');
    if (unitMinutesLabel1) unitMinutesLabel1.textContent = t('unitMinutes');
    
    // 更新弹窗文本
    const modalTitle = document.getElementById('modalTitle');
    const labelReminderTypeText = document.getElementById('labelReminderTypeText');
    const labelCustomTextLabel = document.getElementById('labelCustomTextLabel');
    const labelTimeText = document.getElementById('labelTimeText');
    const labelRepeatTypeText = document.getElementById('labelRepeatTypeText');
    const labelIntervalText = document.getElementById('labelIntervalText');
    const labelNoteText = document.getElementById('labelNoteText');
    const btnCancelText = document.getElementById('btnCancelText');
    const btnSaveText = document.getElementById('btnSaveText');
    
    if (modalTitle) modalTitle.textContent = t('modalNewReminder');
    if (labelReminderTypeText) labelReminderTypeText.textContent = t('labelReminderType');
    if (labelCustomTextLabel) labelCustomTextLabel.textContent = t('labelCustomText');
    if (labelTimeText) labelTimeText.textContent = t('labelTime');
    if (labelRepeatTypeText) labelRepeatTypeText.textContent = t('labelRepeatType');
    if (labelIntervalText) labelIntervalText.textContent = t('labelInterval');
    if (labelNoteText) labelNoteText.textContent = t('labelNote');
    if (btnCancelText) btnCancelText.textContent = t('dialogCancel');
    if (btnSaveText) btnSaveText.textContent = t('btnSave');
    
    // 更新下拉选项
    const optionWater = document.getElementById('optionWater');
    const optionStandup = document.getElementById('optionStandup');
    const optionExercise = document.getElementById('optionExercise');
    const optionEye = document.getElementById('optionEye');
    const optionCustom = document.getElementById('optionCustom');
    const optionOnce = document.getElementById('optionOnce');
    const optionDaily = document.getElementById('optionDaily');
    const optionWeekday = document.getElementById('optionWeekday');
    const optionWeekend = document.getElementById('optionWeekend');
    const optionInterval = document.getElementById('optionInterval');
    
    if (optionWater) optionWater.textContent = t('reminderTypeWater');
    if (optionStandup) optionStandup.textContent = t('reminderTypeStandup');
    if (optionExercise) optionExercise.textContent = t('reminderTypeExercise');
    if (optionEye) optionEye.textContent = t('reminderTypeEye');
    if (optionCustom) optionCustom.textContent = t('reminderTypeCustom');
    if (optionOnce) optionOnce.textContent = t('repeatOnce');
    if (optionDaily) optionDaily.textContent = t('repeatDaily');
    if (optionWeekday) optionWeekday.textContent = t('repeatWeekday');
    if (optionWeekend) optionWeekend.textContent = t('repeatWeekend');
    if (optionInterval) optionInterval.textContent = t('repeatInterval');
    
    // 更新历史记录筛选器选项
    const filterAll = document.getElementById('filterAll');
    const filterWater = document.getElementById('filterWater');
    const filterStandup = document.getElementById('filterStandup');
    const filterExercise = document.getElementById('filterExercise');
    const filterEye = document.getElementById('filterEye');
    const filterCustom = document.getElementById('filterCustom');
    
    if (filterAll) filterAll.textContent = t('filterAll');
    if (filterWater) filterWater.textContent = t('reminderTypeWater');
    if (filterStandup) filterStandup.textContent = t('reminderTypeStandup');
    if (filterExercise) filterExercise.textContent = t('reminderTypeExercise');
    if (filterEye) filterEye.textContent = t('reminderTypeEye');
    if (filterCustom) filterCustom.textContent = t('reminderTypeCustom');
    
    console.log('UI text updated to:', getCurrentLanguage());
  } catch (error) {
    console.error('Error updating UI text:', error);
  }
}

// 更新提醒类型文本
function getReminderTypeText(type, customText) {
  const types = {
    water: t('reminderTypeWater'),
    standup: t('reminderTypeStandup'),
    exercise: t('reminderTypeExercise'),
    eye: t('reminderTypeEye'),
    custom: customText || t('reminderTypeCustom'),
  };
  return types[type] || type;
}

// 更新提醒消息
function getReminderMessage(type, note) {
  const messages = {
    water: t('msgWater'),
    standup: t('msgStandup'),
    exercise: t('msgExercise'),
    eye: t('msgEye'),
    custom: note || t('msgCustom'),
  };
  return messages[type] || t('msgCustom');
}

// 更新重复类型文本
function getRepeatText(repeatType) {
  const types = {
    once: t('repeatOnce'),
    daily: t('repeatDaily'),
    weekday: t('repeatWeekday'),
    weekend: t('repeatWeekend'),
    interval: t('repeatInterval'),
  };
  return types[repeatType] || repeatType;
}

// 更新激励文字
function updateMotivationText(remaining, total) {
  const progress = (total - remaining) / total;
  const motivationEl = document.getElementById('focusMotivation');
  
  if (progress < 0.25) {
    motivationEl.textContent = t('motivationStart');
  } else if (progress < 0.5) {
    motivationEl.textContent = t('motivationQuarter');
  } else if (progress < 0.75) {
    motivationEl.textContent = t('motivationHalf');
  } else if (progress < 0.9) {
    motivationEl.textContent = t('motivationThreeQuarter');
  } else {
    motivationEl.textContent = t('motivationAlmost');
  }
}
