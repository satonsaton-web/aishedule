import React, { useState } from 'react';
import { EmailConfig } from '../types';
import { X, Save, Clock, Mail } from 'lucide-react';

interface EmailSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: EmailConfig;
  onSave: (config: EmailConfig) => void;
}

const EmailSettingsModal: React.FC<EmailSettingsModalProps> = ({
  isOpen,
  onClose,
  config,
  onSave
}) => {
  const [enabled, setEnabled] = useState(config.enabled);
  const [sendTime, setSendTime] = useState(config.sendTime);
  const [toAddress, setToAddress] = useState(config.toAddress);

  if (!isOpen) return null;

  const handleSave = () => {
    onSave({ enabled, sendTime, toAddress });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-2xl w-96 p-6">
        <div className="flex justify-between items-center mb-6 border-b border-gray-100 pb-2">
          <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
            <Mail className="text-indigo-600" /> メール自動送信設定
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={24} />
          </button>
        </div>

        <div className="space-y-4">
          <div className="flex items-center gap-3 mb-4">
            <div className="relative inline-block w-12 mr-2 align-middle select-none transition duration-200 ease-in">
                <input 
                    type="checkbox" 
                    name="toggle" 
                    id="toggle" 
                    checked={enabled}
                    onChange={(e) => setEnabled(e.target.checked)}
                    className="toggle-checkbox absolute block w-6 h-6 rounded-full bg-white border-4 appearance-none cursor-pointer peer checked:right-0 right-6"
                />
                <label 
                    htmlFor="toggle" 
                    className={`toggle-label block overflow-hidden h-6 rounded-full cursor-pointer ${enabled ? 'bg-indigo-600' : 'bg-gray-300'}`}
                ></label>
            </div>
            <label htmlFor="toggle" className="text-sm font-bold text-gray-700">自動送信を有効にする</label>
          </div>
            <style jsx>{`
                .toggle-checkbox:checked {
                    right: 0;
                    border-color: #4f46e5;
                }
                .toggle-checkbox {
                    right: 24px;
                    border-color: #d1d5db;
                    transition: all 0.3s;
                }
            `}</style>

          <div className={!enabled ? 'opacity-50 pointer-events-none' : ''}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                    <div className="flex items-center gap-1">
                        <Clock size={16} /> 送信時間 (毎日)
                    </div>
                </label>
                <input
                    type="time"
                    value={sendTime}
                    onChange={(e) => setSendTime(e.target.value)}
                    className="w-full border border-gray-300 rounded px-3 py-2 focus:ring-1 focus:ring-indigo-500 outline-none"
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                     <div className="flex items-center gap-1">
                        <Mail size={16} /> 送信先メールアドレス
                    </div>
                </label>
                <input
                    type="email"
                    value={toAddress}
                    onChange={(e) => setToAddress(e.target.value)}
                    placeholder="example@company.com"
                    className="w-full border border-gray-300 rounded px-3 py-2 focus:ring-1 focus:ring-indigo-500 outline-none"
                />
              </div>
          </div>
        </div>

        <div className="flex justify-end gap-2 mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded"
          >
            キャンセル
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 text-sm bg-indigo-600 text-white rounded hover:bg-indigo-700 shadow-sm flex items-center gap-2"
          >
            <Save size={16} /> 保存
          </button>
        </div>
      </div>
    </div>
  );
};

export default EmailSettingsModal;