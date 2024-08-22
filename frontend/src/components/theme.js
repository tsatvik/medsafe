import { createTheme, styled } from '@mui/material/styles';
import { Container, TextField, Button, Grid } from '@mui/material';

// Define color variables
const mainBackgroundGradientStart = '#000033'; 
const mainBackgroundGradientEnd = '#39007c';
const drawerGradientStart = '#2962ff';
const drawerGradientEnd = '#00b0ff';
const profileBoxGradientStart = '#f50057'; // Previously used main background start color
const profileBoxGradientEnd = '#9c27b0'; // Previously used main background end color

// Adjusted colors
const textFieldBorderColor = '#464775'; // Blending color for text field border
const buttonBackgroundColor = '#c90284'; // Darker button color
const textFieldBackgroundColor = '#ffffff66';
const autofillBackgroundColor = '#ffffff66';
const textFieldBorderColor2 = '#ff4081';

export const theme = createTheme({
  typography: {
    fontFamily: 'Nunito, Arial, sans-serif',
    allVariants: {
      color: '#fff',
    },
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: `
        html, body {
          margin: 0;
          padding: 0;
          min-height: 100%;
          background: 
            radial-gradient(circle at 10% 50%, ${mainBackgroundGradientStart}, transparent 80%),
            radial-gradient(circle at 30% 50%, ${mainBackgroundGradientEnd}, transparent 80%),
            radial-gradient(circle at 50% 50%, ${mainBackgroundGradientStart}, transparent 80%),
            radial-gradient(circle at 70% 50%, ${mainBackgroundGradientEnd}, transparent 80%),
            radial-gradient(circle at 90% 50%, ${mainBackgroundGradientStart}, transparent 80%);
          background-repeat: no-repeat;
          background-attachment: fixed;
          -webkit-font-smoothing: antialiased;
          -moz-osx-font-smoothing: grayscale;
        }
      `,
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          background: `linear-gradient(45deg, ${drawerGradientStart} 0%, ${drawerGradientEnd} 100%)`,
          color: 'white',
          width: 240,
          borderTopRightRadius: '10px',
          borderBottomRightRadius: '10px',
          boxShadow: '4px 0px 8px 0 rgba(0, 0, 0, 0.2)',
          border: 'none',
          '& .MuiListItem-root': {
            borderBottom: 'none',
            '&:hover': {
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
            },
          }
        },
      },
    },
    MuiPaper: { // Adding MuiPaper for profile box gradient
      styleOverrides: {
        root: {
          background: `linear-gradient(45deg, ${profileBoxGradientStart} 0%, ${profileBoxGradientEnd} 100%)`,
          borderRadius: '15px',
          color: 'white',
        },
      },
    },
    MuiFormControl: {
      styleOverrides: {
        root: {
          '& .MuiInputBase-root': {
            backgroundColor: textFieldBackgroundColor,
            color: 'white',
            '& fieldset': {
              borderColor: '#00008B', // Dark Blue
            },
            '&:hover fieldset': {
              borderColor: '#00008B', // Dark Blue
            },
            '&.Mui-focused fieldset': {
              borderColor: 'white',
            },
            '& input:-webkit-autofill': {
              WebkitBoxShadow: `0 0 0 100px ${autofillBackgroundColor} inset`,
              WebkitTextFillColor: 'white',
              transition: 'background-color 5000s ease-in-out 0s',
            },
            '& input:-webkit-autofill:focus': {
              WebkitBoxShadow: `0 0 0 100px ${autofillBackgroundColor} inset`,
              WebkitTextFillColor: 'white',
            },
          },
        },
      },
    },
  },
});

// For Login and Signup
export const CustomTextFieldLoginSignup = styled(TextField)({
  '& label.Mui-focused': {
    color: 'white',
  },
  '& .MuiInput-underline:after': {
    borderBottomColor: 'white',
  },
  '& .MuiOutlinedInput-root': {
    '& fieldset': {
      borderColor: textFieldBorderColor, // Specific color for login/signup
    },
    '&:hover fieldset': {
      borderColor: textFieldBorderColor,
    },
    '&.Mui-focused fieldset': {
      borderColor: 'white',
    },
    backgroundColor: '#ffffff66',
    color: 'white',
    width: '100%',
    maxWidth: '400px',
    margin: '0 auto',
  },
});

export const CustomTextFieldProfileManagement = styled(TextField)({
  '& label.Mui-focused': {
    color: 'white',
  },
  '& .MuiInput-underline:after': {
    borderBottomColor: 'white',
  },
  '& .MuiOutlinedInput-root': {
    '& fieldset': {
      borderColor: textFieldBorderColor2, // Specific color for profile management
    },
    '&:hover fieldset': {
      borderColor: textFieldBorderColor2,
    },
    '&.Mui-focused fieldset': {
      borderColor: 'white',
    },
    backgroundColor: '#ffffff66',
    color: 'white',
    width: '100%',
    maxWidth: '400px',
    margin: '0 auto',
  },
});

export const FancyButton = styled(Button)(({ theme }) => ({
  background: buttonBackgroundColor,
  color: 'white',
  height: 'auto',
  padding: '10px 15px',
  '&:hover': {
    background: buttonBackgroundColor,
    borderColor: 'white',
    boxShadow: 'none',
  },
  border: '1px solid transparent',
  transition: 'border-color 0.3s, box-shadow 0.3s',
  width: '125px',
  margin: '0 auto',
  marginTop: theme.spacing(3),
}));

export const CustomContainer = styled(Container)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  paddingTop: theme.spacing(8),
  padding: theme.spacing(2),
}));

export const CustomGrid = styled(Grid)({
  width: '100%',
  justifyContent: 'center',
  '& .MuiGrid-item': {
    padding: '8px',
  },
});
