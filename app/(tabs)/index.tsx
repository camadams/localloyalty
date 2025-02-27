import { Image, StyleSheet, Platform, Button } from "react-native";

import { HelloWave } from "@/components/HelloWave";
import ParallaxScrollView from "@/components/ParallaxScrollView";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { Link, Redirect } from "expo-router";
import { useEffect, useState } from "react";
import { getUser } from "@/db/dummyData";
import { User } from "@/db/schema";
import { authClient } from "@/lib/auth-client";

export default function HomeScreen() {
  const [user, setUser] = useState<User | undefined>(undefined);
  const [isLoadingUser, setIsLoadingUser] = useState<boolean>(true);
  const { data: session } = authClient.useSession();

  useEffect(() => {
    async function start() {
      try {
        const user = await getUser();
        setUser(user);
        setIsLoadingUser(false);
      } catch (e) {
        console.log(e);
      }
    }
    start();
  }, []);

  const handleLogin = async () => {
    console.log("55222345");
    await authClient.email({
      provider: "google",
      callbackURL: "/", // this will be converted to a deep link (eg. `myapp://dashboard`) on native
    });
  };

  if (isLoadingUser)
    return (
      <ThemedView>
        <ThemedText>"loading user..."</ThemedText>
      </ThemedView>
    );

  if (!user) return <Redirect href="/(tabs)" />;

  return (
    <ThemedView>
      <Button title="Login with Google" onPress={handleLogin} />
      <ThemedText>{JSON.stringify(session, null, 2)}</ThemedText>
      <ThemedView>
        <Link
          href="/customer"
          style={{
            backgroundColor: "slategray",
            borderRadius: 16,
            paddingHorizontal: 8,
            paddingVertical: 2,
            width: 140,
          }}
          // onPress={async () => {
          //   const response = await fetch("/api/greeting");
          //   const data = await response.json();
          //   alert(data.greeting);
          // }}
        >
          <ThemedText>Use as Customer</ThemedText>
        </Link>
      </ThemedView>

      <ThemedView>
        <Link
          href="/business"
          style={{
            backgroundColor: "slategray",
            borderRadius: 16,
            paddingHorizontal: 8,
            paddingVertical: 2,
            width: 130,
          }}
        >
          <ThemedText>Use as Business</ThemedText>
        </Link>
      </ThemedView>
    </ThemedView>
  );
}
