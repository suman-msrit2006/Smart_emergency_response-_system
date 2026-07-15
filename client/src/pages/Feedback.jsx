import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useWorkflow } from '../context/WorkflowContext';
import { feedbackService } from '../services/feedbackService';
import { useAuth } from '../context/AuthContext';
import { getRoleDashboardPath } from '../utils/roleBasedNavigation';

const RATING_CATEGORIES = [
  { key: 'responseSpeed', label: 'Emergency Response Speed', category: 'Wait Time' },
  { key: 'staffProfessionalism', label: 'Ambulance Staff Professionalism', category: 'Staff Behavior' },
  { key: 'hospitalCoordination', label: 'Hospital Coordination', category: 'Communication' },
  { key: 'overallSatisfaction', label: 'Overall Satisfaction', category: 'Overall Experience' },
];

function StarRating({ value, onChange }) {
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => onChange(star)}
          className="transition-transform hover:scale-110 focus:outline-none text-2xl leading-none"
          aria-label={`Rate ${star} star${star > 1 ? 's' : ''}`}
        >
          <span className={star <= value ? 'text-yellow-400' : 'text-gray-300'}>★</span>
        </button>
      ))}
    </div>
  );
}

function DetailRow({ label, value }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center py-2 border-b border-gray-200 last:border-b-0">
      <span className="text-sm font-semibold text-gray-600 sm:w-40">{label}</span>
      <span className="text-sm font-medium text-gray-900">{value}</span>
    </div>
  );
}

