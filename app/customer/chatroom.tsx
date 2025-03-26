import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import { getCardsInUse } from "@/api/customerCards";

type Message = {
  id: string;
  type: string;
  name: string;
  message: string;
  timestamp: number;
};

export default function ChatRoom() {
  const { user, isPending: isPendingSession } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const [connectionStatus, setConnectionStatus] = useState("Disconnected");
  const [userName, setUserName] = useState("");
  const websocketRef = useRef<WebSocket | null>(null);
  const flatListRef = useRef<FlatList>(null);

  const { data: usersCards, isLoading: isLoadingCardsInUse } = useQuery({
    queryKey: ["cardsInUse"],
    queryFn: () => getCardsInUse(user?.id ?? ""),
  });

  useEffect(() => {
    connectWebSocket();

    return () => {
      if (websocketRef.current) {
        websocketRef.current.close();
      }
    };
  }, []);

  const connectWebSocket = () => {
    // Use secure WebSocket if in production, otherwise use local development server
    // Replace with your actual Fly.io URL in production
    const serverUrl = "wss://localloyalty.fly.dev";

    try {
      const ws = new WebSocket(serverUrl);
      websocketRef.current = ws;

      ws.onopen = () => {
        console.log("Connected to WebSocket server");
        setConnectionStatus("Connected");
      };

      ws.onmessage = (event) => {
        try {
          // Check if the data is a Blob
          if (event.data instanceof Blob) {
            // Read the Blob as text and then parse it
            const reader = new FileReader();
            reader.onload = function () {
              try {
                const msg = JSON.parse(reader.result as string);
                addMessage(msg);
              } catch (error) {
                console.error(
                  "Error parsing Blob message as JSON:",
                  error,
                  reader.result
                );
              }
            };
            reader.readAsText(event.data);
          } else {
            // Handle as string if it's not a Blob
            const msg = JSON.parse(event.data);
            addMessage(msg);
          }
        } catch (error) {
          console.error("Error handling message:", error, event.data);
        }
      };

      ws.onclose = () => {
        console.log("Disconnected from WebSocket server");
        setConnectionStatus("Disconnected");
        // Try to reconnect after a delay
        setTimeout(connectWebSocket, 5000);
      };

      ws.onerror = (error) => {
        console.error("WebSocket error:", error);
        setConnectionStatus("Error");
      };
    } catch (error) {
      console.error("Error connecting to WebSocket:", error);
      setConnectionStatus("Error");
    }
  };

  const addMessage = (data: any) => {
    const newMessage: Message = {
      ...data,
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now(),
    };

    setMessages((prevMessages) => [...prevMessages, newMessage]);

    // Scroll to bottom when new message arrives
    setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: true });
    }, 100);
  };

  const sendMessage = () => {
    if (!inputMessage.trim() || !userName.trim() || !websocketRef.current) {
      return;
    }

    const messageObj = {
      type: "message",
      name: userName,
      message: inputMessage.trim(),
    };

    try {
      websocketRef.current.send(JSON.stringify(messageObj));
      setInputMessage("");
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  const renderMessage = ({ item }: { item: Message }) => {
    const isCurrentUser = item.name === userName;

    return (
      <View
        style={[
          styles.messageContainer,
          isCurrentUser ? styles.currentUserMessage : styles.otherUserMessage,
        ]}
      >
        <Text style={styles.messageName}>{item.name}</Text>
        <Text style={styles.messageText}>{item.message}</Text>
      </View>
    );
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      keyboardVerticalOffset={100}
    >
      <View style={styles.statusBar}>
        <Text>
          Status:{" "}
          <Text
            style={{
              color: connectionStatus === "Connected" ? "green" : "red",
            }}
          >
            {connectionStatus}
          </Text>
        </Text>
      </View>

      {!userName && (
        <View style={styles.userNameContainer}>
          <TextInput
            style={styles.userNameInput}
            placeholder="Enter your name"
            value={userName}
            onChangeText={setUserName}
          />
          <TouchableOpacity
            style={styles.userNameButton}
            onPress={() => {
              /* Just using the userName state */
            }}
          >
            <Text style={styles.userNameButtonText}>Set Name</Text>
          </TouchableOpacity>
        </View>
      )}

      <FlatList
        ref={flatListRef}
        data={messages}
        renderItem={renderMessage}
        keyExtractor={(item) => item.id}
        style={styles.messagesList}
        onContentSizeChange={() =>
          flatListRef.current?.scrollToEnd({ animated: true })
        }
      />

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          value={inputMessage}
          onChangeText={setInputMessage}
          placeholder="Type a message..."
          returnKeyType="send"
          onSubmitEditing={sendMessage}
        />
        <TouchableOpacity style={styles.sendButton} onPress={sendMessage}>
          <Text style={styles.sendButtonText}>Send</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  statusBar: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  userNameContainer: {
    flexDirection: "row",
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  userNameInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 4,
    paddingHorizontal: 10,
    paddingVertical: 5,
    marginRight: 10,
  },
  userNameButton: {
    backgroundColor: "#007AFF",
    borderRadius: 4,
    paddingHorizontal: 15,
    paddingVertical: 5,
    justifyContent: "center",
  },
  userNameButtonText: {
    color: "white",
    fontWeight: "bold",
  },
  messagesList: {
    flex: 1,
    padding: 10,
  },
  messageContainer: {
    padding: 10,
    borderRadius: 10,
    marginBottom: 10,
    maxWidth: "80%",
  },
  currentUserMessage: {
    alignSelf: "flex-end",
    backgroundColor: "#DCF8C6",
  },
  otherUserMessage: {
    alignSelf: "flex-start",
    backgroundColor: "#ECECEC",
  },
  messageName: {
    fontWeight: "bold",
    marginBottom: 5,
  },
  messageText: {
    fontSize: 16,
  },
  inputContainer: {
    flexDirection: "row",
    padding: 10,
    borderTopWidth: 1,
    borderTopColor: "#eee",
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 10,
    marginRight: 10,
  },
  sendButton: {
    backgroundColor: "#007AFF",
    borderRadius: 20,
    paddingHorizontal: 20,
    paddingVertical: 10,
    justifyContent: "center",
  },
  sendButtonText: {
    color: "white",
    fontWeight: "bold",
  },
});
