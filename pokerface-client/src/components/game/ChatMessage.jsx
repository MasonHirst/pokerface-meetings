import React from 'react';
import muiStyles from '../../style/muiStyles';
import PurpleDeckCard from './PurpleDeckCard';

const { Box, Typography, blue } = muiStyles;

const ChatMessage = ({ msg }) => {
  function formatTime(timestamp) {
    const date = new Date(timestamp);
    const hours = date.getHours();
    const minutes = date.getMinutes();
    const amOrPm = hours >= 12 ? 'pm' : 'am';
    const formattedHours = hours % 12 || 12;
    const formattedMinutes = minutes.toString().padStart(2, '0');
    return `${formattedHours}:${formattedMinutes} ${amOrPm}`;
  }

  return (
    <>
      {msg.type === 'settingsUpdate' ? (
        <Box
          sx={{
            backgroundColor: blue[50],
            padding: .2,
            margin: '.3rem 0',
            borderRadius: '.5rem',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}
        >
          <Typography variant='body2' color='text.secondary' sx={{
            fontSize: '.65rem'
          }}>
            <span
              style={{
                fontWeight: 'bold',
              }}
            >
              {msg.senderName}
            </span>{' '}
            updated settings at {formatTime(msg.sendTime)}
          </Typography>
        </Box>
      ) : (
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'row',
            gap: '5px',
            margin: '.4rem 0',
          }}
        >
          <PurpleDeckCard
            cardImage={msg.senderPhoto}
            showBgImage
            sizeMultiplier={0.5}
            borderThickness={0.5}
          />
          <Box
            sx={{
              wordBreak: 'break-word',
            }}
          >
            <Typography
              variant='body1'
              sx={{ fontWeight: 'bold', fontSize: { xs: '15px', sm: '17px' } }}
            >
              {msg.senderName}
              <span
                style={{
                  fontSize: '14px',
                  fontWeight: 'normal',
                  color: 'rgb(0, 0, 0, 0.6)',
                }}
              >
                {' '}
                {formatTime(msg.sendTime)}
              </span>
            </Typography>

            {msg.type === 'text' && (
              <Typography
                variant='body2'
                sx={{ fontSize: { xs: '14px', sm: '16px' } }}
              >
                {msg.message}
              </Typography>
            )}
            {msg.type === 'img' && (
              <img
                src={msg.message}
                alt='gif'
                style={{
                  maxWidth: 'min(90%, 200px)',
                  maxHeight: '500px',
                }}
              />
            )}
          </Box>
        </Box>
      )}
    </>
  );
};

export default ChatMessage;
