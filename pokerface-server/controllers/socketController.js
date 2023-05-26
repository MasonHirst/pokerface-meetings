const { WebSocketServer, WebSocket } = require('ws')
const { v4: uuidv4, validate: validateUUID } = require('uuid')
require('dotenv').config()
const cloudinary = require('cloudinary')

const { CLOUDINARY_SECRET, CLOUDINARY_KEY, CLOUDINARY_NAME } = process.env
cloudinary.config({
  cloud_name: CLOUDINARY_NAME,
  api_key: CLOUDINARY_KEY,
  api_secret: CLOUDINARY_SECRET,
})

let gameRooms = {}
let clientsList = {}

function broadcastToRoom(gameRoomId, event_type) {
  console.log('game rooms status: ', gameRooms)
  console.log('NUMBER OF GAME ROOMS: ', Object.keys(gameRooms).length)
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

function averageNumericValues(arr) {
  console.log(arr)
  let sum = 0
  let count = 0
  for (let val of arr) {
    if (!isNaN(Number(val)) && val) {
      sum += +val
      count++
    }
  }
  if (count === 0) {
    return null // or whatever value you want to return if there are no numeric values
  }
  const average = sum / count
  return parseFloat(average.toFixed(1))
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
      }, 5000)
    })
  })

  wss.on('connection', function connection(ws, req) {
    console.log('new client connected')
    // Extract token from query parameters
    let token = null
    let playerName = null
    let gameId = null
    let playerCardImage = null

    // Check if the URL contains a query parameter named 'token'
    if (req.url.includes('?')) {
      const queryParameters = req.url.split('?')[1]
      const urlParams = new URLSearchParams(queryParameters)
      token = urlParams.get('token')
      playerName = urlParams.get('player_name').trim()
      gameId = urlParams.get('game_id')
      playerCardImage =
        urlParams.get('player_card_image') === 'null'
          ? null
          : urlParams.get('player_card_image')
    }

    // check if any players in the game room have the same name, and if they do, append a number to the end of the name
    if (gameRooms[gameId]) {
      const playerNames = Object.values(gameRooms[gameId].players).map(
        (player) => player.playerName
      )
      if (playerNames.includes(playerName)) {
        let i = 1
        while (playerNames.includes(`${playerName}(${i})`)) {
          i++
        }
        playerName = `${playerName}(${i})`
      }
    }

    // Attach the token to the WebSocket object
    ws.token = token
    ws.playerName = playerName
    ws.currentGameId = gameId
    clientsList[token] = ws

    console.log('gameRooms at player join.......: ', gameRooms)
    if (gameRooms[gameId]) {
      gameRooms[gameId].players[token] = {
        currentGameId: gameId,
        token,
        currentChoice: null,
        playerName,
        playerCardImage,
      }
      const body = JSON.stringify({
        event_type: 'playerJoinedGame',
        game: gameRooms[gameId],
      })
      broadcastToRoom(gameId, 'gameUpdated')
      ws.send(body)
    } else {
      ws.send(JSON.stringify({ event_type: 'gameNotFound' }))
      console.log('game room not found at socket join, aborting join')
    }

    try {
      ws.on('error', console.error)

      //! MESSAGES HANDLERS
      ws.on('message', async function message(data, isBinary) {
        const dataBody = JSON.parse(data)
        // console.log('new message recieved: ', dataBody)
        const { type, body, gameId, token } = dataBody

        if (type === 'updatedChoice') {
          if (!gameRooms[gameId]) return console.log('game room not found (updatedChoice) function')
          if (!gameRooms[gameId].players[token]) return console.log('player not found (updatedChoice) function')
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
            console.log('body: ', body)
            const votingObj = {
              issueName: gameRooms[gameId].currentIssueName,
              voteTime: Date.now(),
              agreement: null,
              playerVotes: {},
              average: null,
              participation: '',
            }

            // place each player's vote into the cardCounts object
            Object.values(gameRooms[gameId].players).forEach((player) => {
              votingObj.playerVotes[player.playerName] = player.currentChoice
            })

            // calculate how many people had votes that are not null out of the total number of people in the voting
            const validVotes = Object.values(votingObj.playerVotes).filter(
              (vote) => vote
            ).length
            const possibleVotes = Object.values(gameRooms[gameId].players).length
            votingObj.participation = `${validVotes}/${possibleVotes}`

            // calculate the average
            votingObj.average = averageNumericValues(
              Object.values(votingObj.playerVotes)
            )

            // calculate the agreement, which is calculated by taking the highest number of equal votes, and dividing it by the total number of votes that are not falsy
            const cardCounts = {}
            Object.values(votingObj.playerVotes).forEach((vote) => {
              if (cardCounts[vote]) cardCounts[vote]++
              else cardCounts[vote] = 1
            })
            const highestCount = Math.max(...Object.values(cardCounts))
            const totalVotes = Object.values(votingObj.playerVotes).filter(
              (vote) => vote
            ).length
            console.log('highestCount: ', highestCount, totalVotes)
            console.log(highestCount < 2 && totalVotes > 1)
            votingObj.agreement = highestCount < 2 && totalVotes > 1 ? 0 : highestCount / totalVotes

            //push the voting object into the game vote history
            gameRooms[gameId].voteHistory.push(votingObj)
          }
          gameRooms[gameId].gameState = body.gameState
          broadcastToRoom(gameId, 'gameUpdated')
        } else if (type === 'playerLeaveGame') {
          if (!gameRooms[gameId])
            return console.log('game room not found (playerLeaveGame) function')
          delete gameRooms[gameId].players[token]
          console.log('Removed player from game')
          broadcastToRoom(gameId, 'gameUpdated')
        } else if (type === 'updatedDeck') {
          if (!gameRooms[gameId])
            return console.log('game room not found (updatedDeck) function')
          gameRooms[gameId].deck = body.deck
          broadcastToRoom(gameId, 'gameUpdated')
        } else if (type === 'updatedGameName') {
          if (!gameRooms[gameId])
            return console.log('game room not found (updatedGameName) function')
          gameRooms[gameId].gameRoomName = body.name
          broadcastToRoom(gameId, 'gameUpdated')
        } else if (type === 'updateProfile') {
          if (!gameRooms[gameId])
            return console.log('game room not found (updateProfile) function')
          const { playerCardImage, name } = body
          if (playerCardImage || playerCardImage === '')
            gameRooms[gameId].players[token].playerCardImage = playerCardImage
          if (name) gameRooms[gameId].players[token].playerName = body.name
          broadcastToRoom(gameId, 'gameUpdated')
        }
      })
      //! END MESSAGES HANLDERS

      ws.on('close', function () {
        // remove user from gameroom
        const { token, playerName, currentGameId } = ws
        console.log(`${playerName} DISCONNECTING`)
        if (gameRooms[currentGameId]?.players[token]) {
          console.log(`removing ${playerName} from game room`)
          delete gameRooms[currentGameId].players[token]
        } else {
          console.log(`client ${playerName} not found in game room`)
        }
        delete clientsList[token]
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
        voteHistory: [],
        deck,
        players: {},
      }
      res.send(gameRooms[gameId])
      console.log('game created: ', gameRooms[gameId])
      console.log('gameId at creation: ', gameId)
    } catch (err) {
      console.error(err)
      res.status(500).send(err)
    }
  },

  updateGameState: async (req, res) => {
    const { gameState, gameId, localUserToken } = req.body
    console.log('THE UPDATE STATE FUNCTION IS BEING USED YAYAYAYAY')
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
        gameRooms[gameId].voteHistory.push(cardCounts)
      }
      gameRooms[gameId].gameState = gameState
      broadcastToRoom(gameId, localUserToken, 'gameUpdated')
      res.send(gameRooms[gameId])
    } catch (err) {
      console.error(err)
      res.status(500).send(err)
    }
  },

  uploadCloudinaryImage: async (req, res) => {
    const { image, localUserToken } = req.body

    try {
      cloudinary.v2.uploader.upload(
        image,
        { public_id: localUserToken, overwrite: true },
        function (error, result) {
          if (error) {
            console.error(error)
            res.status(500).send(error)
          } else {
            console.log(result)
            res.send(result.url)
          }
        }
      )
    } catch (err) {
      console.error(err)
      res.status(500).send(err)
    }
  },

  deleteCloudinaryImage: async (req, res) => {
    const { localUserToken } = req.body
    try {
      cloudinary.v2.uploader.destroy(
        localUserToken,
        function (deleteError, deleteResult) {
          if (deleteError) {
            console.error(deleteError)
            res.status(500).send(deleteError)
          } else {
            console.log(deleteResult)
            res.send(deleteResult)
          }
        }
      )
    } catch (err) {
      console.error(err)
      res.status(500).send(err)
    }
  },
}
