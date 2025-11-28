import React, { useState, useEffect } from 'react';
import softwareData from './data/software.json';
import { Sun, Moon, Search, Download, Smartphone, Monitor, MapPin, Globe } from 'lucide-react';

const App = () => {
  const [darkMode, setDarkMode] = useState(false);
  const [visitorInfo, setVisitorInfo] = useState({ device:'', ip:'', country:'', city:'', time:'' });
  const [query, setQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('全部');

  // 设备检测
  useEffect(()=>{
    const ua = navigator.userAgent.toLowerCase();
    const isMobile = /mobile|android|iphone|ipad/.test(ua);
    setVisitorInfo(v => ({ ...v, device: isMobile?'Mobile':'PC' }));
  },[]);

  // 实时时间
  useEffect(()=>{
    const tick = ()=>setVisitorInfo(v => ({...v,time:new Date().toLocaleString()}));
    tick();
    const t = setInterval(tick,1000);
    return ()=>clearInterval(t);
  },[]);

  // Cloudflare IP
  useEffect(()=>{
    fetch('/cdn-cgi/trace').then(r=>r.text()).then(text=>{
      const ip = text.match(/ip=(.*)/)?.[1]||'';
      const country = text.match(/loc=(.*)/)?.[1]||'';
      setVisitorInfo(v=>({...v, ip, country}));
    });
  },[]);

  // dark mode自动切换
  useEffect(()=>{
    const hour = new Date().getHours();
    setDarkMode(hour>=18 || hour<6);
    document.body.classList.toggle('dark', hour>=18 || hour<6);
  },[]);

  const toggleDarkMode = ()=>{
    setDarkMode(d=>!d);
    document.body.classList.toggle('dark');
  };

  const categories = ['全部', ...Object.keys(softwareData)];
  const filtered = selectedCategory==='全部' ? Object.values(softwareData).flat() : (softwareData[selectedCategory]||[]);

  const finalList = filtered.filter(s=>s.name.includes(query)||s.description.includes(query));

  return (
    <div className="app p-4">
      {/* 顶部 */}
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-xl font-bold">Software Downloads 在线技术支持@微信：qq2269404909</h1>
        <button onClick={toggleDarkMode} className="p-2 rounded-full bg-gray-200 dark:bg-gray-700 hover:scale-110 transition-transform">
          {darkMode ? <Sun className="w-5 h-5 text-yellow-400"/> : <Moon className="w-5 h-5 text-gray-800"/>}
        </button>
      </div>

      {/* 搜索 */}
      <div className="flex items-center bg-white dark:bg-gray-800 rounded-xl shadow-md px-4 py-2 mb-4">
        <Search className="w-5 h-5 text-gray-400 mr-3"/>
        <input type="text" placeholder="搜索软件名称或描述..." value={query} onChange={e=>setQuery(e.target.value)} className="w-full bg-transparent outline-none"/>
      </div>

      {/* 分类 */}
      <div className="flex flex-wrap gap-2 mb-4">
        {categories.map(cat=>(
          <button key={cat} onClick={()=>setSelectedCategory(cat)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium ${selectedCategory===cat?'bg-blue-600 text-white':'bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600'}`}>{cat}</button>
        ))}
      </div>

      {/* 软件列表 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {finalList.map((s,i)=>(
          <div key={i} className="bg-white dark:bg-gray-800 p-5 rounded-2xl shadow-md hover:shadow-xl transition">
            <h3 className="text-lg font-semibold mb-1">{s.name}</h3>
            <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">{s.description}</p>
            <div className="flex justify-between items-center mt-4">
              <span className="text-xs text-gray-500">更新日期: {s.updatedAt}</span>
              <a href={s.downloadUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                <Download className="w-4 h-4"/>
              </a>
            </div>
          </div>
        ))}
        {finalList.length===0 && <p className="text-center col-span-full text-gray-500 dark:text-gray-400">没有找到与“{query}”相关的软件</p>}
      </div>

      {/* 访客条 */}
      <div className={`visitor-bar ${darkMode?'dark':'light'}`}>
        <span>{visitorInfo.device==='Mobile'?<Smartphone className="w-4 h-4"/>:<Monitor className="w-4 h-4"/>} {visitorInfo.device}</span>
        <span><Globe className="w-4 h-4"/> {visitorInfo.ip || '加载中...'}</span>
        <span><MapPin className="w-4 h-4"/> {visitorInfo.country || '未知'} {visitorInfo.city || ''}</span>
        <span>⏱ {visitorInfo.time}</span>
      </div>
    </div>
  );
};

export default App;
