# OneMore - Discipline & Focus Command Center

OneMore is a premium productivity tool designed for high-performers to sequence tasks, forge discipline protocols, and analyze focus.

## 🚀 Getting Started

To make the app and your local database available, follow these simple steps:

### 1. Prerequisites
- [Node.js](https://nodejs.org/) (v18 or higher recommended)

### 2. Setup
Clone the repository and run the install script from the root directory:
```bash
npm run install-all
```

### 3. Launch
Start both the client and the local SQLite database server with one command:
```bash
npm run dev
```
The app will be available at `http://localhost:5173`.

## 🗄️ Local Database & Persistence

- **SQLite Backend**: All your tasks, protocols, and stats are stored in `Server/onemore.db`.
- **Privacy**: The database is created automatically on your first run. Your data stays locally on your system.
- **Auto-Migration**: If you have older data in your browser's local storage, it will automatically be migrated to the SQLite database on your first visit.

## ✨ Key Features
- **Forge Protocols**: Design multi-day discipline rituals with automated resets.
- **Deep Work Engine**: Integrated Pomodoro timer with task sequencing.
- **Focus Analyzer**: Track your evolution with 7-day visualization heatmaps.
- **Modern UI**: Fully theme-aware (Light/Dark mode) premium experience.

---

## 🌐 Deployment Guide

### 1. Frontend (Vercel)
- **Framework Preset**: Vite
- **Root Directory**: `Client`
- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **Environment Variables**:
  - `VITE_API_URL`: Your Railway backend URL (e.g., `https://onemore-production.up.railway.app/api`)

### 2. Backend (Railway)
- **Root Directory**: `Server`
- **Build Command**: `npm run build`
- **Start Command**: `npm start`
- **Environment Variables**:
  - `PORT`: `3001` (automatically set by Railway usually)
  - `FRONTEND_URL`: Your Vercel frontend URL (e.g., `https://one-more-app.vercel.app`)
  - `DATABASE_PATH`: `/app/data/onemore.db` (Ensure you create a [Railway Volume](https://docs.railway.app/guides/volumes) and mount it to `/app/data` for persistence!)

---
Made with ❤️ by J.D