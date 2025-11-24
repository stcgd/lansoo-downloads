import React, { useState, useMemo, useEffect } from "react";
// --- 1. 从 Firebase 导入 ---
// 确保从 ./firebaseConfig 导入 db, auth, 和 initialAuthToken
import { db, auth, initialAuthToken } from "./firebaseConfig"; 
import { collection, query, onSnapshot } from "firebase/firestore";
import { signInAnonymously, onAuthStateChanged, signInWithCustomToken } from "firebase/auth";
import { Sun, Moon, Search, Download } from "lucide-react";

// --- 2. 轮播图图片地址 (保留你的链接) ---
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

// --- Canvas 环境特定代码 ---
const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';

const App = () => {
  const [query, setQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("全部");
  const [darkMode, setDarkMode] = useState(false);
  const [isManualToggle, setIsManualToggle] = useState(false);
  const [currentBanner, setCurrentBanner] = useState(0);

  // --- 3. 新增状态：用于存储从 Firebase 加载的软件 ---
  const [allSoftware, setAllSoftware] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isAuthReady, setIsAuthReady] = useState(false); // Firebase 认证状态
  
  // 4. 匿名登录 Firebase 以获取读取权限
  useEffect(() => {
    // 确保 auth 实例已准备好 (在 firebaseConfig.js 中初始化)
    if (!auth) return;

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      // 检查是否已经登录（匿名或通过 CustomToken）
      if (!user) {
        try {
          // --- Canvas 环境特定代码：使用 CustomToken 登录 ---
          if (initialAuthToken) {
            await signInWithCustomToken(auth, initialAuthToken);
          } else {
            // 如果没有 CustomToken，则使用匿名登录
            await signInAnonymously(auth);
          }
        } catch (err) {
          console.error("Firebase 登录失败: ", err);
          setError("无法连接到数据库。");
        }
      }
      setIsAuthReady(true); // 无论成功与否，都标记认证流程已完成
    });
    return () => unsubscribe();
  }, []); // 仅在组件挂载时运行一次

  // 5. 从 Firebase 加载数据
  useEffect(() => {
    // 必须等待认证完成后才能查询
    if (!isAuthReady || !db) {
      return;
    }

    setIsLoading(true);
    // 使用公共数据路径
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
      setError(null); // 清除之前的错误
      setIsLoading(false);
    }, (err) => {
      console.error("Firebase 数据加载失败: ", err);
      setError("加载软件列表失败，请稍后重试或检查数据权限。");
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
  
  // 6. 动态计算分类 (基于 Firebase 数据)
  const allCategories = useMemo(() => {
    const categories = new Set(allSoftware.map(s => s.category).filter(Boolean)); // 过滤空值
    return ["全部", ...Array.from(categories)];
  }, [allSoftware]);

  // 7. 动态过滤数据 (基于 Firebase 数据)
  const filteredData = useMemo(() => {
    // 按名称或描述过滤
    const filteredByQuery = allSoftware.filter(software => {
      const lowerQuery = query.toLowerCase();
      // 检查 name 和 description 是否存在，防止报错
      const nameMatch = software.name && software.name.toLowerCase().includes(lowerQuery);
      const descriptionMatch = software.description && software.description.toLowerCase().includes(lowerQuery);
      return nameMatch || descriptionMatch;
    });

    // 按分类过滤
    const filteredByCategory = selectedCategory === "全部"
      ? filteredByQuery
      : filteredByQuery.filter(s => s.category === selectedCategory);
    
    // 组合成按分类的对象，并对每个分类内的软件按名称排序
    const categoriesMap = {};
    filteredByCategory.forEach(s => {
      const categoryName = s.category || '未分类';
      if (!categoriesMap[categoryName]) {
        categoriesMap[categoryName] = [];
      }
      categoriesMap[categoryName].push(s);
    });
    
    // 如果选择了特定分类，只返回该分类
    if (selectedCategory !== '全部' && categoriesMap[selectedCategory]) {
        // 对该分类内的软件进行排序
        categoriesMap[selectedCategory].sort((a, b) => a.name.localeCompare(b.name));
        return { [selectedCategory]: categoriesMap[selectedCategory] };
    }
    
    // 对所有分类进行排序
    Object.keys(categoriesMap).forEach(category => {
        categoriesMap[category].sort((a, b) => a.name.localeCompare(b.name));
    });

    return categoriesMap;

  }, [query, selectedCategory, allSoftware]);

  return (
    <div className="min-h-screen font-sans transition-colors duration-300">
      {/* 顶部导航 */}
      <div className="flex justify-between items-center p-4 max-w-6xl mx-auto border-b border-gray-200 dark:border-gray-700 sticky top-0 bg-white dark:bg-gray-900 z-10 shadow-sm">
        <h1 className="text-xl font-bold text-gray-900 dark:text-white">Software Downloads 在线技术支持@微信：qq2269404909</h1>
        <button
          onClick={toggleDarkMode}
          className="p-2 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-yellow-400 hover:scale-110 transition-transform shadow-md"
          title={darkMode ? "切换到亮色模式" : "切换到暗黑模式"}
        >
          {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
        </button>
      </div>

      {/* 轮播图部分 */}
      <div className="max-w-6xl mx-auto px-4 my-6">
        <div className="relative w-full overflow-hidden rounded-2xl shadow-xl h-48 sm:h-64">
          {banners.map((banner, index) => (
            <img
              key={banner.id}
              src={banner.img}
              alt={`banner-${index}`}
              onError={(e) => { e.target.onerror = null; e.target.src="https://placehold.co/800x256/4c51bf/ffffff?text=Image+Not+Found" }} // 图片加载失败处理
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
            <div className="loader ease-linear rounded-full border-4 border-t-4 border-gray-200 dark:border-gray-700 h-12 w-12 mb-4 mx-auto"></div>
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
              <h2 className="text-2xl font-bold mb-4 pb-2 text-blue-600 dark:text-blue-400">
                {category}
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {softwares.map((s) => ( 
                  <div
                    key={s.id} // 使用 Firebase 文档 ID 作为 key
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
        <p>&copy; {new Date().getFullYear()} Software Downloads. 技术支持信息如上所示。</p>
      </footer>
    </div>
  );
};

export default App;
