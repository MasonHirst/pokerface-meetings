import React, { useState, useEffect } from 'react'
import muiStyles from '../../style/muiStyles'

import PurpleDeckCard from './PurpleDeckCard'
import { createTheme, ThemeProvider } from '@mui/material/styles'
import { green, yellow, red } from '@mui/material/colors'

const circleIndicatorTheme = createTheme({
  palette: {
    primary: {
      main: green[500],
    },
    secondary: {
      main: yellow[500],
    },
    third: {
      main: red[500],
    },
    fourth: {
      main: 'rgba(0, 0, 0, 0.1)',
    },
  },
})

const { Box, Typography, CircularProgress } = muiStyles

const VoteSummary = ({
  voteDetails,
  gameState,
  wrapMode = false,
  canScroll = true,
  hasPadding = true,
  gameData,
}) => {
  const [fillPercentage, setFillPercentage] = useState(0)
  const [showAgreement, setShowAgreement] = useState(false)
  const [showAverage, setShowAverage] = useState(false)

  useEffect(() => {
    if (!gameData?.gameSettings) return
    setShowAgreement(gameData.gameSettings.showAgreement)
    setShowAverage(gameData.gameSettings.showAverage)
  }, [gameData])

  useEffect(() => {
    setFillPercentage(0)
    setTimeout(() => {
      if (!voteDetails?.agreement) return
      setFillPercentage(voteDetails.agreement * 100)
    }, 400)
  }, [voteDetails])

  const cardCounts = {}
  if (voteDetails?.playerVotes) {
    Object.values(voteDetails.playerVotes).forEach((vote) => {
      if (!vote) return
      const obj = {
        choice: vote,
        count: 1,
      }
      if (cardCounts[vote]) {
        cardCounts[vote].count++
      } else cardCounts[vote] = obj
    })
  }

  const revealCardCount = Object.values(cardCounts)
    .sort((a, b) => b.count - a.count) // Sort the objects by vote count in descending order
    .map((obj, index) => {
      const votePercentage = (obj.count / Object.values(voteDetails.playerVotes).filter((vote) => vote).length) * 100
      return (
        <Box
          key={index}
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '6px',
          }}
        >
          {!wrapMode && (
            <Box
              sx={{
                height: { xs: '45px', sm: '60px' },
                width: '8px',
                backgroundColor: '#dddddd',
                borderRadius: '4px',
                display: 'flex',
                alignItems: 'flex-end',
              }}
            >
              <Box
                sx={{
                  width: '100%',
                  transition: 'height 0.5s ease-in-out',
                  height: `${votePercentage}%`, // percentage of the largest vote count
                  borderRadius: '5px',
                  borderTopLeftRadius: votePercentage < 98 ? '0px' : '5px',
                  borderTopRightRadius: votePercentage < 98 ? '0px' : '5px',
                  backgroundColor: '#4caf50',
                }}
              />
            </Box>
          )}
          <PurpleDeckCard
            card={obj.choice}
            gameState={gameState}
            sizeMultiplier={0.9}
            borderColor="black"
            bottomMessage={`${obj.count} ${obj.count > 1 ? 'votes' : 'vote'}`}
          />
        </Box>
      )
    })

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: wrapMode ? 'column-reverse' : 'row',
        alignItems: wrapMode ? 'center' : 'flex-end',
        gap: wrapMode ? '12px' : '20px',
        paddingTop: hasPadding && '7px',
      }}
    >
      <Box
        sx={{
          display: 'flex',
          gap: '20px',
          overflowX: canScroll && 'auto',
          paddingBottom: hasPadding && '4px',
        }}
      >
        {revealCardCount}
      </Box>
      {(showAgreement || showAverage) && (
        <Box sx={{ display: 'flex', gap: '20px' }}>
          {showAgreement && (
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '2px',
                position: 'relative',
                bottom: wrapMode ? '0px' : '15px',
              }}
            >
              <Typography
                variant="body1"
                sx={{ fontSize: { xs: '15px', sm: '18px' }, opacity: 0.5 }}
              >
                Agreement
              </Typography>

              <Box sx={{ position: 'relative' }}>
                <ThemeProvider theme={circleIndicatorTheme}>
                  <CircularProgress
                    variant="determinate"
                    color="primary"
                    value={fillPercentage}
                    size={wrapMode ? 60 : 90}
                  />
                  <CircularProgress
                    variant="determinate"
                    color="fourth"
                    value={100}
                    size={wrapMode ? 60 : 90}
                    sx={{ position: 'absolute', left: '0px', top: '0px' }}
                  />
                </ThemeProvider>
                <Box
                  sx={{
                    position: 'absolute',
                    left: '50%',
                    top: '50%',
                    transform: 'translate(-50%, -50%)',
                  }}
                >
                  <Typography
                    variant="h5"
                    sx={{
                      marginTop: wrapMode ? '-5px' : '-8px',
                      fontSize: { xs: '18px', sm: '25px' },
                    }}
                  >
                    {parseFloat((voteDetails.agreement * 100).toFixed(1))}%
                  </Typography>
                </Box>
              </Box>
            </Box>
          )}

          {Object.values(voteDetails).length &&
            voteDetails.average &&
            showAverage && (
              <Box
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '7px',
                  position: 'relative',
                  bottom: wrapMode ? '0px' : !showAgreement ? '45px' : '15px',
                }}
              >
                <Typography
                  variant="body1"
                  sx={{ fontSize: { xs: '15px', sm: '18px' }, opacity: 0.5 }}
                >
                  Average
                </Typography>
                <Box sx={{ flex: 1, display: 'flex', alignItems: 'center' }}>
                  <Typography
                    variant="h5"
                    sx={{
                      marginTop: '-10px',
                      fontSize: { xs: '34px', sm: '38px' },
                    }}
                  >
                    {voteDetails.average}
                  </Typography>
                </Box>
              </Box>
            )}
        </Box>
      )}
    </Box>
  )
}

export default VoteSummary
