import React, { useContext, useState, useEffect, useRef } from 'react'
import muiStyles from '../../style/muiStyles'
import PurpleDeckCard from './PurpleDeckCard'
import { useMediaQuery } from '@mui/material'
import GraphemeSplitter from 'grapheme-splitter'
import { GameContext } from '../../context/GameContext'
const { Box, Typography } = muiStyles

const GameFooter = ({ setComponentHeight }) => {
  const [latestVoting, setLatestVoting] = useState([])
  const [deckCards, setDeckCards] = useState([])
  const [playersData, setPlayersData] = useState([])
  const [gameState, setGameState] = useState('')
  const footerRef = useRef()
  const isSmallScreen = useMediaQuery('(max-width: 600px)')
  const { gameData, sendMessage } = useContext(GameContext)
  const splitter = GraphemeSplitter()

  useEffect(() => {
    if (!footerRef.current) return
    setComponentHeight(footerRef.current.offsetHeight)
  }, [footerRef.current?.offsetHeight, gameState])

  function submitChoice(card) {
    sendMessage('updatedChoice', { card })
  }

  useEffect(() => {
    if (!gameData.gameRoomName) return
    setGameState(gameData.gameState)
    const votes = gameData.voteHistory
    setLatestVoting(votes[votes.length - 1])
    setPlayersData(Object.values(gameData.players))
    setDeckCards([...new Set(gameData.deck.split(','))])
  }, [gameData])

  const mappedDeckCards = deckCards.map((card, index) => {
    const length = splitter.splitGraphemes(card.trim()).length
    if (length < 5) {
      return (
        <PurpleDeckCard
          key={index}
          submitChoice={submitChoice}
          card={card}
          length={length}
          clickable={gameState === 'voting'}
          gameState={gameState}
          selected={
            gameData?.players[localStorage.getItem('localUserToken')]
              .currentChoice === card
          }
          cardMargin="20px 0 0 0"
          borderColor="#902bf5"
        />
      )
    }
  })

  const cardCounts = {}
  if (latestVoting?.playerVotes) {
    Object.values(latestVoting.playerVotes).forEach((vote) => {
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
      className="game-footer"
      ref={footerRef}
      sx={{
        width: '100%',
        backgroundColor: '#fafafa',
        display: 'flex',
        padding: '10px 5px 0 5px',
        justifyContent: 'center',
        alignItems: 'flex-end',
        gap: '25px',
        flexWrap: 'nowrap',
      }}
    >
      {gameState === 'voting' ? (
        playersData.length ? (
          <Box
            sx={{
              display: 'flex',
              gap: { xs: '10px', sm: '18px' },
              overflowX: 'scroll',
              height: '100%',
              alignItems: 'flex-end',
              paddingBottom: '6px',
            }}
          >
            {mappedDeckCards}
          </Box>
        ) : (
          <Typography variant="h6">No cards</Typography>
        )
      ) : (
        // Reveal state footer
        <Box
          sx={{
            display: 'flex',
            flexDirection: isSmallScreen ? 'column-reverse' : 'row',
            alignItems: 'center',
            gap: '20px',
          }}
        >
          <Box
            sx={{
              display: 'flex',
              gap: '20px',
              overflowX: 'scroll',
              paddingBottom: '4px',
            }}
          >
            {revealCardCount}
          </Box>
          <Box sx={{ display: 'flex', gap: '20px' }}>
            {Object.values(latestVoting).length && latestVoting.average && (
              <Box
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '7px',
                  position: 'relative',
                  bottom: isSmallScreen ? '0px' : '15px',
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
                  {latestVoting.average}
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
                bottom: isSmallScreen ? '0px' : '15px',
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
                {parseFloat((latestVoting.agreement * 100).toFixed(1))}%
              </Typography>
            </Box>
          </Box>
        </Box>
      )}
    </Box>
  )
}

export default GameFooter
