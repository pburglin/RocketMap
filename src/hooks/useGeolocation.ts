import { useState, useEffect, useCallback, useRef } from 'react';
import { UserLocation } from '../types';

interface GeolocationOptions {
  enableHighAccuracy: boolean;
  timeout: number;
  maximumAge: number;
}

export function useGeolocation(isTracking: boolean, interval: number = 10000) {
  const [location, setLocation] = useState<UserLocation | null>(null);
  const [error, setError] = useState<string | null>(null);
  const watchIdRef = useRef<number | null>(null);
  const intervalIdRef = useRef<number | null>(null);
  const isInitializedRef = useRef<boolean>(false);

  // Safe cleanup function that can be called anytime
  const cleanupLocationServices = useCallback(() => {
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
    
    if (intervalIdRef.current !== null) {
      clearInterval(intervalIdRef.current);
      intervalIdRef.current = null;
    }
  }, []);

  const updateLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser');
      return;
    }

    const options: GeolocationOptions = {
      enableHighAccuracy: true,
      timeout: 10000, // Increased timeout for iOS
      maximumAge: 0
    };

    try {
      navigator.geolocation.getCurrentPosition(
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
          console.warn('Geolocation error:', error.message);
          setError(error.message);
        },
        options
      );
    } catch (err) {
      console.error('Unexpected error accessing geolocation:', err);
      setError('Unexpected error accessing location services');
    }
  }, []);

  // Setup and teardown location tracking
  useEffect(() => {
    // Clean up any existing tracking first
    cleanupLocationServices();
    
    // Only proceed if tracking is enabled
    if (!isTracking) {
      return;
    }
    
    // Safety check for geolocation API
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser');
      return;
    }
    
    try {
      // Get initial location when tracking is enabled
      updateLocation();
      
      const options: GeolocationOptions = {
        enableHighAccuracy: true,
        timeout: 10000, // Increased timeout for iOS
        maximumAge: 0
      };
      
      // For continuous updates (direction changes, etc.)
      watchIdRef.current = navigator.geolocation.watchPosition(
        (position) => {
          try {
            const { coords, timestamp } = position;
            
            setLocation({
              latitude: coords.latitude,
              longitude: coords.longitude,
              heading: coords.heading,
              accuracy: coords.accuracy,
              timestamp
            });
            
            setError(null);
            isInitializedRef.current = true;
          } catch (err) {
            console.error('Error processing location update:', err);
          }
        },
        (error) => {
          console.warn('Watch position error:', error.message);
          setError(error.message);
        },
        options
      );
      
      // For periodic updates on a timer (as a backup)
      intervalIdRef.current = window.setInterval(() => {
        try {
          updateLocation();
        } catch (err) {
          console.error('Error in interval update:', err);
        }
      }, interval);
      
      // Mark as initialized
      isInitializedRef.current = true;
    } catch (err) {
      console.error('Failed to initialize location tracking:', err);
      setError('Failed to initialize location tracking');
    }
    
    // Cleanup function
    return () => {
      cleanupLocationServices();
    };
  }, [isTracking, interval, updateLocation, cleanupLocationServices]);

  // Additional cleanup on component unmount
  useEffect(() => {
    return () => {
      cleanupLocationServices();
    };
  }, [cleanupLocationServices]);

  return { location, error, updateLocation };
}
