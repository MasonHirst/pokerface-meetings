const { WebSocketServer, WebSocket } = require('ws')

const { v4: uuidv4, validate: validateUUID } = require('uuid')
// const { verifyAccessToken } = require('./authController')

let gameRooms = {}

function broadcastToRoom(gameRoomId, event_type, message) {
  console.log('current game room status: ', gameRooms[gameRoomId])
  const gameRoom = gameRooms[gameRoomId]
  // console.log('all gamerooms: ', gameRooms)
  // console.log('specific gameroom: ', gameRoom)
  // console.log('specified gameroomid: ', gameRoomId)
  if (!gameRoom) return console.log(`game room ${gameRoomId} not found`)
  gameRooms[gameRoomId].lastAction = Date.now()

  // Loop through all clients in the game room and send the message
  Object.entries(gameRoom.players).forEach((clientId) => {
    console.log('gameroom players entry: ', clientId)
    const client = gameRooms[gameRoomId].players[clientId]
    if (client && client.readyState === WebSocket.OPEN) {
      const body = JSON.stringify({ event_type, message })
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
        const { localUserToken, gameId } = body
        if (event === 'newLocalPlayer') {
          // associate userId to client
          // add to list of clients
          if (!localUserToken) return console.error('no authorization')
          ws.currentGameId = gameId
          ws.userToken = localUserToken
          ws.currentChoice = null
          ws.isSpectator = false
          ws.playerName = null
          gameRooms[gameId].players[localUserToken] = ws
          console.log('gameRooms after player join: ', gameRooms[gameId])
        }
      })

      ws.on('close', function () {
        console.log(`client ${ws.userToken} disconnecting`)
        const { userToken, currentGameId } = ws
        if (gameRooms[currentGameId]?.players[userToken]) {
          delete gameRooms[currentGameId].players[userToken]
        } else {
          console.log(
            `client ${userToken} not found in game room`
          )
        }
        broadcastToRoom(currentGameId, 'gameUpdated')
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
    const { gameId, localUserToken } = req.params
    try {
      if (!gameRooms[gameId]) {
        return res.status(500).send('game room not found')
      }
      res.send(gameRooms[gameId])
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
    const { gameName, deck } = req.body
    try {
      const gameId = uuidv4()
      console.log('game room id from frontend: ', gameId)
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
      console.log('gameRooms (from creategame function): ', gameRooms)
      broadcastToRoom(gameId, 'gameUpdated')
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
    const { gameState, gameId } = req.body
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
      broadcastToRoom(gameId, 'gameUpdated')
      res.send('game state updated')
    } catch (err) {
      console.error(err)
      res.status(500).send(err)
    }
  },

  setPlayerName: async (req, res) => {
    const { localUserToken, name, gameId } = req.body
    try {
      gameRooms[gameId].players[localUserToken].playerName = name
      broadcastToRoom(gameId, 'gameUpdated')
      res.send(`player name set to ${name}`)
    } catch (err) {
      console.error(err)
      res.status(500).send(err)
    }
  },

  leaveGame: async (req, res) => {
    const { localUserToken, gameId } = req.body
    try {
      console.log('---------------------', localUserToken, gameId)
      if (gameRooms[gameId] && gameRooms[gameId]?.players[localUserToken]) {
        delete gameRooms[gameId].players[localUserToken]
      }
      broadcastToRoom(gameId, 'gameUpdated')
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
      broadcastToRoom(gameId, 'gameUpdated')
      res.send('choice updated')
    } catch (err) {
      console.error(err)
      res.status(500).send(err)
    }
  },
}
