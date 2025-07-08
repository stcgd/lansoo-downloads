// App.js
import React, { useState, useMemo, useEffect } from 'react';
// ... 其他导入

const App = () => {
  const [query, setQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('全部');
  const [darkMode, setDarkMode] = useState(false);
  const [isManualToggle, setIsManualToggle] = useState(false);

  const allCategories = ['全部', ...Object.keys(softwareData)];

  useEffect(() => {
    // 根据系统时间自动切换日夜模式
    if (!isManualToggle) {
      const hour = new Date().getHours();
      const isNight = hour >= 18 || hour < 6;
      setDarkMode(isNight);
    }
  }, [isManualToggle]);

  // 关键修改：根据darkMode状态添加或移除body的dark类
  useEffect(() => {
    if (darkMode) {
      document.body.classList.add('dark');
    } else {
      document.body.classList.remove('dark');
    }
  }, [darkMode]); // 依赖项为darkMode

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
    setIsManualToggle(true);
  };

  // ... filterSoftware 函数

  return (
    // 注意：这里的 .container 已经不再需要根据darkMode来切换类了，
    // 因为body.dark会处理全局背景和文字颜色
    <div className="container"> 
      <header className="header">
        <h1>软件下载导航</h1>
        <p>快捷获取常用软件安装包@Sunway 远程技术支持 4664456</p>
        {/* 日夜模式切换按钮，请确保这里有 dark-mode-toggle 类 */}
        <button className="dark-mode-toggle" onClick={toggleDarkMode}>
          {darkMode ? '☀️ 白天模式' : '🌙 黑夜模式'}
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

      {/* ... 后面的软件列表渲染部分不变 */}
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
    </div>
  );
};

export default App;
