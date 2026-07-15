# Ambulance Test Accounts

This document contains all seeded ambulance personnel accounts for testing purposes.

**Default Password for All Accounts:** `Ambulance123`

---

## 🏙️ Bengaluru (Koramangala) - 4 Ambulances

**Hospital:** Manipal Hospital Koramangala

| Driver Name | Email | Password | Employee ID | Ambulance Number | Latitude | Longitude | Status |
|-------------|-------|----------|-------------|------------------|----------|-----------|--------|
| Rajesh Kumar | rajesh.kumar@ambulance.com | Ambulance123 | BLR-EMP-001 | KA-05-AB-1001 | 12.934600 | 77.610100 | Available |
| Priya Sharma | priya.sharma@ambulance.com | Ambulance123 | BLR-EMP-002 | KA-05-AB-1002 | 12.935900 | 77.611800 | Available |
| Amit Patel | amit.patel@ambulance.com | Ambulance123 | BLR-EMP-003 | KA-05-AB-1003 | 12.933200 | 77.608400 | Available |
| Sneha Reddy | sneha.reddy@ambulance.com | Ambulance123 | BLR-EMP-004 | KA-05-AB-1004 | 12.932500 | 77.613000 | Available |

**Hospital Details:**
- Address: 98, Rustom Bagh, HAL Old Airport Road, Bengaluru, Karnataka 560017
- Phone: +918061512345
- Emergency: +918061512222

---

## 🏙️ Mumbai (Bandra) - 4 Ambulances

**Hospital:** Lilavati Hospital Bandra

| Driver Name | Email | Password | Employee ID | Ambulance Number | Latitude | Longitude | Status |
|-------------|-------|----------|-------------|------------------|----------|-----------|--------|
| Vikram Singh | vikram.singh@ambulance.com | Ambulance123 | MUM-EMP-001 | MH-02-AB-2001 | 19.061000 | 72.834800 | Available |
| Anita Desai | anita.desai@ambulance.com | Ambulance123 | MUM-EMP-002 | MH-02-AB-2002 | 19.062800 | 72.836900 | Available |
| Rahul Mehta | rahul.mehta@ambulance.com | Ambulance123 | MUM-EMP-003 | MH-02-AB-2003 | 19.062500 | 72.832300 | Available |
| Pooja Joshi | pooja.joshi@ambulance.com | Ambulance123 | MUM-EMP-004 | MH-02-AB-2004 | 19.059100 | 72.838000 | Available |

**Hospital Details:**
- Address: A-791, Bandra Reclamation, Mumbai, Maharashtra 400050
- Phone: +912226408111
- Emergency: +912226408888

---

## 🏙️ Chennai (T. Nagar) - 4 Ambulances

**Hospital:** Apollo Hospital T. Nagar

| Driver Name | Email | Password | Employee ID | Ambulance Number | Latitude | Longitude | Status |
|-------------|-------|----------|-------------|------------------|----------|-----------|--------|
| Karthik Venkatesh | karthik.venkatesh@ambulance.com | Ambulance123 | CHE-EMP-001 | TN-09-AB-3001 | 13.040000 | 80.230000 | Available |
| Lakshmi Raman | lakshmi.raman@ambulance.com | Ambulance123 | CHE-EMP-002 | TN-09-AB-3002 | 13.041600 | 80.231900 | Available |
| Suresh Kumar | suresh.kumar@ambulance.com | Ambulance123 | CHE-EMP-003 | TN-09-AB-3003 | 13.038300 | 80.227700 | Available |
| Divya Krishnan | divya.krishnan@ambulance.com | Ambulance123 | CHE-EMP-004 | TN-09-AB-3004 | 13.037900 | 80.232800 | Available |

**Hospital Details:**
- Address: 21, Greams Lane, Off Greams Road, Chennai, Tamil Nadu 600006
- Phone: +914428290200
- Emergency: +914428295555

---

## 🏙️ Hyderabad (Hitech City) - 4 Ambulances

**Hospital:** KIMS Hospital Hitech City

| Driver Name | Email | Password | Employee ID | Ambulance Number | Latitude | Longitude | Status |
|-------------|-------|----------|-------------|------------------|----------|-----------|--------|
| Srinivas Rao | srinivas.rao@ambulance.com | Ambulance123 | HYD-EMP-001 | TS-09-AB-4001 | 17.443500 | 78.380800 | Available |
| Kavitha Reddy | kavitha.reddy@ambulance.com | Ambulance123 | HYD-EMP-002 | TS-09-AB-4002 | 17.445200 | 78.382800 | Available |
| Naresh Naidu | naresh.naidu@ambulance.com | Ambulance123 | HYD-EMP-003 | TS-09-AB-4003 | 17.445100 | 78.378400 | Available |
| Swathi Chowdary | swathi.chowdary@ambulance.com | Ambulance123 | HYD-EMP-004 | TS-09-AB-4004 | 17.441500 | 78.383900 | Available |

**Hospital Details:**
- Address: 1-8-31/1, Minister Road, Hyderabad, Telangana 500003
- Phone: +914040088888
- Emergency: +914040089999

---

## 📋 Testing Instructions

### Patient Testing

1. **Login as a patient** to the application
2. **Navigate to Emergency (SOS) page**
3. **Search for a supported location:**
   - Type "Koramangala" → Should show 4 Bengaluru ambulances
   - Type "Bandra" → Should show 4 Mumbai ambulances
   - Type "T Nagar" → Should show 4 Chennai ambulances
   - Type "Hitech City" → Should show 4 Hyderabad ambulances

### Ambulance Personnel Testing

1. **Login with any ambulance personnel account** from the tables above
2. **Navigate to Ambulance Dashboard**
3. **View pending emergency requests** from patients in your area
4. **Accept or reject requests** as needed

### Geospatial Testing

All ambulances are positioned with realistic offsets (200-400 meters apart) to ensure:
- MongoDB geospatial queries return multiple results
- Distance calculations are realistic
- Map display shows proper clustering

---

## 🔧 Technical Details

### Ambulance Specifications

All seeded ambulances have the following specifications:

- **Type:** Advanced Life Support (ALS)
- **Model:** Force Traveller
- **Year:** 2023
- **Capacity:** 2 patients
- **Status:** Available
- **Online Status:** Online
- **Fuel Level:** 90-99%
- **Equipment:**
  - ✅ Defibrillator
  - ✅ Oxygen Supply
  - ✅ Ventilator
  - ✅ Stretcher
  - ✅ First Aid Kit
  - ✅ Spinal Board

### User Account Details

- **Role:** Ambulance Personnel
- **Active Status:** true
- **Password:** Hashed using bcrypt with salt rounds = 12
- **Phone Format:** +919876543210 to +919876543225

---

## 🚀 Running the Seed Script

To seed the database, run:

```bash
cd server
node src/scripts/seedAmbulancePersonnel.js
```

Or if using npm scripts:

```bash
npm run seed:ambulances
```

---

## 📌 Notes

- All ambulances are set to **Available** status by default
- All personnel accounts are **Active**
- Coordinates use **[longitude, latitude]** format (GeoJSON standard)
- Geospatial indexes are automatically created by MongoDB on the `location` field
- Each city has ambulances offset by 200-400 meters to ensure realistic search results

---

*Last Updated: 2024*
*Generated by Ambulance Personnel Seeding Script*

