import React, { useState, useEffect } from 'react';

const banners = [
  { id: 1, url: '/banners/banner1.png', alt: '网站横幅1' },
  { id: 2, url: '/banners/banner2.png', alt: '网站横幅2' },
  { id: 3, url: '/banners/banner3.png', alt: '网站横幅3' }
];

const BannerCarousel = () => {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    // 设置自动播放，每5秒切换一次
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % banners.length);
    }, 5000);

    // 清除定时器，防止内存泄漏
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="banner-carousel">
      <div className="carousel-images" style={{ transform: `translateX(${-currentIndex * 100}%)` }}>
        {banners.map((banner) => (
          <img key={banner.id} src={banner.url} alt={banner.alt} className="carousel-image" />
        ))}
      </div>
      <div className="carousel-dots">
        {banners.map((_, index) => (
          <span
            key={index}
            className={`dot ${index === currentIndex ? 'active' : ''}`}
            onClick={() => setCurrentIndex(index)}
          />
        ))}
      </div>
    </div>
  );
};

export default BannerCarousel;
