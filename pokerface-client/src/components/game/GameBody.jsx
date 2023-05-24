import React, { useContext, useState, useEffect } from 'react'
import PlayingTable from './PlayingTable'
import { GameContext } from '../../context/GameContext'
import useClipboard from 'react-use-clipboard'
import GraphemeSplitter from 'grapheme-splitter'
import muiStyles from '../../style/muiStyles'
import PurpleDeckCard from './PurpleDeckCard'
const { Box, Typography, Button, ContentCopyIcon } = muiStyles

const GameBody = ({ availableHeight }) => {
  const { gameData } = useContext(GameContext)
  const [playersData, setPlayersData] = useState([])
  const [gameState, setGameState] = useState('')
  const [stateButtonDisabled, setStateButtonDisabled] = useState(false)
  const splitter = GraphemeSplitter()
  const [isCopied, setCopied] = useClipboard(window.location.href, {
    // `isCopied` will go back to `false` after 1500ms.
    successDuration: 1500,
  })

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
    if (
      !stateButtonDisabled &&
      gameState !== gameData.gameState &&
      gameData.gameState === 'reveal'
    ) {
      setStateButtonDisabled(true)
      setTimeout(() => {
        setStateButtonDisabled(false)
      }, 1500)
    }
  }, [gameData])

  const topPlayers = []
  const leftPlayers = []
  const rightPlayers = []
  const bottomPlayers = []

  // const playersData = [
  //   {
  //     currentChoice: '🤣',
  //     playerName: 'Player 1',
  //     playerCardImage: 'https://i.imgur.com/3ZQ5Z0Y.png',
  //   },
  //   {
  //     currentChoice: '🤣',
  //     playerName: 'Player 2',
  //     playerCardImage: 'https://i.imgur.com/3ZQ5Z0Y.png',
  //   },
  //   {
  //     currentChoice: '🤣',
  //     playerName: 'Player 3',
  //     playerCardImage: 'https://i.imgur.com/3ZQ5Z0Y.png',
  //   },
  //   {
  //     currentChoice: '🤣',
  //     playerName: 'Player 4',
  //     playerCardImage: 'https://i.imgur.com/3ZQ5Z0Y.png',
  //   },
  //   {
  //     currentChoice: '🤣',
  //     playerName: 'Player 5',
  //     playerCardImage: 'https://i.imgur.com/3ZQ5Z0Y.png',
  //   },
  //   {
  //     currentChoice: '🤣',
  //     playerName: 'Player 6',
  //     playerCardImage: 'https://i.imgur.com/3ZQ5Z0Y.png',
  //   },
  //   {
  //     currentChoice: '🤣',
  //     playerName: 'Player 7',
  //     playerCardImage: 'https://i.imgur.com/3ZQ5Z0Y.png',
  //   },
  //   {
  //     currentChoice: '🤣',
  //     playerName: 'Player 8',
  //     playerCardImage: 'https://i.imgur.com/3ZQ5Z0Y.png',
  //   },
  //   {
  //     currentChoice: '🤣',
  //     playerName: 'Player 9',
  //     playerCardImage: 'https://i.imgur.com/3ZQ5Z0Y.png',
  //   },
  //   {
  //     currentChoice: '🤣',
  //     playerName: 'Player 10',
  //     playerCardImage: 'https://i.imgur.com/3ZQ5Z0Y.png',
  //   },
  //   {
  //     currentChoice: '🤣',
  //     playerName: 'Player 11',
  //     playerCardImage: 'https://i.imgur.com/3ZQ5Z0Y.png',
  //   },
  //   {
  //     currentChoice: '🤣',
  //     playerName: 'Player 12',
  //     playerCardImage: 'https://i.imgur.com/3ZQ5Z0Y.png',
  //   },
  //   {
  //     currentChoice: '🤣',
  //     playerName: 'Player 13',
  //     playerCardImage: 'https://i.imgur.com/3ZQ5Z0Y.png',
  //   },
  //   {
  //     currentChoice: '🤣',
  //     playerName: 'Player 14',
  //     playerCardImage: 'https://i.imgur.com/3ZQ5Z0Y.png',
  //   },
  //   {
  //     currentChoice: '🤣',
  //     playerName: 'Player 15',
  //     playerCardImage: 'https://i.imgur.com/3ZQ5Z0Y.png',
  //   },
  //   {
  //     currentChoice: '🤣',
  //     playerName: 'Player 16',
  //     playerCardImage: 'https://i.imgur.com/3ZQ5Z0Y.png',
  //   },
  //   {
  //     currentChoice: '🤣',
  //     playerName: 'Player 17',
  //     playerCardImage: 'https://i.imgur.com/3ZQ5Z0Y.png',
  //   },
  //   {
  //     currentChoice: '🤣',
  //     playerName: 'Player 18',
  //     playerCardImage: 'https://i.imgur.com/3ZQ5Z0Y.png',
  //   },
  //   {
  //     currentChoice: '🤣',
  //     playerName: 'Player 18',
  //     playerCardImage: 'https://i.imgur.com/3ZQ5Z0Y.png',
  //   },
  //   {
  //     currentChoice: '🤣',
  //     playerName: 'Player 18',
  //     playerCardImage: 'https://i.imgur.com/3ZQ5Z0Y.png',
  //   },
  //   {
  //     currentChoice: '🤣',
  //     playerName: 'Player 18',
  //     playerCardImage: 'https://i.imgur.com/3ZQ5Z0Y.png',
  //   },
  //   {
  //     currentChoice: '🤣',
  //     playerName: 'Player 18',
  //     playerCardImage: 'https://i.imgur.com/3ZQ5Z0Y.png',
  //   },
  //   {
  //     currentChoice: '🤣',
  //     playerName: 'Player 18',
  //     playerCardImage: 'https://i.imgur.com/3ZQ5Z0Y.png',
  //   },
  //   {
  //     currentChoice: '🤣',
  //     playerName: 'Player 18',
  //     playerCardImage: 'https://i.imgur.com/3ZQ5Z0Y.png',
  //   },
  // ]

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
        card={player.currentChoice}
        showCard={gameState === 'reveal'}
        bottomMessageMargin="3px 0 0 0"
        showBgImage={player.currentChoice && gameState === 'voting'}
        gameState={gameState}
        borderColor="#902bf5"
        bgColor="#f2f2f2"
        cardImage={player.playerCardImage}
        bottomMessage={player.playerName}
        sizeMultiplier={cardSizeMultiplier}
      />
    )
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
  })

  // Yes, I do need the three parent boxes for scroll styling
  return (
    <Box
      className="game-body-container"
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
          {gameData.players && playersData.length < 2 && (
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
              }}
            >
              <Typography variant="body1">It's just you here 😞</Typography>
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
                    fontSize: '18px',
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
