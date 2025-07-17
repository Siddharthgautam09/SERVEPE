import React, { useState, useEffect, useRef } from 'react';
import { Send, Paperclip, Smile, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { messageAPI } from '@/api/messages';
import { socketService } from '@/services/socketService';
import { useToast } from '@/hooks/use-toast';
import { authAPI } from '@/api/auth';

interface ChatProps {
  recipientId: string;
  recipientName: string;
  orderId?: string;
  onClose?: () => void;
}

const Chat: React.FC<ChatProps> = ({ recipientId, recipientName, orderId, onClose }) => {
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [userTyping, setUserTyping] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout>();
  const { toast } = useToast();
  const currentUser = authAPI.getCurrentUser();

  useEffect(() => {
    console.log('Chat component mounted:', { recipientId, orderId, recipientName });
    loadConversation();
    setupSocket();
    
    return () => {
      console.log('Chat component unmounting, cleaning up...');
      cleanupSocket();
    };
  }, [recipientId, orderId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const loadConversation = async () => {
    try {
      console.log('Loading conversation:', { recipientId, orderId });
      const params = orderId ? { orderId } : {};
      const response = await messageAPI.getConversation(recipientId, 1, 50, params);
      console.log('Conversation loaded:', response);
      
      if (response.success) {
        setMessages(response.data || []);
        // Mark messages as read
        const conversationId = orderId ? `order_${orderId}` : [currentUser?._id, recipientId].sort().join('_');
        await messageAPI.markAsRead(conversationId);
      } else {
        console.error('Failed to load conversation:', response.message);
      }
    } catch (error: any) {
      console.error('Error loading conversation:', error);
      toast({
        title: "Error",
        description: "Failed to load conversation",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const setupSocket = () => {
    console.log('Setting up socket for chat:', { recipientId, orderId });
    
    // Ensure socket is connected
    if (!socketService.isSocketConnected()) {
      console.log('Socket not connected, connecting...');
      socketService.connect();
    }
    
    // Join the conversation room
    const roomName = orderId ? `order_${orderId}` : `chat_${[currentUser?._id, recipientId].sort().join('_')}`;
    console.log('Joining room:', roomName);
    socketService.getSocket()?.emit('join_room', roomName);
    
    // Listen for new messages
    const handleNewMessage = (message: any) => {
      console.log('Received new message in chat:', message);
      
      // Check if message is for this conversation
      const isForThisConversation = orderId 
        ? (message.conversationId === `order_${orderId}` || (message.order && message.order._id === orderId))
        : (message.conversationId === [currentUser?._id, recipientId].sort().join('_'));

      const isRelevantParticipants = 
        (message.sender._id === recipientId && message.recipient._id === currentUser?._id) ||
        (message.sender._id === currentUser?._id && message.recipient._id === recipientId);

      console.log('Message relevance check:', { 
        isForThisConversation, 
        isRelevantParticipants, 
        messageConversationId: message.conversationId,
        expectedConversationId: orderId ? `order_${orderId}` : [currentUser?._id, recipientId].sort().join('_')
      });

      if (isForThisConversation && isRelevantParticipants) {
        setMessages(prev => {
          const exists = prev.some(m => m._id === message._id);
          if (exists) {
            console.log('Message already exists, skipping');
            return prev;
          }
          console.log('Adding new message to chat');
          return [...prev, message];
        });
      }
    };

    // Set up socket listeners
    socketService.getSocket()?.on('newMessage', handleNewMessage);

    // Typing indicators
    socketService.onUserTyping((data: any) => {
      if (data.userId === recipientId) {
        setUserTyping(data.userName);
      }
    });

    socketService.onUserStoppedTyping((data: any) => {
      if (data.userId === recipientId) {
        setUserTyping(null);
      }
    });
  };

  const cleanupSocket = () => {
    const roomName = orderId ? `order_${orderId}` : `chat_${[currentUser?._id, recipientId].sort().join('_')}`;
    console.log('Leaving room:', roomName);
    socketService.getSocket()?.emit('leave_room', roomName);
    
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleTyping = () => {
    if (!isTyping) {
      setIsTyping(true);
      socketService.startTyping(recipientId);
    }

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
      socketService.stopTyping(recipientId);
    }, 1000);
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || sending) return;

    const messageText = newMessage.trim();
    console.log('Sending message:', { messageText, recipientId, orderId });

    setSending(true);
    try {
      const messageData = {
        recipientId,
        content: messageText,
        messageType: 'text' as const,
        orderId: orderId || undefined
      };

      const response = await messageAPI.sendMessage(messageData);
      console.log('Message send response:', response);
      
      if (response.success) {
        setNewMessage('');
        
        // The message will be received via socket, so no need to add it manually
        
        if (response.warning) {
          toast({
            title: "Content Filtered",
            description: response.warning,
            variant: "destructive",
          });
        }
      } else {
        throw new Error(response.message);
      }
    } catch (error: any) {
      console.error('Error sending message:', error);
      toast({
        title: "Error",
        description: "Failed to send message",
        variant: "destructive",
      });
    } finally {
      setSending(false);
      if (isTyping) {
        setIsTyping(false);
        socketService.stopTyping(recipientId);
      }
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    handleTyping();
    
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  if (loading) {
    return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardContent className="p-6 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading conversation...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-2xl mx-auto h-[600px] flex flex-col">
      <CardHeader className="border-b">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg">
              Chat with {recipientName}
              {orderId && <span className="text-sm font-normal text-gray-500 ml-2">(Order Chat)</span>}
            </CardTitle>
            {userTyping && (
              <p className="text-sm text-gray-500">{userTyping} is typing...</p>
            )}
          </div>
          {onClose && (
            <Button variant="outline" size="sm" onClick={onClose}>
              Close
            </Button>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="flex-1 flex flex-col p-0">
        {/* Content Policy Warning */}
        <Alert className="m-4 mb-2">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Please keep conversations professional. Sharing personal contact information, social media handles, or addresses is not allowed and will be filtered.
          </AlertDescription>
        </Alert>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.length === 0 ? (
            <div className="text-center text-gray-500 mt-8">
              <p>No messages yet. Start the conversation!</p>
            </div>
          ) : (
            messages.map((message, index) => (
              <div
                key={message._id || index}
                className={`flex ${
                  message.sender._id === currentUser?._id ? 'justify-end' : 'justify-start'
                }`}
              >
                <div
                  className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                    message.sender._id === currentUser?._id
                      ? 'bg-blue-600 text-white'
                      : message.messageType === 'system'
                      ? 'bg-gray-100 text-gray-700 border border-gray-200'
                      : message.sender.role === 'admin'
                      ? 'bg-red-100 text-red-900 border border-red-200'
                      : 'bg-gray-100 text-gray-900'
                  }`}
                >
                  {message.messageType === 'system' && (
                    <Badge variant="outline" className="mb-1 text-xs">
                      System Message
                    </Badge>
                  )}
                  {message.sender.role === 'admin' && message.messageType !== 'system' && (
                    <Badge variant="destructive" className="mb-1 text-xs">
                      Admin Message
                    </Badge>
                  )}
                  <p className="text-sm">{message.content}</p>
                  {message.isFiltered && (
                    <p className="text-xs mt-1 opacity-70 italic">
                      Content was filtered
                    </p>
                  )}
                  <p className="text-xs mt-1 opacity-70">
                    {formatTime(message.createdAt)}
                  </p>
                </div>
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Message Input */}
        <div className="border-t p-4">
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm">
              <Paperclip className="h-4 w-4" />
            </Button>
            <Input
              placeholder="Type a message..."
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              className="flex-1"
              disabled={sending}
            />
            <Button variant="outline" size="sm">
              <Smile className="h-4 w-4" />
            </Button>
            <Button 
              onClick={sendMessage} 
              disabled={!newMessage.trim() || sending}
              size="sm"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default Chat;