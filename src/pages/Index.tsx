import React, { useState, useEffect, useRef } from 'react';
import StarField from '@/components/StarField';
import EnergyOrb from '@/components/EnergyOrb';
import MessageForm from '@/components/MessageForm';
import MessageViewer from '@/components/MessageViewer';
import ElectricPath from '@/components/ElectricPath';
import { Button } from '@/components/ui/button';
import { MessageType, Position } from '@/types';
import { SendHorizonal, RotateCcw, UserCircle } from 'lucide-react';
import { toast } from "sonner";
import { v4 as uuidv4 } from 'uuid';
import { useNavigate } from 'react-router-dom';
import GeometricShapes from '@/components/GeometricShapes';

const Index = () => {
  const navigate = useNavigate();
  const [messages, setMessages] = useState<MessageType[]>([]);
  const [selectedMessage, setSelectedMessage] = useState<MessageType | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isViewerOpen, setIsViewerOpen] = useState(false);
  const [paths, setPaths] = useState<{
    start: Position;
    end: Position;
    color: string;
    id: string;
  }[]>([]);
  
  // 跟踪已解锁的光球ID
  const [unlockedOrbIds, setUnlockedOrbIds] = useState<Set<string>>(new Set());
  
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasHeight = typeof window !== 'undefined' ? window.innerHeight - 100 : 600;
  const [userNickname, setUserNickname] = useState<string>('宇宙旅行者');

  // 首次渲染时加载示例消息
  useEffect(() => {
    const sampleNames = ["张伟", "李娜", "王芳", "刘阳", "陈磊"];
    
    const sampleMessages: MessageType[] = [
      {
        id: uuidv4(),
        text: "来自宇宙的问候！",
        type: 'text',
        position: { x: window.innerWidth * 0.2, y: window.innerHeight * 0.3 },
        color: 'blue',
        size: 'md',
        created: Date.now(),
        senderName: sampleNames[0]
      },
      {
        id: uuidv4(),
        text: "多么美丽的宇宙啊",
        type: 'text',
        position: { x: window.innerWidth * 0.7, y: window.innerHeight * 0.2 },
        color: 'purple',
        size: 'md',
        created: Date.now(),
        senderName: sampleNames[1]
      },
      {
        id: uuidv4(),
        text: "宇宙能量在流动",
        type: 'text',
        position: { x: window.innerWidth * 0.5, y: window.innerHeight * 0.6 },
        color: 'cyan',
        size: 'sm',
        created: Date.now(),
        senderName: sampleNames[2]
      }
    ];
    
    const storedMessages = localStorage.getItem('cosmicMessages');
    if (storedMessages) {
      try {
        const parsedMessages = JSON.parse(storedMessages);
        setMessages(parsedMessages);
      } catch (err) {
        console.error("解析存储消息时出错:", err);
        setMessages(sampleMessages);
      }
    } else {
      setMessages(sampleMessages);
    }
  }, []);

  // 消息更新时存储到本地存储
  useEffect(() => {
    if (messages.length > 0) {
      localStorage.setItem('cosmicMessages', JSON.stringify(messages));
    }
  }, [messages]);
  
  // 在组件挂载时获取用户昵称
  useEffect(() => {
    const savedNickname = localStorage.getItem('userNickname');
    if (savedNickname) {
      setUserNickname(savedNickname);
    }
  }, []);
  
  // 处理新消息创建
  const handleCreateMessage = (text: string, color: string, size: string) => {
    // 随机位置
    const position = {
      x: Math.random() * (window.innerWidth * 0.8) + window.innerWidth * 0.1,
      y: Math.random() * (window.innerHeight * 0.6) + window.innerHeight * 0.2
    };
    
    const newMessage: MessageType = {
      id: uuidv4(),
      text,
      type: 'text',
      position,
      color: color as 'blue' | 'purple' | 'cyan' | 'pink',
      size: size as 'sm' | 'md' | 'lg',
      created: Date.now(),
      senderName: userNickname,
      isFromCurrentUser: true
    };
    
    setMessages(prev => [...prev, newMessage]);
    toast.success("光波已发送到宇宙中");
  };
  
  // 处理捕获消息
  const handleCaptureMessage = (message: MessageType) => {
    if (containerRef.current) {
      // 获取容器位置
      const rect = containerRef.current.getBoundingClientRect();
      
      // 创建电路路径动画
      const start = {
        x: message.position.x,
        y: message.position.y
      };
      
      // 目标位置（屏幕中间偏下）
      const end = {
        x: window.innerWidth / 2,
        y: window.innerHeight * 0.7
      };
      
      // 添加路径
      const pathId = uuidv4();
      setPaths(prev => [...prev, {
        id: pathId,
        start,
        end,
        color: message.color
      }]);
      
      // 显示消息查看器
      setSelectedMessage(message);
      
      // 延迟打开消息查看器，等待路径动画
      setTimeout(() => {
        setIsViewerOpen(true);
        // 路径动画结束后清除
        setTimeout(() => {
          setPaths(prev => prev.filter(p => p.id !== pathId));
        }, 1000);
      }, 800);
    }
  };
  
  // 处理解锁消息
  const handleUnlockMessage = (messageId: string) => {
    if (!unlockedOrbIds.has(messageId)) {
      const newUnlockedIds = new Set(unlockedOrbIds);
      newUnlockedIds.add(messageId);
      setUnlockedOrbIds(newUnlockedIds);
      toast.success("已解锁光波信息");
    }
  };
  
  // 处理回复消息
  const handleReplyMessage = (originalMessage: MessageType, replyText: string) => {
    // 创建回复消息
    const replyMessage: MessageType = {
      id: uuidv4(),
      text: replyText,
      type: 'text',
      position: {
        x: Math.random() * (window.innerWidth * 0.8) + window.innerWidth * 0.1,
        y: Math.random() * (window.innerHeight * 0.6) + window.innerHeight * 0.2
      },
      color: 'blue',
      size: 'sm',
      created: Date.now(),
      senderName: userNickname,
      isFromCurrentUser: true,
      replyTo: originalMessage.id
    };
    
    setMessages(prev => [...prev, replyMessage]);
    toast.success("回复已发送");
    
    // 关闭消息查看器
    setIsViewerOpen(false);
  };
  
  // 清除所有消息
  const handleClearAllMessages = () => {
    // 保留示例消息
    const sampleNames = ["张伟", "李娜", "王芳", "刘阳", "陈磊"];
    
    const sampleMessages: MessageType[] = [
      {
        id: uuidv4(),
        text: "来自宇宙的问候！",
        type: 'text',
        position: { x: window.innerWidth * 0.2, y: window.innerHeight * 0.3 },
        color: 'blue',
        size: 'md',
        created: Date.now(),
        senderName: sampleNames[0]
      },
      {
        id: uuidv4(),
        text: "多么美丽的宇宙啊",
        type: 'text',
        position: { x: window.innerWidth * 0.7, y: window.innerHeight * 0.2 },
        color: 'purple',
        size: 'md',
        created: Date.now(),
        senderName: sampleNames[1]
      },
      {
        id: uuidv4(),
        text: "宇宙能量在流动",
        type: 'text',
        position: { x: window.innerWidth * 0.5, y: window.innerHeight * 0.6 },
        color: 'cyan',
        size: 'sm',
        created: Date.now(),
        senderName: sampleNames[2]
      }
    ];
    
    setMessages(sampleMessages);
    setUnlockedOrbIds(new Set());
    localStorage.setItem('cosmicMessages', JSON.stringify(sampleMessages));
    toast.success("已重置光波");
  };

  return (
    <div className="min-h-screen bg-black text-white overflow-hidden">
      <div className="absolute inset-0 cosmic-bg">
        <StarField count={600} speed={0.08} size={3} glow={true} />
        <GeometricShapes count={30} />
      </div>
      
      <div className="relative min-h-screen flex flex-col">
        <div ref={containerRef} className="flex-1 flex flex-col">
          {/* 页眉 */}
          <div className="flex justify-center items-center relative p-4 z-10">
            <h1 className="text-xl md:text-2xl font-bold text-white glow-text">
              宇宙光波
            </h1>
            
            <div className="absolute right-4 flex items-center space-x-2">
              <Button
                variant="outline"
                size="icon"
                onClick={handleClearAllMessages}
                className="bg-gray-800/30 border border-gray-700/50 hover:bg-gray-700/50"
              >
                <RotateCcw size={18} className="text-gray-300" />
              </Button>
              
              <Button
                variant="outline"
                size="icon"
                onClick={() => navigate('/profile')}
                className="bg-gray-800/30 border border-gray-700/50 hover:bg-gray-700/50"
              >
                <UserCircle size={18} className="text-gray-300" />
              </Button>
            </div>
          </div>
          
          {/* 主要内容区域，包含光球 */}
          <div className="flex-grow relative">
            {/* 渲染所有电路路径 */}
            {paths.map(path => (
              <ElectricPath 
                key={path.id}
                startPosition={path.start}
                endPosition={path.end}
                color={path.color}
                animate={true}
                duration={800}
              />
            ))}
            
            {/* 渲染所有消息光球 */}
            {messages.map(message => (
              <div
                key={message.id}
                style={{
                  position: 'absolute',
                  left: `${message.position.x}px`,
                  top: `${message.position.y}px`,
                  transform: 'translate(-50%, -50%)',
                  zIndex: 10
                }}
              >
                <EnergyOrb
                  id={message.id}
                  size={message.size}
                  color={message.color}
                  senderName={message.senderName}
                  onClick={() => handleCaptureMessage(message)}
                  isFloating={true}
                />
              </div>
            ))}
          </div>

          {/* 底部操作按钮 */}
          <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 z-20">
            <Button 
              onClick={() => setIsFormOpen(true)}
              className="cosmic-button rounded-full px-6 py-6"
            >
              <SendHorizonal size={20} className="mr-2" />
              <span>发送光波</span>
            </Button>
          </div>
          
          {/* 消息表单对话框 */}
          <MessageForm
            isOpen={isFormOpen}
            onClose={() => setIsFormOpen(false)}
            onSubmit={handleCreateMessage}
          />
          
          {/* 消息查看器对话框 */}
          {selectedMessage && (
            <MessageViewer
              isOpen={isViewerOpen}
              onClose={() => setIsViewerOpen(false)}
              message={selectedMessage}
              isUnlocked={unlockedOrbIds.has(selectedMessage.id)}
              onUnlock={() => handleUnlockMessage(selectedMessage.id)}
              onReply={(replyText) => handleReplyMessage(selectedMessage, replyText)}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default Index;
