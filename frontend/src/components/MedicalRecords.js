import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import {
  Typography, ThemeProvider, CssBaseline, FormControl, InputLabel, Select, MenuItem,
  Paper, Box, Dialog, DialogTitle, DialogContent, DialogActions, Autocomplete
} from '@mui/material';
import { CustomContainer, FancyButton, theme, CustomTextFieldProfileManagement } from './theme.js';
import recordFieldConfig from './recordFieldConfig.js';

const MedicalRecords = () => {
  const [profiles, setProfiles] = useState([]);
  const [selectedProfile, setSelectedProfile] = useState('');
  const [medicalRecords, setMedicalRecords] = useState([]);
  const [newRecord, setNewRecord] = useState({ recordType: '', details: {} });
  const [isManualEntryOpen, setIsManualEntryOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProfiles = async () => {
      try {
        const response = await axios.get('https://localhost:3001/medical-records/profiles', { withCredentials: true });
        const fetchedProfiles = response.data;
        if (fetchedProfiles.length === 0) {
          navigate('/portal/profile-management');
        } else {
          setProfiles(fetchedProfiles);
          const lastUsedProfileId = localStorage.getItem('lastUsedProfileId');
          const foundProfile = fetchedProfiles.find(p => p.profile_id.toString() === lastUsedProfileId);
          const initialProfileId = foundProfile ? lastUsedProfileId : fetchedProfiles[0].profile_id;
          setSelectedProfile(initialProfileId);
          fetchMedicalRecords(initialProfileId);
        }
      } catch (error) {
        console.error('Error fetching profiles:', error);
      }
    };
    fetchProfiles();
  }, [navigate]);

  const fetchMedicalRecords = async (profileId) => {
    try {
      const response = await axios.get(`https://localhost:3001/medical-records/${profileId}`, { withCredentials: true });
      setMedicalRecords(response.data);
    } catch (error) {
      console.error('Error fetching medical records:', error);
    }
  };

  const handleProfileChange = (event) => {
    const newProfileId = event.target.value;
    setSelectedProfile(newProfileId);
    localStorage.setItem('lastUsedProfileId', newProfileId);
    fetchMedicalRecords(newProfileId);
  };

  const handleFieldChange = (fieldName, value) => {
    setNewRecord(prevState => ({
      ...prevState,
      details: { ...prevState.details, [fieldName]: value }
    }));
  };

  const validateRecordData = () => {
    const requiredFields = recordFieldConfig[newRecord.recordType];
    for (const field of requiredFields) {
      const fieldValue = newRecord.details[field.name.replace(/\s/g, '').toLowerCase()];
      if (!fieldValue || fieldValue.trim() === '') {
        alert(`Please fill out the ${field.name} field.`);
        return false;
      }
    }
    return true;
  };

  const handleSubmitManualEntry = async () => {
    if (!validateRecordData()) {
      return;
    }

    const payload = {
      profileId: selectedProfile,
      recordType: newRecord.recordType,
      date: new Date().toISOString().split('T')[0], 
      details: newRecord.details 
    };

    try {
      const response = await axios.post('https://localhost:3001/medical-records/add', payload, { withCredentials: true });
      if (response.status === 201) {
        console.log('Record added successfully');
        setIsManualEntryOpen(false);
        fetchMedicalRecords(selectedProfile);
      }
    } catch (error) {
      console.error('Error submitting manual entry:', error);
    }
  };

  const renderField = (field, fieldValue) => {
    const fieldNameKey = field.name.replace(/\s/g, '').toLowerCase();

    if (field.type === 'autocomplete') {
      return (
        <Autocomplete
          key={field.name}
          options={field.options}
          getOptionLabel={(option) => option}
          renderInput={(params) => <CustomTextFieldProfileManagement {...params} label={field.name} />}
          value={fieldValue || ''}
          onChange={(event, newValue) => handleFieldChange(fieldNameKey, newValue)}
          fullWidth
          margin="normal"
          sx={{ width: '75%' }} // Increased width
        />
      );
    } else {
      return (
        <CustomTextFieldProfileManagement
          key={field.name}
          label={field.name}
          type={field.type}
          variant="outlined"
          fullWidth
          margin="normal"
          value={fieldValue || ''}
          onChange={(e) => handleFieldChange(fieldNameKey, e.target.value)}
          sx={{ width: '75%' }} // Increased width
        />
      );
    }
  };

  const renderManualEntryFormFields = () => {
    const recordTypeConfig = recordFieldConfig[newRecord.recordType] || [];
    const commonFieldsConfig = recordFieldConfig.commonFields || [];
    return [...recordTypeConfig, ...commonFieldsConfig].map((field) =>
      renderField(field, newRecord.details[field.name.replace(/\s/g, '').toLowerCase()], handleFieldChange)
    );
  };

  const renderManualEntryForm = () => {
    return (
      <Dialog open={isManualEntryOpen} onClose={() => setIsManualEntryOpen(false)} maxWidth="md">
        <DialogTitle>Add New Medical Record</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%' }}>
            <FormControl fullWidth margin="normal" sx={{ width: '75%' }}>
              <InputLabel>Record Type</InputLabel>
              <Select
                value={newRecord.recordType}
                onChange={(e) => setNewRecord({ ...newRecord, recordType: e.target.value })}
                label="Record Type"
                borderColor="#ff4081"
              >
                {Object.keys(recordFieldConfig).map((type) => (
                  <MenuItem key={type} value={type}>{type.split(/(?=[A-Z])/).join(" ")}</MenuItem>
                ))}
              </Select>
            </FormControl>
            {renderManualEntryFormFields()}
          </Box>
        </DialogContent>
        <DialogActions>
          <FancyButton onClick={() => setIsManualEntryOpen(false)}>Cancel</FancyButton>
          <FancyButton onClick={handleSubmitManualEntry} color="primary">Add Record</FancyButton>
        </DialogActions>
      </Dialog>
    );
  };

  const renderMedicalRecord = (record, index) => {
    const details = JSON.parse(record.record_details);
    return (
      <Box key={index} sx={{ marginBottom: 2 }}>
        <Typography variant="body1">Type: {record.record_type.split(/(?=[A-Z])/).join(" ")}</Typography>
        <Typography variant="body1">Date: {new Date(record.date).toLocaleDateString()}</Typography>
        <Typography variant="body1">Details: {details.details}</Typography>
      </Box>
    );
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <CustomContainer>
        <Typography variant="h4" gutterBottom align="center">Medical Records</Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <FormControl variant="outlined" style={{ marginRight: 10, minWidth: 200 }}>
            <InputLabel>Profile</InputLabel>
            <Select value={selectedProfile} onChange={handleProfileChange} label="Profile">
              {profiles.map((profile) => (
                <MenuItem key={profile.profile_id} value={profile.profile_id}>
                  {profile.firstName + ' ' + profile.lastName}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <FancyButton onClick={() => setIsManualEntryOpen(true)}>Add Record Manually</FancyButton>
        </Box>
        <Paper style={{ padding: 20 }}>
          {medicalRecords.length === 0 ? (
            <Typography variant="body1">This Profile Has No Records</Typography>
          ) : (
            medicalRecords.map(renderMedicalRecord)
          )}
        </Paper>
        {renderManualEntryForm()}
      </CustomContainer>
    </ThemeProvider>
  );
};

export default MedicalRecords;
