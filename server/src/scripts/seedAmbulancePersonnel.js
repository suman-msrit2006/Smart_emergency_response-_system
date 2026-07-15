import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import User from '../models/User.js';
import Ambulance from '../models/Ambulance.js';
import Hospital from '../models/Hospital.js';
import { logger } from '../utils/logger.js';

dotenv.config();

/**
 * Seed data for Ambulance Personnel and their ambulances
 * 4 cities × 4 ambulances = 16 total ambulances
 */

const CITIES_DATA = {
  bengaluru: {
    name: 'Bengaluru',
    location: 'Koramangala',
    baseCoords: [77.6101, 12.9346], // [longitude, latitude]
    hospital: {
      name: 'Manipal Hospital Koramangala',
      address: {
        street: '98, Rustom Bagh, HAL Old Airport Road',
        city: 'Bengaluru',
        state: 'Karnataka',
        zipCode: '560017',
        country: 'India'
      },
      phone: '+918061512345',
      email: 'emergency@manipalhospitals.com',
      emergencyContact: '+918061512222',
      specialties: ['Emergency Medicine', 'Cardiology', 'Neurology', 'Orthopedics']
    },
    personnel: [
      {
        name: 'Rajesh Kumar',
        email: 'rajesh.kumar@ambulance.com',
        phone: '+919876543210',
        password: 'Ambulance123',
        employeeId: 'BLR-EMP-001',
        ambulanceNumber: 'KA-05-AB-1001',
        licenseNumber: 'KA0220230001234',
        offset: [0.0000, 0.0000] // Exact base location
      },
      {
        name: 'Priya Sharma',
        email: 'priya.sharma@ambulance.com',
        phone: '+919876543211',
        password: 'Ambulance123',
        employeeId: 'BLR-EMP-002',
        ambulanceNumber: 'KA-05-AB-1002',
        licenseNumber: 'KA0220230002345',
        offset: [0.0017, 0.0014] // ~200m northeast
      },
      {
        name: 'Amit Patel',
        email: 'amit.patel@ambulance.com',
        phone: '+919876543212',
        password: 'Ambulance123',
        employeeId: 'BLR-EMP-003',
        ambulanceNumber: 'KA-05-AB-1003',
        licenseNumber: 'KA0220230003456',
        offset: [-0.0017, -0.0014] // ~200m southwest
      },
      {
        name: 'Sneha Reddy',
        email: 'sneha.reddy@ambulance.com',
        phone: '+919876543213',
        password: 'Ambulance123',
        employeeId: 'BLR-EMP-004',
        ambulanceNumber: 'KA-05-AB-1004',
        licenseNumber: 'KA0220230004567',
        offset: [0.0029, -0.0021] // ~350m east
      }
    ]
  },
  mumbai: {
    name: 'Mumbai',
    location: 'Bandra',
    baseCoords: [72.8348, 19.0610],
    hospital: {
      name: 'Lilavati Hospital Bandra',
      address: {
        street: 'A-791, Bandra Reclamation',
        city: 'Mumbai',
        state: 'Maharashtra',
        zipCode: '400050',
        country: 'India'
      },
      phone: '+912226408111',
      email: 'emergency@lilavatihospital.com',
      emergencyContact: '+912226408888',
      specialties: ['Emergency Medicine', 'Trauma Care', 'Critical Care', 'Cardiology']
    },
    personnel: [
      {
        name: 'Vikram Singh',
        email: 'vikram.singh@ambulance.com',
        phone: '+919876543214',
        password: 'Ambulance123',
        employeeId: 'MUM-EMP-001',
        ambulanceNumber: 'MH-02-AB-2001',
        licenseNumber: 'MH0220230001234',
        offset: [0.0000, 0.0000]
      },
      {
        name: 'Anita Desai',
        email: 'anita.desai@ambulance.com',
        phone: '+919876543215',
        password: 'Ambulance123',
        employeeId: 'MUM-EMP-002',
        ambulanceNumber: 'MH-02-AB-2002',
        licenseNumber: 'MH0220230002345',
        offset: [0.0021, 0.0018] // ~250m
      },
      {
        name: 'Rahul Mehta',
        email: 'rahul.mehta@ambulance.com',
        phone: '+919876543216',
        password: 'Ambulance123',
        employeeId: 'MUM-EMP-003',
        ambulanceNumber: 'MH-02-AB-2003',
        licenseNumber: 'MH0220230003456',
        offset: [-0.0025, 0.0015] // ~300m
      },
      {
        name: 'Pooja Joshi',
        email: 'pooja.joshi@ambulance.com',
        phone: '+919876543217',
        password: 'Ambulance123',
        employeeId: 'MUM-EMP-004',
        ambulanceNumber: 'MH-02-AB-2004',
        licenseNumber: 'MH0220230004567',
        offset: [0.0032, -0.0019] // ~380m
      }
    ]
  },
  chennai: {
    name: 'Chennai',
    location: 'T. Nagar',
    baseCoords: [80.2300, 13.0400],
    hospital: {
      name: 'Apollo Hospital T. Nagar',
      address: {
        street: '21, Greams Lane, Off Greams Road',
        city: 'Chennai',
        state: 'Tamil Nadu',
        zipCode: '600006',
        country: 'India'
      },
      phone: '+914428290200',
      email: 'emergency@apollohospitals.com',
      emergencyContact: '+914428295555',
      specialties: ['Emergency Medicine', 'Trauma Care', 'Neurosurgery', 'Cardiac Care']
    },
    personnel: [
      {
        name: 'Karthik Venkatesh',
        email: 'karthik.venkatesh@ambulance.com',
        phone: '+919876543218',
        password: 'Ambulance123',
        employeeId: 'CHE-EMP-001',
        ambulanceNumber: 'TN-09-AB-3001',
        licenseNumber: 'TN0220230001234',
        offset: [0.0000, 0.0000]
      },
      {
        name: 'Lakshmi Raman',
        email: 'lakshmi.raman@ambulance.com',
        phone: '+919876543219',
        password: 'Ambulance123',
        employeeId: 'CHE-EMP-002',
        ambulanceNumber: 'TN-09-AB-3002',
        licenseNumber: 'TN0220230002345',
        offset: [0.0019, 0.0016] // ~230m
      },
      {
        name: 'Suresh Kumar',
        email: 'suresh.kumar@ambulance.com',
        phone: '+919876543220',
        password: 'Ambulance123',
        employeeId: 'CHE-EMP-003',
        ambulanceNumber: 'TN-09-AB-3003',
        licenseNumber: 'TN0220230003456',
        offset: [-0.0023, -0.0017] // ~280m
      },
      {
        name: 'Divya Krishnan',
        email: 'divya.krishnan@ambulance.com',
        phone: '+919876543221',
        password: 'Ambulance123',
        employeeId: 'CHE-EMP-004',
        ambulanceNumber: 'TN-09-AB-3004',
        licenseNumber: 'TN0220230004567',
        offset: [0.0028, -0.0021] // ~340m
      }
    ]
  },
  hyderabad: {
    name: 'Hyderabad',
    location: 'Hitech City',
    baseCoords: [78.3808, 17.4435],
    hospital: {
      name: 'KIMS Hospital Hitech City',
      address: {
        street: '1-8-31/1, Minister Road',
        city: 'Hyderabad',
        state: 'Telangana',
        zipCode: '500003',
        country: 'India'
      },
      phone: '+914040088888',
      email: 'emergency@kimshospitals.com',
      emergencyContact: '+914040089999',
      specialties: ['Emergency Medicine', 'Trauma Care', 'Neurology', 'Orthopedics']
    },
    personnel: [
      {
        name: 'Srinivas Rao',
        email: 'srinivas.rao@ambulance.com',
        phone: '+919876543222',
        password: 'Ambulance123',
        employeeId: 'HYD-EMP-001',
        ambulanceNumber: 'TS-09-AB-4001',
        licenseNumber: 'TS0220230001234',
        offset: [0.0000, 0.0000]
      },
      {
        name: 'Kavitha Reddy',
        email: 'kavitha.reddy@ambulance.com',
        phone: '+919876543223',
        password: 'Ambulance123',
        employeeId: 'HYD-EMP-002',
        ambulanceNumber: 'TS-09-AB-4002',
        licenseNumber: 'TS0220230002345',
        offset: [0.0020, 0.0017] // ~240m
      },
      {
        name: 'Naresh Naidu',
        email: 'naresh.naidu@ambulance.com',
        phone: '+919876543224',
        password: 'Ambulance123',
        employeeId: 'HYD-EMP-003',
        ambulanceNumber: 'TS-09-AB-4003',
        licenseNumber: 'TS0220230003456',
        offset: [-0.0024, 0.0016] // ~290m
      },
      {
        name: 'Swathi Chowdary',
        email: 'swathi.chowdary@ambulance.com',
        phone: '+919876543225',
        password: 'Ambulance123',
        employeeId: 'HYD-EMP-004',
        ambulanceNumber: 'TS-09-AB-4004',
        licenseNumber: 'TS0220230004567',
        offset: [0.0031, -0.0020] // ~370m
      }
    ]
  }
};


