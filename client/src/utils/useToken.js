import { useSelector, useDispatch } from 'react-redux';
import { login, logout } from '../redux/slices/authSlice';

// Store the token in Redux
export const useStoreToken = () => {
  const dispatch = useDispatch();
  return (token) => {
    dispatch(login(token));
  };
};

// Retrieve the token from Redux
export const useGetToken = () => {
  return useSelector((state) => state.auth.token);
};

// Clear the token from Redux
export const useClearToken = () => {
  const dispatch = useDispatch();
  return () => {
    dispatch(logout());
  };
};