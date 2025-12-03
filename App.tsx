
import React, { useState, useEffect } from 'react';
import { User, ScheduleData, Employee, ShiftType, DailyNotes, EmailConfig } from './types';
import { INITIAL_EMPLOYEES, INITIAL_SCHEDULE, INITIAL_SHIFT_TYPES, REQUIRED_SHIFTS_BY_DAY } from './constants';
import Auth from './components/Auth';
import RosterTable from './components/RosterTable';
import ChatInterface from './components/ChatInterface';
import EditModal from './components/EditModal';
import NoteModal from './components/NoteModal';
import EmailModal from './components/EmailModal';
import ProgramWeeklyModal from './components/ProgramWeeklyModal';
import AdminSettings from './components/AdminSettings';
import { LogOut, MessageSquareText, Calendar, ChevronLeft, ChevronRight, AlertCircle, Printer, Mail, FileText, Settings } from 'lucide-react';
import { AgentResponse } from './services/geminiService';

export type SelectedCell = { empId: string, date: string };

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);

  // --- State with LocalStorage Persistence ---

  // 1. Schedule Data
  const [schedule, setSchedule] = useState<ScheduleData>(() => {
    const saved = localStorage.getItem('roster_schedule');
    return saved ? JSON.parse(saved) : INITIAL_SCHEDULE;
  });
  useEffect(() => {
    localStorage.setItem('roster_schedule', JSON.stringify(schedule));
  }, [schedule]);

  // 2. Shift Types
  const [shiftTypes, setShiftTypes] = useState<ShiftType[]>(() => {
    const saved = localStorage.getItem('roster_shift_types');
    return saved ? JSON.parse(saved) : INITIAL_SHIFT_TYPES;
  });
  useEffect(() => {
    localStorage.setItem('roster_shift_types', JSON.stringify(shiftTypes));
  }, [shiftTypes]);

  // 3. Employees
  const [employees, setEmployees] = useState<Employee[]>(() => {
    const saved = localStorage.getItem('roster_employees');
    return saved ? JSON.parse(saved) : INITIAL_EMPLOYEES;
  });
  useEffect(() => {
    localStorage.setItem('roster_employees', JSON.stringify(employees));
  }, [employees]);

  // 4. Daily Notes
  const [dailyNotes, setDailyNotes] = useState<DailyNotes>(() => {
    const saved = localStorage.getItem('roster_daily_notes');
    return saved ? JSON.parse(saved) : {};
  });
  useEffect(() => {
    localStorage.setItem('roster_daily_notes', JSON.stringify(dailyNotes));
  }, [dailyNotes]);

  // 5. Required Holiday Count
  const [requiredHolidayCount, setRequiredHolidayCount] = useState<number>(() => {
    const saved = localStorage.getItem('roster_req_holiday_count');
    return saved ? parseInt(saved, 10) : 9;
  });
  useEffect(() => {
    localStorage.setItem('roster_req_holiday_count', requiredHolidayCount.toString());
  }, [requiredHolidayCount]);

  // 6. Required Shifts By Day
  const [requiredShiftsByDay, setRequiredShiftsByDay] = useState<Record<number, string[]>>(() => {
    const saved = localStorage.getItem('roster_req_shifts_rule');
    return saved ? JSON.parse(saved) : REQUIRED_SHIFTS_BY_DAY;
  });
  useEffect(() => {
    localStorage.setItem('roster_req_shifts_rule', JSON.stringify(requiredShiftsByDay));
  }, [requiredShiftsByDay]);

  // 7. Email Config
  const [emailConfig, setEmailConfig] = useState<EmailConfig>(() => {
    const saved = localStorage.getItem('roster_email_config');
    return saved ? JSON.parse(saved) : { enabled: false, sendTime: '09:00', toAddress: '' };
  });
  useEffect(() => {
    localStorage.setItem('roster_email_config', JSON.stringify(emailConfig));
  }, [emailConfig]);

  // --- End Persistence ---
  
  const [currentDate, setCurrentDate] = useState(new Date(2025, 11, 1));

  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isAdminSettingsOpen, setIsAdminSettingsOpen] = useState(false);
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);
  
  const [programModalOpen, setProgramModalOpen] = useState(false);
  const [programType, setProgramType] = useState<'asadre' | 'catch'>('asadre');
  
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [noteModalOpen, setNoteModalOpen] = useState(false);
  
  const [selectedCells, setSelectedCells] = useState<SelectedCell[]>([]);
  const [selectedDateForNote, setSelectedDateForNote] = useState<string | null>(null);
  const [clipboard, setClipboard] = useState<{ shiftIds: string[], note?: string, ma?: any, businessTrip?: any } | null>(null);

  // Email Auto-Open Logic
  useEffect(() => {
    const checkTime = () => {
      if (!emailConfig.enabled || !user) return;
      
      const now = new Date();
      const currentHours = String(now.getHours()).padStart(2, '0');
      const currentMinutes = String(now.getMinutes()).padStart(2, '0');
      const currentTimeStr = `${currentHours}:${currentMinutes}`;
      
      if (currentTimeStr === emailConfig.sendTime) {
        // Check if we already opened it today to prevent loop
        const lastOpened = localStorage.getItem('last_email_auto_open');
        const today = new Date().toDateString();
        
        if (lastOpened !== today) {
          setIsEmailModalOpen(true);
          localStorage.setItem('last_email_auto_open', today);
        }
      }
    };

    const intervalId = setInterval(checkTime, 60000); // Check every minute
    return () => clearInterval(intervalId);
  }, [emailConfig, user]);

  const handleLogin = (u: User) => setUser(u);
  const handleLogout = () => setUser(null);

  const handlePrevMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  const handleNextMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  const handlePrint = () => window.print();

  const handleOpenProgramModal = (type: 'asadre' | 'catch') => { setProgramType(type); setProgramModalOpen(true); };
  const handleSelectionChange = (cells: SelectedCell[]) => setSelectedCells(cells);
  const handleOpenEditModal = () => { if (selectedCells.length > 0) setEditModalOpen(true); };
  const handleDailyNoteClick = (date: string) => { setSelectedDateForNote(date); setNoteModalOpen(true); }

  const handleSaveCell = (shiftIds: string[], note: string, ma?: any, businessTrip?: any) => {
    if (selectedCells.length === 0) return;
    const updates: ScheduleData = { ...schedule };
    selectedCells.forEach(cell => {
      if (!updates[cell.date]) updates[cell.date] = {};
      updates[cell.date][cell.empId] = { shiftIds, note, ma, businessTrip };
    });
    setSchedule(updates);
  };

  const handleSaveDailyNote = (val: string) => {
    if (!selectedDateForNote) return;
    setDailyNotes(prev => ({ ...prev, [selectedDateForNote]: val }));
  }

  const handleBatchUpdate = (updates: NonNullable<AgentResponse['updates']>) => {
    setSchedule(prev => {
      const newSchedule = { ...prev };
      updates.forEach(u => {
        if (!newSchedule[u.date]) newSchedule[u.date] = {};
        const currentEntry = newSchedule[u.date][u.employeeId];
        newSchedule[u.date][u.employeeId] = { 
          shiftIds: u.shiftIds || [], 
          note: u.note || currentEntry?.note,
          ma: currentEntry?.ma,
          businessTrip: currentEntry?.businessTrip
        };
      });
      return newSchedule;
    });
  };

  const handleMoveShift = (srcEmpId: string, srcDate: string, destEmpId: string, destDate: string) => {
     setSchedule(prev => {
        const newSchedule = { ...prev };
        if (!newSchedule[srcDate]) newSchedule[srcDate] = {};
        if (!newSchedule[destDate]) newSchedule[destDate] = {};
        const srcData = newSchedule[srcDate][srcEmpId];
        if (!srcData) return prev; 
        newSchedule[destDate][destEmpId] = { ...srcData };
        delete newSchedule[srcDate][srcEmpId];
        return newSchedule;
     });
  };

  const handleCopyShift = (srcEmpId: string, srcDate: string, destEmpId: string, destDate: string) => {
    setSchedule(prev => {
       const newSchedule = { ...prev };
       if (!newSchedule[srcDate]) newSchedule[srcDate] = {};
       if (!newSchedule[destDate]) newSchedule[destDate] = {};
       const srcData = newSchedule[srcDate][srcEmpId];
       if (!srcData) return prev;
       newSchedule[destDate][destEmpId] = { ...srcData };
       return newSchedule;
    });
 };

 const handleDeleteShift = (empId: string, date: string) => {
    setSchedule(prev => {
        const newSchedule = { ...prev };
        if (newSchedule[date] && newSchedule[date][empId]) {
            delete newSchedule[date][empId];
        }
        return newSchedule;
    });
 };

 const handleDeleteSelected = () => {
    setSchedule(prev => {
       const newSchedule = { ...prev };
       selectedCells.forEach(cell => {
           if (newSchedule[cell.date] && newSchedule[cell.date][cell.empId]) {
               delete newSchedule[cell.date][cell.empId];
           }
       });
       return newSchedule;
    });
 };

 const handleCopySelected = () => {
     if (selectedCells.length === 0) return;
     const primary = selectedCells[0];
     const data = schedule[primary.date]?.[primary.empId];
     if (data) setClipboard({ ...data });
 };

 const handlePasteSelected = () => {
    if (!clipboard || selectedCells.length === 0) return;
    setSchedule(prev => {
        const newSchedule = { ...prev };
        selectedCells.forEach(cell => {
            if (!newSchedule[cell.date]) newSchedule[cell.date] = {};
            newSchedule[cell.date][cell.empId] = { ...clipboard };
        });
        return newSchedule;
    });
 };

  // STRICT SECURITY: If not logged in, show Auth component only.
  if (!user) {
    return <Auth onLogin={handleLogin} />;
  }

  let modalEmployeeName = '';
  let modalStartDate = '';
  let modalEndDate = '';
  if (selectedCells.length > 0) {
      const dates = selectedCells.map(c => c.date).sort();
      modalStartDate = dates[0];
      modalEndDate = dates[dates.length - 1];
      const uniqueEmps = Array.from(new Set(selectedCells.map(c => c.empId)));
      modalEmployeeName = uniqueEmps.length === 1 ? employees.find(e => e.id === uniqueEmps[0])?.name || '' : `${uniqueEmps.length}名 選択中`;
  }
  const currentShift = selectedCells.length > 0 ? schedule[selectedCells[0].date]?.[selectedCells[0].empId] : undefined;
  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth();

  return (
    <div className="h-screen flex flex-col bg-gray-100">
      <header className="bg-white shadow-sm px-6 py-3 flex justify-between items-center z-40 relative print:hidden">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-3">
            <div className="bg-indigo-600 p-2 rounded-lg text-white"><Calendar size={20} /></div>
            <div>
              <h1 className="text-xl font-bold text-gray-800">スマート勤務表 AI</h1>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <button onClick={handlePrevMonth} className="hover:bg-gray-100 p-1 rounded"><ChevronLeft size={16} /></button>
                <span className="font-bold">{currentYear}年{currentMonth + 1}月</span>
                <button onClick={handleNextMonth} className="hover:bg-gray-100 p-1 rounded"><ChevronRight size={16} /></button>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2 bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-200">
             <AlertCircle size={16} className="text-gray-400" />
             <span className="text-xs font-bold text-gray-600">今月の必要公休数:</span>
             <input 
               type="number" min={0} max={31}
               value={requiredHolidayCount}
               onChange={(e) => setRequiredHolidayCount(parseInt(e.target.value) || 0)}
               className="w-12 text-center text-sm border border-gray-300 rounded focus:ring-1 focus:ring-indigo-500 outline-none"
             />
             <span className="text-xs text-gray-500">日</span>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
           <div className="flex items-center gap-1 mr-2">
              <button onClick={() => handleOpenProgramModal('asadre')} className="text-xs bg-pink-50 text-pink-700 px-3 py-1.5 rounded border border-pink-200 hover:bg-pink-100 font-bold flex items-center gap-1">
                <FileText size={14} /> あさドレ週報
              </button>
              <button onClick={() => handleOpenProgramModal('catch')} className="text-xs bg-yellow-50 text-yellow-700 px-3 py-1.5 rounded border border-yellow-200 hover:bg-yellow-100 font-bold flex items-center gap-1">
                <FileText size={14} /> キャッチ週報
              </button>
           </div>
           
           <div className="h-6 w-px bg-gray-200 mx-1"></div>

          <button onClick={handlePrint} className="text-gray-500 hover:text-indigo-600 p-2 rounded-full hover:bg-gray-100 transition-colors" title="印刷">
             <Printer size={20} />
          </button>

          <button onClick={() => setIsEmailModalOpen(true)} className="text-gray-500 hover:text-indigo-600 p-2 rounded-full hover:bg-gray-100 transition-colors" title="メール作成">
             <Mail size={20} />
          </button>

          <div className="flex items-center gap-3 px-4 border-l border-gray-200">
            <div className="text-right">
              <p className="text-sm font-bold text-gray-700">{user.role === 'admin' ? '管理者' : '閲覧者'}</p>
            </div>
          </div>
          
          {user.role === 'admin' && (
             <button onClick={() => setIsAdminSettingsOpen(true)} className="text-gray-600 hover:text-indigo-600 p-2 rounded-full hover:bg-gray-100 transition-colors" title="管理設定">
                <Settings size={20} />
             </button>
          )}

          <button onClick={handleLogout} className="text-gray-400 hover:text-gray-600 p-2" title="ログアウト">
            <LogOut size={20} />
          </button>
        </div>
      </header>

      <main className="flex-1 overflow-hidden p-4 relative flex gap-4 print:p-0 print:overflow-visible print:h-auto">
        <div className="flex-1 h-full shadow-lg rounded-lg overflow-hidden bg-white print:shadow-none print:rounded-none">
          <RosterTable 
            year={currentYear} 
            month={currentMonth} 
            employees={employees} 
            shiftTypes={shiftTypes} 
            schedule={schedule}
            dailyNotes={dailyNotes}
            selectedCells={selectedCells}
            onSelectionChange={handleSelectionChange}
            onOpenEditModal={handleOpenEditModal}
            onDailyNoteClick={handleDailyNoteClick}
            canEdit={user.role === 'admin'}
            onPrevMonth={handlePrevMonth}
            onNextMonth={handleNextMonth}
            onMoveShift={handleMoveShift}
            onCopyShift={handleCopyShift}
            onDeleteShift={handleDeleteShift}
            onDeleteSelected={handleDeleteSelected}
            onCopySelected={handleCopySelected}
            onPasteSelected={handlePasteSelected}
            requiredHolidayCount={requiredHolidayCount}
            requiredShiftsByDay={requiredShiftsByDay}
          />
        </div>

        {!isChatOpen && user.role === 'admin' && (
           <button onClick={() => setIsChatOpen(true)} className="absolute bottom-8 right-8 bg-indigo-600 text-white p-4 rounded-full shadow-xl hover:bg-indigo-700 transition-all z-50 flex items-center gap-2 print:hidden">
             <MessageSquareText size={24} />
             <span className="font-bold">AI作成</span>
           </button>
        )}

        {user.role === 'admin' && (
          <ChatInterface 
            employees={employees}
            shiftTypes={shiftTypes}
            schedule={schedule}
            onUpdateSchedule={handleBatchUpdate}
            year={currentYear}
            month={currentMonth}
            isOpen={isChatOpen}
            onClose={() => setIsChatOpen(false)}
          />
        )}
      </main>

      <EditModal 
        isOpen={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        startDate={modalStartDate}
        endDate={modalEndDate}
        employeeName={modalEmployeeName}
        shiftTypes={shiftTypes}
        currentShiftIds={currentShift?.shiftIds || []}
        currentNote={currentShift?.note}
        currentMa={currentShift?.ma}
        currentBusinessTrip={currentShift?.businessTrip}
        onSave={handleSaveCell}
        isMultiple={selectedCells.length > 1}
      />
      <NoteModal isOpen={noteModalOpen} onClose={() => setNoteModalOpen(false)} title={`${selectedDateForNote} の備考`} initialValue={selectedDateForNote ? (dailyNotes[selectedDateForNote] || '') : ''} onSave={handleSaveDailyNote} />
      <EmailModal isOpen={isEmailModalOpen} onClose={() => setIsEmailModalOpen(false)} employees={employees} schedule={schedule} currentDate={currentDate} />
      <ProgramWeeklyModal isOpen={programModalOpen} onClose={() => setProgramModalOpen(false)} employees={employees} schedule={schedule} currentDate={currentDate} type={programType} />

      {user.role === 'admin' && (
        <AdminSettings 
          isOpen={isAdminSettingsOpen}
          onClose={() => setIsAdminSettingsOpen(false)}
          employees={employees} setEmployees={setEmployees}
          shiftTypes={shiftTypes} setShiftTypes={setShiftTypes}
          requiredShiftsByDay={requiredShiftsByDay} setRequiredShiftsByDay={setRequiredShiftsByDay}
          emailConfig={emailConfig} setEmailConfig={setEmailConfig}
          year={currentYear} month={currentMonth} schedule={schedule} setSchedule={setSchedule}
        />
      )}
    </div>
  );
};

export default App;
