import {
  StyleSheet,
  View,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Switch,
} from "react-native";
import { ThemedText } from "@/components/ThemedText";
import { Redirect, useRouter, useGlobalSearchParams } from "expo-router";
import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createLoyaltyCard } from "@/api/businessData";
import { NewCard } from "@/db/schema";
import { IconSymbol } from "@/components/ui/IconSymbol";
import { LinearGradient } from "expo-linear-gradient";

type LoyaltyCardFormData = {
  description: string;
  maxPoints: number;
  status: "active" | "expired" | "suspended" | "revoked";
  artworkUrl?: string;
};

export default function NewLoyaltyCardScreen() {
  const router = useRouter();
  const { businessId } = useGlobalSearchParams<{ businessId: string }>();
  const { user, isPending: isPendingAuth } = useAuth();
  const queryClient = useQueryClient();

  // Form state
  const [formData, setFormData] = useState<LoyaltyCardFormData>({
    description: "",
    maxPoints: 10,
    status: "active",
    artworkUrl: "",
  });

  // Form validation state
  const [errors, setErrors] = useState<{
    description?: string;
    maxPoints?: string;
  }>({});

  // Create mutation
  const {
    mutate,
    isPending: isSubmitting,
    error: submitError,
  } = useMutation({
    mutationFn: (data: Omit<NewCard, "id">) => createLoyaltyCard(data),
    onSuccess: () => {
      // Invalidate the query to refresh the loyalty cards list
      queryClient.invalidateQueries({
        queryKey: ["businessLoyaltyCards", businessId],
      });
      router.back();
    },
  });

  // Validate form
  const validateForm = (): boolean => {
    const newErrors: typeof errors = {};

    if (!formData.description.trim()) {
      newErrors.description = "Description is required";
    }

    if (!formData.maxPoints || formData.maxPoints < 1) {
      newErrors.maxPoints = "Max points must be at least 1";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = () => {
    if (validateForm()) {
      const cardData: Omit<NewCard, "id"> = {
        businessId: Number(businessId),
        userId: user!.id,
        description: formData.description,
        maxPoints: formData.maxPoints,
        status: formData.status,
        artworkUrl:
          formData.artworkUrl && formData.artworkUrl.trim() !== ""
            ? formData.artworkUrl
            : null,
      };

      mutate(cardData);
    }
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
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {/* <View style={styles.headerContainer}>
          <TouchableOpacity 
            style={styles.backButton} 
            onPress={() => router.back()}
          >
            <IconSymbol name="chevron.left" size={20} color="white" />
            <ThemedText style={styles.backButtonText}>Back</ThemedText>
          </TouchableOpacity>
          <ThemedText style={styles.headerTitle}>
            Create Loyalty Card
          </ThemedText>
        </View> */}

        <View style={styles.formContainer}>
          <LinearGradient
            colors={["#1e3a29", "#2d5a40"]}
            style={styles.formHeader}
          >
            <IconSymbol name="creditcard" size={24} color="white" />
            <ThemedText style={styles.formHeaderTitle}>Card Details</ThemedText>
          </LinearGradient>

          <View style={styles.formBody}>
            {/* Description Field */}
            <View style={styles.formGroup}>
              <ThemedText style={styles.label}>Description *</ThemedText>
              <TextInput
                style={[styles.input, errors.description && styles.inputError]}
                placeholder="Enter card description"
                placeholderTextColor="#666"
                value={formData.description}
                onChangeText={(text) =>
                  setFormData((prev) => ({ ...prev, description: text }))
                }
              />
              {errors.description && (
                <ThemedText style={styles.errorText}>
                  {errors.description}
                </ThemedText>
              )}
              <ThemedText style={styles.helperText}>
                This will be displayed on the loyalty card
              </ThemedText>
            </View>

            {/* Max Points Field */}
            <View style={styles.formGroup}>
              <ThemedText style={styles.label}>Points Required *</ThemedText>
              <TextInput
                style={[styles.input, errors.maxPoints && styles.inputError]}
                placeholder="Enter points required for reward"
                placeholderTextColor="#666"
                keyboardType="numeric"
                value={formData.maxPoints.toString()}
                onChangeText={(text) =>
                  setFormData((prev) => ({
                    ...prev,
                    maxPoints: text ? parseInt(text, 10) : 0,
                  }))
                }
              />
              {errors.maxPoints && (
                <ThemedText style={styles.errorText}>
                  {errors.maxPoints}
                </ThemedText>
              )}
              <ThemedText style={styles.helperText}>
                Number of points needed to earn a reward
              </ThemedText>
            </View>

            {/* Status Field */}
            <View style={styles.formGroup}>
              <ThemedText style={styles.label}>Status</ThemedText>
              <View style={styles.statusContainer}>
                <ThemedText style={styles.statusText}>Active</ThemedText>
                <Switch
                  trackColor={{ false: "#767577", true: "#1e3a29" }}
                  thumbColor={
                    formData.status === "active" ? "#4CAF50" : "#f4f3f4"
                  }
                  ios_backgroundColor="#3e3e3e"
                  onValueChange={(value) =>
                    setFormData((prev) => ({
                      ...prev,
                      status: value ? "active" : "suspended",
                    }))
                  }
                  value={formData.status === "active"}
                />
              </View>
              <ThemedText style={styles.helperText}>
                Only active cards can be used by customers
              </ThemedText>
            </View>

            {/* Artwork URL Field (Optional) */}
            <View style={styles.formGroup}>
              <ThemedText style={styles.label}>
                Artwork URL (Optional)
              </ThemedText>
              <TextInput
                style={styles.input}
                placeholder="Enter URL to card artwork"
                placeholderTextColor="#666"
                value={formData.artworkUrl}
                onChangeText={(text) =>
                  setFormData((prev) => ({ ...prev, artworkUrl: text }))
                }
              />
              <ThemedText style={styles.helperText}>
                Custom image to display on the card
              </ThemedText>
            </View>
          </View>
        </View>

        {submitError && (
          <View style={styles.errorContainer}>
            <IconSymbol
              name="exclamationmark.triangle"
              size={20}
              color="#F44336"
            />
            <ThemedText style={styles.submissionErrorText}>
              {submitError instanceof Error
                ? submitError.message
                : "An error occurred"}
            </ThemedText>
          </View>
        )}

        <TouchableOpacity
          style={styles.submitButton}
          onPress={handleSubmit}
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <ActivityIndicator size="small" color="white" />
          ) : (
            <>
              <IconSymbol name="plus" size={16} color="white" />
              <ThemedText style={styles.submitButtonText}>
                Create Loyalty Card
              </ThemedText>
            </>
          )}
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0a0a0a",
  },
  scrollContainer: {
    padding: 16,
    paddingBottom: 40,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#0a0a0a",
  },
  headerContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 24,
    paddingVertical: 12,
  },
  backButton: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 16,
  },
  backButtonText: {
    fontSize: 16,
    color: "#ccc",
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
    flex: 1,
  },
  formContainer: {
    backgroundColor: "#1a1a1a",
    borderRadius: 12,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#333",
    marginBottom: 24,
  },
  formHeader: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    gap: 12,
  },
  formHeaderTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "white",
  },
  formBody: {
    padding: 16,
    gap: 20,
  },
  formGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    marginBottom: 8,
    color: "#ccc",
  },
  input: {
    backgroundColor: "#222",
    borderWidth: 1,
    borderColor: "#444",
    borderRadius: 8,
    padding: 12,
    color: "white",
    fontSize: 16,
  },
  inputError: {
    borderColor: "#F44336",
  },
  errorText: {
    color: "#F44336",
    fontSize: 14,
    marginTop: 4,
  },
  helperText: {
    color: "#888",
    fontSize: 12,
    marginTop: 4,
  },
  statusContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#222",
    borderWidth: 1,
    borderColor: "#444",
    borderRadius: 8,
    padding: 12,
  },
  statusText: {
    fontSize: 16,
    color: "#ccc",
  },
  errorContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(244, 67, 54, 0.1)",
    borderRadius: 8,
    padding: 12,
    marginBottom: 20,
    gap: 8,
  },
  submissionErrorText: {
    color: "#F44336",
    fontSize: 14,
    flex: 1,
  },
  submitButton: {
    backgroundColor: "#1e3a29",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    borderRadius: 8,
    gap: 8,
  },
  submitButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
});
