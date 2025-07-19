import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { 
  Home, 
  ShoppingCart,
  MessageSquare,
  Briefcase,
  BarChart3,
  CreditCard,
  Settings,
  Sparkles,
  User,
  Bell
} from 'lucide-react';

interface SidebarLayoutProps {
  children: React.ReactNode;
}

const SidebarLayout: React.FC<SidebarLayoutProps> = ({ children }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [unreadMessages, setUnreadMessages] = useState(0);
  const [showMessagePopup, setShowMessagePopup] = useState(false);

  const getHomeRoute = () => {
    if (user?.role === 'freelancer') {
      return '/freelancer/dashboard';
    } else if (user?.role === 'client') {
      return '/client/dashboard';
    }
    return '/';
  };

  const sidebarItems = [
    { 
      icon: Home, 
      label: 'Home', 
      path: getHomeRoute(),
      description: 'Dashboard'
    },
    { 
      icon: ShoppingCart, 
      label: 'Orders', 
      path: user?.role === 'freelancer' ? '/freelancer/orders' : '/client/orders',
      description: 'Order management'
    },
    { 
      icon: MessageSquare, 
      label: 'Messages', 
      path: '/messaging',
      description: 'Chat & conversations',
      hasNotification: true
    },
    { 
      icon: Briefcase, 
      label: 'Services', 
      path: user?.role === 'freelancer' ? '/my-services' : '/services',
      description: 'Service management'
    },
    { 
      icon: BarChart3, 
      label: 'Analytics', 
      path: '/analytics',
      description: 'Performance metrics'
    },
    { 
      icon: CreditCard, 
      label: 'Payout', 
      path: '/payout',
      description: 'Earnings & withdrawals'
    },
    { 
      icon: Settings, 
      label: 'Account', 
      path: '/account',
      description: 'Account settings'
    },
    { 
      icon: Sparkles, 
      label: "What's New", 
      path: '/whats-new',
      description: 'Latest updates'
    },
    { 
      icon: User, 
      label: 'Profile', 
      path: `/${user?.username}`,
      description: 'Public profile'
    }
  ];

  const isActive = (path: string) => {
    if (path === getHomeRoute()) {
      return location.pathname === path || 
             location.pathname === '/freelancer/dashboard' || 
             location.pathname === '/client/dashboard';
    }
    return location.pathname === path;
  };

  // Simulate unread messages (replace with actual API call)
  useEffect(() => {
    const fetchUnreadMessages = async () => {
      // Simulate API call - replace with actual message API
      const mockUnreadCount = Math.floor(Math.random() * 5); // 0-4 messages
      setUnreadMessages(mockUnreadCount);
    };

    fetchUnreadMessages();
    
    // Set up interval to check for new messages
    const interval = setInterval(fetchUnreadMessages, 30000); // Check every 30 seconds
    
    return () => clearInterval(interval);
  }, []);

  const handleMessageClick = () => {
    if (unreadMessages > 0) {
      setShowMessagePopup(!showMessagePopup);
    } else {
      navigate('/messages');
    }
  };

  return (
    <div className="h-screen bg-background flex overflow-hidden">
      {/* Sidebar */}
      <div className="w-64 h-full bg-gradient-to-b from-white via-gray-50 to-gray-100 border-r border-border flex flex-col rounded-r-3xl shadow-xl overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
        {/* Header */}
        <div className="p-6 border-b border-border flex-shrink-0 sticky top-0 z-10 bg-white/80 backdrop-blur rounded-tr-3xl shadow-sm">
          <div className="flex items-center space-x-3">
            <Avatar className="h-10 w-10">
              <AvatarImage src={user?.profilePicture} />
              <AvatarFallback>
                {user?.firstName?.[0]}{user?.lastName?.[0]}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <h2 className="text-sm font-semibold text-gray-900 truncate">
                {user?.firstName} {user?.lastName}
              </h2>
              <p className="text-xs text-purple-600 truncate font-mono">
                servpe.com/{user?.username}
              </p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto scrollbar-none" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
          {sidebarItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);
            const isMessageItem = item.path === '/messages';
            
            return (
              <div key={item.path} className="relative">
                <Button
                  variant={active ? "default" : "ghost"}
                  size="sm"
                  onClick={isMessageItem ? handleMessageClick : () => navigate(item.path)}
                  onMouseEnter={() => isMessageItem && unreadMessages > 0 && setShowMessagePopup(true)}
                  onMouseLeave={() => isMessageItem && setShowMessagePopup(false)}
                  className={`w-full justify-start h-12 rounded-xl transition-all duration-200 shadow-none border-0 text-base font-medium group ${
                    active 
                      ? "bg-gradient-to-r from-purple-600 to-pink-500 text-white shadow-lg" 
                      : "hover:bg-purple-50 text-gray-800"
                  }`}
                >
                  <div className="relative">
                    <Icon className={`h-5 w-5 mr-3 ${active ? "text-white" : "text-purple-500 group-hover:text-purple-700"}`} />
                    {/* Notification dot for messages */}
                    {isMessageItem && unreadMessages > 0 && (
                      <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                    )}
                  </div>
                  <div className="flex-1 text-left">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-semibold">{item.label}</span>
                      {isMessageItem && unreadMessages > 0 && (
                        <Badge className="ml-2 bg-red-500 text-white text-xs px-1.5 py-0.5 rounded-full">
                          {unreadMessages}
                        </Badge>
                      )}
                    </div>
                    <div className="text-xs opacity-70">{item.description}</div>
                  </div>
                </Button>
                
                {/* Message popup */}
                {isMessageItem && unreadMessages > 0 && showMessagePopup && (
                  <div className="absolute left-full ml-2 top-0 z-50 bg-white rounded-lg shadow-lg border border-gray-200 p-3 min-w-64">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-sm font-semibold text-gray-900">New Messages</h3>
                      <button 
                        onClick={() => setShowMessagePopup(false)}
                        className="text-gray-400 hover:text-gray-600"
                      >
                        ×
                      </button>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2 p-2 bg-gray-50 rounded">
                        <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                          J
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-900">John Doe</p>
                          <p className="text-xs text-gray-600">Hey! I have a question about...</p>
                        </div>
                        <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                      </div>
                      <div className="flex items-center space-x-2 p-2 bg-gray-50 rounded">
                        <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                          S
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-900">Sarah Smith</p>
                          <p className="text-xs text-gray-600">Your service looks great!</p>
                        </div>
                        <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                      </div>
                    </div>
                    <button 
                      onClick={handleMessageClick}
                      className="w-full mt-3 bg-purple-600 text-white text-sm font-medium py-2 px-3 rounded-lg hover:bg-purple-700 transition-colors"
                    >
                      View All Messages
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-border flex-shrink-0 bg-white/80 backdrop-blur rounded-br-3xl shadow-sm mt-auto">
          <div className="text-xs text-gray-400 text-center font-mono">
            Servpe © 2024
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 h-full overflow-auto scrollbar-none" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
        {children}
      </div>
    </div>
  );
};

export default SidebarLayout;