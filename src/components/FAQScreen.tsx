import React from 'react';

const FAQScreen: React.FC = () => {
  return (
    <div className="p-4">
      <h1 className="text-2xl font-semibold mb-4 text-black dark:text-white">Frequently Asked Questions</h1>
      
      <div className="mb-4">
        <h2 className="text-xl font-semibold mb-2 text-black dark:text-white">How do I use this app?</h2>
        <p className="text-gray-700 dark:text-gray-300">
          This app allows you to view your position on a map, with property boundaries where available.
          To get started, select a state and county in the settings menu. If the data is available for your location, select "Show Property Boundaries" to enable this overlay on the map.
        </p>
      </div>

      <div className="mb-4">
        <h2 className="text-xl font-semibold mb-2 text-black dark:text-white">How do I see property boundaries for a new county?</h2>
        <p className="text-gray-700 dark:text-gray-300">
          If you would like to see property boundaries for a county that is not currently supported, please submit a request via an issue ticket in our Git repository: <a href="https://github.com/pburglin/RocketMap/issues" target="_blank" className="text-blue-500 hover:underline">https://github.com/pburglin/RocketMap/issues</a>.
          <br/><br/>
          Please include the county and state you are interested in and we will confirm if the data is openly available to be included in a future version of this app.
        </p>
      </div>

      {/* Add more FAQ sections as needed */}

    </div>
  );
};

export default FAQScreen;