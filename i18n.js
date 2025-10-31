// 国际化配置
const translations = {
  'en-US': {
    // 应用标题
    appTitle: 'Kitty Reminder - 小猫提醒',
    appSubtitle: '健康生活 · 高效专注',
    
    // 导航
    navReminders: '提醒事项',
    navFocus: '专注时间',
    navCountdown: '倒计时',
    navHistory: '历史记录',
    navSettings: '设置',
    navAbout: '关于',
    
    // 提醒页面
    remindersTitle: '今日提醒',
    remindersSubtitle: '管理你的健康提醒',
    btnNewReminder: '新建提醒',
    noReminders: '暂无提醒，点击上方按钮创建吧！',
    
    // 倒计时页面
    countdownTitle: '倒计时',
    countdownSubtitle: '设置倒计时提醒',
    countdownStatus: '倒计时中...',
    countdownPaused: '已暂停',
    labelHours: '小时',
    labelMinutes: '分钟',
    labelSeconds: '秒',
    btnStart: '开始',
    btnPause: '暂停',
    btnResume: '继续',
    btnReset: '重置',
    btnStop: '结束',
    
    // 专注时间页面
    focusTitle: '专注时间',
    focusSubtitle: '番茄工作法 - 保持专注',
    focusStatus: '准备开始专注',
    focusStatusActive: '专注中...',
    focusStatusPaused: '已暂停',
    btnStartFocus: '开始专注',
    btnCustom: '自定义',
    
    // 激励文字
    motivationStart: '很好的开始，保持专注！',
    motivationQuarter: '做得很棒，继续加油！',
    motivationHalf: '已经过半了，坚持住！',
    motivationThreeQuarter: '马上就要完成了！',
    motivationAlmost: '最后冲刺，胜利在望！',
    
    // 历史记录页面
    historyTitle: '历史记录',
    historySubtitle: '查看过往提醒记录',
    historyFilter: '筛选',
    historyDate: '日期',
    historyNoRecords: '暂无记录',
    historyCompleted: '已完成',
    historyMissed: '未完成',
    
    // 设置页面
    settingsTitle: '设置',
    settingsSubtitle: '管理你的提醒偏好',
    
    // 设置 - 通用
    settingsGeneral: '通用设置',
    settingDefaultInterval: '默认提醒间隔',
    settingDefaultIntervalDesc: '设置默认的提醒时间间隔',
    
    // 设置 - 通知
    settingsNotification: '通知设置',
    settingEnableNotification: '桌面通知',
    settingEnableNotificationDesc: '显示系统通知',
    settingEnableSound: '提醒音效',
    settingEnableSoundDesc: '播放提醒声音',
    settingSelectSound: '选择音效',
    settingSelectSoundDesc: '选择通知声音',
    
    // 设置 - 外观
    settingsAppearance: '外观设置',
    settingDarkMode: '深色模式',
    settingDarkModeDesc: '使用深色主题',
    settingLanguage: '语言',
    settingLanguageDesc: '选择界面语言',
    languageZhCN: '简体中文',
    languageEnUS: 'English',
    
    // 设置 - 数据
    settingsData: '数据设置',
    settingClearHistory: '清空历史记录',
    settingClearHistoryDesc: '永久删除所有提醒历史',
    btnClearHistory: '清空历史',
    
    // 关于页面
    aboutTitle: '关于 Kitty Reminder',
    aboutVersion: '版本',
    aboutDescription: '健康生活助手 · 专注时间管理',
    aboutSubDescription: '让每一刻都充满价值',
    
    // 提醒类型
    reminderTypeWater: '喝水',
    reminderTypeStandup: '起身活动',
    reminderTypeExercise: '运动',
    reminderTypeEye: '远眺放松',
    reminderTypeCustom: '自定义',
    
    // 提醒消息
    msgWater: '小猫提醒你要多喝水哦~',
    msgStandup: '该起来走动走动啦！',
    msgExercise: '运动时间到，动起来吧！',
    msgEye: '保护眼睛，向远处望一望吧~',
    msgCustom: '提醒时间到啦！',
    
    // 重复类型
    repeatOnce: '仅一次',
    repeatDaily: '每天',
    repeatWeekday: '工作日',
    repeatWeekend: '周末',
    repeatInterval: '间隔重复',
    
    // 对话框
    dialogTitle: '提示',
    dialogConfirm: '确定',
    dialogCancel: '取消',
    dialogDelete: '删除',
    
    // 提示消息
    msgSetTime: '请选择提醒时间',
    msgSetCustomText: '请输入自定义内容',
    msgDeleteReminder: '确定要删除这个提醒吗？',
    msgClearHistory: '确定要清空所有历史记录吗？此操作不可恢复！',
    msgCountdownEnd: '时间到！',
    msgFocusEnd: '做得好！完成了一次专注',
    msgNotFoundReminder: '未找到要编辑的提醒',
    
    // 新建/编辑提醒
    modalNewReminder: '新建提醒',
    modalEditReminder: '编辑提醒',
    labelReminderType: '提醒类型',
    labelCustomText: '自定义内容',
    labelTime: '时间',
    labelRepeatType: '重复',
    labelInterval: '间隔（分钟）',
    labelNote: '备注',
    btnSave: '保存',
    btnClose: '关闭',
    
    // 统计
    statCompleted: '已完成',
    statPending: '待完成',
    statElapsed: '已专注',
    statRemaining: '剩余时间',
    
    // 单位
    unitMinutes: '分钟',
    unitEvery: '每',
  },
  
  'en-US': {
    // App title
    appTitle: 'Kitty Reminder',
    appSubtitle: 'Healthy Living · Focused Productivity',
    
    // Navigation
    navReminders: 'Reminders',
    navFocus: 'Focus Time',
    navCountdown: 'Countdown',
    navHistory: 'History',
    navSettings: 'Settings',
    navAbout: 'About',
    
    // Reminders page
    remindersTitle: 'Today\'s Reminders',
    remindersSubtitle: 'Manage your health reminders',
    btnNewReminder: 'New Reminder',
    noReminders: 'No reminders yet. Click the button above to create one!',
    
    // Countdown page
    countdownTitle: 'Countdown',
    countdownSubtitle: 'Set countdown timer',
    countdownStatus: 'Counting down...',
    countdownPaused: 'Paused',
    labelHours: 'Hours',
    labelMinutes: 'Minutes',
    labelSeconds: 'Seconds',
    btnStart: 'Start',
    btnPause: 'Pause',
    btnResume: 'Resume',
    btnReset: 'Reset',
    btnStop: 'Stop',
    
    // Focus time page
    focusTitle: 'Focus Time',
    focusSubtitle: 'Pomodoro Technique - Stay Focused',
    focusStatus: 'Ready to focus',
    focusStatusActive: 'Focusing...',
    focusStatusPaused: 'Paused',
    btnStartFocus: 'Start Focus',
    btnCustom: 'Custom',
    
    // Motivation messages
    motivationStart: 'Great start, stay focused!',
    motivationQuarter: 'Doing great, keep it up!',
    motivationHalf: 'Halfway there, keep going!',
    motivationThreeQuarter: 'Almost done!',
    motivationAlmost: 'Final push, victory ahead!',
    
    // History page
    historyTitle: 'History',
    historySubtitle: 'View past reminder records',
    historyFilter: 'Filter',
    historyDate: 'Date',
    historyNoRecords: 'No records',
    historyCompleted: 'Completed',
    historyMissed: 'Missed',
    
    // Settings page
    settingsTitle: 'Settings',
    settingsSubtitle: 'Manage your reminder preferences',
    
    // Settings - General
    settingsGeneral: 'General',
    settingDefaultInterval: 'Default Interval',
    settingDefaultIntervalDesc: 'Set default reminder interval',
    settingAutoStart: 'Auto Start',
    settingAutoStartDesc: 'Start automatically on system boot',
    
    // Settings - Notification
    settingsNotification: 'Notifications',
    settingEnableNotification: 'Desktop Notifications',
    settingEnableNotificationDesc: 'Show system notifications',
    settingEnableSound: 'Sound Effects',
    settingEnableSoundDesc: 'Play notification sounds',
    settingSelectSound: 'Select Sound',
    settingSelectSoundDesc: 'Choose notification sound',
    
    // Settings - Appearance
    settingsAppearance: 'Appearance',
    settingDarkMode: 'Dark Mode',
    settingDarkModeDesc: 'Use dark theme',
    settingLanguage: 'Language',
    settingLanguageDesc: 'Select interface language',
    languageZhCN: '简体中文',
    languageEnUS: 'English',
    
    // Settings - Data
    settingsData: 'Data',
    settingClearHistory: 'Clear History',
    settingClearHistoryDesc: 'Permanently delete all reminder history',
    btnClearHistory: 'Clear History',
    settingShowWindow: 'Show Window on Click',
    settingShowWindowDesc: 'Automatically open main window after clicking notification',
    
    // Sound options
    sound1: 'Sound 1',
    sound2: 'Sound 2',
    sound3: 'Sound 3',
    sound4: 'Sound 4',
    sound5: 'Sound 5',
    sound6: 'Sound 6',
    sound7: 'Sound 7',
    sound8: 'Sound 8',
    
    // Custom focus dialog
    customFocusTime: 'Custom Focus Time',
    customFocusPrompt: 'Enter focus time (1-180 minutes)',
    
    // About page
    aboutTitle: 'About Kitty Reminder',
    aboutVersion: 'Version',
    aboutDescription: 'Healthy Living Assistant · Focus Time Management',
    aboutSubDescription: 'Make every moment count',
    aboutFeaturesTitle: 'Features',
    aboutFeature1: 'Smart Reminders - Timely reminders for water, breaks, and exercise',
    aboutFeature2: 'Focus Time - Pomodoro Technique for efficient focus',
    aboutFeature3: 'Countdown - Flexible time management tool',
    aboutFeature4: 'History - Track your healthy habits',
    aboutFeature5: 'System Tray - Run in background without distraction',
    
    // History filter
    filterAll: 'All Types',
    
    // Reminder types
    reminderTypeWater: 'Drink Water',
    reminderTypeStandup: 'Take a Break',
    reminderTypeExercise: 'Exercise',
    reminderTypeEye: 'Eye Protection',
    reminderTypeCustom: 'Custom',
    
    // Reminder messages
    msgWater: 'Time to drink some water!',
    msgStandup: 'Time to stand up and move around!',
    msgExercise: 'Time to exercise!',
    msgEye: 'Time to rest your eyes!',
    msgCustom: 'Reminder time!',
    
    // Repeat types
    repeatOnce: 'Once',
    repeatDaily: 'Daily',
    repeatWeekday: 'Weekdays',
    repeatWeekend: 'Weekends',
    repeatInterval: 'Interval',
    
    // Dialogs
    dialogTitle: 'Notice',
    dialogConfirm: 'Confirm',
    dialogCancel: 'Cancel',
    dialogDelete: 'Delete',
    
    // Messages
    msgSetTime: 'Please set reminder time',
    msgSetCustomText: 'Please enter custom text',
    msgDeleteReminder: 'Are you sure you want to delete this reminder?',
    msgClearHistory: 'Are you sure you want to clear all history? This cannot be undone!',
    msgCountdownEnd: 'Time\'s up!',
    msgFocusEnd: 'Well done! Focus session completed',
    msgNotFoundReminder: 'Reminder not found',
    
    // New/Edit reminder
    modalNewReminder: 'New Reminder',
    modalEditReminder: 'Edit Reminder',
    labelReminderType: 'Type',
    labelCustomText: 'Custom Text',
    labelTime: 'Time',
    labelRepeatType: 'Repeat',
    labelInterval: 'Interval (minutes)',
    labelNote: 'Note',
    btnSave: 'Save',
    btnClose: 'Close',
    
    // Statistics
    statCompleted: 'Completed',
    statPending: 'Pending',
    statElapsed: 'Elapsed',
    statRemaining: 'Remaining',
    
    // Units
    unitMinutes: 'minutes',
    unitEvery: 'Every',
    
    // Additional UI elements
    labelHour: 'Hour',
    labelMinute: 'Minute',
    labelSecond: 'Second',
    todayCompleted: 'Completed Today',
    todayPending: 'Pending Today',
    customTime: 'Custom',
  },
  
  'zh-CN': {
    // 应用标题
    appTitle: 'Kitty Reminder - 小猫提醒',
    appSubtitle: '健康生活 · 高效专注',
    
    // 导航
    navReminders: '提醒事项',
    navFocus: '专注时间',
    navCountdown: '倒计时',
    navHistory: '历史记录',
    navSettings: '设置',
    navAbout: '关于',
    
    // 提醒页面
    remindersTitle: '今日提醒',
    remindersSubtitle: '管理你的健康提醒',
    btnNewReminder: '新建提醒',
    noReminders: '暂无提醒，点击上方按钮创建吧！',
    
    // 倒计时页面
    countdownTitle: '倒计时',
    countdownSubtitle: '设置倒计时提醒',
    countdownStatus: '倒计时中...',
    countdownPaused: '已暂停',
    labelHours: '小时',
    labelMinutes: '分钟',
    labelSeconds: '秒',
    btnStart: '开始',
    btnPause: '暂停',
    btnResume: '继续',
    btnReset: '重置',
    btnStop: '结束',
    
    // 专注时间页面
    focusTitle: '专注时间',
    focusSubtitle: '番茄工作法 - 保持专注',
    focusStatus: '准备开始专注',
    focusStatusActive: '专注中...',
    focusStatusPaused: '已暂停',
    btnStartFocus: '开始专注',
    btnCustom: '自定义',
    
    // 激励文字
    motivationStart: '很好的开始，保持专注！',
    motivationQuarter: '做得很棒，继续加油！',
    motivationHalf: '已经过半了，坚持住！',
    motivationThreeQuarter: '马上就要完成了！',
    motivationAlmost: '最后冲刺，胜利在望！',
    
    // 历史记录页面
    historyTitle: '历史记录',
    historySubtitle: '查看过往提醒记录',
    historyFilter: '筛选',
    historyDate: '日期',
    historyNoRecords: '暂无记录',
    historyCompleted: '已完成',
    historyMissed: '未完成',
    
    // 设置页面
    settingsTitle: '设置',
    settingsSubtitle: '管理你的提醒偏好',
    
    // 设置 - 通用
    settingsGeneral: '通用设置',
    settingDefaultInterval: '默认提醒间隔',
    settingDefaultIntervalDesc: '设置默认的提醒时间间隔',
    
    // 设置 - 通知
    settingsNotification: '通知设置',
    settingEnableNotification: '桌面通知',
    settingEnableNotificationDesc: '显示系统通知',
    settingEnableSound: '提醒音效',
    settingEnableSoundDesc: '播放提醒声音',
    settingSelectSound: '选择音效',
    settingSelectSoundDesc: '选择通知声音',
    
    // 设置 - 外观
    settingsAppearance: '外观设置',
    settingDarkMode: '深色模式',
    settingDarkModeDesc: '使用深色主题',
    settingLanguage: '语言',
    settingLanguageDesc: '选择界面语言',
    languageZhCN: '简体中文',
    languageEnUS: 'English',
    
    // 设置 - 数据
    settingsData: '数据设置',
    settingClearHistory: '清空历史记录',
    settingClearHistoryDesc: '永久删除所有提醒历史',
    btnClearHistory: '清空历史',
    
    // 关于页面
    aboutTitle: '关于 Kitty Reminder',
    aboutVersion: '版本',
    aboutDescription: '健康生活助手 · 专注时间管理',
    aboutSubDescription: '让每一刻都充满价值',
    
    // 提醒类型
    reminderTypeWater: '喝水',
    reminderTypeStandup: '起身活动',
    reminderTypeExercise: '运动',
    reminderTypeEye: '远眺放松',
    reminderTypeCustom: '自定义',
    
    // 提醒消息
    msgWater: '小猫提醒你要多喝水哦~',
    msgStandup: '该起来走动走动啦！',
    msgExercise: '运动时间到，动起来吧！',
    msgEye: '保护眼睛，向远处望一望吧~',
    msgCustom: '提醒时间到啦！',
    
    // 重复类型
    repeatOnce: '仅一次',
    repeatDaily: '每天',
    repeatWeekday: '工作日',
    repeatWeekend: '周末',
    repeatInterval: '间隔重复',
    
    // 对话框
    dialogTitle: '提示',
    dialogConfirm: '确定',
    dialogCancel: '取消',
    dialogDelete: '删除',
    
    // 提示消息
    msgSetTime: '请选择提醒时间',
    msgSetCustomText: '请输入自定义内容',
    msgDeleteReminder: '确定要删除这个提醒吗？',
    msgClearHistory: '确定要清空所有历史记录吗？此操作不可恢复！',
    msgCountdownEnd: '时间到！',
    msgFocusEnd: '做得好！完成了一次专注',
    msgNotFoundReminder: '未找到要编辑的提醒',
    
    // 新建/编辑提醒
    modalNewReminder: '新建提醒',
    modalEditReminder: '编辑提醒',
    labelReminderType: '提醒类型',
    labelCustomText: '自定义内容',
    labelTime: '时间',
    labelRepeatType: '重复',
    labelInterval: '间隔（分钟）',
    labelNote: '备注',
    btnSave: '保存',
    btnClose: '关闭',
    
    // 统计
    statCompleted: '已完成',
    statPending: '待完成',
    statElapsed: '已专注',
    statRemaining: '剩余时间',
    todayCompleted: '今日完成',
    todayPending: '待完成',
    
    // 单位
    unitMinutes: '分钟',
    unitEvery: '每',
    labelHour: '小时',
    labelMinute: '分钟',
    labelSecond: '秒',
    customTime: '自定义',
  }
};

