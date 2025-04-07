import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, User, Camera, Edit2 } from 'lucide-react';
import { MessageType } from '@/types';
import EnergyOrb from '@/components/EnergyOrb';
import StarField from '@/components/StarField';
import { toast } from "sonner";
import { useNavigate } from 'react-router-dom';

const Profile = () => {
  const navigate = useNavigate();
  const [nickname, setNickname] = useState('宇宙旅行者');
  const [isEditingNickname, setIsEditingNickname] = useState(false);
  const [sentMessages, setSentMessages] = useState<MessageType[]>([]);
  const [receivedMessages, setReceivedMessages] = useState<MessageType[]>([]);
  
  // 从本地存储加载用户信息
  useEffect(() => {
    const savedNickname = localStorage.getItem('userNickname');
    if (savedNickname) {
      setNickname(savedNickname);
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
  
  // 保存昵称
  const handleSaveNickname = () => {
    localStorage.setItem('userNickname', nickname);
    setIsEditingNickname(false);
    toast.success("昵称已更新");
  };
  
  // 返回首页
  const handleBack = () => {
    navigate('/');
  };
  
  // 上传头像
  const handleAvatarUpload = () => {
    // 这里简化处理，实际应该打开文件选择器
    toast.info("头像上传功能即将上线");
  };
  
  return (
    <div className="min-h-screen bg-gray-900 text-white relative overflow-hidden">
      {/* 新的星空背景 */}
      <div className="absolute inset-0 cosmic-bg z-0">
        <StarField count={400} speed={0.05} />
      </div>
      
      <div className="relative z-10 container mx-auto px-4 py-8">
        {/* 顶部导航 */}
        <div className="flex items-center mb-8">
          <Button
            variant="ghost"
            size="icon"
            onClick={handleBack}
            className="mr-2 text-gray-300 hover:text-white"
          >
            <ArrowLeft size={24} />
          </Button>
          <h1 className="text-2xl font-bold glow-text">我的宇宙</h1>
        </div>
        
        {/* 个人信息卡片 */}
        <div className="bg-gray-800/60 backdrop-blur-md rounded-lg border border-gray-700/50 p-6 mb-8 shadow-glow">
          <div className="flex items-center gap-4">
            <div 
              className="relative w-20 h-20 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center cursor-pointer shadow-glow"
              onClick={handleAvatarUpload}
            >
              <User size={40} className="text-white" />
              <div className="absolute bottom-0 right-0 bg-gray-800 rounded-full p-1">
                <Camera size={16} className="text-white" />
              </div>
            </div>
            
            <div className="flex-1">
              {isEditingNickname ? (
                <div className="flex items-center gap-2">
                  <Input 
                    value={nickname}
                    onChange={(e) => setNickname(e.target.value)}
                    className="bg-gray-700/50 border-gray-600/50 text-white"
                    maxLength={12}
                  />
                  <Button 
                    onClick={handleSaveNickname}
                    className="cosmic-button"
                  >
                    保存
                  </Button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <h2 className="text-xl font-bold">{nickname}</h2>
                  <Button 
                    variant="ghost" 
                    size="icon"
                    onClick={() => setIsEditingNickname(true)}
                    className="h-8 w-8"
                  >
                    <Edit2 size={16} className="text-gray-400" />
                  </Button>
                </div>
              )}
              <p className="text-sm text-gray-400">光波等级：初级探索者</p>
            </div>
          </div>
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
                  <div key={message.id} className="bg-gray-800/40 border border-gray-700/50 rounded-lg p-4 backdrop-blur-sm">
                    <div className="flex justify-center mb-3">
                      <EnergyOrb 
                        size="sm" 
                        color={message.color} 
                        isFloating={false}
                      />
                    </div>
                    <p className="text-sm truncate">{message.text}</p>
                    <p className="text-xs text-gray-400 mt-2">
                      {new Date(message.created).toLocaleDateString()}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-10 text-gray-400">
                <p>你还没有发送过光波</p>
                <Button 
                  className="mt-4 cosmic-button" 
                  onClick={handleBack}
                >
                  去发送光波
                </Button>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="received" className="mt-4">
            {receivedMessages.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {receivedMessages.map(message => (
                  <div key={message.id} className="bg-gray-800/40 border border-gray-700/50 rounded-lg p-4 backdrop-blur-sm">
                    <div className="flex justify-center mb-3">
                      <EnergyOrb 
                        size="sm" 
                        color={message.color} 
                        senderName={message.senderName}
                        isFloating={false}
                      />
                    </div>
                    <p className="text-sm truncate">
                      {message.text.substring(0, 20)}
                      {message.text.length > 20 ? '...' : ''}
                    </p>
                    <p className="text-xs text-gray-400 mt-2">
                      来自: {message.senderName}
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
    </div>
  );
};

export default Profile; 