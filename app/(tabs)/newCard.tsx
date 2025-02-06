import { StyleSheet, Image, Platform, Text } from "react-native";

import { Collapsible } from "@/components/Collapsible";
import { ExternalLink } from "@/components/ExternalLink";
import ParallaxScrollView from "@/components/ParallaxScrollView";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { IconSymbol } from "@/components/ui/IconSymbol";
import { Redirect, useFocusEffect } from "expo-router";
import { useEffect, useState } from "react";
import { createCard, getUser } from "@/db/dummyData";
import { useSearchParams } from "expo-router/build/hooks";
import { User } from "@/db/schema";

export default function TabTwoScreen() {
  const [user, setUser] = useState<User | undefined>(undefined);
  const [isLoadingUser, setIsLoadingUser] = useState<boolean>(true);
  const [isAddingCard, setIsAddingCard] = useState<boolean>(false);
  const [redirect, setRedirect] = useState<boolean>(false);
  const params = useSearchParams();

  useEffect(() => {
    async function start() {
      try {
        const user = await getUser();
        setUser(user);
        setIsLoadingUser(false);
        const shopId = params.get("shopId") as string;
        setIsAddingCard(true);
        const card = await createCard({ shopId, userId: user?.id! });
        setIsAddingCard(false);
        if (card.success) {
          setTimeout(() => {
            return setRedirect(true);
          }, 500);
        }
      } catch (e) {
        console.log(e);
      }
    }
    start();
  }, []);

  if (redirect) return <Redirect href="/(tabs)/viewCards" />;

  if (isLoadingUser)
    return (
      <ThemedView style={styles.titleContainer}>
        <ThemedText>Loading User...</ThemedText>
      </ThemedView>
    );

  if (!user) return <Redirect href="/(tabs)" />;

  return (
    <ThemedView style={styles.titleContainer}>
      <ThemedText>
        {isAddingCard ? "Adding card..." : "Redirecting..."}
      </ThemedText>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  titleContainer: {
    flexDirection: "column",
    gap: 16,
    padding: 32,
  },
});
