import React from 'react';
import { MapPin, Bookmark, Settings, User, Info } from 'lucide-react';
import { useAppContext } from '../context/AppContext';

interface FooterProps {
  onOpenBookmarks: () => void;
  onOpenSettings: () => void;
  onOpenProfile: () => void;
  onOpenAbout: () => void;
}

const Footer: React.FC<FooterProps> = ({ onOpenBookmarks, onOpenSettings, onOpenProfile, onOpenAbout }) => {
  const { isTrackingLocation, toggleLocationTracking } = useAppContext();
  
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 shadow-lg z-10">
      <div className="max-w-screen-xl mx-auto px-4 py-2">
        <div className="flex justify-between items-center">
          {/* My Location Button */}
          <button 
            onClick={toggleLocationTracking}
            className={`flex flex-col items-center p-2 rounded-lg transition-colors ${
              isTrackingLocation 
                ? 'text-blue-700 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/30' 
                : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
            aria-label="My Location"
          >
            <MapPin size={24} />
            <span className="text-xs mt-1 hidden sm:block">My Location</span>
          </button>
          
          {/* Bookmarks Button */}
          <button 
            onClick={onOpenBookmarks}
            className="flex flex-col items-center p-2 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            aria-label="Bookmarks"
          >
            <Bookmark size={24} />
            <span className="text-xs mt-1 hidden sm:block">Bookmarks</span>
          </button>
          
          {/* Settings Button */}
          <button 
            onClick={onOpenSettings}
            className="flex flex-col items-center p-2 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            aria-label="Settings"
          >
            <Settings size={24} />
            <span className="text-xs mt-1 hidden sm:block">Settings</span>
          </button>
          
          {/* Profile Button */}
          <button 
            onClick={onOpenProfile}
            className="flex flex-col items-center p-2 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            aria-label="Profile"
          >
            <User size={24} />
            <span className="text-xs mt-1 hidden sm:block">Profile</span>
          </button>
          
          {/* About Button */}
          <button 
            onClick={onOpenAbout}
            className="flex flex-col items-center p-2 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            aria-label="About"
          >
            <Info size={24} />
            <span className="text-xs mt-1 hidden sm:block">About</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Footer;
