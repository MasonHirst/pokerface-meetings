import React, { useState, useEffect } from 'react'
import { v4 as uuidv4 } from 'uuid'
import { useNavigate } from 'react-router-dom'
import muiStyles from '../../style/muiStyles'
const { Box, TextField, Button } = muiStyles

const CreateGamePage = () => {
  const navigate = useNavigate()
  const [gameName, setGameName] = useState('')
  const [error, setError] = useState('')

  function handleHostGame(e) {
    setError('')
    e.preventDefault()
    if (!gameName) return setError('Please enter a game name')
    const gameId = uuidv4()
    console.log(gameId)

    // navigate(`/game/${gameId}`)
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
          error={!!error}
          value={gameName}
          label="Game Name"
          placeholder='Enter a game name'
          defaultValue="Hello World"
          helperText={error}
        />
        <Button variant='contained' fullWidth onClick={handleHostGame}>Create Game</Button>
      </form>
    </Box>
  )
}

export default CreateGamePage
