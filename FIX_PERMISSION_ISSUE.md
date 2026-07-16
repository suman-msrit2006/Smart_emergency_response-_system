# Fix Permission Issue - 403 Forbidden

## The Problem:
You're getting "You do not have permission to perform this action" because you're logged in with the **wrong role**.

## ✅ SOLUTION:

### Step 1: Check Your Current User

Go to this URL in your browser:
```
http://localhost:5173/debug
```

This page will show you:
- Your current role
- Your email
- Whether you have a token

### Step 2: Look for RED ❌ symbols

If you see:
- ❌ Role is NOT "Patient"
- ❌ Role is "Ambulance Personnel"
- ❌ Role is "undefined"

**Then you need to re-login as a Patient!**

### Step 3: Force Clear & Re-Login

On the debug page, click the **"Force Clear & Re-Login"** button

OR manually:
1. Logout from your current account
2. Clear browser cache (Ctrl+Shift+Delete)
3. Close all tabs
4. Open new tab

### Step 4: Register/Login as Patient

**Option A: Create New Patient Account**
1. Go to `/register`
2. Fill in details
3. Select Role: **Patient** (NOT Ambulance Personnel!)
4. Register

**Option B: Use Existing Patient**
- If you already have a patient account, login with that

### Step 5: Verify

Go to `/debug` again and check:
- ✅ Role should be "Patient"
- ✅ Email should be your patient email
- ✅ Token should exist

### Step 6: Test Emergency Request

Now try creating an emergency request:
1. Go to `/emergency`
2. Search "koramangala"
3. Select ambulance
4. Click "REQUEST THIS AMBULANCE"
5. Should work! ✅

---

## Why This Happens:

You were probably testing with an **Ambulance Personnel** account, and that token is still saved in your browser.

Patients can create emergency requests ✅
Ambulance Personnel CANNOT create requests ❌

---

## Quick Commands:

```bash
# Clean old requests
cd server
npm run clean:requests
```

---

Try it now! Visit `/debug` first to check your user role! 🚀
