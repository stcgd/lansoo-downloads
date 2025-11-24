import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// 从 Canvas 环境获取配置信息
const firebaseConfig = typeof __firebase_config !== 'undefined' 
    ? JSON.parse(__firebase_config) 
    : {};
// Canvas 环境提供的初始认证令牌
export const initialAuthToken = typeof __initial_auth_token !== 'undefined' 
    ? __initial_auth_token 
    : null;

// 初始化 Firebase 应用
const app = initializeApp(firebaseConfig);

// 初始化并导出认证和数据库服务
export const db = getFirestore(app);
export const auth = getAuth(app); 

// 注意：Firebase 的辅助函数（如 collection, query, onSnapshot 等）将继续在 App.jsx 中直接导入。
