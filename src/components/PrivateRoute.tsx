import React from 'react';
import { Navigate } from 'react-router-dom';
import { isAuthenticated } from '@/services/auth';

interface PrivateRouteProps {
  children: React.ReactNode;
}

const PrivateRoute: React.FC<PrivateRouteProps> = ({ children }) => {
  const isAuth = isAuthenticated();
  
  if (!isAuth) {
    // 如果未登录，重定向到登录页面
    return <Navigate to="/auth" replace />;
  }
  
  // 如果已登录，展示子组件
  return <>{children}</>;
};

export default PrivateRoute; 