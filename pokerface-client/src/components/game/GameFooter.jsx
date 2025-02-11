import React, { useContext, useState, useEffect, useRef, useMemo } from 'react';
import muiStyles from '../../style/muiStyles';
import PurpleDeckCard from './PurpleDeckCard';
import { useMediaQuery } from '@mui/material';
import GraphemeSplitter from 'grapheme-splitter';
import { GameContext } from '../../context/GameContext';
import VoteSummary from './VoteSummary';
const { Box, Typography } = muiStyles;

const GameFooter = ({ setComponentHeight, shadowOn }) => {
  const [latestVoting, setLatestVoting] = useState([]);
  const [deckCards, setDeckCards] = useState([]);
  const [playersData, setPlayersData] = useState([]);
  const [gameState, setGameState] = useState('');
  const footerRef = useRef();
  const isSmallScreen = useMediaQuery('(max-width: 600px)');
  const {
    gameData,
    sendMessage,
    currentCardChoice,
    isAnonymousMode,
    iAmObserver,
  } = useContext(GameContext);
  const splitter = GraphemeSplitter();

  useEffect(() => {
    if (!footerRef.current) {
      return;
    }
    setComponentHeight(footerRef.current.offsetHeight);
  }, [footerRef.current?.offsetHeight, gameState]);

  function submitChoice(card) {
    const newChoice = card === currentCardChoice ? null : card;
    sendMessage('updatedCardChoice', { card: newChoice });
  }

  useEffect(() => {
    if (!gameData?.gameSettings?.gameRoomName) {
      return;
    }
    setGameState(gameData.gameSettings.gameState);
    const votes = gameData.voteHistory;
    setLatestVoting(votes[votes.length - 1]);
    setPlayersData(Object.values(gameData.players));
    setDeckCards([...new Set(gameData.gameSettings.deck.values.split(','))]);
  }, [gameData]);

  const shouldShowParticipation = useMemo(() => {
    return gameState === 'reveal' && latestVoting.isAnonymousVote;
  }, [gameState, isAnonymousMode, latestVoting]);

  const showObserverMessage = useMemo(() => {
    return gameState === 'voting' && iAmObserver;
  }, [iAmObserver, gameState]);

  const mappedDeckCards = deckCards.map((card, index) => {
    const length = splitter.splitGraphemes(card.trim()).length;
    if (length > 0 && length < 5) {
      return (
        <PurpleDeckCard
          key={index}
          submitChoice={submitChoice}
          card={card}
          length={length}
          clickable={gameState === 'voting'}
          selected={currentCardChoice === card}
          cardMargin='20px 0 0 0'
          borderColor='#902bf5'
        />
      );
    }
  });

  return (
    <Box
      className='game-footer'
      ref={footerRef}
      sx={{
        width: '100%',
        boxShadow: shadowOn ? '0px 0px 8px 0px rgba(0,0,0,0.25)' : 'none',
        display: 'flex',
        padding: isSmallScreen ? '0 8px' : '0 10px',
        paddingTop: gameState !== 'voting' && '10px',
        justifyContent: 'center',
        alignItems: 'flex-end',
        gap: '25px',
        flexWrap: 'nowrap',
      }}
    >
      {showObserverMessage ? (
        <Typography
          sx={{
            opacity: 0.7,
            fontStyle: 'italic',
            marginBottom: '.5rem',
          }}
        >
          Turn off observer mode to vote
        </Typography>
      ) : (
        <>
          {gameState === 'voting' ? (
            playersData.length ? (
              <Box
                sx={{
                  display: 'flex',
                  gap: { xs: '10px', sm: '18px' },
                  overflowX: 'auto',
                  height: '100%',
                  alignItems: 'flex-end',
                  paddingBottom: '6px',
                  // paddingTop: '15px',
                }}
              >
                {mappedDeckCards}
              </Box>
            ) : (
              <Typography variant='h6'>No cards</Typography>
            )
          ) : (
            <VoteSummary
              voteDetails={latestVoting}
              gameState={gameState}
              wrapMode={isSmallScreen}
              gameData={gameData}
              showParticipation={shouldShowParticipation}
            />
          )}
        </>
      )}
    </Box>
  );
};

export default GameFooter;
