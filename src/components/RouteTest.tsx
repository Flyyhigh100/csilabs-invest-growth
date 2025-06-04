
import React from 'react';

const RouteTest = () => {
  console.log('🧪 RouteTest component loaded - routing is working!');
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-green-600 mb-4">
          ✅ Route Test Successful
        </h1>
        <p className="text-gray-600 mb-4">
          If you see this page, routing is working correctly.
        </p>
        <p className="text-sm text-gray-500">
          Current URL: {window.location.href}
        </p>
        <button 
          onClick={() => window.location.href = '/login'}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Go to Login
        </button>
      </div>
    </div>
  );
};

export default RouteTest;
