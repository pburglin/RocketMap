export interface UserLocation {
  latitude: number;
  longitude: number;
  heading?: number | null;
  timestamp: number;
  accuracy?: number;
}

export interface Bookmark {
  id: string;
  title: string;
  location: {
    latitude: number;
    longitude: number;
  };
  description?: string;
  createdAt: number;
}

export interface UserProfile {
  username: string;
  avatarUrl?: string;
  theme: 'light' | 'dark';
}

export interface MapSettings {
  mapType: 'streets' | 'satellite' | 'topography';
  showPropertyBoundaries: boolean;
}

export interface AppState {
  userLocation: UserLocation | null;
  isTrackingLocation: boolean;
  bookmarks: Bookmark[];
  userProfile: UserProfile;
  mapSettings: MapSettings;
}
