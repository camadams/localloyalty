import { createAuthClient } from "better-auth/react";
import { expoClient } from "@better-auth/expo/client";
import { secureSave, secureGet } from "./storage";

export const { useSession, signIn, signUp, signOut, getCookie } =
  createAuthClient({
    // baseURL: "http://localhost:8081", // the base url of your auth server
    disableDefaultFetchPlugins: true,
    plugins: [
      expoClient({
        scheme: "myapp",
        storage: {
          getItem: (key: string) => secureGet(key),
          setItem: (key: string, value: string) => secureSave(key, value),
        },
        storagePrefix: "myapp",
      }),
    ],
  });
