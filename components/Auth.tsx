
import React, { useState } from 'react';
import { User } from '../types';
import { Lock, LogIn } from 'lucide-react';

interface AuthProps {
  onLogin: (user: User) => void;
}

const Auth: React.FC<AuthProps> = ({ onLogin }) => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Strict password check
    if (password === '0035') {
      onLogin({ username: '管理者', role: 'admin' });
    } else if (password === '4444') {
      onLogin({ username: '閲覧者', role: 'viewer' });
    } else {
      setError('パスワードが間違っています。正しいパスワードを入力してください。');
      setPassword('');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-sm">
        <div className="flex justify-center mb-6">
          <div className="p-4 bg-indigo-100 rounded-full text-indigo-600">
            <Lock size={32} />
          </div>
        </div>
        <h2 className="text-xl font-bold text-center text-gray-800 mb-2">スマート勤務表 AI</h2>
        <p className="text-center text-gray-500 text-sm mb-6">アクセスにはパスワードが必要です</p>
        
        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <input
              type="password"
              required
              className="w-full border border-gray-300 rounded-lg px-4 py-3 text-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none tracking-widest text-center"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="パスワードを入力"
              autoFocus
            />
          </div>
          
          {error && (
            <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg flex items-center justify-center font-bold">
              {error}
            </div>
          )}
          
          <button
            type="submit"
            className="w-full bg-indigo-600 text-white py-3 rounded-lg font-bold hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2"
          >
            <LogIn size={20} /> ログイン
          </button>
        </form>
      </div>
    </div>
  );
};

export default Auth;
