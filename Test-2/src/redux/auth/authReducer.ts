import type { AuthAction, AuthState } from './authActionTypes';
import { LOGIN, LOGOUT } from './authActionTypes';

const initialState: AuthState = {
  isLoggedIn: !!localStorage.getItem('user'),
};

export default function authReducer(
  state: AuthState = initialState,
  action: AuthAction
): AuthState {
  switch (action.type) {
    case LOGIN:
      return { ...state, isLoggedIn: true };
    case LOGOUT:
      return { ...state, isLoggedIn: false };
    default:
      return state;
  }
}
