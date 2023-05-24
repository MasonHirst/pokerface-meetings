import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import PurpleDeckCard from '../game/PurpleDeckCard'
import GraphemeSplitter from 'grapheme-splitter'
import ChooseDeck from '../dialog/ChooseDeck'
import axios from 'axios'
import muiStyles from '../../style/muiStyles'
const { Box, TextField, Button, StyleIcon, TvIcon } = muiStyles

const CreateGamePage = () => {
  document.title = 'Pokerface - Create Game'
  const splitter = GraphemeSplitter()
  const [selectedDeck, setSelectedDeck] = useState(
    '1,2,3,5,8,13,21,34,55,89,?,☕'
  )
  const navigate = useNavigate()
  const [showDeckDialog, setShowDeckDialog] = useState(false)
  const [gameName, setGameName] = useState('')
  const [error, setError] = useState('')
  const [appIsLoading, setAppIsLoading] = useState(false)

  const mappedSelectedDeck = [...new Set(selectedDeck.split(','))].map(
    (card, index) => {
      const length = splitter.splitGraphemes(card.trim()).length
      if (length > 4 || card.trim().length < 1) return
      return (
        <PurpleDeckCard
          key={index}
          card={card}
          sizeMultiplier={0.9}
        />
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
          display: 'flex',
          flexDirection: 'column',
          gap: '30px',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <TextField
          inputProps={{ maxLength: 20 }}
          onChange={(e) => setGameName(e.target.value)}
          sx={{ width: 'min(650px, 100%)', }}
          autoFocus
          disabled={appIsLoading}
          error={!!error}
          value={gameName}
          label="Game Name"
          size='large'
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
          disableElevation
          sx={{ textTransform: 'none', fontSize: '17px', fontWeight: 'bold' }}
          startIcon={<StyleIcon />}
        >
          Change Deck
        </Button>

        <Button
          variant="contained"
          size='large'
          disableElevation
          disabled={appIsLoading}
          sx={{
            width: 'min(650px, 100%)',
            fontWeight: 'bold',
            fontSize: '19px',
            textTransform: 'none',
          }}
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
