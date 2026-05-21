import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import type { PropsWithChildren } from 'react';
import * as authApi from './authApi';
import type { AuthUser } from './authApi';

type Status = 'loading' | 'signedOut' | 'signedIn';

interface AuthContextValue {
  status: Status;
  user: AuthUser | null;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  confirm: (email: string, code: string) => Promise<void>;
  resendCode: (email: string) => Promise<void>;
  signOut: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: PropsWithChildren): React.ReactElement {
  const [status, setStatus] = useState<Status>('loading');
  const [user, setUser] = useState<AuthUser | null>(null);

  useEffect(() => {
    authApi
      .getSession()
      .then((u) => {
        setUser(u);
        setStatus(u ? 'signedIn' : 'signedOut');
      })
      .catch(() => setStatus('signedOut'));
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    const u = await authApi.signIn(email, password);
    setUser(u);
    setStatus('signedIn');
  }, []);

  const signUp = useCallback(async (email: string, password: string) => {
    await authApi.signUp(email, password);
  }, []);

  const confirm = useCallback(async (email: string, code: string) => {
    await authApi.confirmSignUp(email, code);
  }, []);

  const resendCode = useCallback(async (email: string) => {
    await authApi.resendConfirmationCode(email);
  }, []);

  const signOut = useCallback(() => {
    authApi.signOut();
    setUser(null);
    setStatus('signedOut');
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({ status, user, signIn, signUp, confirm, resendCode, signOut }),
    [status, user, signIn, signUp, confirm, resendCode, signOut],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}
