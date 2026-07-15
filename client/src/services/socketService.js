import { io } from 'socket.io-client';
import { SOCKET_URL } from '../config/api';
import { authService } from './authService';

class SocketService {
  constructor() {
    this.socket = null;
    this.listeners = new Map();
  }

  connect() {
    if (this.socket?.connected) {
      return this.socket;
    }

    const token = authService.getToken();
    
    if (!token) {
      console.warn('No token available for socket connection');
      return null;
    }

    this.socket = io(SOCKET_URL, {
      auth: { token },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 5,
    });

    this.socket.on('connect', () => {
      // Socket connected - silent in production
    });

    this.socket.on('disconnect', () => {
      // Socket disconnected - silent in production
    });

    this.socket.on('connect_error', () => {
      // Socket connection error - silent in production
    });

    return this.socket;
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.listeners.clear();
    }
  }

  on(event, callback) {
    if (!this.socket) {
      console.warn('Socket not connected. Call connect() first.');
      return;
    }

    this.socket.on(event, callback);
    
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event).push(callback);
  }

  off(event, callback) {
    if (!this.socket) return;

    this.socket.off(event, callback);

    if (this.listeners.has(event)) {
      const callbacks = this.listeners.get(event);
      const index = callbacks.indexOf(callback);
      if (index > -1) {
        callbacks.splice(index, 1);
      }
    }
  }

  emit(event, data) {
    if (!this.socket) {
      console.warn('Socket not connected. Call connect() first.');
      return;
    }

    this.socket.emit(event, data);
  }

  joinAmbulance(ambulanceId) {
    this.emit('join:ambulance', ambulanceId);
  }

  joinEmergency(emergencyId) {
    this.emit('join:emergency', emergencyId);
  }

  joinHospital(hospitalId) {
    this.emit('join:hospital', hospitalId);
  }

  joinPatient(patientId) {
    this.emit('join:patient', patientId);
  }

  onAmbulanceLocationUpdate(callback) {
    this.on('ambulance:locationUpdate', callback);
  }

  onEmergencyStatusChanged(callback) {
    this.on('emergency:statusChanged', callback);
  }

  onNewVitals(callback) {
    this.on('vitals:new', callback);
  }

  onVitalsUpdated(callback) {
    this.on('vitals:updated', callback);
  }

  onEmergencyCreated(callback) {
    this.on('emergency:created', callback);
  }

  onAmbulanceAssigned(callback) {
    this.on('ambulance:assigned', callback);
  }

  onEmergencyAssigned(callback) {
    this.on('emergency:assigned', callback);
  }

  // Emergency Request events (NEW)
  onEmergencyRequestAccepted(callback) {
    this.on('emergency:request:accepted', callback);
  }

  onEmergencyStatusUpdated(callback) {
    this.on('emergency:status:updated', callback);
  }

  onAmbulanceLocationUpdated(callback) {
    this.on('ambulance:location:updated', callback);
  }

  onEmergencyRequestNew(callback) {
    this.on('emergency:request:new', callback);
  }

  onEmergencyRequestCancelled(callback) {
    this.on('emergency:request:cancelled', callback);
  }

  // Notification events
  onNewNotification(callback) {
    this.on('notification:new', callback);
  }

  offNewNotification(callback) {
    this.off('notification:new', callback);
  }
}

export default new SocketService();
