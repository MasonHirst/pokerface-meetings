import React, { useContext, useState, useEffect, useMemo } from 'react';
import { GameContext } from '../../context/GameContext';
import { useMediaQuery } from '@mui/material';
import muiStyles from '../../style/muiStyles';
import { toast } from 'react-toastify';
import tableTop from '../../assets/table-top.jpeg';
const { Card, Typography, Button, blue } = muiStyles;

const PlayingTable = ({ disableButton, tableRef }) => {
  const {
    gameData,
    sendMessage,
    checkPowerLvl,
    activePlayersAsArray,
    gameState,
    shadowsEnabled,
  } = useContext(GameContext);
  const isSmallScreen = useMediaQuery('(max-width: 600px)');
  const isXsScreen = useMediaQuery('(max-width: 400px)');

  const votesCast = useMemo(() => {
    return activePlayersAsArray.filter((p) => p.hasVoted).length;
  }, [activePlayersAsArray]);

  const tableAttrs = useMemo(() => {
    if (
      activePlayersAsArray.length === votesCast &&
      votesCast > 0 &&
      gameState === 'voting'
    ) {
      return {
        tableMessage: 'Reveal Cards',
        tableClass: 'glowing-table',
      };
    } else if (
      activePlayersAsArray.length > votesCast &&
      votesCast > 0 &&
      gameState === 'voting'
    ) {
      return {
        tableMessage: 'Reveal Cards',
        tableClass: '',
      };
    } else if (gameState === 'reveal') {
      return {
        tableMessage: 'New round',
        tableClass: '',
      };
    } else {
      return {
        tableMessage: 'Pick your cards!',
        tableClass: '',
      };
    }
  }, [activePlayersAsArray]);

  const allVoted = useMemo(() => {
    return votesCast === activePlayersAsArray.length;
  }, [activePlayersAsArray]);

  function updateGameState() {
    if (!checkPowerLvl(gameData.gameSettings.revealPowerReq)) {
      return toast.warning("You don't have enough power to press this button");
    }
    sendMessage('updateGameState', {
      gameState: gameState === 'voting' ? 'reveal' : 'voting',
    });
  }

  return (
    <Card
      ref={tableRef}
      className={tableAttrs.tableClass}
      sx={{
        backgroundColor: blue[200],
        width: isXsScreen ? '140px' : { xs: '200px', sm: '380px' },
        height: { xs: '110px', sm: '200px' },
        borderRadius: '20px',
        boxShadow: shadowsEnabled ? '1px 3px 6px rgba(0, 0, 0, 0.5)' : 'none',
        display: 'flex',
        margin: isSmallScreen ? '0 0 7px 0' : '10px 0 20px 0',
        justifyContent: 'center',
        alignItems: 'center',
        border:
          gameData.gameSettings &&
          gameData.gameSettings.woodTable &&
          '1px solid rgba(0, 0, 0, 0.2)',
        backgroundImage:
          gameData.gameSettings &&
          gameData.gameSettings.woodTable &&
          `url(${tableTop})`,
      }}
    >
      <h1>{allVoted}</h1>
      {tableAttrs.tableMessage !== 'Pick your cards!' ? (
        <Button
          disabled={disableButton}
          color='primary'
          variant='contained'
          disableElevation
          size={isSmallScreen ? (isXsScreen ? 'small' : 'medium') : 'large'}
          sx={{
            fontSize: { xs: 15, sm: 18 },
            fontWeight: 'bold',
            textTransform: 'none',
            letterSpacing: '.5px',
          }}
          onClick={updateGameState}
        >
          {tableAttrs.tableMessage}
        </Button>
      ) : (
        <Typography
          variant='subtitle1'
          sx={{ fontSize: isSmallScreen ? 15 : 18, color: '#ffffff' }}
        >
          {tableAttrs.tableMessage}
        </Typography>
      )}
    </Card>
  );
};

export default PlayingTable;
