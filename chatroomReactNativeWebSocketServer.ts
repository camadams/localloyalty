import * as WebSocket from "ws";
import * as http from "http";
import * as https from "https";
import * as fs from "fs";

// Create HTTP server (for ws:// connections)
const httpServer = http.createServer();
const wss = new WebSocket.Server({ server: httpServer });

// Store connected clients
const clients: WebSocket[] = [];

// Handle new connections
wss.on("connection", (ws: WebSocket) => {
  console.log("New client connected");
  clients.push(ws);

  // Handle incoming messages
  ws.on("message", (message: string) => {
    console.log(`Received message: ${message}`);

    // Broadcast to all other clients
    clients.forEach((client) => {
      if (client !== ws && client.readyState === WebSocket.OPEN) {
        client.send(message);
      }
    });
  });

  // Handle disconnection
  ws.on("close", () => {
    console.log("Client disconnected");
    const index = clients.indexOf(ws);
    if (index !== -1) clients.splice(index, 1);
  });
});

// Start HTTP server on port 8080
httpServer.listen(8080, () => {
  console.log("WebSocket server running on ws://localhost:8080");
});

// For secure connections, you would need SSL certificates
// This is commented out as you would need to provide valid certificates

try {
  // SSL Certificate options - you would need to provide these files
  const sslOptions = {
    key: fs.readFileSync("C:\\Users\\Admin\\.ssh\\chatroom-ws\\private.key"),
    cert: fs.readFileSync(
      "C:\\Users\\Admin\\.ssh\\chatroom-ws\\certificate.crt"
    ),
  };

  // Create HTTPS server (for wss:// connections)
  const httpsServer = https.createServer(sslOptions);
  const wssSecure = new WebSocket.Server({ server: httpsServer });

  // Use the same connection handler for secure connections
  wssSecure.on("connection", (ws: WebSocket) => {
    console.log("New secure client connected");
    clients.push(ws);

    ws.on("message", (message: string) => {
      console.log(`Received secure message: ${message}`);

      clients.forEach((client) => {
        if (client !== ws && client.readyState === WebSocket.OPEN) {
          client.send(message);
        }
      });
    });

    ws.on("close", () => {
      console.log("Secure client disconnected");
      const index = clients.indexOf(ws);
      if (index !== -1) clients.splice(index, 1);
    });
  });

  // Start HTTPS server on port 8443
  httpsServer.listen(8443, () => {
    console.log("Secure WebSocket server running on wss://localhost:8443");
  });
} catch (error) {
  console.error("Failed to start secure WebSocket server:", error);
  console.log("Only insecure WebSocket server is available");
}

// For ngrok tunneling with WebSockets, you need to use the --tunnel=tcp option
console.log("To use with ngrok, run: ngrok tcp 8080");
console.log(
  "Then update your client to use the ngrok URL with wss:// protocol"
);
