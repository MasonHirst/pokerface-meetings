import React, { useState, useEffect, useContext } from 'react'
import { useMediaQuery } from '@mui/material'
import muiStyles from '../../style/muiStyles'
import ChooseDeck from './ChooseDeck'
import { GameContext } from '../../context/GameContext'
const {
  Box,
  Typography,
  Dialog,
  CloseIcon,
  IconButton,
  Button,
  TextField,
  CheckIcon,
  StyleIcon,
} = muiStyles

const GameSettings = ({ showDialog, setShowDialog }) => {
  const { gameData, sendMessage } = useContext(GameContext)
  const isSmallScreen = useMediaQuery('(max-width: 600px)')
  const [editingGameName, setEditingGameName] = useState(false)
  const [newName, setNewName] = useState(gameData.gameRoomName)
  const [showDeckDialog, setShowDeckDialog] = useState(false)
  const [updatedDeck, setUpdatedDeck] = useState('')

  function updateGameName(e) {
    e.preventDefault()
    setEditingGameName(!editingGameName)
    if (!newName || newName === gameData.gameRoomName) return
    sendMessage('updatedGameName', { name: newName })
  }

  useEffect(() => {
    if (updatedDeck) {
      sendMessage('updatedDeck', { deck: updatedDeck })
    }
  }, [updatedDeck])

  useEffect(() => {
    if (!gameData.gameRoomName) return
    setNewName(gameData.gameRoomName)
  }, [gameData.gameRoomName])

  return (
    <>
      <Dialog
        onClose={() => {
          setShowDialog(!showDialog)
          setEditingGameName(false)
        }}
        fullScreen={isSmallScreen}
        PaperProps={{
          style: {
            borderRadius: !isSmallScreen && 15,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            gap: 20,
            width: !isSmallScreen && 'min(800px, calc(100vw - 16px))',
            padding: isSmallScreen ? '0 10px' : '60px 60px',
          },
        }}
        open={showDialog}
      >
        <IconButton
          sx={{ position: 'absolute', top: 7, right: 5 }}
          aria-label="close"
          onClick={() => {
            setShowDialog(!showDialog)
            setEditingGameName(false)
          }}
        >
          <CloseIcon />
        </IconButton>
        <form
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: isSmallScreen ? '5px' : '15px',
            position: 'relative',
          }}
          onSubmit={updateGameName}
        >
          <TextField
            spellCheck={false}
            fullWidth
            inputProps={{ maxLength: 20 }}
            value={newName}
            placeholder="Enter a game name"
            label="Game name"
            onChange={(e) => setNewName(e.target.value)}
          />
          {newName !== gameData.gameRoomName && (
            <Box sx={{ position: 'absolute', right: '5px' }}>
              <IconButton
                size="small"
                onClick={() => setNewName(gameData.gameRoomName)}
              >
                <CloseIcon />
              </IconButton>
              <IconButton type="submit" size="small" onClick={updateGameName}>
                <CheckIcon />
              </IconButton>
            </Box>
          )}
        </form>

        <Button
          onClick={() => {
            setShowDeckDialog(!showDeckDialog)
            setShowDialog(!showDialog)
          }}
          color="secondary"
          disableElevation
          variant="contained"
          sx={{ textTransform: 'none', fontSize: '17px', fontWeight: 'bold' }}
          startIcon={<StyleIcon />}
        >
          Change Deck
        </Button>
      </Dialog>
      <ChooseDeck
        showDeckDialog={showDeckDialog}
        setShowDeckDialog={setShowDeckDialog}
        setDeckProp={setUpdatedDeck}
      />
    </>
  )
}

export default GameSettings
