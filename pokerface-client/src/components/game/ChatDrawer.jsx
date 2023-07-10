import React, { useContext } from 'react'
import { useMediaQuery } from '@mui/material'
import muiStyles from '../../style/muiStyles'
import ChatMessage from './ChatMessage'
import { GameContext } from '../../context/GameContext'

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
  const { gameData } = useContext(GameContext)
  const isSmallScreen = useMediaQuery('(max-width: 600px)')
  const is750Screen = useMediaQuery('(max-width: 750px)')
  const isMedScreen = useMediaQuery('(max-width: 900px)')

  const mappedMessages =
    gameData.chatMessages &&
    gameData.chatMessages.map((msg, i) => <ChatMessage key={i} msg={msg} />)

  return (
    <Drawer
      onClose={toggleChatDrawer}
      variant={is750Screen ? 'temporary' : 'persistent'}
      anchor="right"
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
        }}
      >
        <Box id="drawer-header">
          {isSmallScreen && (
            <IconButton onClick={toggleChatDrawer}>
              <ChevronRightOutlined />
            </IconButton>
          )}
        </Box>
        <Divider />

        <Box id="drawer-body" sx={{ flexGrow: 1 }}>
          {mappedMessages}
        </Box>

        <Box id="drawer-footer">
          <Box sx={{ position: 'relative' }}>
            <TextField
              fullWidth
              variant="outlined"
              label="Message"
              size="small"
              sx={{ mb: 1 }}
            />
          </Box>
        </Box>
      </Box>
    </Drawer>
  )
}

export default ChatDrawer
