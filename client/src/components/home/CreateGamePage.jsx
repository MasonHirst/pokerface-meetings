import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import pokerLogo from '../../assets/pokerface-logo.png';
import PurpleDeckCard from '../game/PurpleDeckCard';
import GraphemeSplitter from 'grapheme-splitter';
import ChooseDeck from '../dialog/ChooseDeck';
import axios from 'axios';
import muiStyles from '../../style/muiStyles';
import { deriveCardsFromDeck } from '../../utils/helperFunctions';
const { Box, TextField, Button, StyleIcon, TvIcon, Typography } = muiStyles;

const CreateGamePage = () => {
  const splitter = GraphemeSplitter();
  const [selectedDeck, setSelectedDeck] = useState({
    values: '1,2,3,5,8,13,21,34,55,?,☕',
    name: 'Fibonacci',
  });
  const navigate = useNavigate();
  const [showDeckDialog, setShowDeckDialog] = useState(false);
  const [gameName, setGameName] = useState('');
  const [error, setError] = useState('');
  const [appIsLoading, setAppIsLoading] = useState(false);

  const selectedDeckCards = useMemo(() => {
    if (typeof selectedDeck.values !== 'string') {
      return [];
    }
    return deriveCardsFromDeck(selectedDeck.values).map((card, index) => {
      return <PurpleDeckCard key={index} card={card} sizeMultiplier={0.9} />;
    });
  }, [selectedDeck]);

  useEffect(() => {
    document.title = 'Pokerface - Create Game';
  }, []);

  function handleHostGame(e) {
    setError('');
    e.preventDefault();
    if (!gameName) {
      return setError('Please enter a game name');
    }
    setAppIsLoading(true);
    axios
      .post('game/create', {
        gameName: gameName.trim(),
        deck: selectedDeck,
        gameHost: localStorage.getItem('PokerfaceLocalUserToken'),
      })
      .then(({ data }) => {
        if (data.gameRoomId) {
          navigate(`/game/${data.gameRoomId}`);
        } else {
          setError('Error creating game');
        }
      })
      .catch(console.error)
      .finally(() => setAppIsLoading(false));
  }

  return (
    <Box
      sx={{
        width: '100vw',
        minHeight: '100vh',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '0 8px',
      }}
    >
      <form
        onSubmit={handleHostGame}
        style={{
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          gap: '30px',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <TextField
          inputProps={{ maxLength: 24 }}
          onChange={(e) => setGameName(e.target.value)}
          sx={{ width: 'min(650px, 100%)' }}
          autoFocus
          name='pokerface-game-name'
          disabled={appIsLoading}
          error={!!error}
          value={gameName}
          label='Game Name'
          size='large'
          placeholder='Enter a game name'
          helperText={error}
        />

        <Box
          sx={{
            width: '100%',
            display: 'flex',
            justifyContent: 'center',
          }}
        >
          <Box
            sx={{
              display: 'flex',
              gap: { xs: '10px', sm: '12px' },
              overflowX: 'auto',
              height: '100%',
              display: 'flex',
              alignItems: 'flex-end',
              paddingBottom: '8px',
            }}
          >
            {selectedDeckCards}
          </Box>
        </Box>

        <Button
          onClick={() => setShowDeckDialog(!showDeckDialog)}
          color='secondary'
          variant='contained'
          disableElevation
          sx={{ textTransform: 'none', fontSize: '17px', fontWeight: 'bold' }}
          startIcon={<StyleIcon />}
        >
          Change Deck
        </Button>

        <Button
          variant='contained'
          size='large'
          disableElevation
          disabled={appIsLoading}
          sx={{
            width: 'min(650px, 100%)',
            fontWeight: 'bold',
            fontSize: '19px',
            textTransform: 'none',
          }}
          onClick={handleHostGame}
          startIcon={<TvIcon />}
        >
          Create Game Room
        </Button>
      </form>

      {showDeckDialog && (
        <ChooseDeck
          setDeckProp={setSelectedDeck}
          setShowDeckDialog={setShowDeckDialog}
          showDeckDialog={showDeckDialog}
        />
      )}

      <Box
        sx={{
          position: 'absolute',
          top: '10px',
          left: '10px',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
        }}
      >
        <img
          src={pokerLogo}
          className='cursor-pointer'
          onClick={() => navigate('/')}
          alt='pokerface-logo'
          style={{ width: 'clamp(90px, 20vw, 130px)' }}
        />
        <Box>
          <Typography
            variant='h5'
            className='cursor-pointer'
            onClick={() => navigate('/')}
            color='primary'
            sx={{ fontWeight: 'bold', fontSize: 'clamp(17px, 5vw, 25px)' }}
          >
            Pokerface
          </Typography>
          <Typography
            variant='body2'
            className='cursor-pointer'
            onClick={() => navigate('/')}
            sx={{ fontSize: 'clamp(12px, 3vw, 15px)', opacity: 0.6 }}
          >
            by Mason Hirst
          </Typography>
        </Box>
      </Box>

      <Typography
        sx={{
          display: { xs: 'none', sm: 'block' },
          position: 'absolute',
          right: '20px',
          top: '23px',
          fontWeight: 'bold',
          fontSize: 'clamp(17px, 5vw, 25px)',
        }}
      >
        New game setup
      </Typography>
    </Box>
  );
};

export default CreateGamePage;
