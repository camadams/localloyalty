import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { AppButton } from "@/components/ui/AppButton";
import { signUp } from "@/lib/auth-client";
import { useRouter } from "expo-router";
import { useState } from "react";
import { StyleSheet, TextInput, View } from "react-native";

export default function Page() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [requestSent, setRequestSent] = useState(false);
  async function handleSignUp() {
    const { data, error } = await signUp.email(
      {
        email, // user email address
        password, // user password -> min 8 characters by default
        name: "dfsjo", // user image url (optional)
        callbackURL: "https://4xx1vmc-camadams-8081.exp.direct/(tabs)", // a url to redirect to after the user verifies their email (optional)
      },
      {
        onRequest: (ctx) => {
          setRequestSent(true);
        },
        onSuccess: (ctx) => {
          //redirect to the dashboard or sign in page
          router.push("/(tabs)");
        },
        onError: (ctx) => {
          // display the error message
          alert(ctx.error.message);
          setRequestSent(false);
        },
      }
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.form}>
        <View style={styles.field}>
          <ThemedText style={styles.label}>Email</ThemedText>
          <TextInput
            autoCapitalize="none"
            value={email}
            style={styles.input}
            onChangeText={setEmail}
          />
        </View>

        <View style={styles.field}>
          <ThemedText style={styles.label}>Password</ThemedText>
          <TextInput
            value={password}
            style={styles.input}
            autoCapitalize="none"
            onChangeText={setPassword}
            secureTextEntry
          />
        </View>

        <AppButton onPress={handleSignUp} disabled={requestSent}>
          Sign Up
        </AppButton>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#15152F",
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 12,
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
  },
  field: {
    gap: 12,
  },
  label: {
    fontSize: 16,
    textAlign: "left",
  },
  form: {
    gap: 24,
    width: "80%",
  },
  input: {
    backgroundColor: "#FFFFFF",
    padding: 12,
    borderRadius: 8,
    fontSize: 16,
    color: "#000000",
    borderWidth: 1,
    borderColor: "#CCCCCC",
  },
});
