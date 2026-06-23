<div align="center">

<img src="assets/Fitnex1.png" alt="FITNEX Logo" width="150" />

# 🏋️ FITNEX

### Your Personal Fitness AI Assistant

*Track. Train. Transform.*

[![React Native](https://img.shields.io/badge/React_Native-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://reactnative.dev/)
[![Expo](https://img.shields.io/badge/Expo-000020?style=for-the-badge&logo=expo&logoColor=white)](https://expo.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)](https://supabase.com/)

</div>

---

## 📱 About

**FITNEX** is a cross-platform mobile fitness application built with React Native and Expo that helps users achieve their fitness goals through personalized nutrition tracking, workout management, and AI-powered assistance — all in one place.

> No more switching between apps. No more guesswork. Just results.

---

## ✨ Features

| Feature | Description |
|---|---|
| 🗺️ **Nearby Gyms Map** | Discover gyms near your location using OpenStreetMap |
| 🔥 **Calorie Tracking** | Set and adjust your daily calorie goal with an interactive slider |
| 🥗 **Nutrition Logging** | Browse food categories, scan barcodes, log meals |
| 🏋️ **Workout Tracking** | Log workouts and track exercises with sets & reps |
| 🤖 **AI Fitness Assistant** | Get personalized advice from an AI chat assistant |
| 📊 **Fitnex Score** | Weekly scoring system based on calories, workouts & steps |
| 👟 **Step Counter** | Track daily steps using your device's pedometer sensor |
| 🔔 **Smart Notifications** | Daily reminders to keep you on track |
| 📸 **Profile Photo** | Upload your avatar from camera or gallery |
| 🌅 **Morning Routines** | Curated diet and cooking routine cards |

---

## 🏗️ Tech Stack

```
Frontend          →  React Native + Expo (TSX)
Navigation        →  Expo Router (file-based)
Language          →  TypeScript
State Management  →  React Context API
Backend           →  Supabase (PostgreSQL)
Authentication    →  Supabase Auth (JWT)
Storage           →  Supabase Storage (avatars)
Maps              →  react-native-maps + OpenStreetMap
Location          →  expo-location
Sensors           →  expo-sensors (Pedometer)
Camera            →  expo-camera + expo-image-picker
Notifications     →  expo-notifications
AI                →  Anthropic Claude API
```

---

## 📂 Project Structure

```
rmas-fitnex_2022_0387/
├── app/
│   ├── (auth)/              # Auth screens
│   │   ├── login.tsx
│   │   ├── register.tsx
│   │   ├── onboarding.tsx
│   │   └── setup-profile.tsx
│   ├── (tabs)/              # Main tab screens
│   │   ├── index.tsx        # Home (map, routines, calories)
│   │   ├── nutrition.tsx    # Nutrition tracking
│   │   ├── workout.tsx      # Workout management
│   │   ├── progress.tsx     # Progress & stats
│   │   └── profile.tsx      # User profile & score
│   ├── ai-chat.tsx          # AI assistant chat
│   ├── scan-barcode.tsx     # Barcode scanner
│   └── food-detail.tsx      # Food details
├── components/
│   ├── home/                # Home screen components
│   ├── shared/              # Shared components
│   └── ui/                  # UI primitives (Button, Input...)
├── constants/               # Colors, Typography, Spacing
├── context/                 # ProfileContext (global state)
├── hooks/                   # useAuth, useLocation
├── services/                # Supabase, API, Notifications
└── assets/                  # Images & icons
```

---

## 🗄️ Database Schema

```
profiles          →  User data (name, weight, calorie goal, avatar)
daily_scores      →  Daily Fitnex Score per user
workouts          →  Workout sessions
workout_exercises →  Exercises within workouts
workouts_catalog  →  Available workout templates
nutrition_logs    →  Daily food intake logs
meals             →  User meals
meals_catalog     →  Food database
ai_conversations  →  AI chat history
```

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- Expo Go app on your phone
- Supabase account
- Google Maps API key

### Installation

```bash
# Clone the repository
git clone https://github.com/elab-development/rmas-fitnex_2022_0387.git

# Navigate to project
cd rmas-fitnex_2022_0387

# Install dependencies
npm install
```

### Environment Setup

Create a `.env` file in the root directory:

```env
EXPO_PUBLIC_SUPABASE_URL=your_supabase_url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
EXPO_PUBLIC_GOOGLE_MAPS_KEY=your_google_maps_key
```

### Run the App

```bash
npx expo start
```

Scan the QR code with **Expo Go** on your Android or iOS device.

---

## 🔐 Security

- All API keys stored in `.env` (never committed to git)
- Supabase Row Level Security (RLS) enabled on all tables
- JWT authentication for all API requests
- Users can only access their own data

---

## 👩‍💻 Authors

<table>
  <tr>
    <td align="center">
      <a href="https://github.com/nadjamladenovic">
        <b>Nađa Mladenović</b>
      </a>
    </td>
    <td align="center">
      <a href="https://github.com/TijanaSikanja">
        <b>Tijana Šikanja</b>
      </a>
    </td>
  </tr>
</table>

---

<div align="center">

Made with ❤️ and lots of ☕

*FITNEX — Because every rep counts.*

</div>
