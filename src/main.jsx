import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './style.css';

// This is the component that shows the password input screen.
const PasswordScreen = ({ onPasswordSubmit }) => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (password === 'sunway') { // REPLACE with your actual password
      onPasswordSubmit(true);
    } else {
      setError('密码错误，请重试。');
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-900 text-white">
      <form onSubmit={handleSubmit} className="p-8 bg-gray-800 rounded-lg shadow-xl flex flex-col items-center">
        <h2 className="text-2xl mb-4 font-bold text-blue-400">输入密码访问</h2>
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
          提交
        </button>
        {error && <p className="mt-4 text-red-500">{error}</p>}
      </form>
    </div>
  );
};
//----

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
