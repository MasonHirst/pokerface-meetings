import React, { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import data from '@emoji-mart/data'
import Picker from '@emoji-mart/react'
import axios from 'axios'
import muiStyles from '../../style/muiStyles'
const {
  Box,
  TextField,
  Button,
  Dialog,
  Typography,
  IconButton,
  EmojiEmotionsOutlinedIcon,
  StyleIcon,
  TvIcon,
  MenuItem,
} = muiStyles

const CreateGamePage = () => {
  const [selectedDeck, setSelectedDeck] = useState(
    '1,2,3,5,8,13,21,34,55,89,?,☕'
  )
  const navigate = useNavigate()
  const [showDeckDialog, setShowDeckDialog] = useState(false)
  const [gameName, setGameName] = useState('')
  const [customDeck, setCustomDeck] = useState('')
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)
  const [showCustomDeckForm, setShowCustomDeckForm] = useState(false)
  const defaultDecks = [
    '1,2,3,5,8,13,21,34,55,89,?,☕',
    '1,2,3,4,5,6,7,8,9,10',
    '🟢,🟡,🔴',
    '👍,👎,😐',
  ]
  const [error, setError] = useState('')
  const [appIsLoading, setAppIsLoading] = useState(false)

  function isNativeEmoji(str) {
    return /\p{Emoji}/u.test(str) && isNaN(Number(str))
  }

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

  const mappedSelectedDeck = [...new Set(selectedDeck.split(','))].map(
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
          <Typography
            variant="h6"
            sx={{ fontSize: isNativeEmoji(card) ? 22 : 18 }}
          >
            {card}
          </Typography>
        </Box>
      )
    }
  )

  // map through the default decks and return a Button for each one
  const defaultDecksButtons = defaultDecks.map((deck, index) => {
    return (
      <MenuItem
        key={index}
        onClick={() => {
          setSelectedDeck(deck)
          setShowDeckDialog(false)
        }}
      >
        <Typography
          sx={{ textTransform: 'none', color: 'black', fontSize: '20px' }}
        >
          {deck}
        </Typography>
      </MenuItem>
    )
  })

  // check if there is an array of saved decks in local storage, then map through them and return a Button for each one
  const savedDecks = JSON.parse(localStorage.getItem('savedDecks'))
  const savedDecksButtons = savedDecks?.map((deck, index) => {
    return (
      <MenuItem
        key={index}
        onClick={() => {
          setSelectedDeck(deck)
          setShowDeckDialog(false)
        }}
      >
        <Typography
          sx={{ textTransform: 'none', fontSize: '20px', color: 'black' }}
        >
          {deck}
        </Typography>
      </MenuItem>
    )
  })

  function handleHostGame(e) {
    setError('')
    e.preventDefault()
    if (!gameName) return setError('Please enter a game name')
    setAppIsLoading(true)
    axios
      .post('game/create', { gameName, deck: selectedDeck })
      .then(({ data }) => {
        // console.log('create game data', data)
        if (data.gameRoomId) {
          navigate(`/game/${data.gameRoomId}`)
        } else {
          setError('Error creating game')
        }
      })
      .catch(console.error)
      .finally(() => setAppIsLoading(false))
  }

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
    <Box
      sx={{
        width: '100vw',
        minHeight: '100vh',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '0 15px',
      }}
    >
      <form
        onSubmit={handleHostGame}
        style={{
          width: 'min(100%, 700px)',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          gap: '30px',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <TextField
          onChange={(e) => setGameName(e.target.value)}
          fullWidth
          autoFocus
          disabled={appIsLoading}
          error={!!error}
          value={gameName}
          label="Game Name"
          placeholder="Enter a game name"
          helperText={error}
        />

        <Box sx={{ display: 'flex', gap: '10px', overflowX: 'auto' }}>
          {mappedSelectedDeck}
        </Box>

        <Button
          onClick={() => setShowDeckDialog(!showDeckDialog)}
          color="secondary"
          variant="contained"
          sx={{ textTransform: 'none', fontSize: '17px' }}
          startIcon={<StyleIcon />}
        >
          Change Deck
        </Button>

        <Button
          variant="contained"
          disabled={appIsLoading}
          fullWidth
          onClick={handleHostGame}
          startIcon={<TvIcon />}
        >
          Create Game Room
        </Button>
      </form>

      {showDeckDialog && (
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
          <Typography variant="h5" align="center">
            Default decks
          </Typography>
          {defaultDecksButtons}
          {savedDecks?.length && (
            <>
              <Typography variant="h5" align="center">
                Saved custom decks
              </Typography>
              <Box
                sx={{
                  padding: '20px 0',
                }}
              >
                {savedDecksButtons}
              </Box>
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
                  theme="light"
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
      )}
    </Box>
  )
}

export default CreateGamePage
