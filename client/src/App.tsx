import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { SocketProvider } from './context/SocketContext';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Sports from './pages/Sports';
import LiveScoreboard from './pages/LiveScoreboard';
import History from './pages/History';
import CricketArena from './pages/arenas/CricketArena';
import FootballArena from './pages/arenas/FootballArena';
import BasketballArena from './pages/arenas/BasketballArena';
import ChessArena from './pages/arenas/ChessArena';
import VolleyballArena from './pages/arenas/VolleyballArena';
import BadmintonArena from './pages/arenas/BadmintonArena';
import TableTennisArena from './pages/arenas/TableTennisArena';
import Tournament from './pages/Tournament';
import './App.css';

function App() {
  return (
    <SocketProvider>
      <Router>
        <div className="App">
          <Navbar />
          <main className="main-content">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/sports" element={<Sports />} />
              <Route path="/live-scores" element={<LiveScoreboard />} />
              <Route path="/history" element={<History />} />
              <Route path="/tournament" element={<Tournament />} />
              <Route path="/arena/cricket" element={<CricketArena />} />
              <Route path="/arena/football" element={<FootballArena />} />
              <Route path="/arena/basketball" element={<BasketballArena />} />
              <Route path="/arena/chess" element={<ChessArena />} />
              <Route path="/arena/volleyball" element={<VolleyballArena />} />
              <Route path="/arena/badminton" element={<BadmintonArena />} />
              <Route path="/arena/table-tennis" element={<TableTennisArena />} />
            </Routes>
          </main>
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: '#363636',
                color: '#fff',
              },
            }}
          />
        </div>
      </Router>
    </SocketProvider>
  );
}

export default App;

