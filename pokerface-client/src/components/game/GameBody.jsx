import React, { useContext, useState, useEffect } from 'react'
import axios from 'axios'
import PlayingTable from './PlayingTable'
import { GameContext } from '../../context/GameContext'
import muiStyles from '../../style/muiStyles'
import PlayerCard from './PlayerCard'
const { Box, Grid, Paper, Typography, Card } = muiStyles

const GameBody = () => {
  const { gameData } = useContext(GameContext)
  const [playersData, setPlayersData] = useState([])
  const [gameState, setGameState] = useState('')

  useEffect(() => {
    if (!gameData.gameRoomName) return
    setPlayersData(Object.values(gameData.players))
    setGameState(gameData.gameState)
  }, [gameData])

  const mappedPlayerCards = Object.values(playersData).map((player, index) => {
    if (!player) return
    return <PlayerCard key={index} gameState={gameState} player={player} />
  })

  return (
    <Box
      className="game-body-container"
      sx={{
        width: '100vw',
        minHeight: 'calc(100vh - 250px)',
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
        <PlayingTable />
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