export default function Feedback() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { patientInfo, selectedAmbulance, selectedHospital, feedback, setFeedback, resetWorkflow, setWorkflowStep } = useWorkflow();

  const [ratings, setRatings] = useState({
    responseSpeed: feedback.rating || 0,
    staffProfessionalism: 0,
    hospitalCoordination: 0,
    overallSatisfaction: 0,
  });
  const [comment, setComment] = useState(feedback.comment || '');
  const [confirmed, setConfirmed] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [showAnimation, setShowAnimation] = useState(false);
  const [showDoctorGreeting, setShowDoctorGreeting] = useState(false);
  const [showFinalMessage, setShowFinalMessage] = useState(false);

  const patientDetails = useMemo(() => {
    const storedHospital = (() => {
      try {
        return JSON.parse(localStorage.getItem('selected_hospital') || 'null');
      } catch {
        return null;
      }
    })();

    const storedAmbulance = (() => {
      try {
        return JSON.parse(localStorage.getItem('selected_ambulance') || 'null');
      } catch {
        return null;
      }
    })();

    const emergencyRequestId = localStorage.getItem('emergency_request_id');
    const formattedDate = new Date().toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });

    const displayEmergencyId = emergencyRequestId
      ? `EMR-${new Date().getFullYear()}-${emergencyRequestId.slice(-4).toUpperCase()}`
      : 'N/A';

    return {
      name: user?.name || patientInfo.name || 'Patient',
      emergencyId: displayEmergencyId,
      hospital: selectedHospital?.name || storedHospital?.name || 'Not assigned',
      ambulance:
        selectedAmbulance?.vehicleNumber ||
        storedAmbulance?.vehicleNumber ||
        'Not assigned',
      date: formattedDate,
    };
  }, [user, patientInfo, selectedHospital, selectedAmbulance]);

  const handleRatingChange = (key, value) => {
    setRatings((prev) => ({ ...prev, [key]: value }));
  };

  const buildStructuredComment = () => {
    const breakdown = RATING_CATEGORIES.map(
      ({ key, label }) => `${label}: ${ratings[key]}/5`
    ).join('. ');

    const userComment = comment.trim();
    if (userComment) {
      return `${breakdown}. Additional comments: ${userComment}. Patient confirmed feedback accuracy.`;
    }
    return `${breakdown}. Patient confirmed feedback accuracy.`;
  };

  const handleSubmit = async () => {
    const allRated = RATING_CATEGORIES.every(({ key }) => ratings[key] > 0);

    if (!allRated) {
      alert('Please rate all categories before submitting.');
      return;
    }

    if (!confirmed) {
      alert('Please confirm that your feedback is accurate.');
      return;
    }

    const overallRating = ratings.overallSatisfaction;
    const structuredComment = buildStructuredComment();

    const feedbackData = {
      rating: overallRating,
      comment: structuredComment,
      submitted: true,
      reference: `FB-${Date.now()}`,
    };

    setFeedback(feedbackData);

    const emergencyId = localStorage.getItem('emergency_request_id') || localStorage.getItem('current_emergency_id');
    const hospitalId = localStorage.getItem('selected_hospital_id');
    const ambulanceId = localStorage.getItem('selected_ambulance_id');
    const userId = user?._id || user?.id;

    if (userId && (emergencyId || hospitalId)) {
      try {
        await feedbackService.create({
          user: userId,
          type: 'Emergency',
          relatedTo: {
            emergency: emergencyId,
            hospital: hospitalId,
            ambulance: ambulanceId,
          },
          rating: overallRating,
          title: `Patient Feedback - ${patientDetails.emergencyId}`,
          comment: structuredComment,
          categories: RATING_CATEGORIES.map(({ category }) => category),
        });
      } catch {
        // Feedback stored in context if API call fails
      }
    }

    setSubmitted(true);
    setWorkflowStep('complete');

    setTimeout(() => setShowAnimation(true), 500);
    setTimeout(() => setShowDoctorGreeting(true), 2000);
    setTimeout(() => setShowFinalMessage(true), 3500);
  };

  const handleStartOver = () => {
    resetWorkflow();
    navigate(getRoleDashboardPath(user?.role));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 py-12">
      <div className="container mx-auto px-4 max-w-3xl">
        {!submitted ? (
          <div className="bg-white rounded-3xl shadow-2xl p-8 md:p-10">
            <div className="text-center mb-8">
              <div className="text-5xl mb-4">🏥</div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-2">Patient Feedback</h2>
              <p className="text-gray-600">
                Hello <span className="font-semibold text-blue-600">{patientDetails.name}</span>, how was your experience?
              </p>
              <p className="text-sm text-gray-500 mt-2">
                Help us improve our emergency medical services.
              </p>
            </div>

            <div className="mb-8 rounded-xl border border-gray-200 bg-gray-50 p-6">
              <h3 className="text-lg font-bold text-gray-800 mb-4">Patient Details</h3>
              <DetailRow label="Patient Name" value={patientDetails.name} />
              <DetailRow label="Emergency ID" value={patientDetails.emergencyId} />
              <DetailRow label="Hospital" value={patientDetails.hospital} />
              <DetailRow label="Ambulance" value={patientDetails.ambulance} />
              <DetailRow label="Date" value={patientDetails.date} />
            </div>

            <div className="mb-8">
              <h3 className="text-lg font-bold text-gray-800 mb-6">Rate Your Experience</h3>
              <div className="space-y-5">
                {RATING_CATEGORIES.map(({ key, label }) => (
                  <div
                    key={key}
                    className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 py-3 border-b border-gray-100 last:border-b-0"
                  >
                    <span className="text-sm font-medium text-gray-700">{label}</span>
                    <StarRating
                      value={ratings[key]}
                      onChange={(value) => handleRatingChange(key, value)}
                    />
                  </div>
                ))}
              </div>
            </div>

            <div className="mb-6">
              <label className="block text-lg font-bold text-gray-700 mb-3">
                Additional Comments
              </label>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-y min-h-[120px]"
                rows="5"
                placeholder="Tell us about your experience with the ambulance service, doctors, and hospital staff..."
              />
            </div>

            <label className="flex items-start gap-3 mb-8 cursor-pointer">
              <input
                type="checkbox"
                checked={confirmed}
                onChange={(e) => setConfirmed(e.target.checked)}
                className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <span className="text-sm text-gray-700">
                I confirm this feedback is accurate.
              </span>
            </label>

            <button
              type="button"
              onClick={handleSubmit}
              className="w-full py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white text-xl font-bold rounded-xl hover:from-blue-700 hover:to-purple-700 transition shadow-lg hover:shadow-xl"
            >
              Submit Feedback
            </button>
          </div>
        ) : (
          <div className="space-y-8">
            <div className="bg-white rounded-3xl shadow-2xl p-10 text-center animate-fade-in">
              <div className="text-7xl mb-6">✅</div>
              <h2 className="text-4xl font-bold text-green-600 mb-4">Thank You!</h2>
              <p className="text-xl text-gray-700 mb-6">
                Your feedback has been recorded successfully.
              </p>
              <div className="bg-gray-100 rounded-xl p-6 mb-6">
                <p className="text-sm text-gray-600 mb-2">Reference Number</p>
                <p className="text-2xl font-bold text-gray-800">{feedback.reference}</p>
              </div>
              <div className="flex items-center justify-center gap-2 text-gray-600">
                <span className="text-3xl">★</span>
                <span className="text-xl font-semibold">
                  Overall Rating: {ratings.overallSatisfaction}/5
                </span>
              </div>
            </div>

            {showAnimation && (
              <div className="bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-3xl shadow-2xl p-10 text-center animate-slide-in">
                <div className="text-7xl mb-6 animate-bounce">🏥</div>
                <h3 className="text-3xl font-bold mb-4">Hospital Acceptance Confirmed</h3>
                <p className="text-xl mb-4">
                  Patient <span className="font-bold">{patientDetails.name}</span> successfully handed over to hospital care
                </p>
                <div className="flex justify-center gap-4 mt-6">
                  <div className="bg-white bg-opacity-20 rounded-xl px-6 py-3">
                    <span className="text-4xl">✅</span>
                    <p className="text-sm mt-2">Vitals Stable</p>
                  </div>
                  <div className="bg-white bg-opacity-20 rounded-xl px-6 py-3">
                    <span className="text-4xl">🩺</span>
                    <p className="text-sm mt-2">Doctor Assigned</p>
                  </div>
                  <div className="bg-white bg-opacity-20 rounded-xl px-6 py-3">
                    <span className="text-4xl">🛏️</span>
                    <p className="text-sm mt-2">Bed Ready</p>
                  </div>
                </div>
              </div>
            )}

            {showDoctorGreeting && (
              <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white rounded-3xl shadow-2xl p-10 text-center animate-fade-in">
                <div className="text-7xl mb-6">👨‍⚕️</div>
                <h3 className="text-3xl font-bold mb-4">Doctor&apos;s Message</h3>
                <p className="text-xl italic mb-4">
                  &quot;Dear {patientDetails.name}, you&apos;re in good hands now. Our medical team will ensure you receive the best care possible. Wishing you a speedy recovery!&quot;
                </p>
                <p className="text-lg font-semibold">- Dr. Sharma, Emergency Medicine</p>
              </div>
            )}

            {showFinalMessage && (
              <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-3xl shadow-2xl p-10 text-center animate-scale-in">
                <div className="text-7xl mb-6">💪</div>
                <h3 className="text-4xl font-bold mb-4">Get Well Soon!</h3>
                <p className="text-xl mb-6">
                  The entire team wishes you a quick and complete recovery. Thank you for trusting our emergency services.
                </p>
                <div className="grid grid-cols-3 gap-4 mb-8">
                  <div className="bg-white bg-opacity-20 rounded-xl p-4">
                    <span className="text-3xl mb-2 block">🚑</span>
                    <p className="text-sm">Ambulance Service</p>
                  </div>
                  <div className="bg-white bg-opacity-20 rounded-xl p-4">
                    <span className="text-3xl mb-2 block">🏥</span>
                    <p className="text-sm">Hospital Care</p>
                  </div>
                  <div className="bg-white bg-opacity-20 rounded-xl p-4">
                    <span className="text-3xl mb-2 block">❤️</span>
                    <p className="text-sm">Medical Team</p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleStartOver}
                  className="px-8 py-3 bg-white text-purple-700 font-bold rounded-xl hover:bg-gray-100 transition shadow-lg"
                >
                  Return to Dashboard
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      <style>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes slide-in {
          from { opacity: 0; transform: translateX(-50px); }
          to { opacity: 1; transform: translateX(0); }
        }
        @keyframes scale-in {
          from { opacity: 0; transform: scale(0.9); }
          to { opacity: 1; transform: scale(1); }
        }
        .animate-fade-in { animation: fade-in 0.8s ease-out; }
        .animate-slide-in { animation: slide-in 0.8s ease-out; }
        .animate-scale-in { animation: scale-in 0.8s ease-out; }
      `}</style>
    </div>
  );
}
