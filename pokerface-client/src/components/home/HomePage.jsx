import React, { useState, useEffect, useRef } from 'react'
import Header from './Header'
import HomeBody from './HomeBody'
import { useMediaQuery } from '@mui/material'
import muiStyles from '../../style/muiStyles'
const { IconButton, QuestionMarkIcon, Tooltip, Box } = muiStyles

const HomePage = () => {
  const isSmallScreen = useMediaQuery('(max-width: 600px)')
  const [homeHasScroll, setHomeHasScroll] = useState(false)

  document.title = 'Pokerface - Home'

  useEffect(() => {
    const handleScroll = () => setHomeHasScroll(window.pageYOffset > 0)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <Box sx={{ width: '100%' }}>
      <Header hasScroll={homeHasScroll} />
      <HomeBody updateHasScroll={setHomeHasScroll} />

      <Tooltip title="Contact Developer" arrow placement="left">
        <IconButton
          href={`${document.location.origin}/contact`}
          target="_blank"
          sx={{
            width: isSmallScreen ? '40px' : '50px',
            height: isSmallScreen ? '40px' : '50px',
            backgroundColor: '#9c4fd7',
            position: 'fixed',
            bottom: isSmallScreen ? '10px' : '22px',
            right: isSmallScreen ? '10px' : '22px',
            padding: '15px',
            boxShadow: 'rgba(0, 0, 0, 0.24) 0px 3px 8px',
            color: '#ffffff',
            '&:hover': { backgroundColor: '#9c4fd7dd' },
          }}
        >
          <QuestionMarkIcon
            sx={{ fontSize: isSmallScreen ? '20px' : '25px' }}
          />
        </IconButton>
      </Tooltip>
    </Box>
  )
}

export default HomePage
