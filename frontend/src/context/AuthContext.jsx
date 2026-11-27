import {
  createContext,
  useContext,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import * as authService from "../services/authService";

export const AuthContext = createContext(null);

export function useAuth() {
  return useContext(AuthContext);
}

function toError(err, fallback) {
  const data = err?.response?.data;
  const error = new Error(
    data?.error || data?.message || err?.message || fallback,
  );
  error.fields = data?.errors ?? null;
  return error;
}

const extractUser = (data) => data?.user ?? data ?? null;

const PUBLIC_PATHS = [
  "/login",
  "/register",
  "/forgot-password",
  "/reset-password",
];

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(
    () => !PUBLIC_PATHS.includes(window.location.pathname),
  );

  const refreshUser = useCallback(async () => {
    try {
      const data = await authService.getCurrentUser();
      const current = extractUser(data);
      setUser(current);
      return current;
    } catch {
      setUser(null);
      return null;
    }
  }, []);

  useEffect(() => {
    if (PUBLIC_PATHS.includes(window.location.pathname)) {
      setLoading(false);
      return;
    }

    let ignore = false;
    authService
      .getCurrentUser()
      .then((data) => {
        if (!ignore) setUser(extractUser(data));
      })
      .catch(() => {
        if (!ignore) setUser(null);
      })
      .finally(() => {
        if (!ignore) setLoading(false);
      });
    return () => {
      ignore = true;
    };
  }, []);

  const login = useCallback(async (credentials) => {
    try {
      const data = await authService.login(credentials);
      const current = extractUser(data);
      setUser(current);
      return current;
    } catch (err) {
      throw toError(err, "Could not log in. Please try again.");
    }
  }, []);

  const register = useCallback(
    async (details) => {
      try {
        await authService.register(details);
      } catch (err) {
        throw toError(err, "Could not create your account. Please try again.");
      }

      return refreshUser();
    },
    [refreshUser],
  );

  const logout = useCallback(async () => {
    try {
      await authService.logout();
    } finally {
      setUser(null);
    }
  }, []);

  const value = useMemo(
    () => ({
      user,
      loading,
      isAuthenticated: Boolean(user),
      login,
      register,
      logout,
      refreshUser,
    }),
    [user, loading, login, register, logout, refreshUser],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export default AuthProvider;
