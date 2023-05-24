import React, { useEffect, useState, useRef, useContext } from 'react'
import GameHeader from './GameHeader'
import GameBody from './GameBody'
import GameFooter from './GameFooter'
import { GameContext } from '../../context/GameContext'
import muiStyles from '../../style/muiStyles'
const { Box, Dialog, TextField, Button, Typography, LinearProgress } = muiStyles

const GameRoom = () => {
  const {
    playerName,
    setPlayerName,
    sendMessage,
    gameData,
    joinGameLoading,
    toggleActiveSocket,
  } = useContext(GameContext)
  const [nameError, setNameError] = useState('')
  const [nameInput, setNameInput] = useState('')
  const [footerHeight, setFooterHeight] = useState(0)
  const [headerHeight, setHeaderHeight] = useState(0)
  const [availableBodyHeight, setAvailableBodyHeight] = useState(0)
  const bodyRef = useRef()

  function updateName(e) {
    e.preventDefault()
    if (!nameInput) return setNameError('Please enter a name')
    localStorage.setItem('playerName', nameInput)
    setPlayerName(nameInput)
  }

  useEffect(() => {
    if (gameData?.gameRoomName) {
      document.title = `Pokerface - ${gameData.gameRoomName}`
    }
  }, [gameData.gameRoomName])

  useEffect(() => {
    toggleActiveSocket(true)
  }, [])

  useEffect(() => {
    return () => {
      sendMessage('playerLeaveGame', {})
    }
  }, [playerName])

  useEffect(() => {
    if (!footerHeight || !headerHeight) return
    const availableHeight = window.innerHeight - footerHeight - headerHeight
    setAvailableBodyHeight(availableHeight)
  }, [footerHeight, headerHeight])

  return (
    <>
      {!joinGameLoading && playerName ? (
        <Box
          sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}
        >
          <GameHeader setComponentHeight={setHeaderHeight} />
          <Box ref={bodyRef} sx={{ width: '100%' }}>
            <GameBody availableHeight={availableBodyHeight} />
          </Box>
          <GameFooter setComponentHeight={setFooterHeight} />
        </Box>
      ) : (
        joinGameLoading && (
          <Box>
            <LinearProgress
              size="large"
              sx={{ position: 'fixed', top: 0, width: '100vw' }}
            />
            <Typography variant="h4" align="center" sx={{ marginTop: '20px' }}>
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
            value={nameInput}
            onChange={(e) => setNameInput(e.target.value)}
            inputProps={{ maxLength: 12 }}
            fullWidth
            autoFocus
            error={!!nameError}
            label="Player Name"
            placeholder="Enter your name"
            helperText={nameError}
          />
          <Button fullWidth type="submit" variant="contained">
            Join Game
          </Button>
        </form>
      </Dialog>
    </>
  )
}

export default GameRoom
