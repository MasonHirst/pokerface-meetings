import React, { useContext, useState, useEffect } from 'react'
import PlayingTable from './PlayingTable'
import { GameContext } from '../../context/GameContext'
import useClipboard from 'react-use-clipboard'
import GraphemeSplitter from 'grapheme-splitter'
import muiStyles from '../../style/muiStyles'
import PurplDeckCard from './PurpleDeckCard'
const { Box, Typography, Button, ContentCopyIcon } = muiStyles

const GameBody = () => {
  const { gameData } = useContext(GameContext)
  const [playersData, setPlayersData] = useState([])
  const [gameState, setGameState] = useState('')
  const [stateButtonDisabled, setStateButtonDisabled] = useState(false)
  const splitter = GraphemeSplitter()
  const [isCopied, setCopied] = useClipboard(window.location.href, {
    // `isCopied` will go back to `false` after 1500ms.
    successDuration: 1500,
  })

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

  const mappedPlayerCards = Object.values(playersData).map((player, index) => {
    if (!player) return
    let length = 0
    if (player.currentChoice) {
      length = splitter.splitGraphemes(player.currentChoice.trim()).length
    }
    return (
      <PurplDeckCard
        key={index}
        gameState={gameState}
        player={player}
        card={player.currentChoice}
        useCase="playerCard"
        gameData={gameData}
        borderColor='#902bf5'
      />
    )
  })

  return (
    <Box
      className="game-body-container"
      sx={{
        width: '100vw',
        minHeight: 'calc(100vh - 240px)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      <Box
        className="game-body"
        sx={{
          width: 'min(100%, 1200px)',
          height: '100%',
          display: 'flex',
          justifyContent: 'space-evenly',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        {gameData.players && Object.values(gameData.players).length < 2 && (
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
        <PlayingTable disableButton={stateButtonDisabled} />
        <Box
          sx={{
            width: '100%',
            padding: '10px',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            gap: '25px',
            margin: '25px 0',
          }}
        >
          {mappedPlayerCards}
        </Box>
      </Box>
    </Box>
  )
}

export default GameBody
