import { Route, Routes, Navigate } from 'react-router-dom';
import HomeRouter from './components/home/HomeRouter';
import GameRouter from './components/game/GameRouter';
import { Slide, ToastContainer } from 'react-toastify';

function App() {
  return (
    <div className='App'>
      <ToastContainer
        position='top-center'
        newestOnTop
        draggable
        hideProgressBar={false}
        autoClose={2500}
        transition={Slide}
        pauseOnHover
        pauseOnFocusLoss={false}
        theme='light'
      />
      <Routes>
        <Route path='/*' element={<HomeRouter />} />
        <Route path='/game/*' element={<GameRouter />} />
        <Route path='*' element={<Navigate to='/' />} />
      </Routes>
    </div>
  );
}

export default App;
