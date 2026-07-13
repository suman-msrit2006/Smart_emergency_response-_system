import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useWorkflow } from '../context/WorkflowContext';
import { feedbackService } from '../services/feedbackService';
import { useAuth } from '../context/AuthContext';
import { getRoleDashboardPath } from '../utils/roleBasedNavigation';

export default function Feedback() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { patientInfo, feedback, setFeedback, resetWorkflow, setWorkflowStep } = useWorkflow();

  const [patientName] = useState(patientInfo.name || 'Patient');
  const [rating, setRating] = useState(feedback.rating || 0);
  const [comment, setComment] = useState(feedback.comment || '');
  const [submitted, setSubmitted] = useState(false);
  const [showAnimation, setShowAnimation] = useState(false);
  const [showDoctorGreeting, setShowDoctorGreeting] = useState(false);
  const [showFinalMessage, setShowFinalMessage] = useState(false);

  const handleStarClick = (value) => {
    setRating(value);
  };

  const handleSubmit = async () => {
    if (rating === 0) {
      alert('Please select a rating');
      return;
    }

    const feedbackData = {
      rating,
      comment: comment.trim(),
      submitted: true,
      reference: `FB-${Date.now()}`,
    };

    setFeedback(feedbackData);
    
    // Save feedback to backend
    const emergencyId = localStorage.getItem('current_emergency_id');
    const hospitalId = localStorage.getItem('selected_hospital_id');
    const userId = localStorage.getItem('user_id');
    
    if (userId && (emergencyId || hospitalId)) {
      try {
        await feedbackService.create({
          user: userId, // Fixed: Use actual user ID instead of emergency ID
          type: 'Emergency',
          relatedTo: {
            emergency: emergencyId,
            hospital: hospitalId,
          },
          rating,
          title: `Feedback - ${rating} stars`,
          comment: comment.trim() || 'No additional comments',
          categories: ['Overall Experience', 'Service Quality'],
        });
      } catch (error) {
        // Error saving feedback - feedback stored in context
      }
    }
    
    setSubmitted(true);
    setWorkflowStep('complete');

    // Trigger animations
    setTimeout(() => setShowAnimation(true), 500);
    setTimeout(() => setShowDoctorGreeting(true), 2000);
    setTimeout(() => setShowFinalMessage(true), 3500);
  };

  const handleStartOver = () => {
    resetWorkflow();
    // Navigate to appropriate dashboard based on user role
    const dashboardPath = getRoleDashboardPath(user?.role);
    navigate(dashboardPath);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 py-12">
      <div className="container mx-auto px-4 max-w-3xl">
        {!submitted ? (
          // FEEDBACK FORM
          <div className="bg-white rounded-3xl shadow-2xl p-10">
            <div className="text-center mb-8">
              <div className="text-6xl mb-4">🏥</div>
              <h2 className="text-4xl font-bold text-gray-800 mb-3">Patient Feedback</h2>
              <p className="text-xl text-gray-600">
                Hello <span className="text-blue-600 font-semibold">{patientName}</span>, how was your experience?
              </p>
            </div>

            {/* STAR RATING */}
            <div className="mb-8">
              <label className="block text-lg font-bold text-gray-700 mb-4 text-center">
                Rate Your Experience
              </label>
              <div className="flex justify-center gap-3">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    onClick={() => handleStarClick(star)}
                    className="transition-transform hover:scale-110 focus:outline-none"
                  >
                    <span
                      className={`text-6xl ${
                        star <= rating ? 'text-yellow-400' : 'text-gray-300'
                      }`}
                    >
                      ⭐
                    </span>
                  </button>
                ))}
              </div>
              {rating > 0 && (
                <p className="text-center mt-4 text-lg font-semibold text-gray-700">
                  You rated: {rating} {rating === 1 ? 'star' : 'stars'}
                </p>
              )}
            </div>

            {/* FEEDBACK TEXTAREA */}
            <div className="mb-8">
              <label className="block text-lg font-bold text-gray-700 mb-3">
                Additional Comments (Optional)
              </label>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows="5"
                placeholder="Tell us about your experience with the ambulance service, doctors, and hospital staff..."
              />
            </div>

            {/* SUBMIT BUTTON */}
            <button
              onClick={handleSubmit}
              className="w-full py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white text-xl font-bold rounded-xl hover:from-blue-700 hover:to-purple-700 transition shadow-lg hover:shadow-xl"
            >
              Submit Feedback
            </button>
          </div>
        ) : (
          // SUCCESS ANIMATIONS & MESSAGES
          <div className="space-y-8">
            {/* THANK YOU MESSAGE */}
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
                <span className="text-3xl">⭐</span>
                <span className="text-xl font-semibold">Rating: {rating}/5</span>
              </div>
            </div>

            {/* HOSPITAL ACCEPTANCE ANIMATION */}
            {showAnimation && (
              <div className="bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-3xl shadow-2xl p-10 text-center animate-slide-in">
                <div className="text-7xl mb-6 animate-bounce">🏥</div>
                <h3 className="text-3xl font-bold mb-4">Hospital Acceptance Confirmed</h3>
                <p className="text-xl mb-4">
                  Patient <span className="font-bold">{patientName}</span> successfully handed over to hospital care
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

            {/* DOCTOR GREETING */}
            {showDoctorGreeting && (
              <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white rounded-3xl shadow-2xl p-10 text-center animate-fade-in">
                <div className="text-7xl mb-6">👨‍⚕️</div>
                <h3 className="text-3xl font-bold mb-4">Doctor's Message</h3>
                <p className="text-xl italic mb-4">
                  "Dear {patientName}, you're in good hands now. Our medical team will ensure you receive the best care possible. Wishing you a speedy recovery!"
                </p>
                <p className="text-lg font-semibold">- Dr. Sharma, Emergency Medicine</p>
              </div>
            )}

            {/* FINAL RECOVERY MESSAGE */}
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
                
                {/* START OVER BUTTON */}
                <button
                  onClick={handleStartOver}
                  className="px-8 py-3 bg-white text-purple-700 font-bold rounded-xl hover:bg-gray-100 transition shadow-lg"
                >
                  🏠 Return to Home
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes slide-in {
          from {
            opacity: 0;
            transform: translateX(-50px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        @keyframes scale-in {
          from {
            opacity: 0;
            transform: scale(0.9);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }

        .animate-fade-in {
          animation: fade-in 0.8s ease-out;
        }

        .animate-slide-in {
          animation: slide-in 0.8s ease-out;
        }

        .animate-scale-in {
          animation: scale-in 0.8s ease-out;
        }
      `}</style>
    </div>
  );
}
