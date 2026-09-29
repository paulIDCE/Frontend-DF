import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { Session, User } from "@supabase/supabase-js";
import { getSupabase, supabaseDisponible } from "@/auth/supabase";
import { devError } from "@idce/kit";

/**
 * Sesion de la app (login propio, no la del SSO host).
 *
 * Envuelve Supabase Auth con la misma semantica que tenia prueba-data
 * (`script.js`): login por correo, registro con `username` en metadata y
 * recuperacion por correo.
 */

interface AuthContextValue {
  session: Session | null;
  user: User | null;
  /** `user_metadata.username` o, si no hay, el correo. */
  username: string;
  cargando: boolean;
  signIn: (email: string, password: string) => Promise<User>;
  signUp: (username: string, email: string, password: string) => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

const nombreDe = (user: User | null): string =>
  (user?.user_metadata?.username as string | undefined) || user?.email || "";

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [session, setSession] = useState<Session | null>(null);
  // Sin cliente (routes.json incompleto) no hay nada que esperar: falla cerrado.
  const [cargando, setCargando] = useState(supabaseDisponible);

  useEffect(() => {
    if (!supabaseDisponible()) {
      devError("[auth] Supabase no inicializado: revisar /config/routes.json");
      return;
    }
    const supabase = getSupabase();

    supabase.auth
      .getSession()
      .then(({ data }) => setSession(data.session))
      .finally(() => setCargando(false));

    const { data } = supabase.auth.onAuthStateChange((_evento, nueva) =>
      setSession(nueva)
    );
    return () => data.subscription.unsubscribe();
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    const { data, error } = await getSupabase().auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw error;
    return data.user;
  }, []);

  const signUp = useCallback(
    async (username: string, email: string, password: string) => {
      const { error } = await getSupabase().auth.signUp({
        email,
        password,
        options: { data: { username } },
      });
      if (error) throw error;
    },
    []
  );

  const resetPassword = useCallback(async (email: string) => {
    const { error } = await getSupabase().auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/login`,
    });
    if (error) throw error;
  }, []);

  const signOut = useCallback(async () => {
    await getSupabase().auth.signOut();
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      session,
      user: session?.user ?? null,
      username: nombreDe(session?.user ?? null),
      cargando,
      signIn,
      signUp,
      resetPassword,
      signOut,
    }),
    [session, cargando, signIn, signUp, resetPassword, signOut]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = (): AuthContextValue => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
};
