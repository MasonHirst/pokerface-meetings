import React, { useEffect, useState, useRef, useContext } from 'react'
import GameHeader from './GameHeader'
import { useNavigate } from 'react-router-dom'
import GameBody from './GameBody'
import GameFooter from './GameFooter'
import axios from 'axios'
import { GameContext } from '../../context/GameContext'
import { Location, useParams } from 'react-router-dom'
import muiStyles from '../../style/muiStyles'
const { Box, Dialog, TextField, Button, Typography } = muiStyles

const GameRoom = () => {
  const [playerName, setPlayerName] = useState(
    localStorage.getItem('playerName')
  )
  const navigate = useNavigate()
  const { gameExists, setGameExists, setGameData, gameData } =
    useContext(GameContext)
  const [nameLoading, setNameLoading] = useState(false)
  const [nameError, setNameError] = useState('')
  const nameInputRef = useRef()
  const { game_id } = useParams()
  const [validGame, setValidGame] = useState(true)

  function updateName(e) {
    e.preventDefault()
    setNameLoading(true)
    const name = nameInputRef.current.value
    if (!name) return setNameError('Please enter a name')
    setNameError('')
    console.log('running name change function')
    axios
      .post('game/player_name', { gameId: game_id, name })
      .then(({ data }) => {
        localStorage.setItem('playerName', name)
        setPlayerName(name)
        setGameData(data)
      })
      .catch(console.error)
      .finally(() => setNameLoading(false))
  }

  useEffect(() => {
    axios
      .post('game/check', { gameId: game_id })
      .then(({ data }) => {
        console.log('game exists?', data)
        setGameExists(data)
        if (!data) {
          setValidGame(false)
        }
      })
      .catch(console.error)

    return () => {
      setGameExists(false)
      axios
        .put('game/leave', { gameId: game_id })
        .then(({ data }) => {
          console.log('left game')
          setGameData(data)
        })
        .catch(console.error)
    }
  }, [playerName])

  return (
    <>
      {gameExists && gameData.players && validGame ? (
        <>
          <Box sx={{ minHeight: '100vh' }}>
            <GameHeader />
            <GameBody />
            <GameFooter />
            <Dialog
              disableEscapeKeyDown
              onClose={() => {}}
              PaperProps={{
                style: {
                  borderRadius: 15,
                  width: 350,
                  height: 250,
                },
              }}
              open={!playerName}
            >
              <form
                onSubmit={updateName}
                style={{
                  display: 'flex',
                  width: '100%',
                  height: '100%',
                  minHeight: '250px',
                  padding: '30px',
                  gap: '25px',
                  flexDirection: 'column',
                  justifyContent: 'center',
                }}
              >
                <TextField
                  inputRef={nameInputRef}
                  fullWidth
                  autoFocus
                  disabled={nameLoading}
                  error={!!nameError}
                  label="Player Name"
                  placeholder="Enter your name"
                  helperText={nameError}
                />
                <Button fullWidth disabled={nameLoading} variant="contained">
                  Join Game
                </Button>
              </form>
            </Dialog>
          </Box>
        </>
      ) : validGame ? (
        gameExists ? (
          !gameData.players && <Typography variant="h5">Joining Game...</Typography>
        ) : (
          <Typography variant="h5">Finding Game...</Typography>
        )
      ) : (
        <Typography variant="h5">
          Can't find game :(. Try refreshing or making a new game
        </Typography>
      )}
    </>
  )
}

export default GameRoom
