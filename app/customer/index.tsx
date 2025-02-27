import { StyleSheet } from "react-native";

import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { Link, Redirect } from "expo-router";
import { useEffect, useState } from "react";
import { getUser } from "@/db/dummyData";
import { useSearchParams } from "expo-router/build/hooks";
import { LoyaltyCard, User } from "@/db/schema";
import QRCode from "react-native-qrcode-svg";
import { btnStyle } from "@/constants/Colors";

// export default function TabTwoScreen() {
//   return "hiii";
// }

export default function TabTwoScreen() {
  const [user, setUser] = useState<User | undefined>(undefined);
  const [isLoadingUser, setIsLoadingUser] = useState<boolean>(true);
  const [cards, setCards] = useState<LoyaltyCard[] | undefined>(undefined);
  const params = useSearchParams();

  const [fetchCardsErrorMessage, setFetchCardsErrorMessage] = useState<
    string | undefined
  >(undefined);

  useEffect(() => {
    async function start() {
      try {
        const user = await getUser();
        setUser(user);
        setIsLoadingUser(false);

        const response = await fetch("/api/card", {
          method: "POST",
          body: JSON.stringify({ userId: user?.id! }),
        });
        const data = await response.json();
        setCards(data.cards);
      } catch (e) {
        console.log(e);
        setFetchCardsErrorMessage(
          "Something went wrong: " + (e as Error).message
        );
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

  // if (!cards) return "loading cards..";

  // if (cards.length === 0) return "no cards";
  return (
    <ThemedView style={styles.titleContainer}>
      <ThemedView>
        <Link href="/customer/newCard" style={btnStyle}>
          <ThemedText>Add new card</ThemedText>
        </Link>
      </ThemedView>
      {cards == undefined ? (
        <ThemedText>Loading cards...</ThemedText>
      ) : cards.length === 0 ? (
        <ThemedText>No cards</ThemedText>
      ) : (
        cards.map((card, i) => <CardComponent key={i} card={card} />)
      )}
      <ThemedText style={{ color: "red" }}>{fetchCardsErrorMessage}</ThemedText>
    </ThemedView>
  );
}

export type LoyaltyCardWithPoints = LoyaltyCard & { points?: number };

export function CardComponent({ card }: { card: LoyaltyCardWithPoints }) {
  return (
    // <ThemedView style={styles.cardContainer}>
    <ThemedView
      style={{
        width: 360,
        backgroundColor: "slategray",
        borderRadius: 16,
        padding: 16,
      }}
    >
      <ThemedText>{card.description}</ThemedText>
      <ThemedView style={{ flexDirection: "row" }}>
        <ThemedView
          style={{ backgroundColor: "slategray", flexDirection: "row" }}
        >
          {[...Array(card.maxPoints)].map((_, i) => (
            <ThemedText key={i}>
              {i < (card.points ?? 0) ? "✅" : "⚫"}
            </ThemedText>
          ))}
        </ThemedView>
        <ThemedView
          style={{
            alignItems: "center",
            justifyContent: "center",
            flex: 1,
            width: 100,
            height: 100,
            backgroundColor: "slategray",
          }}
        >
          <QRCode
            value="https://localloyalty.expo.app/incrementPoints?cardId=1"
            backgroundColor="slategray"
          />
        </ThemedView>
      </ThemedView>

      {/* <ThemedText style={{display:"none"}}>{card.points}</ThemedText> */}
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
