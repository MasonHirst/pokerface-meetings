import React from 'react';
import ReactDOM from 'react-dom/client';
import './reset.css';
import App from './App';
import { BrowserRouter } from 'react-router-dom';
import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { blue } from '@mui/material/colors';

const theme = createTheme({
  palette: {
    primary: {
      main: blue[500],
    },
    secondary: {
      main: '#9c4fd7',
    },
    white: {
      main: '#ffffff',
    },
    success: {
      main: '#4caf50',
    },
  },
});





//! The following block of code should be removed in around 6 months. 
//! It helps transfer old localStorage values to the new key names
//! Added Feb 2025

const oldToken = localStorage.getItem('localUserToken');
if (oldToken) {
  localStorage.setItem('PokerfaceLocalUserToken', oldToken)
  localStorage.removeItem('localUserToken')
}

const oldPlayerName = localStorage.getItem('playerName');
if (oldPlayerName) {
  localStorage.setItem('PokerfacePlayerName', oldPlayerName)
  localStorage.removeItem('playerName')
}

const oldCardImage = localStorage.getItem('pokerCardImage');
if (oldCardImage) {
  localStorage.setItem('PokerfaceCardImage', oldCardImage)
  localStorage.removeItem('pokerCardImage')
}

const oldSavedDecks = localStorage.getItem('savedDecks');
if (oldSavedDecks) {
  localStorage.setItem('PokerfaceSavedDecks', oldSavedDecks)
  localStorage.removeItem('savedDecks')
}

//! End of temporary block of code (to be removed)






const localUserToken = localStorage.getItem('PokerfaceLocalUserToken');
if (!localUserToken) {
  localStorage.setItem('PokerfaceLocalUserToken', uuidv4());
}

const savedDecks = localStorage.getItem('PokerfaceSavedDecks');
if (!savedDecks) {
  localStorage.setItem('PokerfaceSavedDecks', JSON.stringify([]));
}

if (process.env.NODE_ENV === 'development') {
  axios.defaults.baseURL = 'http://localhost:8080';
} else {
  axios.defaults.baseURL = window.location.origin;
}

axios.interceptors.request.use(function (config) {
  config.headers.Authorization = localStorage.getItem('PokerfaceLocalUserToken');
  // Do something before request is sent
  return config;
});

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <BrowserRouter>
    <ThemeProvider theme={theme}>
      <App />
    </ThemeProvider>
  </BrowserRouter>
);
