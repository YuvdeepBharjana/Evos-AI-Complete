# Connecting evosai.ca to Frontend & Backend

This guide will help you connect your custom domain `evosai.ca` to both:
- **Frontend (Vercel)**: `https://evosai.ca`
- **Backend API (Fly.io)**: `https://api.evosai.ca`

---

## Part 1: Connect Backend to api.evosai.ca

### Step 1: Add Custom Domain to Fly.io

1. **Get your Fly.io app name:**
   ```bash
   cd server
   flyctl status
   ```
   Note your app name (e.g., `evosai-api`)

2. **Add the subdomain to Fly.io:**
   ```bash
   flyctl certs add api.evosai.ca
   ```
   This will give you DNS records to add.

3. **Fly.io will provide DNS records like:**
   ```
   Type: A
   Name: api
   Value: [IP address]
   
   Type: AAAA
   Name: api
   Value: [IPv6 address]
   ```

### Step 2: Add DNS Records to Your Domain Provider

Go to your domain registrar (where you bought `evosai.ca`) and add:

**For Backend (api.evosai.ca):**
- **Type:** `A`
- **Name:** `api` (or `api.evosai.ca`)
- **Value:** [IP from Fly.io]
- **TTL:** 3600

- **Type:** `AAAA`
- **Name:** `api` (or `api.evosai.ca`)
- **Value:** [IPv6 from Fly.io]
- **TTL:** 3600

**Wait 5-10 minutes** for DNS propagation, then verify:
```bash
flyctl certs check api.evosai.ca
```

---

## Part 2: Connect Frontend to evosai.ca

### Step 1: Add Domain to Vercel

1. Go to your Vercel project dashboard
2. Click **Settings** → **Domains**
3. Add domain: `evosai.ca`
4. Add domain: `www.evosai.ca` (optional, for www redirect)

### Step 2: Add DNS Records for Frontend

Vercel will give you DNS records. Add these to your domain provider:

**For Frontend (evosai.ca):**
- **Type:** `A`
- **Name:** `@` (or `evosai.ca`)
- **Value:** [Vercel's IP address]

- **Type:** `CNAME`
- **Name:** `www`
- **Value:** `cname.vercel-dns.com`

**Or use Vercel's nameservers** (easier):
- Change your domain's nameservers to Vercel's (they'll provide these)

---

## Part 3: Update Environment Variables

### Step 1: Update Fly.io Environment Variables

```bash
cd server
flyctl secrets set FRONTEND_URL="https://evosai.ca"
flyctl secrets set APP_URL="https://evosai.ca"
```

### Step 2: Update Vercel Environment Variables

1. Go to Vercel Dashboard → Your Project → **Settings** → **Environment Variables**
2. Update `VITE_API_URL`:
   - **Name:** `VITE_API_URL`
   - **Value:** `https://api.evosai.ca/api`
   - **Environments:** All (Production, Preview, Development)
3. Save and **Redeploy**

---

## Part 4: Verify Everything Works

### Test Backend:
```bash
curl https://api.evosai.ca/api/health
```
Should return: `{"status":"ok",...}`

### Test Frontend:
1. Visit `https://evosai.ca`
2. Try to sign up
3. Check browser console for any CORS errors

### Test Connection:
Open browser console on `https://evosai.ca` and run:
```javascript
fetch('https://api.evosai.ca/api/health')
  .then(r => r.json())
  .then(console.log)
```
Should return the health check response.

---

## DNS Records Summary

Add these to your domain provider (`evosai.ca`):

| Type | Name | Value | Purpose |
|------|------|-------|---------|
| A | `@` | Vercel IP | Frontend (evosai.ca) |
| CNAME | `www` | cname.vercel-dns.com | Frontend (www.evosai.ca) |
| A | `api` | Fly.io IP | Backend (api.evosai.ca) |
| AAAA | `api` | Fly.io IPv6 | Backend (api.evosai.ca) |

---

## Troubleshooting

### "CORS error" in browser
- Make sure `FRONTEND_URL` is set in Fly.io: `flyctl secrets set FRONTEND_URL="https://evosai.ca"`
- Redeploy Fly.io: `flyctl deploy`

### "Certificate not ready"
- Wait 10-15 minutes after adding DNS records
- Check: `flyctl certs check api.evosai.ca`

### Frontend can't connect to backend
- Verify `VITE_API_URL` in Vercel is `https://api.evosai.ca/api`
- Check browser console for exact error
- Test backend directly: `curl https://api.evosai.ca/api/health`

### DNS not propagating
- Can take up to 48 hours (usually 5-30 minutes)
- Use `dig api.evosai.ca` or `nslookup api.evosai.ca` to check

---

## Quick Command Reference

```bash
# Fly.io - Check certificates
flyctl certs list
flyctl certs check api.evosai.ca

# Fly.io - View logs
flyctl logs

# Fly.io - Update secrets
flyctl secrets set FRONTEND_URL="https://evosai.ca"

# Fly.io - Redeploy
flyctl deploy

# Test backend
curl https://api.evosai.ca/api/health
```

---

## Final Configuration

Once everything is connected:

- **Frontend:** `https://evosai.ca` (Vercel)
- **Backend API:** `https://api.evosai.ca` (Fly.io)
- **API Endpoint:** `https://api.evosai.ca/api`

Your users will access the app at `https://evosai.ca` and it will automatically connect to `https://api.evosai.ca/api` for all API calls.




