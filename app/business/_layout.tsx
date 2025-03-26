import { ThemedText } from "@/components/ThemedText";
import { IconSymbol } from "@/components/ui/IconSymbol";
import { Stack } from "expo-router";
import { StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function BusinessLayout() {
  const insets = useSafeAreaInsets();

  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: "#1e3a29" },
        headerTitleStyle: { color: "white" },
        headerTintColor: "white",
        contentStyle: { backgroundColor: "#0a0a0a" },
        headerShadowVisible: false,
        headerBackTitle: "Back",
      }}
    >
      <Stack.Screen
        name="index"
        options={{
          // headerShown: false,
          headerTitle: () => (
            <View style={styles.headerTitleContainer}>
              <IconSymbol name="building.2" size={24} color="white" />
              <ThemedText style={styles.headerTitle}>
                Your Businesses
              </ThemedText>
            </View>
          ),
        }}
      />
      <Stack.Screen
        name="new"
        options={{
          headerTitle: () => (
            <View style={styles.headerTitleContainer}>
              <IconSymbol name="plus.app" size={24} color="white" />
              <ThemedText style={styles.headerTitle}>
                Create Business
              </ThemedText>
            </View>
          ),
        }}
      />
      <Stack.Screen
        name="asdfasdf"
        options={{
          headerTitle: () => (
            <View style={styles.headerTitleContainer}>
              <IconSymbol name="qrcode" size={24} color="white" />
              <ThemedText style={styles.headerTitle}>
                Business QR Code
              </ThemedText>
            </View>
          ),
        }}
      />
      <Stack.Screen
        name="[businessId]"
        options={{
          headerShown: false,
        }}
      />
      {/* <Stack.Screen
        name="asdf"
        options={{
          headerShown: false,
        }}
      /> */}
    </Stack>
  );
}

const styles = StyleSheet.create({
  headerTitleContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "white",
  },
});
