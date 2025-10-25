import React, { createContext, useContext, useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { API_BASE_URL } from '../config/api';

interface SocketContextType {
  socket: Socket | null;
  isConnected: boolean;
  joinMatch: (matchId: string) => void;
  leaveMatch: (matchId: string) => void;
  joinLiveScoreboard: () => void;
  leaveLiveScoreboard: () => void;
}

const SocketContext = createContext<SocketContextType | undefined>(undefined);

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (context === undefined) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};

interface SocketProviderProps {
  children: React.ReactNode;
}

export const SocketProvider: React.FC<SocketProviderProps> = ({ children }) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const newSocket = io(API_BASE_URL, {
      transports: ['websocket', 'polling'],
    });

    newSocket.on('connect', () => {
      console.log('✅ Connected to server with ID:', newSocket.id);
      setIsConnected(true);
    });

    newSocket.on('disconnect', () => {
      console.log('Disconnected from server');
      setIsConnected(false);
    });

    newSocket.on('connect_error', (error) => {
      console.error('Connection error:', error);
      setIsConnected(false);
    });

    setSocket(newSocket);

    return () => {
      newSocket.close();
    };
  }, []);

  const joinMatch = (matchId: string) => {
    if (socket) {
      console.log('Joining match room:', matchId);
      socket.emit('join-match', matchId);
    }
  };

  const leaveMatch = (matchId: string) => {
    if (socket) {
      socket.emit('leave-match', matchId);
    }
  };

  const joinLiveScoreboard = () => {
    if (socket) {
      socket.emit('join-live-scoreboard');
    }
  };

  const leaveLiveScoreboard = () => {
    if (socket) {
      socket.emit('leave-live-scoreboard');
    }
  };

  const value: SocketContextType = {
    socket,
    isConnected,
    joinMatch,
    leaveMatch,
    joinLiveScoreboard,
    leaveLiveScoreboard,
  };

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  );
};
