# 🔍 Seed Data Verification Checklist

Use this checklist to verify the seed data implementation is working correctly.

---

## ✅ Pre-Seeding Verification

### Environment Setup
- [ ] `.env` file exists in `server/` directory
- [ ] `MONGODB_URI` is set in `.env`
- [ ] `JWT_SECRET` is set in `.env`
- [ ] MongoDB is running and accessible
- [ ] Node.js version >= 18.0.0
- [ ] npm version >= 9.0.0

### Database State
- [ ] MongoDB connection is working
- [ ] Database has `users` collection
- [ ] Database has `ambulances` collection
- [ ] Database has `hospitals` collection
- [ ] Geospatial indexes exist (or will be auto-created)

---

## ✅ Running the Seed Script

### Execution
- [ ] Navigate to `server/` directory: `cd server`
- [ ] Run seed command: `npm run seed:personnel`
- [ ] Script connects to MongoDB successfully
- [ ] Script completes without errors
- [ ] Script prints success summary

### Expected Console Output
```
🔌 Connecting to MongoDB...
✅ Connected to MongoDB successfully

📍 Processing Bengaluru (Koramangala)...
   ✓ Created hospital: Manipal Hospital Koramangala
   ✓ Created personnel: Rajesh Kumar (rajesh.kumar@ambulance.com)
   ✓ Created ambulance: KA-05-AB-1001 at [77.6101, 12.9346]
   ... (continues for all cities)

╔══════════════════════════════════════════════════════════╗
║                    SEEDING COMPLETE                      ║
╚══════════════════════════════════════════════════════════╝

📊 SUMMARY:
   ✓ Total ambulance personnel accounts created: 16
   ✓ Total ambulances created: 16
   ✓ Cities covered: 4
```

---

## ✅ Post-Seeding Database Verification

### MongoDB Queries

#### Check User Count
```javascript
db.users.find({ role: 'Ambulance Personnel' }).count()
```
**Expected:** `16`

#### Check Ambulance Count
```javascript
db.ambulances.find({ status: 'Available', isOnline: true }).count()
```
**Expected:** `16`

#### Check Hospital Count
```javascript
db.hospitals.find({ status: 'Active' }).count()
```
**Expected:** `4` (at minimum)

#### Verify Bengaluru Ambulances
```javascript
db.ambulances.find({
  vehicleNumber: { $regex: /^KA-05-AB/ }
})
```
**Expected:** `4` documents

#### Verify Geospatial Data
```javascript
db.ambulances.findOne({
  vehicleNumber: 'KA-05-AB-1001'
}, {
  location: 1,
  currentLocation: 1
})
```
**Expected:**
```javascript
{
  location: {
    type: 'Point',
    coordinates: [77.6101, 12.9346]
  },
  currentLocation: {
    type: 'Point',
    coordinates: [77.6101, 12.9346]
  }
}
```

#### Verify User Password is Hashed
```javascript
db.users.findOne({ email: 'rajesh.kumar@ambulance.com' }, { password: 1 })
```
**Expected:** Password should be a bcrypt hash (starts with `$2a$` or `$2b$`)

---

## ✅ Frontend Integration Testing

### Patient Workflow

#### Test 1: Bengaluru Ambulances
- [ ] Login as patient
- [ ] Go to Emergency (SOS) page
- [ ] Search for "Koramangala"
- [ ] **Verify:** 4 ambulances appear on map
- [ ] **Verify:** "Available Ambulances" panel shows 4 items
- [ ] **Verify:** Ambulances show correct vehicle numbers (KA-05-AB-100X)

#### Test 2: Mumbai Ambulances
- [ ] Search for "Bandra"
- [ ] **Verify:** 4 ambulances appear on map
- [ ] **Verify:** Ambulances show correct vehicle numbers (MH-02-AB-200X)

#### Test 3: Chennai Ambulances
- [ ] Search for "T Nagar"
- [ ] **Verify:** 4 ambulances appear on map
- [ ] **Verify:** Ambulances show correct vehicle numbers (TN-09-AB-300X)

#### Test 4: Hyderabad Ambulances
- [ ] Search for "Hitech City"
- [ ] **Verify:** 4 ambulances appear on map
- [ ] **Verify:** Ambulances show correct vehicle numbers (TS-09-AB-400X)

#### Test 5: Unsupported Location Fallback
- [ ] Search for "Delhi" or any unseeded location
- [ ] **Verify:** Mock/demo ambulances appear (fallback works)

### Request Creation
- [ ] Select an ambulance from Koramangala
- [ ] Click "REQUEST THIS AMBULANCE"
- [ ] **Verify:** Emergency request is created
- [ ] **Verify:** Status shows "Waiting for ambulance personnel to accept"

---

## ✅ Ambulance Personnel Testing

### Login Verification

#### Test Bengaluru Account
- [ ] Email: `rajesh.kumar@ambulance.com`
- [ ] Password: `Ambulance123`
- [ ] **Verify:** Login successful
- [ ] **Verify:** Role is "Ambulance Personnel"
- [ ] **Verify:** Dashboard loads

#### Test Mumbai Account
- [ ] Email: `vikram.singh@ambulance.com`
- [ ] Password: `Ambulance123`
- [ ] **Verify:** Login successful

