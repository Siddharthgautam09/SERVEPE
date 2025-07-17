
import { useState } from "react";
import { Users, Briefcase, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { authAPI } from "@/api/auth";
import { useAuth } from "@/contexts/AuthContext";
import ErrorBoundary from "@/components/ErrorBoundary";
import Loading from "@/components/Loading";

const RoleSelection = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, updateUser, isLoading: authLoading } = useAuth();
  const [selectedRole, setSelectedRole] = useState<'client' | 'freelancer' | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  console.log('RoleSelection - user:', user, 'authLoading:', authLoading);

  // Show loading if auth is still initializing
  if (authLoading) {
    return <Loading message="Loading role selection..." />;
  }

  // If user already has a role selected, redirect them
  if (user?.role && user?.roleSelected) {
    console.log('RoleSelection - User already has role, redirecting');
    const redirectPath = user.role === 'freelancer' ? '/freelancer/dashboard' : '/client/dashboard';
    navigate(redirectPath, { replace: true });
    return null;
  }

  const handleRoleSelect = (role: 'client' | 'freelancer') => {
    console.log('RoleSelection - Role selected:', role);
    setSelectedRole(role);
  };

  const handleContinue = async () => {
    if (!selectedRole) {
      toast({
        title: "Error",
        description: "Please select a role to continue.",
        variant: "destructive",
      });
      return;
    }
    
    setIsLoading(true);
    console.log('RoleSelection - Submitting role:', selectedRole);

    try {
      const response = await authAPI.selectRole(selectedRole);
      
      if (response.success) {
        updateUser({ role: selectedRole, roleSelected: true, needsRoleSelection: false });
        
        toast({
          title: "Role Selected",
          description: `Welcome to Servpe as a ${selectedRole}!`,
        });

        // Navigate to appropriate dashboard
        const dashboardPath = selectedRole === 'client' ? '/client/dashboard' : '/freelancer/dashboard';
        console.log('RoleSelection - Navigating to:', dashboardPath);
        navigate(dashboardPath, { replace: true });
      } else {
        throw new Error(response.message || 'Failed to select role');
      }
    } catch (error: any) {
      console.error('Role selection error:', error);
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to set role. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50 flex items-center justify-center p-4">
        <div className="w-full max-w-4xl animate-fade-in">
          <div className="text-center mb-8 animate-scale-in">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Welcome to Servpe!
            </h1>
            <p className="text-lg text-gray-600">
              How would you like to use our platform?
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6 mb-8">
            <Card 
              className={`cursor-pointer transition-all duration-300 hover:shadow-lg hover:-translate-y-1 animate-fade-in ${
                selectedRole === 'client' 
                  ? 'ring-2 ring-blue-500 border-blue-500 scale-105' 
                  : 'hover:border-gray-300'
              }`}
              style={{animationDelay: '0.1s'}}
              onClick={() => handleRoleSelect('client')}
            >
              <CardHeader className="text-center">
                <div className="mx-auto mb-4 p-4 bg-blue-100 rounded-full w-16 h-16 flex items-center justify-center hover:scale-110 transition-transform duration-200">
                  <Briefcase className="h-8 w-8 text-blue-600" />
                </div>
                <CardTitle className="text-xl">I'm a Client</CardTitle>
                <CardDescription>
                  I want to hire freelancers for my projects
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li>• Post projects and get proposals</li>
                  <li>• Browse freelancer profiles</li>
                  <li>• Manage your projects and payments</li>
                  <li>• Communicate with freelancers</li>
                </ul>
              </CardContent>
            </Card>

            <Card 
              className={`cursor-pointer transition-all duration-300 hover:shadow-lg hover:-translate-y-1 animate-fade-in ${
                selectedRole === 'freelancer' 
                  ? 'ring-2 ring-green-500 border-green-500 scale-105' 
                  : 'hover:border-gray-300'
              }`}
              style={{animationDelay: '0.2s'}}
              onClick={() => handleRoleSelect('freelancer')}
            >
              <CardHeader className="text-center">
                <div className="mx-auto mb-4 p-4 bg-green-100 rounded-full w-16 h-16 flex items-center justify-center hover:scale-110 transition-transform duration-200">
                  <Users className="h-8 w-8 text-green-600" />
                </div>
                <CardTitle className="text-xl">I'm a Freelancer</CardTitle>
                <CardDescription>
                  I want to offer my services and work on projects
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li>• Create and showcase your services</li>
                  <li>• Submit proposals to projects</li>
                  <li>• Build your portfolio</li>
                  <li>• Earn money from your skills</li>
                </ul>
              </CardContent>
            </Card>
          </div>

          <div className="text-center animate-fade-in" style={{animationDelay: '0.3s'}}>
            <Button 
              onClick={handleContinue}
              disabled={!selectedRole || isLoading}
              className="bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 hover:scale-105 transition-all duration-200 px-8"
            >
              {isLoading ? "Setting up..." : "Continue"}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </ErrorBoundary>
  );
};

export default RoleSelection;
