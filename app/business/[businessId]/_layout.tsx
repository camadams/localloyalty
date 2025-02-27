import { Tabs } from "expo-router";
import React from "react";
import { Platform } from "react-native";
import FontAwesome5 from "@expo/vector-icons/FontAwesome5";
import { HapticTab } from "@/components/HapticTab";
import { IconSymbol } from "@/components/ui/IconSymbol";
import TabBarBackground from "@/components/ui/TabBarBackground";
import { Colors } from "@/constants/Colors";
import FontAwesome6 from "@expo/vector-icons/FontAwesome6";
import { useColorScheme } from "@/hooks/useColorScheme";
// import { useColorScheme } from "@/hooks/useColorScheme";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <Tabs>
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
        }}
      />
      <Tabs.Screen
        name="loyaltyCards"
        options={{
          title: "Cards",
          tabBarIcon: ({ color }) => (
            <MaterialCommunityIcons
              name="card-text-outline"
              size={24}
              color={color}
            />
          ),
        }}
      />
    </Tabs>
  );
}
