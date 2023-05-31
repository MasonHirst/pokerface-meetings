import React from 'react'
import muiStyles from '../../style/muiStyles'

const {Box, Typography} = muiStyles


const HomeBody = () => {

  return (
    <Box sx={{border: '1px solid red', display: 'flex', padding: {xs: '50px 10px', sm: '100px 45px'},  }}>
      <Box sx={{border: '1px solid red', width: '50%', }}>
        <Typography variant='h5' sx={{ fontWeight: 'bold', }}>A simple planning app for your voting needs</Typography>

      </Box>
      <Box sx={{border: '1px solid red', width: '50%',}}>
        <img src=''/>
      </Box>
    </Box>
  )
}


export default HomeBody