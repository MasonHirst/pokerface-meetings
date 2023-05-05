import React, { useEffect, useState, useRef } from 'react'
import GameHeader from './GameHeader'
import GameBody from './GameBody'
import GameFooter from './GameFooter'
import axios from 'axios'
import { Location, useParams } from 'react-router-dom'
import muiStyles from '../../style/muiStyles'
const { Box, Dialog, TextField, Button } = muiStyles

const GameRoom = () => {
  const [playerName, setPlayerName] = useState(
    localStorage.getItem('playerName')
  )
  const [showNameDialog, setShowNameDialog] = useState(
    Boolean(localStorage.getItem('playerName'))
  )
  const [nameError, setNameError] = useState('')
  const nameInputRef = useRef()
  const { game_id } = useParams()

  function updateName(e) {
    e.preventDefault()
    if (!playerName) return setNameError('Please enter a name')
    setNameError('')
    localStorage.setItem('playerName', playerName)
    axios
      .post('game/player_name', { gameId: game_id, name: playerName })
      .then(({ data }) => {
        console.log('set player name res: ', data)
        setShowNameDialog(true)
      })
      .catch(console.error)
  }

  useEffect(() => {
    setTimeout(() => {
      axios
        .post('game/join', { gameId: game_id, name: playerName })
        .then(({ data }) => {
          console.log('join game res: ', data)
          setShowNameDialog(false)
        })
        .catch(console.error)
    }, 400)

    return () => {
      axios
        .put('game/leave', { gameId: game_id })
        .then(({ data }) => console.log('leave game res: ', data))
        .catch(console.error)
    }
  }, [])

  return (
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
        open={!showNameDialog}
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
            onChange={(e) => setPlayerName(e.target.value)}
            fullWidth
            autoFocus
            error={!!nameError}
            label="Player Name"
            placeholder="Enter your name"
            helperText={nameError}
          />
          <Button fullWidth variant="contained">
            Join Game
          </Button>
        </form>
      </Dialog>
    </Box>
  )
}

export default GameRoom
