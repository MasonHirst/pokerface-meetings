import React from 'react'
import pokerLogo from '../../assets/poker-logo.png'
import muiStyles from '../../style/muiStyles'
import { useNavigate } from 'react-router-dom'
const { AppBar, Toolbar, Typography, Button, Box } = muiStyles

const Header = () => {
  const navigate = useNavigate()

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: '20px',
        padding: '10px 20px',
        justifyContent: 'space-between',
      }}
    >
      <Box sx={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
        <img src={pokerLogo} alt="poker-logo" style={{ width: '80px' }} />
        <Box>

        <Typography variant='h5' sx={{color: '#902bf5'}}>Pokerface Meet</Typography>
        <Typography variant='body2' sx={{fontSize: '15px', opacity: 0.6}}>by Mason Hirst</Typography>
        </Box>
      </Box>
      <Button
        disableElevation
        variant="contained"
        onClick={() => navigate(`/game/create`)}
      >
        Host new game
      </Button>
    </Box>
  )
}

export default Header
