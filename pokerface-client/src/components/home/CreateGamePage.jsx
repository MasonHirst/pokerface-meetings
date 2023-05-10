import React, { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import muiStyles from '../../style/muiStyles'
const { Box, TextField, Button } = muiStyles

const CreateGamePage = () => {
  const cardsSelectRef = useRef()
  const navigate = useNavigate()
  const [gameName, setGameName] = useState('')
  const [error, setError] = useState('')
  const [appIsLoading, setAppIsLoading] = useState(false)

  function handleHostGame(e) {
    setError('')
    e.preventDefault()
    if (!gameName) return setError('Please enter a game name')
    setAppIsLoading(true)
    axios.post('game/create', { gameName, deck: cardsSelectRef.current.value })
      .then(({data}) => {
        console.log('create game data', data)
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
          placeholder='Enter a game name'
          helperText={error}
        />
        <select defaultValue='1,2,3,5,8,13,21,34,55,89,?,☕' ref={cardsSelectRef}>
          <option value='1,2,3,5,8,13,21,34,55,89,?,☕'>Fibonacci (1, 2, 3, 5, 8...)</option>
          <option value='1,2,3,4,5,6,7,8,9,10'>1 - 10 (1, 2, 3, 4, 5...)</option>
          <option value='🟢,🟡,🔴'>Colors (green, yellow, red)</option>
        </select>
        <Button variant='contained' disabled={appIsLoading} fullWidth onClick={handleHostGame}>Create Game</Button>
      </form>
    </Box>
  )
}

export default CreateGamePage
