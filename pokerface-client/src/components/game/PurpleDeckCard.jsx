import React, { useState, useRef, useEffect, useMemo, useContext } from 'react';
import { Popover, useMediaQuery } from '@mui/material';
import Picker from '@emoji-mart/react';
import data from '@emoji-mart/data';
import purpleAbstract from '../../assets/purple-abstract.jpg';
import muiStyles from '../../style/muiStyles';
import { GameContext } from '../../context/GameContext';
import { isTrueOrFalse } from '../../utils/helperFunctions';
import { eventBus } from '../../utils/eventBus';

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
  showFunMenu = false,
}) => {
  const isSmallScreen = useMediaQuery('(max-width: 600px)');
  const isXsScreen = useMediaQuery('(max-width: 400px)');
  const [cardFontSize, setCardFontSize] = useState(23);
  const cardTextRef = useRef();
  const cardSurfaceRef = useRef();
  const { shadowsEnabled } = useContext(GameContext) || {};
  const [menuOpen, setMenuOpen] = useState(false);
  const [lastEmoji, setLastEmoji] = useState(() => {
    const stored = localStorage.getItem('PokerfaceFunLastEmoji');
    if (stored) {
      return stored;
    }
    const emojiMartLast = localStorage.getItem('emoji-mart.last');
    if (!emojiMartLast) {
      return '✨';
    }
    try {
      const parsed = JSON.parse(emojiMartLast);
      return parsed?.native || parsed?.emoji || parsed?.id || '✨';
    } catch (error) {
      return emojiMartLast || '✨';
    }
  });
  const [pickerAnchorEl, setPickerAnchorEl] = useState(null);
  const hoverTimeoutRef = useRef(null);

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

  useEffect(() => {
    return () => {
      if (hoverTimeoutRef.current) {
        clearTimeout(hoverTimeoutRef.current);
      }
    };
  }, []);

  function throwEmoji(emoji) {
    if (!showFunMenu) {
      return;
    }
    const rect = cardSurfaceRef.current?.getBoundingClientRect();
    if (!rect) {
      return;
    }
    eventBus.emit('funThrowEmoji', { emoji, cardRect: rect });
  }

  function persistLastEmoji(emoji, emojiData) {
    const value = emojiData?.native || emojiData?.emoji || emoji;
    if (!value) {
      return;
    }
    setLastEmoji(value);
    localStorage.setItem('PokerfaceFunLastEmoji', value);
    if (emojiData) {
      try {
        localStorage.setItem('emoji-mart.last', JSON.stringify(emojiData));
      } catch (error) {
        localStorage.setItem('emoji-mart.last', value);
      }
    } else {
      localStorage.setItem('emoji-mart.last', value);
    }
  }

  const emojiOptions = useMemo(() => {
    return ['😂', '👏', '🔥', lastEmoji || '✨'];
  }, [lastEmoji]);

  const handleMenuEnter = () => {
    if (!showFunMenu) {
      return;
    }
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
    }
    setMenuOpen(true);
  };

  const handleMenuLeave = () => {
    if (!showFunMenu) {
      return;
    }
    if (pickerAnchorEl) {
      return;
    }
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
    }
    hoverTimeoutRef.current = setTimeout(() => setMenuOpen(false), 140);
  };

  useEffect(() => {
    if (!showFunMenu) {
      setMenuOpen(false);
    }
  }, [showFunMenu]);

  useEffect(() => {
    if (pickerAnchorEl) {
      setMenuOpen(true);
    }
  }, [pickerAnchorEl]);

  const handleEmojiClick = (emoji) => {
    persistLastEmoji(emoji);
    throwEmoji(emoji);
  };

  return (
    <Box
      onClick={() => {
        if (!clickable) {
          return;
        }
        submitChoice(card);
      }}
      onMouseEnter={handleMenuEnter}
      onMouseLeave={handleMenuLeave}
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
        ref={cardSurfaceRef}
        sx={{
          boxShadow: shouldShowShadows
            ? '1px 2px 6px rgba(0, 0, 0, 0.5)'
            : 'none',
          height: cardDimensions.height,
          width: cardDimensions.width,
          minWidth: cardDimensions.width,
          border: !shouldShowShadows && `${borderThickness}px solid ${borderColor}`,
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

      {showFunMenu && menuOpen && (
        <Box
          className='fun-emoji-menu'
          onMouseEnter={handleMenuEnter}
          onMouseLeave={handleMenuLeave}
          onClick={(event) => event.stopPropagation()}
        >
          {emojiOptions.map((emoji, index) => (
            <button
              key={`${emoji}-${index}`}
              className='fun-emoji-button'
              type='button'
              onClick={() => handleEmojiClick(emoji)}
            >
              {emoji}
            </button>
          ))}
          <button
            className='fun-emoji-button fun-emoji-picker'
            type='button'
            onClick={(event) => {
              setPickerAnchorEl(event.currentTarget);
            }}
          >
            +
          </button>
        </Box>
      )}

      <Popover
        open={Boolean(pickerAnchorEl)}
        anchorEl={pickerAnchorEl}
        onClose={() => setPickerAnchorEl(null)}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        transformOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        PaperProps={{
          sx: { borderRadius: '14px', overflow: 'hidden' },
        }}
      >
        <Picker
          data={data}
          onEmojiSelect={(emojiData) => {
            const emojiValue =
              emojiData?.native || emojiData?.emoji || emojiData?.id;
            if (!emojiValue) {
              return;
            }
            persistLastEmoji(emojiValue, emojiData);
            throwEmoji(emojiValue);
            setPickerAnchorEl(null);
          }}
          previewPosition='none'
          theme='light'
        />
      </Popover>

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
