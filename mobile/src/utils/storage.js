import * as SecureStore from 'expo-secure-store';
import AsyncStorage from '@react-native-async-storage/async-storage';

const KEYS = {
  ACCESS_TOKEN:  'krishx_access_token',
  REFRESH_TOKEN: 'krishx_refresh_token',
  USER_DATA:     'krishx_user_data',
  DARK_MODE:     'krishx_dark_mode',
  REMEMBER_ME:   'krishx_remember_email',
  LANG:          'krishx_language',
};

export const storeTokens = async (accessToken, refreshToken) => {
  await SecureStore.setItemAsync(KEYS.ACCESS_TOKEN,  accessToken);
  await SecureStore.setItemAsync(KEYS.REFRESH_TOKEN, refreshToken);
};

export const getAccessToken = () => SecureStore.getItemAsync(KEYS.ACCESS_TOKEN);
export const getRefreshToken = () => SecureStore.getItemAsync(KEYS.REFRESH_TOKEN);

export const clearTokens = async () => {
  await SecureStore.deleteItemAsync(KEYS.ACCESS_TOKEN);
  await SecureStore.deleteItemAsync(KEYS.REFRESH_TOKEN);
};

export const storeUser = async (user) => {
  await AsyncStorage.setItem(KEYS.USER_DATA, JSON.stringify(user));
};

export const getUser = async () => {
  const raw = await AsyncStorage.getItem(KEYS.USER_DATA);
  return raw ? JSON.parse(raw) : null;
};

export const clearUser = () => AsyncStorage.removeItem(KEYS.USER_DATA);

export const setDarkMode = (val) => AsyncStorage.setItem(KEYS.DARK_MODE, val ? '1' : '0');
export const getDarkMode = async () => {
  const v = await AsyncStorage.getItem(KEYS.DARK_MODE);
  return v === '1';
};

export const setRememberEmail = (email) => AsyncStorage.setItem(KEYS.REMEMBER_ME, email);
export const getRememberEmail = () => AsyncStorage.getItem(KEYS.REMEMBER_ME);
export const clearRememberEmail = () => AsyncStorage.removeItem(KEYS.REMEMBER_ME);

export const clearAll = async () => {
  await clearTokens();
  await clearUser();
};

export { KEYS };
