import { useSession } from "@/lib/auth-client";
import { User } from "better-auth/types";
import React, { createContext, useContext } from "react";
import { useQuery } from "@tanstack/react-query";
import { getOwnedBusinessIds } from "@/api/businessData";
import { GetOwnedBusinessIdsResponse } from "@/app/api/business/getOwnedBusinessIds+api";

const AuthContext = createContext<{
  user: User | undefined;
  contextLoading: boolean;
  ownedBusinessIds: GetOwnedBusinessIdsResponse | undefined;
}>({
  user: undefined,
  contextLoading: true,
  ownedBusinessIds: undefined,
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { data: session, isPending: isLoadingSession } = useSession();

  const { data: ownedBusinessIds, isLoading: isLoadingOwnedBusinessIds } =
    useQuery({
      queryKey: ["myOwnedBusinessIds"],
      queryFn: getOwnedBusinessIds,
    });

  return React.createElement(
    AuthContext.Provider,
    {
      value: {
        user: session?.user ?? undefined,
        contextLoading: isLoadingOwnedBusinessIds || isLoadingSession,
        ownedBusinessIds: ownedBusinessIds,
      },
    },
    children
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
