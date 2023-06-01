import React, { useEffect, useState, useRef, useContext } from 'react'
import GameHeader from './GameHeader'
import { useMediaQuery } from '@mui/material'
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
  const isSmallScreen = useMediaQuery('(max-width: 600px)')
  const [nameError, setNameError] = useState('')
  const [nameInput, setNameInput] = useState('')
  const [footerHeight, setFooterHeight] = useState(0)
  const [headerHeight, setHeaderHeight] = useState(0)
  const [availableBodyHeight, setAvailableBodyHeight] = useState(0)
  const [bodyIsScrolling, setBodyIsScrolling] = useState(false)
  const [viewportHeight, setViewportHeight] = useState(window.innerHeight)
  const [viewportWidth, setViewportWidth] = useState(window.innerWidth)
  const bodyRef = useRef()

  function updateName(e) {
    e.preventDefault()
    const trimmedName = nameInput.trim()
    if (!trimmedName) return setNameError('Please enter a name')
    localStorage.setItem('playerName', trimmedName)
    setPlayerName(trimmedName)
  }

  useEffect(() => {
    const handleResize = () => {
      setViewportHeight(window.innerHeight)
      setViewportWidth(window.innerWidth)
    }

    window.addEventListener('resize', handleResize)

    return () => {
      window.removeEventListener('resize', handleResize)
    }
  }, [])

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
    setAvailableBodyHeight(availableHeight - 1)
  }, [footerHeight, headerHeight, viewportHeight, viewportWidth])

  return (
    <>
      {!joinGameLoading && playerName ? (
        <Box
          sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}
        >
          <GameHeader
            shadowOn={bodyIsScrolling}
            setComponentHeight={setHeaderHeight}
          />
          <Box ref={bodyRef} sx={{ width: '100%' }}>
            <GameBody
              availableHeight={availableBodyHeight}
              setBodyIsScrolling={setBodyIsScrolling}
            />
          </Box>
          <GameFooter
            shadowOn={bodyIsScrolling}
            setComponentHeight={setFooterHeight}
          />
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
        fullScreen={isSmallScreen}
        PaperProps={{
          style: {
            borderRadius: !isSmallScreen && 15,
            padding: isSmallScreen ? '20px' : '50px',
            minWidth: 'min(100vw - 16px, 500px)',
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
            gap: '30px',
            flexDirection: 'column',
            justifyContent: 'center',
          }}
        >
          <Typography variant="h6" sx={{ fontSize: '22px' }}>
            Enter a display name to join game
          </Typography>
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
          <Button
            fullWidth
            type="submit"
            variant="contained"
            sx={{ textTransform: 'none', fontWeight: 'bold', fontSize: '18px' }}
            disableElevation
          >
            Join Game
          </Button>
        </form>
      </Dialog>
    </>
  )
}

export default GameRoom
