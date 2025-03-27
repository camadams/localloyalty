import {
  ActivityIndicator,
  StyleSheet,
  View,
  TouchableOpacity,
  Alert,
  Platform,
} from "react-native";

import { ThemedText } from "@/components/ThemedText";
import { Fragment, useEffect, useState } from "react";
import { Redirect, useLocalSearchParams, useRouter } from "expo-router";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { CameraView, Camera } from "expo-camera";
import { addOrScan } from "@/api/customerCards";
import { CardInUse } from "@/db/schema";

export default function UserScansPoints() {
  const router = useRouter();
  const { user, isPending: isPendingSession } = useAuth();
  const queryClient = useQueryClient();

  // Camera and scanning state
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [scanned, setScanned] = useState(false);
  const [loyaltyCardId, setLoyaltyCardId] = useState<
    CardInUse["loyaltyCardId"] | null
  >(null);

  // Request camera permissions on component mount
  useEffect(() => {
    (async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === "granted");
    })();
  }, []);

  // Trigger points increment when card ID is available
  useEffect(() => {
    if (loyaltyCardId && !isAddingOrScanning) {
      console.log({ cardId: loyaltyCardId });
      addOrScanMutate({
        loyaltyCardId: loyaltyCardId,
        userId: user?.id ?? "",
      });
    }
  }, [loyaltyCardId]);

  // Handle QR code scanning
  const handleBarcodeScanned = ({ data }: { data: string }) => {
    try {
      setScanned(true);
      // Extract loyalty card ID from QR code data
      // Assuming QR code contains a URL like: https://localloyalty.expo.app/business?loyaltyCardId=123
      const url = new URL(data);
      console.log({ url });
      const loyaltyCardId = url.searchParams.get("loyaltyCardId");
      setLoyaltyCardId(Number(loyaltyCardId));
    } catch (error) {
      const errorMessage = "Error adding points: " + (error as Error).message;
      if (Platform.OS === "web") {
        alert(errorMessage);
      } else {
        Alert.alert(errorMessage);
      }
      console.error(errorMessage);
      setScanned(false); // Allow rescanning on error
      setLoyaltyCardId(null);
    }
  };

  // Mutation for incrementing points
  const { mutate: addOrScanMutate, isPending: isAddingOrScanning } =
    useMutation({
      mutationFn: ({
        loyaltyCardId,
        userId,
      }: {
        loyaltyCardId: CardInUse["loyaltyCardId"];
        userId: CardInUse["userId"];
      }) => addOrScan(loyaltyCardId, userId),
      onSuccess: () => {
        // Invalidate the cards query to refresh the cards list
        queryClient.invalidateQueries({ queryKey: ["cardsInUse"] });
        Alert.alert("Success", "Points added successfully!");
        // Navigate back to the customer page
        router.replace("/customer");
      },
      onError: (error) => {
        Alert.alert("Error adding points", error.message);
        console.error("Error adding points:", error);
        setScanned(false); // Allow rescanning on error
        setLoyaltyCardId(null);
      },
    });

  // Handle scanning again
  const handleScanAgain = () => {
    setScanned(false);
    setLoyaltyCardId(null);
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
          <ThemedText style={styles.title}>
            Scan Loyalty Card QR Code
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
      ) : isAddingOrScanning ? (
        <Fragment>
          <ThemedText style={styles.title}>Please Wait</ThemedText>
          <ActivityIndicator
            size="large"
            color="#0000ff"
            style={styles.loader}
          />
        </Fragment>
      ) : (
        <Fragment>
          <ThemedText style={styles.title}>QR Code Scanned</ThemedText>
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
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  scanArea: {
    width: 200,
    height: 200,
    borderWidth: 2,
    borderColor: "#fff",
    backgroundColor: "transparent",
  },
  button: {
    backgroundColor: "#1e3a29",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    marginTop: 20,
  },
  buttonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "500",
  },
  loader: {
    marginTop: 20,
  },
});
