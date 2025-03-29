import {
  ActivityIndicator,
  StyleSheet,
  View,
  TouchableOpacity,
  Dimensions,
} from "react-native";

import { ThemedText } from "@/components/ThemedText";
import { Fragment, useCallback } from "react";
import { Link, useRouter } from "expo-router";
import { useQuery } from "@tanstack/react-query";
import { getCardsInUse } from "@/api/customerCards";
import { useAuth } from "@/hooks/useAuth";
import { UsersCardResponse } from "../api/customer/card+api";
import { IconSymbol } from "@/components/ui/IconSymbol";
import { useFocusEffect } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";
import { useSession } from "@/lib/auth-client";

const { width } = Dimensions.get("window");

export default function TabTwoScreen() {
  const router = useRouter();
  const { user, isPending: isPendingSession } = useAuth();
  const ses = useSession();
  const {
    data: usersCards,
    isLoading: isLoadingCardsInUse,
    isRefetching,
    refetch,
  } = useQuery({
    queryKey: ["cardsInUse"],
    queryFn: () => getCardsInUse(),
  });

  // Refresh data when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      if (user?.id) {
        refetch();
      }
    }, [user?.id, refetch])
  );

  const handleAddCard = () => {
    router.push("/customer/addOrScanLoyaltyCard");
  };

  if (isPendingSession) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#1e3a29" />
        <ThemedText style={styles.loadingText}>Loading...</ThemedText>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header with title */}
      {/* <View style={styles.headerContainer}>
        <ThemedText style={styles.headerTitle}>My Loyalty Cards</ThemedText>
      </View> */}

      {/* Loading state */}
      <ThemedText>{JSON.stringify(ses, null, 2)}</ThemedText>
      {isLoadingCardsInUse ? (
        <View style={styles.contentContainer}>
          <ActivityIndicator size="large" color="#1e3a29" />
          <ThemedText style={styles.messageText}>
            Loading your cards...
          </ThemedText>
        </View>
      ) : !usersCards || usersCards.length === 0 ? (
        <View style={styles.contentContainer}>
          <IconSymbol name="creditcard.and.123" size={48} color="#666" />
          <ThemedText style={styles.messageText}>
            You don't have any loyalty cards yet
          </ThemedText>
          <TouchableOpacity
            style={styles.addCardButton}
            onPress={handleAddCard}
          >
            <IconSymbol name="plus" size={16} color="white" />
            <ThemedText style={styles.addCardButtonText}>
              Add Your First Card
            </ThemedText>
          </TouchableOpacity>
        </View>
      ) : (
        <Fragment>
          <View style={styles.cardsList}>
            {usersCards.map((usersCard, i) => (
              <UsersCard key={i} usersCard={usersCard} />
            ))}
          </View>

          {/* <TouchableOpacity
            style={styles.floatingAddButton}
            onPress={handleAddCard}
          >
            <IconSymbol name="plus" size={24} color="white" />
          </TouchableOpacity> */}
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

export function UsersCard({ usersCard }: { usersCard: UsersCardResponse }) {
  const totalPoints = usersCard.loyaltyCard.maxPoints;
  const earnedPoints = usersCard.points ?? 0;

  return (
    <View style={styles.cardContainer}>
      <LinearGradient colors={["#1e3a29", "#2d5a40"]} style={styles.cardHeader}>
        <ThemedText style={styles.businessName}>
          {usersCard.loyaltyCard.businessName}
        </ThemedText>
      </LinearGradient>

      <View style={styles.cardBody}>
        <ThemedText style={styles.cardDescription}>
          {usersCard.loyaltyCard.description}
        </ThemedText>

        <View style={styles.pointsRow}>
          {[...Array(Math.ceil(totalPoints / 5))].map((_, rowIndex) => (
            <View key={`row-${rowIndex}`} style={styles.pointsRowItem}>
              {[...Array(Math.min(5, totalPoints - rowIndex * 5))].map(
                (_, i) => {
                  const pointIndex = rowIndex * 5 + i;
                  return (
                    <View
                      key={pointIndex}
                      style={[
                        styles.pointIndicator,
                        pointIndex < earnedPoints
                          ? styles.pointEarned
                          : styles.pointRemaining,
                      ]}
                    >
                      {pointIndex < earnedPoints && (
                        <IconSymbol name="checkmark" size={12} color="white" />
                      )}
                    </View>
                  );
                }
              )}
            </View>
          ))}
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
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#0a0a0a",
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: "#ccc",
  },
  headerContainer: {
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#222",
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#fff",
  },
  contentContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    gap: 16,
  },
  messageText: {
    fontSize: 16,
    color: "#999",
    textAlign: "center",
  },
  addCardButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1e3a29",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 16,
    gap: 8,
  },
  addCardButtonText: {
    fontSize: 16,
    color: "white",
    fontWeight: "500",
  },
  cardsList: {
    padding: 16,
    gap: 16,
  },
  floatingAddButton: {
    position: "absolute",
    bottom: 20,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#1e3a29",
    justifyContent: "center",
    alignItems: "center",
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
  },
  refetchingContainer: {
    position: "absolute",
    top: 70,
    right: 16,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.7)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 6,
  },
  refetchingText: {
    fontSize: 12,
    color: "#ccc",
  },
  cardContainer: {
    borderRadius: 12,
    overflow: "hidden",
    backgroundColor: "#1a1a1a",
    borderWidth: 1,
    borderColor: "#333",
    marginBottom: 16,
  },
  cardHeader: {
    padding: 16,
  },
  businessName: {
    fontSize: 18,
    fontWeight: "bold",
    color: "white",
  },
  cardBody: {
    padding: 16,
    gap: 16,
  },
  cardDescription: {
    fontSize: 14,
    color: "#ccc",
    marginBottom: 4,
  },
  pointsRow: {
    flexDirection: "column",
    gap: 12,
  },
  pointsRowItem: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 4,
  },
  pointIndicator: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
  },
  pointEarned: {
    backgroundColor: "#4CAF50",
  },
  pointRemaining: {
    backgroundColor: "#333",
    borderWidth: 1,
    borderColor: "#444",
  },
  titleContainer: {
    flexDirection: "column",
    gap: 16,
    padding: 16,
  },
});
