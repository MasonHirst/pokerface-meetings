const { WebSocketServer, WebSocket } = require('ws')
const { v4: uuidv4, validate: validateUUID } = require('uuid')
require('dotenv').config()
const SibApiV3Sdk = require('sib-api-v3-sdk')
const cloudinary = require('cloudinary')

const {
  CLOUDINARY_SECRET,
  CLOUDINARY_KEY,
  CLOUDINARY_NAME,
  SEND_IN_BLUE_API_KEY,
  EMAIL_TARGET,
} = process.env
cloudinary.config({
  cloud_name: CLOUDINARY_NAME,
  api_key: CLOUDINARY_KEY,
  api_secret: CLOUDINARY_SECRET,
})

let gameRooms = {}
let clientsList = {}

function broadcastToRoom(gameRoomId, event_type) {
  // console.log('game rooms status: ', gameRooms)
  console.log('NUMBER OF GAME ROOMS: ', Object.keys(gameRooms).length)
  // arguments: target game room, event type, message
  const gameRoom = gameRooms[gameRoomId]
  if (!gameRoom) return console.log(`game room ${gameRoomId} not found`)
  gameRooms[gameRoomId].lastAction = Date.now()

  // Loop through all clients in the game room and send the message
  Object.values(gameRoom.players).forEach((playerObj) => {
    const client = clientsList[playerObj.token]
    if (client && client.readyState === WebSocket.OPEN) {
      const body = JSON.stringify({ event_type, game: gameRoom })
      client.send(body)
    }
  })

  removeUnusedGameRooms()
}

