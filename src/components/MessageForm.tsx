import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Mic, Send, X, Image } from 'lucide-react';
import { toast } from "sonner";
import { saveMedia } from '@/utils/storage';
import { v4 as uuidv4 } from 'uuid';

interface MessageFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: {
    text: string;
    audioId?: string;
    imageId?: string;
    type: 'text' | 'audio' | 'image' | 'mixed';
  }) => void;
}

const MessageForm: React.FC<MessageFormProps> = ({ isOpen, onClose, onSubmit }) => {
  const [text, setText] = useState<string>('');
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [audioId, setAudioId] = useState<string | null>(null);
  const [imageId, setImageId] = useState<string | null>(null);

  // 处理录音
  const handleRecording = async () => {
    if (isRecording) {
      // 停止录音
      if (mediaRecorderRef.current) {
        mediaRecorderRef.current.stop();
      }
      setIsRecording(false);
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        
        // 创建临时URL用于预览
        const audioPreviewUrl = URL.createObjectURL(audioBlob);
        setAudioUrl(audioPreviewUrl);
        
        // 同时保存唯一ID，稍后发送消息时会用到
        const audioId = uuidv4();
        try {
          await saveMedia(audioId, audioBlob, 'audio');
          setAudioId(audioId); // 新增的状态用于跟踪音频ID
        } catch (err) {
          console.error('保存录音失败:', err);
          toast.error("保存录音失败，请重试");
        }

        // 关闭媒体流
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (error) {
      console.error('无法访问麦克风:', error);
      toast.error("无法访问麦克风，请检查浏览器权限设置");
      setIsRecording(false);
    }
  };

  // 处理图片上传
  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error("请上传图片文件");
      return;
    }

    // 创建预览
    const reader = new FileReader();
    reader.onload = async (e) => {
      const imagePreviewUrl = e.target?.result as string;
      setImageUrl(imagePreviewUrl);
      
      // 保存图片到 IndexedDB
      try {
        const imageId = uuidv4();
        await saveMedia(imageId, file, 'image');
        setImageId(imageId);
      } catch (err) {
        console.error('保存图片失败:', err);
        toast.error("保存图片失败，请重试");
      }
    };
    reader.readAsDataURL(file);
  };

  // 打开文件选择对话框
  const handleImageButtonClick = () => {
    fileInputRef.current?.click();
  };

  const handleSubmit = () => {
    if (!text.trim() && !audioId && !imageId) {
      toast.error("请输入文本、上传图片或录制语音");
      return;
    }

    let type: 'text' | 'audio' | 'image' | 'mixed' = 'text';
    
    if ((text && audioId) || (text && imageId) || (audioId && imageId) || (text && audioId && imageId)) {
      type = 'mixed';
    } else if (audioId) {
      type = 'audio';
    } else if (imageId) {
      type = 'image';
    }

    onSubmit({
      text: text.trim(),
      audioId: audioId || undefined, // 现在传递ID而不是URL
      imageId: imageId || undefined, // 现在传递ID而不是URL
      type
    });

    // 重置表单
    setText('');
    setAudioUrl(null);
    setAudioId(null);
    setImageUrl(null);
    setImageId(null);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-gray-900/90 border border-cosmic-light/30 backdrop-blur-lg text-white max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center glow-text text-xl">发送光波消息</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <Textarea 
            placeholder="输入你的消息..." 
            className="bg-gray-800/50 border-cosmic-light/30 text-white placeholder:text-gray-400 resize-none h-24"
            value={text}
            onChange={(e) => setText(e.target.value)}
          />
          
          {audioUrl && (
            <div className="flex items-center justify-between bg-gray-800/50 rounded-md p-2">
              <audio src={audioUrl} controls className="h-8 w-full" />
              <Button 
                size="icon" 
                variant="ghost" 
                className="h-6 w-6 text-red-400 hover:text-red-500"
                onClick={() => setAudioUrl(null)}
              >
                <X size={14} />
              </Button>
            </div>
          )}
          
          {imageUrl && (
            <div className="relative bg-gray-800/50 rounded-md p-2">
              <img 
                src={imageUrl} 
                alt="上传的图片" 
                className="w-full h-auto max-h-40 object-contain rounded" 
              />
              <Button 
                size="icon" 
                variant="ghost" 
                className="absolute top-1 right-1 h-6 w-6 bg-gray-900/70 text-red-400 hover:text-red-500"
                onClick={() => setImageUrl(null)}
              >
                <X size={14} />
              </Button>
            </div>
          )}
          
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleImageUpload}
            accept="image/*"
            className="hidden"
          />
          
          <div className="flex gap-2 justify-between">
            <div className="flex gap-2">
              <Button 
                onClick={handleRecording} 
                size="icon" 
                variant={isRecording ? "destructive" : "outline"}
                className={isRecording ? "" : "bg-gray-800/70 border-cosmic-light/30 hover:bg-gray-700"}
              >
                <Mic size={18} className={isRecording ? "animate-pulse" : "text-cosmic-cyan"} />
              </Button>
              
              <Button 
                onClick={handleImageButtonClick} 
                size="icon" 
                variant="outline"
                className="bg-gray-800/70 border-cosmic-light/30 hover:bg-gray-700"
              >
                <Image size={18} className="text-cosmic-cyan" />
              </Button>
            </div>
            
            <Button 
              onClick={handleSubmit} 
              className="cosmic-button px-4 py-2"
            >
              <Send size={18} className="mr-2" />
              发送到宇宙
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default MessageForm;
