import React, { useRef, useEffect } from 'react'
import muiStyles from '../../style/muiStyles'
import crewSvg from '../../assets/crew-people.svg'
import { useNavigate } from 'react-router-dom'
import { useMediaQuery } from '@mui/material'

const { Box, Typography, Button } = muiStyles

const HomeBody = () => {
  const navigate = useNavigate()
  const isSmallScreen = useMediaQuery('(max-width: 600px)')
  const isSmallishScreen = useMediaQuery('(max-width: 1000px)')
  const isMdScreen = useMediaQuery('(max-width: 1100px)')
  const isLgScreen = useMediaQuery('(max-width: 1280px)')

  const stepCardStyles = {
    display: 'flex',
    alignItems: 'center',
    flexDirection: 'column',
    gap: '5px',
    maxWidth: isSmallishScreen ? '100%' : 'min(100%, 400px)',
    textAlign: 'center',
    width: '100%',
  }
  const stepCardTitleStyles = {
    fontSize: isSmallScreen ? '25px' : '32px',
    fontWeight: 'bold',
    marginTop: '25px',
  }
  const stepCardBodyStyles = {
    fontSize: { xs: '16px', sm: '18px' },
    color: '#47545D',
  }

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        marginTop: isMdScreen ? '130px' : '110px',
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
              Make planning simple and fun (and free) with Pokerface.
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
                color: '#47545D',
                flexWrap: 'wrap',
                justifyContent: isSmallScreen ? 'center' : 'left',
              }}
            >
              <Typography sx={{ fontSize: isSmallScreen ? '14px' : '18px' }}>
                My mom, My wife, Steven, and many more
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

      <svg viewBox="0 0 1440 128" style={{ transform: 'translateY(40%)' }}>{greyWaveSvg}</svg>

      <Box
        className="2nd section"
        sx={{
          backgroundColor: '#F9F9F9',
          padding: '60px 10px 80px 10px',
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
          Why use Pokerface?
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
          <img
            src="https://res.cloudinary.com/dk9vsivmu/image/upload/v1686354937/Screenshot_2023-06-09_at_5.53.47_PM_hvnh9z.png"
            style={{
              borderRadius: '12px',
              width: '100%',
              boxShadow: 'rgba(0, 0, 0, 0.15) 0px 5px 15px 0px',
              maxWidth: 'min(650px, 100%)',
            }}
          />
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
                color: 'bodytext',
              }}
            >
              Vote and Estimate Issues in Real-Time
            </Typography>
            <Typography
              variant="body1"
              sx={{ fontSize: '17px', color: '#47545D' }}
            >
              The Pokerface app has a clean and simple interface that is not
              only easy-to-use, but also enables better team engagement for
              development project estimates.
            </Typography>
          </Box>
        </Box>
      </Box>

      <Box
        className="3rd-section"
        sx={{
          backgroundColor: '#F9F9F9',
          padding: '80px 10px',
          display: 'flex',
          flexDirection: isMdScreen ? 'column' : 'row',
          alignItems: 'center',
          gap: '20px',
          justifyContent: 'space-evenly',
        }}
      >
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
            Voting Round Visual Results at a Glance
          </Typography>
          <Typography
            variant="body1"
            sx={{ fontSize: '17px', color: '#47545D' }}
          >
            With Poker Planner Online, results are quick and super-easy to
            understand – while still providing in-depth and high-quality
            insights.
          </Typography>
        </Box>
        <img
          src="https://res.cloudinary.com/dk9vsivmu/image/upload/v1686507423/Screenshot_2023-06-11_at_11.55.25_AM_y4xhkx.png"
          style={{
            borderRadius: '12px',
            width: '100%',
            maxWidth: 'min(650px, 100%)',
            boxShadow: 'rgba(0, 0, 0, 0.15) 0px 5px 15px 0px',
          }}
        />
      </Box>

      <Box
        className="4th-section"
        sx={{
          backgroundColor: '#F9F9F9',
          padding: '80px 10px',
          display: 'flex',
          flexDirection: isMdScreen ? 'column-reverse' : 'row',
          alignItems: 'center',
          gap: '20px',
          justifyContent: 'space-evenly',
        }}
      >
        <img
          src="https://res.cloudinary.com/dk9vsivmu/image/upload/v1686506530/Screenshot_2023-06-11_at_11.58.54_AM_kjcf7s.png"
          style={{
            borderRadius: '12px',
            width: '100%',
            maxWidth: 'min(650px, 100%)',
            boxShadow: 'rgba(0, 0, 0, 0.15) 0px 5px 15px 0px',
          }}
        />
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
            Review your meeting with ease
          </Typography>
          <Typography
            variant="body1"
            sx={{ fontSize: '17px', color: '#47545D' }}
          >
            A comprehensive vote history is always available, so you can review
            your meeting faster than you can say 'pineapple'.
          </Typography>
        </Box>
      </Box>

      <Box
        className="5th-section"
        sx={{
          padding: '0 10px',
          paddingTop: '60px',
          backgroundColor: '#F9F9F9',
          display: 'flex',
          flexDirection: isMdScreen ? 'column-reverse' : 'row',
          alignItems: 'center',
          gap: '20px',
          justifyContent: 'space-evenly',
        }}
      >
        <img
          src="https://res.cloudinary.com/dk9vsivmu/image/upload/v1686552697/pokerface-mobile_cbhwxv.png"
          style={{
            width: '100%',
            maxWidth: 'clamp(200px, 60%, 380px)',
            transform: 'translateX(-10%)',
          }}
        />
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
            Take your meetings on the go!
          </Typography>
          <Typography
            variant="body1"
            sx={{ fontSize: '17px', color: '#47545D' }}
          >
            Pokerface has been painstakingly constructed to look beautiful on
            all devices, no matter the size. Host and join games anytime,
            anywhere.
          </Typography>
        </Box>
      </Box>

      <Box
        className="6th-section"
        sx={{
          padding: '100px 10px',
          display: 'flex',
          alignItems: 'center',
          flexDirection: 'column',
          gap: '20px',
          justifyContent: 'space-evenly',
        }}
      >
        <Typography
          variant="h4"
          sx={{
            fontWeight: 'bold',
            fontSize: isSmallScreen ? '25px' : '32px',
          }}
        >
          Press Play on Pokerface Online
        </Typography>
        <Typography variant="body1" sx={{ fontSize: '17px', color: '#47545D' }}>
          3 Simple Steps to Start Your Story Estimates
        </Typography>
        <Box
          sx={{
            width: '100%',
            display: 'flex',
            rowGap: '70px',
            columnGap: '50px',
            justifyContent: 'center',
            marginTop: '60px',
            flexDirection: isSmallishScreen ? 'column' : 'row',
          }}
        >
          <Box sx={stepCardStyles}>
            <img
              src="https://res.cloudinary.com/dk9vsivmu/image/upload/v1686555839/step-1-pokerface_irropw.svg"
              style={{
                width: '100%',
                maxWidth: 'min(200px, 100%)',
              }}
            />
            <Typography variant="h5" sx={stepCardTitleStyles}>
              1. Initiate a New Game
            </Typography>
            <Typography sx={stepCardBodyStyles}>
              <span
                style={{}}
                onClick={() => navigate(`/game/create`)}
                className="start-game-link"
              >
                Start a new game
              </span>{' '}
              and choose your voting deck.
            </Typography>
          </Box>
          <Box sx={stepCardStyles}>
            <img
              src="https://res.cloudinary.com/dk9vsivmu/image/upload/v1686555839/step-2-pokerface_prigs7.svg"
              style={{
                width: '100%',
                maxWidth: 'min(200px, 100%)',
              }}
            />
            <Typography variant="h5" sx={stepCardTitleStyles}>
              2. Invite Your Agile Development Team
            </Typography>
            <Typography sx={stepCardBodyStyles}>
              Share the invite link to your team's group chat or email. Or just
              read it to them if you're old school.
            </Typography>
          </Box>
          <Box sx={stepCardStyles}>
            <img
              src="https://res.cloudinary.com/dk9vsivmu/image/upload/v1686555839/step-3-pokerface_tu296s.svg"
              style={{
                width: '100%',
                maxWidth: 'min(200px, 100%)',
              }}
            />
            <Typography variant="h5" sx={stepCardTitleStyles}>
              3. Vote!
            </Typography>
            <Typography sx={stepCardBodyStyles}>
              Marvel at the ease and simplicity of Pokerface as you estimate and
              vote on issues in real-time.
            </Typography>
          </Box>
        </Box>
      </Box>

      <svg viewBox="0 0 1440 128" style={{ transform: 'translateY(40%)' }}>{greyWaveSvg}</svg>

      <Box
        className="7th-section"
        sx={{
          width: '100%',
          display: 'flex',
          flexDirection: isMdScreen ? 'column-reverse' : 'row',
          alignItems: 'center',
          justifyContent: 'space-evenly',
          padding: '80px 10px',
          paddingBottom: '170px',
          backgroundColor: '#F9F9F9',
          gap: '20px',
          marginBottom: '-70px',
        }}
      >
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            gap: '15px',
            maxWidth: 'min(600px, 100%)',
          }}
        >
          <Typography
            variant="h4"
            sx={{
              fontWeight: 'bold',
              fontSize: { xs: '37px', sm: '45px' },
            }}
          >
            Perplexed by Pokerface?
          </Typography>
          <Typography sx={stepCardBodyStyles}>
            Get in touch today and tell me about any questions, bugs,
            suggestions, or feedback you have. Pokerface was built as a passion
            project and I'm always looking to improve it!
          </Typography>
          <Box
            sx={{
              display: 'flex',
              columnGap: '15px',
              rowGap: '12px',
              flexDirection: { xs: 'column', sm: 'row' },
              justifyContent: 'flex-start',
              alignItems: 'flex-start',
              marginTop: '20px',
            }}
          >
            <Button
              disableElevation
              variant="outlined"
              href={`${document.location.origin}/contact`}
              target="_blank"
              size="large"
              sx={{
                textTransform: 'none',
                fontSize: '17px',
                fontWeight: 'bold',
                borderRadius: '8px',
                borderColor: '#2096F3',
                borderWidth: '2.5px',
                '&:hover': {
                  borderWidth: '2.5px',
                },
              }}
            >
              Contact me
            </Button>
            <Button
              disableElevation
              variant="outlined"
              href="https://github.com/MasonHirst/pokerface-meetings"
              target="_blank"
              size="large"
              sx={{
                textTransform: 'none',
                fontSize: '17px',
                fontWeight: 'bold',
                borderWidth: '2.5px',
                borderColor: '#2096F3',
                borderRadius: '8px',
                '&:hover': {
                  borderWidth: '2.5px',
                },
              }}
            >
              View Github Repo
            </Button>
          </Box>
        </Box>
        <img
          src="https://res.cloudinary.com/dk9vsivmu/image/upload/v1686587983/perplexed-pokerface_nf3o0e.svg"
          style={{ width: 'min(100%, 350px)' }}
        />
      </Box>

      <svg
        viewBox="0 0 1440 128"
        style={{
          width: '100%',
          // border: '1px solid red',
        }}
      >
        {darkWaveSvg}
      </svg>
      <Box
        className="footer"
        sx={{
          padding: '0 10px 80px 10px',
          width: '100%',
          backgroundColor: '#1A2935',
        }}
      >
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '20px',
            textAlign: 'center',
          }}
        >
          <Typography
            variant="h4"
            color="#ffffff"
            sx={{
              fontWeight: 'bold',
              fontSize: isSmallScreen ? '25px' : '32px',
            }}
          >
            Ready to get started?
          </Typography>
          <Typography
            color="#A8AEB2"
            sx={{ fontSize: { xs: '16px', sm: '18px' } }}
          >
            Pokerface is free to use. No sign-up required. Just click the button
            below to start a new game.
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
        </Box>
      </Box>
    </Box>
  )
}

export default HomeBody

const greyWaveSvg = (
  <path
    d="M448 0C228.764 0 54.5 30.7284 0 44V128H1440V1.88947e-05C1412 7.64564 1257.54 43 993 43C728.461 43 667.236 0 448 0Z"
    fill="#f9f9f9"
  ></path>
)

const darkWaveSvg = (
  <path
    d="M448 0C228.764 0 54.5 30.7284 0 44V128H1440V1.88947e-05C1412 7.64564 1257.54 43 993 43C728.461 43 667.236 0 448 0Z"
    fill="#1A2935"
  ></path>
)
