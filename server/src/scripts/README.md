# Database Seeding Scripts

This directory contains scripts for seeding the database with test data.

## Available Scripts

### 1. Ambulance Personnel Seeding (`seedAmbulancePersonnel.js`)

Seeds the database with 16 ambulance personnel accounts and their associated ambulances across 4 major cities.

#### What it creates:

- **16 Ambulance Personnel User Accounts**
- **16 Ambulances** with realistic geospatial data
- **4 Hospitals** (one per city)

#### Cities Covered:

1. **Bengaluru (Koramangala)** - 4 ambulances
2. **Mumbai (Bandra)** - 4 ambulances
3. **Chennai (T. Nagar)** - 4 ambulances
4. **Hyderabad (Hitech City)** - 4 ambulances

#### Features:

✅ **No Duplicates** - Checks if accounts/ambulances already exist before inserting  
✅ **Realistic Data** - Uses proper Indian names, phone numbers, and locations  
✅ **Geospatial Offsets** - Ambulances are 200-400 meters apart for realistic queries  
✅ **Password Hashing** - Uses bcrypt with 12 salt rounds (same as production)  
✅ **Proper Schema** - Matches existing User and Ambulance models exactly  

#### Running the Script:

```bash
# From the server directory
cd server

# Run the seed script
npm run seed:personnel

# Or directly with node
node src/scripts/seedAmbulancePersonnel.js
```

#### Output:

The script will print:
- ✓ Total ambulance personnel accounts created
- ✓ Total ambulances created
- ✓ Cities inserted
- ✓ Login emails for all accounts
- ✓ Ambulance numbers

#### Testing:

After seeding, test geospatial queries:

1. **As Patient:**
   - Search "Koramangala" → See 4 Bengaluru ambulances
   - Search "Bandra" → See 4 Mumbai ambulances
   - Search "T Nagar" → See 4 Chennai ambulances
   - Search "Hitech City" → See 4 Hyderabad ambulances

2. **As Ambulance Personnel:**
   - Login with any account from `AMBULANCE_TEST_ACCOUNTS.md`
   - Default password: `Ambulance123`
   - View and accept emergency requests

#### Account Details:

See `AMBULANCE_TEST_ACCOUNTS.md` in the project root for:
- Complete list of all seeded accounts
- Login credentials
- Ambulance numbers
- Hospital details
- Geographic coordinates

---

## Environment Requirements

Make sure your `.env` file contains:

```env
MONGODB_URI=mongodb://localhost:27017/your-database
# or MongoDB Atlas connection string
```

---

## Safety Features

- ✅ Checks for existing records (no duplicates)
- ✅ Validates MongoDB connection before seeding
- ✅ Gracefully closes database connection
- ✅ Detailed error messages
- ✅ Transaction-safe (each city is processed independently)

---

## Troubleshooting

### Error: "Missing required environment variables"

**Solution:** Ensure `.env` file has `MONGODB_URI` defined

### Error: "E11000 duplicate key error"

**Solution:** The script already checks for duplicates, but if you manually created accounts with the same emails/vehicle numbers, you'll need to delete them first or modify the seed data.

### No ambulances showing in frontend

**Solution:**
1. Verify ambulances were created: Check MongoDB collection
2. Check ambulance status: Must be `Available` and `isOnline: true`
3. Check search radius: Default is 50km, ensure your search location is within range
4. Check coordinates format: Must be `[longitude, latitude]` (GeoJSON standard)

---

## Database Schema Reference

### User (Ambulance Personnel)

```javascript
{
  name: String,
  email: String (unique),
  password: String (hashed),
  phone: String,
  role: 'Ambulance Personnel',
  employeeId: String,
  ambulanceNumber: String,
  licenseNumber: String,
  organization: String,
  isActive: Boolean
}
```

### Ambulance

```javascript
{
  vehicleNumber: String (unique),
  licensePlate: String,
  type: 'Advanced Life Support',
  hospital: ObjectId,
  driver: ObjectId,
  location: {
    type: 'Point',
    coordinates: [longitude, latitude]
  },
  currentLocation: {
    type: 'Point',
    coordinates: [longitude, latitude]
  },
  status: 'Available',
  isOnline: true,
  equipment: { ... },
  fuelLevel: Number,
  isActive: Boolean
}
```

### Hospital

```javascript
{
  name: String,
  address: {
    street, city, state, zipCode, country
  },
  location: {
    type: 'Point',
    coordinates: [longitude, latitude]
  },
  phone: String,
  email: String,
  emergencyContact: String,
  specialties: [String],
  capacity: { ... },
  status: 'Active'
}
```

---

*Last Updated: 2024*

