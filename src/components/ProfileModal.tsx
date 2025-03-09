import React, { useState, useEffect } from 'react';
import Modal from './Modal';
import { useAppContext } from '../context/AppContext';
import { User, Moon, Sun } from 'lucide-react';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ProfileModal: React.FC<ProfileModalProps> = ({ isOpen, onClose }) => {
  const { userProfile, updateUserProfile } = useAppContext();
  const [formData, setFormData] = useState({
    username: userProfile.username,
    avatarUrl: userProfile.avatarUrl || '',
    theme: userProfile.theme
  });
  
  // Update form data when userProfile changes
  useEffect(() => {
    setFormData({
      username: userProfile.username,
      avatarUrl: userProfile.avatarUrl || '',
      theme: userProfile.theme
    });
  }, [userProfile]);
  
  // Auto-save when form data changes
  useEffect(() => {
    // Skip the initial render
    const isInitialRender = 
      formData.username === userProfile.username && 
      formData.avatarUrl === (userProfile.avatarUrl || '') && 
      formData.theme === userProfile.theme;
    
    if (!isInitialRender) {
      updateUserProfile(formData);
    }
  }, [formData, updateUserProfile, userProfile]);
  
  const handleThemeChange = (theme: 'light' | 'dark') => {
    setFormData({ ...formData, theme });
    // Also update the document theme immediately for better UX
    document.documentElement.classList.toggle('dark', theme === 'dark');
  };
  
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Profile">
      <div className="space-y-4">
        {/* Avatar Preview */}
        <div className="flex justify-center">
          <div className="relative">
            <div className="w-24 h-24 rounded-full overflow-hidden bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
              {formData.avatarUrl ? (
                <img 
                  src={formData.avatarUrl} 
                  alt="User avatar" 
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    // If image fails to load, show fallback
                    (e.target as HTMLImageElement).src = 'https://via.placeholder.com/150?text=User';
                  }}
                />
              ) : (
                <User size={40} className="text-gray-400" />
              )}
            </div>
          </div>
        </div>
        
        {/* Username */}
        <div>
          <label htmlFor="username" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Username
          </label>
          <input
            type="text"
            id="username"
            value={formData.username}
            onChange={(e) => setFormData({ ...formData, username: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:text-white"
            required
          />
        </div>
        
        {/* Avatar URL */}
        <div>
          <label htmlFor="avatarUrl" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Avatar Image URL (Optional)
          </label>
          <input
            type="url"
            id="avatarUrl"
            value={formData.avatarUrl}
            onChange={(e) => setFormData({ ...formData, avatarUrl: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:text-white"
            placeholder="https://example.com/avatar.jpg"
          />
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            Enter a URL to an image for your profile avatar
          </p>
        </div>
        
        {/* Theme Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Theme
          </label>
          <div className="flex space-x-4">
            <button
              type="button"
              onClick={() => handleThemeChange('light')}
              className={`flex items-center justify-center p-3 rounded-lg border ${
                formData.theme === 'light'
                  ? 'bg-blue-50 border-blue-500 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                  : 'bg-white border-gray-300 text-gray-700 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-300'
              }`}
            >
              <Sun size={20} className="mr-2" />
              Light
            </button>
            <button
              type="button"
              onClick={() => handleThemeChange('dark')}
              className={`flex items-center justify-center p-3 rounded-lg border ${
                formData.theme === 'dark'
                  ? 'bg-blue-50 border-blue-500 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                  : 'bg-white border-gray-300 text-gray-700 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-300'
              }`}
            >
              <Moon size={20} className="mr-2" />
              Dark
            </button>
          </div>
        </div>
        
        {/* Auto-save notice */}
        <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
          <p className="text-sm text-gray-500 dark:text-gray-400 italic">
            Changes are saved automatically
          </p>
        </div>
      </div>
    </Modal>
  );
};

export default ProfileModal;
