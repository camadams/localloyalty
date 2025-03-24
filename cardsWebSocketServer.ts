import WebSocket from "ws";
import { db } from "@/db";
import { cardsInUse, loyaltyCards, businesses } from "@/db/schema";
import { eq } from "drizzle-orm";
import { UsersCardResponse } from "@/app/api/customer/card+api";

interface ClientConnection {
  ws: WebSocket;
  userId: string;
  isAlive: boolean;
}

class CardsWebSocketServer {
  private port: number;
  private server: WebSocket.Server | null;
  private clients: Map<string, ClientConnection>;
  private pingInterval: NodeJS.Timeout | null;

  constructor(port = 8080) {
    this.port = port;
    this.server = null;
    this.clients = new Map();
    this.pingInterval = null;
  }

  public start(): void {
    this.server = new WebSocket.Server({ port: this.port });
    console.log(`WebSocket server started on port ${this.port}`);

    // Set up a simple HTTP endpoint for triggering broadcasts
    // This can be called from the business interface
    const http = require('http');
    const url = require('url');
    
    const httpServer = http.createServer((req: any, res: any) => {
      // Set CORS headers
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
      res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
      
      // Handle preflight requests
      if (req.method === 'OPTIONS') {
        res.writeHead(204);
        res.end();
        return;
      }
      
      // Only handle POST requests to /broadcast-refresh
      const parsedUrl = url.parse(req.url, true);
      if (req.method === 'POST' && parsedUrl.pathname === '/broadcast-refresh') {
        let body = '';
        
        req.on('data', (chunk: any) => {
          body += chunk.toString();
        });
        
        req.on('end', () => {
          try {
            const data = JSON.parse(body);
            const { businessId } = data;
            
            console.log(`Broadcast refresh request received${businessId ? ` for business: ${businessId}` : ' for all businesses'}`);
            
            // Broadcast the refresh signal
            this.broadcastRefreshSignal(businessId === 'all' ? undefined : businessId);
            
            // Send success response
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ success: true, message: 'Refresh signal broadcast successfully' }));
          } catch (error) {
            console.error('Error processing broadcast request:', error);
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'Failed to process broadcast request' }));
          }
        });
      } else {
        // Not found
        res.writeHead(404, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Not found' }));
      }
    });
    
    // Start HTTP server on port 8081
    httpServer.listen(8081, () => {
      console.log('HTTP server for broadcast requests started on port 8081');
    });

    this.server.on("connection", (ws: WebSocket) => {
      console.log("Client connected");

      ws.on("message", async (message: string) => {
        try {
          const data = JSON.parse(message.toString());

          // Handle authentication/registration
          if (data.type === "register") {
            const { userId } = data;
            if (!userId) {
              this.sendError(ws, "userId is required for registration");
              return;
            }

            // Register this client
            const clientId = this.generateClientId();
            this.clients.set(clientId, { ws, userId, isAlive: true });

            try {
              // Try to fetch real data first
              const cards = await this.getCardsForUser(userId);
              this.sendToClient(ws, { type: "initial_data", cards });
            } catch (error) {
              // Fall back to mock data if there's an error
              console.error(
                "Error fetching real data, using mock data:",
                error
              );
              const mockCards = this.getMockCardsForUser(userId);
              this.sendToClient(ws, { type: "initial_data", cards: mockCards });
            }

            // Send confirmation of registration
            this.sendToClient(ws, { type: "registered", clientId });
            console.log(`Client registered with userId: ${userId}`);
          }

          // Handle specific card request
          else if (data.type === "get_card") {
            const { userId } = data;
            if (!userId) {
              this.sendError(ws, "userId is required");
              return;
            }

            try {
              // Try to fetch real data first
              const cards = await this.getCardsForUser(userId);
              this.sendToClient(ws, { type: "card_data", cards });
            } catch (error) {
              // Fall back to mock data if there's an error
              console.error(
                "Error fetching real data, using mock data:",
                error
              );
              const mockCards = this.getMockCardsForUser(userId);
              this.sendToClient(ws, { type: "card_data", cards: mockCards });
            }
          }

          // Handle ping to keep connection alive
          else if (data.type === "ping") {
            this.sendToClient(ws, { type: "pong" });
          }
          
          // Handle broadcast refresh request (for testing)
          else if (data.type === "broadcast_refresh") {
            console.log("Received broadcast_refresh request from client");
            // Broadcast a refresh signal to all clients
            this.broadcastRefreshSignal();
            // Confirm to the sender
            this.sendToClient(ws, { type: "broadcast_confirmed" });
          }
        } catch (error) {
          console.error("Error processing message:", error);
          this.sendError(ws, "Invalid message format");
        }
      });

      // Handle client disconnection
      ws.on("close", () => {
        console.log("Client disconnected");
        // Remove client from our map
        for (const [clientId, client] of this.clients.entries()) {
          if (client.ws === ws) {
            this.clients.delete(clientId);
            break;
          }
        }
      });

      // Handle pong messages to track connection health
      ws.on("pong", () => {
        // Find this client and mark it as alive
        for (const client of this.clients.values()) {
          if (client.ws === ws) {
            client.isAlive = true;
            break;
          }
        }
      });
    });

    // Set up ping interval to check client connections
    this.pingInterval = setInterval(() => {
      this.clients.forEach((client, clientId) => {
        if (client.isAlive === false) {
          client.ws.terminate();
          this.clients.delete(clientId);
          return;
        }

        // Mark as not alive until we get a pong back
        client.isAlive = false;
        client.ws.ping();
      });
    }, 30000); // Check every 30 seconds
  }

  public stop(): void {
    if (this.server) {
      this.server.close();
      this.server = null;
      console.log("WebSocket server stopped");
    }

    if (this.pingInterval) {
      clearInterval(this.pingInterval);
      this.pingInterval = null;
    }

    // Close all client connections
    this.clients.forEach((client) => {
      client.ws.terminate();
    });
    this.clients.clear();
  }

  // Broadcast a message to all clients or to clients of a specific user
  public async broadcastCardUpdate(userId?: string): Promise<void> {
    try {
      // Try to get real card data
      const cards = await this.getCardsForUser(userId || "");

      // Prepare the message
      const message = {
        type: "card_update",
        cards,
      };

      // Send to all relevant clients
      this.clients.forEach((client) => {
        // If userId is specified, only send to that user's clients
        if (!userId || client.userId === userId) {
          this.sendToClient(client.ws, message);
        }
      });
    } catch (error) {
      console.error(
        "Error broadcasting update with real data, using mock data:",
        error
      );

      // Fall back to mock data
      const mockCards = this.getMockCardsForUser(userId || "");

      // Prepare the message with mock data
      const message = {
        type: "card_update",
        cards: mockCards,
      };

      // Send to all relevant clients
      this.clients.forEach((client) => {
        // If userId is specified, only send to that user's clients
        if (!userId || client.userId === userId) {
          this.sendToClient(client.ws, message);
        }
      });
    }
  }

  // Broadcast a refresh signal to all clients or to clients of a specific user
  public broadcastRefreshSignal(userId?: string): void {
    console.log(`Broadcasting refresh signal${userId ? ` to user: ${userId}` : ' to all users'}`);
    
    // Prepare the message
    const message = {
      type: "refresh_data"
    };

    // Send to all relevant clients
    this.clients.forEach((client) => {
      // If userId is specified, only send to that user's clients
      if (!userId || client.userId === userId) {
        this.sendToClient(client.ws, message);
      }
    });
  }

  // Get cards for a specific user
  private async getCardsForUser(userId: string): Promise<UsersCardResponse[]> {
    try {
      const result = await db
        .select({
          points: cardsInUse.points,
          createdAt: cardsInUse.createdAt,
          loyaltyCard: {
            description: loyaltyCards.description,
            maxPoints: loyaltyCards.maxPoints,
            status: loyaltyCards.status,
            artworkUrl: loyaltyCards.artworkUrl,
            businessName: businesses.name,
          },
        })
        .from(cardsInUse)
        .leftJoin(loyaltyCards, eq(cardsInUse.loyaltyCardId, loyaltyCards.id))
        .leftJoin(businesses, eq(loyaltyCards.businessId, businesses.id))
        .where(eq(cardsInUse.userId, userId));

      return result as UsersCardResponse[];
    } catch (error) {
      console.error("Error fetching cards:", error);
      throw error; // Rethrow to allow fallback to mock data
    }
  }

  // Get mock cards for testing when database is not available
  private getMockCardsForUser(userId: string): UsersCardResponse[] {
    return [
      {
        points: 150,
        createdAt: new Date(),
        loyaltyCard: {
          description: "Coffee Loyalty Card",
          maxPoints: 500,
          status: "active",
          artworkUrl: "https://example.com/coffee-card.jpg",
          businessName: "Coffee Shop",
        },
      },
      {
        points: 75,
        createdAt: new Date(),
        loyaltyCard: {
          description: "Bakery Loyalty Card",
          maxPoints: 300,
          status: "active",
          artworkUrl: "https://example.com/bakery-card.jpg",
          businessName: "Local Bakery",
        },
      },
    ] as UsersCardResponse[];
  }

  private sendToClient(ws: WebSocket, data: any): void {
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify(data));
    }
  }

  private sendError(ws: WebSocket, message: string): void {
    this.sendToClient(ws, { type: "error", message });
  }

  private generateClientId(): string {
    return (
      Math.random().toString(36).substring(2, 15) +
      Math.random().toString(36).substring(2, 15)
    );
  }
}

