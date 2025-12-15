# Deploy Evos AI Backend to Fly.io

## Prerequisites
1. Install Fly.io CLI: https://fly.io/docs/getting-started/installing-flyctl/
2. Sign up for Fly.io account: https://fly.io/app/sign-up
3. Login: `flyctl auth login`

## Step-by-Step Deployment

### Option A: Deploy via Fly.io Dashboard (Recommended)

1. **Go to Fly.io Dashboard:** https://fly.io/dashboard
2. **Create/Select your app**
3. **Go to Settings → Source**
4. **Configure GitHub Repository:**
   - **Current Working Directory:** `server` ⚠️ **CRITICAL: Must be set to `server`**
   - **Config path:** `server/fly.toml` (or leave empty if it auto-detects)
   - **Deploy branch:** `main`
   - **Auto-deploy on push:** (optional, can enable later)
5. **Click "Update"**
6. **Trigger a deployment** (or push to main if auto-deploy is enabled)

### Option B: Deploy via CLI

### 1. Navigate to Server Directory
```bash
cd server
```

### 2. Initialize Fly.io App
```bash
flyctl launch
```
- When prompted, **don't** deploy yet (choose "No")
- App name: `evos-ai` (or choose your own)
- Region: Choose closest to your users (e.g., `iad` for US East)

### 3. Set Environment Variables
```bash
# Set JWT secret (REQUIRED)
flyctl secrets set JWT_SECRET="Nzkl3QzUxzVmaIn1GdBN8BSl/qtPUSBPTi798Fctt+s="

# Set OpenAI API key (OPTIONAL - app works without it)
flyctl secrets set OPENAI_API_KEY="your-openai-key-here"

# Set email API key if you have Resend (OPTIONAL)
flyctl secrets set RESEND_API_KEY="your-resend-key-here"
```

### 4. Create Persistent Volume for Database
```bash
flyctl volumes create evos_data --size 1 --region iad
```
This creates a 1GB volume to persist your SQLite database.

### 5. Update fly.toml (if needed)
The `fly.toml` file is already configured, but you may want to:
- Change `app = "evos-ai-api"` to your app name
- Change `primary_region = "iad"` to your preferred region

### 6. Deploy!
```bash
flyctl deploy
```

### 7. Get Your Backend URL
After deployment, get your app URL:
```bash
flyctl status
```
Your backend URL will be: `https://evos-ai-api.fly.dev` (or your app name)

### 8. Test the Backend
```bash
curl https://evos-ai-api.fly.dev/api/health
```
Should return: `{"status":"ok",...}`

### 9. Update Vercel Environment Variable
1. Go to your Vercel project dashboard
2. Settings → Environment Variables
3. Add:
   - **Name:** `VITE_API_URL`
   - **Value:** `https://evos-ai-api.fly.dev/api` (add `/api` at the end)
   - **Environments:** Production, Preview, Development
4. Save and redeploy Vercel

## Useful Fly.io Commands

```bash
# View logs
flyctl logs

# SSH into your app
flyctl ssh console

# Scale your app
flyctl scale count 1

# View app status
flyctl status

# Open app in browser
flyctl open

# View secrets (values hidden)
flyctl secrets list
```

## Troubleshooting

### Database Issues
If you need to reset the database:
```bash
flyctl ssh console
rm evos.db*
exit
flyctl deploy
```

### Build Failures
Check logs:
```bash
flyctl logs
```

### Port Issues
Make sure `PORT=3001` is set (it's in fly.toml)

## Cost
Fly.io free tier includes:
- 3 shared-cpu-1x VMs
- 3GB persistent volume storage
- 160GB outbound data transfer

This should be enough for development and small production use.

