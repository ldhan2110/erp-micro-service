import { observer } from "mobx-react-lite";
import React from "react";
import LoginPage from "./LoginPage";
import { authStore } from "../stores";
import { authService } from "../services/auth/authJwtService";
import { Spin } from "antd";

interface AuthGuardProps {
  children: React.ReactNode;
}

const AuthGuard: React.FC<AuthGuardProps> = observer(({ children }) => {
  React.useEffect(() => {
    // Setup axios interceptors khi component mount
    authService.setupAxiosInterceptors();
  }, []);

  if (authStore.loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Spin size="large" />
          <div className="mt-4">Loading Credential...</div>
        </div>
      </div>
    );
  }

  if (!authStore.isAuthenticated) {
    return <LoginPage />;
  }

  // Nếu đã đăng nhập, hiển thị nội dung chính
  return <>{children}</>;
});

export default AuthGuard;
