import React, { useState } from 'react';
import { Plus, Trash2, MapPin, Crosshair } from 'lucide-react';
import Modal from './Modal';
import { useAppContext } from '../context/AppContext';

interface BookmarksModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectBookmark: (lat: number, lng: number) => void;
}

const BookmarksModal: React.FC<BookmarksModalProps> = ({ isOpen, onClose, onSelectBookmark }) => {
  const { bookmarks, addBookmark, deleteBookmark, mapCenter } = useAppContext();
  const [isAddingBookmark, setIsAddingBookmark] = useState(false);
  const [newBookmark, setNewBookmark] = useState({
    title: '',
    location: '',
    description: ''
  });

  const handleAddBookmark = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Parse location string to get coordinates
    let latitude = 0;
    let longitude = 0;
    
    try {
      // Try to parse as coordinates (40.7128, -74.0060)
      const coordsMatch = newBookmark.location.match(/\(?\s*(-?\d+\.?\d*)\s*,\s*(-?\d+\.?\d*)\s*\)?/);
      
      if (coordsMatch) {
        latitude = parseFloat(coordsMatch[1]);
        longitude = parseFloat(coordsMatch[2]);
        
        // Validate coordinates
        if (isNaN(latitude) || isNaN(longitude) || 
            latitude < -90 || latitude > 90 || 
            longitude < -180 || longitude > 180) {
          throw new Error('Invalid coordinates');
        }
      } else {
        // For simplicity, we'll just use a placeholder location if not coordinates
        // In a real app, you would use a geocoding service here
        throw new Error('Please enter valid coordinates');
      }
      
      addBookmark({
        title: newBookmark.title,
        location: { latitude, longitude },
        description: newBookmark.description
      });
      
      // Reset form
      setNewBookmark({
        title: '',
        location: '',
        description: ''
      });
      
      setIsAddingBookmark(false);
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Invalid location format');
    }
  };

  const handleBookmarkClick = (latitude: number, longitude: number) => {
    onSelectBookmark(latitude, longitude);
    onClose();
  };

  // Use current map center for location
  const useMapCenter = () => {
    if (mapCenter) {
      setNewBookmark({
        ...newBookmark,
        location: `${mapCenter[0].toFixed(6)}, ${mapCenter[1].toFixed(6)}`
      });
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Bookmarks">
      <div className="space-y-4">
        {/* Add Bookmark Button */}
        <button
          onClick={() => setIsAddingBookmark(!isAddingBookmark)}
          className="flex items-center gap-2 text-blue-600 dark:text-blue-400 font-medium"
        >
          <Plus size={20} />
          <span>{isAddingBookmark ? 'Cancel' : 'Add Bookmark'}</span>
        </button>
        
        {/* Add Bookmark Form */}
        {isAddingBookmark && (
          <form onSubmit={handleAddBookmark} className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg space-y-3">
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Title
              </label>
              <input
                type="text"
                id="title"
                value={newBookmark.title}
                onChange={(e) => setNewBookmark({ ...newBookmark, title: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:text-white"
                required
              />
            </div>
            
            <div>
              <label htmlFor="location" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Location
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  id="location"
                  value={newBookmark.location}
                  onChange={(e) => setNewBookmark({ ...newBookmark, location: e.target.value })}
                  className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:text-white"
                  placeholder="Coordinates (40.7128, -74.0060)"
                  required
                />
                <button
                  type="button"
                  onClick={useMapCenter}
                  className="bg-gray-100 dark:bg-gray-600 hover:bg-gray-200 dark:hover:bg-gray-500 p-2 rounded-md transition-colors"
                  title="Use map center"
                >
                  <Crosshair size={20} className="text-gray-700 dark:text-gray-300" />
                </button>
              </div>
            </div>
            
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Description (Optional)
              </label>
              <textarea
                id="description"
                value={newBookmark.description}
                onChange={(e) => setNewBookmark({ ...newBookmark, description: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:text-white"
                rows={3}
              />
            </div>
            
            <button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md transition-colors"
            >
              Save Bookmark
            </button>
          </form>
        )}
        
        {/* Bookmarks List */}
        <div className="space-y-3 mt-4">
          <h3 className="text-lg font-medium text-gray-800 dark:text-white">Saved Locations</h3>
          
          {bookmarks.length === 0 ? (
            <p className="text-gray-500 dark:text-gray-400 text-sm">No bookmarks saved yet.</p>
          ) : (
            <ul className="space-y-3">
              {bookmarks.map((bookmark) => (
                <li 
                  key={bookmark.id}
                  className="bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg shadow-sm overflow-hidden"
                >
                  <div className="p-3">
                    <div className="flex justify-between items-start">
                      <button
                        onClick={() => handleBookmarkClick(bookmark.location.latitude, bookmark.location.longitude)}
                        className="text-left"
                      >
                        <h4 className="text-lg font-medium text-gray-800 dark:text-white flex items-center gap-2">
                          <MapPin size={16} className="text-blue-600 dark:text-blue-400" />
                          {bookmark.title}
                        </h4>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                          {bookmark.location.latitude.toFixed(6)}, {bookmark.location.longitude.toFixed(6)}
                        </p>
                        {bookmark.description && (
                          <p className="text-sm text-gray-600 dark:text-gray-300 mt-2">{bookmark.description}</p>
                        )}
                      </button>
                      
                      <button
                        onClick={() => deleteBookmark(bookmark.id)}
                        className="text-gray-400 hover:text-red-500 dark:hover:text-red-400 transition-colors"
                        aria-label="Delete bookmark"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </Modal>
  );
};

export default BookmarksModal;
