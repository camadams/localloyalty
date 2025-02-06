import { StyleSheet, Pressable } from "react-native";

import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { Link, Redirect } from "expo-router";
import { useEffect, useState } from "react";
import { getUser } from "@/db/dummyData";
import { useSearchParams } from "expo-router/build/hooks";
import { Business, Card, User } from "@/db/schema";
import axios from "axios";
import QRCode from "react-native-qrcode-svg";

// export default function TabTwoScreen() {
//   return "hiii";
// }

export default function TabTwoScreen() {
  const [user, setUser] = useState<User | undefined>(undefined);
  const [isLoadingUser, setIsLoadingUser] = useState<boolean>(true);

  const [business, setBusiness] = useState<Business | undefined>(undefined);
  const [isLoadingBusiness, setIsLoadingBusiness] = useState<boolean>(true);

  const [error, setError] = useState<string | undefined>(undefined);

  useEffect(() => {
    async function start() {
      try {
        const user = await getUser();
        setUser(user);
        setIsLoadingUser(false);

        const response = await fetch("/api/business", {
          method: "POST",
          body: JSON.stringify({ userId: user?.id! }),
        });
        const data = (await response.json()) as Business;
        setBusiness(data);
      } catch (e) {
        console.log(e);
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

  if (!user) return <Redirect href="/" />;

  return (
    <ThemedView>
      {business == undefined ? (
        <ThemedText>Loading business...</ThemedText>
      ) : business == null ? (
        <ThemedText>No business</ThemedText>
      ) : (
        <ThemedView></ThemedView>
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  // cardContainer: {
  //   maxWidth: 400,
  // },
  titleContainer: {
    flexDirection: "column",
    gap: 16,
    padding: 32,
  },
});
