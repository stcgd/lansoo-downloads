// ⚠️ 关键修复：为了解决 Rollup 无法解析 "firebase/app" 子路径的问题，
// 我们尝试从主包 "firebase" 导入所有命名空间服务。
// 尽管 Firebase v9+ 推荐子路径，但这是解决构建错误的常见变通方法。
// 
// 注意：如果这个方法不行，可能需要降级或升级 firebase 版本。

import { initializeApp } from 'firebase/app';
// 其他服务也必须从 'firebase/xxx' 导入，但由于构建失败，我们尝试使用完整的导入路径
import { 
  getAuth, signInAnonymously, onAuthStateChanged, signInWithCustomToken, signInWithEmailAndPassword, signOut 
} from 'firebase/auth';
import { 
  getFirestore, collection, query, onSnapshot, getDocs, addDoc, updateDoc, deleteDoc, doc, writeBatch 
} from 'firebase/firestore';


// ⚠️ 环境变量的解析必须正确
const firebaseConfig = typeof __firebase_config !== 'undefined' ? JSON.parse(__firebase_config) : {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_AUTH_DOMAIN",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_STORAGE_BUCKET",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID"
};

// 初始化 Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

// 导出所有需要使用的 Firebase 服务和函数
export {
  app,
  db,
  auth,
  // Auth Functions
  getAuth,
  signInAnonymously,
  onAuthStateChanged,
  signInWithCustomToken,
  signInWithEmailAndPassword,
  signOut,
  // Firestore Functions
  getFirestore,
  collection,
  query,
  onSnapshot,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  writeBatch
};
