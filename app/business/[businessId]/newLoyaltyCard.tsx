import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { getUser } from "@/db/dummyData";
import { loyaltyCards, NewLoyaltyCard, User } from "@/db/schema";
import { Redirect, router, useGlobalSearchParams } from "expo-router";
import React, { useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { TextInput, Button, StyleSheet } from "react-native";

type FormData = {
  name: string;
  ownerId: string;
};

export default function NewBusiness() {
  const [user, setUser] = useState<User | undefined>(undefined);
  const [isLoadingUser, setIsLoadingUser] = useState<boolean>(true);
  const [formData, setFormData] = useState<NewLoyaltyCard>(
    {} as NewLoyaltyCard
  );
  const [error, setError] = useState(""); // State to store validation error
  const [apiError, setAPIError] = useState<string | undefined>(undefined); // State to store validation error

  const { businessId } = useGlobalSearchParams();
  useEffect(() => {
    async function start() {
      try {
        const user = await getUser();

        setUser(user);
        setIsLoadingUser(false);

        const userId = user?.id!;
        console.log({ userId });
        setFormData((prev) => ({
          ...prev,
          userId: userId,
          businessId: Number(businessId),
        }));
      } catch (e) {
        console.log(e);
      }
    }
    start();
  }, []);

  if (isLoadingUser)
    return (
      <ThemedView>
        <ThemedText>"loading user..."</ThemedText>
      </ThemedView>
    );

  if (!user) return <Redirect href="/" />;

  //   const {
  //     control,
  //     handleSubmit,
  //     formState: { errors },
  //   } = useForm<FormData>();
  //   const [submittedData, setSubmittedData] = useState<FormData | null>(null);

  // Handle form submission
  const handleSubmit = async () => {
    try {
      // if (formData.name.length < 3) {
      //   setError("Name must be at least 3 characters long");
      //   return;
      // }
      setError(""); // Clear error if validation passes
      const resp = await fetch("/api/business/addBusinessLoyaltyCard", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const respData = await resp.json();
      const message = respData.message;
      router.back();
    } catch (e) {
      setAPIError((e as Error).message);
    }
  };

  return (
    <ThemedView style={{ padding: 20, backgroundColor: "slategray" }}>
      {/* <ThemedText style={{ fontSize: 18, fontWeight: "bold" }}>
        Create New Business
      </ThemedText> */}

      {/* <ThemedText style={{ marginTop: 10 }}>Your Business Name:</ThemedText> */}
      <TextInput
        style={{
          height: 40,
          borderWidth: 1,
          marginVertical: 10,
          paddingHorizontal: 8,
        }}
        placeholder="Enter the description of the card"
        value={formData.description}
        onChangeText={(text) =>
          setFormData((prev) => ({ ...prev, description: text }))
        }
      />

      <TextInput
        style={{
          height: 40,
          borderWidth: 1,
          marginVertical: 10,
          paddingHorizontal: 8,
        }}
        placeholder="Enter the max points of the card"
        value={formData.maxPoints?.toString()}
        onChangeText={(text) =>
          setFormData((prev) => ({ ...prev, maxPoints: parseInt(text) }))
        }
      />

      <ThemedView style={{ backgroundColor: "blue" }}>
        <Button title="Submit" onPress={handleSubmit} />
      </ThemedView>

      {error && (
        <ThemedText style={{ color: "red", marginBottom: 10 }}>
          {error}
        </ThemedText>
      )}

      {apiError && (
        <ThemedText style={{ color: "red", marginBottom: 10 }}>
          {apiError}
        </ThemedText>
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: "slategray",
  },
  input: {
    height: 40,
    // borderColor: "black",
    borderWidth: 1,
    marginBottom: 10,
    padding: 8,
    // textShadowColor: "white",
  },
  errorText: {
    color: "red",
    marginBottom: 10,
  },
  submittedContainer: {
    marginTop: 20,
  },
  submittedTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 8,
  },
  button: {
    marginTop: 20,
  },
});
