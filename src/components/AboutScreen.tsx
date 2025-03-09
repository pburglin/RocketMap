import React, { useState } from 'react';
import { Info, HelpCircle, FileText, Github } from 'lucide-react';
import FAQModal from './FAQModal';
import TOSModal from './TOSModal';

const AboutScreen: React.FC = () => {
  const [isFAQOpen, setIsFAQOpen] = useState(false);
  const [isTOSOpen, setIsTOSOpen] = useState(false);
  return (
    <React.Fragment>
      <div className="space-y-6 p-4">
      {/* App Description */}
      <div>
        <h3 className="text-lg font-semibold mb-2 flex items-center text-black dark:text-white">
          <Info size={18} className="mr-2" />
          About RocketMap
        </h3>
        <p className="text-gray-700 dark:text-gray-300 mb-4">
          RocketMap is an application that overlays maps with county property boundaries and the user's position. 
          Users can use this app when walking around properties to confirm property boundaries in real-time.
        </p>
        </div>

      {/* Author Information */}
      <div>
        <h3 className="text-lg font-semibold mb-2 text-black dark:text-white">
          Author
        </h3>
        <p className="text-gray-700 dark:text-gray-300">
          Pedro Burglin
        </p>
      </div>

      {/* Repository Information */}
      <div>
        <h3 className="text-lg font-semibold mb-2 flex items-center text-black dark:text-white">
          <Github size={18} className="mr-2" />
          Repository
        </h3>
        <a 
          href="https://github.com/pburglin/RocketMap" 
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-500 hover:underline flex items-center"
        >
          https://github.com/pburglin/RocketMap
        </a>
      </div>

      {/* Help & Legal Section (moved from Settings) */}
      <div className="pt-6 mt-6 border-t border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold mb-2 flex items-center text-black dark:text-white">
          <HelpCircle size={18} className="mr-2" />
          Help &amp; Legal
        </h3>
        <div className="space-y-2">
          <button onClick={() => setIsFAQOpen(true)} className="block text-blue-500 hover:underline flex items-center">
            <FileText size={16} className="mr-2" />
            FAQ - How to Use This App
          </button>
          <button onClick={() => setIsTOSOpen(true)} className="block text-blue-500 hover:underline flex items-center">
            <FileText size={16} className="mr-2" />
            Terms of Service &amp; Disclaimer
          </button>
        </div>
      </div>

      {/* Other apps from this author */}
      <div className="pt-6 mt-6 border-t border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold mb-2 flex items-center text-black dark:text-white">
          <HelpCircle size={18} className="mr-2" />
          Other apps from this author
        </h3>
        <div className="space-y-2 block">
          * <a href="https://eventfy.com" target="_blank" className="text-blue-500 hover:underline">
            https://Eventfy.com
          </a>
          &nbsp;
          Use AI to create interactive stories with graphics and multi-player.
        </div>
        <div className="space-y-2 block">
          * <a href="https://rocketmoto.us" target="_blank" className="text-blue-500 hover:underline">
            https://RocketMoto.us
          </a>
          &nbsp;
          Discover new routes to explore with your motorcycle.
        </div>
        <div className="space-y-2 block">
          * <a href="https://sitecheck.us" target="_blank" className="text-blue-500 hover:underline">
            https://SiteCheck.us
          </a>
          &nbsp;
          Track website availability status, check SSL certificates and more.
        </div>
        
      </div>
    </div>
      <FAQModal isOpen={isFAQOpen} onClose={() => setIsFAQOpen(false)} />
      <TOSModal isOpen={isTOSOpen} onClose={() => setIsTOSOpen(false)} />
    </React.Fragment>
  );
};

export default AboutScreen;
