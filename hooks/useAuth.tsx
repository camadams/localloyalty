import { useSession } from "@/lib/auth-client";
import { User } from "better-auth/types";
import React, { createContext, useContext } from "react";

const AuthContext = createContext<{
  user: User | undefined;
  isPending: boolean;
}>({
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
  // console.log(user, isPending);

  return { user, isLoggedIn: !!user, isPending };
}
