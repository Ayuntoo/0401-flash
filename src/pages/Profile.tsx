import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, User, Camera, Edit2, Shuffle, X, Check } from 'lucide-react';
import { MessageType } from '@/types';
import EnergyOrb from '@/components/EnergyOrb';
import StarField from '@/components/StarField';
import GeometricShapes from '@/components/GeometricShapes';
import { toast } from "sonner";
import { useNavigate } from 'react-router-dom';

const Profile = () => {
  const navigate = useNavigate();
  const [nickname, setNickname] = useState('宇宙旅行者');
  const [tempNickname, setTempNickname] = useState(''); // 临时保存编辑中的昵称
  const [isEditingNickname, setIsEditingNickname] = useState(false);
  const [sentMessages, setSentMessages] = useState<MessageType[]>([]);
  const [receivedMessages, setReceivedMessages] = useState<MessageType[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  
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
    // 这里简化处理，实际应该打开文件选择器
    toast.info("头像上传功能即将上线");
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
  
  return (
    <div className="relative h-screen overflow-hidden">
      {/* 更新背景部分，添加闪烁的星星和几何元素 */}
      <div className="absolute inset-0 cosmic-bg z-0">
        <StarField count={500} speed={0.05} size={2.5} glow={true} />
        <GeometricShapes count={25} />
      </div>
      
      <div className="relative h-full flex flex-col overflow-hidden z-10 p-4">
        {/* 返回按钮 */}
        <div className="flex items-center mb-6">
          <Button 
            onClick={() => navigate('/')}
            variant="ghost" 
            className="text-white hover:bg-blue-800/20"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            返回
          </Button>
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
                  
                  <div className="flex gap-2">
                    <Button 
                      variant="outline"
                      size="sm"
                      onClick={handleCancelEdit}
                      className="bg-gray-700/50 border-gray-600/50"
                    >
                      取消
                    </Button>
                    <Button 
                      onClick={handleSaveNickname}
                      size="sm"
                      className="cosmic-button"
                      disabled={!tempNickname.trim()}
                    >
                      <Check size={14} className="mr-1" />
                      保存
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <h2 className="text-xl font-bold">{nickname}</h2>
                  <Button 
                    variant="ghost" 
                    size="icon"
                    onClick={startEditingNickname}
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
