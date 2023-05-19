import React from 'react'
import muiStyles from '../../style/muiStyles'

const { Box, Typography } = muiStyles

const BlackDeckCard = ({obj}) => {

  function isNativeEmoji(str) {
    return /\p{Emoji}/u.test(str) && isNaN(Number(str))
  }
  
  return (
    <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '6px',
        }}
      >
        <Box
          sx={{
            height: 77,
            width: 45,
            border: '2px solid black',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            borderRadius: '10px',
          }}
        >
          <Typography
            sx={{
              fontSize: isNativeEmoji(obj.choice) ? 25 : 19,
            }}
          >
            {obj.choice}
          </Typography>
        </Box>
        <Typography variant="subtitle1">
          {obj.count} vote{obj.count > 1 && 's'}
        </Typography>
      </Box>
  )
}

export default BlackDeckCard