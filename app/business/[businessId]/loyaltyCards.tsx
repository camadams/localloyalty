import {
  ActivityIndicator,
  StyleSheet,
  View,
  TouchableOpacity,
  Dimensions,
  ScrollView,
  RefreshControl,
  FlatList,
} from "react-native";

import { ThemedText } from "@/components/ThemedText";
import { Link, Redirect, useRouter } from "expo-router";
import { useGlobalSearchParams } from "expo-router/build/hooks";
import React, {
  Fragment,
  useCallback,
  useState,
  useEffect,
  useMemo,
} from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import {
  getBusinessLoyaltyCards,
  getOwnedAndEmployeedByLoyaltyCards,
} from "@/api/businessData";
import { IconSymbol } from "@/components/ui/IconSymbol";
import {
  LoyaltyCardItem,
  GetOwnedAndEmployeedByLoyaltyCardsResponse,
} from "@/app/api/business/getOwnedAndEmployeedByLoyaltyCards+api";
import { useFocusEffect } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";
import QRCode from "react-native-qrcode-svg";

const { width } = Dimensions.get("window");

export default function LoyaltyCardsScreen() {
  const router = useRouter();
  const { businessId } = useGlobalSearchParams<{ businessId: string }>();
  const { user, contextLoading: isPendingAuth } = useAuth();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Fetch loyalty cards for this business
  const {
    data: loyaltyCardsResponse,
    isLoading: isLoadingCards,
    isRefetching,
    refetch,
    error,
  } = useQuery<GetOwnedAndEmployeedByLoyaltyCardsResponse>({
    queryKey: ["businessLoyaltyCards"],
    queryFn: () => {
      return getOwnedAndEmployeedByLoyaltyCards(Number(businessId));
    },
  });

  // Type guard to check if the response is valid and not an error
  const isValidResponse = (
    response: any
  ): response is {
    ownedLoyaltyCards: LoyaltyCardItem[];
    employeedLoyaltyCards: LoyaltyCardItem[];
  } => {
    return (
      response &&
      !("error" in response) &&
      Array.isArray(response.ownedLoyaltyCards) &&
      Array.isArray(response.employeedLoyaltyCards)
    );
  };

  // Extract owned and employed cards from the response
  const ownedCards = useMemo(() => {
    if (!loyaltyCardsResponse || !isValidResponse(loyaltyCardsResponse))
      return [];
    return loyaltyCardsResponse.ownedLoyaltyCards;
  }, [loyaltyCardsResponse]);

  const employedCards = useMemo(() => {
    if (!loyaltyCardsResponse || !isValidResponse(loyaltyCardsResponse))
      return [];
    return loyaltyCardsResponse.employeedLoyaltyCards;
  }, [loyaltyCardsResponse]);

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

  // Check if there are owned or employed loyalty cards
  const hasOwnedCards = ownedCards.length > 0;
  const hasEmployedCards = employedCards.length > 0;

  // Show error state
  if (error) {
    return (
      <View style={styles.errorContainer}>
        <IconSymbol name="exclamationmark.triangle" size={48} color="#F44336" />
        <ThemedText style={styles.errorText}>
          Error loading loyalty cards
        </ThemedText>
        <ThemedText style={styles.errorSubtext}>
          {error instanceof Error ? error.message : "Unknown error"}
        </ThemedText>
        <TouchableOpacity style={styles.retryButton} onPress={() => refetch()}>
          <ThemedText style={styles.retryButtonText}>Retry</ThemedText>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollContainer}
        contentContainerStyle={styles.contentContainerStyle}
        refreshControl={
          <RefreshControl refreshing={isRefetching} onRefresh={refetch} />
        }
      >
        {/* Header with title and add button */}
        <View style={styles.headerContainer}>
          <ThemedText style={styles.headerTitle}>Loyalty Cards</ThemedText>

          <TouchableOpacity
            style={styles.addButton}
            onPress={handleAddLoyaltyCard}
          >
            <IconSymbol name="plus" size={16} color="white" />
            <ThemedText style={styles.addButtonText}>Add Card</ThemedText>
          </TouchableOpacity>
        </View>

        {/* Loading state */}
        {isLoadingCards ? (
          <View style={styles.contentContainer}>
            <ActivityIndicator size="large" color="#1e3a29" />
            <ThemedText style={styles.messageText}>
              Loading loyalty cards...
            </ThemedText>
          </View>
        ) : (
          <>
            {/* Cards I Own Section */}
            <View style={[styles.sectionContainer, { marginBottom: 24 }]}>
              <View style={styles.sectionHeader}>
                <ThemedText style={styles.sectionTitle}>Cards I Own</ThemedText>
              </View>

              {hasOwnedCards ? (
                <View style={styles.cardsContainer}>
                  {ownedCards.map((card: LoyaltyCardItem) => (
                    <LoyaltyCardComponent key={card.id} card={card} />
                  ))}
                </View>
              ) : (
                <View style={styles.emptyContainer}>
                  <IconSymbol name="creditcard" size={48} color="#666" />
                  <ThemedText style={styles.messageText}>
                    You don't own any loyalty cards yet
                  </ThemedText>
                  <TouchableOpacity
                    style={styles.actionButton}
                    onPress={handleAddLoyaltyCard}
                  >
                    <IconSymbol name="plus" size={16} color="white" />
                    <ThemedText style={styles.actionButtonText}>
                      Create Your First Card
                    </ThemedText>
                  </TouchableOpacity>
                </View>
              )}
            </View>

            {/* Cards I Use Section */}
            <View style={styles.sectionContainer}>
              <View style={styles.sectionHeader}>
                <ThemedText style={styles.sectionTitle}>
                  Cards I am employed by
                </ThemedText>
              </View>

              {hasEmployedCards ? (
                <View style={styles.cardsContainer}>
                  {employedCards.map((card: LoyaltyCardItem) => (
                    <LoyaltyCardComponent key={card.id} card={card} />
                  ))}
                </View>
              ) : (
                <View style={styles.emptyContainer}>
                  <IconSymbol name="creditcard" size={48} color="#666" />
                  <ThemedText style={styles.messageText}>
                    You don't use any loyalty cards yet
                  </ThemedText>
                </View>
              )}
            </View>
          </>
        )}
      </ScrollView>

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

function LoyaltyCardComponent({ card }: { card: LoyaltyCardItem }) {
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
              {card.status}
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
    backgroundColor: "#0a0a0a",
  },
  scrollContainer: {
    flex: 1,
  },
  contentContainerStyle: {
    padding: 16,
    paddingBottom: 32,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#0a0a0a",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#0a0a0a",
    padding: 20,
  },
  errorText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#F44336",
    marginTop: 12,
  },
  errorSubtext: {
    fontSize: 14,
    color: "#aaa",
    marginTop: 8,
    textAlign: "center",
  },
  retryButton: {
    backgroundColor: "#1e3a29",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    marginTop: 20,
  },
  retryButtonText: {
    fontSize: 14,
    fontWeight: "500",
    color: "white",
  },
  headerContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "white",
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
  sectionContainer: {
    marginBottom: 16,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "white",
  },
  contentContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 16,
    minHeight: 200,
  },
  emptyContainer: {
    backgroundColor: "#1a1a1a",
    borderRadius: 12,
    padding: 24,
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    borderWidth: 1,
    borderColor: "#333",
  },
  messageText: {
    fontSize: 16,
    color: "#999",
    textAlign: "center",
  },
  actionButton: {
    backgroundColor: "#1e3a29",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    marginTop: 8,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  actionButtonText: {
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
