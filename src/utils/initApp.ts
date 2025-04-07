import { openDatabase } from './storage';

export const initializeApp = async (): Promise<void> => {
  try {
    await openDatabase();
    console.log('应用初始化成功');
    return Promise.resolve();
  } catch (error) {
    console.error('应用初始化失败:', error);
    return Promise.reject(error);
  }
}; 