const rcedit = require('rcedit');
const path = require('path');
const fs = require('fs');

const exePath = path.join(__dirname, 'release', 'Kitty Reminder-win32-x64', 'Kitty Reminder.exe');
const iconPath = path.join(__dirname, 'assets', 'cat.ico');

// 检查文件是否存在
if (!fs.existsSync(exePath)) {
  console.error('✗ EXE 文件不存在:', exePath);
  process.exit(1);
}

if (!fs.existsSync(iconPath)) {
  console.error('✗ 图标文件不存在:', iconPath);
  process.exit(1);
}

console.log('正在设置图标...');
console.log('EXE 路径:', exePath);
console.log('图标路径:', iconPath);

rcedit(exePath, {
  icon: iconPath,
  'version-string': {
    'ProductName': 'Kitty Reminder',
    'FileDescription': '可爱的小猫提醒应用 - 定时提醒喝水和起身活动',
    'CompanyName': '',
    'LegalCopyright': 'Copyright © 2025',
    'OriginalFilename': 'Kitty Reminder.exe',
    'ProductVersion': '1.0.0',
    'FileVersion': '1.0.0'
  }
})
.then(() => {
  console.log('✓ 图标和版本信息设置成功！');
  console.log('');
  console.log('请注意：');
  console.log('1. 如果图标没有立即显示，请刷新文件夹（F5）');
  console.log('2. 或者重启 Windows 资源管理器');
  console.log('3. Windows 可能会缓存图标，需要清除缓存才能看到新图标');
})
.catch((err) => {
  console.error('✗ 设置失败:', err);
  process.exit(1);
});
