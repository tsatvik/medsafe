import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import {
  Typography, CircularProgress, MenuItem, Grid, ThemeProvider, CssBaseline,
  Button, Paper, Box, IconButton, Snackbar, Alert, Dialog, DialogActions, DialogContent,
  DialogContentText, DialogTitle
} from '@mui/material';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import SaveIcon from '@mui/icons-material/Save';
import CancelIcon from '@mui/icons-material/Cancel';
import { CustomContainer, FancyButton, theme, CustomTextFieldProfileManagement } from './theme.js';

const ProfileManagement = () => {
  const [profiles, setProfiles] = useState([]);
  const [editState, setEditState] = useState({});
  const [isFetching, setIsFetching] = useState(true);
  const [newProfile, setNewProfile] = useState({
    creating: false,
    data: { firstName: '', lastName: '', dob: '', gender: '', bloodType: '' }
  });
  const [dobFocused, setDobFocused] = useState(false);
  const handleDobFocus = () => setDobFocused(true);
  const handleDobBlur = () => setDobFocused(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [profileToDelete, setProfileToDelete] = useState(null);
  const navigate = useNavigate();

  // Define fetchProfiles function
  const fetchProfiles = async () => {
    try {
      const response = await axios.get('https://localhost:3001/profile-management', { withCredentials: true });
      setProfiles(response.data.profiles);
    } catch (error) {
      console.error('Error fetching profiles:', error);
      setError('Failed to fetch profiles.');
    } finally {
      setIsFetching(false);
    }
  };

  useEffect(() => {
    fetchProfiles();
  }, []);  

  const handleNewProfileChange = (e) => {
    const { name, value } = e.target;
    setNewProfile({ ...newProfile, data: { ...newProfile.data, [name]: value } });
  };

  const handleCloseSnackbar = () => {
    setError('');
  };

  const validateProfile = (profileData) => {
    if (!profileData.firstName || !profileData.lastName || !profileData.dob || !profileData.gender || !profileData.bloodType) {
      setError('All fields are required.');
      return false;
    }
    const nameRegex = /^[A-Za-z ]+$/;
    if (!nameRegex.test(profileData.firstName) || profileData.firstName.length > 50) {
      setError('Invalid first name.');
      return false;
    }
    if (!nameRegex.test(profileData.lastName) || profileData.lastName.length > 50) {
      setError('Invalid last name.');
      return false;
    }
    const dob = new Date(profileData.dob);
    const today = new Date();
    const age = today.getFullYear() - dob.getFullYear();
    if (isNaN(dob.getTime()) || age < 0 || age > 120) {
      setError('Invalid date of birth.');
      return false;
    }
    const validGenders = ['M', 'F', 'Other'];
    if (!validGenders.includes(profileData.gender)) {
      setError('Invalid gender.');
      return false;
    }
    const validBloodTypes = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
    if (!validBloodTypes.includes(profileData.bloodType)) {
      setError('Invalid blood type.');
      return false;
    }
    return true;
  };

  const handleProfileChange = (e, profileId) => {
    const { name, value } = e.target;
    setProfiles(profiles.map(p => p.profile_id === profileId ? { ...p, [name]: value } : p));
  };

  const toggleEditMode = (profileId) => {
    setEditState({ ...editState, [profileId]: !editState[profileId] });
  };

  const handleSaveProfile = async (profileId) => {
    setIsLoading(true);
    const profileData = profiles.find(p => p.profile_id === profileId);
    if (!validateProfile(profileData)) {
      setIsLoading(false);
      return;
    }
    try {
      await axios.put(`https://localhost:3001/profile-management/${profileId}`, profileData, { withCredentials: true });
      setProfiles(profiles.map(p => p.profile_id === profileId ? profileData : p));
      toggleEditMode(profileId);
    } catch (error) {
      console.error('Error updating profile:', error);
      setError('Failed to update profile.');
    } finally {
      setIsLoading(false);
    }
  };

// Inside handleCreateProfile function
const handleCreateProfile = async () => {
  setIsLoading(true);
  if (!validateProfile(newProfile.data)) {
    setError('Validation failed.');
    setIsLoading(false);
    return;
  }

  try {
    const response = await axios.post('https://localhost:3001/profile-management', newProfile.data, { withCredentials: true });
    if (response.data.newProfile) {
      // Directly update the state with the new profile
      setProfiles(currentProfiles => [...currentProfiles, response.data.newProfile]);
      setNewProfile({ creating: false, data: { firstName: '', lastName: '', dob: '', gender: '', bloodType: '' } });
    } else {
      throw new Error("Unexpected response from server");
    }
  } 
  catch (error) {
    console.error('Error creating new profile:', error);
    setError(`Failed to create profile: ${error.response ? error.response.data.message : error.message}`);
  } 
  finally {
    setIsLoading(false);
  }
};

  const handleDeleteClick = (profileId) => {
    setProfileToDelete(profileId);
    setOpenDialog(true);
  };

  const handleConfirmDelete = async () => {
    if (profileToDelete !== null) {
      setIsLoading(true);
      try {
        await axios.delete(`https://localhost:3001/profile-management/${profileToDelete}`, { withCredentials: true });
        setProfiles(profiles.filter(p => p.profile_id !== profileToDelete));
      } catch (error) {
        console.error('Error deleting profile:', error);
        setError('Failed to delete profile.');
      } finally {
        setIsLoading(false);
      }
      setProfileToDelete(null);
      setOpenDialog(false);
    }
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setProfileToDelete(null);
  };

  const renderProfileEditForm = (profile) => {
    return (
      <>
        <CustomTextFieldProfileManagement
          label="First Name"
          variant="outlined"
          fullWidth
          margin="normal"
          name="firstName"
          value={profile.firstName}
          onChange={(e) => handleProfileChange(e, profile.profile_id)}
        />
        <CustomTextFieldProfileManagement
          label="Last Name"
          variant="outlined"
          fullWidth
          margin="normal"
          name="lastName"
          value={profile.lastName}
          onChange={(e) => handleProfileChange(e, profile.profile_id)}
        />
        <CustomTextFieldProfileManagement
          label="Date of Birth"
          type={dobFocused ? "date" : "text"}
          variant="outlined"
          fullWidth
          margin="normal"
          name="dob"
          value={profile.dob}
          onChange={(e) => handleProfileChange(e, profile.profile_id)}
          onFocus={handleDobFocus}
          onBlur={handleDobBlur}
          InputLabelProps={{ shrink: dobFocused || Boolean(newProfile.data.dob) }}
          placeholder={dobFocused && !newProfile.data.dob ? "mm/dd/yyyy" : ""}
        />
        <CustomTextFieldProfileManagement
          select
          label="Gender"
          variant="outlined"
          fullWidth
          margin="normal"
          name="gender"
          value={profile.gender}
          onChange={(e) => handleProfileChange(e, profile.profile_id)}
        >
          <MenuItem value="M">Male</MenuItem>
          <MenuItem value="F">Female</MenuItem>
          <MenuItem value="Other">Other</MenuItem>
        </CustomTextFieldProfileManagement>
        <CustomTextFieldProfileManagement
          select
          label="Blood Type"
          variant="outlined"
          fullWidth
          margin="normal"
          name="bloodType"
          value={profile.bloodType}
          onChange={(e) => handleProfileChange(e, profile.profile_id)}
        >
          <MenuItem value="A+">A+</MenuItem>
          <MenuItem value="A-">A-</MenuItem>
          <MenuItem value="B+">B+</MenuItem>
          <MenuItem value="B-">B-</MenuItem>
          <MenuItem value="AB+">AB+</MenuItem>
          <MenuItem value="AB-">AB-</MenuItem>
          <MenuItem value="O+">O+</MenuItem>
          <MenuItem value="O-">O-</MenuItem>
        </CustomTextFieldProfileManagement>
        <Box display="flex" justifyContent="space-between" marginTop={2}>
          <FancyButton
            onClick={() => handleSaveProfile(profile.profile_id)}
            disabled={isLoading}
            startIcon={<SaveIcon />}
          >
            Save
          </FancyButton>
          <Button
            onClick={() => toggleEditMode(profile.profile_id)}
            disabled={isLoading}
            startIcon={<CancelIcon />}
          >
            Cancel
          </Button>
        </Box>
      </>
    );
  };

  const renderProfileView = (profile) => {
    const dobFormatted = new Date(profile.dob).toLocaleDateString('en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
    return (
      <>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h6" gutterBottom>
            {`${profile.firstName} ${profile.lastName}`}
          </Typography>
          <Box>
            <IconButton onClick={() => navigate(`/medical-records/${profile.profile_id}`)} color="primary">
              <EditIcon />
            </IconButton>
            <IconButton onClick={() => handleDeleteClick(profile.profile_id)} color="secondary">
              <DeleteIcon />
            </IconButton>
          </Box>
        </Box>
        <Typography variant="body1" gutterBottom>
          Date of Birth: {dobFormatted}
        </Typography>
        <Typography variant="body1" gutterBottom>
          Gender: {profile.gender}
        </Typography>
        <Typography variant="body1" gutterBottom>
          Blood Type: {profile.bloodType}
        </Typography>
        <Button
          variant="contained"
          color="primary"
          style={{ marginTop: '10px' }}
          onClick={() => navigate(`/medical-records/${profile.profile_id}`)}
        >
          View Medical Records
        </Button>
        <FancyButton
          onClick={() => toggleEditMode(profile.profile_id)}
          disabled={isLoading}
          startIcon={<EditIcon />}
        >
          Edit Profile
        </FancyButton>
      </>
    );
  };

  const renderCreateProfileForm = () => {
    return (
      <>
        <CustomTextFieldProfileManagement
          label="First Name"
          variant="outlined"
          fullWidth
          margin="normal"
          name="firstName"
          value={newProfile.data.firstName}
          onChange={handleNewProfileChange}
        />
        <CustomTextFieldProfileManagement
          label="Last Name"
          variant="outlined"
          fullWidth
          margin="normal"
          name="lastName"
          value={newProfile.data.lastName}
          onChange={handleNewProfileChange}
        />
        <CustomTextFieldProfileManagement
          label="Date of Birth"
          type={dobFocused ? "date" : "text"}
          variant="outlined"
          fullWidth
          margin="normal"
          name="dob"
          value={newProfile.data.dob}
          onChange={handleNewProfileChange}
          onFocus={handleDobFocus}
          onBlur={handleDobBlur}
          InputLabelProps={{ shrink: dobFocused || Boolean(newProfile.data.dob) }}
          placeholder={dobFocused && !newProfile.data.dob ? "mm/dd/yyyy" : ""}
        />
        <CustomTextFieldProfileManagement
          select
          label="Gender"
          variant="outlined"
          fullWidth
          margin="normal"
          name="gender"
          value={newProfile.data.gender}
          onChange={handleNewProfileChange}
        >
          <MenuItem value="M">Male</MenuItem>
          <MenuItem value="F">Female</MenuItem>
          <MenuItem value="Other">Other</MenuItem>
        </CustomTextFieldProfileManagement>
        <CustomTextFieldProfileManagement
          select
          label="Blood Type"
          variant="outlined"
          fullWidth
          margin="normal"
          name="bloodType"
          value={newProfile.data.bloodType}
          onChange={handleNewProfileChange}
        >
          <MenuItem value="A+">A+</MenuItem>
          <MenuItem value="A-">A-</MenuItem>
          <MenuItem value="B+">B+</MenuItem>
          <MenuItem value="B-">B-</MenuItem>      
          <MenuItem value="AB+">AB+</MenuItem>
          <MenuItem value="AB-">AB-</MenuItem>
          <MenuItem value="O+">O+</MenuItem>
          <MenuItem value="O-">O-</MenuItem>
        </CustomTextFieldProfileManagement>
        <Box display="flex" justifyContent="space-between" marginTop={2}>
          <FancyButton
              onClick={handleCreateProfile}
              disabled={isLoading}
              startIcon={<AddCircleOutlineIcon />}
          >
              Create
          </FancyButton>
          <Button
              onClick={() => setNewProfile({ ...newProfile, creating: false })}
              disabled={isLoading}
              startIcon={<CancelIcon />}
          >
              Cancel
          </Button>
        </Box>
      </>
    );
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <CustomContainer>
        <Typography variant="h4" gutterBottom align="center"></Typography>
        {isFetching ? (
          <CircularProgress />
        ) : (
          <Grid container spacing={2} justifyContent="center">
            {profiles.map((profile) => (
              <Grid item key={profile.profile_id} xs={12} md={6} lg={4}>
                <Paper elevation={3} style={{ padding: '20px', position: 'relative' }}>
                  {editState[profile.profile_id] ? renderProfileEditForm(profile) : renderProfileView(profile)}
                </Paper>
              </Grid>
            ))}
            <Grid item xs={12} md={6} lg={4}>
              <Paper elevation={3} style={{ padding: '20px' }}>
                {newProfile.creating ? renderCreateProfileForm() : (
                  <IconButton onClick={() => setNewProfile({ ...newProfile, creating: true })}>
                    <AddCircleOutlineIcon />
                    <Typography variant="h6">Add Profile</Typography>
                  </IconButton>
                )}
              </Paper>
            </Grid>
          </Grid>
        )}
        <Snackbar open={!!error} autoHideDuration={6000} onClose={handleCloseSnackbar}>
          <Alert severity="error" onClose={handleCloseSnackbar}>{error}</Alert>
        </Snackbar>
        <Dialog open={openDialog} onClose={handleCloseDialog} aria-labelledby="delete-profile-dialog-title" aria-describedby="delete-profile-dialog-description">
          <DialogTitle id="delete-profile-dialog-title">{"Delete Profile"}</DialogTitle>
          <DialogContent>
            <DialogContentText id="delete-profile-dialog-description">
              Are you sure you want to delete this profile?
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog} color="primary">Cancel</Button>
            <Button onClick={handleConfirmDelete} color="secondary" autoFocus>Confirm</Button>
          </DialogActions>
        </Dialog>
      </CustomContainer>
    </ThemeProvider>
  );
};

export default ProfileManagement;