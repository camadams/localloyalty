import React from "react";
import {
  Text,
  Pressable,
  StyleSheet,
  StyleProp,
  ViewStyle,
  ActivityIndicator,
  View,
} from "react-native";

export function AppButton({
  children,
  onPress,
  style,
  disabled,
  isLoading,
  icon,
}: {
  children: React.ReactNode;
  onPress: () => void;
  style?: StyleProp<ViewStyle>;
  disabled?: boolean;
  isLoading?: boolean;
  icon?: React.ReactNode;
}) {
  return (
    <Pressable
      disabled={disabled}
      style={[styles.button, disabled && styles.disabled, style]}
      onPress={onPress}
    >
      {isLoading ? (
        <ActivityIndicator color="white" size="small" />
      ) : (
        <View style={styles.buttonContent}>
          <Text style={styles.buttonText}>{children}</Text>
          {icon}
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    padding: 12,
    borderRadius: 8,
    width: 140,
    backgroundColor: "#4A90E2",
    gap: 2,
  },
  buttonContent: {
    gap: 4,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  disabled: {
    backgroundColor: "#aaa",
  },
  buttonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
    textAlign: "center",
  },
});
