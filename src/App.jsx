
import React, { useState, useMemo, useEffect } from 'react';
import softwareData from './data/software.json';
import SoftwareCard from './components/SoftwareCard';
import './style.css';

// This is the component that shows the password input screen.
const PasswordScreen = ({ onPasswordSubmit }) => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (password === 'sunway') { // REPLACE with your actual password
      onPasswordSubmit(true);
    } else {
      setError('密码错误，请重试。');
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-900 text-white">
      <form onSubmit={handleSubmit} className="p-8 bg-gray-800 rounded-lg shadow-xl flex flex-col items-center">
        <h2 className="text-2xl mb-4 font-bold text-blue-400">输入密码访问</h2>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="在此处输入密码"
          className="p-3 my-4 w-64 rounded-md bg-gray-700 text-white placeholder-gray-500 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          type="submit"
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          提交
        </button>
        {error && <p className="mt-4 text-red-500">{error}</p>}
      </form>
    </div>
  );
};
//----
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

  return (
    <div className={darkMode ? 'container dark' : 'container'}>
      <header className="header">
        <h1>软件下载导航 </h1>
        <p>||快捷获取常用软件安装包|Software download navigation
|@Sunway 远程技术支持 4664456</p>
        <button className="dark-toggle" onClick={toggleDarkMode}>
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
    </div>
  );
};

export default App;
