import axiosInstance from './axiosInstance';

/**
 * Create a new emergency request
 */
export const createEmergencyRequest = async (requestData) => {
  try {
    console.log('[emergencyRequestService] Sending request to:', '/emergency-requests');
    console.log('[emergencyRequestService] Request data:', requestData);
    
    const response = await axiosInstance.post('/emergency-requests', requestData);
    
    console.log('[emergencyRequestService] Response received:', response.data);
    return response.data;
  } catch (error) {
    console.error('[emergencyRequestService] Error:', error);
    console.error('[emergencyRequestService] Error message:', error.message);
    console.error('[emergencyRequestService] Error response:', error.response);
    throw error;
  }
};

/**
 * Get all emergency requests for the logged-in patient
 */
export const getMyRequests = async () => {
  const response = await axiosInstance.get('/emergency-requests/my-requests');
  return response.data;
};

/**
 * Get current active emergency request
 */
export const getActiveRequest = async () => {
  const response = await axiosInstance.get('/emergency-requests/active');
  return response.data;
};

/**
 * Cancel an emergency request
 */
export const cancelRequest = async (requestId) => {
  const response = await axiosInstance.patch(`/emergency-requests/${requestId}/cancel`);
  return response.data;
};

/**
 * Get pending emergency requests (Ambulance Personnel only)
 */
export const getPendingRequests = async (longitude, latitude, maxDistance = 50000) => {
  const response = await axiosInstance.get('/emergency-requests/pending', {
    params: { longitude, latitude, maxDistance },
  });
  return response.data;
};

/**
 * Accept an emergency request (Ambulance Personnel only)
 */
export const acceptRequest = async (requestId, ambulanceId) => {
  const response = await axiosInstance.patch(`/emergency-requests/${requestId}/accept`, {
    ambulanceId,
  });
  return response.data;
};

/**
 * Reject an emergency request (Ambulance Personnel only)
 */
export const rejectRequest = async (requestId, reason) => {
  const response = await axiosInstance.patch(`/emergency-requests/${requestId}/reject`, {
    reason,
  });
  return response.data;
};

/**
 * Update emergency request status (Ambulance Personnel only)
 */
export const updateRequestStatus = async (requestId, status) => {
  const response = await axiosInstance.patch(`/emergency-requests/${requestId}/status`, {
    status,
  });
  return response.data;
};

/**
 * Get logged-in personnel's assigned ambulance
 */
export const getMyAmbulance = async () => {
  const response = await axiosInstance.get('/emergency-requests/my-ambulance');
  return response.data;
};

/**
 * Get active assignment for logged-in personnel
 */
export const getActiveAssignment = async () => {
  const response = await axiosInstance.get('/emergency-requests/assignment');
  return response.data;
};

export default {
  createEmergencyRequest,
  getMyRequests,
  getActiveRequest,
  cancelRequest,
  getPendingRequests,
  acceptRequest,
  rejectRequest,
  updateRequestStatus,
  getMyAmbulance,
  getActiveAssignment,
};
