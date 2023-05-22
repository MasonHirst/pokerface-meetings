import React, { useState, useRef, useEffect } from 'react'
import { useMediaQuery } from '@mui/material'
import purpleAbstract from '../../assets/purple-abstract.jpg'
import muiStyles from '../../style/muiStyles'
const { Box, Typography } = muiStyles

const PurpleDeckCard = ({
  card = '',
  submitChoice,
  useCase,
  clickable = false,
  bottomMessage,
  bottomMessageMargin = '0',
  borderColor = '#902bf5',
  bgColor = 'transparent',
  selectedBgColor = '#902bf5',
  showBgImage = false,
  selected,
  cardImage,
  fontSizeMultiplier = 1,
  gameState,
  showCard = true,
  sizeMultiplier = 1,
  borderThickness = 2,
}) => {
  const isSmallScreen = useMediaQuery('(max-width: 600px)')
  const [cardFontSize, setCardFontSize] = useState(23)
  const cardTextRef = useRef()

  function isNativeEmoji(str) {
    return /\p{Emoji}/u.test(str) && isNaN(Number(str))
  }

  useEffect(() => {
    if (isNativeEmoji(card)) {
      setCardFontSize(34 * fontSizeMultiplier)
    } else setCardFontSize(23 * fontSizeMultiplier)
  }, [card])

  let cardHeight = 98 * sizeMultiplier
  let cardWidth = 62 * sizeMultiplier

  if (isSmallScreen) {
    cardHeight = cardHeight * 0.65
    cardWidth = cardWidth * 0.65
  }

  useEffect(() => {
    if (isSmallScreen) {
      setCardFontSize(cardFontSize * 0.9)
    } else {
      setCardFontSize(isNativeEmoji(card) ? 34 : 23)
    }
  }, [isSmallScreen])

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
          if (!clickable) return
          submitChoice(card)
        }}
        className={clickable && 'cursor-pointer'}
        sx={{
          height: cardHeight,
          width: cardWidth,
          minWidth: cardWidth,
          border: `${borderThickness}px solid ${borderColor || '#902bf5'}`,
          transition: '0.2s',
          marginTop: useCase === 'votingCard' ? '20px' : 0,
          position: 'relative',
          bottom: selected ? '20px' : 0,
          display: 'flex',
          justifyContent: 'center',
          backgroundColor:
            selected ? selectedBgColor : bgColor ,
          color: selected && '#ffffff',
          alignItems: 'center',
          borderRadius: `${cardHeight / 12}px`,
          backgroundImage:
          showBgImage &&
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
          {showCard && card}
        </Typography>
      </Box>

      {bottomMessage && (
        <Typography
          variant="subtitle1"
          sx={{ userSelect: 'none', fontSize: isSmallScreen ? 15 : 17, margin: bottomMessageMargin }}
        >
          {bottomMessage}
        </Typography>
      )}
    </Box>
  )
}

export default PurpleDeckCard
