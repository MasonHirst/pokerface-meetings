import React from 'react'
import muiStyles from '../../style/muiStyles'
import PurpleDeckCard from './PurpleDeckCard'

const { Box, Typography, Avatar, blue } = muiStyles

const ChatMessage = ({ msg }) => {
  return (
    <>
      {msg.type === 'text' ? (
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'row',
            gap: '5px',
          }}
        >
          {/* <Avatar
            src={msg.senderPhoto}
            sx={{
              width: { xs: '30px', sm: '45px' },
              height: { xs: '30px', sm: '45px' },
            }}
          /> */}
          <PurpleDeckCard
            cardImage={msg.senderPhoto}
            showBgImage
            sizeMultiplier={0.5}
            borderThickness={.5}
          />
          <Box sx={{}}>
            <Typography
              variant='body1'
              sx={{ fontWeight: 'bold', fontSize: { xs: '15px', sm: '17px' } }}
            >
              {msg.senderName}
            </Typography>
            <Typography
              variant='body2'
              sx={{ fontSize: { xs: '14px', sm: '16px' } }}
            >
              {msg.message}
            </Typography>
          </Box>
        </Box>
      ) : (
        <img
          src={msg.message}
          alt='chat image'
          style={{
            width: 'min(80%, 300px)',
          }}
        />
      )}
    </>
  )
}

export default ChatMessage
