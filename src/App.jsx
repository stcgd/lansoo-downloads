// Full App.jsx with device detection + styled visitor bar + Cloudflare-safe IP fetching
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
} from "lucide-react";

// 轮播图素材
const banners = [
  { id: 1, img: "https://img.lansoo.com/file/1756974582770_banner3.png" },
  { id: 2, img: "https://img.lansoo.com/file/1757093612782_image.png" },
  { id: 3, img: "https://img.lansoo.com/file/1756974574144_banner1.png" },
  { id: 4, img: "https://img.lansoo.com/file/1742103223415_PixPin_2025-03-16_13-33-33.png" },
  { id: 5, img: "https://img.lansoo.com/file/1757093478872_image.png" },
];

// 正则转义
const escapeRegExp = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

// 搜索高亮
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

  const [visitorInfo, setVisitorInfo] = useState({
    ip: "",
    country: "",
    city: "",
    device: "",
    time: "",
  });

  // Ripple 注入（只运行一次）
  useEffect(() => {
    document.addEventListener("click", function (e) {
      const target = e.target.closest(".ripple");
      if (!target) return;

      const circle = document.createElement("span");
      const diameter = Math.max(target.clientWidth, target.clientHeight);
      const radius = diameter / 2;

      circle.style.width = circle.style.height = `${diameter}px`;
      circle.style.left = `${e.clientX - target.offsetLeft - radius}px`;
      circle.style.top = `${e.clientY - target.offsetTop - radius}px`;
      circle.classList.add("ripple-effect");

      const ripple = target.getElementsByClassName("ripple-effect")[0];
      if (ripple) ripple.remove();

      target.appendChild(circle);
    });
  }, []);

  // 检测访问设备类型
  useEffect(() => {
    const ua = navigator.userAgent.toLowerCase();
    const isMobile = /mobile|android|iphone|ipad/.test(ua);
    setVisitorInfo((v) => ({ ...v, device: isMobile ? "Mobile" : "PC" }));
  }, []);

  // 时间自动更新
  useEffect(() => {
    const tick = () => {
      const now = new Date().toLocaleString("zh-CN", { hour12: false });
      setVisitorInfo((v) => ({ ...v, time: now }));
    };
    tick();
    const timer = setInterval(tick, 1000);
    return () => clearInterval(timer);
  }, []);

  // Cloudflare 获取 IP + 国家 + 城市
  useEffect(() => {
    const getGeo = async () => {
      try {
        const res = await fetch("/cdn-cgi/trace");
        const text = await res.text();

        const ip = text.match(/ip=(.*)/)?.[1]?.trim() || "";
        const country = text.match(/loc=(.*)/)?.[1]?.trim() || "";

        // 获取城市（Cloudflare 不提供）
        let city = "";
        try {
          const geo = await fetch(`https://ipapi.co/${ip}/json/`).then((r) =>
            r.json()
          );
          city = geo.city || "";
        } catch {}

        setVisitorInfo((v) => ({ ...v, ip, country, city }));
      } catch (e) {
        console.error("获取访客信息失败", e);
      }
    };
    getGeo();
  }, []);

  // 自动轮播
  useEffect(() => {
    const t = setInterval(
      () => setCurrentBanner((n) => (n + 1) % banners.length),
      4000
    );
    return () => clearInterval(t);
  }, []);

  // 自动夜间模式
  useEffect(() => {
    if (isManualToggle) return;
    const hour = new Date().getHours();
    const isNight = hour >= 18 || hour < 6;
    setDarkMode(isNight);
  }, [isManualToggle]);

  const toggleDarkMode = () => {
    setDarkMode((s) => !s);
    setIsManualToggle(true);
  };

  const allCategories = ["全部", ...Object.keys(softwareData)];

  const filterSoftware = (software) => {
    const q = query.toLowerCase();
    return (
      software.name.toLowerCase().includes(q) ||
      software.description.toLowerCase().includes(q)
    );
  };

  const filteredData = useMemo(() => {
    if (selectedCategory === "全部") {
      const all = Object.values(softwareData).flat();
      const f = all.filter(filterSoftware);
      return { 全部: f };
    }
    return {
      [selectedCategory]: (softwareData[selectedCategory] || []).filter(
        filterSoftware
      ),
    };
  }, [query, selectedCategory]);

  return (
    <div
      className={
        darkMode
          ? "bg-gray-900 text-white min-h-screen"
          : "bg-gray-100 text-gray-900 min-h-screen"
      }
    >
      {/* 顶部访客条 */}
      <div
        className={`w-full text-sm py-3 shadow-md transition-colors ${
          darkMode
            ? "bg-gradient-to-r from-gray-800 to-gray-700 text-gray-200 shadow-gray-900"
            : "bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-blue-300"
        }`}
      >
        <div className="max-w-6xl mx-auto px-4 flex flex-wrap justify-between gap-2 items-center">
          <span className="flex items-center gap-1">
            {visitorInfo.device === "Mobile" ? (
              <Smartphone className="w-4 h-4" />
            ) : (
              <Monitor className="w-4 h-4" />
            )}
            {visitorInfo.device}
          </span>

          <span className="flex items-center gap-1">
            <Globe className="w-4 h-4" />
            {visitorInfo.ip || "加载中..."}
          </span>

          <span className="flex items-center gap-1">
            <MapPin className="w-4 h-4" />
            {visitorInfo.country || "未知"} {visitorInfo.city || ""}
          </span>

          <span>⏱ {visitorInfo.time}</span>
        </div>
      </div>

      {/* 顶部标题 */}
      <div className="flex justify-between items-center p-4 max-w-6xl mx-auto">
        <h1 className="text-xl font-bold">
          Software Downloads 在线技术支持@微信：qq2269404909
        </h1>
        <button
          onClick={toggleDarkMode}
          className="p-2 ripple rounded-full bg-gray-200 dark:bg-gray-700 hover:scale-110 transition-transform"
        >
          {darkMode ? (
            <Sun className="w-5 h-5 text-yellow-400" />
          ) : (
            <Moon className="w-5 h-5 text-gray-800" />
          )}
        </button>
      </div>

      {/* 轮播图 */}
      <div className="max-w-6xl mx-auto px-4 mb-6">
        <div className="relative w-full overflow-hidden rounded-2xl shadow-lg h-48 sm:h-64">
          {banners.map((b, i) => (
            <img
              key={b.id}
              src={b.img}
              alt=""
              className={`absolute top-0 left-0 w-full h-full object-cover transition-opacity duration-1000 ${
                i === currentBanner ? "opacity-100" : "opacity-0"
              }`}
            />
          ))}

          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
            {banners.map((_, i) => (
              <span
                key={i}
                className={`w-2 h-2 rounded-full cursor-pointer ${
                  currentBanner === i ? "bg-white" : "bg-gray-400"
                }`}
                onClick={() => setCurrentBanner(i)}
              ></span>
            ))}
          </div>
        </div>
      </div>

      {/* 搜索框 + 分类 */}
      <div className="max-w-6xl mx-auto px-4 mb-8">
        <div className="flex items-center bg-white dark:bg-gray-800 rounded-xl shadow-md px-4 py-2 mb-4">
          <Search className="w-5 h-5 text-gray-400 mr-3" />
          <input
            type="text"
            placeholder="搜索软件名称或描述..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full bg-transparent outline-none"
          />
        </div>

        <div className="flex flex-wrap gap-2">
          {allCategories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-1.5 ripple rounded-full text-sm font-medium ${
                selectedCategory === cat
                  ? "bg-blue-600 text-white"
                  : "bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* 软件列表 */}
      <div className="max-w-6xl mx-auto px-4 pb-10">
        {Object.values(filteredData).flat().length === 0 ? (
          <div className="text-center text-gray-500 dark:text-gray-400 p-8">
            没有找到与“{query}”相关的软件，请尝试其他关键词。
          </div>
        ) : (
          Object.entries(filteredData).map(([category, softwares]) => (
            <div key={category}>
              <h2 className="text-2xl font-bold mb-4 border-b pb-2 text-blue-600">
                {category}
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {softwares.map((s, i) => (
                  <div
                    key={i}
                    className="bg-white dark:bg-gray-800 p-5 rounded-2xl shadow-md hover:shadow-xl transition hover:shake"
                  >
                    <h3 className="text-lg font-semibold mb-1 text-gray-900 dark:text-gray-100">
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
                        className="flex ripple items-center gap-2 px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
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
