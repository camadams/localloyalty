import {
  ActivityIndicator,
  StyleSheet,
  View,
  TouchableOpacity,
  Dimensions,
} from "react-native";

import { ThemedText } from "@/components/ThemedText";
import { Link, Redirect, useRouter } from "expo-router";
import { useGlobalSearchParams } from "expo-router/build/hooks";
import { Card } from "@/db/schema";
import React, { Fragment, useCallback, useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { getBusinessLoyaltyCards } from "@/api/businessData";
import { IconSymbol } from "@/components/ui/IconSymbol";
import { useFocusEffect } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";
import QRCode from "react-native-qrcode-svg";

const { width } = Dimensions.get("window");

export default function LoyaltyCardsScreen() {
  const router = useRouter();
  const { businessId } = useGlobalSearchParams<{ businessId: string }>();
  const { user, isPending: isPendingAuth } = useAuth();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Fetch loyalty cards for this business
  const {
    data: loyaltyCards,
    isLoading: isLoadingCards,
    isRefetching,
    refetch,
    error,
  } = useQuery({
    queryKey: ["businessLoyaltyCards", businessId],
    queryFn: () => {
      return getBusinessLoyaltyCards(Number(businessId));
    },
  });

  useFocusEffect(
    useCallback(() => {
      if (user?.id) {
        refetch();
      }
    }, [user?.id, refetch])
  );

  const handleAddLoyaltyCard = () => {
    router.push({
      pathname: "/business/[businessId]/newLoyaltyCard",
      params: { businessId },
    });
  };

  if (isPendingAuth) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#1e3a29" />
      </View>
    );
  }

  if (!user) return <Redirect href="/(tabs)" />;

  return (
    <View style={styles.container}>
      {/* Header with title and add button */}
      <View style={styles.headerContainer}>
        {/* <ThemedText style={styles.headerTitle}>Loyalty Cards</ThemedText> */}

        <Link
          href={{
            pathname: "/business/[businessId]/newLoyaltyCard",
            params: { businessId },
          }}
          asChild
        >
          <TouchableOpacity
            style={styles.addButton}
            onPress={handleAddLoyaltyCard}
          >
            <IconSymbol name="plus" size={16} color="white" />
            <ThemedText style={styles.addButtonText}>Add Card</ThemedText>
          </TouchableOpacity>
        </Link>
      </View>

      {/* Loading state */}
      {isLoadingCards ? (
        <View style={styles.contentContainer}>
          <ActivityIndicator size="large" color="#1e3a29" />
          <ThemedText style={styles.messageText}>
            Loading loyalty cards...
          </ThemedText>
        </View>
      ) : error ? (
        <View style={styles.contentContainer}>
          <IconSymbol
            name="exclamationmark.triangle"
            size={48}
            color="#F44336"
          />
          <ThemedText style={[styles.messageText, { color: "#F44336" }]}>
            {error.message}
          </ThemedText>
        </View>
      ) : !loyaltyCards || loyaltyCards.length === 0 ? (
        <View style={styles.contentContainer}>
          <IconSymbol name="creditcard" size={48} color="#444" />
          <ThemedText style={styles.messageText}>
            No loyalty cards created yet
          </ThemedText>
          <TouchableOpacity
            style={styles.createButton}
            onPress={handleAddLoyaltyCard}
          >
            <ThemedText style={styles.createButtonText}>
              Create Your First Card
            </ThemedText>
          </TouchableOpacity>
        </View>
      ) : (
        <Fragment>
          <View style={styles.cardsContainer}>
            {loyaltyCards.map((card: Card) => (
              <LoyaltyCardComponent key={card.id} card={card} />
            ))}
          </View>
        </Fragment>
      )}

      {/* Refetching indicator */}
      {isRefetching && (
        <View style={styles.refetchingContainer}>
          <ActivityIndicator size="small" color="#1e3a29" />
          <ThemedText style={styles.refetchingText}>Updating...</ThemedText>
        </View>
      )}
    </View>
  );
}

