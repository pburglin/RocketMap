import { useState, useEffect, useCallback, useRef } from 'react';
import { UserLocation } from '../types';

interface GeolocationOptions {
  enableHighAccuracy: boolean;
  timeout: number;
  maximumAge: number;
}

export function useGeolocation(isTracking: boolean, interval: number = 15000) {
  const [location, setLocation] = useState<UserLocation | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [permissionState, setPermissionState] = useState<string>('prompt');
  const watchIdRef = useRef<number | null>(null);
  const intervalIdRef = useRef<number | null>(null);
  const isInitializedRef = useRef<boolean>(false);
  const isMountedRef = useRef<boolean>(true);

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

  // Check permission state if available
  const checkPermissionState = useCallback(async () => {
    if (navigator.permissions && navigator.permissions.query) {
      try {
        const result = await navigator.permissions.query({ name: 'geolocation' as PermissionName });
        setPermissionState(result.state);
        
        // Listen for permission changes
        result.addEventListener('change', () => {
          if (isMountedRef.current) {
            setPermissionState(result.state);
          }
        });
      } catch (err) {
        console.warn('Permission API not fully supported:', err);
      }
    }
  }, []);

  const updateLocation = useCallback(() => {
    // Don't try to update if we're not tracking or component is unmounted
    if (!isTracking || !isMountedRef.current) return;
    
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser');
      return;
    }

    const options: GeolocationOptions = {
      enableHighAccuracy: true,
      timeout: 15000, // Increased timeout for iOS
      maximumAge: 0
    };

    try {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          if (!isMountedRef.current) return;
          
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
          if (!isMountedRef.current) return;
          
          console.warn('Geolocation error:', error.message, error.code);
          
          // Handle iOS-specific errors
          if (error.code === 1) { // PERMISSION_DENIED
            setPermissionState('denied');
          }
          
          setError(error.message);
        },
        options
      );
    } catch (err) {
      if (!isMountedRef.current) return;
      console.error('Unexpected error accessing geolocation:', err);
      setError('Unexpected error accessing location services');
    }
  }, [isTracking]);

  // Detect iOS device
  const isIOS = useRef<boolean>(
    typeof navigator !== 'undefined' && 
    (/iPad|iPhone|iPod/.test(navigator.userAgent) || 
    (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1))
  ).current;

  // Setup and teardown location tracking
  useEffect(() => {
    // Check permission state on mount
    checkPermissionState();
    
    // Mark component as mounted
    isMountedRef.current = true;
    
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
    
    // Use a longer delay for iOS devices to avoid rendering issues
    const delayTime = isIOS ? 1500 : 500;
    
    // Delay the initial location request to avoid iOS rendering issues
    const initTimer = setTimeout(() => {
      if (!isMountedRef.current) return;
      
      try {
        // Get initial location when tracking is enabled
        updateLocation();
        
        const options: GeolocationOptions = {
          enableHighAccuracy: true,
          timeout: 15000, // Increased timeout for iOS
          maximumAge: 0
        };
        
        // For continuous updates (direction changes, etc.)
        watchIdRef.current = navigator.geolocation.watchPosition(
          (position) => {
            if (!isMountedRef.current) return;
            
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
            if (!isMountedRef.current) return;
            
            console.warn('Watch position error:', error.message, error.code);
            
            // Handle iOS-specific errors
            if (error.code === 1) { // PERMISSION_DENIED
              setPermissionState('denied');
              cleanupLocationServices(); // Stop tracking if permission denied
            }
            
            setError(error.message);
          },
          options
        );
        
        // For periodic updates on a timer (as a backup)
        intervalIdRef.current = window.setInterval(() => {
          if (!isMountedRef.current) return;
          
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
    }, delayTime); // Longer delay for iOS devices to avoid rendering issues
    
    // Cleanup function
    return () => {
      clearTimeout(initTimer);
      cleanupLocationServices();
      isMountedRef.current = false;
    };
  }, [isTracking, interval, updateLocation, cleanupLocationServices, checkPermissionState]);

  // Additional cleanup on component unmount
  useEffect(() => {
    return () => {
      cleanupLocationServices();
      isMountedRef.current = false;
    };
  }, [cleanupLocationServices]);

  return { location, error, permissionState, updateLocation };
}
