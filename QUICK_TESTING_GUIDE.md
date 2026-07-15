# Quick Testing Guide - Role-Based Pages

## Test Accounts

### Patient Account
```
Email: patient@example.com
Password: [Your patient test password]
Role: Patient
```

### Ambulance Personnel Account
```
Email: ambulance001@tracker.com
Password: Ambulance123
Role: Ambulance Personnel
(Use any account from AMBULANCE_TEST_ACCOUNTS.md)
```

---

## Quick Test Scenarios

### Test 1: Hospital Page - Patient View ✓

**Steps:**
1. Login as **Patient**
2. Navigate to `/hospital`
3. **Expected Results:**
   - ✅ See "Your Assigned Hospital" heading
   - ✅ Only ONE hospital shown (if assigned)
   - ✅ No dropdown to select hospitals
   - ✅ No location search input
   - ✅ Map is not interactive
   - ✅ "Continue to Vitals" button visible

**What to Check:**
- Can you see any hospital selection options? (Should be NO)
- Can you interact with the map? (Should be NO)
- Is the interface clean and simple? (Should be YES)

---

### Test 2: Hospital Page - Ambulance View ✓

**Steps:**
1. Login as **Ambulance Personnel**
2. Navigate to `/hospital`
3. **Expected Results:**
   - ✅ See "Bangalore Emergency Hospitals" heading
   - ✅ Dropdown with all hospitals
   - ✅ Location search input field
   - ✅ Interactive map
   - ✅ Can click hospitals on map
   - ✅ "Accept Selected Hospital" button
   - ✅ Stats panel with hospital counts

**What to Check:**
- Can you select different hospitals? (Should be YES)
- Can you search for locations? (Should be YES)
- Does clicking a hospital on map select it? (Should be YES)
- Can you accept and dispatch? (Should be YES)

---

### Test 3: Vitals Page - Patient View ✓

**Steps:**
1. Login as **Patient**
2. Navigate to `/vitals`
3. **Expected Results:**
   - ✅ See "Your Vital Signs (Read Only)" heading
   - ✅ "View Only Mode" badge visible
   - ✅ Current vitals displayed (HR, SpO₂, Temp, BP)
   - ✅ Live graph visible
   - ✅ No input fields
   - ✅ No Start/Stop buttons
   - ✅ No records table

**What to Check:**
- Can you see any controls to modify vitals? (Should be NO)
- Is "View Only Mode" badge visible? (Should be YES)
- Can you see monitoring controls? (Should be NO)

---

### Test 4: Vitals Page - Ambulance View ✓

**Steps:**
1. Login as **Ambulance Personnel**
2. Navigate to `/vitals`
3. **Expected Results:**
   - ✅ See "IoT Vital Monitoring" heading
   - ✅ Patient name input field visible
   - ✅ Start/Stop monitoring buttons
   - ✅ Current vitals displayed
   - ✅ Live graph
   - ✅ Saved records table
   - ✅ Clear table button
   - ✅ Doctor Portal button

**What to Check:**
- Can you start/stop monitoring? (Should be YES)
- Does monitoring generate live data? (Should be YES)
- Does the records table populate? (Should be YES)
- Can you navigate to Doctor Portal? (Should be YES)

---

## Quick Visual Checklist

### Patient Dashboard vs Ambulance Dashboard

| Feature | Patient | Ambulance |
|---------|---------|-----------|
| **Hospital Page** |
| Select Hospital | ❌ | ✅ |
| Search Location | ❌ | ✅ |
| Interactive Map | ❌ | ✅ |
| View Assigned | ✅ | ✅ |
| **Vitals Page** |
| View Vitals | ✅ | ✅ |
| Edit Vitals | ❌ | ✅ |
| Start/Stop | ❌ | ✅ |
| Records Table | ❌ | ✅ |

---

## Common Issues & Solutions

### Issue 1: "I see ambulance features as a patient"
**Solution:** 
- Check user role in profile
- Verify login credentials
- Clear browser cache and localStorage
- Re-login

### Issue 2: "Map not showing on patient view"
**Solution:**
- Ensure hospital is assigned in workflow context
- Check browser console for errors
- Verify localStorage has 'selected_hospital'

### Issue 3: "Vitals showing '--' values"
**Solution (Ambulance Personnel):**
- Click "Start Monitoring" button
- Enter patient name first
- Wait 1 second for first data point

**Solution (Patient):**
- Vitals only show when ambulance personnel starts monitoring
- Contact ambulance team to begin monitoring

---

## One-Minute Smoke Test

**Quick verification that everything works:**

```bash
✓ Login as Patient → Go to /hospital → Should see read-only view
✓ Login as Patient → Go to /vitals → Should see "View Only Mode"
✓ Login as Ambulance → Go to /hospital → Should see selection dropdown
✓ Login as Ambulance → Go to /vitals → Should see Start button
✓ Both roles → Go to /profile → Should work normally
✓ Both roles → Go to /settings → Should work normally
```

**If all 6 checks pass → Implementation is working correctly!**

---

## Browser Testing

Test on multiple browsers:
- ✅ Chrome/Edge (Chromium)
- ✅ Firefox
- ✅ Safari (if on Mac)

---

## Mobile Testing

Test responsive design:
- ✅ Mobile view (< 768px)
- ✅ Tablet view (768px - 1024px)
- ✅ Desktop view (> 1024px)

---

## Report Issues

If you find any issues, note:
1. User role (Patient or Ambulance Personnel)
2. Page name (/hospital or /vitals)
3. What you expected vs what happened
4. Browser and device
5. Console errors (F12 → Console tab)

---

**Testing Time Estimate:** 10-15 minutes for complete testing of both pages with both roles.