function LoyaltyCardComponent({ card }: { card: Card }) {
  // Add state for timestamp and QR code value
  const [timestamp, setTimestamp] = useState<number>(Date.now());
  const [qrValue, setQrValue] = useState<string>(
    `https://localloyalty.expo.app/business?loyaltyCardId=${card.id}&timestamp=${timestamp}`
  );

  // Update timestamp and QR code every 10 seconds
  useEffect(() => {
    const intervalId = setInterval(() => {
      const newTimestamp = Date.now();
      setTimestamp(newTimestamp);
      const newQrValue = `https://localloyalty.expo.app/business?loyaltyCardId=${card.id}&timestamp=${newTimestamp}`;
      setQrValue(newQrValue);
    }, 10000); // 10 seconds

    return () => clearInterval(intervalId); // Cleanup on unmount
  }, [card.id]);

  return (
    <View style={styles.cardContainer}>
      <View style={styles.cardContent}>
        {/* Left side - Card information */}
        <View style={styles.cardInfo}>
          <ThemedText style={styles.cardTitle}>{card.description}</ThemedText>

          <View style={styles.cardDetail}>
            <IconSymbol name="star" size={16} color="#ccc" />
            <ThemedText style={styles.detailText}>
              {card.maxPoints} points to earn reward
            </ThemedText>
          </View>

          <View style={styles.cardDetail}>
            <IconSymbol
              name={
                card.status === "active" ? "checkmark.circle" : "xmark.circle"
              }
              size={16}
              color={card.status === "active" ? "#4CAF50" : "#F44336"}
            />
            <ThemedText
              style={[
                styles.detailText,
                {
                  color: card.status === "active" ? "#4CAF50" : "#F44336",
                },
              ]}
            >
              {card.status.charAt(0).toUpperCase() + card.status.slice(1)}
            </ThemedText>
          </View>

          {card.artworkUrl && (
            <View style={styles.cardDetail}>
              <IconSymbol name="photo" size={16} color="#ccc" />
              <ThemedText style={styles.detailText}>Custom artwork</ThemedText>
            </View>
          )}

          <TouchableOpacity style={styles.editButton}>
            <IconSymbol name="pencil" size={14} color="#ccc" />
            <ThemedText style={styles.editButtonText}>Edit</ThemedText>
          </TouchableOpacity>
        </View>

        {/* Right side - QR Code */}
        <View style={styles.qrCodeContainer}>
          <QRCode
            value={qrValue}
            size={140}
            color="#000"
            backgroundColor="#fff"
          />
          <ThemedText style={styles.qrCodeText}>Scan to add points</ThemedText>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#0a0a0a",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#0a0a0a",
  },
  headerContainer: {
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "center",
    marginBottom: 20,
    // paddingVertical: 12,
    // borderBottomWidth: 1,
    // borderBottomColor: "#222",
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
  },
  addButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1e3a29",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 6,
  },
  addButtonText: {
    fontSize: 14,
    fontWeight: "500",
    color: "white",
  },
  contentContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 16,
  },
  messageText: {
    fontSize: 16,
    color: "#999",
    textAlign: "center",
  },
  createButton: {
    backgroundColor: "#1e3a29",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    marginTop: 8,
  },
  createButtonText: {
    fontSize: 14,
    fontWeight: "500",
    color: "white",
  },
  cardsContainer: {
    gap: 16,
  },
  cardContainer: {
    backgroundColor: "#1a1a1a",
    borderRadius: 12,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#333",
    marginBottom: 16,
  },
  cardContent: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  cardInfo: {
    flex: 1,
    padding: 16,
    justifyContent: "space-between",
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "white",
    marginBottom: 12,
  },
  cardDetail: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 8,
  },
  detailText: {
    fontSize: 14,
    color: "#ccc",
  },
  qrCodeContainer: {
    width: 160,
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
    padding: 10,
  },
  qrCodeText: {
    fontSize: 12,
    color: "#000",
    marginTop: 8,
    fontWeight: "500",
    textAlign: "center",
  },
  editButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    alignSelf: "flex-start",
    marginTop: 12,
  },
  editButtonText: {
    fontSize: 12,
    color: "#ccc",
  },
  refetchingContainer: {
    position: "absolute",
    bottom: 20,
    left: 0,
    right: 0,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    borderRadius: 8,
    padding: 8,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginHorizontal: 16,
  },
  refetchingText: {
    fontSize: 12,
    color: "#ccc",
  },
});
