import React from 'react'
import purpleAbstract from '../../assets/purple-abstract.jpg'
import muiStyles from '../../style/muiStyles'
const { Card, Typography, Box } = muiStyles

const PlayerCard = ({ player, gameState }) => {
  const name = player.playerName
  const choice = player.currentChoice
  // const { isSpectator } = player

  function isNativeEmoji(str) {
    return /\p{Emoji}/u.test(str)
  }

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
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          borderRadius: '10px',
          width: 55,
          height: 90,
          border: '2px solid #902BF5',
          boxShadow: 'none',
          backgroundImage:
            choice && gameState === 'voting' && `url(${purpleAbstract})`,
          backgroundPosition: 'center',
          backgroundSize: 'cover',
          backgroundRepeat: 'no-repeat',
          backgroundColor: '#E8E9EA',
        }}
      >
        <Typography sx={{ fontSize: isNativeEmoji(choice) && isNaN(Number(choice)) ? 30 : 23 }}>
          {gameState === 'reveal' && choice}
        </Typography>
      </Card>
      <Typography>{name}</Typography>
    </Box>
  )
}

export default PlayerCard
