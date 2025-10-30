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
};

// 倒计时和专注时间的状态
let countdownTimer = null;
let countdownRemaining = 0;
let focusTimer = null;
let focusRemaining = 25 * 60;
let focusMode = "work"; // 'work' or 'break'

// 初始化
document.addEventListener("DOMContentLoaded", () => {
  loadData();
  initEventListeners();
  updateStats();
  renderReminders();
  checkReminders();
  setInterval(checkReminders, 30000);

  // 初始化倒计时和专注时间
  initCountdown();
  initFocus();

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

  console.log("加载数据:", {
    reminders: savedReminders ? JSON.parse(savedReminders).length : 0,
    history: savedHistory ? JSON.parse(savedHistory).length : 0,
    settings: savedSettings ? "exists" : "none",
  });

  if (savedReminders) reminders = JSON.parse(savedReminders);
  if (savedHistory) history = JSON.parse(savedHistory);
  if (savedSettings) {
    settings = JSON.parse(savedSettings);
    if (settings.darkMode) {
      document.documentElement.classList.add("dark");
      document.getElementById("darkModeToggle").checked = true;
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

  // 根据音效开关状态显示/隐藏音效选择
  toggleSoundSelect();
}

// 保存数据
function saveData() {
  console.log("保存数据:", {
    reminders: reminders.length,
    history: history.length,
  });
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
      title: "提示",
      message: "请选择提醒时间",
      icon: "schedule",
      showCancel: false,
    });
    return;
  }

  if (type === "custom" && !customText) {
    showDialog({
      title: "提示",
      message: "请输入自定义内容",
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
      console.log('编辑提醒 ID:', editId, '当前总数:', reminders.length);
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
      console.log('编辑后总数:', reminders.length);
    } else {
      console.error('未找到要编辑的提醒 ID:', editId, '现有提醒:', reminders.map(r => r.id));
      showDialog({
        title: '错误',
        message: '未找到要编辑的提醒',
        icon: 'error',
        showCancel: false
      });
      return;
    }
  } else {
    // 新建模式：创建新提醒
    console.log('新建提醒，当前总数:', reminders.length);
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
    console.log('新建后总数:', reminders.length, '新ID:', reminder.id);
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
  console.log('渲染提醒列表，总数:', reminders.length, '数据:', reminders.map(r => ({id: r.id, type: r.type, enabled: r.enabled})));
  const list = document.getElementById("reminderList");

  if (reminders.length === 0) {
    list.innerHTML =
      '<div class="text-center py-12"><p class="text-[#9c7049] dark:text-gray-400 text-lg">暂无提醒，点击上方按钮创建吧！</p></div>';
    return;
  }

  list.innerHTML = reminders
    .map((r) => {
      const typeText = getReminderTypeText(r.type, r.customText);
      const timeText =
        r.repeatType === "interval" ? `每 ${r.intervalMinutes} 分钟` : r.time;
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

// 获取提醒类型文本
function getReminderTypeText(type, customText) {
  const types = {
    water: "喝水",
    standup: "起身活动",
    exercise: "运动",
    eye: "远眺放松",
    custom: customText || "自定义",
  };
  return types[type] || type;
}

// 获取重复类型文本
function getRepeatText(repeatType) {
  const types = {
    once: "仅一次",
    daily: "每天",
    weekday: "工作日",
    weekend: "周末",
    interval: "间隔重复",
  };
  return types[repeatType] || repeatType;
}

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
    console.log('切换提醒:', id, '状态:', enabled);
    saveData();
    renderReminders();
    updateStats();
  }
}

// 删除提醒
function deleteReminder(id) {
  showDialog({
    title: "删除提醒",
    message: "确定要删除这个提醒吗？",
    icon: "delete",
    confirmText: "删除",
    cancelText: "取消",
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
      triggerReminder(reminder);

      if (reminder.repeatType === "interval") {
        reminder.nextTrigger = new Date(
          now.getTime() + reminder.intervalMinutes * 60000
        ).toISOString();
      } else if (reminder.repeatType !== "once") {
        const [hours, minutes] = reminder.time.split(":").map(Number);
        const next = new Date();
        next.setDate(next.getDate() + 1);
        next.setHours(hours, minutes, 0, 0);
        reminder.nextTrigger = next.toISOString();
      } else {
        reminder.enabled = false;
      }

      reminder.lastTriggered = now.toISOString();
      saveData();
    }
  });
}

// 触发提醒
function triggerReminder(reminder) {
  const typeText = getReminderTypeText(reminder.type, reminder.customText);
  const messages = {
    water: "小猫提醒你要多喝水哦~",
    standup: "该起来走动走动啦！",
    exercise: "运动时间到，动起来吧！",
    eye: "保护眼睛，向远处望一望吧~",
    custom: reminder.note || "提醒时间到啦！",
  };

  const message = messages[reminder.type] || "提醒时间到啦！";

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
    const dateText = `${
      displayDate.getMonth() + 1
    }月${displayDate.getDate()}日`;
    list.innerHTML = `<div class="text-center py-12"><p class="text-[#9c7049] dark:text-gray-400 text-lg">${dateText} 暂无记录</p></div>`;
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
          ${h.status === "completed" ? "已完成" : "未完成"}
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
    title: "清空历史记录",
    message: "确定要清空所有历史记录吗？此操作不可恢复！",
    icon: "delete_sweep",
    confirmText: "清空",
    cancelText: "取消",
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
    title = "提示",
    message = "",
    icon = "info",
    confirmText = "确定",
    cancelText = "取消",
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
      title: "提示",
      message: "请设置倒计时时间",
      icon: "schedule",
      showCancel: false,
    });
    return;
  }

  countdownIsPaused = false;
  document.getElementById("countdownStartBtn").classList.add("hidden");
  document.getElementById("countdownPauseBtn").classList.remove("hidden");
  document.getElementById("countdownPauseBtn").innerHTML = '<span class="material-symbols-outlined">pause</span> 暂停';

  countdownTimer = setInterval(() => {
    countdownRemaining--;
    updateCountdownDisplay();

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
            body: '时间到！⏰',
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
      });
      
      resetCountdown();
    }
  }, 1000);
}

