import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Ambulance from '../models/Ambulance.js';
import User from '../models/User.js';
import Hospital from '../models/Hospital.js';

dotenv.config();

const ambulanceData = [
  // Bangalore Ambulances
  {
    vehicleNumber: 'KA-01-AB-1001',
    licensePlate: 'KA01AB1001',
    type: 'Advanced Life Support',
    model: 'Force Traveller',
    year: 2022,
    location: {
      type: 'Point',
      coordinates: [77.6285, 12.9279] // Koramangala, Bangalore
    },
    currentLocation: {
      type: 'Point',
      coordinates: [77.6285, 12.9279] // Koramangala, Bangalore
    },
    status: 'Available',
    equipment: {
      defibrillator: true,
      oxygenSupply: true,
      ventilator: true,
      stretcher: true,
      firstAidKit: true,
      spinalBoard: true,
    },
    capacity: 2,
    fuelLevel: 85,
    isActive: true,
    lastLocationUpdate: new Date(),
  },
  {
    vehicleNumber: 'KA-01-AB-1002',
    licensePlate: 'KA01AB1002',
    type: 'Basic Life Support',
    model: 'Mahindra Bolero',
    year: 2021,
    location: {
      type: 'Point',
      coordinates: [77.6408, 12.9698] // Whitefield, Bangalore
    },
    currentLocation: {
      type: 'Point',
      coordinates: [77.6408, 12.9698] // Whitefield, Bangalore
    },
    status: 'Available',
    equipment: {
      defibrillator: false,
      oxygenSupply: true,
      ventilator: false,
      stretcher: true,
      firstAidKit: true,
      spinalBoard: false,
    },
    capacity: 2,
    fuelLevel: 92,
    isActive: true,
    lastLocationUpdate: new Date(),
  },
  {
    vehicleNumber: 'KA-01-AB-1003',
    licensePlate: 'KA01AB1003',
    type: 'Advanced Life Support',
    model: 'Force Traveller',
    year: 2023,
    location: {
      type: 'Point',
      coordinates: [77.6412, 12.9716] // Indiranagar, Bangalore
    },
    currentLocation: {
      type: 'Point',
      coordinates: [77.6412, 12.9716] // Indiranagar, Bangalore
    },
    status: 'Available',
    equipment: {
      defibrillator: true,
      oxygenSupply: true,
      ventilator: true,
      stretcher: true,
      firstAidKit: true,
      spinalBoard: true,
    },
    capacity: 2,
    fuelLevel: 78,
    isActive: true,
    lastLocationUpdate: new Date(),
  },
  {
    vehicleNumber: 'KA-01-AB-1004',
    licensePlate: 'KA01AB1004',
    type: 'Patient Transport',
    model: 'Tata Winger',
    year: 2022,
    location: {
      type: 'Point',
      coordinates: [77.5946, 12.9716] // MG Road, Bangalore
    },
    currentLocation: {
      type: 'Point',
      coordinates: [77.5946, 12.9716] // MG Road, Bangalore
    },
    status: 'Available',
    equipment: {
      defibrillator: false,
      oxygenSupply: true,
      ventilator: false,
      stretcher: true,
      firstAidKit: true,
      spinalBoard: false,
    },
    capacity: 4,
    fuelLevel: 95,
    isActive: true,
    lastLocationUpdate: new Date(),
  },
  // Delhi Ambulances
  {
    vehicleNumber: 'DL-01-AB-2001',
    licensePlate: 'DL01AB2001',
    type: 'Advanced Life Support',
    model: 'Force Traveller',
    year: 2023,
    location: {
      type: 'Point',
      coordinates: [77.2199, 28.6315] // Connaught Place, Delhi
    },
    currentLocation: {
      type: 'Point',
      coordinates: [77.2199, 28.6315] // Connaught Place, Delhi
    },
    status: 'Available',
    equipment: {
      defibrillator: true,
      oxygenSupply: true,
      ventilator: true,
      stretcher: true,
      firstAidKit: true,
      spinalBoard: true,
    },
    capacity: 2,
    fuelLevel: 88,
    isActive: true,
    lastLocationUpdate: new Date(),
  },
  {
    vehicleNumber: 'DL-01-AB-2002',
    licensePlate: 'DL01AB2002',
    type: 'Basic Life Support',
    model: 'Mahindra Bolero',
    year: 2021,
    location: {
      type: 'Point',
      coordinates: [77.2090, 28.6139] // India Gate, Delhi
    },
    currentLocation: {
      type: 'Point',
      coordinates: [77.2090, 28.6139] // India Gate, Delhi
    },
    status: 'Available',
    equipment: {
      defibrillator: false,
      oxygenSupply: true,
      ventilator: false,
      stretcher: true,
      firstAidKit: true,
      spinalBoard: false,
    },
    capacity: 2,
    fuelLevel: 90,
    isActive: true,
    lastLocationUpdate: new Date(),
  },
  // Mumbai Ambulances
  {
    vehicleNumber: 'MH-01-AB-3001',
    licensePlate: 'MH01AB3001',
    type: 'Advanced Life Support',
    model: 'Force Traveller',
    year: 2022,
    location: {
      type: 'Point',
      coordinates: [72.8348, 19.0610] // Bandra, Mumbai
    },
    currentLocation: {
      type: 'Point',
      coordinates: [72.8348, 19.0610] // Bandra, Mumbai
    },
    status: 'Available',
    equipment: {
      defibrillator: true,
      oxygenSupply: true,
      ventilator: true,
      stretcher: true,
      firstAidKit: true,
      spinalBoard: true,
    },
    capacity: 2,
    fuelLevel: 82,
    isActive: true,
    lastLocationUpdate: new Date(),
  },
  {
    vehicleNumber: 'MH-01-AB-3002',
    licensePlate: 'MH01AB3002',
    type: 'Basic Life Support',
    model: 'Tata Winger',
    year: 2021,
    location: {
      type: 'Point',
      coordinates: [72.8777, 19.0760] // Andheri, Mumbai
    },
    currentLocation: {
      type: 'Point',
      coordinates: [72.8777, 19.0760] // Andheri, Mumbai
    },
    status: 'Available',
    equipment: {
      defibrillator: false,
      oxygenSupply: true,
      ventilator: false,
      stretcher: true,
      firstAidKit: true,
      spinalBoard: false,
    },
    capacity: 3,
    fuelLevel: 87,
    isActive: true,
    lastLocationUpdate: new Date(),
  },
  // Chennai Ambulances
  {
    vehicleNumber: 'TN-01-AB-4001',
    licensePlate: 'TN01AB4001',
    type: 'Advanced Life Support',
    model: 'Force Traveller',
    year: 2023,
    location: {
      type: 'Point',
      coordinates: [80.2300, 13.0400] // T Nagar, Chennai
    },
    currentLocation: {
      type: 'Point',
      coordinates: [80.2300, 13.0400] // T Nagar, Chennai
    },
    status: 'Available',
    equipment: {
      defibrillator: true,
      oxygenSupply: true,
      ventilator: true,
      stretcher: true,
      firstAidKit: true,
      spinalBoard: true,
    },
    capacity: 2,
    fuelLevel: 91,
    isActive: true,
    lastLocationUpdate: new Date(),
  },
  {
    vehicleNumber: 'TN-01-AB-4002',
    licensePlate: 'TN01AB4002',
    type: 'Basic Life Support',
    model: 'Mahindra Bolero',
    year: 2022,
    location: {
      type: 'Point',
      coordinates: [80.2707, 13.0827] // Anna Nagar, Chennai
    },
    currentLocation: {
      type: 'Point',
      coordinates: [80.2707, 13.0827] // Anna Nagar, Chennai
    },
    status: 'Available',
    equipment: {
      defibrillator: false,
      oxygenSupply: true,
      ventilator: false,
      stretcher: true,
      firstAidKit: true,
      spinalBoard: false,
    },
    capacity: 2,
    fuelLevel: 84,
    isActive: true,
    lastLocationUpdate: new Date(),
  },
];

