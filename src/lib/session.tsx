/**
 * Holds the signed-in username for the current app session.
 *
 * This replaces the old web app's localStorage-based identity. For Task 1 the
 * username lives in memory only; persisting it across app restarts (e.g. with
 * expo-secure-store) is a deliberately separate, future step.
 */
import { createContext, useContext, useMemo, useState, type ReactNode } from 'react';

type SessionValue = {
  username: string | null;
  signIn: (username: string) => void;
  signOut: () => void;
};

const SessionContext = createContext<SessionValue | undefined>(undefined);

export function SessionProvider({ children }: { children: ReactNode }) {
  const [username, setUsername] = useState<string | null>(null);

  const value = useMemo<SessionValue>(
    () => ({
      username,
      signIn: (name: string) => setUsername(name),
      signOut: () => setUsername(null),
    }),
    [username],
  );

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}

export function useSession() {
  const ctx = useContext(SessionContext);
  if (!ctx) {
    throw new Error('useSession must be used within a SessionProvider');
  }
  return ctx;
}
