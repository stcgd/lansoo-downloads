import React, { useState, useEffect } from 'react';
import { 
  db, auth,
  // 确认：只从本地配置导入，不直接从 'firebase/...' 导入
  collection, getDocs, addDoc, updateDoc, deleteDoc, doc, onSnapshot, query, writeBatch,
  // 确认：只从本地配置导入，不直接从 'firebase/...' 导入
  signInWithEmailAndPassword, onAuthStateChanged, signOut, signInWithCustomToken 
} from './firebaseConfig';
import { Download, Edit, Trash, Plus, LogOut, Eye, UploadCloud } from 'lucide-react';

// --- 新增：导入本地 JSON 数据 ---
// 这只在本地开发环境 (`npm run dev`) 中有效，用于执行一次性导入
// 假设你的 software.json 位于项目的根目录
import softwareData from '../data/software.json'; 

// --- Canvas 环境特定代码 ---
const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';

// 数据库集合的引用
const softwareCollectionRef = collection(db, `artifacts/${appId}/public/data/software`);

// 后台登录组件
const AdminLogin = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      // 请确保你已经在 Firebase 控制台创建了管理员用户
      await signInWithEmailAndPassword(auth, email, password);
      onLogin(true); // 登录成功
    } catch (err) {
      setError('登录失败，请检查邮箱或密码。');
      console.error(err);
    }
    setLoading(false);
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-900 text-white">
      <form onSubmit={handleLogin} className="p-8 bg-gray-800 rounded-lg shadow-xl flex flex-col items-center w-full max-w-sm">
        <h2 className="text-2xl mb-6 font-bold text-blue-400">后台管理登录</h2>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="管理员邮箱"
          className="p-3 my-2 w-full rounded-md bg-gray-700 text-white placeholder-gray-500 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="管理员密码"
          className="p-3 my-2 w-full rounded-md bg-gray-700 text-white placeholder-gray-500 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          type="submit"
          disabled={loading}
          className="mt-4 w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-500"
        >
          {loading ? '登录中...' : '登录'}
        </button>
        {error && <p className="mt-4 text-red-500">{error}</p>}
      </form>
    </div>
  );
};

