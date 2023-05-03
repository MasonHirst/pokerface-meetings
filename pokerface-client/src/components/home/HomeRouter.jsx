import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import HomePage from './HomePage'
import CreateGamePage from './CreateGamePage'

const HomeRouter = () => {
  return (
    <div>
      <Routes>
        <Route path="/home" element={<HomePage />} />
        <Route path="/create" element={<CreateGamePage />} />
        <Route path="*" element={<Navigate to="/home" />} />
      </Routes>
    </div>
  )
}

export default HomeRouter