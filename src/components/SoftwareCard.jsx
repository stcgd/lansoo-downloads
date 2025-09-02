import React from 'react';

// 高亮函数：将匹配的关键词包裹在 <mark> 标签中
const highlightText = (text, query) => {
  if (!query) {
    return text;
  }
  const parts = text.split(new RegExp(`(${query})`, 'gi'));
  return (
    <>
      {parts.map((part, index) =>
        new RegExp(query, 'i').test(part) ? (
          <mark key={index}>{part}</mark>
        ) : (
          part
        )
      )}
    </>
  );
};



const SoftwareCard = ({ software, query }) => {
  return (
    <div className="card">
      <h3>{highlightText(software.name, query)}</h3>
      <p>{highlightText(software.description, query)}</p>
      <p className="update-time">更新时间：{software.updatedAt}</p>
      <a className="download" href={software.downloadUrl} target="_blank" rel="noopener noreferrer">
        <DownloadIcon />
        获取
      </a>
    </div>
  );
};

export default SoftwareCard;
