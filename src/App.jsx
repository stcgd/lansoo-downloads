import React, { useState, useMemo, useEffect, useCallback } from "react";
// 修正后的 Firebase 导入：将不同的功能从各自的模块中导入
import { initializeApp } from "firebase/app"; 
import { getAuth, signInAnonymously, onAuthStateChanged, signInWithCustomToken } from "firebase/auth";
import { 
  getFirestore, 
  collection, query, onSnapshot, writeBatch, doc, getDocs, setLogLevel
} from "firebase/firestore";

import { Sun, Moon, Search, Download, Settings, Loader2 } from "lucide-react";

// --- 1. Firebase 初始化与配置 (已合并) ---
// 启用 Firestore Debug 日志
setLogLevel('debug');

// 从 Canvas 环境获取配置信息和认证令牌
const firebaseConfig = typeof __firebase_config !== 'undefined' 
    ? JSON.parse(__firebase_config) 
    : {};
const initialAuthToken = typeof __initial_auth_token !== 'undefined' 
    ? __initial_auth_token 
    : null;

// 初始化 Firebase 应用
const app = initializeApp(firebaseConfig);
// 初始化并获取认证和数据库服务实例
const db = getFirestore(app);
const auth = getAuth(app); 

// Canvas 环境特定代码
const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';
const PUBLIC_COLLECTION_PATH = `artifacts/${appId}/public/data/software`;

// --- 2. 嵌入 Admin Panel 所需的模拟数据 ---
const mockSoftwareData = [
    {
        name: "Photoshop CC 2024",
        category: "设计工具",
        description: "Adobe Photoshop CC 2024 最新版，专业的图像处理和编辑软件。",
        downloadUrl: "https://mocklink.com/photoshop-2024",
        updatedAt: "2024-11-20"
    },
    {
        name: "Visual Studio Code",
        category: "开发工具",
        description: "轻量级但功能强大的源代码编辑器，支持多种编程语言。",
        downloadUrl: "https://mocklink.com/vscode",
        updatedAt: "2024-11-18"
    },
    {
        name: "Notion",
        category: "效率工具",
        description: "集笔记、知识库和项目管理于一体的协作工具。",
        downloadUrl: "https://mocklink.com/notion",
        updatedAt: "2024-11-21"
    },
    {
        name: "Final Cut Pro X",
        category: "视频编辑",
        description: "Apple 平台上的专业视频剪辑软件，高性能和直观的界面。",
        downloadUrl: "https://mocklink.com/fcp-x",
        updatedAt: "2024-11-15"
    },
    {
        name: "Obsidian",
        category: "效率工具",
        description: "基于 Markdown 的本地知识管理和笔记软件。",
        downloadUrl: "https://mocklink.com/obsidian",
        updatedAt: "2024-11-23"
    }
];

// --- 3. 轮播图图片地址 ---
const banners = [
  { id: 1, img: "https://img.lansoo.com/file/1756974582770_banner3.png" },
  { id: 2, img: "https://img.lansoo.com/file/1757093612782_image.png" },
  { id: 3, img: "https://img.lansoo.com/file/1756974574144_banner1.png" },
  { id: 4, img: "https://img.lansoo.com/file/1742103223415_PixPin_2025-03-16_13-33-33.png" },
  { id: 5, img: "https://img.lansoo.com/file/1757093478872_image.png" },
];

// 正则表达式转义函数
const escapeRegExp = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

// 高亮搜索结果的函数
const highlight = (text, query) => {
  if (!query) return text;
  const regex = new RegExp(`(${escapeRegExp(query)})`, "gi");
  const parts = text.split(regex);
  return parts.map((part, i) =>
    regex.test(part) ? <mark key={i} className="bg-yellow-300 dark:bg-yellow-500 text-gray-900 dark:text-gray-900 rounded px-0.5">{part}</mark> : part
  );
};


// --- 4. Admin Panel Component (用于上传 mock 数据) ---

