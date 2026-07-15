import { useState, useEffect, useRef, useCallback } from 'react';
import { ambulanceService } from '../services/ambulanceService';

const UPDATE_INTERVAL_MS = 5000;

/**
 * Tracks GPS location and sends updates to the backend at 5-second intervals.
 * Used by Ambulance Personnel when online.
 */
export function useGPSTracking({ enabled, ambulanceId, onError }) {
  const [position, setPosition] = useState(null);
  const [gpsStatus, setGpsStatus] = useState('idle'); // idle | tracking | denied | unavailable | error
  const watchIdRef = useRef(null);
  const lastSentRef = useRef(0);
  const pendingCoordsRef = useRef(null);

  const sendLocation = useCallback(async (coords) => {
    if (!ambulanceId) return;

    const now = Date.now();
    if (now - lastSentRef.current < UPDATE_INTERVAL_MS) {
      pendingCoordsRef.current = coords;
      return;
    }

    lastSentRef.current = now;
    pendingCoordsRef.current = null;

    try {
      await ambulanceService.updateLocation(ambulanceId, [coords.longitude, coords.latitude]);
    } catch (err) {
      onError?.(err.message || 'Failed to update location');
    }
  }, [ambulanceId, onError]);

  useEffect(() => {
    if (!enabled || !ambulanceId) {
      setGpsStatus('idle');
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
        watchIdRef.current = null;
      }
      return;
    }

    if (!navigator.geolocation) {
      setGpsStatus('unavailable');
      onError?.('Geolocation is not supported by this browser');
      return;
    }

    setGpsStatus('tracking');

    watchIdRef.current = navigator.geolocation.watchPosition(
      (pos) => {
        const coords = {
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
        };
        setPosition(coords);
        sendLocation(coords);
      },
      (err) => {
        if (err.code === err.PERMISSION_DENIED) {
          setGpsStatus('denied');
          onError?.('GPS permission denied. Enable location access to go online.');
        } else {
          setGpsStatus('error');
          onError?.('Unable to retrieve GPS location');
        }
      },
      { enableHighAccuracy: true, maximumAge: 5000, timeout: 15000 }
    );

    const flushInterval = setInterval(() => {
      if (pendingCoordsRef.current) {
        sendLocation(pendingCoordsRef.current);
      }
    }, UPDATE_INTERVAL_MS);

    return () => {
      clearInterval(flushInterval);
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
        watchIdRef.current = null;
      }
    };
  }, [enabled, ambulanceId, sendLocation, onError]);

  return { position, gpsStatus };
}

export default useGPSTracking;
