import { authClient } from "./auth-client";

export const signInInfo = authClient.signIn.social({
  provider: "google",
  callbackURL: "http://localhost:8081",
  disableRedirect: true,
});
