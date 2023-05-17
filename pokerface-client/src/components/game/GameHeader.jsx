import React, { useEffect, useContext, useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import pokerLogo from '../../assets/poker-logo.png'
import useClipboard from 'react-use-clipboard'
import { GameContext } from '../../context/GameContext'
import ChooseDeck from '../dialog/ChooseDeck'
import { useMediaQuery } from '@mui/material'
import muiStyles from '../../style/muiStyles'
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
  LinkIcon,
} = muiStyles

const GameHeader = () => {
  const navigate = useNavigate()
  const isSmallScreen = useMediaQuery('(max-width: 600px)')
  const { gameData, sendMessage } = useContext(GameContext)
  const [anchorEl, setAnchorEl] = useState(null)
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
        width: '100vw',
        height: '80px',
        backgroundColor: '#902bf5',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        padding: { xs: '0 10px', sm: '0 40px' },
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
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <img src={pokerLogo} alt="logo" style={{ height: '36px' }} />
          <Button
            variant="text"
            color="white"
            endIcon={<ExpandMoreIcon />}
            onClick={handleOpenGameSettings}
            sx={{ textTransform: 'none', fontSize: '22px' }}
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
              navigate('/home')
              window.location.reload()
            }}
          >
            <ListItemIcon>
              <LogoutIcon />
            </ListItemIcon>
            <Typography variant="h6">Leave Game</Typography>
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
        </Menu>

        <Button
          color="white"
          size="large"
          onClick={() => setShowInviteDialog(!showInviteDialog)}
          variant="outlined"
          sx={{
            textTransform: 'none',
            fontSize: '18px',
            display: { xs: 'none', sm: 'block' },
          }}
        >
          Invite players
        </Button>

        <IconButton onClick={() => setDrawerOpen(!drawerOpen)}>
          <MenuIcon color='white' />
        </IconButton>
        <Drawer
          anchor="right"
          open={drawerOpen}
          onClose={() => setDrawerOpen(!drawerOpen)}
        >

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
            padding: isSmallScreen ? '0 10px' : '0 20px',
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
          variant="contained"
          sx={{ textTransform: 'none', fontSize: '17px' }}
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
    </Box>
  )
}

export default GameHeader