#### Test Chennai Account
- [ ] Email: `karthik.venkatesh@ambulance.com`
- [ ] Password: `Ambulance123`
- [ ] **Verify:** Login successful

#### Test Hyderabad Account
- [ ] Email: `srinivas.rao@ambulance.com`
- [ ] Password: `Ambulance123`
- [ ] **Verify:** Login successful

### Emergency Request Handling
- [ ] Login as ambulance personnel
- [ ] **Verify:** Can see pending emergency requests (if any exist)
- [ ] Create emergency request from patient side
- [ ] **Verify:** Ambulance personnel receives Socket.IO notification
- [ ] Accept the request
- [ ] **Verify:** Patient receives acceptance notification

---

## ✅ Geospatial Query Testing

### Backend API Testing

#### Test 1: Koramangala Search
```bash
curl "http://localhost:5000/api/ambulances/available?longitude=77.6101&latitude=12.9346&maxDistance=50000" \
  -H "Authorization: Bearer YOUR_TOKEN"
```
**Expected:** Returns 4 Bengaluru ambulances

#### Test 2: Bandra Search
```bash
curl "http://localhost:5000/api/ambulances/available?longitude=72.8348&latitude=19.0610&maxDistance=50000" \
  -H "Authorization: Bearer YOUR_TOKEN"
```
**Expected:** Returns 4 Mumbai ambulances

#### Test 3: Wide Radius Search
```bash
curl "http://localhost:5000/api/ambulances/available?longitude=77.6101&latitude=12.9346&maxDistance=500000" \
  -H "Authorization: Bearer YOUR_TOKEN"
```
**Expected:** May return ambulances from multiple cities

---

## ✅ Data Integrity Checks

### User Data
- [ ] All 16 users have unique emails
- [ ] All passwords are hashed (not plaintext)
- [ ] All users have `role: 'Ambulance Personnel'`
- [ ] All users have `isActive: true`
- [ ] Phone numbers match regex pattern
- [ ] Employee IDs are unique

### Ambulance Data
- [ ] All 16 ambulances have unique vehicle numbers
- [ ] All ambulances have `status: 'Available'`
- [ ] All ambulances have `isOnline: true`
- [ ] All ambulances have valid driver references
- [ ] All ambulances have valid hospital references
- [ ] All locations use GeoJSON Point format
- [ ] Coordinates are [longitude, latitude] order

### Hospital Data
- [ ] All 4 hospitals have unique names
- [ ] All hospitals have valid addresses
- [ ] All hospitals have geospatial coordinates
- [ ] All hospitals have `status: 'Active'`

---

## ✅ Error Scenarios

### Re-run Seed Script
- [ ] Run seed script again: `npm run seed:personnel`
- [ ] **Verify:** Script detects existing records
- [ ] **Verify:** Script prints "already exists" messages
- [ ] **Verify:** No duplicate key errors
- [ ] **Verify:** Script completes successfully

### Invalid Credentials
- [ ] Try login with: `rajesh.kumar@ambulance.com` / `WrongPassword`
- [ ] **Verify:** Login fails with appropriate error
- [ ] Try login with: `nonexistent@ambulance.com` / `Ambulance123`
- [ ] **Verify:** Login fails with appropriate error

---

## ✅ Performance Checks

### Response Times
- [ ] Geospatial query completes in < 500ms
- [ ] Frontend search loads ambulances in < 2s
- [ ] Emergency request creation completes in < 1s

### Database Indexes
```javascript
db.ambulances.getIndexes()
```
- [ ] **Verify:** Index on `location` exists (2dsphere)
- [ ] **Verify:** Index on `vehicleNumber` exists
- [ ] **Verify:** Index on `status` exists

```javascript
db.users.getIndexes()
```
- [ ] **Verify:** Index on `email` exists (unique)
- [ ] **Verify:** Index on `role` exists

---

## 🎯 Final Verification

### All Green Checks
- [ ] All 16 ambulance personnel can login
- [ ] All 4 cities return correct ambulances
- [ ] Emergency request workflow works end-to-end
- [ ] Socket.IO notifications work
- [ ] Geospatial queries return correct results
- [ ] No console errors in frontend
- [ ] No errors in backend logs

### Documentation
- [ ] `AMBULANCE_TEST_ACCOUNTS.md` is available
- [ ] `SEED_IMPLEMENTATION_SUMMARY.md` is available
- [ ] `server/src/scripts/README.md` is available
- [ ] `QUICK_SEED_REFERENCE.md` is available

---

## 🐛 Common Issues & Solutions

### Issue: "No ambulances found"
**Check:**
- Seed script ran successfully
- Ambulances have `status: 'Available'` and `isOnline: true`
- Geospatial indexes exist
- Search radius is adequate (50km default)

### Issue: "Login failed"
**Check:**
- Email is exact (case-sensitive)
- Password is exactly `Ambulance123`
- User `isActive: true`
- User `role: 'Ambulance Personnel'`

### Issue: "Duplicate key error"
**Check:**
- Manually created records conflict with seed data
- Delete conflicting records or modify seed data

---

## ✅ Sign-Off

**Seeding Date:** _______________  
**Verified By:** _______________  
**All Checks Passed:** [ ] Yes [ ] No  
**Notes:** _____________________

---

*Use this checklist every time you seed the database to ensure consistency and reliability.*

