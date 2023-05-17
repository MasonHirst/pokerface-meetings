import React, { useState } from 'react'
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
} = muiStyles

const ChooseDeck = ({ showDeckDialog, setShowDeckDialog, setDeckProp }) => {
  const isSmallScreen = useMediaQuery('(max-width: 600px)')
  const [customDeck, setCustomDeck] = useState('1,2,3,5,8,13,21,34,55,89,?,☕')
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)
  const [showCustomDeckForm, setShowCustomDeckForm] = useState(false)
  const defaultDecks = [
    { values: '1, 2, 3, 5, 8, 13, 21, 34, 55, 89, ?, ☕', name: 'Fibonacci' },
    { values: '1, 2, 3, 4, 5, 6, 7, 8, 9, 10', name: '?/10' },
    { values: '🟢, 🟡, 🔴', name: 'Traffic light' },
    { values: '👍, 👎, 😐', name: 'Thumbs' },
  ]

  function setDeckInStorage() {
    if (!customDeck) return
    const savedDecks = JSON.parse(localStorage.getItem('savedDecks'))
    if (savedDecks?.length) {
      localStorage.setItem(
        'savedDecks',
        JSON.stringify([...savedDecks, customDeck])
      )
    } else {
      localStorage.setItem('savedDecks', JSON.stringify([customDeck]))
    }
  }

  // map through the default decks and return a Button for each one
  const defaultDecksButtons = defaultDecks.map((deck, index) => {
    return (
      <MenuItem
        key={index}
        onClick={() => {
          setDeckProp(deck.values)
          setShowDeckDialog(false)
        }}
        sx={{marginLeft: '-8px', padding: '8px'}}
      >
        <Typography
          variant="body2"
          sx={{ textTransform: 'none', color: 'black', fontSize: {xs: '16px', sm: '20px'} }}
        >
          {deck.name} ({deck.values})
        </Typography>
      </MenuItem>
    )
  })

  // check if there is an array of saved decks in local storage, then map through them and return a Button for each one
  const savedDecks = JSON.parse(localStorage.getItem('savedDecks'))
  const savedDecksButtons = savedDecks?.map((deck, index) => {
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
            setDeckProp(deck)
            setShowDeckDialog(false)
          }}
        >
          <Typography
            sx={{ textTransform: 'none', fontSize: '20px', color: 'black' }}
          >
            {deck}
          </Typography>
        </MenuItem>
        <IconButton
          onClick={() => {
            const newSavedDecks = savedDecks.filter((d) => d !== deck)
            localStorage.setItem('savedDecks', JSON.stringify(newSavedDecks))
          }}
        >
          <DeleteOutlineIcon color="error" />
        </IconButton>
      </Box>
    )
  })

  let mappedCustomDeck
  if (customDeck.includes(',')) {
    mappedCustomDeck = [...new Set(customDeck.split(','))].map(
      (card, index) => {
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
            <Typography variant="h6" sx={{ fontSize: 18 }}>
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
          minWidth: !isSmallScreen && 'min(calc(100vw - 18px), 750px)',
          height: 600,
          minHeight: 300,
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
          <Box sx={{ paddingTop: '20px', marginBottom: '20px', overflowX: 'scroll' }}>{defaultDecksButtons}</Box>
          <Typography variant="h5" align="center" color="primary">
            Saved decks
          </Typography>
          {savedDecks && savedDecks.length > 0 && (
            <>
              <Typography variant="h5" align="center">
                Custom decks
              </Typography>
              <Box sx={{ paddingTop: '20px', marginBottom: '20px', overflowX: 'scroll' }}>{savedDecksButtons}</Box>
            </>
          )}

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
            padding: '5px',
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
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <TextField
              value={customDeck}
              spellCheck={false}
              onChange={(e) => setCustomDeck(e.target.value)}
              fullWidth
              autoFocus
              label="Custom Deck"
              placeholder="Enter a comma-separated list of values"
            />
            <IconButton
              sx={{
                width: '50px',
                height: '50px',
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
              Enter up to 3 characters per value, separated by commas.
            </Typography>
          </Box>
          {showEmojiPicker && (
            <Picker
              data={data}
              autoFocus
              maxFrequentRows={1}
              onEmojiSelect={(event) => {
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
          )}
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
