import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { orderAPI } from '@/api/orders';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { 
  TrendingUp, 
  Users, 
  DollarSign, 
  Eye, 
  Star, 
  ShoppingCart,
  Calendar,
  Loader2
} from 'lucide-react';

const Analytics = () => {
  const { user } = useAuth();
  const [analytics, setAnalytics] = useState({
    totalOrders: 0,
    completedOrders: 0,
    totalEarnings: 0,
    completionRate: 0,
    avgDeliveryTime: 0,
    recentOrdersCount: 0
  });
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch analytics data
  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setLoading(true);
        
        if (user?.role === 'freelancer') {
          // Fetch order analytics for freelancers
          const analyticsResponse = await orderAPI.getOrderAnalytics();
          if (analyticsResponse.success) {
            setAnalytics(analyticsResponse.data);
          }
        }

        // Fetch orders for additional data
        const ordersResponse = await orderAPI.getMyOrders({ limit: 50 });
        if (ordersResponse.success) {
          setOrders(ordersResponse.data);
        }
      } catch (err) {
        setError(err.message);
        console.error('Error fetching analytics:', err);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchAnalytics();
    }
  }, [user]);

  // Calculate monthly data from orders
  const monthlyData = React.useMemo(() => {
    if (!orders.length) return [];
    
    const last6Months = [];
    const now = new Date();
    
    for (let i = 5; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthName = date.toLocaleDateString('en-US', { month: 'short' });
      const monthStart = new Date(date.getFullYear(), date.getMonth(), 1);
      const monthEnd = new Date(date.getFullYear(), date.getMonth() + 1, 0);
      
      const monthOrders = orders.filter(order => {
        const orderDate = new Date(order.createdAt);
        return orderDate >= monthStart && orderDate <= monthEnd;
      });
      
      const monthEarnings = monthOrders
        .filter(order => order.status === 'completed')
        .reduce((sum, order) => sum + (order.freelancerEarnings || 0), 0);
      
      last6Months.push({
        month: monthName,
        earnings: monthEarnings,
        orders: monthOrders.length,
        completed: monthOrders.filter(order => order.status === 'completed').length
      });
    }
    
    return last6Months;
  }, [orders]);

  // Calculate service breakdown from orders
  const serviceData = React.useMemo(() => {
    if (!orders.length) return [];
    
    const serviceStats: Record<string, number> = {};
    orders.forEach((order: any) => {
      if (order.service?.title) {
        const category = order.service.category || 'Other';
        serviceStats[category] = (serviceStats[category] || 0) + 1;
      }
    });
    
    const total = Object.values(serviceStats).reduce((sum: number, count: number) => sum + count, 0);
    const colors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];
    
    return Object.entries(serviceStats).map(([name, count], index) => ({
      name,
      value: total > 0 ? Math.round((count / total) * 100) : 0,
      color: colors[index % colors.length]
    }));
  }, [orders]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-destructive mb-4">Error loading analytics: {error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="px-4 py-2 bg-primary text-primary-foreground rounded-md"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const stats = [
    {
      title: "Total Earnings",
      value: `₹${analytics.totalEarnings.toLocaleString()}`,
      icon: DollarSign,
      change: `${analytics.recentOrdersCount} recent`,
      changeType: "positive"
    },
    {
      title: "Total Orders",
      value: analytics.totalOrders.toString(),
      icon: ShoppingCart,
      change: `${analytics.completedOrders} completed`,
      changeType: "positive"
    },
    {
      title: "Completion Rate",
      value: `${analytics.completionRate}%`,
      icon: TrendingUp,
      change: `${analytics.avgDeliveryTime.toFixed(1)} avg days`,
      changeType: "positive"
    },
    {
      title: "Active Orders",
      value: (analytics.totalOrders - analytics.completedOrders).toString(),
      icon: Calendar,
      change: "In progress",
      changeType: "positive"
    }
  ];

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-foreground">Analytics</h1>
          <p className="text-muted-foreground">
            Track your performance and growth metrics
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <Card key={index}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">
                        {stat.title}
                      </p>
                      <p className="text-2xl font-bold text-foreground">
                        {stat.value}
                      </p>
                      <Badge 
                        variant={stat.changeType === "positive" ? "default" : "destructive"}
                        className="mt-1"
                      >
                        {stat.change} from last month
                      </Badge>
                    </div>
                    <Icon className="h-8 w-8 text-muted-foreground" />
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Charts */}
        <Tabs defaultValue="earnings" className="space-y-6">
          <TabsList>
            <TabsTrigger value="earnings">Earnings</TabsTrigger>
            <TabsTrigger value="orders">Orders</TabsTrigger>
            <TabsTrigger value="views">Profile Views</TabsTrigger>
            <TabsTrigger value="services">Services Breakdown</TabsTrigger>
          </TabsList>

          <TabsContent value="earnings">
            <Card>
              <CardHeader>
                <CardTitle>Monthly Earnings</CardTitle>
                <CardDescription>Your earnings over the last 6 months</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={monthlyData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip formatter={(value) => [`₹${value}`, 'Earnings']} />
                    <Bar dataKey="earnings" fill="#3b82f6" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="orders">
            <Card>
              <CardHeader>
                <CardTitle>Monthly Orders</CardTitle>
                <CardDescription>Orders completed each month</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={monthlyData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="orders" stroke="#10b981" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="views">
            <Card>
              <CardHeader>
                <CardTitle>Profile Views</CardTitle>
                <CardDescription>How many people viewed your profile</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={monthlyData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="views" stroke="#f59e0b" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="services">
            <Card>
              <CardHeader>
                <CardTitle>Services Breakdown</CardTitle>
                <CardDescription>Distribution of your service offerings</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={serviceData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {serviceData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                  
                  <div className="space-y-4">
                    {serviceData.map((service, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div 
                            className="w-4 h-4 rounded-full" 
                            style={{ backgroundColor: service.color }}
                          />
                          <span className="text-sm font-medium">{service.name}</span>
                        </div>
                        <span className="text-sm text-muted-foreground">{service.value}%</span>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Additional Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Performance Metrics</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Avg Delivery Time</span>
                <Badge variant="outline">{analytics.avgDeliveryTime.toFixed(1)} days</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Completion Rate</span>
                <Badge variant="outline">{analytics.completionRate}%</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Recent Orders</span>
                <Badge variant="outline">{analytics.recentOrdersCount}</Badge>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {orders.slice(0, 3).map((order, index) => (
                <div key={index} className="flex items-center space-x-3">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">
                    Order #{order.orderNumber} - {order.status} - {order.service?.title}
                  </span>
                </div>
              ))}
              {orders.length === 0 && (
                <div className="flex items-center space-x-3">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">No recent activity</span>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Analytics;