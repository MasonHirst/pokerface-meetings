const {
  sendMessageToGameRoom,
  gameRooms,
  clientsList,
} = require('./socketController')

module.exports = {
  createNewGame: async (req, res) => {
    const { gameName, gameId } = req.body
    try {
      if (!gameName || !gameId)
        return res.status(403).send('missing gameName or gameId')
      gameRooms[gameId] = { gameRoomName: gameName, }
      res.send(gameRooms[gameId])
    } catch (err) {
      console.error(err)
      res.status(403).send(err)
    }
  },

  playerJoinGame: async (req, res) => {
    const { localUserToken, gameId, } = req.body
    try {
      const joiningPlayerObj = {
        localUserToken,
        playerName: null,
        currentChoice: null,
        isSpectator: false,
        currentGameId: gameId,
      }
      gameRooms[gameId][localUserToken] = joiningPlayerObj
      console.log('gameRooms: ', gameRooms)
      clientsList[localUserToken] = joiningPlayerObj
    } catch (err) {
      console.error(err)
      res.status(403).send(err)
    }
  },

  setPlayerName: async (req, res) => {
    const { localUserToken, name, gameId } = req.body
    try {
      gameRooms[gameId][localUserToken].playerName = name
      res.send(`player name set to ${name}`)

    } catch (err) {
      console.error(err)
      res.status(403).send(err)
    }
  },

  leaveGame: async (req, res) => {
    const { localUserToken, gameId } = req.body
    try {
      delete gameRooms[gameId][localUserToken]
      console.log('gameRoom size: ', gameRooms[gameId].size)
      res.send(`player removed from game ${gameId}`)
    } catch (err) {
      console.error(err)
      res.status(403).send(err)
    }
  },
}
