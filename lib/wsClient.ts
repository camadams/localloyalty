/**
 * React Native compatible WebSocket client for real-time loyalty card updates
 */

// Define message types for type safety
export type WebSocketMessage =
  | { type: "register"; userId: string }
  | { type: "card_data"; cards: any[] }
  | { type: "card_update"; cards: any[] }
  | { type: "initial_data"; cards: any[] }
  | { type: "refresh_data" }
  | { type: "ping" }
  | { type: "pong" }
  | { type: "error"; message: string };

export class CardWebSocketClient {
  private ws: WebSocket | null = null;
  private userId: string | null = null;
  private pingInterval: NodeJS.Timeout | null = null;
  private reconnectTimeout: NodeJS.Timeout | null = null;
  private serverUrl: string;
  private isConnecting: boolean = false;

  constructor(serverUrl: string = "ws://localhost:8080") {
    this.serverUrl = serverUrl;
  }

  /**
   * Connect to the WebSocket server
   * @param userId User ID for registration
   * @returns The client instance for chaining
   */
  public connect(userId: string): CardWebSocketClient {
    if (this.isConnecting) return this;

    this.isConnecting = true;
    this.userId = userId;

    try {
      // Use React Native's built-in WebSocket implementation
      this.ws = new WebSocket(this.serverUrl);

      // Use proper event handlers for React Native WebSocket
      this.ws.onopen = this.onOpen.bind(this);
      this.ws.onmessage = this.onMessage.bind(this);
      this.ws.onerror = (event: Event) => {
        console.error("WebSocket error:", event);
      };
      this.ws.onclose = (event: CloseEvent) => {
        console.log("WebSocket connection closed");
        this.scheduleReconnect();
      };

      // Start ping interval to keep connection alive
      this.startPingInterval();
    } catch (error) {
      console.error("Error connecting to WebSocket server:", error);
      this.scheduleReconnect();
    } finally {
      this.isConnecting = false;
    }

    return this;
  }

  /**
   * Close the WebSocket connection
   */
  public close(): void {
    this.clearTimers();

    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }

  /**
   * Send a message to the WebSocket server
   * @param message Message to send
   */
  public send(message: WebSocketMessage): void {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(message));
    } else {
      console.warn("Cannot send message: WebSocket is not connected");
    }
  }

  /**
   * Register with the WebSocket server
   */
  private register(): void {
    if (this.userId) {
      this.send({ type: "register", userId: this.userId });
    }
  }

  /**
   * Handle WebSocket open event
   */
  private onOpen(): void {
    console.log("WebSocket connection established");
    this.register();
  }

  /**
   * Handle WebSocket message event
   * @param event WebSocket message event
   */
  private onMessage(event: MessageEvent): void {
    // This is just a pass-through - the actual message handling
    // will be done in the component that uses this client
    console.log(event.data);
    // this.send({ type: "refresh_data" });
  }

  /**
   * Start ping interval to keep connection alive
   */
  private startPingInterval(): void {
    this.clearTimers();

    this.pingInterval = setInterval(() => {
      this.send({ type: "ping" });
    }, 30000); // Send ping every 30 seconds
  }

  /**
   * Schedule reconnect after connection close
   */
  private scheduleReconnect(): void {
    this.clearTimers();

    this.reconnectTimeout = setTimeout(() => {
      if (this.userId) {
        this.connect(this.userId);
      }
    }, 5000); // Try to reconnect after 5 seconds
  }

  /**
   * Clear all timers
   */
  private clearTimers(): void {
    if (this.pingInterval) {
      clearInterval(this.pingInterval);
      this.pingInterval = null;
    }

    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = null;
    }
  }

  /**
   * Get the WebSocket instance
   */
  public getWebSocket(): WebSocket | null {
    return this.ws;
  }
}

/**
 * Create a new WebSocket client instance
 * @param serverUrl WebSocket server URL
 * @returns WebSocket client instance
 */
export function createWebSocketClient(serverUrl?: string): CardWebSocketClient {
  return new CardWebSocketClient(serverUrl);
}
