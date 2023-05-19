import React, { useState, useRef } from 'react'
import GraphemeSplitter from 'grapheme-splitter'
import data from '@emoji-mart/data'
import Picker from '@emoji-mart/react'
import { useMediaQuery } from '@mui/material'
import muiStyles from '../../style/muiStyles'
const {
  Box,
  Typography,
  Button,
  Dialog,
  TextField,
  IconButton,
  EmojiEmotionsOutlinedIcon,
  StyleIcon,
  DeleteOutlineIcon,
  CloseIcon,
  MenuItem,
  ChevronLeftIcon,
  InfoOutlinedIcon,
  Switch,
  FormControlLabel,
  Divider,
} = muiStyles

const ChooseDeck = ({ showDeckDialog, setShowDeckDialog, setDeckProp }) => {
  const deckInputRef = useRef()
  const isSmallScreen = useMediaQuery('(max-width: 600px)')
  const [autoCommas, setAutoCommas] = useState(true)
  const splitter = GraphemeSplitter()
  const [customDeckName, setCustomDeckName] = useState('')
  const [customDeck, setCustomDeck] = useState('1,2,👍,true')
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)
  const [showCustomDeckForm, setShowCustomDeckForm] = useState(false)
  const viewportWidth = window.innerWidth
  const defaultDecks = [
    { values: '1, 2, 3, 5, 8, 13, 21, 34, 55, 89, ?, ☕', name: 'Fibonacci' },
    { values: '1, 2, 3, 4, 5, 6, 7, 8, 9, 10', name: 'Scale 1-10' },
    { values: '🟢, 🟡, 🔴', name: 'Traffic light' },
    { values: '👍, 👎, 😐', name: 'Thumbs' },
  ]
  const [savedDecks, setSavedDecks] = useState(
    JSON.parse(localStorage.getItem('savedDecks'))
  )

  function isNativeEmoji(str) {
    return /\p{Emoji}/u.test(str) && isNaN(Number(str))
  }

  function setDeckInStorage() {
    if (!customDeck) return
    const obj = {
      values: customDeck,
      name: customDeckName || 'Custom Deck',
    }

    let alreadyExists = false
    savedDecks.forEach((deck) => {
      if (deck.values === obj.values && deck.name === obj.name) alreadyExists = true
    })
    
    const savedDecks = JSON.parse(localStorage.getItem('savedDecks'))
    if (savedDecks?.length) {
      localStorage.setItem('savedDecks', JSON.stringify([...savedDecks, obj]))
    } else {
      localStorage.setItem('savedDecks', JSON.stringify([obj]))
    }
    setSavedDecks(JSON.parse(localStorage.getItem('savedDecks')))
  }

  // map through the default decks and return a Button for each one
  function mapDeckButtons(decks, isCustom) {
    const mappedDeckButtons = decks.map((deck, index) => {
      return (
        <Box
          key={index}
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <MenuItem
            onClick={() => {
              setDeckProp(deck.values)
              setShowDeckDialog(false)
            }}
            sx={{ marginLeft: '-8px', padding: '8px' }}
          >
            <Typography
              variant="body2"
              sx={{
                textTransform: 'none',
                color: 'black',
                fontSize: { xs: '16px', sm: '20px' },
              }}
            >
              {deck.name} ({deck.values})
            </Typography>
          </MenuItem>
          {isCustom && (
            <IconButton
              onClick={() => {
                const newSavedDecks = savedDecks.filter((d) => d !== deck)
                localStorage.setItem(
                  'savedDecks',
                  JSON.stringify(newSavedDecks)
                )
                setSavedDecks(newSavedDecks)
              }}
            >
              <DeleteOutlineIcon color="error" />
            </IconButton>
          )}
        </Box>
      )
    })
    return mappedDeckButtons
  }

  let mappedCustomDeck
  if (customDeck.includes(',')) {
    mappedCustomDeck = [...new Set(customDeck.split(','))].map(
      (card, index) => {
        let length = splitter.splitGraphemes(card.trim()).length
        if (length > 4) return

        let cardFontSize = isNativeEmoji(card) ? 28 : 20
        if (isNativeEmoji(card)) {
          if (length > 1) cardFontSize = 17
          if (length > 2) cardFontSize = 14
          if (length > 3) cardFontSize = 11
        } else {
          if (length > 2) cardFontSize = 18
          if (length > 3) cardFontSize = 16
        }

        return (
          <Box
            key={index}
            sx={{
              height: 84,
              width: 50,
              minWidth: 50,
              border: '2px solid #902bf5',
              transition: '0.2s',
              marginTop: '0',
              display: 'flex',
              justifyContent: 'center',
              backgroundColor: 'transparent',
              color: 'black',
              alignItems: 'center',
              borderRadius: '10px',
            }}
          >
            <Typography
              variant="h6"
              sx={{ fontSize: cardFontSize, whiteSpace: 'nowrap' }}
            >
              {card}
            </Typography>
          </Box>
        )
      }
    )
  }

  return (
    <Dialog
      onClose={() => setShowDeckDialog(false)}
      fullScreen={isSmallScreen}
      PaperProps={{
        style: {
          borderRadius: 12,
          padding: isSmallScreen ? '35px 8px' : '35px 20px',
          minWidth: !isSmallScreen && 'min(calc(100vw - 18px), 800px)',
          height: 'clamp(500px, 100vh, 1000px)',
          display: 'flex',
        },
      }}
      open={showDeckDialog}
    >
      {!showCustomDeckForm ? (
        <>
          <Typography variant="h5" align="center" color="primary">
            Default decks
          </Typography>
          <Box
            sx={{
              paddingTop: '20px',
              marginBottom: '20px',
              overflowX: 'scroll',
            }}
          >
            {mapDeckButtons(defaultDecks, false)}
          </Box>
          <Typography variant="h5" align="center" color="primary">
            Saved decks
          </Typography>
          <Box
            sx={{
              paddingTop: '20px',
              marginBottom: '20px',
              overflowX: 'scroll',
            }}
          >
            {savedDecks.length > 0 ? (
              mapDeckButtons(savedDecks, true)
            ) : (
              <Typography sx={{ opacity: 0.7 }}>No saved decks</Typography>
            )}
          </Box>

          <Button
            onClick={() => setShowCustomDeckForm(!showCustomDeckForm)}
            endIcon={<StyleIcon />}
            variant="contained"
            sx={{ textTransform: 'none', fontSize: '17px' }}
          >
            Create custom deck
          </Button>
        </>
      ) : (
        <Box
          style={{
            display: 'flex',
            gap: '15px',
            flexDirection: 'column',
            borderRadius: '12px',
          }}
        >
          <IconButton
            sx={{ position: 'absolute', top: 7, left: 5 }}
            onClick={() => {
              setShowCustomDeckForm(false)
              setCustomDeck('')
            }}
          >
            <ChevronLeftIcon fontSize="large" />
          </IconButton>
          <Typography variant="h6" align="center">
            Create a custom deck
          </Typography>
          <TextField
            autoFocus
            fullWidth
            label="Deck Name"
            placeholder="Enter a name for your deck"
            onChange={(e) => setCustomDeckName(e.target.value)}
          />
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <TextField
              inputRef={deckInputRef}
              value={customDeck}
              spellCheck={false}
              onChange={(e) => setCustomDeck(e.target.value)}
              fullWidth
              label="Custom Deck"
              placeholder="Enter a comma-separated list of values"
            />
            <IconButton
              sx={{
                width: isSmallScreen ? '35px' : '50px',
                height: isSmallScreen ? '35px' : '50px',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
              }}
              onClick={() => setShowEmojiPicker(!showEmojiPicker)}
            >
              <EmojiEmotionsOutlinedIcon />
            </IconButton>
          </Box>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: '5px',
              marginTop: '-9px',
            }}
          >
            <InfoOutlinedIcon fontSize="small" color="primary" />
            <Typography variant="body2" color="primary">
              Enter up to 4 characters per value, separated by commas.
            </Typography>
          </Box>
          {showEmojiPicker && (
            <>
              <FormControlLabel
                control={
                  <Switch
                    defaultChecked
                    onChange={(e) => setAutoCommas(e.target.checked)}
                    color="primary"
                  />
                }
                label="Add commas automatically"
                sx={{ marginTop: '-10px' }}
              />
              <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                <Picker
                  previewPosition="none"
                  perLine={Math.min(Math.floor(viewportWidth / 42), 20)}
                  data={data}
                  autoFocus
                  maxFrequentRows={1}
                  onEmojiSelect={(event) => {
                    deckInputRef.current.focus()
                    if (!autoCommas)
                      return setCustomDeck(customDeck + event.native)
                    if (customDeck[customDeck.length - 1] === ',') {
                      setCustomDeck(customDeck + event.native)
                    } else if (customDeck.length) {
                      setCustomDeck(customDeck + ',' + event.native)
                    } else {
                      setCustomDeck(customDeck + event.native)
                    }
                  }}
                  theme="light"
                />
              </Box>
            </>
          )}

          <Divider />

          <Typography variant="h6" sx={{ marginTop: '10px' }}>
            Preview
          </Typography>
          <Typography
            variant="body2"
            sx={{ marginTop: '-10px', marginBottom: '10px' }}
          >
            This is a preview of your custom deck
          </Typography>
          <Box
            sx={{
              minHeight: '50px',
              display: 'flex',
              overflowX: 'scroll',
              gap: '10px',
              paddingBottom: '8px',
            }}
          >
            {mappedCustomDeck}
          </Box>

          <Button
            variant="contained"
            type="submit"
            fullWidth
            onClick={() => {
              if (!customDeck.length > 1) alert('Cannot save empty deck')
              setShowCustomDeckForm(false)
              setDeckInStorage()
            }}
          >
            Save Deck
          </Button>
        </Box>
      )}
      <IconButton
        sx={{ position: 'absolute', top: 7, right: 5 }}
        aria-label="close"
        onClick={() => {
          setShowDeckDialog(!showDeckDialog)
        }}
      >
        <CloseIcon />
      </IconButton>
    </Dialog>
  )
}

export default ChooseDeck
