const { WebSocketServer, WebSocket } = require('ws')
const wss = new WebSocketServer({ port: 8086 })
// const { verifyAccessToken } = require('./authController')

const gameRooms = {}
const clientsList = {}

function broadcastToRoom(gameRoomId, event_type, message) {
  const gameRoom = gameRooms[gameRoomId]
  if (!gameRoom) return console.log(`game room ${gameRoomId} not found`)

  // Loop through all clients in the game room and send the message
  Object.keys(gameRoom).forEach((clientId) => {
    if (clientId === 'gameRoomName') return
    const client = clientsList[clientId]
    if (client && client.readyState === WebSocket.OPEN) {
      const body = JSON.stringify({ event_type, message })
      client.send(body)
    }
  })
}

module.exports = {
  broadcastToRoom,
  gameRooms,
  clientsList,
  startSocketServer: async () => {
    wss.on('connection', function connection(ws, req) {
      try {
        console.log('connection happened')
        ws.on('error', console.error)
        ws.on('message', async function message(data, isBinary) {
          const { event, body } = JSON.parse(data)
          const localUserToken = body.localUserToken
          if (event === 'newLocalPlayer') {
            // associate userId to client
            // add to list of clients
            if (!localUserToken) return console.log('no authorization')
            ws.userToken = localUserToken
            clientsList[localUserToken] = ws
          }
        })

        ws.on('close', function (event) {
          const userToken = ws.localUserToken
          if (clientsList[userToken]) {
            delete clientsList[userToken]
          }
        })
      } catch (err) {
        console.error(err)
      }
    })
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
      res.status(403).send(err)
    }
  },

  createNewGame: async (req, res) => {
    const { gameName, gameId } = req.body
    try {
      if (!gameName || !gameId)
        return res.status(403).send('missing gameName or gameId')
      gameRooms[gameId] = { gameRoomName: gameName }
      broadcastToRoom(gameId, 'newGameCreated', gameRooms[gameId])
      res.send(gameRooms[gameId])
    } catch (err) {
      console.error(err)
      res.status(403).send(err)
    }
  },

  playerJoinGame: async (req, res) => {
    const { localUserToken, gameId, name } = req.body
    try {
      const joiningPlayerObj = {
        localUserToken,
        playerName: name || null,
        currentChoice: null,
        isSpectator: false,
        currentGameId: gameId,
      }
      gameRooms[gameId][localUserToken] = joiningPlayerObj
      console.log('gameRooms: ', gameRooms)
      clientsList[localUserToken] = joiningPlayerObj
      broadcastToRoom(gameId, 'playerJoined', gameRooms[gameId])
      res.send(gameRooms[gameId])
    } catch (err) {
      console.error(err)
      res.status(403).send(err)
    }
  },

  setPlayerName: async (req, res) => {
    const { localUserToken, name, gameId } = req.body
    try {
      gameRooms[gameId][localUserToken].playerName = name
      broadcastToRoom(gameId, 'playerNameSet', gameRooms[gameId])
      res.send(`player name set to ${name}`)
    } catch (err) {
      console.error(err)
      res.status(403).send(err)
    }
  },

  leaveGame: async (req, res) => {
    const { localUserToken, gameId } = req.body
    try {
      console.log('leaving data: ', localUserToken, gameId)
      console.log('leaving game: ', gameRooms[gameId])
      delete gameRooms[gameId][localUserToken]
      broadcastToRoom(gameId, 'playerLeft', gameRooms[gameId])
      if (Object.keys(gameRooms[gameId]).length < 2) {
        delete gameRooms[gameId]
      }
      res.send(`player removed from game ${gameId}`)
    } catch (err) {
      console.error(err)
      res.status(403).send(err)
    }
  },
}
