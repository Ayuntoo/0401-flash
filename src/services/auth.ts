// 用户类型定义
export interface User {
  id: string;
  email?: string;
  phone?: string;
  nickname: string;
  avatar?: string;
  createdAt: number;
}

// 用于检查邮箱格式
const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// 用于检查手机号格式（简单中国手机号验证）
const isValidPhone = (phone: string): boolean => {
  const phoneRegex = /^1[3-9]\d{9}$/;
  return phoneRegex.test(phone);
};

// 注册新用户
export const register = (
  credential: string, 
  password: string, 
  nickname?: string
): Promise<User> => {
  return new Promise((resolve, reject) => {
    // 验证凭证是邮箱还是手机号
    const isEmail = isValidEmail(credential);
    const isPhone = isValidPhone(credential);
    
    if (!isEmail && !isPhone) {
      return reject(new Error("请输入有效的邮箱或手机号"));
    }
    
    if (password.length < 6) {
      return reject(new Error("密码长度至少需要6个字符"));
    }
    
    // 检查是否已经注册
    const users = JSON.parse(localStorage.getItem('cosmic_users') || '[]');
    const existingUser = users.find((user: User) => 
      (isEmail && user.email === credential) || 
      (isPhone && user.phone === credential)
    );
    
    if (existingUser) {
      return reject(new Error("该账号已被注册"));
    }
    
    // 创建新用户
    const newUser: User = {
      id: Math.random().toString(36).substring(2, 15),
      ...(isEmail ? { email: credential } : {}),
      ...(isPhone ? { phone: credential } : {}),
      nickname: nickname || `宇宙旅行者${Math.floor(Math.random() * 1000)}`,
      createdAt: Date.now()
    };
    
    // 保存用户和密码（实际应用中密码应该加密存储）
    users.push(newUser);
    localStorage.setItem('cosmic_users', JSON.stringify(users));
    
    // 保存密码（实际项目中应当加密）
    const credentials = JSON.parse(localStorage.getItem('cosmic_credentials') || '{}');
    credentials[credential] = password;
    localStorage.setItem('cosmic_credentials', JSON.stringify(credentials));
    
    // 设置当前用户
    localStorage.setItem('cosmic_current_user', JSON.stringify(newUser));
    localStorage.setItem('userNickname', newUser.nickname); // 兼容现有代码
    
    setTimeout(() => {
      resolve(newUser);
    }, 500); // 模拟网络延迟
  });
};

// 登录
export const login = (credential: string, password: string): Promise<User> => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      // 获取存储的用户和密码
      const users = JSON.parse(localStorage.getItem('cosmic_users') || '[]');
      const credentials = JSON.parse(localStorage.getItem('cosmic_credentials') || '{}');
      
      // 验证密码
      if (credentials[credential] !== password) {
        return reject(new Error("用户名或密码错误"));
      }
      
      // 查找用户
      const user = users.find((user: User) => 
        user.email === credential || user.phone === credential
      );
      
      if (!user) {
        return reject(new Error("用户不存在"));
      }
      
      // 设置当前用户
      localStorage.setItem('cosmic_current_user', JSON.stringify(user));
      localStorage.setItem('userNickname', user.nickname); // 兼容现有代码
      
      resolve(user);
    }, 500); // 模拟网络延迟
  });
};

// 检查用户是否已登录
export const isAuthenticated = (): boolean => {
  const user = localStorage.getItem('cosmic_current_user');
  return !!user;
};

// 获取当前用户
export const getCurrentUser = (): User | null => {
  const userStr = localStorage.getItem('cosmic_current_user');
  if (!userStr) return null;
  
  try {
    return JSON.parse(userStr);
  } catch (e) {
    return null;
  }
};

// 登出
export const logout = (): void => {
  localStorage.removeItem('cosmic_current_user');
  // 不移除userNickname，以保持兼容性
}; 