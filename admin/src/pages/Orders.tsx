
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Search, Filter, Eye, Clock, CheckCircle, X, Calendar, User, DollarSign } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import Navbar from '@/components/Navbar';

const Orders = () => {
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showOrderDetail, setShowOrderDetail] = useState(false);

  const { data: ordersData, isLoading, refetch } = useQuery({
    queryKey: ['admin-orders', search, activeTab],
    queryFn: async () => {
      const token = localStorage.getItem('token') || localStorage.getItem('admin_token');
      
      const response = await fetch(
        `http://localhost:8080/api/orders/admin/all?search=${search}&status=${activeTab === 'all' ? '' : activeTab}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      if (!response.ok) {
        throw new Error('Failed to fetch orders');
      }
      
      return response.json();
    },
  });

  const orders = ordersData?.data || [];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'in_progress': return 'bg-blue-100 text-blue-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      case 'delivered': return 'bg-purple-100 text-purple-800';
      case 'revision_requested': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
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

  const handleViewOrder = (order: any) => {
    setSelectedOrder(order);
    setShowOrderDetail(true);
  };

  if (isLoading) {
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
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Order Management</h1>
          <p className="text-gray-600 mt-2">Monitor and manage all platform orders</p>
        </div>

        <div className="mb-6 flex items-center space-x-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search orders by order number or user name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button variant="outline" onClick={() => refetch()}>
            <Filter className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-7">
            <TabsTrigger value="all">All Orders</TabsTrigger>
            <TabsTrigger value="pending">Pending</TabsTrigger>
            <TabsTrigger value="in_progress">In Progress</TabsTrigger>
            <TabsTrigger value="delivered">Delivered</TabsTrigger>
            <TabsTrigger value="completed">Completed</TabsTrigger>
            <TabsTrigger value="cancelled">Cancelled</TabsTrigger>
            <TabsTrigger value="revision_requested">Revisions</TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab} className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Orders ({orders.length})</CardTitle>
                <CardDescription>
                  Monitor all transactions and order statuses across the platform
                </CardDescription>
              </CardHeader>
              <CardContent>
                {orders.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    No orders found for the selected criteria.
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Order #</TableHead>
                        <TableHead>Service</TableHead>
                        <TableHead>Client</TableHead>
                        <TableHead>Freelancer</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Created</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {orders.map((order: any) => (
                        <TableRow key={order._id}>
                          <TableCell className="font-medium">
                            {order.orderNumber || `#${order._id?.slice(-8)}`}
                          </TableCell>
                          <TableCell>
                            <div className="max-w-xs truncate">
                              {order.service?.title || 'N/A'}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center space-x-2">
                              <Avatar className="h-8 w-8">
                                <AvatarImage src={order.client?.profilePicture} />
                                <AvatarFallback className="text-xs">
                                  {order.client?.firstName?.[0]}
                                  {order.client?.lastName?.[0]}
                                </AvatarFallback>
                              </Avatar>
                              <span className="text-sm">
                                {order.client?.firstName} {order.client?.lastName}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center space-x-2">
                              <Avatar className="h-8 w-8">
                                <AvatarImage src={order.freelancer?.profilePicture} />
                                <AvatarFallback className="text-xs">
                                  {order.freelancer?.firstName?.[0]}
                                  {order.freelancer?.lastName?.[0]}
                                </AvatarFallback>
                              </Avatar>
                              <span className="text-sm">
                                {order.freelancer?.firstName} {order.freelancer?.lastName}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell className="font-semibold text-green-600">
                            {formatCurrency(order.totalAmount || 0)}
                          </TableCell>
                          <TableCell>
                            <Badge className={getStatusColor(order.status)}>
                              {order.status?.replace('_', ' ')}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-sm text-gray-600">
                            {new Date(order.createdAt).toLocaleDateString()}
                          </TableCell>
                          <TableCell>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleViewOrder(order)}
                            >
                              <Eye className="h-4 w-4 mr-1" />
                              View
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Order Detail Dialog */}
        <Dialog open={showOrderDetail} onOpenChange={setShowOrderDetail}>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Order Details</DialogTitle>
            </DialogHeader>
            {selectedOrder && (
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <h3 className="font-semibold mb-2">Order Information</h3>
                    <div className="space-y-2 text-sm">
                      <p><span className="font-medium">Order #:</span> {selectedOrder.orderNumber || `#${selectedOrder._id?.slice(-8)}`}</p>
                      <p><span className="font-medium">Status:</span> 
                        <Badge className={`ml-2 ${getStatusColor(selectedOrder.status)}`}>
                          {selectedOrder.status?.replace('_', ' ')}
                        </Badge>
                      </p>
                      <p><span className="font-medium">Created:</span> {new Date(selectedOrder.createdAt).toLocaleString()}</p>
                      <p><span className="font-medium">Delivery Date:</span> {new Date(selectedOrder.deliveryDate).toLocaleDateString()}</p>
                      {selectedOrder.actualDeliveryDate && (
                        <p><span className="font-medium">Delivered:</span> {new Date(selectedOrder.actualDeliveryDate).toLocaleDateString()}</p>
                      )}
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="font-semibold mb-2">Financial Details</h3>
                    <div className="space-y-2 text-sm">
                      <p><span className="font-medium">Total Amount:</span> {formatCurrency(selectedOrder.totalAmount)}</p>
                      <p><span className="font-medium">Platform Fee:</span> {formatCurrency(selectedOrder.platformFee)}</p>
                      <p><span className="font-medium">Freelancer Earnings:</span> {formatCurrency(selectedOrder.freelancerEarnings)}</p>
                      <p><span className="font-medium">Selected Plan:</span> {selectedOrder.selectedPlan}</p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <h3 className="font-semibold mb-2">Client</h3>
                    <div className="flex items-center space-x-3">
                      <Avatar className="h-12 w-12">
                        <AvatarImage src={selectedOrder.client?.profilePicture} />
                        <AvatarFallback>
                          {selectedOrder.client?.firstName?.[0]}
                          {selectedOrder.client?.lastName?.[0]}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{selectedOrder.client?.firstName} {selectedOrder.client?.lastName}</p>
                        <p className="text-sm text-gray-600">{selectedOrder.client?.email}</p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-semibold mb-2">Freelancer</h3>
                    <div className="flex items-center space-x-3">
                      <Avatar className="h-12 w-12">
                        <AvatarImage src={selectedOrder.freelancer?.profilePicture} />
                        <AvatarFallback>
                          {selectedOrder.freelancer?.firstName?.[0]}
                          {selectedOrder.freelancer?.lastName?.[0]}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{selectedOrder.freelancer?.firstName} {selectedOrder.freelancer?.lastName}</p>
                        <p className="text-sm text-gray-600">{selectedOrder.freelancer?.email}</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold mb-2">Service Details</h3>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="font-medium">{selectedOrder.service?.title}</p>
                    <p className="text-sm text-gray-600 mt-1">{selectedOrder.service?.description}</p>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold mb-2">Requirements</h3>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm">{selectedOrder.requirements}</p>
                  </div>
                </div>

                {selectedOrder.deliverables && selectedOrder.deliverables.length > 0 && (
                  <div>
                    <h3 className="font-semibold mb-2">Deliverables</h3>
                    <div className="space-y-2">
                      {selectedOrder.deliverables.map((deliverable: any, index: number) => (
                        <div key={index} className="bg-gray-50 p-4 rounded-lg">
                          <p className="text-sm font-medium">Submission {index + 1}</p>
                          <p className="text-sm text-gray-600">{deliverable.message}</p>
                          <p className="text-xs text-gray-500 mt-1">
                            Submitted: {new Date(deliverable.submittedAt).toLocaleString()}
                          </p>
                          {deliverable.files && deliverable.files.length > 0 && (
                            <p className="text-sm mt-1">Files: {deliverable.files.length} file(s)</p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {selectedOrder.revisions && selectedOrder.revisions.length > 0 && (
                  <div>
                    <h3 className="font-semibold mb-2">Revision Requests</h3>
                    <div className="space-y-2">
                      {selectedOrder.revisions.map((revision: any, index: number) => (
                        <div key={index} className="bg-yellow-50 p-4 rounded-lg">
                          <p className="text-sm font-medium">Revision {index + 1}</p>
                          <p className="text-sm text-gray-600">{revision.reason}</p>
                          <p className="text-xs text-gray-500 mt-1">
                            Requested: {new Date(revision.requestedAt).toLocaleString()}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default Orders;
