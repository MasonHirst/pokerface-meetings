import React, { useState, useEffect, useContext } from 'react'
import { useMediaQuery } from '@mui/material'
import muiStyles from '../../style/muiStyles'
import ChooseDeck from './ChooseDeck'
import { GameContext } from '../../context/GameContext'
import { toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

const {
  Box,
  Typography,
  Dialog,
  CloseIcon,
  IconButton,
  Button,
  TextField,
  Collapse,
  Switch,
  KeyboardArrowDownIcon,
  KeyboardArrowRightIcon,
  FormControlLabel,
  LightTooltip,
  RadioGroup,
  Radio,
  Checkbox,
} = muiStyles

const GameSettings = ({ showDialog, setShowDialog }) => {
  const { gameData, sendMessage, checkPowerLvl } = useContext(GameContext)
  const isSmallScreen = useMediaQuery('(max-width: 600px)')
  const [showPowersExpansion, setShowPowersExpansion] = useState(false)
  const [showGameOwnerCollapse, setShowGameOwnerCollapse] = useState(false)
  const [showHighAccessCollapse, setShowHighAccessCollapse] = useState(false)
  const [showLowAccessCollapse, setShowLowAccessCollapse] = useState(false)
  const [newName, setNewName] = useState(gameData.gameSettings.gameRoomName)
  const players = gameData.players
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
    if (checkPowerLvl()) {
      setGameSettingsToSave({ ...gameSettingsToSave, deck: updatedDeck })
    } else {
      toast.warning('You do not have this power')
    }
  }, [updatedDeck])

  useEffect(() => {
    // if the game owner changes, update the game owner in the gameSettingsToSave so it reflects in the UI for everyone
    if (!gameData?.gameSettings?.powers?.gameOwner) return
    setGameSettingsToSave({
      ...gameSettingsToSave,
      powers: {
        ...gameSettingsToSave.powers,
        gameOwner: gameData.gameSettings.powers.gameOwner,
        highAccess: gameData.gameSettings.powers.highAccess,
        lowAccess: gameData.gameSettings.powers.lowAccess,
      },
    })
  }, [gameData])

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

  function getGameOwner() {
    const owner = gameSettingsToSave.powers.gameOwner
    const localUserToken = localStorage.getItem('localUserToken')
    if (owner === localUserToken) {
      return 'You'
    } else if (players[owner]) {
      return players[owner].playerName
    } else {
      return ''
    }
  }

  function getMyPowerLvl() {
    const { powers } = gameData.gameSettings
    const localUserToken = localStorage.getItem('localUserToken')
    if (powers.gameOwner === localUserToken) {
      return 'owner'
    } else if (powers.highAccess.includes(localUserToken)) {
      return 'high'
    } else if (powers.lowAccess.includes(localUserToken)) {
      return 'low'
    } else {
      return 'none'
    }
  }

  function orderByPowerLvl(player) {
    const { powers } = gameData.gameSettings

    if (player.token === powers.gameOwner) {
      return 1 // Place gameOwner player first
    } else if (powers.highAccess.includes(player.token)) {
      return 2 // Place highAccess players next
    } else if (powers.lowAccess.includes(player.token)) {
      return 3 // Place lowAccess players next
    } else {
      return 4 // Place other players last
    }
  }

  function handleHighAccessChange(e, player) {
    if (!checkPowerLvl('high')) return
    if (e.target.checked) {
      setGameSettingsToSave({
        ...gameSettingsToSave,
        powers: {
          ...gameSettingsToSave.powers,
          highAccess: [...gameSettingsToSave.powers.highAccess, player.token],
        },
      })
    } else {
      setGameSettingsToSave({
        ...gameSettingsToSave,
        powers: {
          ...gameSettingsToSave.powers,
          highAccess: gameSettingsToSave.powers.highAccess.filter(
            (token) => token !== player.token
          ),
        },
      })
    }
  }

  function handleLowAccessChange(e, player) {
    if (checkPowerLvl('high')) {
      if (e.target.checked) {
        setGameSettingsToSave({
          ...gameSettingsToSave,
          powers: {
            ...gameSettingsToSave.powers,
            lowAccess: [...gameSettingsToSave.powers.lowAccess, player.token],
          },
        })
      } else {
        setGameSettingsToSave({
          ...gameSettingsToSave,
          powers: {
            ...gameSettingsToSave.powers,
            lowAccess: gameSettingsToSave.powers.lowAccess.filter(
              (token) => token !== player.token
            ),
          },
        })
      }
    } else {
      toast.warning('You need high power can do this')
    }
  }

  function handleOwnerChange(e) {
    if (checkPowerLvl()) {
      // remove the new owner from power arrays
      const highAccessArr = gameSettingsToSave.powers.highAccess.filter(
        (token) => token !== e.target.value
      )
      const lowAccessArr = gameSettingsToSave.powers.lowAccess.filter(
        (token) => token !== e.target.value
      )
      //add the old owner to high access if he's not already there
      if (!highAccessArr.includes(gameSettingsToSave.powers.gameOwner)) {
        highAccessArr.push(gameSettingsToSave.powers.gameOwner)
      }
      // change the game owner in gameSettingsToSave to the new owner
      setGameSettingsToSave({
        ...gameSettingsToSave,
        powers: {
          ...gameSettingsToSave.powers,
          gameOwner: e.target.value,
          highAccess: highAccessArr,
          lowAccess: lowAccessArr,
        },
      })
    } else {
      toast.warning('Only the game owner can do this')
    }
  }

  return (
    <>
      <Dialog
        onClose={() => {
          setShowDialog(!showDialog)
          setShowPowersExpansion(false)
          setShowGameOwnerCollapse(false)
          setShowHighAccessCollapse(false)
          setShowLowAccessCollapse(false)
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
          placement="bottom"
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
            sx={{
              '& :hover': {
                cursor: 'pointer',
              },
            }}
            value={`${gameSettingsToSave.deck.name} (${gameSettingsToSave.deck.values})`}
            onMouseDown={() => {
              setShowDeckDialog(!showDeckDialog)
            }}
          />
        )}

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
          <FormControlLabel
            control={
              <Switch
                // checked={gameSettingsToSave.funMode}
                checked={false}
                onChange={(e) => {
                  return toast('This feature is not available yet')
                  if (checkPowerLvl('low')) {
                    setGameSettingsToSave({
                      ...gameSettingsToSave,
                      funMode: e.target.checked,
                    })
                  } else {
                    toast.warning('You do not have this power')
                  }
                }}
                color="success"
              />
            }
            label="Fun mode"
          />
        </Box>

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <Box
            onClick={() => {
              setShowPowersExpansion(!showPowersExpansion)
              setShowGameOwnerCollapse(false)
            }}
            className="cursor-pointer"
            sx={{
              display: 'flex',
              gap: '10px',
              width: '100%',
            }}
          >
            {showPowersExpansion ? (
              <KeyboardArrowDownIcon />
            ) : (
              <KeyboardArrowRightIcon />
            )}
            <Typography sx={{ fontSize: '18px', fontWeight: 'bold' }}>
              Powers
              <span style={{ opacity: 0.6, marginLeft: '20px' }}>
                my power level: {getMyPowerLvl()}
              </span>
            </Typography>
          </Box>

          {/* First level collapse */}
          <Collapse
            sx={{
              overflowY: 'auto',
              paddingLeft: '30px',
            }}
            in={showPowersExpansion}
          >
            <Box
              className="cursor-pointer"
              onClick={() => setShowGameOwnerCollapse(!showGameOwnerCollapse)}
              sx={{ display: 'flex', gap: '10px', marginBottom: '10px' }}
            >
              {showGameOwnerCollapse ? (
                <KeyboardArrowDownIcon />
              ) : (
                <KeyboardArrowRightIcon />
              )}
              <Typography sx={{ fontSize: '16px', fontWeight: 'bold' }}>
                Game owner ({getGameOwner()})
              </Typography>
            </Box>
            {/* Second level collapse */}
            <Collapse in={showGameOwnerCollapse} sx={{ paddingLeft: '30px' }}>
              <RadioGroup
                sx={{ marginTop: '-10px', marginBottom: '10px' }}
                aria-labelledby="game-owner-radio-group"
                value={gameSettingsToSave.powers.gameOwner}
                name="owner-radio-buttons-group"
                onChange={(e) => handleOwnerChange(e)}
              >
                {Object.values(players)
                  .sort((a, b) => orderByPowerLvl(a) - orderByPowerLvl(b))
                  .map((player, index) => (
                    <FormControlLabel
                      sx={{ maxHeight: '35px' }}
                      key={index}
                      value={player.token}
                      control={<Radio />}
                      label={player.playerName}
                    />
                  ))}
              </RadioGroup>
            </Collapse>

            <Box
              className="cursor-pointer"
              onClick={() => setShowHighAccessCollapse(!showHighAccessCollapse)}
              sx={{ display: 'flex', gap: '10px', marginBottom: '10px' }}
            >
              {showHighAccessCollapse ? (
                <KeyboardArrowDownIcon />
              ) : (
                <KeyboardArrowRightIcon />
              )}
              <Typography sx={{ fontSize: '16px', fontWeight: 'bold' }}>
                High power ({gameSettingsToSave.powers.highAccess.length})
              </Typography>
            </Box>
            <Collapse in={showHighAccessCollapse} sx={{ paddingLeft: '30px' }}>
              <Box
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  marginTop: '-5px',
                }}
              >
                {Object.values(players)
                  .sort((a, b) => orderByPowerLvl(a) - orderByPowerLvl(b))
                  .map((player, index) => (
                    <FormControlLabel
                      key={index}
                      sx={{ maxHeight: '35px' }}
                      label={player.playerName}
                      control={
                        <Checkbox
                          checked={gameSettingsToSave.powers.highAccess.includes(
                            player.token
                          )}
                          onChange={(e) => handleHighAccessChange(e, player)}
                        />
                      }
                    />
                  ))}
              </Box>
            </Collapse>

            <Box
              className="cursor-pointer"
              onClick={() => setShowLowAccessCollapse(!showLowAccessCollapse)}
              sx={{ display: 'flex', gap: '10px', marginBottom: '10px' }}
            >
              {showLowAccessCollapse ? (
                <KeyboardArrowDownIcon />
              ) : (
                <KeyboardArrowRightIcon />
              )}
              <Typography sx={{ fontSize: '16px', fontWeight: 'bold' }}>
                Low power ({gameSettingsToSave.powers.lowAccess.length})
              </Typography>
            </Box>
            <Collapse in={showLowAccessCollapse} sx={{ paddingLeft: '30px' }}>
              <Box
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  marginTop: '-5px',
                }}
              >
                {Object.values(players)
                  .sort((a, b) => orderByPowerLvl(a) - orderByPowerLvl(b))
                  .map((player, index) => (
                    <FormControlLabel
                      key={index}
                      sx={{ maxHeight: '35px' }}
                      label={player.playerName}
                      control={
                        <Checkbox
                          checked={gameSettingsToSave.powers.lowAccess.includes(
                            player.token
                          )}
                          onChange={(e) => handleLowAccessChange(e, player)}
                        />
                      }
                    />
                  ))}
              </Box>
            </Collapse>
          </Collapse>
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
