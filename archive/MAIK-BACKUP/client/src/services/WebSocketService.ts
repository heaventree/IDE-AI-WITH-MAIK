// WebSocket Message Types
export enum WebSocketMessageType {
  CONNECT = 'connect',
  CURSOR_POSITION = 'cursor_position',
  EDIT = 'edit',
  FILE_CHANGE = 'file_change',
  USER_JOINED = 'user_joined',
  USER_LEFT = 'user_left',
  ERROR = 'error',
}

export interface WebSocketMessage {
  type: WebSocketMessageType;
  payload: any;
  timestamp: number;
  userId?: string;
}

export class WebSocketService {
  private static instance: WebSocketService;
  private socket: WebSocket | null = null;
  private messageListeners: ((message: WebSocketMessage) => void)[] = [];
  private connectionListeners: ((connected: boolean) => void)[] = [];
  private reconnectInterval: number = 3000; // ms
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  private userId: string = `user_${Math.floor(Math.random() * 10000)}`;

  private constructor() {
    // Private constructor for singleton pattern
  }

  public static getInstance(): WebSocketService {
    if (!WebSocketService.instance) {
      WebSocketService.instance = new WebSocketService();
    }
    return WebSocketService.instance;
  }

  public connect(): void {
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      console.log('WebSocket already connected');
      return;
    }

    // Clear any existing reconnect timer
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }

    try {
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const wsUrl = `${protocol}//${window.location.host}/ws`;
      
      console.log(`Connecting to WebSocket at ${wsUrl}...`);
      this.socket = new WebSocket(wsUrl);

      this.socket.onopen = () => {
        console.log('WebSocket connection established');
        this.notifyConnectionListeners(true);
        
        // Send initial connect message with user ID
        this.sendMessage({
          type: WebSocketMessageType.CONNECT,
          payload: { userId: this.userId },
          timestamp: Date.now(),
          userId: this.userId,
        });
      };

      this.socket.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data) as WebSocketMessage;
          this.notifyMessageListeners(message);
        } catch (err) {
          console.error('Error parsing WebSocket message:', err);
        }
      };

      this.socket.onclose = () => {
        console.log('WebSocket connection closed');
        this.notifyConnectionListeners(false);
        this.reconnect();
      };

      this.socket.onerror = (error) => {
        console.error('WebSocket error:', error);
        this.socket?.close();
      };
    } catch (err) {
      console.error('Error creating WebSocket connection:', err);
      this.reconnect();
    }
  }

  public disconnect(): void {
    if (this.socket) {
      this.socket.close();
      this.socket = null;
    }

    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
  }

  public sendMessage(message: WebSocketMessage): void {
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      // Add userId if not present
      if (!message.userId) {
        message.userId = this.userId;
      }
      
      // Add timestamp if not present
      if (!message.timestamp) {
        message.timestamp = Date.now();
      }
      
      this.socket.send(JSON.stringify(message));
    } else {
      console.warn('Cannot send message, WebSocket is not connected');
    }
  }

  public addMessageListener(callback: (message: WebSocketMessage) => void): void {
    this.messageListeners.push(callback);
  }

  public removeMessageListener(callback: (message: WebSocketMessage) => void): void {
    this.messageListeners = this.messageListeners.filter(listener => listener !== callback);
  }

  public addConnectionListener(callback: (connected: boolean) => void): void {
    this.connectionListeners.push(callback);
  }

  public removeConnectionListener(callback: (connected: boolean) => void): void {
    this.connectionListeners = this.connectionListeners.filter(listener => listener !== callback);
  }

  public isConnected(): boolean {
    return !!this.socket && this.socket.readyState === WebSocket.OPEN;
  }

  public setUserId(userId: string): void {
    this.userId = userId;
  }

  public getUserId(): string {
    return this.userId;
  }

  private notifyMessageListeners(message: WebSocketMessage): void {
    this.messageListeners.forEach(listener => {
      try {
        listener(message);
      } catch (err) {
        console.error('Error in WebSocket message listener:', err);
      }
    });
  }

  private notifyConnectionListeners(connected: boolean): void {
    this.connectionListeners.forEach(listener => {
      try {
        listener(connected);
      } catch (err) {
        console.error('Error in WebSocket connection listener:', err);
      }
    });
  }

  private reconnect(): void {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
    }

    this.reconnectTimer = setTimeout(() => {
      console.log(`Attempting to reconnect WebSocket in ${this.reconnectInterval}ms...`);
      this.connect();
    }, this.reconnectInterval);
  }
}