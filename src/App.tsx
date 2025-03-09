import React, { useState, useEffect } from 'react';
import Map from './components/Map';
import Footer from './components/Footer';
import BookmarksModal from './components/BookmarksModal';
import SettingsModal from './components/SettingsModal';
import ProfileModal from './components/ProfileModal';
import { AppProvider, useAppContext } from './context/AppContext';
import 'leaflet/dist/leaflet.css';

// Fix Leaflet icon issues
import L from 'leaflet';
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

const AppContent: React.FC = () => {
  const { userProfile } = useAppContext();
  const [isBookmarksOpen, setIsBookmarksOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [focusLocation, setFocusLocation] = useState<[number, number] | undefined>(undefined);

  // Apply theme based on user preference
  useEffect(() => {
    document.documentElement.classList.toggle('dark', userProfile.theme === 'dark');
  }, [userProfile.theme]);

  const handleSelectBookmark = (lat: number, lng: number) => {
    setFocusLocation([lat, lng]);
  };

  return (
    <div className="h-screen w-screen overflow-hidden bg-gray-100 dark:bg-gray-900">
      {/* Map Component */}
      <Map focusLocation={focusLocation} />
      
      {/* Footer Navigation */}
      <Footer 
        onOpenBookmarks={() => setIsBookmarksOpen(true)}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenProfile={() => setIsProfileOpen(true)}
      />
      
      {/* Modals */}
      <BookmarksModal 
        isOpen={isBookmarksOpen} 
        onClose={() => setIsBookmarksOpen(false)}
        onSelectBookmark={handleSelectBookmark}
      />
      
      <SettingsModal 
        isOpen={isSettingsOpen} 
        onClose={() => setIsSettingsOpen(false)}
      />
      
      <ProfileModal 
        isOpen={isProfileOpen} 
        onClose={() => setIsProfileOpen(false)}
      />
    </div>
  );
};

const App: React.FC = () => {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
};

export default App;
