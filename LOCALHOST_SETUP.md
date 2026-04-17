# Localhost Setup Guide

## Quick Start

### 1. Start the Backend Server

Open a terminal and run:

```bash
cd server
npm run dev
```

The backend will start on **http://localhost:3001**

### 2. Start the Frontend Server

Open a **new terminal** and run:

```bash
npm run dev
```

The frontend will start on **http://localhost:5173**

### 3. Access the App

Open your browser and go to:
**http://localhost:5173**

---

## Configuration

### Current Setup

- **Frontend**: `http://localhost:5173` (Vite dev server)
- **Backend**: `http://localhost:3001` (Express server)
- **API Proxy**: Frontend automatically proxies `/api/*` requests to backend

### Environment Variables

Make sure your `.env` file (in the root directory) has:

```env
APP_URL=http://localhost:5173
FRONTEND_URL=http://localhost:5173
BACKEND_URL=http://localhost:3001
PORT=3001
```

### OAuth Configuration

For Google OAuth to work locally, make sure your Google OAuth credentials have:
- **Authorized redirect URI**: `http://localhost:3001/api/auth/google/callback`

---

## Troubleshooting

### Backend won't start
- Check if port 3001 is already in use: `lsof -i :3001`
- Make sure you're in the `server` directory
- Check that dependencies are installed: `cd server && npm install`

### Frontend won't start
- Check if port 5173 is already in use: `lsof -i :5173`
- Make sure you're in the root directory
- Check that dependencies are installed: `npm install`

### API calls failing
- Verify backend is running on port 3001
- Check browser console for CORS errors
- Verify the proxy configuration in `vite.config.ts`

### OAuth not working
- Verify `APP_URL` and `FRONTEND_URL` are set to `http://localhost:5173` in `.env`
- Check Google OAuth console has the correct redirect URI
- Check backend logs for OAuth configuration

---

## Development Commands

### Backend
```bash
cd server
npm run dev    # Start with hot reload (tsx watch)
npm run build  # Build TypeScript
npm start      # Run production build
```

### Frontend
```bash
npm run dev      # Start dev server
npm run build    # Build for production
npm run preview  # Preview production build
npm run lint     # Run linter
```

---

## Ports

- **5173**: Frontend (Vite)
- **3001**: Backend (Express API)

Make sure both ports are available before starting the servers.
