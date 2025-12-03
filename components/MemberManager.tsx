import React, { useState } from 'react';
import { Employee } from '../types';
import { X, ArrowUp, ArrowDown, Plus, Trash2, Check, User } from 'lucide-react';

interface MemberManagerProps {
  isOpen: boolean;
  onClose: () => void;
  employees: Employee[];
  setEmployees: (employees: Employee[]) => void;
}

const MemberManager: React.FC<MemberManagerProps> = ({ isOpen, onClose, employees, setEmployees }) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<Employee>>({});
  
  // New Item State
  const [isAdding, setIsAdding] = useState(false);
  const [newMember, setNewMember] = useState<Partial<Employee>>({
    name: '',
    role: ''
  });

  if (!isOpen) return null;

  const moveUp = (index: number) => {
    if (index === 0) return;
    const newItems = [...employees];
    [newItems[index - 1], newItems[index]] = [newItems[index], newItems[index - 1]];
    setEmployees(newItems);
  };

  const moveDown = (index: number) => {
    if (index === employees.length - 1) return;
    const newItems = [...employees];
    [newItems[index + 1], newItems[index]] = [newItems[index], newItems[index + 1]];
    setEmployees(newItems);
  };

  const handleDelete = (id: string) => {
    if (confirm('このメンバーを削除してもよろしいですか？\n(過去のシフトデータは残りますが表示されなくなります)')) {
      setEmployees(employees.filter(e => e.id !== id));
    }
  };

  const startEdit = (emp: Employee) => {
    setEditingId(emp.id);
    setEditForm({ ...emp });
  };

  const saveEdit = () => {
    setEmployees(employees.map(e => e.id === editingId ? { ...e, ...editForm } as Employee : e));
    setEditingId(null);
  };

  const addNew = () => {
    if (!newMember.name) return;
    const id = `emp_${Date.now()}`;
    const newItem: Employee = {
      id,
      name: newMember.name || '',
      role: newMember.role || 'スタッフ'
    };
    setEmployees([...employees, newItem]);
    setNewMember({ name: '', role: '' });
    setIsAdding(false);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-2xl w-[600px] max-h-[80vh] flex flex-col">
        <div className="p-6 border-b border-gray-200 flex justify-between items-center bg-gray-50 rounded-t-xl">
          <div className="flex items-center gap-2">
            <User className="text-indigo-600" />
            <h2 className="text-xl font-bold text-gray-800">メンバー管理</h2>
          </div>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X size={24} />
          </button>
        </div>

        <div className="p-6 overflow-y-auto custom-scrollbar flex-1">
          <div className="space-y-2">
            {employees.map((emp, index) => (
              <div key={emp.id} className="flex items-center gap-3 p-3 bg-white border border-gray-200 rounded-lg hover:shadow-sm transition-shadow">
                {/* Reorder Controls */}
                <div className="flex flex-col gap-1 text-gray-400">
                  <button onClick={() => moveUp(index)} disabled={index === 0} className="hover:text-indigo-600 disabled:opacity-30">
                    <ArrowUp size={14} />
                  </button>
                  <button onClick={() => moveDown(index)} disabled={index === employees.length - 1} className="hover:text-indigo-600 disabled:opacity-30">
                    <ArrowDown size={14} />
                  </button>
                </div>

                {/* Content */}
                {editingId === emp.id ? (
                  <div className="flex-1 flex gap-2 items-center">
                    <div className="flex-1 space-y-2">
                       <input 
                         value={editForm.name} 
                         onChange={e => setEditForm({...editForm, name: e.target.value})}
                         className="w-full border p-1 rounded text-sm" placeholder="氏名"
                       />
                       <input 
                         value={editForm.role} 
                         onChange={e => setEditForm({...editForm, role: e.target.value})}
                         className="w-full border p-1 rounded text-sm" placeholder="役職/ロール"
                       />
                    </div>
                    <button onClick={saveEdit} className="p-2 bg-green-100 text-green-700 rounded hover:bg-green-200"><Check size={18} /></button>
                  </div>
                ) : (
                  <>
                    <div className="flex-1">
                      <div className="font-bold text-gray-800">{emp.name}</div>
                      <div className="text-xs text-gray-500">{emp.role}</div>
                    </div>
                    <button onClick={() => startEdit(emp)} className="text-sm text-indigo-600 hover:underline">編集</button>
                    <button onClick={() => handleDelete(emp.id)} className="text-gray-400 hover:text-red-500 p-2">
                      <Trash2 size={16} />
                    </button>
                  </>
                )}
              </div>
            ))}
          </div>

          {/* Add New */}
          {isAdding ? (
             <div className="mt-4 p-4 border border-indigo-100 bg-indigo-50 rounded-lg">
                <h4 className="text-sm font-bold text-indigo-900 mb-2">新規メンバー追加</h4>
                <div className="flex gap-2 mb-2">
                  <input 
                     className="flex-1 border p-2 rounded text-sm"
                     placeholder="氏名 (例: 山田 花子)"
                     value={newMember.name}
                     onChange={e => setNewMember({...newMember, name: e.target.value})}
                  />
                  <input 
                     className="flex-1 border p-2 rounded text-sm"
                     placeholder="役職 (例: 制作)"
                     value={newMember.role}
                     onChange={e => setNewMember({...newMember, role: e.target.value})}
                  />
                </div>
                <div className="flex gap-2 justify-end">
                   <button onClick={() => setIsAdding(false)} className="text-sm text-gray-500 hover:text-gray-700">キャンセル</button>
                   <button onClick={addNew} className="bg-indigo-600 text-white px-3 py-1 rounded text-sm hover:bg-indigo-700">追加</button>
                </div>
             </div>
          ) : (
             <button 
               onClick={() => setIsAdding(true)}
               className="mt-4 w-full py-2 border-2 border-dashed border-gray-300 text-gray-500 rounded-lg hover:border-indigo-400 hover:text-indigo-600 flex items-center justify-center gap-2 transition-colors"
             >
               <Plus size={18} />
               <span>メンバーを追加</span>
             </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default MemberManager;