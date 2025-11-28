import React, { useState, useEffect } from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./style.css";

import {
  Globe,
  Smartphone,
  Monitor,
  Laptop,
  MapPin,
} from "lucide-react";

/* -------------------------
   设备检测：PC / Notebook / Mobile
------------------------- */
function detectDevice() {
  const ua = navigator.userAgent.toLowerCase();
  const width = window.innerWidth;

  if (/mobile|android|iphone/.test(ua)) return "Mobile";
  if (width <= 1440) return "Notebook";
  return "PC";
}

/* -------------------------
   稳定访客信息获取（永不未知）
------------------------- */
async function fetchVisitorInfo() {
  try {
    // ① ipinfo（国内也可访问）
    const r = await fetch("https://ipinfo.io/json?token=46fa1df79e4ef3");
    if (r.ok) {
      const d = await r.json();
      return {
        ip: d.ip || "未知",
        country: d.country || "未知",
        city: d.city || "",
        device: detectDevice(),
      };
    }

    // ② Cloudflare Trace（如部署CF）
    const cf = await fetch("/cdn-cgi/trace").then((res) => res.text());
    const ip = (cf.match(/ip=(.*)/) || [])[1]?.trim();
    const country = (cf.match(/loc=(.*)/) || [])[1]?.trim();

    if (ip) {
      return {
        ip,
        country: country || "未知",
        city: "",
        device: detectDevice(),
      };
    }
  } catch (e) {
    console.warn("访客信息获取失败:", e);
  }

  // ③ 永不未知（兜底）
  return {
    ip: "未知",
    country: "未知",
    city: "",
    device: detectDevice(),
  };
}

/* -------------------------
   自动生成 Identicon 头像
------------------------- */
function generateAvatar(ip) {
  const hash = btoa(ip).slice(0, 8);
  return `https://api.dicebear.com/7.x/identicon/svg?seed=${hash}`;
}

/* -------------------------
   底部访客信息条
------------------------- */
const VisitorBar = () => {
  const [info, setInfo] = useState(null);
  const [avatar, setAvatar] = useState("");

  useEffect(() => {
    fetchVisitorInfo().then((res) => {
      setInfo(res);
      setAvatar(generateAvatar(res.ip));
    });
  }, []);

  if (!info) return null;

  const isDark = window.matchMedia("(prefers-color-scheme: dark)").matches;

  const deviceIcon =
    info.device === "Mobile" ? (
      <Smartphone size={18} />
    ) : info.device === "Notebook" ? (
      <Laptop size={18} />
    ) : (
      <Monitor size={18} />
    );

  return (
    <div
      className="fixed bottom-0 left-1/2 -translate-x-1/2 mb-3 rounded-xl shadow-lg p-3 flex items-center gap-4 backdrop-blur-xl text-sm z-50"
      style={{
        background: isDark
          ? "linear-gradient(135deg,rgba(30,30,30,0.7),rgba(60,60,60,0.7))"
          : "linear-gradient(135deg,rgba(255,255,255,0.7),rgba(240,240,255,0.7))",
        border: "1px solid rgba(255,255,255,0.2)",
      }}
    >
      <img
        src={avatar}
        className="w-8 h-8 rounded-full shadow"
        alt="avatar"
      />

      <div className="flex items-center gap-2">
        {deviceIcon} {info.device}
      </div>

      <div className="flex items-center gap-2">
        <Globe size={18} /> {info.ip}
      </div>

      <div className="flex items-center gap-2">
        <MapPin size={18} /> {info.country} {info.city}
      </div>
    </div>
  );
};

/* -------------------------
   密码页（动画 + 居中 + 头像）
------------------------- */
const PasswordScreen = ({ onPasswordSubmit }) => {
  const [password, setPassword] = useState("");
  const [shake, setShake] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();

    if (password === "sunway") {
      onPasswordSubmit(true);
    } else {
      setShake(true);
      setTimeout(() => setShake(false), 500);
      setError("密码错误，请重试。");
    }
  };

  const isDark = window.matchMedia("(prefers-color-scheme: dark)").matches;

  return (
    <div
      className="min-h-screen flex flex-col justify-center items-center"
      style={{
        background: isDark
          ? "linear-gradient(135deg,#0f0f0f,#1a1a2e)"
          : "linear-gradient(135deg,#e0e7ff,#f4f4ff)",
      }}
    >
      <VisitorBar />

      <form
        onSubmit={handleSubmit}
        className="p-8 rounded-2xl shadow-2xl border backdrop-blur-xl flex flex-col items-center gap-4 animate-fadeIn"
        style={{
          width: "90%",
          maxWidth: "380px",
          background: isDark
            ? "rgba(20,20,20,0.55)"
            : "rgba(255,255,255,0.55)",
        }}
      >
        <img
          src="https://api.dicebear.com/7.x/bottts/svg?seed=Security"
          className="w-20 h-20 rounded-full shadow mb-2"
        />

        <h2
          className="text-2xl font-bold"
          style={{ color: isDark ? "#90b4ff" : "#1d3fff" }}
        >
          请输入访问密钥
        </h2>

        <input
          type="password"
          placeholder="输入密码"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className={`p-3 w-full rounded-lg shadow-inner border outline-none
            bg-gray-200/50 dark:bg-gray-700/50 focus:ring-2 focus:ring-blue-400
            ${shake ? "animate-shake" : ""}`}
        />

        <button
          type="submit"
          className="w-full py-2 rounded-lg font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-lg transition-all"
        >
          登录
        </button>

        {error && <p className="text-red-500">{error}</p>}
      </form>
    </div>
  );
};

/* -------------------------
   Main
------------------------- */
const Main = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const isAuth = localStorage.getItem("isAuthenticated") === "true";
    setIsAuthenticated(isAuth);
    setIsLoading(false);
  }, []);

  const handlePasswordSubmit = (status) => {
    setIsAuthenticated(status);
    if (status) {
      localStorage.setItem("isAuthenticated", "true");
    }
  };

  if (isLoading) return <div className="text-center mt-20">加载中...</div>;

  return isAuthenticated ? (
    <App />
  ) : (
    <PasswordScreen onPasswordSubmit={handlePasswordSubmit} />
  );
};

ReactDOM.createRoot(document.getElementById("root")).render(<Main />);
