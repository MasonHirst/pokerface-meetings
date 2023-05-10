import React from 'react'
import axios from 'axios'
import muiStyles from '../../style/muiStyles'
import { useNavigate } from 'react-router-dom'

const { AppBar, Toolbar, Typography, Button } = muiStyles

const Header = () => {
  const navigate = useNavigate()

  function pingServer8080() {
    axios
      .get('server/ping/8080')
      .then(({ data }) => {
        console.log(data)
      })
      .catch(console.error)
  }

  return (
    <div>
      <Button onClick={() => navigate(`/game/create`)}>Host new game</Button>
      <Button onClick={pingServer8080}>Check 8080 server</Button>
    </div>
  )
}

export default Header
