import React, { useState, useEffect, useContext } from 'react'
import axios from 'axios'
import muiStyles from '../../style/muiStyles'
import { useMediaQuery } from '@mui/material'
import PurpleDeckCard from '../game/PurpleDeckCard'
import ImageUpload from './ImageUpload'
import { GameContext } from '../../context/GameContext'

const {
  Dialog,
  Typography,
  TextField,
  IconButton,
  Box,
  Button,
  CloseIcon,
  Avatar,
} = muiStyles

const ProfileDialog = ({ showDialog, setShowDialog, gameData }) => {
  const { sendMessage } = useContext(GameContext)
  const isSmallScreen = useMediaQuery('(max-width: 400px)')
  const [nameInput, setNameInput] = useState(localStorage.getItem('playerName'))
  const [showImageUpload, setShowImageUpload] = useState(false)
  const [uploadedPicture, setUploadedPicture] = useState('')
  const [saveLoading, setSaveLoading] = useState(false)
  const [nameError, setNameError] = useState('')

  function handleSaveProfile() {
    if (!nameInput.trim()) return setNameError('Name cannot be empty')
    setNameError('')
    setSaveLoading(true)
    if (uploadedPicture) {
      axios
        .put('game/upload_image', { image: uploadedPicture })
        .then(({ data }) => {
          setUploadedPicture('')
          localStorage.setItem('pokerCardImage', data)
          localStorage.setItem('playerName', nameInput)
          sendMessage('updateProfile', {
            name: nameInput,
            playerCardImage: data,
          })
          setShowDialog(false)
        })
        .catch(console.error)
        .finally(() => setSaveLoading(false))
    } else {
      localStorage.setItem('playerName', nameInput)
      sendMessage('updateProfile', { name: nameInput })
      setShowDialog(false)
    }
  }

  function handleDeleteImage() {
    if (!localStorage.getItem('pokerCardImage')) return
    localStorage.removeItem('pokerCardImage')
    setUploadedPicture('')
    setSaveLoading(true)
    axios
      .delete('game/delete_image')
      .then(() => {
        sendMessage('updateProfile', { playerCardImage: '' })
      })
      .catch(console.error)
      .finally(() => setSaveLoading(false))
  }

  return (
    <Dialog
      onClose={() => setShowDialog(false)}
      fullScreen={isSmallScreen}
      PaperProps={{
        style: {
          borderRadius: isSmallScreen ? 0 : 12,
          padding: isSmallScreen ? '35px 12px' : '70px 60px',
          minWidth: !isSmallScreen && 'min(calc(100vw - 18px), 640px)',
          display: 'flex',
          flexDirection: 'column',
          gap: '40px',
        },
      }}
      open={showDialog}
    >
      <IconButton
        sx={{ position: 'absolute', top: 7, right: 5 }}
        aria-label="close"
        onClick={() => setShowDialog(!showDialog)}
      >
        <CloseIcon />
      </IconButton>
      {showImageUpload ? (
        <ImageUpload
          setShowUploader={setShowImageUpload}
          picture={uploadedPicture}
          setPicture={setUploadedPicture}
        />
      ) : (
        <>
          <Typography
            variant="h4"
            sx={{ fontWeight: 'bold', fontSize: '22px' }}
          >
            Edit your display information
          </Typography>

          <Box sx={{ display: 'flex', gap: '25px', alignItems: 'center' }}>
            <PurpleDeckCard
              showBgImage
              showCard={false}
              cardImage={
                uploadedPicture
                  ? uploadedPicture
                  : localStorage.getItem('pokerCardImage')
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
                  localStorage.removeItem('pokerCardImage')
                  setUploadedPicture('')
                  setShowImageUpload(!showImageUpload)
                }}
                sx={{
                  textTransform: 'none',
                  fontSize: '18px',
                  fontWeight: 'bold',
                }}
              >
                Change card image
              </Button>
              <Button
                disabled={
                  saveLoading || !localStorage.getItem('pokerCardImage')
                }
                onClick={handleDeleteImage}
                color="error"
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

          <TextField
            value={nameInput}
            inputProps={{ maxLength: 12 }}
            onChange={(e) => setNameInput(e.target.value)}
            fullWidth
            disabled={saveLoading}
            size="md"
            error={!!nameError}
            helperText={nameError}
            placeholder="New display name"
          />

          <Button
            onClick={handleSaveProfile}
            disableElevation
            disabled={saveLoading}
            variant="contained"
            fullWidth
            size="large"
            color="secondary"
            sx={{ textTransform: 'none', fontSize: '18px' }}
          >
            Save
          </Button>
        </>
      )}
    </Dialog>
  )
}

export default ProfileDialog
