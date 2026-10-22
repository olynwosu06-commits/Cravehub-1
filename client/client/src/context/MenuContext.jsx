import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import axios from 'axios';

const MenuContext = createContext();

export function MenuProvider({ children }) {
  const [items, setItems] = useState([]);
  const [isFetching, setIsFetching] = useState(true);
  const [fetchError, setFetchError] = useState(null);

  const loadMenu = useCallback(async () => {
    setIsFetching(true);
    setFetchError(null);

    try {
    const { data } = await axios.get('http://localhost:5002/api/menu');
      setItems(data);
    } catch (err) {
      setFetchError(err.message || 'Failed to load menu');
    } finally {
      setIsFetching(false);
    }
  }, []);

  useEffect(() => {
    loadMenu();
  }, [loadMenu]);

  return (
    <MenuContext.Provider
      value={{ items, isFetching, fetchError, refreshMenu: loadMenu }}
    >
      {children}
    </MenuContext.Provider>
  );
}

export function useMenu() {
  const ctx = useContext(MenuContext);
  if (!ctx) throw new Error('useMenu must be used within MenuProvider');
  return ctx;
}