import React, { useState, useRef, useEffect, useMemo, useContext } from 'react';
import { useMediaQuery } from '@mui/material';
import purpleAbstract from '../../assets/purple-abstract.jpg';
import muiStyles from '../../style/muiStyles';
import { GameContext } from '../../context/GameContext';
import { isTrueOrFalse } from '../../utils/helperFunctions';

const { Box, Typography } = muiStyles;

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
  showShadow = false,
}) => {
  const isSmallScreen = useMediaQuery('(max-width: 600px)');
  const isXsScreen = useMediaQuery('(max-width: 400px)');
  const [cardFontSize, setCardFontSize] = useState(23);
  const cardTextRef = useRef();
  const { shadowsEnabled } = useContext(GameContext) || {};

  function isNativeEmoji(str) {
    return /\p{Emoji}/u.test(str) && isNaN(Number(str));
  }

  const splitText = useMemo(() => {
    if (!card) {
      return [];
    }
    return card.trim().split('\\');
  }, [card]);

  const cardTextElements = useMemo(() => {
    if (!splitText?.length > 0) {
      return;
    }
    return splitText.map((text, index) => {
      return (
        <span key={index} style={{ display: 'block' }}>
          {text}
        </span>
      );
    });
  }, [splitText]);

  const shouldShowShadows = useMemo(() => {
    //? Next line is for when the cards are shown, but gameContext is not rendered yet
    if (!isTrueOrFalse(shadowsEnabled)) {
      return showShadow;
    } else {
      return shadowsEnabled && showShadow;
    }
  }, [shadowsEnabled, showShadow]);

  useEffect(() => {
    if (isNativeEmoji(card)) {
      setCardFontSize(34 * fontSizeMultiplier);
    } else {
      setCardFontSize(23 * fontSizeMultiplier);
    }
  }, [card]);

  const cardDimensions = useMemo(() => {
    let cardHeight = 98 * sizeMultiplier;
    let cardWidth = 62 * sizeMultiplier;

    if (isXsScreen) {
      cardHeight = cardHeight * 0.6;
      cardWidth = cardWidth * 0.6;
    } else if (isSmallScreen) {
      cardHeight = cardHeight * 0.7;
      cardWidth = cardWidth * 0.7;
    }
    return { height: cardHeight, width: cardWidth };
  }, [sizeMultiplier, isXsScreen, isSmallScreen]);

  useEffect(() => {
    if (isSmallScreen) {
      setCardFontSize(cardFontSize * 0.9);
    } else {
      setCardFontSize(isNativeEmoji(card) ? 34 : 23);
    }
  }, [isSmallScreen]);

  useEffect(() => {
    if (!cardTextRef.current) {
      return;
    }
    const fontWidth = cardTextRef.current.clientWidth;
    const fontHeight = cardTextRef.current.clientHeight;
    const isBiggerThanCard =
      fontWidth > cardDimensions.width - 8 ||
      fontHeight > cardDimensions.height - 6;

    if (isBiggerThanCard && cardFontSize > 5) {
      setCardFontSize((prev) => prev - 0.5);
    }
  }, [cardTextRef.current, splitText, cardFontSize, cardDimensions]);

  return (
    <Box
      onClick={() => {
        if (!clickable) {
          return;
        }
        submitChoice(card);
      }}
      className={
        clickable ? 'cursor-pointer no-tap-highlight' : 'no-tap-highlight'
      }
      // className="no-tap-highlight"
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        minWidth: bottomMessage && `${cardDimensions.width + 10}px`,
        position: 'relative',
        bottom: selected ? '15px' : 0,
        transition: '0.2s',
      }}
    >
      <Box
        sx={{
          boxShadow: shouldShowShadows
            ? '1px 2px 6px rgba(0, 0, 0, 0.5)'
            : 'none',
          height: cardDimensions.height,
          width: cardDimensions.width,
          minWidth: cardDimensions.width,
          border:
            !shouldShowShadows && `${borderThickness}px solid ${borderColor}`,
          transition: '0.2s',
          margin: cardMargin,
          display: 'flex',
          justifyContent: 'center',
          backgroundColor: selected ? selectedBgColor : bgColor,
          color: selected && '#ffffff',
          alignItems: 'center',
          borderRadius: `${cardDimensions.height / 12}px`,
          backgroundImage:
            showBgImage && `url(${cardImage ? cardImage : purpleAbstract})`,
          backgroundPosition: 'center',
          backgroundSize: 'cover',
          backgroundRepeat: 'no-repeat',
        }}
      >
        <Typography
          variant='h6'
          sx={{
            fontSize: cardFontSize,
            userSelect: 'none',
            textAlign: 'center',
            lineHeight: 1.1,
          }}
          ref={cardTextRef}
        >
          {cardTextElements}
        </Typography>
      </Box>

      {bottomMessage && (
        <Typography
          variant='subtitle1'
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
  );
};

export default PurpleDeckCard;
