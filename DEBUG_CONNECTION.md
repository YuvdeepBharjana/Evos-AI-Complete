# Debugging Frontend-Backend Connection

## Step 1: Verify Backend is Running

### Test Backend Health Endpoint
```bash
curl https://evos-ai.fly.dev/api/health
```

**Expected response:**
```json
{"status":"ok","timestamp":"...","aiAvailable":true/false,"version":"1.0.0"}
```

**If this fails:**
- Backend might not be deployed
- Check Fly.io dashboard: https://fly.io/dashboard
- Check logs: `flyctl logs`

---

## Step 2: Test Backend Registration Endpoint

### Test if registration endpoint exists:
```bash
curl -X POST https://evos-ai.fly.dev/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"test123","name":"Test User","acceptedTerms":true}'
```

**Expected responses:**
- **Success:** `{"user":{...},"token":"..."}`
- **Error (user exists):** `{"error":"User already exists"}`
- **Connection error:** `Failed to connect` or timeout

**If connection fails:**
- Backend is not accessible
- Check Fly.io app status

---

## Step 3: Check Vercel Environment Variables

1. Go to Vercel Dashboard → Your Project
2. **Settings** → **Environment Variables**
3. Verify `VITE_API_URL` exists and is set to:
   ```
   https://evos-ai.fly.dev/api
   ```
   (Note: includes `/api` at the end)

4. **Important:** Make sure it's set for **Production** environment
5. If you just added it, **redeploy** your Vercel project

---

## Step 4: Check Browser Console

1. Open your deployed Vercel site
2. Open Browser DevTools (F12)
3. Go to **Console** tab
4. Try to sign up
5. Look for errors like:
   - `Failed to fetch`
   - `CORS error`
   - `Network error`
   - `404 Not Found`

**Common errors:**

### "Failed to fetch" or "Network error"
- Backend URL is wrong
- Backend is down
- CORS issue

### "404 Not Found"
- URL is incorrect (missing `/api`)
- Endpoint doesn't exist

### "CORS error"
- Backend CORS not configured for your frontend domain
- Need to update CORS in backend

---

## Step 5: Check What URL Frontend is Using

1. Open your Vercel site
2. Open Browser DevTools (F12)
3. Go to **Network** tab
4. Try to sign up
5. Look for the request URL
6. Check if it's calling:
   - ✅ `https://evos-ai.fly.dev/api/auth/register`
   - ❌ `http://localhost:3001/api/auth/register` (wrong!)
   - ❌ `https://evos-ai.fly.dev/auth/register` (missing `/api`)

---

## Step 6: Verify Backend CORS Configuration

The backend needs to allow requests from your Vercel domain.

**Check current CORS:**
```bash
cd server
flyctl ssh console
cat index.ts | grep -A 10 "allowedOrigins"
```

**If your Vercel domain is not in allowedOrigins:**
1. Update `server/index.ts` to include your Vercel domain
2. Redeploy: `flyctl deploy`

---

## Step 7: Test from Browser Console

Open browser console on your Vercel site and run:

```javascript
// Test backend connection
fetch('https://evos-ai.fly.dev/api/health')
  .then(r => r.json())
  .then(data => console.log('✅ Backend connected:', data))
  .catch(err => console.error('❌ Backend error:', err));

// Test registration endpoint
fetch('https://evos-ai.fly.dev/api/auth/register', {
  method: 'POST',
  headers: {'Content-Type': 'application/json'},
  body: JSON.stringify({
    email: 'test@example.com',
    password: 'test123',
    name: 'Test User',
    acceptedTerms: true
  })
})
.then(r => r.json())
.then(data => console.log('✅ Registration test:', data))
.catch(err => console.error('❌ Registration error:', err));
```

This will show you exactly what's failing.

---

## Common Issues & Fixes

### Issue 1: "Load failed" - Backend not accessible
**Fix:**
- Check Fly.io dashboard: Is app running?
- Check logs: `flyctl logs`
- Verify URL: `curl https://evos-ai.fly.dev/api/health`

### Issue 2: "Load failed" - Wrong URL in frontend
**Fix:**
- Verify `VITE_API_URL` in Vercel is `https://evos-ai.fly.dev/api`
- **Redeploy Vercel** after setting environment variable
- Check browser Network tab to see actual URL being called

### Issue 3: CORS Error
**Fix:**
- Update `server/index.ts` CORS to include your Vercel domain
- Redeploy backend: `flyctl deploy`

### Issue 4: 404 Not Found
**Fix:**
- Make sure URL includes `/api`: `https://evos-ai.fly.dev/api/auth/register`
- Not: `https://evos-ai.fly.dev/auth/register` ❌

---

## Quick Diagnostic Commands

```bash
# 1. Check backend is running
curl https://evos-ai.fly.dev/api/health

# 2. Check Fly.io app status
cd server
flyctl status

# 3. Check Fly.io logs
flyctl logs

# 4. Check environment variables in Fly.io
flyctl secrets list

# 5. Test registration endpoint
curl -X POST https://evos-ai.fly.dev/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"test123","name":"Test","acceptedTerms":true}'
```

---

## Next Steps Based on Results

**If backend health check works:**
- ✅ Backend is running
- Check Vercel environment variables
- Check browser console for actual errors

**If backend health check fails:**
- ❌ Backend is not running
- Check Fly.io dashboard
- Check `flyctl status`
- Check `flyctl logs` for errors

**If CORS error:**
- Update CORS in backend
- Redeploy backend

**If 404 error:**
- Check URL includes `/api`
- Verify endpoint exists in `server/index.ts`

