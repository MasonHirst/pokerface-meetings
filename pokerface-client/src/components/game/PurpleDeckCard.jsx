import React, { useState, useRef, useEffect } from 'react'
import { useMediaQuery } from '@mui/material'
import purpleAbstract from '../../assets/purple-abstract.jpg'
import muiStyles from '../../style/muiStyles'

const { Box, Typography } = muiStyles

const PurpleDeckCard = ({
  card = '',
  submitChoice,
  cardMargin,
  clickable = false,
  bottomMessage,
  bottomMessageMultiplier = 1,
  bottomMessageMargin = '0',
  borderColor = '#9c4fd7',
  bgColor = '#ffffff',
  selectedBgColor = '#9c4fd7',
  showBgImage = false,
  selected,
  cardImage,
  fontSizeMultiplier = 1,
  sizeMultiplier = 1,
  borderThickness = 2,
}) => {
  const isSmallScreen = useMediaQuery('(max-width: 600px)')
  const isXsScreen = useMediaQuery('(max-width: 400px)')
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

  if (isXsScreen) {
    cardHeight = cardHeight * 0.6
    cardWidth = cardWidth * 0.6
  } else if (isSmallScreen) {
    cardHeight = cardHeight * 0.7
    cardWidth = cardWidth * 0.7
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
  }, [cardTextRef.current, card, cardFontSize, cardWidth, cardFontSize])

  return (
    <Box
      onClick={() => {
        if (!clickable) return
        submitChoice(card)
      }}
      className={clickable && 'cursor-pointer'}
      // className="no-tap-highlight"
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        minWidth: bottomMessage && `${cardWidth + 10}px`,
        position: 'relative',
        bottom: selected ? '15px' : 0,
        transition: '0.2s',
      }}
    >
      <Box
        sx={{
          height: cardHeight,
          width: cardWidth,
          minWidth: cardWidth,
          border: `${borderThickness}px solid ${borderColor}`,
          transition: '0.2s',
          margin: cardMargin,

          display: 'flex',
          justifyContent: 'center',
          backgroundColor: selected ? selectedBgColor : bgColor,
          color: selected && '#ffffff',
          alignItems: 'center',
          borderRadius: `${cardHeight / 12}px`,
          backgroundImage:
            showBgImage && `url(${cardImage ? cardImage : purpleAbstract})`,
          backgroundPosition: 'center',
          backgroundSize: 'cover',
          backgroundRepeat: 'no-repeat',
        }}
      >
        <Typography
          variant="h6"
          sx={{
            fontSize: cardFontSize,
            whiteSpace: 'nowrap',
            userSelect: 'none',
          }}
          ref={cardTextRef}
        >
          {card}
        </Typography>
      </Box>

      {bottomMessage && (
        <Typography
          variant="subtitle1"
          sx={{
            userSelect: 'none',
            whiteSpace: 'nowrap',
            fontSize: isSmallScreen
              ? 15 * bottomMessageMultiplier
              : 17 * bottomMessageMultiplier,
            margin: bottomMessageMargin,
          }}
        >
          {bottomMessage}
        </Typography>
      )}
    </Box>
  )
}

export default PurpleDeckCard
