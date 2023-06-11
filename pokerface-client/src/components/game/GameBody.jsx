import React, { useContext, useState, useEffect, useRef } from 'react'
import PlayingTable from './PlayingTable'
import { GameContext } from '../../context/GameContext'
import useClipboard from 'react-use-clipboard'
import GraphemeSplitter from 'grapheme-splitter'
import muiStyles from '../../style/muiStyles'
import { useMediaQuery } from '@mui/material'
import PurpleDeckCard from './PurpleDeckCard'
const { Box, Typography, Button, ContentCopyIcon, TextField, EditIcon } = muiStyles

const GameBody = ({ availableHeight, setBodyIsScrolling }) => {
  const isSmallScreen = useMediaQuery('(max-width:600px)')
  const { gameData, sendMessage } = useContext(GameContext)
  const gameBodyRef = useRef()
  const [playersData, setPlayersData] = useState([])
  const [gameState, setGameState] = useState('')
  const [stateButtonDisabled, setStateButtonDisabled] = useState(false)
  const splitter = GraphemeSplitter()
  const [latestVoting, setLatestVoting] = useState([])
  const [isCopied, setCopied] = useClipboard(window.location.href, {
    // `isCopied` will go back to `false` after 1500ms.
    successDuration: 1500,
  })
  const [editingIssueName, setEditingIssueName] = useState(false)
  const [newIssueName, setNewIssueName] = useState(gameData.currentIssueName || '')
  const newIssueNameRef = useRef()

  function submitNewIssueName() {
    sendMessage('setIssueName', { issueName: newIssueName.trim() })
  }

  useEffect(() => {
    setBodyIsScrolling(availableHeight < gameBodyRef.current?.scrollHeight)
  }, [availableHeight])

  const sidePlayersBox = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '15px',
    padding: { xs: '5px 0', sm: '5px 10px' },
  }
  const topPlayersBox = (top, padding) => {
    return {
      display: 'flex',
      flexDirection: 'row',
      justifyContent: 'center',
      flexWrap: top ? 'wrap-reverse' : 'wrap',
      alignItems: 'center',
      gap: '18px',
      padding,
    }
  }

  useEffect(() => {
    if (!gameData.gameRoomName) return
    setPlayersData(Object.values(gameData.players))
    setGameState(gameData.gameState)
    setLatestVoting(gameData.voteHistory[gameData.voteHistory.length - 1])
    if (
      !stateButtonDisabled &&
      gameState !== gameData.gameState &&
      gameData.gameState === 'reveal'
    ) {
      setStateButtonDisabled(true)
      setTimeout(() => {
        setStateButtonDisabled(false)
      }, 1200)
    }
  }, [gameData])

  const topPlayers = []
  const leftPlayers = []
  const rightPlayers = []
  const bottomPlayers = []

  function assignPlayerSeat(deckCard, index) {
    if (index === 0) {
      bottomPlayers.push(deckCard)
    } else if (index === 1) {
      topPlayers.push(deckCard)
    } else if (index === 2) {
      if (playersData.length < 4) {
        bottomPlayers.push(deckCard)
      } else leftPlayers.push(deckCard)
    } else if (index === 3) {
      rightPlayers.push(deckCard)
    } else if (index === 4) {
      bottomPlayers.push(deckCard)
    } else if (index === 5) {
      topPlayers.push(deckCard)
    } else if (index === 6) {
      bottomPlayers.push(deckCard)
    } else if (index === 7) {
      topPlayers.push(deckCard)
    } else if (index === 8) {
      bottomPlayers.push(deckCard)
    } else if (index === 9) {
      topPlayers.push(deckCard)
    } else if (index === 10) {
      bottomPlayers.push(deckCard)
    } else if (index === 11) {
      leftPlayers.push(deckCard)
    } else if (index === 12) {
      rightPlayers.push(deckCard)
    } else if (index % 2 === 0) {
      bottomPlayers.push(deckCard)
    } else {
      topPlayers.push(deckCard)
    }
  }

  // const playersData = [
  //   {
  //     currentChoice: '🤣',
  //     playerName: 'Player 1',
  //   },
  //   {
  //     currentChoice: '🤣',
  //     playerName: 'Player 2',
  //   },
  //   {
  //     currentChoice: '🤣',
  //     playerName: 'Player 3',
  //   },
  //   {
  //     currentChoice: '🤣',
  //     playerName: 'Player 4',
  //   },
  //   {
  //     currentChoice: '🤣',
  //     playerName: 'Player 5',
  //   },
  //   {
  //     currentChoice: '🤣',
  //     playerName: 'Player 6',
  //   },
  //   {
  //     currentChoice: '🤣',
  //     playerName: 'Player 7',
  //   },
  //   {
  //     currentChoice: '🤣',
  //     playerName: 'Player 8',
  //   },
  //   {
  //     currentChoice: '🤣',
  //     playerName: 'Player 9',
  //   },
  //   {
  //     currentChoice: '🤣',
  //     playerName: 'Player 10',
  //   },
  //   {
  //     currentChoice: '🤣',
  //     playerName: 'Player 11',
  //   },
  //   {
  //     currentChoice: '🤣',
  //     playerName: 'Player 12',
  //   },
  //   {
  //     currentChoice: '🤣',
  //     playerName: 'Player 13',
  //   },
  //   {
  //     currentChoice: '🤣',
  //     playerName: 'Player 14',
  //   },
  //   {
  //     currentChoice: '🤣',
  //     playerName: 'Player 15',
  //   },
  //   {
  //     currentChoice: '🤣',
  //     playerName: 'Player 16',
  //   },
  //   {
  //     currentChoice: '🤣',
  //     playerName: 'Player 17',
  //   },
  //   {
  //     currentChoice: '🤣',
  //     playerName: 'Player 18',
  //   },
  //   {
  //     currentChoice: '🤣',
  //     playerName: 'Player 19',
  //   },
  //   {
  //     currentChoice: '🤣',
  //     playerName: 'Player 20',
  //   },
  // ]

  if (gameState === 'voting') {
    playersData.forEach((player, index) => {
      if (!player) return
      let length = 0
      if (player.currentChoice) {
        length = splitter.splitGraphemes(player.currentChoice.trim()).length
      }
      if (length > 4) return
      let cardSizeMultiplier = 1.2
      let fontSizeMultiplier = 1
      if (playersData.length > 8 && playersData.length < 13) {
        cardSizeMultiplier = 1.1
        fontSizeMultiplier = 0.95
      } else if (playersData.length > 12) {
        cardSizeMultiplier = 1
        fontSizeMultiplier = 0.9
      }
      const deckCard = (
        <PurpleDeckCard
          key={index}
          bottomMessageMultiplier={fontSizeMultiplier}
          fontSizeMultiplier={1.3}
          bottomMessageMargin="3px 0 0 0"
          showBgImage={player.currentChoice}
          borderColor="#902bf5"
          bgColor="#f2f2f2"
          cardImage={player.playerCardImage}
          bottomMessage={player.playerName}
          sizeMultiplier={cardSizeMultiplier}
        />
      )
      assignPlayerSeat(deckCard, index)
    })
  } else if (gameState === 'reveal' && gameData?.voteHistory) {
    Object.entries(latestVoting.playerVotes).forEach((player, index) => {
      if (!player) return
      const length = Object.values(latestVoting.playerVotes).length
      let cardSizeMultiplier = 1.2
      let fontSizeMultiplier = 1
      if (length > 8 && length < 13) {
        cardSizeMultiplier = 1.1
        fontSizeMultiplier = 0.95
      } else if (length > 12) {
        cardSizeMultiplier = 1
        fontSizeMultiplier = 0.9
      }
      const deckCard = (
        <PurpleDeckCard
          key={index}
          bottomMessageMultiplier={fontSizeMultiplier}
          fontSizeMultiplier={1.3}
          card={player[1]}
          // showCard={true}
          bottomMessageMargin="3px 0 0 0"
          borderColor="#902bf5"
          bgColor="#f2f2f2"
          bottomMessage={player[0]}
          sizeMultiplier={cardSizeMultiplier}
        />
      )
      assignPlayerSeat(deckCard, index)
    })
  }

  // Yes, I do need the three parent boxes for scroll styling
  return (
    <Box
      className="game-body-container"
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
      }}
    >
      <Box
        className="game-body"
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
          {(gameData.currentIssueName && gameData.currentIssueName) ||
          editingIssueName ? (
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
                Matter at hand:
              </Typography>
              {editingIssueName ? (
                <TextField
                  inputRef={newIssueNameRef}
                  size="small"
                  spellCheck="false"
                  value={newIssueName}
                  onChange={(e) => setNewIssueName(e.target.value)}
                  onBlur={() => {
                    submitNewIssueName()
                    setEditingIssueName(false)
                  }}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      submitNewIssueName()
                      setEditingIssueName(false)
                    }
                  }}
                  inputProps={{
                    maxLength: 75,
                    style: {
                      fontSize: isSmallScreen ? '16px' : '20px',
                      width: 'clamp(240px, 50vw, 500px)',
                      textAlign: 'center',
                    },
                  }}
                />
              ) : (
                <Typography
                  sx={{ fontSize: { xs: '18px', sm: '24px', position: 'relative', top: '-3px', } }}
                  className={gameState === 'voting' ? 'cursor-pointer' : ''}
                  onClick={() => {
                    if (gameState !== 'voting') return
                    setEditingIssueName(true)
                    setTimeout(() => {
                      newIssueNameRef.current.focus()
                      if (newIssueNameRef.current) {
                        newIssueNameRef.current.select()
                      }
                    }, 50)
                  }}
                >
                  {gameData.currentIssueName}
                </Typography>
              )}
            </Box>
          ) : (
            gameState === 'voting' && (
              <Button
                onClick={() => {
                  setEditingIssueName(true)
                  setTimeout(() => {
                    newIssueNameRef.current.focus()
                  }, 50)
                }}
                endIcon={<EditIcon />}
                sx={{
                  marginBottom: '30px',
                  fontSize: '18px',
                  textTransform: 'none',
                  fontWeight: 'bold',
                  fontSize: isSmallScreen ? '16px' : '20px',
                }}
              >
                Set voting topic
              </Button>
            )
          )}

          {gameData.players &&
            playersData.length < 2 &&
            gameState === 'voting' && (
              <Box
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                }}
              >
                <Typography variant="body1" sx={{fontSize: isSmallScreen ? '13px' : '16px'}}>It's just you here 😞</Typography>
                {isCopied ? (
                  <Typography
                    variant="body1"
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
                    variant="text"
                    sx={{
                      textTransform: 'none',
                      fontSize: isSmallScreen ? '16px' : '18px',
                      position: 'relative',
                      top: '-5px',
                    }}
                    onClick={(e) => {
                      setCopied(e)
                    }}
                  >
                    Copy invite link
                  </Button>
                )}
              </Box>
            )}

          {topPlayers.length > 0 && (
            <Box sx={topPlayersBox(true, '5px 0')}>{topPlayers}</Box>
          )}

          <Box sx={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            {leftPlayers.length > 0 && (
              <Box sx={sidePlayersBox}>{leftPlayers}</Box>
            )}

            <PlayingTable disableButton={stateButtonDisabled} />

            {rightPlayers.length > 0 && (
              <Box sx={sidePlayersBox}>{rightPlayers}</Box>
            )}
          </Box>

          {bottomPlayers.length > 0 && (
            <Box sx={topPlayersBox(false, '5px 0 10px 0')}>{bottomPlayers}</Box>
          )}
        </Box>
      </Box>
    </Box>
  )
}

export default GameBody
