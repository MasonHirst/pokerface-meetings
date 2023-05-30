import React from 'react'
import Header from './Header'
import muiStyles from '../../style/muiStyles'
const { IconButton, QuestionMarkIcon, purple, Tooltip } = muiStyles

const HomePage = () => {
  document.title = 'Pokerface - Home'
  return (
    <div>
      <Header />
      <Tooltip title="Contact Developer" arrow placement="left">
        <IconButton
          href={`${document.location.origin}/contact`}
          target='_blank'
          sx={{
            '&:hover': { backgroundColor: purple[300] },
            backgroundColor: purple[400],
            position: 'fixed',
            bottom: '25px',
            right: '25px',
            padding: '15px',
            color: '#ffffff',
          }}
        >
          <QuestionMarkIcon />
        </IconButton>
      </Tooltip>
    </div>
  )
}

export default HomePage
