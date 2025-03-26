import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { AppButton } from "@/components/ui/AppButton";
import { signOut, useSession } from "@/lib/auth-client";
import { useRouter } from "expo-router";
import { Fragment } from "react";
import { ActivityIndicator, Image, StyleSheet } from "react-native";

export default function Page() {
  const router = useRouter();

  const { data: session, isPending } = useSession();

  return (
    <ThemedView style={styles.container}>
      {/* <Image
        source={require("@/assets/images/favicon.png")}
        style={styles.logo}
      /> */}

      <ThemedText style={styles.title}>Let's GetSocial</ThemedText>

      {isPending ? (
        <ActivityIndicator />
      ) : session ? (
        <Fragment>
          <AppButton
            style={styles.customerButton}
            onPress={() => router.push("/customer")}
          >
            I am a Customer
          </AppButton>
          <AppButton onPress={() => router.push("/business")}>
            I am a Business
          </AppButton>
          <AppButton onPress={() => signOut()}>Sign Out</AppButton>
        </Fragment>
      ) : (
        <Fragment>
          <AppButton onPress={() => router.push("/sign-in")}>Sign In</AppButton>
          <AppButton
            style={styles.signUpButton}
            onPress={() => router.push("/sign-up")}
          >
            Sign Up
          </AppButton>
        </Fragment>
      )}
      <AppButton onPress={() => router.push("/customer/chatroom")}>
        Chatroom
      </AppButton>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#1E1E2F",
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 40,
  },
  logo: {
    width: 24,
    height: 20,
    borderRadius: 0,
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
  },
  signUpButton: {
    backgroundColor: "#4A90E2",
  },
  customerButton: {
    backgroundColor: "#4A90E2",
  },
});
