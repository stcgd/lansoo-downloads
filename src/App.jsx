import React, { useState, useEffect } from "react";
import { Sun, Moon, Search, Download } from "lucide-react";

// 轮播图：换成你之前代码里的外部地址
const banners = [
  { id: 1, img: "https://pic.imgdb.cn/item/66d14a9ed9c307b7e9c2141f.jpg" },
  { id: 2, img: "https://pic.imgdb.cn/item/66d14aa4d9c307b7e9c21a30.jpg" },
  { id: 3, img: "https://pic.imgdb.cn/item/66d14aa8d9c307b7e9c21eeb.jpg" },
];

// 软件数据
const softwareData = [
  { id: 1, name: "Design Tool", desc: "Comi scuwention droon", category: "Design" },
  { id: 2, name: "Sottwe Name", desc: "Comi sie gamion gem", category: "Games" },
  { id: 3, name: "Cilly Sotware", desc: "Comi scuciention enlom peore", category: "Productivity" },
  { id: 4, name: "Cutre Sotwam", desc: "Comi scuiel tion tux", category: "Design" },
  { id: 5, name: "Fottowation", desc: "Comi scietstation derm", category: "Productivity" },
  { id: 6, name: "Colcr.Ham", desc: "Comi scuerastion dem", category: "Design" },
];

// 正则转义
const escapeRegExp = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

// 搜索高亮
const highlight = (text, query) => {
  if (!query) return text;
  const regex = new RegExp(`(${escapeRegExp(query)})`, "gi");
  const parts = text.split(regex);
  return parts.map((part, i) =>
    regex.test(part) ? <mark key={i}>{part}</mark> : part
  );
};

export default function App() {
  const [dark, setDark] = useState(false);
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const [currentBanner, setCurrentBanner] = useState(0);

  // 自动轮播
  useEffect(() => {
    const interval = setInterval(
      () => setCurrentBanner((prev) => (prev + 1) % banners.length),
      4000
    );
    return () => clearInterval(interval);
  }, []);

  // 过滤数据
  const filtered = softwareData.filter(
    (s) =>
      (activeCategory === "All" || s.category === activeCategory) &&
      (s.name.toLowerCase().includes(search.toLowerCase()) ||
        s.desc.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className={dark ? "dark" : ""}>
      {/* 顶部 */}
      <div className="flex justify-between items-center p-4 max-w-6xl mx-auto">
        <h1 className="text-xl font-bold">Software Downloads</h1>
        <button
          onClick={() => setDark(!dark)}
          className="p-2 rounded-full bg-gray-200 dark:bg-gray-700"
        >
          {dark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
        </button>
      </div>

      {/* 轮播 */}
      <div className="max-w-6xl mx-auto px-4 mb-6">
        <img
          src={banners[currentBanner].img}
          alt="banner"
          className="rounded-2xl shadow-md w-full h-64 object-cover"
        />
      </div>

      {/* 搜索 + 分类 */}
      <div className="max-w-6xl mx-auto px-4 mb-8">
        <div className="flex items-center bg-white dark:bg-gray-800 rounded-xl shadow-md px-3 py-2 mb-4">
          <Search className="w-5 h-5 text-gray-400 mr-2" />
          <input
            type="text"
            placeholder="Search software..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-transparent outline-none"
          />
        </div>
        <div className="flex gap-2">
          {["All", "Design", "Games", "Productivity"].map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium ${
                activeCategory === cat
                  ? "bg-blue-600 text-white"
                  : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* 软件卡片 */}
      <div className="max-w-6xl mx-auto px-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 pb-10">
        {filtered.map((s) => (
          <div
            key={s.id}
            className="bg-white dark:bg-gray-800 p-5 rounded-2xl shadow hover:shadow-xl transition"
          >
            <h3 className="text-lg font-semibold mb-1">
              {highlight(s.name, search)}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">
              {highlight(s.desc, search)}
            </p>
            <button className="flex items-center gap-2 px-3 py-1.5 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700">
              <Download className="w-4 h-4" /> Download
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
