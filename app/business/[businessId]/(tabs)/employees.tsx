import {
  ActivityIndicator,
  StyleSheet,
  View,
  TouchableOpacity,
  Image,
} from "react-native";

import { ThemedText } from "@/components/ThemedText";
import { Redirect } from "expo-router";
import { useGlobalSearchParams } from "expo-router/build/hooks";
import { useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { getBusinessEmployees } from "@/api/businessData";
import { IconSymbol } from "@/components/ui/IconSymbol";
import { useFocusEffect } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";
import { GetBusinessEmployeesResponse } from "@/app/api/business/getBusinessEmployees+api";

export default function EmployeesScreen() {
  const { businessId } = useGlobalSearchParams<{ businessId: string }>();
  const { user, isPending: isPendingAuth } = useAuth();

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
          {employees.map((employee, index) => (
            <EmployeeCard key={index} employee={employee} />
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

function EmployeeCard({
  employee,
}: {
  employee: GetBusinessEmployeesResponse[0];
}) {
  return (
    <View style={styles.employeeCard}>
      <LinearGradient colors={["#1e3a29", "#2d5a40"]} style={styles.cardHeader}>
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
          <ThemedText style={styles.employeeName}>
            {employee.employeeName}
          </ThemedText>
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
        <TouchableOpacity style={styles.editButton}>
          <IconSymbol name="pencil" size={14} color="#ccc" />
          <ThemedText style={styles.editButtonText}>Edit</ThemedText>
        </TouchableOpacity>
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
    gap: 16,
  },
  employeeCard: {
    backgroundColor: "#1a1a1a",
    borderRadius: 12,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#333",
    marginBottom: 16,
  },
  cardHeader: {
    padding: 16,
  },
  employeeHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
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
});
