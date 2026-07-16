import mongoose from 'mongoose';
import User from '../models/User.js';
import Ambulance from '../models/Ambulance.js';
import config from '../config/env.js';

/**
 * Quick script to link ambulance personnel to ambulances
 * Run this if ambulance personnel can't see their ambulance
 */

async function linkAmbulanceToPersonnel() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(config.mongoUri);
    console.log('✅ Connected to MongoDB');

    // Find all ambulance personnel
    const personnel = await User.find({ role: 'Ambulance Personnel' });
    console.log(`\nFound ${personnel.length} Ambulance Personnel users`);

    // Find all ambulances
    const ambulances = await Ambulance.find({});
    console.log(`Found ${ambulances.length} ambulances`);

    let linked = 0;
    let skipped = 0;

    // Link each ambulance to a personnel (round-robin)
    for (let i = 0; i < ambulances.length; i++) {
      const ambulance = ambulances[i];
      const personnelIndex = i % personnel.length;
      const person = personnel[personnelIndex];

      // Check if already linked
      if (ambulance.driver && ambulance.driver.toString() === person._id.toString()) {
        console.log(`⏭️  ${ambulance.vehicleNumber} already linked to ${person.name}`);
        skipped++;
        continue;
      }

      // Link ambulance to personnel
      ambulance.driver = person._id;
      await ambulance.save();
      
      console.log(`✅ Linked ${ambulance.vehicleNumber} → ${person.name} (${person.email})`);
      linked++;
    }

    console.log('\n╔══════════════════════════════════════════════════════════╗');
    console.log(`║  LINKING COMPLETE                                        ║`);
    console.log('╚══════════════════════════════════════════════════════════╝');
    console.log(`✅ Linked: ${linked}`);
    console.log(`⏭️  Skipped: ${skipped}`);
    console.log(`📊 Total: ${ambulances.length}`);
    console.log('\nYou can now login as any ambulance personnel and see their ambulance!');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

linkAmbulanceToPersonnel();
