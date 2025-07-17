
import { Outlet } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Navigate } from "react-router-dom";

const AdminLayout = () => {
  const { user, token } = useAuth();

  if (!token || !user || user.role !== 'admin') {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Outlet />
    </div>
  );
};

export default AdminLayout;
