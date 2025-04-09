import React, { useState } from 'react';
import { X, Check, CreditCard } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { subscribe } from '@/services/subscription';
import { toast } from 'sonner';

interface SubscriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const SubscriptionModal: React.FC<SubscriptionModalProps> = ({
  isOpen,
  onClose,
  onSuccess
}) => {
  const [selectedPlan, setSelectedPlan] = useState<'monthly' | 'yearly'>('monthly');
  const [isProcessing, setIsProcessing] = useState(false);
  
  const handleSubscribe = async () => {
    setIsProcessing(true);
    
    try {
      // 在实际应用中，这里应该集成支付网关
      await subscribe(selectedPlan);
      toast.success(`成功订阅${selectedPlan === 'monthly' ? '月度' : '年度'}计划！`);
      onSuccess();
    } catch (error) {
      toast.error('订阅过程中发生错误，请重试');
    } finally {
      setIsProcessing(false);
    }
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md bg-gray-900 border border-gray-800 text-gray-100">
        <DialogHeader>
          <DialogTitle className="text-xl text-center font-bold text-blue-400">
            解锁更多宇宙光波
          </DialogTitle>
          <DialogDescription className="text-center text-gray-400">
            订阅宇宙探索者计划，无限解锁所有光波信息
          </DialogDescription>
        </DialogHeader>
        
        <div className="mt-4 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            {/* 月度计划 */}
            <div 
              className={`p-4 rounded-lg border cursor-pointer transition-all ${
                selectedPlan === 'monthly' 
                  ? 'border-blue-500 bg-blue-900/20' 
                  : 'border-gray-700 bg-gray-800/50'
              }`}
              onClick={() => setSelectedPlan('monthly')}
            >
              <div className="text-center">
                <h3 className="font-medium text-lg">月度计划</h3>
                <div className="mt-2 text-2xl font-bold text-blue-400">$5</div>
                <p className="text-sm text-gray-400">每月</p>
                
                {selectedPlan === 'monthly' && (
                  <div className="mt-2">
                    <Check className="h-5 w-5 text-blue-400 mx-auto" />
                  </div>
                )}
              </div>
            </div>
            
            {/* 年度计划 */}
            <div 
              className={`p-4 rounded-lg border cursor-pointer transition-all ${
                selectedPlan === 'yearly' 
                  ? 'border-purple-500 bg-purple-900/20' 
                  : 'border-gray-700 bg-gray-800/50'
              }`}
              onClick={() => setSelectedPlan('yearly')}
            >
              <div className="text-center">
                <h3 className="font-medium text-lg">年度计划</h3>
                <div className="mt-2 text-2xl font-bold text-purple-400">$50</div>
                <p className="text-sm text-gray-400">每年 (节省$10)</p>
                
                {selectedPlan === 'yearly' && (
                  <div className="mt-2">
                    <Check className="h-5 w-5 text-purple-400 mx-auto" />
                  </div>
                )}
              </div>
            </div>
          </div>
          
          <div className="border-t border-gray-800 pt-4">
            <h4 className="text-lg font-medium mb-2">会员特权：</h4>
            <ul className="space-y-2">
              <li className="flex items-center">
                <Check className="h-4 w-4 text-green-400 mr-2" />
                <span>无限解锁所有光波信息</span>
              </li>
              <li className="flex items-center">
                <Check className="h-4 w-4 text-green-400 mr-2" />
                <span>特殊宇宙定制主题</span>
              </li>
              <li className="flex items-center">
                <Check className="h-4 w-4 text-green-400 mr-2" />
                <span>优先接收宇宙能量</span>
              </li>
            </ul>
          </div>
          
          <div className="flex justify-center pt-2">
            <Button 
              onClick={handleSubscribe}
              disabled={isProcessing}
              className="w-full py-6 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
            >
              <CreditCard className="mr-2 h-5 w-5" />
              {isProcessing ? "处理中..." : `立即订阅 ${selectedPlan === 'monthly' ? '$5/月' : '$50/年'}`}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SubscriptionModal; 