const { WebSocketServer, WebSocket } = require('ws');
require('dotenv').config();
const SibApiV3Sdk = require('sib-api-v3-sdk');
const cloudinary = require('cloudinary');
const { generateSlug } = require('random-word-slugs');
const somethingWentWrongMsg =
  'Something went wrong, please try again. If it fails again, please contact the developer.';
const cloneDeep = require('lodash/cloneDeep');
const {
  averageNumericValues,
  isMoreThanTwoHoursAgo,
} = require('./helperFunctions');

const {
  CLOUDINARY_SECRET,
  CLOUDINARY_KEY,
  CLOUDINARY_NAME,
  SEND_IN_BLUE_API_KEY,
  EMAIL_TARGET,
  TENOR_API_KEY,
} = process.env;
cloudinary.config({
  cloud_name: CLOUDINARY_NAME,
  api_key: CLOUDINARY_KEY,
  api_secret: CLOUDINARY_SECRET,
});

let gameRooms = {};
let clientsList = {};

function broadcastToRoom(gameRoomId, event_type, body = null) {
  try {
    //? arguments: target game room, event type, message
    const gameRoomCopy = cloneDeep(gameRooms?.[gameRoomId]);
    if (!gameRoomCopy) {
      return console.log(`🚀🚀🚀 game room ${gameRoomId} not found`);
    }
    gameRooms[gameRoomId].lastAction = Date.now();

    //? Loop through all clients in the game room and send the message
    Object.values?.(gameRoomCopy.players)?.forEach(({ token }) => {
      broadcastToPlayer(token, event_type, body || gameRoomCopy);
    });

    removeUnusedGameRooms();
  } catch (err) {
    console.error('🚀🚀🚀 Error broadcasting to room:', err);
  }
}

function broadcastToPlayer(playerToken, event_type, body = null) {
  try {
    //? arguments: target player token, event type, message
    const targetClient = clientsList?.[playerToken];
    if (!targetClient) {
      return console.log(`🚀🚀🚀 Player ${playerToken} not found`);
    }

    //? send the message
    if (targetClient && targetClient.readyState === WebSocket.OPEN) {
      const bodyObj = JSON.stringify({
        event_type,
        data: body,
      });
      targetClient.send(bodyObj);
    }
  } catch (err) {
    console.error(`🚀🚀🚀 Error broadcasting to player ${playerToken}: `, err);
  }
}

function removeUnusedGameRooms() {
  console.log(
    '🚀🚀🚀 NUMBER OF GAME ROOMS: ',
    Object.keys?.(gameRooms)?.length
  );
  //? remove game room if it's empty and hasn't been used in two hours
  // console.log('🚀 ~ removeUnusedGameRooms ~ gameRooms:', gameRooms);

  Object.values(gameRooms).forEach(({ gameRoomId, lastAction, players }) => {
    const playersInRoom = Object.keys?.(players)?.length;
    const isTwoHoursPast = isMoreThanTwoHoursAgo(lastAction);
    if (lastAction && isTwoHoursPast && playersInRoom < 1) {
      console.log('🚀🚀🚀 Removing unused game room:', gameRoomId);
      delete gameRooms[gameRoomId];
    }
  });
}

