import React from 'react'
import purpleAbstract from '../../assets/purple-abstract.jpg'
import muiStyles from '../../style/muiStyles'
const { Card, Typography, Box } = muiStyles

const PlayerCard = ({ player, gameState }) => {
  const name = player.playerName
  const choice = player.currentChoice
  const { isSpectator } = player

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '10px',
      }}
    >
      <Card
        sx={{
          borderRadius: '10px',
          width: 55,
          height: 90,
          border: '2px solid #902BF5',
          boxShadow: 'none',
          backgroundImage: choice && `url(${purpleAbstract})`,
          backgroundPosition: 'center',
          backgroundSize: 'cover',
          backgroundRepeat: 'no-repeat',
          backgroundColor: '#E8E9EA',
        }}
      >
        <Typography>{gameState === 'show' && choice}</Typography>
      </Card>
      <Typography>{name}</Typography>
    </Box>
  )
}

export default PlayerCard
