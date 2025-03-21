import { signIn } from "./auth-client";

export const signInInfo = signIn.social({
  provider: "google",
  callbackURL: "https://4xx1vmc-camadams-8081.exp.direct",
  disableRedirect: true,
});
