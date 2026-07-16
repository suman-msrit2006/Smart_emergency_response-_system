import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { notificationService } from '../services/notificationService';
import { useAuth } from '../context/AuthContext';
import { getRoleDashboardPath } from '../utils/roleBasedNavigation';

/* ─── Star display (read-only) ──────────────────────────────────────────── */
function StarDisplay({ value }) {
  return (
    <span className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <span
          key={star}
          className={`text-lg leading-none ${star <= value ? 'text-yellow-400' : 'text-gray-300'}`}
        >
          ★
        </span>
      ))}
    </span>
  );
}

/* ─── Rating badge colour helper ─────────────────────────────────────────── */
function ratingColor(rating) {
  if (rating >= 4) return 'bg-green-100 text-green-700 border-green-200';
  if (rating === 3) return 'bg-yellow-100 text-yellow-700 border-yellow-200';
  return 'bg-red-100 text-red-700 border-red-200';
}

/* ─── Single notification card ───────────────────────────────────────────── */
function FeedbackCard({ notification, onMarkRead }) {
  const { meta, isRead, createdAt, _id } = notification;
  const date = new Date(createdAt).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <div
      className={`relative bg-white rounded-2xl shadow-sm border transition-all duration-200 hover:shadow-md ${
        !isRead ? 'border-teal-300 ring-1 ring-teal-200' : 'border-gray-200'
      }`}
    >
      {/* Unread indicator dot */}
      {!isRead && (
        <span className="absolute top-4 right-4 w-2.5 h-2.5 bg-teal-500 rounded-full shadow" />
      )}

      <div className="p-6">
        {/* Header row */}
        <div className="flex items-start justify-between gap-4 mb-4">
          <div>
            <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
              <span className="text-lg">⭐</span>
              {meta.patientName || 'Patient'}
            </h3>
            <p className="text-xs text-gray-500 mt-0.5">{date}</p>
          </div>
          <div className={`flex items-center gap-1 px-3 py-1 rounded-full border text-sm font-bold ${ratingColor(meta.rating)}`}>
            {meta.rating}/5
          </div>
        </div>

        {/* Star rating */}
        <div className="mb-4">
          <StarDisplay value={meta.rating} />
        </div>

        {/* Details grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
          <div className="bg-gray-50 rounded-lg px-4 py-3">
            <p className="text-xs text-gray-500 mb-0.5">Emergency ID</p>
            <p className="text-sm font-semibold text-gray-800 font-mono">
              {meta.emergencyId || '—'}
            </p>
          </div>
          <div className="bg-gray-50 rounded-lg px-4 py-3">
            <p className="text-xs text-gray-500 mb-0.5">Ambulance</p>
            <p className="text-sm font-semibold text-gray-800">{meta.ambulanceNumber || '—'}</p>
          </div>
          <div className="bg-gray-50 rounded-lg px-4 py-3 sm:col-span-2">
            <p className="text-xs text-gray-500 mb-0.5">Hospital</p>
            <p className="text-sm font-semibold text-gray-800">{meta.hospitalName || '—'}</p>
          </div>
        </div>

        {/* Comment */}
        {meta.comment && (
          <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 mb-4">
            <p className="text-xs text-blue-600 font-semibold mb-1">Patient Comments</p>
            <p className="text-sm text-gray-700 leading-relaxed">{meta.comment}</p>
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between pt-2 border-t border-gray-100">
          <span
            className={`text-xs font-medium px-2.5 py-1 rounded-full ${
              isRead
                ? 'bg-gray-100 text-gray-500'
                : 'bg-teal-50 text-teal-700 border border-teal-200'
            }`}
          >
            {isRead ? '✓ Read' : '● Unread'}
          </span>

          {!isRead && (
            <button
              onClick={() => onMarkRead(_id)}
              className="text-xs font-semibold text-teal-600 hover:text-teal-800 transition"
            >
              Mark as Read
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

/* ─── Summary stats bar ───────────────────────────────────────────────────── */
function StatsBar({ notifications }) {
  const total = notifications.length;
  const unread = notifications.filter((n) => !n.isRead).length;
  const ratings = notifications.map((n) => n.meta?.rating || 0).filter(Boolean);
  const avgRating = ratings.length
    ? (ratings.reduce((a, b) => a + b, 0) / ratings.length).toFixed(1)
    : '—';

  return (
    <div className="grid grid-cols-3 gap-4 mb-8">
      {[
        { label: 'Total Feedbacks', value: total, color: 'text-gray-800' },
        { label: 'Unread', value: unread, color: 'text-teal-600' },
        { label: 'Avg Rating', value: avgRating === '—' ? '—' : `${avgRating}/5`, color: 'text-yellow-600' },
      ].map(({ label, value, color }) => (
        <div key={label} className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 text-center">
          <div className={`text-3xl font-extrabold ${color} mb-1`}>{value}</div>
          <div className="text-xs text-gray-500">{label}</div>
        </div>
      ))}
    </div>
  );
}

/* ─── Main page component ─────────────────────────────────────────────────── */
export default function FeedbackManagement() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all'); // 'all' | 'unread' | 'read'
  const [markingAll, setMarkingAll] = useState(false);

  // Role verification - redirect immediately if wrong role
  const isAmbulancePersonnel = user?.role === 'Ambulance Personnel';

  // Guard: only Ambulance Personnel can view this page - redirect BEFORE API calls
  useEffect(() => {
    if (user && !isAmbulancePersonnel) {
      navigate(getRoleDashboardPath(user.role), { replace: true });
    }
  }, [user, isAmbulancePersonnel, navigate]);

  const fetchNotifications = useCallback(async () => {
    if (!user) return; // Wait for user to load
    if (!isAmbulancePersonnel) return; // Only for ambulance personnel
    
    try {
      setLoading(true);
      setError(null);
      const data = await notificationService.getAll({ limit: 50 });
      // Only show feedback-type notifications
      const feedbackNotifs = (data.notifications || []).filter((n) => n.type === 'feedback');
      setNotifications(feedbackNotifs);
    } catch (err) {
      setError(err?.message || 'Failed to load feedback notifications.');
    } finally {
      setLoading(false);
    }
  }, [isAmbulancePersonnel, user]);

  useEffect(() => {
    if (!user) return; // Wait for user to load
    if (!isAmbulancePersonnel) return; // Wrong role - will be redirected
    
    fetchNotifications();
  }, [isAmbulancePersonnel, user, fetchNotifications]);

  const handleMarkRead = async (id) => {
    // CRITICAL: Double-check role before making API call
    if (!user || !isAmbulancePersonnel) return;
    
    try {
      await notificationService.markAsRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n._id === id ? { ...n, isRead: true } : n))
      );
    } catch {
      // silently ignore
    }
  };

  const handleMarkAllRead = async () => {
    // CRITICAL: Double-check role before making API call
    if (!user || !isAmbulancePersonnel) return;
    
    try {
      setMarkingAll(true);
      await notificationService.markAllAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    } catch {
      // silently ignore
    } finally {
      setMarkingAll(false);
    }
  };

  // Filtered list
  const filteredNotifications = notifications.filter((n) => {
    if (filter === 'unread') return !n.isRead;
    if (filter === 'read') return n.isRead;
    return true;
  });

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  /* ── Render ─────────────────────────────────────────────────────────────── */
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-4xl mx-auto px-4 py-10">

        {/* Page header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-teal-100 rounded-xl flex items-center justify-center">
              <svg className="w-5 h-5 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"/>
              </svg>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Patient Feedback</h1>
              <p className="text-sm text-gray-500">Feedback received from patients you assisted</p>
            </div>
          </div>
        </div>

        {/* Stats */}
        {!loading && !error && <StatsBar notifications={notifications} />}

        {/* Controls */}
        {!loading && !error && notifications.length > 0 && (
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-6">
            {/* Filter tabs */}
            <div className="flex bg-white border border-gray-200 rounded-lg p-1 gap-1 shadow-sm">
              {[
                { key: 'all', label: `All (${notifications.length})` },
                { key: 'unread', label: `Unread (${unreadCount})` },
                { key: 'read', label: `Read (${notifications.length - unreadCount})` },
              ].map(({ key, label }) => (
                <button
                  key={key}
                  onClick={() => setFilter(key)}
                  className={`px-4 py-1.5 rounded-md text-sm font-medium transition ${
                    filter === key
                      ? 'bg-teal-600 text-white shadow-sm'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>

            {/* Mark all read */}
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllRead}
                disabled={markingAll}
                className="flex items-center gap-2 px-4 py-2 bg-teal-600 text-white text-sm font-semibold rounded-lg hover:bg-teal-700 transition disabled:opacity-60"
              >
                {markingAll ? (
                  <span className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
                ) : (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                  </svg>
                )}
                Mark All Read
              </button>
            )}
          </div>
        )}

        {/* States */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <div className="w-10 h-10 border-4 border-teal-600 border-t-transparent rounded-full animate-spin" />
            <p className="text-gray-500 text-sm">Loading feedback notifications…</p>
          </div>
        )}

        {!loading && error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
            <p className="text-red-600 font-semibold mb-2">Failed to load notifications</p>
            <p className="text-sm text-red-500 mb-4">{error}</p>
            <button
              onClick={fetchNotifications}
              className="px-4 py-2 bg-red-600 text-white text-sm font-semibold rounded-lg hover:bg-red-700 transition"
            >
              Try Again
            </button>
          </div>
        )}

        {!loading && !error && notifications.length === 0 && (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">🔔</div>
            <h2 className="text-xl font-bold text-gray-700 mb-2">No Feedback Yet</h2>
            <p className="text-gray-500 text-sm max-w-sm mx-auto">
              Patient feedback will appear here after you complete an emergency assignment.
            </p>
          </div>
        )}

        {!loading && !error && filteredNotifications.length === 0 && notifications.length > 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">No {filter} notifications.</p>
            <button
              onClick={() => setFilter('all')}
              className="mt-2 text-teal-600 text-sm font-medium hover:underline"
            >
              Show all
            </button>
          </div>
        )}

        {/* Notification cards */}
        {!loading && !error && filteredNotifications.length > 0 && (
          <div className="space-y-4">
            {filteredNotifications.map((notification) => (
              <FeedbackCard
                key={notification._id}
                notification={notification}
                onMarkRead={handleMarkRead}
              />
            ))}
          </div>
        )}

      </div>
    </div>
  );
}
