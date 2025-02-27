import { StyleSheet } from "react-native";

import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { Redirect } from "expo-router";
import { useEffect, useState } from "react";
import { getUser } from "@/db/dummyData";
import { useLocalSearchParams } from "expo-router/build/hooks";
import { User } from "@/db/schema";

// export default function TabTwoScreen() {
//   return "hiii";
// }

export default function NewCard() {
  const [user, setUser] = useState<User | undefined>(undefined);
  const [isLoadingUser, setIsLoadingUser] = useState<boolean>(true);
  const [
    isPendingAPIResponseForCreatingNewCard,
    setIsPendingAPIResponseForCreatingNewCard,
  ] = useState<boolean>(false);

  const { businessId } = useLocalSearchParams<{ businessId?: string }>();

  useEffect(() => {
    async function start() {
      try {
        const user = await getUser();
        setUser(user);
        setIsLoadingUser(false);

        console.log({ businessId });
        if (!businessId) {
          return;
        }
        setIsPendingAPIResponseForCreatingNewCard(true);
        const card = await fetch("/api/newCard", {
          method: "POST",
          body: JSON.stringify({ businessId }),
        });
        const data = await card.json();
        setIsPendingAPIResponseForCreatingNewCard(false);
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

  if (!user) return <Redirect href="/(tabs)" />;

  return (
    <ThemedView style={styles.titleContainer}>
      {!isPendingAPIResponseForCreatingNewCard ? (
        <ThemedText>
          No business id found in URL. You need to can a businesses QR code to
          add a Loyalty Card
        </ThemedText>
      ) : (
        <ThemedText>"redirecting..."</ThemedText>
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
