import { useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useLocation } from 'react-router-dom';
import type { RootState } from '../redux';
import axiosInstance, { setOnLogout } from '../utils/axiosInstance';
import { login, logoutAndRedirect } from '../redux/auth/authActions';

const AuthChecker = ({ children }: { children: React.ReactNode }) => {
  const isLoggedIn = useSelector((state: RootState) => state.auth.isLoggedIn);
  const dispatch = useDispatch();
  const location = useLocation();
  const checkedRef = useRef(false);

  useEffect(() => {
    setOnLogout(() => () => dispatch<any>(logoutAndRedirect()));
    const publicPaths = ['/login', '/signup'];
    if (!isLoggedIn && !publicPaths.includes(location.pathname) && !checkedRef.current) {
      checkedRef.current = true;
      (async () => {
        try {
          await axiosInstance.get('/auth/me');
          dispatch(login());
        } catch (err: any) {
          if (err.response && (err.response.status === 401 || err.response.status === 403)) {
            dispatch<any>(logoutAndRedirect());
          }
        }
      })();
    }
  }, [isLoggedIn, location.pathname, dispatch]);

  return <>{children}</>;
};

export default AuthChecker; 