/**
 * Hash password using bcrypt (same as User model pre-save hook)
 */
async function hashPassword(password) {
  const salt = await bcrypt.genSalt(12);
  return await bcrypt.hash(password, salt);
}

/**
 * Create or find a hospital
 */
async function createHospital(hospitalData, location) {
  try {
    // Check if hospital already exists
    let hospital = await Hospital.findOne({ name: hospitalData.name });
    
    if (hospital) {
      console.log(`   ✓ Hospital already exists: ${hospital.name}`);
      return hospital;
    }

    // Create new hospital
    hospital = await Hospital.create({
      name: hospitalData.name,
      address: hospitalData.address,
      location: {
        type: 'Point',
        coordinates: location
      },
      phone: hospitalData.phone,
      email: hospitalData.email,
      emergencyContact: hospitalData.emergencyContact,
      specialties: hospitalData.specialties,
      facilities: {
        emergencyRoom: true,
        icu: true,
        operationTheater: true,
        ambulanceService: true,
        pharmacy: true,
        laboratory: true,
        imaging: true
      },
      capacity: {
        totalBeds: 200,
        availableBeds: 150,
        icuBeds: 20,
        emergencyBeds: 30
      },
      status: 'Active',
      rating: 4.5
    });

    console.log(`   ✓ Created hospital: ${hospital.name}`);
    return hospital;
  } catch (error) {
    console.error(`   ✗ Error creating hospital: ${error.message}`);
    throw error;
  }
}


