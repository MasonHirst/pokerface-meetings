import React from 'react'
import muiStyles from '../../style/muiStyles'
const { Grid, Box, Card, Typography } = muiStyles

const PlayingTable = () => {
  return (
    <Box>
      <Card
        className='playing-table'
        sx={{
          backgroundColor: '#009FBD',
          width: '200px',
          height: '120px',
          borderRadius: '35px',
          boxShadow: 'none',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <Typography variant='h5' color='white'>
          Playing Table
        </Typography>
      </Card>
    </Box>
  )
}

export default PlayingTable
