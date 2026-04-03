import { loginUser, logout, getCurrentUser } from "@/store/authSlice";
import { useDispatch, useSelector } from "react-redux";

export function useAuth() {
  const dispatch = useDispatch();
  const { tokens, user, loading, error, success } = useSelector(
    (state) => state.auth,
  );

  const login = async (phone, password) => {
    return dispatch(loginUser({ phone, password }));
  };

  const fetchCurrentUser = async () => {
    return dispatch(getCurrentUser()).unwrap();
  };

  const handleLogout = () => {
    dispatch(logout());
  };

  return {
    tokens,
    user,
    loading,
    error,
    success,
    login,
    logout: handleLogout,
    fetchCurrentUser,
    isAuthenticated: !!tokens.accessToken,
  };
}
