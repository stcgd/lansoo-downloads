import { initializeApp } from "firebase/app";
import { getFirestore, setLogLevel } from "firebase/firestore";
import { getAuth } from "firebase/auth";

// --- 配置已更新 (使用你提供的密钥) ---
const firebaseConfig = {
  apiKey: "AIzaSyD6VmMS1SmUcJVAPoUnBrJWfy3ygbA1LbM",
  authDomain: "soft-51328.firebaseapp.com",
  projectId: "soft-51328",
  storageBucket: "soft-51328.appspot.com",
  messagingSenderId: "422438173360",
  appId: "1:422438173360:web:46d6ef42c992de0fe89975",
  measurementId: "G-PJN4PJP48" // 注意：这里的 ID 应该与你的项目一致，我根据你的上一次提供的内容进行填充
};

// --- Canvas 环境特定代码 ---
let app;
let db;
let auth;

try {
  // 尝试使用 Canvas 提供的全局配置（在 Cloudflare 部署时）
  const canvasConfig = JSON.parse(__firebase_config);
  app = initializeApp(canvasConfig);
} catch (e) {
  // 如果失败（例如本地开发），则使用上面的手动配置
  console.log("Canvas config not found, using manual config. (This is normal for local dev)");
  app = initializeApp(firebaseConfig);
}

db = getFirestore(app);
auth = getAuth(app);

// 开启调试日志，方便排查问题
setLogLevel('Debug');

export { app, db, auth };
