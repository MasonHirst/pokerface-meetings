import React from 'react'
import muiStyles from '../../style/muiStyles'
const { Box } = muiStyles

const GameFooter = () => {
  return (
    <Box
      className='game-header-container'
      sx={{
        width: '100vw',
        height: '120px',
        backgroundColor: 'rgb(198, 203, 231)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      <Box
        className='game-header'
        sx={{
          width: 'min(100%, 900px)',
          height: '100%',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      ></Box>
    </Box>
  )
}

export default GameFooter