function broadCastToClient(PlayerToken, event_type) {
  const client = clientsList[PlayerToken]
  if (client && client.readyState === WebSocket.OPEN) {
    const body = JSON.stringify({ event_type })
    client.send(body)
  }
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

    if (gameRooms[gameId]) {
      // console.log('gameRooms at player join.......: ', gameRooms[gameId].gameSettings.playerPowers)
      gameRooms[gameId].players[token] = {
        currentGameId: gameId,
        token,
        currentChoice: null,
        playerName,
        playerCardImage,
      }
      if (!gameRooms[gameId].gameSettings.playerPowers[token]) {
        // add the player to the powers object, unless they are already there
        // const { playerPowers } = gameRooms[gameId].gameSettings
        gameRooms[gameId].gameSettings.playerPowers[token] = {
          powerLvl: gameRooms[gameId].gameSettings.defaultPlayerPower,
          playerName,
        }
      }
      if (!gameRooms[gameId].gameSettings.playerPowers[token].playerName) {
        gameRooms[gameId].gameSettings.playerPowers[token].playerName = playerName
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
        const { type, body, gameId, token } = dataBody

        if (type === 'updatedChoice') {
          if (!gameRooms[gameId])
            return console.error('game room not found (updatedChoice) function')
          if (!gameRooms[gameId].players[token])
            return console.error('player not found (updatedChoice) function')
          if (gameRooms[gameId].players[token].currentChoice === body.card) {
            gameRooms[gameId].players[token].currentChoice = null
            return broadcastToRoom(gameId, 'gameUpdated')
          }
          gameRooms[gameId].players[token].currentChoice = body.card
          broadcastToRoom(gameId, 'gameUpdated')
        }
        // spacer
        else if (type === 'playerLeaveGame') {
          if (!gameRooms[gameId])
            return console.error('game room not found (playerLeaveGame) function')
          delete gameRooms[gameId].players[token]
          console.log(
            'gameRooms[gameId].players after leave: ',
            gameRooms[gameId].players
          )
        }
        // spacer
        else if (type === 'updateGameState') {
          if (!gameRooms[gameId])
            return console.error('game room not found (updateGameState) function')
          if (body.gameState === 'voting') {
            Object.values(gameRooms[gameId].players).forEach((player) => {
              player.currentChoice = null
            })
            gameRooms[gameId].gameSettings.currentIssueName = null
          }
          if (body.gameState === 'reveal') {
            const votingObj = {
              issueName: gameRooms[gameId].gameSettings.currentIssueName,
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
            const possibleVotes = Object.values(
              gameRooms[gameId].players
            ).length
            votingObj.participation = `${validVotes}/${possibleVotes}`

            // calculate the average
            votingObj.average = averageNumericValues(
              Object.values(votingObj.playerVotes)
            )

            // calculate the agreement, which is calculated by taking the highest number of equal votes, and dividing it by the total number of votes that are not falsy
            const cardCounts = {}
            Object.values(votingObj.playerVotes).forEach((vote) => {
              if (cardCounts[vote]) cardCounts[vote]++
              else if (vote) cardCounts[vote] = 1
            })
            const highestCount = Math.max(...Object.values(cardCounts))
            const totalVotes = Object.values(votingObj.playerVotes).filter(
              (vote) => vote !== null
            ).length
            votingObj.agreement =
              highestCount < 2 && totalVotes > 1 ? 0 : highestCount / totalVotes

            //push the voting object into the game vote history
            gameRooms[gameId].voteHistory.push(votingObj)
          }
          gameRooms[gameId].gameSettings.gameState = body.gameState
          broadcastToRoom(gameId, 'gameUpdated')
        }
        // spacer
        else if (type === 'playerLeaveGame') {
          if (!gameRooms[gameId])
            return console.error('game room not found (playerLeaveGame) function')
          delete gameRooms[gameId].players[token]
          console.log('Removed player from game')
          broadcastToRoom(gameId, 'gameUpdated')
        }
        // spacer
        else if (type === 'updatedDeck') {
          if (!gameRooms[gameId])
            return console.error('game room not found (updatedDeck) function')
          gameRooms[gameId].gameSettings.deck = body.deck
          broadcastToRoom(gameId, 'gameUpdated')
        }
        // spacer
        else if (type === 'updatedGameName') {
          if (!gameRooms[gameId])
            return console.error('game room not found (updatedGameName) function')
          gameRooms[gameId].gameSettings.gameRoomName = body.name
          broadcastToRoom(gameId, 'gameUpdated')
        }
        // spacer
        else if (type === 'updateProfile') {
          if (!gameRooms[gameId])
            return console.error('game room not found (updateProfile) function')
          const { playerCardImage, name } = body
          if (playerCardImage || playerCardImage === '')
            gameRooms[gameId].players[token].playerCardImage = playerCardImage
          if (name) {
            gameRooms[gameId].players[token].playerName = body.name
            gameRooms[gameId].gameSettings.playerPowers[token].playerName = body.name
          }
          broadcastToRoom(gameId, 'gameUpdated')
        }
        // spacer
        else if (type === 'setIssueName') {
          if (!gameRooms[gameId])
            return console.loerrorg('game room not found (setIssueName) function')
          console.log('-----------------', body.issueName)
          gameRooms[gameId].gameSettings.currentIssueName = body.issueName
          broadcastToRoom(gameId, 'gameUpdated')
        }
        // spacer
        else if (type === 'updatedGameSettings') {
          if (!gameRooms[gameId])
            return console.error(
              'game room not found (updatedGameSettings) function'
            )
          gameRooms[gameId].gameSettings = body.gameSettingsToSave
          broadcastToRoom(gameId, 'gameUpdated')
        }
        // spacer
        else if (type === 'kickPlayer') {
          if (!gameRooms[gameId])
            return console.error('game room not found (kickPlayer) function')
          body.playerTokens.forEach((token) => {
            delete gameRooms[gameId].players[token]
            broadCastToClient(token, 'kickedFromGame')
          })
          broadcastToRoom(gameId, 'gameUpdated')
        }
        // spacer
        else if (type === 'newChatMessage') {
          if (!gameRooms[gameId])
            return console.error('game room not found (newChatMessage) function')

          console.log('new chat message: ', body)
          if (gameRooms[gameId].chatMessages.length >= 30) {
            // delete the oldest message if there are at least 30 messages
            gameRooms[gameId].chatMessages.shift()
          }
          gameRooms[gameId].chatMessages.push(body)
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
    const { gameName, deck, gameHost } = req.body
    try {
      const gameId = uuidv4()
      if (!gameName || !gameId)
        return res.status(500).send('missing gameName or gameId')
      gameRooms[gameId] = {
        gameRoomId: gameId,
        gameSettings: {
          gameRoomName: gameName,
          deck,
          woodTable: false,
          gameState: 'voting',
          showAgreement: true,
          showAverage: true,
          useWoodTable: false,
          funMode: true,
          defaultPlayerPower: 'low',
          playerPowers: {
            [gameHost]: { powerLvl: 'owner', playerName: '' },
          },
        },
        currentIssueName: '',
        lastAction: Date.now(),
        voteHistory: [],
        chatMessages: [],
        players: {},
      }
      res.send(gameRooms[gameId])
      // console.log('game created: ', gameRooms[gameId])
    } catch (err) {
      console.error(err)
      res.status(500).send(err)
    }
  },

  updateGameState: async (req, res) => {
    const { gameState, gameId, localUserToken } = req.body
    console.log(
      'THE UPDATE STATE FUNCTION IS BEING USED YAYAYAYAY--------------------------------'
    )
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
      gameRooms[gameId].gameSettings.gameState = gameState
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
            res.send(deleteResult)
          }
        }
      )
    } catch (err) {
      console.error(err)
      res.status(500).send(err)
    }
  },

  emailDev: async (req, res) => {
    const { name, contact, message, localUserToken } = req.body
    try {
      SibApiV3Sdk.ApiClient.instance.authentications['api-key'].apiKey =
        SEND_IN_BLUE_API_KEY

      new SibApiV3Sdk.TransactionalEmailsApi()
        .sendTransacEmail({
          subject: 'NEW MESSAGE FROM POKERFACE USER!',
          sender: {
            email: 'contact@pokerface.app',
            name: 'Pokerface App',
          },
          replyTo: {
            email: contact || 'mhirstdev@gmail.com',
          },
          to: [{ name: 'Cool Developer', email: EMAIL_TARGET }],
          htmlContent: `<html>
                          <body>
                            <h1>New message from Pokerface user ${localUserToken}</h1>
                            <h2>Name: <span style="font-size: 17px;">${
                              name ? name : 'not provided'
                            }</span></h2>
                            <h2>Contact: <span style="font-size: 17px;">${
                              contact ? contact : 'not provided'
                            }</span></h2>
                            <h2>Message:</h2>
                            <p style="font-size: 16px;">${message}</p>
                          </body>
                        </html>`,
        })
        .then(
          function (data) {
            return res.status(200).send(data)
          },
          function (error) {
            console.error(error)
            return res.status(500).send(error)
          }
        )
    } catch (err) {
      console.error(err)
      res.status(500).send(err)
    }
  },
}
