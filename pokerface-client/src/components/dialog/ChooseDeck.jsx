import React, { useState } from 'react'
import data from '@emoji-mart/data'
import Picker from '@emoji-mart/react'
import muiStyles from '../../style/muiStyles'
const { Box, Typography, Button, Dialog, TextField, IconButton, EmojiEmotionsOutlinedIcon, StyleIcon } = muiStyles

const ChooseDeck = ({showDeckDialog, setShowDeckDialog, setDeckProp}) => {
  const [customDeck, setCustomDeck] = useState(
    '1,2,3,5,8,13,21,34,55,89,?,☕'
  )
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)
  const [showCustomDeckForm, setShowCustomDeckForm] = useState(false)
  const defaultDecks = [
    '1,2,3,5,8,13,21,34,55,89,?,☕',
    '1,2,3,4,5,6,7,8,9,10',
    '🟢,🟡,🔴',
    '👍,👎,😐',
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
      <Button
        key={index}
        onClick={() => {
          setDeckProp(deck)
          setShowDeckDialog(false)
        }}
      >
        <Typography
          sx={{ textTransform: 'none', color: 'black', fontSize: '20px' }}
        >
          {deck}
        </Typography>
      </Button>
    )
  })

  // check if there is an array of saved decks in local storage, then map through them and return a Button for each one
  const savedDecks = JSON.parse(localStorage.getItem('savedDecks'))
  const savedDecksButtons = savedDecks?.map((deck, index) => {
    return (
      <Button
        key={index}
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
      </Button>
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
          PaperProps={{
            style: {
              borderRadius: 12,
              padding: '20px 30px',
              width: 'min(calc(100vw - 20px), 500px)',
              minHeight: 300,
              display: 'flex',
            },
          }}
          open={showDeckDialog}
        >
          <Typography variant="h5">Choose a deck</Typography>
          {defaultDecksButtons}
          {savedDecks && savedDecks.length > 0 && (
            <>
              <Typography>Saved custom decks</Typography>
              {savedDecksButtons}
            </>
          )}

          {!showCustomDeckForm && (
            <Button
              onClick={() => setShowCustomDeckForm(!showCustomDeckForm)}
              endIcon={<StyleIcon />}
              variant="contained"
              sx={{ textTransform: 'none', fontSize: '17px' }}
            >
              Create custom deck
            </Button>
          )}

          {showCustomDeckForm && (
            <Box
              style={{
                display: 'flex',
                padding: '5px',
                gap: '15px',
                flexDirection: 'column',
                backgroundColor: 'rgba(181, 181, 181, 0.1)',
                borderRadius: '12px',
              }}
            >
              <Typography variant="h6">
                List values separated by commas
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
                    theme='light'
                  />
                )}
              <Box
                sx={{
                  minHeight: '50px',
                  display: 'flex',
                  overflowX: 'scroll',
                  gap: '10px',
                }}
              >
                {mappedCustomDeck}
              </Box>
              <Box sx={{ display: 'flex', gap: '15px' }}>
                <Button
                  variant="contained"
                  fullWidth
                  color="error"
                  onClick={() => {
                    setShowCustomDeckForm(false)
                    setCustomDeck('')
                  }}
                >
                  Cancel
                </Button>

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
            </Box>
          )}
        </Dialog>
  )
}

export default ChooseDeck