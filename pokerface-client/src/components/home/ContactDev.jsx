import React, { useState } from 'react'
import muiStyles from '../../style/muiStyles'
import pokerLogo from '../../assets/poker-logo.png'
import { useMediaQuery } from '@mui/material'
import axios from 'axios'
import { validate } from 'email-validator'
const { Paper, TextField, Box, Typography, LoadingButton } = muiStyles

const ContactDev = () => {
  const isSmallScreen = useMediaQuery('(max-width: 600px)')
  const [nameInput, setNameInput] = useState(
    localStorage.getItem('playerName') || ''
  )
  const [contactInput, setContactInput] = useState('')
  const [messageInput, setMessageInput] = useState('')
  const [disableForm, setDisableForm] = useState(false)
  const [contactError, setContactError] = useState('')
  const [messageError, setMessageError] = useState('')
  const [messageSent, setMessageSent] = useState(false)

  function handleSubmit(e) {
    e.preventDefault()
    if (contactInput && !validate(contactInput)) {
      return setContactError(
        'If you provide contact info, it must be a valid email address'
      )
    }
    if (!messageInput) return setMessageError('Message cannot be empty')
    setDisableForm(true)
    axios
      .post('/contact', {
        name: nameInput,
        contact: contactInput,
        message: messageInput,
      })
      .then(() => setMessageSent(true))
      .catch(console.error)
      .finally(() => setDisableForm(false))
  }

  return (
    <Box
      sx={{
        width: '100%',
        height: '100vh',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      <Paper
        elevation={isSmallScreen ? 0 : 3}
        sx={{
          padding: isSmallScreen ? '10px' : '35px',
          width: 'min(800px, 100vw - 20px)',
          borderRadius: '9px',
        }}
      >
        {!messageSent ? (
          <form
            onSubmit={handleSubmit}
            style={{ display: 'flex', gap: '15px', flexDirection: 'column' }}
          >
            <Box
              sx={{
                marginBottom: '10px',
                display: 'flex',
                // alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <Typography variant="h4" sx={{ marginBottom: '15px' }}>
                Contact Developer
              </Typography>
              {!isSmallScreen && <img src={pokerLogo} width={90} alt='logo' />}
            </Box>
            <TextField
              fullWidth
              label="Name (optional)"
              disabled={disableForm}
              variant="outlined"
              value={nameInput}
              onChange={(e) => setNameInput(e.target.value)}
            />
            <TextField
              disabled={disableForm}
              spellCheck={false}
              fullWidth
              error={!!contactError}
              helperText={contactError}
              label="Email (optional)"
              variant="outlined"
              value={contactInput}
              onChange={(e) => setContactInput(e.target.value)}
            />
            <TextField
              disabled={disableForm}
              fullWidth
              label="Comments"
              spellCheck={false}
              variant="outlined"
              value={messageInput}
              error={!!messageError}
              helperText={messageError}
              placeholder="Give feedback, report bugs, or give suggestions"
              multiline
              minRows={4}
              maxRows={10}
              onChange={(e) => setMessageInput(e.target.value)}
            />
            <LoadingButton
              loading={disableForm}
              type="submit"
              variant="contained"
              disableElevation
              color="primary"
              sx={{
                textTransform: 'none',
                fontSize: '17px',
                fontWeight: 'bold',
              }}
            >
              Submit
            </LoadingButton>
          </form>
        ) : (
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '15px',
            }}
          >
            <Typography variant="h4">Message has been sent</Typography>
            <Typography variant="h6">Thank you for your feedback!</Typography>
            <Typography color="GrayText">
              You can safely close this tab
            </Typography>
            <Typography color="primary">
              App built and maintained by Mason Hirst
            </Typography>
          </Box>
        )}
      </Paper>
    </Box>
  )
}

export default ContactDev
