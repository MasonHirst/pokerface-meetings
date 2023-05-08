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
  // startNewVoting,
  updateGameState,
  createNewGame,
  leaveGame,
  playerJoinGame,
  setPlayerName,
  updateCardChoice,
} = require('./controllers/socketController')

app.post('/game/create', extractToken, createNewGame)
app.put('/game/leave', extractToken, leaveGame)
app.post('/game/join', extractToken, playerJoinGame)
app.post('/game/player_name', extractToken, setPlayerName)
app.put('/game/submit_choice', extractToken, updateCardChoice)
// app.put('/game/start_new_voting', extractToken, startNewVoting)
app.put('/game/update_state', extractToken, updateGameState)

//! Socket server
startSocketServer()

//! Server listen
const { SERVER_PORT } = process.env
// db.sync().then(() => {
app.listen(SERVER_PORT, () =>
  console.log(`SERVER RUNNING ON SERVER_PORT ${SERVER_PORT}`)
)
// })
