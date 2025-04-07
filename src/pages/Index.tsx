import React, { useState, useEffect, useRef } from 'react';
import StarField from '@/components/StarField';
import EnergyOrb from '@/components/EnergyOrb';
import MessageForm from '@/components/MessageForm';
import MessageViewer from '@/components/MessageViewer';
import ElectricPath from '@/components/ElectricPath';
import { Button } from '@/components/ui/button';
import { MessageType, Position } from '@/types';
import { SendHorizonal, RotateCcw } from 'lucide-react';
import { toast } from "sonner";
import { v4 as uuidv4 } from 'uuid';

const Index = () => {
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
  
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasHeight = typeof window !== 'undefined' ? window.innerHeight - 100 : 600;

  // Load sample messages on first render
  useEffect(() => {
    const sampleNames = ["Zhang Wei", "Li Na", "Wang Fang", "Liu Yang", "Chen Lei"];
    
    const sampleMessages: MessageType[] = [
      {
        id: uuidv4(),
        text: "Hello from the cosmos!",
        type: 'text',
        position: { x: window.innerWidth * 0.2, y: window.innerHeight * 0.3 },
        color: 'blue',
        size: 'md',
        created: Date.now(),
        senderName: sampleNames[0]
      },
      {
        id: uuidv4(),
        text: "What a beautiful universe",
        type: 'text',
        position: { x: window.innerWidth * 0.7, y: window.innerHeight * 0.2 },
        color: 'purple',
        size: 'md',
        created: Date.now(),
        senderName: sampleNames[1]
      },
      {
        id: uuidv4(),
        text: "Cosmic vibrations",
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
        console.error("Error parsing stored messages:", err);
        setMessages(sampleMessages);
      }
    } else {
      setMessages(sampleMessages);
    }
  }, []);

  // Store messages to localStorage when updated
  useEffect(() => {
    if (messages.length > 0) {
      localStorage.setItem('cosmicMessages', JSON.stringify(messages));
    }
  }, [messages]);

  // Randomly animate electric paths between orbs
  useEffect(() => {
    if (messages.length < 2) return;
    
    const animateInterval = setInterval(() => {
      // 随机决定生成1-3条光波
      const pathsCount = Math.floor(Math.random() * 3) + 1;
      
      // 保存已选择的连接对，避免重复
      const connectedPairs = new Set<string>();
      
      for (let i = 0; i < pathsCount; i++) {
        let sourceIndex, targetIndex;
        let pairKey;
        
        // 选择不重复的连接对
        do {
          sourceIndex = Math.floor(Math.random() * messages.length);
          do {
            targetIndex = Math.floor(Math.random() * messages.length);
          } while (targetIndex === sourceIndex);
          
          pairKey = `${sourceIndex}-${targetIndex}`;
        } while (connectedPairs.has(pairKey));
        
        connectedPairs.add(pairKey);
        
        const source = messages[sourceIndex];
        const target = messages[targetIndex];
        
        const colorMap = {
          'blue': '#1E90FF',
          'purple': '#9370DB',
          'cyan': '#00E5FF',
          'pink': '#FF69B4'
        };
        
        // 为每条路径生成随机持续时间（600-1000ms）
        const duration = Math.floor(Math.random() * 400) + 600;
        
        // 随机选择颜色（使用源或目标的颜色，或随机混合）
        let pathColor;
        const randomColorChoice = Math.random();
        if (randomColorChoice < 0.4) {
          pathColor = colorMap[source.color] || '#00E5FF';
        } else if (randomColorChoice < 0.8) {
          pathColor = colorMap[target.color] || '#00E5FF';
        } else {
          // 混合颜色效果
          const colors = Object.values(colorMap);
          pathColor = colors[Math.floor(Math.random() * colors.length)];
        }
        
        const pathId = uuidv4();
        setPaths(prev => [
          ...prev, 
          {
            start: source.position,
            end: target.position,
            color: pathColor,
            id: pathId
          }
        ]);
        
        // 每条路径使用不同的持续时间，增加视觉变化
        setTimeout(() => {
          setPaths(prev => prev.filter(path => path.id !== pathId));
        }, duration);
      }
      
    }, 2000); // 每两秒生成一组光波
    
    return () => clearInterval(animateInterval);
  }, [messages]);

  // Create floating effect for orbs
  useEffect(() => {
    const moveInterval = setInterval(() => {
      setMessages(prevMessages => 
        prevMessages.map(message => {
          const xMovement = (Math.random() - 0.5) * 2;
          const yMovement = (Math.random() - 0.5) * 2;
          
          return {
            ...message,
            position: {
              x: Math.max(50, Math.min(window.innerWidth - 50, message.position.x + xMovement)),
              y: Math.max(50, Math.min(window.innerHeight - 100, message.position.y + yMovement))
            }
          };
        })
      );
    }, 5000);
    
    return () => clearInterval(moveInterval);
  }, []);

  const handleCreateMessage = (message: {
    text: string;
    image?: string;
    audio?: string;
    type: 'text' | 'image' | 'audio' | 'mixed';
  }) => {
    const colors: Array<'blue' | 'purple' | 'cyan' | 'pink'> = ['blue', 'purple', 'cyan', 'pink'];
    const sizes: Array<'sm' | 'md' | 'lg'> = ['sm', 'md', 'lg'];
    
    // Use a random Chinese surname for demo purposes
    const senderNames = ["Zhang", "Li", "Wang", "Chen", "Liu", "Yang", "Huang", "Zhao", "Wu", "Zhou"];
    const randomSenderName = senderNames[Math.floor(Math.random() * senderNames.length)];
    
    const newMessage: MessageType = {
      id: uuidv4(),
      ...message,
      position: {
        x: Math.random() * (window.innerWidth - 100) + 50,
        y: Math.random() * (window.innerHeight - 150) + 50
      },
      color: colors[Math.floor(Math.random() * colors.length)],
      size: sizes[Math.floor(Math.random() * sizes.length)],
      created: Date.now(),
      senderName: `${randomSenderName} ${Math.floor(Math.random() * 100)}`
    };
    
    setMessages(prevMessages => [...prevMessages, newMessage]);
    toast.success("Echo released to the cosmos!");
  };

  const handleCaptureMessage = (message: MessageType) => {
    setSelectedMessage(message);
    setIsViewerOpen(true);
  };

  const handleReleaseMessage = () => {
    setIsViewerOpen(false);
    setSelectedMessage(null);
    toast.info("Echo released back to the cosmos");
  };

  const handleReplyToMessage = (originalMessage: MessageType, replyText: string) => {
    const colors: Array<'blue' | 'purple' | 'cyan' | 'pink'> = ['blue', 'purple', 'cyan', 'pink'];
    const sizes: Array<'sm' | 'md' | 'lg'> = ['sm', 'md', 'lg'];
    
    // Use a random Chinese surname for demo purposes
    const senderNames = ["Zhang", "Li", "Wang", "Chen", "Liu", "Yang", "Huang", "Zhao", "Wu", "Zhou"];
    const randomSenderName = senderNames[Math.floor(Math.random() * senderNames.length)];
    
    const replyMessage: MessageType = {
      id: uuidv4(),
      text: replyText,
      type: 'text',
      position: {
        x: Math.random() * (window.innerWidth - 100) + 50,
        y: Math.random() * (window.innerHeight - 150) + 50
      },
      color: colors[Math.floor(Math.random() * colors.length)],
      size: sizes[Math.floor(Math.random() * sizes.length)],
      created: Date.now(),
      senderName: `${randomSenderName} ${Math.floor(Math.random() * 100)}`,
      replyTo: originalMessage.id
    };
    
    setMessages(prevMessages => [...prevMessages, replyMessage]);
    toast.success("Reply sent to the cosmos!");
    
    // Create immediate electric path between original and reply
    const originalOrb = document.getElementById(originalMessage.id);
    const originalPos = originalMessage.position;
    
    if (originalPos) {
      const pathId = uuidv4();
      
      const colorMap = {
        'blue': '#1E90FF',
        'purple': '#9370DB',
        'cyan': '#00E5FF',
        'pink': '#FF69B4'
      };
      
      setPaths(prev => [
        ...prev, 
        {
          start: originalPos,
          end: replyMessage.position,
          color: colorMap[replyMessage.color] || '#00E5FF',
          id: pathId
        }
      ]);
      
      setTimeout(() => {
        setPaths(prev => prev.filter(path => path.id !== pathId));
      }, 800);
    }
  };

  const handleClearAllMessages = () => {
    setMessages([]);
    localStorage.removeItem('cosmicMessages');
    toast.success("All echoes cleared");
  };

  return (
    <div className="min-h-screen cosmic-bg overflow-hidden relative">
      <StarField starsCount={150} />
      
      <div 
        ref={containerRef}
        className="relative w-full min-h-screen flex flex-col"
      >
        {/* Header */}
        <div className="flex justify-between items-center p-4 z-10">
          <h1 className="text-xl md:text-2xl font-bold text-white glow-text">
           Throwback Wave
          </h1>
          
          <Button
            variant="outline"
            size="icon"
            onClick={handleClearAllMessages}
            className="bg-gray-800/30 border border-gray-700/50 hover:bg-gray-700/50"
          >
            <RotateCcw size={18} className="text-gray-300" />
          </Button>
        </div>
        
        {/* Main content area with orbs */}
        <div className="flex-grow relative">
          {/* Render all electric paths */}
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
          
          {/* Render all message orbs */}
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

        {/* Bottom action button */}
        <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 z-20">
          <Button 
            onClick={() => setIsFormOpen(true)}
            className="cosmic-button rounded-full px-6 py-6"
          >
            <SendHorizonal size={20} className="mr-2" />
            <span>扔光波</span>
          </Button>
        </div>
        
        {/* Message form dialog */}
        <MessageForm
          isOpen={isFormOpen}
          onClose={() => setIsFormOpen(false)}
          onSubmit={handleCreateMessage}
        />
        
        {/* Message viewer dialog */}
        <MessageViewer
          message={selectedMessage}
          isOpen={isViewerOpen}
          onClose={() => setIsViewerOpen(false)}
          onRelease={handleReleaseMessage}
          onReply={handleReplyToMessage}
        />
      </div>
    </div>
  );
};

export default Index;
