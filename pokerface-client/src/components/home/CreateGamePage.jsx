import React, { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import ChooseDeck from '../dialog/ChooseDeck'
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
  const [error, setError] = useState('')
  const [appIsLoading, setAppIsLoading] = useState(false)

  function isNativeEmoji(str) {
    return /\p{Emoji}/u.test(str) && isNaN(Number(str))
  }

  const mappedSelectedDeck = [...new Set(selectedDeck.split(','))].map(
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

  return (
    <Box
      sx={{
        width: '100vw',
        minHeight: '100vh',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '0 8px',
      }}
    >
      <form
        onSubmit={handleHostGame}
        style={{
          width: '100%',
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
          sx={{ width: 'min(650px, 100%)' }}
          autoFocus
          disabled={appIsLoading}
          error={!!error}
          value={gameName}
          label="Game Name"
          placeholder="Enter a game name"
          helperText={error}
        />

        <Box
          sx={{
            width: '100%',
            display: 'flex',
            justifyContent: 'center',
          }}
        >
          <Box
            sx={{
              display: 'flex',
              gap: { xs: '10px', sm: '12px' },
              overflowX: 'scroll',
              height: '100%',
              display: 'flex',
              alignItems: 'flex-end',
              paddingBottom: '8px',
            }}
          >
            {mappedSelectedDeck}
          </Box>
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
          sx={{ width: 'min(650px, 100%)' }}
          onClick={handleHostGame}
          startIcon={<TvIcon />}
        >
          Create Game Room
        </Button>
      </form>

      {showDeckDialog && (
        <ChooseDeck
          setDeckProp={setSelectedDeck}
          setShowDeckDialog={setShowDeckDialog}
          showDeckDialog={showDeckDialog}
        />
      )}
    </Box>
  )
}

export default CreateGamePage
