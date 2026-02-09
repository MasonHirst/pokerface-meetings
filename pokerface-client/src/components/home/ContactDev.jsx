import React, { useState } from 'react';
import muiStyles from '../../style/muiStyles';
import pokerLogo from '../../assets/poker-logo.png';
import { useMediaQuery } from '@mui/material';
import axios from 'axios';
import { validate } from 'email-validator';
const { Paper, TextField, Box, Typography, LoadingButton, Button } = muiStyles;

const ContactDev = () => {
  const isSmallScreen = useMediaQuery('(max-width: 600px)');
  const [nameInput, setNameInput] = useState(
    localStorage.getItem('PokerfacePlayerName') || ''
  );
  const [contactInput, setContactInput] = useState('');
  const [messageInput, setMessageInput] = useState('');
  const [disableForm, setDisableForm] = useState(false);
  const [contactError, setContactError] = useState('');
  const [messageError, setMessageError] = useState('');
  const [messageSent, setMessageSent] = useState(false);
  const [submitError, setSubmitError] = useState('');

  function handleSubmit(e) {
    e.preventDefault();
    setSubmitError('');
    if (contactInput && !validate(contactInput)) {
      return setContactError(
        'If you provide contact info, it must be a valid email address'
      );
    }
    if (!messageInput) {
      return setMessageError('Message cannot be empty');
    }
    setDisableForm(true);
    axios
      .post('/contact', {
        name: nameInput,
        contact: contactInput,
        message: messageInput,
      })
      .then(() => setMessageSent(true))
      .catch((err) => {
        console.error(err);
        setSubmitError('Failed to send message. Please try again later.');
      })
      .finally(() => setDisableForm(false));
  }

  function handleMessageChange(e) {
    setMessageInput(e?.target?.value);
    _resetMessageError();
  }

  function _resetMessageError() {
    setMessageError('');
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
                justifyContent: 'space-between',
              }}
            >
              <Typography variant='h4' sx={{ marginBottom: '15px' }}>
                Contact Developer
              </Typography>
              {!isSmallScreen && <img src={pokerLogo} width={90} alt='logo' />}
            </Box>
            <TextField
              fullWidth
              spellCheck={false}
              inputProps={{ maxLength: 20 }}
              label='Name (optional)'
              autoFocus
              disabled={disableForm}
              variant='outlined'
              value={nameInput}
              onChange={(e) => setNameInput(e.target.value)}
            />
            <TextField
              disabled={disableForm}
              spellCheck={false}
              inputProps={{ maxLength: 50 }}
              fullWidth
              error={!!contactError}
              helperText={contactError}
              label='Email (optional)'
              variant='outlined'
              value={contactInput}
              onChange={(e) => setContactInput(e.target.value)}
            />
            <TextField
              disabled={disableForm}
              inputProps={{ maxLength: 1024 }}
              fullWidth
              label='Comments'
              spellCheck={false}
              variant='outlined'
              value={messageInput}
              error={!!messageError}
              helperText={messageError}
              placeholder='Give feedback, suggestions, or report bugs'
              multiline
              minRows={4}
              maxRows={10}
              onChange={handleMessageChange}
            />
            <Typography color={'error'} align={'center'}>
              {submitError}
            </Typography>
            <LoadingButton
              loading={disableForm}
              type='submit'
              variant='contained'
              disableElevation
              color='primary'
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
            <Typography variant='h4'>Message has been sent</Typography>
            <Typography variant='h6'>Thank you for your feedback!</Typography>
            {/* <Typography color="GrayText">
              You can safely close this tab
            </Typography> */}
            <Button
              disableElevation
              variant='contained'
              // color="secondary"
              onClick={() => {
                // close the current tab
                window.close();
              }}
              sx={{
                textTransform: 'none',
                marginTop: '10px',
                fontWeight: 'bold',
                fontSize: '18px',
                width: '170px',
              }}
            >
              Close
            </Button>
            <Typography color='primary'>
              App built and maintained by Mason Hirst
            </Typography>
          </Box>
        )}
      </Paper>
    </Box>
  );
};

export default ContactDev;
