import React, { useContext } from 'react'
import { GameContext } from '../../context/GameContext'
import axios from 'axios'
import muiStyles from '../../style/muiStyles'
const { Grid, Box, Card, Typography, Button } = muiStyles

const PlayingTable = () => {
  const { playersData, gameState } = useContext(GameContext)

  let tableMessage = 'Pick your cards!'
  let choicesCount = 0
  let tableClass = ''
  let allVoted = false
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

  function updateGameState() {
    if (gameState === 'voting') {
      axios.put('game/update_state', {gameState: 'reveal'})
    } else if (gameState === 'reveal') {
      axios.put('game/update_state', {gameState: 'voting'})
    }
  }

  return (
    // <Box>
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
        <Button variant="contained" disableElevation size='large' sx={{}} onClick={updateGameState}>{tableMessage}</Button>
      ) : (
        <Typography variant="subtitle1" sx={{ fontSize: 18 }} color="white">
          {tableMessage}
        </Typography>
      )}
    </Card>
    // {/* </Box> */}
  )
}

export default PlayingTable
