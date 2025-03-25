import { ActivityIndicator, StyleSheet, View } from "react-native";
import { ThemedText } from "@/components/ThemedText";
import { Fragment, useEffect, useState } from "react";
import QRCode from "react-native-qrcode-svg";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getCardsInUse } from "@/api/customerCards";
import { useAuth } from "@/hooks/useAuth";
import supabase from "@/lib/supabase";
import { UsersCardResponse } from "../api/customer/card+api";
import { createWebSocketClient } from "@/lib/wsClient";
import { AppButton } from "@/components/ui/AppButton";

export default function TabTwoScreen() {
  const { user, isPending: isPendingSession } = useAuth();
  const queryClient = useQueryClient();
  const [wsCards, setWsCards] = useState<UsersCardResponse[] | null>(null);

  const { data: usersCards, isLoading: isLoadingCardsInUse } = useQuery({
    queryKey: ["cardsInUse"],
    queryFn: () => getCardsInUse(user?.id ?? ""),
  });

  useEffect(() => {
    const channel = supabase
      .channel("realtime users_loyalty_cards")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "users_loyalty_cards",
        },
        (payload) => {
          if (payload.eventType === "INSERT") {
          }
          if (payload.eventType === "UPDATE") {
          }
          queryClient.invalidateQueries({ queryKey: ["cardsInUse"] });

          // console.log(payload);
        }
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase, queryClient]);

  useEffect(() => {
    if (!user?.id) return;

    // Use a URL that's accessible from your iOS device
    // For local development, you can use your computer's IP address instead of localhost
    // Example: 'ws://192.168.1.100:8080' - replace with your actual IP address
    const wsClient = createWebSocketClient("wss://echo.websocket.org");

    // For testing purposes, we're using a public WebSocket echo server
    // In production, you would use your own WebSocket server
    const client = wsClient.connect(user.id);
    const ws = client.getWebSocket();

    if (!ws) {
      console.error("Failed to create WebSocket connection");
      return;
    }
    console.log(ws);
    ws.onmessage = (event) => {
      try {
        const data = event.data;
        console.log(data);

        if (
          data.type === "initial_data" ||
          data.type === "card_data" ||
          data.type === "card_update"
        ) {
          setWsCards(data.cards);
        }

        if (data.type === "refresh_data") {
          console.log(
            "Received refresh signal from server, invalidating queries"
          );
          queryClient.invalidateQueries({ queryKey: ["cardsInUse"] });
        }

        if (data.type === "error") {
          console.error("WebSocket error:", data.message);
        }
      } catch (error) {
        console.error("Error parsing WebSocket message:", error);
      }
    };

    return () => {
      client.close();
    };
  }, [user?.id, queryClient]);

  const displayCards = wsCards || usersCards;
  const isLoading = isPendingSession || (isLoadingCardsInUse && !wsCards);

  if (isPendingSession) return <ActivityIndicator />;

  // console.log({ usersCards, love: 3 });
  return (
    <View style={styles.titleContainer}>
      {isLoading ? (
        <Fragment>
          <ThemedText>Loading cards...</ThemedText>
          <ActivityIndicator />
        </Fragment>
      ) : !displayCards ? (
        <ThemedText>No cards available</ThemedText>
      ) : (
        <Fragment>
          <ThemedText>{displayCards[0]?.points || 0} points</ThemedText>
          {displayCards.map((usersCard, i) => (
            <UsersCard key={i} usersCard={usersCard} />
          ))}
        </Fragment>
      )}
    </View>
  );
}

export function UsersCard({ usersCard }: { usersCard: UsersCardResponse }) {
  return (
    <View style={styles.cardContainer}>
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
        <View style={styles.qrCodeContainer}>
          <QRCode
            value="https://localloyalty.expo.app/incrementPoints?cardId=1"
            backgroundColor="slategray"
          />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  cardContainer: {
    width: 360,
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
