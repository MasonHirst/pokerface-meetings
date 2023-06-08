import React from 'react'
import Header from './Header'
import HomeBody from './HomeBody'
import { useMediaQuery } from '@mui/material'
import muiStyles from '../../style/muiStyles'
const { IconButton, QuestionMarkIcon, Tooltip } = muiStyles

const HomePage = () => {
  const isSmallScreen = useMediaQuery('(max-width: 600px)')
  document.title = 'Pokerface - Home'

  return (
    <div>
      <Header />
      <HomeBody />

      <Tooltip title="Contact Developer" arrow placement="left">
        <IconButton
          href={`${document.location.origin}/contact`}
          target="_blank"
          sx={{
            width: isSmallScreen ? '40px' : '50px',
            height: isSmallScreen ? '40px' : '50px',
            backgroundColor: '#aa00ff',
            position: 'fixed',
            bottom: isSmallScreen ? '10px' : '22px',
            right: isSmallScreen ? '10px' : '22px',
            padding: '15px',
            boxShadow: 'rgba(0, 0, 0, 0.24) 0px 3px 8px',
            color: '#ffffff',
            '&:hover': { backgroundColor: '#aa00ffdd' },
          }}
        >
          <QuestionMarkIcon
            sx={{ fontSize: isSmallScreen ? '20px' : '25px' }}
          />
        </IconButton>
      </Tooltip>
    </div>
  )
}

export default HomePage
