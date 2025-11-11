# 🐱 Kitty Reminder

A cute desktop reminder app to help you stay healthy and productive! Get gentle reminders from adorable cats to drink water, take breaks, stretch, and protect your eyes.

![Kitty Reminder](assets/cat.png)

## ✨ Features

- 💧 **Smart Reminders** - Water, breaks, stretching, and eye protection reminders
- ⏱️ **Countdown Timer** - Simple timer with pause/resume
- 🍅 **Focus Time** - Pomodoro timer with beautiful animations
- 🔔 **Custom Notifications** - 8 different sound effects to choose from
- 🎨 **Beautiful UI** - Clean interface with warm orange theme
- 🖥️ **System Tray** - Runs quietly in the background

## 📥 Download

Download the latest version for your platform from the [Releases page](https://github.com/sunheihei/kitty-reminder/releases).

### Windows
Download the `.exe` installer and run it.

### macOS
1. Download the `.dmg` file (choose `arm64` for Apple Silicon or `x64` for Intel)
2. Open the DMG and drag the app to Applications folder
3. **Important:** If you see "App is damaged" error, run this command in Terminal:
   ```bash
   sudo xattr -cr /Applications/Kitty\ Reminder.app
   ```
   Then try opening the app again.

### Linux
Download the `.AppImage` or `.deb` file and install it.

## 🛠️ Development

```bash
# Clone and install
git clone https://github.com/yourusername/kitty-reminder.git
cd kitty-reminder
npm install

# Run
npm start

# Build
npm run build:dmg     # macOS DMG
npm run build:all     # All platforms
```

## 🚀 Release New Version

See [RELEASE_COMMANDS.md](RELEASE_COMMANDS.md) for quick reference.

```bash
# 1. Update version in package.json
# 2. Run these commands:
git add .
git commit -m "chore: release v1.0.1"
git push
git tag v1.0.1
git push origin v1.0.1
```

## 🤝 Contributing

Contributions welcome! See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

## 📝 License

ISC License

---

Made with ❤️ and 🐱
