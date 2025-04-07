import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Mic, Send, X } from 'lucide-react';
import { toast } from "sonner";

interface MessageFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (message: {
    text: string;
    audio?: string;
    type: 'text' | 'audio' | 'mixed';
  }) => void;
}

const MessageForm: React.FC<MessageFormProps> = ({ isOpen, onClose, onSubmit }) => {
  const [text, setText] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  
  // 处理音频录制
  const handleRecording = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      const audioChunks: BlobPart[] = [];

      mediaRecorder.addEventListener("dataavailable", (event) => {
        audioChunks.push(event.data);
      });

      mediaRecorder.addEventListener("stop", () => {
        const audioBlob = new Blob(audioChunks, { type: 'audio/wav' });
        const audioUrl = URL.createObjectURL(audioBlob);
        setAudioUrl(audioUrl);
      });

      mediaRecorder.start();
      setIsRecording(true);

      // 10秒后自动停止
      setTimeout(() => {
        if (mediaRecorder.state !== 'inactive') {
          mediaRecorder.stop();
          setIsRecording(false);
          
          // 停止所有音频轨道
          stream.getTracks().forEach(track => track.stop());
        }
      }, 10000);
    } catch (err) {
      console.error('Error accessing microphone', err);
      toast.error("无法访问麦克风");
    }
  };

  const stopRecording = () => {
    setIsRecording(false);
    // 实际停止录音的逻辑会在mediaRecorder的事件处理程序中
  };

  const handleSubmit = () => {
    if (!text.trim() && !audioUrl) {
      toast.error("请输入文本或录制语音");
      return;
    }

    let type: 'text' | 'audio' | 'mixed' = 'text';
    
    if (text && audioUrl) {
      type = 'mixed';
    } else if (audioUrl) {
      type = 'audio';
    }

    onSubmit({
      text: text.trim(),
      audio: audioUrl || undefined,
      type
    });

    // 重置表单
    setText('');
    setAudioUrl(null);
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
