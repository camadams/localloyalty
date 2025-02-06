import { StyleSheet } from "react-native";

import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { Redirect } from "expo-router";
import { useEffect, useState } from "react";
import { getUser } from "@/db/dummyData";
import { useSearchParams } from "expo-router/build/hooks";
import { User } from "@/db/schema";
import axios from "axios";

// export default function TabTwoScreen() {
//   return "hiii";
// }

export default function TabTwoScreen() {
  const [user, setUser] = useState<User | undefined>(undefined);
  const [isLoadingUser, setIsLoadingUser] = useState<boolean>(true);
  const [isIncrementingPoints, setIsIncrementingPoints] =
    useState<boolean>(false);

  const [message, setMessage] = useState<string | undefined>(undefined);
  const params = useSearchParams();

  useEffect(() => {
    getUser().then((user) => {
      setUser(user);
      setIsLoadingUser(false);
    });
    const cardId = params.get("cardId") || "1";
    setIsIncrementingPoints(true);
    console.log({ cardId });
    axios.post("/api/incrementPoints", { cardId: cardId }).then((response) => {
      const message = response.data.message as string;
      setIsIncrementingPoints(false);
      setMessage(message);
    });
    // getCards(user?.id!).then((data) => setCards(data));
  }, []);

  if (isLoadingUser)
    return (
      <ThemedView>
        <ThemedText>"loading user..."</ThemedText>
      </ThemedView>
    );

  if (!user) return <Redirect href="/(tabs)" />;

  // if (!cards) return "loading cards..";

  // if (cards.length === 0) return "no cards";
  return (
    <ThemedView style={styles.titleContainer}>
      <ThemedText>
        {isIncrementingPoints
          ? "Incrementing Points..."
          : message ?? "no message, error occured"}
      </ThemedText>
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
