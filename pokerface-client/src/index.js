import React from 'react'
import ReactDOM from 'react-dom/client'
import './reset.css'
import App from './App'
import { BrowserRouter } from 'react-router-dom'
import axios from 'axios'
import { v4 as uuidv4 } from 'uuid'
import { createTheme, ThemeProvider } from '@mui/material/styles'
import { blue } from '@mui/material/colors'

const theme = createTheme({
  palette: {
    primary: {
      main: blue[500],
    },
    secondary: {
      // main: '#aa00ff',
      main: '#9c4fd7',
    },
    white: {
      main: '#ffffff',
    },
    success: {
      main: '#4caf50',
    },
  },
})

const localUserToken = localStorage.getItem('localUserToken')
if (!localUserToken) {
  localStorage.setItem('localUserToken', uuidv4())
}

if (!localStorage.getItem('savedDecks')) {
  localStorage.setItem('savedDecks', JSON.stringify([]))
}

const serverUrl =
  process.env.NODE_ENV === 'development'
    ? 'http://localhost:8080/'
    : document.location.origin
axios.defaults.baseURL = serverUrl

axios.interceptors.request.use(function (config) {
  config.headers.Authorization = localStorage.getItem('localUserToken')
  // Do something before request is sent
  return config
})

const root = ReactDOM.createRoot(document.getElementById('root'))
root.render(
  <BrowserRouter>
    <ThemeProvider theme={theme}>
      <App />
    </ThemeProvider>
  </BrowserRouter>
)
