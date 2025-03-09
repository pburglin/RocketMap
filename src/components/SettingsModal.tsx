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
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="p-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Map Settings</h2>
          <button 
            onClick={onClose}
            className="p-1 rounded-full hover:bg-gray-200 transition-colors"
          >
            <X size={20} />
          </button>
        </div>
        
        <div className="space-y-6">
          {/* Map Type */}
          <div>
            <h3 className="text-lg font-semibold mb-2 flex items-center">
              <Map size={18} className="mr-2" />
              Map Type
            </h3>
            <div className="grid grid-cols-3 gap-2">
              <button
                className={`p-2 rounded border ${mapSettings.mapType === 'streets' ? 'bg-blue-100 border-blue-500' : 'bg-gray-50 border-gray-300'}`}
                onClick={() => handleMapTypeChange('streets')}
              >
                Streets
              </button>
              <button
                className={`p-2 rounded border ${mapSettings.mapType === 'satellite' ? 'bg-blue-100 border-blue-500' : 'bg-gray-50 border-gray-300'}`}
                onClick={() => handleMapTypeChange('satellite')}
              >
                Satellite
              </button>
              <button
                className={`p-2 rounded border ${mapSettings.mapType === 'topography' ? 'bg-blue-100 border-blue-500' : 'bg-gray-50 border-gray-300'}`}
                onClick={() => handleMapTypeChange('topography')}
              >
                Topography
              </button>
            </div>
          </div>
          
          {/* Overlays */}
          <div>
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
          
          {/* Property Data Upload */}
          <div>
            <h3 className="text-lg font-semibold mb-2 flex items-center">
              <Upload size={18} className="mr-2" />
              Property Data
            </h3>
            <p className="text-sm text-gray-600 mb-2">
              Upload property boundary data (ZIP file containing shapefiles)
            </p>
            <div className="flex flex-col space-y-2">
              <label className="flex items-center justify-center p-2 bg-blue-50 border border-blue-300 rounded cursor-pointer hover:bg-blue-100 transition-colors">
                <input
                  type="file"
                  accept=".zip"
                  className="hidden"
                  onChange={handleParcelUpload}
                />
                <Upload size={16} className="mr-2" />
                <span>Select ZIP File</span>
              </label>
              
              {uploadStatus && (
                <div className="text-sm p-2 bg-gray-50 border rounded">
                  {uploadStatus}
                </div>
              )}
              
              <p className="text-xs text-gray-500 italic">
                Note: For large files, processing may take several minutes.
              </p>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default SettingsModal;
