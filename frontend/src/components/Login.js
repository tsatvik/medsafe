import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { setAuthenticated } from '../redux/authSlice'; // Import your Redux action

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const navigate = useNavigate();
  const dispatch = useDispatch(); // Get the Redux dispatch function

  const validateForm = () => {
    if (!username || !password) {
      setErrorMessage('Both username and password are required.');
      return false;
    }
    return true;
  };

  const handleLogin = async () => {
    if (!validateForm()) {
      alert("Both username and password are required.");
      return;
    }
  
    try {
      const requestData = { username, password };
      await axios.post('https://localhost:3001/login', requestData, { withCredentials: true });
      dispatch(setAuthenticated(true)); // Use Redux action to set authentication
      navigate('/portal');
    } catch (error) {
      if (error.response && error.response.status === 401) {
        setErrorMessage("Wrong username or password"); // User-friendly message
      } else {
        alert("An unexpected error occurred. Please try again.");
      }
      console.error('Login failed:', error);
    }
  };
  

  return (
    <div>
      <input type="text" placeholder="Username" required onChange={(e) => setUsername(e.target.value)} />
      <input type={showPassword ? "text" : "password"} placeholder="Password" required onChange={(e) => setPassword(e.target.value)} />
      <button onClick={() => setShowPassword(!showPassword)}>{showPassword ? "Hide" : "Show"}</button>
      <button onClick={handleLogin}>Login</button>
      <p>If you don't have an account, <Link to="/signup">create one here</Link>.</p>
      {errorMessage && <p style={{ color: 'red' }}>{errorMessage}</p>}
    </div>
  );
};

export default Login;
