import {
  ActivityIndicator,
  StyleSheet,
  View,
  TouchableOpacity,
  Image,
  Alert,
  Platform,
} from "react-native";

import { ThemedText } from "@/components/ThemedText";
import { Redirect } from "expo-router";
import { useGlobalSearchParams } from "expo-router/build/hooks";
import { useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { getBusinessEmployees, updateEmployeeStatus } from "@/api/businessData";
import { IconSymbol } from "@/components/ui/IconSymbol";
import { useFocusEffect } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";
import { GetBusinessEmployeesResponse } from "@/app/api/business/getBusinessEmployees+api";

export default function EmployeesScreen() {
  const { businessId } = useGlobalSearchParams<{ businessId: string }>();
  const { user, isPending: isPendingAuth } = useAuth();
  const queryClient = useQueryClient();

  // Fetch employees for this business
  const {
    data: employees,
    isLoading: isLoadingEmployees,
    isRefetching,
    refetch,
  } = useQuery({
    queryKey: ["businessEmployees", businessId],
    queryFn: () => getBusinessEmployees(Number(businessId)),
    enabled: !!businessId && !!user?.id,
  });

  // Mutation for updating employee status
  const { mutate: updateStatus, isPending: isUpdating } = useMutation({
    mutationFn: ({
      employeeId,
      status,
      canGivePoints,
    }: {
      employeeId: number;
      status: "active" | "suspended" | "revoked";
      canGivePoints: boolean;
    }) =>
      updateEmployeeStatus(
        employeeId,
        Number(businessId),
        status,
        canGivePoints
      ),
    onSuccess: () => {
      // Refetch employees after successful update
      queryClient.invalidateQueries({
        queryKey: ["businessEmployees", businessId],
      });
      Alert.alert("Success", "Employee status updated successfully");
    },
    onError: (error) => {
      Alert.alert(
        "Error",
        error instanceof Error
          ? error.message
          : "Failed to update employee status"
      );
    },
  });

  // Handle approving a job application
  const handleApproveApplication = (employeeId: number) => {
    if (Platform.OS === "web") {
      if (confirm("Do you want to approve this job application?")) {
        updateStatus({
          employeeId,
          status: "active",
          canGivePoints: true,
        });
      }
    } else {
      Alert.alert(
        "Approve Application",
        "Do you want to approve this job application?",
        [
          {
            text: "Cancel",
            style: "cancel",
          },
          {
            text: "Approve",
            onPress: () =>
              updateStatus({
                employeeId,
                status: "active",
                canGivePoints: true,
              }),
          },
        ]
      );
    }
  };

  // Handle rejecting a job application
  const handleRejectApplication = (employeeId: number) => {
    if (Platform.OS === "web") {
      if (confirm("Do you want to reject this job application?")) {
        updateStatus({
          employeeId,
          status: "revoked",
          canGivePoints: false,
        });
      }
    } else {
      Alert.alert(
        "Reject Application",
        "Do you want to reject this job application?",
        [
          {
            text: "Cancel",
            style: "cancel",
          },
          {
            text: "Reject",
            onPress: () =>
              updateStatus({
                employeeId,
                status: "revoked",
                canGivePoints: false,
              }),
            style: "destructive",
          },
        ]
      );
    }
  };

  // Refresh data when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      if (businessId && user?.id) {
        refetch();
      }
    }, [businessId, user?.id, refetch])
  );

  if (isPendingAuth) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#1e3a29" />
      </View>
    );
  }

  if (!user) return <Redirect href="/(tabs)" />;

  // Group employees by status
  const pendingEmployees =
    employees?.filter((emp) => emp.status === "pending") || [];
  const activeEmployees =
    employees?.filter((emp) => emp.status === "active") || [];

  console.log({ pendingEmployees, activeEmployees });
  return (
    <View style={styles.container}>
      {/* Header with title */}
      <View style={styles.headerContainer}>
        <ThemedText style={styles.headerTitle}>Employees</ThemedText>
        <TouchableOpacity style={styles.addButton}>
          <IconSymbol name="plus" size={16} color="white" />
          <ThemedText style={styles.addButtonText}>Add Employee</ThemedText>
        </TouchableOpacity>
      </View>

      {/* Loading state */}
      {isLoadingEmployees ? (
        <View style={styles.contentContainer}>
          <ActivityIndicator size="large" color="#1e3a29" />
          <ThemedText style={styles.messageText}>
            Loading employees...
          </ThemedText>
        </View>
      ) : !employees || employees.length === 0 ? (
        <View style={styles.contentContainer}>
          <IconSymbol name="person" size={48} color="#444" />
          <ThemedText style={styles.messageText}>No employees found</ThemedText>
          <TouchableOpacity style={styles.createButton}>
            <ThemedText style={styles.createButtonText}>
              Add Your First Employee
            </ThemedText>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.employeesContainer}>
          {/* Pending Applications Section */}
          {pendingEmployees.length > 0 && (
            <View style={styles.sectionContainer}>
              <View style={styles.sectionHeader}>
                <IconSymbol name="clock" size={18} color="#FFC107" />
                <ThemedText style={styles.sectionTitle}>
                  Pending Applications
                </ThemedText>
              </View>
              {pendingEmployees.map((employee, index) => (
                <EmployeeCard
                  key={`pending-${index}`}
                  employee={employee}
                  onApprove={handleApproveApplication}
                  onReject={handleRejectApplication}
                />
              ))}
            </View>
          )}

          {/* Active Employees Section */}
          {activeEmployees.length > 0 && (
            <View style={styles.sectionContainer}>
              <View style={styles.sectionHeader}>
                <IconSymbol
                  name="person.badge.shield.checkmark"
                  size={18}
                  color="#4CAF50"
                />
                <ThemedText style={styles.sectionTitle}>
                  Active Employees
                </ThemedText>
              </View>
              {activeEmployees.map((employee, index) => (
                <EmployeeCard key={`active-${index}`} employee={employee} />
              ))}
            </View>
          )}
        </View>
      )}

      {/* Refetching indicator */}
      {isRefetching && (
        <View style={styles.refetchingContainer}>
          <ActivityIndicator size="small" color="#1e3a29" />
          <ThemedText style={styles.refetchingText}>Updating...</ThemedText>
        </View>
      )}

      {/* Updating status indicator */}
      {isUpdating && (
        <View style={styles.updatingContainer}>
          <ActivityIndicator size="small" color="#1e3a29" />
          <ThemedText style={styles.updatingText}>
            Updating status...
          </ThemedText>
        </View>
      )}
    </View>
  );
}

