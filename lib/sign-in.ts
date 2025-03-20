import { signIn } from "./auth-client";

export const signInInfo = signIn.social({
  provider: "google",
  callbackURL: "http://localhost:8081",
  disableRedirect: true,
});
