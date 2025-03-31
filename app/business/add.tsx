import {
  StyleSheet,
  View,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from "react-native";
import { ThemedText } from "@/components/ThemedText";
import { Redirect, useRouter } from "expo-router";
import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createBusiness } from "@/api/businessData";
import { IconSymbol } from "@/components/ui/IconSymbol";
import { LinearGradient } from "expo-linear-gradient";

type BusinessFormData = {
  name: string;
};

export default function NewBusiness() {
  const router = useRouter();
  const { user, contextLoading: isPendingAuth } = useAuth();
  const queryClient = useQueryClient();

  // Form state
  const [formData, setFormData] = useState<BusinessFormData>({
    name: "",
  });

  // Form validation state
  const [errors, setErrors] = useState<{
    name?: string;
  }>({});

  // Create mutation
  const {
    mutate,
    isPending: isSubmitting,
    error: submitError,
  } = useMutation({
    mutationFn: (data: { name: string }) => createBusiness(data.name),
    onSuccess: () => {
      // Invalidate the query to refresh the businesses list
      queryClient.invalidateQueries({
        queryKey: ["businesses"],
      });
      router.back();
    },
  });

  // Validate form
  const validateForm = (): boolean => {
    const newErrors: typeof errors = {};

    if (!formData.name.trim()) {
      newErrors.name = "Business name is required";
    } else if (formData.name.trim().length < 3) {
      newErrors.name = "Business name must be at least 3 characters long";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = () => {
    if (validateForm()) {
      mutate({ name: formData.name });
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
        <View style={styles.formContainer}>
          <LinearGradient
            colors={["#1e3a29", "#2d5a40"]}
            style={styles.formHeader}
          >
            <IconSymbol name="building.2" size={24} color="white" />
            <ThemedText style={styles.formHeaderTitle}>New Business</ThemedText>
          </LinearGradient>

          <View style={styles.formBody}>
            {/* Business Name Field */}
            <View style={styles.formGroup}>
              <ThemedText style={styles.label}>Business Name *</ThemedText>
              <TextInput
                style={[styles.input, errors.name && styles.inputError]}
                placeholder="Enter business name"
                placeholderTextColor="#666"
                value={formData.name}
                onChangeText={(text) =>
                  setFormData((prev) => ({ ...prev, name: text }))
                }
              />
              {errors.name && (
                <ThemedText style={styles.errorText}>{errors.name}</ThemedText>
              )}
              <ThemedText style={styles.helperText}>
                This will be displayed to customers
              </ThemedText>
            </View>

            {/* Submit Button */}
            <TouchableOpacity
              style={[
                styles.submitButton,
                isSubmitting && styles.disabledButton,
              ]}
              onPress={handleSubmit}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <>
                  <IconSymbol name="plus" size={18} color="white" />
                  <ThemedText style={styles.submitButtonText}>
                    Create Business
                  </ThemedText>
                </>
              )}
            </TouchableOpacity>

            {/* Display API error if any */}
            {submitError && (
              <ThemedText style={styles.errorText}>
                {submitError instanceof Error
                  ? submitError.message
                  : "An error occurred"}
              </ThemedText>
            )}
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
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
  scrollContainer: {
    flexGrow: 1,
    padding: 16,
  },
  formContainer: {
    backgroundColor: "#1a1a1a",
    borderRadius: 8,
    overflow: "hidden",
    marginVertical: 16,
  },
  formHeader: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
  },
  formHeaderTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "white",
    marginLeft: 8,
  },
  formBody: {
    padding: 16,
  },
  formGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 8,
    color: "#ccc",
  },
  input: {
    backgroundColor: "#2a2a2a",
    color: "white",
    borderRadius: 4,
    padding: 12,
    fontSize: 16,
    borderWidth: 1,
    borderColor: "#444",
  },
  inputError: {
    borderColor: "#ff4d4f",
  },
  errorText: {
    color: "#ff4d4f",
    marginTop: 4,
    fontSize: 14,
  },
  helperText: {
    color: "#888",
    fontSize: 12,
    marginTop: 4,
  },
  submitButton: {
    backgroundColor: "#1e3a29",
    borderRadius: 4,
    padding: 14,
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 10,
  },
  disabledButton: {
    opacity: 0.7,
  },
  submitButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
    marginLeft: 8,
  },
});