async function startSocketServer(app, port, host = 'localhost') {
  const isProd = process.env.NODE_ENV === 'production';
  const server = isProd ? app.listen(port) : app.listen(port, host);
  const wss = new WebSocketServer({ server });

  wss.on('listening', () => {
    console.log(
      `🚀🚀🚀 SERVER IS LISTENING ON ${isProd ? 'PORT' : host}:${port}`
    );
    setInterval(() => {
      wss.clients.forEach((client) => {
        client.ping();
      }, 5000);
    });
  });

  wss.on('connection', function connection(ws, req) {
    // Extract token from query parameters
    let token = null;
    let playerName = null;
    let gameId = null;
    let playerCardImage = null;
    let observerOnly = null;

    // Check if the URL contains a query parameter named 'token'
    if (req.url.includes('?')) {
      const queryParameters = req.url.split('?')[1];
      const urlParams = new URLSearchParams(queryParameters);
      token = urlParams.get('token');
      playerName = urlParams.get('player_name').trim();
      gameId = urlParams.get('game_id');
      observerOnly = urlParams.get('observer_only') === 'true';
      playerCardImage =
        urlParams.get('player_card_image') === 'null'
          ? null
          : urlParams.get('player_card_image');
    }

    console.log('🚀🚀🚀 new client connected: ', playerName);

    if (gameRooms[gameId]) {
      playerName = getPlayerNameForRoom({ token, playerName }, gameId);
    }

    // Attach the token to the WebSocket object
    ws.token = token;
    ws.playerName = playerName;
    ws.currentGameId = gameId;
    ws.currentCardChoice = null;
    ws.observerOnly = observerOnly;
    clientsList[token] = ws;

    if (gameRooms[gameId]) {
      // Add player to game room
      gameRooms[gameId].players[token] = {
        currentGameId: gameId,
        token,
        //! currentChoice: null,
        hasVoted: false,
        playerName,
        playerCardImage,
        observerOnly,
      };
      if (!gameRooms[gameId].gameSettings.playerPowers[token]) {
        //? add the player to the powers object, unless they are already there
        // const { playerPowers } = gameRooms[gameId].gameSettings
        gameRooms[gameId].gameSettings.playerPowers[token] = {
          powerLvl: gameRooms[gameId].gameSettings.defaultPlayerPower,
          playerName,
          showCustomCardImg: true,
          token,
        };
      }
      if (!gameRooms[gameId].gameSettings.playerPowers[token]?.playerName) {
        gameRooms[gameId].gameSettings.playerPowers[token].playerName =
          playerName;
      }

      const body = JSON.stringify({
        event_type: 'playerJoinedGame',
        data: gameRooms[gameId],
      });
      broadcastToRoom(gameId, 'gameUpdated');
      ws.send(body);
    } else {
      ws.send(JSON.stringify({ event_type: 'gameNotFound' }));
      console.log('🚀🚀🚀 game room not found at socket join, aborting join');
    }

    try {
      ws.on('error', console.error);

      //! MESSAGES HANDLERS
      ws.on('message', async function message(data, isBinary) {
        const dataBody = JSON.parse(data);
        const { body, gameId, token } = dataBody || {};
        const { reqType } = body || {};
        const { type, timeStamp } = reqType || {};

        if (
          typeof gameRooms[gameId]?.players === 'object' &&
          !Object.keys(gameRooms[gameId]?.players).includes(token)
        ) {
          broadcastToPlayer(token, 'notInGameRoom');
          return console.error(
            `player can't do things, they aren't in the game room.`
          );
        }

        //^ spacer -----------------------------------
        try {
          if (type === 'updatedCardChoice') {
            if (!gameRooms[gameId]) {
              return console.error(
                'game room not found (updatedCardChoice) function'
              );
            }
            if (!gameRooms[gameId].players[token]) {
              return console.error(
                'player not found (updatedCardChoice) function'
              );
            }

            if (timeStamp <= gameRooms[gameId].players[token]?.lastChoiceTime) {
              return;
            }

            clientsList[token].currentCardChoice = body.card;
            gameRooms[gameId].players[token].hasVoted = body.card !== null;
            gameRooms[gameId].players[token].lastChoiceTime = timeStamp;
            broadcastToPlayer(token, 'cardChoicePrivateResponse', {
              card: clientsList?.[token]?.currentCardChoice,
            });
            return broadcastToRoom(gameId, 'gameUpdated');
          }
          //^ spacer -----------------------------------
          else if (type === 'playerLeaveGame') {
            if (!gameRooms[gameId])
              return console.error(
                'game room not found (playerLeaveGame) function'
              );
            delete gameRooms[gameId].players[token];
            console.log(
              '🚀🚀🚀 gameRooms[gameId].players after leave: ',
              gameRooms[gameId].players
            );
          }
          //^ spacer -----------------------------------
          else if (type === 'updateGameState') {
            if (!gameRooms[gameId])
              return console.error(
                'game room not found (updateGameState) function'
              );
            if (body.gameState === 'voting') {
              Object.values?.(gameRooms?.[gameId]?.players)?.forEach(
                (player) => {
                  clientsList[player.token].currentCardChoice = null;
                  player.hasVoted = false;
                }
              );
              gameRooms[gameId].gameSettings.currentIssueName = null;
            } else if (body.gameState === 'reveal') {
              const votingObj = {
                issueName: gameRooms[gameId].gameSettings.currentIssueName,
                voteTime: Date.now(),
                agreement: null,
                votes: [],
                isAnonymousVote:
                  !!gameRooms?.[gameId]?.gameSettings?.anonymousMode,
                average: null,
                participation: '',
              };

              //? place each player's vote into the cardCounts object
              const activePlayers = Object.values?.(
                gameRooms?.[gameId]?.players
              ).filter((p) => !p.observerOnly);

              activePlayers?.forEach((player) => {
                const vote = {
                  card: clientsList[player.token].currentCardChoice,
                  voteId: votingObj.votes.length + 1,
                };
                if (!votingObj.isAnonymousVote) {
                  vote.playerName = player.playerName;
                }
                votingObj.votes.push(vote);
              });

              //? calculate how many people had votes that are not null out of the total number of people in the voting
              const validVotes = votingObj.votes.filter(
                (vote) => vote.card
              ).length;

              const possibleVotes = activePlayers.length;

              votingObj.participation = `${validVotes}/${possibleVotes}`;

              //? calculate the average
              votingObj.average = averageNumericValues(votingObj.votes);

              //? calculate the agreement, which is calculated by taking the highest number of equal votes, and dividing it by the total number of votes that are not falsy
              const cardCounts = {};
              votingObj.votes.forEach(({ card }) => {
                if (cardCounts[card]) {
                  cardCounts[card]++;
                } else if (card) {
                  cardCounts[card] = 1;
                }
              });
              const highestCount = Math.max(...Object.values(cardCounts));
              const totalVotes = votingObj.votes.filter(
                ({ card }) => card !== null
              ).length;
              votingObj.agreement =
                highestCount < 2 && totalVotes > 1
                  ? 0
                  : highestCount / totalVotes;

              //? push the voting object into the game vote history
              gameRooms[gameId].voteHistory.push(votingObj);
            }
            gameRooms[gameId].gameSettings.gameState = body.gameState;
            broadcastToRoom(gameId, 'gameUpdated');
            broadcastToRoom(gameId, 'resetCardChoices', {
              message: 'reset local card choice to null for new round',
            });
          }
          //^ spacer -----------------------------------
          else if (type === 'updatedDeck') {
            if (!gameRooms[gameId]) {
              return console.error(
                'game room not found (updatedDeck) function'
              );
            }
            gameRooms[gameId].gameSettings.deck = body.deck;
            broadcastToRoom(gameId, 'gameUpdated');
          }
          //^ spacer -----------------------------------
          else if (type === 'updatedGameName') {
            if (!gameRooms[gameId])
              return console.error(
                'game room not found (updatedGameName) function'
              );
            gameRooms[gameId].gameSettings.gameRoomName = body.name;
            broadcastToRoom(gameId, 'gameUpdated');
          }
          //^ spacer -----------------------------------
          else if (type === 'updateProfile') {
            if (!gameRooms[gameId]) {
              return console.error(
                'game room not found (updateProfile) function'
              );
            }
            const { playerCardImage, playerName, observerOnly } = body;
            if (playerCardImage || playerCardImage === '') {
              gameRooms[gameId].players[token].playerCardImage =
                playerCardImage;
            }
            if (observerOnly) {
              clientsList[token].currentCardChoice = null;
              gameRooms[gameId].players[token].hasVoted = false;
              broadcastToPlayer(token, 'cardChoicePrivateResponse', {
                card: clientsList?.[token]?.currentCardChoice,
              });
            }
            gameRooms[gameId].players[token].observerOnly = observerOnly;
            if (
              playerName !==
                gameRooms?.[gameId]?.players?.[token]?.playerName &&
              playerName?.trim()?.length < 13
            ) {
              const newName = getPlayerNameForRoom(
                {
                  playerName,
                  token,
                },
                gameId
              );
              gameRooms[gameId].players[token].playerName = newName;
              gameRooms[gameId].gameSettings.playerPowers[token].playerName =
                newName;
            }
            broadcastToRoom(gameId, 'gameUpdated');
          }
          //^ spacer -----------------------------------
          else if (type === 'setIssueName') {
            if (!gameRooms[gameId])
              return console.loerrorg(
                'game room not found (setIssueName) function'
              );
            gameRooms[gameId].gameSettings.currentIssueName = body.issueName;
            broadcastToRoom(gameId, 'gameUpdated');
          }
          //^ spacer -----------------------------------
          else if (type === 'updatedGameSettings') {
            if (!gameRooms[gameId]) {
              return console.error(
                'game room not found (updatedGameSettings) function'
              );
            }
            //? check if the deck has changed. If so, reset player card choices
            const oldDeck = gameRooms[gameId].gameSettings.deck;
            const newDeck = body.gameSettingsToSave.deck;
            if (oldDeck.values !== newDeck.values) {
              Object.keys(clientsList).forEach((token) => {
                if (clientsList?.[token]?.currentCardChoice) {
                  clientsList[token].currentCardChoice = null;
                }
                if (gameRooms?.[gameId]?.players?.[token]?.hasVoted) {
                  gameRooms[gameId].players[token].hasVoted = false;
                }
              });
              broadcastToRoom(gameId, 'resetCardChoices', {
                message: 'reset local card choice to null for new deck',
              });
            }
            //? update gameRoom with new settings
            gameRooms[gameId].gameSettings = body.gameSettingsToSave;
            addChatToList(gameId, { type: 'settingsUpdate', token, ...body });
            broadcastToRoom(gameId, 'gameUpdated');
          }
          //^ spacer -----------------------------------
          else if (type === 'kickPlayer') {
            if (!gameRooms[gameId])
              return console.error('game room not found (kickPlayer) function');
            body.playerTokens.forEach((playerToken) => {
              delete gameRooms[gameId].players[playerToken];
              broadcastToPlayer(playerToken, 'kickedFromGame');
            });
            broadcastToRoom(gameId, 'gameUpdated');
          }
          //^ spacer -----------------------------------
          else if (type === 'newChatMessage') {
            if (!gameRooms[gameId]) {
              return console.error(
                'game room not found (newChatMessage) function'
              );
            }

            addChatToList(gameId, body);
            broadcastToRoom(gameId, 'gameUpdated');
          }
          //^ spacer -----------------------------------
          else if (type === 'funEmojiThrow') {
            if (!gameRooms[gameId]) {
              return console.error(
                'game room not found (funEmojiThrow) function'
              );
            }
            if (!gameRooms[gameId]?.gameSettings?.funModeEnabled) {
              return;
            }
            const { emoji, targetPlayerId, fromSide } = body || {};
            if (!emoji || !targetPlayerId) {
              return;
            }
            const normalizedSide =
              fromSide === 'left' || fromSide === 'right' ? fromSide : null;
            broadcastToRoom(gameId, 'funEmojiThrow', {
              emoji,
              targetPlayerId,
              fromSide: normalizedSide,
            });
          }
        } catch (error) {
          console.error('Error in gameRoomController:', error);
        }
      });
      //! END MESSAGES HANLDERS

      ws.on('close', function () {
        // remove user from gameroom
        const { token, playerName, currentGameId } = ws;
        console.log(`🚀🚀🚀 ${playerName} DISCONNECTING`);
        if (gameRooms[currentGameId]?.players[token]) {
          console.log(`🚀🚀🚀 removing ${playerName} from game room`);
          delete gameRooms[currentGameId].players[token];
        } else {
          console.log(`🚀🚀🚀 client ${playerName} not found in game room`);
        }
        delete clientsList[token];
        broadcastToRoom(currentGameId, 'gameUpdated');
      });
    } catch (err) {
      console.error(err);
    }
  });
}

