import React, { useState, useContext } from 'react'
import { GameContext } from '../../context/GameContext'
import muiStyles from '../../style/muiStyles'
const { Box, Typography, Button } = muiStyles

const DeckCard = ({ card, submitChoice, thisUserObj }) => {
  const { playersData, gameState } = useContext(GameContext)

  function isNativeEmoji(str) {
    return /\p{Emoji}/u.test(str)
  }

  const selected = thisUserObj.currentChoice === card

  return (
    <Box
      onClick={() => {
        if (gameState !== 'voting') return
        submitChoice(card)
      }}
      className={gameState === 'voting' && "deck-card"}
      sx={{
        height: 84,
        width: 50,
        border: '2px solid #902bf5',
        transition: '0.2s',
        marginTop: selected ? '-35px' : '0',
        display: 'flex',
        justifyContent: 'center',
        backgroundColor: selected ? '#902bf5' : 'transparent',
        color: selected && 'white',
        alignItems: 'center',
        borderRadius: '10px',
      }}
    >
      <Typography variant="h6" sx={{ fontSize: isNativeEmoji(card) && isNaN(Number(card)) ? 33 : 23,  }}>
        {card}
      </Typography>
    </Box>
  )
}

export default DeckCard