const AdminPanel = ({ onBack }) => {
    const [status, setStatus] = useState({ message: '等待上传...', type: 'info' });
    const [isUploading, setIsUploading] = useState(false);

    // 获取当前用户ID (用于控制台日志)
    const userId = auth.currentUser?.uid || 'anonymous';
    
    // 上传数据函数
    const handleUpload = async () => {
        if (!db) {
            setStatus({ message: '错误：Firestore 尚未初始化。', type: 'error' });
            return;
        }

        setIsUploading(true);
        setStatus({ message: '正在清除旧数据...', type: 'info' });

        try {
            // 1. 获取并删除所有现有文档
            const q = query(collection(db, PUBLIC_COLLECTION_PATH));
            const snapshot = await getDocs(q);
            
            const deleteBatch = writeBatch(db);
            snapshot.docs.forEach((d) => {
                deleteBatch.delete(doc(db, PUBLIC_COLLECTION_PATH, d.id));
            });
            await deleteBatch.commit();
            console.log(`[Admin] 用户 ${userId} 成功删除了 ${snapshot.docs.length} 个旧文档。`);
            setStatus({ message: `旧数据清除成功，共 ${snapshot.docs.length} 条。`, type: 'info' });

            // 2. 批量上传新文档
            setStatus({ message: `正在上传 ${mockSoftwareData.length} 条新数据...`, type: 'info' });
            
            const newBatch = writeBatch(db);
            mockSoftwareData.forEach((data) => {
                // 使用 doc() 和 collection() 来创建文档引用，并使用 data.name 作为文档 ID 以简化
                const newDocRef = doc(db, PUBLIC_COLLECTION_PATH, data.name.replace(/\s+/g, '-').toLowerCase());
                newBatch.set(newDocRef, data);
            });
            await newBatch.commit();
            
            console.log(`[Admin] 用户 ${userId} 成功上传了 ${mockSoftwareData.length} 条新软件数据。`);
            setStatus({ message: `数据上传成功！共 ${mockSoftwareData.length} 条软件。`, type: 'success' });

        } catch (e) {
            console.error("[Admin] 批量操作失败: ", e);
            setStatus({ message: `上传过程中发生错误：${e.message}`, type: 'error' });
        } finally {
            setIsUploading(false);
        }
    };

    const statusClasses = useMemo(() => {
        switch (status.type) {
            case 'success':
                return 'bg-green-100 border-green-400 text-green-700 dark:bg-green-900 dark:border-green-700 dark:text-green-300';
            case 'error':
                return 'bg-red-100 border-red-400 text-red-700 dark:bg-red-900 dark:border-red-700 dark:text-red-300';
            default:
                return 'bg-blue-100 border-blue-400 text-blue-700 dark:bg-blue-900 dark:border-blue-700 dark:text-blue-300';
        }
    }, [status.type]);

    return (
        <div className="max-w-4xl mx-auto p-8 bg-gray-50 dark:bg-gray-800 rounded-xl shadow-2xl mt-10">
            <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white mb-6 border-b pb-3">
                管理员面板 (数据初始化)
            </h2>
            <div className={`p-4 rounded-lg border-l-4 mb-6 ${statusClasses}`}>
                <p className="font-medium">状态:</p>
                <p className="mt-1 text-sm">{status.message}</p>
            </div>

            <p className="text-gray-700 dark:text-gray-300 mb-4">
                点击下方按钮将 **{mockSoftwareData.length}** 条模拟软件数据上传到 Firestore 的公共集合
                (`<span className="font-mono text-sm">{PUBLIC_COLLECTION_PATH}</span>`)。
                此操作将清除旧数据。
            </p>

            <button
                onClick={handleUpload}
                disabled={isUploading}
                className="flex items-center justify-center w-full px-6 py-3 border border-transparent text-base font-medium rounded-xl text-white bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 transition-colors shadow-lg"
            >
                {isUploading ? (
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                ) : (
                    <Download className="mr-2 h-5 w-5" />
                )}
                {isUploading ? '正在上传中...' : '上传模拟数据到 Firestore'}
            </button>
            <button
                onClick={onBack}
                className="mt-4 w-full px-6 py-3 text-base font-medium rounded-xl text-gray-700 dark:text-gray-300 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
            >
                返回主页
            </button>
        </div>
    );
};

