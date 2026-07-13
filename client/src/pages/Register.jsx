import { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getRoleDashboardPath } from '../utils/roleBasedNavigation';

function Register() {
  const navigate = useNavigate();
  const location = useLocation();
  const { register, isAuthenticated, user } = useAuth();
  const [step, setStep] = useState('role-selection'); // 'role-selection' or 'registration'
  const [selectedRole, setSelectedRole] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    role: '',
    // Patient fields
    age: '',
    gender: '',
    emergencyContactNumber: '',
    // Ambulance Personnel fields
    employeeId: '',
    ambulanceNumber: '',
    licenseNumber: '',
    organization: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Check if role was passed from login link
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const roleParam = params.get('role');
    if (roleParam && (roleParam === 'Patient' || roleParam === 'Ambulance Personnel')) {
      setSelectedRole(roleParam);
      setFormData({ ...formData, role: roleParam });
      setStep('registration');
    }
  }, [location]);

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated && user) {
      const dashboardPath = getRoleDashboardPath(user.role);
      navigate(dashboardPath);
    }
  }, [isAuthenticated, user, navigate]);

  const handleRoleSelection = (role) => {
    setSelectedRole(role);
    setFormData({ ...formData, role });
    setStep('registration');
  };

  const handleBackToRoleSelection = () => {
    setStep('role-selection');
    setSelectedRole(null);
    setFormData({
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
      phone: '',
      role: '',
      age: '',
      gender: '',
      emergencyContactNumber: '',
      employeeId: '',
      ambulanceNumber: '',
      licenseNumber: '',
      organization: '',
    });
    setError('');
  };

  const validateForm = () => {
    // Password confirmation
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return false;
    }

    // Password strength
    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters long');
      return false;
    }

    if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
      setError('Password must contain at least one uppercase letter, one lowercase letter, and one number');
      return false;
    }

    // Role-specific validation
    if (selectedRole === 'Patient') {
      if (!formData.age || formData.age < 0 || formData.age > 150) {
        setError('Please enter a valid age');
        return false;
      }
      if (!formData.gender) {
        setError('Please select a gender');
        return false;
      }
      if (!formData.emergencyContactNumber) {
        setError('Emergency contact number is required');
        return false;
      }
    } else if (selectedRole === 'Ambulance Personnel') {
      if (!formData.employeeId) {
        setError('Employee ID is required');
        return false;
      }
      if (!formData.ambulanceNumber) {
        setError('Ambulance Number is required');
        return false;
      }
      if (!formData.licenseNumber) {
        setError('Driving License Number is required');
        return false;
      }
      if (!formData.organization) {
        setError('Organization/Hospital is required');
        return false;
      }
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      // Prepare registration data
      const registrationData = {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        phone: formData.phone,
        role: formData.role,
      };

      // Add role-specific fields
      if (selectedRole === 'Patient') {
        registrationData.age = parseInt(formData.age);
        registrationData.gender = formData.gender;
        registrationData.emergencyContactNumber = formData.emergencyContactNumber;
      } else if (selectedRole === 'Ambulance Personnel') {
        registrationData.employeeId = formData.employeeId;
        registrationData.ambulanceNumber = formData.ambulanceNumber;
        registrationData.licenseNumber = formData.licenseNumber;
        registrationData.organization = formData.organization;
      }

      await register(registrationData);
      
      // Redirect based on role using centralized helper
      const dashboardPath = getRoleDashboardPath(selectedRole);
      navigate(dashboardPath);
    } catch (err) {
      setError(err.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Role Selection Step
  if (step === 'role-selection') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-teal-50 px-4 py-12">
        <div className="max-w-5xl w-full space-y-8">
          <div className="text-center">
            <h2 className="text-4xl font-bold text-gray-900 mb-2">
              Join TrackER AI
            </h2>
            <p className="text-lg text-gray-600">
              Choose your role to get started
            </p>
            <p className="mt-2 text-sm text-gray-500">
              Already have an account?{' '}
              <Link to="/login" className="font-medium text-blue-600 hover:text-blue-500">
                Sign in
              </Link>
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 mt-12">
            {/* Patient Card */}
            <div
              onClick={() => handleRoleSelection('Patient')}
              className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 cursor-pointer transform hover:-translate-y-2 border-2 border-transparent hover:border-blue-500 p-8"
            >
              <div className="flex flex-col items-center text-center space-y-6">
                {/* Icon */}
                <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center shadow-lg">
                  <svg
                    className="w-12 h-12 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                    />
                  </svg>
                </div>

                {/* Title */}
                <h3 className="text-2xl font-bold text-gray-900">Patient</h3>

                {/* Description */}
                <div className="text-left space-y-3 w-full">
                  <div className="flex items-start space-x-2">
                    <span className="text-green-500 mt-1">✓</span>
                    <p className="text-gray-600">Request Emergency Assistance</p>
                  </div>
                  <div className="flex items-start space-x-2">
                    <span className="text-green-500 mt-1">✓</span>
                    <p className="text-gray-600">Track Assigned Ambulance</p>
                  </div>
                  <div className="flex items-start space-x-2">
                    <span className="text-green-500 mt-1">✓</span>
                    <p className="text-gray-600">View Discharge Summary</p>
                  </div>
                  <div className="flex items-start space-x-2">
                    <span className="text-green-500 mt-1">✓</span>
                    <p className="text-gray-600">Submit Feedback</p>
                  </div>
                </div>

                {/* Button */}
                <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200 mt-4">
                  Register as Patient
                </button>
              </div>
            </div>

            {/* Ambulance Personnel Card */}
            <div
              onClick={() => handleRoleSelection('Ambulance Personnel')}
              className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 cursor-pointer transform hover:-translate-y-2 border-2 border-transparent hover:border-teal-500 p-8"
            >
              <div className="flex flex-col items-center text-center space-y-6">
                {/* Icon */}
                <div className="w-24 h-24 bg-gradient-to-br from-teal-500 to-teal-600 rounded-full flex items-center justify-center shadow-lg">
                  <svg
                    className="w-12 h-12 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                </div>

                {/* Title */}
                <h3 className="text-2xl font-bold text-gray-900">Ambulance Personnel</h3>

                {/* Description */}
                <div className="text-left space-y-3 w-full">
                  <div className="flex items-start space-x-2">
                    <span className="text-green-500 mt-1">✓</span>
                    <p className="text-gray-600">Accept Emergency Requests</p>
                  </div>
                  <div className="flex items-start space-x-2">
                    <span className="text-green-500 mt-1">✓</span>
                    <p className="text-gray-600">Update Live Location</p>
                  </div>
                  <div className="flex items-start space-x-2">
                    <span className="text-green-500 mt-1">✓</span>
                    <p className="text-gray-600">Monitor Patient Vitals</p>
                  </div>
                  <div className="flex items-start space-x-2">
                    <span className="text-green-500 mt-1">✓</span>
                    <p className="text-gray-600">Complete Patient Handover</p>
                  </div>
                </div>

                {/* Button */}
                <button className="w-full bg-teal-600 hover:bg-teal-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200 mt-4">
                  Register as Ambulance Personnel
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Registration Form Step
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-12">
      <div className="max-w-md w-full space-y-8">
        <div>
          <button
            onClick={handleBackToRoleSelection}
            className="text-sm text-blue-600 hover:text-blue-500 flex items-center mb-4"
          >
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to role selection
          </button>

          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Create your account
          </h2>

          {/* Role Badge */}
          <div className="mt-4 flex justify-center">
            <span
              className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-medium ${
                selectedRole === 'Patient'
                  ? 'bg-blue-100 text-blue-800'
                  : 'bg-teal-100 text-teal-800'
              }`}
            >
              {selectedRole === 'Patient' ? '🟢' : '🚑'} {selectedRole}
            </span>
          </div>

          <p className="mt-2 text-center text-sm text-gray-600">
            Already have an account?{' '}
            <Link 
              to={`/login?role=${encodeURIComponent(selectedRole)}`}
              className="font-medium text-blue-600 hover:text-blue-500"
            >
              Sign in
            </Link>
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded">
              {error}
            </div>
          )}

          <div className="space-y-4">
            {/* Common Fields */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                Full Name *
              </label>
              <input
                id="name"
                name="name"
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="John Doe"
                minLength="2"
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email *
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="john@example.com"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password *
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="Min 8 characters"
                minLength="8"
              />
              <p className="mt-1 text-xs text-gray-500">
                Must contain uppercase, lowercase, and number
              </p>
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                Confirm Password *
              </label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                required
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="Re-enter password"
                minLength="8"
              />
            </div>

            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                Phone Number *
              </label>
              <input
                id="phone"
                name="phone"
                type="tel"
                required
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="+1234567890"
              />
            </div>

            {/* Patient-specific Fields */}
            {selectedRole === 'Patient' && (
              <>
                <div>
                  <label htmlFor="age" className="block text-sm font-medium text-gray-700">
                    Age *
                  </label>
                  <input
                    id="age"
                    name="age"
                    type="number"
                    required
                    min="0"
                    max="150"
                    value={formData.age}
                    onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                    className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="25"
                  />
                </div>

                <div>
                  <label htmlFor="gender" className="block text-sm font-medium text-gray-700">
                    Gender *
                  </label>
                  <select
                    id="gender"
                    name="gender"
                    required
                    value={formData.gender}
                    onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Select gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="emergencyContactNumber" className="block text-sm font-medium text-gray-700">
                    Emergency Contact Number *
                  </label>
                  <input
                    id="emergencyContactNumber"
                    name="emergencyContactNumber"
                    type="tel"
                    required
                    value={formData.emergencyContactNumber}
                    onChange={(e) => setFormData({ ...formData, emergencyContactNumber: e.target.value })}
                    className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="+1234567890"
                  />
                </div>
              </>
            )}

            {/* Ambulance Personnel-specific Fields */}
            {selectedRole === 'Ambulance Personnel' && (
              <>
                <div>
                  <label htmlFor="employeeId" className="block text-sm font-medium text-gray-700">
                    Employee ID *
                  </label>
                  <input
                    id="employeeId"
                    name="employeeId"
                    type="text"
                    required
                    value={formData.employeeId}
                    onChange={(e) => setFormData({ ...formData, employeeId: e.target.value })}
                    className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="EMP12345"
                  />
                </div>

                <div>
                  <label htmlFor="ambulanceNumber" className="block text-sm font-medium text-gray-700">
                    Ambulance Number *
                  </label>
                  <input
                    id="ambulanceNumber"
                    name="ambulanceNumber"
                    type="text"
                    required
                    value={formData.ambulanceNumber}
                    onChange={(e) => setFormData({ ...formData, ambulanceNumber: e.target.value })}
                    className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="AMB-001"
                  />
                </div>

                <div>
                  <label htmlFor="licenseNumber" className="block text-sm font-medium text-gray-700">
                    Driving License Number *
                  </label>
                  <input
                    id="licenseNumber"
                    name="licenseNumber"
                    type="text"
                    required
                    value={formData.licenseNumber}
                    onChange={(e) => setFormData({ ...formData, licenseNumber: e.target.value })}
                    className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="DL12345678"
                  />
                </div>

                <div>
                  <label htmlFor="organization" className="block text-sm font-medium text-gray-700">
                    Organization / Hospital *
                  </label>
                  <input
                    id="organization"
                    name="organization"
                    type="text"
                    required
                    value={formData.organization}
                    onChange={(e) => setFormData({ ...formData, organization: e.target.value })}
                    className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="City General Hospital"
                  />
                </div>
              </>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-gray-400"
          >
            {loading ? 'Creating account...' : 'Create account'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default Register;
