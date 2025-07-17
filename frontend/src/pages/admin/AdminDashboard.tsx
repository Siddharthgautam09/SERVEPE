import { useState, useEffect } from "react";
import { ArrowLeft, Users, Briefcase, DollarSign, TrendingUp, Calendar, UserCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { authAPI } from "@/api/auth";
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
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAdminData();
  }, []);

  const fetchAdminData = async () => {
    try {
      const currentUser = authAPI.getCurrentUser();
      if (!currentUser || currentUser.role !== 'admin') {
        navigate('/login');
        return;
      }
      setUser(currentUser);

      const statsResponse = await fetch('http://localhost:8080/api/admin/stats', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (statsResponse.ok) {
        const statsData = await statsResponse.json();
        if (statsData.success) {
          setStats(statsData.data.stats);
          setMonthlyRevenue(statsData.data.monthlyRevenue || []);
          setTopFreelancers(statsData.data.topFreelancers || []);
          setRecentOrders(statsData.data.recentOrders || []);
        }
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
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
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
              <Button onClick={() => navigate('/admin/users')} variant="outline">
                Manage Users
              </Button>
              <Button onClick={() => navigate('/admin/categories')} variant="outline">
                Manage Categories
              </Button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Platform Analytics & Revenue Dashboard
          </h2>
          <p className="text-gray-600">Real-time insights into platform performance and freelancer earnings</p>
        </div>

        {/* Main Analytics Component */}
        <AdminAnalytics 
          stats={stats}
          monthlyRevenue={monthlyRevenue}
          topFreelancers={topFreelancers}
        />

        {/* Recent Activity Section */}
        <div className="mt-12 grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Card>
            <CardHeader>
              <CardTitle>Recent Orders</CardTitle>
              <CardDescription>Latest transactions on the platform</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentOrders.slice(0, 5).map((order: any) => (
                  <div key={order._id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">{order.service?.title}</p>
                      <p className="text-sm text-gray-500">
                        {order.client?.firstName} → {order.freelancer?.firstName}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">{formatCurrency(order.totalAmount)}</p>
                      <Badge variant={order.status === 'completed' ? 'default' : 'secondary'}>
                        {order.status}
                      </Badge>
                    </div>
                  </div>
                ))}
                {recentOrders.length === 0 && (
                  <p className="text-center text-gray-500 py-4">No recent orders</p>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Platform Summary</CardTitle>
              <CardDescription>Key platform metrics</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Total Users</span>
                  <span className="font-semibold">{stats.totalUsers.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Active Services</span>
                  <span className="font-semibold">{stats.totalServices.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Categories</span>
                  <span className="font-semibold">{stats.totalCategories}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Total Orders</span>
                  <span className="font-semibold">{stats.totalOrders.toLocaleString()}</span>
                </div>
                <hr />
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 font-medium">Platform Revenue</span>
                  <span className="font-bold text-lg text-green-600">{formatCurrency(stats.totalRevenue)}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>User Management</CardTitle>
              <CardDescription>Manage freelancers and clients</CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                className="w-full" 
                onClick={() => navigate('/admin/users')}
              >
                <UserCheck className="h-4 w-4 mr-2" />
                View All Users
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Category Management</CardTitle>
              <CardDescription>Add and manage service categories</CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                className="w-full" 
                onClick={() => navigate('/admin/categories')}
              >
                <Briefcase className="h-4 w-4 mr-2" />
                Manage Categories
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Platform Analytics</CardTitle>
              <CardDescription>View detailed reports</CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full" variant="outline">
                <Calendar className="h-4 w-4 mr-2" />
                View Reports
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;