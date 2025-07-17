import { useState, useEffect, useRef } from "react";
import { ArrowLeft, Search, Send, Paperclip, Smile, MoreVertical, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useNavigate } from "react-router-dom";
import { messageAPI } from "@/api/messages";
import { socketService } from "@/services/socketService";
import { useToast } from "@/hooks/use-toast";
import { authAPI } from "@/api/auth";

const Messages = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [conversations, setConversations] = useState<any[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const currentUser = authAPI.getCurrentUser();
  const selectedConversationRef = useRef(selectedConversation);
  const messagesRef = useRef(messages);

  useEffect(() => {
    console.log('Messages component mounted, currentUser:', currentUser);
    if (!currentUser) {
      navigate('/otp-login');
      return;
    }
    
    loadConversations();
    
    // Initialize socket connection
    console.log('Initializing socket connection...');
    if (!socketService.isSocketConnected()) {
      socketService.connect();
    }
    
    const cleanup = setupSocket();

    return () => {
      console.log('Messages component unmounting');
      if (selectedConversation) {
        const otherUser = getOtherUser(selectedConversation);
        const orderId = selectedConversation.isOrderSpecific ? 
          (selectedConversation.orderId || selectedConversation._id.replace('order_', '')) : 
          undefined;
        socketService.leaveConversation(selectedConversation._id, orderId);
      }
      if (cleanup) cleanup();
    };
  }, []);

  useEffect(() => {
    if (selectedConversation) {
      console.log('Selected conversation changed:', selectedConversation);
      loadConversation();
      joinConversationRoom();
    }
  }, [selectedConversation]);

  useEffect(() => {
    selectedConversationRef.current = selectedConversation;
  }, [selectedConversation]);

  useEffect(() => {
    messagesRef.current = messages;
  }, [messages]);

  const setupSocket = () => {
    console.log('Setting up socket for Messages page');
    
    // Wait for connection if not already connected
    const checkConnection = () => {
      if (socketService.isSocketConnected()) {
        console.log('Socket connected, setting up listeners');
        return setupListeners();
      } else {
        console.log('Socket not connected yet, retrying in 1 second...');
        setTimeout(() => checkConnection(), 1000);
        return null;
      }
    };
    
    return checkConnection();
  };

  const setupListeners = () => {
    // Set up message listener
    const removeMessageListener = socketService.onNewMessage((message: any) => {
      console.log('New message received in Messages page:', message);
      
      // Update conversations list
      setConversations(prev => {
        const conversationIndex = prev.findIndex(conv => conv._id === message.conversationId);
        let updated;
        if (conversationIndex >= 0) {
          const conversation = prev[conversationIndex];
          const updatedConversation = {
            ...conversation,
            lastMessage: message,
            unreadCount: message.recipient?._id === currentUser?._id
              ? (conversation.unreadCount || 0) + 1
              : 0,
          };
          updated = [
            updatedConversation,
            ...prev.slice(0, conversationIndex),
            ...prev.slice(conversationIndex + 1),
          ];
        } else {
          updated = [
            {
              _id: message.conversationId,
              lastMessage: message,
              unreadCount: message.recipient?._id === currentUser?._id ? 1 : 0,
              isOrderSpecific: message.conversationId.startsWith('order_'),
              orderId: message.order?._id || null,
            },
            ...prev,
          ];
        }
        return updated;
      });

      // Use refs to always get the latest selectedConversation and messages
      const currentSelectedConversation = selectedConversationRef.current;
      if (currentSelectedConversation && message.conversationId === currentSelectedConversation._id) {
        setMessages(prev => {
          const exists = prev.some(m => m._id === message._id);
          if (exists) {
            return prev;
          }
          return [...prev, message];
        });

        // Mark message as read if we're the recipient and conversation is active
        if (message.recipient?._id === currentUser?._id) {
          messageAPI.markAsRead(currentSelectedConversation._id);
          setConversations(prev =>
            prev.map(conv =>
              conv._id === currentSelectedConversation._id
                ? { ...conv, unreadCount: 0 }
                : conv
            )
          );
        }
      }
    });

    return removeMessageListener;
  };

  const joinConversationRoom = () => {
    if (!selectedConversation || !currentUser) return;

    const otherUser = getOtherUser(selectedConversation);
    const orderId = selectedConversation.isOrderSpecific ? 
      (selectedConversation.orderId || selectedConversation._id.replace('order_', '')) : 
      undefined;

    console.log('Joining conversation room:', {
      conversationId: selectedConversation._id,
      otherUserId: otherUser?._id,
      orderId
    });

    socketService.joinConversation(
      selectedConversation._id,
      otherUser?._id,
      orderId
    );
  };

  const loadConversations = async () => {
    console.log('Loading conversations...');
    try {
      const response = await messageAPI.getConversationsList();
      console.log('Conversations response:', response);
      if (response.success) {
        const conversationsData = response.data || [];
        console.log('Raw conversations data:', conversationsData);
        setConversations(conversationsData);
        console.log('Conversations loaded:', conversationsData.length);
      } else {
        console.error('Failed to load conversations:', response.message);
        toast({
          title: "Error",
          description: response.message || "Failed to load conversations",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      console.error('Error loading conversations:', error);
      toast({
        title: "Error",
        description: "Failed to load conversations",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const loadConversation = async () => {
    if (!selectedConversation) {
      console.log('No selected conversation');
      return;
    }

    try {
      console.log('Loading conversation messages for:', selectedConversation._id);
      
      const otherUser = getOtherUser(selectedConversation);
      if (!otherUser?._id) {
        console.error('Could not determine other user ID');
        return;
      }

      // For order-specific conversations, extract orderId if not present
      const orderId = selectedConversation.isOrderSpecific ? 
        (selectedConversation.orderId || selectedConversation._id.replace('order_', '')) : 
        undefined;

      const params = orderId ? { orderId } : {};
      const response = await messageAPI.getConversation(otherUser._id, 1, 50, params);
      console.log('Conversation messages response:', response);
      
      if (response.success) {
        setMessages(response.data || []);
        
        // Mark as read
        await messageAPI.markAsRead(selectedConversation._id);
        
        // Update conversation unread count
        setConversations(prev => 
          prev.map(conv => 
            conv._id === selectedConversation._id 
              ? { ...conv, unreadCount: 0 }
              : conv
          )
        );
      }
    } catch (error: any) {
      console.error('Error loading conversation:', error);
      toast({
        title: "Error",
        description: "Failed to load conversation",
        variant: "destructive",
      });
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || sending || !selectedConversation || !currentUser) {
      console.log('Send message validation failed:', {
        hasMessage: !!newMessage.trim(),
        sending,
        hasConversation: !!selectedConversation,
        hasCurrentUser: !!currentUser
      });
      return;
    }

    setSending(true);
    try {
      const otherUser = getOtherUser(selectedConversation);
      console.log('Other user determined:', otherUser);
      
      if (!otherUser?._id) {
        console.error('Could not determine recipient ID from conversation:', selectedConversation);
        throw new Error('Could not determine recipient');
      }

      const orderId = selectedConversation.isOrderSpecific ? 
        (selectedConversation.orderId || selectedConversation._id.replace('order_', '')) : 
        undefined;

      const messageData = {
        recipientId: otherUser._id,
        content: newMessage.trim(),
        messageType: 'text' as const,
        orderId: orderId
      };

      console.log('Sending message:', messageData);

      // Check if socket is connected and try socket first
      if (socketService.isSocketConnected()) {
        console.log('Using socket to send message');
        const socketSent = socketService.sendMessage(messageData);
        
        if (socketSent) {
          setNewMessage('');
        } else {
          throw new Error('Socket send failed');
        }
      } else {
        console.log('Socket not connected, using HTTP API');
        const response = await messageAPI.sendMessage(messageData);
        
        if (!response.success) {
          throw new Error(response.message || 'Failed to send message');
        }
        
        if (response.warning) {
          toast({
            title: "Content Filtered",
            description: response.warning,
            variant: "destructive",
          });
        }
        
        setNewMessage('');
      }
      
    } catch (error: any) {
      console.error('Error sending message:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to send message",
        variant: "destructive",
      });
    } finally {
      setSending(false);
    }
  };

  const getOtherUser = (conversation: any) => {
    console.log('Getting other user for conversation:', conversation);
    
    if (!conversation || !currentUser) {
      console.log('Missing conversation or currentUser');
      return null;
    }
    
    // For order-specific conversations, check the lastMessage's order data
    if (conversation.isOrderSpecific && conversation.lastMessage?.order) {
      const order = conversation.lastMessage.order;
      console.log('Order data:', order);
      
      // Check if order has client and freelancer fields
      if (order.client && order.client._id !== currentUser._id) {
        console.log('Returning order client as other user');
        return order.client;
      }
      if (order.freelancer && order.freelancer._id !== currentUser._id) {
        console.log('Returning order freelancer as other user');
        return order.freelancer;
      }
    }
    
    // For regular conversations or fallback, use lastMessage participants
    if (conversation.lastMessage) {
      const sender = conversation.lastMessage.sender;
      const recipient = conversation.lastMessage.recipient;
      
      console.log('LastMessage sender:', sender);
      console.log('LastMessage recipient:', recipient);
      
      // Only proceed if we have valid sender/recipient data
      if (sender && recipient) {
        if (sender._id === currentUser._id) {
          console.log('Current user is sender, returning recipient');
          return recipient;
        } else if (recipient._id === currentUser._id) {
          console.log('Current user is recipient, returning sender');
          return sender;
        }
      }
      
      // If sender/recipient are null but we have a valid user, return it
      if (sender && sender._id !== currentUser._id) {
        console.log('Returning sender as other user');
        return sender;
      }
      if (recipient && recipient._id !== currentUser._id) {
        console.log('Returning recipient as other user');
        return recipient;
      }
    }
    
    // Fallback: use participants array if available
    if (conversation.participants?.length === 2) {
      const otherParticipant = conversation.participants.find(
        (p: any) => p._id !== currentUser._id
      );
      console.log('Returning participant as other user:', otherParticipant);
      return otherParticipant;
    }
    
    // Last resort: For order-specific conversations, extract orderId from conversation._id
    if (conversation.isOrderSpecific && conversation._id.startsWith('order_')) {
      const extractedOrderId = conversation._id.replace('order_', '');
      console.log('Extracted orderId from conversation ID:', extractedOrderId);
      
      // Return a placeholder user object with the orderId for identification
      // This should trigger a proper data fetch in the backend
      return {
        _id: 'unknown',
        firstName: 'Order',
        lastName: `#${extractedOrderId.slice(-4)}`,
        role: 'client' // Default role for display
      };
    }
    
    console.log('Could not determine other user, returning null');
    return null;
  };

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const filteredConversations = conversations.filter(conv => {
    const otherUser = getOtherUser(conv);
    if (!otherUser) return true;
    
    const fullName = `${otherUser.firstName || ''} ${otherUser.lastName || ''}`.toLowerCase();
    return fullName.includes(searchTerm.toLowerCase());
  });

  console.log('Rendering Messages component with:', {
    loading,
    conversationsCount: conversations.length,
    filteredConversationsCount: filteredConversations.length,
    selectedConversation: selectedConversation?._id,
    messagesCount: messages.length,
    currentUser: currentUser?._id
  });

  const handleConversationSelect = (conversation: any) => {
    console.log('Selecting conversation:', conversation);
    
    // Leave previous conversation room
    if (selectedConversation) {
      const prevOrderId = selectedConversation.isOrderSpecific ? 
        (selectedConversation.orderId || selectedConversation._id.replace('order_', '')) : 
        undefined;
      socketService.leaveConversation(selectedConversation._id, prevOrderId);
    }
    
    setSelectedConversation(conversation);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading messages...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <Button 
            variant="ghost" 
            onClick={() => navigate(-1)}
            className="flex items-center space-x-2"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back</span>
          </Button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-4 gap-6 h-[calc(100vh-200px)]">
          {/* Conversations List */}
          <div className="lg:col-span-1">
            <Card className="h-full">
              <div className="p-4 border-b">
                <h2 className="font-semibold text-lg mb-3">Messages</h2>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input 
                    placeholder="Search conversations..." 
                    className="pl-10"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>
              <div className="overflow-y-auto flex-1">
                {filteredConversations.length === 0 ? (
                  <div className="p-4 text-center text-gray-500">
                    {conversations.length === 0 ? 'No conversations yet' : 'No conversations found'}
                  </div>
                ) : (
                  filteredConversations.map((conversation) => {
                    const otherUser = getOtherUser(conversation);
                    
                    return (
                      <div
                        key={conversation._id}
                        onClick={() => handleConversationSelect(conversation)}
                        className={`p-4 border-b cursor-pointer hover:bg-gray-50 ${
                          selectedConversation?._id === conversation._id ? 'bg-blue-50 border-blue-200' : ''
                        }`}
                      >
                        <div className="flex items-center space-x-3">
                          <Avatar className="h-10 w-10">
                            <AvatarImage src={otherUser?.profilePicture} />
                            <AvatarFallback>
                              {otherUser?.firstName?.charAt(0) || '?'}
                              {otherUser?.lastName?.charAt(0) || ''}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <h3 className="font-medium text-sm truncate">
                                {otherUser 
                                  ? `${otherUser.firstName} ${otherUser.lastName}`
                                  : conversation.isOrderSpecific 
                                    ? `Order Chat #${conversation.orderId?.slice(-4) || 'Unknown'}` 
                                    : 'Unknown User'}
                              </h3>
                              {conversation.lastMessage && (
                                <span className="text-xs text-gray-500">
                                  {formatTime(conversation.lastMessage.createdAt)}
                                </span>
                              )}
                            </div>
                            <p className="text-sm text-gray-600 truncate">
                              {conversation.lastMessage?.content || 'No messages yet'}
                            </p>
                            <div className="flex items-center justify-between mt-1">
                              <div className="flex items-center space-x-1">
                                {otherUser?.role && (
                                  <Badge variant={otherUser.role === 'client' ? 'default' : 'secondary'} className="text-xs">
                                    {otherUser.role}
                                  </Badge>
                                )}
                                {conversation.isOrderSpecific && (
                                  <Badge variant="outline" className="text-xs">
                                    Order Chat
                                  </Badge>
                                )}
                              </div>
                              {conversation.unreadCount > 0 && (
                                <span className="bg-blue-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                                  {conversation.unreadCount}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </Card>
          </div>

          {/* Chat Area */}
          <div className="lg:col-span-3">
            {selectedConversation ? (
              <Card className="h-full flex flex-col">
                {/* Chat Header */}
                <div className="p-4 border-b">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={getOtherUser(selectedConversation)?.profilePicture} />
                        <AvatarFallback>
                          {getOtherUser(selectedConversation)?.firstName?.charAt(0)}
                          {getOtherUser(selectedConversation)?.lastName?.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <h3 className="font-medium">
                          {getOtherUser(selectedConversation)?.firstName} {getOtherUser(selectedConversation)?.lastName}
                        </h3>
                        <div className="flex items-center space-x-2">
                          <Badge variant={getOtherUser(selectedConversation)?.role === 'client' ? 'default' : 'secondary'} className="text-xs">
                            {getOtherUser(selectedConversation)?.role}
                          </Badge>
                          {selectedConversation.isOrderSpecific && (
                            <Badge variant="outline" className="text-xs">
                              Order Chat
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                    <Button variant="ghost" size="sm">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {/* Content Policy Warning */}
                <Alert className="m-4 mb-2">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    Please keep conversations professional. Sharing personal contact information, social media handles, or addresses is not allowed and will be filtered.
                  </AlertDescription>
                </Alert>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {messages.length === 0 ? (
                    <div className="text-center text-gray-500 mt-8">
                      <p>No messages yet. Start the conversation!</p>
                    </div>
                  ) : (
                    messages.map((message) => {
                      // FIXED: Better logic to determine if message is from current user
                      const isFromCurrentUser = message.sender?._id === currentUser?._id;
                      console.log('Message bubble check:', {
                        messageId: message._id,
                        senderId: message.sender?._id,
                        currentUserId: currentUser?._id,
                        isFromCurrentUser,
                        senderName: message.sender ? `${message.sender.firstName} ${message.sender.lastName}` : 'Unknown'
                      });
                      
                      return (
                        <div
                          key={message._id}
                          className={`flex ${isFromCurrentUser ? 'justify-end' : 'justify-start'}`}
                        >
                          <div
                            className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                              isFromCurrentUser
                                ? 'bg-blue-500 text-white'
                                : message.messageType === 'system'
                                ? 'bg-gray-100 text-gray-700 border border-gray-200'
                                : message.sender?.role === 'admin'
                                ? 'bg-red-100 text-red-900 border border-red-200'
                                : 'bg-gray-100 text-gray-900'
                            }`}
                          >
                            {message.messageType === 'system' && (
                              <Badge variant="outline" className="mb-1 text-xs">
                                System Message
                              </Badge>
                            )}
                            {message.sender?.role === 'admin' && message.messageType !== 'system' && (
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
                            <div className="flex items-center justify-between mt-1">
                              <p className={`text-xs ${
                                isFromCurrentUser ? 'text-blue-100' : 'text-gray-500'
                              }`}>
                                {formatTime(message.createdAt)}
                              </p>
                              {!isFromCurrentUser && message.sender && (
                                <span className="text-xs opacity-70 ml-2">
                                  {message.sender.firstName}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>

                {/* Message Input */}
                <div className="p-4 border-t">
                  <div className="flex items-center space-x-2">
                    <Button variant="ghost" size="sm">
                      <Paperclip className="h-4 w-4" />
                    </Button>
                    <div className="flex-1 relative">
                      <Input
                        placeholder="Type your message..."
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                        disabled={sending}
                      />
                      <Button variant="ghost" size="sm" className="absolute right-2 top-1/2 transform -translate-y-1/2">
                        <Smile className="h-4 w-4" />
                      </Button>
                    </div>
                    <Button onClick={sendMessage} size="sm" disabled={!newMessage.trim() || sending}>
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            ) : (
              <Card className="h-full flex items-center justify-center">
                <div className="text-center">
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Select a conversation</h3>
                  <p className="text-gray-500">Choose a conversation from the list to start messaging</p>
                </div>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Messages;