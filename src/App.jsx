import React, { useState } from 'react';
import softwareData from './data/software.json';
import SoftwareCard from './components/SoftwareCard';
import './style.css';

const App = () => {
  const [query, setQuery] = useState('');

  const filterSoftware = (software) => {
    const lowerQuery = query.toLowerCase();
    return (
      software.name.toLowerCase().includes(lowerQuery) ||
      software.description.toLowerCase().includes(lowerQuery)
    );
  };

  return (
    <div className="container">
      <h1>软件下载导航</h1>
      <input
        className="search-input"
        type="text"
        placeholder="搜索软件名称或描述..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />
      {Object.entries(softwareData).map(([category, softwares]) => {
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
