import React, { useState, useRef, useEffect } from 'react'
import { useMediaQuery } from '@mui/material'
import purpleAbstract from '../../assets/purple-abstract.jpg'
import muiStyles from '../../style/muiStyles'
const { Box, Typography } = muiStyles

const PurpleDeckCard = ({
  card,
  submitChoice,
  useCase,
  disabled,
  bottomMessage,
  borderColor,
  thisUser,
  cardImage,
  gameState,
  sizeMultiplier,
}) => {
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

  let cardHeight = sizeMultiplier ? 98 * sizeMultiplier : 98
  let cardWidth = sizeMultiplier ?  60 * sizeMultiplier : 60

  if (isSmallScreen) {
    cardHeight = cardHeight * 0.7
    cardWidth = cardWidth * 0.7
  }
  if (isSmallScreen && useCase === 'playerCard') {
    cardHeight = cardHeight * .9
    cardWidth = cardWidth * .9
  }

  useEffect(() => {
    if (isSmallScreen) {
      setCardFontSize(cardFontSize * 0.9)
    } else {
      setCardFontSize(isNativeEmoji(card) ? 34 : 23)
    }
  }, [isSmallScreen])

  // if (useCase === 'playerCard') {
  //   cardHeight = cardHeight * 1.2
  //   cardWidth = cardWidth * 1.2
  // }

  // if (useCase === 'customDeckPreview') {
  //   cardHeight = cardHeight * 0.9
  //   cardWidth = cardWidth * 0.9
  // }

  const selected = useCase === 'votingCard' && thisUser?.currentChoice === card

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
          borderRadius: `${cardHeight / 12}px`,
          backgroundImage:
            card &&
            gameState === 'voting' &&
            useCase === 'playerCard' &&
            `url(${cardImage ? cardImage : purpleAbstract})`,
          backgroundPosition: 'center',
          backgroundSize: 'cover',
          backgroundRepeat: 'no-repeat',
        }}
      >
        <Typography
          variant="h6"
          sx={{ fontSize: cardFontSize, whiteSpace: 'nowrap', userSelect: 'none' }}
          ref={cardTextRef}
        >
          {useCase === 'playerCard' ? gameState === 'reveal' && card : card}
        </Typography>
      </Box>

      {bottomMessage && (
        <Typography
          variant="subtitle1"
          sx={{ userSelect: 'none', fontSize: isSmallScreen ? 15 : 17, marginTop: useCase === 'playerCard' ? '5px' : 0 }}
        >
          {bottomMessage}
        </Typography>
      )}
    </Box>
  )
}

export default PurpleDeckCard
