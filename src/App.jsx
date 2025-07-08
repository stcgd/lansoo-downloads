import React, { useState } from 'react';
import softwareData from './data/software.json';
import SoftwareCard from './components/SoftwareCard';
import './style.css';

const App = () => {
  const [query, setQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('全部');

  const allCategories = ['全部', ...Object.keys(softwareData)];

  const filterSoftware = (software) => {
    const lowerQuery = query.toLowerCase();
    return (
      software.name.toLowerCase().includes(lowerQuery) ||
      software.description.toLowerCase().includes(lowerQuery)
    );
  };

  return (
    <div className="container">
      <header className="header">
        <h1>软件下载导航</h1>
        <p>快捷获取常用软件安装包</p>
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
                <SoftwareCard key={idx} software={s} />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default App;
