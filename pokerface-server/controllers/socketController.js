const { WebSocketServer, WebSocket } = require('ws')

const { v4: uuidv4, validate: validateUUID } = require('uuid')
// const { verifyAccessToken } = require('./authController')

let gameRooms = {}
let clientsList = {}

function broadcastToRoom(gameRoomId, event_type, message) {
  console.log('current game room status: ', gameRooms[gameRoomId])
  const gameRoom = gameRooms[gameRoomId]
  if (!gameRoom) return console.log(`game room ${gameRoomId} not found`)
  gameRooms[gameRoomId].lastAction = Date.now()

  // Loop through all clients in the game room and send the message
  Object.keys(gameRoom.players).forEach((clientId) => {
    const client = clientsList[clientId]
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

async function startSocketServer() {
  const wss = new WebSocketServer({ port: 8086 })
  wss.on('listening', () => {
    console.log(
      `WebSocket server is running and listening on port ${wss.address().port}`
    )
  })

  wss.on('connection', function connection(ws, req) {
    try {
      console.log('client connected')
      ws.on('error', console.error)
      ws.on('message', async function message(data, isBinary) {
        const { event, body } = JSON.parse(data)
        const localUserToken = body.localUserToken
        if (event === 'newLocalPlayer') {
          // associate userId to client
          // add to list of clients
          if (!localUserToken) return console.error('no authorization')
          ws.userToken = localUserToken
          clientsList[localUserToken] = ws
        }
      })

      ws.on('close', function () {
        console.log(`client ${ws.userToken} disconnecting`)
        const userToken = ws.userToken
        let gameId = clientsList[userToken]?.currentGameId
        // remove from game room if they are in one
        if (gameId) {
          delete gameRooms[gameId].players[userToken]
        }
        // remove from list of clients
        if (clientsList[userToken]) {
          delete clientsList[userToken]
        }
        broadcastToRoom(gameId, 'gameUpdated', gameRooms[gameId])
      })
    } catch (err) {
      console.error(err)
    }
  })
}

module.exports = {
  broadcastToRoom,
  gameRooms,
  clientsList,
  startSocketServer,

  extractToken: async (req, res, next) => {
    try {
      const localToken = req.headers.authorization
      if (!localToken)
        return res.status(401).send('where is your access token bro?')
      req.body.localUserToken = localToken
      next()
    } catch (err) {
      console.error(err)
      res.status(403).send(err)
    }
  },

  createNewGame: async (req, res) => {
    const { gameName, gameId, deck } = req.body
    try {
      if (!gameName || !gameId)
        return res.status(403).send('missing gameName or gameId')
      gameRooms[gameId] = {
        gameRoomName: gameName,
        gameState: 'voting',
        lastAction: Date.now(),
        voteResults: [],
        deck,
        players: {},
      }
      broadcastToRoom(gameId, 'gameUpdated', gameRooms[gameId])
      res.send(gameRooms[gameId])
    } catch (err) {
      console.error(err)
      res.status(403).send(err)
    }
  },

  updateGameState: async (req, res) => {
    const { localUserToken, gameState } = req.body
    try {
      const gameId = clientsList[localUserToken].currentGameId
      if (gameState === 'voting') {
        Object.values(gameRooms[gameId].players).forEach((player) => {
          player.currentChoice = null
        })
      }
      if (gameState === 'reveal') {
        const cardCounts = {}
        Object.values(gameRooms[gameId].players).forEach((player) => {
          // const obj = {
          //   choice: player.currentChoice,
          // }
          cardCounts[player.playerName] = player.currentChoice
        })
        gameRooms[gameId].voteResults.push(cardCounts)
      }
      gameRooms[gameId].gameState = gameState
      broadcastToRoom(gameId, 'gameUpdated', gameRooms[gameId])
      res.send('game state updated')
    } catch (err) {
      console.error(err)
      res.status(403).send(err)
    }
  },

  playerJoinGame: async (req, res) => {
    const { localUserToken, gameId, name } = req.body
    // console.log('gameRooms-----------', gameRooms)
    // console.log('playerJoinGame', localUserToken, gameId)
    try {
      const joiningPlayerObj = {
        localUserToken,
        playerName: name || null,
        currentChoice: null,
        isSpectator: false,
        currentGameId: gameId,
      }
      if (validateUUID(clientsList[localUserToken].currentGameId)) {
        return res.status(403).send('client is already in a game')
      }
      console.log(`player joined game ${gameId}`)
      gameRooms[gameId].players[localUserToken] = joiningPlayerObj
      clientsList[localUserToken].currentGameId = gameId
      broadcastToRoom(gameId, 'gameUpdated', gameRooms[gameId])
      res.send(gameRooms[gameId])
    } catch (err) {
      console.error(err)
      res.status(403).send(err)
    }
  },

  setPlayerName: async (req, res) => {
    const { localUserToken, name, gameId } = req.body
    try {
      gameRooms[gameId].players[localUserToken].playerName = name
      broadcastToRoom(gameId, 'gameUpdated', gameRooms[gameId])
      res.send(`player name set to ${name}`)
    } catch (err) {
      console.error(err)
      res.status(403).send(err)
    }
  },

  leaveGame: async (req, res) => {
    const { localUserToken, gameId } = req.body
    try {
      if (gameRooms[gameId] && gameRooms[gameId]?.players[localUserToken]) {
        delete gameRooms[gameId].players[localUserToken]
        clientsList[localUserToken].currentGameId = null
      }
      broadcastToRoom(gameId, 'gameUpdated', gameRooms[gameId])
      res.send(`player removed from game ${gameId}`)
    } catch (err) {
      console.error(err)
      res.status(403).send(err)
    }
  },

  updateCardChoice: async (req, res) => {
    try {
      const { localUserToken, choice } = req.body
      const gameId = clientsList[localUserToken].currentGameId
      if (gameRooms[gameId].players[localUserToken].currentChoice === choice) {
        gameRooms[gameId].players[localUserToken].currentChoice = null
      } else {
        gameRooms[gameId].players[localUserToken].currentChoice = choice
      }
      broadcastToRoom(gameId, 'gameUpdated', gameRooms[gameId])
      res.send('choice updated')
    } catch (err) {
      console.error(err)
      res.status(403).send(err)
    }
  },
}
