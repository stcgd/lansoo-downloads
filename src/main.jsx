import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './style.css';
import { Globe, Smartphone, Monitor, Laptop, MapPin, ScanFace } from 'lucide-react';

// --- 获取访客信息 ---
async function fetchVisitorInfo() {
  try {
    const res = await fetch('https://ipapi.co/json/');
    const data = await res.json();

    const ua = navigator.userAgent.toLowerCase();
    const width = window.innerWidth;

    let device = 'PC';
    if (/mobile|android|iphone/.test(ua)) {
      device = 'Mobile';
    } else if (width <= 1440) {
      device = 'Notebook';
    }

    return {
      ip: data.ip,
      country: data.country_name,
      city: data.city,
      device,
      browser: navigator.userAgent,
    };
  } catch (e) {
    return {
      ip: '未知',
      country: '未知',
      city: '',
      device: '未知',
      browser: navigator.userAgent,
    };
  }
}

// --- 生成头像（Identicon） ---
const generateAvatar = (seed) =>
  `https://api.dicebear.com/9.x/identicon/svg?seed=${seed || "visitor"}`;

// ---------------- 访客条 ----------------
const VisitorBar = () => {
  const [info, setInfo] = useState(null);

  useEffect(() => {
    fetchVisitorInfo().then(setInfo);
  }, []);

  if (!info) return null;

  const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

  const DeviceIcon =
    info.device === "Mobile"
      ? Smartphone
      : info.device === "Notebook"
      ? Laptop
      : Monitor;

  return (
    <div
      className="fixed bottom-0 left-0 w-full p-3 flex flex-wrap justify-center items-center gap-5 text-sm shadow-lg z-50 backdrop-blur-md border-t"
      style={{
        background: isDark
          ? "linear-gradient(135deg, rgba(30,30,30,0.7), rgba(60,60,60,0.7))"
          : "linear-gradient(135deg, rgba(255,255,255,0.75), rgba(240,240,255,0.75))",
      }}
    >
      {/* Avatar */}
      <img
        src={generateAvatar(info.ip)}
        alt="avatar"
        className="w-8 h-8 rounded-md shadow"
      />

      {/* Device */}
      <div className="flex items-center gap-2">
        <DeviceIcon size={18} />
        <span>{info.device}</span>
      </div>

      {/* IP */}
      <div className="flex items-center gap-2">
        <ScanFace size={18} />
        <span>{info.ip}</span>
      </div>

      {/* Location */}
      <div className="flex items-center gap-2">
        <MapPin size={18} />
        <span>{info.country} {info.city}</span>
      </div>
    </div>
  );
};

// ---------------- Password Screen（加强动画+头像） ----------------
const PasswordScreen = ({ onPasswordSubmit }) => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (password === 'sunway') {
      onPasswordSubmit(true);
    } else {
      setError('密码错误，请重试。');
    }
  };

  const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-4 relative"
      style={{
        background: isDark
          ? 'linear-gradient(135deg, #0f0f0f, #1a1a2e)'
          : 'linear-gradient(135deg, #e0e7ff, #f4f4ff)',
      }}
    >
      <VisitorBar />

      <form
        onSubmit={handleSubmit}
        className="p-8 rounded-2xl shadow-2xl flex flex-col items-center gap-4 backdrop-blur-xl border max-w-sm w-full"
        style={{
          background: isDark ? 'rgba(20,20,20,0.55)' : 'rgba(255,255,255,0.55)',
        }}
      >
        {/* Avatar */}
        <img
          src={generateAvatar("login")}
          className="w-20 h-20 rounded-xl shadow-xl mb-2 animate-[float_3s_ease-in-out_infinite]"
        />

        <h2
          className="text-2xl mb-2 font-semibold text-center"
          style={{ color: isDark ? '#9bb6ff' : '#1d3fff' }}
        >
          输入访问密钥
        </h2>

        {/* 密码框（动画） */}
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="••••••••"
          className="p-3 w-full rounded-lg shadow-inner border outline-none
                     bg-gray-200/60 dark:bg-gray-700/60 focus:ring-2 
                     focus:ring-blue-400 transition-transform duration-150
                     focus:scale-[1.03]"
        />

        <button
          type="submit"
          className="w-full py-2 rounded-lg font-bold transition-all shadow-lg
                     bg-blue-600 hover:bg-blue-700 text-white active:scale-95"
        >
          进入
        </button>

        {error && <p className="text-red-500 text-sm">{error}</p>}
      </form>
    </div>
  );
};

// ---------------- Main ----------------
const Main = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const isAuth = localStorage.getItem('isAuthenticated') === 'true';
    setIsAuthenticated(isAuth);
    setIsLoading(false);
  }, []);

  const handlePasswordSubmit = (status) => {
    setIsAuthenticated(status);
    if (status) {
      localStorage.setItem('isAuthenticated', 'true');
    }
  };

  if (isLoading) return <div className="text-center mt-20">加载中...</div>;

  return isAuthenticated ? <App /> : <PasswordScreen onPasswordSubmit={handlePasswordSubmit} />;
};

ReactDOM.createRoot(document.getElementById('root')).render(<Main />);
