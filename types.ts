
export type Role = 'admin' | 'viewer' | 'guest';

export interface User {
  username: string;
  role: Role;
}

export interface ShiftType {
  id: string;
  name: string;
  shortName: string;
  color: string; // Tailwind class for background
  textColor: string;
}

export interface Employee {
  id: string;
  name: string;
  role: string;
  backgroundColor?: string; // Tailwind class (e.g. 'bg-blue-100')
  isHolidayManaged?: boolean; // If true, show holiday counts
  showDivider?: boolean; // If true, show thick border after this row
}

export interface ShiftEntry {
  shiftIds: string[]; 
  note?: string;
  ma?: {
    time: string;
    content: string;
  };
  businessTrip?: {
    destination: string;
  };
}

// Map: DateString (YYYY-MM-DD) -> { EmployeeID -> ShiftEntry }
export interface ScheduleData {
  [date: string]: {
    [employeeId: string]: ShiftEntry;
  };
}

export type DailyNotes = Record<string, string>;

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: number;
}

export interface EmailConfig {
  enabled: boolean;
  sendTime: string; // "09:00"
  toAddress: string;
}

export interface SelectedCell {
  empId: string;
  date: string;
}
