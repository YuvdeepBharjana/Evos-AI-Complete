# Connection Test Guide

## Current Configuration
- **Frontend**: `http://localhost:5173` (Vite dev server)
- **Backend**: `http://localhost:3001` (Express API)
- **Proxy**: Frontend `/api/*` → Backend `http://localhost:3001/api/*`

## Quick Test Steps

### 1. Verify Backend is Running
```bash
curl http://localhost:3001/api/health
```
Should return: `{"status":"ok",...}`

### 2. Verify Frontend is Running
Open browser: `http://localhost:5173`
Should see the app loading

### 3. Verify Proxy is Working
```bash
curl http://localhost:5173/api/health
```
Should return: `{"status":"ok",...}` (same as backend)

### 4. Check Browser Console
1. Open `http://localhost:5173` in browser
2. Open Developer Tools (F12)
3. Check Console tab for:
   - `🔗 API Base URL: /api` (should show `/api` not full URL)
   - Any CORS errors
   - Any network errors

### 5. Check Network Tab
1. Open Network tab in DevTools
2. Try to login or make an API call
3. Look for requests to `/api/*`
4. Check if they return 200 OK or show errors

## Common Issues

### Issue: "Failed to fetch" or CORS errors
**Solution**: Make sure backend is running on port 3001
```bash
cd server
npm run dev
```

### Issue: Frontend shows but API calls fail
**Solution**: Check that proxy is configured correctly in `vite.config.ts`
- Should have `proxy: { '/api': { target: 'http://localhost:3001' } }`

### Issue: Port already in use
**Solution**: Kill existing processes
```bash
# Kill processes on ports
lsof -ti:5173 | xargs kill -9
lsof -ti:3001 | xargs kill -9
```

### Issue: Browser cache
**Solution**: Hard refresh browser (Cmd+Shift+R on Mac, Ctrl+Shift+R on Windows)

## Expected Behavior

When you visit `http://localhost:5173`:
1. Page loads
2. Console shows: `🔗 API Base URL: /api`
3. API calls go to `/api/*` (proxied to backend)
4. No CORS errors in console
