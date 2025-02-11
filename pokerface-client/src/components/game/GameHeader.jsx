import React, { useEffect, useContext, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import pokerLogo from '../../assets/poker-logo.png';
import useClipboard from 'react-use-clipboard';
import { GameContext } from '../../context/GameContext';
import dontGo from '../../assets/dont-go.gif';
import { useMediaQuery } from '@mui/material';
import GameSettings from '../dialog/GameSettings';
import ProfileDialog from '../dialog/ProfileDialog';
import VoteHistory from '../dialog/VoteHistory';
import muiStyles from '../../style/muiStyles';
import Swal from 'sweetalert2';
import PurpleDeckCard from './PurpleDeckCard';

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
  Tooltip,
  LinkIcon,
  ChatOutlinedIcon,
  Badge,
} = muiStyles;

const GameHeader = ({
  setComponentHeight,
  shadowOn,
  setChatDrawerOpen,
  chatDrawerOpen,
}) => {
  const navigate = useNavigate();
  const footerRef = useRef();
  const isMedScreen = useMediaQuery('(max-width: 900px)');
  const isSmallScreen = useMediaQuery('(max-width: 600px)');
  const isXsScreen = useMediaQuery('(max-width: 400px)');
  const { gameData, myPowerLvl } = useContext(GameContext);
  const [anchorEl, setAnchorEl] = useState(null);
  const [showProfileDialog, setShowProfileDialog] = useState(false);
  const open = Boolean(anchorEl);
  const [roomName, setRoomName] = useState('');
  const [showInviteDialog, setShowInviteDialog] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const inviteLinkInputRef = useRef();
  const [hideChatsNotifications, setHideChatsNotifications] = useState(true);
  const [isCopied, setCopied] = useClipboard(window.location.href, {
    // `isCopied` will go back to `false` after 1500ms.
    successDuration: 1500,
  });
  const [showGameSettingsDialog, setShowGameSettingsDialog] = useState(false);
  const [showHistoryDialog, setShowHistoryDialog] = useState(false);
  const clientToken = localStorage.getItem('PokerfaceLocalUserToken');

  useEffect(() => {
    if (!gameData?.chatMessages) {
      return;
    }

    if (gameData.chatMessages.length < 1) {
      sessionStorage.setItem('PokerfaceChatNumber', 0);
      return;
    }
    // if the chatDrawer is open, set the session storage number to the last message in the chat.
    if (chatDrawerOpen) {
      sessionStorage.setItem(
        'PokerfaceChatNumber',
        gameData.chatMessages[0].chatNumber
      );
      setHideChatsNotifications(true);
    } else {
      // if the chat drawer is closed when a new message comes in, set the notification to true
      if (
        gameData.chatMessages[0].chatNumber >
        +sessionStorage.getItem('PokerfaceChatNumber')
      ) {
        setHideChatsNotifications(false);
      }
    }
  }, [gameData?.chatMessages]);

  useEffect(() => {
    if (!gameData?.gameSettings?.gameRoomName) {
      return;
    }
    setRoomName(gameData.gameSettings.gameRoomName);
  }, [gameData]);

  useEffect(() => {
    if (!footerRef.current) {
      return;
    }
    setComponentHeight(footerRef.current.offsetHeight);
  }, [footerRef.current?.offsetHeight]);

  function handleLeaveGame() {
    handleCloseGameSettings();
    Swal.fire({
      title: 'Are you sure?',
      text: 'You will be removed from the game',
      imageUrl: dontGo,
      imageWidth: 'min(90vw, 400px',
      confirmButtonText: 'Take me home',
      confirmButtonColor: '#9c4fd7',
      showCancelButton: true,
      cancelButtonText: 'Stay',
      customClass: {
        popup: 'swal2-popup',
      },
    }).then((result) => {
      if (result.isConfirmed) {
        navigate('/home');
        window.location.reload();
      }
    });
  }

  function handleOpenGameSettings(event) {
    setAnchorEl(event.currentTarget);
  }
  function handleCloseGameSettings() {
    setAnchorEl(null);
  }

  function getBadgeCount() {
    if (!gameData?.chatMessages || gameData?.chatMessages?.length < 1) {
      return 0;
    }

    const lastStoredChatNumber =
      +sessionStorage.getItem('PokerfaceChatNumber') || 0;

    const unreadMessages = gameData.chatMessages.filter(
      (msg) =>
        msg.type !== 'settingsUpdate' && msg.chatNumber > lastStoredChatNumber
    );

    return unreadMessages.length;
  }

  useEffect(() => {
    setTimeout(() => {
      if (inviteLinkInputRef.current) {
        inviteLinkInputRef.current.select();
      }
    }, 200);
  }, [showInviteDialog, inviteLinkInputRef]);

  return (
    <Box
      ref={footerRef}
      className='game-header-container'
      sx={{
        boxShadow: shadowOn && '0px 0px 8px 0px rgba(0,0,0,0.75)',
        width: '100%',
        height: { xs: '70px', sm: '80px' },
        backgroundColor: '#9c4fd7',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        padding: { xs: '4px 10px', sm: '5px 10px' },
      }}
    >
      <Box
        className='game-header'
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
            className='cursor-pointer'
            onClick={handleLeaveGame}
            src={pokerLogo}
            alt='logo'
            style={{
              height: isSmallScreen ? '46px' : '65px',
              display: isXsScreen && 'none',
            }}
          />
          <Box>
            <Button
              variant='text'
              size={isSmallScreen ? 'small' : 'medium'}
              color='white'
              endIcon={<ExpandMoreIcon />}
              onClick={handleOpenGameSettings}
              sx={{
                textTransform: 'none',
                fontSize: { xs: '18px', sm: '22px' },
              }}
              disableElevation
            >
              {roomName}
            </Button>
          </Box>
        </Box>
        <Menu open={open} anchorEl={anchorEl} onClose={handleCloseGameSettings}>
          <MenuItem
            onClick={() => {
              handleCloseGameSettings();
              setShowGameSettingsDialog(!showGameSettingsDialog);
            }}
          >
            <ListItemIcon>
              <SettingsIcon />
            </ListItemIcon>
            <Typography variant='h6'>Game Settings</Typography>
          </MenuItem>

          <MenuItem
            onClick={() => {
              handleCloseGameSettings();
              setShowHistoryDialog(!showHistoryDialog);
            }}
          >
            <ListItemIcon>
              <PollOutlinedIcon />
            </ListItemIcon>
            <Typography variant='h6'>Vote History</Typography>
          </MenuItem>

          <MenuItem
            onClick={() => {
              handleCloseGameSettings();
              setShowInviteDialog(!showInviteDialog);
            }}
          >
            <ListItemIcon>
              <LinkIcon />
            </ListItemIcon>
            <Typography variant='h6'>Invite players</Typography>
          </MenuItem>

          <MenuItem onClick={handleLeaveGame}>
            <ListItemIcon>
              <LogoutIcon />
            </ListItemIcon>
            <Typography variant='h6'>Leave Game</Typography>
          </MenuItem>
        </Menu>

        <Box sx={{ display: 'flex', gap: '22px', alignItems: 'center' }}>
          {
            // hide the button if the screen is less tha 600px, or if the screen is less than 900px and the chat drawer is open
            isSmallScreen ||
              (!isMedScreen && !chatDrawerOpen && (
                <Button
                  color='white'
                  size='large'
                  onClick={() => setShowInviteDialog(!showInviteDialog)}
                  variant='outlined'
                  sx={{
                    textTransform: 'none',
                    fontSize: '18px',
                    fontWeight: 'bold',
                    borderWidth: '1.5px',
                    borderColor: '#ffffff',
                    borderRadius: '8px',
                    '&:hover': {
                      borderWidth: '1.5px',
                    },
                  }}
                >
                  Invite players
                </Button>
              ))
          }

          {!isSmallScreen ? (
            <Button
              onClick={() => setDrawerOpen(!drawerOpen)}
              endIcon={<ExpandMoreIcon />}
              color='white'
              sx={{
                textTransform: 'none',
                gap: '12px',
              }}
            >
              <PurpleDeckCard
                showBgImage
                showCard={false}
                borderColor='white'
                borderThickness={1}
                sizeMultiplier={0.6}
                cardImage={localStorage.getItem('PokerfaceCardImage')}
              />
              <Typography
                sx={{
                  marginLeft: '12px',
                  fontSize: { xs: '18px', sm: '21px' },
                }}
              >
                {localStorage.getItem('PokerfacePlayerName')}
              </Typography>
            </Button>
          ) : (
            <IconButton
              sx={{ padding: { xs: '7px', sm: '12px' } }}
              onClick={() => setDrawerOpen(!drawerOpen)}
            >
              <MenuIcon color='white' />
            </IconButton>
          )}
          <IconButton
            sx={{
              padding: '14px',
            }}
            onClick={() => {
              if (!chatDrawerOpen) {
                if (gameData.chatMessages.length > 0) {
                  sessionStorage.setItem(
                    'PokerfaceChatNumber',
                    gameData.chatMessages[0].chatNumber
                  );
                } else {
                  sessionStorage.setItem('PokerfaceChatNumber', 0);
                }
                setHideChatsNotifications(true);
              }
              setChatDrawerOpen(!chatDrawerOpen);
            }}
          >
            <Badge
              color='primary'
              overlap='circular'
              badgeContent={getBadgeCount()}
              invisible={hideChatsNotifications}
            >
              <ChatOutlinedIcon
                color='white'
                sx={{ fontSize: { sx: '24px', sm: '28px' } }}
              />
            </Badge>
          </IconButton>
        </Box>

        <Drawer
          anchor='right'
          open={drawerOpen}
          onClose={() => setDrawerOpen(!drawerOpen)}
        >
          <Box
            sx={{
              minWidth: isSmallScreen ? '180px' : '260px',
              padding: '10px 0',
              display: 'flex',
              flexDirection: 'column',
              gap: '10px',
            }}
          >
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                width: '100%',
                padding: '5px 10px',
              }}
            >
              <Box sx={{ display: 'flex', gap: '10px' }}>
                <img src={pokerLogo} width={50} alt='logo' />
                <Box>
                  <Typography
                    color='primary'
                    sx={{ fontSize: '20px', fontWeight: 'bold' }}
                  >
                    Pokerface
                  </Typography>
                  <Typography sx={{ fontSize: '15px' }} color='GrayText'>
                    By Mason Hirst
                  </Typography>
                </Box>
              </Box>
              <Tooltip title='Close drawer' arrow>
                <IconButton
                  onClick={() => setDrawerOpen(!drawerOpen)}
                  sx={{
                    width: '50px',
                    height: '50px',
                  }}
                >
                  <CloseIcon />
                </IconButton>
              </Tooltip>
            </Box>
            <Tooltip title='Edit profile' arrow enterDelay={700}>
              <MenuItem
                sx={{ display: 'flex', alignItems: 'center', gap: '10px' }}
                onClick={() => {
                  setShowProfileDialog(!showProfileDialog);
                  setDrawerOpen(!drawerOpen);
                }}
              >
                <PurpleDeckCard
                  showBgImage
                  showCard={false}
                  borderColor={'#902bf5'}
                  borderThickness={1.5}
                  sizeMultiplier={0.8}
                  cardImage={localStorage.getItem('PokerfaceCardImage')}
                />
                <Typography variant='h6'>
                  {localStorage.getItem('PokerfacePlayerName')}
                </Typography>
                <EditIcon />
              </MenuItem>
            </Tooltip>

            <Typography
              variant='subtitle1'
              sx={{
                marginLeft: '.8rem',
              }}
            >
              <span style={{ opacity: 0.7 }}>Power level: </span>
              <span style={{ fontWeight: 'bold' }}>{myPowerLvl}</span>
            </Typography>

            <Typography
              variant='subtitle1'
              sx={{
                marginLeft: '.8rem',
                paddingRight: '.5rem',
              }}
            >
              <span style={{ opacity: 0.7 }}>Name in room: </span>
              <span style={{ fontWeight: 'bold' }}>
                {gameData.players?.[clientToken]?.playerName}
              </span>
            </Typography>

            <Button
              href={`${document.location.origin}/contact`}
              target='_blank'
              variant='contained'
              disableElevation
              fullWidth
              sx={{
                textTransform: 'none',
                fontSize: '18px',
                fontWeight: 'bold',
                margin: '10px 10px',
                width: 'calc(100% - 20px)',
              }}
            >
              Contact Developer
            </Button>
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
            aria-label='close'
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
            variant='contained'
            disableElevation
            fullWidth
            sx={{ textTransform: 'none', fontSize: '18px', fontWeight: 'bold' }}
            onClick={(e) => {
              setCopied(e);
              setTimeout(() => {
                setShowInviteDialog(!showInviteDialog);
              }, 700);
            }}
          >
            {isCopied ? 'Copied!' : 'Copy invite link'}
          </Button>
        </Dialog>
      </Box>

      {gameData.gameSettings && showGameSettingsDialog && (
        <GameSettings
          showDialog={showGameSettingsDialog}
          setShowDialog={setShowGameSettingsDialog}
        />
      )}

      {showProfileDialog && (
        <ProfileDialog
          gameData={gameData}
          showDialog={showProfileDialog}
          setShowDialog={setShowProfileDialog}
        />
      )}

      {showHistoryDialog && (
        <VoteHistory
          showDialog={showHistoryDialog}
          setShowDialog={setShowHistoryDialog}
          gameData={gameData}
        />
      )}
    </Box>
  );
};

export default GameHeader;
