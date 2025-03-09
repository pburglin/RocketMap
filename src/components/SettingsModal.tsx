import React, { useState } from 'react';
import { X, Map, Layers, MapPin, Upload } from 'lucide-react';
import Modal from './Modal';
import { useAppContext } from '../context/AppContext';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
  const { mapSettings, updateMapSettings } = useAppContext();
  const [uploadStatus, setUploadStatus] = useState<string | null>(null);
  
  const handleMapTypeChange = (mapType: 'streets' | 'satellite' | 'topography') => {
    updateMapSettings({ mapType });
  };
  
  const handlePropertyBoundariesToggle = () => {
    updateMapSettings({ showPropertyBoundaries: !mapSettings.showPropertyBoundaries });
  };
  
  const handleBookmarksOverlayToggle = () => {
    updateMapSettings({ showBookmarksOverlay: !mapSettings.showBookmarksOverlay });
  };
  
  const handleParcelUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    // Only accept zip files
    if (!file.name.endsWith('.zip')) {
      setUploadStatus('Error: Please upload a ZIP file containing GIS data');
      return;
    }
    
    setUploadStatus('Uploading file...');
    
    try {
      // Create a FormData object to send the file
      const formData = new FormData();
      formData.append('file', file);
      
      // In a real app, you would upload this to your server
      // For this demo, we'll just simulate success after a delay
      setTimeout(() => {
        setUploadStatus('Upload complete! Processing will be done on the server.');
        
        // In a real implementation, you would process the file on the server
        // and then enable the property boundaries feature
        setTimeout(() => {
          updateMapSettings({ showPropertyBoundaries: true });
          setUploadStatus(null);
        }, 2000);
      }, 1500);
      
      // In a real app, you would do something like this:
      /*
      const response = await fetch('/api/upload-parcels', {
        method: 'POST',
        body: formData
      });
      
      if (!response.ok) {
        throw new Error('Upload failed');
      }
      
      const data = await response.json();
      setUploadStatus(`Upload complete! ${data.message}`);
      */
    } catch (error) {
      console.error('Error uploading file:', error);
      setUploadStatus('Error uploading file. Please try again.');
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Settings">
      <div className="p-4">
        
        <div className="space-y-6">
          {/* Map Type */}
          <div>
            <h3 className="text-lg font-semibold mb-2 flex items-center text-black dark:text-white">
              <Map size={18} className="mr-2" />
              Map Type
            </h3>
            <div className="grid grid-cols-3 gap-2">
              <button
                className={`p-2 rounded border ${mapSettings.mapType === 'streets' ? 'bg-blue-100 border-blue-500 text-black dark:bg-gray-800 dark:text-white' : 'bg-gray-50 border-gray-300 text-black dark:bg-gray-800 dark:text-white'}`}
                onClick={() => handleMapTypeChange('streets')}
              >
                Streets
              </button>
              <button
                className={`p-2 rounded border ${mapSettings.mapType === 'satellite' ? 'bg-blue-100 border-blue-500 text-black dark:bg-gray-800 dark:text-white' : 'bg-gray-50 border-gray-300 text-black dark:bg-gray-800 dark:text-white'}`}
                onClick={() => handleMapTypeChange('satellite')}
              >
                Satellite
              </button>
              <button
                className={`p-2 rounded border ${mapSettings.mapType === 'topography' ? 'bg-blue-100 border-blue-500 text-black dark:bg-gray-800 dark:text-white' : 'bg-gray-50 border-gray-300 text-black dark:bg-gray-800 dark:text-white'}`}
                onClick={() => handleMapTypeChange('topography')}
              >
                Topography
              </button>
            </div>
          </div>
          
          {/* Overlays */}
          <div className="text-black dark:text-white">
            <h3 className="text-lg font-semibold mb-2 flex items-center">
              <Layers size={18} className="mr-2" />
              Overlays
            </h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="flex items-center cursor-pointer">
                  <span>Show Property Boundaries</span>
                </label>
                <div className="relative inline-block w-10 mr-2 align-middle select-none">
                  <input 
                    type="checkbox" 
                    checked={mapSettings.showPropertyBoundaries}
                    onChange={handlePropertyBoundariesToggle}
                    className="toggle-checkbox absolute block w-6 h-6 rounded-full bg-white border-4 appearance-none cursor-pointer"
                  />
                  <label 
                    className={`toggle-label block overflow-hidden h-6 rounded-full cursor-pointer ${mapSettings.showPropertyBoundaries ? 'bg-blue-500' : 'bg-gray-300'}`}
                  ></label>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <label className="flex items-center cursor-pointer">
                  <span>Show Bookmarks on Map</span>
                </label>
                <div className="relative inline-block w-10 mr-2 align-middle select-none">
                  <input 
                    type="checkbox" 
                    checked={mapSettings.showBookmarksOverlay}
                    onChange={handleBookmarksOverlayToggle}
                    className="toggle-checkbox absolute block w-6 h-6 rounded-full bg-white border-4 appearance-none cursor-pointer"
                  />
                  <label 
                    className={`toggle-label block overflow-hidden h-6 rounded-full cursor-pointer ${mapSettings.showBookmarksOverlay ? 'bg-blue-500' : 'bg-gray-300'}`}
                  ></label>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </Modal>
  );
};

export default SettingsModal;
