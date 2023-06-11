import React, { useRef, useEffect } from 'react'
import muiStyles from '../../style/muiStyles'
import crewSvg from '../../assets/crew-people.svg'
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
        display: 'flex',
        flexDirection: 'column',
        marginTop: isMdScreen ? '130px' : '110px',
        // border: '1px solid red',
      }}
    >
      <Box
        sx={{
          // border: '1px solid red',
          display: 'flex',
          flexDirection: isMdScreen ? 'column' : 'row',
          justifyContent: 'center',
          alignItems: 'center',
          padding: !isMdScreen && '0 25px',
          paddingTop: '10px',
          paddingBottom: isSmallScreen ? '80px' : '120px',
          width: '100%',
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
              maxWidth: isMdScreen ? '100%' : '600px',
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
              A Scrum Poker app for agile development teams
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
              size="large"
              onClick={() => navigate(`/game/create`)}
              sx={{
                textTransform: 'none',
                fontSize: '17px',
                fontWeight: 'bold',
                maxWidth: '240px',
                borderRadius: '8px',
              }}
            >
              Host new game
            </Button>
            <Typography
              variant="h6"
              sx={{ marginTop: '10px', marginBottom: '-18px' }}
            >
              Trusted by
            </Typography>
            <Box
              sx={{
                display: 'flex',
                gap: '10px',
                fontWeight: 'bold',
                color: 'grey',
                flexWrap: 'wrap',
                justifyContent: isSmallScreen ? 'center' : 'left',
              }}
            >
              <Typography sx={{ fontSize: isSmallScreen ? '14px' : '18px' }}>
                My mom
              </Typography>
              <Typography sx={{ fontSize: isSmallScreen ? '14px' : '18px' }}>
                My wife
              </Typography>
              <Typography sx={{ fontSize: isSmallScreen ? '14px' : '18px' }}>
                Steven
              </Typography>
              <Typography sx={{ fontSize: isSmallScreen ? '14px' : '18px' }}>
                Many more
              </Typography>
            </Box>
          </Box>
        </Box>
        <Box
          sx={{
            // border: '1px solid red',
            width: isMdScreen ? '100%' : '50%',
            maxWidth: '100%',
            display: 'flex',
            justifyContent: 'center',
          }}
        >
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
            }}
          >
            <img
              src={crewSvg}
              style={{
                width: 'min(100%, 450px)',
                marginBottom: '-18px',
                zIndex: 1,
              }}
            />
            <video
              style={{
                maxWidth: 'min(550px, 100% - 18px)',
                boxShadow: 'rgba(0, 0, 0, 0.15) 0px 5px 15px 0px',
                borderRadius: '12px',
              }}
              muted
              autoPlay
              loop
              width="100%"
              src="https://res.cloudinary.com/dk9vsivmu/video/upload/v1686083344/pokerfacevideo_ab1jva.mp4"
            />
          </Box>
        </Box>
      </Box>

      <Box
        className="2nd section"
        sx={{
          backgroundColor: '#F9F9F9',
          padding: '80px 10px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Typography
          variant="h4"
          sx={{
            fontWeight: 'bold',
            fontSize: isSmallScreen ? '38px' : '45px',
            marginBottom: '80px',
            textAlign: 'center',
          }}
        >
          Why use pokerface?
        </Typography>

        <Box
          sx={{
            width: '100%',
            display: 'flex',
            justifyContent: 'space-evenly',
            gap: '25px',
            alignItems: 'center',
            flexDirection: isMdScreen ? 'column-reverse' : 'row',
          }}
        >
          <Box
            sx={{
              boxShadow: 'rgba(0, 0, 0, 0.15) 0px 5px 15px 0px',
              borderRadius: '12px',
              maxWidth: 'min(650px, 100%)',
            }}
          >
            <img
              src="https://res.cloudinary.com/dk9vsivmu/image/upload/v1686354937/Screenshot_2023-06-09_at_5.53.47_PM_hvnh9z.png"
              style={{
                borderRadius: '12px',
                width: '100%',
              }}
            />
          </Box>
          <Box
            sx={{
              maxWidth: '500px',
              display: 'flex',
              flexDirection: 'column',
              gap: '20px',
              textAlign: isMdScreen ? 'center' : 'left',
            }}
          >
            <Typography
              variant="h4"
              sx={{
                fontWeight: 'bold',
                fontSize: isSmallScreen ? '25px' : '32px',
              }}
            >
              Vote and Estimate Issues in Real-Time
            </Typography>
            <Typography variant="body1" sx={{ fontSize: '17px' }}>
              The pokerface app has a clean and simple interface that is not
              only easy-to-use, but also enables better team engagement for
              development project estimates.
            </Typography>
          </Box>
        </Box>

        <Box>
          <Box>
            <Typography
              variant="h4"
              sx={{
                fontWeight: 'bold',
                fontSize: isSmallScreen ? '25px' : '32px',
                marginTop: '80px',
                marginBottom: '20px',
                textAlign: 'center',
              }}
            >
              Easy to use
            </Typography>
          </Box>
        </Box>
      </Box>
    </Box>
  )
}

export default HomeBody
