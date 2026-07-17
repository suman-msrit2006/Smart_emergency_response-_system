/**
 * Check Ambulance-Driver Links
 * Diagnostic script to check if ambulances are properly linked to drivers
 */

import mongoose from 'mongoose';
import User from '../models/User.js';
import Ambulance from '../models/Ambulance.js';
import dotenv from 'dotenv';

dotenv.config();

const checkLinks = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    // Check Sneha Reddy specifically
    const sneha = await User.findOne({ email: 'sneha.reddy@ambulance.com' });
    console.log('👤 Sneha Reddy User:');
    console.log('   ID:', sneha?._id.toString());
    console.log('   Name:', sneha?.name);
    console.log('   Email:', sneha?.email);
    console.log('   Role:', sneha?.role);

    if (!sneha) {
      console.log('\n❌ Sneha Reddy user not found in database!');
      process.exit(1);
    }

    console.log('\n🚑 Looking for ambulance with driver:', sneha._id.toString());
    const ambulance = await Ambulance.findOne({ driver: sneha._id });
    
    if (ambulance) {
      console.log('✅ Ambulance Found:');
      console.log('   Vehicle:', ambulance.vehicleNumber);
      console.log('   Driver ID:', ambulance.driver?.toString());
      console.log('   Status:', ambulance.status);
      console.log('   Online:', ambulance.isOnline);
    } else {
      console.log('❌ No ambulance linked to Sneha Reddy!');
      console.log('\n🔍 Checking all ambulances:');
      const allAmbulances = await Ambulance.find({}).populate('driver', 'name email');
      allAmbulances.forEach((amb, i) => {
        console.log(`\n   ${i + 1}. ${amb.vehicleNumber}`);
        console.log(`      Driver ID: ${amb.driver?._id || 'NULL'}`);
        console.log(`      Driver Name: ${amb.driver?.name || 'NONE'}`);
        console.log(`      Driver Email: ${amb.driver?.email || 'NONE'}`);
      });
    }

    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
};

checkLinks();
