import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  CreditCard, 
  DollarSign, 
  Calendar,
  CheckCircle,
  Clock,
  AlertCircle,
  Plus,
  Wallet
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';

const Payout = () => {
  const { user } = useAuth();
  const [balance, setBalance] = useState({
    available: 8500,
    pending: 2300,
    total: 10800
  });

  const [payoutHistory] = useState([
    {
      id: 1,
      amount: 5000,
      status: 'completed',
      date: '2024-01-15',
      method: 'Bank Transfer',
      transactionId: 'TXN123456'
    },
    {
      id: 2,
      amount: 3200,
      status: 'pending',
      date: '2024-01-10',
      method: 'UPI',
      transactionId: 'TXN123457'
    },
    {
      id: 3,
      amount: 2800,
      status: 'completed',
      date: '2024-01-05',
      method: 'Bank Transfer',
      transactionId: 'TXN123458'
    }
  ]);

  const [paymentMethods] = useState([
    {
      id: 1,
      type: 'bank',
      name: 'Bank Account',
      details: '****1234',
      isDefault: true
    },
    {
      id: 2,
      type: 'upi',
      name: 'UPI',
      details: 'user@paytm',
      isDefault: false
    }
  ]);

  const [withdrawAmount, setWithdrawAmount] = useState('');

  const handleWithdraw = () => {
    const amount = parseFloat(withdrawAmount);
    if (!amount || amount <= 0) {
      toast({
        title: "Invalid Amount",
        description: "Please enter a valid amount",
        variant: "destructive"
      });
      return;
    }

    if (amount > balance.available) {
      toast({
        title: "Insufficient Balance",
        description: "Amount exceeds available balance",
        variant: "destructive"
      });
      return;
    }

    toast({
      title: "Withdrawal Request Submitted",
      description: `₹${amount} withdrawal request has been submitted`,
    });
    setWithdrawAmount('');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4" />;
      case 'pending':
        return <Clock className="h-4 w-4" />;
      case 'failed':
        return <AlertCircle className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-foreground">Payout</h1>
          <p className="text-muted-foreground">
            Manage your earnings and withdrawal methods
          </p>
        </div>

        {/* Balance Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <Wallet className="h-5 w-5 text-green-500" />
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Available Balance</p>
                  <p className="text-2xl font-bold text-foreground">₹{balance.available.toLocaleString()}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <Clock className="h-5 w-5 text-yellow-500" />
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Pending</p>
                  <p className="text-2xl font-bold text-foreground">₹{balance.pending.toLocaleString()}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <DollarSign className="h-5 w-5 text-blue-500" />
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Earnings</p>
                  <p className="text-2xl font-bold text-foreground">₹{balance.total.toLocaleString()}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="withdraw" className="space-y-6">
          <TabsList>
            <TabsTrigger value="withdraw">Withdraw</TabsTrigger>
            <TabsTrigger value="history">Payout History</TabsTrigger>
            <TabsTrigger value="methods">Payment Methods</TabsTrigger>
          </TabsList>

          <TabsContent value="withdraw">
            <Card>
              <CardHeader>
                <CardTitle>Withdraw Funds</CardTitle>
                <CardDescription>
                  Withdraw your available balance to your bank account or UPI
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="amount">Withdrawal Amount</Label>
                  <Input
                    id="amount"
                    type="number"
                    placeholder="Enter amount"
                    value={withdrawAmount}
                    onChange={(e) => setWithdrawAmount(e.target.value)}
                    max={balance.available}
                  />
                  <p className="text-sm text-muted-foreground">
                    Available balance: ₹{balance.available.toLocaleString()}
                  </p>
                </div>

                <div className="space-y-4">
                  <Label>Select Payment Method</Label>
                  {paymentMethods.map((method) => (
                    <div key={method.id} className="flex items-center space-x-3 p-4 border rounded-lg">
                      <input
                        type="radio"
                        name="paymentMethod"
                        defaultChecked={method.isDefault}
                        className="h-4 w-4"
                      />
                      <CreditCard className="h-5 w-5 text-muted-foreground" />
                      <div className="flex-1">
                        <p className="font-medium">{method.name}</p>
                        <p className="text-sm text-muted-foreground">{method.details}</p>
                      </div>
                      {method.isDefault && (
                        <Badge variant="secondary">Default</Badge>
                      )}
                    </div>
                  ))}
                </div>

                <Button onClick={handleWithdraw} className="w-full">
                  Request Withdrawal
                </Button>

                <div className="bg-blue-50 p-4 rounded-lg">
                  <h4 className="font-medium text-blue-900">Withdrawal Information</h4>
                  <ul className="text-sm text-blue-800 mt-2 space-y-1">
                    <li>• Minimum withdrawal amount: ₹500</li>
                    <li>• Processing time: 1-3 business days</li>
                    <li>• No withdrawal fees</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="history">
            <Card>
              <CardHeader>
                <CardTitle>Payout History</CardTitle>
                <CardDescription>
                  View all your past withdrawal transactions
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {payoutHistory.map((payout) => (
                    <div key={payout.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-4">
                        {getStatusIcon(payout.status)}
                        <div>
                          <p className="font-medium">₹{payout.amount.toLocaleString()}</p>
                          <p className="text-sm text-muted-foreground">{payout.method}</p>
                          <p className="text-xs text-muted-foreground">ID: {payout.transactionId}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge className={getStatusColor(payout.status)}>
                          {payout.status}
                        </Badge>
                        <p className="text-sm text-muted-foreground mt-1">
                          {new Date(payout.date).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="methods">
            <Card>
              <CardHeader>
                <CardTitle>Payment Methods</CardTitle>
                <CardDescription>
                  Manage your bank accounts and UPI IDs for withdrawals
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {paymentMethods.map((method) => (
                    <div key={method.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-4">
                        <CreditCard className="h-5 w-5 text-muted-foreground" />
                        <div>
                          <p className="font-medium">{method.name}</p>
                          <p className="text-sm text-muted-foreground">{method.details}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        {method.isDefault && (
                          <Badge variant="secondary">Default</Badge>
                        )}
                        <Button variant="outline" size="sm">
                          Edit
                        </Button>
                      </div>
                    </div>
                  ))}
                  
                  <Button variant="outline" className="w-full">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Payment Method
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Payout;