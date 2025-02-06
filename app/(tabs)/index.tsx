import { Image, StyleSheet, Platform } from "react-native";

import { HelloWave } from "@/components/HelloWave";
import ParallaxScrollView from "@/components/ParallaxScrollView";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { Link, Redirect } from "expo-router";
import { useEffect, useState } from "react";
import { getUser } from "@/db/dummyData";
import { User } from "@/db/schema";

export default function HomeScreen() {
  const [user, setUser] = useState<User | undefined>(undefined);
  const [isLoadingUser, setIsLoadingUser] = useState<boolean>(true);
  useEffect(() => {
    async function start() {
      try {
        const user = await getUser();
        setUser(user);
        setIsLoadingUser(false);

        // const response = await fetch("/api/card", {
        //   method: "POST",
        //   body: JSON.stringify({ userId: user?.id! }),
        // });
        // const data = await response.json();
        // setCards(data.cards);
      } catch (e) {
        console.log(e);
        // setFetchCardsErrorMessage(
        //   "Something went wrong: " + (e as Error).message
        // );
      }
    }
    start();
  }, []);

  if (isLoadingUser)
    return (
      <ThemedView>
        <ThemedText>"loading user..."</ThemedText>
      </ThemedView>
    );

  if (!user) return <Redirect href="/(tabs)" />;

  return (
    // <ParallaxScrollView
    //   headerBackgroundColor={{ light: "#A1CEDC", dark: "#1D3D47" }}
    //   headerImage={
    //     <Image
    //       source={require("@/assets/images/partial-react-logo.png")}
    //       style={styles.reactLogo}
    //     />
    //   }
    // >
    <ThemedView>
      <ThemedView>
        <Link
          href="/dashboard"
          style={{
            backgroundColor: "gray",
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
            backgroundColor: "gray",
            borderRadius: 16,
            paddingHorizontal: 8,
            paddingVertical: 2,
            width: 130,
          }}
          // onPress={async () => {
          //   const response = await fetch("/api/greeting");
          //   const data = await response.json();
          //   alert(data.greeting);
          // }}
        >
          <ThemedText>Use as Business</ThemedText>
        </Link>
      </ThemedView>
    </ThemedView>

    // </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  titleContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  stepContainer: {
    gap: 8,
    marginBottom: 8,
  },
  reactLogo: {
    height: 178,
    width: 290,
    bottom: 0,
    left: 0,
    position: "absolute",
  },
});
