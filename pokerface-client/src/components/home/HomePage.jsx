import React from 'react'
import Header from './Header'
import HomeBody from './HomeBody'
import muiStyles from '../../style/muiStyles'
const { IconButton, QuestionMarkIcon, Tooltip } = muiStyles

const HomePage = () => {
  document.title = 'Pokerface - Home'

  return (
    <div>
      <Header />
      <HomeBody />

      <Tooltip title="Contact Developer" arrow placement="left">
        <IconButton
          href={`${document.location.origin}/contact`}
          target='_blank'
          sx={{
            backgroundColor: '#aa00ff',
            position: 'fixed',
            bottom: '25px',
            right: '25px',
            padding: '15px',
            boxShadow: 'rgba(0, 0, 0, 0.24) 0px 3px 8px',
            color: '#ffffff',
            '&:hover': { backgroundColor: '#aa00ffdd' },
          }}
        >
          <QuestionMarkIcon />
        </IconButton>
      </Tooltip>
    </div>
  )
}

export default HomePage
