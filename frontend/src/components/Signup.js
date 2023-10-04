import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { CountryDropdown } from 'react-country-region-selector';
import { useDispatch } from 'react-redux';
import { setAuthenticated } from '../redux/authSlice'; // Import your Redux action

const Signup = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    phoneNumber: '',
    password: '',
    firstName: '',
    lastName: '',
    dob: '',
    gender: '',
    bloodType: '',
    country: '',
  });
  const [errorMessage, setErrorMessage] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch(); // Get the Redux dispatch function

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

  const handleSignup = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      await axios.post('https://localhost:3001/signup', formData, { withCredentials: true });
      dispatch(setAuthenticated(true)); // Use Redux action to set authentication
      navigate('/portal');
    } catch (error) {
      console.error('Signup failed:', error);
      if (error.response && error.response.data && error.response.data.error) {
        setErrorMessage("Signup failed: " + error.response.data.error);
      } else {
        setErrorMessage("An unexpected error occurred. Please try again.");
      }
    }
  };

  return (
    <div>
      <input type="text" placeholder="Username" required onChange={(e) => setFormData({ ...formData, username: e.target.value })} />
      <input type="email" placeholder="Email" required onChange={(e) => setFormData({ ...formData, email: e.target.value })} />
      <input type="tel" placeholder="Phone Number" required onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })} />
      <input type={showPassword ? "text" : "password"} placeholder="Password" required onChange={(e) => setFormData({ ...formData, password: e.target.value })} />
      <button onClick={() => setShowPassword(!showPassword)}>{showPassword ? "Hide" : "Show"}</button>
      <input type="text" placeholder="First Name" required onChange={(e) => setFormData({ ...formData, firstName: e.target.value })} />
      <input type="text" placeholder="Last Name" required onChange={(e) => setFormData({ ...formData, lastName: e.target.value })} />
      <input type="date" placeholder="Date of Birth" required onChange={(e) => setFormData({ ...formData, dob: e.target.value })} />
      <select required onChange={(e) => setFormData({ ...formData, gender: e.target.value })}>
        <option value="">Select Gender</option>
        <option value="M">Male</option>
        <option value="F">Female</option>
      </select>
      <select required onChange={(e) => setFormData({ ...formData, bloodType: e.target.value })}>
        <option value="">Select Blood Type</option>
        <option value="A+">A+</option>
        <option value="A-">A-</option>
        <option value="B+">B+</option>
        <option value="B-">B-</option>
        <option value="AB+">AB+</option>
        <option value="AB-">AB-</option>
        <option value="O+">O+</option>
        <option value="O-">O-</option>
      </select>
      <CountryDropdown
        value={formData.country}
        required
        onChange={(val) => setFormData({ ...formData, country: val })}
      />
      <button onClick={handleSignup}>Sign Up</button>
      <p>If you have an account, <Link to="/login">login here</Link>.</p>
      {errorMessage && <p>{errorMessage}</p>}
    </div>
  );
};

export default Signup;
