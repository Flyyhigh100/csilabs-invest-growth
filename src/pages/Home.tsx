
import React from 'react';
import { Link } from 'react-router-dom';

const Home: React.FC = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Welcome to Our Platform</h1>
      <p className="mb-4">Please log in or register to access our services.</p>
      <div className="flex gap-4">
        <Link to="/login" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
          Login
        </Link>
        <Link to="/register" className="bg-gray-200 text-gray-800 px-4 py-2 rounded hover:bg-gray-300">
          Register
        </Link>
      </div>
    </div>
  );
};

export default Home;
