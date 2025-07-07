import React from 'react';

const SoftwareCard = ({ software }) => {
  return (
    <div className="card">
      <h3>{software.name}</h3>
      <p>{software.description}</p>
      <p>更新时间：{software.updatedAt}</p>
      <a className="download" href={software.downloadUrl} target="_blank" rel="noopener noreferrer">
        下载
      </a>
    </div>
  );
};

export default SoftwareCard;
