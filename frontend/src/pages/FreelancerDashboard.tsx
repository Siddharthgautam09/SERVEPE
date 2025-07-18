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
  Star,
  UserCircle
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
    <div className="min-h-screen bg-gradient-to-br from-[#f8fafc] to-[#e0e7ef]">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-500 py-8 px-4 shadow-md rounded-b-3xl">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <img
              src={user?.profilePicture || "/placeholder.svg"}
              alt={user?.firstName}
              className="w-16 h-16 rounded-full border-4 border-white shadow-lg object-cover bg-white"
            />
            <div>
              <h1 className="text-3xl font-bold text-white mb-1">Welcome back, {user?.firstName}!</h1>
              <p className="text-blue-100 text-lg">Here's your freelance overview</p>
            </div>
          </div>
          <div className="flex space-x-4">
            <Button onClick={() => navigate('/create-service')} className="bg-white text-blue-700 font-semibold shadow hover:bg-blue-50">
              <Plus className="h-4 w-4 mr-2" /> Add Service
            </Button>
            <Button variant="outline" onClick={() => navigate('/my-services')} className="border-white text-white hover:bg-blue-700/20">
              Manage Services
            </Button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mt-[-40px] z-10 relative px-4">
        <Card className="shadow-lg rounded-2xl bg-white">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-700">Total Earnings</CardTitle>
            <DollarSign className="h-5 w-5 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">₹{stats.totalEarnings?.toLocaleString() || 0}</div>
            <p className="text-xs text-gray-400">From completed orders</p>
          </CardContent>
        </Card>
        <Card className="shadow-lg rounded-2xl bg-white">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-700">Active Orders</CardTitle>
            <Package className="h-5 w-5 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.activeOrders || 0}</div>
            <p className="text-xs text-gray-400">Currently in progress</p>
          </CardContent>
        </Card>
        <Card className="shadow-lg rounded-2xl bg-white">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-700">Completed Orders</CardTitle>
            <CheckCircle className="h-5 w-5 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-700">{stats.completedOrders || 0}</div>
            <p className="text-xs text-gray-400">Successfully delivered</p>
          </CardContent>
        </Card>
        <Card className="shadow-lg rounded-2xl bg-white">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-700">Active Services</CardTitle>
            <Star className="h-5 w-5 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{stats.activeServices || 0}</div>
            <p className="text-xs text-gray-400">Published services</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Grid */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8 mt-12 px-4">
        {/* Recent Orders */}
        <div className="lg:col-span-2">
          <Card className="rounded-2xl shadow-md bg-white">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg font-semibold text-gray-800">Recent Orders</CardTitle>
                <Button variant="outline" size="sm" onClick={() => navigate('/freelancer/orders')} className="border-blue-600 text-blue-600 hover:bg-blue-50">
                  View All
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {recentOrders.length === 0 ? (
                <div className="text-center py-12">
                  <Package className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500 text-lg font-medium">No orders yet</p>
                  <p className="text-gray-400 text-sm">Create services to start receiving orders</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {recentOrders.map((order) => (
                    <div key={order._id} className="flex items-center justify-between p-5 border border-gray-100 rounded-xl shadow-sm hover:shadow-lg transition-shadow bg-gradient-to-r from-white to-blue-50">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <h4 className="font-medium text-blue-900">#{order.orderNumber}</h4>
                          <Badge className={getStatusColor(order.status)}>{order.status.replace('_', ' ').toUpperCase()}</Badge>
                        </div>
                        <p className="text-sm text-gray-700">{order.service?.title}</p>
                        <p className="text-sm font-medium text-green-600">₹{order.freelancerEarnings?.toLocaleString()}</p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button size="sm" variant="outline" onClick={() => navigate(`/freelancer/orders`)} className="border-blue-600 text-blue-600 hover:bg-blue-50">
                          <Eye className="h-4 w-4 mr-1" /> View
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
          <Card className="rounded-2xl shadow-md bg-white">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg font-semibold text-gray-800">Recent Messages</CardTitle>
                <Button variant="outline" size="sm" onClick={() => navigate('/messages')} className="border-blue-600 text-blue-600 hover:bg-blue-50">
                  View All
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {conversations.length === 0 ? (
                <div className="text-center py-12">
                  <MessageCircle className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500 text-lg font-medium">No messages yet</p>
                  <p className="text-gray-400 text-sm">Start conversations with clients</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {conversations.map((conversation) => {
                    const otherUser = getOtherUser(conversation);
                    if (!otherUser) return null;
                    return (
                      <div
                        key={conversation._id}
                        onClick={() => handleChatClick(conversation)}
                        className="flex items-center space-x-4 p-4 border border-gray-100 rounded-xl shadow-sm cursor-pointer hover:bg-blue-50 transition"
                      >
                        <img
                          src={otherUser.profilePicture || "/placeholder.svg"}
                          alt={`${otherUser.firstName} ${otherUser.lastName}`}
                          className="w-12 h-12 rounded-full border-2 border-blue-100 object-cover"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <p className="font-medium text-gray-900 truncate">{otherUser.firstName} {otherUser.lastName}</p>
                            {conversation.unreadCount > 0 && (
                              <span className="bg-blue-600 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center font-bold">
                                {conversation.unreadCount}
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-gray-500 truncate">{conversation.lastMessage?.content}</p>
                          <div className="flex items-center justify-between mt-1">
                            <p className="text-xs text-gray-400">{formatTime(conversation.lastMessage?.createdAt)}</p>
                            {conversation.orderId && (
                              <Badge variant="outline" className="text-xs border-blue-200 text-blue-700 bg-blue-50">Order #{conversation.orderId.orderNumber}</Badge>
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
  );
};

export default FreelancerDashboard;