function addChatToList(gameId, body) {
  let bodyObj = {};
  if (body?.type === 'settingsUpdate') {
    bodyObj.sendTime = Date.now();
    bodyObj.message = 'update';
    bodyObj.senderName = gameRooms[gameId]?.players?.[body?.token]?.playerName;
    bodyObj.senderPhoto = null;
    bodyObj.type = body.type;
    body = bodyObj;
  }

  if (!body.message || !body.type || !body.senderName || !body.sendTime) {
    return console.error('Missing keys in chat object!');
  }

  body.chatNumber = gameRooms[gameId]?.chatMessages[0]?.chatNumber + 1 || 1;
  if (gameRooms[gameId].chatMessages.length >= 50) {
    //? delete the oldest message if there are at least 50 messages
    gameRooms[gameId].chatMessages.shift();
  }
  gameRooms[gameId].chatMessages = [body, ...gameRooms[gameId].chatMessages];
}

function getPlayerNameForRoom(player, gameId) {
  const { token, playerName } = player;
  const players = Object.values(gameRooms[gameId].players);
  const nameUnavailable = players.some(
    (p) => p.playerName === playerName && p.token !== token
  );

  if (nameUnavailable) {
    let i = 1;
    let newName = `${playerName}(${i})`;
    while (players.some((p) => p.playerName === newName && p.token !== token)) {
      i++;
      newName = `${playerName}(${i})`;
    }
    return newName;
  } else {
    return playerName;
  }
}

