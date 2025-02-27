import { createAuthClient } from "better-auth/react";
import { expoClient } from "@better-auth/expo/client";
import * as SecureStore from "expo-secure-store";
export const authClient = createAuthClient({
  baseURL: "http://localhost:8081", // the base url of your auth server
  disableDefaultFetchPlugins: true,
  plugins: [
    expoClient({
      scheme: "myapp",
      storage: SecureStore,
      storagePrefix: "myapp",
    }),
  ],
});
