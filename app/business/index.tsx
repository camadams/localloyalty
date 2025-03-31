import {
  ActivityIndicator,
  StyleSheet,
  View,
  TouchableOpacity,
  Dimensions,
} from "react-native";
import { ThemedText } from "@/components/ThemedText";
import { Fragment, useCallback } from "react";
import { Link, Redirect, useRouter } from "expo-router";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { getBusinessesForUser } from "@/api/businessData";
import { BusinessWithEmployees } from "../api/business/business+api";
import { Entypo } from "@expo/vector-icons";
import { IconSymbol } from "@/components/ui/IconSymbol";
import { useFocusEffect } from "@react-navigation/native";

const { width } = Dimensions.get("window");

export default function TabTwoScreen() {
  const router = useRouter();
  const { user, isPending: isPendingSession } = useAuth();
  const {
    data: businessesWithEmployees,
    isLoading: isLoadingBusinesses,
    isRefetching,
    refetch,
  } = useQuery({
    queryKey: ["userBusinesses"],
    queryFn: () => getBusinessesForUser(),
  });

  // Refresh data when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      if (user?.id) {
        refetch();
      }
    }, [user?.id, refetch])
  );

  const handleAddBusiness = () => {
    router.push("/business/new");
  };

  if (isPendingSession) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#1e3a29" />
        <ThemedText style={styles.loadingText}>Loading...</ThemedText>
      </View>
    );
  }

  if (!user) return <Redirect href="/" />;

  return (
    <View style={styles.container}>
      {/* Header with Add Business button */}
      <View style={styles.headerContainer}>
        {/* <ThemedText style={styles.sectionTitle}>Your Businesses</ThemedText> */}
        <TouchableOpacity style={styles.addButton} onPress={handleAddBusiness}>
          <IconSymbol name="plus" size={16} color="white" />
          <ThemedText style={styles.addButtonText}>Add Business</ThemedText>
        </TouchableOpacity>
      </View>

      {/* Loading state */}
      {isLoadingBusinesses ? (
        <View style={styles.contentContainer}>
          <ActivityIndicator size="large" color="#1e3a29" />
          <ThemedText style={styles.messageText}>
            Loading your businesses...
          </ThemedText>
        </View>
      ) : !businessesWithEmployees || businessesWithEmployees.length === 0 ? (
        <View style={styles.contentContainer}>
          <IconSymbol name="building.2" size={48} color="#666" />
          <ThemedText style={styles.messageText}>
            You don't have any businesses yet
          </ThemedText>
          <TouchableOpacity
            style={styles.createButton}
            onPress={handleAddBusiness}
          >
            <ThemedText style={styles.createButtonText}>
              Create Your First Business
            </ThemedText>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.businessList}>
          {businessesWithEmployees.map((business, i) => (
            <BusinessItem key={i} business={business} />
          ))}
        </View>
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

function BusinessItem({ business }: { business: BusinessWithEmployees }) {
  return (
    <Link
      href={{
        pathname: "/business/[businessId]/(tabs)",
        params: { businessId: business.businessId },
      }}
      asChild
    >
      <TouchableOpacity style={styles.businessItem}>
        <View style={styles.businessHeader}>
          <IconSymbol name="building.2" size={24} color="white" />
          <ThemedText style={styles.businessName}>
            {business.businessName}
          </ThemedText>
        </View>

        <View style={styles.businessDetails}>
          <View style={styles.detailItem}>
            <IconSymbol name="person.2" size={16} color="#ccc" />
            <ThemedText style={styles.detailText}>
              {business.employees.length} employee
              {business.employees.length !== 1 ? "s" : ""}
            </ThemedText>
          </View>

          <View style={styles.detailItem}>
            <IconSymbol name="qrcode" size={16} color="#ccc" />
            <ThemedText style={styles.detailText}>View Details</ThemedText>
          </View>
        </View>

        <View style={styles.businessFooter}>
          <ThemedText style={styles.viewText}>Tap to manage</ThemedText>
          <IconSymbol name="chevron.right" size={16} color="#ccc" />
        </View>
      </TouchableOpacity>
    </Link>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
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
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "center",
    marginBottom: 20,
    paddingTop: 8,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#fff",
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
    color: "white",
    fontWeight: "500",
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
    marginHorizontal: 20,
  },
  createButton: {
    backgroundColor: "#1e3a29",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 16,
  },
  createButtonText: {
    fontSize: 16,
    color: "white",
    fontWeight: "500",
  },
  businessList: {
    gap: 16,
  },
  businessItem: {
    backgroundColor: "#1a1a1a",
    borderRadius: 12,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#333",
  },
  businessHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    padding: 16,
    backgroundColor: "#1e3a29",
  },
  businessName: {
    fontSize: 18,
    fontWeight: "bold",
    color: "white",
  },
  businessDetails: {
    padding: 16,
    gap: 12,
  },
  detailItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  detailText: {
    fontSize: 14,
    color: "#ccc",
  },
  businessFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: "#333",
    backgroundColor: "rgba(30, 58, 41, 0.1)",
  },
  viewText: {
    fontSize: 14,
    color: "#999",
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
