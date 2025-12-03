import React, { useState } from 'react';
import { User, Role } from '../types';
import { Lock } from 'lucide-react';

interface AuthProps {
  onLogin: (user: User) => void;
}

const Auth: React.FC<AuthProps> = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // Demo authentication logic
    if (password === 'admin123') {
      onLogin({ username, role: 'admin' });
    } else if (password === 'viewer123') {
      onLogin({ username, role: 'viewer' });
    } else {
      setError('パスワードが間違っています。(デモ: admin123 または viewer123)');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-md">
        <div className="flex justify-center mb-6">
          <div className="p-4 bg-indigo-100 rounded-full text-indigo-600">
            <Lock size={32} />
          </div>
        </div>
        <h2 className="text-2xl font-bold text-center text-gray-800 mb-2">WEB 勤務表</h2>
        <p className="text-center text-gray-500 mb-6">ログインして勤務表を確認・編集します</p>
        
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">お名前 (表示用)</label>
            <input
              type="text"
              required
              className="w-full border border-gray-300 rounded px-4 py-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="山田 太郎"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">パスワード</label>
            <input
              type="password"
              required
              className="w-full border border-gray-300 rounded px-4 py-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
            />
          </div>
          
          {error && <p className="text-red-500 text-sm text-center">{error}</p>}
          
          <button
            type="submit"
            className="w-full bg-indigo-600 text-white py-2 rounded-lg font-medium hover:bg-indigo-700 transition-colors"
          >
            ログイン
          </button>
        </form>
        
        <div className="mt-6 p-4 bg-gray-50 rounded text-xs text-gray-500">
          <p className="font-bold mb-1">デモ用アカウント:</p>
          <p>管理者 (編集可): <code className="bg-gray-200 px-1 rounded">admin123</code></p>
          <p>閲覧者 (閲覧のみ): <code className="bg-gray-200 px-1 rounded">viewer123</code></p>
        </div>
      </div>
    </div>
  );
};

export default Auth;