import React, { useState, useEffect, useContext, useRef } from 'react'
import { v4 as uuidv4 } from 'uuid'
import { useNavigate } from 'react-router-dom'
import { GameContext } from '../../context/GameContext'
import axios from 'axios'
import muiStyles from '../../style/muiStyles'
const { Box, TextField, Button } = muiStyles

const CreateGamePage = () => {
  const cardsSelectRef = useRef()
  const navigate = useNavigate()
  const [gameName, setGameName] = useState('')
  const [error, setError] = useState('')
  const { appIsLoading, setAppIsLoading } = useContext(GameContext)

  function handleHostGame(e) {
    setError('')
    e.preventDefault()
    if (!gameName) return setError('Please enter a game name')
    setAppIsLoading(true)
    const gameId = uuidv4()
    axios.post('game/create', { gameId, gameName, deck: cardsSelectRef.current.value })
      .then(({data}) => {
        if (data.gameRoomName) {
          navigate(`/game/${gameId}`)
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
        <select defaultValue='1,2,3,5,8,13,21,34,55,89,?,☕' ref={cardsSelectRef} onChange={() => console.log(cardsSelectRef.current.value)}>
          <option value='1,2,3,5,8,13,21,34,55,89,?,☕'>Fibonacci (1, 2, 3, 5, 8...)</option>
          <option value='1,2,3,4,5,6,7,8,9,10'>1 - 10 (1, 2, 3, 4, 5...)</option>
          <option value='🟢,🟡,🔴'>Colors (green, yellow, red)</option>
        </select>
        <Button variant='contained' fullWidth onClick={handleHostGame}>Create Game</Button>
      </form>
    </Box>
  )
}

export default CreateGamePage
