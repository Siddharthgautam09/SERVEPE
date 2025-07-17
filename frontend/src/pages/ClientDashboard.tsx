
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { dashboardAPI } from '@/api/dashboard';
import { orderAPI } from '@/api/orders';
import Navbar from '@/components/Navbar';
import { 
  ShoppingCart, 
  Clock, 
  CheckCircle, 
  AlertCircle, 
  TrendingUp,
  Eye,
  MessageCircle,
  Star,
  Package
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const ClientDashboard = () => {
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    loadDashboardData();
    loadRecentOrders();
  }, []);

  const loadDashboardData = async () => {
    try {
      const response = await dashboardAPI.getClientStats();
      if (response.success) {
        setDashboardData(response.data);
      }
    } catch (error: any) {
      console.error('Dashboard load error:', error);
      toast({
        title: "Error",
        description: "Failed to load dashboard data",
        variant: "destructive",
      });
    }
  };

  const loadRecentOrders = async () => {
    try {
      const response = await orderAPI.getMyOrders({ page: 1, limit: 5 });
      if (response.success) {
        setRecentOrders(response.data || []);
      }
    } catch (error: any) {
      console.error('Orders load error:', error);
    } finally {
      setLoading(false);
    }
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

  const getStatusText = (status: string) => {
    return status.replace('_', ' ').toUpperCase();
  };

  const handleViewOrder = (orderId: string) => {
    navigate(`/client/orders?order=${orderId}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex items-center justify-center p-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Welcome back, {user?.firstName}!
            </h1>
            <p className="text-gray-600 mt-2">Here's what's happening with your projects</p>
          </div>
          <div className="flex space-x-4">
            <Button onClick={() => navigate('/services')}>
              Browse Services
            </Button>
            <Button onClick={() => navigate('/client/orders')} variant="outline">
              <Package className="h-4 w-4 mr-2" />
              View All Orders
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
              <ShoppingCart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{dashboardData?.totalOrders || 0}</div>
              <p className="text-xs text-muted-foreground">
                All time orders
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Orders</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{dashboardData?.activeOrders || 0}</div>
              <p className="text-xs text-muted-foreground">
                In progress
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completed</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{dashboardData?.completedOrders || 0}</div>
              <p className="text-xs text-muted-foreground">
                Successfully delivered
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Spent</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">₹{dashboardData?.totalSpent?.toLocaleString() || 0}</div>
              <p className="text-xs text-muted-foreground">
                Lifetime spending
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Recent Orders */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Recent Orders</CardTitle>
                <CardDescription>Your latest service orders</CardDescription>
              </div>
              <Button variant="outline" onClick={() => navigate('/client/orders')}>
                View All Orders
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {recentOrders.length === 0 ? (
              <div className="text-center py-8">
                <ShoppingCart className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 text-lg mb-4">No orders yet</p>
                <Button onClick={() => navigate('/services')}>
                  Browse Services
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {recentOrders.map((order) => (
                  <div key={order._id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                    <div className="flex-1">
                      <div className="flex items-center space-x-4">
                        <div>
                          <h3 className="font-medium">Order #{order.orderNumber}</h3>
                          <p className="text-sm text-gray-600">{order.service?.title}</p>
                          <p className="text-sm text-gray-500">
                            with {order.freelancer?.firstName} {order.freelancer?.lastName}
                          </p>
                        </div>
                      </div>
                      <div className="mt-2">
                        <div className="flex items-center space-x-4 text-sm">
                          <Badge className={getStatusColor(order.status)}>
                            {getStatusText(order.status)}
                          </Badge>
                          <span className="text-gray-500">
                            ₹{order.totalAmount?.toLocaleString()}
                          </span>
                          <span className="text-gray-500">
                            Due: {new Date(order.deliveryDate).toLocaleDateString()}
                          </span>
                        </div>
                        <div className="mt-2">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xs text-gray-500">Progress</span>
                            <span className="text-xs text-gray-500">{order.progress}%</span>
                          </div>
                          <Progress value={order.progress} className="h-2" />
                        </div>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => handleViewOrder(order._id)}
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        View
                      </Button>
                      <Button size="sm" variant="outline">
                        <MessageCircle className="h-4 w-4 mr-1" />
                        Chat
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ClientDashboard;
