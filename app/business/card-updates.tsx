import { ActivityIndicator, Button, StyleSheet, View } from "react-native";
import { ThemedText } from "@/components/ThemedText";
import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";

// Function to send a refresh signal to the WebSocket server's HTTP endpoint
async function sendRefreshSignal(businessId?: string) {
  try {
    // Send a request directly to our WebSocket server's HTTP endpoint
    const response = await fetch('http://localhost:8081/broadcast-refresh', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        businessId: businessId || 'all' // If no businessId is provided, broadcast to all
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to send refresh signal');
    }

    return await response.json();
  } catch (error) {
    console.error('Error sending refresh signal:', error);
    throw error;
  }
}

export default function CardUpdatesScreen() {
  const { user, isPending: isPendingSession } = useAuth();
  const [isSending, setIsSending] = useState(false);
  const [lastBroadcast, setLastBroadcast] = useState<string | null>(null);

  // Function to handle the broadcast button press
  const handleBroadcast = async () => {
    if (!user?.id) return;
    
    setIsSending(true);
    try {
      await sendRefreshSignal(user.id);
      setLastBroadcast(new Date().toLocaleTimeString());
    } catch (error) {
      console.error('Failed to broadcast refresh signal:', error);
    } finally {
      setIsSending(false);
    }
  };

  // Function to broadcast to all customers (admin only)
  const handleBroadcastAll = async () => {
    setIsSending(true);
    try {
      await sendRefreshSignal(); // No businessId means broadcast to all
      setLastBroadcast(new Date().toLocaleTimeString());
    } catch (error) {
      console.error('Failed to broadcast refresh signal to all:', error);
    } finally {
      setIsSending(false);
    }
  };

  if (isPendingSession) return <ActivityIndicator />;

  return (
    <View style={styles.container}>
      <ThemedText style={styles.title}>Card Update Broadcasting</ThemedText>
      
      <View style={styles.infoContainer}>
        <ThemedText>Use this page to notify your customers to refresh their loyalty card data.</ThemedText>
        <ThemedText style={styles.infoText}>
          When you make changes to loyalty cards in your database, click the button below to notify
          customers who are currently viewing your loyalty cards to refresh their data.
        </ThemedText>
      </View>

      <View style={styles.buttonContainer}>
        <Button
          title={isSending ? "Sending..." : "Broadcast Refresh Signal"}
          onPress={handleBroadcast}
          disabled={isSending || !user?.id}
        />
      </View>

      {/* Admin-only section for broadcasting to all users */}
      {user && typeof user === 'object' && 'isAdmin' in user && (user.isAdmin === true) && (
        <View style={[styles.buttonContainer, styles.adminSection]}>
          <ThemedText style={styles.adminTitle}>Admin Controls</ThemedText>
          <Button
            title={isSending ? "Sending..." : "Broadcast to ALL Customers"}
            onPress={handleBroadcastAll}
            disabled={isSending}
            color="#d9534f" // Red color to indicate caution
          />
        </View>
      )}

      {lastBroadcast && (
        <View style={styles.statusContainer}>
          <ThemedText>Last broadcast sent at: {lastBroadcast}</ThemedText>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  infoContainer: {
    marginBottom: 30,
  },
  infoText: {
    marginTop: 10,
    opacity: 0.7,
  },
  buttonContainer: {
    marginBottom: 20,
  },
  statusContainer: {
    marginTop: 20,
    padding: 10,
    backgroundColor: '#e8f5e9',
    borderRadius: 5,
  },
  adminSection: {
    marginTop: 40,
    padding: 15,
    backgroundColor: '#fff3cd',
    borderRadius: 8,
  },
  adminTitle: {
    fontWeight: 'bold',
    marginBottom: 10,
  },
});
