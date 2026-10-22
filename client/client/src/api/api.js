// src/api/api.js

import axios from 'axios';
import { getSessionId } from './session';

const TOKEN_KEY = 'cravehub-token';

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5002',
  withCredentials: true, // only keep this if your login uses cookies
});

api.interceptors.request.use((config) => {
  // 1. Always attach the session ID (for anonymous cart/favorites)
  config.headers['x-session-id'] = getSessionId();

  // 2. If the user is logged in, attach the JWT too
  const token = localStorage.getItem(TOKEN_KEY);
  if (token) {
    config.headers['Authorization'] = `Bearer ${token}`;
  }

  return config;
});

export default api;