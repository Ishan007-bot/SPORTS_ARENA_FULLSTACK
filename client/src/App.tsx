import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { SocketProvider } from './context/SocketContext';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
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
    <AuthProvider>
      <SocketProvider>
        <Router>
          <div className="App">
            <Navbar />
            <main className="main-content">
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/sports" element={<Sports />} />
                <Route path="/live-scores" element={<LiveScoreboard />} />
                <Route path="/history" element={<History />} />
                <Route path="/tournament" element={
                  <ProtectedRoute requireAdmin>
                    <Tournament />
                  </ProtectedRoute>
                } />
                <Route path="/arena/cricket" element={
                  <ProtectedRoute requireScoring>
                    <CricketArena />
                  </ProtectedRoute>
                } />
                <Route path="/arena/football" element={
                  <ProtectedRoute requireScoring>
                    <FootballArena />
                  </ProtectedRoute>
                } />
                <Route path="/arena/basketball" element={
                  <ProtectedRoute requireScoring>
                    <BasketballArena />
                  </ProtectedRoute>
                } />
                <Route path="/arena/chess" element={
                  <ProtectedRoute requireScoring>
                    <ChessArena />
                  </ProtectedRoute>
                } />
                <Route path="/arena/volleyball" element={
                  <ProtectedRoute requireScoring>
                    <VolleyballArena />
                  </ProtectedRoute>
                } />
                <Route path="/arena/badminton" element={
                  <ProtectedRoute requireScoring>
                    <BadmintonArena />
                  </ProtectedRoute>
                } />
                <Route path="/arena/table-tennis" element={
                  <ProtectedRoute requireScoring>
                    <TableTennisArena />
                  </ProtectedRoute>
                } />
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
    </AuthProvider>
  );
}

export default App;

