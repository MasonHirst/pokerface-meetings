import React from 'react'
import './game.css'
import { Route, Routes, Navigate } from 'react-router-dom'
import muiStyles from '../../style/muiStyles'
import { GameProvider } from '../../context/GameContext'
import CreateGamePage from '../home/CreateGamePage'
import GameRoom from './GameRoom'
const { Box } = muiStyles

const GameRouter = () => {
  return (
    <Routes>
      <Route
        path="/:game_id"
        element={
          <GameProvider>
            <GameRoom />
          </GameProvider>
        }
      />
      <Route path="/create" element={<CreateGamePage />} />
      <Route path="/not_found" element={<h1>Game not found, please try again or make a new game</h1>} />
      <Route path="*" element={<Navigate to="/home" />} />
    </Routes>
  )
}

export default GameRouter
