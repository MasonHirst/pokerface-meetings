import React, { useState, useContext, useEffect } from 'react'
import { GameContext } from '../../context/GameContext'
import muiStyles from '../../style/muiStyles'
const { Box, Typography, Button } = muiStyles

const DeckCard = ({ card, submitChoice, thisUserObj }) => {
  const localUserToken = localStorage.getItem('localUserToken')
  const [playersData, setPlayersData] = useState([])
  const [gameState, setGameState] = useState('')
  const [thisUser, setThisUser] = useState({})
  const { gameData } = useContext(GameContext)

  function isNativeEmoji(str) {
    return /\p{Emoji}/u.test(str) && isNaN(Number(card))
  }

  useEffect(() => {
    if (!gameData.gameRoomName) return
    setPlayersData(Object.values(gameData.players))
    setGameState(gameData.gameState)
    setThisUser(gameData.players[localUserToken])
  }, [gameData])

  const selected = thisUser.currentChoice === card

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
        minWidth: 50,
        border: '2px solid #902bf5',
        transition: '0.2s',
        position: 'relative',
        bottom: selected ? '20px' : 0,
        display: 'flex',
        justifyContent: 'center',
        backgroundColor: selected ? '#902bf5' : 'transparent',
        color: selected && '#ffffff',
        alignItems: 'center',
        borderRadius: '10px',
      }}
    >
      <Typography variant="h6" sx={{ fontSize: isNativeEmoji(card) ? 33 : 23,  }}>
        {card}
      </Typography>
    </Box>
  )
}

export default DeckCard
