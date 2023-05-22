// ! IMPORTS
const express = require('express')
const app = express()
const cors = require('cors')
require('dotenv').config()
const path = require('path')

//! Middleware
const join = path.join(__dirname, '.', 'build')
app.use(express.static(join))
app.use(express.json())
app.use(cors())

//! Endpoints
const {
  startSocketServer,
  extractToken,
  createNewGame,
  uploadCloudinaryImage,
  deleteCloudinaryImage
} = require('./controllers/socketController')

app.put('/game/upload_image', extractToken, uploadCloudinaryImage)
app.delete('/game/delete_image', extractToken, deleteCloudinaryImage)
app.post('/game/create', extractToken, createNewGame)
app.get('/server/ping/8080', async (req, res) => {
  res.send('pong')
})

app.get('*', (req, res) => {
  res.sendFile(path.resolve(__dirname, '.', 'build', 'index.html'))
})



//! Server listen
const PORT = process.env.PORT || 8080
startSocketServer(app, PORT)
