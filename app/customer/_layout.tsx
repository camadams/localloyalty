import { ThemedText } from "@/components/ThemedText";
import { AppButton } from "@/components/ui/AppButton";
import { IconSymbol } from "@/components/ui/IconSymbol";
import { Stack, Tabs } from "expo-router";
import { Alert } from "react-native";

export default function CustomerLayout() {
  return (
    <Tabs
      screenOptions={{
        // headerStyle: { backgroundColor: "#" },
        // headerTitleStyle: { color: "white" },
        headerTitle: () => <ThemedText></ThemedText>,
      }}
    >
      {/* Optionally configure static options outside the route.*/}
      {/* <Tabs.Screen
        name="index"
        options={{
          title: "Cards",
          tabBarIcon: ({ color }) => (
            <IconSymbol size={28} name="creditcard.and.123" color={color} />
          ),
        }}
      /> */}
      <Tabs.Screen
        name="index"
        options={{
          title: "Cards",
          tabBarIcon: ({ color }) => (
            <IconSymbol size={28} name="creditcard.and.123" color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="addOrScanLoyaltyCard"
        options={{
          title: "Scan",
          tabBarIcon: ({ color }) => (
            <IconSymbol size={28} name="qrcode" color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