const seedAmbulances = async () => {
  try {
    console.log('🔄 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Get a sample hospital and user for associations
    console.log('🔍 Finding hospital and users...');
    
    const hospital = await Hospital.findOne();
    if (!hospital) {
      console.log('⚠️  No hospital found. Creating sample hospital...');
      const sampleHospital = await Hospital.create({
        name: 'City General Hospital',
        type: 'Multi-Specialty',
        address: 'Sample Address',
        contactNumber: '1234567890',
        emergencyNumber: '911',
        location: {
          type: 'Point',
          coordinates: [77.5946, 12.9716]
        },
        isActive: true,
      });
      console.log(`✅ Created hospital: ${sampleHospital.name}`);
    }

    const updatedHospital = await Hospital.findOne();
    
    // Find or create a sample driver
    let driver = await User.findOne({ role: 'Ambulance Personnel' });
    if (!driver) {
      console.log('⚠️  No ambulance personnel found. Creating sample driver...');
      driver = await User.create({
        name: 'Sample Driver',
        email: 'driver@tracker.com',
        password: 'Password123',
        role: 'Ambulance Personnel',
        phone: '9876543210',
        employeeId: 'DRV001',
        ambulanceNumber: 'AMB001',
        licenseNumber: 'DL1234567890',
        organization: 'City General Hospital',
      });
      console.log(`✅ Created driver: ${driver.name}`);
    }

    // Clear existing ambulances
    console.log('🗑️  Clearing existing ambulances...');
    await Ambulance.deleteMany({});
    console.log('✅ Existing ambulances cleared');

    // Insert ambulances
    console.log('📝 Creating ambulances...');
    
    for (const ambData of ambulanceData) {
      const ambulance = await Ambulance.create({
        ...ambData,
        hospital: updatedHospital._id,
        driver: driver._id,
      });
      console.log(`✅ Created: ${ambulance.vehicleNumber} at [${ambulance.location.coordinates}]`);
    }

    console.log(`\n🎉 Successfully seeded ${ambulanceData.length} ambulances!`);
    console.log('\n📍 Ambulance Locations:');
    console.log('  - Bangalore (Koramangala, Whitefield, Indiranagar, MG Road): 4 ambulances');
    console.log('  - Delhi (Connaught Place, India Gate): 2 ambulances');
    console.log('  - Mumbai (Bandra, Andheri): 2 ambulances');
    console.log('  - Chennai (T Nagar, Anna Nagar): 2 ambulances');
    console.log('\n💡 Search for these locations in the app to see ambulances!');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding ambulances:', error);
    process.exit(1);
  }
};

// Run the seeder
seedAmbulances();