// 当前语言 - 默认英文
let currentLanguage = 'en-US';

// 获取翻译文本
function t(key) {
  return translations[currentLanguage][key] || key;
}

// 切换语言
function setLanguage(lang) {
  currentLanguage = lang;
  localStorage.setItem('language', lang);
  if (typeof updateUIText === 'function') {
    updateUIText();
  }
}

// 获取当前语言
function getCurrentLanguage() {
  return currentLanguage;
}

// 初始化语言
function initLanguage() {
  // 从 localStorage 读取保存的语言
  const savedLang = localStorage.getItem('language');
  if (savedLang && translations[savedLang]) {
    currentLanguage = savedLang;
  } else {
    // 检测系统语言
    const systemLang = navigator.language || navigator.userLanguage;
    if (systemLang.startsWith('zh')) {
      currentLanguage = 'zh-CN';
    } else {
      currentLanguage = 'en-US';
    }
    // 保存检测到的语言
    localStorage.setItem('language', currentLanguage);
  }
}

// 更新 UI 文本
function updateUI() {
  // 更新所有带 data-i18n 属性的元素
  document.querySelectorAll('[data-i18n]').forEach(element => {
    const key = element.getAttribute('data-i18n');
    element.textContent = t(key);
  });
  
  // 更新所有带 data-i18n-placeholder 属性的元素
  document.querySelectorAll('[data-i18n-placeholder]').forEach(element => {
    const key = element.getAttribute('data-i18n-placeholder');
    element.placeholder = t(key);
  });
  
  // 更新标题
  document.title = t('appTitle');
}

// 导出函数
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { t, setLanguage, getCurrentLanguage, initLanguage, updateUI };
}


// ========== 临时翻译补充（需要手动合并到上面的对应位置） ==========
/*
需要在第一个 'en-US' 和 'zh-CN' 部分的 btnClearHistory 后添加：

    settingShowWindow: '点击通知时显示窗口',
    settingShowWindowDesc: '点击通知后自动打开主窗口',
    
    // 音效选项
    sound1: '音效 1',
    sound2: '音效 2',
    sound3: '音效 3',
    sound4: '音效 4',
    sound5: '音效 5',
    sound6: '音效 6',
    sound7: '音效 7',
    sound8: '音效 8',

需要在 aboutSubDescription 后添加：

    aboutFeaturesTitle: '功能特性',
    aboutFeature1: '智能提醒 - 定时提醒喝水、起身、运动',
    aboutFeature2: '专注时间 - 番茄工作法，保持高效专注',
    aboutFeature3: '倒计时 - 灵活的时间管理工具',
    aboutFeature4: '历史记录 - 追踪你的健康习惯',

需要在 settingDefaultIntervalDesc 后添加：

    settingAutoStart: '开机自启动',
    settingAutoStartDesc: '系统启动时自动运行',
*/
