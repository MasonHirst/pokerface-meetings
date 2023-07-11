import React, { useState } from 'react'
import muiStyles from '../../style/muiStyles'
import GifPicker from 'gif-picker-react'

const { Box, Button, SendIcon } = muiStyles

const App = ({ setSelectedGif, tenorApi }) => {
  const [currentGif, setCurrentGif] = useState(null)

  return (
    <Box
      sx={{
        position: 'absolute',
        width: '100%',
        height: 'min(450px, 50vh)',
        bottom: 0,
        boxShadow: '0px 0px 8px 0px rgba(0,0,0,0.25)',
        borderTopLeftRadius: '10px',
        borderTopRightRadius: '10px',
        overflow: 'hidden',
        borderLeft: '1px solid rgba(0, 0, 0, 0.2)',
      }}
    >
      <Box
        sx={{
          width: '100%',
          height: 'min(450px, 50vh)',
          position: 'relative',
        }}
      >
        <GifPicker
          width='100%'
          height='100%'
          tenorApiKey={tenorApi}
          onGifClick={(gif) => setCurrentGif(gif)}
        />

        {currentGif && (
          <Box
            sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              backgroundColor: '#ffffff',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
              gap: '10px',
            }}
          >
            <img
              src={currentGif.url}
              alt='gif'
              style={{
                maxWidth: '90%',
              }}
            />
            <Box sx={{
              display: 'flex',
              gap: '10px',
            }}>
              <Button
                sx={{
                  textTransform: 'none',
                  fontWeight: 'bold',
                  fontSize: '16px',
                }}
                onClick={() => setCurrentGif(null)}
              >
                Cancel
              </Button>
              <Button
                variant='contained'
                sx={{
                  textTransform: 'none',
                  fontWeight: 'bold',
                  fontSize: '16px',
                }}
                endIcon={<SendIcon sx={{ fontSize: '20px' }} />}
                onClick={() => setSelectedGif(currentGif)}
              >
                Send
              </Button>
            </Box>
          </Box>
        )}
      </Box>
    </Box>
  )
}

export default App
