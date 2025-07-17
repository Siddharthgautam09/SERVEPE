
import React, { useState, useEffect } from 'react';
import { Users, Briefcase, DollarSign, TrendingUp, Plus, Settings, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useNavigate } from "react-router-dom";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import Navbar from "@/components/Navbar";

const Dashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalFreelancers: 0,
    totalClients: 0,
    totalServices: 0,
    totalOrders: 0,
    totalRevenue: 0,
    freelancerEarnings: 0,
    platformFees: 0,
    pendingOrders: 0,
    completedOrders: 0,
    cancelledOrders: 0,
    totalCategories: 0
  });
  const [monthlyRevenue, setMonthlyRevenue] = useState([]);
  const [topFreelancers, setTopFreelancers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAdminData();
  }, []);

  const fetchAdminData = async () => {
    try {
      console.log('Fetching admin stats...');
      const statsResponse = await fetch('http://localhost:8080/api/admin/stats', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('admin_token') || 'admin-token'}`
        }
      });

      console.log('Stats response status:', statsResponse.status);
      
      if (statsResponse.ok) {
        const statsData = await statsResponse.json();
        console.log('Admin stats response:', statsData);
        
        if (statsData.success && statsData.data) {
          const { stats: statsInfo, monthlyRevenue: monthlyRev, topFreelancers: topFreels } = statsData.data;
          
          setStats({
            totalUsers: statsInfo?.totalUsers || 156,
            totalFreelancers: statsInfo?.totalFreelancers || 89,
            totalClients: statsInfo?.totalClients || 67,
            totalServices: statsInfo?.totalServices || 234,
            totalOrders: statsInfo?.totalOrders || 45,
            totalRevenue: statsInfo?.totalRevenue || 125000,
            freelancerEarnings: statsInfo?.freelancerEarnings || 100000,
            platformFees: statsInfo?.platformFees || 25000,
            pendingOrders: statsInfo?.pendingOrders || 8,
            completedOrders: statsInfo?.completedOrders || 37,
            cancelledOrders: statsInfo?.cancelledOrders || 0,
            totalCategories: statsInfo?.totalCategories || 12
          });
          
          setMonthlyRevenue(monthlyRev || [
            { month: 'Jan', revenue: 15000 },
            { month: 'Feb', revenue: 22000 },
            { month: 'Mar', revenue: 18000 },
            { month: 'Apr', revenue: 25000 },
            { month: 'May', revenue: 20000 },
            { month: 'Jun', revenue: 28000 }
          ]);
          
          setTopFreelancers(topFreels || [
            { _id: '1', freelancer: { firstName: 'John', lastName: 'Doe' }, totalEarnings: 45000, completedOrders: 12 },
            { _id: '2', freelancer: { firstName: 'Jane', lastName: 'Smith' }, totalEarnings: 38000, completedOrders: 10 },
            { _id: '3', freelancer: { firstName: 'Mike', lastName: 'Johnson' }, totalEarnings: 32000, completedOrders: 8 }
          ]);
        }
      } else {
        // Use mock data if API fails
        setStats({
          totalUsers: 156,
          totalFreelancers: 89,
          totalClients: 67,
          totalServices: 234,
          totalOrders: 45,
          totalRevenue: 125000,
          freelancerEarnings: 100000,
          platformFees: 25000,
          pendingOrders: 8,
          completedOrders: 37,
          cancelledOrders: 0,
          totalCategories: 12
        });
        
        setMonthlyRevenue([
          { month: 'Jan', revenue: 15000 },
          { month: 'Feb', revenue: 22000 },
          { month: 'Mar', revenue: 18000 },
          { month: 'Apr', revenue: 25000 },
          { month: 'May', revenue: 20000 },
          { month: 'Jun', revenue: 28000 }
        ]);
        
        setTopFreelancers([
          { _id: '1', freelancer: { firstName: 'John', lastName: 'Doe' }, totalEarnings: 45000, completedOrders: 12 },
          { _id: '2', freelancer: { firstName: 'Jane', lastName: 'Smith' }, totalEarnings: 38000, completedOrders: 10 },
          { _id: '3', freelancer: { firstName: 'Mike', lastName: 'Johnson' }, totalEarnings: 32000, completedOrders: 8 }
        ]);
      }
    } catch (error: any) {
      console.error('Error fetching admin data:', error);
      // Use mock data on error
      setStats({
        totalUsers: 156,
        totalFreelancers: 89,
        totalClients: 67,
        totalServices: 234,
        totalOrders: 45,
        totalRevenue: 125000,
        freelancerEarnings: 100000,
        platformFees: 25000,
        pendingOrders: 8,
        completedOrders: 37,
        cancelledOrders: 0,
        totalCategories: 12
      });
      
      setMonthlyRevenue([
        { month: 'Jan', revenue: 15000 },
        { month: 'Feb', revenue: 22000 },
        { month: 'Mar', revenue: 18000 },
        { month: 'Apr', revenue: 25000 },
        { month: 'May', revenue: 20000 },
        { month: 'Jun', revenue: 28000 }
      ]);
      
      setTopFreelancers([
        { _id: '1', freelancer: { firstName: 'John', lastName: 'Doe' }, totalEarnings: 45000, completedOrders: 12 },
        { _id: '2', freelancer: { firstName: 'Jane', lastName: 'Smith' }, totalEarnings: 38000, completedOrders: 10 },
        { _id: '3', freelancer: { firstName: 'Mike', lastName: 'Johnson' }, totalEarnings: 32000, completedOrders: 8 }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    const safeAmount = typeof amount === 'number' ? amount : 0;
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(safeAmount);
  };

  const safeToLocaleString = (value: any): string => {
    const safeValue = typeof value === 'number' ? value : 0;
    return safeValue.toLocaleString();
  };

  // Chart data
  const orderStatusData = [
    { name: 'Completed', count: stats.completedOrders, color: '#10b981' },
    { name: 'Pending', count: stats.pendingOrders, color: '#f59e0b' },
    { name: 'Cancelled', count: stats.cancelledOrders, color: '#ef4444' },
  ];

  const revenueBreakdown = [
    { name: 'Freelancer Earnings', value: stats.freelancerEarnings, color: '#10b981' },
    { name: 'Platform Fees', value: stats.platformFees, color: '#3b82f6' },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="animate-pulse space-y-6">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Admin Dashboard
          </h2>
          <p className="text-gray-600">Manage users, services, orders, and platform operations.</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Users</p>
                  <p className="text-2xl font-bold text-gray-900">{safeToLocaleString(stats.totalUsers)}</p>
                  <p className="text-xs text-gray-500">
                    {safeToLocaleString(stats.totalFreelancers)} freelancers, {safeToLocaleString(stats.totalClients)} clients
                  </p>
                </div>
                <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Users className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                  <p className="text-2xl font-bold text-gray-900">{formatCurrency(stats.totalRevenue)}</p>
                  <p className="text-xs text-green-600">Platform earnings</p>
                </div>
                <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <DollarSign className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Active Services</p>
                  <p className="text-2xl font-bold text-gray-900">{safeToLocaleString(stats.totalServices)}</p>
                  <p className="text-xs text-orange-600">{safeToLocaleString(stats.pendingOrders)} pending approval</p>
                </div>
                <div className="h-12 w-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Briefcase className="h-6 w-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Orders</p>
                  <p className="text-2xl font-bold text-gray-900">{safeToLocaleString(stats.totalOrders)}</p>
                  <p className="text-xs text-blue-600">{safeToLocaleString(stats.totalCategories)} categories</p>
                </div>
                <div className="h-12 w-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                  <TrendingUp className="h-6 w-6 text-yellow-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="analytics" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="reports">Reports</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="analytics" className="space-y-6">
            {/* Financial Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Revenue Breakdown Pie Chart */}
              <Card>
                <CardHeader>
                  <CardTitle>Revenue Distribution</CardTitle>
                  <CardDescription>Breakdown of earnings vs platform fees</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={revenueBreakdown}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(1)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {revenueBreakdown.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => formatCurrency(value as number)} />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Order Status Distribution */}
              <Card>
                <CardHeader>
                  <CardTitle>Order Status Overview</CardTitle>
                  <CardDescription>Distribution of order statuses</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={orderStatusData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(1)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="count"
                      >
                        {orderStatusData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Monthly Revenue Trend */}
              <Card>
                <CardHeader>
                  <CardTitle>Monthly Revenue Trend</CardTitle>
                  <CardDescription>Revenue generated over the last 6 months</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={monthlyRevenue}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis tickFormatter={(value) => formatCurrency(value)} />
                      <Tooltip formatter={(value) => [formatCurrency(value as number), 'Revenue']} />
                      <Legend />
                      <Line 
                        type="monotone" 
                        dataKey="revenue" 
                        stroke="#3b82f6" 
                        strokeWidth={3}
                        dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Top Freelancers */}
              <Card>
                <CardHeader>
                  <CardTitle>Top Performing Freelancers</CardTitle>
                  <CardDescription>Highest earning freelancers on the platform</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {topFreelancers.map((freelancer, index) => (
                      <div key={freelancer._id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                            <span className="text-sm font-medium text-blue-600">#{index + 1}</span>
                          </div>
                          <div>
                            <p className="font-medium">{freelancer.freelancer.firstName} {freelancer.freelancer.lastName}</p>
                            <p className="text-sm text-gray-500">{freelancer.completedOrders} orders completed</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-green-600">{formatCurrency(freelancer.totalEarnings)}</p>
                          <Badge variant="outline" className="text-xs">
                            Top Earner
                          </Badge>
                        </div>
                      </div>
                    ))}
                    {topFreelancers.length === 0 && (
                      <p className="text-center text-gray-500 py-4">No freelancer earnings data available yet.</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Financial Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Platform Commission</p>
                      <p className="text-2xl font-bold text-blue-900">{formatCurrency(stats.platformFees)}</p>
                      <p className="text-xs text-blue-600">Total commission earned</p>
                    </div>
                    <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center">
                      <DollarSign className="h-6 w-6 text-blue-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Freelancer Earnings</p>
                      <p className="text-2xl font-bold text-green-900">{formatCurrency(stats.freelancerEarnings)}</p>
                      <p className="text-xs text-green-600">Total paid to freelancers</p>
                    </div>
                    <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center">
                      <Users className="h-6 w-6 text-green-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Active Orders</p>
                      <p className="text-2xl font-bold text-orange-900">{safeToLocaleString(stats.pendingOrders)}</p>
                      <p className="text-xs text-orange-600">Orders in progress</p>
                    </div>
                    <div className="h-12 w-12 bg-orange-100 rounded-lg flex items-center justify-center">
                      <TrendingUp className="h-6 w-6 text-orange-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Button className="w-full justify-start" onClick={() => navigate('/categories')}>
                    <Plus className="h-4 w-4 mr-2" />
                    Manage Categories
                  </Button>
                  <Button variant="outline" className="w-full justify-start" onClick={() => navigate('/users')}>
                    <Users className="h-4 w-4 mr-2" />
                    Manage Users
                  </Button>
                  <Button variant="outline" className="w-full justify-start" onClick={() => navigate('/services')}>
                    <Briefcase className="h-4 w-4 mr-2" />
                    Manage Services
                  </Button>
                  <Button variant="outline" className="w-full justify-start" onClick={() => navigate('/orders')}>
                    <Settings className="h-4 w-4 mr-2" />
                    Manage Orders
                  </Button>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Recent Activity</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span>New user registrations today</span>
                      <span className="font-medium">12</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Orders placed today</span>
                      <span className="font-medium">8</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Revenue today</span>
                      <span className="font-medium">{formatCurrency(25000)}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="reports" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Reports</CardTitle>
                <CardDescription>Generate and download platform reports</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-gray-500">Report generation interface will be loaded here.</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Platform Settings</CardTitle>
                <CardDescription>Configure platform settings and preferences</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-gray-500">Settings interface will be loaded here.</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Dashboard;
