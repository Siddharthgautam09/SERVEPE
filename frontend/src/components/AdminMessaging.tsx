
import React, { useState, useEffect } from 'react';
import { Send, Search, MessageSquare, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { messageAPI } from '@/api/messages';
import { useToast } from '@/hooks/use-toast';

const AdminMessaging: React.FC = () => {
  const [users, setUsers] = useState<any[]>([]);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    fetchUsers();
  }, [searchTerm]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await messageAPI.getAdminUsers(1, 20, searchTerm);
      if (response.success) {
        setUsers(response.data);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load users",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const sendAdminMessage = async () => {
    if (!selectedUser || !message.trim() || sending) return;

    setSending(true);
    try {
      const response = await messageAPI.adminSendMessage({
        recipientId: selectedUser._id,
        content: message.trim()
      });

      if (response.success) {
        toast({
          title: "Success",
          description: `Message sent to ${selectedUser.firstName} ${selectedUser.lastName}`,
        });
        setMessage('');
      } else {
        throw new Error(response.message);
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to send message",
        variant: "destructive",
      });
    } finally {
      setSending(false);
    }
  };

  const getUserInitials = (user: any) => {
    return `${user.firstName?.charAt(0) || ''}${user.lastName?.charAt(0) || ''}`.toUpperCase();
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Users List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Users
          </CardTitle>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardHeader>
        <CardContent className="max-h-96 overflow-y-auto">
          {loading ? (
            <div className="text-center py-4">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-red-600 mx-auto"></div>
            </div>
          ) : users.length === 0 ? (
            <p className="text-gray-500 text-center py-4">No users found</p>
          ) : (
            <div className="space-y-2">
              {users.map((user) => (
                <div
                  key={user._id}
                  onClick={() => setSelectedUser(user)}
                  className={`p-3 rounded-lg cursor-pointer transition-colors ${
                    selectedUser?._id === user._id
                      ? 'bg-red-50 border border-red-200'
                      : 'hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={user.profilePicture} />
                      <AvatarFallback>{getUserInitials(user)}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm">
                        {user.firstName} {user.lastName}
                      </p>
                      <p className="text-sm text-gray-500 truncate">{user.email}</p>
                      <div className="flex items-center space-x-2 mt-1">
                        <Badge 
                          variant={user.role === 'freelancer' ? 'secondary' : 'default'}
                          className="text-xs"
                        >
                          {user.role}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Message Composer */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Send Admin Message
          </CardTitle>
          {selectedUser && (
            <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
              <Avatar className="h-10 w-10">
                <AvatarImage src={selectedUser.profilePicture} />
                <AvatarFallback>{getUserInitials(selectedUser)}</AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium">
                  {selectedUser.firstName} {selectedUser.lastName}
                </p>
                <p className="text-sm text-gray-500">{selectedUser.email}</p>
              </div>
            </div>
          )}
        </CardHeader>
        <CardContent className="space-y-4">
          {selectedUser ? (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Message
                </label>
                <Textarea
                  placeholder="Type your admin message here..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows={6}
                  className="resize-none"
                />
              </div>
              <Button
                onClick={sendAdminMessage}
                disabled={!message.trim() || sending}
                className="w-full bg-red-600 hover:bg-red-700"
              >
                <Send className="h-4 w-4 mr-2" />
                {sending ? 'Sending...' : 'Send Admin Message'}
              </Button>
              <p className="text-xs text-gray-500">
                This message will be marked as an official admin communication.
              </p>
            </>
          ) : (
            <div className="text-center py-8">
              <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">Select a user to send a message</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminMessaging;
