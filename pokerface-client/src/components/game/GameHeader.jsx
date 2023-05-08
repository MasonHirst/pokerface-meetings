import React, { useEffect, useContext, useState, useRef } from 'react'
import axios from 'axios'
import useClipboard from 'react-use-clipboard'
import { GameContext } from '../../context/GameContext'
import muiStyles from '../../style/muiStyles'
const { AppBar, Toolbar, Typography, Button, Box, Dialog, TextField } =
  muiStyles

const GameHeader = () => {
  const { roomName } = useContext(GameContext)
  const [showInviteDialog, setShowInviteDialog] = useState(false)
  const [isCopied, setCopied] = useClipboard(window.location.href, {
    // `isCopied` will go back to `false` after 1000ms.
    successDuration: 1000,
  })
  const inviteLinkInputRef = useRef()

  useEffect(() => {
    setTimeout(() => {
      if (inviteLinkInputRef.current) {
        inviteLinkInputRef.current.select()
      }
    }, 150)
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
        padding: '0 15px',
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
        <Button variant="contained">Something else</Button>
        <Typography>{roomName ? roomName : 'No game name bro'}</Typography>
        <Button
          onClick={() => setShowInviteDialog(!showInviteDialog)}
          variant="contained"
        >
          Invite players
        </Button>
        <Dialog
          onClose={() => setShowInviteDialog(!showInviteDialog)}
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
          open={showInviteDialog}
        >
          <TextField inputRef={inviteLinkInputRef} fullWidth value={window.location.href} />
          <Button variant="contained" fullWidth onClick={setCopied}>
            {isCopied ? 'Copied!' : 'Copy invite link'}
          </Button>
          <Button sx={{marginBottom: '-10px'}} variant="" fullWidth onClick={() => setShowInviteDialog(false)}>
            Close
          </Button>
        </Dialog>
      </Box>
    </Box>
  )
}

export default GameHeader
