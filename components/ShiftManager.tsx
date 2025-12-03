import React, { useState } from 'react';
import { ShiftType } from '../types';
import { X, ArrowUp, ArrowDown, Plus, Trash2, Check, Settings, CalendarClock } from 'lucide-react';

interface ShiftManagerProps {
  isOpen: boolean;
  onClose: () => void;
  shiftTypes: ShiftType[];
  setShiftTypes: (types: ShiftType[]) => void;
  requiredShiftsByDay?: Record<number, string[]>;
  setRequiredShiftsByDay?: (rules: Record<number, string[]>) => void;
}

const COLORS = [
  { bg: 'bg-gray-100', text: 'text-gray-900', label: 'グレー' },
  { bg: 'bg-red-100', text: 'text-red-900', label: '赤' },
  { bg: 'bg-orange-100', text: 'text-orange-900', label: 'オレンジ' },
  { bg: 'bg-yellow-100', text: 'text-yellow-900', label: '黄色' },
  { bg: 'bg-green-100', text: 'text-green-900', label: '緑' },
  { bg: 'bg-teal-100', text: 'text-teal-900', label: 'ティール' },
  { bg: 'bg-blue-100', text: 'text-blue-900', label: '青' },
  { bg: 'bg-indigo-100', text: 'text-indigo-900', label: 'インディゴ' },
  { bg: 'bg-purple-100', text: 'text-purple-900', label: '紫' },
  { bg: 'bg-pink-100', text: 'text-pink-900', label: 'ピンク' },
  { bg: 'bg-yellow-300', text: 'text-yellow-900', label: '濃い黄色' },
];

const WEEK_DAYS = ['日', '月', '火', '水', '木', '金', '土'];

