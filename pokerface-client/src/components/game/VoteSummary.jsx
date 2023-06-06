import React, { useState, useEffect, useRef, useContext } from 'react'
import muiStyles from '../../style/muiStyles'
import { useMediaQuery } from '@mui/material'
import PurpleDeckCard from './PurpleDeckCard'

const { Box, Typography } = muiStyles

const VoteSummary = ({
  voteDetails,
  gameState,
  wrapMode = false,
  canScroll = true,
  hasPadding = true,
}) => {
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

  const revealCardCount = Object.values(cardCounts).map((obj, index) => {
    let bottomMessage
    if (obj.count > 1) {
      bottomMessage = 'votes'
    } else bottomMessage = 'vote'
    return (
      <PurpleDeckCard
        key={index}
        card={obj.choice}
        gameState={gameState}
        borderColor="black"
        bottomMessage={`${obj.count} ${bottomMessage}`}
      />
    )
  })

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: wrapMode ? 'column-reverse' : 'row',
        alignItems: 'center',
        gap: '20px',
        paddingTop: hasPadding && '7px',
      }}
    >
      <Box
        sx={{
          display: 'flex',
          gap: '20px',
          overflowX: canScroll && 'scroll',
          paddingBottom: hasPadding && '4px',
        }}
      >
        {revealCardCount}
      </Box>
      <Box sx={{ display: 'flex', gap: '20px' }}>
        {Object.values(voteDetails).length && voteDetails.average && (
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '7px',
              position: 'relative',
              bottom: wrapMode ? '0px' : '15px',
            }}
          >
            <Typography
              variant="body1"
              sx={{ fontSize: { xs: '15px', sm: '18px' }, opacity: 0.5 }}
            >
              Average
            </Typography>
            <Typography
              variant="h5"
              sx={{
                marginTop: '-10px',
                fontSize: { xs: '25px', sm: '30px' },
              }}
            >
              {voteDetails.average}
            </Typography>
          </Box>
        )}
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '7px',
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
          <Typography
            variant="h5"
            sx={{
              marginTop: '-10px',
              fontSize: { xs: '25px', sm: '30px' },
            }}
          >
            {parseFloat((voteDetails.agreement * 100).toFixed(1))}%
          </Typography>
        </Box>
      </Box>
    </Box>
  )
}

export default VoteSummary
