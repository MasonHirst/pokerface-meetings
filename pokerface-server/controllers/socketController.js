const { WebSocketServer, WebSocket } = require('ws')
const { v4: uuidv4, validate: validateUUID } = require('uuid')

let gameRooms = {}
let clientsList = {}

function broadcastToRoom(gameRoomId, event_type) {
  // arguments: target game room, event type, message
  const gameRoom = gameRooms[gameRoomId]
  if (!gameRoom) return console.log(`game room ${gameRoomId} not found`)
  gameRooms[gameRoomId].lastAction = Date.now()

  // Loop through all clients in the game room and send the message
  Object.values(gameRoom.players).forEach((playerObj) => {
    // if (playerObj.userToken === userId)
    //   return console.log('not sending to self')

    const client = clientsList[playerObj.token]
    if (client && client.readyState === WebSocket.OPEN) {
      const body = JSON.stringify({ event_type, game: gameRoom })
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
        console.log('------------------------deleting game room: ', gameId)
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
    server: app.listen(port),
  })
  wss.on('listening', () => {
    console.log(`SERVER IS LISTENING ON PORT ${wss.address().port}`)
    setInterval(() => {
      wss.clients.forEach((client) => {
        client.ping()
      }, 3000)
    })
  })

  wss.on('connection', function connection(ws, req) {
    console.log('new client connected')
    // Extract token from query parameters
    let token = null

    // Check if the URL contains a query parameter named 'token'
    if (req.url.includes('?')) {
      const queryParameters = req.url.split('?')[1]
      const urlParams = new URLSearchParams(queryParameters)
      token = urlParams.get('token')
      playerName = urlParams.get('player_name')
      gameId = urlParams.get('game_id')
    }
    // Attach the token to the WebSocket object
    ws.token = token
    ws.playerName = playerName
    ws.currentGameId = gameId
    clientsList[token] = ws

    if (gameRooms[gameId]) {
      gameRooms[gameId].players[token] = {
        currentGameId: gameId,
        token,
        currentChoice: null,
        playerName,
      }
      const body = JSON.stringify({
        event_type: 'playerJoinedGame',
        game: gameRooms[gameId],
      })
      ws.send(body)
    } else {
      ws.send(JSON.stringify({ event_type: 'gameNotFound' }))
      console.log('game room not found at socket join, aborting join')
    }

    try {
      ws.on('error', console.error)

      //! MESSAGES HANLDERS
      ws.on('message', async function message(data, isBinary) {
        const dataBody = JSON.parse(data)
        const { type, body, gameId, token } = dataBody

        if (type === 'updatedChoice') {
          if (!gameRooms[gameId])
            return console.log('game room not found (updatedChoice) function')
          if (gameRooms[gameId].players[token].currentChoice === body.card) {
            gameRooms[gameId].players[token].currentChoice = null
            return broadcastToRoom(gameId, 'gameUpdated')
          }
          gameRooms[gameId].players[token].currentChoice = body.card
          broadcastToRoom(gameId, 'gameUpdated')
        } else if (type === 'playerLeaveGame') {
          if (!gameRooms[gameId])
            return console.log('game room not found (playerLeaveGame) function')
          delete gameRooms[gameId].players[token]
          console.log(
            'gameRooms[gameId].players after leave: ',
            gameRooms[gameId].players
          )
        } else if (type === 'updateGameState') {
          if (!gameRooms[gameId])
            return console.log('game room not found (updateGameState) function')
          if (body.gameState === 'voting') {
            Object.values(gameRooms[gameId].players).forEach((player) => {
              player.currentChoice = null
            })
          }
          if (body.gameState === 'reveal') {
            const cardCounts = {}
            Object.values(gameRooms[gameId].players).forEach((player) => {
              cardCounts[player.playerName] = player.currentChoice
            })
            gameRooms[gameId].voteResults.push(cardCounts)
          }
          gameRooms[gameId].gameState = body.gameState
          broadcastToRoom(gameId, 'gameUpdated')
        } else if (type === 'playerLeaveGame') {
          if (!gameRooms[gameId])
            return console.log('game room not found (playerLeaveGame) function')
          delete gameRooms[gameId].players[token]
          console.log('Removed player from game')
          broadcastToRoom(gameId, 'gameUpdated')
        }
      })
      //! END MESSAGES HANLDERS

      ws.on('close', function () {
        // remove user from gameroom
        console.log(`CLIENT ${ws.userToken} DISCONNECTING`)
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
  // getUpdatedGame: async (req, res) => {
  //   const { game_id } = req.params
  //   try {
  //     if (!gameRooms[game_id]) {
  //       return res.status(500).send('game room not found')
  //     }
  //     res.send(gameRooms[game_id])
  //   } catch (err) {
  //     console.error(err)
  //     res.status(500).send(err)
  //   }
  // },

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

  // checkGameExists: async (req, res) => {
  //   const { gameId } = req.body
  //   try {
  //     if (!gameRooms[gameId]) return res.send(false)
  //     res.send(true)
  //   } catch (err) {
  //     console.error(err)
  //     res.status(500).send(err)
  //   }
  // },

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

  // setPlayerName: async (req, res) => {
  //   const { localUserToken, name, gameId } = req.body
  //   try {
  //     gameRooms[gameId].players[localUserToken].playerName = name
  //     broadcastToRoom(gameId, localUserToken, 'gameUpdated')
  //     res.send(gameRooms[gameId])
  //   } catch (err) {
  //     console.error(err)
  //     res.status(500).send(err)
  //   }
  // },

  // leaveGame: async (req, res) => {
  //   const { localUserToken, gameId } = req.body
  //   try {
  //     if (gameRooms[gameId] && gameRooms[gameId]?.players[localUserToken]) {
  //       delete gameRooms[gameId].players[localUserToken]
  //     }
  //     delete clientsList[localUserToken]
  //     broadcastToRoom(gameId, localUserToken, 'gameUpdated')
  //     res.send(`player removed from game ${gameId}`)
  //   } catch (err) {
  //     console.error(err)
  //     res.status(500).send(err)
  //   }
  // },

  // updateCardChoice: async (req, res) => {
  //   try {
  //     const { localUserToken, choice, gameId } = req.body
  //     if (gameRooms[gameId].players[localUserToken].currentChoice === choice) {
  //       gameRooms[gameId].players[localUserToken].currentChoice = null
  //     } else {
  //       gameRooms[gameId].players[localUserToken].currentChoice = choice
  //     }
  //     broadcastToRoom(gameId, localUserToken, 'gameUpdated')
  //     res.send(gameRooms[gameId])
  //   } catch (err) {
  //     console.error(err)
  //     res.status(500).send(err)
  //   }
  // },
}
