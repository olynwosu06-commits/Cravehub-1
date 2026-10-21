// src/api/api.js

import axios from 'axios';
import { getSessionId } from './session';

const api = axios.create({
  baseURL: 'http://localhost:5002',
});

api.interceptors.request.use((config) => {
  config.headers['x-session-id'] = getSessionId();
  return config;
});

export default api;