import React, { useContext, useState } from 'react'
import axios from 'axios'
import PlayingTable from './PlayingTable'
import { GameContext } from '../../context/GameContext'
import muiStyles from '../../style/muiStyles'
import PlayerCard from './PlayerCard'
const { Box, Grid, Paper, Typography, Card } = muiStyles

const GameBody = () => {
  const { playersData, gameState } = useContext(GameContext)


  function startNewVotingRound() {
    axios.put('game/start_new_voting')
      .then()
      .catch(console.error)
  }

  const mappedPlayerCards = playersData.map((player, index) => {
    if (!player) return
    return <PlayerCard key={index} gameState={gameState} player={player} />
  })

  return (
    <Box
      className="game-body-container"
      sx={{
        width: '100vw',
        minHeight: 'calc(100vh - 200px)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      <Box
        className="game-body"
        sx={{
          width: 'min(100%, 1200px)',
          height: '100%',
          display: 'flex',
          justifyContent: 'space-evenly',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <PlayingTable  />
        <Box
          sx={{
            width: '100%',
            padding: '10px',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            gap: '25px',
            margin: '25px 0',
          }}
        >
          {mappedPlayerCards}
        </Box>
      </Box>
    </Box>
  )
}

export default GameBody
