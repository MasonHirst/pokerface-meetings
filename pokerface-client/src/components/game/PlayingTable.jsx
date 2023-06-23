import React, { useContext, useState, useEffect } from 'react'
import { GameContext } from '../../context/GameContext'
import { useMediaQuery } from '@mui/material'
import muiStyles from '../../style/muiStyles'
import tableTop from '../../assets/table-top.jpeg'
const { Card, Typography, Button, blue } = muiStyles

const PlayingTable = ({ disableButton }) => {
  const { gameData, sendMessage } = useContext(GameContext)
  const isSmallScreen = useMediaQuery('(max-width: 600px)')
  const isXsScreen = useMediaQuery('(max-width: 400px)')
  const [playersData, setPlayersData] = useState([])
  const [gameState, setGameState] = useState('')
  const [tableTopBackground, setTableTopBackground] = useState(false)

  let tableMessage = 'Pick your cards!'
  let choicesCount = 0
  let tableClass = ''
  let allVoted = false

  useEffect(() => {
    if (!gameData?.gameSettings?.gameRoomName) return
    setPlayersData(Object.values(gameData.players))
    setGameState(gameData.gameSettings.gameState)
  }, [gameData])

  playersData.forEach((player) => {
    if (player.currentChoice) {
      choicesCount++
    }
  })
  if (playersData.length === choicesCount && gameState === 'voting') {
    tableMessage = 'Reveal Cards'
    tableClass = 'glowing-table'
    allVoted = true
  } else if (
    playersData.length > choicesCount &&
    choicesCount > 0 &&
    gameState === 'voting'
  ) {
    tableMessage = 'Reveal Cards'
  } else if (gameState === 'reveal') {
    tableMessage = 'New round'
  }

  function updateGameState() {
    sendMessage('updateGameState', {
      gameState: gameState === 'voting' ? 'reveal' : 'voting',
    })
  }

  return (
    <Card
      className={tableClass}
      sx={{
        backgroundColor: blue[200],
        width: isXsScreen ? '140px' : { xs: '200px', sm: '380px' },
        height: { xs: '110px', sm: '200px' },
        borderRadius: '20px',
        boxShadow: 'none',
        display: 'flex',
        margin: isSmallScreen ? '0 0 7px 0' : '10px 0 20px 0',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundImage: tableTopBackground && `url(${tableTop})`,
      }}
    >
      {tableMessage !== 'Pick your cards!' ? (
        <Button
          disabled={disableButton}
          color="primary"
          variant="contained"
          disableElevation
          size={isSmallScreen ? (isXsScreen ? 'small' : 'medium') : 'large'}
          sx={{
            fontSize: { xs: 15, sm: 18 },
            fontWeight: 'bold',
            textTransform: 'none',
            letterSpacing: '.5px',
          }}
          onClick={updateGameState}
        >
          {tableMessage}
        </Button>
      ) : (
        <Typography
          variant="subtitle1"
          sx={{ fontSize: isSmallScreen ? 15 : 18, color: '#ffffff' }}
        >
          {tableMessage}
        </Typography>
      )}
    </Card>
  )
}

export default PlayingTable
