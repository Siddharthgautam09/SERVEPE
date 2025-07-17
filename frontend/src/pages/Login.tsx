
import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Redirect to email OTP login instead of phone OTP
    if (location.pathname !== '/email-otp-login') {
      navigate('/email-otp-login', { replace: true });
    }
  }, [navigate, location.pathname]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <h2 className="text-lg font-semibold mb-2">Redirecting to login...</h2>
        <p className="text-muted-foreground">Please wait while we redirect you to the login page.</p>
      </div>
    </div>
  );
};

export default Login;