const ShiftManager: React.FC<ShiftManagerProps> = ({ 
  isOpen, 
  onClose, 
  shiftTypes, 
  setShiftTypes,
  requiredShiftsByDay = {},
  setRequiredShiftsByDay
}) => {
  const [activeTab, setActiveTab] = useState<'types' | 'rules'>('types');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<ShiftType>>({});

  // New Item State
  const [isAdding, setIsAdding] = useState(false);
  const [newShift, setNewShift] = useState<Partial<ShiftType>>({
    name: '',
    shortName: '',
    color: 'bg-gray-100',
    textColor: 'text-gray-900'
  });

  if (!isOpen) return null;

  const moveUp = (index: number) => {
    if (index === 0) return;
    const newTypes = [...shiftTypes];
    [newTypes[index - 1], newTypes[index]] = [newTypes[index], newTypes[index - 1]];
    setShiftTypes(newTypes);
  };

  const moveDown = (index: number) => {
    if (index === shiftTypes.length - 1) return;
    const newTypes = [...shiftTypes];
    [newTypes[index + 1], newTypes[index]] = [newTypes[index], newTypes[index + 1]];
    setShiftTypes(newTypes);
  };

  const handleDelete = (e: React.MouseEvent, id: string) => {
    // STOP PROPAGATION IS CRITICAL HERE
    e.stopPropagation();
    if (window.confirm('このシフト種別を削除してもよろしいですか？')) {
      const updated = shiftTypes.filter(s => s.id !== id);
      setShiftTypes(updated);
    }
  };

  const startEdit = (shift: ShiftType) => {
    setEditingId(shift.id);
    setEditForm({ ...shift });
  };

  const saveEdit = () => {
    setShiftTypes(shiftTypes.map(s => s.id === editingId ? { ...s, ...editForm } as ShiftType : s));
    setEditingId(null);
  };

  const addNew = () => {
    if (!newShift.name || !newShift.shortName) return;
    // Use a stronger random ID
    const id = `custom_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const newItem: ShiftType = {
      id,
      name: newShift.name!,
      shortName: newShift.shortName!,
      color: newShift.color || 'bg-gray-100',
      textColor: newShift.textColor || 'text-gray-900',
    };
    setShiftTypes([...shiftTypes, newItem]);
    setNewShift({ name: '', shortName: '', color: 'bg-gray-100', textColor: 'text-gray-900' });
    setIsAdding(false);
  };

  const handleAddRule = (dayIndex: number, shiftId: string) => {
    if (!shiftId || !setRequiredShiftsByDay) return;
    const currentRules = requiredShiftsByDay[dayIndex] || [];
    if (!currentRules.includes(shiftId)) {
        const newRules = { ...requiredShiftsByDay };
        newRules[dayIndex] = [...currentRules, shiftId];
        setRequiredShiftsByDay(newRules);
    }
  };

  const handleRemoveRule = (dayIndex: number, shiftId: string) => {
    if (!setRequiredShiftsByDay) return;
    const currentRules = requiredShiftsByDay[dayIndex] || [];
    const updated = currentRules.filter(id => id !== shiftId);
    const newRules = { ...requiredShiftsByDay };
    if (updated.length === 0) {
        delete newRules[dayIndex];
    } else {
        newRules[dayIndex] = updated;
    }
    setRequiredShiftsByDay(newRules);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-2xl w-[600px] max-h-[80vh] flex flex-col">
        <div className="p-0 border-b border-gray-200 bg-gray-50 rounded-t-xl">
          <div className="flex justify-between items-center p-4 pb-2">
            <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                <Settings className="text-gray-600" /> 設定
            </h2>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
                <X size={24} />
            </button>
          </div>
          
          {/* Tabs */}
          <div className="flex px-4 gap-4 mt-2">
            <button 
                onClick={() => setActiveTab('types')}
                className={`pb-2 text-sm font-bold border-b-2 transition-colors ${
                    activeTab === 'types' 
                    ? 'border-indigo-600 text-indigo-600' 
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
            >
                シフト種別設定
            </button>
            <button 
                onClick={() => setActiveTab('rules')}
                className={`pb-2 text-sm font-bold border-b-2 transition-colors flex items-center gap-1 ${
                    activeTab === 'rules' 
                    ? 'border-indigo-600 text-indigo-600' 
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
            >
                <CalendarClock size={16} />
                曜日別必須ルール
            </button>
          </div>
        </div>

        <div className="p-6 overflow-y-auto custom-scrollbar flex-1 bg-white">
          {activeTab === 'types' ? (
            // Shift Types Tab
            <>
              <div className="space-y-3">
                {shiftTypes.map((shift, index) => (
                  <div key={shift.id} className="flex items-center gap-3 p-3 bg-white border border-gray-200 rounded-lg hover:shadow-sm transition-shadow">
                    {/* Reorder Controls */}
                    <div className="flex flex-col gap-1 text-gray-400">
                      <button onClick={() => moveUp(index)} disabled={index === 0} className="hover:text-indigo-600 disabled:opacity-30">
                        <ArrowUp size={14} />
                      </button>
                      <button onClick={() => moveDown(index)} disabled={index === shiftTypes.length - 1} className="hover:text-indigo-600 disabled:opacity-30">
                        <ArrowDown size={14} />
                      </button>
                    </div>

                    {/* Content */}
                    {editingId === shift.id ? (
                      <div className="flex-1 flex gap-2 items-center">
                        <div className="flex-1 space-y-2">
                           <input 
                             value={editForm.name} 
                             onChange={e => setEditForm({...editForm, name: e.target.value})}
                             className="w-full border p-1 rounded text-sm" placeholder="名称"
                           />
                           <input 
                             value={editForm.shortName} 
                             onChange={e => setEditForm({...editForm, shortName: e.target.value})}
                             className="w-20 border p-1 rounded text-sm" placeholder="略称"
                           />
                        </div>
                        {/* Color Picker */}
                        <div className="grid grid-cols-6 gap-1">
                          {COLORS.map(c => (
                            <button 
                              key={c.bg}
                              onClick={() => setEditForm({...editForm, color: c.bg, textColor: c.text})}
                              className={`w-5 h-5 rounded-full ${c.bg} ${editForm.color === c.bg ? 'ring-2 ring-offset-1 ring-indigo-500' : ''}`}
                              title={c.label}
                            />
                          ))}
                        </div>
                        <button onClick={saveEdit} className="p-2 bg-green-100 text-green-700 rounded hover:bg-green-200"><Check size={18} /></button>
                      </div>
                    ) : (
                      <>
                        <div className={`w-12 h-12 rounded flex items-center justify-center font-bold text-xs ${shift.color} ${shift.textColor}`}>
                          {shift.shortName}
                        </div>
                        <div className="flex-1">
                          <div className="font-bold text-sm text-gray-800">{shift.name}</div>
                          <div className="text-xs text-gray-500">ID: {shift.id}</div>
                        </div>
                        <button onClick={() => startEdit(shift)} className="text-sm text-indigo-600 hover:underline">編集</button>
                        <button 
                            onClick={(e) => handleDelete(e, shift.id)} 
                            className="text-gray-400 hover:text-red-500 p-2 rounded hover:bg-gray-100"
                        >
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
                    <h4 className="text-sm font-bold text-indigo-900 mb-2">新規追加</h4>
                    <div className="flex gap-2 mb-2">
                      <input 
                         className="flex-1 border p-2 rounded text-sm"
                         placeholder="名称 (例: リモートワーク)"
                         value={newShift.name}
                         onChange={e => setNewShift({...newShift, name: e.target.value})}
                      />
                      <input 
                         className="w-24 border p-2 rounded text-sm"
                         placeholder="略称 (例: 在宅)"
                         value={newShift.shortName}
                         onChange={e => setNewShift({...newShift, shortName: e.target.value})}
                      />
                    </div>
                    <div className="flex gap-2 mb-3">
                        {COLORS.map(c => (
                            <button 
                              key={c.bg}
                              onClick={() => setNewShift({...newShift, color: c.bg, textColor: c.text})}
                              className={`w-6 h-6 rounded-full ${c.bg} ${newShift.color === c.bg ? 'ring-2 ring-offset-1 ring-indigo-500' : ''}`}
                            />
                          ))}
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
                   <span>新しいシフト種別を追加</span>
                 </button>
              )}
            </>
          ) : (
            // Rules Tab
            <div className="space-y-4">
                <div className="bg-blue-50 border border-blue-200 p-3 rounded-lg text-sm text-blue-800 mb-4">
                    <p>各曜日に最低1名は配置しなければならないシフト種別を設定します。</p>
                    <p>設定されたシフトがその曜日に存在しない場合、カレンダーヘッダーにアラートが表示されます。</p>
                </div>

                <div className="grid gap-3">
                    {WEEK_DAYS.map((dayName, index) => {
                        const currentRuleIds = requiredShiftsByDay[index] || [];
                        return (
                            <div key={index} className="flex flex-col sm:flex-row sm:items-center justify-between p-3 border border-gray-200 rounded hover:bg-gray-50 gap-2">
                                <div className="flex items-center gap-3 w-32 shrink-0">
                                    <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center font-bold text-gray-600">
                                        {dayName}
                                    </div>
                                    <span className="font-bold text-gray-700">{dayName}曜日</span>
                                </div>
                                
                                <div className="flex-1 flex flex-wrap gap-2 items-center">
                                    {/* Display Active Rules */}
                                    {currentRuleIds.map(ruleId => {
                                        const shift = shiftTypes.find(s => s.id === ruleId);
                                        if (!shift) return null;
                                        return (
                                            <div key={ruleId} className={`flex items-center gap-1 px-2 py-1 rounded text-xs font-bold ${shift.color} ${shift.textColor}`}>
                                                {shift.name}
                                                <button onClick={() => handleRemoveRule(index, ruleId)} className="hover:bg-black/10 rounded-full p-0.5">
                                                    <X size={10} />
                                                </button>
                                            </div>
                                        );
                                    })}

                                    {/* Add Button Dropdown */}
                                    <div className="relative group">
                                        <select 
                                            className="appearance-none bg-white border border-gray-300 border-dashed text-gray-500 rounded px-2 py-1 text-xs hover:border-indigo-500 hover:text-indigo-600 cursor-pointer focus:outline-none"
                                            onChange={(e) => {
                                                if(e.target.value) {
                                                    handleAddRule(index, e.target.value);
                                                    e.target.value = ''; // Reset
                                                }
                                            }}
                                            value=""
                                        >
                                            <option value="">+ 追加</option>
                                            {shiftTypes.filter(s => !currentRuleIds.includes(s.id)).map(shift => (
                                                <option key={shift.id} value={shift.id}>
                                                    {shift.name}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ShiftManager;