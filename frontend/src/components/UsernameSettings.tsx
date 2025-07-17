
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { ApiResponse, UsernameCheckResponse } from '@/types/api';
import axios from 'axios';

const API_BASE_URL = 'http://localhost:8080/api';

const UsernameSettings = () => {
  const { user, token, updateUser } = useAuth();
  const { toast } = useToast();
  const [username, setUsername] = useState(user?.username || '');
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(false);
  const [isAvailable, setIsAvailable] = useState<boolean | null>(null);

  const checkUsername = async (usernameToCheck: string) => {
    if (!usernameToCheck || usernameToCheck.length < 3) {
      setIsAvailable(null);
      return;
    }

    try {
      setChecking(true);
      const response = await axios.get<UsernameCheckResponse>(`${API_BASE_URL}/users/check-username/${usernameToCheck}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setIsAvailable(response.data.available);
    } catch (error) {
      console.error('Username check error:', error);
      setIsAvailable(false);
    } finally {
      setChecking(false);
    }
  };

  const handleUsernameChange = (value: string) => {
    setUsername(value);
    // Check username availability after user stops typing
    if (window.usernameTimeout) {
      clearTimeout(window.usernameTimeout);
    }
    window.usernameTimeout = setTimeout(() => checkUsername(value), 500);
  };

  const handleSave = async () => {
    if (!username || username.length < 3) {
      toast({
        title: "Error",
        description: "Username must be at least 3 characters long",
        variant: "destructive",
      });
      return;
    }

    if (isAvailable === false) {
      toast({
        title: "Error",
        description: "Username is not available",
        variant: "destructive",
      });
      return;
    }

    try {
      setLoading(true);
      const response = await axios.put<ApiResponse>(`${API_BASE_URL}/users/profile`, 
        { username },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        toast({
          title: "Success",
          description: "Username updated successfully",
        });
        // Update user context
        if (user) {
          updateUser({ ...user, username });
        }
      }
    } catch (error: any) {
      console.error('Update username error:', error);
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to update username",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Username Settings</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <label className="text-sm font-medium text-gray-700 mb-2 block">
            Username
          </label>
          <div className="flex space-x-2">
            <div className="flex-1">
              <Input
                value={username}
                onChange={(e) => handleUsernameChange(e.target.value)}
                placeholder="Enter your username"
                className={`${
                  isAvailable === true ? 'border-green-500' : 
                  isAvailable === false ? 'border-red-500' : ''
                }`}
              />
              {checking && (
                <p className="text-xs text-gray-500 mt-1">Checking availability...</p>
              )}
              {isAvailable === true && (
                <p className="text-xs text-green-600 mt-1">Username is available</p>
              )}
              {isAvailable === false && (
                <p className="text-xs text-red-600 mt-1">Username is not available</p>
              )}
            </div>
            <Button 
              onClick={handleSave}
              disabled={loading || checking || isAvailable === false || !username}
            >
              {loading ? 'Saving...' : 'Save'}
            </Button>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Your username will be displayed on your services and can be used by clients to find you.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default UsernameSettings;
