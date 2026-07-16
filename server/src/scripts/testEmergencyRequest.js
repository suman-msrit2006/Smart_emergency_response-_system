import mongoose from 'mongoose';
import dotenv from 'dotenv';
import EmergencyRequest from '../models/EmergencyRequest.js';
import User from '../models/User.js';

dotenv.config();

async function testEmergencyRequest() {
  console.log('\n=== Testing Emergency Request Creation ===\n');

  try {
    // Connect to MongoDB
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    // Find a patient user
    console.log('Finding a patient user...');
    const patient = await User.findOne({ role: 'Patient' });
    
    if (!patient) {
      console.log('❌ No patient found! Creating a test patient...');
      const testPatient = await User.create({
        name: 'Test Patient',
        email: 'testpatient@example.com',
        password: 'TestPatient123',
        phone: '+919999999999',
        role: 'Patient',
        age: 30,
        gender: 'Male'
      });
      console.log('✅ Test patient created:', testPatient.email);
    } else {
      console.log('✅ Found patient:', patient.email);
    }

    const patientId = patient ? patient._id : (await User.findOne({ email: 'testpatient@example.com' }))._id;

    // Test data - exactly what frontend sends
    const requestData = {
      patient: patientId,
      patientName: patient ? patient.name : 'Test Patient',
      patientPhone: patient ? patient.phone : '+919999999999',
      location: {
        type: 'Point',
        coordinates: [77.6101, 12.9346], // Koramangala
        address: 'Koramangala, Bengaluru',
      },
      emergencyType: 'Medical',
      severity: 'High',
      notes: 'Test emergency request',
    };

    console.log('\nCreating emergency request with data:');
    console.log(JSON.stringify(requestData, null, 2));

    // Attempt to create emergency request
    const emergencyRequest = await EmergencyRequest.create(requestData);
    
    console.log('\n✅ Emergency request created successfully!');
    console.log('Request ID:', emergencyRequest.requestId);
    console.log('MongoDB ID:', emergencyRequest._id);
    console.log('Status:', emergencyRequest.status);
    console.log('Patient:', emergencyRequest.patient);
    console.log('Location:', emergencyRequest.location);

    await mongoose.connection.close();
    console.log('\n✅ Database connection closed\n');
    process.exit(0);

  } catch (error) {
    console.error('\n❌ ERROR:', error.message);
    console.error('\nFull error:');
    console.error(error);

    if (mongoose.connection.readyState === 1) {
      await mongoose.connection.close();
    }
    process.exit(1);
  }
}

testEmergencyRequest();
