import { ThemedText } from "@/components/ThemedText";
import { Stack } from "expo-router";

export default function DashboardLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: "#123122" },
        headerTitleStyle: { color: "white" },
        headerTitle: () => <ThemedText>Business portal</ThemedText>,
      }}
    >
      {/* Optionally configure static options outside the route.*/}
      <Stack.Screen name="index" options={{}} />
    </Stack>
  );
}
