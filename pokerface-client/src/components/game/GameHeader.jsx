import React, { useEffect, useContext, useState } from 'react'
import axios from 'axios'
import muiStyles from '../../style/muiStyles'
const { AppBar, Toolbar, Typography, Button, Box } = muiStyles

const GameHeader = () => {
  

  return (
    <Box
      className="game-header-container"
      sx={{
        width: '100vw',
        height: '80px',
        backgroundColor: '#902bf5',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      <Box
        className="game-header"
        sx={{
          width: 'min(100%, 1200px)',
          height: '100%',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <Button variant="contained">Something else</Button>
        <Button variant="contained">Invite players</Button>
      </Box>
    </Box>
  )
}

export default GameHeader
