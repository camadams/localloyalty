import { ActivityIndicator, StyleSheet, View } from "react-native";

import { ThemedText } from "@/components/ThemedText";
import { Link, Redirect } from "expo-router";
import { useEffect, useState } from "react";
import { getUser } from "@/db/dummyData";
import { Card, User } from "@/db/schema";
import QRCode from "react-native-qrcode-svg";
import { btnStyle } from "@/constants/Colors";
import { useQuery } from "@tanstack/react-query";
import { getCardsInUse } from "@/api/customerCards";
import { useSession } from "@/lib/auth-client";

export default function TabTwoScreen() {
  const { data: session, isPending, error } = useSession();

  const { data: cardsInUse } = useQuery({
    queryKey: ["cardsInUse"],
    queryFn: () => getCardsInUse(session?.user.id ?? ""),
  });

  if (isPending) return <ActivityIndicator />;

  return (
    <View style={styles.titleContainer}>
      {cardsInUse == undefined ? (
        <ThemedText>Loading cardsInUse...</ThemedText>
      ) : cardsInUse.length === 0 ? (
        <ThemedText>No cardsInUse</ThemedText>
      ) : (
        // cardsInUse.map((card, i) => <CardComponent key={i} card={card} />)
        <ThemedText>{JSON.stringify(cardsInUse)}</ThemedText>
      )}
      {/* <ThemedText style={{ color: "red" }}>{fetchcardsInUseErrorMessage}</ThemedText> */}
    </View>
  );
}

export type LoyaltyCardWithPoints = Card & { points?: number };

export function CardComponent({ card }: { card: LoyaltyCardWithPoints }) {
  return (
    // <View style={styles.cardContainer}>
    <View
      style={{
        width: 360,
        backgroundColor: "slategray",
        borderRadius: 16,
        padding: 16,
      }}
    >
      <ThemedText>{card.description}</ThemedText>
      <View style={{ flexDirection: "row" }}>
        <View style={{ backgroundColor: "slategray", flexDirection: "row" }}>
          {[...Array(card.maxPoints)].map((_, i) => (
            <ThemedText key={i}>
              {i < (card.points ?? 0) ? "✅" : "⚫"}
            </ThemedText>
          ))}
        </View>
        <View
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
        </View>
      </View>

      {/* <ThemedText style={{display:"none"}}>{card.points}</ThemedText> */}
    </View>
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
