import React, { useContext, useState, useEffect } from 'react'
import muiStyles from '../../style/muiStyles'
import PurpleDeckCard from './PurpleDeckCard'
import GraphemeSplitter from 'grapheme-splitter'
import { GameContext } from '../../context/GameContext'
const { Box, Typography } = muiStyles

const GameFooter = () => {
  const [latestVoting, setLatestVoting] = useState([])
  const [deckCards, setDeckCards] = useState([])
  const [playersData, setPlayersData] = useState([])
  const [gameState, setGameState] = useState('')
  const { gameData, sendMessage } = useContext(GameContext)
  const splitter = GraphemeSplitter()

  function submitChoice(card) {
    sendMessage('updatedChoice', { card })
  }

  function averageNumericValues(arr) {
    let sum = 0
    let count = 0
    for (let val of arr) {
      if (!isNaN(Number(val)) && val) {
        sum += +val
        count++
      }
    }
    if (count === 0) {
      return null // or whatever value you want to return if there are no numeric values
    }
    const average = sum / count
    return parseFloat(average.toFixed(1))
  }

  // The big useEffect that runs on gameData change
  useEffect(() => {
    if (!gameData.gameRoomName) return
    setGameState(gameData.gameState)
    const votes = gameData.voteResults
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
          gameData={gameData}
          useCase='votingCard'
          borderColor='#902bf5'
        />
      )
    }
  })

  const cardCounts = {}
  if (latestVoting) {
    Object.values(latestVoting).forEach((vote) => {
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
    const length = splitter.splitGraphemes(obj.choice.trim()).length
    return (
      <PurpleDeckCard
        key={index}
        card={obj.choice}
        length={length}
        gameData={gameData}
        borderColor='black'
        useCase='voteCount'
        voteCount={obj.count}
      />
    )
  })

  return (
    <Box
      className="game-footer-container"
      sx={{
        width: '100vw',
        height: '160px',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      <Box
        className="game-footer"
        sx={{
          width: '100%',
          height: '100%',
          display: 'flex',
          padding: '0 5px',
          justifyContent: 'center',
          alignItems: 'center',
          gap: '25px',
          flexWrap: 'nowrap',
          overflowX: 'scroll',
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
                paddingBottom: '8px',
              }}
            >
              {mappedDeckCards}
            </Box>
          ) : (
            <Typography variant="h6">No cards</Typography>
          )
        ) : (
          <>
            <Box sx={{ display: 'flex', gap: '20px' }}>{revealCardCount}</Box>
            {Object.values(latestVoting).length &&
              averageNumericValues(Object.values(latestVoting)) && (
                <Typography variant="h5">
                  Average: {averageNumericValues(Object.values(latestVoting))}
                </Typography>
              )}
          </>
        )}
      </Box>
    </Box>
  )
}

export default GameFooter
