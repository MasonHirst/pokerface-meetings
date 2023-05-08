import React, { useContext } from 'react'
import { GameContext } from '../../context/GameContext'
import muiStyles from '../../style/muiStyles'
const { Grid, Box, Card, Typography } = muiStyles

const PlayingTable = () => {
  const { playersData, gameState } = useContext(GameContext)

  let tableMessage = 'Pick your cards!'
  let choicesCount = 0
  console.log('playersData: ', playersData)
  playersData.forEach((player) => {
    console.log('table player: ', player)
    if (player.currentChoice) {
      choicesCount++
    }
  })
  console.log('choicesCount: ', choicesCount)
  console.log('playersData.length: ', playersData.length)
  if (playersData.length === choicesCount && gameState === 'voting') {
    tableMessage = 'Reveal Cards'
  }
  
  return (
    // <Box>
      <Card
        className='playing-table'
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
        <Typography variant='subtitle1' sx={{fontSize: 18}} color='white'>
          {tableMessage}
        </Typography>
      </Card>
    // {/* </Box> */}
  )
}

export default PlayingTable
