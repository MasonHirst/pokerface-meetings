import React from 'react'
import ReactDOM from 'react-dom/client'
import './reset.css'
import App from './App'
import { BrowserRouter } from 'react-router-dom'
import axios from 'axios'
import { v4 as uuidv4 } from 'uuid'

const localUserToken = localStorage.getItem('localUserToken')
if (!localUserToken) {
  localStorage.setItem('localUserToken', uuidv4())
}

const serverUrl = process.env.NODE_ENV === 'development' ? 'http://localhost:8080/' : document.location.origin
console.log('serverUrl: ', serverUrl)
axios.defaults.baseURL = serverUrl
// axios.defaults.baseURL = 'https://pokerface-meet.fly.dev/'
// axios.defaults.baseURL = 'https://pokerface-meet.fly.dev:8080/'
// axios.defaults.headers.common['Authorization'] =
//   localStorage.getItem('jwtAccessToken')
axios.interceptors.request.use(function (config) {
  config.headers.Authorization = localStorage.getItem('localUserToken')
  // Do something before request is sent
  return config
})

const root = ReactDOM.createRoot(document.getElementById('root'))
root.render(
  <BrowserRouter>
    <App />
  </BrowserRouter>
)
