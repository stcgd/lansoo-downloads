// App.jsx
import React, { useState, useMemo, useEffect } from "react";
import softwareData from "./data/software.json";
import { Sun, Moon, Search, Download, Smartphone, Monitor, Globe, MapPin } from "lucide-react";

const banners = [
  { id: 1, img: "https://img.lansoo.com/file/1756974582770_banner3.png" },
  { id: 2, img: "https://img.lansoo.com/file/1757093612782_image.png" },
  { id: 3, img: "https://img.lansoo.com/file/1756974574144_banner1.png" },
  { id: 4, img: "https://img.lansoo.com/file/1742103223415_PixPin_2025-03-16_13-33-33.png" },
  { id: 5, img: "https://img.lansoo.com/file/1757093478872_image.png" },
];

const escapeRegExp = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

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

  // 设备检测
  useEffect(() => {
    const ua = navigator.userAgent.toLowerCase();
    const isMobile = /mobile|android|iphone|ipad/.test(ua);
    setVisitorInfo(v => ({ ...v, device: isMobile ? "Mobile" : "PC" }));
  }, []);

  // 实时时间
  useEffect(() => {
    const tick = () => {
      const now = new Date().toLocaleString("zh-CN", { hour12: false });
      setVisitorInfo(v => ({ ...v, time: now }));
    };
    tick();
    const timer = setInterval(tick, 1000);
    return () => clearInterval(timer);
  }, []);

  // Cloudflare IP + 国家
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
      } catch {}
    };
    getGeo();
  }, []);

  // 自动轮播
  useEffect(() => {
    const t = setInterval(() => setCurrentBanner(n => (n + 1) % banners.length), 4000);
    return () => clearInterval(t);
  }, []);

  // 系统暗黑模式
  useEffect(() => {
    if (!isManualToggle) {
      const hour = new Date().getHours();
      setDarkMode(hour >= 18 || hour < 6);
    }
  }, [isManualToggle]);

  const toggleDarkMode = () => {
    setDarkMode(s => !s);
    setIsManualToggle(true);
  };

  const allCategories = ["全部", ...Object.keys(softwareData)];
  const filterSoftware = software => software.name.toLowerCase().includes(query.toLowerCase()) || software.description.toLowerCase().includes(query.toLowerCase());
  const filteredData = useMemo(() => {
    if (selectedCategory === "全部") {
      const all = Object.values(softwareData).flat();
      return { 全部: all.filter(filterSoftware) };
    }
    return { [selectedCategory]: (softwareData[selectedCategory] || []).filter(filterSoftware) };
  }, [query, selectedCategory]);

  return (
    <div className={darkMode ? "bg-gray-900 text-white min-h-screen" : "bg-gray-100 text-gray-900 min-h-screen"}>
      {/* 访客条 */}
      <div className={`visitor-bar ${darkMode ? 'bg-dark' : 'bg-light'}`}>
        <span>{visitorInfo.device === 'Mobile' ? <Smartphone className="w-4 h-4" /> : <Monitor className="w-4 h-4" />}{visitorInfo.device}</span>
        <span><Globe className="w-4 h-4" /> {visitorInfo.ip || '加载中...'}</span>
        <span><MapPin className="w-4 h-4" /> {visitorInfo.country || '未知'} {visitorInfo.city || ''}</span>
        <span>⏱ {visitorInfo.time}</span>
      </div>

      {/* 顶部导航 */}
      <div className="header max-w-6xl mx-auto">
        <h1 className="text-xl font-bold">Software Downloads 在线技术支持@微信：qq2269404909</h1>
        <button onClick={toggleDarkMode} className="p-2 rounded-full bg-gray-200 dark:bg-gray-700">
          {darkMode ? <Sun className="w-5 h-5 text-yellow-400" /> : <Moon className="w-5 h-5 text-gray-800" />}
        </button>
      </div>

      {/* 轮播图 */}
      <div className="max-w-6xl mx-auto px-4 mb-6 relative h-48 sm:h-64 overflow-hidden rounded-2xl shadow-lg">
        {banners.map((b,i) => <img key={b.id} src={b.img} alt="" className={`absolute top-0 left-0 w-full h-full object-cover transition-opacity duration-1000 ${i===currentBanner?'opacity-100':'opacity-0'}`} />)}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
          {banners.map((_,i) => <span key={i} className={`w-2 h-2 rounded-full ${currentBanner===i?'bg-white':'bg-gray-400'}`} onClick={()=>setCurrentBanner(i)}></span>)}
        </div>
      </div>

      {/* 搜索分类 */}
      <div className="max-w-6xl mx-auto px-4 mb-8">
        <div className="flex items-center bg-white dark:bg-gray-800 rounded-xl shadow-md px-4 py-2 mb-4">
          <Search className="w-5 h-5 text-gray-400 mr-3"/>
          <input type="text" placeholder="搜索软件名称或描述..." value={query} onChange={(e)=>setQuery(e.target.value)} className="w-full bg-transparent outline-none"/>
        </div>
        <div className="flex flex-wrap gap-2">
          {allCategories.map(cat => <button key={cat} onClick={()=>setSelectedCategory(cat)} className={`category-btn ${selectedCategory===cat?'active':''}`}>{cat}</button>)}
        </div>
      </div>

      {/* 软件列表 */}
      <div className="max-w-6xl mx-auto px-4 pb-10">
        {Object.values(filteredData).flat().length===0 ? (
          <div className="text-center text-gray-500 dark:text-gray-400 p-8">没有找到与“{query}”相关的软件，请尝试其他关键词。</div>
        ) : (
          Object.entries(filteredData).map(([category, softwares]) => (
            <div key={category}>
              <h2 className="text-2xl font-bold mb-4 border-b pb-2 text-blue-600">{category}</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {softwares.map((s,i)=>(
                  <div key={i} className={`card ${darkMode?'dark':''}`}>
                    <h3 className="text-lg font-semibold mb-1">{highlight(s.name, query)}</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">{highlight(s.description, query)}</p>
                    <div className="flex items-center justify-between mt-4">
                      <span className="text-xs text-gray-500">更新日期: {s.updatedAt}</span>
                      <a href={s.downloadUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                        <Download className="w-4 h-4"/>
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
