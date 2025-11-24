import React, { useState, useMemo, useEffect } from "react";
// 确认：所有 Firebase 函数都从本地配置导入
import { 
  db, auth, 
  collection, query, onSnapshot, // Firestore functions
  signInAnonymously, onAuthStateChanged, signInWithCustomToken // Auth functions
} from "./firebaseConfig"; 
import { Sun, Moon, Search, Download } from "lucide-react";

// --- 轮播图图片地址 (保留你的链接) ---
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
    regex.test(part) ? <mark key={i}>{part}</mark> : part
  );
};

// --- Canvas 环境特定代码 ---
const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';

const App = () => {
  const [query, setQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("全部");
  const [darkMode, setDarkMode] = useState(false);
  const [isManualToggle, setIsManualToggle] = useState(false);
  const [currentBanner, setCurrentBanner] = useState(0);

  // --- 新增状态：用于存储从 Firebase 加载的软件 ---
  const [allSoftware, setAllSoftware] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isAuthReady, setIsAuthReady] = useState(false); // Firebase 认证状态
  
  // 匿名登录 Firebase 以获取读取权限
  useEffect(() => {
    // 检查 auth 实例是否可用
    if (!auth) {
        console.error("Firebase Auth instance is not initialized.");
        setError("Firebase Auth instance is not initialized.");
        setIsAuthReady(true); // 避免死循环
        return;
    }
    
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        try {
          // --- Canvas 环境特定代码 ---
          if (typeof __initial_auth_token !== 'undefined') {
            await signInWithCustomToken(auth, __initial_auth_token);
          } else {
            await signInAnonymously(auth);
          }
        } catch (err) {
          console.error("Firebase 匿名登录失败: ", err);
          setError("无法连接到数据库。");
        }
      }
      setIsAuthReady(true);
    });
    return () => unsubscribe();
  }, []);

  // 从 Firebase 加载数据
  useEffect(() => {
    // 必须等待认证完成后才能查询
    if (!isAuthReady || !db) { // 检查 db 实例
      return;
    }

    setIsLoading(true);
    // 确保 collection path 正确
    const softwareColRef = collection(db, `artifacts/${appId}/public/data/software`);
    const q = query(softwareColRef);

    // 使用 onSnapshot 实时更新
    const unsubscribe = onSnapshot(q, (snapshot) => {
      // 确保数据结构正确，特别是 updatedAt 和 downloadUrl 字段
      const softwareList = snapshot.docs.map(doc => ({ 
        id: doc.id, 
        ...doc.data() 
      }));
      setAllSoftware(softwareList);
      setIsLoading(false);
    }, (err) => {
      console.error("Firebase 数据加载失败: ", err);
      setError("加载软件列表失败，请稍后重试。");
      setIsLoading(false);
    });

    // 清理
    return () => unsubscribe();

  }, [isAuthReady]); // 依赖 isAuthReady
  
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

  // 根据系统时间设置暗黑模式
  useEffect(() => {
    if (!isManualToggle) {
      const hour = new Date().getHours();
      const isNight = hour >= 18 || hour < 6;
      setDarkMode(isNight);
    }
  }, [isManualToggle]);

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
    setIsManualToggle(true);
  };
  
  // 动态计算分类 (基于 Firebase 数据)
  const allCategories = useMemo(() => {
    const categories = new Set(allSoftware.map(s => s.category).filter(Boolean)); // 过滤空值
    return ["全部", ...Array.from(categories)];
  }, [allSoftware]);

  // 动态过滤数据 (基于 Firebase 数据)
  const filteredData = useMemo(() => {
    // 按名称或描述过滤
    const filteredByQuery = allSoftware.filter(software => {
      const lowerQuery = query.toLowerCase();
      return (
        software.name && software.name.toLowerCase().includes(lowerQuery) ||
        (software.description && software.description.toLowerCase().includes(lowerQuery))
      );
    });

    // 按分类过滤
    const filteredByCategory = selectedCategory === "全部"
      ? filteredByQuery
      : filteredByQuery.filter(s => s.category === selectedCategory);
    
    // 组合成按分类的对象
    const categoriesMap = {};
    filteredByCategory.forEach(s => {
      const categoryName = s.category || '未分类';
      if (!categoriesMap[categoryName]) {
        categoriesMap[categoryName] = [];
      }
      categoriesMap[categoryName].push(s);
    });
    
    // 如果选择了特定分类，只显示该分类
    if (selectedCategory !== '全部') {
        return { [selectedCategory]: categoriesMap[selectedCategory] || [] };
    }

    return categoriesMap;

  }, [query, selectedCategory, allSoftware]);

  return (
    <div className={darkMode ? "bg-gray-900 text-white min-h-screen font-sans" : "bg-gray-100 text-gray-900 min-h-screen font-sans"}>
      {/* 顶部导航 (保留你的新标题) */}
      <div className="flex justify-between items-center p-4 max-w-6xl mx-auto">
        <h1 className="text-xl font-bold">Software Downloads 在线技术支持@微信：qq2269404909</h1>
        <button
          onClick={toggleDarkMode}
          className="p-2 rounded-full bg-gray-200 dark:bg-gray-700 hover:scale-110 transition-transform"
        >
          {darkMode ? <Sun className="w-5 h-5 text-yellow-400" /> : <Moon className="w-5 h-5 text-gray-800" />}
        </button>
      </div>

      {/* 轮播图部分 */}
      <div className="max-w-6xl mx-auto px-4 mb-6">
        <div className="relative w-full overflow-hidden rounded-2xl shadow-lg h-48 sm:h-64">
          {banners.map((banner, index) => (
            <img
              key={banner.id}
              src={banner.img}
              alt={`banner-${index}`}
              onError={(e) => { e.target.onerror = null; e.target.src="https://placehold.co/800x256/3498db/ffffff?text=Banner+Error" }} // 图片加载失败处理
              className={`absolute top-0 left-0 w-full h-full object-cover transition-opacity duration-1000 ease-in-out ${
                index === currentBanner ? 'opacity-100' : 'opacity-0'
              }`}
            />
          ))}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
            {banners.map((_, index) => (
              <span
                key={index}
                className={`w-2 h-2 rounded-full cursor-pointer transition-colors ${
                  currentBanner === index ? "bg-white" : "bg-gray-400"
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
        <div className="flex items-center bg-white dark:bg-gray-800 rounded-xl shadow-md px-4 py-2 mb-4">
          <Search className="w-5 h-5 text-gray-400 mr-3" />
          <input
            type="text"
            placeholder="搜索软件名称或描述..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full bg-transparent outline-none text-gray-900 dark:text-white"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          {allCategories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                selectedCategory === cat
                  ? "bg-blue-600 text-white"
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
        {isLoading ? (
          <div className="text-center text-gray-500 dark:text-gray-400 p-8">加载软件列表中...</div>
        ) : error ? (
          <div className="text-center text-red-500 p-8">{error}</div>
        ) : Object.values(filteredData).flat().length === 0 ? (
          <div className="text-center text-gray-500 dark:text-gray-400 p-8">
            没有找到与“{query}”相关的软件，请尝试其他关键词。
          </div>
        ) : (
          Object.entries(filteredData).map(([category, softwares]) => (
            <div key={category} className="mb-6">
              <h2 className="text-2xl font-bold mb-4 border-b border-gray-300 dark:border-gray-600 pb-2 text-blue-600">
                {category}
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {softwares.map((s) => ( 
                  <div
                    key={s.id} // 使用 Firebase 文档 ID 作为 key
                    className="bg-white dark:bg-gray-800 p-5 rounded-2xl shadow-md hover:shadow-xl transition-shadow"
                  >
                    <h3 className="text-lg font-semibold mb-1 text-gray-900 dark:text-white">
                      {highlight(s.name, query)}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">
                      {highlight(s.description, query)}
                    </p>
                    <div className="flex items-center justify-between mt-4">
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          {/* 确保 updatedAt 存在且格式正确 */}
                          {`更新日期: ${s.updatedAt || 'N/A'}`}
                        </span>
                        <a
                          href={s.downloadUrl}
                          className="flex items-center gap-2 px-3 py-1.5 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 transition-colors"
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <Download className="w-4 h-4" />
                        </a>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default App;
