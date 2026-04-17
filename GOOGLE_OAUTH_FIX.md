# Google OAuth Sign-In Fix

## Issue
Google sign-in button doesn't work after clicking it.

## What I Fixed

1. **OAuth Callback Page**: Updated to properly fetch user data and update auth state after Google sign-in
2. **Route Configuration**: Added `/auth/callback` route to handle OAuth redirects

## Required: Google Console Configuration

**IMPORTANT**: You must configure the redirect URL in Google Cloud Console:

### Step 1: Go to Google Cloud Console
1. Visit: https://console.cloud.google.com/
2. Select your project
3. Go to **APIs & Services** → **Credentials**

### Step 2: Edit Your OAuth 2.0 Client
1. Click on your OAuth 2.0 Client ID
2. Under **Authorized redirect URIs**, add:
   ```
   http://localhost:3001/api/auth/google/callback
   ```
3. Click **Save**

### Step 3: Verify Backend Configuration
Make sure your `server/.env` file has:
```env
GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-client-secret
BACKEND_URL=http://localhost:3001
FRONTEND_URL=http://localhost:5173
```

## How It Works Now

1. User clicks "Sign in with Google"
2. Redirects to: `http://localhost:3001/api/auth/google`
3. Backend redirects to Google OAuth
4. User signs in with Google
5. Google redirects back to: `http://localhost:3001/api/auth/google/callback`
6. Backend processes auth and redirects to: `http://localhost:5173/auth/callback?token=...`
7. Frontend callback page:
   - Sets the token
   - Fetches user data
   - Updates auth state
   - Redirects to dashboard or onboarding

## Testing

1. Make sure both servers are running:
   ```bash
   # Terminal 1
   cd server && npm run dev
   
   # Terminal 2
   npm run dev
   ```

2. Visit `http://localhost:5173/login`
3. Click "Continue with Google"
4. Sign in with your Google account
5. Should redirect back to app and log you in

## Troubleshooting

### "redirect_uri_mismatch" error
- **Fix**: Make sure the redirect URI in Google Console exactly matches:
  `http://localhost:3001/api/auth/google/callback`

### "Google Sign-In is not set up"
- **Fix**: Check that `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` are set in `server/.env`
- Restart the backend server after adding them

### Sign-in works but doesn't redirect back
- **Fix**: Check browser console for errors
- Verify `/auth/callback` route is registered in `App.tsx`
- Check that `FRONTEND_URL` is set to `http://localhost:5173` in backend `.env`

### Token received but user not logged in
- **Fix**: Check browser console for API errors
- Verify backend `/api/auth/me` endpoint is working
- Check network tab to see if user fetch is successful


