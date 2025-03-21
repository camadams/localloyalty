import {
  StyleSheet,
  Image,
  Platform,
  Text,
  Button,
  Pressable,
} from "react-native";

import { Collapsible } from "@/components/Collapsible";
import { ExternalLink } from "@/components/ExternalLink";
import ParallaxScrollView from "@/components/ParallaxScrollView";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { IconSymbol } from "@/components/ui/IconSymbol";
import { Redirect, useFocusEffect } from "expo-router";
import { useEffect, useState } from "react";
import { getUser } from "@/db/dummyData";
import { useSearchParams } from "expo-router/build/hooks";
import { Card, User } from "@/db/schema";
import axios from "axios";
import QRCode from "react-native-qrcode-svg";

// export default function TabTwoScreen() {
//   return "hiii";
// }

export default function TabTwoScreen() {
  const [user, setUser] = useState<User | undefined>(undefined);
  const [isLoadingUser, setIsLoadingUser] = useState<boolean>(true);
  const [cards, setCards] = useState<Card[] | undefined>(undefined);
  const params = useSearchParams();

  useEffect(() => {
    getUser().then((user) => {
      setUser(user);
      // console.log(user!.id + " ta");
      setIsLoadingUser(false);
      // axios.post("/api/card", { userId: user?.id! }).then((response) => {
      //   const data = response.data.cards as LoyaltyCard[];
      //   setCards(data);
      // });
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
      <ThemedText type="title">Cards</ThemedText>
      <Pressable
        onPress={async () => {
          const response = await fetch("/api/greeting");
          const data = await response.json();
          alert(data.greeting);
        }}
      >
        <ThemedText>Test APi</ThemedText>
      </Pressable>
      {cards == undefined ? (
        <ThemedText>Loading cards...</ThemedText>
      ) : cards.length === 0 ? (
        <ThemedText>No cards</ThemedText>
      ) : (
        cards.map((card, i) => <CardComponent key={i} card={card} />)
      )}
      <ThemedText>{params.get("shopId")}</ThemedText>
    </ThemedView>
  );
}

function CardComponent({ card }: { card: Card & { points?: number } }) {
  return (
    // <ThemedView style={styles.cardContainer}>
    <ThemedView
      style={{
        maxWidth: 400,
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
