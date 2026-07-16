import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function Cleanup() {
  const navigate = useNavigate();
  const [status, setStatus] = useState('');

  const handleFullCleanup = () => {
    setStatus('Clearing browser data...');
    
    // Clear all localStorage
    localStorage.clear();
    
    // Clear all sessionStorage
    sessionStorage.clear();
    
    // Clear all cookies
    document.cookie.split(";").forEach((c) => {
      document.cookie = c
        .replace(/^ +/, "")
        .replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
    });

    setStatus('✅ Browser data cleared! Redirecting to login...');
    
    setTimeout(() => {
      window.location.href = '/login';
    }, 1500);
  };

  const handleQuickCleanup = () => {
    setStatus('Clearing auth data...');
    
    // Clear only auth-related data
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('emergency_request_id');
    localStorage.removeItem('selected_ambulance_id');
    localStorage.removeItem('selected_ambulance');
    
    setStatus('✅ Auth data cleared! Redirecting to login...');
    
    setTimeout(() => {
      window.location.href = '/login';
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full bg-white rounded-2xl shadow-2xl p-8">
        <div className="text-center mb-8">
          <div className="text-6xl mb-4">🧹</div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">System Cleanup</h1>
          <p className="text-gray-600">Clear all cached data and sessions for fresh testing</p>
        </div>

        {status && (
          <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg text-center">
            <p className="text-blue-800 font-semibold">{status}</p>
          </div>
        )}

        <div className="space-y-4 mb-8">
          <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded">
            <h3 className="font-bold text-red-800 mb-2">🔥 Full Cleanup (Recommended)</h3>
            <p className="text-sm text-red-700 mb-3">
              Clears everything: tokens, user data, cache, cookies, session storage
            </p>
            <button
              onClick={handleFullCleanup}
              className="w-full px-6 py-3 bg-red-600 text-white font-bold rounded-lg hover:bg-red-700 transition"
            >
              Full Cleanup & Logout
            </button>
          </div>

          <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 rounded">
            <h3 className="font-bold text-yellow-800 mb-2">⚡ Quick Cleanup</h3>
            <p className="text-sm text-yellow-700 mb-3">
              Clears only auth tokens and emergency request data
            </p>
            <button
              onClick={handleQuickCleanup}
              className="w-full px-6 py-3 bg-yellow-600 text-white font-bold rounded-lg hover:bg-yellow-700 transition"
            >
              Quick Cleanup & Logout
            </button>
          </div>
        </div>

        <div className="bg-gray-50 rounded-lg p-6 mb-6">
          <h3 className="font-bold text-gray-900 mb-3">📋 What Gets Cleaned:</h3>
          <div className="space-y-2 text-sm text-gray-700">
            <div className="flex items-center gap-2">
              <span className="text-green-600">✓</span>
              <span>Authentication tokens</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-green-600">✓</span>
              <span>User session data</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-green-600">✓</span>
              <span>Emergency request cache</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-green-600">✓</span>
              <span>Ambulance selection data</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-green-600">✓</span>
              <span>Local storage & session storage</span>
            </div>
          </div>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <h3 className="font-bold text-blue-900 mb-2">🔧 Backend Cleanup (Run This Too!)</h3>
          <p className="text-sm text-blue-800 mb-3">
            Open terminal in <code className="bg-blue-100 px-2 py-1 rounded">server</code> folder and run:
          </p>
          <pre className="bg-blue-900 text-blue-100 p-3 rounded font-mono text-sm overflow-x-auto">
npm run clean:full
          </pre>
          <p className="text-xs text-blue-700 mt-2">
            This clears database sessions and emergency requests
          </p>
        </div>

        <div className="flex gap-4">
          <button
            onClick={() => navigate(-1)}
            className="flex-1 px-6 py-3 bg-gray-200 text-gray-800 font-semibold rounded-lg hover:bg-gray-300 transition"
          >
            ← Go Back
          </button>
          <button
            onClick={() => navigate('/login')}
            className="flex-1 px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition"
          >
            Go to Login
          </button>
        </div>

        <div className="mt-6 text-center text-sm text-gray-500">
          <p>💡 Use this before each testing session for best results</p>
        </div>
      </div>
    </div>
  );
}

export default Cleanup;
