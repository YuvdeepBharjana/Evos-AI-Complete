# OAuth Setup Guide

## Overview

Evos AI supports three authentication methods:
1. **Email + Password** (built-in)
2. **Google Sign-In** (OAuth 2.0)
3. **Apple Sign-In** (OAuth 2.0)

All three methods share a unified authentication state with JWT tokens.

---

## Google OAuth Setup

### 1. Create Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable the Google+ API (or People API)

### 2. Create OAuth Credentials

1. Navigate to **APIs & Services** → **Credentials**
2. Click **Create Credentials** → **OAuth client ID**
3. Configure the consent screen if prompted
4. Select **Web application**
5. Add authorized redirect URIs:
   - Development: `http://localhost:3001/api/auth/google/callback`
   - Production: `https://yourdomain.com/api/auth/google/callback`
6. Save and copy your **Client ID** and **Client Secret**

### 3. Configure Environment Variables

Add to your `.env` file (in root directory):

```bash
GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-your-secret-here
```

### 4. Test

1. Restart your backend server
2. Navigate to login page
3. Click "Continue with Google"
4. Sign in with your Google account
5. You should be redirected back to the app

---

## Apple Sign-In Setup

### 1. Apple Developer Account

You need an **Apple Developer Program** membership ($99/year).

### 2. Create App ID

