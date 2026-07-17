/**
 * Fix Ambulance-Driver Links
 * Links existing ambulance personnel to their ambulances
 */

import mongoose from 'mongoose';
import User from '../models/User.js';
import Ambulance from '../models/Ambulance.js';
import dotenv from 'dotenv';

dotenv.config();

const fixAmbulanceLinks = async () => {
  try {
    console.log('🔧 Fixing ambulance-driver links...\n');

    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    // Get all ambulance personnel
    const personnel = await User.find({ role: 'Ambulance Personnel' });
    console.log(`📋 Found ${personnel.length} ambulance personnel\n`);

    let fixed = 0;
    let alreadyLinked = 0;

    for (const person of personnel) {
      // Find ambulance that should belong to this person
      // Try to match by email pattern (e.g., sneha.reddy@ambulance.com → Sneha Reddy)
      const ambulance = await Ambulance.findOne({ driver: person._id });

      if (ambulance) {
        console.log(`✅ ${person.name} → Already linked to ${ambulance.vehicleNumber}`);
        alreadyLinked++;
      } else {
        // Try to find ambulance without driver or with wrong driver
        // Match by approximate name or find unlinked ambulance
        const unlinkedAmbulance = await Ambulance.findOne({
          $or: [
            { driver: null },
            { driver: { $exists: false } }
          ]
        }).limit(1);

        if (unlinkedAmbulance) {
          unlinkedAmbulance.driver = person._id;
          await unlinkedAmbulance.save();
          console.log(`🔗 ${person.name} → Linked to ${unlinkedAmbulance.vehicleNumber}`);
          fixed++;
        } else {
          console.log(`⚠️  ${person.name} → No available ambulance to link`);
        }
      }
    }

    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('✅ FIX COMPLETE!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    console.log(`✅ Already linked: ${alreadyLinked}`);
    console.log(`🔗 Newly linked: ${fixed}`);
    console.log(`📊 Total: ${alreadyLinked + fixed}/${personnel.length}\n`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
};

fixAmbulanceLinks();
