# Quick OAuth Testing Setup (5 minutes)

## Current Status

✅ OAuth implementation is complete and working
❌ OAuth credentials not configured yet

**Result:** The Google/Apple buttons won't show on the login page until you add credentials.

---

## Option 1: Test Without OAuth (Fastest)

**Email/password authentication still works perfectly!**

Just use the existing email+password login - no setup needed.

---

## Option 2: Quick Google OAuth Setup (5-10 minutes)

### Step 1: Get Google OAuth Credentials

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Go to **APIs & Services** → **Credentials**
4. Click **Create Credentials** → **OAuth client ID**
5. If prompted, configure consent screen:
   - User Type: **External** (for testing)
   - App name: `Evos AI Dev`
   - User support email: your email
   - Developer contact: your email
   - Click **Save and Continue** through the rest
6. Back to Create OAuth client ID:
   - Application type: **Web application**
   - Name: `Evos AI Dev`
   - Authorized redirect URIs: `http://localhost:3001/api/auth/google/callback`
   - Click **Create**
7. Copy your **Client ID** and **Client Secret**

### Step 2: Add to Environment Variables

Add these to your `.env` file (in the root directory):

```bash
GOOGLE_CLIENT_ID=your-client-id-here.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-your-secret-here
```

### Step 3: Restart Backend

```bash
# Stop the current backend (Ctrl+C)
cd server && npm run dev
```

You should see:
```
✅ Google OAuth strategy configured
```

### Step 4: Test It!

1. Go to http://localhost:5173/login
2. You should now see "Continue with Google" button
3. Click it → sign in with your Google account
4. It works! 🎉

---

## Option 3: Test Apple Sign-In (Advanced, 15-30 minutes)

**Requirements:**
- Apple Developer Program membership ($99/year)
- HTTPS (use ngrok for local testing)

This is more complex - see `OAUTH_SETUP.md` for full instructions.

**For most testing, Google OAuth is sufficient.**

---

## Troubleshooting

### "Continue with Google" button doesn't appear

**Cause:** Google credentials not set or backend not restarted

**Fix:**
1. Check `.env` has `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET`
2. Restart backend: `cd server && npm run dev`
3. Look for: `✅ Google OAuth strategy configured` in terminal
4. Refresh browser

### "redirect_uri_mismatch" error

**Cause:** Callback URL doesn't match Google Console

**Fix:**
1. In Google Console, verify redirect URI is EXACTLY:
   ```
   http://localhost:3001/api/auth/google/callback
   ```
2. No trailing slash, must match exactly

### OAuth buttons show but clicking does nothing

**Check browser console (F12) for errors**

Common fixes:
- Verify backend is running on port 3001
- Check that API_BASE is set correctly
- Try incognito mode (clear cache)

---

## Testing Checklist

Once you have Google OAuth set up:

- [ ] Click "Continue with Google"
- [ ] Sign in with Google account
- [ ] Redirects to app successfully
- [ ] User profile shows correct name/email
- [ ] Can complete onboarding
- [ ] Can log out and log back in with Google
- [ ] Email/password still works as fallback

---

## For Production

When you're ready to deploy:

1. Create production Google OAuth credentials
2. Update redirect URI to your production domain:
   ```
   https://yourdomain.com/api/auth/google/callback
   ```
3. Set environment variables on your hosting platform
4. Test thoroughly before going live

---

## Summary

**Immediate Action:**
1. Add Google credentials to `.env`
2. Restart backend
3. Test Google sign-in
4. Email/password works regardless

**OAuth is optional** - your app works perfectly without it!

---

*Need help? Check `OAUTH_SETUP.md` for detailed instructions*

