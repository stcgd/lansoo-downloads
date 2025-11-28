import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './style.css';
import { Globe, Smartphone, Monitor, MapPin, ScanFace } from 'lucide-react';

// --- 获取访客信息（IP + 国家城市 + UA） ---
async function fetchVisitorInfo() {
  try {
    const res = await fetch('https://ipapi.co/json/');
    const data = await res.json();

    const ua = navigator.userAgent.toLowerCase();
    const device = /mobile|android|iphone/.test(ua) ? 'Mobile' : 'PC';

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

// ---------------- 访客信息条 UI ----------------
const VisitorBar = () => {
  const [info, setInfo] = useState(null);

  useEffect(() => {
    fetchVisitorInfo().then(setInfo);
  }, []);

  if (!info) return null;

  const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

  return (
    <div
      className="w-full p-3 mb-6 rounded-xl shadow-lg backdrop-blur-md border
                 flex flex-wrap items-center justify-center gap-4 text-sm"
      style={{
        background: isDark
          ? 'linear-gradient(135deg, rgba(30,30,30,0.6), rgba(60,60,60,0.6))'
          : 'linear-gradient(135deg, rgba(255,255,255,0.7), rgba(240,240,255,0.7))',
      }}
    >
      <div className="flex items-center gap-2">
        <ScanFace size={18} />
        <span>{info.ip}</span>
      </div>

      <div className="flex items-center gap-2">
        {info.device === 'Mobile' ? <Smartphone size={18} /> : <Monitor size={18} />}
        <span>{info.device}</span>
      </div>

      <div className="flex items-center gap-2">
        <Globe size={18} />
        <span>{info.browser.replace(/\\/g, '')}</span>
      </div>

      <div className="flex items-center gap-2">
        <MapPin size={18} />
        <span>{info.country} {info.city}</span>
      </div>
    </div>
  );
};

// ---------------- 密码页 UI（重制） ----------------
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
      className="min-h-screen flex flex-col items-center justify-center px-4"
      style={{
        background: isDark
          ? 'linear-gradient(135deg, #0f0f0f, #1a1a2e)'
          : 'linear-gradient(135deg, #e0e7ff, #f4f4ff)',
      }}
    >

      <VisitorBar />

      <form
        onSubmit={handleSubmit}
        className="p-8 rounded-2xl shadow-2xl border backdrop-blur-xl flex flex-col items-center gap-4"
        style={{
          width: '90%',
          maxWidth: '380px',
          background: isDark
            ? 'rgba(20,20,20,0.55)'
            : 'rgba(255,255,255,0.55)',
        }}
      >
        <h2 className="text-2xl mb-2 font-bold text-center"
            style={{ color: isDark ? '#90b4ff' : '#1d3fff' }}>
          请输入通行密钥
        </h2>

        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="输入密码"
          className="p-3 w-full rounded-lg shadow-inner border outline-none 
                     bg-gray-200/50 dark:bg-gray-700/50 focus:ring-2 focus:ring-blue-400"
        />

        <button
          type="submit"
          className="w-full py-2 rounded-lg font-bold transition-all shadow-lg
                     bg-blue-600 hover:bg-blue-700 text-white"
        >
          登录
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

  if (isLoading) {
    return <div className="text-center mt-20">加载中...</div>;
  }

  return isAuthenticated ? <App /> : <PasswordScreen onPasswordSubmit={handlePasswordSubmit} />;
};

ReactDOM.createRoot(document.getElementById('root')).render(<Main />);
