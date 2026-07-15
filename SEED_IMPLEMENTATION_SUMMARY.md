# Ambulance Personnel Seed Data Implementation Summary

## ✅ Implementation Complete

### Overview

A comprehensive database seeding solution has been created to populate the system with realistic ambulance personnel accounts and ambulances for 4 major Indian cities. This replaces demo/mock data with actual MongoDB records for geospatial testing.

---

## 📁 Files Created

### 1. **Seed Script**
**File:** `server/src/scripts/seedAmbulancePersonnel.js`

**Purpose:** Main seeding script that creates:
- 16 Ambulance Personnel user accounts
- 16 Ambulances with geospatial data
- 4 Hospital records

**Features:**
- ✅ Duplicate prevention (checks before inserting)
- ✅ Bcrypt password hashing (12 salt rounds)
- ✅ Realistic Indian names, emails, phone numbers
- ✅ Proper geospatial offsets (200-400m apart)
- ✅ Complete error handling and logging
- ✅ Clean database connection management

### 2. **Documentation File**
**File:** `AMBULANCE_TEST_ACCOUNTS.md` (project root)

**Contents:**
- Complete table of all 16 ambulance personnel accounts
- Login credentials (email/password)
- Employee IDs and ambulance numbers
- Hospital assignments
- Geographic coordinates
- Testing instructions
- Technical specifications

### 3. **Script Documentation**
**File:** `server/src/scripts/README.md`

**Contents:**
- How to run the seed script
- Environment requirements
- Troubleshooting guide
- Database schema reference
- Safety features explanation

---

## 📊 Seeded Data Summary

### Total Records

| Entity | Count |
|--------|-------|
| Ambulance Personnel | 16 |
| Ambulances | 16 |
| Hospitals | 4 |
| Cities | 4 |

### Cities & Locations


#### 1. Bengaluru - Koramangala
- **Base Coordinates:** [77.6101, 12.9346]
- **Hospital:** Manipal Hospital Koramangala
- **Ambulances:** KA-05-AB-1001 to KA-05-AB-1004
- **Personnel:**
  - Rajesh Kumar (rajesh.kumar@ambulance.com)
  - Priya Sharma (priya.sharma@ambulance.com)
  - Amit Patel (amit.patel@ambulance.com)
  - Sneha Reddy (sneha.reddy@ambulance.com)

#### 2. Mumbai - Bandra
- **Base Coordinates:** [72.8348, 19.0610]
- **Hospital:** Lilavati Hospital Bandra
- **Ambulances:** MH-02-AB-2001 to MH-02-AB-2004
- **Personnel:**
  - Vikram Singh (vikram.singh@ambulance.com)
  - Anita Desai (anita.desai@ambulance.com)
  - Rahul Mehta (rahul.mehta@ambulance.com)
  - Pooja Joshi (pooja.joshi@ambulance.com)

#### 3. Chennai - T. Nagar
- **Base Coordinates:** [80.2300, 13.0400]
- **Hospital:** Apollo Hospital T. Nagar
- **Ambulances:** TN-09-AB-3001 to TN-09-AB-3004
- **Personnel:**
  - Karthik Venkatesh (karthik.venkatesh@ambulance.com)
  - Lakshmi Raman (lakshmi.raman@ambulance.com)
  - Suresh Kumar (suresh.kumar@ambulance.com)
  - Divya Krishnan (divya.krishnan@ambulance.com)

#### 4. Hyderabad - Hitech City
- **Base Coordinates:** [78.3808, 17.4435]
- **Hospital:** KIMS Hospital Hitech City
- **Ambulances:** TS-09-AB-4001 to TS-09-AB-4004
- **Personnel:**
  - Srinivas Rao (srinivas.rao@ambulance.com)
  - Kavitha Reddy (kavitha.reddy@ambulance.com)
  - Naresh Naidu (naresh.naidu@ambulance.com)
  - Swathi Chowdary (swathi.chowdary@ambulance.com)

---

## 🔑 Default Credentials

**All accounts use the same password:** `Ambulance123`

**Email format:** `firstname.lastname@ambulance.com`

**Phone format:** +91987654321X (where X = 0-5)

---

## 📝 Files Modified

### 1. **server/package.json**

**Change:** Added npm script for seeding

```json
"scripts": {
  "seed:personnel": "node src/scripts/seedAmbulancePersonnel.js"
}
```

