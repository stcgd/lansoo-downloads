import React, { useState } from 'react';
// 修复：将 JSON 导入路径改回最原始的相对路径 './data/software.json'
import softwareData from './data/software.json'; 
// 修复：确保 firebaseConfig 模块被正确导入，该文件现在已在下方生成。
import { db, collection, doc, writeBatch } from "./firebaseConfig.js";
// 不需要 getAuth，因为它已经在 firebaseConfig 中初始化并使用。

// --- Canvas 环境特定代码 ---
const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';

const Admin = () => {
    // 假设的状态和逻辑，用于管理软件列表和批量导入
    const [message, setMessage] = useState('');
    const [isImporting, setIsImporting] = useState(false);
    
    // 确保 JSON 文件的路径是正确的：./data/software.json
    const totalItems = Object.values(softwareData).flat().length; 

    // 实际的批量导入逻辑
    const handleBulkImport = async () => {
        // 确保数据库存在且初始化成功
        if (!db) {
            setMessage('错误: Firestore 数据库未初始化。');
            return;
        }

        setIsImporting(true);
        setMessage(`正在开始导入 ${totalItems} 条软件记录...`);

        try {
            // 1. 创建批量写入实例
            const batch = writeBatch(db);
            // 公共数据路径：artifacts/{appId}/public/data/software
            const softwareColRef = collection(db, `artifacts/${appId}/public/data/software`);
            let count = 0;

            // 2. 遍历 JSON 数据，按分类写入
            Object.entries(softwareData).forEach(([category, items]) => {
                items.forEach(item => {
                    // 创建一个新的文档引用
                    const newDocRef = doc(softwareColRef); 
                    batch.set(newDocRef, { 
                        // 确保每个文档都包含 category 字段
                        ...item, 
                        category: category,
                        createdAt: new Date().toISOString(), // 增加创建时间
                    });
                    count++;
                });
            });

            // 3. 提交批量写入
            await batch.commit();

            setMessage(`成功导入 ${count} 条软件记录到 Firebase Firestore！现在主页应该能显示数据了。`);

        } catch (error) {
            console.error("批量导入失败:", error);
            setMessage(`批量导入失败: ${error.message}`);
        } finally {
            setIsImporting(false);
        }
    };

    // 假设 Admin 组件的其余部分
    return (
        <div className="p-4 max-w-4xl mx-auto dark:bg-gray-900 min-h-screen">
            <h1 className="text-3xl font-bold mb-6 text-gray-900 dark:text-white">管理员面板</h1>
            
            <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg mb-6 border border-indigo-500/50">
                <h2 className="text-xl font-semibold mb-4 dark:text-white">批量数据导入工具</h2>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                    已从 `src/data/software.json` 加载数据，共包含 **{totalItems}** 个软件项目。
                    点击下方按钮将这些数据一次性导入到 Firestore 数据库。
                </p>
                <button
                    onClick={handleBulkImport}
                    disabled={isImporting}
                    className={`font-bold py-3 px-6 rounded-lg transition duration-300 shadow-md ${
                        isImporting 
                            ? 'bg-gray-500 cursor-not-allowed' 
                            : 'bg-indigo-600 hover:bg-indigo-700 text-white'
                    }`}
                >
                    {isImporting ? '正在导入中...' : `执行批量导入 (${totalItems} 项)`}
                </button>
                {message && (
                    <p className={`mt-4 text-sm font-medium ${message.includes('失败') ? 'text-red-500' : 'text-green-600 dark:text-green-400'}`}>{message}</p>
                )}
            </div>

            <div className="mt-8 bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg">
                <h2 className="text-xl font-semibold mb-4 dark:text-white">下一步操作</h2>
                <p className="text-gray-600 dark:text-gray-400">
                    导入成功后，请访问主页 (例如: `/`) 即可看到数据。请注意，数据导入是幂等的，重复导入会创建重复的数据条目。
                </p>
            </div>
        </div>
    );
};

export default Admin;
