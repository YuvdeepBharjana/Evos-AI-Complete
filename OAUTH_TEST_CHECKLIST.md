# OAuth Testing Checklist

## Pre-Test Setup

### ✅ Environment Variables Configured

**Backend (.env in root):**
- [ ] `OPENAI_API_KEY` set
- [ ] `JWT_SECRET` set
- [ ] `APP_URL=http://localhost:5173`
- [ ] `BACKEND_URL=http://localhost:3001`
- [ ] `GOOGLE_CLIENT_ID` set (if testing Google)
- [ ] `GOOGLE_CLIENT_SECRET` set (if testing Google)
- [ ] `APPLE_CLIENT_ID` set (if testing Apple)
- [ ] `APPLE_TEAM_ID` set (if testing Apple)
- [ ] `APPLE_KEY_ID` set (if testing Apple)
- [ ] `APPLE_PRIVATE_KEY` set (if testing Apple)

**Frontend (.env.local):**
- [ ] `VITE_API_URL=http://localhost:3001/api`

### ✅ Services Running

- [ ] Backend server: `cd server && npm run dev`
- [ ] Frontend dev server: `npm run dev`
- [ ] Both servers responding without errors

---

## Test Case 1: Google Sign-In (New User)

### Steps:
1. Navigate to http://localhost:5173/login
2. Click "Continue with Google" button
3. Sign in with a Google account that has never been used in this app
4. Approve consent screen

### Expected Results:
- [ ] Redirects to Google OAuth consent screen
- [ ] After approval, redirects back to /auth/callback
- [ ] Loading screen shows briefly
- [ ] Redirects to /onboarding (new user, no onboarding complete)
- [ ] User can complete onboarding
- [ ] After onboarding, redirects to /dashboard
- [ ] User profile shows correct name and email from Google
- [ ] Email is marked as verified

### Verify in Database:
```sql
-- Check users table
SELECT id, email, name, email_verified, password_hash FROM users WHERE email = 'test@gmail.com';
-- password_hash should be NULL for OAuth users

-- Check oauth_accounts table
SELECT * FROM oauth_accounts WHERE user_id = '<user_id_from_above>';
-- Should have provider='google' and provider_account_id
```

---

## Test Case 2: Google Sign-In (Existing User - Return)

### Steps:
1. Complete Test Case 1 first
2. Log out
3. Navigate to http://localhost:5173/login
4. Click "Continue with Google" again
5. Sign in with the same Google account

### Expected Results:
- [ ] Redirects to Google (may auto-approve if already logged in)
- [ ] Returns to /auth/callback
- [ ] Redirects directly to /dashboard (onboarding already complete)
- [ ] Chat history and identity nodes persist from before
- [ ] No duplicate user created

---

## Test Case 3: Account Linking (Email→Google)

### Steps:
1. Sign up with email+password: email@example.com / Password123!
2. Log out
3. Click "Continue with Google"
4. Sign in with Google using email@example.com (same email)

### Expected Results:
- [ ] Successfully signs in
- [ ] Redirects to dashboard (or onboarding if not completed)
- [ ] Both auth methods now work for this user
- [ ] Only one user record in database

### Verify:
```sql
SELECT * FROM users WHERE email = 'email@example.com';
-- Should have BOTH password_hash (from original signup) AND oauth_accounts entry

SELECT * FROM oauth_accounts WHERE user_id = '<user_id>';
-- Should have Google OAuth entry linked to this user
```

---

## Test Case 4: Apple Sign-In (New User)

**Note:** Requires HTTPS or ngrok for local testing (see OAUTH_SETUP.md)

### Steps:
1. Navigate to http://localhost:5173/login
2. Click "Continue with Apple" button
3. Sign in with Apple ID
4. Approve consent screen (choose to share or hide email)

### Expected Results:
- [ ] Redirects to Apple sign-in page
- [ ] After approval, redirects to /auth/callback
- [ ] New user created with Apple email
- [ ] Redirects to /onboarding
- [ ] Can complete onboarding
- [ ] Email marked as verified

### Verify:
```sql
SELECT * FROM users WHERE email LIKE '%@privaterelay.appleid.com%' OR email = '<your_apple_email>';

SELECT * FROM oauth_accounts WHERE provider = 'apple';
```

---

## Test Case 5: Apple Sign-In (Existing User)

### Steps:
1. Complete Test Case 4
2. Log out
3. Click "Continue with Apple" again

### Expected Results:
- [ ] Signs in successfully
- [ ] Redirects to /dashboard
- [ ] All data persists
- [ ] No duplicate user created

---

## Test Case 6: Account Linking (Email→Apple)

### Steps:
1. Create account with email+password: apple@example.com
2. Log out
3. Click "Continue with Apple"
4. Sign in with Apple using apple@example.com

### Expected Results:
- [ ] Accounts linked successfully
- [ ] Can sign in with either method
- [ ] Only one user in database

---

## Test Case 7: Email/Password Fallback (After OAuth)

### Steps:
1. Sign in with Google (no password set)
2. Go to Profile → Change Password
3. Set a password
4. Log out
5. Sign in with email+password

### Expected Results:
- [ ] Can set password successfully
- [ ] Can sign in with email+password
- [ ] Can still sign in with Google
- [ ] Both methods work for same account

---

## Test Case 8: Session Persistence & Refresh

