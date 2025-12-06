
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Employee, ShiftType, ScheduleData, DailyNotes, SelectedCell } from '../types';
import { getDaysInMonth, HOLIDAYS } from '../constants';
import { ArrowRight, ArrowLeft, ArrowLeftRight, ChevronLeft, ChevronRight, Copy, Trash2, AlertTriangle, AlertCircle, Edit, Briefcase, FileText, Clock, Layers } from 'lucide-react';

interface RosterTableProps {
  year: number;
  month: number;
  employees: Employee[];
  shiftTypes: ShiftType[];
  schedule: ScheduleData;
  dailyNotes: DailyNotes;
  selectedCells: SelectedCell[];
  onSelectionChange: (cells: SelectedCell[]) => void;
  onOpenEditModal: () => void;
  onDailyNoteClick: (date: string) => void;
  canEdit: boolean;
  onPrevMonth?: () => void;
  onNextMonth?: () => void;
  onMoveShift?: (srcEmpId: string, srcDate: string, destEmpId: string, destDate: string) => void;
  onDeleteSelected?: () => void;
  onCopySelected?: (mode: 'all' | 'shift' | 'note') => void;
  onPasteSelected?: () => void;
  requiredHolidayCount?: number;
  requiredShiftsByDay?: Record<number, string[]>;
}

const GRAY_OUT_SHIFTS = ['rest', 'special_leave', 'paid_leave', 'comp_leave'];
const HOLIDAY_COUNT_TARGETS = ['rest', 'comp_leave'];

