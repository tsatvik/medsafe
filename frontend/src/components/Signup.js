import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { setAuthenticated } from '../redux/authSlice';
import { Typography, CircularProgress, Grid, ThemeProvider, CssBaseline } from '@mui/material';
import { CustomContainer, CustomTextFieldLoginSignup, FancyButton, theme } from './theme.js';

const Signup = () => {
    const [formData, setFormData] = useState({
        email: '',
        password: '',
    });

    const [errorMessage, setErrorMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const validateForm = () => {
        for (const [key, value] of Object.entries(formData)) {
            if (!value) {
                setErrorMessage(`Please fill in the ${key}`);
                return false;
            }
        }
        const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        if (!emailPattern.test(formData.email)) {
            setErrorMessage("Invalid email format");
            return false;
        }
        return true;
    };

    const handleChange = (event) => {
        setFormData({ ...formData, [event.target.name]: event.target.value });
    };

    const handleSignup = async () => {
        if (!validateForm()) {
            return;
        }

        setIsLoading(true);
        try {
            await axios.post('https://localhost:3001/signup', formData, { withCredentials: true });
            dispatch(setAuthenticated(true));
            navigate('/portal');
        } catch (error) {
            const errorMsg = error.response?.data?.error || "An unexpected error occurred. Please try again.";
            setErrorMessage(errorMsg);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <ThemeProvider theme={theme}>
            <CssBaseline />
            <div style={{ paddingTop: '32px', position: 'relative' }}>
                <Link to="/login" style={{ textDecoration: 'none', color: '#fff', position: 'absolute', top: '30px', right: '30px', textTransform: 'uppercase', fontWeight: 'bold' }}>LOGIN</Link>
                <CustomContainer>
                    <Grid container justifyContent="center">
                        <Grid item xs={12} sm={8} md={6} lg={4}>
                            <Grid container direction="column" alignItems="center">
                                <Grid item sx={{ marginTop: 4 }}>
                                    <Typography variant="h4" gutterBottom align="center">Sign Up</Typography>
                                </Grid>

                                <Grid item sx={{ marginTop: 4, width: '60%', maxWidth: '400px' }}>
                                    <CustomTextFieldLoginSignup
                                        label="Email"
                                        variant="outlined"
                                        fullWidth
                                        name="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                    />
                                </Grid>

                                <Grid item sx={{ marginTop: 4, width: '60%', maxWidth: '400px' }}>
                                    <CustomTextFieldLoginSignup
                                        label="Password"
                                        variant="outlined"
                                        fullWidth
                                        type="password"
                                        name="password"
                                        value={formData.password}
                                        onChange={handleChange}
                                    />
                                </Grid>

                                <Grid item sx={{ marginTop: 3 }}>
                                    <FancyButton
                                        variant="contained"
                                        onClick={handleSignup}
                                        disabled={isLoading}
                                    >
                                        {isLoading ? <CircularProgress size={24} /> : 'Sign Up'}
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

export default Signup;
