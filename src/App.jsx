import React, { useState, useMemo, useEffect } from 'react';
import softwareData from './data/software.json';
import SoftwareCard from './components/SoftwareCard';
import BannerCarousel from './components/BannerCarousel'; // <-- 这一行是关键！
import './style.css';
import './carousel.css'; 

const App = () => {
  const [query, setQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('全部');
  const [darkMode, setDarkMode] = useState(false);
  const [isManualToggle, setIsManualToggle] = useState(false);

  const allCategories = ['全部', ...Object.keys(softwareData)];

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

  const filterSoftware = (software) => {
    const lowerQuery = query.toLowerCase();
    return (
      software.name.toLowerCase().includes(lowerQuery) ||
      software.description.toLowerCase().includes(lowerQuery)
    );
  };

  const filteredData = useMemo(() => {
    if (selectedCategory === '全部') {
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
    <div className={darkMode ? 'container dark' : 'container'}>
      <header className="header">
        <h1>软件下载导航</h1>
        <p>||快捷获取常用软件安装包|Software download navigation
          |@Sunway 远程技术支持 4664456</p>
        <button className="dark-toggle" onClick={toggleDarkMode}>
          {darkMode ? '☀️ 白天模式' : '🌙 夜间模式'}
        </button>
      </header>

      <BannerCarousel /> {/* 现在可以正常使用了 */}

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
      
      {Object.values(filteredData).flat().length === 0 && (
        <div className="no-results">
          没有找到与“{query}”相关的软件，请尝试其他关键词。
        </div>
      )}

      {Object.entries(filteredData).map(([category, softwares]) => {
        if (softwares.length === 0) return null;
        return (
          <div key={category} className="category">
            <h2>{category}</h2>
            <div className="software-list">
              {softwares.map((s, idx) => (
                <SoftwareCard key={idx} software={s} query={query} />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default App;
