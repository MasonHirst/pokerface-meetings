import React, { useState, useContext, useEffect } from 'react'
import { GameContext } from '../../context/GameContext'
import { useMediaQuery } from '@mui/material'
import purpleAbstract from '../../assets/purple-abstract.jpg'
import muiStyles from '../../style/muiStyles'
const { Box, Typography } = muiStyles

const PurplDeckCard = ({
  card,
  submitChoice,
  length,
  useCase,
  disabled,
  player,
}) => {
  const localUserToken = localStorage.getItem('localUserToken')
  const [gameState, setGameState] = useState('')
  const choice = player?.currentChoice
  const [thisUser, setThisUser] = useState({})
  const { gameData } = useContext(GameContext)
  const isSmallScreen = useMediaQuery('(max-width: 600px)')

  function isNativeEmoji(str) {
    return /\p{Emoji}/u.test(str) && isNaN(Number(card))
  }

  let cardFontSize = isNativeEmoji(card) ? 33 : 23
  if (isNativeEmoji(card)) {
    if (length > 1) cardFontSize = 21
    if (length > 2) cardFontSize = 15
    if (length > 3) cardFontSize = 10
  } else {
    if (length > 1) cardFontSize = 20
    if (length > 2) cardFontSize = 18
    if (length > 3) cardFontSize = 15
  }
  if (!isSmallScreen) {
    cardFontSize += 3
  }

  let cardHeight = isSmallScreen ? 84 : 98
  if (useCase === 'playerCard') {
    cardHeight = isSmallScreen ? 92 : 110
  }
  let cardWidth = isSmallScreen ? 50 : 60
  if (useCase === 'playerCard') {
    cardWidth = isSmallScreen ? 57 : 67
  }

  useEffect(() => {
    if (!gameData.gameRoomName) return
    setGameState(gameData.gameState)
    setThisUser(gameData.players[localUserToken])
  }, [gameData])

  const selected = thisUser.currentChoice === card

  return (
    <Box
      onClick={() => {
        if (gameState !== 'voting' || disabled) return
        submitChoice(card)
      }}
      className={gameState === 'voting' && !disabled && 'cursor-pointer'}
      sx={{
        height: cardHeight,
        width: cardWidth,
        minWidth: cardWidth,
        border: '2px solid #902bf5',
        transition: '0.2s',
        position: 'relative',
        bottom: selected ? '20px' : 0,
        display: 'flex',
        justifyContent: 'center',
        backgroundColor: useCase === 'playerCard' ? '#E8E9EA' : (selected ? '#902bf5' : 'transparent'),
        color: selected && '#ffffff',
        alignItems: 'center',
        borderRadius: '10px',
        backgroundImage:
          choice &&
          gameState === 'voting' &&
          useCase === 'playerCard' &&
          `url(${purpleAbstract})`,
        backgroundPosition: 'center',
        backgroundSize: 'cover',
        backgroundRepeat: 'no-repeat',
      }}
    >
      <Typography
        variant="h6"
        sx={{ fontSize: cardFontSize, whiteSpace: 'nowrap' }}
      >
        {useCase === 'playerCard' ? (gameState === 'reveal' && choice) : card}
      </Typography>
    </Box>
  )
}

export default PurplDeckCard
