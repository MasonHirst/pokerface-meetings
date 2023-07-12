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
  MenuItem,
  Select,
  HelpOutlineIcon,
} = muiStyles

const GameSettings = ({ showDialog, setShowDialog }) => {
  const { gameData, sendMessage, checkPowerLvl } = useContext(GameContext)
  const isSmallScreen = useMediaQuery('(max-width: 600px)')
  const [showPowersExpansion, setShowPowersExpansion] = useState(false)
  const [showKickPlayersCollapse, setShowKickPlayersCollapse] = useState(false)
  const [showPowerLvlCollapse, setShowPowerLvlCollapse] = useState(false)
  const [powerWarningMessage, setPowerWarningMessage] = useState('')
  const [showDefaultPowerCollapse, setShowDefaultPowerCollapse] =
    useState(false)
  const [newName, setNewName] = useState(gameData.gameSettings.gameRoomName)
  const [showDeckDialog, setShowDeckDialog] = useState(false)
  const [updatedDeck, setUpdatedDeck] = useState('')
  const [gameSettingsToSave, setGameSettingsToSave] = useState(
    gameData.gameSettings
  )
  const [playersToKickOnSave, setPlayersToKickOnSave] = useState([])
  const [kickSelfWarning, setKickSelfWarning] = useState('')
  const localUserToken = localStorage.getItem('localUserToken')

  function saveGameSettings() {
    let ownerCount = 0
    Object.values(gameSettingsToSave.playerPowers).forEach((player) => {
      if (player.powerLvl === 'owner') ownerCount++
    })
    if (ownerCount !== 1)
      return toast.warning('There must be exactly one owner')

    if (
      JSON.stringify(gameSettingsToSave) ===
      JSON.stringify(gameData.gameSettings)
    ) {
      if (playersToKickOnSave.length > 0)
        toast(
          `Kicked ${playersToKickOnSave.length} player${
            playersToKickOnSave.length > 1 ? 's' : ''
          }`
        )
      else toast('No changes were made')
    } else {
      sendMessage('updatedGameSettings', { gameSettingsToSave })
      toast.success('Game settings saved')
    }
    if (playersToKickOnSave.length > 0) {
      sendMessage('kickPlayer', { playerTokens: playersToKickOnSave })
      setPlayersToKickOnSave([])
    }
    setShowDialog(!showDialog)
  }

  function handleAddPlayerToKick(playerToken) {
    const kickedPlayerPowerLvl =
      gameData.gameSettings.playerPowers[playerToken].powerLvl
    if (kickedPlayerPowerLvl === 'owner')
      return toast.warning('You cannot kick the game owner')
    if (kickedPlayerPowerLvl === 'high' && !checkPowerLvl())
      return toast.warning('Only the game owner can do this')
    if (kickedPlayerPowerLvl === 'low' && !checkPowerLvl('high'))
      return toast.warning('You need high power to do this')
    if (kickedPlayerPowerLvl === 'none' && !checkPowerLvl('high'))
      return toast.warning('You need high power to do this')

    if (playersToKickOnSave.includes(playerToken)) {
      const newPlayersToKick = playersToKickOnSave.filter(
        (token) => token !== playerToken
      )
      setPlayersToKickOnSave(newPlayersToKick)
    } else setPlayersToKickOnSave([...playersToKickOnSave, playerToken])
  }

  useEffect(() => {
    if (!updatedDeck) return
    if (checkPowerLvl('low')) {
      setGameSettingsToSave({ ...gameSettingsToSave, deck: updatedDeck })
    } else {
      toast.warning('You need low power to do this')
    }
  }, [updatedDeck])

  useEffect(() => {
    // if the powers in gameData change, update the settings UI
    if (!gameData?.gameSettings?.playerPowers) return
    setGameSettingsToSave({
      ...gameSettingsToSave,
      playerPowers: gameData.gameSettings.playerPowers,
    })
  }, [gameData.playerPowers])

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

  function getCurrentGameOwner() {
    // filter through playerPowers and find the player with powerLvl of 'owner'. add the token to the object, which is the key of the playerPowers object
    let ownerObj
    Object.entries(gameData.gameSettings.playerPowers).forEach(
      ([token, player]) => {
        if (player.powerLvl === 'owner') {
          const { playerName, powerLvl } = player
          ownerObj = {
            token,
            playerName,
            powerLvl,
          }
        }
      }
    )
    return ownerObj
  }

  function getNewGameOwner() {
    // filter through gameSettingsToSave.playerPowers and find the player with powerLvl of 'owner'. add the token to the object, which is the key of the playerPowers object
    let ownerObj
    Object.entries(gameSettingsToSave.playerPowers).forEach(
      ([token, player]) => {
        if (player.powerLvl === 'owner') {
          const { playerName, powerLvl } = player
          ownerObj = {
            token,
            playerName,
            powerLvl,
          }
        }
      }
    )
    return ownerObj
  }

  function getPlayerPower(token, current) {
    if (current) {
      return gameData.gameSettings.playerPowers[token]
    } else {
      return gameSettingsToSave.playerPowers[token]
    }
  }

  function orderByPowerLvl(token) {
    const powerLvl = getPlayerPower(token, true).powerLvl

    if (powerLvl === 'owner') {
      return 1 // Place gameOwner player first
    } else if (powerLvl === 'high') {
      return 2 // Place highAccess players next
    } else if (powerLvl === 'low') {
      return 3 // Place lowAccess players next
    } else {
      return 4 // Place other players last
    }
  }

  function handleOwnerChange(newOwner) {
    if (!checkPowerLvl())
      return toast.warning('Only the game owner can do this')
    // set new owner's powerLvl to 'owner', and set old owner's powerLvl to 'high'
    setGameSettingsToSave({
      ...gameSettingsToSave,
      playerPowers: {
        ...gameSettingsToSave.playerPowers,
        [getNewGameOwner().token]: {
          ...gameSettingsToSave.playerPowers[getNewGameOwner().token],
          powerLvl: gameSettingsToSave.defaultPlayerPower,
        },
        [newOwner]: {
          ...gameSettingsToSave.playerPowers[newOwner],
          powerLvl: 'owner',
        },
      },
    })
  }

  function handleDefaultPowerChange(e) {
    if (checkPowerLvl('high')) {
      setGameSettingsToSave({
        ...gameSettingsToSave,
        defaultPlayerPower: e.target.value,
      })
    } else {
      toast.warning('Only the game owner can do this')
    }
  }

  useEffect(() => {
    if (!gameData?.gameSettings?.playerPowers) return
    if (!gameSettingsToSave?.playerPowers) return
    if (getCurrentGameOwner().token !== getNewGameOwner().token) {
      setPowerWarningMessage(
        'You are passing game ownership! Be sure to check your new power level before saving.'
      )
    } else setPowerWarningMessage('')
  }, [gameSettingsToSave.playerPowers])

  useEffect(() => {
    if (playersToKickOnSave.includes(localUserToken)) {
      setKickSelfWarning('You are kicking yourself from the game!')
    }
  }, [playersToKickOnSave])

  function handlePlayerPowerChange(e, token) {
    const newPowerLvl = e.target.value
    if (
      token === localUserToken &&
      gameData.gameSettings.playerPowers[token].powerLvl === 'owner'
    )
      return toast.warning('You must assign another owner first')
    if (newPowerLvl === 'owner' && !checkPowerLvl())
      return toast.warning('Only the game owner can do this')
    if (newPowerLvl === 'high' && !checkPowerLvl())
      return toast.warning('Only the game owner can do this')
    if (newPowerLvl === 'low' && !checkPowerLvl('high'))
      return toast.warning('You need high power to do this')
    setGameSettingsToSave({
      ...gameSettingsToSave,
      playerPowers: {
        ...gameSettingsToSave.playerPowers,
        [token]: {
          ...gameSettingsToSave.playerPowers[token],
          powerLvl: newPowerLvl,
        },
      },
    })
  }

  function handleChangeAllPower(newPowerLvl) {
    if (newPowerLvl === 'high' && !checkPowerLvl())
      return toast.warning('Only the game owner can do this')
    if (newPowerLvl === 'low' && !checkPowerLvl('high'))
      return toast.warning('You need high power to do this')
    if (newPowerLvl === 'none' && !checkPowerLvl('high'))
      return toast.warning('You need high power to do this')

    const newPlayerPowers = { ...gameSettingsToSave.playerPowers }
    Object.entries(gameSettingsToSave.playerPowers).forEach(
      ([token, player]) => {
        if (player.powerLvl === 'owner' || player.token === localUserToken)
          return
        newPlayerPowers[token] = {
          ...gameSettingsToSave.playerPowers[token],
          powerLvl: newPowerLvl,
        }
      }
    )
    setGameSettingsToSave({
      ...gameSettingsToSave,
      playerPowers: newPlayerPowers,
    })
  }

  return (
    <>
      <Dialog
        onClose={() => {
          setShowDialog(!showDialog)
          setShowPowersExpansion(false)
          setShowPowerLvlCollapse(false)
          setShowKickPlayersCollapse(false)
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
          aria-label='close'
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
              : 'You need low power to change the game name'
          }
          enterDelay={200}
          placement='bottom'
        >
          <TextField
            spellCheck={false}
            fullWidth
            inputProps={{ maxLength: 20 }}
            value={newName}
            placeholder='Enter a game name'
            disabled={!checkPowerLvl('low')}
            label='Game name'
            onChange={(e) => setNewName(e.target.value)}
          />
        </LightTooltip>

        {gameSettingsToSave.deck.values && (
          <TextField
            label='Deck'
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
                color='success'
                onChange={(e) => {
                  if (checkPowerLvl('low')) {
                    setGameSettingsToSave({
                      ...gameSettingsToSave,
                      showAgreement: e.target.checked,
                    })
                  } else {
                    toast.warning('You need low power to do this')
                  }
                }}
              />
            }
            label='Show Agreement'
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
                    toast.warning('You need low power to do this')
                  }
                }}
                color='success'
              />
            }
            label='Show Average'
          />

          <FormControlLabel
            control={
              <Switch
                checked={gameSettingsToSave.woodTable}
                color='success'
                onChange={(e) => {
                  if (checkPowerLvl('low')) {
                    setGameSettingsToSave({
                      ...gameSettingsToSave,
                      woodTable: e.target.checked,
                    })
                  } else {
                    toast.warning('You need low power to do this')
                  }
                }}
              />
            }
            label='Wood Table'
          />

          <FormControlLabel
            control={
              <Switch
                // checked={gameSettingsToSave.funMode}
                checked={false}
                onChange={(e) => {
                  return toast('This feature is not available yet')
                  // if (checkPowerLvl('low')) {
                  //   setGameSettingsToSave({
                  //     ...gameSettingsToSave,
                  //     funMode: e.target.checked,
                  //   })
                  // } else {
                  //   toast.warning('You need low power to do this')
                  // }
                }}
                color='success'
              />
            }
            label='Fun mode'
          />
        </Box>

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <Box
            onClick={() => {
              setShowPowersExpansion(!showPowersExpansion)
            }}
            className='cursor-pointer'
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
                my power level:{' '}
                {gameData.gameSettings.playerPowers[localUserToken].powerLvl}
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
            <Typography
              color='primary'
              sx={{ fontSize: '16px', marginTop: '-2px', marginBottom: '10px' }}
            >
              <HelpOutlineIcon
                sx={{
                  fontSize: '22px',
                  marginRight: '5px',
                  marginBottom: '-5px',
                }}
              />
              Player powers is a new feature. Please{' '}
              <a
                href={`${document.location.origin}/contact`}
                target='_blank'
                style={{
                  textDecoration: 'underline',
                  fontWeight: 'bold',
                  color: 'inherit',
                }}
              >
                report any bugs
              </a>{' '}
              to the developer.
            </Typography>
            <Box
              className='cursor-pointer'
              onClick={() => setShowPowerLvlCollapse(!showPowerLvlCollapse)}
              sx={{ display: 'flex', gap: '10px', marginBottom: '10px' }}
            >
              {showPowerLvlCollapse ? (
                <KeyboardArrowDownIcon />
              ) : (
                <KeyboardArrowRightIcon />
              )}
              <Typography sx={{ fontSize: '16px', fontWeight: 'bold' }}>
                Player power levels
                <LightTooltip
                  placement='top'
                  title='The power level of each player. Low power players can change basic game settings, high power players can change basic settings and some power settings.'
                >
                  <HelpOutlineIcon
                    color='primary'
                    sx={{
                      fontSize: '22px',
                      marginBottom: '-6px',
                      marginLeft: '8px',
                    }}
                  />
                </LightTooltip>
              </Typography>
            </Box>
            {powerWarningMessage && showPowerLvlCollapse && (
              <Typography
                sx={{
                  fontSize: '14px',
                  color: 'red',
                  margin: '-8px 0 12px 35px',
                }}
              >
                {powerWarningMessage}
              </Typography>
            )}
            {/* player powers collapse */}
            <Collapse in={showPowerLvlCollapse} sx={{ paddingLeft: '35px' }}>
              <Box
                sx={{
                  maxWidth: 'fit-content',
                  marginTop: '-5px',
                  marginBottom: '10px',
                }}
              >
                {/* <Button
                  sx={{
                    textTransform: 'none',
                    marginTop: '10px',
                    fontWeight: 'bold',
                    fontSize: '17px',
                  }}
                  onClick={() => handleChangeAllPower('low')}
                >
                  Change all power levels
                </Button> */}
                {Object.entries(gameData.players)
                  .sort((a, b) => {
                    return orderByPowerLvl(a[0]) - orderByPowerLvl(b[0])
                  })
                  .map(([token, player], index) => {
                    const powerLvl = getPlayerPower(token, false).powerLvl
                    return (
                      <Box
                        key={index}
                        sx={{
                          display: 'flex',
                          gap: '10px',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                        }}
                      >
                        <Typography
                          color={token === localUserToken && 'primary'}
                          sx={{ fontSize: '16px', fontWeight: 'bold' }}
                        >
                          {player.playerName}
                        </Typography>
                        <Select
                          size='small'
                          sx={{
                            m: 1,
                            minWidth: 120,
                            maxHeight: '34px',
                            margin: '5px',
                          }}
                          labelId='demo-select-small-label'
                          id='demo-select-small'
                          value={powerLvl}
                          onChange={(e) => {
                            if (
                              token === localUserToken &&
                              player.powerLvl === 'owner'
                            ) {
                              return toast.warning(
                                'You must assign a new owner before changing your power level'
                              )
                            }

                            if (e.target.value === 'owner') {
                              handleOwnerChange(token)
                            } else if (
                              gameData.gameSettings.playerPowers[token]
                                .powerLvl === 'owner' &&
                              localUserToken !== token
                            ) {
                              toast.warning('Only the game owner can do this')
                            } else {
                              handlePlayerPowerChange(e, token)
                            }
                          }}
                        >
                          <MenuItem value='none'>
                            <em>None</em>
                          </MenuItem>
                          <MenuItem value='low'>Low</MenuItem>
                          <MenuItem value='high'>High</MenuItem>
                          <MenuItem value='owner'>Owner</MenuItem>
                        </Select>
                      </Box>
                    )
                  })}
              </Box>
            </Collapse>

            <Box
              className='cursor-pointer'
              onClick={() =>
                setShowDefaultPowerCollapse(!showDefaultPowerCollapse)
              }
              sx={{ display: 'flex', gap: '10px', marginBottom: '10px' }}
            >
              {showDefaultPowerCollapse ? (
                <KeyboardArrowDownIcon />
              ) : (
                <KeyboardArrowRightIcon />
              )}
              <Typography sx={{ fontSize: '16px', fontWeight: 'bold' }}>
                Default player power ({gameSettingsToSave.defaultPlayerPower})
                <LightTooltip
                  placement='top'
                  title='The default power level that will be assigned to joining players. Changing this does not affect current players.'
                >
                  <HelpOutlineIcon
                    color='primary'
                    sx={{
                      fontSize: '22px',
                      marginBottom: '-6px',
                      marginLeft: '8px',
                    }}
                  />
                </LightTooltip>
              </Typography>
            </Box>
            {/* default power collapse */}
            <Collapse
              in={showDefaultPowerCollapse}
              sx={{ paddingLeft: '34px' }}
            >
              <RadioGroup
                sx={{ marginTop: '-10px', marginBottom: '10px' }}
                aria-labelledby='game-owner-radio-group'
                value={gameSettingsToSave.defaultPlayerPower}
                name='owner-radio-buttons-group'
                onChange={(e) => handleDefaultPowerChange(e)}
              >
                {[
                  { value: 'none', label: 'None' },
                  { value: 'low', label: 'Low' },
                  { value: 'high', label: 'High' },
                ].map((power, index) => (
                  <FormControlLabel
                    key={index}
                    sx={{ maxHeight: '34px' }}
                    control={<Radio sx={{ maxHeight: '34px' }} />}
                    value={power.value}
                    label={power.label}
                  />
                ))}
              </RadioGroup>
            </Collapse>

            <Box
              className='cursor-pointer'
              onClick={() =>
                setShowKickPlayersCollapse(!showKickPlayersCollapse)
              }
              sx={{ display: 'flex', gap: '10px', marginBottom: '10px' }}
            >
              {showKickPlayersCollapse ? (
                <KeyboardArrowDownIcon />
              ) : (
                <KeyboardArrowRightIcon />
              )}
              <Typography sx={{ fontSize: '16px', fontWeight: 'bold' }}>
                Kick players
              </Typography>
            </Box>
            {/* kick players collapse */}
            <Collapse in={showKickPlayersCollapse} sx={{ paddingLeft: '33px' }}>
              <Box sx={{ maxWidth: 'fit-content' }}>
                {Object.entries(gameData.players)
                  .sort((a, b) => {
                    return orderByPowerLvl(a[0]) - orderByPowerLvl(b[0])
                  })
                  .map(([token, player], index) => (
                    <Box
                      key={index}
                      sx={{
                        display: 'flex',
                        gap: '10px',
                        alignItems: 'center',
                        width: '100%',
                        justifyContent: 'space-between',
                      }}
                    >
                      <Typography
                        color={player.token === localUserToken && 'primary'}
                        sx={{
                          fontSize: '16px',
                          fontWeight: 'bold',
                          textDecoration:
                            playersToKickOnSave.includes(token) &&
                            'line-through',
                        }}
                      >
                        {player.playerName}
                      </Typography>
                      <Button
                        color='error'
                        size='small'
                        disabled={
                          getCurrentGameOwner().token === token ||
                          getNewGameOwner().token === token
                        }
                        sx={{
                          maxHeight: '34px',
                          textTransform: 'none',
                          fontWeight: 'bold',
                          fontSize: '17px',
                        }}
                        onClick={() => handleAddPlayerToKick(token)}
                      >
                        {playersToKickOnSave.includes(token)
                          ? 'Cancel'
                          : 'Kick'}
                      </Button>
                    </Box>
                  ))}
              </Box>
            </Collapse>

            {/* Power needed to change game state */}
            <Box sx={{
              marginLeft: '7px',
            }}>
            <Typography sx={{ fontSize: '16px', fontWeight: 'bold' }}>
                Power needed to change reveal cards
              </Typography>
              <Select
                size='small'
                sx={{
                  m: 1,
                  minWidth: 120,
                  maxHeight: '34px',
                  margin: '5px',
                }}
                labelId='demo-select-small-label'
                id='demo-select-small'
                value={gameSettingsToSave.revealPowerReq}
                onChange={(e) => {
                  if (!checkPowerLvl('high')) return toast.warning('You need high power to do this')
                  setGameSettingsToSave({
                    ...gameSettingsToSave,
                    revealPowerReq: e.target.value,
                  })
                }}
              >
                <MenuItem value='none'>
                  <em>None</em>
                </MenuItem>
                <MenuItem value='low'>Low</MenuItem>
                <MenuItem value='high'>High</MenuItem>
                <MenuItem value='owner'>Owner</MenuItem>
              </Select>
            </Box>
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
            variant='contained'
            color='primary'
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
