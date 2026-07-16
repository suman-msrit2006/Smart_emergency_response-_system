import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

function Debug() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const userFromStorage = JSON.parse(localStorage.getItem('user') || '{}');
  const token = localStorage.getItem('token');

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleForceReLogin = () => {
    localStorage.clear();
    window.location.href = '/login';
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Debug User Information</h1>

        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-bold mb-4">User from AuthContext</h2>
          <pre className="bg-gray-100 p-4 rounded overflow-auto">
            {JSON.stringify(user, null, 2)}
          </pre>
        </div>

        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-bold mb-4">User from localStorage</h2>
          <pre className="bg-gray-100 p-4 rounded overflow-auto">
            {JSON.stringify(userFromStorage, null, 2)}
          </pre>
        </div>

        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-bold mb-4">Token</h2>
          <p className="text-sm font-mono bg-gray-100 p-4 rounded break-all">
            {token || 'No token found'}
          </p>
        </div>

        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-bold mb-4 text-red-600">Issue Check</h2>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className={`w-4 h-4 rounded-full ${user?.role === 'Patient' ? 'bg-green-500' : 'bg-red-500'}`}></span>
              <span>Role is Patient: {user?.role === 'Patient' ? '✅ YES' : '❌ NO - Role is: ' + (user?.role || 'undefined')}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className={`w-4 h-4 rounded-full ${token ? 'bg-green-500' : 'bg-red-500'}`}></span>
              <span>Token exists: {token ? '✅ YES' : '❌ NO'}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className={`w-4 h-4 rounded-full ${user?.email ? 'bg-green-500' : 'bg-red-500'}`}></span>
              <span>User email: {user?.email || '❌ Not found'}</span>
            </div>
          </div>
        </div>

        <div className="flex gap-4">
          <button
            onClick={handleLogout}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Logout Normally
          </button>
          <button
            onClick={handleForceReLogin}
            className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700"
          >
            Force Clear & Re-Login
          </button>
          <button
            onClick={() => navigate(-1)}
            className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
          >
            Go Back
          </button>
        </div>

        <div className="mt-8 bg-yellow-50 border-l-4 border-yellow-400 p-6">
          <h3 className="font-bold text-yellow-800 mb-2">If you see any ❌ above:</h3>
          <ol className="list-decimal list-inside space-y-2 text-yellow-800">
            <li>Click "Force Clear & Re-Login"</li>
            <li>Login again as a <strong>Patient</strong> (not Ambulance Personnel)</li>
            <li>Come back to this page to verify role is "Patient"</li>
            <li>Then try creating emergency request again</li>
          </ol>
        </div>
      </div>
    </div>
  );
}

export default Debug;
