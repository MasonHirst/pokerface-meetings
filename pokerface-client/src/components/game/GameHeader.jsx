import React, { useEffect, useContext, useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import pokerLogo from '../../assets/poker-logo.png'
import useClipboard from 'react-use-clipboard'
import { GameContext } from '../../context/GameContext'
import dontGo from '../../assets/dont-go.gif'
import ChooseDeck from '../dialog/ChooseDeck'
import { useMediaQuery } from '@mui/material'
import ProfileDialog from '../dialog/ProfileDialog'
import muiStyles from '../../style/muiStyles'
import Swal from 'sweetalert2'
import PurpleDeckCard from './PurpleDeckCard'
const {
  Typography,
  LogoutIcon,
  Button,
  Box,
  Dialog,
  TextField,
  ExpandMoreIcon,
  Menu,
  MenuItem,
  ListItemIcon,
  SettingsIcon,
  PollOutlinedIcon,
  StyleIcon,
  MenuIcon,
  Drawer,
  CloseIcon,
  IconButton,
  CheckIcon,
  EditIcon,
  Avatar,
  LinkIcon,
} = muiStyles

const GameHeader = () => {
  const navigate = useNavigate()
  const isSmallScreen = useMediaQuery('(max-width: 600px)')
  const { gameData, sendMessage } = useContext(GameContext)
  const [anchorEl, setAnchorEl] = useState(null)
  const [showProfileDialog, setShowProfileDialog] = useState(false)
  const open = Boolean(anchorEl)
  const [newName, setNewName] = useState(gameData.gameRoomName)
  const roomName = gameData.gameRoomName
  const [showInviteDialog, setShowInviteDialog] = useState(false)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [editingGameName, setEditingGameName] = useState(false)
  const inviteLinkInputRef = useRef()
  const [isCopied, setCopied] = useClipboard(window.location.href, {
    // `isCopied` will go back to `false` after 1500ms.
    successDuration: 1500,
  })
  const [showGameSettingsDialog, setShowGameSettingsDialog] = useState(false)
  const [showHistoryDialog, setShowHistoryDialog] = useState(false)
  const [showDeckDialog, setShowDeckDialog] = useState(false)
  const [updatedDeck, setUpdatedDeck] = useState('')

  useEffect(() => {
    if (!gameData.gameRoomName) return
    setNewName(gameData.gameRoomName)
  }, [gameData.gameRoomName])

  function updateGameName(e) {
    e.preventDefault()
    setEditingGameName(!editingGameName)
    if (!newName || newName === gameData.gameRoomName) return
    sendMessage('updatedGameName', { name: newName })
  }

  function handleLeaveGame() {
    handleCloseGameSettings()
    Swal.fire({
      title: 'Are you sure?',
      text: 'You will be removed from the game',
      imageUrl: dontGo,
      imageWidth: 'min(90vw, 400px',
      confirmButtonText: 'Take me home',
      showCancelButton: true,
      cancelButtonText: 'Stay',
      customClass: {
        popup: 'swal2-popup', // Add the custom CSS class to the 'popup' element
      },
    }).then((result) => {
      if (result.isConfirmed) {
        navigate('/home')
        window.location.reload()
      }
    })
  }

  useEffect(() => {
    if (updatedDeck) {
      sendMessage('updatedDeck', { deck: updatedDeck })
    }
  }, [updatedDeck])

  function handleOpenGameSettings(event) {
    setAnchorEl(event.currentTarget)
  }
  function handleCloseGameSettings() {
    setAnchorEl(null)
  }

  useEffect(() => {
    setTimeout(() => {
      if (inviteLinkInputRef.current) {
        inviteLinkInputRef.current.select()
      }
    }, 200)
  }, [showInviteDialog, inviteLinkInputRef])

  return (
    <Box
      className="game-header-container"
      sx={{
        width: '100%',
        height: isSmallScreen ? '60px' : '80px',
        backgroundColor: '#902bf5',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        padding: { xs: '0 5px', sm: '0 40px' },
      }}
    >
      <Box
        className="game-header"
        sx={{
          width: 'min(100%, 1200px)',
          height: '100%',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: { xs: '5px', sm: '15px' },
          }}
        >
          <img
            className="cursor-pointer"
            onClick={() => navigate('/')}
            src={pokerLogo}
            alt="logo"
            style={{ height: '36px' }}
          />
          <Button
            variant="text"
            color="white"
            endIcon={<ExpandMoreIcon />}
            onClick={handleOpenGameSettings}
            sx={{ textTransform: 'none', fontSize: { xs: '18px', sm: '22px' } }}
            disableElevation
          >
            {roomName}
          </Button>
        </Box>
        <Menu open={open} anchorEl={anchorEl} onClose={handleCloseGameSettings}>
          <MenuItem
            onClick={() => {
              handleCloseGameSettings()
              setShowGameSettingsDialog(!showGameSettingsDialog)
            }}
          >
            <ListItemIcon>
              <SettingsIcon />
            </ListItemIcon>
            <Typography variant="h6">Game Settings</Typography>
          </MenuItem>
          <MenuItem
            onClick={() => {
              handleCloseGameSettings()
              setShowHistoryDialog(!showHistoryDialog)
            }}
          >
            <ListItemIcon>
              <PollOutlinedIcon />
            </ListItemIcon>
            <Typography variant="h6">Vote History</Typography>
          </MenuItem>

          <MenuItem
            onClick={() => {
              handleCloseGameSettings()
              setShowInviteDialog(!showInviteDialog)
            }}
          >
            <ListItemIcon>
              <LinkIcon />
            </ListItemIcon>
            <Typography variant="h6">Invite players</Typography>
          </MenuItem>

          <MenuItem onClick={handleLeaveGame}>
            <ListItemIcon>
              <LogoutIcon />
            </ListItemIcon>
            <Typography variant="h6">Leave Game</Typography>
          </MenuItem>
        </Menu>

        <Box sx={{ display: 'flex', gap: '22px', alignItems: 'center' }}>
          <Button
            color="white"
            size="large"
            onClick={() => setShowInviteDialog(!showInviteDialog)}
            variant="outlined"
            sx={{
              textTransform: 'none',
              fontSize: '18px',
              display: { xs: 'none', md: 'block' },
            }}
          >
            Invite players
          </Button>

          {!isSmallScreen ? (
            <Button
              onClick={() => setDrawerOpen(!drawerOpen)}
              endIcon={<ExpandMoreIcon />}
              color="white"
              sx={{
                textTransform: 'none',
                fontSize: { xs: '18px', sm: '22px' },
                gap: '12px',
              }}
            >
              <PurpleDeckCard
                showBgImage
                showCard={false}
                borderColor="white"
                borderThickness={1}
                sizeMultiplier={0.6}
                cardImage={localStorage.getItem('pokerCardImage')}
              />
              {localStorage.getItem('playerName')}
            </Button>
          ) : (
            <IconButton
              sx={{ padding: { xs: '7px', sm: '12px' } }}
              onClick={() => setDrawerOpen(!drawerOpen)}
            >
              <MenuIcon color="white" />
            </IconButton>
          )}
        </Box>

        <Drawer
          anchor="right"
          open={drawerOpen}
          onClose={() => setDrawerOpen(!drawerOpen)}
        >
          <Box
            sx={{
              minWidth: isSmallScreen ? '180px' : '260px',
              padding: '10px 0',
            }}
          >
            <MenuItem
              sx={{ display: 'flex', alignItems: 'center', gap: '10px' }}
              onClick={() => {
                setShowProfileDialog(!showProfileDialog)
                setDrawerOpen(!drawerOpen)
              }}
            >
              <PurpleDeckCard
                showBgImage
                showCard={false}
                borderColor={'#902bf5'}
                borderThickness={1.5}
                sizeMultiplier={0.8}
                cardImage={localStorage.getItem('pokerCardImage')}
              />
              <Typography variant="h6">
                {localStorage.getItem('playerName')}
              </Typography>
              <EditIcon />
            </MenuItem>
          </Box>
        </Drawer>

        <Dialog
          onClose={() => setShowInviteDialog(!showInviteDialog)}
          PaperProps={{
            style: {
              borderRadius: 15,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              gap: 20,
              width: '350px',
              padding: isSmallScreen ? 10 : 28,
              height: isSmallScreen ? 220 : 250,
            },
          }}
          open={showInviteDialog}
        >
          <IconButton
            sx={{ position: 'absolute', top: 7, right: 5 }}
            aria-label="close"
            onClick={() => setShowInviteDialog(!showInviteDialog)}
          >
            <CloseIcon />
          </IconButton>
          <TextField
            inputRef={inviteLinkInputRef}
            fullWidth
            value={window.location.href}
          />
          <Button
            variant="contained"
            disableElevation
            fullWidth
            onClick={(e) => {
              setCopied(e)
              setTimeout(() => {
                setShowInviteDialog(!showInviteDialog)
              }, 700)
            }}
          >
            {isCopied ? 'Copied!' : 'Copy invite link'}
          </Button>
        </Dialog>
      </Box>

      <Dialog
        onClose={() => {
          setShowGameSettingsDialog(!showGameSettingsDialog)
          setEditingGameName(false)
        }}
        fullScreen={isSmallScreen}
        PaperProps={{
          style: {
            borderRadius: 15,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            gap: 20,
            width: !isSmallScreen && 550,
            padding: isSmallScreen ? '0 10px' : '70px 70px',
            height: 250,
          },
        }}
        open={showGameSettingsDialog}
      >
        <IconButton
          sx={{ position: 'absolute', top: 7, right: 5 }}
          aria-label="close"
          onClick={() => {
            setShowGameSettingsDialog(!showGameSettingsDialog)
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
          }}
          onSubmit={updateGameName}
        >
          {editingGameName ? (
            <TextField
              autoFocus
              fullWidth
              inputProps={{ maxLength: 20 }}
              value={newName}
              placeholder="Enter a game name"
              label="New game name"
              onChange={(e) => setNewName(e.target.value)}
            />
          ) : (
            <Typography variant="h6">{gameData.gameRoomName}</Typography>
          )}
          {editingGameName ? (
            <IconButton onClick={updateGameName}>
              <CheckIcon />
            </IconButton>
          ) : (
            <IconButton onClick={() => setEditingGameName(!editingGameName)}>
              <EditIcon />
            </IconButton>
          )}
        </form>

        <Button
          onClick={() => {
            setShowDeckDialog(!showDeckDialog)
            setShowGameSettingsDialog(!showGameSettingsDialog)
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
      {showDeckDialog && (
        <ChooseDeck
          showDeckDialog={showDeckDialog}
          setShowDeckDialog={setShowDeckDialog}
          setDeckProp={setUpdatedDeck}
        />
      )}

      <Dialog
        onClose={() => setShowHistoryDialog(!showHistoryDialog)}
        PaperProps={{
          style: {
            borderRadius: 15,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            gap: 20,
            width: 350,
            padding: 35,
            height: 250,
          },
        }}
        open={showHistoryDialog}
      >
        <IconButton
          sx={{ position: 'absolute', top: 7, right: 5 }}
          aria-label="close"
          onClick={() => setShowHistoryDialog(!showHistoryDialog)}
        >
          <CloseIcon />
        </IconButton>
        <Typography variant="h5">Vote History</Typography>
      </Dialog>

      {showProfileDialog && (
        <ProfileDialog
          gameData={gameData}
          showDialog={showProfileDialog}
          setShowDialog={setShowProfileDialog}
        />
      )}
    </Box>
  )
}

export default GameHeader
