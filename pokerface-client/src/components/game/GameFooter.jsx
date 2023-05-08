import React, { useContext } from 'react'
import muiStyles from '../../style/muiStyles'
import axios from 'axios'
import DeckCard from './DeckCard'
import { GameContext } from '../../context/GameContext'
const { Box, Typography } = muiStyles

const GameFooter = () => {
  const { gameDeck, playersData, thisUserObj, gameState, pastVotings } =
    useContext(GameContext)

  function isNativeEmoji(str) {
    return /\p{Emoji}/u.test(str)
  }

  let latestVoting
  if (pastVotings.length) {
    latestVoting = pastVotings[pastVotings.length - 1]
  }

  function submitChoice(card) {
    axios
      .put('game/submit_choice', { choice: card })
      .then(({ data }) => {})
      .catch(console.error)
  }

  const mappedDeckCards = gameDeck.length ? (
    gameDeck.map((card, index) => {
      return (
        <DeckCard
          key={index}
          submitChoice={submitChoice}
          thisUserObj={thisUserObj}
          card={card}
        />
      )
    })
  ) : (
    <h6>No cards</h6>
  )

  const cardCounts = {}
  if (pastVotings.length) {
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
        <Box
          sx={{
            height: 77,
            width: 45,
            border: '2px solid black',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            borderRadius: '10px',
          }}
        >
          <Typography sx={{ fontSize: isNativeEmoji(obj.choice) && isNaN(Number(obj.choice)) ? 25 : 19 }}>
            {obj.choice}
          </Typography>
        </Box>
        <Typography variant="subtitle1">
          {obj.count} vote{obj.count > 1 && 's'}
        </Typography>
      </Box>
    )
  })

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

  return (
    <Box
      className="game-footer-container"
      sx={{
        width: '100vw',
        height: '170px',
        // border: '1px solid black',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      {/* {gameState === 'voting' && ( */}
      <Box
        className="game-footer"
        sx={{
          width: 'min(100%, 900px)',
          height: '100%',
          display: 'flex',
          padding: '0, 10px',
          justifyContent: 'center',
          alignItems: 'center',
          gap: '25px',
          flexWrap: 'nowrap',
          overflowX: 'auto',
        }}
      >
        {gameState === 'voting' ? (
          playersData.length && mappedDeckCards
        ) : (
          <>
            <Box sx={{ display: 'flex', gap: '25px' }}>{revealCardCount}</Box>
            {pastVotings.length &&
              averageNumericValues(Object.values(latestVoting)) && (
                <Typography variant="h5">
                  {averageNumericValues(Object.values(latestVoting))}
                </Typography>
              )}
          </>
        )}
      </Box>
      {/* )} */}
    </Box>
  )
}

export default GameFooter
