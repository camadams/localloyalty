import { useSession } from "@/lib/auth-client";
import { User } from "better-auth/types";
import React, { createContext, useContext } from "react";

interface AuthContextType {
  user: User | undefined;
  isPending: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: undefined,
  isPending: true,
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { data: session, isPending } = useSession();

  return React.createElement(
    AuthContext.Provider,
    { value: { user: session?.user ?? undefined, isPending } },
    children
  );
}

export function useAuth() {
  const { user, isPending } = useContext(AuthContext);

  return { user, isLoggedIn: !!user, isPending };
}
