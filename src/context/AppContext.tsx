import React, { createContext, useContext, useState, useEffect } from 'react';
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
  showPropertyBoundaries: false
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
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Load state from localStorage
  const [storedState, setStoredState] = useLocalStorage<AppState>('rocketmaps-state', defaultState);
  
  // Local state
  const [isTrackingLocation, setIsTrackingLocation] = useState<boolean>(storedState.isTrackingLocation);
  const [bookmarks, setBookmarks] = useState<Bookmark[]>(storedState.bookmarks);
  const [userProfile, setUserProfile] = useState<UserProfile>(storedState.userProfile);
  const [mapSettings, setMapSettings] = useState<MapSettings>(storedState.mapSettings);

  // Use geolocation hook
  const { location } = useGeolocation(isTrackingLocation);
  const [userLocation, setUserLocation] = useState<UserLocation | null>(storedState.userLocation);

  // Update userLocation when location changes
  useEffect(() => {
    if (location) {
      setUserLocation(location);
    }
  }, [location]);

  // Save state to localStorage when it changes
  useEffect(() => {
    setStoredState({
      userLocation,
      isTrackingLocation,
      bookmarks,
      userProfile,
      mapSettings
    });
  }, [userLocation, isTrackingLocation, bookmarks, userProfile, mapSettings, setStoredState]);

  // Toggle location tracking
  const toggleLocationTracking = () => {
    setIsTrackingLocation(prev => !prev);
  };

  // Add bookmark
  const addBookmark = (bookmark: Omit<Bookmark, 'id' | 'createdAt'>) => {
    const newBookmark: Bookmark = {
      ...bookmark,
      id: Date.now().toString(),
      createdAt: Date.now()
    };
    setBookmarks(prev => [...prev, newBookmark]);
  };

  // Delete bookmark
  const deleteBookmark = (id: string) => {
    setBookmarks(prev => prev.filter(bookmark => bookmark.id !== id));
  };

  // Update user profile
  const updateUserProfile = (profile: Partial<UserProfile>) => {
    setUserProfile(prev => ({ ...prev, ...profile }));
  };

  // Update map settings
  const updateMapSettings = (settings: Partial<MapSettings>) => {
    setMapSettings(prev => ({ ...prev, ...settings }));
  };

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
    updateMapSettings
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
