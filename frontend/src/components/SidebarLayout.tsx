import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Home, 
  ShoppingCart,
  MessageSquare,
  Briefcase,
  BarChart3,
  CreditCard,
  Settings,
  Sparkles,
  User
} from 'lucide-react';

interface SidebarLayoutProps {
  children: React.ReactNode;
}

const SidebarLayout: React.FC<SidebarLayoutProps> = ({ children }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

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
      label: 'Testimonials', 
      path: '/testimonials',
      description: 'Client reviews'
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
      path: `/profile/${user?.username}`,
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

  return (
    <div className="h-screen bg-background flex overflow-hidden">
      {/* Sidebar */}
      <div className="w-64 bg-card border-r border-border flex flex-col h-full">
        {/* Header */}
        <div className="p-6 border-b border-border flex-shrink-0">
          <div className="flex items-center space-x-3">
            <Avatar className="h-10 w-10">
              <AvatarImage src={user?.profilePicture} />
              <AvatarFallback>
                {user?.firstName?.[0]}{user?.lastName?.[0]}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <h2 className="text-sm font-medium text-foreground truncate">
                {user?.firstName} {user?.lastName}
              </h2>
              <p className="text-xs text-muted-foreground truncate">
                servpe.com/{user?.username}
              </p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2 overflow-hidden">
          {sidebarItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);
            
            return (
              <Button
                key={item.path}
                variant={active ? "default" : "ghost"}
                size="sm"
                onClick={() => navigate(item.path)}
                className={`w-full justify-start h-12 ${
                  active 
                    ? "bg-primary text-primary-foreground" 
                    : "hover:bg-accent text-foreground"
                }`}
              >
                <Icon className="h-5 w-5 mr-3" />
                <div className="flex-1 text-left">
                  <div className="text-sm font-medium">{item.label}</div>
                  <div className="text-xs opacity-70">{item.description}</div>
                </div>
              </Button>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-border flex-shrink-0">
          <div className="text-xs text-muted-foreground text-center">
            Servpe © 2024
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 h-full overflow-auto">
        {children}
      </div>
    </div>
  );
};

export default SidebarLayout;