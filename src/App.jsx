// Final App.jsx (with ranking + footer + night-mode fixes)
// ————————————————————————————————————————————————

import React, { useState, useMemo, useEffect } from "react";
import softwareData from "./data/software.json";
import {
  Sun,
  Moon,
  Search,
  Download,
  Smartphone,
  Monitor,
  MapPin,
  Globe,
  Github,
  Cloud,
} from "lucide-react";

// 简单 Google 图标（Lucide 没有内置）
const GoogleIcon = () => (
  <span className="font-bold text-lg" style={{ fontFamily: "Arial" }}>G</span>
);

// ========== 轮播图 ==========
const banners = [
  { id: 1, img: "https://img.lansoo.com/file/1756974582770_banner3.png" },
  { id: 2, img: "https://img.lansoo.com/file/1757093612782_image.png" },
  { id: 3, img: "https://img.lansoo.com/file/1756974574144_banner1.png" },
  { id: 4, img: "https://img.lansoo.com/file/1742103223415_PixPin_2025-03-16_13-33-33.png" },
  { id: 5, img: "https://img.lansoo.com/file/1757093478872_image.png" },
];

// 高亮
const escapeRegExp = s => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const highlight = (text, query) => {
  if (!query) return text;
  const regex = new RegExp(`(${escapeRegExp(query)})`, "gi");
  return text.split(regex).map((part, i) =>
    regex.test(part) ? <mark key={i}>{part}</mark> : part
  );
};

