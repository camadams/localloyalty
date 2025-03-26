import {
  StyleSheet,
  View,
  TextInput,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { ThemedText } from "@/components/ThemedText";
import { useEffect, useRef, useState } from "react";

interface Message {
  text: string;
  isFromMe: boolean;
}

export default function Chatroom() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState("");
  const [connected, setConnected] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);
  useEffect(() => {
    console.log("IS_TUNNEL", process.env.IS_TUNNEL);
    wsRef.current = new WebSocket(
      true
        ? "wss://4xx1vmc-camadams-8081.exp.direct:8443"
        : "ws://localhost:8080"
    );

    console.log("wsRef.current", wsRef.current);

    wsRef.current.onopen = () => {
      console.log("Connected to chat server");
      setConnected(true);
    };

    wsRef.current.onmessage = (event: MessageEvent) => {
      console.log("Message received:", event.data);
      // console.log("event.data", event.timeStamp);
      setMessages((prev) => [...prev, { text: event.data, isFromMe: false }]);
    };

    wsRef.current.onclose = (event) => {
      console.log("Disconnected from chat server", event.code, event.reason);
      setConnected(false);
    };

    wsRef.current.onerror = (error) => {
      console.error("WebSocket error:", error);
    };

    return () => {
      if (wsRef.current) wsRef.current.close();
    };
  }, []);

  const sendMessage = () => {
    if (inputText.trim() === "" || !wsRef.current || !connected) return;

    wsRef.current.send(inputText);
    setMessages((prev) => [...prev, { text: inputText, isFromMe: true }]);
    setInputText("");
  };

  return (
    <View style={styles.container}>
      <ThemedText>{connected ? "Connected" : "Disconnected"}</ThemedText>

      <ScrollView style={styles.messagesContainer}>
        {messages.map((msg, index) => (
          <View
            key={index}
            style={[
              styles.messageBubble,
              msg.isFromMe ? styles.myMessage : styles.otherMessage,
            ]}
          >
            <ThemedText>{msg.text}</ThemedText>
          </View>
        ))}
      </ScrollView>

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          value={inputText}
          onChangeText={setInputText}
          placeholder="Type a message..."
          onSubmitEditing={sendMessage}
        />
        <TouchableOpacity style={styles.sendButton} onPress={sendMessage}>
          <ThemedText>Send</ThemedText>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 10 },
  messagesContainer: { flex: 1 },
  messageBubble: {
    padding: 10,
    borderRadius: 10,
    marginVertical: 5,
    maxWidth: "80%",
  },
  myMessage: { alignSelf: "flex-end", backgroundColor: "#dcf8c6" },
  otherMessage: { alignSelf: "flex-start", backgroundColor: "#eee" },
  inputContainer: { flexDirection: "row", marginTop: 10 },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#ddd",
    padding: 10,
    marginRight: 10,
  },
  sendButton: { padding: 10, backgroundColor: "#007bff" },
});
