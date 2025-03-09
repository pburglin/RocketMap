import React from 'react';

const TOSScreen: React.FC = () => {
  return (
    <div className="p-4">
      <h1 className="text-2xl font-semibold mb-4 text-black dark:text-white">Terms of Service & Disclaimer</h1>
      
      <div className="mb-4">
        <h2 className="text-xl font-semibold mb-2 text-black dark:text-white">Terms of Service</h2>
        <p className="text-gray-700 dark:text-gray-300">
          Please use this app for lawful and appropriate purposes only. 
        </p>
      </div>

      <div className="mb-4">
        <h2 className="text-xl font-semibold mb-2 text-black dark:text-white">Disclaimer</h2>
        <p className="text-gray-700 dark:text-gray-300">
          The property boundary data displayed in this app is imported from county assessor websites. While we strive to provide accurate information, we cannot guarantee the accuracy of the data. Use this information at your own risk. 
        </p>
      </div>

    </div>
  );
};

export default TOSScreen;