/**
 * Create ambulance personnel user account
 */
async function createPersonnel(personnelData, organization) {
  try {
    // Check if user already exists
    let user = await User.findOne({ email: personnelData.email });
    
    if (user) {
      console.log(`   ✓ User already exists: ${user.email}`);
      return user;
    }

    // Hash password manually (since we're not using model's pre-save when checking)
    const hashedPassword = await hashPassword(personnelData.password);

    // Create new user
    user = await User.create({
      name: personnelData.name,
      email: personnelData.email,
      password: hashedPassword,
      phone: personnelData.phone,
      role: 'Ambulance Personnel',
      employeeId: personnelData.employeeId,
      ambulanceNumber: personnelData.ambulanceNumber,
      licenseNumber: personnelData.licenseNumber,
      organization: organization,
      isActive: true
    });

    console.log(`   ✓ Created personnel: ${user.name} (${user.email})`);
    return user;
  } catch (error) {
    console.error(`   ✗ Error creating personnel: ${error.message}`);
    throw error;
  }
}

/**
 * Create ambulance
 */
async function createAmbulance(ambulanceData, driverId, hospitalId, location) {
  try {
    // Check if ambulance already exists
    let ambulance = await Ambulance.findOne({ vehicleNumber: ambulanceData.vehicleNumber });
    
    if (ambulance) {
      console.log(`   ✓ Ambulance already exists: ${ambulance.vehicleNumber}`);
      return ambulance;
    }

    // Create new ambulance
    ambulance = await Ambulance.create({
      vehicleNumber: ambulanceData.vehicleNumber,
      licensePlate: ambulanceData.vehicleNumber.replace(/-/g, ''),
      type: ambulanceData.type || 'Advanced Life Support',
      hospital: hospitalId,
      driver: driverId,
      location: {
        type: 'Point',
        coordinates: location
      },
      currentLocation: {
        type: 'Point',
        coordinates: location
      },
      lastLocationUpdate: new Date(),
      isOnline: true,
      status: 'Available',
      equipment: {
        defibrillator: true,
        oxygenSupply: true,
        ventilator: true,
        stretcher: true,
        firstAidKit: true,
        spinalBoard: true
      },
      capacity: 2,
      model: 'Force Traveller',
      year: 2023,
      fuelLevel: 90 + Math.floor(Math.random() * 10), // 90-99%
      mileage: Math.floor(Math.random() * 50000),
      isActive: true
    });

    console.log(`   ✓ Created ambulance: ${ambulance.vehicleNumber} at [${location[0].toFixed(4)}, ${location[1].toFixed(4)}]`);
    return ambulance;
  } catch (error) {
    console.error(`   ✗ Error creating ambulance: ${error.message}`);
    throw error;
  }
}


