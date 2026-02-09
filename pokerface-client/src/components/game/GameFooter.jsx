import React, { useContext, useState, useEffect, useRef, useMemo } from 'react';
import muiStyles from '../../style/muiStyles';
import PurpleDeckCard from './PurpleDeckCard';
import { useMediaQuery } from '@mui/material';
import { GameContext } from '../../context/GameContext';
import VoteSummary from './VoteSummary';
import { deriveCardsFromDeck } from '../../utils/helperFunctions';
const { Box, Typography } = muiStyles;

const GameFooter = ({ setComponentHeight, shadowOn, chatDrawerOpen }) => {
  const footerRef = useRef();
  const cardBoxRef = useRef();
  const isSmallScreen = useMediaQuery('(max-width: 600px)');
  const {
    gameData,
    sendMessage,
    currentCardChoice,
    isAnonymousMode,
    iAmObserver,
    gameDeck,
    gameState,
  } = useContext(GameContext);

  useEffect(() => {
    if (!footerRef?.current) {
      return;
    }
    //? Assign a ResizeObserver because it updates more accurately
    //? than simply watching the footerRef with a useEffect.
    const resizeObserver = new ResizeObserver(() => {
      const height = footerRef?.current?.offsetHeight;
      setComponentHeight(height);
    });
    resizeObserver.observe(footerRef?.current);

    return () => {
      resizeObserver.disconnect();
    };
  }, []);

  function submitChoice(card) {
    const newChoice = card === currentCardChoice ? null : card;
    sendMessage('updatedCardChoice', { card: newChoice });
  }

  const latestVoting = useMemo(() => {
    if (!gameData?.voteHistory) {
      return {};
    }
    const votes = gameData.voteHistory;
    return votes[votes.length - 1];
  }, [gameData?.voteHistory]);

  const shouldShowParticipation = useMemo(() => {
    return gameState === 'reveal' && latestVoting.isAnonymousVote;
  }, [gameState, isAnonymousMode, latestVoting]);

  const showObserverMessage = useMemo(() => {
    return gameState === 'voting' && iAmObserver;
  }, [iAmObserver, gameState]);

  const mappedDeckCards = useMemo(() => {
    if (!gameDeck?.values) {
      return;
    }
    const cardValues = deriveCardsFromDeck(gameDeck?.values);
    return cardValues?.map((card, index) => (
      <PurpleDeckCard
        key={index}
        submitChoice={submitChoice}
        card={card}
        length={cardValues?.length}
        clickable={gameState === 'voting'}
        selected={currentCardChoice === card}
        cardMargin='20px 0 0 0'
        borderColor='#902bf5'
      />
    ));
  }, [gameDeck]);

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
        zIndex: 10,
      }}
    >
      {showObserverMessage ? (
        <Typography
          sx={{
            opacity: 0.7,
            fontStyle: 'italic',
            margin: '12px 0',
            textAlign: 'center',
          }}
        >
          Cards are hidden because you are in observer mode.
        </Typography>
      ) : (
        <>
          {gameState === 'voting' ? (
            mappedDeckCards?.length ? (
              <Box
                ref={cardBoxRef}
                sx={{
                  display: 'flex',
                  gap: { xs: '10px', sm: '18px' },
                  overflowX: 'auto',
                  height: '100%',
                  alignItems: 'flex-end',
                  paddingBottom: '6px',
                  paddingTop: '15px',
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
