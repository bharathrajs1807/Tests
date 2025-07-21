import { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useLocation } from 'react-router-dom';
import type { RootState } from '../redux';
import { login, logoutAndRedirect } from '../redux/auth/authActions';
import { getAuth, onAuthStateChanged } from 'firebase/auth';

const AuthChecker = ({ children }: { children: React.ReactNode }) => {
  const isLoggedIn = useSelector((state: RootState) => state.auth.isLoggedIn);
  const dispatch = useDispatch();
  const location = useLocation();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(getAuth(), (user) => {
      if (user) {
        dispatch(login(user));
      } else {
        const publicPaths = ['/login', '/signup'];
        if (!publicPaths.includes(location.pathname)) {
          dispatch<any>(logoutAndRedirect());
        }
      }
    });
    return () => unsubscribe();
  }, [dispatch, location.pathname]);

  return <>{children}</>;
};

export default AuthChecker; 