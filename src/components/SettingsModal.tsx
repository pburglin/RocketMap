import React from 'react';
import Modal from './Modal';
import { useAppContext } from '../context/AppContext';
import { Layers, Home } from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
  const { mapSettings, updateMapSettings } = useAppContext();
  
  // Check if the device supports PWA installation
  const [canInstall, setCanInstall] = React.useState(false);
  const [deferredPrompt, setDeferredPrompt] = React.useState<any>(null);
  
  React.useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      // Prevent the mini-infobar from appearing on mobile
      e.preventDefault();
      // Stash the event so it can be triggered later
      setDeferredPrompt(e);
      // Update UI to notify the user they can install the PWA
      setCanInstall(true);
    };
    
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    
    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);
  
  const handleInstallClick = () => {
    if (!deferredPrompt) return;
    
    // Show the install prompt
    deferredPrompt.prompt();
    
    // Wait for the user to respond to the prompt
    deferredPrompt.userChoice.then((choiceResult: { outcome: string }) => {
      if (choiceResult.outcome === 'accepted') {
        console.log('User accepted the install prompt');
      } else {
        console.log('User dismissed the install prompt');
      }
      // Clear the saved prompt since it can't be used again
      setDeferredPrompt(null);
      setCanInstall(false);
    });
  };
  
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Settings">
      <div className="space-y-6">
        {/* Map Type Settings */}
        <div>
          <h3 className="text-lg font-medium text-gray-800 dark:text-white flex items-center gap-2 mb-3">
            <Layers size={20} />
            Map Layers
          </h3>
          
          <div className="space-y-3">
            <div className="flex items-center">
              <input
                type="radio"
                id="streets"
                name="mapType"
                checked={mapSettings.mapType === 'streets'}
                onChange={() => updateMapSettings({ mapType: 'streets' })}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="streets" className="ml-2 block text-gray-700 dark:text-gray-300">
                Streets
              </label>
            </div>
            
            <div className="flex items-center">
              <input
                type="radio"
                id="satellite"
                name="mapType"
                checked={mapSettings.mapType === 'satellite'}
                onChange={() => updateMapSettings({ mapType: 'satellite' })}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="satellite" className="ml-2 block text-gray-700 dark:text-gray-300">
                Satellite
              </label>
            </div>
            
            <div className="flex items-center">
              <input
                type="radio"
                id="topography"
                name="mapType"
                checked={mapSettings.mapType === 'topography'}
                onChange={() => updateMapSettings({ mapType: 'topography' })}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="topography" className="ml-2 block text-gray-700 dark:text-gray-300">
                Topography
              </label>
            </div>
          </div>
        </div>
        
        {/* Property Boundaries Toggle */}
        <div className="flex items-center justify-between">
          <label htmlFor="property-boundaries" className="text-gray-700 dark:text-gray-300">
            Show Property Boundaries
          </label>
          <div className="relative inline-block w-10 mr-2 align-middle select-none">
            <input
              type="checkbox"
              id="property-boundaries"
              checked={mapSettings.showPropertyBoundaries}
              onChange={() => updateMapSettings({ showPropertyBoundaries: !mapSettings.showPropertyBoundaries })}
              className="toggle-checkbox absolute block w-6 h-6 rounded-full bg-white border-4 appearance-none cursor-pointer"
            />
            <label
              htmlFor="property-boundaries"
              className={`toggle-label block overflow-hidden h-6 rounded-full cursor-pointer ${
                mapSettings.showPropertyBoundaries ? 'bg-blue-600' : 'bg-gray-300 dark:bg-gray-600'
              }`}
            ></label>
          </div>
        </div>
        
        {/* PWA Installation */}
        {canInstall && (
          <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/30 rounded-lg">
            <div className="flex items-start gap-3">
              <Home size={24} className="text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-medium text-gray-800 dark:text-white">Add to Home Screen</h3>
                <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                  Install RocketMaps on your device for quick access and offline capabilities.
                </p>
                <button
                  onClick={handleInstallClick}
                  className="mt-3 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium py-2 px-4 rounded transition-colors"
                >
                  Install App
                </button>
              </div>
            </div>
          </div>
        )}
        
        {/* App Info */}
        <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            RocketMaps v0.1.0
          </p>
        </div>
      </div>
      
      <style jsx>{`
        .toggle-checkbox:checked {
          right: 0;
          border-color: #3b82f6;
        }
        .toggle-checkbox:checked + .toggle-label {
          background-color: #3b82f6;
        }
        .toggle-label {
          transition: background-color 0.2s ease;
        }
        .toggle-checkbox {
          right: 0;
          z-index: 1;
          transition: all 0.2s ease;
        }
      `}</style>
    </Modal>
  );
};

export default SettingsModal;
