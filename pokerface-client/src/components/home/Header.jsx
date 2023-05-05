import React from 'react'
import muiStyles from '../../style/muiStyles'
import { useNavigate } from 'react-router-dom'

const { AppBar, Toolbar, Typography, Button } = muiStyles

const Header = () => {
  const navigate = useNavigate()
  
  return (
    <div>
      <Button onClick={() => navigate(`/game/create`)}>Host new game</Button>
    </div>
  )
}

export default Header
