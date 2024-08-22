import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { setAuthenticated } from '../redux/authSlice';
import {
  Typography, InputAdornment, IconButton, CircularProgress,
  Grid, ThemeProvider, CssBaseline
} from '@mui/material';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import { CustomContainer, CustomTextFieldLoginSignup, FancyButton, theme } from './theme.js';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const validateForm = () => {
    if (!email || !password) {
      setErrorMessage('Both email and password are required.');
      return false;
    }
    return true;
  };

  const handleLogin = async () => {
    if (!validateForm()) {
      alert("Both email and password are required.");
      return;
    }

    setIsLoading(true);
    try {
      const requestData = { email, password };
      await axios.post('https://localhost:3001/login', requestData, { withCredentials: true });
      dispatch(setAuthenticated(true));
      navigate('/portal');
    } catch (error) {
      if (error.response && error.response.status === 401) {
        setErrorMessage("Wrong email or password");
      } else {
        alert("An unexpected error occurred. Please try again.");
      }
      console.error('Login failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <div style={{ paddingTop: '32px', position: 'relative' }}>
        <Link to="/signup" style={{ 
            textDecoration: 'none', 
            color: '#fff', 
            position: 'absolute', 
            top: '30px', 
            right: '30px', 
            textTransform: 'uppercase', 
            fontWeight: 'bold' 
        }}>
          SIGN UP
        </Link>
        <CustomContainer>
          <Grid container justifyContent="center">
            <Grid item xs={12} sm={8} md={6} lg={4}>
              <Grid container direction="column" alignItems="center">
                <Grid item sx={{ marginTop: 4 }}>
                  <Typography variant="h4" gutterBottom>Login</Typography>
                </Grid>
                <Grid item sx={{ marginTop: 4, width: '60%', maxWidth: '400px' }}>
                  <CustomTextFieldLoginSignup
                    label="Email"
                    variant="outlined"
                    fullWidth
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    autoFocus
                  />
                </Grid>
                <Grid item sx={{ marginTop: 4, width: '60%', maxWidth: '400px' }}>
                  <CustomTextFieldLoginSignup
                    label="Password"
                    variant="outlined"
                    fullWidth
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton onClick={() => setShowPassword(!showPassword)}>
                            {showPassword ? <VisibilityOff /> : <Visibility />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>
                <Grid item sx={{ marginTop: 3 }}>
                  <FancyButton
                    variant="contained"
                    onClick={handleLogin}
                    disabled={isLoading}
                  >
                    {isLoading ? <CircularProgress size={24} /> : 'Login'}
                  </FancyButton>
                </Grid>
                {errorMessage && (
                  <Grid item sx={{ marginTop: 2, width: '100%', maxWidth: '400px' }}>
                    <Typography variant="body2" color="error">{errorMessage}</Typography>
                  </Grid>
                )}
              </Grid>
            </Grid>
          </Grid>
        </CustomContainer>
      </div>
    </ThemeProvider>
  );
};

export default Login;