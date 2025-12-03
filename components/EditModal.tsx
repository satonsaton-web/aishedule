import React, { useState, useEffect } from 'react';
import { ShiftType } from '../types';
import { X, MessageSquare, Check, Clock, Briefcase } from 'lucide-react';

interface EditModalProps {
  isOpen: boolean;
  onClose: () => void;
  startDate: string;
  endDate: string;
  employeeName: string;
  shiftTypes: ShiftType[];
  currentShiftIds: string[];
  currentNote: string | undefined;
  currentMa: { time: string, content: string } | undefined;
  currentBusinessTrip: { destination: string } | undefined;
  onSave: (shiftIds: string[], note: string, ma?: { time: string, content: string }, businessTrip?: { destination: string }) => void;
  isMultiple?: boolean;
}

const EditModal: React.FC<EditModalProps> = ({
  isOpen,
  onClose,
  startDate,
  endDate,
  employeeName,
  shiftTypes,
  currentShiftIds,
  currentNote,
  currentMa,
  currentBusinessTrip,
  onSave,
  isMultiple = false
}) => {
  const [selectedShifts, setSelectedShifts] = useState<string[]>([]);
  const [note, setNote] = useState('');
  
  // MA specific state
  const [maTime, setMaTime] = useState('');
  const [maContent, setMaContent] = useState('');

  // Business Trip specific state
  const [tripDestination, setTripDestination] = useState('');

  useEffect(() => {
    setSelectedShifts(currentShiftIds || []);
    setNote(currentNote || '');
    
    if (currentMa) {
      setMaTime(currentMa.time);
      setMaContent(currentMa.content);
    } else {
      setMaTime('');
      setMaContent('');
    }

    if (currentBusinessTrip) {
      setTripDestination(currentBusinessTrip.destination);
    } else {
      setTripDestination('');
    }
  }, [currentShiftIds, currentNote, currentMa, currentBusinessTrip, isOpen]);

  const toggleShift = (id: string) => {
    if (selectedShifts.includes(id)) {
      setSelectedShifts(selectedShifts.filter(s => s !== id));
    } else {
      setSelectedShifts([...selectedShifts, id]);
    }
  };

  const isMaSelected = selectedShifts.includes('ma');
  const isBusinessTripSelected = selectedShifts.includes('business_trip');

  if (!isOpen) return null;

  let dateLabel = '';
  if (isMultiple) {
      dateLabel = '複数セル選択中';
  } else {
      const isSingleDay = startDate === endDate;
      dateLabel = isSingleDay ? startDate : `${startDate} 〜 ${endDate}`;
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-96 p-6 max-h-[90vh] overflow-y-auto custom-scrollbar">
        <div className="flex justify-between items-center mb-4 border-b border-gray-100 pb-2">
          <div>
            <h3 className="text-lg font-bold text-gray-800">{employeeName}</h3>
            <p className="text-xs text-indigo-600 font-bold bg-indigo-50 inline-block px-2 py-1 rounded mt-1">
              {dateLabel} {isMultiple && '(一括編集)'}
            </p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={24} />
          </button>
        </div>

        {/* Shift Selection */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">シフト選択 (複数可)</label>
          <div className="grid grid-cols-2 gap-2 p-1">
            {shiftTypes.map(shift => {
              const isSelected = selectedShifts.includes(shift.id);
              return (
                <button
                  key={shift.id}
                  onClick={() => toggleShift(shift.id)}
                  className={`relative p-2 rounded text-sm font-medium border transition-all flex items-center justify-center ${shift.color} ${shift.textColor} ${
                    isSelected ? 'ring-2 ring-indigo-500 border-transparent shadow-md' : 'border-transparent opacity-70 hover:opacity-100'
                  }`}
                >
                  {shift.name}
                  {isSelected && (
                    <div className="absolute top-1 right-1 bg-white rounded-full p-0.5 shadow-sm">
                      <Check size={10} className="text-indigo-600" />
                    </div>
                  )}
                </button>
              );
            })}
          </div>
          <div className="mt-2 text-right">
             <button onClick={() => setSelectedShifts([])} className="text-xs text-red-500 hover:underline">選択をクリア</button>
          </div>
        </div>

        {/* MA Special Input Area - Only shows if MA is selected */}
        {isMaSelected && (
          <div className="mb-4 bg-indigo-50 p-3 rounded-lg border border-indigo-100 animate-in fade-in slide-in-from-top-2 duration-300">
            <label className="block text-xs font-bold text-indigo-800 mb-2 flex items-center gap-1">
              <Clock size={12} />
              MA 詳細入力
            </label>
            <div className="flex gap-2 mb-2">
              <div className="w-1/3">
                 <input
                  type="text"
                  placeholder="1000"
                  className="w-full border border-gray-300 rounded px-2 py-1.5 text-xs focus:ring-1 focus:ring-indigo-500 outline-none"
                  value={maTime}
                  onChange={(e) => setMaTime(e.target.value)}
                 />
              </div>
              <div className="flex-1">
                 <input
                  type="text"
                  placeholder="内容 (〇〇番組収録)"
                  className="w-full border border-gray-300 rounded px-2 py-1.5 text-xs focus:ring-1 focus:ring-indigo-500 outline-none"
                  value={maContent}
                  onChange={(e) => setMaContent(e.target.value)}
                 />
              </div>
            </div>
          </div>
        )}

        {/* Business Trip Special Input Area */}
        {isBusinessTripSelected && (
          <div className="mb-4 bg-yellow-50 p-3 rounded-lg border border-yellow-100 animate-in fade-in slide-in-from-top-2 duration-300">
            <label className="block text-xs font-bold text-yellow-800 mb-2 flex items-center gap-1">
              <Briefcase size={12} />
              出張 行き先入力
            </label>
            <div>
               <input
                type="text"
                placeholder="行き先 (例: 東京支社)"
                className="w-full border border-gray-300 rounded px-2 py-1.5 text-xs focus:ring-1 focus:ring-yellow-500 outline-none"
                value={tripDestination}
                onChange={(e) => setTripDestination(e.target.value)}
               />
            </div>
          </div>
        )}

        {/* General Notes */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <div className="flex items-center gap-1">
              <MessageSquare size={14} />
              備考・メモ
            </div>
          </label>
          <textarea
            className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 resize-none h-20"
            placeholder="例: 午後から別件あり"
            value={note}
            onChange={(e) => setNote(e.target.value)}
          />
        </div>

        <div className="flex justify-end gap-2 pt-2 border-t border-gray-100">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded"
          >
            キャンセル
          </button>
          <button
            onClick={() => {
              const maData = isMaSelected ? { time: maTime, content: maContent } : undefined;
              const tripData = isBusinessTripSelected ? { destination: tripDestination } : undefined;
              onSave(selectedShifts, note, maData, tripData);
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

export default EditModal;