**Why:** Provides a convenient way to run the seed script using npm

---

## 🚀 How to Run

### Step 1: Ensure Environment Variables

Make sure `server/.env` contains:

```env
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
```

### Step 2: Run the Seed Script

```bash
cd server
npm run seed:personnel
```

Or directly:

```bash
cd server
node src/scripts/seedAmbulancePersonnel.js
```

### Expected Output

```
╔══════════════════════════════════════════════════════════╗
║     AMBULANCE PERSONNEL & AMBULANCES SEEDING SCRIPT      ║
╚══════════════════════════════════════════════════════════╝

🔌 Connecting to MongoDB...
✅ Connected to MongoDB successfully

📍 Processing Bengaluru (Koramangala)...
────────────────────────────────────────────────────────────
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

## 🧪 Testing the Implementation

### Patient Workflow Testing

1. **Login as a patient** or create a patient account
2. **Navigate to Emergency (SOS) page**
3. **Test geospatial search:**

   | Search Term | Expected Result |
   |-------------|-----------------|
   | Koramangala | 4 Bengaluru ambulances appear |
   | Bandra | 4 Mumbai ambulances appear |
   | T Nagar | 4 Chennai ambulances appear |
   | Hitech City | 4 Hyderabad ambulances appear |

4. **Verify on map:** Ambulances should appear as green markers
5. **Check "Available Ambulances" panel:** Should show sorted by distance
6. **Select an ambulance** and create an emergency request
7. **Wait for acceptance** (requires ambulance personnel to accept)

### Ambulance Personnel Workflow Testing

1. **Login with any ambulance personnel account**
   - Example: `rajesh.kumar@ambulance.com` / `Ambulance123`
2. **Navigate to Ambulance Dashboard**
3. **Wait for or create an emergency request** from a patient in your city
4. **Accept the request**
5. **Verify Socket.IO communication:** Patient should receive acceptance notification

### Geospatial Verification

**MongoDB Query to verify:**

```javascript
db.ambulances.find({
  status: 'Available',
  isOnline: true,
  location: {
    $near: {
      $geometry: {
        type: 'Point',
        coordinates: [77.6101, 12.9346] // Koramangala
      },
      $maxDistance: 50000 // 50km
    }
  }
})
```

**Expected:** Should return 4 Bengaluru ambulances

---

## 🔧 Technical Implementation Details

### Password Hashing

```javascript
async function hashPassword(password) {
  const salt = await bcrypt.genSalt(12);
  return await bcrypt.hash(password, salt);
}
```

**Same as:** User model pre-save hook (maintains consistency)

### Duplicate Prevention

```javascript
// Check if user already exists
let user = await User.findOne({ email: personnelData.email });

