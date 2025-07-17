import io, { Socket } from 'socket.io-client';

class SocketService {
  private socket: Socket | null = null;
  private token: string | null = null;
  private messageCallbacks: ((message: any) => void)[] = [];
  private isConnected: boolean = false;
  private reconnectAttempts: number = 0;
  private maxReconnectAttempts: number = 5;
  private connectionPromise: Promise<void> | null = null;

  async connect(): Promise<void> {
    if (this.connectionPromise) {
      return this.connectionPromise;
    }

    this.connectionPromise = new Promise((resolve, reject) => {
      this.token = localStorage.getItem('token');
      if (!this.token) {
        console.warn('No token found, cannot connect to socket');
        reject(new Error('No authentication token'));
        return;
      }

      if (this.isConnected && this.socket?.connected) {
        console.log('Socket already connected');
        resolve();
        return;
      }

      console.log('Connecting to socket server...');
      this.socket = io('http://localhost:8080', {
        auth: {
          token: this.token
        },
        transports: ['websocket', 'polling'],
        upgrade: true,
        rememberUpgrade: true,
        forceNew: false,
        reconnection: true,
        reconnectionAttempts: this.maxReconnectAttempts,
        reconnectionDelay: 1000,
        timeout: 20000
      });

      this.socket.on('connect', () => {
        console.log('✅ Connected to server with socket ID:', this.socket?.id);
        this.isConnected = true;
        this.reconnectAttempts = 0;
        this.connectionPromise = null;
        resolve();
      });

      this.socket.on('disconnect', (reason) => {
        console.log('❌ Disconnected from server:', reason);
        this.isConnected = false;
        this.connectionPromise = null;
      });

      this.socket.on('connect_error', (error) => {
        console.error('❌ Connection error:', error);
        this.reconnectAttempts++;
        this.connectionPromise = null;
        
        if (this.reconnectAttempts >= this.maxReconnectAttempts) {
          console.error('Max reconnection attempts reached');
          reject(error);
        }
      });

      this.socket.on('newMessage', (message) => {
        console.log('📨 New message received via socket:', message);
        this.messageCallbacks.forEach(callback => {
          try {
            callback(message);
          } catch (error) {
            console.error('Error in message callback:', error);
          }
        });
      });

      this.socket.on('message_sent', (data) => {
        console.log('✅ Message sent confirmation:', data);
      });

      this.socket.on('message_error', (error) => {
        console.error('❌ Socket message error:', error);
      });

      this.socket.on('message_filtered', (data) => {
        console.warn('⚠️ Message was filtered:', data);
      });

      this.socket.on('error', (error) => {
        console.error('❌ Socket error:', error);
      });

      // Set timeout for connection
      setTimeout(() => {
        if (!this.isConnected) {
          reject(new Error('Connection timeout'));
        }
      }, 20000);
    });

    return this.connectionPromise;
  }

  disconnect() {
    if (this.socket) {
      console.log('Disconnecting socket...');
      this.socket.removeAllListeners();
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
      this.reconnectAttempts = 0;
      this.connectionPromise = null;
    }
    this.messageCallbacks = [];
  }

  getSocket() {
    return this.socket;
  }

  isSocketConnected() {
    return this.isConnected && this.socket?.connected;
  }

  async ensureConnected(): Promise<void> {
    if (!this.isSocketConnected()) {
      await this.connect();
    }
  }

  // Join conversation room with proper data
  async joinConversation(conversationId: string, otherUserId?: string, orderId?: string) {
    try {
      await this.ensureConnected();
      
      if (this.socket && this.isConnected) {
        console.log('🏠 Joining conversation:', { conversationId, otherUserId, orderId });
        this.socket.emit('join_conversation', {
          conversationId,
          otherUserId,
          orderId
        });
      } else {
        console.warn('❌ Socket not connected, cannot join conversation');
      }
    } catch (error) {
      console.error('❌ Error joining conversation:', error);
    }
  }

  async leaveConversation(conversationId: string, orderId?: string) {
    if (this.socket && this.isConnected) {
      console.log('🚪 Leaving conversation:', { conversationId, orderId });
      this.socket.emit('leave_conversation', {
        conversationId,
        orderId
      });
    }
  }

  async sendMessage(messageData: any): Promise<boolean> {
    try {
      await this.ensureConnected();
      
      if (this.socket && this.isConnected) {
        console.log('📤 Sending message via socket:', messageData);
        this.socket.emit('send_message', messageData);
        return true;
      } else {
        console.warn('❌ Socket not connected, cannot send message');
        return false;
      }
    } catch (error) {
      console.error('❌ Error sending message:', error);
      return false;
    }
  }

  onNewMessage(callback: (message: any) => void) {
    this.messageCallbacks.push(callback);
    
    // Return cleanup function
    return () => {
      this.messageCallbacks = this.messageCallbacks.filter(cb => cb !== callback);
    };
  }

  onProposalUpdate(callback: (proposal: any) => void) {
    if (this.socket) {
      this.socket.on('proposal_updated', callback);
    }
  }

  // Typing indicators with conversation context
  startTyping(recipientId: string, conversationId?: string) {
    if (this.socket && this.isConnected) {
      this.socket.emit('typing_start', { recipientId, conversationId });
    }
  }

  stopTyping(recipientId: string, conversationId?: string) {
    if (this.socket && this.isConnected) {
      this.socket.emit('typing_stop', { recipientId, conversationId });
    }
  }

  onUserTyping(callback: (data: any) => void) {
    if (this.socket) {
      this.socket.on('user_typing', callback);
      return () => this.socket?.off('user_typing', callback);
    }
    return () => {};
  }

  onUserStoppedTyping(callback: (data: any) => void) {
    if (this.socket) {
      this.socket.on('user_stopped_typing', callback);
      return () => this.socket?.off('user_stopped_typing', callback);
    }
    return () => {};
  }

  // Force reconnection
  async forceReconnect() {
    console.log('🔄 Force reconnecting socket...');
    if (this.socket) {
      this.socket.disconnect();
    }
    this.isConnected = false;
    this.reconnectAttempts = 0;
    this.connectionPromise = null;
    await this.connect();
  }
}

export const socketService = new SocketService();