function EmployeeCard({
  employee,
  onApprove,
  onReject,
}: {
  employee: GetBusinessEmployeesResponse[0];
  onApprove?: (employeeId: number) => void;
  onReject?: (employeeId: number) => void;
}) {
  const isPending = employee.status === "pending";

  return (
    <View style={[styles.employeeCard, isPending && styles.pendingCard]}>
      <LinearGradient
        colors={isPending ? ["#8B6F1A", "#C9A63C"] : ["#1e3a29", "#2d5a40"]}
        style={styles.cardHeader}
      >
        <View style={styles.employeeHeader}>
          {employee.employeeImage ? (
            <Image
              source={{ uri: employee.employeeImage }}
              style={styles.employeeImage}
            />
          ) : (
            <View style={styles.employeeImagePlaceholder}>
              <IconSymbol name="person" size={24} color="#fff" />
            </View>
          )}
          <View style={styles.employeeInfo}>
            <ThemedText style={styles.employeeName}>
              {employee.employeeName}
            </ThemedText>
            {isPending && (
              <View style={styles.statusBadge}>
                <IconSymbol name="clock" size={12} color="#FFC107" />
                <ThemedText style={styles.statusText}>
                  Pending Approval
                </ThemedText>
              </View>
            )}
          </View>
        </View>
      </LinearGradient>

      <View style={styles.employeeDetails}>
        <View style={styles.detailRow}>
          <IconSymbol name="mail" size={16} color="#ccc" />
          <ThemedText style={styles.detailText}>
            {employee.employeeEmail}
          </ThemedText>
        </View>

        <View style={styles.detailRow}>
          <IconSymbol
            name={employee.canGivePoints ? "star" : "star.slash"}
            size={16}
            color={employee.canGivePoints ? "#4CAF50" : "#F44336"}
          />
          <ThemedText
            style={[
              styles.detailText,
              {
                color: employee.canGivePoints ? "#4CAF50" : "#F44336",
              },
            ]}
          >
            {employee.canGivePoints ? "Can give points" : "Cannot give points"}
          </ThemedText>
        </View>
      </View>

      <View style={styles.cardFooter}>
        {isPending && onApprove && onReject ? (
          <View style={styles.actionButtons}>
            <TouchableOpacity
              style={[styles.actionButton, styles.rejectButton]}
              onPress={() => onReject(employee.employeeId)}
            >
              <IconSymbol name="xmark" size={14} color="#F44336" />
              <ThemedText
                style={[styles.actionButtonText, styles.rejectButtonText]}
              >
                Reject
              </ThemedText>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionButton, styles.approveButton]}
              onPress={() => onApprove(employee.employeeId)}
            >
              <IconSymbol name="checkmark" size={14} color="#4CAF50" />
              <ThemedText
                style={[styles.actionButtonText, styles.approveButtonText]}
              >
                Approve
              </ThemedText>
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity style={styles.editButton}>
            <IconSymbol name="pencil" size={14} color="#ccc" />
            <ThemedText style={styles.editButtonText}>Edit</ThemedText>
          </TouchableOpacity>
        )}
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
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#222",
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
  employeesContainer: {
    gap: 24,
  },
  sectionContainer: {
    gap: 12,
    marginBottom: 16,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 8,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#333",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#ccc",
  },
  employeeCard: {
    backgroundColor: "#1a1a1a",
    borderRadius: 12,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#333",
    marginBottom: 16,
  },
  pendingCard: {
    borderColor: "#FFC107",
  },
  cardHeader: {
    padding: 16,
  },
  employeeHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  employeeInfo: {
    flex: 1,
  },
  employeeImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#333",
  },
  employeeImagePlaceholder: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#333",
    justifyContent: "center",
    alignItems: "center",
  },
  employeeName: {
    fontSize: 18,
    fontWeight: "bold",
    color: "white",
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 4,
  },
  statusText: {
    fontSize: 12,
    color: "#FFC107",
    fontWeight: "500",
  },
  employeeDetails: {
    padding: 16,
    gap: 12,
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  detailText: {
    fontSize: 14,
    color: "#ccc",
  },
  cardFooter: {
    borderTopWidth: 1,
    borderTopColor: "#333",
    padding: 12,
    flexDirection: "row",
    justifyContent: "flex-end",
  },
  actionButtons: {
    flexDirection: "row",
    gap: 8,
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  approveButton: {
    backgroundColor: "rgba(76, 175, 80, 0.1)",
    borderWidth: 1,
    borderColor: "#4CAF50",
  },
  rejectButton: {
    backgroundColor: "rgba(244, 67, 54, 0.1)",
    borderWidth: 1,
    borderColor: "#F44336",
  },
  actionButtonText: {
    fontSize: 12,
  },
  approveButtonText: {
    color: "#4CAF50",
    fontWeight: "500",
  },
  rejectButtonText: {
    color: "#F44336",
    fontWeight: "500",
  },
  editButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    backgroundColor: "rgba(255, 255, 255, 0.05)",
  },
  editButtonText: {
    fontSize: 12,
    color: "#ccc",
  },
  refetchingContainer: {
    position: "absolute",
    top: 60,
    right: 16,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    borderRadius: 8,
    padding: 8,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  refetchingText: {
    fontSize: 12,
    color: "#ccc",
  },
  updatingContainer: {
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
  updatingText: {
    fontSize: 12,
    color: "#ccc",
  },
});
