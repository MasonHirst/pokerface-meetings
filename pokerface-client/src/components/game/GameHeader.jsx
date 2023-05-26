import React, { useEffect, useContext, useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import pokerLogo from '../../assets/poker-logo.png'
import useClipboard from 'react-use-clipboard'
import { GameContext } from '../../context/GameContext'
import dontGo from '../../assets/dont-go.gif'
import { useMediaQuery } from '@mui/material'
import GameSettings from '../dialog/GameSettings'
import ProfileDialog from '../dialog/ProfileDialog'
import VoteHistory from '../dialog/VoteHistory'
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
  MenuIcon,
  Drawer,
  CloseIcon,
  IconButton,
  EditIcon,
  LinkIcon,
} = muiStyles

const GameHeader = ({ setComponentHeight, shadowOn }) => {
  const navigate = useNavigate()
  const footerRef = useRef()
  const isSmallScreen = useMediaQuery('(max-width: 600px)')
  const { gameData } = useContext(GameContext)
  const [anchorEl, setAnchorEl] = useState(null)
  const [showProfileDialog, setShowProfileDialog] = useState(false)
  const open = Boolean(anchorEl)
  const roomName = gameData.gameRoomName
  const [showInviteDialog, setShowInviteDialog] = useState(false)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const inviteLinkInputRef = useRef()
  const [isCopied, setCopied] = useClipboard(window.location.href, {
    // `isCopied` will go back to `false` after 1500ms.
    successDuration: 1500,
  })
  const [showGameSettingsDialog, setShowGameSettingsDialog] = useState(false)
  const [showHistoryDialog, setShowHistoryDialog] = useState(false)

  useEffect(() => {
    if (!footerRef.current) return
    setComponentHeight(footerRef.current.offsetHeight)
  }, [footerRef.current?.offsetHeight])

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

  // console.log('shadowon: ', shadowOn)
  return (
    <Box
      ref={footerRef}
      className="game-header-container"
      sx={{
        boxShadow: shadowOn && '0px 0px 8px 0px rgba(0,0,0,0.75)',
        width: '100%',
        height: { xs: '65px', sm: '90px' },
        backgroundColor: '#902bf5',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        padding: { xs: '0 10px', sm: '0 10px' },
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
            style={{ height: isSmallScreen ? '46px' : '70px' }}
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
              <Typography
                sx={{
                  marginLeft: '12px',
                  fontSize: { xs: '18px', sm: '21px' },
                }}
              >
                {localStorage.getItem('playerName')}
              </Typography>
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
              width: isSmallScreen ? 'calc(100% - 10px)' : '550px',
              margin: 0,
              padding: isSmallScreen ? '50px 20px' : '48px',
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
          <Typography
            sx={{
              fontSize: '22px',
              fontWeight: 'bold',
              textAlign: 'center',
            }}
          >
            Invite players
          </Typography>
          <TextField
            inputRef={inviteLinkInputRef}
            fullWidth
            value={window.location.href}
          />
          <Button
            variant="contained"
            disableElevation
            fullWidth
            sx={{ textTransform: 'none', fontSize: '18px', fontWeight: 'bold' }}
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

      <GameSettings
        showDialog={showGameSettingsDialog}
        setShowDialog={setShowGameSettingsDialog}
      />

      <ProfileDialog
        gameData={gameData}
        showDialog={showProfileDialog}
        setShowDialog={setShowProfileDialog}
      />

      {VoteHistory && (
        <VoteHistory
          showDialog={showHistoryDialog}
          setShowDialog={setShowHistoryDialog}
          gameData={gameData}
        />
      )}
    </Box>
  )
}

export default GameHeader
