import { initializeApp } from 'firebase/app';
import { 
  getAuth, signInAnonymously, onAuthStateChanged, signInWithCustomToken, signInWithEmailAndPassword, signOut 
} from 'firebase/auth';
import { 
  getFirestore, collection, query, onSnapshot, getDocs, addDoc, updateDoc, deleteDoc, doc, writeBatch 
} from 'firebase/firestore';


// 环境变量的解析
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
