
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { dashboardAPI } from '@/api/dashboard';
import { orderAPI } from '@/api/orders';
import { Sparkles, Package, ShoppingCart, Clock, CheckCircle, TrendingUp, Eye, MessageCircle } from 'lucide-react';
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
      <div className="min-h-screen bg-gradient-to-br from-[#f8fafc] to-[#f1f5f9] flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f8fafc] to-[#f1f5f9]">
      {/* Header */}
      <header className="bg-gradient-to-r from-purple-600 to-pink-500 py-12 shadow-md rounded-b-3xl mb-8">
        <div className="max-w-7xl mx-auto px-4 flex flex-col items-center justify-center text-center">
          <div className="flex items-center justify-center mb-4">
            <Sparkles className="w-10 h-10 text-white mr-2" />
            <h1 className="text-4xl md:text-5xl font-extrabold text-white tracking-tight">Welcome back, {user?.firstName}!</h1>
          </div>
          <p className="text-purple-100 text-lg max-w-2xl">Here's what's happening with your projects</p>
        </div>
      </header>
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row justify-between items-center mb-10 gap-4">
          <div className="text-center md:text-left">
            <h2 className="text-2xl font-bold text-gray-900">Your Dashboard</h2>
            <p className="text-gray-600 mt-1">Track your orders and spending</p>
          </div>
          <div className="flex space-x-4">
            <Button onClick={() => navigate('/services')} className="bg-gradient-to-r from-purple-600 to-pink-500 text-white font-semibold px-6 rounded-lg shadow">
              Browse Services
            </Button>
            <Button onClick={() => navigate('/client/orders')} variant="outline" className="border-purple-300 text-purple-700 hover:bg-purple-50">
              <Package className="h-4 w-4 mr-2" />
              View All Orders
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          <Card className="shadow-lg rounded-2xl bg-white">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-700">Total Orders</CardTitle>
              <ShoppingCart className="h-5 w-5 text-purple-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-700">{dashboardData?.totalOrders || 0}</div>
              <p className="text-xs text-gray-400">All time orders</p>
            </CardContent>
          </Card>
          <Card className="shadow-lg rounded-2xl bg-white">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-700">Active Orders</CardTitle>
              <Clock className="h-5 w-5 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{dashboardData?.activeOrders || 0}</div>
              <p className="text-xs text-gray-400">In progress</p>
            </CardContent>
          </Card>
          <Card className="shadow-lg rounded-2xl bg-white">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-700">Completed</CardTitle>
              <CheckCircle className="h-5 w-5 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-700">{dashboardData?.completedOrders || 0}</div>
              <p className="text-xs text-gray-400">Successfully delivered</p>
            </CardContent>
          </Card>
          <Card className="shadow-lg rounded-2xl bg-white">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-700">Total Spent</CardTitle>
              <TrendingUp className="h-5 w-5 text-pink-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-pink-600">₹{dashboardData?.totalSpent?.toLocaleString() || 0}</div>
              <p className="text-xs text-gray-400">Lifetime spending</p>
            </CardContent>
          </Card>
        </div>

        {/* Recent Orders */}
        <Card className="rounded-2xl shadow-md border-0">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg font-bold text-gray-900">Recent Orders</CardTitle>
                <CardDescription className="text-gray-600">Your latest service orders</CardDescription>
              </div>
              <Button variant="outline" onClick={() => navigate('/client/orders')} className="border-purple-300 text-purple-700 hover:bg-purple-50">
                View All Orders
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {recentOrders.length === 0 ? (
              <div className="text-center py-12">
                <ShoppingCart className="h-12 w-12 text-purple-300 mx-auto mb-4" />
                <p className="text-gray-500 text-lg mb-4">No orders yet</p>
                <Button onClick={() => navigate('/services')} className="bg-gradient-to-r from-purple-600 to-pink-500 text-white font-semibold px-6 rounded-lg">
                  Browse Services
                </Button>
              </div>
            ) : (
              <div className="space-y-6">
                {recentOrders.map((order) => (
                  <div key={order._id} className="flex flex-col md:flex-row items-center justify-between p-6 rounded-xl bg-white shadow hover:shadow-lg border border-gray-100 transition-all gap-6">
                    <div className="flex-1 w-full">
                      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 mb-2">
                        <div>
                          <h3 className="font-bold text-purple-700 text-lg mb-1">Order #{order.orderNumber}</h3>
                          <p className="text-base text-gray-700">{order.service?.title}</p>
                          <p className="text-sm text-gray-500">
                            with {order.freelancer?.firstName} {order.freelancer?.lastName}
                          </p>
                        </div>
                        <div className="text-right">
                          <Badge className={getStatusColor(order.status) + ' rounded-full px-4 py-1 text-xs font-semibold'}>
                            {getStatusText(order.status)}
                          </Badge>
                          <p className="text-sm text-gray-500 mt-1">
                            ₹{order.totalAmount?.toLocaleString()}
                          </p>
                        </div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm mb-4">
                        <div>
                          <p className="text-gray-500">Due</p>
                          <p className="font-medium">
                            {new Date(order.deliveryDate).toLocaleDateString()}
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-500">Progress</p>
                          <div className="flex items-center gap-2">
                            <Progress value={order.progress} className="h-2 flex-1" />
                            <span className="text-xs text-gray-500">{order.progress}%</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col md:flex-row gap-2">
                      <Button 
                        size="sm" 
                        className="bg-gradient-to-r from-purple-600 to-pink-500 text-white font-semibold"
                        onClick={() => handleViewOrder(order._id)}
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        View
                      </Button>
                      <Button size="sm" variant="outline" className="border-purple-300 text-purple-700 hover:bg-purple-50">
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