function pauseCountdown() {
  if (countdownTimer) {
    clearInterval(countdownTimer);
    countdownTimer = null;
    countdownIsPaused = true;
    document.getElementById("countdownPauseBtn").innerHTML = '<span class="material-symbols-outlined">play_arrow</span> 继续';
  }
}

function resumeCountdown() {
  countdownIsPaused = false;
  document.getElementById("countdownPauseBtn").innerHTML = '<span class="material-symbols-outlined">pause</span> 暂停';
  
  countdownTimer = setInterval(() => {
    countdownRemaining--;
    updateCountdownDisplay();

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
            body: '时间到！⏰',
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
      });
      
      resetCountdown();
    }
  }, 1000);
}

function resetCountdown() {
  if (countdownTimer) {
    clearInterval(countdownTimer);
    countdownTimer = null;
  }
  countdownIsPaused = false;
  countdownRemaining = 0;
  document.getElementById("countdownDisplay").textContent = "00:00:00";
  document.getElementById("countdownStartBtn").classList.remove("hidden");
  document.getElementById("countdownPauseBtn").classList.add("hidden");
  document.getElementById("countdownPauseBtn").innerHTML = '<span class="material-symbols-outlined">pause</span> 暂停';
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

// ========== 专注时间功能（重写） ==========
let focusTotalTime = 25 * 60;

// 删除旧的专注时间代码，使用新版本
/*
function initFocus() {
  document
    .getElementById("focusStartBtn")
    .addEventListener("click", startFocus);
  document
    .getElementById("focusPauseBtn")
    .addEventListener("click", pauseFocus);
  document
    .getElementById("focusResetBtn")
    .addEventListener("click", resetFocus);

  document.querySelectorAll(".focus-preset").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      const minutes = parseInt(e.currentTarget.dataset.minutes);
      focusRemaining = minutes * 60;
      updateFocusDisplay();
    });
  });

  updateFocusDisplay();
}

function startFocus() {
  if (focusTimer) return;

  document.getElementById("focusStartBtn").classList.add("hidden");
  document.getElementById("focusPauseBtn").classList.remove("hidden");
  document.getElementById("focusStatus").textContent =
    focusMode === "work" ? "专注中..." : "休息中...";

  focusTimer = setInterval(() => {
    focusRemaining--;
    updateFocusDisplay();

    if (focusRemaining <= 0) {
      clearInterval(focusTimer);
      focusTimer = null;
      playNotificationSound();

      if (focusMode === "work") {
        showDialog({
          title: "专注时间结束",
          message: "做得好！该休息一下了",
          icon: "celebration",
          showCancel: false,
          onConfirm: () => {
            focusMode = "break";
            focusRemaining = 5 * 60;
            updateFocusDisplay();
          },
        });
      } else {
        showDialog({
          title: "休息时间结束",
          message: "准备好开始下一轮专注了吗？",
          icon: "psychology",
          showCancel: false,
          onConfirm: () => {
            focusMode = "work";
            focusRemaining = 25 * 60;
            updateFocusDisplay();
          },
        });
      }

      resetFocus();
    }
  }, 1000);
}

function pauseFocus() {
  if (focusTimer) {
    clearInterval(focusTimer);
    focusTimer = null;
    document.getElementById("focusStartBtn").classList.remove("hidden");
    document.getElementById("focusPauseBtn").classList.add("hidden");
    document.getElementById("focusStatus").textContent = "已暂停";
  }
}

function resetFocus() {
  if (focusTimer) {
    clearInterval(focusTimer);
    focusTimer = null;
  }
  focusMode = "work";
  focusRemaining = 25 * 60;
  updateFocusDisplay();
  document.getElementById("focusStartBtn").classList.remove("hidden");
  document.getElementById("focusPauseBtn").classList.add("hidden");
  document.getElementById("focusStatus").textContent = "准备开始专注";
}

function updateFocusDisplay() {
  const minutes = Math.floor(focusRemaining / 60);
  const seconds = focusRemaining % 60;

  document.getElementById("focusDisplay").textContent = `${String(
    minutes
  ).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

*/

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
    dialogTitle.textContent = '自定义专注时间';
    dialogIcon.textContent = 'schedule';
    confirmBtn.textContent = '确定';
    cancelBtn.textContent = '取消';
    cancelBtn.style.display = 'block';

    // 创建输入框
    dialogMessage.innerHTML = `
      <p class="mb-4">请输入专注时间（1-180分钟）</p>
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
  document.getElementById('focusActiveStatus').textContent = '专注中...';
  
  // 重置暂停按钮状态
  focusIsPaused = false;
  document.getElementById('focusActivePauseBtn').innerHTML = '<span class="material-symbols-outlined">pause</span> 暂停';
  
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
            body: '做得好！完成了一次专注 🎉',
            reminderId: Date.now(),
            playSound: false,
            icon: 'assets/image/focus.png'
          });
        }
      }
      
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
    document.getElementById('focusActiveStatus').textContent = '已暂停';
    document.getElementById('focusActivePauseBtn').innerHTML = '<span class="material-symbols-outlined">play_arrow</span> 继续';
  }
}

function resumeFocus() {
  focusIsPaused = false;
  document.getElementById('focusActiveStatus').textContent = '专注中...';
  document.getElementById('focusActivePauseBtn').innerHTML = '<span class="material-symbols-outlined">pause</span> 暂停';
  
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
            body: '做得好！完成了一次专注 🎉',
            reminderId: Date.now(),
            playSound: false,
            icon: 'assets/image/focus.png'
          });
        }
      }
      
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
  circle.style.strokeDashoffset = 879.6; // 完全重置
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
}

function updateFocusProgress() {
  const circle = document.getElementById('focusProgressCircle');
  const circumference = 2 * Math.PI * 140; // 2πr
  const progress = focusRemaining / focusTotalTime;
  const offset = circumference * (1 - progress);
  circle.style.strokeDashoffset = offset;
}
