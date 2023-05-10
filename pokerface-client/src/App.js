import { Route, Routes, Navigate } from 'react-router-dom'
import HomeRouter from './components/home/HomeRouter'
import GameRouter from './components/game/GameRouter'

function App() {
  return (
    <div className="App" style={{}}>
      <Routes>
        <Route path='/*' element={<HomeRouter />}/>
        <Route path='/game/*' element={<GameRouter />}/>
        <Route path='*' element={<Navigate to="/" />}/>
      </Routes>
    </div>
  )
}

export default App
