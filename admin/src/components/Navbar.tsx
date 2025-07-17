
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Home, 
  Users, 
  Briefcase, 
  FolderTree, 
  ShoppingCart,
  Settings,
  BarChart3
} from "lucide-react";

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const navItems = [
    { path: "/", label: "Dashboard", icon: Home },
    { path: "/users", label: "Users", icon: Users },
    { path: "/categories", label: "Categories", icon: FolderTree },
    { path: "/services", label: "Services", icon: Briefcase },
    { path: "/orders", label: "Orders", icon: ShoppingCart },
  ];

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-8">
            <div className="flex items-center space-x-2">
              <h1 className="text-xl font-bold text-red-600">Servpe Admin</h1>
              <Badge variant="destructive" className="bg-red-600">
                Admin Panel
              </Badge>
            </div>
            
            <div className="hidden md:flex items-center space-x-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                
                return (
                  <Button
                    key={item.path}
                    variant={isActive ? "default" : "ghost"}
                    size="sm"
                    onClick={() => navigate(item.path)}
                    className={`flex items-center space-x-2 ${
                      isActive ? "bg-red-600 hover:bg-red-700" : "hover:bg-gray-100"
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{item.label}</span>
                  </Button>
                );
              })}
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <Button variant="outline" size="sm">
              <Settings className="h-4 w-4 mr-2" />
              Settings
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
