import React, { createContext, useState, useEffect, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import spidermanCrying from '../assets/spiderman-crying.gif';
import Swal from 'sweetalert2';
import 'sweetalert2/dist/sweetalert2.css';
import { toast } from 'react-toastify';
import { eventBus } from '../utils/eventBus';
import { isTrueOrFalse } from '../utils/helperFunctions';

export const GameContext = createContext();

export const GameProvider = ({ children }) => {
  if (
    localStorage.getItem('PokerfacePlayerName') &&
    localStorage.getItem('PokerfacePlayerName').length > 12
  ) {
    localStorage.removeItem('PokerfacePlayerName');
  }
  const [playerName, setPlayerName] = useState(
    localStorage.getItem('PokerfacePlayerName')
  );
  const clientToken = localStorage.getItem('PokerfaceLocalUserToken');
  const [appIsLoading, setAppIsLoading] = useState(false);
  const [socket, setSocket] = useState(null);
  const navigate = useNavigate();
  let activeSocket = true;
  function toggleActiveSocket(state) {
    activeSocket = state;
  }
  const [gameData, setGameData] = useState({});
  const [gameExists, setGameExists] = useState(false);
  const [joinGameLoading, setJoinGameLoading] = useState(false);
  const [iHaveBeenKicked, setIHaveBeenKicked] = useState(false);
  const { game_id } = useParams();
  let iAmKicked = false;
  //? The reason these are useState instead of useMemo is so that I can compare
  //? incoming values to these values before updating them.
  const [myPowerLvl, setMyPowerLvl] = useState('');
  const [currentCardChoice, setCurrentCardChoice] = useState(null);
  const [isAnonymousMode, setIsAnonymousMode] = useState(null);
  const [gameDeck, setGameDeck] = useState(null);
  const [iCanShowCustomCardImg, setICanShowCustomCardImg] = useState(null);

  const kickedGames = JSON.parse(sessionStorage.getItem('kickedGames'));
  if (kickedGames && kickedGames.includes(game_id)) {
    iAmKicked = true;
  }

  function triggerLatestUpdatesMessage() {
    Swal.fire({
      title: 'New updates!',
      html: `
        <ul style="text-align: left;">
          <li>- Anonymous mode (settings)</li>
          <li>- Observer mode (profile settings)</li>
          <li>- Custom decks can now be created with up to 30 characters per card</li>
        </ul>
      `,
      icon: 'info',
      confirmButtonText: 'Got it',
      customClass: {
        popup: 'swal2-popup',
      },
    });
    localStorage.setItem('PokerfaceShownLatestUpdatesMessage', 'true');
  }

  useEffect(() => {
    //? This useEffect should show the new updates message only
    //? if the user has not seen the message yet on their browswer
    const haveShowedLatestUpdatesMessage = localStorage.getItem(
      'PokerfaceShownLatestUpdatesMessage'
    );
    if (!haveShowedLatestUpdatesMessage) {
      triggerLatestUpdatesMessage();
    }
  }, []);

  const shadowsEnabled = useMemo(() => {
    return gameData?.gameSettings?.showShadows;
  }, [gameData?.gameSettings?.showShadows]);

  const allPlayersAsArray = useMemo(() => {
    if (!gameData?.players) {
      return [];
    }
    return Object.values(gameData?.players);
  }, [gameData?.players]);

  const activePlayersAsArray = useMemo(() => {
    return allPlayersAsArray.filter((player) => !player?.observerOnly);
  }, [gameData?.players]);

  const observerPlayersAsArray = useMemo(() => {
    return allPlayersAsArray.filter((player) => player?.observerOnly);
  }, [gameData?.players]);

  const myPowerSettings = useMemo(() => {
    return gameData?.gameSettings?.playerPowers?.[clientToken] || {};
  }, [gameData?.gameSettings?.playerPowers]);

  const gameState = useMemo(() => {
    return gameData?.gameSettings?.gameState;
  }, [gameData?.gameSettings?.gameState]);

  const iAmObserver = useMemo(() => {
    return gameData?.players?.[clientToken]?.observerOnly;
  }, [gameData?.players]);

  useEffect(() => {
    if (sessionStorage.getItem('kickedGames')) {
      if (kickedGames.includes(game_id)) {
        setIHaveBeenKicked(true);
        Swal.fire({
          title: 'You were kicked from that game',
          text: 'How rude!',
          width: 'min(100vw - 20px, 550px)',
          imageUrl: spidermanCrying,
          imageWidth: 'min(90vw, 400px',
          confirmButtonText: 'Darn',
          confirmButtonColor: '#9c4fd7',
          customClass: {
            popup: 'swal2-popup',
          },
        });
        navigate('/');
      }
    } else {
      sessionStorage.setItem('kickedGames', JSON.stringify([]));
    }
  }, []);

  console.success = function (message) {
    console.log('%c✅ ' + message, 'color: #04A57D; font-weight: bold;');
  };
  console.warning = function (message) {
    console.log('%c⚠️ ' + message, 'color: yellow; font-weight: bold;');
  };

  // eslint-disable-next-line
  function sendMessage(type, body) {
    const reqType = {
      type,
      timeStamp: Date.now(),
    };

    if (type === 'updatedCardChoice') {
      setCurrentCardChoice(body.card);
    }

    const bodyObj = JSON.stringify({
      body: { ...body, reqType },
      gameId: game_id,
      token: clientToken,
    });

    socket?.send(bodyObj);
  }

  function sendFunEmojiThrow({ emoji, targetPlayerId, fromSide }) {
    if (!emoji || !targetPlayerId) {
      return;
    }
    sendMessage('funEmojiThrow', {
      emoji,
      targetPlayerId,
      fromSide,
    });
  }

  function checkPowerLvl(powerCheck) {
    //? Check to see if the player has power at least as high as the powerCheck
    if (myPowerLvl === 'owner') {
      return true;
    } else if (powerCheck === 'low') {
      if (myPowerLvl === 'low' || myPowerLvl === 'high') {
        return true;
      } else {
        return false;
      }
    } else if (powerCheck === 'high') {
      if (myPowerLvl === 'high') {
        return true;
      } else {
        return false;
      }
    }
  }

  function confirmFailJoin(socket) {
    Swal.fire({
      title: 'Could not join game room',
      text: 'This game room does not exist',
      imageUrl: spidermanCrying,
      imageWidth: 'min(90vw, 400px',
      confirmButtonText: 'Take me home',
      customClass: {
        popup: 'swal2-popup',
      },
    }).then((result) => {
      if (result.isConfirmed) {
        toggleActiveSocket(false);
        socket.close();
        navigate('/');
        window.location.reload();
      }
    });
  }

  let connectCounter = 0;
  let notFoundConnectCounter = 0;

  useEffect(() => {
    if (
      !playerName ||
      !game_id ||
      !activeSocket ||
      iHaveBeenKicked ||
      iAmKicked
    ) {
      return;
    }
    function connectClient() {
      if (!game_id) {
        return console.log('not in game room, aborting connection');
      }
      setJoinGameLoading(true);
      let serverUrl;
      if (process.env.NODE_ENV === 'development') {
        serverUrl = 'ws://localhost:8080';
      } else {
        const scheme = document.location.protocol === 'https:' ? 'wss' : 'ws';
        serverUrl = scheme + '://' + document.location.host;
      }

      const ws = new WebSocket(
        `${serverUrl}?token=${localStorage.getItem(
          'PokerfaceLocalUserToken'
        )}&player_name=${playerName}&game_id=${game_id}&player_card_image=${localStorage.getItem(
          'PokerfaceCardImage'
        )}&observer_only=${sessionStorage.getItem('PokerfaceObserverOnly')}`
      );

      ws.addEventListener('open', function () {
        console.success('established socket connection');
        if (connectCounter > 0) console.success('Reconnected to socket server');
      });

      ws.addEventListener('error', function (error) {
        console.error('WebSocket Error: ', error);
      });

      ws.addEventListener('message', function (event) {
        if (!event?.data) {
          return;
        }
        let messageData = JSON.parse(event.data);

        if (messageData.event_type === 'playerJoinedGame') {
          setGameData(messageData.data);
          setJoinGameLoading(false);
        } else if (messageData.event_type === 'gameUpdated') {
          setGameData(messageData.data);
          setIHaveBeenKicked(false);
        } else if (messageData.event_type === 'cardChoicePrivateResponse') {
          setCurrentCardChoice(messageData.data.card);
        } else if (messageData.event_type === 'resetCardChoices') {
          setCurrentCardChoice(null);
        } else if (messageData.event_type === 'kickedFromGame') {
          console.warning(
            'I have been kicked from the game, and am now sad :('
          );
          setIHaveBeenKicked(true);
          const kickedGames =
            JSON.parse(sessionStorage.getItem('kickedGames')) || [];
          kickedGames.push(game_id);
          sessionStorage.setItem('kickedGames', JSON.stringify(kickedGames));
        } else if (messageData.event_type === 'notInGameRoom') {
          toast.warning(
            'Your connection to the server has staled. Please refresh your page.'
          );
        } else if (messageData.event_type === 'gameNotFound') {
          console.warning('Game not found at join attempt');
          notFoundConnectCounter++;
          if (notFoundConnectCounter < 12) {
            setTimeout(() => {
              console.warning('Trying to rejoin game room...');
              ws.close(); // close the socket connection, which will trigger a reconnect
            }, 500);
          } else {
            confirmFailJoin(ws);
          }
        } else if (messageData.event_type === 'funEmojiThrow') {
          eventBus.emit('funThrowEmoji', messageData.data);
        }
      });

      ws.addEventListener('close', function () {
        console.warning('Disconnected from socket server');
        connectCounter++;
        setTimeout(() => {
          console.warning('Reconnecting...');
          if (!activeSocket || !game_id) {
            return;
          } else {
            connectClient(); // try to reconnect after a delay
          }
        }, 1000); // wait for 1 second before reconnecting
      });

      setSocket(ws);
    }
    connectClient();
  }, [playerName, game_id]);

  useEffect(() => {
    if (!gameData?.gameSettings) {
      return;
    }

    //? Issue a warning toast if the player's powers changed
    const newPowerLvl =
      gameData?.gameSettings?.playerPowers?.[clientToken]?.powerLvl;

    if (myPowerLvl && newPowerLvl && myPowerLvl !== newPowerLvl) {
      toast.warning(`Your power level has changed to ${newPowerLvl}`);
      eventBus.emit('myPowerLevelChanged');
    }
    setMyPowerLvl(newPowerLvl);

    //? Issue a toast if anonymous mode has been turned on or off
    const newAnonymousMode = gameData?.gameSettings?.anonymousMode;
    const shouldToastAtJoin =
      newAnonymousMode === true && !isTrueOrFalse(isAnonymousMode);
    if (
      isAnonymousMode !== newAnonymousMode &&
      isTrueOrFalse(newAnonymousMode) &&
      (isTrueOrFalse(isAnonymousMode) || shouldToastAtJoin)
    ) {
      toast(
        `Anonymous mode ${shouldToastAtJoin ? 'is ' : 'has been turned '} ${
          newAnonymousMode ? 'on' : 'off'
        }`
      );
    }
    setIsAnonymousMode(newAnonymousMode);

    //? Issue a toast if the deck has changed
    const newDeck = gameData?.gameSettings?.deck;
    if (gameDeck && newDeck?.values !== gameDeck?.values) {
      toast('The deck has changed! Please choose your cards again.');
    }
    setGameDeck(newDeck);

    //? Issue a toast when my ability to display custom card image changes
    const newCanDisplayImg =
      gameData?.gameSettings?.playerPowers?.[clientToken]?.showCustomCardImg;
    if (
      isTrueOrFalse(iCanShowCustomCardImg) &&
      isTrueOrFalse(newCanDisplayImg) &&
      newCanDisplayImg !== iCanShowCustomCardImg
    ) {
      const message = `You can ${
        newCanDisplayImg ? 'now display' : 'no longer display'
      } your custom card image.`;
      if (newCanDisplayImg) {
        toast(message);
      } else {
        toast.warning(message);
      }
    }
    setICanShowCustomCardImg(newCanDisplayImg);
  }, [gameData?.gameSettings]);

  const funModeEnabled = useMemo(() => {
    return gameData?.gameSettings?.funModeEnabled;
  }, [gameData?.gameSettings?.funModeEnabled]);

  return (
    <GameContext.Provider
      value={{
        children,
        appIsLoading,
        setAppIsLoading,
        setGameExists,
        gameExists,
        gameData,
        setGameData,
        sendMessage,
        sendFunEmojiThrow,
        playerName,
        setPlayerName,
        joinGameLoading,
        setPlayerName,
        toggleActiveSocket,
        checkPowerLvl,
        iHaveBeenKicked,
        myPowerLvl,
        allPlayersAsArray,
        activePlayersAsArray,
        isAnonymousMode,
        myPowerSettings,
        gameState,
        currentCardChoice,
        setCurrentCardChoice,
        iAmObserver,
        observerPlayersAsArray,
        gameDeck,
        triggerLatestUpdatesMessage,
        shadowsEnabled,
        funModeEnabled,
      }}
    >
      {children}
    </GameContext.Provider>
  );
};
