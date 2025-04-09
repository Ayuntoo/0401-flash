// 创建一个工具文件来处理媒体存储

export interface MediaItem {
  id: string;
  type: 'audio' | 'image';
  data: Blob;
  created: number;
}

const DB_NAME = "cosmicWaveDB";
const MEDIA_STORE = "mediaStore";
const DB_VERSION = 1;

// 打开数据库
export const openDatabase = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    
    request.onerror = () => reject(new Error("无法打开数据库"));
    
    request.onsuccess = () => resolve(request.result);
    
    request.onupgradeneeded = (event) => {
      const db = request.result;
      // 创建对象仓库
      if (!db.objectStoreNames.contains(MEDIA_STORE)) {
        db.createObjectStore(MEDIA_STORE, { keyPath: "id" });
      }
    };
  });
};

// 添加日志函数
const logStorageError = (operation: string, error: any) => {
  console.error(`存储操作失败 (${operation}):`, error);
};

// 保存媒体(音频或图片)
export const saveMedia = async (id: string, blob: Blob, type: 'audio' | 'image'): Promise<string> => {
  try {
    const db = await openDatabase();
    
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([MEDIA_STORE], "readwrite");
      
      transaction.onerror = (event) => {
        logStorageError(`保存${type}事务`, event);
        reject(new Error(`保存${type}失败`));
      };
      
      const store = transaction.objectStore(MEDIA_STORE);
      
      const mediaItem: MediaItem = {
        id,
        type,
        data: blob,
        created: Date.now()
      };
      
      console.log(`正在保存${type}, ID: ${id}, 大小: ${blob.size} 字节`);
      
      const request = store.put(mediaItem);
      
      request.onsuccess = () => {
        console.log(`${type}保存成功, ID: ${id}`);
        resolve(id);
      };
      
      request.onerror = (event) => {
        logStorageError(`保存${type}请求`, event);
        reject(new Error(`保存${type}失败`));
      };
    });
  } catch (error) {
    logStorageError(`保存${type}`, error);
    throw error;
  }
};

// 获取媒体
export const getMedia = async (id: string): Promise<Blob | null> => {
  const db = await openDatabase();
  
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([MEDIA_STORE], "readonly");
    const store = transaction.objectStore(MEDIA_STORE);
    
    const request = store.get(id);
    
    request.onsuccess = () => {
      if (request.result) {
        resolve(request.result.data);
      } else {
        resolve(null);
      }
    };
    
    request.onerror = () => reject(new Error("获取媒体失败"));
  });
};

// 删除媒体
export const deleteMedia = async (id: string): Promise<void> => {
  const db = await openDatabase();
  
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([MEDIA_STORE], "readwrite");
    const store = transaction.objectStore(MEDIA_STORE);
    
    const request = store.delete(id);
    
    request.onsuccess = () => resolve();
    request.onerror = () => reject(new Error("删除媒体失败"));
  });
};

// 获取临时URL (用于显示)
export const createMediaUrl = async (id: string): Promise<string | null> => {
  const blob = await getMedia(id);
  if (blob) {
    return URL.createObjectURL(blob);
  }
  return null;
};

// 保存头像
export const saveAvatar = async (avatarData: string): Promise<string> => {
  try {
    // 保存到 localStorage
    localStorage.setItem('userAvatar', avatarData);
    return avatarData;
  } catch (error) {
    console.error('保存头像失败:', error);
    throw error;
  }
};

// 获取头像
export const getAvatar = (): string | null => {
  return localStorage.getItem('userAvatar');
}; 