/**
 * Clean Emergency Requests Script
 * Removes all emergency requests from the database
 */

import mongoose from 'mongoose';
import EmergencyRequest from '../models/EmergencyRequest.js';
import dotenv from 'dotenv';

dotenv.config();

const cleanEmergencyRequests = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Count existing requests
    const count = await EmergencyRequest.countDocuments();
    console.log(`\n📊 Found ${count} emergency request(s)`);

    if (count === 0) {
      console.log('✅ Database is already clean!');
      process.exit(0);
    }

    // Delete all emergency requests
    const result = await EmergencyRequest.deleteMany({});
    console.log(`\n🗑️  Deleted ${result.deletedCount} emergency request(s)`);
    console.log('✅ Emergency requests cleaned successfully!');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error cleaning emergency requests:', error.message);
    process.exit(1);
  }
};

cleanEmergencyRequests();
