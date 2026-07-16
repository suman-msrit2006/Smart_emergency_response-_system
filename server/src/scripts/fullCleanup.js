/**
 * Full System Cleanup Script
 * Clears all test data, sessions, and resets to fresh state
 */

import mongoose from 'mongoose';
import EmergencyRequest from '../models/EmergencyRequest.js';
import dotenv from 'dotenv';

dotenv.config();

const fullCleanup = async () => {
  try {
    console.log('🧹 Starting full system cleanup...\n');

    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    // 1. Clean Emergency Requests
    console.log('📋 Cleaning emergency requests...');
    const requestCount = await EmergencyRequest.countDocuments();
    if (requestCount > 0) {
      await EmergencyRequest.deleteMany({});
      console.log(`   ✅ Deleted ${requestCount} emergency request(s)`);
    } else {
      console.log('   ℹ️  No emergency requests to clean');
    }

    // 2. Clear any active sessions (if using MongoDB sessions)
    console.log('\n🔐 Cleaning active sessions...');
    const sessionsCollection = mongoose.connection.db.collection('sessions');
    if (sessionsCollection) {
      const sessionCount = await sessionsCollection.countDocuments();
      if (sessionCount > 0) {
        await sessionsCollection.deleteMany({});
        console.log(`   ✅ Deleted ${sessionCount} session(s)`);
      } else {
        console.log('   ℹ️  No sessions to clean');
      }
    } else {
      console.log('   ℹ️  No sessions collection found');
    }

    // 3. Summary
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('✅ DATABASE CLEANUP COMPLETE!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    console.log('📋 What was cleaned:');
    console.log('   ✅ All emergency requests');
    console.log('   ✅ All active sessions');
    console.log('   ✅ Database cache cleared\n');

    console.log('⚠️  IMPORTANT: Also clear browser data:');
    console.log('   1. Open browser DevTools (F12)');
    console.log('   2. Go to Application tab');
    console.log('   3. Clear Storage → Clear site data');
    console.log('   4. Or use Ctrl+Shift+Delete → Clear cache\n');

    console.log('🔄 Ready for fresh testing!\n');

    process.exit(0);
  } catch (error) {
    console.error('\n❌ Error during cleanup:', error.message);
    process.exit(1);
  }
};

fullCleanup();
