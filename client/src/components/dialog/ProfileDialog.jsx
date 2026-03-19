import { useState, useContext, useMemo } from 'react';
import axios from 'axios';
import muiStyles from '../../style/muiStyles';
import { useMediaQuery } from '@mui/material';
import PurpleDeckCard from '../game/PurpleDeckCard';
import ImageUpload from './ImageUpload';
import { GameContext } from '../../context/GameContext';
import { toast } from 'react-toastify';
const clientToken = localStorage.getItem('PokerfaceLocalUserToken');

const {
  Dialog,
  Typography,
  TextField,
  IconButton,
  Box,
  Button,
  CloseIcon,
  HelpOutlineIcon,
  LightTooltip,
  Switch,
  FormControlLabel,
} = muiStyles;

const ProfileDialog = ({ showDialog, setShowDialog }) => {
  const { sendMessage, myPowerSettings, gameData } = useContext(GameContext);
  const isSmallScreen = useMediaQuery('(max-width: 400px)');
  const [nameInput, setNameInput] = useState(
    localStorage.getItem('PokerfacePlayerName')
  );
  const [observerModeInput, setObserverModeInput] = useState(
    gameData?.players?.[clientToken]?.observerOnly
  );
  const [showImageUpload, setShowImageUpload] = useState(false);
  const [uploadedPicture, setUploadedPicture] = useState('');
  const [saveLoading, setSaveLoading] = useState(false);
  const [nameError, setNameError] = useState('');
  const [hasDeletedImage, setHasDeletedImage] = useState(false);

  async function submitNewProfileSettings() {
    if (!nameInput.trim()) {
      return setNameError('Name cannot be empty');
    }

    setNameError('');
    setSaveLoading(true);

    try {
      const sendBody = { ...gameData.players?.[clientToken] };
      sendBody.playerName = nameInput;
      sendBody.observerOnly = observerModeInput;

      if (uploadedPicture) {
        const { data } = await axios.put('game/upload_image', {
          image: uploadedPicture,
        });
        setUploadedPicture('');
        localStorage.setItem('PokerfaceCardImage', data);
        sendBody.playerCardImage = data;
      }

      // if the sendBody matches the current player data, don't contact the server
      if (
        JSON.stringify(sendBody) !==
        JSON.stringify(gameData.players?.[clientToken])
      ) {
        sessionStorage.setItem('PokerfaceObserverOnly', observerModeInput);
        localStorage.setItem('PokerfacePlayerName', nameInput);
        sendMessage('updateProfile', sendBody);
      } else if (!hasDeletedImage) {
        toast('No changes were made');
      }
    } catch (error) {
      console.error(error);
    } finally {
      setSaveLoading(false);
      setShowDialog(false);
    }
  }

  const canShowCustomCardImg = useMemo(() => {
    return !!myPowerSettings?.showCustomCardImg;
  });

  function handleDeleteImage() {
    if (!localStorage.getItem('PokerfaceCardImage')) {
      return;
    }
    localStorage.removeItem('PokerfaceCardImage');
    setUploadedPicture('');
    setSaveLoading(true);
    axios
      .delete('game/delete_image')
      .then(() => {
        sendMessage('updateProfile', {
          ...gameData?.players?.[clientToken],
          playerCardImage: '',
        });
        setHasDeletedImage(true)
      })
      .catch(console.error)
      .finally(() => setSaveLoading(false));
  }

  const newImageButtonText = useMemo(() => {
    return localStorage.getItem('PokerfaceCardImage') || uploadedPicture
      ? 'Change card image'
      : 'Add card image';
  }, [uploadedPicture, localStorage.getItem('PokerfaceCardImage')]);

  function handleObserverModeChange(e) {
    setObserverModeInput(e.target.checked);
  }

  return (
    <Dialog
      onClose={() => setShowDialog(false)}
      fullScreen={isSmallScreen}
      PaperProps={{
        style: {
          borderRadius: isSmallScreen ? 0 : 12,
          padding: isSmallScreen ? '20px 12px' : '30px',
          minWidth: !isSmallScreen && 'min(calc(100vw - 18px), 640px)',
          display: 'flex',
          flexDirection: 'column',
          gap: '2rem',
        },
      }}
      open={showDialog}
    >
      {showImageUpload ? (
        <ImageUpload
          setShowUploader={setShowImageUpload}
          picture={uploadedPicture}
          setPicture={setUploadedPicture}
        />
      ) : (
        <>
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '.5rem',
            }}
          >
            <Typography variant='h5'>Edit your profile</Typography>

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

          <Box sx={{ display: 'flex', gap: '25px', alignItems: 'center' }}>
            <PurpleDeckCard
              showBgImage
              showCard={false}
              showShadow
              cardImage={
                uploadedPicture
                  ? uploadedPicture
                  : localStorage.getItem('PokerfaceCardImage')
              }
              borderColor={'#902bf5'}
              sizeMultiplier={1.2}
            />
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'flex-start',
              }}
            >
              <Button
                disabled={saveLoading}
                onClick={() => {
                  setUploadedPicture('');
                  setShowImageUpload(!showImageUpload);
                }}
                sx={{
                  textTransform: 'none',
                  fontSize: '18px',
                  fontWeight: 'bold',
                }}
              >
                {newImageButtonText}
              </Button>
              <Button
                disabled={
                  saveLoading || !localStorage.getItem('PokerfaceCardImage')
                }
                onClick={handleDeleteImage}
                color='error'
                sx={{
                  textTransform: 'none',
                  fontSize: '18px',
                  fontWeight: 'bold',
                }}
              >
                Remove picture
              </Button>
            </Box>
          </Box>

          {!canShowCustomCardImg && (
            <Box>
              <Typography
                sx={{
                  fontSize: '.9rem',
                  fontStyle: 'italic',
                  opacity: 0.7,
                  marginBottom: '.5rem',
                }}
              >
                You do not have permission to display a custom card image in
                this room. Only you will see this image.
              </Typography>
              <Typography
                sx={{
                  fontSize: '.9rem',
                  fontStyle: 'italic',
                  opacity: 0.7,
                }}
              >
                Ask a game admin to grant you permission if you want your custom
                image displayed.
              </Typography>
            </Box>
          )}

          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <FormControlLabel
              control={
                <Switch
                  checked={observerModeInput}
                  color='primary'
                  onChange={handleObserverModeChange}
                />
              }
              label='I am an observer'
            />
            <LightTooltip
              placement='top'
              title='If toggled on, you will only observe the game. Your presence will not affect the voting results.'
            >
              <HelpOutlineIcon
                color='primary'
                sx={{
                  cursor: 'pointer',
                }}
              />
            </LightTooltip>
          </Box>

          <TextField
            value={nameInput}
            inputProps={{ maxLength: 12 }}
            onChange={(e) => setNameInput(e.target.value)}
            fullWidth
            disabled={saveLoading}
            size='md'
            error={!!nameError}
            helperText={nameError}
            placeholder='New display name'
          />

          <Button
            onClick={submitNewProfileSettings}
            disableElevation
            disabled={saveLoading}
            variant='contained'
            fullWidth
            size='large'
            color='secondary'
            sx={{ textTransform: 'none', fontSize: '18px', fontWeight: 'bold' }}
          >
            Save
          </Button>
        </>
      )}
    </Dialog>
  );
};

export default ProfileDialog;
