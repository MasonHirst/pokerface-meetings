import { useContext, useState } from 'react'
import { useMediaQuery } from '@mui/material'
import muiStyles from '../../style/muiStyles'
import ChatMessage from './ChatMessage'
import { GameContext } from '../../context/GameContext'
import { blue } from '@mui/material/colors'

const {
  Box,
  Typography,
  Drawer,
  IconButton,
  Divider,
  ChevronRightOutlined,
  TextField,
} = muiStyles

const ChatDrawer = ({ toggleChatDrawer, chatDrawerOpen, drawerWidth }) => {
  const { gameData, sendMessage } = useContext(GameContext)
  const isSmallScreen = useMediaQuery('(max-width: 600px)')
  const is750Screen = useMediaQuery('(max-width: 750px)')
  const isMedScreen = useMediaQuery('(max-width: 900px)')
  const [chatInput, setChatInput] = useState('')

  const mappedMessages =
    gameData.chatMessages &&
    gameData.chatMessages.map((msg, i) => <ChatMessage key={i} msg={msg} />)

  function handleSubmitMessage(e) {
    e.preventDefault()
    const messageBody = {
      senderName: localStorage.getItem('playerName'),
      senderPhoto: localStorage.getItem('pokerCardImage'),
      message: chatInput,
      sendTime: Date.now(),
      type: 'text',
    }
    sendMessage('newChatMessage', messageBody)

    setChatInput('')
  }

  return (
    <Drawer
      onClose={toggleChatDrawer}
      variant={is750Screen ? 'temporary' : 'persistent'}
      anchor='right'
      open={chatDrawerOpen}
      sx={{
        width: drawerWidth,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: drawerWidth,
          boxSizing: 'border-box',
        },
      }}
    >
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          height: '100%',
          width: '100%',
          position: 'relative',
        }}
      >
        <Box
          id='drawer-header'
          sx={{
            minHeight: '45px',
            display: 'flex',
            alignItems: 'center',
            position: 'sticky',
            top: 0,
            backgroundColor: blue[300],
            boxShadow: '0px 2px 5px 0px rgba(0,0,0,0.45)',
            width: '100%',
            zIndex: 1,
          }}
        >
          {is750Screen && (
            <IconButton onClick={toggleChatDrawer}>
              <ChevronRightOutlined sx={{ fontSize: '30px' }} />
            </IconButton>
          )}
          <Typography variant='h6' sx={{ marginLeft: 1 }}>
            Chat room
          </Typography>
        </Box>
        <Divider />

        <Box
          id='drawer-body'
          sx={{
            display: 'flex',
            justifyContent: 'flex-end',
            flexDirection: 'column',
            gap: '15px',
            padding: '0 10px',
            paddingBottom: '20px',
            paddingTop: '50px',
          }}
        >
          {mappedMessages}
        </Box>

        <Box id='drawer-footer' sx={{
          position: 'sticky',
          bottom: 0,
          width: '100%',
          backgroundColor: blue[300],
          zIndex: 1,
        }}>
          <form onSubmit={handleSubmitMessage} style={{ position: 'relative' }}>
            <TextField
              fullWidth
              variant='outlined'
              placeholder='Message'
              size='small'
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              sx={{ marginBottom: 1 }}
            />
            <IconButton
              type='submit'
              sx={{
                position: 'absolute',
                right: 0,
                bottom: 0,
                backgroundColor: blue[300],
              }}
            >
              <ChevronRightOutlined sx={{ fontSize: '30px' }} />
            </IconButton>
          </form>
        </Box>
      </Box>
    </Drawer>
  )
}

export default ChatDrawer
