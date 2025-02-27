import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { getUser } from "@/db/dummyData";
import { User } from "@/db/schema";
import { Redirect, router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { TextInput, Button, StyleSheet } from "react-native";
import QRCode from "react-native-qrcode-svg";

type FormData = {
  name: string;
  ownerId: string;
};

export default function NewBusiness() {
  const [user, setUser] = useState<User | undefined>(undefined);
  const [isLoadingUser, setIsLoadingUser] = useState<boolean>(true);
  const [error, setError] = useState(""); // State to store validation error
  const { id } = useLocalSearchParams();
  useEffect(() => {
    async function start() {
      try {
        const user = await getUser();

        setUser(user);
        setIsLoadingUser(false);
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

  return (
    <ThemedView>
      <ThemedView
        style={{
          alignItems: "center",
          justifyContent: "center",
          flex: 1,
          width: 100,
          height: 100,
          backgroundColor: "slategray",
        }}
      >
        <QRCode
          value={`/customer/newCard?businessId=${id}`}
          backgroundColor="slategray"
        />
      </ThemedView>{" "}
    </ThemedView>
  );
}
