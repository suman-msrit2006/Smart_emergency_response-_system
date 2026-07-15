# 🧪 Test Ambulance Display - Quick Checklist

## Before Testing

- [ ] Seed script has been run: `npm run seed:personnel`
- [ ] Frontend is running: `npm run dev` (client folder)
- [ ] Backend is running: `npm start` (server folder)
- [ ] Browser cache cleared (Ctrl+Shift+Delete)
- [ ] Console open to check for errors (F12)

---

## Test 1: Koramangala (Bengaluru)

1. [ ] Login as patient
2. [ ] Go to Emergency (SOS) page
3. [ ] Type "koramangala" in search box
4. [ ] Click "Search" button

**Expected Results:**
- [ ] Toast notification: "Found 4 ambulances nearby"
- [ ] Stats panel shows: **4** Total Nearby, **4** AVAILABLE
- [ ] **"Available Ambulances" panel shows 4 cards** ← MAIN FIX
- [ ] Each card shows:
  - [ ] Vehicle number (KA-05-AB-100X)
  - [ ] Status badge: AVAILABLE (green)
  - [ ] Distance in km (e.g., "2.5 km away")
  - [ ] ETA in minutes (e.g., "~10 min ETA")
  - [ ] First card has "FASTEST" badge
- [ ] Map shows 4 green markers near Koramangala
- [ ] Ambulances sorted by distance (closest first)

---

## Test 2: Bandra (Mumbai)

1. [ ] Clear search box
2. [ ] Type "bandra" in search box
3. [ ] Click "Search" button

**Expected Results:**
- [ ] Toast: "Found 4 ambulances nearby"
- [ ] Stats: **4** AVAILABLE
- [ ] **"Available Ambulances" panel shows 4 cards**
- [ ] Vehicle numbers: MH-02-AB-200X
- [ ] Map shows 4 green markers near Bandra

---

## Test 3: T Nagar (Chennai)

1. [ ] Clear search box
2. [ ] Type "t nagar" in search box
3. [ ] Click "Search" button

**Expected Results:**
- [ ] Toast: "Found 4 ambulances nearby"
- [ ] Stats: **4** AVAILABLE
- [ ] **"Available Ambulances" panel shows 4 cards**
- [ ] Vehicle numbers: TN-09-AB-300X
- [ ] Map shows 4 green markers near T Nagar

---

## Test 4: Hitech City (Hyderabad)

1. [ ] Clear search box
2. [ ] Type "hitech city" in search box
3. [ ] Click "Search" button

**Expected Results:**
- [ ] Toast: "Found 4 ambulances nearby"
- [ ] Stats: **4** AVAILABLE
- [ ] **"Available Ambulances" panel shows 4 cards**
- [ ] Vehicle numbers: TS-09-AB-400X
- [ ] Map shows 4 green markers near Hitech City

---

## Test 5: Ambulance Selection

1. [ ] Search for any supported location
2. [ ] Click on any ambulance card
3. [ ] Verify card is highlighted (blue border)
4. [ ] Verify "SELECTED" badge appears
5. [ ] Verify "REQUEST THIS AMBULANCE" button appears at bottom of card

---

## Test 6: Emergency Request Creation

1. [ ] Select an ambulance
2. [ ] Click "REQUEST THIS AMBULANCE" button (either on card or at bottom)
3. [ ] Verify request is created
4. [ ] Verify status changes to "Waiting for ambulance personnel to accept..."

---

## Test 7: Unsupported Location (Fallback)

1. [ ] Type "delhi" or "kolkata" in search box
2. [ ] Click "Search" button

**Expected Results:**
- [ ] Toast: "Using demo ambulance data for your area"
- [ ] Mock/demo ambulances appear (not from database)
- [ ] System still functional (fallback works)

---

## 🐛 Common Issues & Solutions

### Issue: "Available Ambulances" panel still empty

**Check:**
1. Open browser console (F12)
2. Look for errors related to:
   - `status` field
   - `distance` calculation
   - API response
3. Verify backend is returning ambulances:
   ```javascript
   // In console, after search:
   console.log(ambulances)
   // Should show array with 4 items, each having:
   // - status: 'available' (lowercase)
   // - distance: number (e.g., 2.5)
   ```

### Issue: Toast shows "Using demo ambulance data"

**Possible reasons:**
1. Seed script not run
2. Ambulances not in database
3. Backend not running
4. API endpoint returning error

**Verify in MongoDB:**
```javascript
db.ambulances.find({ 
  vehicleNumber: /^KA-05-AB/ 
}).count()
// Should return: 4
```

### Issue: Ambulances show but no distance

**Check:**
1. `userLoc` is set correctly
2. `haversineDistance` function is calculating
3. Console for distance calculation errors

---

## ✅ All Tests Passed?

If all tests pass:
- [x] Ambulance display is working correctly
- [x] All 4 cities are functional
- [x] Distance calculation is accurate
- [x] Sorting is correct
- [x] Selection workflow works
- [x] Emergency request creation works

**Status: Ready for Production** 🎉

---

## 📸 Screenshot Checklist

Take screenshots of:
1. [ ] Koramangala search with 4 ambulances displayed
2. [ ] Available Ambulances panel with all cards visible
3. [ ] Map showing ambulance markers
4. [ ] Selected ambulance with highlight and button
5. [ ] Emergency request pending state

---

*Last Updated: After Fix Application*