const RosterTable: React.FC<RosterTableProps> = ({
  year,
  month,
  employees,
  shiftTypes,
  schedule,
  dailyNotes,
  selectedCells,
  onSelectionChange,
  onOpenEditModal,
  onDailyNoteClick,
  canEdit,
  onPrevMonth,
  onNextMonth,
  onMoveShift,
  onDeleteSelected,
  onCopySelected,
  onPasteSelected,
  requiredHolidayCount = 8,
  requiredShiftsByDay = {}
}) => {
  const days = getDaysInMonth(year, month);
  const weekDays = ['日', '月', '火', '水', '木', '金', '土'];

  // Drag selection state
  const [dragStart, setDragStart] = useState<{ empId: string, date: Date, isCtrl: boolean } | null>(null);
  const [hoverDate, setHoverDate] = useState<Date | null>(null);
  const [hoverEmpId, setHoverEmpId] = useState<string | null>(null);

  // Drag & Drop Moving state
  const [movingShift, setMovingShift] = useState<{ empId: string, date: string } | null>(null);
  
  // Context Menu & Tooltip
  const [contextMenu, setContextMenu] = useState<{ x: number, y: number } | null>(null);
  const [tooltip, setTooltip] = useState<{ x: number, y: number, content: React.ReactNode } | null>(null);
  const tooltipTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const getShiftEntry = (dateStr: string, empId: string) => {
    return schedule[dateStr]?.[empId] || { shiftIds: [] };
  };

  const hasShift = (dateStr: string, empId: string, shiftId: string) => {
    const entry = schedule[dateStr]?.[empId];
    return entry?.shiftIds?.includes(shiftId);
  };

  const formatDate = useCallback((date: Date) => {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }, []);

  // --- Mouse Handlers for Selection ---
  const handleMouseDown = (e: React.MouseEvent, empId: string, date: Date) => {
    if (e.button !== 0) return; // Left click only for selection

    setContextMenu(null);
    const isCtrl = e.ctrlKey || e.metaKey;
    
    setDragStart({ empId, date, isCtrl });
    setHoverDate(date);
    setHoverEmpId(empId);
  };

  const handleMouseEnter = (e: React.MouseEvent, empId: string, date: Date, dateStr: string, note?: string) => {
    // 1. Drag Selection Logic
    if (dragStart) {
       if (dragStart.empId === empId) {
          setHoverDate(date);
          setHoverEmpId(empId);
       }
    }

    // 2. Tooltip Logic
    const entry = schedule[dateStr]?.[empId];
    if (entry || (note && note.length > 0)) {
        if (tooltipTimeoutRef.current) clearTimeout(tooltipTimeoutRef.current);
        
        const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
        const activeShifts = entry?.shiftIds?.map(id => shiftTypes.find(s => s.id === id)).filter(Boolean) as ShiftType[] || [];
        
        if (activeShifts.length > 0 || entry?.note || entry?.ma || entry?.businessTrip || note) {
             const content = (
                <div className="flex flex-col gap-2">
                    {activeShifts.map((s, idx) => (
                        <div key={idx} className={`px-2 py-1 rounded text-xs font-bold ${s.color} ${s.textColor}`}>
                            {s.name} 
                            {s.id === 'ma' && entry?.ma && ` (${entry.ma.time} ${entry.ma.content})`}
                            {s.id === 'business_trip' && entry?.businessTrip && ` (${entry.businessTrip.destination})`}
                        </div>
                    ))}

                    {(entry?.note || note) && (
                        <div className="bg-yellow-50 p-2 rounded border border-yellow-200 text-xs text-gray-800 whitespace-pre-wrap">
                            <div className="flex items-center gap-1 font-bold text-yellow-700 mb-1"><FileText size={10}/> 備考</div>
                            {entry?.note || note}
                        </div>
                    )}
                </div>
             );
             
             setTooltip({
                 x: rect.left + window.scrollX,
                 y: rect.bottom + window.scrollY + 5,
                 content
             });
        }
    }
  };

  const handleMouseLeave = () => {
      setTooltip(null);
  };

  // --- End Selection ---
  useEffect(() => {
    if (!dragStart) return;

    const handleWindowMouseUp = () => {
      let newSelection: SelectedCell[] = [];

      if (hoverDate && hoverEmpId === dragStart.empId) {
        const start = dragStart.date < hoverDate ? dragStart.date : hoverDate;
        const end = dragStart.date < hoverDate ? hoverDate : dragStart.date;
        
        const current = new Date(start);
        while (current <= end) {
            newSelection.push({ empId: dragStart.empId, date: formatDate(current) });
            current.setDate(current.getDate() + 1);
        }
      } else {
         newSelection.push({ empId: dragStart.empId, date: formatDate(dragStart.date) });
      }

      if (dragStart.isCtrl) {
          const unique = [...selectedCells];
          newSelection.forEach(n => {
               const existsIdx = unique.findIndex(u => u.empId === n.empId && u.date === n.date);
               if (existsIdx >= 0) {
                   unique.splice(existsIdx, 1);
               } else {
                   unique.push(n);
               }
          });
          onSelectionChange(unique);
      } else {
          onSelectionChange(newSelection);
          if (canEdit) onOpenEditModal();
      }
      
      setDragStart(null);
      setHoverDate(null);
      setHoverEmpId(null);
    };

    window.addEventListener('mouseup', handleWindowMouseUp);
    return () => window.removeEventListener('mouseup', handleWindowMouseUp);
  }, [dragStart, hoverDate, hoverEmpId, selectedCells, onSelectionChange, onOpenEditModal, formatDate, canEdit]);

  const isCellSelected = (empId: string, dateStr: string, dateObj: Date) => {
    const isPermSelected = selectedCells.some(c => c.empId === empId && c.date === dateStr);
    let isDragSelected = false;
    if (dragStart && dragStart.empId === empId && hoverDate) {
         const start = dragStart.date < hoverDate ? dragStart.date : hoverDate;
         const end = dragStart.date < hoverDate ? hoverDate : dragStart.date;
         if (dateObj >= start && dateObj <= end) {
             isDragSelected = true;
         }
    }
    return isPermSelected || isDragSelected;
  };

  // --- Drag & Drop Shift ---
  const handleDragStart = (e: React.DragEvent, empId: string, dateStr: string) => {
    if (!canEdit) return;
    setMovingShift({ empId, date: dateStr });
    e.dataTransfer.effectAllowed = 'move';
  };
  const handleDragOver = (e: React.DragEvent) => {
    if (!canEdit) return;
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };
  const handleDrop = (e: React.DragEvent, targetEmpId: string, targetDateStr: string) => {
    if (!canEdit || !movingShift) return;
    e.preventDefault();
    if (onMoveShift) onMoveShift(movingShift.empId, movingShift.date, targetEmpId, targetDateStr);
    setMovingShift(null);
  };

  // --- Context Menu ---
  const handleContextMenu = (e: React.MouseEvent, empId: string, dateStr: string) => {
    e.preventDefault();
    if (!canEdit) return;
    const isSelected = selectedCells.some(c => c.empId === empId && c.date === dateStr);
    if (!isSelected) {
        onSelectionChange([{ empId, date: dateStr }]);
    }
    setContextMenu({ x: e.clientX, y: e.clientY });
  };

  const handleCellClick = (empId: string, dateStr: string) => {
      if (!canEdit) {
          onSelectionChange([{ empId, date: dateStr }]);
          onOpenEditModal();
      }
  };

  const countEmployeeHolidays = (empId: string) => {
     let count = 0;
     days.forEach(day => {
        const dateStr = formatDate(day);
        const entry = getShiftEntry(dateStr, empId);
        if (entry.shiftIds.some(id => HOLIDAY_COUNT_TARGETS.includes(id))) {
            count++;
        }
     });
     return count;
  };

  return (
    <div 
      className="flex flex-col h-full bg-white shadow-sm border border-gray-300 rounded-lg overflow-hidden select-none relative"
      onClick={() => setContextMenu(null)}
    >
      {/* Custom Floating Tooltip */}
      {tooltip && (
        <div 
            className="fixed z-50 bg-white p-3 rounded-lg shadow-2xl border border-gray-200 text-sm max-w-xs pointer-events-none animate-in fade-in zoom-in-95 duration-100"
            style={{ top: tooltip.y, left: tooltip.x }}
        >
            {tooltip.content}
        </div>
      )}

      <div className="overflow-auto custom-scrollbar flex-1 relative">
        <table className="min-w-max border-collapse text-sm">
          {/* Header Row */}
          <thead className="sticky top-0 z-20 bg-gray-50 text-gray-700 font-bold shadow-sm">
            <tr>
              {/* Emphasized horizontal line (bottom), normal vertical line */}
              <th className="sticky left-0 z-30 bg-gray-50 border-b-2 border-gray-400 border-r border-gray-200 p-2 min-w-[150px] text-left">
                <div className="flex items-center justify-between">
                  <span>{year}年{month + 1}月</span>
                  <div className="flex gap-1">
                      {onPrevMonth && <button onClick={onPrevMonth} className="p-1 hover:bg-gray-200 rounded"><ChevronLeft size={16}/></button>}
                      {onNextMonth && <button onClick={onNextMonth} className="p-1 hover:bg-gray-200 rounded"><ChevronRight size={16}/></button>}
                  </div>
                </div>
              </th>
              {days.map((day) => {
                const dateStr = formatDate(day);
                const isHoliday = HOLIDAYS.includes(dateStr);
                const dayOfWeek = day.getDay();
                const isSunday = dayOfWeek === 0;
                const isSaturday = dayOfWeek === 6;
                const bgClass = (isSunday || isHoliday) ? 'bg-red-50 text-red-600' : isSaturday ? 'bg-blue-50 text-blue-600' : '';

                const requiredShiftIds = requiredShiftsByDay[dayOfWeek] || [];
                let missingShiftNames: string[] = [];
                if (requiredShiftIds.length > 0) {
                    requiredShiftIds.forEach(reqId => {
                         const hasSomeone = employees.some(emp => {
                            const entry = schedule[dateStr]?.[emp.id];
                            return entry?.shiftIds?.includes(reqId);
                        });
                        if (!hasSomeone) {
                            const shiftName = shiftTypes.find(s => s.id === reqId)?.shortName || reqId;
                            missingShiftNames.push(shiftName);
                        }
                    });
                }

                return (
                  <th key={dateStr} className={`border-b-2 border-gray-400 border-r border-gray-200 p-1 min-w-[60px] text-center ${bgClass} relative group`}>
                    <div className="text-lg leading-none">{day.getDate()}</div>
                    <div className="text-xs font-normal">
                      {weekDays[dayOfWeek]}
                      {isHoliday && <span className="block text-[8px] scale-75">祝</span>}
                    </div>
                    {missingShiftNames.length > 0 && (
                        <div className="absolute top-0 right-0 p-0.5" title={`不足: ${missingShiftNames.join(', ')}`}>
                            <AlertTriangle size={12} className="text-red-500 fill-red-100" />
                        </div>
                    )}
                  </th>
                );
              })}
            </tr>
          </thead>

          {/* Body */}
          <tbody>
            <tr className="bg-gray-100">
              <td className="sticky left-0 z-10 bg-gray-100 border-b border-gray-300 border-r border-gray-200 p-2 text-xs font-bold text-gray-600 text-center">
                備考
              </td>
              {days.map((day) => {
                const dateStr = formatDate(day);
                const note = dailyNotes[dateStr];
                return (
                  <td 
                    key={`note-${dateStr}`}
                    onClick={() => canEdit && onDailyNoteClick(dateStr)}
                    onMouseEnter={(e) => handleMouseEnter(e, 'note_row', day, dateStr, note)}
                    onMouseLeave={handleMouseLeave}
                    className={`border-b border-gray-300 border-r border-gray-200 p-1 text-[10px] text-gray-600 align-top hover:bg-gray-200 cursor-pointer text-center whitespace-pre-wrap break-words w-16 min-h-[32px]`}
                  >
                    {note && (
                        <div className="line-clamp-3">
                           {note}
                        </div>
                    )}
                    {(!note && canEdit) && <span className="opacity-0 hover:opacity-100 text-lg leading-none">+</span>}
                  </td>
                );
              })}
            </tr>

            {employees.map((emp) => {
              const holidayCount = countEmployeeHolidays(emp.id);
              const holidayDiff = holidayCount - requiredHolidayCount;
              // Strong horizontal line if divider is set, otherwise standard emphasized line
              const rowBorderClass = emp.showDivider ? 'border-b-4 border-gray-800' : 'border-b border-gray-300';
              const nameBgClass = emp.backgroundColor || 'bg-white';

              return (
              <tr key={emp.id} className="hover:bg-gray-50 transition-colors">
                <td className={`sticky left-0 z-10 ${nameBgClass} border-r border-gray-200 p-2 font-medium text-gray-800 h-20 ${rowBorderClass}`}>
                  <div className="flex flex-col h-full justify-center relative">
                    <span>{emp.name}</span>
                    <span className="text-[10px] text-gray-500 font-normal">{emp.role}</span>
                    
                    {(emp.isHolidayManaged ?? true) && (
                        <div className="flex items-center gap-1 mt-1">
                            <span className="text-[10px] bg-gray-100 px-1 rounded text-gray-600">休:{holidayCount}</span>
                            {holidayDiff !== 0 && (
                                <span 
                                    className={`text-[10px] px-1 rounded font-bold text-white ${holidayDiff < 0 ? 'bg-red-500' : 'bg-blue-500'}`}
                                >
                                    {holidayDiff > 0 ? '+' : ''}{holidayDiff}
                                </span>
                            )}
                        </div>
                    )}
                  </div>
                </td>
                {days.map((day) => {
                  const dateStr = formatDate(day);
                  const entry = getShiftEntry(dateStr, emp.id);
                  const activeShifts = entry.shiftIds.map(id => shiftTypes.find(s => s.id === id)).filter(Boolean) as ShiftType[];
                  const isRefresh = entry.shiftIds.includes('refresh');
                  const isBusinessTrip = entry.shiftIds.includes('business_trip');
                  
                  const prevDate = new Date(day); prevDate.setDate(day.getDate() - 1);
                  const hasPrevRefresh = hasShift(formatDate(prevDate), emp.id, 'refresh');
                  const nextDate = new Date(day); nextDate.setDate(day.getDate() + 1);
                  const hasNextRefresh = hasShift(formatDate(nextDate), emp.id, 'refresh');

                  const isGrayOut = entry.shiftIds.some(id => GRAY_OUT_SHIFTS.includes(id));
                  const isHoliday = HOLIDAYS.includes(dateStr);
                  const isSunday = day.getDay() === 0;
                  const isSaturday = day.getDay() === 6;
                  
                  let bgClass = '';
                  if (isGrayOut) bgClass = 'bg-gray-300';
                  else if (isBusinessTrip) bgClass = 'bg-yellow-100'; 
                  else if (isRefresh) bgClass = 'bg-teal-100'; 
                  else if (isSunday || isHoliday) bgClass = 'bg-red-50/30';
                  else if (isSaturday) bgClass = 'bg-blue-50/30';

                  const selected = isCellSelected(emp.id, dateStr, day);
                  const selectedClass = selected ? 'ring-2 ring-indigo-500 bg-indigo-50 z-10' : '';
                  const hasContent = activeShifts.length > 0 || !!entry.note;
                  // Overflow logic: >3 shifts, OR >2 shifts + note, OR note is long (>5 chars)
                  const overflow = activeShifts.length > 3 || (activeShifts.length > 2 && entry.note) || (entry.note && entry.note.length > 5);

                  return (
                    <td
                      key={dateStr}
                      draggable={canEdit && hasContent && !selected} 
                      onDragStart={(e) => handleDragStart(e, emp.id, dateStr)}
                      onDragOver={handleDragOver}
                      onDrop={(e) => handleDrop(e, emp.id, dateStr)}
                      onMouseDown={(e) => handleMouseDown(e, emp.id, day)}
                      onMouseEnter={(e) => handleMouseEnter(e, emp.id, day, dateStr)}
                      onMouseLeave={handleMouseLeave}
                      onContextMenu={(e) => handleContextMenu(e, emp.id, dateStr)}
                      onClick={() => handleCellClick(emp.id, dateStr)}
                      className={`border-r border-gray-200 p-1 text-center cursor-pointer relative h-20 w-16 align-top
                        ${canEdit ? 'hover:opacity-80' : ''} ${bgClass} ${selectedClass} ${rowBorderClass}
                        ${hasContent && canEdit ? 'cursor-grab active:cursor-grabbing' : ''}
                      `}
                    >
                      <div className="flex flex-col gap-1 w-full h-full items-center pointer-events-auto">
                        {activeShifts.slice(0, 3).map((shift, idx) => {
                          if (shift.id === 'refresh') {
                            if (hasPrevRefresh && hasNextRefresh) {
                                return <div key={idx} className="absolute inset-0 flex items-center justify-center opacity-50"><ArrowLeftRight className="text-teal-700 w-full h-8" strokeWidth={2.5}/></div>
                            } else if (!hasPrevRefresh && hasNextRefresh) {
                                return <div key={idx} className="absolute inset-0 flex items-center justify-center opacity-50 text-teal-700 font-bold">{shift.shortName} <ArrowRight size={16} strokeWidth={2.5}/></div>
                            } else if (hasPrevRefresh && !hasNextRefresh) {
                                return <div key={idx} className="absolute inset-0 flex items-center justify-center opacity-50 text-teal-700 font-bold"><ArrowLeft size={16} strokeWidth={2.5}/> {shift.shortName}</div>
                            } else {
                                return <div key={idx} className="absolute inset-0 flex items-center justify-center text-teal-800 font-bold">{shift.shortName}</div>
                            }
                          }
                          
                          if (GRAY_OUT_SHIFTS.includes(shift.id)) {
                             return <div key={idx} className="w-full py-2 flex items-center justify-center font-bold text-gray-700 text-lg">{shift.shortName}</div>
                          }
                          
                          if (shift.id === 'business_trip') {
                             return <div key={idx} className={`w-full rounded px-0.5 py-1 text-[10px] font-bold shadow-sm flex flex-row items-center justify-center gap-1 whitespace-nowrap overflow-hidden ${shift.color} ${shift.textColor}`}>
                                <Briefcase size={12} className="shrink-0"/>
                                <span className="truncate">{entry.businessTrip?.destination || '未入力'}</span>
                             </div>
                          }

                          if (shift.id === 'ma') {
                             return <div key={idx} className={`w-full rounded px-0.5 py-0.5 text-[10px] font-bold shadow-sm flex items-center justify-center gap-1 ${shift.color} ${shift.textColor}`}>
                                <span>MA {entry.ma?.time || ''}</span>
                                <span className="text-[9px] truncate max-w-[40px]">{entry.ma?.content}</span>
                             </div>
                          }

                          return <div key={idx} className={`w-full rounded px-0.5 py-0.5 text-[10px] font-bold shadow-sm flex items-center justify-center truncate ${shift.color} ${shift.textColor}`}>{shift.shortName}</div>
                        })}
                        
                        {(entry.note) && activeShifts.length < 3 && (
                           <div className="mt-auto w-full text-left bg-white border border-yellow-200 rounded px-1 py-0.5 relative z-10 group shadow-sm">
                             <p className="text-[9px] text-gray-700 leading-tight line-clamp-1">{entry.note}</p>
                           </div>
                        )}

                        {/* Overflow Indicator */}
                        {overflow && (
                            <div className="absolute bottom-0 right-0 bg-gray-600 text-white text-[9px] px-1 rounded-tl shadow z-20">
                                +他
                            </div>
                        )}
                      </div>
                    </td>
                  );
                })}
              </tr>
            )})}
          </tbody>
        </table>
      </div>
      {contextMenu && (
        <div className="fixed bg-white shadow-xl rounded-lg border border-gray-200 z-50 flex flex-col min-w-[160px] py-1" style={{ left: contextMenu.x, top: contextMenu.y }}>
           <button onClick={() => { onOpenEditModal(); setContextMenu(null); }} className="px-4 py-2 text-left hover:bg-gray-100 flex items-center gap-2 text-sm text-gray-700"><Edit size={14}/> 編集</button>
           <div className="border-t border-gray-100 my-1"></div>
           
           <div className="px-4 py-1 text-xs text-gray-400 font-bold">コピー</div>
           <button onClick={() => { if (onCopySelected) onCopySelected('all'); setContextMenu(null); }} className="px-4 py-2 text-left hover:bg-gray-100 flex items-center gap-2 text-sm text-gray-700 pl-6"><Layers size={14}/> 全て</button>
           <button onClick={() => { if (onCopySelected) onCopySelected('shift'); setContextMenu(null); }} className="px-4 py-2 text-left hover:bg-gray-100 flex items-center gap-2 text-sm text-gray-700 pl-6"><Clock size={14}/> シフトのみ</button>
           <button onClick={() => { if (onCopySelected) onCopySelected('note'); setContextMenu(null); }} className="px-4 py-2 text-left hover:bg-gray-100 flex items-center gap-2 text-sm text-gray-700 pl-6"><FileText size={14}/> 備考のみ</button>
           
           <div className="border-t border-gray-100 my-1"></div>
           <button onClick={() => { if (onPasteSelected) onPasteSelected(); setContextMenu(null); }} className="px-4 py-2 text-left hover:bg-gray-100 flex items-center gap-2 text-sm text-gray-700"><ArrowRight size={14}/> 貼り付け</button>
           <div className="border-t border-gray-100 my-1"></div>
           <button onClick={() => { if (onDeleteSelected) onDeleteSelected(); setContextMenu(null); }} className="px-4 py-2 text-left hover:bg-red-50 flex items-center gap-2 text-sm text-red-600"><Trash2 size={14}/> 削除</button>
        </div>
      )}
    </div>
  );
};

export default RosterTable;
