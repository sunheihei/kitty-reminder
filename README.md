# 🐱 Kitty Reminder

A cute and friendly desktop reminder app to help you stay healthy and productive! Get gentle reminders from adorable cats to drink water, take breaks, stretch, and protect your eyes.

![Kitty Reminder](assets/cat.png)

## ✨ Features

### 📝 Smart Reminders

- **Customizable Reminders**: Create multiple reminders with custom intervals
- **Four Reminder Types**:
  - 💧 Drink Water - Stay hydrated throughout the day
  - 🚶 Take a Break - Get up and move around
  - 🤸 Stretch - Keep your body flexible
  - 👁️ Eye Protection - Rest your eyes regularly
- **Individual Toggle Controls**: Enable/disable specific reminders without deleting them
- **Persistent Storage**: Your reminders are saved automatically

### 🔔 Notifications

- **Native Desktop Notifications**: Cross-platform support (Windows/macOS/Linux)
- **Custom Notification Sounds**: Choose from 8 different cute sound effects
- **Type-Specific Icons**: Each reminder type has its own adorable cat icon

### ⏱️ Countdown Timer

- Simple countdown timer for quick tasks
- Pause and resume functionality
- Visual progress indicator
- Sound notification when time's up

### 🍅 Focus Time (Pomodoro)

- Built-in Pomodoro timer for focused work sessions
- Beautiful circular progress animation with ripple effects
- Customizable work duration
- Pause/resume support
- Completion notifications

### 🎨 Beautiful UI

- Clean and modern interface with Tailwind CSS
- Warm orange theme with smooth animations
- Material Design icons
- System tray integration for easy access
- Minimalist design that stays out of your way

## 🚀 Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn

### Installation

1. Clone the repository:

```bash
git clone https://github.com/yourusername/kitty-reminder.git
cd kitty-reminder
```

2. Install dependencies:

```bash
npm install
```

3. Run the app:

```bash
npm start
```

## 📦 Building

To package the app for distribution:

```bash
npm install electron-builder --save-dev
npm run build
```

## 🎮 Usage

### Creating a Reminder

1. Click on "Reminders" in the sidebar
2. Fill in the reminder details:
   - Name: What to remind you about
   - Interval: How often (in minutes)
   - Type: Choose from Water, Break, Stretch, or Eye Protection
3. Click "Add Reminder"

### Managing Reminders

- **Toggle**: Use the switch to enable/disable a reminder
- **Edit**: Click the edit icon to modify reminder details
- **Delete**: Click the trash icon to remove a reminder

### Using the Countdown Timer

1. Click on "Countdown" in the sidebar
2. Enter the duration in minutes
3. Click "Start" to begin
4. Use "Pause" to pause and "Resume" to continue

### Using Focus Time

1. Click on "Focus Time" in the sidebar
2. Set your work duration (default: 25 minutes)
3. Click "Start Focus" to begin your Pomodoro session
4. Stay focused until the timer completes!

## 🔧 Configuration

### Notification Sounds

The app includes 8 different notification sounds located in `assets/noti/`:

- noti1.mp3 through noti8.mp3

You can customize sounds by replacing these files with your own (keep the same filenames).

### Reminder Icons

Custom cat icons for each reminder type are in `assets/image/`:

- cat-water.png
- cat-break.png
- cat-stretch.png
- cat-eye.png

## 🛠️ Tech Stack

- **Electron**: Cross-platform desktop app framework
- **Tailwind CSS**: Utility-first CSS framework
- **Material Icons**: Icon library
- **JavaScript**: Vanilla JS for simplicity and performance

## 📁 Project Structure

```
kitty-reminder/
├── main.js              # Electron main process
├── index.html           # Main HTML file
├── renderer.js          # Renderer process logic
├── package.json         # Project configuration
├── assets/
│   ├── cat.png         # App icon
│   ├── image/          # Reminder type icons
│   └── noti/           # Notification sounds
└── README.md
```

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request. For major changes, please open an issue first to discuss what you would like to change.

1. Fork the project
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the ISC License - see the LICENSE file for details.

## 🙏 Acknowledgments

- Cat illustrations and icons
- Notification sound effects
- Electron community for excellent documentation
- All contributors who help improve this project

## 📧 Contact

Project Link: [https://github.com/yourusername/kitty-reminder](https://github.com/yourusername/kitty-reminder)

---

Made with ❤️ and 🐱 for a healthier, more productive you!