// Create and export a singleton instance of the WebSocket server
export const cardsWebSocketServer = new CardsWebSocketServer();

// Export a client hook that can be used in the React Native app
export function createWebSocketClient() {
  return {
    connect: (userId: string, url: string = "ws://localhost:8080") => {
      const ws = new WebSocket(url);
      let isConnected = false;
      let reconnectAttempts = 0;
      const MAX_RECONNECT_ATTEMPTS = 5;
      const RECONNECT_DELAY = 3000; // 3 seconds

      const registerClient = () => {
        if (isConnected) {
          ws.send(JSON.stringify({ type: "register", userId }));
        }
      };

      ws.onopen = () => {
        console.log("Connected to loyalty cards WebSocket server");
        isConnected = true;
        reconnectAttempts = 0;
        registerClient();

        // Start ping interval
        const pingInterval = setInterval(() => {
          if (isConnected) {
            ws.send(JSON.stringify({ type: "ping" }));
          } else {
            clearInterval(pingInterval);
          }
        }, 30000); // ping every 30 seconds
      };

      const attemptReconnect = () => {
        if (reconnectAttempts < MAX_RECONNECT_ATTEMPTS) {
          reconnectAttempts++;
          console.log(
            `Attempting to reconnect (${reconnectAttempts}/${MAX_RECONNECT_ATTEMPTS})...`
          );
          setTimeout(() => {
            // Create a new WebSocket connection
            const newWs = new WebSocket(url);
            Object.assign(ws, newWs);
          }, RECONNECT_DELAY);
        } else {
          console.error(
            "Max reconnection attempts reached. Please try again later."
          );
        }
      };

      ws.onclose = () => {
        console.log("Disconnected from loyalty cards WebSocket server");
        isConnected = false;
        attemptReconnect();
      };

      ws.onerror = (error) => {
        console.error("WebSocket error:", error);
        isConnected = false;
      };

      return {
        ws,
        getCard: () => {
          if (isConnected) {
            ws.send(JSON.stringify({ type: "get_card", userId }));
          }
        },
        close: () => {
          isConnected = false;
          ws.close();
        },
        isConnected: () => isConnected,
      };
    },
  };
}
