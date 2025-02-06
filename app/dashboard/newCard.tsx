import { StyleSheet, Pressable } from "react-native";

import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { Redirect } from "expo-router";
import { useEffect, useState } from "react";
import { getUser } from "@/db/dummyData";
import { useSearchParams } from "expo-router/build/hooks";
import { Card, User } from "@/db/schema";
import axios from "axios";
import QRCode from "react-native-qrcode-svg";

// export default function TabTwoScreen() {
//   return "hiii";
// }

export default function NewCard() {
  const [user, setUser] = useState<User | undefined>(undefined);
  const [isLoadingUser, setIsLoadingUser] = useState<boolean>(true);
  const [cards, setCards] = useState<Card[] | undefined>(undefined);
  const params = useSearchParams();

  useEffect(() => {
    getUser().then((user) => {
      setUser(user);
      // console.log(user!.id + " ta");
      setIsLoadingUser(false);
      fetch("http://localhost:8081/api/card", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userId: user?.id! }),
      }).then((response) => {
        const dataa = response.json().then((data) => {
          setCards(data);
        });
        // console.log({ dataa });
        // const data = dataa.cards as Card[];
        // setCards(data);
      });
      // axios
      //   .post("http://localhost:8081/api/card", { userId: user?.id! })
      //   .then((response) => {
      //     const data = response.data.cards as Card[];
      //     setCards(data);
      //   });
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
      <ThemedView>
        <Pressable
          style={{
            backgroundColor: "gray",
            borderRadius: 16,
            paddingHorizontal: 10,
            paddingVertical: 5,
            width: 200,
          }}
          onPress={async () => {
            const response = await fetch("/api/test");
            const data = await response.json();
            alert(data.greeting);
          }}
        >
          <ThemedText>Add new card</ThemedText>
        </Pressable>
      </ThemedView>
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

function CardComponent({ card }: { card: Card }) {
  return (
    // <ThemedView style={styles.cardContainer}>
    <ThemedView
      style={{
        maxWidth: 400,
        backgroundColor: "gray",
        borderRadius: 16,
        padding: 16,
      }}
    >
      <ThemedText>{card.name}</ThemedText>
      <ThemedView style={{ flexDirection: "row" }}>
        <ThemedView style={{ backgroundColor: "gray", flexDirection: "row" }}>
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
            backgroundColor: "gray",
          }}
        >
          <QRCode
            value="https://localloyalty.expo.app/incrementPoints?cardId=1"
            backgroundColor="gray"
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
