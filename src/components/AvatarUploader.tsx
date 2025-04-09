import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Camera, Upload, Scissors, X, Check, RefreshCw, User } from 'lucide-react';
import { saveAvatar } from '@/utils/storage';
import { toast } from "sonner";

interface AvatarUploaderProps {
  isOpen: boolean;
  onClose: () => void;
  currentAvatar?: string | null;
  onAvatarChange: (avatarUrl: string) => void;
}

const AvatarUploader: React.FC<AvatarUploaderProps> = ({ 
  isOpen, 
  onClose, 
  currentAvatar, 
  onAvatarChange 
}) => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [scale, setScale] = useState(1);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  
  // 处理本地文件上传
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    if (!file.type.startsWith('image/')) {
      toast.error("请选择图片文件");
      return;
    }
    
    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target?.result) {
        setSelectedImage(e.target.result as string);
        setIsEditing(true);
        stopCamera();
      }
    };
    reader.readAsDataURL(file);
  };
  
  // 开启相机
  const startCamera = async () => {
    try {
      // 停止之前可能存在的相机实例
      stopCamera();
      
      console.log("===开始请求相机权限===");
      toast.info("正在请求相机权限...");
      
      // 检查浏览器是否支持getUserMedia
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        toast.error("您的浏览器不支持访问相机");
        console.error("浏览器不支持getUserMedia");
        return;
      }
      
      // 先获取可用设备列表，检查是否有视频输入设备
      const devices = await navigator.mediaDevices.enumerateDevices();
      const videoDevices = devices.filter(device => device.kind === 'videoinput');
      
      if (videoDevices.length === 0) {
        toast.error("未检测到相机设备");
        console.error("没有视频输入设备");
        return;
      }
      
      console.log("检测到相机设备:", videoDevices.length);
      
      // 使用首选摄像头（通常是前置相机）
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { 
          facingMode: 'user',
          width: { ideal: 640 },
          height: { ideal: 640 }
        },
        audio: false
      });
      
      console.log("相机权限已获取", stream);
      
      // 确保视频元素存在
      if (!videoRef.current) {
        console.error("视频元素不存在");
        toast.error("相机初始化失败");
        return;
      }
      
      videoRef.current.srcObject = stream;
      mediaStreamRef.current = stream;
      
      // 确保视频元素正确显示
      videoRef.current.style.display = 'block';
      
      // 确保视频正确加载并播放
      videoRef.current.onloadedmetadata = () => {
        if (videoRef.current) {
          console.log("视频元素已加载元数据");
          videoRef.current.play()
            .then(() => {
              console.log("===相机已成功启动===");
              setIsCameraActive(true);
              setIsEditing(false);
              setSelectedImage(null);
              toast.success("相机已启动");
            })
            .catch(err => {
              console.error("视频播放失败:", err);
              toast.error("启动相机失败，请重试");
            });
        }
      };
    } catch (error) {
      console.error('相机访问失败:', error);
      if (error instanceof DOMException && error.name === 'NotAllowedError') {
        toast.error("相机访问被拒绝，请在浏览器中允许相机权限");
      } else {
        toast.error("无法访问相机，请检查设备和浏览器设置");
      }
    }
  };
  
  // 停止相机
  const stopCamera = () => {
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach(track => {
        console.log("停止相机轨道:", track.kind);
        track.stop();
      });
      mediaStreamRef.current = null;
    }
    setIsCameraActive(false);
  };
  
  // 拍照
  const takePicture = () => {
    if (!videoRef.current || !canvasRef.current) {
      console.error("视频或Canvas元素未找到");
      toast.error("相机组件未初始化");
      return;
    }
    
    try {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      
      console.log("开始拍照...");
      console.log("视频状态:", video.readyState, "尺寸:", video.videoWidth, "x", video.videoHeight);
      
      // 确保视频已经加载
      if (video.readyState !== 4 || video.videoWidth === 0 || video.videoHeight === 0) {
        toast.error("相机尚未准备好，请稍候");
        console.error("视频未准备好");
        return;
      }
      
      // 设置canvas尺寸为视频的实际尺寸
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      // 获取绘图上下文
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        console.error("无法获取canvas上下文");
        return;
      }
      
      // 清除画布
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // 绘制圆形裁剪区域
      ctx.save();
      ctx.beginPath();
      const centerX = video.videoWidth / 2;
      const centerY = video.videoHeight / 2;
      const radius = Math.min(video.videoWidth, video.videoHeight) / 2;
      
      ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
      ctx.closePath();
      ctx.clip();
      
      // 绘制视频帧
      ctx.drawImage(video, 0, 0, video.videoWidth, video.videoHeight);
      ctx.restore();
      
      // 转换为base64数据
      const imageData = canvas.toDataURL('image/png');
      console.log("照片已捕获，数据长度:", imageData.length);
      
      // 设置为选中图片
      setSelectedImage(imageData);
      
      // 停止相机
      stopCamera();
      
      // 进入编辑模式
      setIsEditing(true);
      setIsCameraActive(false);
      
      toast.success("照片已拍摄");
    } catch (error) {
      console.error("拍照失败:", error);
      toast.error("拍照失败，请重试");
    }
  };
  
  // 保存头像
  const saveNewAvatar = async () => {
    if (!selectedImage) return;
    
    try {
      // 创建一个canvas用于裁剪和调整头像
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      
      // 设置canvas大小为最终头像大小
      canvas.width = 200;
      canvas.height = 200;
      
      // 创建一个临时图像对象用于绘制
      const img = new Image();
      img.onload = async () => {
        // 计算裁剪和缩放参数
        const size = Math.min(img.width, img.height);
        const sx = (img.width - size) / 2 - position.x * img.width;
        const sy = (img.height - size) / 2 - position.y * img.height;
        const sWidth = size / scale;
        const sHeight = size / scale;
        
        // 清除canvas并绘制裁剪后的图像
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(
          img,
          sx, sy, sWidth, sHeight,
          0, 0, canvas.width, canvas.height
        );
        
        // 转换为base64格式
        const finalImageData = canvas.toDataURL('image/jpeg', 0.9);
        
        // 保存到本地存储
        const avatarUrl = await saveAvatar(finalImageData);
        
        // 回调通知父组件头像已更新
        onAvatarChange(avatarUrl);
        toast.success("头像已更新");
        
        // 关闭对话框并重置状态
        handleClose();
      };
      
      img.src = selectedImage;
    } catch (error) {
      toast.error("保存头像失败");
      console.error("保存头像错误:", error);
    }
  };
  
  // 处理关闭对话框
  const handleClose = () => {
    stopCamera();
    setSelectedImage(null);
    setIsEditing(false);
    setPosition({ x: 0, y: 0 });
    setScale(1);
    onClose();
  };
  
  // 处理编辑时的拖动
  const handleDrag = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isEditing || !e.buttons) return;
    
    setPosition(prev => ({
      x: prev.x + e.movementX / (e.currentTarget.clientWidth * scale),
      y: prev.y + e.movementY / (e.currentTarget.clientHeight * scale)
    }));
  };
  
  // 处理缩放
  const handleZoom = (factor: number) => {
    setScale(prev => Math.max(1, Math.min(3, prev + factor)));
  };
  
  // 用于触发文件选择对话框
  const triggerFileSelect = () => {
    fileInputRef.current?.click();
  };
  
  // 切换到拍照模式
  const switchToCamera = () => {
    setSelectedImage(null);
    setIsEditing(false);
    startCamera();
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="bg-gray-900/95 border-cosmic-light/20 max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center text-xl font-cosmic">更新头像</DialogTitle>
        </DialogHeader>
        
        <div className="py-4">
          {/* 隐藏的canvas元素用于拍照 */}
          <canvas 
            ref={canvasRef} 
            className="hidden" 
            width="640" 
            height="640"
          ></canvas>
          
          {/* 隐藏的文件输入 */}
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileSelect}
            accept="image/*"
            className="hidden"
          />
          
          {/* 预览区域 */}
          <div className="flex justify-center">
            <div 
              className="w-64 h-64 rounded-full overflow-hidden border-2 border-cosmic-light/50 bg-gray-800 relative"
              onMouseMove={handleDrag}
              onTouchMove={(e) => {
                const touch = e.touches[0];
                setPosition(prev => ({
                  x: prev.x + touch.clientX / (e.currentTarget.clientWidth * scale),
                  y: prev.y + touch.clientY / (e.currentTarget.clientHeight * scale)
                }));
              }}
            >
              {selectedImage ? (
                <div 
                  className="w-full h-full"
                  style={{
                    backgroundImage: `url(${selectedImage})`,
                    backgroundPosition: `${50 + position.x * 100}% ${50 + position.y * 100}%`,
                    backgroundSize: `${scale * 100}%`,
                    backgroundRepeat: 'no-repeat'
                  }}
                />
              ) : isCameraActive ? (
                <video 
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover"
                  style={{ transform: 'scaleX(-1)' }} // 镜像显示，更符合自拍习惯
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gray-800">
                  {currentAvatar ? (
                    <img 
                      src={currentAvatar} 
                      alt="当前头像" 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <User size={64} className="text-gray-500" />
                  )}
                </div>
              )}
            </div>
          </div>
          
          {/* 编辑控制 */}
          {isEditing && (
            <div className="flex justify-center space-x-4">
              <Button
                variant="outline"
                size="icon"
                onClick={() => handleZoom(-0.1)}
                className="bg-gray-800/70 border-cosmic-light/30"
              >
                <span className="text-xl">-</span>
              </Button>
              
              <Button
                variant="outline"
                size="icon"
                onClick={() => handleZoom(0.1)}
                className="bg-gray-800/70 border-cosmic-light/30"
              >
                <span className="text-xl">+</span>
              </Button>
              
              <Button
                variant="outline"
                size="icon"
                onClick={() => setPosition({ x: 0, y: 0 })}
                className="bg-gray-800/70 border-cosmic-light/30"
              >
                <RefreshCw size={18} className="text-cosmic-cyan" />
              </Button>
            </div>
          )}
          
          {/* 底部按钮 */}
          <div className="flex flex-wrap justify-center gap-3 mt-4">
            {isCameraActive ? (
              <>
                <Button 
                  onClick={takePicture}
                  className="cosmic-button"
                >
                  <Camera size={18} className="mr-2" />
                  拍照
                </Button>
                
                <Button 
                  onClick={stopCamera}
                  variant="outline"
                  className="bg-gray-800/70 border-cosmic-light/30"
                >
                  <X size={18} className="mr-2" />
                  取消
                </Button>
              </>
            ) : selectedImage ? (
              <>
                <Button 
                  onClick={saveNewAvatar}
                  className="cosmic-button"
                >
                  <Check size={18} className="mr-2" />
                  保存头像
                </Button>
                
                <Button 
                  onClick={() => setSelectedImage(null)}
                  variant="outline"
                  className="bg-gray-800/70 border-cosmic-light/30"
                >
                  <X size={18} className="mr-2" />
                  取消
                </Button>
              </>
            ) : (
              <>
                <Button 
                  onClick={startCamera}
                  className="cosmic-button"
                  style={{ background: 'linear-gradient(to right, #0052d4, #4364f7, #6fb1fc)' }}
                >
                  <Camera size={18} className="mr-2" />
                  拍照上传
                </Button>
                
                <Button 
                  onClick={triggerFileSelect}
                  variant="outline"
                  className="bg-gray-800/70 border-cosmic-light/30"
                >
                  <Upload size={18} className="mr-2" />
                  从相册选择
                </Button>
              </>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AvatarUploader; 