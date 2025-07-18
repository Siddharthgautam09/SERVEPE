import React, { useState, useEffect } from 'react';
import { Search, Eye, MessageCircle, Clock, Upload, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { orderAPI } from '@/api/orders';
import OrderDetail from '@/components/OrderDetail';
import Chat from '@/components/Chat';
import Navbar from '@/components/Navbar';

const FreelancerOrders = () => {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [showOrderDetail, setShowOrderDetail] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [selectedClient, setSelectedClient] = useState<any>(null);
  const [currentOrderId, setCurrentOrderId] = useState<string | null>(null);
  const [deliveryMessage, setDeliveryMessage] = useState('');
  const [isSubmittingDelivery, setIsSubmittingDelivery] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadOrders();
  }, [statusFilter]);

  const loadOrders = async () => {
    try {
      setLoading(true);
      const params = {
        status: statusFilter || undefined,
        page: 1,
        limit: 20
      };

      const response = await orderAPI.getMyOrders(params);
      if (response.success) {
        // Filter to show only freelancer orders
        const freelancerOrders = response.data?.filter((order: any) => 
          order.userRole === 'freelancer'
        ) || [];
        setOrders(freelancerOrders);
      } else {
        throw new Error(response.message);
      }
    } catch (error: any) {
      console.error('Error loading orders:', error);
      toast({
        title: "Error",
        description: "Failed to load orders",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const submitDeliverables = async (orderId: string) => {
    if (!deliveryMessage.trim()) {
      toast({
        title: "Error",
        description: "Please provide a delivery message",
        variant: "destructive",
      });
      return;
    }

    setIsSubmittingDelivery(true);
    try {
      const formData = new FormData();
      formData.append('message', deliveryMessage);

      const response = await orderAPI.submitDeliverables(orderId, formData);
      if (response.success) {
        toast({
          title: "Success",
          description: "Deliverables submitted successfully",
        });
        setDeliveryMessage('');
        loadOrders();
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to submit deliverables",
        variant: "destructive",
      });
    } finally {
      setIsSubmittingDelivery(false);
    }
  };

  const filteredOrders = orders.filter(order =>
    order.service?.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.orderNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.client?.firstName?.toLowerCase().includes(searchTerm.toLowerCase())
  );

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

  const getStatusText = (status: string) => {
    return status.replace('_', ' ').toUpperCase();
  };

  const handleViewOrder = (order: any) => {
    setSelectedOrder(order);
    setShowOrderDetail(true);
  };

  const handleChatClick = (order: any) => {
    console.log('Chat button clicked for order:', order);
    console.log('Client data:', order.client);
    console.log('Order ID:', order._id);
    
    if (order.client && order.client._id) {
      setSelectedClient(order.client);
      setCurrentOrderId(order._id); // Make sure we're setting the order ID
      setShowChat(true);
      console.log('Opening chat with client:', order.client._id, 'for order:', order._id);
    } else {
      console.error('Client information missing:', order.client);
      toast({
        title: "Error",
        description: "Client information not available",
        variant: "destructive",
      });
    }
  };

  const handleOrderUpdate = (updatedOrder: any) => {
    setOrders(prevOrders => 
      prevOrders.map(order => 
        order._id === updatedOrder._id ? updatedOrder : order
      )
    );
    setSelectedOrder(updatedOrder);
  };

  const handleCloseChat = () => {
    setShowChat(false);
    setSelectedClient(null);
    setCurrentOrderId(null);
  };

  // Show chat interface
  if (showChat && selectedClient && currentOrderId) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#f8fafc] to-[#f1f5f9]">
        <Navbar />
        <div className="max-w-6xl mx-auto px-4 py-8">
          <Button 
            variant="outline" 
            onClick={handleCloseChat}
            className="mb-4"
          >
            ← Back to Orders
          </Button>
          <Chat
            recipientId={selectedClient._id}
            recipientName={`${selectedClient.firstName} ${selectedClient.lastName}`}
            orderId={currentOrderId}
            onClose={handleCloseChat}
          />
        </div>
      </div>
    );
  }

  // Show order detail
  if (showOrderDetail && selectedOrder) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#f8fafc] to-[#f1f5f9]">
        {/* <Navbar /> */}
        <div className="max-w-6xl mx-auto px-4 py-8">
          <div className="mb-6">
            <Button 
              variant="outline" 
              onClick={() => setShowOrderDetail(false)}
              className="mb-4"
            >
              ← Back to Orders
            </Button>
          </div>
          <OrderDetail 
            orderId={selectedOrder._id} 
            onOrderUpdate={handleOrderUpdate}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f8fafc] to-[#f1f5f9]">
      {/* <Navbar /> */}
      {/* Header */}
      <header className="bg-gradient-to-r from-purple-600 to-pink-500 py-12 shadow-md rounded-b-3xl mb-8">
        <div className="max-w-6xl mx-auto px-4 flex flex-col items-center justify-center text-center">
          <div className="flex items-center justify-center mb-4">
            <Sparkles className="w-10 h-10 text-white mr-2" />
            <h1 className="text-4xl md:text-5xl font-extrabold text-white tracking-tight">My Orders</h1>
          </div>
          <p className="text-purple-100 text-lg max-w-2xl">Manage your freelance orders and deliverables</p>
        </div>
      </header>
      <div className="max-w-6xl mx-auto px-4 py-8 flex flex-col lg:flex-row gap-8">
        {/* Sidebar Filters */}
        <aside className="w-full lg:w-1/3 mb-8 lg:mb-0">
          <Card className="bg-white rounded-2xl shadow-lg p-6 sticky top-24 border-0">
            <div className="space-y-6">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search orders..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 rounded-lg border-gray-300"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="rounded-lg border-gray-300">
                  <SelectValue placeholder="All Statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="accepted">Accepted</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="delivered">Delivered</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="revision_requested">Revision Requested</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </Card>
        </aside>
        {/* Main Orders Content */}
        <main className="flex-1">
          {/* Orders List */}
          {loading ? (
            <div className="grid gap-8">
              {[...Array(3)].map((_, index) => (
                <Card key={index} className="animate-pulse rounded-2xl shadow-md border-0">
                  <CardHeader>
                    <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  </CardHeader>
                  <CardContent>
                    <div className="h-3 bg-gray-200 rounded mb-4"></div>
                    <div className="h-8 bg-gray-200 rounded w-full"></div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : filteredOrders.length === 0 ? (
            <Card className="rounded-2xl shadow-md border-0">
              <CardContent className="text-center py-16">
                <Sparkles className="w-12 h-12 text-purple-300 mx-auto mb-4" />
                <p className="text-gray-500 text-lg font-semibold">No orders found</p>
                <p className="text-gray-400 mb-4">You don't have any orders yet</p>
                <Button onClick={() => window.location.href = '/my-services'} className="bg-gradient-to-r from-purple-600 to-pink-500 text-white font-semibold px-6 rounded-lg">
                  Manage Services
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="flex flex-col gap-8">
              {filteredOrders.map((order) => (
                <Card key={order._id} className="hover:shadow-2xl transition-shadow rounded-2xl border-0 bg-white px-6 py-6 flex flex-col md:flex-row items-center gap-6">
                  <div className="flex-1 w-full">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-2">
                      <div>
                        <CardTitle className="text-xl text-purple-700 font-bold mb-1">Order #{order.orderNumber}</CardTitle>
                        <CardDescription className="text-gray-700 text-base">{order.service?.title}</CardDescription>
                      </div>
                      <div className="text-right">
                        <Badge className={getStatusColor(order.status) + ' rounded-full px-4 py-1 text-xs font-semibold'}>
                          {getStatusText(order.status)}
                        </Badge>
                        <p className="text-sm text-gray-500 mt-1">
                          ₹{order.freelancerEarnings?.toLocaleString()}
                        </p>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm mb-4">
                      <div>
                        <p className="text-gray-500">Client</p>
                        <p className="font-medium">
                          {order.client?.firstName} {order.client?.lastName}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-500">Delivery Date</p>
                        <p className="font-medium">
                          {new Date(order.deliveryDate).toLocaleDateString()}
                        </p>
                        {order.isOverdue && (
                          <Badge variant="destructive" className="mt-1">Overdue</Badge>
                        )}
                      </div>
                      <div>
                        <p className="text-gray-500">Days Remaining</p>
                        <p className="font-medium flex items-center">
                          <Clock className="h-3 w-3 mr-1" />
                          {order.daysRemaining > 0 ? order.daysRemaining : 0} days
                        </p>
                      </div>
                    </div>
                    <div className="mb-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-gray-700">Progress</span>
                        <span className="text-sm text-gray-500">{order.progress}%</span>
                      </div>
                      <Progress value={order.progress} />
                    </div>
                    <div className="flex flex-wrap gap-2 pt-4 border-t">
                      <Button 
                        size="sm" 
                        className="bg-gradient-to-r from-purple-600 to-pink-500 text-white font-semibold"
                        onClick={() => handleViewOrder(order)}
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        View Details
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline"
                        className="border-purple-300 text-purple-700 hover:bg-purple-50"
                        onClick={() => handleChatClick(order)}
                        disabled={!order.client || !order.client._id}
                      >
                        <MessageCircle className="h-4 w-4 mr-2" />
                        Chat with Client
                      </Button>
                      {(order.status === 'in_progress' || order.status === 'revision_requested') && (
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button size="sm" variant="outline" className="border-blue-300 text-blue-700 hover:bg-blue-50">
                              <Upload className="h-4 w-4 mr-2" />
                              Submit Work
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Submit Deliverables</DialogTitle>
                              <DialogDescription>
                                Upload your completed work and add a message for the client
                              </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4">
                              <Textarea
                                placeholder="Add a message about your delivery..."
                                value={deliveryMessage}
                                onChange={(e) => setDeliveryMessage(e.target.value)}
                              />
                              <Button 
                                onClick={() => submitDeliverables(order._id)}
                                disabled={isSubmittingDelivery}
                                className="w-full bg-gradient-to-r from-green-500 to-blue-500 text-white font-semibold"
                              >
                                Submit Deliverables
                              </Button>
                            </div>
                          </DialogContent>
                        </Dialog>
                      )}
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default FreelancerOrders;
