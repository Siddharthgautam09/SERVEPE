import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { authAPI } from '@/api/auth';
import { Mail, Lock, ArrowLeft } from 'lucide-react';
import Loading from '@/components/Loading';
import loginIllustration from '@/images/login/image.png';

const EmailOTPLogin = () => {
  const [step, setStep] = useState<'email' | 'otp'>('email');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [countdown, setCountdown] = useState(0);
  
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const { user, login } = useAuth();

  // Google OAuth configuration
  const REDIRECT_URI = "http://localhost:8081/email-otp-login";
  const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || "10698272202-emghd3gee0eb8f548rjmush3ekfo8fc6.apps.googleusercontent.com";

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      const from = location.state?.from?.pathname || '/';
      navigate(from, { replace: true });
    }
  }, [user, navigate, location]);

  // Handle Google OAuth callback
  useEffect(() => {
    const handleGoogleCallback = async () => {
      const urlParams = new URLSearchParams(window.location.search);
      const code = urlParams.get('code');
      const error = urlParams.get('error');

      if (error) {
        console.error('Google OAuth error:', error);
        toast({
          title: "Google Login Error",
          description: "Google login was cancelled or failed",
          variant: "destructive"
        });
        // Clean up URL
        window.history.replaceState({}, document.title, window.location.pathname);
        return;
      }

      if (code) {
        console.log('Google OAuth code received, processing...');
        setIsLoading(true);
        
        try {
          const response = await authAPI.googleOAuth(code, REDIRECT_URI);
          if (response.success && response.token && response.user) {
            login(response.token, response.user);
            toast({
              title: "Success",
              description: "Successfully logged in with Google!"
            });
            
            // Check if user needs role selection
            if (!response.user.roleSelected || response.user.needsRoleSelection) {
              navigate('/role-selection');
            } else {
              const from = location.state?.from?.pathname || '/';
              navigate(from, { replace: true });
            }
          }
        } catch (error: any) {
          console.error('Google OAuth processing error:', error);
          toast({
            title: "Error",
            description: error.response?.data?.message || "Google login failed",
            variant: "destructive"
          });
        } finally {
          setIsLoading(false);
          // Clean up URL
          window.history.replaceState({}, document.title, window.location.pathname);
        }
      }
    };

    handleGoogleCallback();
  }, [login, navigate, location, toast, REDIRECT_URI]);

  // Countdown timer for resend OTP
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      toast({
        title: "Error",
        description: "Please enter your email address",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    try {
      const response = await authAPI.sendEmailOTP(email);
      if (response.success) {
        setStep('otp');
        setCountdown(60);
        toast({
          title: "OTP Sent",
          description: "Please check your email for the verification code"
        });
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to send OTP",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.length !== 6) {
      toast({
        title: "Error",
        description: "Please enter the complete 6-digit OTP",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    try {
      const response = await authAPI.verifyEmailOTP(email, otp);
      if (response.success && response.token && response.user) {
        login(response.token, response.user);
        toast({
          title: "Success",
          description: "Successfully logged in!"
        });
        
        // Check if user needs role selection
        if (!response.user.roleSelected || response.user.needsRoleSelection) {
          navigate('/role-selection');
        } else {
          const from = location.state?.from?.pathname || '/';
          navigate(from, { replace: true });
        }
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Invalid OTP",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOTP = async () => {
    if (countdown > 0) return;
    
    setIsResending(true);
    try {
      const response = await authAPI.sendEmailOTP(email);
      if (response.success) {
        setCountdown(60);
        toast({
          title: "OTP Resent",
          description: "A new verification code has been sent to your email"
        });
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to resend OTP",
        variant: "destructive"
      });
    } finally {
      setIsResending(false);
    }
  };

  // Build Google OAuth URL
  const getGoogleOAuthUrl = () => {
    const params = new URLSearchParams({
      client_id: GOOGLE_CLIENT_ID,
      redirect_uri: REDIRECT_URI,
      response_type: 'code',
      scope: 'openid email profile',
      access_type: 'offline',
      prompt: 'select_account'
    });
    
    const oauthUrl = `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
    console.log('=== Google OAuth URL Debug ===');
    console.log('Client ID:', GOOGLE_CLIENT_ID);
    console.log('Redirect URI:', REDIRECT_URI);
    console.log('Full OAuth URL:', oauthUrl);
    console.log('============================');
    
    return oauthUrl;
  };

  const handleGoogleLogin = async () => {
    console.log('=== Starting Google Login ===');
    console.log('Frontend running on: http://localhost:8081');
    console.log('Backend expected on: http://localhost:8080');
    console.log('Google Client ID:', GOOGLE_CLIENT_ID);
    console.log('Redirect URI:', REDIRECT_URI);
    
    try {
      // Test backend connectivity first
      console.log('Testing backend connectivity...');
      const healthResponse = await fetch('http://localhost:8080/api/health', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      console.log('Backend health check status:', healthResponse.status);
      
      if (healthResponse.ok) {
        const healthData = await healthResponse.json();
        console.log('Backend health response:', healthData);
        
        if (!healthData.environment?.googleClientIdConfigured) {
          toast({
            title: "Configuration Error",
            description: "Google login is not properly configured on the server. Please check GOOGLE_WEB_CLIENT_ID environment variable.",
            variant: "destructive",
          });
          return;
        }
      }
      
      // Proceed with OAuth (even if health check fails, as the endpoint might not exist)
      const oauthUrl = getGoogleOAuthUrl();
      console.log('Redirecting to Google OAuth...');
      window.location.href = oauthUrl;
      
    } catch (error) {
      console.error('Backend connectivity error:', error);
      // Still proceed with OAuth as backend might be working but health endpoint missing
      const oauthUrl = getGoogleOAuthUrl();
      console.log('Backend health check failed, but proceeding with OAuth...');
      window.location.href = oauthUrl;
    }
  };

  if (isLoading && step === 'email') {
    return <Loading message="Sending OTP..." />;
  }

  if (isLoading && step === 'otp') {
    return <Loading message="Processing..." />;
  }

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[#f9fbff]">
      <div className="flex w-full max-w-5xl min-h-[600px] bg-white rounded-2xl shadow-2xl overflow-hidden">
        {/* Left: Form */}
        <div className="w-full md:w-1/2 flex flex-col justify-center px-8 py-12 md:px-12">
          <div className="max-w-md w-full mx-auto">
            <div className="mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-2">Sign in or Sign up</h2>
              <p className="text-gray-600 text-base leading-relaxed">
                Sign in to access dashboard or create your account and continue to manage your account
              </p>
            </div>
            <Card className="border-0 shadow-none bg-transparent p-0">
              <CardHeader className="text-center pb-6 p-0">
                <div className="mx-auto w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center mb-4">
                  {step === 'email' ? (
                    <Mail className="w-6 h-6 text-white" />
                  ) : (
                    <Lock className="w-6 h-6 text-white" />
                  )}
                </div>
                <CardTitle className="text-xl font-semibold text-gray-900">
                  {step === 'email' ? 'Sign in or Sign up' : 'Please enter your OTP to verify'}
                </CardTitle>
                <CardDescription className="text-gray-600">
                  {step === 'email' 
                    ? ''
                    : `We have sent it to ${email}`
                  }
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6 p-0">
                {step === 'email' ? (
                  <>
                    <form onSubmit={handleSendOTP} className="space-y-4">
                      <div className="space-y-2 text-left">
                        <label htmlFor="email" className="text-sm font-medium text-gray-700">
                          Email
                        </label>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                            <Mail className="w-4 h-4" />
                          </span>
                          <Input
                            id="email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="Enter your email"
                            className="h-12 pl-10"
                            required
                          />
                        </div>
                      </div>
                      <Button 
                        type="submit" 
                        className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg mt-2"
                        disabled={isLoading}
                      >
                        {isLoading ? "Sending..." : "Continue"}
                      </Button>
                    </form>
                    <div className="flex items-center my-4">
                      <div className="flex-grow border-t border-gray-200"></div>
                      <span className="mx-4 text-gray-400 text-sm">OR</span>
                      <div className="flex-grow border-t border-gray-200"></div>
                    </div>
                    <Button
                      onClick={handleGoogleLogin}
                      variant="outline"
                      className="w-full h-12 border-gray-300 hover:bg-gray-50 rounded-lg flex items-center justify-center"
                      disabled={isLoading}
                    >
                      <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
                        <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                        <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                        <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                        <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                      </svg>
                      Continue With Google
                    </Button>
                  </>
                ) : (
                  <>
                    <Button
                      variant="ghost"
                      onClick={() => setStep('email')}
                      className="mb-4 p-0 h-auto text-blue-600 hover:text-blue-700 flex items-center justify-start"
                    >
                      <ArrowLeft className="w-4 h-4 mr-2" />
                      Back to email
                    </Button>
                    <form onSubmit={handleVerifyOTP} className="space-y-6">
                      <div className="flex justify-center">
                        <InputOTP
                          value={otp}
                          onChange={setOtp}
                          maxLength={6}
                        >
                          <InputOTPGroup>
                            <InputOTPSlot index={0} />
                            <InputOTPSlot index={1} />
                            <InputOTPSlot index={2} />
                            <InputOTPSlot index={3} />
                            <InputOTPSlot index={4} />
                            <InputOTPSlot index={5} />
                          </InputOTPGroup>
                        </InputOTP>
                      </div>
                      <div className="text-center text-xs text-gray-500">
                        NOTE: If you didn't get the OTP then please check your spam folder
                      </div>
                      <Button 
                        type="submit" 
                        className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg"
                        disabled={isLoading}
                      >
                        {isLoading ? "Verifying..." : "Continue"}
                      </Button>
                    </form>
                    <div className="text-center mt-2">
                      <Button
                        variant="ghost"
                        onClick={handleResendOTP}
                        disabled={countdown > 0 || isResending}
                        className="text-blue-600 hover:text-blue-700"
                      >
                        {isResending ? "Resending..." : 
                         countdown > 0 ? `Resend OTP in ${countdown}s` : "Resend OTP"}
                      </Button>
                    </div>
                    <div className="flex items-center my-4">
                      <div className="flex-grow border-t border-gray-200"></div>
                      <span className="mx-4 text-gray-400 text-sm">OR</span>
                      <div className="flex-grow border-t border-gray-200"></div>
                    </div>
                    <Button
                      onClick={handleGoogleLogin}
                      variant="outline"
                      className="w-full h-12 border-gray-300 hover:bg-gray-50 rounded-lg flex items-center justify-center"
                      disabled={isLoading}
                    >
                      <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
                        <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                        <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                        <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                        <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                      </svg>
                      Continue With Google
                    </Button>
                  </>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
        {/* Right: Illustration */}
        <div className="hidden md:flex w-1/2 bg-[#f9fbff] items-center justify-center relative">
          <img
            src={loginIllustration}
            alt="Login Illustration"
            className="max-w-[400px] w-full h-auto object-contain"
            draggable={false}
          />
        </div>
      </div>
    </div>
  );
};

export default EmailOTPLogin;
