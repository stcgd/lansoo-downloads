import React, { useState, useEffect, useRef } from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { Globe, Smartphone, Monitor, Laptop, MapPin, Clock } from "lucide-react";

/* ------------------ 设备检测 ------------------ */
function detectDevice() {
  const ua = navigator.userAgent.toLowerCase();
  const width = window.innerWidth;

  if (/mobile|android|iphone/.test(ua)) return "Mobile";
  if (width <= 1440) return "Notebook";
  return "PC";
}

/* ------------------ 访客信息 ------------------ */
async function fetchVisitorInfo() {
  try {
    const res = await fetch("/cdn-cgi/trace");
    const text = await res.text();
    const ip = (text.match(/ip=(.*)/) || [])[1]?.trim() || "未知";
    const country = (text.match(/loc=(.*)/) || [])[1]?.trim() || "未知";
    return { ip, country, city: "", device: detectDevice() };
  } catch (e) {
    console.warn("访客信息获取失败:", e);
    return { ip: "未知", country: "未知", city: "", device: detectDevice() };
  }
}

/* ------------------ 底部访客条 ------------------ */
const VisitorBar = ({ darkMode }) => {
  const [info, setInfo] = useState({ ip: "加载中...", country: "加载中...", city: "", device: "加载中..." });
  const [time, setTime] = useState(() => {
    const now = new Date();
    return now.toLocaleString("zh-CN", { hour12: false });
  });

  useEffect(() => {
    fetchVisitorInfo().then(setInfo);

    const timer = setInterval(() => {
      const now = new Date();
      setTime(now.toLocaleString("zh-CN", { hour12: false }));
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const deviceIcon =
    info.device === "Mobile"
      ? <Smartphone size={18} />
      : info.device === "Notebook"
      ? <Laptop size={18} />
      : <Monitor size={18} />;

  return (
    <div className={`
      fixed bottom-0 left-1/2 -translate-x-1/2 mb-3 rounded-xl shadow-lg p-3 flex items-center gap-4
      backdrop-blur-xl text-sm z-50
      ${darkMode ? "bg-gray-800 text-gray-200 border border-gray-600" : "bg-white/70 text-gray-900 border border-gray-300"}
    `}>
      <div className="flex items-center gap-2">{deviceIcon} {info.device}</div>
      <div className="flex items-center gap-2"><Globe size={18} /> {info.ip}</div>
      <div className="flex items-center gap-2"><MapPin size={18} /> {info.country} {info.city}</div>
      <div className="flex items-center gap-2"><Clock size={18} /> {time}</div>
    </div>
  );
};

/* ------------------ 密码页 ------------------ */
const PasswordScreen = ({ onPasswordSubmit }) => {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [shake, setShake] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const inputRef = useRef(null);

  const maxAttempts = 5;
  const darkMode = window.matchMedia("(prefers-color-scheme: dark)").matches;

  /* 每输入字符触发水波动画 */
  const handleInput = (e) => {
    setPassword(e.target.value);

    const ripple = document.createElement("span");
    ripple.className = "absolute w-5 h-5 rounded-full bg-blue-400/40 animate-ripple pointer-events-none";
    const rect = inputRef.current.getBoundingClientRect();
    ripple.style.left = `${Math.random() * (rect.width - 20)}px`;
    ripple.style.top = `${Math.random() * (rect.height - 20)}px`;
    inputRef.current.appendChild(ripple);

    setTimeout(() => {
      ripple.remove();
    }, 800);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (password === "sunway") {
      onPasswordSubmit(true);
    } else {
      if (attempts + 1 >= maxAttempts) {
        setError("The number of incorrect password attempts has exceeded the limit. Please try again later!");
      } else {
        setShake(true);
        setTimeout(() => setShake(false), 400);
        setError(`Incorrect password, please try again (${attempts + 1}/${maxAttempts})`);
        setAttempts(attempts + 1);
      }
    }
  };

  return (
    <div className={`min-h-screen flex flex-col justify-center items-center px-4 ${darkMode ? "bg-gray-900" : "bg-gradient-to-br from-blue-100 to-purple-100"}`}>
      <VisitorBar darkMode={darkMode} />

      <form
        onSubmit={handleSubmit}
        className={`
          relative w-full max-w-sm p-8 rounded-2xl backdrop-blur-xl
          flex flex-col items-center gap-4 shadow-2xl
          ${darkMode ? "bg-gray-800/60" : "bg-white/60"}
        `}
      >
        <h2 className={`text-2xl font-bold text-center ${darkMode ? "text-blue-300" : "text-blue-700"}`}>
          Enter credentials to connect...
        </h2>

        <div ref={inputRef} className="relative w-full">
          <input
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={handleInput}
            disabled={attempts >= maxAttempts}
            className={`
              relative w-full p-3 rounded-lg border outline-none
              ${darkMode ? "bg-gray-700 border-gray-600 text-gray-200 placeholder-gray-400" : "bg-gray-200 border-gray-300 text-gray-900 placeholder-gray-600"}
              focus:ring-2 focus:ring-blue-400
              ${shake ? "animate-shake" : ""}
            `}
          />
        </div>

        <button
          type="submit"
          disabled={attempts >= maxAttempts}
          className={`
            w-full py-2 rounded-lg font-bold
            ${darkMode ? "bg-blue-600 hover:bg-blue-700 text-white" : "bg-blue-600 hover:bg-blue-700 text-white"}
            shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed
          `}
        >
          Submit
        </button>

        {error && <p className="text-red-500 text-sm text-center">{error}</p>}
      </form>
    </div>
  );
};

/* ------------------ Main ------------------ */
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
    if (status) localStorage.setItem("isAuthenticated", "true");
  };

  if (isLoading) return <div className="text-center mt-20">加载中...</div>;

  return isAuthenticated ? <App /> : <PasswordScreen onPasswordSubmit={handlePasswordSubmit} />;
};

ReactDOM.createRoot(document.getElementById("root")).render(<Main />);

/* ------------------ Tailwind 动画 ------------------ */
<style>
  @keyframes shake {
    0% { transform: translateX(0); }
    25% { transform: translateX(-6px); }
    50% { transform: translateX(6px); }
    75% { transform: translateX(-6px); }
    100% { transform: translateX(0); }
  }
  .animate-shake { animation: shake 0.4s ease; }

  @keyframes ripple {
    0% { transform: scale(0); opacity: 0.5; }
    50% { transform: scale(1.2); opacity: 0.2; }
    100% { transform: scale(1); opacity: 0; }
  }
  .animate-ripple { animation: ripple 0.8s ease-out forwards; }
</style>
