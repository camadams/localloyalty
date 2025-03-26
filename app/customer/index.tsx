import { ActivityIndicator, StyleSheet, View } from "react-native";

import { ThemedText } from "@/components/ThemedText";
import { Fragment, useEffect, useState } from "react";
import QRCode from "react-native-qrcode-svg";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getCardsInUse } from "@/api/customerCards";
import { useAuth } from "@/hooks/useAuth";
import supabase from "@/lib/supabase";
import { UsersCardResponse } from "../api/customer/card+api";

export default function TabTwoScreen() {
  const { user, isPending: isPendingSession } = useAuth();
  const {
    data: usersCards,
    isLoading: isLoadingCardsInUse,
    isRefetching,
  } = useQuery({
    queryKey: ["cardsInUse"],
    queryFn: () => getCardsInUse(user?.id ?? ""),
  });

  if (isPendingSession) return <ActivityIndicator />;

  console.log({ usersCards, love: 3 });
  return (
    <View style={styles.titleContainer}>
      {isLoadingCardsInUse ? (
        <Fragment>
          <ThemedText>Loading cards...</ThemedText>
          <ActivityIndicator />
        </Fragment>
      ) : !usersCards ? (
        <ThemedText>No cards available</ThemedText>
      ) : (
        <Fragment>
          {usersCards.map((usersCard, i) => (
            <UsersCard key={i} usersCard={usersCard} />
          ))}
        </Fragment>
      )}
      {isRefetching && <ActivityIndicator />}
    </View>
  );
}

export function UsersCard({ usersCard }: { usersCard: UsersCardResponse }) {
  return (
    <View style={styles.cardContainer}>
      {/* <View
      style={{
        width: 360,
        backgroundColor: "slategray",
        borderRadius: 16,
        padding: 16,
      }}
    > */}
      <ThemedText>{usersCard.loyaltyCard.businessName}</ThemedText>
      <ThemedText>{usersCard.loyaltyCard.description}</ThemedText>
      <View style={styles.rowContainer}>
        <View style={styles.pointsContainer}>
          {[...Array(usersCard.loyaltyCard.maxPoints)].map((_, i) => (
            <ThemedText key={i}>
              {i < (usersCard.points ?? 0) ? "✅" : "⚫"}
            </ThemedText>
          ))}
        </View>
        {/* <View style={styles.qrCodeContainer}>
          <QRCode
            value="https://localloyalty.expo.app/incrementPoints?cardId=1"
            backgroundColor="slategray"
          />
        </View> */}
      </View>

      {/* <ThemedText style={{display:"none"}}>{card.points}</ThemedText> */}
    </View>
  );
}

const styles = StyleSheet.create({
  cardContainer: {
    // width: ,
    backgroundColor: "slategray",
    borderRadius: 16,
    padding: 16,
  },
  rowContainer: {
    flexDirection: "row",
  },
  pointsContainer: {
    backgroundColor: "slategray",
    flexDirection: "row",
  },
  qrCodeContainer: {
    alignItems: "center",
    justifyContent: "center",
    flex: 1,
    width: 100,
    height: 100,
    backgroundColor: "slategray",
  },
  titleContainer: {
    flexDirection: "column",
    gap: 16,
    padding: 32,
  },
});
