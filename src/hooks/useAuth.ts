import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    // Turns a silent bug (context is undefined, weird crash later) into an
    // immediate, obvious error at the point of misuse.
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
