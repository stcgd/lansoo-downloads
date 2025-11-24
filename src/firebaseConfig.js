import { initializeApp } from 'firebase/app';
import { getAuth, signInWithCustomToken, signInAnonymously } from 'firebase/auth';
import { getFirestore, collection, doc, writeBatch, setLogLevel } from 'firebase/firestore';

// --- Canvas Environment Variables ---
// 确保这些变量在 Canvas 环境中可用
const firebaseConfig = typeof __firebase_config !== 'undefined' 
    ? JSON.parse(__firebase_config) 
    : {};
const initialAuthToken = typeof __initial_auth_token !== 'undefined' 
    ? __initial_auth_token 
    : null;

// 初始化 Firebase 应用
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

// 可选：设置 Firestore 日志级别为 Debug，便于调试
setLogLevel('debug');

// 异步函数：处理身份验证
async function authenticateUser() {
    try {
        if (initialAuthToken) {
            // 使用提供的自定义令牌登录
            await signInWithCustomToken(auth, initialAuthToken);
            console.log("Firebase: Signed in with custom token.");
        } else {
            // 否则，匿名登录
            await signInAnonymously(auth);
            console.log("Firebase: Signed in anonymously.");
        }
    } catch (error) {
        console.error("Firebase Authentication Error:", error);
    }
}

// 在模块加载时立即进行身份验证
authenticateUser();

// 导出必要的 Firestore 函数和实例，供其他组件使用
export { db, auth, collection, doc, writeBatch };
