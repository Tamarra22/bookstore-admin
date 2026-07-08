import axios from 'axios';
import { storage } from '../utils/storage';

const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'https://reactdeveloperexam.ymcargo.tech';

export const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

// Attach the bearer token to every outgoing request automatically —
// no component or hook ever has to remember to do this.
api.interceptors.request.use((config) => {
  const token = storage.getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// This module is plain JS/axios — it can't call useContext directly.
// AuthProvider registers a callback here so the interceptor can trigger a
// centralized logout whenever any request comes back 401.
type UnauthorizedHandler = () => void;
let onUnauthorized: UnauthorizedHandler | null = null;

export const registerUnauthorizedHandler = (handler: UnauthorizedHandler) => {
  onUnauthorized = handler;
};

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      onUnauthorized?.();
    }
    // Rethrow so 422/403/500 can still be handled locally by the calling code,
    // where the right reaction actually differs per form/action.
    return Promise.reject(error);
  }
);
