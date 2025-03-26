const { createServer } = require('http');
const express = require('express');
const WebSocket = require('ws');

// Configure express to serve static files
const app = express();
app.use(express.json({ extended: false }));
app.use(express.static('public'));

// Get port from environment or default to 3000
const port = process.env.PORT || 3000;

// Create WebSocket server
const server = new WebSocket.Server({ server: app.listen(port) });

console.log(`WebSocket server started on port ${port}`);

// Handle WebSocket connections
server.on('connection', (socket) => {
  console.log('Client connected');
  
  // Handle messages from clients
  socket.on('message', (msg) => {
    try {
      // Convert Buffer or ArrayBuffer to string if needed
      let messageStr;
      if (msg instanceof Buffer) {
        messageStr = msg.toString();
      } else if (typeof msg === 'string') {
        messageStr = msg;
      } else {
        // Handle other types (like ArrayBuffer)
        messageStr = msg.toString();
      }
      
      console.log(`Received message: ${messageStr}`);
      
      // Broadcast message to all connected clients
      server.clients.forEach(client => {
        try {
          // Only send to clients that are open/ready
          if (client.readyState === WebSocket.OPEN) {
            // Ensure we're sending a string, not a Buffer
            client.send(messageStr);
            console.log('Message sent to a client');
          }
        } catch (err) {
          console.error('Error sending to a client:', err);
          // Continue with other clients even if one fails
        }
      });
      
      // Log the number of clients message was broadcast to
      const openClientCount = Array.from(server.clients).filter(
        client => client.readyState === WebSocket.OPEN
      ).length;
      console.log(`Message broadcast to ${openClientCount} clients`);
      
    } catch (error) {
      console.error('Error processing message:', error);
    }
  });

  // Handle client disconnection
  socket.on('close', () => {
    console.log('Client disconnected');
    console.log(`Remaining connected clients: ${server.clients.size}`);
  });
  
  // Handle errors
  socket.on('error', (error) => {
    console.error('Socket error:', error);
  });
  
  // Send a welcome message to the client
  try {
    socket.send(JSON.stringify({
      type: 'system',
      name: 'System',
      message: 'Welcome to the chat!'
    }));
  } catch (error) {
    console.error('Error sending welcome message:', error);
  }
});