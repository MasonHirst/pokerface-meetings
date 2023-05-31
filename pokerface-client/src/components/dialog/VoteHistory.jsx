import React, { useState, useEffect } from 'react'
import { useMediaQuery } from '@mui/material'
import {
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Dialog,
  IconButton,
  Typography,
} from '@mui/material'
import muiStyles from '../../style/muiStyles'
const { CloseIcon, Box } = muiStyles

const VoteHistory = ({ showDialog, setShowDialog, gameData }) => {
  const isSmallScreen = useMediaQuery('(max-width: 600px)')
  const [voteHistory, setVoteHistory] = useState(gameData.voteHistory || [])

  const headerCellStyle = (minWidth) => {
    return {
      backgroundColor: '#f2f2f2',
      padding: '5px 10px',
      fontSize: '16px',
      fontWeight: 'bold',
      minWidth: `${minWidth}px`,
    }
  }
  const rowCellStyle = (minWidth) => {
    return {
      padding: '5px 10px',
      fontSize: '16px',
      minWidth: `${minWidth}px`,
    }
  }

  useEffect(() => {
    if (!gameData.voteHistory) return
    setVoteHistory(gameData.voteHistory)
  }, [gameData])

  const mappedVoteRows = voteHistory
    .slice()
    .reverse()
    .map((voting, index) => {
      const {
        playerVotes,
        voteTime,
        participation,
        issueName,
        average,
        agreement,
      } = voting

      let voteStr = ``
      Object.entries(playerVotes).forEach((vote, index) => {
        if (index !== 0) voteStr += ', '
        voteStr += `${vote[0]} (${vote[1]})`
      })

      const date = new Date(voteTime)
      const formattedDate = date.toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: 'numeric',
        hour12: true,
      })

      return (
        <TableRow
          key={index}
          sx={index % 2 !== 0 ? { borderBottom: '1px solid grey', } : {}}
        >
          <TableCell sx={rowCellStyle}>{issueName || '-'}</TableCell>
          <TableCell sx={rowCellStyle}>{average}</TableCell>
          <TableCell sx={rowCellStyle}>{agreement * 100}%</TableCell>
          <TableCell sx={rowCellStyle}>{formattedDate}</TableCell>
          <TableCell sx={rowCellStyle}>{participation}</TableCell>
          <TableCell sx={rowCellStyle}>
            <Typography>{voteStr}</Typography>
          </TableCell>
        </TableRow>
      )
    })

  return (
    <Dialog
      onClose={() => setShowDialog(!showDialog)}
      fullScreen={isSmallScreen}
      PaperProps={{
        style: {
          borderRadius: !isSmallScreen && 15,
          display: 'flex',
          minWidth: !isSmallScreen && 'min(1400px, calc(100vw - 16px))',
          flexDirection: 'column',
          justifyContent: 'center',
          gap: 20,
          maxWidth: '100vw',
          padding: 55,
        },
      }}
      open={showDialog}
    >
      <IconButton
        sx={{ position: 'absolute', top: 7, right: 5 }}
        aria-label="close"
        onClick={() => setShowDialog(!showDialog)}
      >
        <CloseIcon />
      </IconButton>
      <Typography variant="h5">Vote History</Typography>

      <Box sx={{ overflowX: 'scroll' }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell sx={headerCellStyle(140)}>Matter at hand</TableCell>
              <TableCell sx={headerCellStyle(90)}>Average</TableCell>
              <TableCell sx={headerCellStyle(100)}>Agreement</TableCell>
              <TableCell sx={headerCellStyle(100)}>Vote Time</TableCell>
              <TableCell sx={headerCellStyle(120)}>Voted / total</TableCell>
              <TableCell sx={headerCellStyle(150)}>Player Results</TableCell>
            </TableRow>
          </TableHead>
          {voteHistory.length > 0 ? (
            <TableBody>{mappedVoteRows}</TableBody>
          ) : (
            <Typography
              variant="h6"
              color="GrayText"
              sx={{ padding: '10px', fontWeight: 'bold' }}
            >
              Vote on an issue to view vote history
            </Typography>
          )}
        </Table>
      </Box>
    </Dialog>
  )
}

export default VoteHistory
