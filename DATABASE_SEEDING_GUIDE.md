# Database Seeding Guide - Ambulance Data

## Overview
This guide will help you populate your MongoDB database with sample ambulance data so you can see available ambulances in the application.

---

## What This Seeds

The seed script will create **10 ambulances** across 4 major Indian cities:

### Bangalore (4 ambulances)
- **KA-01-AB-1001** - Advanced Life Support - Koramangala (77.6285, 12.9279)
- **KA-01-AB-1002** - Basic Life Support - Whitefield (77.6408, 12.9698)
- **KA-01-AB-1003** - Advanced Life Support - Indiranagar (77.6412, 12.9716)
- **KA-01-AB-1004** - Patient Transport - MG Road (77.5946, 12.9716)

### Delhi (2 ambulances)
- **DL-01-AB-2001** - Advanced Life Support - Connaught Place (77.2199, 28.6315)
- **DL-01-AB-2002** - Basic Life Support - India Gate (77.2090, 28.6139)

### Mumbai (2 ambulances)
- **MH-01-AB-3001** - Advanced Life Support - Bandra (72.8348, 19.0610)
- **MH-01-AB-3002** - Basic Life Support - Andheri (72.8777, 19.0760)

### Chennai (2 ambulances)
- **TN-01-AB-4001** - Advanced Life Support - T Nagar (80.2300, 13.0400)
- **TN-01-AB-4002** - Basic Life Support - Anna Nagar (80.2707, 13.0827)

---

## Prerequisites

1. ✅ MongoDB is running (local or Atlas)
2. ✅ `.env` file is configured with `MONGODB_URI`
3. ✅ Server dependencies are installed (`npm install`)

---

## How to Run the Seeder

### Step 1: Navigate to Server Directory
```bash
cd server
```

### Step 2: Run the Seed Script
```bash
npm run seed:ambulances
```

### Expected Output:
```
🔄 Connecting to MongoDB...
✅ Connected to MongoDB
🔍 Finding hospital and users...
✅ Created hospital: City General Hospital (if no hospital exists)
✅ Created driver: Sample Driver (if no driver exists)
🗑️  Clearing existing ambulances...
✅ Existing ambulances cleared
📝 Creating ambulances...
✅ Created: KA-01-AB-1001 at [77.6285, 12.9279]
✅ Created: KA-01-AB-1002 at [77.6408, 12.9698]
... (continues for all 10 ambulances)

🎉 Successfully seeded 10 ambulances!

📍 Ambulance Locations:
  - Bangalore (Koramangala, Whitefield, Indiranagar, MG Road): 4 ambulances
  - Delhi (Connaught Place, India Gate): 2 ambulances
  - Mumbai (Bandra, Andheri): 2 ambulances
  - Chennai (T Nagar, Anna Nagar): 2 ambulances

💡 Search for these locations in the app to see ambulances!
```

---

## How to Test in the Application

### Step 1: Login as Patient
Use your patient account credentials

### Step 2: Search for Location
In the Emergency page search box, enter one of these locations:

**Bangalore:**
- `Koramangala, Bangalore`
- `Whitefield, Bangalore`
- `Indiranagar, Bangalore`
- `MG Road, Bangalore`

**Delhi:**
- `Connaught Place, Delhi`
- `India Gate, Delhi`

**Mumbai:**
- `Bandra, Mumbai`
- `Andheri, Mumbai`

**Chennai:**
- `T Nagar, Chennai`
- `Anna Nagar, Chennai`

### Step 3: See Results
You should now see:
- ✅ Ambulances on the map with markers
- ✅ Available ambulance list on the right panel
- ✅ Distance calculations
- ✅ Live tracking simulation

---

## Troubleshooting

### Issue: "No ambulances found"
**Solution:**
1. Check MongoDB connection in `.env`
2. Verify the seed script ran successfully
3. Check MongoDB Compass/Shell:
   ```javascript
   db.ambulances.find({ status: "Available" })
   ```

### Issue: "Connection refused"
**Solution:**
1. Ensure MongoDB is running
2. Check `MONGODB_URI` in `.env` file
3. For Atlas: Check network access whitelist

### Issue: "Ambulances show [0, 0] coordinates"
**Solution:**
- Re-run the seed script: `npm run seed:ambulances`
- The script will clear old data and insert fresh coordinates

### Issue: "Cannot find module"
**Solution:**
- Make sure you're in the `server` directory
- Run `npm install` to ensure dependencies are installed

---

## Verify Data in MongoDB

### Using MongoDB Compass:
1. Connect to your database
2. Navigate to `ambulances` collection
3. You should see 10 documents
4. Check `location.coordinates` field - should have valid [longitude, latitude]
5. Check `status` field - should be "Available"

### Using MongoDB Shell:
```javascript
// Count ambulances
db.ambulances.countDocuments()
// Should return: 10

// Check available ambulances
db.ambulances.find({ status: "Available" }).pretty()

// Check ambulances near Koramangala (50km radius)
db.ambulances.find({
  location: {
    $near: {
      $geometry: {
        type: "Point",
        coordinates: [77.6285, 12.9279]
      },
      $maxDistance: 50000
    }
  }
})
```

---

## What the Seed Script Does

1. **Connects to MongoDB** using your `.env` configuration
2. **Finds or creates** a sample hospital (required for ambulance association)
3. **Finds or creates** a sample ambulance personnel/driver user
4. **Clears existing ambulances** (to avoid duplicates)
5. **Creates 10 ambulances** with:
   - Valid vehicle numbers
   - GPS coordinates (longitude, latitude)
   - Equipment details
   - Status set to "Available"
   - Associated hospital and driver
6. **Exits cleanly** with success message

---

## Re-running the Seeder

You can run the seeder multiple times safely. It will:
- ✅ Clear old ambulance data
- ✅ Insert fresh data
- ✅ Update coordinates

Just run: `npm run seed:ambulances`

---

## Next Steps After Seeding

1. **Start your backend server:**
   ```bash
   npm run dev
   ```

2. **Start your frontend:**
   ```bash
   cd ../client
   npm run dev
   ```

3. **Test the application:**
   - Login as patient
   - Search for "Koramangala, Bangalore"
   - You should see ambulances on the map!

---

## Important Notes

⚠️ **Status Field:** All seeded ambulances have `status: "Available"` - they will show up in searches

⚠️ **Coordinates Format:** MongoDB uses `[longitude, latitude]` (NOT latitude first!)

⚠️ **2dsphere Index:** The Ambulance model already has a geospatial index on the `location` field

⚠️ **Distance Queries:** The backend API calculates distance using MongoDB's `$geoNear` aggregation

---

## File Locations

- **Seed Script:** `server/src/utils/seedAmbulances.js`
- **Ambulance Model:** `server/src/models/Ambulance.js`
- **Package.json:** `server/package.json` (contains `seed:ambulances` script)

---

## Success! 🎉

After seeding, you should be able to:
1. ✅ Search for locations in the app
2. ✅ See real ambulances from MongoDB
3. ✅ View ambulances on the map
4. ✅ See distance calculations
5. ✅ Accept and dispatch ambulances

Enjoy testing your TrackER AI application with real data!
