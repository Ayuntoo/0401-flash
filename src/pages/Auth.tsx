import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import StarField from '@/components/StarField';
import GeometricShapes from '@/components/GeometricShapes';
import { login, register, isAuthenticated } from '@/services/auth';

const Auth = () => {
  const navigate = useNavigate();
  const [credential, setCredential] = useState('');
  const [password, setPassword] = useState('');
  const [nickname, setNickname] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login');

  // 如果用户已登录，重定向到首页
  React.useEffect(() => {
    if (isAuthenticated()) {
      navigate('/');
    }
  }, [navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!credential || !password) {
      toast.error('请填写所有必填字段');
      return;
    }
    
    setIsLoading(true);
    
    try {
      await login(credential, password);
      toast.success('登录成功！');
      navigate('/');
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error('登录失败，请重试');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!credential || !password) {
      toast.error('请填写所有必填字段');
      return;
    }
    
    setIsLoading(true);
    
    try {
      await register(credential, password, nickname);
      toast.success('注册成功！');
      navigate('/');
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error('注册失败，请重试');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen cosmic-bg overflow-hidden relative flex items-center justify-center">
      {/* 背景效果 */}
      <StarField starCount={300} speed={0.2} />
      <GeometricShapes quantity={20} />
      
      {/* 身份验证卡片 */}
      <div className="w-full max-w-md z-10">
        <div className="bg-gray-900/70 backdrop-blur-lg rounded-xl border border-gray-700/50 p-6 shadow-glow">
          <h1 className="text-2xl font-bold text-center glow-text mb-6">光波宇宙</h1>
          
          <Tabs 
            defaultValue="login" 
            className="w-full" 
            onValueChange={(v) => setActiveTab(v as 'login' | 'register')}
          >
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="login">登录</TabsTrigger>
              <TabsTrigger value="register">注册</TabsTrigger>
            </TabsList>
            
            <TabsContent value="login">
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="login-credential">邮箱/手机号</Label>
                  <Input
                    id="login-credential"
                    type="text"
                    placeholder="请输入邮箱或手机号"
                    value={credential}
                    onChange={(e) => setCredential(e.target.value)}
                    className="bg-gray-800/50 border-gray-700/50"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="login-password">密码</Label>
                  <Input
                    id="login-password"
                    type="password"
                    placeholder="请输入密码"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="bg-gray-800/50 border-gray-700/50"
                    required
                  />
                </div>
                
                <Button 
                  type="submit" 
                  className="cosmic-button w-full" 
                  disabled={isLoading}
                >
                  {isLoading ? '登录中...' : '登录'}
                </Button>
              </form>
            </TabsContent>
            
            <TabsContent value="register">
              <form onSubmit={handleRegister} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="register-credential">邮箱/手机号</Label>
                  <Input
                    id="register-credential"
                    type="text"
                    placeholder="请输入邮箱或手机号"
                    value={credential}
                    onChange={(e) => setCredential(e.target.value)}
                    className="bg-gray-800/50 border-gray-700/50"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="register-password">密码</Label>
                  <Input
                    id="register-password"
                    type="password"
                    placeholder="请设置密码（至少6位）"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="bg-gray-800/50 border-gray-700/50"
                    minLength={6}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="register-nickname">昵称 (选填)</Label>
                  <Input
                    id="register-nickname"
                    type="text"
                    placeholder="请输入昵称或留空使用随机昵称"
                    value={nickname}
                    onChange={(e) => setNickname(e.target.value)}
                    className="bg-gray-800/50 border-gray-700/50"
                  />
                </div>
                
                <Button 
                  type="submit" 
                  className="cosmic-button w-full" 
                  disabled={isLoading}
                >
                  {isLoading ? '注册中...' : '注册'}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
          
          <p className="mt-6 text-center text-gray-400 text-sm">
            {activeTab === 'login' ? '没有账号？点击上方的"注册"创建新账号' : '已有账号？点击上方的"登录"'}
          </p>
        </div>
      </div>
    </div>
  );
};

export default Auth; 