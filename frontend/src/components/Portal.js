import React from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Typography, ThemeProvider, CssBaseline, Drawer, List, ListItemButton, ListItemIcon, ListItemText} from '@mui/material';
import LogoutIcon from '@mui/icons-material/Logout';
import AccountBoxIcon from '@mui/icons-material/AccountBox';
import FolderIcon from '@mui/icons-material/Folder';
import ShareIcon from '@mui/icons-material/Share';
import { CustomContainer, theme } from './theme.js';

const Portal = () => {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await axios.post('https://localhost:3001/logout', {}, { withCredentials: true });
      navigate('/login');
    } catch (err) {
      console.error('Logout failed:', err);
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Drawer 
        variant="permanent" 
        anchor="left"
        sx={{
          '& .MuiDrawer-paper': {
            boxShadow: '10px 0 15px rgba(0, 0, 0, 0.15)',
            borderRight: '2px solid rgba(255, 255, 255, 0.2)',
            transition: 'transform 0.3s ease-in-out',
            '&:hover': {
              transform: 'translateX(5px)',
            },
          }
        }}
      >
        <CustomContainer>
          <Typography variant="h6" noWrap>
            MedSafe Portal
          </Typography>
        </CustomContainer>
        <List>
          <ListItemButton onClick={() => navigate('/portal/profile-management')}>
            <ListItemIcon><AccountBoxIcon /></ListItemIcon>
            <ListItemText primary="Profile Management" />
          </ListItemButton>
          <ListItemButton onClick={() => navigate('/portal/medical-records')}>
            <ListItemIcon><FolderIcon /></ListItemIcon>
            <ListItemText primary="Medical Records" />
          </ListItemButton>
          <ListItemButton onClick={() => navigate('/portal/share-profile')}>
            <ListItemIcon><ShareIcon /></ListItemIcon>
            <ListItemText primary="Share Profile" />
          </ListItemButton>
          <ListItemButton onClick={handleLogout}>
            <ListItemIcon><LogoutIcon /></ListItemIcon>
            <ListItemText primary="Logout" />
          </ListItemButton>
        </List>
      </Drawer>
      <main style={{ paddingLeft: '240px' }}>
        <CustomContainer>
          <Outlet />
        </CustomContainer>
      </main>
    </ThemeProvider>
  );
};

export default Portal;