### Steps:
1. Sign in with any OAuth method
2. Navigate to different pages (dashboard, mirror, profile)
3. Refresh the page (F5 or Cmd+R)
4. Close browser tab and reopen app

### Expected Results:
- [ ] Token persists in localStorage
- [ ] User remains logged in after refresh
- [ ] User remains logged in after tab close/reopen
- [ ] No re-authentication required
- [ ] All user data loads correctly

---

## Test Case 9: Logout

### Steps:
1. Sign in with OAuth
2. Click logout

### Expected Results:
- [ ] Redirects to login page
- [ ] Token removed from localStorage
- [ ] Cannot access protected routes
- [ ] Trying to access /dashboard redirects to /login

---

## Test Case 10: OAuth Error Handling

### Test 10a: User Cancels OAuth
1. Click "Continue with Google"
2. Close Google consent screen or click "Cancel"

**Expected:** Redirects back to login with error message

### Test 10b: Missing Email Scope
1. Deny email permission in OAuth consent screen (if possible)

**Expected:** Error message displayed, no account created

### Test 10c: Invalid OAuth Credentials
1. Set invalid `GOOGLE_CLIENT_SECRET` in .env
2. Try to sign in with Google

**Expected:** Graceful error, user informed, app doesn't crash

---

## Test Case 11: Mobile Responsiveness

### Steps:
1. Open DevTools (F12)
2. Toggle device toolbar (iPhone 13, Galaxy S21, etc.)
3. Navigate to login page
4. Verify OAuth buttons

### Expected Results:
- [ ] Buttons are touch-friendly (min 44px height)
- [ ] Text is readable
- [ ] Buttons don't overflow
- [ ] Google and Apple buttons stack properly
- [ ] "Or continue with email" divider displays correctly
- [ ] No horizontal scrolling needed

### Test on Real Mobile (if available):
- [ ] iPhone Safari
- [ ] Android Chrome
- [ ] OAuth flow works on mobile browsers

---

## Test Case 12: Edge Cases

### Test 12a: Same Email, Different Providers
1. Sign up with Google: test@gmail.com
2. Sign up with Apple: test@gmail.com (same email)

**Expected:** Both OAuth accounts link to same user

### Test 12b: No Email from Provider
(Unlikely but possible if user denies email scope)

**Expected:** Error message, user cannot proceed

### Test 12c: Concurrent Sign-Ins
1. Open two browser tabs
2. Sign in with OAuth in tab 1
3. Sign in with different account in tab 2

**Expected:** Second sign-in overwrites first, no race conditions

---

## Test Case 13: Database Integrity

Run these queries after completing several OAuth sign-ins:

```sql
-- Verify no duplicate users
SELECT email, COUNT(*) as count FROM users GROUP BY email HAVING count > 1;
-- Should return 0 rows

-- Verify OAuth accounts are linked
SELECT 
  u.email, 
  o.provider, 
  o.provider_account_id,
  u.password_hash IS NOT NULL as has_password
FROM users u
LEFT JOIN oauth_accounts o ON u.id = o.user_id
ORDER BY u.created_at DESC;

-- Verify email verification for OAuth users
SELECT email, email_verified FROM users WHERE password_hash IS NULL;
-- All should have email_verified = 1
```

---

## Test Case 14: API Endpoint Testing

Use Postman, curl, or similar:

```bash
# Health check
curl http://localhost:3001/api/health

# Should redirect to Google
curl -L http://localhost:3001/api/auth/google

# Should redirect to Apple
curl -L http://localhost:3001/api/auth/apple
```

---

## Test Case 15: Production Readiness

**Before deploying to production:**

- [ ] OAuth credentials configured for production domain
- [ ] Callback URLs updated in Google Console
- [ ] Callback URLs updated in Apple Developer Portal
- [ ] HTTPS enabled
- [ ] CORS origins restricted to production domains
- [ ] JWT_SECRET is strong and unique
- [ ] Environment variables not committed to git
- [ ] Rate limiting enabled on auth endpoints
- [ ] Error logging configured
- [ ] Monitoring set up for OAuth failures

---

## Troubleshooting Common Issues

### Issue: "redirect_uri_mismatch" (Google)
**Fix:** Verify callback URL in Google Console exactly matches `http://localhost:3001/api/auth/google/callback`

### Issue: "Invalid client" (Apple)
**Fix:** Check Apple Service ID is correct and Sign in with Apple is enabled

### Issue: OAuth callback loops infinitely
**Fix:** Check FRONTEND_URL and BACKEND_URL in .env match actual URLs

### Issue: Email already exists error
**Fix:** This should automatically link accounts - check findOrCreateOAuthUser logic

### Issue: Token not persisting
**Fix:** Check localStorage permissions, verify token is being saved in callback

### Issue: Apple OAuth doesn't work locally
**Fix:** Use ngrok or deploy to staging with HTTPS (see OAUTH_SETUP.md)

---

## Success Criteria

✅ **Implementation Complete When:**

- [ ] All 15 test cases pass
- [ ] No console errors during OAuth flow
- [ ] Database has no duplicate users
- [ ] Mobile layout works correctly
- [ ] Error handling works gracefully
- [ ] Documentation is complete and accurate
- [ ] Production deployment checklist complete

---

## Performance Benchmarks

- OAuth redirect: < 2 seconds
- Callback processing: < 1 second
- User creation: < 500ms
- Token generation: < 100ms

---

*Last updated: December 2024*

