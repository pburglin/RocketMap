import React, { useState } from 'react';
import { Map, Layers, Clock } from 'lucide-react';
import Modal from './Modal';
import { useAppContext } from '../context/AppContext';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
  const { mapSettings, updateMapSettings } = useAppContext();
  const [sliderValue, setSliderValue] = useState(mapSettings.gpsRefreshInterval / 1000);
  
  // Convert slider value (seconds) to display text
  const formatIntervalDisplay = (seconds: number) => {
    if (seconds < 60) {
      return `${seconds} seconds`;
    } else {
      const minutes = Math.floor(seconds / 60);
      return `${minutes} ${minutes === 1 ? 'minute' : 'minutes'}`;
    }
  };

  const handleMapTypeChange = (mapType: 'streets' | 'satellite' | 'topography') => {
    updateMapSettings({ mapType });
  };
  
  const handlePropertyBoundariesToggle = () => {
    updateMapSettings({ showPropertyBoundaries: !mapSettings.showPropertyBoundaries });
  };
  
  const handleBookmarksOverlayToggle = () => {
    updateMapSettings({ showBookmarksOverlay: !mapSettings.showBookmarksOverlay });
  };
  
  const handleGpsIntervalChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const seconds = parseInt(e.target.value, 10);
    setSliderValue(seconds);
    updateMapSettings({ gpsRefreshInterval: seconds * 1000 });
  };

  return (
    <React.Fragment>
      <Modal isOpen={isOpen} onClose={onClose} title="Settings">
        <div className="p-4">
          <div className="space-y-6">
            {/* GPS Refresh Interval */}
            <div className="text-black dark:text-white">
              <h3 className="text-lg font-semibold mb-2 flex items-center">
                <Clock size={18} className="mr-2" />
                GPS Refresh Interval
              </h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>10 seconds</span>
                  <span>{formatIntervalDisplay(sliderValue)}</span>
                  <span>10 minutes</span>
                </div>
                <input
                  type="range"
                  min="10"
                  max="600"
                  step="5"
                  value={sliderValue}
                  onChange={handleGpsIntervalChange}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
                />
              </div>
            </div>
            
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
              <div className="space-y-4">
                {/* Parcel County Selection */}
                <div className="flex flex-col">
                  <label className="mb-2">Select State / County</label>
                  <select
                    className="p-2 rounded border text-black bg-gray-100 dark:text-white dark:bg-gray-800"
                    value={mapSettings.parcelCounty || ''}
                    onChange={(e) => updateMapSettings({ parcelCounty: e.target.value as 'AZ-Maricopa' })}
                  >
                    <option value="">None selected</option>
                    <option value="AZ-4G-LTE">Arizona / 4G LTE Coverage (March 2025)</option>
                    <option value="AZ-Maricopa">Arizona / Maricopa County Properties</option>
                    <option value="AZ-Navajo">Arizona / Navajo County Properties</option>
                    {/* Future options will be added here */}
                  </select>
                </div>

                {/* Show Property Boundaries Toggle */}
                <div className="flex items-center justify-between">
                  <label className="flex items-center cursor-pointer">
                    <span>Show Overlay</span>
                  </label>
                  <div className="relative inline-block w-10 mr-2 align-middle select-none">
                    <input
                      type="checkbox"
                      checked={mapSettings.showPropertyBoundaries}
                      onChange={handlePropertyBoundariesToggle}
                      className="toggle-checkbox absolute block w-6 h-6 rounded-full bg-white border-4 appearance-none cursor-pointer"
                      disabled={!mapSettings.parcelCounty} // Disable if no county selected
                    />
                    <label
                      className={`toggle-label block overflow-hidden h-6 rounded-full cursor-pointer ${mapSettings.showPropertyBoundaries ? 'bg-blue-500' : 'bg-gray-300'} ${!mapSettings.parcelCounty ? 'opacity-50 cursor-default' : ''}`}
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
    </React.Fragment>
  );
};

export default SettingsModal;
