import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import UserMenu from '@/components/UserMenu';
import UserSearch from '@/components/UserSearch';
import { MessageSquare, Briefcase, User, Home, Plus, Search } from 'lucide-react';

const Navbar = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  const navigation = [
    { name: 'Home', href: '/', icon: Home },
    { name: 'Find Freelancers', href: '/find-freelancers', icon: Search },
    { name: 'Services', href: '/services', icon: Briefcase },
  ];

  const userNavigation = user ? [
    ...(user.role === 'client' ? [
      { name: 'Dashboard', href: '/client-dashboard', icon: Home },
      { name: 'Post Project', href: '/post-project', icon: Plus },
    ] : []),
    ...(user.role === 'freelancer' ? [
      { name: 'Dashboard', href: '/freelancer-dashboard', icon: Home },
      { name: 'My Services', href: '/my-services', icon: Briefcase },
      { name: 'My Projects', href: '/freelancer-projects', icon: Briefcase },
    ] : []),
    ...(user.role === 'admin' ? [
      { name: 'Admin Dashboard', href: '/admin/dashboard', icon: Home },
    ] : []),
    { name: 'Messages', href: '/messaging', icon: MessageSquare },
    { name: 'Profile', href: '/profile', icon: User },
  ] : [];

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-orange-500 to-red-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">F</span>
              </div>
              <span className="text-xl font-bold text-gray-900">FreelancePlatform</span>
            </Link>
          </div>

          {/* Search Bar - Only show when user is logged in */}
          {user && (
            <div className="flex-1 max-w-md mx-8">
              <UserSearch />
            </div>
          )}

          {/* Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            {/* Public Navigation */}
            {!user && navigation.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className={`flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  isActive(item.href)
                    ? 'text-orange-600 bg-orange-50'
                    : 'text-gray-700 hover:text-orange-600 hover:bg-gray-50'
                }`}
              >
                <item.icon className="h-4 w-4" />
                <span>{item.name}</span>
              </Link>
            ))}

            {/* User Navigation */}
            {user && userNavigation.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className={`flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  isActive(item.href)
                    ? 'text-orange-600 bg-orange-50'
                    : 'text-gray-700 hover:text-orange-600 hover:bg-gray-50'
                }`}
              >
                <item.icon className="h-4 w-4" />
                <span>{item.name}</span>
              </Link>
            ))}

            {/* Auth Buttons */}
            {!user ? (
              <div className="flex items-center space-x-3">
                <Button 
                  variant="ghost" 
                  onClick={() => navigate('/login')}
                  className="text-gray-700 hover:text-orange-600"
                >
                  Log in
                </Button>
                <Button 
                  onClick={() => navigate('/signup')}
                  className="bg-orange-600 hover:bg-orange-700 text-white"
                >
                  Sign up
                </Button>
              </div>
            ) : (
              <UserMenu />
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <Button
              variant="ghost"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="text-gray-700"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-gray-200 bg-white">
          <div className="px-2 pt-2 pb-3 space-y-1">
            {/* Search for mobile */}
            {user && (
              <div className="px-3 py-2">
                <UserSearch />
              </div>
            )}
            
            {/* Navigation items */}
            {(user ? userNavigation : navigation).map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className={`flex items-center space-x-2 px-3 py-2 rounded-md text-base font-medium ${
                  isActive(item.href)
                    ? 'text-orange-600 bg-orange-50'
                    : 'text-gray-700 hover:text-orange-600 hover:bg-gray-50'
                }`}
                onClick={() => setMobileMenuOpen(false)}
              >
                <item.icon className="h-5 w-5" />
                <span>{item.name}</span>
              </Link>
            ))}

            {/* Auth buttons for mobile */}
            {!user && (
              <div className="pt-4 pb-3 border-t border-gray-200">
                <div className="flex flex-col space-y-2 px-3">
                  <Button 
                    variant="ghost" 
                    onClick={() => {
                      navigate('/login');
                      setMobileMenuOpen(false);
                    }}
                    className="justify-start text-gray-700 hover:text-orange-600"
                  >
                    Log in
                  </Button>
                  <Button 
                    onClick={() => {
                      navigate('/signup');
                      setMobileMenuOpen(false);
                    }}
                    className="justify-start bg-orange-600 hover:bg-orange-700 text-white"
                  >
                    Sign up
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
