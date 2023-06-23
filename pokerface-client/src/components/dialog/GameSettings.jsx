import React, { useState, useEffect, useContext } from 'react'
import { useMediaQuery } from '@mui/material'
import muiStyles from '../../style/muiStyles'
import ChooseDeck from './ChooseDeck'
import { GameContext } from '../../context/GameContext'
import { ToastContainer, toast, Slide } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

const {
  Box,
  Typography,
  Dialog,
  CloseIcon,
  IconButton,
  Button,
  TextField,
  StyleIcon,
  Switch,
  FormControlLabel,
  LightTooltip,
  Select,
} = muiStyles

const GameSettings = ({ showDialog, setShowDialog }) => {
  const { gameData, sendMessage, checkPowerLvl } = useContext(GameContext)
  const isSmallScreen = useMediaQuery('(max-width: 600px)')
  const [newName, setNewName] = useState(gameData.gameSettings.gameRoomName)
  const [showDeckDialog, setShowDeckDialog] = useState(false)
  const [updatedDeck, setUpdatedDeck] = useState('')
  const [gameSettingsToSave, setGameSettingsToSave] = useState(
    gameData.gameSettings
  )

  function saveGameSettings() {
    if (
      JSON.stringify(gameSettingsToSave) ===
      JSON.stringify(gameData.gameSettings)
    ) {
      toast('No changes were made')
    } else {
      sendMessage('updatedGameSettings', { gameSettingsToSave })
      toast.success('Game settings saved')
    }
    setShowDialog(!showDialog)
  }

  useEffect(() => {
    if (!updatedDeck) return
    if (checkPowerLvl('med')) {
      setGameSettingsToSave({ ...gameSettingsToSave, deck: updatedDeck })
    } else {
      toast.warning('You do not have this power')
    }
  }, [updatedDeck])

  useEffect(() => {
    if (!newName) return
    setGameSettingsToSave({
      ...gameSettingsToSave,
      gameRoomName: newName.trim(),
    })
  }, [newName])

  useEffect(() => {
    if (!gameData.gameSettings.gameRoomName) return
    setNewName(gameData.gameSettings.gameRoomName)
  }, [gameData.gameSettings.gameRoomName])

  return (
    <>
      <ToastContainer
        position="top-center"
        newestOnTop
        draggable
        hideProgressBar={false}
        autoClose={2500}
        transition={Slide}
        pauseOnHover
        theme="light"
      />
      <Dialog
        onClose={() => {
          setShowDialog(!showDialog)
        }}
        fullScreen={isSmallScreen}
        PaperProps={{
          style: {
            borderRadius: !isSmallScreen && 15,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: isSmallScreen ? 'flex-start' : 'center',
            gap: 20,
            minWidth: isSmallScreen
              ? '100vw'
              : 'min(850px, calc(100vw - 16px))',
            padding: isSmallScreen ? '50px 10px' : '60px 60px',
          },
        }}
        open={showDialog}
      >
        <IconButton
          sx={{ position: 'absolute', top: 7, right: 5 }}
          aria-label="close"
          onClick={() => {
            setShowDialog(!showDialog)
          }}
        >
          <CloseIcon />
        </IconButton>

        <LightTooltip
          title={
            checkPowerLvl('low')
              ? ''
              : 'You do not have power to change the game name'
          }
          enterDelay={200}
          placement="top"
        >
          <TextField
            spellCheck={false}
            fullWidth
            inputProps={{ maxLength: 20 }}
            value={newName}
            placeholder="Enter a game name"
            disabled={!checkPowerLvl('low')}
            label="Game name"
            onChange={(e) => setNewName(e.target.value)}
          />
        </LightTooltip>

        {gameSettingsToSave.deck.values && (
          <TextField
            label="Deck"
            value={`${gameSettingsToSave.deck.name} (${gameSettingsToSave.deck.values})`}
            onMouseDown={() => {
              setShowDeckDialog(!showDeckDialog)
            }}
          />
        )}

        {/* <Button
          onClick={() => {
            setShowDeckDialog(!showDeckDialog)
          }}
          color="secondary"
          disableElevation
          variant="contained"
          sx={{ textTransform: 'none', fontSize: '16px', fontWeight: 'bold' }}
          startIcon={<StyleIcon />}
        >
          Change Deck
        </Button> */}

        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            gap: '5px',
            marginTop: '-5px',
          }}
        >
          <FormControlLabel
            control={
              <Switch
                checked={gameSettingsToSave.showAgreement}
                onChange={(e) => {
                  if (checkPowerLvl('low')) {
                    setGameSettingsToSave({
                      ...gameSettingsToSave,
                      showAgreement: e.target.checked,
                    })
                  } else {
                    toast.warning('You do not have this power')
                  }
                }}
                color="success"
              />
            }
            label="Show Agreement"
          />

          <FormControlLabel
            control={
              <Switch
                checked={gameSettingsToSave.showAverage}
                onChange={(e) => {
                  if (checkPowerLvl('low')) {
                    setGameSettingsToSave({
                      ...gameSettingsToSave,
                      showAverage: e.target.checked,
                    })
                  } else {
                    toast.warning('You do not have this power')
                  }
                }}
                color="success"
              />
            }
            label="Show Average"
          />
        </Box>

        <Box
          sx={{
            display: 'flex',
            gap: '10px',
            width: '100%',
          }}
        >
          <Button
            disableElevation
            fullWidth
            disableRipple
            variant="contained"
            color="primary"
            onClick={saveGameSettings}
            sx={{
              textTransform: 'none',
              marginTop: '10px',
              fontWeight: 'bold',
              fontSize: '17px',
            }}
          >
            Save
          </Button>
        </Box>
      </Dialog>
      <ChooseDeck
        hasOverlay={false}
        showDeckDialog={showDeckDialog}
        setShowDeckDialog={setShowDeckDialog}
        setDeckProp={setUpdatedDeck}
      />
    </>
  )
}

export default GameSettings
