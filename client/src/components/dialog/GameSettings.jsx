import React, { useState, useEffect, useContext, useMemo } from 'react';
import { Checkbox, FormControl, FormGroup, useMediaQuery } from '@mui/material';
import muiStyles from '../../style/muiStyles';
import ChooseDeck from './ChooseDeck';
import { GameContext } from '../../context/GameContext';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { eventBus } from '../../utils/eventBus';
import { getPowerLvlAsNumber } from '../../utils/helperFunctions';

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
} = muiStyles;

const GameSettings = ({ showDialog, setShowDialog }) => {
  const { gameData, sendMessage, checkPowerLvl } = useContext(GameContext);
  const isSmallScreen = useMediaQuery('(max-width: 600px)');
  const [showPowersExpansion, setShowPowersExpansion] = useState(false);
  const [showKickPlayersCollapse, setShowKickPlayersCollapse] = useState(false);
  const [showPowerLvlCollapse, setShowPowerLvlCollapse] = useState(false);
  const [powerWarningMessage, setPowerWarningMessage] = useState('');
  const [showDefaultPowerCollapse, setShowDefaultPowerCollapse] =
    useState(false);
  const [newName, setNewName] = useState(gameData.gameSettings.gameRoomName);
  const [showDeckDialog, setShowDeckDialog] = useState(false);
  const [updatedDeck, setUpdatedDeck] = useState('');
  const [gameSettingsToSave, setGameSettingsToSave] = useState(
    gameData.gameSettings
  );
  const [playersToKickOnSave, setPlayersToKickOnSave] = useState([]);
  const [kickSelfWarning, setKickSelfWarning] = useState('');
  const [showCustomImgExpansion, setShowCustomImgExpansion] = useState(false);
  const localUserToken = localStorage.getItem('PokerfaceLocalUserToken');

  useEffect(() => {
    const handleSettingsUpdate = () => {
      setShowDialog(false);
    };

    eventBus.on('myPowerLevelChanged', handleSettingsUpdate);

    return () => {
      eventBus.off('myPowerLevelChanged', handleSettingsUpdate);
    };
  }, []);

  function saveGameSettings() {
    let ownerCount = 0;
    Object.values(gameSettingsToSave.playerPowers).forEach((player) => {
      if (player.powerLvl === 'owner') {
        ownerCount++;
      }
    });
    if (ownerCount !== 1) {
      return toast.warning('There must be exactly one owner');
    }

    if (
      JSON.stringify(gameSettingsToSave) ===
      JSON.stringify(gameData.gameSettings)
    ) {
      if (playersToKickOnSave.length > 0) {
        toast(
          `Kicked ${playersToKickOnSave.length} player${
            playersToKickOnSave.length > 1 ? 's' : ''
          }`
        );
      } else {
        toast('No changes were made');
      }
    } else {
      sendMessage('updatedGameSettings', { gameSettingsToSave });
      toast.success('Game settings saved');
    }
    if (playersToKickOnSave.length > 0) {
      sendMessage('kickPlayer', { playerTokens: playersToKickOnSave });
      setPlayersToKickOnSave([]);
    }
    setShowDialog(!showDialog);
  }

  function handleAddPlayerToKick(playerToken) {
    const kickedPlayerPowerLvl = getPlayerSettings(playerToken)?.powerLvl;
    if (kickedPlayerPowerLvl === 'owner') {
      return toast.warning('You cannot kick the game owner');
    }
    if (kickedPlayerPowerLvl === 'high' && !checkPowerLvl()) {
      return toast.warning('Only the game owner can do this');
    }
    if (kickedPlayerPowerLvl === 'low' && !checkPowerLvl('high')) {
      return toast.warning('You need high power to do this');
    }
    if (kickedPlayerPowerLvl === 'none' && !checkPowerLvl('high')) {
      return toast.warning('You need high power to do this');
    }

    if (playersToKickOnSave.includes(playerToken)) {
      const newPlayersToKick = playersToKickOnSave.filter(
        (token) => token !== playerToken
      );
      setPlayersToKickOnSave(newPlayersToKick);
    } else setPlayersToKickOnSave([...playersToKickOnSave, playerToken]);
  }

  useEffect(() => {
    if (!updatedDeck) {
      return;
    }
    if (checkPowerLvl('low')) {
      setGameSettingsToSave({ ...gameSettingsToSave, deck: updatedDeck });
    } else {
      toast.warning('You need low power to do this');
    }
  }, [updatedDeck]);

  useEffect(() => {
    if (!gameData?.gameSettings?.playerPowers) {
      return;
    }

    //? Check to see if the reveal power requirement has changed. If so, issue a warning toast and close the settings dialog
    if (
      gameData.gameSettings?.revealPowerReq !==
      gameSettingsToSave?.revealPowerReq
    ) {
      setShowDialog(false);
      toast.warning('Player permissions have been changed');
    }

    //? Update the settings UI if other settings have been changed by another player
    setGameSettingsToSave({
      ...gameSettingsToSave,
      playerPowers: gameData.gameSettings.playerPowers,
    });
  }, [gameData.gameSettings]);

  useEffect(() => {
    if (!newName) {
      return;
    }
    setGameSettingsToSave({
      ...gameSettingsToSave,
      gameRoomName: newName.trim(),
    });
  }, [newName]);

  useEffect(() => {
    if (!gameData.gameSettings.gameRoomName) {
      return;
    }
    setNewName(gameData.gameSettings.gameRoomName);
  }, [gameData.gameSettings.gameRoomName]);

  function getCurrentGameOwner() {
    //? filter through playerPowers and find the player with powerLvl of 'owner'.
    return Object.values(gameData.gameSettings?.playerPowers).find(
      ({ powerLvl }) => powerLvl === 'owner'
    );
  }

  const newGameOwner = useMemo(() => {
    // filter through gameSettingsToSave.playerPowers and find the player with powerLvl of 'owner'
    return Object.values(gameSettingsToSave.playerPowers).find(
      ({ powerLvl }) => powerLvl === 'owner'
    );
  }, [gameSettingsToSave]);

  function getPlayerSettings(token, current = true) {
    if (current) {
      return gameData.gameSettings.playerPowers[token];
    } else {
      return gameSettingsToSave.playerPowers[token];
    }
  }

  function handleOwnerChange(newOwner) {
    if (!checkPowerLvl()) {
      return toast.warning('Only the game owner can do this');
    }
    // set new owner's powerLvl to 'owner', and set old owner's powerLvl to the default.
    setGameSettingsToSave({
      ...gameSettingsToSave,
      playerPowers: {
        ...gameSettingsToSave.playerPowers,
        [newGameOwner.token]: {
          ...gameSettingsToSave.playerPowers[newGameOwner.token],
          powerLvl: gameSettingsToSave.defaultPlayerPower,
        },
        [newOwner]: {
          ...gameSettingsToSave.playerPowers[newOwner],
          powerLvl: 'owner',
        },
      },
    });
  }

  function tokenIsMe(token) {
    return token === localUserToken;
  }

  function handleDefaultPowerChange(e) {
    if (checkPowerLvl('high')) {
      setGameSettingsToSave({
        ...gameSettingsToSave,
        defaultPlayerPower: e.target.value,
      });
    } else {
      toast.warning('Only the game owner can do this');
    }
  }

  useEffect(() => {
    if (!gameData?.gameSettings?.playerPowers) {
      return;
    }
    if (!gameSettingsToSave?.playerPowers) {
      return;
    }
    if (getCurrentGameOwner()?.token !== newGameOwner?.token) {
      setPowerWarningMessage(
        'You are passing game ownership! Be sure to check your new power level before saving.'
      );
    } else {
      setPowerWarningMessage('');
    }
  }, [gameSettingsToSave.playerPowers]);

  useEffect(() => {
    if (playersToKickOnSave.includes(localUserToken)) {
      setKickSelfWarning('You are kicking yourself from the game!');
    }
  }, [playersToKickOnSave]);

  function handlePlayerPowerChange(newPowerLvl, token) {
    if (
      token === localUserToken &&
      getPlayerSettings(token)?.powerLvl === 'owner' &&
      newGameOwner?.token === localUserToken
    ) {
      return toast.warning('You must assign another owner first');
    }
    if (newPowerLvl === 'owner' && !checkPowerLvl()) {
      return toast.warning('Only the game owner can do this');
    }
    if (newPowerLvl === 'high' && !checkPowerLvl()) {
      return toast.warning('Only the game owner can do this');
    }
    if (newPowerLvl === 'low' && !checkPowerLvl('low')) {
      return toast.warning('You need high power to do this');
    }
    setGameSettingsToSave({
      ...gameSettingsToSave,
      playerPowers: {
        ...gameSettingsToSave.playerPowers,
        [token]: {
          ...gameSettingsToSave.playerPowers[token],
          powerLvl: newPowerLvl,
        },
      },
    });
  }

  const playersSortedByPower = useMemo(() => {
    if (!gameSettingsToSave?.playerPowers) {
      return [];
    }
    return Object.values(gameSettingsToSave?.playerPowers).sort((a, b) => {
      return getPowerLvlAsNumber(a.powerLvl) - getPowerLvlAsNumber(b.powerLvl);
    });
  }, [gameSettingsToSave?.playerPowers]);

  const playerPowersAsArray = useMemo(() => {
    if (!gameSettingsToSave?.playerPowers) {
      return [];
    }
    return Object.values(gameSettingsToSave?.playerPowers);
  }, [gameSettingsToSave]);

  function handleUpdateShowCustomCardImg(playerToken) {
    if (!checkPowerLvl('high')) {
      return toast.warning('You need high power to do this');
    }
    const currentValue =
      gameSettingsToSave.playerPowers[playerToken].showCustomCardImg;

    setGameSettingsToSave({
      ...gameSettingsToSave,
      playerPowers: {
        ...gameSettingsToSave.playerPowers,
        [playerToken]: {
          ...gameSettingsToSave.playerPowers[playerToken],
          showCustomCardImg: !currentValue,
        },
      },
    });
  }

  function handlePlayerPowerSelectChange(newVal, playerObj) {
    const { token, powerLvl } = playerObj;
    {
      if (token === localUserToken && powerLvl === 'owner') {
        return toast.warning(
          'You must assign a new owner before changing your power level'
        );
      }

      if (newVal === 'owner') {
        handleOwnerChange(token);
      } else if (
        getPlayerSettings(token)?.powerLvl === 'owner' &&
        localUserToken !== token
      ) {
        toast.warning('Only the game owner can do this');
      } else {
        handlePlayerPowerChange(newVal, token);
      }
    }
  }

  function handleCloseDialog() {
    setShowDialog(!showDialog);
    setShowPowersExpansion(false);
    setShowPowerLvlCollapse(false);
    setShowKickPlayersCollapse(false);
  }

  return (
    <>
      <Dialog
        onClose={handleCloseDialog}
        fullScreen={isSmallScreen}
        PaperProps={{
          style: {
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem',
            borderRadius: !isSmallScreen && 15,
            maxHeight: !isSmallScreen && 'min(85vh, calc(100vh - 30px))',
            minWidth: isSmallScreen
              ? '100vw'
              : 'min(750px, calc(100vw - 16px))',
            padding: isSmallScreen ? '15px' : '25px',
          },
        }}
        open={showDialog}
      >
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '.5rem',
          }}
        >
          <Typography variant='h5'>Settings</Typography>

          <IconButton
            sx={{ width: '3rem', height: '3rem' }}
            aria-label='close'
            onClick={() => {
              setShowDialog(!showDialog);
            }}
          >
            <CloseIcon />
          </IconButton>
        </Box>

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
            inputProps={{ maxLength: 24 }}
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
              setShowDeckDialog(!showDeckDialog);
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
                checked={!!gameSettingsToSave?.anonymousMode}
                color='success'
                onChange={(e) => {
                  if (checkPowerLvl('high')) {
                    setGameSettingsToSave({
                      ...gameSettingsToSave,
                      anonymousMode: e.target.checked,
                    });
                  } else {
                    toast.warning('You need high power to do this');
                  }
                }}
              />
            }
            label='Anonymous mode'
          />

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
                    });
                  } else {
                    toast.warning('You need low power to do this');
                  }
                }}
              />
            }
            label='Show agreement'
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
                    });
                  } else {
                    toast.warning('You need low power to do this');
                  }
                }}
                color='success'
              />
            }
            label='Show average'
          />

          <FormControlLabel
            control={
              <Switch
                checked={gameSettingsToSave.showShadows}
                color='success'
                onChange={(e) => {
                  if (checkPowerLvl('high')) {
                    setGameSettingsToSave({
                      ...gameSettingsToSave,
                      showShadows: e.target.checked,
                    });
                  } else {
                    toast.warning('You need high power to do this');
                  }
                }}
              />
            }
            label='Shadows'
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
                    });
                  } else {
                    toast.warning('You need low power to do this');
                  }
                }}
              />
            }
            label='Wood table'
          />

          <FormControlLabel
            control={
              <Switch
                checked={gameSettingsToSave.funModeEnabled}
                onChange={(e) => {
                  //? Fun mode can exponentially increase the socket message frequency, so we are blocking it on the fly.dev deployment to prevent performance issues.
                  // if (window.location.href.includes('pokerface.fly.dev')) {
                  //   return toast.warning('Fun mode is not available on the fly.dev deployment');
                  // }
                  if (checkPowerLvl('low')) {
                    setGameSettingsToSave({
                      ...gameSettingsToSave,
                      funModeEnabled: e.target.checked,
                    });
                  } else {
                    toast.warning('You need low power to do this');
                  }
                }}
                color='success'
              />
            }
            label='Fun mode'
          />
        </Box>

        <Box sx={{ display: 'flex', flexDirection: 'column' }}>
          <Box
            onClick={() => {
              setShowPowersExpansion(!showPowersExpansion);
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
                my power level: {getPlayerSettings(localUserToken).powerLvl}
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
              sx={{
                fontSize: '16px',
                marginTop: '-2px',
                marginBottom: '10px',
                marginTop: '.5rem',
              }}
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
                {playersSortedByPower.map((player, index) => {
                  const { token, playerName, powerLvl } = player || {};
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
                        color={tokenIsMe(token) && 'primary'}
                        sx={{
                          fontWeight: tokenIsMe(token) && 'bold',
                        }}
                      >
                        {playerName}
                      </Typography>
                      <Select
                        size='small'
                        sx={{
                          m: 1,
                          minWidth: 120,
                          maxHeight: '34px',
                          margin: '5px',
                        }}
                        labelId='player-power-select-small-label'
                        id='player-power-select-small'
                        value={powerLvl}
                        onChange={(e) =>
                          handlePlayerPowerSelectChange(e.target.value, player)
                        }
                      >
                        <MenuItem value='none'>
                          <em>None</em>
                        </MenuItem>
                        <MenuItem value='low'>Low</MenuItem>
                        <MenuItem value='high'>High</MenuItem>
                        <MenuItem value='owner'>Owner</MenuItem>
                      </Select>
                    </Box>
                  );
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
                    control={
                      <Radio
                        sx={{
                          '&.Mui-checked': {
                            color: 'green',
                          },
                        }}
                      />
                    }
                    value={power.value}
                    label={power.label}
                  />
                ))}
              </RadioGroup>
            </Collapse>

            {/* Power needed to change game state */}
            <Box
              sx={{
                marginLeft: '7px',
              }}
            >
              <Typography sx={{ fontSize: '16px', fontWeight: 'bold' }}>
                Power needed to reveal cards
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
                  if (!checkPowerLvl('high')) {
                    return toast.warning('You need high power to do this');
                  }
                  setGameSettingsToSave({
                    ...gameSettingsToSave,
                    revealPowerReq: e.target.value,
                  });
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

        <Box sx={{ display: 'flex', flexDirection: 'column' }}>
          <Box
            onClick={() => {
              setShowCustomImgExpansion(!showCustomImgExpansion);
            }}
            className='cursor-pointer'
            sx={{
              display: 'flex',
              gap: '10px',
              width: '100%',
            }}
          >
            {showCustomImgExpansion ? (
              <KeyboardArrowDownIcon />
            ) : (
              <KeyboardArrowRightIcon />
            )}
            <Typography sx={{ fontSize: '18px', fontWeight: 'bold' }}>
              Custom card images
            </Typography>
          </Box>

          {/* Players allowed to have custom picture collapse */}
          <Collapse
            sx={{
              overflowY: 'auto',
              paddingLeft: '30px',
            }}
            in={showCustomImgExpansion}
          >
            <Box
              sx={{
                marginLeft: '.45rem',
                marginTop: '.5rem',
              }}
            >
              <FormControl component='fieldset'>
                <Typography
                  sx={{
                    fontSize: '.9rempx',
                    fontStyle: 'italic',
                    opacity: 0.7,
                  }}
                >
                  Players who can display a custom card image to others.
                </Typography>
                <Typography
                  sx={{
                    fontSize: '.9rempx',
                    fontStyle: 'italic',
                    opacity: 0.7,
                  }}
                >
                  High power is needed to change this.
                </Typography>
                <FormGroup>
                  {playerPowersAsArray.map(({ token, playerName }) => (
                    <FormControlLabel
                      key={token}
                      control={
                        <Checkbox
                          color='success'
                          checked={
                            getPlayerSettings(token, false)?.showCustomCardImg
                          }
                          onChange={() => handleUpdateShowCustomCardImg(token)}
                        />
                      }
                      label={
                        <Typography
                          color={tokenIsMe(token) && 'primary'}
                          sx={{
                            fontWeight: tokenIsMe(token) && 'bold',
                          }}
                        >
                          {playerName}
                        </Typography>
                      }
                    />
                  ))}
                </FormGroup>
              </FormControl>
            </Box>
          </Collapse>
        </Box>

        <Box sx={{ display: 'flex', flexDirection: 'column' }}>
          <Box
            onClick={() => {
              setShowKickPlayersCollapse(!showKickPlayersCollapse);
            }}
            className='cursor-pointer'
            sx={{
              display: 'flex',
              gap: '10px',
              width: '100%',
            }}
          >
            {showKickPlayersCollapse ? (
              <KeyboardArrowDownIcon />
            ) : (
              <KeyboardArrowRightIcon />
            )}
            <Typography sx={{ fontSize: '18px', fontWeight: 'bold' }}>
              Kick players
            </Typography>
          </Box>
          {/* kick players collapse */}
          <Collapse in={showKickPlayersCollapse} sx={{ paddingLeft: '33px' }}>
            <Box sx={{ maxWidth: 'fit-content' }}>
              {playersSortedByPower.map(({ token, playerName }, index) => (
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
                    color={tokenIsMe(token) && 'primary'}
                    sx={{
                      fontSize: '16px',
                      fontWeight: 'bold',
                      textDecoration:
                        playersToKickOnSave.includes(token) && 'line-through',
                    }}
                  >
                    {playerName}
                  </Typography>
                  <Button
                    color='error'
                    size='small'
                    disabled={
                      getCurrentGameOwner()?.token === token ||
                      newGameOwner?.token === token
                    }
                    sx={{
                      maxHeight: '34px',
                      textTransform: 'none',
                      fontWeight: 'bold',
                      fontSize: '17px',
                    }}
                    onClick={() => handleAddPlayerToKick(token)}
                  >
                    {playersToKickOnSave.includes(token) ? 'Cancel' : 'Kick'}
                  </Button>
                </Box>
              ))}
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
            onClick={() => handleCloseDialog()}
            sx={{
              textTransform: 'none',
              marginTop: '10px',
              fontWeight: 'bold',
              fontSize: '17px',
            }}
          >
            Cancel
          </Button>
          <Button
            disableElevation
            fullWidth
            disableRipple
            variant='contained'
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
  );
};

export default GameSettings;
