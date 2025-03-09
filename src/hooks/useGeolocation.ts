import { useState, useEffect, useCallback } from 'react';
import { UserLocation } from '../types';

interface GeolocationOptions {
  enableHighAccuracy: boolean;
  timeout: number;
  maximumAge: number;
}

export function useGeolocation(isTracking: boolean, interval: number = 10000) {
  const [location, setLocation] = useState<UserLocation | null>(null);
  const [error, setError] = useState<string | null>(null);

  const updateLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser');
      return;
    }

    const options: GeolocationOptions = {
      enableHighAccuracy: true,
      timeout: 5000,
      maximumAge: 0
    };

    const success = (position: GeolocationPosition) => {
      const { coords, timestamp } = position;
      
      setLocation({
        latitude: coords.latitude,
        longitude: coords.longitude,
        heading: coords.heading,
        accuracy: coords.accuracy,
        timestamp
      });
      
      setError(null);
    };

    const handleError = (error: GeolocationPositionError) => {
      setError(error.message);
    };

    navigator.geolocation.getCurrentPosition(success, handleError, options);
  }, []);

  useEffect(() => {
    // Only get location if tracking is enabled
    if (!isTracking) {
      return;
    }
    
    // Get initial location when tracking is enabled
    updateLocation();

    // Set up tracking
    let watchId: number | null = null;
    let intervalId: number | null = null;

    // For continuous updates (direction changes, etc.)
    watchId = navigator.geolocation.watchPosition(
      (position) => {
        const { coords, timestamp } = position;
        
        setLocation({
          latitude: coords.latitude,
          longitude: coords.longitude,
          heading: coords.heading,
          accuracy: coords.accuracy,
          timestamp
        });
        
        setError(null);
      },
      (error) => {
        setError(error.message);
      },
      {
        enableHighAccuracy: true,
        timeout: 5000,
        maximumAge: 0
      }
    );

    // For periodic updates on a timer
    intervalId = window.setInterval(() => {
      updateLocation();
    }, interval);

    // Cleanup
    return () => {
      if (watchId !== null) {
        navigator.geolocation.clearWatch(watchId);
      }
      if (intervalId !== null) {
        clearInterval(intervalId);
      }
    };
  }, [isTracking, interval, updateLocation]);

  return { location, error, updateLocation };
}
