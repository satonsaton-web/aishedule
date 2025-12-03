import React, { useState, useEffect } from 'react';
import { Employee, ScheduleData, ShiftType } from '../types';
import { X, Copy, Mail } from 'lucide-react';

interface EmailModalProps {
  isOpen: boolean;
  onClose: () => void;
  employees: Employee[];
  schedule: ScheduleData;
  currentDate: Date; // To determine "Tomorrow"
}

const EmailModal: React.FC<EmailModalProps> = ({
  isOpen,
  onClose,
  employees,
  schedule,
  currentDate
}) => {
  const [emailText, setEmailText] = useState('');
  const [targetDateStr, setTargetDateStr] = useState('');

  useEffect(() => {
    if (isOpen) {
      // Calculate "Tomorrow"
      const tomorrow = new Date(currentDate);
      tomorrow.setDate(tomorrow.getDate() + 1);
      
      const y = tomorrow.getFullYear();
      const m = String(tomorrow.getMonth() + 1).padStart(2, '0');
      const d = String(tomorrow.getDate()).padStart(2, '0');
      const dateStr = `${y}-${m}-${d}`;
      const dayOfWeek = ['日', '月', '火', '水', '木', '金', '土'][tomorrow.getDay()];
      
      setTargetDateStr(`${m}/${d}(${dayOfWeek})`);
      generateEmail(dateStr, `${m}/${d}(${dayOfWeek})`);
    }
  }, [isOpen, currentDate, schedule]);

  const getNamesForShift = (dateStr: string, shiftId: string): string => {
    return employees
      .filter(emp => {
        const entry = schedule[dateStr]?.[emp.id];
        return entry?.shiftIds?.includes(shiftId);
      })
      .map(emp => emp.name)
      .join('、');
  };

  const generateEmail = (dateStr: string, formattedDate: string) => {
    // Helper to get formatted line or empty string
    const line = (label: string, shiftId: string) => {
      const names = getNamesForShift(dateStr, shiftId);
      return names ? `${label}→${names}` : '';
    };

    // Special logic for Catch C (don't show if empty) -> Handled by generic logic above returning empty string, but we need to filter empty lines later.
    
    // Night Standby is Night N
    const nightStandbyNames = getNamesForShift(dateStr, 'night_n');
    const nightLine = nightStandbyNames ? `夜間スタンバイ→${nightStandbyNames}` : '';

    // Build the blocks
    const asaBlock = [
      line('あさドM', 'asad_m'),
      line('あさドS', 'asad_s'),
      line('あさ中①', 'asa_mid_1'),
      line('あさ中②', 'asa_mid_2'),
    ].filter(Boolean).join('\n');

    const dayBlock = [
      line('昼N', 'day_n')
    ].filter(Boolean).join('\n');

    const catchBlock = [
      line('キャッチM', 'catch_m'),
      line('キャッチC', 'catch_c'),
      line('キャッチS', 'catch_s'),
      line('キャッチE', 'catch_e'),
    ].filter(Boolean).join('\n');

    const drillBlock = [
      line('地震訓練', 'quake_drill')
    ].filter(Boolean).join('\n');

    // Assemble full text
    let text = `${formattedDate}の予定です。\n\n`;

    if (asaBlock) {
      text += `【あさドレメンバー】\n${asaBlock}\n\n`;
    }

    if (dayBlock) {
      text += `${dayBlock}\n\n`;
    }

    if (catchBlock) {
      text += `【キャッチ！】\n${catchBlock}\n\n`;
    }

    if (drillBlock) {
        text += `【地震訓練】\n${drillBlock}\n\n`;
    }

    if (nightLine) {
        text += `【夜間スタンバイ】\n${nightLine}\n`;
    }

    setEmailText(text);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(emailText);
    alert('コピーしました');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-2xl w-[600px] max-h-[80vh] flex flex-col">
        <div className="p-4 border-b border-gray-200 bg-gray-50 rounded-t-xl flex justify-between items-center">
          <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
            <Mail className="text-indigo-600" /> 翌日の予定メール作成 ({targetDateStr})
          </h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X size={24} />
          </button>
        </div>

        <div className="p-6 flex-1 flex flex-col">
          <textarea 
            className="w-full h-64 border border-gray-300 rounded p-4 font-mono text-sm focus:ring-2 focus:ring-indigo-500 outline-none resize-none bg-gray-50"
            value={emailText}
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

export default EmailModal;