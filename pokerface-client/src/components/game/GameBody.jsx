import React from 'react'
import PlayingTable from './PlayingTable'
import muiStyles from '../../style/muiStyles'
const { Box } = muiStyles

const GameBody = () => {
  return (
    <Box
      className='game-body-container'
      sx={{
        width: '100vw',
        minHeight: 'calc(100vh - 200px)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      <Box
        className='game-body'
        sx={{
          width: 'min(100%, 1200px)',
          height: '100%',
          display: 'flex',
          justifyContent: 'space-evenly',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <PlayingTable />
      </Box>
    </Box>
  )
}

export default GameBody
