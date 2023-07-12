import { useContext, useState, useEffect, useRef } from 'react'
import { useMediaQuery } from '@mui/material'
import muiStyles from '../../style/muiStyles'
import ChatMessage from './ChatMessage'
import { GameContext } from '../../context/GameContext'
import noMessageImg from '../../assets/no-messages.webp'
import GifSelect from '../dialog/GifSelect'

const {
  Box,
  Typography,
  Drawer,
  IconButton,
  ChevronRightOutlined,
  TextField,
  SendIcon,
  GifOutlinedIcon,
  KeyboardArrowDownIcon,
  LightTooltip,
  blue,
} = muiStyles

const ChatDrawer = ({ toggleChatDrawer, chatDrawerOpen, drawerWidth }) => {
  const { gameData, sendMessage } = useContext(GameContext)
  const isSmallScreen = useMediaQuery('(max-width: 600px)')
  const is750Screen = useMediaQuery('(max-width: 750px)')
  const isMedScreen = useMediaQuery('(max-width: 900px)')
  const [chatInput, setChatInput] = useState('')
  const [chatMessages, setChatMessages] = useState([])
  const [showGifPopup, setShowGifPopup] = useState(false)
  // const [selectedGif, setSelectedGif] = useState({})
  const chatBodyRef = useRef()
  const [showScrollDownBtn, setShowScrollDownBtn] = useState(false)

  function handleOnScroll() {
    const div = chatBodyRef.current
    if (div.scrollTop < -200 && !showScrollDownBtn) {
      setShowScrollDownBtn(true)
    } else if (div.scrollTop > -200 && showScrollDownBtn) {
      setShowScrollDownBtn(false)
    }
  }

  function handleScrollDown() {
    const div = chatBodyRef.current
    div.scrollTo({
      top: 0,
      behavior: 'smooth',
    })
  }

  useEffect(() => {
    if (!gameData.chatMessages) return
    const mappedMessages = gameData.chatMessages.map((msg, i) => (
      <ChatMessage key={i} msg={msg} />
    ))
    setChatMessages(mappedMessages)
  }, [gameData.chatMessages])

  useEffect(() => {
    return () => {}
  }, [])

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmitMessage()
    }
  }

  function handleSubmitMessage(e) {
    if (e) e.preventDefault()
    if (!chatInput.trim().length > 0) return
    handleSend(chatInput, 'text')
    setChatInput('')
  }

  function handleSend(message, type) {
    const messageBody = {
      senderName: localStorage.getItem('playerName'),
      senderPhoto: localStorage.getItem('pokerCardImage'),
      message,
      sendTime: Date.now(),
      type,
      chatNumber: null,
    }
    sendMessage('newChatMessage', messageBody)
  }

  function handleSelectGif(gif) {
    handleSend(gif.url, 'img')
    setShowGifPopup(false)
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
          {/* {is750Screen && ( */}
            <IconButton onClick={toggleChatDrawer}>
              <ChevronRightOutlined
                sx={{ fontSize: '30px', color: '#ffffff' }}
              />
            </IconButton>
          {/* )} */}
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

        <div
          id='drawer-body'
          ref={chatBodyRef}
          onScroll={handleOnScroll}
          className='chat-container'
        >
          {gameData.chatMessages?.length > 0 ? (
            chatMessages
          ) : (
            <Box
              sx={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%,-50%)',
                width: '100%',
                padding: '10px',
                display: 'flex',
                flexDirection: 'column',
                gap: '20px',
              }}
            >
              <img
                src={noMessageImg}
                alt='no messages'
                style={{
                  width: '90%',
                }}
              />
              <Typography align='center' color={'GrayText'}>
                No messages yet. Send a message to start the chat!
              </Typography>
            </Box>
          )}
          {showScrollDownBtn && (
            <LightTooltip title='Scroll to bottom' placement='top' arrow>
              <IconButton
                onClick={handleScrollDown}
                sx={{
                  position: 'fixed',
                  bottom: '80px',
                  right: drawerWidth / 2,
                  transform: 'translateX(50%)',
                  boxShadow: 'rgba(99, 99, 99, 0.2) 0px 2px 8px 0px',
                  backgroundColor: blue[400],
                  '&:hover': {
                    backgroundColor: blue[200],
                  },
                }}
              >
                <KeyboardArrowDownIcon
                  sx={{ fontSize: '30px', color: '#ffffff' }}
                />
              </IconButton>
            </LightTooltip>
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
          <form
            onSubmit={handleSubmitMessage}
            style={{ display: 'flex', alignItems: 'center' }}
          >
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
              InputProps={{
                style: { fontSize: '14px' },
              }}
            />
            <IconButton
              color='primary'
              onClick={() => setShowGifPopup(!showGifPopup)}
              sx={{
                padding: '0px',
              }}
            >
              <GifOutlinedIcon sx={{ fontSize: '32px' }} />
            </IconButton>
            <IconButton
              type='submit'
              color='primary'
              sx={{
                padding: '2px',
              }}
            >
              <SendIcon sx={{ fontSize: '21px' }} />
            </IconButton>
          </form>
        </Box>

        {showGifPopup && (
          <GifSelect
            setSelectedGif={handleSelectGif}
            tenorApi={gameData.tenorApi}
          />
        )}
      </Box>
    </Drawer>
  )
}

export default ChatDrawer
