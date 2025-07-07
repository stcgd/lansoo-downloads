import React from 'react';
import softwareData from './data/software.json';
import SoftwareCard from './components/SoftwareCard';

const App = () => {
  return (
    <div>
      <h1>软件下载导航</h1>
      {Object.entries(softwareData).map(([category, softwares]) => (
        <div key={category} className="category">
          <h2>{category}</h2>
          <div className="software-list">
            {softwares.map((s, idx) => (
              <SoftwareCard key={idx} software={s} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default App;
