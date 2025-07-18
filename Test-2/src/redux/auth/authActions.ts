import { LOGIN, LOGOUT } from './authActionTypes';
import type { Dispatch } from 'redux';

export const login = (user?: any) => {
  if (user) localStorage.setItem('user', JSON.stringify(user));
  return { type: LOGIN };
};

export const logout = () => {
  localStorage.removeItem('user');
  return { type: LOGOUT };
};

export const logoutAndRedirect = () => (dispatch: Dispatch) => {
  dispatch(logout());
  window.location.href = '/login';
};
