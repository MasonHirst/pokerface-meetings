import React, { useContext, useState, useEffect } from 'react'
import { GameContext } from '../../context/GameContext'
import axios from 'axios'
import { useParams } from 'react-router-dom'
import muiStyles from '../../style/muiStyles'
const { Grid, Box, Card, Typography, Button } = muiStyles

const PlayingTable = () => {
  const { gameData, setGameData } = useContext(GameContext)
  const { game_id } = useParams()
  const [playersData, setPlayersData] = useState([])
  const [gameState, setGameState] = useState('')

  let tableMessage = 'Pick your cards!'
  let choicesCount = 0
  let tableClass = ''
  let allVoted = false

  useEffect(() => {
    if (!gameData.gameRoomName) return
    setPlayersData(Object.values(gameData.players))
    setGameState(gameData.gameState)
    
    playersData.forEach((player) => {
      if (player.currentChoice) {
        choicesCount++
      }
    })
    if (playersData.length === choicesCount && gameState === 'voting') {
      tableMessage = 'Reveal Cards'
      tableClass = 'glowing-table'
      allVoted = true
    } else if (
      playersData.length > choicesCount &&
      choicesCount > 0 &&
      gameState === 'voting'
    ) {
      tableMessage = 'Reveal Cards'
    } else if (gameState === 'reveal') {
      tableMessage = 'Start new round'
    }
  }, [gameData])


  function updateGameState() {
    axios.put('game/update_state', {
      gameId: game_id,
      gameState: gameState === 'voting' ? 'reveal' : 'voting',
    })
    .then(({data}) => {
      setGameData(data)
    })
    .catch(console.error)
  }

  return (
    <Card
      className={tableClass}
      sx={{
        backgroundColor: '#009FBD',
        width: '300px',
        height: '150px',
        borderRadius: '25px',
        boxShadow: 'none',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      {tableMessage !== 'Pick your cards!' ? (
        <Button
          variant="contained"
          disableElevation
          size="large"
          sx={{}}
          onClick={updateGameState}
        >
          {tableMessage}
        </Button>
      ) : (
        <Typography variant="subtitle1" sx={{ fontSize: 18 }} color="white">
          {tableMessage}
        </Typography>
      )}
    </Card>
  )
}

export default PlayingTable
