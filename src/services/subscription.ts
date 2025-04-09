// 订阅状态管理
export interface SubscriptionInfo {
  isSubscribed: boolean;
  plan?: 'monthly' | 'yearly';
  startDate?: number;
  endDate?: number;
}

// 从本地存储读取订阅信息
export const getSubscriptionInfo = (): SubscriptionInfo => {
  const info = localStorage.getItem('cosmic_subscription');
  if (!info) {
    return { isSubscribed: false };
  }
  
  try {
    return JSON.parse(info);
  } catch (e) {
    return { isSubscribed: false };
  }
};

// 保存订阅信息到本地存储
export const saveSubscriptionInfo = (info: SubscriptionInfo): void => {
  localStorage.setItem('cosmic_subscription', JSON.stringify(info));
};

// 判断用户是否已订阅
export const isSubscribed = (): boolean => {
  const info = getSubscriptionInfo();
  
  // 如果没有订阅信息，直接返回 false
  if (!info.isSubscribed) return false;
  
  // 如果有结束日期，检查是否已过期
  if (info.endDate && info.endDate < Date.now()) {
    // 订阅已过期，更新状态
    saveSubscriptionInfo({ isSubscribed: false });
    return false;
  }
  
  return true;
};

// 获取用户已解锁的免费光球数量
export const getUnlockedFreeOrbCount = (): number => {
  const count = localStorage.getItem('cosmic_free_orb_count');
  return count ? parseInt(count, 10) : 0;
};

// 增加已解锁的免费光球数量
export const incrementUnlockedFreeOrbCount = (): number => {
  const currentCount = getUnlockedFreeOrbCount();
  const newCount = currentCount + 1;
  localStorage.setItem('cosmic_free_orb_count', newCount.toString());
  return newCount;
};

// 检查用户是否可以解锁更多免费光球
export const canUnlockFreeOrb = (): boolean => {
  return getUnlockedFreeOrbCount() < 3; // 最多3个免费光球
};

// 模拟订阅过程
export const subscribe = (plan: 'monthly' | 'yearly'): Promise<SubscriptionInfo> => {
  return new Promise((resolve) => {
    // 模拟网络请求延迟
    setTimeout(() => {
      const now = Date.now();
      const endDate = plan === 'monthly' 
        ? now + 30 * 24 * 60 * 60 * 1000 // 一个月
        : now + 365 * 24 * 60 * 60 * 1000; // 一年
      
      const subscriptionInfo: SubscriptionInfo = {
        isSubscribed: true,
        plan,
        startDate: now,
        endDate
      };
      
      saveSubscriptionInfo(subscriptionInfo);
      resolve(subscriptionInfo);
    }, 1000);
  });
}; 