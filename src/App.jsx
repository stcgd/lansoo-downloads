import React, { useState, useMemo, useEffect } from 'react';
import softwareData from './data/software.json';
import SoftwareCard from './components/SoftwareCard';
import './style.css';

const App = () => {
  const [query, setQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('全部');
  const [darkMode, setDarkMode] = useState(false);
  const [isManualToggle, setIsManualToggle] = useState(false);

  const allCategories = ['全部', ...Object.keys(softwareData)];

  useEffect(() => {
    // 自动根据系统时间设置日夜模式
    if (!isManualToggle) {
      const hour = new Date().getHours();
      const isNight = hour >= 18 || hour < 6;
      setDarkMode(isNight);
    }
  }, [isManualToggle]);

  useEffect(() => {
    // 根据 darkMode 状态为 body 标签添加或移除 'dark' 类
    if (darkMode) {
      document.body.classList.add('dark');
    } else {
      document.body.classList.remove('dark');
    }
  }, [darkMode]);

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
    setIsManualToggle(true);
  };

  const filterSoftware = (software) => {
    const lowerQuery = query.toLowerCase();
    return (
      software.name.toLowerCase().includes(lowerQuery) ||
      software.description.toLowerCase().includes(lowerQuery)
    );
  };

  return (
    // 注意: 这里不再有条件渲染的 'dark' 类，因为它已经被应用到 body 上了
    <div className="container">
      <header className="header">
        <h1>软件下载导航</h1>
        <p>快捷获取常用软件安装包@Sunway 远程技术支持 4664456</p>
        <button className="dark-mode-toggle" onClick={toggleDarkMode}>
          {darkMode ? '☀️ 白天模式' : '🌙 夜间模式'}
        </button>
      </header>

      <div className="search-section">
        <input
          className="search-input"
          type="text"
          placeholder="搜索软件名称或描述..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <div className="category-filters">
          {allCategories.map((cat) => (
            <button
              key={cat}
              className={`filter-btn ${selectedCategory === cat ? 'active' : ''}`}
              onClick={() => setSelectedCategory(cat)}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {Object.entries(softwareData).map(([category, softwares]) => {
        if (selectedCategory !== '全部' && category !== selectedCategory) return null;
        const filtered = softwares.filter(filterSoftware);
        if (filtered.length === 0) return null;
        return (
          <div key={category} className="category">
            <h2>{category}</h2>
            <div className="software-list">
              {filtered.map((s, idx) => (
                <SoftwareCard key={idx} software={s} query={query} />
              ))}
            </div>
          </div>
        );
      })}

      <footer className="footer">
        <p>&copy; {new Date().getFullYear()} LanSoo Soft. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default App;
