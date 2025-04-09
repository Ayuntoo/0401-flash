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
import { openDatabase } from '@/utils/storage';
import { canUnlockFreeOrb, incrementUnlockedFreeOrbCount, isSubscribed } from '@/services/subscription';
import SubscriptionModal from '@/components/SubscriptionModal';

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
  
  // 在现有的 paths 状态下方添加随机电光相关逻辑
  const [randomPaths, setRandomPaths] = useState<{
    start: Position;
    end: Position;
    color: string;
    id: string;
  }[]>([]);
  
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasHeight = typeof window !== 'undefined' ? window.innerHeight - 100 : 600;
  const [userNickname, setUserNickname] = useState<string>('宇宙旅行者');

  // 在 Index 组件中添加订阅状态和订阅弹窗控制状态
  const [isSubscriptionModalOpen, setIsSubscriptionModalOpen] = useState(false);
  const [pendingUnlockMessageId, setPendingUnlockMessageId] = useState<string | null>(null);

  // 首次渲染时加载示例消息
  useEffect(() => {
    const sampleNames = ["张伟", "李娜", "王芳", "刘阳", "陈磊", "赵华", "周强"];
    
    const sampleMessages: MessageType[] = [
      {
        id: uuidv4(),
        text: "你好，地球人，这是一声来自宇宙的问候！",
        type: 'text',
        position: { x: window.innerWidth * 0.2, y: window.innerHeight * 0.3 },
        color: 'blue',
        size: 'md',
        created: Date.now(),
        senderName: sampleNames[0]
      },
      {
        id: uuidv4(),
        text: "多么美丽的星球啊，有什么好吃的吗？",
        type: 'text',
        position: { x: window.innerWidth * 0.7, y: window.innerHeight * 0.2 },
        color: 'purple',
        size: 'md',
        created: Date.now(),
        senderName: sampleNames[1]
      },
      {
        id: uuidv4(),
        text: "我是你看不见的流动的暗物质",
        type: 'text',
        position: { x: window.innerWidth * 0.5, y: window.innerHeight * 0.6 },
        color: 'cyan',
        size: 'sm',
        created: Date.now(),
        senderName: sampleNames[2]
      },
      {
        id: uuidv4(),
        text: "星光指引前方的山脉向上生长",
        type: 'text',
        position: { x: window.innerWidth * 0.25, y: window.innerHeight * 0.7 },
        color: 'pink',
        size: 'lg',
        created: Date.now(),
        senderName: sampleNames[3]
      },
      {
        id: uuidv4(),
        text: "有人一起探索无尽可能吗？",
        type: 'text',
        position: { x: window.innerWidth * 0.8, y: window.innerHeight * 0.5 },
        color: 'orange',
        size: 'md',
        created: Date.now(),
        senderName: sampleNames[4]
      }
    ];
    
    // 清除旧数据，确保显示新的5个光球
    localStorage.removeItem('cosmicMessages');
    setMessages(sampleMessages);
    
    // 保存新的示例消息到本地存储
    localStorage.setItem('cosmicMessages', JSON.stringify(sampleMessages));
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
  
  // 在现有的 useEffect 钩子之后添加随机电光效果
  useEffect(() => {
    // 创建随机电光效果
    const createRandomPaths = () => {
      if (!containerRef.current || messages.length < 2) return;
      
      // 随机选择两个不同的消息
      const msgCount = messages.length;
      const idx1 = Math.floor(Math.random() * msgCount);
      let idx2 = Math.floor(Math.random() * msgCount);
      
      // 确保选择两个不同的消息
      while (idx1 === idx2 && msgCount > 1) {
        idx2 = Math.floor(Math.random() * msgCount);
      }
      
      const message1 = messages[idx1];
      const message2 = messages[idx2];
      
      // 创建新的电光路径
      const newPath = {
        id: uuidv4(),
        start: message1.position,
        end: message2.position,
        color: ['blue', 'purple', 'cyan', 'pink'][Math.floor(Math.random() * 4)]
      };
      
      setRandomPaths(prev => [...prev, newPath]);
      
      // 一段时间后移除这条路径
      setTimeout(() => {
        setRandomPaths(prev => prev.filter(p => p.id !== newPath.id));
      }, 2000); // 闪电显示2秒后消失
    };
    
    // 定期创建随机电光
    const interval = setInterval(() => {
      // 有50%的概率创建随机电光
      if (Math.random() > 0.5) {
        createRandomPaths();
      }
    }, 1000); // 从原来的时间间隔改为1秒
    
    return () => clearInterval(interval);
  }, [messages]);
  
  // 初始化 IndexedDB 数据库
  useEffect(() => {
    const initDatabase = async () => {
      try {
        await openDatabase();
        console.log("数据库初始化成功");
      } catch (error) {
        console.error("数据库初始化失败:", error);
        toast.error("媒体存储初始化失败");
      }
    };
    
    initDatabase();
  }, []);
  
  // 修改 handleCreateMessage 函数
  const handleCreateMessage = (data: {
    text: string;
    audioId?: string;
    imageId?: string;
    type: 'text' | 'audio' | 'image' | 'mixed';
  }) => {
    // 在当前视口内随机位置
    const position = {
      x: Math.random() * (window.innerWidth * 0.8) + window.innerWidth * 0.1,
      y: Math.random() * (window.innerHeight * 0.6) + window.innerHeight * 0.2
    };
    
    // 根据消息类型选择颜色
    let color: 'blue' | 'purple' | 'cyan' | 'pink' = 'blue';
    if (data.audioId && !data.imageId) color = 'purple';
    else if (!data.audioId && data.imageId) color = 'cyan';
    else if (data.audioId && data.imageId) color = 'pink';
    
    // 根据内容长度选择大小
    let size: 'sm' | 'md' | 'lg' = 'md';
    if (data.text.length > 100) size = 'lg';
    else if (data.text.length < 20) size = 'sm';
    
    const newMessage: MessageType = {
      id: uuidv4(),
      text: data.text,
      type: data.type,
      position,
      color,
      size,
      created: Date.now(),
      senderName: userNickname,
      isFromCurrentUser: true,
      // 使用正确的 audioId 和 imageId
      audioId: data.audioId,
      imageId: data.imageId
    };
    
    // 更新状态
    setMessages(prev => [...prev, newMessage]);
    
    // 不要在这里直接使用 messages，它可能不是最新的状态
    localStorage.setItem('cosmicMessages', JSON.stringify([...messages, newMessage]));
    
    toast.success("光波已发送到宇宙中", {
      position: "top-center",
      icon: '🌌'
    });
    setIsFormOpen(false);
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
  
  // 修改处理解锁消息函数
  const handleUnlockMessage = (messageId: string) => {
    // 如果已订阅，直接解锁
    if (isSubscribed()) {
      if (!unlockedOrbIds.has(messageId)) {
        const newUnlockedIds = new Set(unlockedOrbIds);
        newUnlockedIds.add(messageId);
        setUnlockedOrbIds(newUnlockedIds);
        toast.success("已解锁光波信息");
      }
      return;
    }
    
    // 未订阅时，检查是否还能解锁免费光球
    if (canUnlockFreeOrb()) {
      if (!unlockedOrbIds.has(messageId)) {
        // 记录已使用的免费次数
        incrementUnlockedFreeOrbCount();
        
        // 添加到已解锁集合
        const newUnlockedIds = new Set(unlockedOrbIds);
        newUnlockedIds.add(messageId);
        setUnlockedOrbIds(newUnlockedIds);
        
        // 如果这是第3个免费解锁的光球，提示用户
        if (incrementUnlockedFreeOrbCount() >= 3) {
          toast.info("你已使用所有免费解锁次数，订阅会员可解锁更多光波");
        } else {
          toast.success("已解锁光波信息");
        }
      }
    } else {
      // 已达到免费限制，显示订阅弹窗
      setPendingUnlockMessageId(messageId);
      setIsSubscriptionModalOpen(true);
    }
  };
  
  // 添加订阅成功的处理函数
  const handleSubscriptionSuccess = () => {
    // 关闭订阅弹窗
    setIsSubscriptionModalOpen(false);
    
    // 如果有待解锁的消息，立即解锁
    if (pendingUnlockMessageId) {
      const newUnlockedIds = new Set(unlockedOrbIds);
      newUnlockedIds.add(pendingUnlockMessageId);
      setUnlockedOrbIds(newUnlockedIds);
      setPendingUnlockMessageId(null);
      toast.success("订阅成功！光波信息已解锁");
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

  // 修改自动生成消息的时间间隔
  useEffect(() => {
    // 自动生成新消息的定时器
    const messageInterval = setInterval(() => {
      // 每次有20%的概率生成新消息，且消息总数小于10个
      if (Math.random() < 0.2 && messages.length < 10) {
        const colors = ['blue', 'purple', 'cyan', 'pink', 'orange', 'green'];
        const sampleNames = ["张伟", "李娜", "王芳", "刘阳", "陈磊", "赵华", "周强"];
        
        // 随机位置，避开屏幕边缘
        const x = Math.random() * (window.innerWidth * 0.8) + window.innerWidth * 0.1;
        const y = Math.random() * (canvasHeight * 0.8) + canvasHeight * 0.1;
        
        const newMessage: MessageType = {
          id: uuidv4(),
          text: generateRandomMessage(),
          type: 'text',
          position: { x, y },
          color: colors[Math.floor(Math.random() * colors.length)],
          size: Math.random() > 0.7 ? 'lg' : (Math.random() > 0.5 ? 'md' : 'sm'),
          created: Date.now(),
          senderName: sampleNames[Math.floor(Math.random() * sampleNames.length)]
        };
        
        setMessages(prev => [...prev, newMessage]);
      }
    }, 1000); // 从原来的时间间隔改为1秒
    
    return () => clearInterval(messageInterval);
  }, [messages, canvasHeight]);

  return (
    <div className="min-h-screen cosmic-bg overflow-hidden relative">
      {/* 简化的星空效果 */}
      <StarField starCount={200} speed={0.3} />
      
      <GeometricShapes quantity={15} />
      
      <div className="container mx-auto px-4 py-6 relative z-10">
        <div className="flex flex-col h-[calc(100vh-80px)]">
          <div className="flex justify-center items-center relative py-4">
            {/* 居中显示标题 */}
            <h1 className="text-xl sm:text-2xl font-bold glow-text absolute left-1/2 transform -translate-x-1/2">追波</h1>
            
            {/* 将按钮放在右侧 */}
            <div className="flex gap-2 absolute right-0">
              <Button 
                variant="ghost" 
                size="icon"
                onClick={() => navigate('/profile')}
              >
                <UserCircle className="text-white/80 hover:text-white" />
              </Button>
              <Button 
                variant="ghost" 
                size="icon"
                onClick={handleClearAllMessages}
              >
                <RotateCcw className="text-white/80 hover:text-white" />
              </Button>
            </div>
          </div>
          
          <div ref={containerRef} className="flex-1 flex flex-col">
            {/* 渲染所有电路路径 */}
            {paths.map(path => (
              <ElectricPath 
                key={path.id}
                startPosition={path.start}
                endPosition={path.end}
                color={path.color}
                animate={true}
                duration={200}
                thickness={2}
                segments={6}
                variance={0.3}
              />
            ))}
            
            {/* 渲染随机光球之间的电光 */}
            {randomPaths.map(path => (
              <ElectricPath 
                key={path.id}
                startPosition={path.start}
                endPosition={path.end}
                color={path.color}
                animate={true}
                duration={600}
                thickness={1.8}
                segments={8}
                variance={0.35}
                flashEffect={true}
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
          
          {/* 订阅弹窗 */}
          <SubscriptionModal
            isOpen={isSubscriptionModalOpen}
            onClose={() => setIsSubscriptionModalOpen(false)}
            onSuccess={handleSubscriptionSuccess}
          />
        </div>
      </div>
    </div>
  );
};

export default Index;
