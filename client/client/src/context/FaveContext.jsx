import React, { createContext, useContext, useState, useEffect, useCallback, useRef,} from 'react';
import api from '../api/api';
import { useToast } from './ToastContext';
import { useAuth } from './AuthContext';

const FaveContext = createContext();

export function FaveProvider({ children }) {
  const [faveItems, setFaveItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const { showToast } = useToast();
  const { user } = useAuth();
  const pending = useRef(new Set());

  // Convert the server's array of { menuItemId: {...} } into a plain array of items
  const mapServerFaves = (serverFaves) => {
    if (!Array.isArray(serverFaves)) return [];
    return serverFaves.map((fav) => fav.menuItemId);
  };

  // Initial fetch on mount
  const loadFaves = useCallback(async () => {
    setIsLoading(true);
    try {
      const { data } = await api.get('/api/favorites');
      setFaveItems(mapServerFaves(data));
    } catch (err) {
      console.error('Failed to load favorites:', err);
      showToast('Could not load your favorites', 'error');
    } finally {
      setIsLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    loadFaves();
  }, [loadFaves, user]);

  // Helper: is a given item favorited?
  const isFave = (menuItemId) => {
    return faveItems.some((item) => item._id === menuItemId);
  };

  // Toggle favorite
  const toggleFave = async (item) => {
    const menuItemId = item._id;

    // Guard: item must have an ID
    if (!menuItemId) {
      console.error('toggleFave: item has no _id', item);
      showToast('Could not update favorites — item has no ID', 'error');
      return;
    }

    // Guard: block concurrent duplicate calls for the same item
    if (pending.current.has(menuItemId)) {
      console.log('Blocked duplicate toggle for', menuItemId);
      return;
    }
    pending.current.add(menuItemId);

    try {
      const wasFavorited = isFave(menuItemId);

      // Optimistic update
      if (wasFavorited) {
        setFaveItems((current) => current.filter((f) => f._id !== menuItemId));
        showToast(`${item.name} removed from favorites`, 'info');
      } else {
        setFaveItems((current) => [...current, item]);
        showToast(`${item.name} added to favorites`, 'success');
      }

      const { data } = await api.post('/api/favorites/toggle', { menuItemId });
      setFaveItems(mapServerFaves(data));
    } catch (err) {
      console.error('Toggle favorite failed:', err);
      showToast('Failed to update favorites', 'error');
      loadFaves();
    } finally {
      // Release the lock
      pending.current.delete(menuItemId);
    }
  };

  const removeFromFave = async (menuItemId) => {
    // Optimistic
    setFaveItems((current) => current.filter((f) => f._id !== menuItemId));
    showToast('Removed from favorites', 'info');

    try {
      const { data } = await api.post('/api/favorites/toggle', { menuItemId });
      setFaveItems(mapServerFaves(data));
    } catch (err) {
      console.error('Remove favorite failed:', err);
      showToast('Failed to remove favorite', 'error');
      loadFaves();
    }
  };

  const clearFaves = async () => {
    // Optimistic
    setFaveItems([]);
    showToast('Favorites cleared', 'info');

    try {
      await api.delete('/api/favorites/clear');
    } catch (err) {
      console.error('Clear favorites failed:', err);
      showToast('Failed to clear favorites', 'error');
      loadFaves();
    }
  };

  return (
    <FaveContext.Provider
      value={{
        faveItems,
        isLoading,
        isFave,
        toggleFave,
        removeFromFave,
        clearFaves,
        refreshFaves: loadFaves,
      }}
    >
      {children}
    </FaveContext.Provider>
  );
}

export function useFave() {
  const context = useContext(FaveContext);
  if (!context) {
    throw new Error('useFave must be used within a FaveProvider');
  }
  return context;
}