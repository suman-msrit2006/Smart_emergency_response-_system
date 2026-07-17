# 🚀 Test SOS Workflow NOW - Fixed!

## ✅ What Was Fixed:

1. **API Call Fixed** - EmergencyRequests.jsx now calls correct Ambulance API
2. **Ambulances Re-seeded** - All 16 ambulances properly linked to drivers
3. **Driver Field Set** - Each ambulance's `driver` field points to correct user ID

---

## 🧪 Test Now - Step by Step:

### STEP 1: Clean Old Data

```bash
cd server
npm run clean:requests
```

### STEP 2: Browser 1 - Patient Login

1. **Go to:** `http://localhost:5173/cleanup`
2. **Click:** "Full Cleanup & Logout"
3. **Go to:** `http://localhost:5173/login`
4. **Login:**
   ```
   Email: test.patient@voise.in
   Password: Patient@123
   ```

### STEP 3: Patient Creates SOS Request

1. Click **"Emergency SOS"** button
2. Search: **"koramangala"**
3. Should see 4 ambulances (Bengaluru)
4. Select any ambulance (e.g., KA-05-AB-1004 - Sneha Reddy)
5. Click **"REQUEST THIS AMBULANCE"**
6. Should show: ✅ **"Emergency request created!"**

### STEP 4: Browser 2 (Incognito) - Ambulance Login

1. **Open incognito/private window**
2. **Go to:** `http://localhost:5173/login`
3. **Login:**
   ```
   Email: sneha.reddy@ambulance.com
   Password: Ambulance123
   ```

### STEP 5: Ambulance Goes Online

1. Should land on **Ambulance Dashboard**
2. Click **"Go Online"** button
3. GPS should activate (allow location if asked)
4. Should see **"You are now online"** message

### STEP 6: Ambulance Sees Request

1. Click **"View All Requests"** or **"Emergency Requests"**
2. Should navigate to `/emergency-requests` page
3. **Should see patient's request in "Incoming Requests" section!** ✅
4. Shows: Patient name, location, severity, time

### STEP 7: Ambulance Accepts Request

1. Click **"✅ Accept"** button
2. Request moves to **"Current Assignment"** section
3. Patient (Browser 1) sees status update in real-time

### STEP 8: Progress Through Workflow

1. Click **"Start Navigation (En Route)"**
2. Status updates to "En Route"
3. Continue clicking status progression:
   - **Mark Arrived at Patient**
   - **Patient Picked Up**
   - **Reached Hospital**
   - **Complete Handover**

4. After completion, ambulance becomes available again!

---

## 🎯 Expected Results:

### ✅ Patient Side:
- Can search and see ambulances
- Can send request
- Sees "Request Sent" message
- Can track ambulance status in real-time

### ✅ Ambulance Side:
- Can go online/offline
- GPS activates
- **RECEIVES REQUEST** in Emergency Requests page
- Can accept/reject
- Can progress through statuses

---

## 🐛 If Something Doesn't Work:

### Patient doesn't see ambulances:
- Check if ambulances are seeded: `npm run reseed:personnel`
- Make sure searching correct city (koramangala, bandra, etc.)

### Ambulance doesn't see request:
1. **Click "Refresh" button** on Emergency Requests page
2. Make sure ambulance clicked **"Go Online"**
3. Check backend logs for Socket.IO broadcast
4. Try logging out and logging in again

### "No Ambulance Registered" error:
- Run: `npm run reseed:personnel`
- This re-creates ambulance-driver links

### "Permission denied" error:
- Make sure you're logged in with correct role
- Patient → Can create requests
- Ambulance → Can accept requests
- Visit `/debug` to check your role

---

## 📋 Quick Commands:

```bash
# Clean old requests
cd server
npm run clean:requests

# Re-seed ambulances
npm run reseed:personnel

# Full cleanup
npm run clean:full
```

---

## 🔗 URLs:

| What | URL |
|------|-----|
| Login | `http://localhost:5173/login` |
| Cleanup | `http://localhost:5173/cleanup` |
| Debug | `http://localhost:5173/debug` |

---

## 📧 Test Accounts:

**Patient:**
- Email: `test.patient@voise.in`
- Password: `Patient@123`

**Ambulance (Bengaluru):**
- Email: `sneha.reddy@ambulance.com`
- Password: `Ambulance123`

---

## ✅ Success Criteria:

1. ✅ Patient can create request
2. ✅ Ambulance receives request on Emergency Requests page
3. ✅ Ambulance can accept request
4. ✅ Real-time status updates work
5. ✅ Complete workflow from SOS to handover

---

**Go test it now!** 🚀

The workflow is fixed and should work end-to-end!
