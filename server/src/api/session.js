// src/api/session.js

const KEY = 'cravehub-session-id';

export function getSessionId() {
  let id = localStorage.getItem(KEY);

  if (!id) {
    // crypto.randomUUID() is available in all modern browsers
    id = crypto.randomUUID();
    localStorage.setItem(KEY, id);
  }

  return id;
}