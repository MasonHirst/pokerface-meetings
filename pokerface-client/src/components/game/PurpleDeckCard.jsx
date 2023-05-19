import React, { useState, useRef, useEffect } from 'react'
import { useMediaQuery } from '@mui/material'
import purpleAbstract from '../../assets/purple-abstract.jpg'
import muiStyles from '../../style/muiStyles'
const { Box, Typography } = muiStyles

const PurplDeckCard = ({
  card,
  submitChoice,
  useCase,
  disabled,
  player,
  gameData,
  bottomMessage,
  borderColor,
}) => {
  const localUserToken = localStorage.getItem('localUserToken')
  const [gameState, setGameState] = useState('')
  const choice = player?.currentChoice
  const [thisUser, setThisUser] = useState({})
  const isSmallScreen = useMediaQuery('(max-width: 600px)')
  const [cardFontSize, setCardFontSize] = useState(23)
  const cardTextRef = useRef()

  function isNativeEmoji(str) {
    return /\p{Emoji}/u.test(str) && isNaN(Number(str))
  }

  useEffect(() => {
    if (useCase === 'playerCard') setCardFontSize(28)
    if (isNativeEmoji(card)) {
      setCardFontSize(34)
    } else setCardFontSize(23)
  }, [card])

  let cardHeight = 98
  let cardWidth = 60

  if (isSmallScreen) {
    cardHeight = cardHeight * 0.9
    cardWidth = cardWidth * 0.9
  }
  if (isSmallScreen && useCase === 'playerCard') {
    cardHeight = cardHeight * .85
    cardWidth = cardWidth * .85
  }

  useEffect(() => {
    if (isSmallScreen) {
      setCardFontSize(cardFontSize * 0.9)
    } else {
      setCardFontSize(isNativeEmoji(card) ? 34 : 23)
    }
  }, [isSmallScreen])

  if (useCase === 'playerCard') {
    cardHeight = cardHeight * 1.2
    cardWidth = cardWidth * 1.2
  }

  if (useCase === 'customDeckPreview') {
    cardHeight = cardHeight * 0.9
    cardWidth = cardWidth * 0.9
  }

  useEffect(() => {
    if (!gameData || !gameData.gameRoomName) return
    setGameState(gameData.gameState)
    setThisUser(gameData.players[localUserToken])
  }, [gameData])

  const selected = thisUser?.currentChoice === card && useCase === 'votingCard'

  useEffect(() => {
    if (!cardTextRef.current) return
    const fontWidth = cardTextRef.current.clientWidth
    if (fontWidth > cardWidth - 6) {
      setCardFontSize(cardFontSize - 1)
    }
  }, [
    cardTextRef.current,
    card,
    cardFontSize,
    gameState,
    cardWidth,
    cardFontSize,
  ])

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
      }}
    >
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
          border: `2px solid ${borderColor}`,
          transition: '0.2s',
          marginTop: useCase === 'votingCard' ? '20px' : 0,
          position: 'relative',
          bottom: selected ? '20px' : 0,
          display: 'flex',
          justifyContent: 'center',
          backgroundColor:
            useCase === 'playerCard'
              ? '#E8E9EA'
              : selected
              ? '#902bf5'
              : 'transparent',
          color: selected && useCase !== 'playerCard' && '#ffffff',
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
          ref={cardTextRef}
        >
          {useCase === 'playerCard' ? gameState === 'reveal' && choice : card}
        </Typography>
      </Box>

      {bottomMessage && (
        <Typography
          variant="subtitle1"
          sx={{ fontSize: isSmallScreen ? 15 : 17, marginTop: useCase === 'playerCard' ? '5px' : 0 }}
        >
          {bottomMessage}
        </Typography>
      )}
    </Box>
  )
}

export default PurplDeckCard
