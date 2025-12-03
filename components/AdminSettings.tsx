
import React, { useState, useRef } from 'react';
import { Employee, ShiftType, EmailConfig, ScheduleData } from '../types';
import { X, Users, CalendarClock, Settings, Save, Mail, Download, Upload, Plus, Trash2, ArrowUp, ArrowDown, Check, GripVertical } from 'lucide-react';
import { exportScheduleToExcel, parseExcelToSchedule } from '../services/excelService';

interface AdminSettingsProps {
  isOpen: boolean;
  onClose: () => void;
  // Member Props
  employees: Employee[];
  setEmployees: (emps: Employee[]) => void;
  // Shift Props
  shiftTypes: ShiftType[];
  setShiftTypes: (shifts: ShiftType[]) => void;
  // Rule Props
  requiredShiftsByDay: Record<number, string[]>;
  setRequiredShiftsByDay: (rules: Record<number, string[]>) => void;
  // System/Email Props
  emailConfig: EmailConfig;
  setEmailConfig: (config: EmailConfig) => void;
  // Excel Props
  year: number;
  month: number;
  schedule: ScheduleData;
  setSchedule: (data: ScheduleData) => void;
}

const COLORS = [
  { bg: 'bg-white', text: 'text-gray-900', label: '白' },
  { bg: 'bg-gray-100', text: 'text-gray-900', label: 'グレー' },
  { bg: 'bg-red-50', text: 'text-red-900', label: '薄赤' },
  { bg: 'bg-orange-50', text: 'text-orange-900', label: '薄橙' },
  { bg: 'bg-yellow-50', text: 'text-yellow-900', label: '薄黄' },
  { bg: 'bg-green-50', text: 'text-green-900', label: '薄緑' },
  { bg: 'bg-blue-50', text: 'text-blue-900', label: '薄青' },
  { bg: 'bg-indigo-50', text: 'text-indigo-900', label: '薄藍' },
  { bg: 'bg-purple-50', text: 'text-purple-900', label: '薄紫' },
];

