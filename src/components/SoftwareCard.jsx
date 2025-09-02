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

// SVG 下载图标
const DownloadIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="currentColor"
    aria-hidden="true"
  >
    <path
      fillRule="evenodd"
      d="M12 2.25a.75.75 0 01.75.75v11.69l3.245-3.245a.75.75 0 011.06 1.06l-4.5 4.5a.75.75 0 01-1.06 0l-4.5-4.5a.75.75 0 111.06-1.06l3.245 3.245V3a.75.75 0 01.75-.75zM6 17.25a.75.75 0 01.75-.75h10.5a.75.75 0 010 1.5H6.75a.75.75 0 01-.75-.75z"
      clipRule="evenodd"
    />
  </svg>
);

const SoftwareCard = ({ software, query }) => {
  return (
    <div className="card">
      <h3>{highlightText(software.name, query)}</h3>
      <p>{highlightText(software.description, query)}</p>
      <p className="update-time">更新时间：{software.updatedAt}</p>
      <a className="download" href={software.downloadUrl} target="_blank" rel="noopener noreferrer">
        <DownloadIcon />
        下载
      </a>
    </div>
  );
};

export default SoftwareCard;
