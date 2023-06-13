import React, { useContext, useState, useEffect, useRef } from 'react'
import muiStyles from '../../style/muiStyles'
import PurpleDeckCard from './PurpleDeckCard'
import { useMediaQuery } from '@mui/material'
import GraphemeSplitter from 'grapheme-splitter'
import { GameContext } from '../../context/GameContext'
import VoteSummary from './VoteSummary'
const { Box, Typography } = muiStyles

const GameFooter = ({ setComponentHeight, shadowOn }) => {
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
          cardMargin='20px 0 0 0'
          borderColor="#902bf5"
        />
      )
    }
  })

  

  return (
    <Box
      className="game-footer"
      ref={footerRef}
      sx={{
        width: '100%',
        boxShadow: shadowOn ? '0px 0px 8px 0px rgba(0,0,0,0.25)' : 'none',
        display: 'flex',
        padding: isSmallScreen ? '0 8px' : '0 10px',
        paddingTop: gameState !== 'voting' && '10px',
        justifyContent: 'center',
        alignItems: 'flex-end',
        gap: '25px',
        flexWrap: 'nowrap',
        // paddingBottom: '25px',
        // paddingBottom: '5px',
        // paddingLeft: '15px',
      }}
    >
      {gameState === 'voting' ? (
        playersData.length ? (
          <Box
            sx={{
              display: 'flex',
              // paddingTop: '15px',
              gap: { xs: '10px', sm: '18px' },
              overflowX: 'auto',
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
        <VoteSummary voteDetails={latestVoting} gameState={gameState} wrapMode={isSmallScreen} />
      )}
    </Box>
  )
}

export default GameFooter
