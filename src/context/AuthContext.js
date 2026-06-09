import { createContext, useContext, useEffect, useState } from 'react';
import { authAPI, AUTH_TOKEN_KEY } from '../lib/api';

const AuthContext = createContext(null);
const LOCAL_ADMIN_KEY = 'fh_local_admin_session';

const localAdminEmail = process.env.REACT_APP_ADMIN_EMAIL || 'admin@faithheroes.local';
const localAdminPassword = process.env.REACT_APP_ADMIN_PASSWORD || 'FaithHeroesAdmin!2026';

function createLocalAdminProfile(email) {
  return { id: 'local-admin', email, full_name: 'Faith Heroes Admin', role: 'admin' };
}

function persistAuth(data) {
  if (data?.token) localStorage.setItem(AUTH_TOKEN_KEY, data.token);
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadSession() {
      try {
        if (localStorage.getItem(LOCAL_ADMIN_KEY) === 'true') {
          const adminProfile = createLocalAdminProfile(localAdminEmail);
          setUser({ id: adminProfile.id, email: adminProfile.email });
          setProfile(adminProfile);
          return;
        }
        if (localStorage.getItem(AUTH_TOKEN_KEY)) {
          const response = await authAPI.me();
          setUser(response.data.user);
          setProfile(response.data.profile);
        }
      } catch {
        localStorage.removeItem(AUTH_TOKEN_KEY);
      } finally {
        setLoading(false);
      }
    }
    loadSession();
  }, []);

  async function signIn(email, password) {
    const response = await authAPI.login({ email, password });
    persistAuth(response.data);
    setUser(response.data.user);
    setProfile(response.data.profile);
    return response.data;
  }

  async function signInAdmin(email, password) {
    if (email === localAdminEmail && password === localAdminPassword) {
      const adminProfile = createLocalAdminProfile(email);
      localStorage.setItem(LOCAL_ADMIN_KEY, 'true');
      setUser({ id: adminProfile.id, email: adminProfile.email });
      setProfile(adminProfile);
      return { user: adminProfile };
    }

    const data = await signIn(email, password);
    if (data.profile?.role !== 'admin') {
      await signOut();
      throw new Error('This account is not allowed to access the admin dashboard');
    }
    return data;
  }

  async function signUp(email, password, fullName) {
    const response = await authAPI.register({ email, password, full_name: fullName });
    persistAuth(response.data);
    setUser(response.data.user);
    setProfile(response.data.profile);
    return response.data;
  }

  async function signOut() {
    localStorage.removeItem(AUTH_TOKEN_KEY);
    localStorage.removeItem(LOCAL_ADMIN_KEY);
    setUser(null);
    setProfile(null);
  }

  const isAdmin = profile?.role === 'admin';

  return (
    <AuthContext.Provider value={{ user, profile, loading, isAdmin, signIn, signInAdmin, signUp, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
