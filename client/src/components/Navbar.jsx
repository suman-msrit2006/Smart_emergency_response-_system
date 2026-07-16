import { Link, useNavigate } from "react-router-dom";
import { useState, useEffect, useRef, useCallback } from "react";
import { useAuth } from "../context/AuthContext";
import { getRoleDashboardPath } from "../utils/roleBasedNavigation";
import { notificationService } from "../services/notificationService";
import socketService from "../services/socketService";

function Navbar() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [showDropdown, setShowDropdown] = useState(false);
  const [showNotifPanel, setShowNotifPanel] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const dropdownRef = useRef(null);
  const notifRef = useRef(null);

  const isAmbulancePersonnel = user?.role === 'Ambulance Personnel';

  // ── Fetch unread count on mount (Ambulance Personnel only) ──────────────
  // CRITICAL: Wait for user and role verification before making API calls
  const fetchUnreadCount = useCallback(async () => {
    if (!user) return; // Wait for user to load
    if (!isAmbulancePersonnel) return; // Only for ambulance personnel
    try {
      const count = await notificationService.getUnreadCount();
      setUnreadCount(count);
    } catch {
      // silently ignore — bell just shows 0
    }
  }, [isAmbulancePersonnel, user]);

  useEffect(() => {
    if (!user) return; // Wait for user to load
    fetchUnreadCount();
  }, [user, fetchUnreadCount]);

  // ── Real-time new notifications via Socket.IO ────────────────────────────
  useEffect(() => {
    if (!user) return; // Wait for user to load
    if (!isAmbulancePersonnel) return; // Only for ambulance personnel

    const handleNewNotification = () => {
      setUnreadCount((prev) => prev + 1);
    };

    socketService.onNewNotification(handleNewNotification);

    return () => {
      socketService.offNewNotification(handleNewNotification);
    };
  }, [isAmbulancePersonnel]);

  // ── Close panels on outside click ───────────────────────────────────────
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
      if (notifRef.current && !notifRef.current.contains(event.target)) {
        setShowNotifPanel(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    setShowDropdown(false);
    navigate('/');
  };

  const handleNotifBellClick = () => {
    if (!isAmbulancePersonnel) return;
    // Navigate directly to Feedback Management page
    navigate('/feedback-management');
    setShowNotifPanel(false);
  };

  const getUserInitial = () => {
    if (user?.firstName) return user.firstName.charAt(0).toUpperCase();
    if (user?.name) return user.name.charAt(0).toUpperCase();
    if (user?.email) return user.email.charAt(0).toUpperCase();
    return 'U';
  };

  const getUserDisplayName = () => {
    if (user?.name) return user.name;
    if (user?.firstName && user?.lastName) return `${user.firstName} ${user.lastName}`;
    if (user?.firstName) return user.firstName;
    if (user?.email) return user.email.split('@')[0];
    return 'User';
  };

  const getUserEmail = () => user?.email || '';
  const getUserRole = () => user?.role || '';

  const getDashboardLink = () => {
    if (user?.role) return getRoleDashboardPath(user.role);
    return '/login';
  };

  return (
    <nav className="bg-white shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between">

        {/* Logo */}
        <Link to={getDashboardLink()} className="flex items-center gap-2">
          <svg className="w-6 h-6 text-teal-600" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" stroke="currentColor" strokeWidth="2" fill="none"/>
          </svg>
          <span className="text-xl font-bold text-gray-800">TrackER</span>
        </Link>

        {/* Navigation Links */}
        <div className="flex items-center gap-8">
          <Link to={getDashboardLink()} className="text-gray-600 hover:text-teal-600 text-sm">
            Home
          </Link>
          <Link to="/settings" className="text-gray-600 hover:text-teal-600 text-sm">
            Settings
          </Link>
          <Link to="/help" className="text-gray-600 hover:text-teal-600 text-sm">
            Help
          </Link>

          {/* Notification Bell */}
          <div className="relative" ref={notifRef}>
            <button
              id="notification-bell-btn"
              onClick={handleNotifBellClick}
              title={isAmbulancePersonnel ? 'View feedback notifications' : 'Notifications'}
              className="relative text-gray-600 hover:text-teal-600 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"/>
              </svg>

              {/* Unread badge — Ambulance Personnel only */}
              {isAmbulancePersonnel && unreadCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 min-w-[18px] h-[18px] px-1 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center leading-none shadow">
                  {unreadCount > 99 ? '99+' : unreadCount}
                </span>
              )}
            </button>
          </div>

          {/* User Avatar with Dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setShowDropdown(!showDropdown)}
              className="w-8 h-8 bg-teal-600 rounded-full flex items-center justify-center text-white text-sm font-semibold hover:bg-teal-700 transition focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2"
            >
              {getUserInitial()}
            </button>

            {/* Dropdown Menu */}
            {showDropdown && (
              <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg py-2 border border-gray-200">
                {/* User Info */}
                <div className="px-4 py-3 border-b border-gray-200">
                  <p className="text-sm font-semibold text-gray-900">{getUserDisplayName()}</p>
                  {getUserEmail() && (
                    <p className="text-xs text-gray-600 truncate">{getUserEmail()}</p>
                  )}
                  {getUserRole() && (
                    <p className="text-xs text-gray-500 mt-1">{getUserRole()}</p>
                  )}
                </div>

                {/* Menu Items */}
                <div className="py-1">
                  <Link
                    to="/profile"
                    onClick={() => setShowDropdown(false)}
                    className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
                    </svg>
                    My Profile
                  </Link>

                  <Link
                    to="/settings"
                    onClick={() => setShowDropdown(false)}
                    className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/>
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                    </svg>
                    Settings
                  </Link>

                  {/* Feedback Management — Ambulance Personnel only */}
                  {isAmbulancePersonnel && (
                    <Link
                      to="/feedback-management"
                      onClick={() => setShowDropdown(false)}
                      className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"/>
                      </svg>
                      Patient Feedback
                      {unreadCount > 0 && (
                        <span className="ml-auto bg-red-100 text-red-700 text-xs font-bold px-2 py-0.5 rounded-full">
                          {unreadCount}
                        </span>
                      )}
                    </Link>
                  )}

                  <div className="border-t border-gray-200 my-1"></div>

                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition w-full text-left"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/>
                    </svg>
                    Logout
                  </button>
                </div>
              </div>
            )}
          </div>

        </div>

      </div>
    </nav>
  );
}

export default Navbar;