import { Stack, Tabs } from "expo-router";
import React from "react";
import FontAwesome5 from "@expo/vector-icons/FontAwesome5";
import FontAwesome6 from "@expo/vector-icons/FontAwesome6";
import { useColorScheme } from "@/hooks/useColorScheme";
// import { useColorScheme } from "@/hooks/useColorScheme";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { Text } from "react-native";
export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <Stack>
      <Stack.Screen
        name="(tabs)"
        options={{
          title: "Back",
          headerShown: false,
        }}
      />
      <Stack.Screen name="newLoyaltyCard" options={{ title: "Create" }} />
    </Stack>
  );
}