const SHIFT_COLORS = [
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

const AdminSettings: React.FC<AdminSettingsProps> = ({
  isOpen, onClose,
  employees, setEmployees,
  shiftTypes, setShiftTypes,
  requiredShiftsByDay, setRequiredShiftsByDay,
  emailConfig, setEmailConfig,
  year, month, schedule, setSchedule
}) => {
  const [activeTab, setActiveTab] = useState<'members' | 'shifts' | 'rules' | 'system'>('members');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // --- MEMBER STATE ---
  const [editingEmpId, setEditingEmpId] = useState<string | null>(null);
  const [empEditForm, setEmpEditForm] = useState<Partial<Employee>>({});
  const [isAddingEmp, setIsAddingEmp] = useState(false);
  const [newEmp, setNewEmp] = useState<Partial<Employee>>({ name: '', role: '', isHolidayManaged: true });

  // --- SHIFT STATE ---
  const [editingShiftId, setEditingShiftId] = useState<string | null>(null);
  const [shiftEditForm, setShiftEditForm] = useState<Partial<ShiftType>>({});
  const [isAddingShift, setIsAddingShift] = useState(false);
  const [newShift, setNewShift] = useState<Partial<ShiftType>>({ color: 'bg-gray-100', textColor: 'text-gray-900' });

  // --- SYSTEM STATE ---
  const [localEmailConfig, setLocalEmailConfig] = useState(emailConfig);

  if (!isOpen) return null;

  // --- MEMBER LOGIC ---
  const moveEmp = (index: number, direction: 'up' | 'down') => {
    const newItems = [...employees];
    const target = direction === 'up' ? index - 1 : index + 1;
    if (target < 0 || target >= newItems.length) return;
    [newItems[index], newItems[target]] = [newItems[target], newItems[index]];
    setEmployees(newItems);
  };
  const deleteEmp = (id: string) => {
      if (confirm('削除してもよろしいですか？')) setEmployees(employees.filter(e => e.id !== id));
  };
  const startEmpEdit = (e: Employee) => { setEditingEmpId(e.id); setEmpEditForm({...e}); };
  const saveEmpEdit = () => {
      setEmployees(employees.map(e => e.id === editingEmpId ? { ...e, ...empEditForm } as Employee : e));
      setEditingEmpId(null);
  };
  const addNewEmp = () => {
      if(!newEmp.name) return;
      const id = `emp_${Date.now()}`;
      setEmployees([...employees, { id, name: newEmp.name!, role: newEmp.role || '', isHolidayManaged: newEmp.isHolidayManaged ?? true, backgroundColor: newEmp.backgroundColor, showDivider: newEmp.showDivider }]);
      setNewEmp({ name: '', role: '', isHolidayManaged: true });
      setIsAddingEmp(false);
  };

  // --- SHIFT LOGIC ---
  const moveShift = (index: number, direction: 'up' | 'down') => {
    const newItems = [...shiftTypes];
    const target = direction === 'up' ? index - 1 : index + 1;
    if (target < 0 || target >= newItems.length) return;
    [newItems[index], newItems[target]] = [newItems[target], newItems[index]];
    setShiftTypes(newItems);
  };
  const deleteShift = (id: string) => {
    if (confirm('削除してもよろしいですか？')) setShiftTypes(shiftTypes.filter(s => s.id !== id));
  };
  const startShiftEdit = (s: ShiftType) => { setEditingShiftId(s.id); setShiftEditForm({...s}); };
  const saveShiftEdit = () => {
    setShiftTypes(shiftTypes.map(s => s.id === editingShiftId ? { ...s, ...shiftEditForm } as ShiftType : s));
    setEditingShiftId(null);
  };
  const addNewShift = () => {
    if(!newShift.name) return;
    const id = `custom_${Date.now()}`;
    setShiftTypes([...shiftTypes, { id, name: newShift.name!, shortName: newShift.shortName || newShift.name!, color: newShift.color!, textColor: newShift.textColor! }]);
    setNewShift({ color: 'bg-gray-100', textColor: 'text-gray-900' });
    setIsAddingShift(false);
  };

  // --- RULES LOGIC ---
  const handleAddRule = (dayIndex: number, shiftId: string) => {
    const currentRules = requiredShiftsByDay[dayIndex] || [];
    if (!currentRules.includes(shiftId)) {
        setRequiredShiftsByDay({ ...requiredShiftsByDay, [dayIndex]: [...currentRules, shiftId] });
    }
  };
  const handleRemoveRule = (dayIndex: number, shiftId: string) => {
    const updated = (requiredShiftsByDay[dayIndex] || []).filter(id => id !== shiftId);
    const newRules = { ...requiredShiftsByDay };
    if (updated.length === 0) delete newRules[dayIndex];
    else newRules[dayIndex] = updated;
    setRequiredShiftsByDay(newRules);
  };

  // --- SYSTEM LOGIC ---
  const handleEmailSave = () => { setEmailConfig(localEmailConfig); alert('メール設定を保存しました'); };
  const handleExport = () => exportScheduleToExcel(year, month, employees, schedule, shiftTypes);
  const handleImport = () => fileInputRef.current?.click();
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const imported = await parseExcelToSchedule(file, year, month, employees, shiftTypes);
    if (imported && confirm('データを上書きしてよろしいですか？')) {
        setSchedule({ ...schedule, ...imported });
    }
    e.target.value = '';
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-2xl w-[900px] h-[85vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="bg-gray-50 border-b border-gray-200 p-4 flex justify-between items-center shrink-0">
            <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                <Settings className="text-indigo-600" /> 管理設定
            </h2>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700 bg-white p-1 rounded-full shadow-sm hover:shadow">
                <X size={24} />
            </button>
        </div>

        {/* Tabs */}
        <div className="flex bg-gray-100 px-4 gap-1 shrink-0 overflow-x-auto">
            {[
                { id: 'members', label: 'メンバー管理', icon: Users },
                { id: 'shifts', label: 'シフト設定', icon: Settings },
                { id: 'rules', label: '必須ルール', icon: CalendarClock },
                { id: 'system', label: 'システム・出力', icon: Download },
            ].map(tab => (
                <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`flex items-center gap-2 px-4 py-3 text-sm font-bold border-t-2 ${
                        activeTab === tab.id 
                        ? 'bg-white text-indigo-600 border-indigo-600 rounded-t-lg' 
                        : 'bg-transparent text-gray-500 border-transparent hover:bg-gray-200'
                    }`}
                >
                    <tab.icon size={16} /> {tab.label}
                </button>
            ))}
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-6 bg-white">
            
            {/* --- MEMBERS TAB --- */}
            {activeTab === 'members' && (
                <div className="space-y-4">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left border-collapse">
                            <thead className="bg-gray-50 text-gray-600 uppercase text-xs">
                                <tr>
                                    <th className="px-3 py-2">順序</th>
                                    <th className="px-3 py-2">氏名 / 役職</th>
                                    <th className="px-3 py-2">背景色</th>
                                    <th className="px-3 py-2 text-center">休日計算</th>
                                    <th className="px-3 py-2 text-center">下に区切り線</th>
                                    <th className="px-3 py-2 text-right">操作</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {employees.map((emp, idx) => (
                                    <tr key={emp.id} className="hover:bg-gray-50">
                                        <td className="px-3 py-2 w-16">
                                            <div className="flex gap-1">
                                                <button onClick={() => moveEmp(idx, 'up')} disabled={idx===0} className="text-gray-400 hover:text-indigo-600 disabled:opacity-30"><ArrowUp size={14}/></button>
                                                <button onClick={() => moveEmp(idx, 'down')} disabled={idx===employees.length-1} className="text-gray-400 hover:text-indigo-600 disabled:opacity-30"><ArrowDown size={14}/></button>
                                            </div>
                                        </td>
                                        
                                        {editingEmpId === emp.id ? (
                                            <>
                                                <td className="px-3 py-2">
                                                    <input className="border rounded px-2 py-1 w-full mb-1" value={empEditForm.name} onChange={e=>setEmpEditForm({...empEditForm, name: e.target.value})} placeholder="氏名" />
                                                    <input className="border rounded px-2 py-1 w-full text-xs" value={empEditForm.role} onChange={e=>setEmpEditForm({...empEditForm, role: e.target.value})} placeholder="役職" />
                                                </td>
                                                <td className="px-3 py-2">
                                                     <div className="flex flex-wrap gap-1 w-32">
                                                        {COLORS.map(c => (
                                                            <button 
                                                                key={c.bg}
                                                                onClick={() => setEmpEditForm({...empEditForm, backgroundColor: c.bg === 'bg-white' ? undefined : c.bg})}
                                                                className={`w-5 h-5 rounded border border-gray-200 ${c.bg} ${((!empEditForm.backgroundColor && c.bg === 'bg-white') || empEditForm.backgroundColor === c.bg) ? 'ring-2 ring-indigo-500' : ''}`}
                                                                title={c.label}
                                                            />
                                                        ))}
                                                     </div>
                                                </td>
                                                <td className="px-3 py-2 text-center">
                                                    <input type="checkbox" checked={empEditForm.isHolidayManaged ?? true} onChange={e=>setEmpEditForm({...empEditForm, isHolidayManaged: e.target.checked})} />
                                                </td>
                                                <td className="px-3 py-2 text-center">
                                                    <input type="checkbox" checked={empEditForm.showDivider ?? false} onChange={e=>setEmpEditForm({...empEditForm, showDivider: e.target.checked})} />
                                                </td>
                                                <td className="px-3 py-2 text-right">
                                                    <button onClick={saveEmpEdit} className="bg-indigo-600 text-white p-1 rounded mr-1"><Check size={16}/></button>
                                                    <button onClick={()=>setEditingEmpId(null)} className="bg-gray-200 text-gray-600 p-1 rounded"><X size={16}/></button>
                                                </td>
                                            </>
                                        ) : (
                                            <>
                                                <td className="px-3 py-2">
                                                    <div className="font-bold">{emp.name}</div>
                                                    <div className="text-xs text-gray-500">{emp.role}</div>
                                                </td>
                                                <td className="px-3 py-2">
                                                    <div className={`w-6 h-6 rounded border border-gray-200 ${emp.backgroundColor || 'bg-white'}`}></div>
                                                </td>
                                                <td className="px-3 py-2 text-center">
                                                    {(emp.isHolidayManaged ?? true) ? <Check size={16} className="mx-auto text-green-500"/> : <span className="text-gray-300">-</span>}
                                                </td>
                                                <td className="px-3 py-2 text-center">
                                                    {emp.showDivider ? <div className="h-0.5 w-8 bg-gray-800 mx-auto"></div> : <span className="text-gray-300">-</span>}
                                                </td>
                                                <td className="px-3 py-2 text-right">
                                                    <button onClick={()=>startEmpEdit(emp)} className="text-indigo-600 hover:underline text-xs mr-2">編集</button>
                                                    <button onClick={()=>deleteEmp(emp.id)} className="text-red-500 hover:bg-red-50 p-1 rounded"><Trash2 size={14}/></button>
                                                </td>
                                            </>
                                        )}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    
                    {isAddingEmp ? (
                        <div className="bg-gray-50 p-4 rounded border border-gray-200 flex gap-4 items-end">
                            <div className="flex-1">
                                <label className="text-xs font-bold block mb-1">氏名</label>
                                <input className="border p-2 rounded w-full text-sm" value={newEmp.name} onChange={e=>setNewEmp({...newEmp, name: e.target.value})} placeholder="氏名" />
                            </div>
                            <div className="flex-1">
                                <label className="text-xs font-bold block mb-1">役職</label>
                                <input className="border p-2 rounded w-full text-sm" value={newEmp.role} onChange={e=>setNewEmp({...newEmp, role: e.target.value})} placeholder="役職" />
                            </div>
                            <div className="w-32">
                                <label className="text-xs font-bold block mb-1">背景色</label>
                                <div className="flex gap-1 flex-wrap">
                                    {COLORS.map(c => (
                                        <button key={c.bg} onClick={()=>setNewEmp({...newEmp, backgroundColor: c.bg === 'bg-white' ? undefined : c.bg})} className={`w-5 h-5 rounded border ${c.bg} ${((!newEmp.backgroundColor && c.bg==='bg-white') || newEmp.backgroundColor===c.bg) ? 'ring-2 ring-indigo-500' : ''}`} />
                                    ))}
                                </div>
                            </div>
                            <div>
                                <button onClick={()=>setIsAddingEmp(false)} className="text-gray-500 mr-2 text-sm">キャンセル</button>
                                <button onClick={addNewEmp} className="bg-indigo-600 text-white px-3 py-2 rounded text-sm">追加</button>
                            </div>
                        </div>
                    ) : (
                        <button onClick={()=>setIsAddingEmp(true)} className="w-full py-2 border-2 border-dashed text-gray-400 hover:text-indigo-600 hover:border-indigo-400 rounded-lg flex justify-center items-center gap-2">
                            <Plus size={18}/> メンバーを追加
                        </button>
                    )}
                </div>
            )}

            {/* --- SHIFTS TAB --- */}
            {activeTab === 'shifts' && (
                <div className="space-y-3">
                    {shiftTypes.map((shift, index) => (
                        <div key={shift.id} className="flex items-center gap-3 p-3 bg-white border border-gray-200 rounded-lg">
                             <div className="flex flex-col gap-1 text-gray-400">
                                <button onClick={() => moveShift(index, 'up')} disabled={index === 0} className="hover:text-indigo-600 disabled:opacity-30"><ArrowUp size={14} /></button>
                                <button onClick={() => moveShift(index, 'down')} disabled={index === shiftTypes.length - 1} className="hover:text-indigo-600 disabled:opacity-30"><ArrowDown size={14} /></button>
                            </div>
                            
                            {editingShiftId === shift.id ? (
                                <div className="flex-1 flex gap-2 items-center">
                                    <div className="flex-1 space-y-1">
                                        <input value={shiftEditForm.name} onChange={e => setShiftEditForm({...shiftEditForm, name: e.target.value})} className="border p-1 rounded text-sm w-full" placeholder="名称" />
                                        <input value={shiftEditForm.shortName} onChange={e => setShiftEditForm({...shiftEditForm, shortName: e.target.value})} className="border p-1 rounded text-sm w-24" placeholder="略称" />
                                    </div>
                                    <div className="grid grid-cols-6 gap-1">
                                        {SHIFT_COLORS.map(c => (
                                            <button key={c.bg} onClick={() => setShiftEditForm({...shiftEditForm, color: c.bg, textColor: c.text})} className={`w-5 h-5 rounded-full ${c.bg} ${shiftEditForm.color === c.bg ? 'ring-2 ring-indigo-500' : ''}`} />
                                        ))}
                                    </div>
                                    <button onClick={saveShiftEdit} className="p-2 bg-green-100 text-green-700 rounded"><Check size={18} /></button>
                                </div>
                            ) : (
                                <>
                                    <div className={`w-10 h-10 rounded flex items-center justify-center font-bold text-xs ${shift.color} ${shift.textColor}`}>
                                        {shift.shortName}
                                    </div>
                                    <div className="flex-1">
                                        <div className="font-bold text-sm">{shift.name}</div>
                                    </div>
                                    <button onClick={()=>startShiftEdit(shift)} className="text-sm text-indigo-600 hover:underline">編集</button>
                                    <button onClick={()=>deleteShift(shift.id)} className="text-gray-400 hover:text-red-500 p-2"><Trash2 size={16}/></button>
                                </>
                            )}
                        </div>
                    ))}
                    {isAddingShift ? (
                        <div className="p-4 bg-indigo-50 rounded border border-indigo-100">
                             <div className="flex gap-2 mb-2">
                                <input className="border p-2 rounded text-sm flex-1" placeholder="名称" value={newShift.name} onChange={e => setNewShift({...newShift, name: e.target.value})} />
                                <input className="border p-2 rounded text-sm w-24" placeholder="略称" value={newShift.shortName} onChange={e => setNewShift({...newShift, shortName: e.target.value})} />
                             </div>
                             <div className="flex gap-2 mb-2">
                                {SHIFT_COLORS.map(c => (
                                    <button key={c.bg} onClick={() => setNewShift({...newShift, color: c.bg, textColor: c.text})} className={`w-6 h-6 rounded-full ${c.bg} ${newShift.color === c.bg ? 'ring-2 ring-indigo-500' : ''}`} />
                                ))}
                             </div>
                             <div className="text-right">
                                 <button onClick={()=>setIsAddingShift(false)} className="text-gray-500 text-sm mr-2">キャンセル</button>
                                 <button onClick={addNewShift} className="bg-indigo-600 text-white px-3 py-1 rounded text-sm">追加</button>
                             </div>
                        </div>
                    ) : (
                        <button onClick={()=>setIsAddingShift(true)} className="w-full py-2 border-2 border-dashed text-gray-400 hover:text-indigo-600 rounded-lg flex justify-center items-center gap-2">
                            <Plus size={18}/> シフト種別を追加
                        </button>
                    )}
                </div>
            )}

            {/* --- RULES TAB --- */}
            {activeTab === 'rules' && (
                 <div className="space-y-4">
                     <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded">各曜日に最低1名は配置しなければならないシフトを設定します。</p>
                     {WEEK_DAYS.map((dayName, index) => {
                         const ruleIds = requiredShiftsByDay[index] || [];
                         return (
                            <div key={index} className="flex items-center justify-between p-3 border rounded hover:bg-gray-50">
                                <div className="flex items-center gap-3 w-20 font-bold text-gray-700">
                                    {dayName}曜日
                                </div>
                                <div className="flex-1 flex flex-wrap gap-2 items-center">
                                    {ruleIds.map(rid => {
                                        const s = shiftTypes.find(t => t.id === rid);
                                        return s ? (
                                            <span key={rid} className={`flex items-center gap-1 px-2 py-1 rounded text-xs font-bold ${s.color} ${s.textColor}`}>
                                                {s.name}
                                                <button onClick={()=>handleRemoveRule(index, rid)} className="hover:bg-black/10 rounded-full p-0.5"><X size={10}/></button>
                                            </span>
                                        ) : null;
                                    })}
                                    <select 
                                        className="text-xs border rounded p-1"
                                        onChange={(e) => { if(e.target.value) { handleAddRule(index, e.target.value); e.target.value=''; } }}
                                    >
                                        <option value="">+ 追加</option>
                                        {shiftTypes.filter(s => !ruleIds.includes(s.id)).map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                                    </select>
                                </div>
                            </div>
                         );
                     })}
                 </div>
            )}

            {/* --- SYSTEM TAB --- */}
            {activeTab === 'system' && (
                <div className="space-y-8">
                    {/* Excel Section */}
                    <div className="space-y-4">
                        <h3 className="font-bold text-gray-800 border-b pb-2">Excel 入出力</h3>
                        <div className="flex gap-4">
                            <button onClick={handleExport} className="flex-1 bg-green-50 text-green-700 border border-green-200 p-4 rounded-lg hover:bg-green-100 flex flex-col items-center gap-2">
                                <Download size={24} />
                                <span className="font-bold">Excel エクスポート</span>
                                <span className="text-xs">現在の勤務表をダウンロード</span>
                            </button>
                            <button onClick={handleImport} className="flex-1 bg-blue-50 text-blue-700 border border-blue-200 p-4 rounded-lg hover:bg-blue-100 flex flex-col items-center gap-2">
                                <Upload size={24} />
                                <span className="font-bold">Excel インポート</span>
                                <span className="text-xs">ファイルを読み込んで反映</span>
                            </button>
                            <input type="file" ref={fileInputRef} className="hidden" accept=".xlsx,.xls" onChange={handleFileChange} />
                        </div>
                    </div>

                    {/* Email Section */}
                    <div className="space-y-4">
                         <h3 className="font-bold text-gray-800 border-b pb-2">メール自動送信設定</h3>
                         <div className="space-y-4 bg-gray-50 p-4 rounded-lg border border-gray-200">
                             <div className="flex items-center gap-3">
                                <input 
                                    type="checkbox" 
                                    id="emailToggle"
                                    checked={localEmailConfig.enabled}
                                    onChange={(e) => setLocalEmailConfig({...localEmailConfig, enabled: e.target.checked})}
                                    className="w-5 h-5 text-indigo-600 rounded"
                                />
                                <label htmlFor="emailToggle" className="font-bold text-gray-700">自動送信を有効にする</label>
                             </div>
                             
                             <div className={!localEmailConfig.enabled ? 'opacity-50 pointer-events-none' : ''}>
                                 <div className="grid grid-cols-2 gap-4">
                                     <div>
                                         <label className="block text-xs font-bold text-gray-500 mb-1">送信時間</label>
                                         <input type="time" className="border p-2 rounded w-full" value={localEmailConfig.sendTime} onChange={e=>setLocalEmailConfig({...localEmailConfig, sendTime: e.target.value})} />
                                     </div>
                                     <div>
                                         <label className="block text-xs font-bold text-gray-500 mb-1">送信先アドレス</label>
                                         <input type="email" className="border p-2 rounded w-full" value={localEmailConfig.toAddress} onChange={e=>setLocalEmailConfig({...localEmailConfig, toAddress: e.target.value})} placeholder="example@com" />
                                     </div>
                                 </div>
                             </div>
                             <div className="text-right">
                                 <button onClick={handleEmailSave} className="bg-indigo-600 text-white px-4 py-2 rounded text-sm hover:bg-indigo-700">保存</button>
                             </div>
                         </div>
                    </div>
                </div>
            )}

        </div>
      </div>
    </div>
  );
};

export default AdminSettings;
