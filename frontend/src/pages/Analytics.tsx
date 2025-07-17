import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
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
  Calendar
} from 'lucide-react';

const Analytics = () => {
  const { user } = useAuth();
  const [analytics, setAnalytics] = useState({
    profileViews: 245,
    totalEarnings: 12500,
    activeOrders: 8,
    completedOrders: 32,
    averageRating: 4.8,
    responseTime: '2 hours'
  });

  const [monthlyData] = useState([
    { month: 'Jan', earnings: 2400, orders: 5, views: 45 },
    { month: 'Feb', earnings: 3200, orders: 7, views: 52 },
    { month: 'Mar', earnings: 2800, orders: 6, views: 48 },
    { month: 'Apr', earnings: 4100, orders: 9, views: 67 },
    { month: 'May', earnings: 3600, orders: 8, views: 59 },
    { month: 'Jun', earnings: 5200, orders: 12, views: 78 }
  ]);

  const [serviceData] = useState([
    { name: 'Web Development', value: 45, color: '#3b82f6' },
    { name: 'Mobile Apps', value: 30, color: '#10b981' },
    { name: 'UI/UX Design', value: 25, color: '#f59e0b' }
  ]);

  const stats = [
    {
      title: "Total Earnings",
      value: `₹${analytics.totalEarnings.toLocaleString()}`,
      icon: DollarSign,
      change: "+12%",
      changeType: "positive"
    },
    {
      title: "Profile Views",
      value: analytics.profileViews.toString(),
      icon: Eye,
      change: "+8%",
      changeType: "positive"
    },
    {
      title: "Active Orders",
      value: analytics.activeOrders.toString(),
      icon: ShoppingCart,
      change: "+3",
      changeType: "positive"
    },
    {
      title: "Average Rating",
      value: analytics.averageRating.toString(),
      icon: Star,
      change: "+0.2",
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
                <span className="text-sm font-medium">Response Time</span>
                <Badge variant="outline">{analytics.responseTime}</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Completion Rate</span>
                <Badge variant="outline">98%</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Client Retention</span>
                <Badge variant="outline">85%</Badge>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-3">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">New order received - Web Development</span>
              </div>
              <div className="flex items-center space-x-3">
                <Star className="h-4 w-4 text-yellow-400" />
                <span className="text-sm">5-star review from John Doe</span>
              </div>
              <div className="flex items-center space-x-3">
                <Users className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">Profile viewed 12 times today</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Analytics;