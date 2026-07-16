/**
 * Create Test Patient Script
 * Creates a test patient account for testing emergency requests
 */

import mongoose from 'mongoose';
import User from '../models/User.js';
import dotenv from 'dotenv';

dotenv.config();

const createTestPatient = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Check if test patient already exists
    const existingPatient = await User.findOne({ email: 'test.patient@voise.in' });
    
    if (existingPatient) {
      console.log('\n⚠️  Test patient already exists!');
      console.log('📧 Email: test.patient@voise.in');
      console.log('🔑 Password: Patient@123');
      console.log('\nUse this account to test emergency requests.');
      process.exit(0);
    }

    // Create test patient
    const testPatient = await User.create({
      name: 'Test Patient',
      email: 'test.patient@voise.in',
      password: 'Patient@123', // Will be hashed by pre-save hook
      phone: '+919876543210',
      role: 'Patient',
      age: 28,
      bloodGroup: 'O+',
      address: 'Koramangala, Bangalore, Karnataka',
      emergencyContact: '+919876543211',
      medicalHistory: ['None'],
      allergies: ['None'],
      isActive: true,
    });

    console.log('\n✅ Test patient created successfully!');
    console.log('\n📋 Login Credentials:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📧 Email:    test.patient@voise.in');
    console.log('🔑 Password: Patient@123');
    console.log('👤 Role:     Patient');
    console.log('📱 Phone:    +919876543210');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    console.log('✅ Use this account to create emergency requests!');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error creating test patient:', error.message);
    if (error.code === 11000) {
      console.error('Patient with this email already exists.');
    }
    process.exit(1);
  }
};

createTestPatient();
