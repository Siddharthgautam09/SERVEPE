
import { useState } from "react";
import { User, LogOut, Settings, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

const UserMenu = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleLogout = () => {
    logout();
    toast({
      title: "Logged Out",
      description: "You have been successfully logged out.",
    });
    navigate('/');
  };

  const handleProfile = () => {
    navigate('/profile');
  };

  if (!user) return null;

  const userInitials = `${user.firstName[0]}${user.lastName[0]}`.toUpperCase();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-10 rounded-full hover:bg-gray-100 transition-colors">
          <div className="flex items-center space-x-2">
            <Avatar className="h-8 w-8 border-2 border-orange-200">
              <AvatarImage src={user.profilePicture} alt={user.firstName} />
              <AvatarFallback className="bg-gradient-to-br from-orange-400 to-red-500 text-white text-sm font-semibold">
                {userInitials}
              </AvatarFallback>
            </Avatar>
            <span className="hidden md:block text-sm font-medium text-gray-700">
              {user.firstName}
            </span>
            <ChevronDown className="h-4 w-4 text-gray-500" />
          </div>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56 animate-fade-in" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium text-gray-900">
              {user.firstName} {user.lastName}
            </p>
            <p className="text-xs text-gray-500">
              {user.email || user.phoneNumber}
            </p>
            {user.role && (
              <p className="text-xs font-medium text-orange-600 capitalize">
                {user.role}
              </p>
            )}
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleProfile} className="cursor-pointer hover:bg-gray-50 transition-colors">
          <User className="mr-2 h-4 w-4" />
          <span>Profile</span>
        </DropdownMenuItem>
        <DropdownMenuItem className="cursor-pointer hover:bg-gray-50 transition-colors">
          <Settings className="mr-2 h-4 w-4" />
          <span>Settings</span>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleLogout} className="cursor-pointer hover:bg-red-50 text-red-600 transition-colors">
          <LogOut className="mr-2 h-4 w-4" />
          <span>Log out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default UserMenu;
