import React from 'react';

const FAQScreen: React.FC = () => {
  return (
    <div className="p-4">
      <h1 className="text-2xl font-semibold mb-4 text-black dark:text-white">Frequently Asked Questions</h1>
      
      <div className="mb-4">
        <h2 className="text-xl font-semibold mb-2 text-black dark:text-white">How do I use this app?</h2>
        <p className="text-gray-700 dark:text-gray-300">
          This app allows you to view property boundaries on a map. To get started, select a state and county in the settings menu. Then, property boundaries will be displayed on the map as you navigate.
        </p>
      </div>

      <div className="mb-4">
        <h2 className="text-xl font-semibold mb-2 text-black dark:text-white">How do I see property boundaries for a new county?</h2>
        <p className="text-gray-700 dark:text-gray-300">
          If you would like to see property boundaries for a county that is not currently supported, please submit a request via an issue ticket in our Git repository: <a href="https://github.com/pburglin/RocketMap/issues" className="text-blue-500 hover:underline">https://github.com/pburglin/RocketMap/issues</a>. Please include the county and state you are interested in.
        </p>
      </div>

      {/* Add more FAQ sections as needed */}

    </div>
  );
};

export default FAQScreen;