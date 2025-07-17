import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  DollarSign, 
  Package, 
  CheckCircle, 
  Clock, 
  TrendingUp, 
  MessageCircle,
  Eye,
  Plus,
  Calendar,
  Users,
  Star
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { dashboardAPI } from '@/api/dashboard';
import { messageAPI } from '@/api/messages';
import { socketService } from '@/services/socketService';
import Navbar from '@/components/Navbar';
import Chat from '@/components/Chat';

const FreelancerDashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [stats, setStats] = useState({
    totalEarnings: 0,
    activeOrders: 0,
    completedOrders: 0,
    activeServices: 0
  });
  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const [conversations, setConversations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedChat, setSelectedChat] = useState<any>(null);
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [showChat, setShowChat] = useState(false);

  useEffect(() => {
    if (!user || user.role !== 'freelancer') {
      navigate('/otp-login');
      return;
    }
    loadDashboardData();
    setupSocket();
    
    return () => {
      socketService.disconnect();
    };
  }, [user, navigate]);

  const setupSocket = () => {
    console.log('Setting up socket for freelancer dashboard');
    
    if (!socketService.getSocket()) {
      socketService.connect();
    }

    socketService.onNewMessage((message: any) => {
      console.log('New message received in freelancer dashboard:', message);
      
      // Check if this message is relevant to current user
      if (message.recipient._id === user?._id || message.sender._id === user?._id) {
        console.log('Message is relevant, refreshing conversations');
        // Refresh conversations when new message arrives
        loadConversations();
        
        toast({
          title: "New Message",
          description: `New message from ${message.sender?.firstName || 'Someone'}`,
        });
      }
    });
  };

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      // Load freelancer stats
      const statsResponse = await dashboardAPI.getFreelancerStats();
      if (statsResponse.success) {
        setStats(statsResponse.data || stats);
      }

      // Load recent orders
      const ordersResponse = await dashboardAPI.getOrders();
      if (ordersResponse.success) {
        const freelancerOrders = ordersResponse.data?.filter((order: any) => 
          order.userRole === 'freelancer'
        ) || [];
        setRecentOrders(freelancerOrders.slice(0, 5));
      }

      // Load conversations
      await loadConversations();

    } catch (error: any) {
      console.error('Error loading dashboard data:', error);
      toast({
        title: "Error",
        description: "Failed to load dashboard data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const loadConversations = async () => {
    try {
      console.log('Loading conversations for freelancer dashboard');
      const response = await messageAPI.getConversationsList();
      console.log('Conversations response:', response);
      
      if (response.success) {
        const conversationsList = response.data?.slice(0, 5) || [];
        console.log('Setting conversations:', conversationsList);
        setConversations(conversationsList);
      }
    } catch (error) {
      console.error('Error loading conversations:', error);
    }
  };

  const getOtherUser = (conversation: any) => {
    if (!conversation?.lastMessage) return null;
    
    return conversation.lastMessage.sender?._id === user?._id ?
      conversation.lastMessage.recipient :
      conversation.lastMessage.sender;
  };

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleDateString();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-500';
      case 'accepted': return 'bg-blue-500';
      case 'in_progress': return 'bg-purple-500';
      case 'delivered': return 'bg-green-500';
      case 'completed': return 'bg-green-600';
      case 'cancelled': return 'bg-red-500';
      case 'revision_requested': return 'bg-orange-500';
      default: return 'bg-gray-500';
    }
  };

  const handleChatClick = (conversation: any) => {
    const otherUser = getOtherUser(conversation);
    console.log('Opening chat with user:', otherUser);
    console.log('Conversation order ID:', conversation.orderId);
    
    if (otherUser) {
      setSelectedChat(otherUser);
      setSelectedOrderId(conversation.orderId?._id || null);
      setShowChat(true);
    }
  };

  if (showChat && selectedChat) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-6xl mx-auto px-4 py-8">
          <Button 
            variant="outline" 
            onClick={() => {
              setShowChat(false);
              setSelectedOrderId(null);
              // Refresh conversations when returning from chat
              loadConversations();
            }}
            className="mb-4"
          >
            ← Back to Dashboard
          </Button>
          <Chat
            recipientId={selectedChat._id}
            recipientName={`${selectedChat.firstName} ${selectedChat.lastName}`}
            orderId={selectedOrderId || undefined}
            onClose={() => {
              setShowChat(false);
              setSelectedOrderId(null);
              loadConversations();
            }}
          />
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex items-center justify-center pt-20">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Welcome back, {user?.firstName}!
            </h1>
            <p className="text-gray-600 mt-2">Here's your freelance overview</p>
          </div>
          <div className="flex space-x-4">
            <Button onClick={() => navigate('/create-service')}>
              <Plus className="h-4 w-4 mr-2" />
              Add Service
            </Button>
            <Button variant="outline" onClick={() => navigate('/my-services')}>
              Manage Services
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Earnings</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                ₹{stats.totalEarnings?.toLocaleString() || 0}
              </div>
              <p className="text-xs text-muted-foreground">
                From completed orders
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Orders</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.activeOrders || 0}</div>
              <p className="text-xs text-muted-foreground">
                Currently in progress
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completed Orders</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.completedOrders || 0}</div>
              <p className="text-xs text-muted-foreground">
                Successfully delivered
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Services</CardTitle>
              <Star className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.activeServices || 0}</div>
              <p className="text-xs text-muted-foreground">
                Published services
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Recent Orders */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Recent Orders</CardTitle>
                  <Button variant="outline" size="sm" onClick={() => navigate('/freelancer/orders')}>
                    View All
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {recentOrders.length === 0 ? (
                  <div className="text-center py-8">
                    <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">No orders yet</p>
                    <p className="text-gray-400 text-sm">Create services to start receiving orders</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {recentOrders.map((order) => (
                      <div key={order._id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-1">
                            <h4 className="font-medium">#{order.orderNumber}</h4>
                            <Badge className={getStatusColor(order.status)}>
                              {order.status.replace('_', ' ').toUpperCase()}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-600">{order.service?.title}</p>
                          <p className="text-sm font-medium text-green-600">
                            ₹{order.freelancerEarnings?.toLocaleString()}
                          </p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => navigate(`/freelancer/orders`)}
                          >
                            <Eye className="h-3 w-3 mr-1" />
                            View
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Messages Section */}
          <div>
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Recent Messages</CardTitle>
                  <Button variant="outline" size="sm" onClick={() => navigate('/messages')}>
                    View All
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {conversations.length === 0 ? (
                  <div className="text-center py-8">
                    <MessageCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">No messages yet</p>
                    <p className="text-gray-400 text-sm">Start conversations with clients</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {conversations.map((conversation) => {
                      const otherUser = getOtherUser(conversation);
                      if (!otherUser) return null;
                      
                      return (
                        <div 
                          key={conversation._id}
                          onClick={() => handleChatClick(conversation)}
                          className="flex items-center space-x-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50"
                        >
                          <img 
                            src={otherUser.profilePicture || "/placeholder.svg"}
                            alt={`${otherUser.firstName} ${otherUser.lastName}`}
                            className="w-10 h-10 rounded-full"
                          />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <p className="font-medium text-sm truncate">
                                {otherUser.firstName} {otherUser.lastName}
                              </p>
                              {conversation.unreadCount > 0 && (
                                <span className="bg-blue-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                                  {conversation.unreadCount}
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-gray-500 truncate">
                              {conversation.lastMessage?.content}
                            </p>
                            <div className="flex items-center justify-between">
                              <p className="text-xs text-gray-400">
                                {formatTime(conversation.lastMessage?.createdAt)}
                              </p>
                              {conversation.orderId && (
                                <Badge variant="outline" className="text-xs">
                                  Order #{conversation.orderId.orderNumber}
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FreelancerDashboard;
