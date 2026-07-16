import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User.js';
import Ambulance from '../models/Ambulance.js';
import Hospital from '../models/Hospital.js';

dotenv.config();

/**
 * Clean up seeded ambulance personnel data
 * This script removes all seeded users, ambulances, and hospitals
 */

const SEEDED_EMAILS = [
  // Bengaluru
  'rajesh.kumar@ambulance.com',
  'priya.sharma@ambulance.com',
  'amit.patel@ambulance.com',
  'sneha.reddy@ambulance.com',
  // Mumbai
  'vikram.singh@ambulance.com',
  'anita.desai@ambulance.com',
  'rahul.mehta@ambulance.com',
  'pooja.joshi@ambulance.com',
  // Chennai
  'karthik.venkatesh@ambulance.com',
  'lakshmi.raman@ambulance.com',
  'suresh.kumar@ambulance.com',
  'divya.krishnan@ambulance.com',
  // Hyderabad
  'srinivas.rao@ambulance.com',
  'kavitha.reddy@ambulance.com',
  'naresh.naidu@ambulance.com',
  'swathi.chowdary@ambulance.com'
];

const SEEDED_AMBULANCES = [
  'KA-05-AB-1001', 'KA-05-AB-1002', 'KA-05-AB-1003', 'KA-05-AB-1004',
  'MH-02-AB-2001', 'MH-02-AB-2002', 'MH-02-AB-2003', 'MH-02-AB-2004',
  'TN-09-AB-3001', 'TN-09-AB-3002', 'TN-09-AB-3003', 'TN-09-AB-3004',
  'TS-09-AB-4001', 'TS-09-AB-4002', 'TS-09-AB-4003', 'TS-09-AB-4004'
];

const SEEDED_HOSPITALS = [
  'Manipal Hospital Koramangala',
  'Lilavati Hospital Bandra',
  'Apollo Hospital T. Nagar',
  'KIMS Hospital Hitech City'
];

async function cleanAmbulancePersonnel() {
  console.log('\n╔══════════════════════════════════════════════════════════╗');
  console.log('║         CLEANING AMBULANCE PERSONNEL DATA                ║');
  console.log('╚══════════════════════════════════════════════════════════╝\n');

  try {
    // Connect to MongoDB
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB successfully\n');

    // Delete seeded users
    console.log('🗑️  Deleting seeded users...');
    const deletedUsers = await User.deleteMany({ email: { $in: SEEDED_EMAILS } });
    console.log(`   ✓ Deleted ${deletedUsers.deletedCount} users`);

    // Delete seeded ambulances
    console.log('🗑️  Deleting seeded ambulances...');
    const deletedAmbulances = await Ambulance.deleteMany({ vehicleNumber: { $in: SEEDED_AMBULANCES } });
    console.log(`   ✓ Deleted ${deletedAmbulances.deletedCount} ambulances`);

    // Delete seeded hospitals
    console.log('🗑️  Deleting seeded hospitals...');
    const deletedHospitals = await Hospital.deleteMany({ name: { $in: SEEDED_HOSPITALS } });
    console.log(`   ✓ Deleted ${deletedHospitals.deletedCount} hospitals`);

    console.log('\n✅ Cleanup complete!\n');
    console.log('Next step: Run the seed script again to create users with correct password hashing\n');

    // Close database connection
    await mongoose.connection.close();
    console.log('✅ Database connection closed\n');

    process.exit(0);
  } catch (error) {
    console.error('\n❌ ERROR DURING CLEANUP:', error);
    console.error(error.stack);
    
    if (mongoose.connection.readyState === 1) {
      await mongoose.connection.close();
      console.log('✅ Database connection closed\n');
    }
    
    process.exit(1);
  }
}

// Run the cleanup
cleanAmbulancePersonnel();
