import React from 'react'
import pokerLogo from '../../assets/poker-logo.png'
import muiStyles from '../../style/muiStyles'
import { useMediaQuery } from '@mui/material'
import { useNavigate } from 'react-router-dom'
const { AppBar, Toolbar, Typography, Button, Box } = muiStyles

const Header = ({hasScroll}) => {
  const isSmallScreen = useMediaQuery('(max-width: 600px)')
  const navigate = useNavigate()

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: '20px',
        padding: { xs: '10px 10px', sm: '10px 20px' },
        justifyContent: 'space-between',
        zIndex: '100',
        backgroundColor: '#ffffff',
        // backgroundColor: 'blue',
        // height: isSmallScreen ? '75px' : '102px',
        transition: 'box-shadow 0.2s ease-in-out',
        boxShadow: hasScroll ? '0px 3px 8px rgba(0, 0, 0, 0.24)' : 'none',
        position: 'fixed',
        top: 0,
        width: '100%',
      }}
    >
      <Box
        sx={{
          display: 'flex',
          gap: isSmallScreen ? '10px' : '15px',
          alignItems: 'center',
        }}
      >
        <img
          src={pokerLogo}
          className="cursor-pointer"
          onClick={() => navigate('/')}
          alt="poker-logo"
          style={{ width: 'clamp(50px, 12vw, 80px)' }}
        />
        <Box>
          <Typography
            className="cursor-pointer"
            onClick={() => navigate('/')}
            variant="h5"
            color="primary"
            sx={{ fontWeight: 'bold', fontSize: 'clamp(17px, 5vw, 25px)' }}
          >
            Pokerface
          </Typography>
          <Typography
            variant="body2"
            className="cursor-pointer"
            onClick={() => navigate('/')}
            sx={{ fontSize: '15px', opacity: 0.6 }}
          >
            by Mason Hirst
          </Typography>
        </Box>
      </Box>
      {!isSmallScreen && (
        <Button
          disableElevation
          size="large"
          variant="contained"
          onClick={() => navigate(`/game/create`)}
          sx={{
            textTransform: 'none',
            fontSize: '17px',
            fontWeight: 'bold',
            borderRadius: '8px',
          }}
        >
          Host new game
        </Button>
      )}
    </Box>
  )
}

export default Header
