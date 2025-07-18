export const LOGIN = 'auth/LOGIN' as const;
export const LOGOUT = 'auth/LOGOUT' as const;

export interface LoginAction { type: typeof LOGIN; }
export interface LogoutAction { type: typeof LOGOUT; }

export interface AuthState { isLoggedIn: boolean; }
export type AuthAction = LoginAction | LogoutAction;
