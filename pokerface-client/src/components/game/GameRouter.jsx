import React from 'react'
import GameHeader from './GameHeader'
import GameBody from './GameBody'
import GameFooter from './GameFooter'
import muiStyles from '../../style/muiStyles'
const { Box } = muiStyles

const GameRouter = () => {
  return (
    <Box sx={{ minHeight: '100vh',}}>
      <GameHeader />
      <GameBody />
      <GameFooter />
    </Box>
  )
}

export default GameRouter