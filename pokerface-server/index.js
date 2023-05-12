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
  updateGameState,
  createNewGame,
  leaveGame,
  checkGameExists,
  setPlayerName,
  updateCardChoice,
  getUpdatedGame,
} = require('./controllers/socketController')

app.post('/game/create', extractToken, createNewGame)
// app.put('/game/leave', extractToken, leaveGame)
// app.post('/game/player_name', extractToken, setPlayerName)
// app.post('/game/check', extractToken, checkGameExists)
// app.put('/game/submit_choice', extractToken, updateCardChoice)
// app.put('/game/update_state', extractToken, updateGameState)
// app.get('/game/latest/:game_id', extractToken, getUpdatedGame)
app.get('/server/ping/8080', async (req, res) => {
  res.send('pong')
})

app.get('*', (req, res) => {
  res.sendFile(path.resolve(__dirname, '.', 'build', 'index.html'))
})



//! Server listen
const PORT = process.env.PORT || 8080
startSocketServer(app, PORT)
