import React, { createContext, useContext, useReducer, useEffect, useRef } from 'react';
import { getUser, getAccessToken, storeTokens, storeUser, clearAll, getDarkMode, setDarkMode } from '../utils/storage';
import { userAPI, setAuthFailedCallback } from '../services/api';

const AppContext = createContext(null);

const GUEST_USER = {
  id: null,
  full_name: 'Guest User',
  email: '',
  phone: '',
  is_admin: false,
  is_guest: true,
  created_at: new Date().toISOString(),
};

const initialState = {
  user:       null,
  isLoggedIn: false,
  isGuest:    false,
  isLoading:  true,
  darkMode:   false,
  toast:      null,
};

function reducer(state, action) {
  switch (action.type) {
    case 'SET_USER':
      return {
        ...state,
        user:       action.payload,
        isLoggedIn: !!action.payload,
        isGuest:    action.payload?.is_guest === true,
      };
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    case 'SET_DARK_MODE':
      return { ...state, darkMode: action.payload };
    case 'SHOW_TOAST':
      return { ...state, toast: action.payload };
    case 'HIDE_TOAST':
      return { ...state, toast: null };
    case 'LOGOUT':
      return { ...state, user: null, isLoggedIn: false, isGuest: false };
    default:
      return state;
  }
}

export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState);
  // Hard timeout — if bootstrap takes > 6 s, release the loading lock
  const bootstrapTimer = useRef(null);

  useEffect(() => {
    // When refresh token also expires, api.js calls this → force logout
    setAuthFailedCallback(() => {
      dispatch({ type: 'LOGOUT' });
    });

    bootstrapTimer.current = setTimeout(() => {
      dispatch({ type: 'SET_LOADING', payload: false });
    }, 6000);
    bootstrap();
    return () => clearTimeout(bootstrapTimer.current);
  }, []);

  const bootstrap = async () => {
    try {
      const [token, cachedUser, dark] = await Promise.all([
        getAccessToken(),
        getUser(),
        getDarkMode(),
      ]);
      dispatch({ type: 'SET_DARK_MODE', payload: dark });
      if (token && cachedUser) {
        // Show cached user immediately so the app doesn't block on network
        dispatch({ type: 'SET_USER', payload: cachedUser });
        // Silently refresh profile in background — don't await
        userAPI.getProfile()
          .then(({ user }) => { storeUser(user); dispatch({ type: 'SET_USER', payload: user }); })
          .catch(() => {/* network error is fine, cached user stays */});
      }
    } catch (_) {}
    clearTimeout(bootstrapTimer.current);
    dispatch({ type: 'SET_LOADING', payload: false });
  };

  const login = async (userData, accessToken, refreshToken) => {
    await storeTokens(accessToken, refreshToken);
    await storeUser(userData);
    dispatch({ type: 'SET_USER', payload: { ...userData, is_guest: false } });
  };

  /** Login without any credentials — no backend call needed. */
  const loginAsGuest = () => {
    dispatch({ type: 'SET_USER', payload: GUEST_USER });
  };

  const logout = async () => {
    await clearAll();
    dispatch({ type: 'LOGOUT' });
  };

  const updateUser = async (userData) => {
    await storeUser(userData);
    dispatch({ type: 'SET_USER', payload: userData });
  };

  const toggleDarkMode = async () => {
    const next = !state.darkMode;
    await setDarkMode(next);
    dispatch({ type: 'SET_DARK_MODE', payload: next });
  };

  const showToast = (message, type = 'success', duration = 3000) => {
    dispatch({ type: 'SHOW_TOAST', payload: { message, type } });
    setTimeout(() => dispatch({ type: 'HIDE_TOAST' }), duration);
  };

  return (
    <AppContext.Provider value={{ ...state, login, loginAsGuest, logout, updateUser, toggleDarkMode, showToast }}>
      {children}
    </AppContext.Provider>
  );
}

export const useApp = () => {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
};
