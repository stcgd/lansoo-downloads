import React, { useState, useMemo, useEffect } from "react";
import softwareData from "./data/software.json";
import { Sun, Moon, Search, Download } from "lucide-react";

// 轮播图图片地址
const banners = [
  { id: 1, img: "https://pic.imgdb.cn/item/66d14a9ed9c307b7e9c2141f.jpg" },
  { id: 2, img: "https://pic.imgdb.cn/item/66d14aa4d9c307b7e9c21a30.jpg" },
  { id: 3, img: "https://pic.imgdb.cn/item/66d14aa8d9c307b7e9c21eeb.jpg" },
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

const App = () => {
  const [query, setQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("全部");
  const [darkMode, setDarkMode] = useState(false);
  const [isManualToggle, setIsManualToggle] = useState(false);
  const [currentBanner, setCurrentBanner] = useState(0);

  // 轮播图自动播放
  useEffect(() => {
    const interval = setInterval(
      () => setCurrentBanner((prev) => (prev + 1) % banners.length),
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

  const allCategories = ["全部", ...Object.keys(softwareData)];

  const filterSoftware = (software) => {
    const lowerQuery = query.toLowerCase();
    return (
      software.name.toLowerCase().includes(lowerQuery) ||
      software.description.toLowerCase().includes(lowerQuery)
    );
  };

  const filteredData = useMemo(() => {
    if (selectedCategory === "全部") {
      const allSoftware = Object.values(softwareData).flat();
      const filtered = allSoftware.filter(filterSoftware);
      return { 全部: filtered };
    } else {
      const categorySoftwares = softwareData[selectedCategory] || [];
      const filtered = categorySoftwares.filter(filterSoftware);
      return { [selectedCategory]: filtered };
    }
  }, [query, selectedCategory]);

  return (
    <div className={darkMode ? "bg-gray-900 text-white min-h-screen font-sans" : "bg-gray-100 text-gray-900 min-h-screen font-sans"}>
      {/* 顶部导航 */}
      <div className="flex justify-between items-center p-4 max-w-6xl mx-auto">
        <h1 className="text-xl font-bold">软件下载导航</h1>
        <button
          onClick={toggleDarkMode}
          className="p-2 rounded-full bg-gray-200 dark:bg-gray-700 hover:scale-110 transition-transform"
        >
          {darkMode ? <Sun className="w-5 h-5 text-yellow-400" /> : <Moon className="w-5 h-5 text-gray-800" />}
        </button>
      </div>

      {/* 轮播图部分 */}
      <div className="max-w-6xl mx-auto px-4 mb-6">
        <div className="relative w-full overflow-hidden rounded-2xl shadow-lg">
          <div
            className="flex transition-transform duration-500 ease-in-out"
            style={{ transform: `translateX(-${currentBanner * 100}%)` }}
          >
            {banners.map((banner) => (
              <img
                key={banner.id}
                src={banner.img}
                alt="banner"
                className="w-full flex-shrink-0 h-48 sm:h-64 object-cover"
              />
            ))}
          </div>
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
            {banners.map((_, index) => (
              <span
                key={index}
                className={`w-2 h-2 rounded-full cursor-pointer transition-colors ${
                  currentBanner === index ? "bg-white" : "bg-gray-400"
                }`}
                onClick={() => setCurrentBanner(index)}
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
        {Object.values(filteredData).flat().length === 0 ? (
          <div className="text-center text-gray-500 dark:text-gray-400 p-8">
            没有找到与“{query}”相关的软件，请尝试其他关键词。
          </div>
        ) : (
          Object.entries(filteredData).map(([category, softwares]) => (
            <div key={category} className="mb-6">
              {/* 直接在 h2 上应用颜色类，确保在暗黑模式下显示为白色 */}
              <h2 className="text-2xl font-bold mb-4 border-b border-gray-300 dark:border-gray-600 pb-2 text-gray-900 dark:text-white">
                {category}
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {softwares.map((s, idx) => (
                  <div
                    key={idx}
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
                          {`更新日期: ${s.updatedAt}`}
                        </span>
                        <a
                          href={s.downloadUrl}
                          className="flex items-center gap-2 px-3 py-1.5 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 transition-colors"
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <Download className="w-4 h-4" /> 下载
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