// --- 5. 主应用 Component ---
const App = () => {
  const [query, setQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("全部");
  const [darkMode, setDarkMode] = useState(false);
  const [isManualToggle, setIsManualToggle] = useState(false);
  const [currentBanner, setCurrentBanner] = useState(0);

  const [allSoftware, setAllSoftware] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isAuthReady, setIsAuthReady] = useState(false); 
  const [view, setView] = useState('main'); // 'main' 或 'admin'

  // 匿名登录 Firebase 以获取读取权限
  useEffect(() => {
    if (!auth) return;

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        try {
          if (initialAuthToken) {
            await signInWithCustomToken(auth, initialAuthToken);
          } else {
            await signInAnonymously(auth);
          }
        } catch (err) {
          console.error("Firebase 登录失败: ", err);
          setError("无法连接到数据库。");
        }
      }
      setIsAuthReady(true); 
    });
    return () => unsubscribe();
  }, []); 

  // 从 Firebase 加载数据
  useEffect(() => {
    if (!isAuthReady || !db) {
      return;
    }

    setIsLoading(true);
    const softwareColRef = collection(db, PUBLIC_COLLECTION_PATH);
    const q = query(softwareColRef);

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const softwareList = snapshot.docs.map(doc => ({ 
        id: doc.id, 
        ...doc.data(),
        // 确保 updatedAt 存在，用于显示
        updatedAt: doc.data().updatedAt || 'N/A'
      }));
      setAllSoftware(softwareList);
      setError(null); 
      setIsLoading(false);
    }, (err) => {
      console.error("Firebase 数据加载失败: ", err);
      setError("加载软件列表失败，请稍后重试或检查数据权限。");
      setIsLoading(false);
    });

    return () => unsubscribe();

  }, [isAuthReady]); 
  
  // 轮播图自动播放
  useEffect(() => {
    const interval = setInterval(
      () => {
        setCurrentBanner((prev) => (prev + 1) % banners.length);
      },
      4000
    );
    return () => clearInterval(interval);
  }, []);

  // 键盘快捷键切换到 Admin
  useEffect(() => {
      const handleKeyDown = (e) => {
          // 仅当用户在非输入状态下按下 'A' 键时切换到 admin 视图
          if (e.key === 'a' || e.key === 'A') {
              // 检查当前是否有输入框获得焦点
              const isTyping = document.activeElement.tagName === 'INPUT' || document.activeElement.tagName === 'TEXTAREA';
              if (!isTyping) {
                  e.preventDefault();
                  setView(prevView => prevView === 'main' ? 'admin' : 'main');
              }
          }
      };

      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
  }, []); // 仅在组件挂载时注册一次

  // 根据系统时间设置暗黑模式
  useEffect(() => {
    if (!isManualToggle) {
      const hour = new Date().getHours();
      const isNight = hour >= 18 || hour < 6;
      setDarkMode(isNight);
    }
  }, [isManualToggle]);

  // 应用暗黑模式到 document.documentElement
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
    setIsManualToggle(true);
  };
  
  // 动态计算分类
  const allCategories = useMemo(() => {
    const categories = new Set(allSoftware.map(s => s.category).filter(Boolean)); 
    return ["全部", ...Array.from(categories)];
  }, [allSoftware]);

  // 动态过滤数据
  const filteredData = useMemo(() => {
    const filteredByQuery = allSoftware.filter(software => {
      const lowerQuery = query.toLowerCase();
      const nameMatch = software.name && software.name.toLowerCase().includes(lowerQuery);
      const descriptionMatch = software.description && software.description.toLowerCase().includes(lowerQuery);
      return nameMatch || descriptionMatch;
    });

    const filteredByCategory = selectedCategory === "全部"
      ? filteredByQuery
      : filteredByQuery.filter(s => s.category === selectedCategory);
    
    const categoriesMap = {};
    filteredByCategory.forEach(s => {
      const categoryName = s.category || '未分类';
      if (!categoriesMap[categoryName]) {
        categoriesMap[categoryName] = [];
      }
      categoriesMap[categoryName].push(s);
    });
    
    if (selectedCategory !== '全部' && categoriesMap[selectedCategory]) {
        categoriesMap[selectedCategory].sort((a, b) => a.name.localeCompare(b.name));
        return { [selectedCategory]: categoriesMap[selectedCategory] };
    }
    
    Object.keys(categoriesMap).forEach(category => {
        categoriesMap[category].sort((a, b) => a.name.localeCompare(b.name));
    });

    return categoriesMap;

  }, [query, selectedCategory, allSoftware]);


  // --- 6. 渲染逻辑 (根据 view 状态切换) ---
  if (view === 'admin') {
      return <AdminPanel onBack={() => setView('main')} />;
  }
  
  // 主应用视图
  return (
    <div className="min-h-screen font-sans transition-colors duration-300 bg-white dark:bg-gray-900">
      {/* 顶部导航 */}
      <div className="flex justify-between items-center p-4 max-w-6xl mx-auto border-b border-gray-200 dark:border-gray-700 sticky top-0 bg-white dark:bg-gray-900 z-10 shadow-sm">
        <h1 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
            Software Downloads 
            <span className="text-xs font-normal text-gray-500 dark:text-gray-400">
                在线技术支持@微信：qq2269404909
            </span>
        </h1>
        <div className="flex items-center space-x-3">
            <button
              onClick={() => setView('admin')}
              className="p-2 rounded-full bg-yellow-100 dark:bg-yellow-700 text-yellow-800 dark:text-white hover:scale-110 transition-transform shadow-md"
              title="切换到管理员面板 (按 'A' 键)"
            >
              <Settings className="w-5 h-5" />
            </button>
            <button
              onClick={toggleDarkMode}
              className="p-2 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-yellow-400 hover:scale-110 transition-transform shadow-md"
              title={darkMode ? "切换到亮色模式" : "切换到暗黑模式"}
            >
              {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
        </div>
      </div>

      {/* 轮播图部分 */}
      <div className="max-w-6xl mx-auto px-4 my-6">
        <div className="relative w-full overflow-hidden rounded-2xl shadow-xl h-48 sm:h-64">
          {banners.map((banner, index) => (
            <img
              key={banner.id}
              src={banner.img}
              alt={`banner-${index}`}
              onError={(e) => { e.target.onerror = null; e.target.src="https://placehold.co/800x256/4c51bf/ffffff?text=Image+Not+Found" }} 
              className={`absolute top-0 left-0 w-full h-full object-cover transition-opacity duration-1000 ease-in-out ${
                index === currentBanner ? 'opacity-100' : 'opacity-0'
              }`}
            />
          ))}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
            {banners.map((_, index) => (
              <span
                key={index}
                className={`w-2 h-2 rounded-full cursor-pointer transition-colors shadow-lg ${
                  currentBanner === index ? "bg-white" : "bg-gray-400/70"
                }`}
                onClick={() => {
                   setCurrentBanner(index);
                }}
              ></span>
            ))}
          </div>
        </div>
      </div>

      {/* 搜索和分类部分 */}
      <div className="max-w-6xl mx-auto px-4 mb-8">
        <div className="flex items-center bg-white dark:bg-gray-800 rounded-xl shadow-lg px-4 py-2 mb-4 border border-gray-200 dark:border-gray-700">
          <Search className="w-5 h-5 text-gray-400 mr-3" />
          <input
            type="text"
            placeholder="搜索软件名称或描述..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full bg-transparent outline-none text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
          />
        </div>
        <div className="flex flex-wrap gap-2 overflow-x-auto pb-2">
          {allCategories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`flex-shrink-0 px-4 py-1.5 rounded-full text-sm font-medium transition-colors shadow-md ${
                selectedCategory === cat
                  ? "bg-blue-600 text-white hover:bg-blue-700"
                  : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* 软件卡片列表 */}
      <div className="max-w-6xl mx-auto px-4 pb-10">
        {isLoading && allSoftware.length === 0 ? (
          <div className="text-center text-gray-500 dark:text-gray-400 p-8 text-xl animate-pulse">
            <Loader2 className="h-12 w-12 mb-4 mx-auto animate-spin text-blue-500" />
            正在努力加载软件列表...
          </div>
        ) : error ? (
          <div className="text-center bg-red-100 dark:bg-red-900 border border-red-400 text-red-700 dark:text-red-300 p-4 rounded-lg m-4">
            <p className="font-bold">加载错误:</p>
            <p>{error}</p>
          </div>
        ) : Object.values(filteredData).flat().length === 0 ? (
          <div className="text-center text-gray-500 dark:text-gray-400 p-8">
            <Search className="w-10 h-10 mx-auto mb-4"/>
            <p className="text-lg">没有找到与“{query}”相关的软件，请尝试其他关键词或切换分类。</p>
          </div>
        ) : (
          Object.entries(filteredData).map(([category, softwares]) => (
            <div key={category} className="mb-8">
              <h2 className="text-2xl font-bold mb-4 pb-2 text-blue-600 dark:text-blue-400 border-b border-gray-200 dark:border-gray-700">
                {category}
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {softwares.map((s) => ( 
                  <div
                    key={s.id} 
                    className="bg-white dark:bg-gray-800 p-5 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-0.5 border border-gray-100 dark:border-gray-700"
                  >
                    <h3 className="text-xl font-bold mb-2 text-gray-900 dark:text-white line-clamp-1">
                      {highlight(s.name, query)}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-3 h-14">
                      {highlight(s.description, query)}
                    </p>
                    <div className="flex items-center justify-between mt-4">
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                           {`更新日期: ${s.updatedAt || 'N/A'}`}
                        </span>
                        <a
                          href={s.downloadUrl}
                          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700 transition-colors shadow-md hover:shadow-lg"
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <Download className="w-4 h-4" />
                          下载
                        </a>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
      </div>
      
      {/* 简单的页脚 */}
      <footer className="max-w-6xl mx-auto px-4 py-4 text-center text-gray-500 dark:text-gray-400 text-sm border-t border-gray-200 dark:border-gray-700">
        <p>&copy; {new Date().getFullYear()} Software Downloads. 按 'A' 键进入管理员面板。</p>
      </footer>
    </div>
  );
};

export default App;
