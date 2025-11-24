import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import Admin from './Admin.jsx'; // 修复：确保导入时包含 .jsx 后缀
import './style.css'; 

// 访客密码组件
const PasswordScreen = ({ onPasswordSubmit }) => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (password === 'sunway') { // 访客密码
      onPasswordSubmit(true);
    } else {
      setError('密码错误，请重试。');
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-900 text-white">
      <form onSubmit={handleSubmit} className="p-8 bg-gray-800 rounded-lg shadow-xl flex flex-col items-center">
        {/* 修复 JSX 语法错误：将 > 替换为 HTML 实体 &gt; */}
        <h2 className="text-2xl mb-4 font-bold text-blue-400">密码&gt;暗号&gt;密钥&gt;口令!？</h2>
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
          登录
        </button>
        {error && <p className="mt-4 text-red-500">{error}</p>}
      </form>
    </div>
  );
};

// 主路由组件
const AppRouter = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // 检查本地存储以持久化登录状态
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

  // 简单的 URL 路由
  const { pathname } = window.location;

  if (pathname.startsWith('/admin')) {
    // 如果是后台路径，渲染 Admin 组件
    return <Admin />;
  }

  // 以下是主站的逻辑
  if (isLoading) {
    return <div className="loading-screen">加载中...</div>;
  }

  return isAuthenticated ? (
    <App />
  ) : (
    <PasswordScreen onPasswordSubmit={handlePasswordSubmit} />
  );
};

ReactDOM.createRoot(document.getElementById('root')).render(<AppRouter />);
