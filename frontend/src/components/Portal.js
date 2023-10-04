import React from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const Portal = () => {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      // Call the logout API
      await axios.post('https://localhost:3001/logout', {}, {
        withCredentials: true, // Needed to include cookies
      });
  
      // Navigate to login page after successful logout
      navigate('/login');
    } catch (err) {
      console.error('Logout failed:', err);
    }
  };

  return (
    <div>
      <h1>Welcome to the Portal!</h1>
      <button onClick={handleLogout}>Logout</button>
      {/* Your portal content here */}
    </div>
  );
};

export default Portal;