const App = () => {
  const [query, setQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("全部");
  const [darkMode, setDarkMode] = useState(false);
  const [isManualToggle, setIsManualToggle] = useState(false);
  const [currentBanner, setCurrentBanner] = useState(0);
  const [rankingMode, setRankingMode] = useState(""); // "" | "hot" | "download"

  const [visitorInfo, setVisitorInfo] = useState({
    ip: "",
    country: "",
    city: "",
    device: "",
    time: "",
  });

  // 检测设备类型
  useEffect(() => {
    const ua = navigator.userAgent.toLowerCase();
    const isMobile = /mobile|android|iphone|ipad/.test(ua);
    setVisitorInfo(v => ({ ...v, device: isMobile ? "Mobile" : "PC" }));
  }, []);

  // 自动更新时间
  useEffect(() => {
    const tick = () => {
      const now = new Date().toLocaleString("zh-CN", { hour12: false });
      setVisitorInfo(v => ({ ...v, time: now }));
    };
    tick();
    const t = setInterval(tick, 1000);
    return () => clearInterval(t);
  }, []);

  // Cloudflare 访客信息
  useEffect(() => {
    const getGeo = async () => {
      try {
        const res = await fetch("/cdn-cgi/trace");
        const text = await res.text();
        const ip = text.match(/ip=(.*)/)?.[1]?.trim() || "";
        const country = text.match(/loc=(.*)/)?.[1]?.trim() || "";
        let city = "";

        try {
          const geo = await fetch(`https://ipapi.co/${ip}/json/`).then(r => r.json());
          city = geo.city || "";
        } catch {}

        setVisitorInfo(v => ({ ...v, ip, country, city }));
      } catch (e) {
        console.log("访客信息获取失败:", e);
      }
    };
    getGeo();
  }, []);

  // 轮播图自动切换
  useEffect(() => {
    const t = setInterval(() => {
      setCurrentBanner(n => (n + 1) % banners.length);
    }, 4000);
    return () => clearInterval(t);
  }, []);

  // 自动 Dark 模式
  useEffect(() => {
    if (isManualToggle) return;
    const hour = new Date().getHours();
    const isNight = hour >= 18 || hour < 6;
    setDarkMode(isNight);
  }, [isManualToggle]);

  const toggleDark = () => {
    setIsManualToggle(true);
    setDarkMode(v => !v);
  };

  const allCategories = ["全部", ...Object.keys(softwareData)];

  const filterSoftware = s => {
    const q = query.toLowerCase();
    return (
      s.name.toLowerCase().includes(q) ||
      s.description.toLowerCase().includes(q)
    );
  };

  // ========== 排行榜模式 ==========
  const allSoft = Object.values(softwareData).flat();

  const hotRank = [...allSoft]
    .map(s => ({ ...s, hot: s.hot || 0 }))
    .sort((a, b) => b.hot - a.hot);

  const downloadRank = [...allSoft]
    .map(s => ({ ...s, downloadCount: s.downloadCount || 0 }))
    .sort((a, b) => b.downloadCount - a.downloadCount);

  // ========== 正常分类过滤 ==========
  const filteredData = useMemo(() => {
    if (selectedCategory === "全部") {
      const all = Object.entries(softwareData).map(([cat, list]) => ({
        cat,
        list: list.filter(filterSoftware),
      }));
      return all;
    }

    return [{
      cat: selectedCategory,
      list: softwareData[selectedCategory].filter(filterSoftware),
    }];
  }, [query, selectedCategory]);

  // =============== 页面 ===============
  return (
    <div className={darkMode ? "bg-gray-900 text-white min-h-screen" : "bg-gray-100 text-gray-900 min-h-screen"}>

      {/* 访客条 */}
      <div className={`w-full text-sm py-3 shadow-md transition-colors ${
        darkMode
          ? "bg-gradient-to-r from-gray-800 to-gray-700 text-gray-200"
          : "bg-gradient-to-r from-blue-600 to-blue-500 text-white"
      }`}>
        <div className="max-w-6xl mx-auto px-4 flex flex-wrap justify-between gap-2 items-center">
          <span className="flex items-center gap-1">
            {visitorInfo.device === "Mobile" ? <Smartphone className="w-4 h-4" /> : <Monitor className="w-4 h-4" />}
            {visitorInfo.device}
          </span>

          <span className="flex items-center gap-1">
            <Globe className="w-4 h-4" />
            {visitorInfo.ip || "加载中..."}
          </span>

          <span className="flex items-center gap-1">
            <MapPin className="w-4 h-4" />
            {visitorInfo.country || "未知"} {visitorInfo.city}
          </span>

          <span>⏱ {visitorInfo.time}</span>
        </div>
      </div>

      {/* 顶部导航 */}
      <div className="flex justify-between items-center p-4 max-w-6xl mx-auto">
        <h1 className="text-xl font-bold">Software Downloads 在线技术支持@微信：qq2269404909</h1>
        <button onClick={toggleDark} className="p-2 rounded-full bg-gray-200 dark:bg-gray-700">
          {darkMode ? <Sun className="w-5 h-5 text-yellow-400" /> : <Moon className="w-5 h-5" />}
        </button>
      </div>

      {/* 轮播图 */}
      <div className="max-w-6xl mx-auto px-4 mb-6">
        <div className="relative w-full overflow-hidden rounded-2xl shadow-lg h-48 sm:h-64">
          {banners.map((b, i) => (
            <img
              key={b.id}
              src={b.img}
              className={`absolute top-0 left-0 w-full h-full object-cover transition-opacity duration-1000 ${
                i === currentBanner ? "opacity-100" : "opacity-0"
              }`}
            />
          ))}
        </div>
      </div>

      {/* 搜索框 */}
      <div className="max-w-6xl mx-auto px-4 mb-4">
        <div className={`flex items-center rounded-xl shadow-md px-4 py-2 mb-4 ${
          darkMode ? "bg-gray-800 text-white" : "bg-white text-gray-900"
        }`}>
          <Search className="w-5 h-5 text-gray-400 mr-3" />
          <input
            type="text"
            placeholder="搜索软件名称或描述..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full bg-transparent outline-none"
          />
        </div>
      </div>

      {/* 排行榜按钮 */}
      <div className="max-w-6xl mx-auto px-4 mb-4 flex gap-3">
        <button
          onClick={() => setRankingMode(rankingMode === "hot" ? "" : "hot")}
          className={`px-4 py-2 rounded-lg ${
            rankingMode === "hot" ? "bg-red-500 text-white" : "bg-gray-300 dark:bg-gray-700"
          }`}
        >
          热度排行榜
        </button>

        <button
          onClick={() => setRankingMode(rankingMode === "download" ? "" : "download")}
          className={`px-4 py-2 rounded-lg ${
            rankingMode === "download" ? "bg-green-500 text-white" : "bg-gray-300 dark:bg-gray-700"
          }`}
        >
          下载排行榜
        </button>
      </div>

      {/* 分类按钮 */}
      {!rankingMode && (
        <div className="max-w-6xl mx-auto px-4 mb-6 flex flex-wrap gap-2">
          {allCategories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium ${
                selectedCategory === cat
                  ? "bg-blue-600 text-white"
                  : "bg-gray-200 dark:bg-gray-700"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      )}

      {/* ========== 排行榜卡片显示 ========== */}
      {rankingMode && (
        <div className="max-w-6xl mx-auto px-4 pb-10">
          <h2 className="text-2xl font-bold mb-4">
            {rankingMode === "hot" ? "🔥 热度排行" : "⬇ 下载排行"}
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {(rankingMode === "hot" ? hotRank : downloadRank).map((s, i) => (
              <div key={i} className="bg-white dark:bg-gray-800 p-5 rounded-2xl shadow-md">
                <h3 className="text-lg font-semibold mb-1">{s.name}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">
                  {s.description}
                </p>

                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-500">
                    {rankingMode === "hot" ? `热度: ${s.hot || 0}` : `下载量: ${s.downloadCount || 0}`}
                  </span>

                  <a
                    href={s.downloadUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-1.5 bg-blue-600 text-white rounded-lg flex items-center"
                  >
                    <Download className="w-4 h-4" />
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========== 正常分类显示（含“全部”瀑布分类标题） ========== */}
      {!rankingMode && (
        <div className="max-w-6xl mx-auto px-4 pb-10">
          {filteredData.map(block => (
            <div key={block.cat} className="mb-10">
              <h2 className="text-2xl font-bold mb-4 border-b pb-2 text-blue-600">
                {block.cat}
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {block.list.map((s, i) => (
                  <div
                    key={i}
                    className="bg-white dark:bg-gray-800 p-5 rounded-2xl shadow-md"
                  >
                    <h3 className="text-lg font-semibold mb-1">
                      {highlight(s.name, query)}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">
                      {highlight(s.description, query)}
                    </p>

                    <div className="flex items-center justify-between mt-4">
                      <span className="text-xs text-gray-500">
                        更新日期: {s.updatedAt}
                      </span>
                      <a
                        href={s.downloadUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 px-3 py-1.5 bg-blue-600 text-white rounded-lg"
                      >
                        <Download className="w-4 h-4" />
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ========== 底部版权栏 ========== */}
      <footer className="py-6 text-center border-t border-gray-300 dark:border-gray-700 mt-10">
        <p className="mb-3">
          © 2025 Lansoo 远程技术支持
        </p>
        <div className="flex justify-center gap-6 text-lg">
          <Github className="cursor-pointer" />
          <GoogleIcon />
          <Cloud className="cursor-pointer" />
        </div>
      </footer>

    </div>
  );
};

export default App;
