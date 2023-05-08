import React, { useContext } from 'react'
import muiStyles from '../../style/muiStyles'
import axios from 'axios'
import DeckCard from './DeckCard'
import { GameContext } from '../../context/GameContext'
const { Box } = muiStyles

const GameFooter = () => {
  const { gameDeck, playersData, thisUserObj } = useContext(GameContext)

  function submitChoice(card) {
    axios.put('game/submit_choice', {choice: card}).then(({data}) => {
    }).catch(console.error)
  }


  const mappedDeckCards = gameDeck.length ? (
    gameDeck.map((card, index) => {
      return <DeckCard key={index} submitChoice={submitChoice} thisUserObj={thisUserObj} card={card} />
    })
  ) : (
    <h6>No cards</h6>
  )

  return (
    <Box
      className="game-header-container"
      sx={{
        width: '100vw',
        height: '120px',
        // border: '1px solid black',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      <Box
        className="game-header"
        sx={{
          width: 'min(100%, 900px)',
          height: '100%',
          display: 'flex',
          padding: '0, 10px',
          justifyContent: 'center',
          alignItems: 'center',
          gap: '25px',
          flexWrap: 'nowrap',
          overflowX: 'auto',
        }}
      >
        {playersData.length && mappedDeckCards}
      </Box>
    </Box>
  )
}

export default GameFooter
