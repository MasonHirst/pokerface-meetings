import React, { createContext, useState } from 'react'

export const GameContext = createContext()

export const GameProvider = ({ children }) => {
  const [voteEvent, setVoteEvent] = useState({})
  const [participantEvent, setParticipantEvent] = useState({})

  return (
    <GameContext.Provider value={{ children, voteEvent, participantEvent, }}>
      {children}
    </GameContext.Provider>
  )
}
