import { ThemedText } from "@/components/ThemedText";
import { Stack } from "expo-router";

export default function BusinessLayout() {
  return (
    <Stack>
      {/* Optionally configure static options outside the route.*/}
      <Stack.Screen
        name="index"
        options={{
          headerStyle: { backgroundColor: "#123122" },
          headerTitleStyle: { color: "white" },
          headerTitle: () => <ThemedText>Your businesses</ThemedText>,
        }}
      />
      <Stack.Screen
        name="new"
        options={{
          headerStyle: { backgroundColor: "#123122" },
          headerTitleStyle: { color: "white" },
          headerTitle: () => <ThemedText>Create New Business</ThemedText>,
        }}
      />
      <Stack.Screen
        name="asdfasdf"
        options={{
          headerStyle: { backgroundColor: "#123122" },
          headerTitleStyle: { color: "white" },
          headerTitle: () => <ThemedText>QR Code</ThemedText>,
        }}
      />
      <Stack.Screen
        name="[businessId]"
        options={{
          headerShown: false,
        }}
      />
    </Stack>
  );
}
