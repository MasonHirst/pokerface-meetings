import React, { useState, useContext } from 'react'
import { GameContext } from '../../context/GameContext'
import muiStyles from '../../style/muiStyles'
const { Box, Typography, Button } = muiStyles

const DeckCard = ({ card, submitChoice, thisUserObj }) => {
  const { playersData } = useContext(GameContext)
  let localPlayer

  // playersData.forEach((item) => {
  //   if (item.localUserToken === localStorage.getItem('localUserToken')) {
  //     localPlayer = item
  //   }
  // })

  const emojiRegex =
    /[\u{1F300}-\u{1F64F}\u{1F680}-\u{1F6FF}\u{2600}-\u{26FF}]/u

  function isNativeEmoji(str) {
    return emojiRegex.test(str)
  }

  const selected = thisUserObj.currentChoice === card

  return (
    <Box
      onClick={() => {
        console.log('clicked')
        submitChoice(card)
      }}
      className="deck-card"
      sx={{
        height: 84,
        width: 50,
        border: '2px solid #902bf5',
        transition: '0.2s',
        marginTop: selected ? '-35px' : '0',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: '10px',
      }}
    >
      <Typography variant="h6" sx={{fontSize: isNativeEmoji(card) ? 15 : 25}}>{card}</Typography>
    </Box>
  )
}

export default DeckCard
