import React, { useEffect, useState, useRef, useContext } from 'react'
import GameHeader from './GameHeader'
import GameBody from './GameBody'
import GameFooter from './GameFooter'
import { GameContext } from '../../context/GameContext'
import muiStyles from '../../style/muiStyles'
const { Box, Dialog, TextField, Button, Typography, LinearProgress } = muiStyles

const GameRoom = () => {
  const { playerName, setPlayerName, sendMessage, joinGameLoading } =
    useContext(GameContext)
  const [nameError, setNameError] = useState('')
  const nameInputRef = useRef()

  function updateName(e) {
    e.preventDefault()
    const nameInput = nameInputRef.current.value
    if (!nameInput) return setNameError('Please enter a name')
    localStorage.setItem('playerName', nameInput)
    setPlayerName(nameInput)
  }

  useEffect(() => {
    return () => {
      sendMessage('playerLeaveGame', {})
    }
  }, [playerName])

  return (
    <>
      {!joinGameLoading && playerName ? (
        <Box sx={{ minHeight: '100vh' }}>
          <GameHeader />
          <GameBody />
          <GameFooter />
        </Box>
      ) : (
        joinGameLoading && (
          <Box>
            <LinearProgress sx={{ position: 'fixed', top: 0, width: '100vw' }} />
            <Typography variant="h4" align="center" sx={{marginTop: '20px'}}>
              Joining Game...
            </Typography>
          </Box>
        )
      )}

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
            error={!!nameError}
            label="Player Name"
            placeholder="Enter your name"
            helperText={nameError}
          />
          <Button fullWidth type='submit' variant="contained">
            Join Game
          </Button>
        </form>
      </Dialog>
    </>
  )
}

export default GameRoom
