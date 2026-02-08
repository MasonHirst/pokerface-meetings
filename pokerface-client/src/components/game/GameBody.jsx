import React, { useContext, useState, useEffect, useRef, useMemo } from 'react';
import PlayingTable from './PlayingTable';
import EmojiThrowLayer from './EmojiThrowLayer';
import { GameContext } from '../../context/GameContext';
import useClipboard from 'react-use-clipboard';
import GraphemeSplitter from 'grapheme-splitter';
import muiStyles from '../../style/muiStyles';
import { IconButton, useMediaQuery } from '@mui/material';
import { toast } from 'react-toastify';
import PurpleDeckCard from './PurpleDeckCard';
import { eventBus } from '../../utils/eventBus';
import { DEFAULT_EXTRA_EMOJI } from '../../utils/funEmojiDefaults';
const {
  Box,
  Typography,
  Button,
  ContentCopyIcon,
  TextField,
  EditIcon,
  Alert,
  CheckIcon,
  CloseIcon,
  blue,
} = muiStyles;

const GameBody = ({ availableHeight, setBodyIsScrolling }) => {
  const isSmallScreen = useMediaQuery('(max-width:600px)');
  const isXsScreen = useMediaQuery('(max-width:400px)');
  const {
    gameData,
    sendMessage,
    checkPowerLvl,
    iHaveBeenKicked,
    isAnonymousMode,
    activePlayersAsArray,
    allPlayersAsArray,
    playerName,
    funModeEnabled,
  } = useContext(GameContext);
  const gameBodyRef = useRef();
  const [stateButtonDisabled, setStateButtonDisabled] = useState(false);
  const splitter = GraphemeSplitter();
  const [isCopied, setCopied] = useClipboard(window.location.href, {
    //? `isCopied` will go back to `false` after 1500ms.
    successDuration: 1500,
  });
  const [editingIssueName, setEditingIssueName] = useState(false);
  const [newIssueName, setNewIssueName] = useState(
    gameData?.gameSettings?.currentIssueName || '',
  );
  const [funLastEmoji, setFunLastEmoji] = useState(
    () => localStorage.getItem('PokerfaceFunLastEmoji') || DEFAULT_EXTRA_EMOJI
  );
  const newIssueNameRef = useRef();
  const localPlayerToken = localStorage.getItem('PokerfaceLocalUserToken');

  function submitNewIssueName() {
    sendMessage('setIssueName', { issueName: newIssueName.trim() });
  }

  

  useEffect(() => {
    setBodyIsScrolling(availableHeight < gameBodyRef.current?.scrollHeight);
  }, [availableHeight]);

  useEffect(() => {
    const handleEmojiUpdate = (value) => {
      if (!value) {
        return;
      }
      setFunLastEmoji(value);
    };
    eventBus.on('funEmojiUpdated', handleEmojiUpdate);
    return () => {
      eventBus.off('funEmojiUpdated', handleEmojiUpdate);
    };
  }, []);

  const sidePlayersBox = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '15px',
    padding: { xs: '5px 0', sm: '5px 10px' },
  };
  const topPlayersBox = (top, padding) => {
    return {
      display: 'flex',
      flexDirection: 'row',
      justifyContent: 'center',
      flexWrap: top ? 'wrap-reverse' : 'wrap',
      alignItems: 'center',
      gap: '18px',
      padding,
    };
  };

  useEffect(() => {
    if (!gameData?.gameSettings?.gameRoomName) {
      return;
    }
    if (
      !stateButtonDisabled &&
      gameState !== gameData.gameSettings.gameState &&
      gameData.gameSettings.gameState === 'reveal'
    ) {
      setStateButtonDisabled(true);
      setTimeout(() => {
        setStateButtonDisabled(false);
      }, 1200);
    }
  }, [gameData]);

  const latestVoting = useMemo(() => {
    if (!gameData?.voteHistory) {
      return null;
    }
    return gameData?.voteHistory?.[gameData?.voteHistory?.length - 1];
  }, [gameData]);

  const gameState = useMemo(() => {
    return gameData?.gameSettings?.gameState || '';
  }, [gameData]);

  const playerPositions = useMemo(() => {
    const topPlayers = [];
    const leftPlayers = [];
    const rightPlayers = [];
    const bottomPlayers = [];

    function assignPlayerSeat(
      deckCard,
      index,
      totalCards = activePlayersAsArray.length,
    ) {
      if (index === 0) {
        bottomPlayers.push(deckCard);
      } else if (index === 1) {
        topPlayers.push(deckCard);
      } else if (index === 2) {
        if (totalCards < 4) {
          bottomPlayers.push(deckCard);
        } else {
          leftPlayers.push(deckCard);
        }
      } else if (index === 3) {
        rightPlayers.push(deckCard);
      } else if (index === 4) {
        bottomPlayers.push(deckCard);
      } else if (index === 5) {
        topPlayers.push(deckCard);
      } else if (index === 6) {
        bottomPlayers.push(deckCard);
      } else if (index === 7) {
        topPlayers.push(deckCard);
      } else if (index === 8) {
        bottomPlayers.push(deckCard);
      } else if (index === 9) {
        topPlayers.push(deckCard);
      } else if (index === 10) {
        bottomPlayers.push(deckCard);
      } else if (index === 11) {
        leftPlayers.push(deckCard);
      } else if (index === 12) {
        rightPlayers.push(deckCard);
      } else if (index % 2 === 0) {
        bottomPlayers.push(deckCard);
      } else {
        topPlayers.push(deckCard);
      }
    }

    if (gameState === 'voting') {
      activePlayersAsArray.forEach((player, index) => {
        if (!player) {
          return;
        }
        let length = 0;
        if (player?.currentChoice) {
          console.log(
            '!!! If you see this log please contact the developer for a special prize !!!',
          );
          length = splitter.splitGraphemes(
            player?.currentChoice?.trim(),
          ).length;
        }
        if (length > 4) {
          return;
        }
        let cardSizeMultiplier = 1.2;
        let fontSizeMultiplier = 1;
        if (
          activePlayersAsArray.length > 8 &&
          activePlayersAsArray.length < 13
        ) {
          cardSizeMultiplier = 1.1;
          fontSizeMultiplier = 0.95;
        } else if (activePlayersAsArray.length > 12) {
          cardSizeMultiplier = 1;
          fontSizeMultiplier = 0.9;
        }
        const deckCard = (
          <PurpleDeckCard
            key={index}
            bottomMessageMultiplier={fontSizeMultiplier}
            fontSizeMultiplier={1.3}
            bottomMessageMargin='3px 0 0 0'
            showBgImage={player?.hasVoted}
            borderColor='#902bf5'
            cardImage={getCardImage(player)}
            bottomMessage={player?.playerName}
            sizeMultiplier={cardSizeMultiplier}
            showShadow
            showFunMenu={player?.token !== localPlayerToken && funModeEnabled}
            playerId={player?.token}
            lastEmoji={funLastEmoji}
          />
        );
        assignPlayerSeat(deckCard, index);
      });
    } else if (gameState === 'reveal' && gameData?.voteHistory) {
      latestVoting?.votes.forEach((vote, index) => {
        if (!vote) {
          return;
        }
        const length = latestVoting?.votes?.length;
        let cardSizeMultiplier = 1.2;
        let fontSizeMultiplier = 1;
        if (length > 8 && length < 13) {
          cardSizeMultiplier = 1.1;
          fontSizeMultiplier = 0.95;
        } else if (length > 12) {
          cardSizeMultiplier = 1;
          fontSizeMultiplier = 0.9;
        }
        const deckCard = (
          <PurpleDeckCard
            key={index}
            bottomMessageMultiplier={fontSizeMultiplier}
            fontSizeMultiplier={1.3}
            card={vote.card}
            bottomMessageMargin='3px 0 0 0'
            borderColor='#902bf5'
            bottomMessage={vote.playerName}
            sizeMultiplier={cardSizeMultiplier}
            showShadow
            showFunMenu={vote?.playerName !== playerName && funModeEnabled}
            lastEmoji={funLastEmoji}
          />
        );
        assignPlayerSeat(deckCard, index, length);
      });
    }

    const positions = {
      top: topPlayers,
      left: leftPlayers,
      right: rightPlayers,
      bottom: bottomPlayers,
    };
    return positions;
  }, [gameData, funLastEmoji]);

  function getCardImage(player) {
    const { token, playerCardImage } = player;
    const canShowCustomImg =
      gameData.gameSettings?.playerPowers?.[token]?.showCustomCardImg;
    const playerIsMe =
      token === localStorage.getItem('PokerfaceLocalUserToken');
    if (canShowCustomImg || playerIsMe) {
      return playerCardImage;
    }
    return null;
  }

  const hideCardsForAnonymousMode = useMemo(() => {
    return gameState === 'reveal' && isAnonymousMode;
  }, [gameState]);

  const showTopPlayers = useMemo(() => {
    return playerPositions.top.length > 0 && !hideCardsForAnonymousMode;
  }, [playerPositions]);

  const showLeftPlayers = useMemo(() => {
    return playerPositions.left.length > 0 && !hideCardsForAnonymousMode;
  }, [playerPositions]);

  const showRightPlayers = useMemo(() => {
    return playerPositions.right.length > 0 && !hideCardsForAnonymousMode;
  }, [playerPositions]);

  const showBottomPlayers = useMemo(() => {
    return playerPositions.bottom.length > 0 && !hideCardsForAnonymousMode;
  }, [playerPositions]);

  const showWasAnonymousVoteText = useMemo(() => {
    return gameState === 'reveal' && isAnonymousMode;
  }, [gameState, isAnonymousMode]);

  // Yes, I do need the three parent boxes for scroll styling
  return (
    <Box
      className='game-body-container'
      ref={gameBodyRef}
      sx={{
        width: '100%',
        height: `${availableHeight}px`,
        maxHeight: `${availableHeight}px`,
        padding: '5px',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        overflowX: 'auto',
        overflowY: 'auto',
        position: 'relative',
      }}
    >
      <Box
        className='game-body'
        sx={{
          maxHeight: '100%',
          maxWidth: '100%',
          display: 'flex',
          justifyContent: 'flex-start',
          flexDirection: 'column',
          alignItems: 'flex-start',
        }}
      >
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'flex-start',
            alignItems: 'center',
          }}
        >
          {iHaveBeenKicked && (
            <Alert
              severity='error'
              sx={{
                width: '100%',
                marginBottom: '20px',
                fontSize: '16px',
                fontWeight: 'bold',
              }}
            >
              You have been kicked from this game, and are no longer getting
              updates
            </Alert>
          )}

          {gameData?.gameSettings?.currentIssueName || editingIssueName ? (
            <Box
              sx={{
                marginBottom: '20px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
              }}
            >
              <Typography
                sx={{
                  whiteSpace: 'nowrap',
                  fontSize: { xs: '15px', sm: '20px' },
                  opacity: 0.6,
                }}
              >
                Vote topic:
              </Typography>

              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '5px',
                }}
              >
                <Typography
                  sx={{
                    fontSize: {
                      xs: '18px',
                      sm: '24px',
                      position: 'relative',
                      top: '-3px',
                      textAlign: 'center',
                    },
                  }}
                  className={gameState === 'voting' ? 'cursor-pointer' : ''}
                >
                  {gameData.gameSettings.currentIssueName}
                </Typography>
                {!editingIssueName && gameState === 'voting' && (
                  <IconButton
                    sx={
                      {
                        // opacity: 0.8,
                      }
                    }
                    onClick={() => {
                      if (gameState !== 'voting') {
                        return;
                      }
                      if (!checkPowerLvl('low'))
                        return toast.warning('You need low power to do this');
                      setEditingIssueName(true);
                      setTimeout(() => {
                        newIssueNameRef.current.focus();
                        if (newIssueNameRef.current) {
                          newIssueNameRef.current.select();
                        }
                      }, 50);
                    }}
                  >
                    <EditIcon
                      // color='primary'
                      sx={{
                        fontSize: { xs: '23px', sm: '26px' },
                        marginTop: '-4px',
                        color: blue[300],
                      }}
                    />
                  </IconButton>
                )}
              </Box>

              {editingIssueName && (
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '5px',
                    flexDirection: isSmallScreen ? 'column' : 'row',
                  }}
                >
                  <TextField
                    inputRef={newIssueNameRef}
                    size='small'
                    spellCheck='false'
                    value={newIssueName}
                    onChange={(e) => setNewIssueName(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        submitNewIssueName();
                        setEditingIssueName(false);
                      }
                    }}
                    inputProps={{
                      maxLength: 120,
                      style: {
                        fontSize: isSmallScreen ? '16px' : '20px',
                        width: 'clamp(240px, 50vw, 500px)',
                        textAlign: 'center',
                      },
                    }}
                  />
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: isSmallScreen ? '10px' : '1px',
                    }}
                  >
                    <IconButton
                      sx={{
                        padding: '3px',
                      }}
                      onClick={() => {
                        setEditingIssueName(false);
                      }}
                    >
                      <CloseIcon color='primary' sx={{ fontSize: '24px' }} />
                    </IconButton>
                    <IconButton
                      sx={{
                        padding: '3px',
                      }}
                      onClick={() => {
                        submitNewIssueName();
                        setEditingIssueName(false);
                      }}
                    >
                      <CheckIcon color='primary' sx={{ fontSize: '24px' }} />
                    </IconButton>
                  </Box>
                </Box>
              )}
            </Box>
          ) : (
            gameState === 'voting' && (
              <Button
                onClick={() => {
                  if (checkPowerLvl('low')) {
                    setEditingIssueName(true);
                    setTimeout(() => {
                      newIssueNameRef.current.focus();
                    }, 50);
                  } else toast.warning('You need low power to do this');
                }}
                endIcon={<EditIcon />}
                sx={{
                  marginBottom: '10px',
                  fontSize: '18px',
                  textTransform: 'none',
                  fontWeight: 'bold',
                  fontSize: isSmallScreen ? '16px' : '20px',
                }}
              >
                Set vote topic
              </Button>
            )
          )}

          {gameData.players &&
            allPlayersAsArray.length < 2 &&
            gameState === 'voting' && (
              <Box
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                }}
              >
                <Typography
                  variant='body1'
                  sx={{ fontSize: isSmallScreen ? '13px' : '16px' }}
                >
                  It's just you here 😞
                </Typography>
                {isCopied ? (
                  <Typography
                    variant='body1'
                    sx={{
                      color: '#4caf50',
                      marginBottom: '14px',
                      marginTop: '4px',
                      fontSize: '17px',
                    }}
                  >
                    Invite link copied to clipboard!
                  </Typography>
                ) : (
                  <Button
                    startIcon={<ContentCopyIcon />}
                    variant='text'
                    sx={{
                      textTransform: 'none',
                      fontSize: isSmallScreen ? '16px' : '18px',
                      position: 'relative',
                      top: '-5px',
                    }}
                    onClick={(e) => {
                      setCopied(e);
                    }}
                  >
                    Copy invite link
                  </Button>
                )}
              </Box>
            )}

          {showTopPlayers && (
            <Box sx={topPlayersBox(true, '5px 0')}>{playerPositions.top}</Box>
          )}

          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: isXsScreen ? '5px' : '10px',
            }}
          >
            {showLeftPlayers && (
              <Box sx={sidePlayersBox}>{playerPositions.left}</Box>
            )}

            <PlayingTable disableButton={stateButtonDisabled} />

            {showRightPlayers && (
              <Box sx={sidePlayersBox}>{playerPositions.right}</Box>
            )}
          </Box>

          {showBottomPlayers && (
            <Box sx={topPlayersBox(false, '5px 0 10px 0')}>
              {playerPositions.bottom}
            </Box>
          )}

          {showWasAnonymousVoteText && (
            <Typography
              sx={{
                opacity: 0.7,
                fontStyle: 'italic',
                textAlign: 'center',
              }}
            >
              This vote was anonymous - only the result are shown below.
            </Typography>
          )}
        </Box>
      </Box>
      <EmojiThrowLayer />
    </Box>
  );
};

export default GameBody;
