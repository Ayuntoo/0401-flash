import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, User, Camera, Edit2, Shuffle, X, Check, LogOut } from 'lucide-react';
import { MessageType } from '@/types';
import EnergyOrb from '@/components/EnergyOrb';
import StarField from '@/components/StarField';
import GeometricShapes from '@/components/GeometricShapes';
import { toast } from "sonner";
import { useNavigate } from 'react-router-dom';
import AvatarUploader from '@/components/AvatarUploader';
import { getAvatar } from '@/utils/storage';
import { isSubscribed, getSubscriptionInfo } from '@/services/subscription';
import { logout } from '@/services/auth';

const Profile = () => {
  const navigate = useNavigate();
  const [nickname, setNickname] = useState('宇宙旅行者');
  const [tempNickname, setTempNickname] = useState(''); // 临时保存编辑中的昵称
  const [isEditingNickname, setIsEditingNickname] = useState(false);
  const [sentMessages, setSentMessages] = useState<MessageType[]>([]);
  const [receivedMessages, setReceivedMessages] = useState<MessageType[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  
  // 头像相关状态
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [isAvatarUploaderOpen, setIsAvatarUploaderOpen] = useState(false);
  
  // 在组件中添加订阅状态
  const [userSubscription, setUserSubscription] = useState<{isSubscribed: boolean, plan?: string}>(
    {isSubscribed: false}
  );
  
  // 从本地存储加载用户信息和头像
  useEffect(() => {
    const savedNickname = localStorage.getItem('userNickname');
    if (savedNickname) {
      setNickname(savedNickname);
    }
    
    // 加载头像
    const savedAvatar = getAvatar();
    if (savedAvatar) {
      setAvatarUrl(savedAvatar);
    }
    
    // 加载消息数据
    const cosmicMessages = localStorage.getItem('cosmicMessages');
    if (cosmicMessages) {
      const messages = JSON.parse(cosmicMessages) as MessageType[];
      // 使用 isFromCurrentUser 标志或 senderName 来判断
      setSentMessages(
        messages.filter(msg => 
          msg.isFromCurrentUser || msg.senderName === nickname
        ).slice(0, 10)
      );
      setReceivedMessages(
        messages.filter(msg => 
          !msg.isFromCurrentUser && msg.senderName !== nickname
        ).slice(0, 10)
      );
    }
  }, [nickname]);
  
  // 在 useEffect 中加载订阅状态
  useEffect(() => {
    // 加载订阅信息
    const subscription = getSubscriptionInfo();
    setUserSubscription({
      isSubscribed: isSubscribed(),
      plan: subscription.plan
    });
  }, []);
  
  // 开始编辑昵称
  const startEditingNickname = () => {
    setTempNickname(nickname); // 初始化临时昵称为当前昵称
    setIsEditingNickname(true);
    // 在下一个渲染周期中聚焦输入框并选中全部文本
    setTimeout(() => {
      if (inputRef.current) {
        inputRef.current.focus();
        inputRef.current.select();
      }
    }, 0);
  };
  
  // 保存昵称
  const handleSaveNickname = () => {
    // 检查是否为空
    if (!tempNickname.trim()) {
      toast.error("昵称不能为空");
      return;
    }
    
    // 更新昵称并保存
    setNickname(tempNickname);
    localStorage.setItem('userNickname', tempNickname);
    setIsEditingNickname(false);
    toast.success("昵称已更新");
  };
  
  // 取消编辑
  const handleCancelEdit = () => {
    setIsEditingNickname(false);
    setTempNickname(nickname); // 恢复原来的昵称
  };
  
  // 清空昵称
  const handleClearNickname = () => {
    setTempNickname('');
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };
  
  // 返回首页
  const handleBack = () => {
    navigate('/');
  };
  
  // 上传头像
  const handleAvatarUpload = () => {
    setIsAvatarUploaderOpen(true);
  };
  
  // 处理头像更改
  const handleAvatarChange = (newAvatarUrl: string) => {
    setAvatarUrl(newAvatarUrl);
  };
  
  // 生成随机昵称
  const generateRandomName = () => {
    const prefixes = ['星际', '宇宙', '星云', '太空', '银河', '星尘', '星辰', '光波', '星光', '月影'];
    const suffixes = ['旅行者', '探索者', '守望者', '追寻者', '漫游者', '梦想家', '收集者', '观测者', '飞行员', '领航员'];
    
    const randomPrefix = prefixes[Math.floor(Math.random() * prefixes.length)];
    const randomSuffix = suffixes[Math.floor(Math.random() * suffixes.length)];
    
    const randomName = `${randomPrefix}${randomSuffix}`;
    setTempNickname(randomName);
    if (inputRef.current) {
      inputRef.current.focus();
    }
    toast.info("已生成随机昵称");
  };
  
  // 格式化时间
  const formatTime = (timestamp: number): string => {
    const now = new Date();
    const messageDate = new Date(timestamp);
    const diffInSeconds = Math.floor((now.getTime() - messageDate.getTime()) / 1000);
    
    // 如果时间差小于1分钟，显示"刚刚"
    if (diffInSeconds < 60) {
      return '刚刚';
    }
    
    // 如果时间差小于1小时，显示分钟数
    if (diffInSeconds < 3600) {
      const minutes = Math.floor(diffInSeconds / 60);
      return `${minutes}分钟前`;
    }
    
    // 如果时间差小于24小时，显示小时数
    if (diffInSeconds < 86400) {
      const hours = Math.floor(diffInSeconds / 3600);
      return `${hours}小时前`;
    }
    
    // 如果时间差小于30天，显示天数
    if (diffInSeconds < 2592000) {
      const days = Math.floor(diffInSeconds / 86400);
      return `${days}天前`;
    }
    
    // 如果时间差超过30天，显示具体日期（年-月-日）
    const year = messageDate.getFullYear();
    const month = String(messageDate.getMonth() + 1).padStart(2, '0');
    const day = String(messageDate.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };
  
  // 添加处理登出的函数
  const handleLogout = () => {
    logout(); // 调用登出函数清除登录状态
    toast.success('已成功登出');
    navigate('/auth'); // 导航到登录页面
  };
  
  return (
    <div className="relative h-screen overflow-hidden">
      {/* 更新背景部分，添加闪烁的星星和几何元素 */}
      <div className="absolute inset-0 cosmic-bg z-0">
        <StarField count={500} speed={0.05} size={2.5} glow={true} />
        <GeometricShapes count={25} />
      </div>
      
      <div className="relative h-full flex flex-col overflow-hidden z-10 p-4">
        {/* 顶部导航栏 */}
        <div className="flex justify-between items-center mb-8">
          <Button 
            variant="ghost" 
            size="icon"
            onClick={() => navigate('/')}
          >
            <ArrowLeft className="text-white/80 hover:text-white" />
          </Button>
          
          {/* 添加登出按钮 */}
          <Button 
            variant="ghost" 
            size="icon"
            onClick={handleLogout}
            className="text-red-400 hover:text-red-300 hover:bg-red-900/20"
          >
            <LogOut className="h-5 w-5" />
          </Button>
        </div>
        
        {/* 个人信息卡片 */}
        <div className="bg-gray-800/60 backdrop-blur-md rounded-lg border border-gray-700/50 p-6 mb-8 shadow-glow">
          <div className="flex items-center gap-4">
            <div 
              className="relative w-20 h-20 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center cursor-pointer shadow-glow overflow-hidden"
              onClick={handleAvatarUpload}
            >
              {avatarUrl ? (
                <img 
                  src={avatarUrl} 
                  alt="用户头像" 
                  className="w-full h-full object-cover"
                />
              ) : (
                <User size={40} className="text-white" />
              )}
              <div className="absolute bottom-0 right-0 bg-gray-800 rounded-full p-1">
                <Camera size={16} className="text-gray-300" />
              </div>
            </div>
            
            <div className="flex-1">
              {isEditingNickname ? (
                <div className="space-y-2">
                  <div className="flex gap-2">
                    <Input 
                      ref={inputRef}
                      value={tempNickname}
                      onChange={e => setTempNickname(e.target.value)}
                      maxLength={12}
                      className="bg-gray-700/50 border-gray-600/50 text-white"
                      placeholder="请输入昵称"
                    />
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={handleClearNickname}
                      className="h-10 w-10 bg-gray-700/50 border-gray-600/50 hover:bg-gray-600/50"
                      title="清空"
                    >
                      <X size={16} className="text-white" />
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={generateRandomName}
                      className="h-10 w-10 bg-gray-700/50 border-gray-600/50 hover:bg-gray-600/50"
                      title="随机取名"
                    >
                      <Shuffle size={16} className="text-cyan-400" />
                    </Button>
                  </div>
                  
                  <div className="flex justify-end gap-2 mt-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleCancelEdit}
                      className="bg-gray-700/50 border-gray-600/50 text-white hover:bg-gray-600/50"
                    >
                      取消
                    </Button>
                    <Button
                      size="sm"
                      onClick={handleSaveNickname}
                      className="cosmic-button"
                    >
                      <Check size={14} className="mr-1" />
                      保存
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col">
                  <div className="flex items-center">
                    <h3 className="text-xl font-bold mr-2">{nickname}</h3>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={startEditingNickname}
                      className="h-7 w-7 text-white/70 hover:text-white hover:bg-blue-800/20"
                    >
                      <Edit2 size={14} />
                    </Button>
                  </div>
                  <p className="text-gray-300 mt-1 text-sm">已发送 {sentMessages.length} 条光波</p>
                </div>
              )}
              <p className="text-sm text-gray-400">光波等级：初级探索者</p>
            </div>
          </div>
          
          {/* 订阅状态标签 */}
          {userSubscription.isSubscribed ? (
            <div className="px-3 py-1 text-xs rounded-full bg-gradient-to-r from-blue-600 to-purple-600 text-white">
              {userSubscription.plan === 'monthly' ? '月度会员' : '年度会员'}
            </div>
          ) : (
            <div className="px-3 py-1 text-xs rounded-full bg-gray-700 text-gray-300">
              免费用户
            </div>
          )}
        </div>
        
        {/* 光波标签页 */}
        <Tabs defaultValue="sent" className="w-full">
          <TabsList className="grid w-full grid-cols-2 bg-gray-800/40 backdrop-blur-sm">
            <TabsTrigger value="sent" className="data-[state=active]:bg-blue-600/40">我发送的光波</TabsTrigger>
            <TabsTrigger value="received" className="data-[state=active]:bg-purple-600/40">我接收的光波</TabsTrigger>
          </TabsList>
          
          <TabsContent value="sent" className="mt-4">
            {sentMessages.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {sentMessages.map(message => (
                  <div key={message.id} className="flex flex-col items-center">
                    <EnergyOrb 
                      color={message.color} 
                      size="md" 
                      senderName="我" 
                      isFloating={false}
                      className="no-glow mb-2"
                    />
                    <p className="text-xs text-center text-gray-400 truncate w-full">
                      {message.text?.substring(0, 10)}
                      {message.text && message.text.length > 10 ? '...' : ''}
                    </p>
                    <p className="text-xs text-center text-gray-500 mt-1">
                      {message.created ? formatTime(message.created) : '未知时间'}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-10 text-gray-400">
                <p>你还没有发送过光波</p>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="received" className="mt-4">
            {receivedMessages.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {receivedMessages.map(message => (
                  <div key={message.id} className="flex flex-col items-center">
                    <EnergyOrb 
                      color={message.color} 
                      size="md" 
                      senderName={message.senderName?.substring(0, 1)} 
                      isFloating={false}
                      className="no-glow mb-2"
                    />
                    <p className="text-xs text-center text-gray-400 truncate w-full">
                      {message.text?.substring(0, 10)}
                      {message.text && message.text.length > 10 ? '...' : ''}
                    </p>
                    <p className="text-xs text-center text-gray-500 mt-1">
                      {message.created ? formatTime(message.created) : '未知时间'}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-10 text-gray-400">
                <p>你还没有收到过光波</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
      
      {/* 头像上传组件 */}
      <AvatarUploader
        isOpen={isAvatarUploaderOpen}
        onClose={() => setIsAvatarUploaderOpen(false)}
        currentAvatar={avatarUrl}
        onAvatarChange={handleAvatarChange}
      />
    </div>
  );
};

export default Profile;