// 后台管理面板
const AdminPanel = ({ user }) => {
  const [softwareList, setSoftwareList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // 表单状态
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [currentSoftware, setCurrentSoftware] = useState(null); // null 表示新增, 非 null 表示编辑
  const [formData, setFormData] = useState({
    category: '',
    name: '',
    description: '',
    updatedAt: '',
    downloadUrl: ''
  });
  
  // 批量导入状态
  const [isImporting, setIsImporting] = useState(false);

  // 1. 实时获取数据
  useEffect(() => {
    setLoading(true);
    
    // 使用 onSnapshot 实时监听数据变化
    const q = query(softwareCollectionRef); // 你可以添加 orderBy 来排序
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const software = [];
      querySnapshot.forEach((doc) => {
        software.push({ id: doc.id, ...doc.data() });
      });
      // 在客户端按分类排序
      const sortedSoftware = sortSoftware(software);
      setSoftwareList(sortedSoftware);
      setLoading(false);
    }, (err) => {
      console.error(err);
      setError('无法加载数据。');
      setLoading(false);
    });

    // 清理监听器
    return () => unsubscribe();
  }, []);

  // 帮助函数：对软件列表进行分类和排序
  const sortSoftware = (list) => {
    const categories = {};
    list.forEach(s => {
      // 确保 category 存在，避免应用崩溃
      const categoryName = s.category || '未分类'; 
      if (!categories[categoryName]) {
        categories[categoryName] = [];
      }
      categories[categoryName].push(s);
    });
    return categories;
  };

  // 2. 处理表单
  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const openFormForAdd = () => {
    setCurrentSoftware(null);
    setFormData({
      category: '',
      name: '',
      description: '',
      updatedAt: new Date().toISOString().split('T')[0], // 默认为今天
      downloadUrl: ''
    });
    setIsFormOpen(true);
  };

  const openFormForEdit = (software) => {
    setCurrentSoftware(software);
    setFormData({
      category: software.category,
      name: software.name,
      description: software.description,
      updatedAt: software.updatedAt,
      downloadUrl: software.downloadUrl
    });
    setIsFormOpen(true);
  };

  const closeForm = () => {
    setIsFormOpen(false);
    setCurrentSoftware(null);
  };

  // 3. 提交（新增或更新）
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.category || !formData.name || !formData.downloadUrl || !formData.updatedAt) {
      // 使用 alert 模拟模态框，但更好的做法是使用自定义 UI
      alert('分类、名称、下载链接和更新日期不能为空！'); 
      return;
    }

    try {
      if (currentSoftware) {
        // 更新
        const docRef = doc(db, `artifacts/${appId}/public/data/software`, currentSoftware.id);
        await updateDoc(docRef, {
          ...formData
        });
      } else {
        // 新增
        await addDoc(softwareCollectionRef, {
          ...formData
        });
      }
      closeForm();
    } catch (err) {
      console.error(err);
      alert('操作失败！');
    }
  };

  // 4. 删除
  const handleDelete = async (id) => {
    if (window.confirm('确定要删除这个软件吗？')) {
      try {
        const docRef = doc(db, `artifacts/${appId}/public/data/software`, id);
        await deleteDoc(docRef);
      } catch (err) {
        console.error(err);
        alert('删除失败！');
      }
    }
  };

  // 5. 登出
  const handleLogout = async () => {
    await signOut(auth);
  };
  
  // 6. 批量导入功能
  const handleBulkImport = async () => {
    if (!window.confirm('确定要从 software.json 批量导入数据吗？\n请勿重复操作！这可能会导致数据重复！')) {
      return;
    }
    
    setIsImporting(true);
    console.log("开始批量导入...");

    try {
      // 1. 将 JSON 对象转换为扁平数组
      const allSoftwareItems = [];
      for (const category in softwareData) {
        softwareData[category].forEach(item => {
          allSoftwareItems.push({
            category: category,
            name: item.name,
            description: item.description,
            updatedAt: item.updatedAt,
            downloadUrl: item.downloadUrl
          });
        });
      }
      
      console.log(`准备导入 ${allSoftwareItems.length} 个软件...`);

      // 2. 使用批量写入 (Batch)
      const batch = writeBatch(db);
      
      allSoftwareItems.forEach((item) => {
        // 创建一个新的文档引用
        const docRef = doc(softwareCollectionRef); 
        batch.set(docRef, item);
      });

      // 3. 提交批量操作
      await batch.commit();
      
      console.log("批量导入成功！");
      alert(`成功导入 ${allSoftwareItems.length} 个软件！`);
      
    } catch (err) {
      console.error("批量导入失败: ", err);
      alert(`导入失败: ${err.message}`);
    }
    
    setIsImporting(false);
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-4 sm:p-8">
      <header className="flex justify-between items-center mb-6 pb-4 border-b border-gray-700">
        <h1 className="text-3xl font-bold text-blue-400">后台管理面板</h1>
        <div className='flex gap-2'>
          <a 
            href="/" 
            target="_blank" 
            className="flex items-center gap-2 px-4 py-2 bg-gray-700 text-white rounded-lg text-sm hover:bg-gray-600 transition-colors"
          >
            <Eye className="w-4 h-4" /> 访问主站
          </a>
          <button 
            onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg text-sm hover:bg-red-700 transition-colors"
          >
            <LogOut className="w-4 h-4" /> 登出
          </button>
        </div>
      </header>

      <div className="mb-6 flex gap-4">
        <button
          onClick={openFormForAdd}
          className="flex items-center gap-2 px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-5 h-5" /> 添加新软件
        </button>
        
        {/* 批量导入按钮 */}
        <button
          onClick={handleBulkImport}
          disabled={isImporting}
          className="flex items-center gap-2 px-5 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:bg-gray-500"
        >
          <UploadCloud className="w-5 h-5" /> 
          {isImporting ? '导入中...' : '批量导入 (仅一次)'}
        </button>
        
      </div>

      {/* 表单 (模态框) */}
      {isFormOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 p-6 rounded-lg shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold mb-4">{currentSoftware ? '编辑软件' : '添加软件'}</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <input type="text" name="category" value={formData.category} onChange={handleFormChange} placeholder="分类 (例如: 系统安装)" className="w-full p-3 rounded bg-gray-700 text-white border border-gray-600 focus:ring-blue-500" required />
              <input type="text" name="name" value={formData.name} onChange={handleFormChange} placeholder="软件名称" className="w-full p-3 rounded bg-gray-700 text-white border border-gray-600 focus:ring-blue-500" required />
              <textarea name="description" value={formData.description} onChange={handleFormChange} placeholder="软件描述" className="w-full p-3 rounded bg-gray-700 text-white border border-gray-600 focus:ring-blue-500" rows="3"></textarea>
              <input type="date" name="updatedAt" value={formData.updatedAt} onChange={handleFormChange} className="w-full p-3 rounded bg-gray-700 text-white border border-gray-600 focus:ring-blue-500" required />
              <input type="text" name="downloadUrl" value={formData.downloadUrl} onChange={handleFormChange} placeholder="下载链接 (URL)" className="w-full p-3 rounded bg-gray-700 text-white border border-gray-600 focus:ring-blue-500" required />
              <div className="flex justify-end gap-3 pt-4">
                <button type="button" onClick={closeForm} className="px-4 py-2 bg-gray-600 rounded hover:bg-gray-500">取消</button>
                <button type="submit" className="px-4 py-2 bg-blue-600 rounded hover:bg-blue-700">保存</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 软件列表 */}
      {loading && <p>加载中...</p>}
      {error && <p className="text-red-500">{error}</p>}
      <div className="space-y-6">
        {Object.entries(softwareList).map(([category, softwares]) => (
          <div key={category}>
            <h2 className="text-2xl font-semibold mb-3 text-blue-500 border-b border-gray-700 pb-2">{category}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {softwares.map(s => (
                <div key={s.id} className="bg-gray-800 p-4 rounded-lg shadow-lg">
                  <h3 className="text-lg font-bold">{s.name}</h3>
                  <p className="text-sm text-gray-400 truncate mb-1" title={s.description}>{s.description || '无描述'}</p>
                  <p className="text-xs text-gray-500 mb-3">更新于: {s.updatedAt}</p>
                  <a href={s.downloadUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-3 py-1.5 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 transition-colors w-min truncate">
                    <Download className="w-4 h-4" /> <span>{s.downloadUrl}</span>
                  </a>
                  <div className="flex gap-2 mt-4">
                    <button onClick={() => openFormForEdit(s)} className="flex items-center gap-1 px-3 py-1 bg-yellow-600 text-white rounded text-sm hover:bg-yellow-700">
                      <Edit className="w-3 h-3" /> 编辑
                    </button>
                    <button onClick={() => handleDelete(s.id)} className="flex items-center gap-1 px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700">
                      <Trash className="w-3 h-3" /> 删除
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// 主组件：决定显示登录页还是管理面板
const Admin = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 监听认证状态
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (!currentUser) {
        try {
          // --- Canvas 环境特定代码：尝试使用初始令牌登录 ---
          if (typeof __initial_auth_token !== 'undefined') {
            await signInWithCustomToken(auth, __initial_auth_token);
          }
        } catch (err) {
          console.error("Admin Auth Token 登录失败: ", err);
        }
      }
      setUser(auth.currentUser); // 再次检查 auth.currentUser
      setLoading(false);
    });
    
    // 清理
    return () => unsubscribe();
  }, []);

  if (loading) {
    return <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">加载中...</div>;
  }

  // 如果用户已登录（管理员或 Canvas 令牌），则显示面板
  // 否则，显示管理员登录界面
  return user ? <AdminPanel user={user} /> : <AdminLogin onLogin={() => {}} />;
};

export default Admin;
