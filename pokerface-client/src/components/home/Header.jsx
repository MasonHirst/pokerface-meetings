import React from 'react'
import pokerLogo from '../../assets/poker-logo.png'
import muiStyles from '../../style/muiStyles'
import { useMediaQuery } from '@mui/material'
import { useNavigate } from 'react-router-dom'
const { AppBar, Toolbar, Typography, Button, Box } = muiStyles

const Header = () => {
  const isSmallScreen = useMediaQuery('(max-width: 600px)')
  const navigate = useNavigate()

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: '20px',
        padding: {xs: '10px 10px', sm: '10px 20px'},
        justifyContent: 'space-between',
      }}
    >
      <Box sx={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
        <img src={pokerLogo} alt="poker-logo" style={{ width: '80px' }} />
        <Box>

        <Typography variant='h5' color='primary' sx={{ fontWeight: 'bold', }}>Pokerface Meet</Typography>
        <Typography variant='body2' sx={{fontSize: '15px', opacity: 0.6}}>by Mason Hirst</Typography>
        </Box>
      </Box>
      {!isSmallScreen && <Button
        disableElevation
        variant="contained"
        onClick={() => navigate(`/game/create`)}
        sx={{ textTransform: 'none', fontSize: '17px', fontWeight: 'bold', }}
      >
        Host new game
      </Button>}
    </Box>
  )
}

export default Header
