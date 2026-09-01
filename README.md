# Daily Tasks — Android-First Task App

A clean, fast, reliable, offline-first mobile task management application designed for Android phones and touch interaction, built with **React Native**, **Expo (Expo Router)**, **TypeScript**, and **AsyncStorage**.

---

## 📱 Features

- **3 Main Pages (Bottom Navigation)**:
  - **Tasks**: Dynamic date sections (*Overdue*, *Today*, *Tomorrow*, *Upcoming*, *Completed*), instant search, and Floating Action Button (+).
  - **Progress**: Daily completion %, tasks created vs. completed, weekly Mon–Sun performance bars, monthly rate, current streak (🔥), best streak, and total completed count.
  - **Settings**: Light/Dark/System theme switcher, local notification preferences, default categories & priorities, JSON data export, and cleanup tools.
- **Task Management**:
  - Task title (required validation) & optional multiline notes.
  - Due date (Today, Tomorrow, or native Android calendar picker).
  - Time & All-Day toggle with 12/24-hour time selector.
  - Reminders: Android local notification alarms (At time, 5m, 10m, 30m, 1h, Custom) without requiring internet.
  - Recurring tasks: Daily, Weekly (with day-of-week selection), Monthly, or Custom intervals. Generates next occurrence on completion without duplicates.
  - Lists / Categories: Personal, Work, Study, Shopping (plus custom categories).
  - Priority: Normal vs. Important (subtle star badge and accent border).
  - Subtasks: Inline add, toggle completion with progress indicator (e.g. `2/3`), and delete.
  - Completed history: Tasks remain in history with completion timestamp, allowing uncompleting, editing, or manual cleanup.
  - Undo deletion: Instant toast notification allowing undo when a task is deleted.
- **Offline & Cloud-Ready Architecture**:
  - Abstract storage repository interface (`ITaskRepository`, `ISettingsRepository`) implemented with `AsyncStorage`, making it seamless to plug in Supabase or Firebase.

---

## 📂 Project Structure

```
android-task-app/
├── app/
│   ├── _layout.tsx              # Root Stack & Theme/Paper/Task Providers
│   ├── (tabs)/
│   │   ├── _layout.tsx          # Bottom Tab Navigation (Tasks | Progress | Settings)
│   │   ├── index.tsx            # Tasks Screen (Sections, Search, FAB, Undo)
│   │   ├── progress.tsx         # Progress Screen (Streaks, Completion %, Weekly chart)
│   │   └── settings.tsx         # Settings Screen (Theme, Notifications, Data)
│   └── task/
│       ├── create.tsx           # Create Task Modal Screen
│       └── [id].tsx             # Edit Task Modal Screen
├── src/
│   ├── types/
│   │   ├── task.ts              # Task, Subtask, RepeatRule, ReminderRule types
│   │   └── settings.ts          # Settings & Category types
│   ├── constants/
│   │   ├── theme.ts             # Light & Dark Material Design 3 palettes
│   │   └── categories.ts        # Default task categories
│   ├── services/
│   │   ├── storage/
│   │   │   ├── ITaskRepository.ts
│   │   │   ├── AsyncStorageTaskRepository.ts
│   │   │   ├── ISettingsRepository.ts
│   │   │   └── AsyncStorageSettingsRepository.ts
│   │   ├── notifications/
│   │   │   └── NotificationService.ts # Android Local Alarms & Channels
│   │   └── tasks/
│   │       ├── TaskLogic.ts     # Date grouping, recurrence engine, search
│   │       └── StreakCalculator.ts # Streaks & weekly/monthly metrics
│   ├── context/
│   │   ├── ThemeContext.tsx     # Theme switcher
│   │   ├── SettingsContext.tsx  # User preferences
│   │   └── TaskContext.tsx      # Central task state & actions
│   ├── components/
│   │   ├── TaskItem.tsx         # Task card with animated checkbox & pills
│   │   ├── TaskList.tsx         # SectionList with section headers & badges
│   │   ├── SearchBar.tsx        # Fast search with clear button
│   │   ├── EmptyState.tsx       # Placeholder view
│   │   ├── DateSelector.tsx     # Native Android date picker
│   │   ├── TimeSelector.tsx     # Native Android time picker & all-day toggle
│   │   ├── ReminderSelector.tsx # Presets + custom minutes selector
│   │   ├── RepeatSelector.tsx   # Recurrence settings with day picker
│   │   ├── CategorySelector.tsx # Horizontal list chips
│   │   ├── PrioritySelector.tsx # Segmented normal/important toggle
│   │   ├── SubtaskList.tsx      # Inline subtasks editor
│   │   ├── ProgressChart.tsx    # Today ring, weekly bars, monthly stats
│   │   ├── StreakCard.tsx       # Fire streak card & trophy
│   │   └── ConfirmationModal.tsx# Native dialog for delete actions
│   └── utils/
│       └── dateUtils.ts         # Formatting & date calculations
├── test/
│   └── verifyLogic.ts           # Automated test suite
├── app.json                     # Android package & permissions configuration
├── eas.json                     # EAS Build configuration for APK
├── package.json
└── tsconfig.json
```

---

## 🚀 How to Run the App

### 1. Start the Expo Development Server
```bash
npm start
# or
npx expo start
```

### 2. Run on Android Device / Emulator
- **Physical Device**: Install **Expo Go** from Google Play Store on your Android phone, and scan the QR code displayed in the terminal.
- **Android Emulator**: Ensure Android Studio emulator is running and press `a` in the terminal, or run:
```bash
npm run android
```

### 3. Run Automated Tests
```bash
npm test
```

### 4. Run TypeScript Check
```bash
npm run typecheck
```

---

## 📦 How to Build an Android APK

The project is configured for EAS (Expo Application Services) with package name `com.antigravity.dailytasks` and build profile `preview` (standalone APK).

1. Install EAS CLI globally:
   ```bash
   npm install -g eas-cli
   ```
2. Log in to your Expo account:
   ```bash
   eas login
   ```
3. Build the standalone APK:
   ```bash
   eas build -p android --profile preview
   ```
   *(Or for local Android Studio native build: `npx expo run:android --variant release`)*

---

## 🔒 Offline & Future Cloud Sync

All data is stored offline via AsyncStorage. If you decide to add Supabase or Firebase:
1. Create a new repository implementing `ITaskRepository` (e.g. `SupabaseTaskRepository`).
2. Swap the export in `src/services/storage/AsyncStorageTaskRepository.ts`.
3. The entire UI and state management will continue working seamlessly without any changes to screens or components.
