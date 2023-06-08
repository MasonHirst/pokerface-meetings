import React from 'react'
import muiStyles from '../../style/muiStyles'
import { useNavigate } from 'react-router-dom'
import { useMediaQuery } from '@mui/material'

const { Box, Typography, Button } = muiStyles

const HomeBody = () => {
  const navigate = useNavigate()
  const isSmallScreen = useMediaQuery('(max-width: 600px)')
  const isMdScreen = useMediaQuery('(max-width: 960px)')
  const isLgScreen = useMediaQuery('(max-width: 1280px)')

  return (
    <Box
      sx={{
        // border: '1px solid red',
        display: 'flex',
        flexDirection: isMdScreen ? 'column' : 'row',
        justifyContent: 'center',
        alignItems: 'center',
        padding: !isMdScreen && '0 25px',
        paddingTop: 'min(100px, 5vh)',
      }}
    >
      <Box
        sx={{
          // border: '1px solid red',
          width: isMdScreen ? '100%' : '50%',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <Box
          sx={{
            padding: isMdScreen && isSmallScreen ? '30px 18px' : '50px 25px',
            paddingTop: '0',
            maxWidth: isMdScreen ? '100%' : '500px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: isMdScreen ? 'center' : 'left',
            gap: '20px',
          }}
        >
          <Typography
            variant="h5"
            sx={{
              fontWeight: 'bold',
              fontSize: 'clamp(20px, 5vw, 50px)',
              lineHeight: '1.2',
              textAlign: isMdScreen ? 'center' : 'left',
            }}
          >
            A simple voting app for agile teams
          </Typography>
          <Typography
            color="#47545D"
            sx={{
              fontSize: 'clamp(14px, 2vw, 18px)',
              textAlign: isMdScreen ? 'center' : 'left',
            }}
          >
            Make planning simple and fun (and free) with pokerface.
          </Typography>
          <Button
            disableElevation
            variant="contained"
            size='large'
            onClick={() => navigate(`/game/create`)}
            sx={{ textTransform: 'none', fontSize: '17px', fontWeight: 'bold', maxWidth: '240px', borderRadius: '8px' }}
          >
            Host new game
          </Button>
        </Box>
      </Box>
      <Box
        sx={{
          // border: '1px solid red',
          width: isMdScreen ? '100%' : '50%',
          display: 'flex',
          justifyContent: 'center',
        }}
      >
        <video
          style={{ maxWidth: '600px', boxShadow: !isSmallScreen && 'rgba(0, 0, 0, 0.35) 0px 5px 15px', borderRadius: !isSmallScreen && '12px' }}
          muted
          autoPlay
          loop
          width="100%"
          src="https://res.cloudinary.com/dk9vsivmu/video/upload/v1686083344/pokerfacevideo_ab1jva.mp4"
        />
      </Box>
    </Box>
  )
}

export default HomeBody
