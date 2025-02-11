import React, { useState, useEffect, useRef, useMemo } from 'react';
import VoteSummary from '../game/VoteSummary';
import { useMediaQuery } from '@mui/material';
import {
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Dialog,
  IconButton,
  Typography,
} from '@mui/material';
import muiStyles from '../../style/muiStyles';
import { blue, red } from '@mui/material/colors';
const {
  CloseIcon,
  Box,
  KeyboardArrowDownIcon,
  KeyboardArrowRightIcon,
  Collapse,
} = muiStyles;

const VoteHistory = ({ showDialog, setShowDialog, gameData }) => {
  const voteHistoryRef = useRef(null);
  const isSmallScreen = useMediaQuery('(max-width: 600px)');
  const [voteHistory, setVoteHistory] = useState(gameData.voteHistory || []);
  const [expandedRowIndices, setExpandedRowIndices] = useState([]);

  const headerCellStyle = (minWidth, padding = '5px 10px') => {
    return {
      backgroundColor: '#f2f2f2',
      padding: padding,
      fontSize: '16px',
      fontWeight: 'bold',
      minWidth: `${minWidth}px`,
    };
  };
  const rowCellStyle = (minWidth) => {
    return {
      padding: '5px 10px',
      fontSize: '16px',
      minWidth: `${minWidth}px`,
      border: 'none !important',
    };
  };

  useEffect(() => {
    if (!gameData.voteHistory) {
      return;
    }
    setVoteHistory(gameData.voteHistory);
  }, [gameData]);

  function handleToggleExpandRow(index) {
    if (expandedRowIndices.includes(index)) {
      setExpandedRowIndices(expandedRowIndices.filter((i) => i !== index));
    } else {
      setExpandedRowIndices([...expandedRowIndices, index]);
    }
  }

  const mappedVoteRows = useMemo(() => {
    return voteHistory
      .slice()
      .reverse()
      .map((voting, index) => {
        const {
          votes,
          voteTime,
          participation,
          issueName,
          average,
          agreement,
          isAnonymousVote,
        } = voting;

        let voteStr = [];

        if (!isAnonymousVote) {
          votes.forEach((vote, i) => {
            const { card, playerName } = vote || {};
            voteStr.push(
              <span key={i}>
                <span>{playerName}: </span>
                {card ? (
                  <span style={{ fontWeight: 'bold', color: blue[500] }}>
                    {card}
                  </span>
                ) : (
                  <span style={{ color: red[500] }}>--</span>
                )}

                {i < votes.length - 1 && <span>, </span>}
              </span>
            );
          });
        }

        const date = new Date(voteTime);
        const formattedDate = date.toLocaleString('en-US', {
          month: 'short',
          day: 'numeric',
          hour: 'numeric',
          minute: 'numeric',
          hour12: true,
        });

        return (
          <React.Fragment key={index}>
            <TableRow
              key={index}
              className='cursor-pointer'
              onClick={() => handleToggleExpandRow(index)}
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
                {isAnonymousVote ? (
                  <Typography
                    sx={{
                      fontStyle: 'italic',
                      opacity: 0.7,
                    }}
                  >
                    Anonymous vote
                  </Typography>
                ) : (
                  <Typography>{voteStr}</Typography>
                )}
              </TableCell>
            </TableRow>

            <TableRow>
              <TableCell
                style={{ paddingBottom: 0, paddingTop: 0 }}
                colSpan={7}
              >
                <Collapse
                  in={expandedRowIndices.includes(index)}
                  timeout='auto'
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
                      gameState='reveal'
                      gameData={gameData}
                      canScroll={false}
                      hasPadding={false}
                      showParticipation
                    />
                  </Box>
                </Collapse>
              </TableCell>
            </TableRow>
          </React.Fragment>
        );
      });
  }, [voteHistory, expandedRowIndices]);

  //? Actual component return
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
          padding: isSmallScreen ? '15px' : '25px',
        },
      }}
      open={showDialog}
    >
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '.5rem',
        }}
      >
        <Typography
          variant='h5'
          sx={{
            marginBottom: 0,
          }}
        >
          Vote History
        </Typography>

        <IconButton
          sx={{ width: '3rem', height: '3rem' }}
          aria-label='close'
          onClick={() => {
            setShowDialog(!showDialog);
          }}
        >
          <CloseIcon />
        </IconButton>
      </Box>

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
              <TableCell sx={headerCellStyle(120)}>Participation</TableCell>
              <TableCell sx={headerCellStyle(150)}>Player Results</TableCell>
            </TableRow>
          </TableHead>
          {voteHistory.length > 0 && <TableBody>{mappedVoteRows}</TableBody>}
        </Table>
        {!voteHistory.length && (
          <Typography
            variant='h6'
            color='GrayText'
            sx={{ padding: '10px', fontWeight: 'bold' }}
          >
            Vote on an issue to view vote history
          </Typography>
        )}
      </Box>
    </Dialog>
  );
};

export default VoteHistory;