/**
 * Main seeding function
 */
async function seedAmbulancePersonnel() {
  console.log('\n╔══════════════════════════════════════════════════════════╗');
  console.log('║     AMBULANCE PERSONNEL & AMBULANCES SEEDING SCRIPT      ║');
  console.log('╚══════════════════════════════════════════════════════════╝\n');

  try {
    // Connect to MongoDB
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB successfully\n');

    let totalPersonnel = 0;
    let totalAmbulances = 0;
    const cities = [];
    const accountDetails = [];

    // Process each city
    for (const [cityKey, cityData] of Object.entries(CITIES_DATA)) {
      console.log(`\n📍 Processing ${cityData.name} (${cityData.location})...`);
      console.log('─'.repeat(60));

      // Create hospital
      const hospital = await createHospital(cityData.hospital, cityData.baseCoords);

      // Process each personnel
      for (const personnelData of cityData.personnel) {
        // Create user account
        const user = await createPersonnel(personnelData, hospital.name);
        totalPersonnel++;

        // Calculate ambulance location with offset
        const ambulanceLocation = [
          cityData.baseCoords[0] + personnelData.offset[0],
          cityData.baseCoords[1] + personnelData.offset[1]
        ];

        // Create ambulance
        const ambulance = await createAmbulance(
          {
            vehicleNumber: personnelData.ambulanceNumber,
            type: 'Advanced Life Support'
          },
          user._id,
          hospital._id,
          ambulanceLocation
        );
        totalAmbulances++;

        // Store account details for documentation
        accountDetails.push({
          city: cityData.name,
          driverName: personnelData.name,
          email: personnelData.email,
          password: personnelData.password,
          employeeId: personnelData.employeeId,
          ambulanceNumber: personnelData.ambulanceNumber,
          hospital: hospital.name,
          latitude: ambulanceLocation[1].toFixed(6),
          longitude: ambulanceLocation[0].toFixed(6),
          status: 'Available'
        });
      }

      cities.push(`${cityData.name} (${cityData.location})`);
    }


    // Print summary
    console.log('\n\n╔══════════════════════════════════════════════════════════╗');
    console.log('║                    SEEDING COMPLETE                      ║');
    console.log('╚══════════════════════════════════════════════════════════╝\n');

    console.log('📊 SUMMARY:');
    console.log(`   ✓ Total ambulance personnel accounts created: ${totalPersonnel}`);
    console.log(`   ✓ Total ambulances created: ${totalAmbulances}`);
    console.log(`   ✓ Cities covered: ${cities.length}`);
    console.log('');
    console.log('🏙️  CITIES INSERTED:');
    cities.forEach((city, index) => {
      console.log(`   ${index + 1}. ${city}`);
    });
    console.log('');
    console.log('📧 LOGIN EMAILS:');
    accountDetails.forEach((account, index) => {
      console.log(`   ${index + 1}. ${account.email} (${account.city})`);
    });
    console.log('');
    console.log('🚑 AMBULANCE NUMBERS:');
    accountDetails.forEach((account, index) => {
      console.log(`   ${index + 1}. ${account.ambulanceNumber} - ${account.driverName} (${account.city})`);
    });
    console.log('');
    console.log('🔐 DEFAULT PASSWORD FOR ALL ACCOUNTS: Ambulance123');
    console.log('');
    console.log('📍 GEOSPATIAL TESTING:');
    console.log('   Search "Koramangala" → See Bengaluru ambulances');
    console.log('   Search "Bandra" → See Mumbai ambulances');
    console.log('   Search "T Nagar" → See Chennai ambulances');
    console.log('   Search "Hitech City" → See Hyderabad ambulances');
    console.log('');
    console.log('📄 See AMBULANCE_TEST_ACCOUNTS.md for full account details');
    console.log('');

    // Close database connection
    await mongoose.connection.close();
    console.log('✅ Database connection closed\n');

    process.exit(0);
  } catch (error) {
    console.error('\n❌ ERROR DURING SEEDING:', error);
    console.error(error.stack);
    
    // Close database connection
    if (mongoose.connection.readyState === 1) {
      await mongoose.connection.close();
      console.log('✅ Database connection closed\n');
    }
    
    process.exit(1);
  }
}

// Run the seeder
seedAmbulancePersonnel();

