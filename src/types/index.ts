export interface UserLocation {
  latitude: number;
  longitude: number;
  accuracy?: number;
  heading?: number | null;
  speed?: number | null;
  timestamp?: number;
}

export interface Bookmark {
  id: string;
  title: string;
  location: {
    latitude: number;
    longitude: number;
  };
  description: string;
  createdAt: number;
}

export interface UserProfile {
  username: string;
  avatarUrl: string;
  theme: 'light' | 'dark';
}

export interface MapSettings {
  mapType: 'streets' | 'satellite' | 'topography';
  showPropertyBoundaries: boolean;
  showBookmarksOverlay: boolean;
  parcelCounty: ParcelCounty | null; // Add parcelCounty to map settings
  gpsRefreshInterval: number; // GPS refresh interval in milliseconds
}

export type ParcelCounty = 'AZ-Maricopa' | null;

export interface AppState {
  userLocation: UserLocation | null;
  isTrackingLocation: boolean;
  bookmarks: Bookmark[];
  userProfile: UserProfile;
  mapSettings: MapSettings;
}
