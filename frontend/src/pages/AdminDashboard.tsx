import { useState, useEffect } from "react";
import { ArrowLeft, Users, Briefcase, DollarSign, TrendingUp, Plus, Settings, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { authAPI } from "@/api/auth";
import AdminCategories from "./admin/AdminCategories";
import AdminMessaging from "@/components/AdminMessaging";
import AdminAnalytics from "@/components/AdminAnalytics";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [user, setUser] = useState<any>(null);
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
      const currentUser = authAPI.getCurrentUser();
      if (!currentUser || currentUser.role !== 'admin') {
        navigate('/otp-login');
        return;
      }
      setUser(currentUser);

      console.log('Fetching admin stats...');
      const statsResponse = await fetch('http://localhost:8080/api/admin/stats', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });

      console.log('Stats response status:', statsResponse.status);
      
      if (statsResponse.ok) {
        const statsData = await statsResponse.json();
        console.log('Admin stats response:', statsData);
        
        if (statsData.success && statsData.data) {
          const { stats: statsInfo, monthlyRevenue: monthlyRev, topFreelancers: topFreels } = statsData.data;
          
          console.log('Setting stats:', statsInfo);
          console.log('Setting monthly revenue:', monthlyRev);
          console.log('Setting top freelancers:', topFreels);
          
          setStats({
            totalUsers: statsInfo?.totalUsers || 0,
            totalFreelancers: statsInfo?.totalFreelancers || 0,
            totalClients: statsInfo?.totalClients || 0,
            totalServices: statsInfo?.totalServices || 0,
            totalOrders: statsInfo?.totalOrders || 0,
            totalRevenue: statsInfo?.totalRevenue || 0,
            freelancerEarnings: statsInfo?.freelancerEarnings || 0,
            platformFees: statsInfo?.platformFees || 0,
            pendingOrders: statsInfo?.pendingOrders || 0,
            completedOrders: statsInfo?.completedOrders || 0,
            cancelledOrders: statsInfo?.cancelledOrders || 0,
            totalCategories: statsInfo?.totalCategories || 0
          });
          
          setMonthlyRevenue(monthlyRev || []);
          setTopFreelancers(topFreels || []);
        } else {
          console.warn('Invalid stats data structure:', statsData);
        }
      } else {
        console.warn('Failed to fetch admin stats, status:', statsResponse.status);
        const errorText = await statsResponse.text();
        console.warn('Error response:', errorText);
      }
    } catch (error: any) {
      console.error('Error fetching admin data:', error);
      toast({
        title: "Error",
        description: "Failed to load dashboard data",
        variant: "destructive",
      });
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  console.log('Rendering dashboard with stats:', stats);
  console.log('Monthly revenue data:', monthlyRevenue);
  console.log('Top freelancers data:', topFreelancers);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => navigate('/')}
                className="flex items-center space-x-2"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>Back to Home</span>
              </Button>
              <div className="h-6 w-px bg-gray-300" />
              <h1 className="text-xl font-semibold text-gray-900">Admin Dashboard</h1>
            </div>
            <div className="flex items-center space-x-4">
              <Badge variant="destructive" className="bg-red-600">
                Admin Access
              </Badge>
            </div>
          </div>
        </div>
      </nav>

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
          <TabsList className="grid w-full grid-cols-7">
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="messaging">Messaging</TabsTrigger>
            <TabsTrigger value="categories">Categories</TabsTrigger>
            <TabsTrigger value="services">Services</TabsTrigger>
            <TabsTrigger value="orders">Orders</TabsTrigger>
            <TabsTrigger value="users">Users</TabsTrigger>
          </TabsList>

          <TabsContent value="analytics" className="space-y-6">
            <AdminAnalytics 
              stats={stats}
              monthlyRevenue={monthlyRevenue}
              topFreelancers={topFreelancers}
            />
          </TabsContent>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Button className="w-full justify-start" onClick={() => navigate('/admin/categories')}>
                    <Plus className="h-4 w-4 mr-2" />
                    Manage Categories
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <MessageSquare className="h-4 w-4 mr-2" />
                    Admin Messaging
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <Settings className="h-4 w-4 mr-2" />
                    Platform Settings
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

          <TabsContent value="messaging">
            <AdminMessaging />
          </TabsContent>

          <TabsContent value="categories">
            <AdminCategories />
          </TabsContent>

          <TabsContent value="services" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Service Management</CardTitle>
                <CardDescription>Approve and manage freelancer services</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-gray-500">Service management interface will be loaded here.</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="orders" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Order Management</CardTitle>
                <CardDescription>Monitor all platform orders and transactions</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-gray-500">Order management interface will be loaded here.</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="users" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>User Management</CardTitle>
                <CardDescription>Manage freelancers and clients</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-gray-500">User management interface will be loaded here.</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AdminDashboard;