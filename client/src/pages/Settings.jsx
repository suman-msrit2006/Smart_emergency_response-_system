import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import { useAuth } from "../context/AuthContext";
import axiosInstance from "../services/axiosInstance";

function Settings() {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [formData, setFormData] = useState({
    email: "",
    phone: "",
    emailNotifications: true,
    smsAlerts: true,
    pushNotifications: false,
  });

  const [savedData, setSavedData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });
  const [errors, setErrors] = useState({});
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Load settings from user context and localStorage
  useEffect(() => {
    if (user) {
      const savedSettings = localStorage.getItem('userSettings');
      const notificationPrefs = savedSettings ? JSON.parse(savedSettings) : {
        emailNotifications: true,
        smsAlerts: true,
        pushNotifications: false,
      };
      
      const initialData = {
        email: user.email || "",
        phone: user.phone || "",
        ...notificationPrefs,
      };
      
      setFormData(initialData);
      setSavedData(initialData);
    }
  }, [user]);

  // Warn before leaving page with unsaved changes
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue = '';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [hasUnsavedChanges]);

  const validateForm = () => {
    const newErrors = {};
    
    // Email validation
    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Invalid email format";
    }
    
    // Phone validation
    if (!formData.phone.trim()) {
      newErrors.phone = "Phone number is required";
    } else if (!/^\+?[\d\s\-()]+$/.test(formData.phone)) {
      newErrors.phone = "Invalid phone format";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const newValue = type === 'checkbox' ? checked : value;
    
    setFormData(prev => {
      const updated = {
        ...prev,
        [name]: newValue
      };
      
      // Check if there are unsaved changes
      if (savedData) {
        const hasChanges = JSON.stringify(updated) !== JSON.stringify(savedData);
        setHasUnsavedChanges(hasChanges);
      }
      
      return updated;
    });
    
    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: "" }));
    }
  };

  const handleSave = async () => {
    // Validate form
    if (!validateForm()) {
      setMessage({ type: "error", text: "Please fix the errors before saving" });
      setTimeout(() => setMessage({ type: "", text: "" }), 3000);
      return;
    }

    setLoading(true);
    setMessage({ type: "", text: "" });

    try {
      // Try to save to backend first
      let backendSuccess = false;
      
      try {
        // Attempt to call backend settings endpoint
        const response = await axiosInstance.put('/auth/settings', {
          email: formData.email,
          phone: formData.phone,
          notifications: {
            emailNotifications: formData.emailNotifications,
            smsAlerts: formData.smsAlerts,
            pushNotifications: formData.pushNotifications,
          }
        });
        
        if (response.data.success) {
          backendSuccess = true;
          
          // Update user in localStorage with backend response
          if (response.data.data && response.data.data.user) {
            localStorage.setItem('user', JSON.stringify(response.data.data.user));
          }
          
          // Settings saved to backend successfully
        }
      } catch (error) {
        // Backend settings save failed - localStorage will be used
        backendSuccess = false;
      }
      
      // Always save to localStorage as backup or fallback
      localStorage.setItem('userSettings', JSON.stringify({
        emailNotifications: formData.emailNotifications,
        smsAlerts: formData.smsAlerts,
        pushNotifications: formData.pushNotifications,
      }));
      
      // Update user info in localStorage
      const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
      if (currentUser) {
        currentUser.email = formData.email;
        currentUser.phone = formData.phone;
        localStorage.setItem('user', JSON.stringify(currentUser));
      }
      
      setSavedData(formData);
      setHasUnsavedChanges(false);
      
      setMessage({ 
        type: "success", 
        text: backendSuccess 
          ? "Settings saved successfully!" 
          : "Settings saved successfully! (saved locally)"
      });
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setMessage({ type: "", text: "" });
      }, 3000);
    } catch (error) {
      // Settings save error
      setMessage({ 
        type: "error", 
        text: "Failed to save settings. Please try again." 
      });
      
      // Clear error message after 5 seconds
      setTimeout(() => {
        setMessage({ type: "", text: "" });
      }, 5000);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    if (savedData) {
      // Restore to last saved values
      setFormData(savedData);
      setErrors({});
      setMessage({ type: "", text: "" });
      setHasUnsavedChanges(false);
    } else {
      // If no saved data, navigate back
      navigate(-1);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="max-w-4xl mx-auto px-6 py-12">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center gap-2">
            Settings
            {hasUnsavedChanges && (
              <span className="text-sm font-normal text-orange-600 bg-orange-100 px-3 py-1 rounded-full">
                Unsaved changes
              </span>
            )}
          </h1>
          <p className="text-gray-600">Manage your account settings and preferences</p>
        </div>

        {/* Success/Error Message */}
        {message.text && (
          <div className={`mb-6 p-4 rounded-lg ${
            message.type === 'success' ? 'bg-green-100 text-green-800 border border-green-200' : 
            'bg-red-100 text-red-800 border border-red-200'
          }`}>
            <div className="flex items-center gap-2">
              {message.type === 'success' ? (
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd"/>
                </svg>
              )}
              <span className="font-medium">{message.text}</span>
            </div>
          </div>
        )}

        <div className="space-y-6">
          {/* Account Settings */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Account Settings</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                <input 
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 ${
                    errors.email ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="user@example.com"
                />
                {errors.email && (
                  <p className="mt-1 text-sm text-red-600">{errors.email}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                <input 
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 ${
                    errors.phone ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="+1 (555) 123-4567"
                />
                {errors.phone && (
                  <p className="mt-1 text-sm text-red-600">{errors.phone}</p>
                )}
              </div>
            </div>
          </div>

          {/* Notification Settings */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Notifications</h2>
            <div className="space-y-3">
              <label className="flex items-center gap-3">
                <input 
                  type="checkbox"
                  name="emailNotifications"
                  checked={formData.emailNotifications}
                  onChange={handleChange}
                  className="w-4 h-4 text-teal-600 rounded focus:ring-teal-500" 
                />
                <span className="text-gray-700">Email notifications</span>
              </label>
              <label className="flex items-center gap-3">
                <input 
                  type="checkbox"
                  name="smsAlerts"
                  checked={formData.smsAlerts}
                  onChange={handleChange}
                  className="w-4 h-4 text-teal-600 rounded focus:ring-teal-500" 
                />
                <span className="text-gray-700">SMS alerts</span>
              </label>
              <label className="flex items-center gap-3">
                <input 
                  type="checkbox"
                  name="pushNotifications"
                  checked={formData.pushNotifications}
                  onChange={handleChange}
                  className="w-4 h-4 text-teal-600 rounded focus:ring-teal-500" 
                />
                <span className="text-gray-700">Push notifications</span>
              </label>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4">
            <button 
              onClick={handleSave}
              disabled={loading || !hasUnsavedChanges}
              className={`px-6 py-2 bg-teal-600 text-white rounded-lg transition flex items-center gap-2 ${
                loading || !hasUnsavedChanges 
                  ? 'opacity-50 cursor-not-allowed' 
                  : 'hover:bg-teal-700'
              }`}
              title={!hasUnsavedChanges ? 'No changes to save' : 'Save your changes'}
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                  </svg>
                  <span>Saving...</span>
                </>
              ) : (
                'Save Changes'
              )}
            </button>
            <button 
              onClick={handleCancel}
              disabled={loading}
              className={`px-6 py-2 bg-gray-200 text-gray-700 rounded-lg transition ${
                loading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-300'
              }`}
              title="Cancel and restore previous values"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Settings;
