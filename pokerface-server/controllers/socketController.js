const { WebSocketServer, WebSocket } = require('ws')

const { v4: uuidv4, validate: validateUUID } = require('uuid')
// const { verifyAccessToken } = require('./authController')

let gameRooms = {}
let clientsList = {}

function broadcastToRoom(gameRoomId, userId, event_type) {
  console.log('gamesRooms status: ', gameRooms)
  const gameRoom = gameRooms[gameRoomId]
  if (!gameRoom) return console.log(`game room ${gameRoomId} not found`)
  gameRooms[gameRoomId].lastAction = Date.now()

  // Loop through all clients in the game room and send the message
  Object.values(gameRoom.players).forEach((playerObj) => {
    if (playerObj.userToken === userId) return console.log('not sending to self')

    const client = clientsList[playerObj.userToken]
    if (client && client.readyState === WebSocket.OPEN) {
      const body = JSON.stringify({ event_type })
      client.send(body)
    }
  })

  removeUnusedGameRooms()
}

function removeUnusedGameRooms() {
  // remove game room if it's empty and hasn't been used in two hours
  const filteredOldGames = Object.entries(gameRooms).filter(
    ([gameId, { lastAction }]) => {
      if (
        Object.keys(gameRooms[gameId].players).length < 1 &&
        gameRooms[gameId].lastAction &&
        isMoreThanTwoHoursAgo(gameRooms[gameId].lastAction)
      ) {
        console.log('deleting game room: ', gameId)
        return false
      } else return true
    }
  )
  gameRooms = Object.fromEntries(filteredOldGames)
}

function isMoreThanTwoHoursAgo(date) {
  const TWO_HOURS_IN_MS = 2 * 60 * 60 * 1000 // two hours in milliseconds
  const now = new Date()
  const diffInMs = now - date
  return diffInMs > TWO_HOURS_IN_MS
}

async function startSocketServer(app, port) {
  const wss = new WebSocketServer({
    server: app.listen(port, () => {
      console.log(`SERVER LISTENING ON PORT ${port}`)
    }),
  })
  wss.on('listening', () => {
    console.log(`WEBSOCKET SERVER IS LISTENING ON PORT ${wss.address().port}`)
  })

  wss.on('connection', function connection(ws, req) {
    try {
      console.log('A CLIENT CONNECTED')
      ws.on('error', console.error)
      ws.on('message', async function message(data, isBinary) {
        const { event, body } = JSON.parse(data)
        const { localUserToken, gameId, playerName } = body
        if (event === 'newLocalPlayer') {
          // add user to game room
          if (!localUserToken) return console.error('no authorization')
          ws.userToken = localUserToken
          ws.currentGameId = gameId
          clientsList[localUserToken] = ws
          const joiningObj = {
              currentGameId: gameId,
              userToken: localUserToken,
              currentChoice: null,
              playerName: playerName,
            }
          gameRooms[gameId].players[localUserToken] = joiningObj
        }
      })

      ws.on('close', function () {
        // remove user from gameroom
        console.log(`client ${ws.userToken} disconnecting`)
        const { userToken, currentGameId } = ws
        if (gameRooms[currentGameId]?.players[userToken]) {
          delete gameRooms[currentGameId].players[userToken]
        } else {
          console.log(`client ${userToken} not found in game room`)
        }
        broadcastToRoom(currentGameId, userToken, 'gameUpdated')
        delete clientsList[userToken]
      })
    } catch (err) {
      console.error(err)
    }
  })
}

module.exports = {
  broadcastToRoom,
  gameRooms,
  startSocketServer,
  getUpdatedGame: async (req, res) => {
    const { game_id } = req.params
    try {
      if (!gameRooms[game_id]) {
        return res.status(500).send('game room not found')
      }
      res.send(gameRooms[game_id])
    } catch (err) {
      console.error(err)
      res.status(500).send(err)
    }
  },

  extractToken: async (req, res, next) => {
    try {
      const localToken = req.headers.authorization
      if (!localToken)
        return res.status(401).send('where is your access token bro?')
      req.body.localUserToken = localToken
      next()
    } catch (err) {
      console.error(err)
      res.status(500).send(err)
    }
  },

  createNewGame: async (req, res) => {
    const { gameName, deck, localUserToken } = req.body
    try {
      const gameId = uuidv4()
      if (!gameName || !gameId)
        return res.status(500).send('missing gameName or gameId')
      gameRooms[gameId] = {
        gameRoomId: gameId,
        gameRoomName: gameName,
        gameState: 'voting',
        lastAction: Date.now(),
        voteResults: [],
        deck,
        players: {},
      }
      res.send(gameRooms[gameId])
    } catch (err) {
      console.error(err)
      res.status(500).send(err)
    }
  },

  checkGameExists: async (req, res) => {
    const { gameId } = req.body
    try {
      if (!gameRooms[gameId]) return res.send(false)
      res.send(true)
    } catch (err) {
      console.error(err)
      res.status(500).send(err)
    }
  },

  updateGameState: async (req, res) => {
    const { gameState, gameId, localUserToken } = req.body
    try {
      if (gameState === 'voting') {
        Object.values(gameRooms[gameId].players).forEach((player) => {
          player.currentChoice = null
        })
      }
      if (gameState === 'reveal') {
        const cardCounts = {}
        Object.values(gameRooms[gameId].players).forEach((player) => {
          cardCounts[player.playerName] = player.currentChoice
        })
        gameRooms[gameId].voteResults.push(cardCounts)
      }
      gameRooms[gameId].gameState = gameState
      broadcastToRoom(gameId, localUserToken, 'gameUpdated')
      res.send(gameRooms[gameId])
    } catch (err) {
      console.error(err)
      res.status(500).send(err)
    }
  },

  setPlayerName: async (req, res) => {
    const { localUserToken, name, gameId } = req.body
    try {
      gameRooms[gameId].players[localUserToken].playerName = name
      broadcastToRoom(gameId, localUserToken, 'gameUpdated')
      res.send(gameRooms[gameId])
    } catch (err) {
      console.error(err)
      res.status(500).send(err)
    }
  },

  leaveGame: async (req, res) => {
    const { localUserToken, gameId } = req.body
    try {
      if (gameRooms[gameId] && gameRooms[gameId]?.players[localUserToken]) {
        delete gameRooms[gameId].players[localUserToken]
      }
      delete clientsList[localUserToken]
      broadcastToRoom(gameId, localUserToken, 'gameUpdated')
      res.send(`player removed from game ${gameId}`)
    } catch (err) {
      console.error(err)
      res.status(500).send(err)
    }
  },

  updateCardChoice: async (req, res) => {
    try {
      const { localUserToken, choice, gameId } = req.body
      if (gameRooms[gameId].players[localUserToken].currentChoice === choice) {
        gameRooms[gameId].players[localUserToken].currentChoice = null
      } else {
        gameRooms[gameId].players[localUserToken].currentChoice = choice
      }
      broadcastToRoom(gameId, localUserToken, 'gameUpdated')
      res.send(gameRooms[gameId])
    } catch (err) {
      console.error(err)
      res.status(500).send(err)
    }
  },
}
