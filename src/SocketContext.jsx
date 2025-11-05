import React, { createContext, useEffect, useState } from 'react';
import io from 'socket.io-client';

export const SocketContext = createContext();

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);

  // ✅ Use API URL from .env instead of hardcoded localhost
  const API_URL = import.meta.env.VITE_API_URL;

  useEffect(() => {
    const newSocket = io(API_URL, {
      auth: { token: localStorage.getItem('token') },
    });
    setSocket(newSocket);

    return () => newSocket.close();
  }, [API_URL]); // dependency ensures reconnection if env changes

  return (
    <SocketContext.Provider value={socket}>
      {children}
    </SocketContext.Provider>
  );
};
