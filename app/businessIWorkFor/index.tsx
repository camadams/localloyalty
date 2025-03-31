import {
  StyleSheet,
  View,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Modal,
  TextInput,
  ScrollView,
  Alert,
} from "react-native";
import { ThemedText } from "@/components/ThemedText";
import { Redirect, useRouter } from "expo-router";
import { useAuth } from "@/hooks/useAuth";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getBusinessesIWorkFor } from "@/api/businessIWorkFor";
import { IconSymbol } from "@/components/ui/IconSymbol";
import { LinearGradient } from "expo-linear-gradient";
import { useState } from "react";
import { getAllBusinesses, applyForJob } from "@/api/businessData";

export default function BusinessesIWorkForScreen() {
  const router = useRouter();
  const { user, isPending: isPendingAuth } = useAuth();
  const queryClient = useQueryClient();
  const [isApplyModalVisible, setIsApplyModalVisible] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedBusinessId, setSelectedBusinessId] = useState<number | null>(
    null
  );

  // Fetch businesses the user works for
  const {
    data: businesses,
    isLoading,
    isError,
    error,
    refetch,
    isRefetching,
  } = useQuery({
    queryKey: ["businessesIWorkFor"],
    queryFn: getBusinessesIWorkFor,
  });

  // Fetch all businesses for job application
  const { data: allBusinesses, isLoading: isLoadingAllBusinesses } = useQuery<
    { id: number; name: string }[]
  >({
    queryKey: ["allBusinesses"],
    queryFn: getAllBusinesses,
    enabled: isApplyModalVisible, // Only fetch when modal is open
  });

  // Apply for job mutation
  const { mutate: applyForJobMutate, isPending: isApplying } = useMutation({
    mutationFn: (businessId: number) => applyForJob(businessId),
    onSuccess: () => {
      // Close modal and show success message
      setIsApplyModalVisible(false);
      setSelectedBusinessId(null);
      setSearchTerm("");
      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: ["businessesIWorkFor"] });
      Alert.alert(
        "Application Submitted",
        "Your job application has been submitted successfully. The business owner will review your application."
      );
    },
    onError: (error) => {
      Alert.alert(
        "Application Failed",
        error instanceof Error ? error.message : "Failed to submit application"
      );
    },
  });

  // Handle navigation to business details
  const handleBusinessPress = (
    businessId: number,
    myEmploymentStatus: string
  ) => {
    // Only navigate if the user is an active employee
    if (myEmploymentStatus === "active") {
      router.push(`/business/${businessId}`);
    } else {
      Alert.alert(
        "Access Restricted",
        "You can only access businesses where you are an active employee. Your application for this business is still pending approval."
      );
    }
  };

  // Handle job application submission
  const handleApplyForJob = () => {
    if (selectedBusinessId) {
      applyForJobMutate(selectedBusinessId);
    } else {
      Alert.alert("Error", "Please select a business to apply for");
    }
  };

  // Filter businesses based on search term
  const filteredBusinesses = allBusinesses
    ? allBusinesses.filter((business) =>
        business.name.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : [];

  if (isPendingAuth || isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#1e3a29" />
      </View>
    );
  }

  if (!user) return <Redirect href="/(tabs)" />;

  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <ThemedText style={styles.headerTitle}>
          Businesses I Work For
        </ThemedText>
        <TouchableOpacity
          style={styles.applyButton}
          onPress={() => setIsApplyModalVisible(true)}
        >
          <IconSymbol name="briefcase" size={16} color="white" />
          <ThemedText style={styles.applyButtonText}>Apply for Job</ThemedText>
        </TouchableOpacity>
      </View>

      {isError ? (
        <View style={styles.errorContainer}>
          <IconSymbol
            name="exclamationmark.triangle"
            size={24}
            color="#ff4d4f"
          />
          <ThemedText style={styles.errorText}>
            {error instanceof Error
              ? error.message
              : "Failed to load businesses"}
          </ThemedText>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={() => refetch()}
          >
            <ThemedText style={styles.retryButtonText}>Retry</ThemedText>
          </TouchableOpacity>
        </View>
      ) : businesses && businesses.length > 0 ? (
        <FlatList
          data={businesses}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.businessCard}
              onPress={() =>
                handleBusinessPress(item.id, item.myEmploymentStatus)
              }
            >
              <LinearGradient
                colors={["#1e3a29", "#2d5a40"]}
                style={styles.businessCardHeader}
              >
                <IconSymbol name="building.2" size={20} color="white" />
                <ThemedText style={styles.businessName}>{item.name}</ThemedText>
              </LinearGradient>
              <View style={styles.businessCardBody}>
                <View style={styles.permissionItem}>
                  <IconSymbol
                    name={
                      item.canGivePoints ? "checkmark.circle" : "xmark.circle"
                    }
                    size={16}
                    color={item.canGivePoints ? "#4CAF50" : "#ff4d4f"}
                  />
                  <ThemedText style={styles.permissionText}>
                    {item.canGivePoints
                      ? "Can give points to customers"
                      : "Cannot give points to customers"}
                  </ThemedText>
                </View>
                <TouchableOpacity
                  style={styles.viewButton}
                  onPress={() =>
                    handleBusinessPress(item.id, item.myEmploymentStatus)
                  }
                >
                  <ThemedText style={styles.viewButtonText}>
                    View Details
                  </ThemedText>
                  <IconSymbol name="chevron.right" size={14} color="#1e3a29" />
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          )}
          contentContainerStyle={styles.listContainer}
          refreshControl={
            <RefreshControl
              refreshing={isRefetching}
              onRefresh={refetch}
              tintColor="#1e3a29"
              colors={["#1e3a29"]}
            />
          }
        />
      ) : (
        <View style={styles.emptyContainer}>
          <IconSymbol name="building.2" size={48} color="#666" />
          <ThemedText style={styles.emptyText}>
            You don't work for any businesses yet
          </ThemedText>
          <TouchableOpacity
            style={styles.applyButtonLarge}
            onPress={() => setIsApplyModalVisible(true)}
          >
            <IconSymbol name="briefcase" size={18} color="white" />
            <ThemedText style={styles.applyButtonLargeText}>
              Apply for a Job
            </ThemedText>
          </TouchableOpacity>
        </View>
      )}

      {/* Job Application Modal */}
      <Modal
        visible={isApplyModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setIsApplyModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <ThemedText style={styles.modalTitle}>Apply for a Job</ThemedText>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => {
                  setIsApplyModalVisible(false);
                  setSelectedBusinessId(null);
                  setSearchTerm("");
                }}
              >
                <IconSymbol name="xmark" size={20} color="#ccc" />
              </TouchableOpacity>
            </View>

            <View style={styles.searchContainer}>
              <IconSymbol name="magnifyingglass" size={16} color="#666" />
              <TextInput
                style={styles.searchInput}
                placeholder="Search businesses..."
                placeholderTextColor="#666"
                value={searchTerm}
                onChangeText={setSearchTerm}
              />
            </View>

            {isLoadingAllBusinesses ? (
              <View style={styles.modalLoadingContainer}>
                <ActivityIndicator size="large" color="#1e3a29" />
                <ThemedText style={styles.loadingText}>
                  Loading businesses...
                </ThemedText>
              </View>
            ) : (
              <ScrollView style={styles.businessList}>
                {filteredBusinesses.length > 0 ? (
                  filteredBusinesses.map((business) => (
                    <TouchableOpacity
                      key={business.id}
                      style={[
                        styles.businessItem,
                        selectedBusinessId === business.id &&
                          styles.selectedBusinessItem,
                      ]}
                      onPress={() => setSelectedBusinessId(business.id)}
                    >
                      <IconSymbol
                        name="building.2"
                        size={16}
                        color={
                          selectedBusinessId === business.id
                            ? "#1e3a29"
                            : "#666"
                        }
                      />
                      <ThemedText
                        style={[
                          styles.businessItemText,
                          selectedBusinessId === business.id &&
                            styles.selectedBusinessItemText,
                        ]}
                      >
                        {business.name}
                      </ThemedText>
                      {selectedBusinessId === business.id && (
                        <IconSymbol
                          name="checkmark"
                          size={16}
                          color="#1e3a29"
                        />
                      )}
                    </TouchableOpacity>
                  ))
                ) : (
                  <ThemedText style={styles.noResultsText}>
                    No businesses found matching "{searchTerm}"
                  </ThemedText>
                )}
              </ScrollView>
            )}

            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={[styles.cancelButton]}
                onPress={() => {
                  setIsApplyModalVisible(false);
                  setSelectedBusinessId(null);
                  setSearchTerm("");
                }}
              >
                <ThemedText style={styles.cancelButtonText}>Cancel</ThemedText>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.applyModalButton,
                  (!selectedBusinessId || isApplying) && styles.disabledButton,
                ]}
                onPress={handleApplyForJob}
                disabled={!selectedBusinessId || isApplying}
              >
                {isApplying ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <ThemedText style={styles.applyModalButtonText}>
                    Apply
                  </ThemedText>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
  headerContainer: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#333",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#fff",
  },
  applyButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1e3a29",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 6,
  },
  applyButtonText: {
    fontSize: 14,
    fontWeight: "bold",
    color: "white",
  },
  applyButtonLarge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1e3a29",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    marginTop: 16,
    gap: 8,
  },
  applyButtonLargeText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "white",
  },
  listContainer: {
    padding: 16,
  },
  businessCard: {
    backgroundColor: "#1a1a1a",
    borderRadius: 8,
    overflow: "hidden",
    marginBottom: 16,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  businessCardHeader: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
  },
  businessName: {
    fontSize: 18,
    fontWeight: "bold",
    color: "white",
    marginLeft: 8,
  },
  businessCardBody: {
    padding: 12,
  },
  permissionItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  permissionText: {
    marginLeft: 8,
    color: "#ccc",
    fontSize: 14,
  },
  viewButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#f0f0f0",
    borderRadius: 4,
    padding: 8,
    marginTop: 8,
  },
  viewButtonText: {
    color: "#1e3a29",
    fontWeight: "bold",
    marginRight: 4,
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  errorText: {
    color: "#ff4d4f",
    textAlign: "center",
    marginTop: 8,
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: "#1e3a29",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 4,
  },
  retryButtonText: {
    color: "white",
    fontWeight: "bold",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  emptyText: {
    color: "#888",
    fontSize: 16,
    textAlign: "center",
    marginTop: 16,
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
  },
  modalContent: {
    backgroundColor: "#1a1a1a",
    borderRadius: 8,
    width: "100%",
    maxWidth: 500,
    maxHeight: "80%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#333",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "white",
  },
  closeButton: {
    padding: 4,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#2a2a2a",
    borderRadius: 8,
    margin: 16,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  searchInput: {
    flex: 1,
    color: "white",
    marginLeft: 8,
    fontSize: 16,
    padding: 4,
  },
  businessList: {
    maxHeight: 300,
  },
  businessItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#333",
  },
  selectedBusinessItem: {
    backgroundColor: "#f0f0f0",
  },
  businessItemText: {
    color: "#ccc",
    marginLeft: 8,
    flex: 1,
  },
  selectedBusinessItemText: {
    color: "#1e3a29",
    fontWeight: "bold",
  },
  noResultsText: {
    color: "#888",
    textAlign: "center",
    padding: 16,
  },
  modalFooter: {
    flexDirection: "row",
    justifyContent: "flex-end",
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: "#333",
  },
  cancelButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 8,
  },
  cancelButtonText: {
    color: "#ccc",
  },
  applyModalButton: {
    backgroundColor: "#1e3a29",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 4,
  },
  applyModalButtonText: {
    color: "white",
    fontWeight: "bold",
  },
  disabledButton: {
    opacity: 0.5,
  },
  modalLoadingContainer: {
    padding: 20,
    alignItems: "center",
  },
  loadingText: {
    color: "#ccc",
    marginTop: 8,
  },
});
