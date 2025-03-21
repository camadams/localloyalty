import { signIn } from "@/lib/auth-client";
import { Button } from "react-native";

export default function App() {
  const handleLogin = async () => {
    await signIn.social({
      provider: "google",
      callbackURL: "/", // this will be converted to a deep link (eg. `myapp://dashboard`) on native
    });
  };
  return <Button title="Login with Google" onPress={handleLogin} />;
}
