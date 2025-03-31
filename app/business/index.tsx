import {
  ActivityIndicator,
  StyleSheet,
  View,
  TouchableOpacity,
  Dimensions,
  FlatList,
  RefreshControl,
  Modal,
  TextInput,
  ScrollView,
  Alert,
} from "react-native";
import { ThemedText } from "@/components/ThemedText";
import { Fragment, useCallback, useState } from "react";
import { Link, Redirect, useRouter } from "expo-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import {
  getBusinessesForUser,
  getOwnedAndEmployeedByBusinesses,
  getAllBusinesses,
  applyForJob,
} from "@/api/businessData";
import { BusinessWithEmployees } from "../api/business/business+api";
import {
  BusinessItem as BusinessItemType,
  GetOwnedAndEmployeedByBusinessesResponse,
} from "../api/business/getOwnedAndEmployeedByBusinesses+api";
import { IconSymbol } from "@/components/ui/IconSymbol";
import { useFocusEffect } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";

const { width } = Dimensions.get("window");

export default function BusinessesScreen() {
  const router = useRouter();
  const { user, contextLoading } = useAuth();
  const queryClient = useQueryClient();
  const [isApplyModalVisible, setIsApplyModalVisible] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedBusinessId, setSelectedBusinessId] = useState<number | null>(
    null
  );

  // Fetch businesses the user owns and works for
  const {
    data: businessData,
    isLoading: isLoadingBusinesses,
    isError,
    error,
    isRefetching,
    refetch,
  } = useQuery<GetOwnedAndEmployeedByBusinessesResponse>({
    queryKey: ["userBusinesses"],
    queryFn: getOwnedAndEmployeedByBusinesses,
  });

  // Fetch all businesses for job application
  const {
    data: allBusinesses,
    isLoading: isLoadingAllBusinesses,
    isError: isAllBusinessesError,
  } = useQuery({
    queryKey: ["allBusinesses"],
    queryFn: getAllBusinesses,
    enabled: isApplyModalVisible, // Only fetch when modal is open
  });

  // Apply for job mutation
  const applyMutation = useMutation({
    mutationFn: (businessId: number) => applyForJob(businessId),
    onSuccess: () => {
      // Close modal and refetch data
      setIsApplyModalVisible(false);
      setSelectedBusinessId(null);
      queryClient.invalidateQueries({ queryKey: ["userBusinesses"] });
      Alert.alert("Success", "Job application submitted successfully!");
    },
    onError: (error) => {
      console.error("Error applying for job:", error);
      Alert.alert(
        "Error",
        "Failed to submit job application. Please try again."
      );
    },
  });

  // Refresh data when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      refetch();
    }, [refetch])
  );

  // Handle add business button press
  const handleAddBusiness = () => {
    router.push("/business/add");
  };

  // Handle apply for job button press
  const handleApplyForJob = () => {
    if (!selectedBusinessId) {
      Alert.alert("Error", "Please select a business to apply to.");
      return;
    }

    applyMutation.mutate(selectedBusinessId);
  };

  // Filter businesses based on search term
  const filteredBusinesses = allBusinesses?.filter((business) =>
    business.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Show loading state
  if (contextLoading || isLoadingBusinesses) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#1e3a29" />
        <ThemedText style={styles.loadingText}>Loading...</ThemedText>
      </View>
    );
  }

  // Show error state
  if (isError) {
    return (
      <View style={styles.errorContainer}>
        <IconSymbol name="exclamationmark.triangle" size={48} color="#F44336" />
        <ThemedText style={styles.errorText}>
          Error loading businesses
        </ThemedText>
        <TouchableOpacity style={styles.retryButton} onPress={() => refetch()}>
          <ThemedText style={styles.retryButtonText}>Retry</ThemedText>
        </TouchableOpacity>
      </View>
    );
  }

  // Redirect if not authenticated
  if (!user) return <Redirect href="/(tabs)" />;

  const hasOwnedBusinesses = (businessData?.ownedBusinesses?.length ?? 0) > 0;
  const hasEmployedBusinesses =
    (businessData?.employedByBusinesses?.length ?? 0) > 0;

  return (
    <View style={styles.container}>
      {/* <View style={styles.header}>
        <ThemedText style={styles.headerTitle}>Your Businesses</ThemedText>
      </View> */}

      <ScrollView
        style={styles.scrollContainer}
        contentContainerStyle={styles.contentContainerStyle}
        refreshControl={
          <RefreshControl refreshing={isRefetching} onRefresh={refetch} />
        }
      >
        {/* Businesses I Own Section */}
        <View style={styles.sectionContainer}>
          <View style={styles.sectionHeader}>
            <ThemedText style={styles.sectionTitle}>
              Businesses I Own
            </ThemedText>
            <TouchableOpacity
              style={styles.actionHeaderButton}
              onPress={handleAddBusiness}
            >
              <IconSymbol name="plus" size={16} color="white" />
              <ThemedText style={styles.actionButtonText}>
                Add Business
              </ThemedText>
            </TouchableOpacity>
          </View>

          {hasOwnedBusinesses ? (
            <FlatList
              data={businessData?.ownedBusinesses}
              keyExtractor={(item) => item.businessId.toString()}
              renderItem={({ item }) => <BusinessItem business={item} />}
              contentContainerStyle={styles.listContainer}
              scrollEnabled={false}
            />
          ) : (
            <View style={styles.emptyContainer}>
              <IconSymbol name="building.2" size={48} color="#666" />
              <ThemedText style={styles.messageText}>
                You don't have any businesses yet
              </ThemedText>
              <TouchableOpacity
                style={styles.actionButton}
                onPress={handleAddBusiness}
              >
                <IconSymbol name="plus" size={16} color="white" />
                <ThemedText style={styles.actionButtonText}>
                  Add Your First Business
                </ThemedText>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Businesses I Work For Section */}
        <View style={[styles.sectionContainer, styles.secondSection]}>
          <View style={styles.sectionHeader}>
            <ThemedText style={styles.sectionTitle}>
              Businesses I Work For
            </ThemedText>
            <TouchableOpacity
              style={styles.actionHeaderButton}
              onPress={() => setIsApplyModalVisible(true)}
            >
              <IconSymbol name="briefcase" size={16} color="white" />
              <ThemedText style={styles.actionButtonText}>
                Apply for Job
              </ThemedText>
            </TouchableOpacity>
          </View>

          {hasEmployedBusinesses ? (
            <FlatList
              data={businessData?.employedByBusinesses}
              keyExtractor={(item) => item.businessId.toString()}
              renderItem={({ item }) => <BusinessItem business={item} />}
              contentContainerStyle={styles.listContainer}
              scrollEnabled={false}
            />
          ) : (
            <View style={styles.emptyContainer}>
              <IconSymbol name="building.2" size={48} color="#666" />
              <ThemedText style={styles.messageText}>
                You don't work for any businesses yet
              </ThemedText>
              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => setIsApplyModalVisible(true)}
              >
                <IconSymbol name="briefcase" size={16} color="white" />
                <ThemedText style={styles.actionButtonText}>
                  Apply for Job
                </ThemedText>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Apply for Job Modal */}
      <Modal
        visible={isApplyModalVisible}
        animationType="slide"
        transparent={true}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <ThemedText style={styles.modalTitle}>Apply for Job</ThemedText>
              <TouchableOpacity onPress={() => setIsApplyModalVisible(false)}>
                <IconSymbol name="xmark" size={24} color="#ccc" />
              </TouchableOpacity>
            </View>

            <TextInput
              style={styles.searchInput}
              placeholder="Search businesses..."
              value={searchTerm}
              onChangeText={setSearchTerm}
              placeholderTextColor="#999"
            />

            {isLoadingAllBusinesses ? (
              <View style={styles.modalLoadingContainer}>
                <ActivityIndicator size="small" color="#1e3a29" />
                <ThemedText>Loading businesses...</ThemedText>
              </View>
            ) : isAllBusinessesError ? (
              <View style={styles.modalErrorContainer}>
                <IconSymbol
                  name="exclamationmark.triangle"
                  size={24}
                  color="#F44336"
                />
                <ThemedText>Failed to load businesses</ThemedText>
              </View>
            ) : (
              <ScrollView style={styles.businessList}>
                {filteredBusinesses?.map((business) => (
                  <TouchableOpacity
                    key={business.id}
                    style={[
                      styles.businessOption,
                      selectedBusinessId === business.id &&
                        styles.selectedBusinessOption,
                    ]}
                    onPress={() => setSelectedBusinessId(business.id)}
                  >
                    <View style={styles.businessOptionContent}>
                      <IconSymbol
                        name="building.2"
                        size={20}
                        color={
                          selectedBusinessId === business.id ? "white" : "#ccc"
                        }
                      />
                      <ThemedText
                        style={[
                          styles.businessOptionText,
                          selectedBusinessId === business.id &&
                            styles.selectedBusinessOptionText,
                        ]}
                      >
                        {business.name}
                      </ThemedText>
                    </View>
                  </TouchableOpacity>
                ))}

                {filteredBusinesses?.length === 0 && (
                  <View style={styles.noResultsContainer}>
                    <IconSymbol name="magnifyingglass" size={24} color="#ccc" />
                    <ThemedText style={styles.noResultsText}>
                      No businesses found
                    </ThemedText>
                  </View>
                )}
              </ScrollView>
            )}

            <TouchableOpacity
              style={[
                styles.applyButton,
                (!selectedBusinessId || applyMutation.isPending) &&
                  styles.disabledButton,
              ]}
              onPress={handleApplyForJob}
              disabled={!selectedBusinessId || applyMutation.isPending}
            >
              {applyMutation.isPending ? (
                <ActivityIndicator size="small" color="white" />
              ) : (
                <Fragment>
                  <IconSymbol name="paperplane" size={16} color="white" />
                  <ThemedText style={styles.applyButtonText}>
                    Submit Application
                  </ThemedText>
                </Fragment>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

function BusinessItem({ business }: { business: BusinessItemType }) {
  const router = useRouter();
  const isEmployee = business.employee;

  // Navigate to loyalty cards page
  const handleViewLoyaltyCards = () => {
    router.push(`/business/${business.businessId}/loyaltyCards`);
  };

  // Navigate to employees page
  const handleViewEmployees = () => {
    router.push(`/business/${business.businessId}/employees`);
  };

  return (
    <View style={styles.businessCard}>
      <LinearGradient
        colors={["#4c669f", "#3b5998", "#192f6a"]}
        style={styles.businessCardHeader}
      >
        <ThemedText style={styles.businessName}>
          {business.businessName}
        </ThemedText>
      </LinearGradient>
      <View style={styles.businessCardBody}>
        {isEmployee && (
          <View style={styles.employeeBadge}>
            <IconSymbol
              name="person.badge.shield.checkmark"
              size={14}
              color="white"
            />
            <ThemedText style={styles.employeeBadgeText}>Employee</ThemedText>
          </View>
        )}
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[
              styles.actionButton,
              isEmployee ? styles.fullWidthButton : {},
            ]}
            onPress={handleViewLoyaltyCards}
          >
            <IconSymbol name="creditcard" size={16} color="white" />
            <ThemedText style={styles.actionButtonText}>
              Loyalty Cards
            </ThemedText>
          </TouchableOpacity>

          {!isEmployee && (
            <TouchableOpacity
              style={styles.actionButton}
              onPress={handleViewEmployees}
            >
              <IconSymbol name="person.2" size={16} color="white" />
              <ThemedText style={styles.actionButtonText}>Employees</ThemedText>
            </TouchableOpacity>
          )}
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
  header: {
    paddingVertical: 16,
    paddingHorizontal: 16,
    backgroundColor: "#1a1a1a",
    borderBottomWidth: 1,
    borderBottomColor: "#333",
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "white",
  },
  scrollContainer: {
    flex: 1,
  },
  contentContainerStyle: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  sectionContainer: {
    marginTop: 16,
  },
  secondSection: {
    marginTop: 24,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "white",
  },
  actionHeaderButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1e3a29",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 6,
  },
  actionButtonText: {
    color: "white",
    fontSize: 14,
    fontWeight: "500",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#0a0a0a",
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: "#ccc",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    backgroundColor: "#0a0a0a",
  },
  errorText: {
    fontSize: 18,
    fontWeight: "bold",
    marginTop: 10,
    color: "white",
  },
  retryButton: {
    marginTop: 20,
    backgroundColor: "#1e3a29",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryButtonText: {
    color: "white",
    fontWeight: "500",
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
    backgroundColor: "#1a1a1a",
    borderRadius: 12,
    marginHorizontal: 2,
    borderWidth: 1,
    borderColor: "#333",
  },
  messageText: {
    fontSize: 16,
    color: "#999",
    textAlign: "center",
    marginTop: 10,
    marginBottom: 20,
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1e3a29",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    marginHorizontal: 5,
    flex: 1,
    justifyContent: "center",
    gap: 6,
  },
  fullWidthButton: {
    flex: 1,
  },
  listContainer: {
    paddingBottom: 10,
  },
  businessCard: {
    backgroundColor: "#1a1a1a",
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#333",
    overflow: "hidden",
  },
  businessCardHeader: {
    padding: 12,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  businessName: {
    color: "white",
    fontWeight: "bold",
    fontSize: 16,
  },
  businessCardBody: {
    padding: 12,
  },
  employeeBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#4CAF50",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    alignSelf: "flex-start",
    marginBottom: 10,
    gap: 4,
  },
  employeeBadgeText: {
    color: "white",
    fontSize: 12,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 8,
    gap: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "#1a1a1a",
    borderRadius: 12,
    padding: 20,
    width: width * 0.9,
    maxHeight: "80%",
    borderWidth: 1,
    borderColor: "#333",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "white",
  },
  searchInput: {
    borderWidth: 1,
    borderColor: "#333",
    borderRadius: 8,
    padding: 10,
    marginBottom: 15,
    backgroundColor: "#222",
    color: "white",
  },
  businessList: {
    maxHeight: 300,
  },
  businessOption: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#333",
  },
  selectedBusinessOption: {
    backgroundColor: "#1e3a29",
    borderRadius: 8,
  },
  businessOptionContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  businessOptionText: {
    fontSize: 16,
    color: "#ccc",
  },
  selectedBusinessOptionText: {
    color: "white",
  },
  noResultsContainer: {
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  noResultsText: {
    marginTop: 10,
    color: "#999",
  },
  applyButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#1e3a29",
    padding: 12,
    borderRadius: 8,
    marginTop: 15,
    gap: 8,
  },
  disabledButton: {
    backgroundColor: "#333",
  },
  applyButtonText: {
    color: "white",
    fontWeight: "500",
  },
  modalLoadingContainer: {
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  modalErrorContainer: {
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
});
