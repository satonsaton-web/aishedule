
import React, { useState, useEffect } from 'react';
import { Employee, ScheduleData } from '../types';
import { X, Copy, CalendarRange, RefreshCw } from 'lucide-react';

interface ProgramWeeklyModalProps {
  isOpen: boolean;
  onClose: () => void;
  employees: Employee[];
  schedule: ScheduleData;
  currentDate: Date;
  type: 'asadre' | 'catch';
}

const ProgramWeeklyModal: React.FC<ProgramWeeklyModalProps> = ({
  isOpen,
  onClose,
  employees,
  schedule,
  currentDate,
  type
}) => {
  const [reportText, setReportText] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Initialize dates when modal opens
  useEffect(() => {
    if (isOpen) {
      const start = new Date(currentDate);
      // Adjust to Monday
      const day = start.getDay();
      const diff = start.getDate() - day + (day === 0 ? -6 : 1);
      start.setDate(diff);
      
      const end = new Date(start);
      end.setDate(start.getDate() + 6);

      setStartDate(formatDate(start));
      setEndDate(formatDate(end));
    }
  }, [isOpen, currentDate]);

  // Regenerate report when dates or dependencies change
  useEffect(() => {
    if (isOpen && startDate && endDate) {
      generateReport();
    }
  }, [startDate, endDate, schedule, type, isOpen]);

  const formatDate = (date: Date) => {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
  };

  const generateReport = () => {
    if (!startDate || !endDate) return;

    const start = new Date(startDate);
    const end = new Date(endDate);
    const days: Date[] = [];
    
    // Create array of dates in range
    const curr = new Date(start);
    while (curr <= end) {
        days.push(new Date(curr));
        curr.setDate(curr.getDate() + 1);
    }

    const startStr = `${start.getMonth()+1}/${start.getDate()}`;
    const endStr = `${end.getMonth()+1}/${end.getDate()}`;
    
    let text = `【${type === 'asadre' ? 'あさドレ♪' : 'キャッチ！'}週間予定】\n期間: ${startStr} 〜 ${endStr}\n\n`;

    const getNames = (dateStr: string, shiftId: string) => {
        return employees
        .filter(emp => {
            const entry = schedule[dateStr]?.[emp.id];
            return entry?.shiftIds?.includes(shiftId);
        })
        .map(emp => emp.name)
        .join('、');
    };

    days.forEach(date => {
        const y = date.getFullYear();
        const m = String(date.getMonth() + 1).padStart(2, '0');
        const d = String(date.getDate()).padStart(2, '0');
        const dateStr = `${y}-${m}-${d}`;
        const w = ['日', '月', '火', '水', '木', '金', '土'][date.getDay()];

        const dailyHeader = `■ ${m}/${d} (${w})\n`;
        let lines: string[] = [];

        if (type === 'asadre') {
            const m_ = getNames(dateStr, 'asad_m');
            const s_ = getNames(dateStr, 'asad_s');
            const mid1 = getNames(dateStr, 'asa_mid_1');
            const mid2 = getNames(dateStr, 'asa_mid_2');
            
            if (m_) lines.push(`あさドM→${m_}`);
            if (s_) lines.push(`あさドS→${s_}`);
            if (mid1) lines.push(`あさ中①→${mid1}`);
            if (mid2) lines.push(`あさ中②→${mid2}`);
        } else {
            // catch
            const m_ = getNames(dateStr, 'catch_m');
            const c_ = getNames(dateStr, 'catch_c');
            const s_ = getNames(dateStr, 'catch_s');
            const e_ = getNames(dateStr, 'catch_e');
            const cn = getNames(dateStr, 'c_narr');
            const cn1 = getNames(dateStr, 'c_narr_1');
            const cn3 = getNames(dateStr, 'c_narr_3');

            if (m_) lines.push(`キャッチM→${m_}`);
            if (c_) lines.push(`キャッチC→${c_}`);
            if (s_) lines.push(`キャッチS→${s_}`);
            if (e_) lines.push(`キャッチE→${e_}`);
            if (cn) lines.push(`Cナレ→${cn}`);
            if (cn1) lines.push(`Cナレ①→${cn1}`);
            if (cn3) lines.push(`Cナレ③→${cn3}`);
        }

        if (lines.length > 0) {
            text += dailyHeader + lines.join('\n') + '\n\n';
        }
    });

    setReportText(text);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(reportText);
    alert('コピーしました');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-2xl w-[600px] max-h-[80vh] flex flex-col">
        <div className="p-4 border-b border-gray-200 bg-gray-50 rounded-t-xl flex justify-between items-center">
          <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
            <CalendarRange className="text-indigo-600" /> {type === 'asadre' ? 'あさドレ' : 'キャッチ'}週間抽出
          </h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X size={24} />
          </button>
        </div>

        <div className="p-4 bg-gray-50 border-b border-gray-200 flex items-center gap-4">
            <div className="flex items-center gap-2">
                <label className="text-xs font-bold text-gray-600">開始日</label>
                <input 
                    type="date" 
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="border border-gray-300 rounded px-2 py-1 text-sm"
                />
            </div>
            <span className="text-gray-400">〜</span>
            <div className="flex items-center gap-2">
                <label className="text-xs font-bold text-gray-600">終了日</label>
                <input 
                    type="date" 
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="border border-gray-300 rounded px-2 py-1 text-sm"
                />
            </div>
            <button onClick={generateReport} className="ml-auto p-2 bg-white border border-gray-300 rounded hover:bg-gray-100 text-gray-600" title="再生成">
                <RefreshCw size={16} />
            </button>
        </div>

        <div className="p-6 flex-1 flex flex-col">
          <textarea 
            className="w-full h-96 border border-gray-300 rounded p-4 font-mono text-sm focus:ring-2 focus:ring-indigo-500 outline-none resize-none bg-gray-50 custom-scrollbar"
            value={reportText}
            readOnly
          />
          
          <div className="mt-4 flex justify-end gap-3">
             <button 
               onClick={onClose}
               className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded"
             >
               閉じる
             </button>
             <button 
               onClick={handleCopy}
               className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 flex items-center gap-2"
             >
               <Copy size={18} /> テキストをコピー
             </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProgramWeeklyModal;
