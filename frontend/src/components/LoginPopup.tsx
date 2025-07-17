import React, { useState, useEffect } from 'react';
import { X, Sparkles, ArrowRight, User, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

interface LoginPopupProps {
  isOpen: boolean;
  onClose: () => void;
}

const LoginPopup = ({ isOpen, onClose }: LoginPopupProps) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  const handleLogin = () => {
    if (mounted) {
      navigate('/login');
      onClose();
    }
  };

  const handleGetStarted = () => {
    if (mounted) {
      navigate('/login');
      onClose();
    }
  };

  const handleClose = () => {
    if (mounted) {
      onClose();
    }
  };

  // Don't render if not mounted or user is logged in
  if (!mounted || user) {
    return null;
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-sm max-w-[90vw] border-0 p-0 bg-transparent shadow-none">
        <div className="relative">
          {/* 3D Card Container */}
          <div className="login-popup-card perspective-1000 transform-3d">
            <div className="glass-card-dark rounded-2xl p-6 sm:p-8 border border-gray-200 shadow-3d-purple transform-gpu hover:shadow-glow-purple transition-all duration-700 animate-scale-in">
              {/* Background Glow Effects */}
              <div className="absolute -top-10 -left-10 w-20 h-20 sm:w-32 sm:h-32 bg-purple-500 rounded-full blur-3xl opacity-10 animate-blob"></div>
              <div className="absolute -bottom-10 -right-10 w-20 h-20 sm:w-32 sm:h-32 bg-pink-500 rounded-full blur-3xl opacity-10 animate-blob animation-delay-2000"></div>
              
              {/* Close Button */}
              <button
                onClick={handleClose}
                className="absolute top-3 right-3 w-7 h-7 rounded-full glass hover:bg-gray-100 flex items-center justify-center transition-all duration-300 hover:rotate-90 z-10"
              >
                <X className="w-3 h-3 text-gray-600" />
              </button>

              {/* Header */}
              <div className="text-center mb-6">
                <div className="flex items-center justify-center mb-3">
                  <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center shadow-glow-purple animate-pulse-glow">
                    <Sparkles className="w-6 h-6 sm:w-7 sm:h-7 text-white animate-spin-slow" />
                  </div>
                </div>
                <DialogHeader>
                  <DialogTitle className="text-xl sm:text-2xl font-bold text-gray-900 text-glow mb-2">
                    Welcome to Servpe
                  </DialogTitle>
                  <DialogDescription className="text-gray-600 text-sm sm:text-base">
                    Join thousands of freelancers and clients
                  </DialogDescription>
                </DialogHeader>
              </div>

              {/* Features */}
              <div className="space-y-3 mb-6">
                <div className="flex items-center space-x-3 p-2 sm:p-3 rounded-lg glass hover:bg-gray-50 transition-all duration-300 hover:scale-105">
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                    <User className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <p className="text-gray-900 font-medium text-sm">Connect with Top Talent</p>
                    <p className="text-gray-600 text-xs">Find verified professionals instantly</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3 p-2 sm:p-3 rounded-lg glass hover:bg-gray-50 transition-all duration-300 hover:scale-105">
                  <div className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-lg flex items-center justify-center">
                    <Lock className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <p className="text-gray-900 font-medium text-sm">Secure & Trusted</p>
                    <p className="text-gray-600 text-xs">Your projects are safe with us</p>
                  </div>
                </div>
              </div>

              {/* CTA Buttons */}
              <div className="space-y-3">
                <Button 
                  onClick={handleGetStarted}
                  className="w-full h-10 bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 btn-3d group text-sm font-semibold"
                >
                  Get Started
                  <ArrowRight className="ml-2 h-4 w-4 arrow-hover" />
                </Button>
                
                <Button 
                  variant="outline"
                  onClick={handleLogin}
                  className="w-full h-10 border-gray-300 text-gray-900 hover:bg-gray-50 btn-3d text-sm"
                >
                  Already have an account? Sign In
                </Button>
              </div>

              {/* Footer */}
              <div className="text-center mt-4 pt-4 border-t border-gray-200">
                <p className="text-gray-500 text-xs">
                  Join our community of 10,000+ users
                </p>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default LoginPopup;