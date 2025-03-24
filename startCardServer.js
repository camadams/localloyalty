// This script requires ts-node to run TypeScript files directly
// Install with: npm install -D ts-node typescript

// Set up module aliases for path resolution
require('module-alias').addAliases({
  '@': __dirname
});

require('ts-node').register({
  project: './tsconfig.server.json'
});

// Import the TypeScript WebSocket server
const { cardsWebSocketServer } = require('./cardsWebSocketServer');

// Use a different port to avoid conflicts with existing server
const PORT = 8080;

// Start the WebSocket server with the specified port
cardsWebSocketServer.start(PORT);

console.log(`Loyalty Cards WebSocket Server is running on port ${PORT}...`);

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('Shutting down WebSocket server...');
  cardsWebSocketServer.stop();
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('Shutting down WebSocket server...');
  cardsWebSocketServer.stop();
  process.exit(0);
});
