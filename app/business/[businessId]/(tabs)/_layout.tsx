import { Tabs } from "expo-router";
import React from "react";
import FontAwesome5 from "@expo/vector-icons/FontAwesome5";
import FontAwesome6 from "@expo/vector-icons/FontAwesome6";
import { useColorScheme } from "@/hooks/useColorScheme";
// import { useColorScheme } from "@/hooks/useColorScheme";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { ThemedText } from "@/components/ThemedText";
export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <Tabs
      screenOptions={{
        headerStyle: { backgroundColor: "#1e3a29" },
        headerTitleStyle: { color: "white" },
        headerTintColor: "white",
        // contentStyle: { backgroundColor: "#0a0a0a" },
        headerShadowVisible: false,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Loyalty Cards",
          tabBarIcon: ({ color }) => (
            <MaterialCommunityIcons
              name="card-text-outline"
              size={24}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="details"
        options={{
          title: "Details",
          // headerTintColor:"#123122",
          headerStyle: { backgroundColor: "#123122" },
          tabBarIcon: ({ color }) => (
            <FontAwesome6 name="circle-info" size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="employees"
        options={{
          title: "Employees",
          tabBarIcon: ({ color }) => (
            <FontAwesome5 name="user-friends" size={24} color={color} />
          ),
          tabBarShowLabel: false,
        }}
      />
    </Tabs>
  );
}
