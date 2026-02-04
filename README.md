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

## 🗄️ Persistence & Deployment

- **Current Mode**: **Local-Only (localStorage)**. To make deployment as simple as possible (e.g., on Vercel), the app currently stores all data directly in your browser's local storage. No backend database setup is required.
- **Privacy**: Your data stays 100% on your device.
- **Future-Proof**: The API layer is already built to support SQLite. To switch back to the database mode, simply revert the `Client/src/api.ts` file to its fetch-based implementation.

## 🌐 Quick Deploy (Frontend Only)
1. Push this code to GitHub.
2. Connect your repository to **Vercel**.
3. Set the **Root Directory** to `Client`.
4. Deploy! No environment variables or databases needed for this mode.

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