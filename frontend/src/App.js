import React, { useEffect, useCallback, useState } from 'react';
import { BrowserRouter as Router, Route, Routes, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useDispatch, useSelector } from 'react-redux';
import { setAuthenticated } from './redux/authSlice';
import { getToken, onMessage } from 'firebase/messaging';
import { messaging } from './firebase';
import Login from './components/Login';
import Signup from './components/Signup';
import Portal from './components/Portal';
import ProfileManagement from './components/ProfileManagement';
import MedicalRecords from './components/MedicalRecords';

// Configure Axios instance
const axiosInstance = axios.create({
  baseURL: 'https://localhost:3001',
  withCredentials: true,
});

function AppInner() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const isAuthenticated = useSelector(state => state.auth.isAuthenticated);
  const [initializing, setInitializing] = useState(true);

  const handleTokenRefresh = useCallback(async () => {
    if (!isAuthenticated) return;
    try {
      await axiosInstance.post('/refreshToken');
    } catch (error) {
      console.error('Failed to refresh token:', error);
      if (error.response?.status === 401) {
        dispatch(setAuthenticated(false));
        navigate('/login');
      }
    }
  }, [isAuthenticated, dispatch, navigate]);

  axiosInstance.interceptors.response.use(
    response => response,
    async error => {
      if (error.response?.status === 401 && !error.config._retry) {
        error.config._retry = true;
        try {
          await handleTokenRefresh();
          return axiosInstance(error.config);
        } catch (refreshError) {
          return Promise.reject(refreshError);
        }
      }
      return Promise.reject(error);
    }
  );

  const initializeFirebaseMessaging = async () => {
    const swRegistration = await navigator.serviceWorker.ready;
    if (swRegistration.active && navigator.serviceWorker.controller) {
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        try {
          const token = await getToken(messaging);
          onMessage(messaging, (payload) => {
            console.log('Message received. ', payload);
          });
          const userIdRes = await axiosInstance.get('/session/get-user-id');
          if (userIdRes.data.userId) {
            await axiosInstance.post('/firebase/register', { userId: userIdRes.data.userId, token });
          }
        } catch (error) {
          console.error('Error subscribing to Firebase Messaging:', error);
        }
      }
    }
  };

  useEffect(() => {
    const initializeApp = async () => {
      try {
        const sessionRes = await axiosInstance.get('/session/check-session');
        if (sessionRes.status === 200 && sessionRes.data.isAuthenticated) {
          dispatch(setAuthenticated(true));
          await initializeFirebaseMessaging();
          // Only perform profile check if on the main portal, not during signup or explicit navigation
          if (['/portal', '/'].includes(window.location.pathname)) {
            const profileRes = await axiosInstance.get('/profile-check');
            if (!profileRes.data.hasProfile) {
              navigate('/portal/profile-management');
            } else {
              // Navigate to MedicalRecords or another default page
              navigate('/portal/medical-records'); // Update this path as needed
            }
          }
        } else {
          // Redirect to login if not authenticated and not on signup page
          if (!['/login', '/signup'].includes(window.location.pathname)) {
            dispatch(setAuthenticated(false));
            navigate('/login');
          }
        }
      } catch (error) {
        console.error('Error during initialization:', error);
        if (!['/login', '/signup'].includes(window.location.pathname)) {
          dispatch(setAuthenticated(false));
          navigate('/login');
        }
      } finally {
        setInitializing(false);
      }
    };
    initializeApp();
  }, [dispatch, navigate, isAuthenticated]);

  if (initializing) {
    return <div>Loading...</div>;
  }

  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/portal" element={isAuthenticated ? <Portal /> : <Login />}>
        <Route path="profile-management" element={<ProfileManagement />} />
        <Route path="medical-records" element={<MedicalRecords />} />
      </Route>
    </Routes>
  );
}

function App() {
  return (
    <Router>
      <AppInner />
    </Router>
  );
}

export default App;