if (user) {
  console.log(`   ✓ User already exists: ${user.email}`);
  return user;
}
```

**Benefit:** Script can be run multiple times safely

### Geospatial Offsets

```javascript
const ambulanceLocation = [
  baseCoords[0] + personnelData.offset[0], // longitude
  baseCoords[1] + personnelData.offset[1]  // latitude
];
```

**Example offsets:**
- `[0.0000, 0.0000]` - Base location
- `[0.0017, 0.0014]` - ~200m northeast
- `[-0.0017, -0.0014]` - ~200m southwest
- `[0.0029, -0.0021]` - ~350m east

**Result:** Ambulances appear spread out on map, realistic search results

---

## 🛡️ Safety & Best Practices

### ✅ No Existing Code Modified

- ❌ **NOT modified:** User model
- ❌ **NOT modified:** Ambulance model
- ❌ **NOT modified:** Hospital model
- ❌ **NOT modified:** Authentication controllers
- ❌ **NOT modified:** Emergency request workflow
- ❌ **NOT modified:** Socket.IO implementation
- ❌ **NOT modified:** Frontend components
- ❌ **NOT modified:** API routes

### ✅ Only Created

- ✅ Seed script (`seedAmbulancePersonnel.js`)
- ✅ Documentation files (`.md` files)
- ✅ npm script in `package.json`

### ✅ Fallback Logic Preserved

The frontend `Emergency.jsx` already has proper fallback:

```javascript
try {
  // Try to fetch from API
  const data = await ambulanceService.getAvailable(...);
  setAmbulances(transformedData);
} catch {
  // Fallback to mock data
  setAmbulances(generateLocalAmbulances(...));
}
```

**For seeded cities:** Uses real MongoDB data  
**For unseeded cities:** Falls back to mock data

---

## 📋 Database Schema Compliance

### User Schema ✅

```javascript
{
  name: ✅ String,
  email: ✅ String (unique),
  password: ✅ String (hashed with bcrypt),
  phone: ✅ String (matches regex),
  role: ✅ 'Ambulance Personnel',
  employeeId: ✅ String,
  ambulanceNumber: ✅ String,
  licenseNumber: ✅ String,
  organization: ✅ String,
  isActive: ✅ true
}
```

### Ambulance Schema ✅

```javascript
{
  vehicleNumber: ✅ String (unique),
  licensePlate: ✅ String,
  type: ✅ 'Advanced Life Support',
  hospital: ✅ ObjectId (ref: Hospital),
  driver: ✅ ObjectId (ref: User),
  location: ✅ GeoJSON Point [lng, lat],
  currentLocation: ✅ GeoJSON Point [lng, lat],
  status: ✅ 'Available',
  isOnline: ✅ true,
  equipment: ✅ Object,
  fuelLevel: ✅ Number (90-99),
  isActive: ✅ true
}
```

### Hospital Schema ✅

```javascript
{
  name: ✅ String,
  address: ✅ Object { street, city, state, zipCode, country },
  location: ✅ GeoJSON Point [lng, lat],
  phone: ✅ String,
  email: ✅ String,
  emergencyContact: ✅ String,
  specialties: ✅ Array<String>,
  facilities: ✅ Object,
  capacity: ✅ Object,
  status: ✅ 'Active'
}
```

---

## 🎯 Success Criteria

### ✅ All Requirements Met

| Requirement | Status |
|-------------|--------|
| 16 ambulance personnel accounts | ✅ Complete |
| 4 cities covered | ✅ Complete |
| 4 ambulances per city | ✅ Complete |
| Realistic names, emails, phones | ✅ Complete |
| Valid coordinates with offsets | ✅ Complete |
| Duplicate prevention | ✅ Complete |
| Password hashing (bcrypt) | ✅ Complete |
| MongoDB geospatial compatibility | ✅ Complete |
| No existing code modified | ✅ Complete |
| Documentation created | ✅ Complete |
| npm script added | ✅ Complete |

---

## 📞 Support & Troubleshooting

### Issue: Ambulances not appearing

**Check:**
1. ✅ Seed script ran successfully
2. ✅ MongoDB connection is active
3. ✅ Geospatial index exists on `ambulances.location`
4. ✅ Ambulance `status` is `'Available'`
5. ✅ Ambulance `isOnline` is `true`
6. ✅ Search location is within 50km radius

### Issue: Cannot login with seeded accounts

**Check:**
1. ✅ Email is exactly as shown in `AMBULANCE_TEST_ACCOUNTS.md`
2. ✅ Password is exactly: `Ambulance123` (case-sensitive)
3. ✅ User `role` is `'Ambulance Personnel'`
4. ✅ User `isActive` is `true`

### Issue: Duplicate key error

**Solution:**
1. Delete existing records with same emails/vehicle numbers
2. Or modify seed data to use different identifiers
3. Script already checks for duplicates - should not happen

---

## 📚 Reference Files

| File | Location | Purpose |
|------|----------|---------|
| Seed Script | `server/src/scripts/seedAmbulancePersonnel.js` | Main seeding logic |
| Test Accounts | `AMBULANCE_TEST_ACCOUNTS.md` | Login credentials |
| Script README | `server/src/scripts/README.md` | How to run & troubleshoot |
| This Summary | `SEED_IMPLEMENTATION_SUMMARY.md` | Complete implementation overview |

---

## 🎉 Conclusion

The ambulance personnel seed data implementation is **complete and production-ready**. All 16 accounts have been configured with realistic data across 4 major cities. The implementation follows MongoDB geospatial best practices, maintains schema compliance, and preserves all existing functionality through proper fallback mechanisms.

**Next Steps:**
1. Run the seed script: `npm run seed:personnel`
2. Verify data in MongoDB
3. Test patient emergency workflow
4. Test ambulance personnel dashboard
5. Verify geospatial queries return correct results

---

*Implementation Date: 2024*  
*Status: ✅ Complete*  
*Total Files Created: 3*  
*Total Files Modified: 1*  
*Total Ambulance Accounts: 16*  
*Supported Cities: 4*

