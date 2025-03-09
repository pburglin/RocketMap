import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { AppState, Bookmark, UserLocation, UserProfile, MapSettings } from '../types';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { useGeolocation } from '../hooks/useGeolocation';

const defaultUserProfile: UserProfile = {
  username: 'User',
  avatarUrl: '',
  theme: 'light'
};

const defaultMapSettings: MapSettings = {
  mapType: 'streets',
  showPropertyBoundaries: false,
  showBookmarksOverlay: true, // Default to showing bookmarks
  parcelCounty: null // Default to no county selected
};

const defaultState: AppState = {
  userLocation: null,
  isTrackingLocation: false,
  bookmarks: [],
  userProfile: defaultUserProfile,
  mapSettings: defaultMapSettings
};

interface AppContextType extends AppState {
  toggleLocationTracking: () => void;
  addBookmark: (bookmark: Omit<Bookmark, 'id' | 'createdAt'>) => void;
  deleteBookmark: (id: string) => void;
  updateUserProfile: (profile: Partial<UserProfile>) => void;
  updateMapSettings: (settings: Partial<MapSettings>) => void;
  mapCenter: [number, number];
  setMapCenter: (center: [number, number]) => void;
  locationPermissionState: string;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Load state from localStorage
  const [storedState, setStoredState] = useLocalStorage<AppState>('rocketmaps-state', defaultState);
  
  // Local state
  const [isTrackingLocation, setIsTrackingLocation] = useState<boolean>(storedState.isTrackingLocation);
  const [bookmarks, setBookmarks] = useState<Bookmark[]>(storedState.bookmarks);
  const [userProfile, setUserProfile] = useState<UserProfile>(storedState.userProfile);
  const [mapSettings, setMapSettings] = useState<MapSettings>({
    ...defaultMapSettings,
    ...storedState.mapSettings
  });
  const [mapCenter, setMapCenter] = useState<[number, number]>([40.7128, -74.0060]); // Default to NYC
  const [userLocation, setUserLocation] = useState<UserLocation | null>(storedState.userLocation);
  const [locationPermissionState, setLocationPermissionState] = useState<string>('prompt');

  // Use geolocation hook - only active when tracking is enabled
  const { location, error, permissionState } = useGeolocation(isTrackingLocation);

  // Update permission state
  useEffect(() => {
    setLocationPermissionState(permissionState);
  }, [permissionState]);

  // Handle location errors
  useEffect(() => {
    if (error) {
      console.warn('Geolocation error in context:', error);
      // If there's a persistent error, disable tracking to prevent further issues
      if (error.includes('denied') || error.includes('unavailable')) {
        setIsTrackingLocation(false);
      }
    }
  }, [error]);

  // Update userLocation when location changes
  useEffect(() => {
    if (location && isTrackingLocation) {
      try {
        setUserLocation(location);
      } catch (err) {
        console.error('Error updating user location:', err);
      }
    }
  }, [location, isTrackingLocation]);

  // Save state to localStorage when it changes
  useEffect(() => {
    try {
      setStoredState({
        userLocation,
        isTrackingLocation,
        bookmarks,
        userProfile,
        mapSettings
      });
    } catch (err) {
      console.error('Error saving state to localStorage:', err);
    }
  }, [userLocation, isTrackingLocation, bookmarks, userProfile, mapSettings]);

  // Toggle location tracking with error handling
  const toggleLocationTracking = useCallback(() => {
    setIsTrackingLocation(prev => !prev);
  }, []);

  // Add bookmark
  const addBookmark = useCallback((bookmark: Omit<Bookmark, 'id' | 'createdAt'>) => {
    const newBookmark: Bookmark = {
      ...bookmark,
      id: Date.now().toString(),
      createdAt: Date.now()
    };
    setBookmarks(prev => [...prev, newBookmark]);
  }, []);

  // Delete bookmark
  const deleteBookmark = useCallback((id: string) => {
    setBookmarks(prev => prev.filter(bookmark => bookmark.id !== id));
  }, []);

  // Update user profile
  const updateUserProfile = useCallback((profile: Partial<UserProfile>) => {
    setUserProfile(prev => ({ ...prev, ...profile }));
  }, []);

  // Update map settings
  const updateMapSettings = useCallback((settings: Partial<MapSettings>) => {
    setMapSettings(prev => ({ ...prev, ...settings }));
  }, []);

  const value: AppContextType = {
    userLocation,
    isTrackingLocation,
    bookmarks,
    userProfile,
    mapSettings,
    toggleLocationTracking,
    addBookmark,
    deleteBookmark,
    updateUserProfile,
    updateMapSettings,
    mapCenter,
    setMapCenter,
    locationPermissionState
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};
