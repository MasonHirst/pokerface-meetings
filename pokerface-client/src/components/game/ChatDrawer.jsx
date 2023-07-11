import { useContext, useState, useEffect, useRef } from 'react'
import { useMediaQuery } from '@mui/material'
import muiStyles from '../../style/muiStyles'
import ChatMessage from './ChatMessage'
import { GameContext } from '../../context/GameContext'
import { blue } from '@mui/material/colors'
import noMessageImg from '../../assets/no-messages.webp'

const {
  Box,
  Typography,
  Drawer,
  IconButton,
  Divider,
  ChevronRightOutlined,
  TextField,
  SendIcon,
} = muiStyles

const ChatDrawer = ({ toggleChatDrawer, chatDrawerOpen, drawerWidth }) => {
  const { gameData, sendMessage } = useContext(GameContext)
  const isSmallScreen = useMediaQuery('(max-width: 600px)')
  const is750Screen = useMediaQuery('(max-width: 750px)')
  const isMedScreen = useMediaQuery('(max-width: 900px)')
  const [chatInput, setChatInput] = useState('')
  const [chatMessages, setChatMessages] = useState([])

  useEffect(() => {
    if (!gameData.chatMessages) return
    const mappedMessages = gameData.chatMessages.map((msg, i) => (
      <ChatMessage key={i} msg={msg} />
    ))
    setChatMessages(mappedMessages)
  }, [gameData.chatMessages])

  useEffect(() => {
    return () => {
      console.log('chat drawer unmounted')
    }
  }, [])

  function handleSubmitMessage(e) {
    if (e) e.preventDefault()
    const messageBody = {
      senderName: localStorage.getItem('playerName'),
      senderPhoto: localStorage.getItem('pokerCardImage'),
      message: chatInput,
      sendTime: Date.now(),
      type: 'text',
      chatNumber: null,
    }
    sendMessage('newChatMessage', messageBody)
    setChatInput('')
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmitMessage()
    }
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
          marginLeft: '-5px',
          border: 'none',
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
        }}
      >
        <Box
          id='drawer-header'
          sx={{
            minHeight: { xs: '45px', sm: '65px' },
            // height: '102px',
            display: 'flex',
            width: '100%',
            alignItems: 'center',
            justifyContent: is750Screen ? 'flex-start' : 'center',
            backgroundColor: blue[500],
            boxShadow: 'rgba(99, 99, 99, 0.5) 0px 3px 8px 0px',
          }}
        >
          {is750Screen && (
            <IconButton onClick={toggleChatDrawer}>
              <ChevronRightOutlined
                sx={{ fontSize: '30px', color: '#ffffff' }}
              />
            </IconButton>
          )}
          <Typography
            variant='h6'
            sx={{
              marginLeft: 1,
              fontSize: { xs: '20px', sm: '24px' },
              color: '#ffffff',
            }}
          >
            Chat room
          </Typography>
        </Box>

        <div id='drawer-body' className='chat-container'>
          {gameData.chatMessages?.length > 0 ? (
            chatMessages
          ) : (
            <img
              src={noMessageImg}
              style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%,-50%)',
                width: 'calc(100% - 25px)'
              }}
              alt='no messages'
            />
          )}
        </div>

        <Box
          id='drawer-footer'
          sx={{
            width: '100%',
            boxShadow:
              'rgba(14, 30, 37, 0.12) 0px 2px 4px 0px, rgba(14, 30, 37, 0.32) 0px 2px 16px 0px',
            padding: { xs: '5px', sm: '10px 5px' },
            borderLeft: '1px solid rgba(0, 0, 0, 0.2)',
          }}
        >
          <form onSubmit={handleSubmitMessage} style={{ display: 'flex' }}>
            <TextField
              fullWidth
              autoFocus
              variant='outlined'
              placeholder='Message'
              size='small'
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              onKeyDown={handleKeyDown}
              multiline
              maxRows={3}
            />
            <IconButton type='submit' color='primary'>
              <SendIcon sx={{ fontSize: '22px' }} />
            </IconButton>
          </form>
        </Box>
      </Box>
    </Drawer>
  )
}

export default ChatDrawer
