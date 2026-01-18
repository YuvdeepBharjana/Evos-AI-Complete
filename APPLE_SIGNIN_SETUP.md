# Apple Sign-In Setup Guide

## Prerequisites

- **Apple Developer Account** ($99/year membership required)
- Your backend server running
- Access to your backend `.env` file

---

## Step-by-Step Instructions

### Step 1: Create App ID

1. Go to [Apple Developer Portal](https://developer.apple.com/account)
2. Sign in with your Apple Developer account
3. Navigate to **Certificates, Identifiers & Profiles**
4. Click **Identifiers** in the left sidebar
5. Click the **+** button (top left)
6. Select **App IDs** → Click **Continue**
7. Select **App** → Click **Continue**
8. Fill in:
   - **Description**: `Evos AI` (or your app name)
   - **Bundle ID**: `com.yourcompany.evosai` (choose your own, e.g., `com.evosai.app`)
   - **Capabilities**: Check ✅ **Sign in with Apple**
9. Click **Continue** → **Register**

**Note:** Save your Bundle ID - you'll need it later.

---

### Step 2: Create Service ID (This is your Client ID)

1. Still in **Identifiers**, click **+** again
2. Select **Services IDs** → Click **Continue**
3. Fill in:
   - **Description**: `Evos AI Web` (or your web app name)
   - **Identifier**: `com.yourcompany.evosai.web` (must be different from App ID)
     - Example: If App ID is `com.evosai.app`, use `com.evosai.web`
4. Check ✅ **Sign in with Apple**
5. Click **Configure** (next to "Sign in with Apple")
6. Configure Web Authentication:
   - **Primary App ID**: Select the App ID you created in Step 1
   - **Domains and Subdomains**: 
     - For development: `localhost` (or skip for now)
     - For production: `yourdomain.com` (your actual domain)
   - **Return URLs**:
     - Development: `http://localhost:3001/api/auth/apple/callback`
     - Production: `https://yourdomain.com/api/auth/apple/callback`
     - **Important:** Add both URLs if testing locally and deploying
7. Click **Save** → **Continue** → **Register**

**✅ Your Service ID (`com.yourcompany.evosai.web`) is your `APPLE_CLIENT_ID`**

---

### Step 3: Create Private Key

1. In **Certificates, Identifiers & Profiles**, click **Keys** in the left sidebar
2. Click the **+** button (top left)
3. Fill in:
   - **Key Name**: `Evos AI Sign in with Apple Key` (or your choice)
   - Check ✅ **Sign in with Apple**
   - Click **Configure** next to "Sign in with Apple"
   - **Primary App ID**: Select the App ID from Step 1
   - Click **Save**
4. Click **Continue** → **Register**
5. **⚠️ IMPORTANT:** Click **Download** to download the `.p8` file
   - **You can only download this once!** Save it securely.
6. **Note your Key ID** (10 characters, shown on the page, e.g., `ABC123XYZ4`)

---

### Step 4: Get Your Team ID

1. In Apple Developer Portal, click on your **name/account** in the top right
2. Your **Team ID** is displayed (10 characters, e.g., `A1B2C3D4E5`)
3. Copy it - you'll need it for the `.env` file

---

### Step 5: Format Private Key for .env

1. Open the downloaded `.p8` file in a text editor
2. It should look like this:
   ```
   -----BEGIN PRIVATE KEY-----
   MIGTAgEAMBMGByqGSM49AgEGCCqGSM49AwEHBHkwdwIBAQQg...
   ...more lines...
   -----END PRIVATE KEY-----
   ```
3. Copy the **entire contents** including the BEGIN and END lines
4. Replace all actual newlines with `\n` (backslash + n) so it becomes one line:
   ```
   -----BEGIN PRIVATE KEY-----\nMIGTAgEAMBMGByqGSM49AgEGCCqGSM49AwEHBHkwdwIBAQQg...\n...more lines...\n-----END PRIVATE KEY-----
   ```

**Tip:** You can use this command to format it automatically:
```bash
# On Mac/Linux:
cat AuthKey_ABC123XYZ4.p8 | tr '\n' '\\n'

# Or manually replace newlines with \n in your text editor
```

---

### Step 6: Add to Backend .env File

Open your `server/.env` file and add these variables:

```bash
# Apple Sign-In Configuration
APPLE_CLIENT_ID=com.yourcompany.evosai.web
APPLE_TEAM_ID=A1B2C3D4E5
APPLE_KEY_ID=ABC123XYZ4
APPLE_PRIVATE_KEY=-----BEGIN PRIVATE KEY-----\nMIGTAgEAMBMGByqGSM49AgEGCCqGSM49AwEHBHkwdwIBAQQg...\n-----END PRIVATE KEY-----
```

**Replace:**
- `APPLE_CLIENT_ID` with your Service ID from Step 2
- `APPLE_TEAM_ID` with your Team ID from Step 4
- `APPLE_KEY_ID` with your Key ID from Step 3
- `APPLE_PRIVATE_KEY` with your formatted private key from Step 5

**Important:**
- The private key must be on one line with `\n` for newlines
- No extra spaces or quotes needed
- Make sure there are no trailing spaces

---

### Step 7: Restart Backend Server

1. Stop your backend server (Ctrl+C)
2. Restart it:
   ```bash
   cd server
   npm run dev
   ```
3. Check the console - you should see:
   ```
   ✅ Apple OAuth strategy configured
   ```

If you see `⚠️ Apple OAuth not configured`, double-check your `.env` file.

---

## Testing Apple Sign-In

### For Local Development

**Challenge:** Apple requires HTTPS for OAuth callbacks, but localhost uses HTTP.

**Solution Options:**

#### Option 1: Use ngrok (Recommended for Testing)

1. Install ngrok:
   ```bash
   npm install -g ngrok
   # Or download from https://ngrok.com/
   ```

2. Start your backend:
   ```bash
   cd server && npm run dev
   ```

3. In another terminal, create HTTPS tunnel:
   ```bash
   ngrok http 3001
   ```

4. Copy the HTTPS URL (e.g., `https://abc123.ngrok.io`)

5. Update your Apple Service ID:
   - Go back to Apple Developer Portal
   - Edit your Service ID
   - Add Return URL: `https://abc123.ngrok.io/api/auth/apple/callback`
   - Add Domain: `abc123.ngrok.io` (without https://)

6. Update your `.env`:
   ```bash
   BACKEND_URL=https://abc123.ngrok.io
   ```

7. Restart backend

8. Update frontend `.env.local`:
   ```bash
   VITE_API_URL=https://abc123.ngrok.io/api
   ```

9. Restart frontend

10. Test the "Continue with Apple" button

#### Option 2: Test on Production/Staging

- Deploy to a server with HTTPS
- Add production callback URL to Apple Service ID
- Test there

---

## Quick Checklist

Before testing, verify:

- [ ] App ID created with "Sign in with Apple" enabled
- [ ] Service ID created (this is your `APPLE_CLIENT_ID`)
- [ ] Service ID has Return URLs configured
- [ ] Private Key downloaded and formatted correctly
- [ ] Team ID copied
- [ ] Key ID copied
- [ ] All 4 environment variables added to `server/.env`
- [ ] Backend restarted and shows "✅ Apple OAuth strategy configured"
- [ ] Frontend shows "Continue with Apple" button (if `oauthAvailable.apple` is true)

---

## Common Issues

### "Apple OAuth not configured" in backend logs

- Check that all 4 environment variables are set
- Verify no extra spaces in `.env` file
- Make sure private key has `\n` for newlines (not actual newlines)

### "Invalid client" error

- Verify `APPLE_CLIENT_ID` matches your Service ID exactly
- Check that Sign in with Apple is enabled for your Service ID

### "Invalid redirect URI"

- Verify Return URL in Apple Service ID matches your callback URL exactly
- Check for trailing slashes
- Ensure domain is added to allowed domains

### "Invalid key" error

- Verify private key is formatted correctly (one line with `\n`)
- Check that Key ID matches the key you downloaded
- Ensure the key hasn't been revoked

---

## What You Need to Provide

Once you have these, you can add them to your `.env`:

1. **APPLE_CLIENT_ID** = Your Service ID (e.g., `com.yourcompany.evosai.web`)
2. **APPLE_TEAM_ID** = Your Team ID (10 characters)
3. **APPLE_KEY_ID** = Your Key ID (10 characters)
4. **APPLE_PRIVATE_KEY** = Your formatted private key (one line with `\n`)

---

## Next Steps

After you have the Client ID and other credentials:

1. Add them to `server/.env`
2. Restart backend
3. The "Continue with Apple" button will automatically appear on the login page
4. Test the flow

---

*Need help? Check the main `OAUTH_SETUP.md` file for more troubleshooting tips.*




