import { ThemedText } from "@/components/ThemedText";
import { IconSymbol } from "@/components/ui/IconSymbol";
import { Stack, Tabs } from "expo-router";

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
        name="newCard"
        options={{
          title: "Add Card",
          tabBarIcon: ({ color }) => (
            <IconSymbol size={28} name="plus.app" color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
