import React, { useState, useEffect } from 'react';
import { X, MessageSquare } from 'lucide-react';

interface NoteModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  initialValue: string;
  onSave: (value: string) => void;
}

const NoteModal: React.FC<NoteModalProps> = ({
  isOpen,
  onClose,
  title,
  initialValue,
  onSave
}) => {
  const [value, setValue] = useState('');

  useEffect(() => {
    setValue(initialValue || '');
  }, [initialValue, isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-96 p-6">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-2">
            <MessageSquare size={20} className="text-indigo-600" />
            <h3 className="text-lg font-bold text-gray-800">{title}</h3>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={24} />
          </button>
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">内容</label>
          <textarea
            className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 h-32"
            placeholder="入力してください..."
            value={value}
            onChange={(e) => setValue(e.target.value)}
            autoFocus
          />
        </div>

        <div className="flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded"
          >
            キャンセル
          </button>
          <button
            onClick={() => {
              onSave(value);
              onClose();
            }}
            className="px-4 py-2 text-sm bg-indigo-600 text-white rounded hover:bg-indigo-700 shadow-sm"
          >
            保存
          </button>
        </div>
      </div>
    </div>
  );
};

export default NoteModal;