1. Go to [Apple Developer Portal](https://developer.apple.com/account)
2. Navigate to **Certificates, Identifiers & Profiles**
3. Click **Identifiers** → **+** button
4. Select **App IDs** → Continue
5. Select **App** → Continue
6. Configure:
   - Description: `Evos AI`
   - Bundle ID: `com.yourcompany.evosai` (or your choice)
   - Enable **Sign in with Apple**
7. Click **Continue** → **Register**

### 3. Create Service ID

1. Back in **Identifiers**, click **+** button
2. Select **Services IDs** → Continue
3. Configure:
   - Description: `Evos AI Web`
   - Identifier: `com.yourcompany.evosai.web` (must be different from App ID)
   - Enable **Sign in with Apple**
4. Click **Configure** next to Sign in with Apple
5. Configure Web Authentication:
   - Primary App ID: Select the App ID you created
   - Domains: `yourdomain.com` (or `localhost` for development)
   - Return URLs:
     - Development: `http://localhost:3001/api/auth/apple/callback`
     - Production: `https://yourdomain.com/api/auth/apple/callback`
6. Save and Continue → Register

**Important:** Your Service ID (`com.yourcompany.evosai.web`) is your `APPLE_CLIENT_ID`.

### 4. Create Private Key

1. In **Keys**, click **+** button
2. Configure:
   - Key Name: `Evos AI Sign in with Apple Key`
   - Enable **Sign in with Apple**
   - Click **Configure** and select your Primary App ID
3. Click **Continue** → **Register**
4. **Download the .p8 file** - you can only download it once!
5. Note your **Key ID** (10 characters, e.g., `ABC123XYZ4`)

### 5. Get Team ID

1. In Apple Developer Portal, click on your name in top right
2. Your **Team ID** is displayed (10 characters, e.g., `A1B2C3D4E5`)

### 6. Format Private Key

1. Open the downloaded `.p8` file in a text editor
2. Copy the entire contents including headers
3. Replace newlines with `\n`:

```bash
# Original:
-----BEGIN PRIVATE KEY-----
MIGTAgEAMBMGByqGSM49AgEGCCqGSM49AwEHBHkwdwIBAQQg...
...more lines...
-----END PRIVATE KEY-----

# Formatted for .env:
-----BEGIN PRIVATE KEY-----\nMIGTAgEAMBMGByqGSM49AgEGCCqGSM49AwEHBHkwdwIBAQQg...\n...more lines...\n-----END PRIVATE KEY-----
```

### 7. Configure Environment Variables

Add to your `.env` file:

```bash
APPLE_CLIENT_ID=com.yourcompany.evosai.web
APPLE_TEAM_ID=A1B2C3D4E5
APPLE_KEY_ID=ABC123XYZ4
APPLE_PRIVATE_KEY=-----BEGIN PRIVATE KEY-----\nMIGTAgEAMBMGByqGSM49AgEGCCqGSM49AwEHBHkwdwIBAQQg...\n-----END PRIVATE KEY-----
```

### 8. Test

1. Restart your backend server
2. Navigate to login page
3. Click "Continue with Apple"
4. Sign in with your Apple ID
5. Approve the app
6. You should be redirected back to the app

---

## Troubleshooting

### Google OAuth Issues

**Error: redirect_uri_mismatch**
- Verify your redirect URI in Google Console exactly matches the callback URL
- Check for trailing slashes
- Ensure you're using the correct protocol (http vs https)

**Error: invalid_client**
- Verify your Client ID and Client Secret are correct
- Check that there are no extra spaces in the environment variables

**Error: Access blocked**
- You may need to add your email to test users in the OAuth consent screen
- Verify the consent screen is configured

### Apple Sign-In Issues

**Error: Invalid client**
- Verify your Service ID (`APPLE_CLIENT_ID`) is correct
- Ensure Sign in with Apple is enabled for your Service ID

**Error: Invalid redirect URI**
- Check that the return URL in your Service ID configuration matches your callback URL exactly
- Verify your domain is added to the allowed domains

**Error: Invalid key**
- Ensure your private key is properly formatted with `\n` for newlines
- Verify the Key ID matches the key you downloaded
- Check that the key is enabled and not revoked

**Error: Invalid token**
- Verify your Team ID is correct
- Check that your App ID has Sign in with Apple enabled

### General Issues

**Email already exists**
- If a user signs up with email+password, then tries OAuth with the same email, the accounts will automatically link
- OAuth users cannot set a password unless they use the "forgot password" flow

**OAuth flow stuck on callback**
- Check browser console for errors
- Verify the callback route is properly registered in `App.tsx`
- Check backend logs for OAuth errors

**Missing email from OAuth provider**
- Some users may deny email permissions
- App requires email scope - user must approve

---

## Security Best Practices

### Production Checklist

- [ ] Use HTTPS for all OAuth callbacks
- [ ] Set strong `JWT_SECRET` (32+ random characters)
- [ ] Never commit `.env` file to version control
- [ ] Rotate OAuth secrets regularly
- [ ] Limit OAuth consent screen scopes to minimum needed
- [ ] Enable OAuth consent screen verification (Google)
- [ ] Monitor OAuth usage and failed attempts
- [ ] Implement rate limiting on auth endpoints
- [ ] Set proper CORS origins in production

### Environment Variables

- Use different OAuth credentials for development and production
- Store production secrets in secure environment variable management (e.g., Fly.io secrets, AWS Secrets Manager)
- Never log OAuth tokens or sensitive data

---

## Account Linking

The app automatically links OAuth accounts to existing email accounts:

**Scenario 1: Email user adds OAuth**
1. User signs up with `john@example.com` + password
2. User clicks "Continue with Google" using same email
3. Accounts are automatically linked
4. User can now sign in with either method

**Scenario 2: OAuth user adds password**
1. User signs in with Google (no password)
2. User goes to Profile → Change Password
3. User sets a password
4. User can now sign in with either email+password or Google

**Scenario 3: Multiple OAuth providers**
1. User signs in with Google
2. Later signs in with Apple using same email
3. Both OAuth accounts link to the same user account
4. User can sign in with either provider

---

## Testing OAuth Locally

### Google

1. Add `http://localhost:3001/api/auth/google/callback` to authorized redirect URIs
2. No need to verify domain for development
3. Works with any Google account

### Apple

**Challenge:** Apple requires HTTPS for OAuth callbacks.

**Solution for Local Testing:**

#### Option 1: Use ngrok (Recommended)

```bash
# Install ngrok
npm install -g ngrok

# Start your backend
cd server && npm run dev

# In another terminal, create tunnel
ngrok http 3001

# Copy the HTTPS URL (e.g., https://abc123.ngrok.io)
# Update your .env:
BACKEND_URL=https://abc123.ngrok.io

# Add callback URL to Apple Service ID:
# https://abc123.ngrok.io/api/auth/apple/callback

# Update frontend .env.local:
VITE_API_URL=https://abc123.ngrok.io/api

# Restart frontend with new API URL
```

#### Option 2: Use localhost.run

```bash
ssh -R 80:localhost:3001 localhost.run
```

#### Option 3: Skip Apple Testing Locally

- Test Google OAuth locally
- Deploy to staging with HTTPS to test Apple
- Apple OAuth works identically to Google once configured

---

## Production Deployment

### Frontend (.env.production)

```bash
VITE_API_URL=https://api.yourdomain.com/api
```

### Backend Environment Variables

Update on your hosting platform (Fly.io, Railway, Heroku, etc.):

```bash
APP_URL=https://yourdomain.com
FRONTEND_URL=https://yourdomain.com
BACKEND_URL=https://api.yourdomain.com
GOOGLE_CLIENT_ID=production-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=production-secret
APPLE_CLIENT_ID=com.yourcompany.evosai.web
# ... other Apple credentials
```

### Update OAuth Providers

1. **Google Console**: Add production callback URL
   - `https://api.yourdomain.com/api/auth/google/callback`

2. **Apple Developer**: Add production return URL
   - `https://api.yourdomain.com/api/auth/apple/callback`
   - Add domain: `yourdomain.com`

---

## Support

For issues or questions:
- Check backend logs for OAuth errors
- Verify environment variables are set correctly
- Test with a fresh incognito/private browser window
- Check [Google OAuth troubleshooting](https://developers.google.com/identity/protocols/oauth2/production-readiness/troubleshooting)
- Check [Apple Sign-In documentation](https://developer.apple.com/documentation/sign_in_with_apple)

---

*Last updated: December 2024*

