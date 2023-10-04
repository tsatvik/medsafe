import React, { useEffect, useCallback } from 'react';
import { BrowserRouter as Router, Route, Routes, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Login from './components/Login';
import Signup from './components/Signup';
import Portal from './components/Portal';
import { useDispatch, useSelector } from 'react-redux';
import { setAuthenticated } from './redux/authSlice';

function App() {
  return (
    <Router>
      <AppInner />
    </Router>
  );
}

function AppInner() {
  const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const renewToken = useCallback(async () => {
    if (!isAuthenticated) return;
    try {
      const response = await axios.post('/renew-token', {}, { withCredentials: true });
      if (response.status === 200) {
        console.log("New token received");
      }
    } catch (error) {
      console.log("Failed to renew token:", error);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    const checkSession = async () => {
      try {
        const response = await axios.get('/check-session', { withCredentials: true });
        if (response.status === 200 && response.data.isAuthenticated) {
          dispatch(setAuthenticated(true));
          navigate('/portal');
          renewToken();
        } else {
          dispatch(setAuthenticated(false));
          navigate('/login');
        }
      } catch (error) {
        console.error("Failed to check session:", error);
        dispatch(setAuthenticated(false));
      }
    };

    checkSession();
  }, [navigate, renewToken, dispatch]);

  useEffect(() => {
    renewToken();  // Renew token immediately upon page load
    const intervalId = setInterval(renewToken, 55 * 60 * 1000);  // Then renew every 55 minutes

    return () => {
      clearInterval(intervalId);
    };
  }, [renewToken]);  

  return (
    <Routes>
      <Route path="/" element={isAuthenticated ? <Portal /> : <Login />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/portal" element={<Portal />} />
    </Routes>
  );
}

export default App;
