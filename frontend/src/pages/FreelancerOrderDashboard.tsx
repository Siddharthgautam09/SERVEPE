
import { useState, useEffect } from "react";
import { Clock, CheckCircle, AlertCircle, Upload, MessageSquare, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { orderAPI } from "@/api/orders";
import { authAPI } from "@/api/auth";

const FreelancerOrderDashboard = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingOrder, setUpdatingOrder] = useState<string | null>(null);
  const { toast } = useToast();
  const currentUser = authAPI.getCurrentUser();

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const response = await orderAPI.getMyOrders();
      if (response.success) {
        // Filter orders where current user is the freelancer
        const freelancerOrders = response.data.filter(
          (order: any) => order.freelancer._id === currentUser?._id
        );
        setOrders(freelancerOrders);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load orders",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (orderId: string, newStatus: string, note?: string) => {
    setUpdatingOrder(orderId);
    try {
      const response = await orderAPI.updateOrderStatus(orderId, { 
        status: newStatus,
        note 
      });
      
      if (response.success) {
        await fetchOrders(); // Refresh orders
        toast({
          title: "Success",
          description: `Order status updated to ${newStatus}`,
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update order status",
        variant: "destructive",
      });
    } finally {
      setUpdatingOrder(null);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'accepted': return 'bg-blue-100 text-blue-800';
      case 'in_progress': return 'bg-purple-100 text-purple-800';
      case 'delivered': return 'bg-green-100 text-green-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
    }).format(amount);
  };

  const activeOrders = orders.filter((order: any) => 
    ['pending', 'accepted', 'in_progress', 'delivered'].includes(order.status)
  );

  const completedOrders = orders.filter((order: any) => 
    ['completed'].includes(order.status)
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your orders...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Order Management</h1>
          <p className="text-gray-600">Manage your client orders and deliverables</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Active Orders</p>
                  <p className="text-2xl font-bold text-gray-900">{activeOrders.length}</p>
                </div>
                <Clock className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Completed</p>
                  <p className="text-2xl font-bold text-gray-900">{completedOrders.length}</p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Earnings</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {formatCurrency(
                      completedOrders.reduce((sum: number, order: any) => 
                        sum + (order.freelancerEarnings || 0), 0
                      )
                    )}
                  </p>
                </div>
                <div className="h-8 w-8 bg-green-100 rounded-full flex items-center justify-center">
                  <span className="text-green-600 font-bold">₹</span>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Success Rate</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {orders.length > 0 ? Math.round((completedOrders.length / orders.length) * 100) : 0}%
                  </p>
                </div>
                <div className="h-8 w-8 bg-purple-100 rounded-full flex items-center justify-center">
                  <span className="text-purple-600 font-bold">%</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="active" className="space-y-6">
          <TabsList>
            <TabsTrigger value="active">Active Orders ({activeOrders.length})</TabsTrigger>
            <TabsTrigger value="completed">Completed ({completedOrders.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="active" className="space-y-6">
            {activeOrders.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">No active orders at the moment</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-6">
                {activeOrders.map((order: any) => (
                  <Card key={order._id} className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle className="text-lg">{order.service?.title}</CardTitle>
                          <CardDescription>
                            Client: {order.client?.firstName} {order.client?.lastName} | 
                            Order #{order.orderNumber}
                          </CardDescription>
                        </div>
                        <Badge className={getStatusColor(order.status)}>
                          {order.status.replace('_', ' ').toUpperCase()}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                        <div>
                          <p className="font-medium">Earnings</p>
                          <p className="text-green-600 font-bold">
                            {formatCurrency(order.freelancerEarnings)}
                          </p>
                        </div>
                        <div>
                          <p className="font-medium">Delivery Date</p>
                          <p className={order.daysRemaining < 0 ? 'text-red-600' : 'text-gray-600'}>
                            {new Date(order.deliveryDate).toLocaleDateString()} 
                            ({order.daysRemaining} days {order.daysRemaining < 0 ? 'overdue' : 'remaining'})
                          </p>
                        </div>
                        <div>
                          <p className="font-medium">Progress</p>
                          <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                            <div 
                              className="bg-blue-600 h-2 rounded-full" 
                              style={{ width: `${order.progress}%` }}
                            ></div>
                          </div>
                        </div>
                      </div>

                      <div className="border-t pt-4">
                        <p className="font-medium mb-2">Requirements:</p>
                        <p className="text-gray-600 text-sm">{order.requirements}</p>
                      </div>

                      <div className="flex items-center space-x-2">
                        {order.status === 'pending' && (
                          <Button 
                            onClick={() => updateOrderStatus(order._id, 'accepted')}
                            disabled={updatingOrder === order._id}
                            className="bg-blue-600 hover:bg-blue-700"
                          >
                            Accept Order
                          </Button>
                        )}
                        
                        {order.status === 'accepted' && (
                          <Button 
                            onClick={() => updateOrderStatus(order._id, 'in_progress')}
                            disabled={updatingOrder === order._id}
                            className="bg-purple-600 hover:bg-purple-700"
                          >
                            Start Working
                          </Button>
                        )}
                        
                        {order.status === 'in_progress' && (
                          <Button 
                            onClick={() => updateOrderStatus(order._id, 'delivered')}
                            disabled={updatingOrder === order._id}
                            className="bg-green-600 hover:bg-green-700"
                          >
                            <Upload className="h-4 w-4 mr-2" />
                            Mark as Delivered
                          </Button>
                        )}

                        <Button variant="outline">
                          <MessageSquare className="h-4 w-4 mr-2" />
                          Chat with Client
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="completed" className="space-y-6">
            {completedOrders.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <CheckCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">No completed orders yet</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {completedOrders.map((order: any) => (
                  <Card key={order._id}>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-medium">{order.service?.title}</h3>
                          <p className="text-sm text-gray-600">
                            Client: {order.client?.firstName} {order.client?.lastName}
                          </p>
                          <p className="text-sm text-gray-500">
                            Completed: {new Date(order.actualDeliveryDate || order.updatedAt).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-green-600">
                            {formatCurrency(order.freelancerEarnings)}
                          </p>
                          <Badge className="bg-green-100 text-green-800">Completed</Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default FreelancerOrderDashboard;
