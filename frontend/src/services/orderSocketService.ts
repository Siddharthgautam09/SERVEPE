
import { io, Socket } from 'socket.io-client';

class OrderSocketService {
  private socket: Socket | null = null;

  connect() {
    const token = localStorage.getItem('token');
    if (!token) return;

    this.socket = io('http://localhost:8080', {
      auth: {
        token: token
      }
    });

    this.socket.on('connect', () => {
      console.log('Connected to order socket service');
    });

    this.socket.on('disconnect', () => {
      console.log('Disconnected from order socket service');
    });

    return this.socket;
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  // Order event listeners
  onNewOrder(callback: (data: any) => void) {
    if (this.socket) {
      this.socket.on('newOrder', callback);
    }
  }

  onOrderStatusUpdate(callback: (data: any) => void) {
    if (this.socket) {
      this.socket.on('orderStatusUpdate', callback);
    }
  }

  onDeliverablesReceived(callback: (data: any) => void) {
    if (this.socket) {
      this.socket.on('deliverablesReceived', callback);
    }
  }

  onRevisionRequested(callback: (data: any) => void) {
    if (this.socket) {
      this.socket.on('revisionRequested', callback);
    }
  }

  // Remove event listeners
  removeAllListeners() {
    if (this.socket) {
      this.socket.removeAllListeners();
    }
  }
}

export const orderSocketService = new OrderSocketService();
