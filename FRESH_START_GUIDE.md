# 🧹 Complete Fresh Start - Pure Clean Testing

## Step-by-Step Cleanup Process

Follow these steps IN ORDER for a completely clean start:

---

## 🔧 Step 1: Backend Database Cleanup

Open terminal in `server` folder:

```bash
cd server
npm run clean:full
```

**What this does:**
- ✅ Deletes all emergency requests
- ✅ Clears all database sessions
- ✅ Clears MongoDB cache

**Expected output:**
```
✅ DATABASE CLEANUP COMPLETE!
📋 What was cleaned:
   ✅ All emergency requests
   ✅ All active sessions
   ✅ Database cache cleared
```

---

## 🌐 Step 2: Browser Cleanup

### Option A: Use Cleanup Page (Easiest)

1. Go to: `http://localhost:5173/cleanup`
2. Click **"Full Cleanup & Logout"** button
3. Wait for confirmation
4. You'll be redirected to login

### Option B: Manual Browser Cleanup

1. Press **F12** (DevTools)
2. Go to **Application** tab
3. Click **"Clear storage"** in left sidebar
4. Check all boxes
5. Click **"Clear site data"**
6. Close and reopen browser

### Option C: Keyboard Shortcut

1. Press **Ctrl + Shift + Delete**
2. Select **"All time"**
3. Check:
   - ✅ Cookies
   - ✅ Cached images and files
   - ✅ Site data
4. Click **"Clear data"**

---

## 🔄 Step 3: Restart Servers (Optional but Recommended)

### Backend:
```bash
cd server
# Stop with Ctrl+C
npm start
```

### Frontend:
```bash
cd client
# Stop with Ctrl+C
npm run dev
```

---

## ✅ Step 4: Verify Clean State

### Check Database:
```bash
cd server
npm run clean:requests
```

Should show: `📊 Found 0 emergency request(s)`

### Check Browser:

Go to: `http://localhost:5173/debug`

Should show:
- ❌ No token
- ❌ No user
- All fields empty

---

## 🎯 Step 5: Start Fresh Testing

### Test 1: Patient Creates Request

**Browser 1 (or Incognito):**
1. Go to: `http://localhost:5173/login`
2. Login:
   ```
   Email: test.patient@voise.in
   Password: Patient@123
   ```
3. Go to Emergency page
4. Search "koramangala"
5. Request ambulance

### Test 2: Ambulance Accepts Request

**Browser 2 (different browser or normal mode):**
1. Go to: `http://localhost:5173/login`
2. Login:
   ```
   Email: sneha.reddy@ambulance.com
   Password: Ambulance123
   ```
3. Go to Emergency Requests page
4. Accept request
5. Progress through workflow

---

## 📋 Quick Commands Reference

```bash
# Full database cleanup
npm run clean:full

# Clean only emergency requests
npm run clean:requests

# Clean + reseed everything
npm run reset:test
```

---

## 🔗 Important URLs

| URL | Purpose |
|-----|---------|
| `http://localhost:5173/login` | Login page |
| `http://localhost:5173/cleanup` | Browser cleanup page |
| `http://localhost:5173/debug` | Debug user info |

---

## ⚠️ Before Each Test Session:

1. Run: `cd server && npm run clean:full`
2. Visit: `http://localhost:5173/cleanup`
3. Click "Full Cleanup & Logout"
4. Ready for pure testing! ✅

---

## 🎉 Benefits of Full Cleanup:

- ✅ No old session conflicts
- ✅ No cached data interference
- ✅ Pure test environment
- ✅ Real-time updates work properly
- ✅ No "already have active request" errors
- ✅ No permission issues

---

**Do this cleanup before EVERY major test!** 🚀
