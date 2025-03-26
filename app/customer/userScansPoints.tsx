import {
  ActivityIndicator,
  StyleSheet,
  View,
  TouchableOpacity,
  Alert,
} from "react-native";

import { ThemedText } from "@/components/ThemedText";
import { Fragment, useEffect, useState } from "react";
import { Redirect, useLocalSearchParams, useRouter } from "expo-router";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { createNewCard } from "@/api/customerCards";
import { CameraView, Camera } from "expo-camera";

export default function NewCard() {
  const router = useRouter();
  const { user, isPending: isPendingSession } = useAuth();
  const queryClient = useQueryClient();

  // Camera and scanning state
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [scanned, setScanned] = useState(false);
  const [businessId, setBusinessId] = useState<string | null>(null);

  // Request camera permissions on component mount
  useEffect(() => {
    (async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === "granted");
    })();
  }, []);

  // Trigger card creation when business ID is available
  useEffect(() => {
    if (user && businessId && !isCreatingCard) {
      console.log({ businessId, love: 1111111111111, userId: user.id });
      createCard({ businessId, userId: user.id });
    }
  }, [businessId, user]);

  // Handle QR code scanning
  const handleBarcodeScanned = ({
    type,
    data,
  }: {
    type: string;
    data: string;
  }) => {
    try {
      setScanned(true);
      // Extract business ID from QR code data
      // Assuming QR code contains a URL like: https://localloyalty.expo.app/business?id=123
      const url = new URL(data);
      const id = url.searchParams.get("id");
      console.log({ id });
      if (id) {
        setBusinessId(id);
      } else {
        // If no ID found in URL, check if the data itself is an ID
        setBusinessId(data);
      }
    } catch (error) {
      console.error("Error parsing QR code:", error);
      // If URL parsing fails, assume the data itself is the business ID
      setBusinessId(data);
    }
  };

  // Mutation for creating a new card
  const { mutate: createCard, isPending: isCreatingCard } = useMutation({
    mutationFn: ({
      businessId,
      userId,
    }: {
      businessId: string;
      userId: string;
    }) => createNewCard({ businessId, userId }),
    onSuccess: () => {
      // Invalidate the cards query to refresh the cards list
      queryClient.invalidateQueries({ queryKey: ["cardsInUse"] });
      // Navigate back to the index page
      router.replace("/customer");
    },
    onError: (error) => {
      Alert.alert("Error creating card", error.message);
      console.error("Error creating card:", error);
      setScanned(false); // Allow rescanning on error
      setBusinessId(null);
    },
  });

  // Handle scanning again
  const handleScanAgain = () => {
    setScanned(false);
    setBusinessId(null);
  };

  if (isPendingSession) return <ActivityIndicator />;

  if (!user) return <Redirect href="/(tabs)" />;

  // Camera permission handling
  if (hasPermission === null) {
    return (
      <View style={styles.container}>
        <ThemedText>Requesting camera permission...</ThemedText>
        <ActivityIndicator />
      </View>
    );
  }

  if (hasPermission === false) {
    return (
      <View style={styles.container}>
        <ThemedText>
          No access to camera. Please enable camera permissions to scan QR
          codes.
        </ThemedText>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {!scanned ? (
        <Fragment>
          <ThemedText style={styles.title}>Scan Business QR Code</ThemedText>
          <ThemedText style={styles.subtitle}>
            Scan a QR code to add a new loyalty card
          </ThemedText>

          <View style={styles.cameraContainer}>
            <CameraView
              onBarcodeScanned={scanned ? undefined : handleBarcodeScanned}
              barcodeScannerSettings={{
                barcodeTypes: ["qr", "pdf417"],
              }}
              style={StyleSheet.absoluteFillObject}
            />
            <View style={styles.overlay}>
              <View style={styles.scanArea} />
            </View>
          </View>
        </Fragment>
      ) : isCreatingCard ? (
        <Fragment>
          <ThemedText style={styles.title}>Creating Loyalty Card</ThemedText>
          <ThemedText style={styles.subtitle}>
            Please wait while we create your loyalty card...
          </ThemedText>
          <ActivityIndicator
            size="large"
            color="#0000ff"
            style={styles.loader}
          />
        </Fragment>
      ) : (
        <Fragment>
          <ThemedText style={styles.title}>QR Code Scanned</ThemedText>
          <ThemedText style={styles.subtitle}>
            Business ID: {businessId}
          </ThemedText>
          <TouchableOpacity style={styles.button} onPress={handleScanAgain}>
            <ThemedText style={styles.buttonText}>Scan Again</ThemedText>
          </TouchableOpacity>
        </Fragment>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: "column",
    alignItems: "center",
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 20,
    textAlign: "center",
  },
  cameraContainer: {
    width: "100%",
    aspectRatio: 1,
    position: "relative",
    overflow: "hidden",
    borderRadius: 20,
    marginVertical: 20,
  },
  camera: {
    flex: 1,
  },
  overlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
  },
  scanArea: {
    width: 200,
    height: 200,
    borderWidth: 2,
    borderColor: "#fff",
    borderRadius: 10,
  },
  button: {
    backgroundColor: "#2196F3",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 5,
    marginTop: 20,
  },
  buttonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  loader: {
    marginTop: 30,
  },
});
