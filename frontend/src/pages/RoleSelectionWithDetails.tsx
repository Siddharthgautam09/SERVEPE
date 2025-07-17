import { useState } from "react";
import { Users, Briefcase, ArrowRight, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { authAPI } from "@/api/auth";
import { useAuth } from "@/contexts/AuthContext";
import ErrorBoundary from "@/components/ErrorBoundary";
import Loading from "@/components/Loading";
import ordersImg from '@/images/role/orders.png';
import servpeScreenImg from '@/images/role/servpescreen.png';

const RoleSelectionWithDetails = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, updateUser, isLoading: authLoading } = useAuth();
  const [selectedRole, setSelectedRole] = useState<'client' | 'freelancer' | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    username: '',
    whatsappNumber: '',
  });
  const [usernameAvailable, setUsernameAvailable] = useState<boolean | null>(null);
  const [checkingUsername, setCheckingUsername] = useState(false);

  // Show loading if auth is still initializing
  if (authLoading) {
    return <Loading message="Loading role selection..." />;
  }

  // If user already has a role selected, redirect them
  if (user?.role && user?.roleSelected) {
    console.log('RoleSelectionWithDetails - User already has role, redirecting');
    const redirectPath = `/${user.username}`;
    navigate(redirectPath, { replace: true });
    return null;
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    if (field === 'username') {
      setUsernameAvailable(null);
      if (value.length >= 3) {
        checkUsernameAvailability(value);
      }
    }
  };

  const checkUsernameAvailability = async (username: string) => {
    setCheckingUsername(true);
    try {
      const response = await fetch(`http://localhost:8080/api/users/check-username/${username}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const data = await response.json();
      setUsernameAvailable(data.available);
    } catch (error) {
      console.error('Error checking username:', error);
    } finally {
      setCheckingUsername(false);
    }
  };

  const handleRoleSelect = (role: 'client' | 'freelancer') => {
    console.log('RoleSelectionWithDetails - Role selected:', role);
    setSelectedRole(role);
  };

  // Check if form is valid
  const isFormValid = () => {
    const hasRequiredFields = formData.firstName.trim() && 
                             formData.lastName.trim() && 
                             formData.username.trim() && 
                             formData.whatsappNumber.trim();
    const hasValidRole = selectedRole !== null;
    const hasValidWhatsapp = formData.whatsappNumber.match(/^\+91[6-9]\d{9}$/);
    // Allow if usernameAvailable is true, or if username is being checked (optimistic UX)
    const hasValidUsername = formData.username.length >= 3 && !checkingUsername && usernameAvailable === true;
    return hasRequiredFields && hasValidRole && hasValidUsername && hasValidWhatsapp;
  };

  const handleDetailsSubmit = async () => {
    if (!selectedRole) {
      toast({
        title: "Error",
        description: "Please select a role first.",
        variant: "destructive",
      });
      return;
    }

    // Validate required fields
    if (!formData.firstName || !formData.lastName || !formData.username || !formData.whatsappNumber) {
      toast({
        title: "Error",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    if (usernameAvailable === false) {
      toast({
        title: "Error",
        description: "Username is already taken. Please choose another one.",
        variant: "destructive",
      });
      return;
    }

    if (!formData.whatsappNumber.match(/^\+91[6-9]\d{9}$/)) {
      toast({
        title: "Error",
        description: "Please enter a valid WhatsApp number with +91.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    console.log('RoleSelectionWithDetails - Submitting details:', { role: selectedRole, ...formData });

    try {
      // First select the role
      const roleResponse = await authAPI.selectRole(selectedRole);
      
      if (roleResponse.success) {
        // Then update profile with additional details
        const profileResponse = await authAPI.updateProfile({
          firstName: formData.firstName,
          lastName: formData.lastName,
          username: formData.username.toLowerCase(),
          whatsappNumber: formData.whatsappNumber,
        });

        if (profileResponse.success) {
          updateUser({ 
            ...profileResponse.data,
            role: selectedRole, 
            roleSelected: true, 
            needsRoleSelection: false 
          });
          
          toast({
            title: "Profile Setup Complete",
            description: `Welcome to Servpe as a ${selectedRole}!`,
          });

          // Navigate to username-based profile
          const profilePath = `/${formData.username.toLowerCase()}`;
          console.log('RoleSelectionWithDetails - Navigating to:', profilePath);
          navigate(profilePath, { replace: true });
        }
      }
    } catch (error: any) {
      console.error('Profile setup error:', error);
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to setup profile. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md animate-fade-in">
          <CardHeader className="text-center">
            <div className="text-2xl font-bold text-gray-900 mb-4">SERVPE</div>
            <CardTitle className="text-2xl font-bold">
              Hello {user?.firstName || 'there'}!
            </CardTitle>
            <CardDescription>
              In few moment you will be ready to use servpe! and share your profile
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Your Name</label>
              <Input
                placeholder="Please enter your name"
                value={`${formData.firstName} ${formData.lastName}`.trim()}
                onChange={(e) => {
                  const [firstName, ...lastNameParts] = e.target.value.split(' ');
                  setFormData(prev => ({
                    ...prev,
                    firstName: firstName || '',
                    lastName: lastNameParts.join(' ') || ''
                  }));
                }}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Your servpe page link</label>
              <div className="flex items-center border rounded-md">
                <span className="px-3 py-2 bg-gray-50 text-gray-500 text-sm border-r">localhost:8081/</span>
                <Input
                  className="border-0 focus:ring-0"
                  placeholder="suvajitroy"
                  value={formData.username}
                  onChange={(e) => handleInputChange('username', e.target.value.toLowerCase())}
                />
                {usernameAvailable === true && (
                  <Check className="h-5 w-5 text-green-500 mr-2" />
                )}
              </div>
              {checkingUsername && (
                <p className="text-xs text-gray-500 mt-1">Checking availability...</p>
              )}
              {usernameAvailable === false && (
                <p className="text-xs text-red-500 mt-1">Username is already taken</p>
              )}
              {usernameAvailable === true && (
                <p className="text-xs text-green-500 mt-1">Username is available</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Whatsapp Number</label>
              <div className="flex items-center border rounded-md">
                <span className="px-3 py-2 bg-gray-50 text-gray-500 text-sm border-r flex items-center">
                  🇮🇳 +91
                </span>
                <Input
                  className="border-0 focus:ring-0"
                  placeholder="83273xxxx"
                  value={formData.whatsappNumber.replace('+91', '')}
                  onChange={(e) => {
                    const number = e.target.value.replace(/\D/g, '');
                    if (number.length <= 10) {
                      handleInputChange('whatsappNumber', `+91${number}`);
                    }
                  }}
                />
              </div>
              {formData.whatsappNumber && !formData.whatsappNumber.match(/^\+91[6-9]\d{9}$/) && (
                <p className="text-xs text-red-500 mt-1">Please enter a valid phone number</p>
              )}
            </div>

            <div className="flex items-center bg-[#F4F8FF] rounded-xl p-2 gap-3 border border-[#E3EAFD] min-h-[80px] h-[100px]">
              <div className="flex flex-col gap-2 min-w-[90px]">
                <div className="flex items-center bg-white border border-[#CFE3DB] rounded-full px-2 py-1 gap-2 shadow-sm h-8">
                  <img src={ordersImg} alt="Orders" className="w-5 h-5 object-contain" />
                  <span className="text-[#3B5F51] font-medium text-[15px]">Orders</span>
                </div>
                <div className="flex items-center bg-white border border-[#CFE3DB] rounded-full px-2 py-1 gap-2 shadow-sm h-8">
                  <img src={ordersImg} alt="Reminders" className="w-5 h-5 object-contain" />
                  <span className="text-[#3B5F51] font-medium text-[15px]">Reminders</span>
                </div>
              </div>
              <div className="flex items-center justify-center min-w-[90px]">
                <img src={servpeScreenImg} alt="Servpe Screen" className="w-[90px] h-[55px] object-contain rounded-lg border border-[#E3EAFD] bg-white" />
              </div>
              <div className="flex-1 flex flex-col justify-center pl-2">
                <div className="text-[15px] font-medium text-[#222] leading-snug mb-1">Add your Whatsapp<br/>number to get order &<br/>status updates.</div>
                <div className="text-[13px] text-[#3B82F6]">Most users love this!</div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Join Servpe as</label>
              <div className="space-y-2">
                <div 
                  className={`border rounded-md p-3 text-center cursor-pointer transition-all ${
                    selectedRole === 'client' 
                      ? 'border-2 border-blue-500 bg-blue-50 text-blue-700 font-medium' 
                      : 'bg-gray-50 text-gray-500 hover:bg-gray-100'
                  }`}
                  onClick={() => handleRoleSelect('client')}
                >
                  Client - service seeker
                </div>
                <div 
                  className={`border rounded-md p-3 text-center cursor-pointer transition-all ${
                    selectedRole === 'freelancer' 
                      ? 'border-2 border-blue-500 bg-blue-50 text-blue-700 font-medium' 
                      : 'bg-gray-50 text-gray-500 hover:bg-gray-100'
                  }`}
                  onClick={() => handleRoleSelect('freelancer')}
                >
                  Talent - service provider
                </div>
              </div>
            </div>

            <Button 
              onClick={handleDetailsSubmit}
              disabled={isLoading || !isFormValid()}
              className="w-full bg-blue-600 hover:bg-blue-700"
            >
              {isLoading ? "Setting up..." : "Next"}
            </Button>
            {checkingUsername && (
              <p className="text-xs text-blue-500 mt-1 text-center">Checking username availability...</p>
            )}
          </CardContent>
        </Card>
      </div>
    </ErrorBoundary>
  );
};

export default RoleSelectionWithDetails;