module.exports = {
  broadcastToRoom,
  gameRooms,
  startSocketServer,

  extractToken: async (req, res, next) => {
    try {
      const localToken = req.headers.authorization;
      if (!localToken) {
        return res.status(401).send('Where is your access token bro?');
      }
      req.body.localUserToken = localToken;
      next();
    } catch (err) {
      console.error(err);
      res.status(500).send(somethingWentWrongMsg);
    }
  },

  createNewGame: async (req, res) => {
    const { gameName, deck, gameHost } = req.body;
    try {
      function getRandomWords() {
        // use the random-word-slugs package to generate a random game id, and make sure it doesnt already exist
        let randomId = generateSlug();
        while (Object.keys(gameRooms).includes(randomId)) {
          randomId = generateSlug();
        }
        return randomId;
      }
      const gameId = getRandomWords();
      if (!gameName || !gameId)
        return res.status(500).send('missing gameName or gameId');
      gameRooms[gameId] = {
        gameRoomId: gameId,
        gameSettings: {
          gameRoomName: gameName,
          deck,
          woodTable: false,
          showShadows: true,
          gameState: 'voting',
          showAgreement: true,
          showAverage: true,
          anonymousMode: false,
          funModeEnabled: false,
          defaultPlayerPower: 'low',
          revealPowerReq: 'low',
          playerPowers: {
            [gameHost]: {
              powerLvl: 'owner',
              playerName: '',
              showCustomCardImg: true,
              token: gameHost,
            },
          },
        },
        currentIssueName: '',
        lastAction: Date.now(),
        voteHistory: [],
        chatMessages: [],
        players: {},
        tenorApi: TENOR_API_KEY,
      };
      res.send(gameRooms[gameId]);
    } catch (err) {
      console.error(err);
      res.status(500).send(somethingWentWrongMsg);
    }
  },

  uploadCloudinaryImage: async (req, res) => {
    const { image, localUserToken } = req.body;
    try {
      cloudinary.v2.uploader.upload(
        image,
        { public_id: localUserToken, overwrite: true },
        function (error, result) {
          if (error) {
            console.error(error);
            res.status(500).send(somethingWentWrongMsg);
          } else {
            res.send(result.url);
          }
        }
      );
    } catch (err) {
      console.error(err);
      res.status(500).send(somethingWentWrongMsg);
    }
  },

  deleteCloudinaryImage: async (req, res) => {
    const { localUserToken } = req.body;
    try {
      cloudinary.v2.uploader.destroy(
        localUserToken,
        function (deleteError, deleteResult) {
          if (deleteError) {
            console.error(deleteError);
            res.status(500).send(deleteError);
          } else {
            res.send(deleteResult);
          }
        }
      );
    } catch (err) {
      console.error(err);
      res.status(500).send(somethingWentWrongMsg);
    }
  },

  emailDev: async (req, res) => {
    const { name, contact, message, localUserToken } = req.body;
    try {
      SibApiV3Sdk.ApiClient.instance.authentications['api-key'].apiKey =
        SEND_IN_BLUE_API_KEY;

      new SibApiV3Sdk.TransactionalEmailsApi()
        .sendTransacEmail({
          subject: `NEW MESSAGE FROM POKERFACE USER (${name})!`,
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
            return res.status(200).send(data);
          },
          function (error) {
            console.error(error);
            return res.status(500).send(somethingWentWrongMsg);
          }
        );
    } catch (err) {
      console.error(err);
      res.status(500).send(somethingWentWrongMsg);
    }
  },
};
