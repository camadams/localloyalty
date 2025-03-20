import * as SecureStore from "expo-secure-store";

export function secureSave(key: string, value: string) {
  if (process.env.EXPO_OS === "web") {
    localStorage.setItem(key, value);
  } else {
    SecureStore.setItem(key, value);
  }
}

export function secureGet(key: string) {
  if (process.env.EXPO_OS === "web") {
    return localStorage.getItem(key);
  } else {
    return SecureStore.getItem(key);
  }
}

export function secureDelete(key: string) {
  if (process.env.EXPO_OS === "web") {
    localStorage.removeItem(key);
  } else {
    SecureStore.deleteItemAsync(key);
  }
}
