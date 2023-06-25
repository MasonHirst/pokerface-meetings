import React, { useState, useEffect, useRef } from 'react'
import VoteSummary from '../game/VoteSummary'
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
const {
  CloseIcon,
  Box,
  KeyboardArrowDownIcon,
  KeyboardArrowRightIcon,
  Collapse,
} = muiStyles

const VoteHistory = ({ showDialog, setShowDialog, gameData }) => {
  const voteHistoryRef = useRef(null)
  const isSmallScreen = useMediaQuery('(max-width: 600px)')
  const [voteHistory, setVoteHistory] = useState(gameData.voteHistory || [])
  const [expandedRowIndices, setExpandedRowIndices] = useState([])

  const headerCellStyle = (minWidth, padding = '5px 10px') => {
    return {
      backgroundColor: '#f2f2f2',
      padding: padding,
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
      border: 'none !important',
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
      let votesArr = []
      Object.entries(playerVotes).forEach((vote) => {
        if (!vote[1]) {
          vote[1] = 'No vote'
          votesArr.push(vote)
        } else votesArr.unshift(vote)
      })

      votesArr.forEach((vote, index) => {
        if (index !== 0) voteStr += ', '
        if (!vote[1]) vote[1] = 'No vote'
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
        <React.Fragment key={index}>
          <TableRow
            key={index}
            className="cursor-pointer"
            onClick={() => {
              if (expandedRowIndices.includes(index)) {
                setExpandedRowIndices(
                  expandedRowIndices.filter((i) => i !== index)
                )
              } else {
                setExpandedRowIndices([...expandedRowIndices, index])
              }
            }}
            // sx={{
            //   borderBottom: expandedRowIndices.includes(index)
            //     ? '1px solid transparent'
            //     : '1px solid grey',
            // }}

            sx={{
              borderBottom: '5px solid grey !important',
            }}
          >
            <TableCell sx={rowCellStyle}>
              {expandedRowIndices.includes(index) ? (
                <KeyboardArrowDownIcon />
              ) : (
                <KeyboardArrowRightIcon />
              )}
            </TableCell>
            <TableCell sx={rowCellStyle}>{issueName || '-'}</TableCell>
            <TableCell sx={rowCellStyle}>{average}</TableCell>
            <TableCell sx={rowCellStyle}>
              {parseFloat(agreement * 100).toFixed(1)}%
            </TableCell>
            <TableCell sx={rowCellStyle}>{formattedDate}</TableCell>
            <TableCell sx={rowCellStyle}>{participation}</TableCell>
            <TableCell sx={rowCellStyle}>
              <Typography>{voteStr}</Typography>
            </TableCell>
          </TableRow>

          <TableRow>
            <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={7}>
              <Collapse
                in={expandedRowIndices.includes(index)}
                timeout="auto"
                unmountOnExit
              >
                <Box
                  sx={{
                    width: '100%',
                    display: 'flex',
                    paddingTop: '10px',
                    justifyContent:
                      voteHistoryRef.current?.offsetWidth <
                      voteHistoryRef.current?.scrollWidth
                        ? 'flex-start'
                        : 'center',
                  }}
                >
                  <VoteSummary
                    voteDetails={voting}
                    gameState="reveal"
                    canScroll={false}
                    hasPadding={false}
                  />
                </Box>
              </Collapse>
            </TableCell>
          </TableRow>
        </React.Fragment>
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
          padding: isSmallScreen ? 10 : 45,
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

      <Box ref={voteHistoryRef} sx={{ overflowX: 'auto' }}>
        <Table stickyHeader>
          <TableHead>
            <TableRow>
              <TableCell
                sx={{ ...headerCellStyle(0, '0'), width: '20px' }}
              ></TableCell>
              <TableCell sx={headerCellStyle(140)}>Matter at hand</TableCell>
              <TableCell sx={headerCellStyle(90)}>Average</TableCell>
              <TableCell sx={headerCellStyle(100)}>Agreement</TableCell>
              <TableCell sx={headerCellStyle(100)}>Vote Time</TableCell>
              <TableCell sx={headerCellStyle(120)}>Voted / total</TableCell>
              <TableCell sx={headerCellStyle(150)}>Player Results</TableCell>
            </TableRow>
          </TableHead>
          {voteHistory.length > 0 && <TableBody>{mappedVoteRows}</TableBody>}
        </Table>
        {!voteHistory.length && (
          <Typography
            variant="h6"
            color="GrayText"
            sx={{ padding: '10px', fontWeight: 'bold' }}
          >
            Vote on an issue to view vote history
          </Typography>
        )}
      </Box>
    </Dialog>
  )
}

export default VoteHistory
