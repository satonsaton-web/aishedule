
import { Employee, ShiftType, ScheduleData } from './types';

// Expanded Mock Employees (25 people)
// Default: isHolidayManaged = true, backgroundColor = white/default
export const INITIAL_EMPLOYEES: Employee[] = [
  { id: 'emp1', name: '阿部 芳美', role: 'アナウンサー', isHolidayManaged: true },
  { id: 'emp2', name: '赤木 由布子', role: 'アナウンサー', isHolidayManaged: true },
  { id: 'emp3', name: '中川 萌香', role: '制作', isHolidayManaged: true },
  { id: 'emp4', name: '秋元 玲奈', role: 'デスク', isHolidayManaged: true },
  { id: 'emp5', name: '佐藤 健太', role: 'カメラ', isHolidayManaged: true },
  { id: 'emp6', name: '鈴木 一郎', role: '音声', isHolidayManaged: true },
  { id: 'emp7', name: '田中 実', role: '編集', isHolidayManaged: true },
  { id: 'emp8', name: '高橋 優子', role: '制作', isHolidayManaged: true },
  { id: 'emp9', name: '伊藤 翔太', role: 'カメラ', isHolidayManaged: true },
  { id: 'emp10', name: '渡辺 さくら', role: 'アナウンサー', isHolidayManaged: true },
  { id: 'emp11', name: '山本 大輔', role: '音声', isHolidayManaged: true },
  { id: 'emp12', name: '中村 裕子', role: 'デスク', isHolidayManaged: true },
  { id: 'emp13', name: '小林 健一', role: '技術', isHolidayManaged: true },
  { id: 'emp14', name: '加藤 美咲', role: '制作', isHolidayManaged: true },
  { id: 'emp15', name: '吉田 拓也', role: '編集', isHolidayManaged: true },
  { id: 'emp16', name: '山田 花子', role: 'AD', isHolidayManaged: true },
  { id: 'emp17', name: '佐々木 希', role: 'アナウンサー', isHolidayManaged: true },
  { id: 'emp18', name: '山口 達也', role: 'カメラ', isHolidayManaged: true },
  { id: 'emp19', name: '松本 潤', role: '照明', isHolidayManaged: true },
  { id: 'emp20', name: '井上 真央', role: '制作', isHolidayManaged: true, showDivider: true }, // Divider here
  { id: 'emp21', name: '木村 拓哉', role: 'プロデューサー', isHolidayManaged: false, backgroundColor: 'bg-gray-100' },
  { id: 'emp22', name: '香取 慎吾', role: '美術', isHolidayManaged: false, backgroundColor: 'bg-gray-100' },
  { id: 'emp23', name: '草彅 剛', role: 'ドライバー', isHolidayManaged: false, backgroundColor: 'bg-gray-100' },
  { id: 'emp24', name: '稲垣 吾郎', role: '編集', isHolidayManaged: false, backgroundColor: 'bg-gray-100' },
  { id: 'emp25', name: '中居 正広', role: 'MC', isHolidayManaged: false, backgroundColor: 'bg-gray-100' },
];

// Updated Shift Types per Request
export const INITIAL_SHIFT_TYPES: ShiftType[] = [
  // Morning / Asa Series
  { id: 'morning_n', name: '朝N', shortName: '朝N', color: 'bg-pink-100', textColor: 'text-pink-900' },
  { id: 'asad_m', name: 'あさドM', shortName: 'あさM', color: 'bg-pink-200', textColor: 'text-pink-900' },
  { id: 'asad_s', name: 'あさドS', shortName: 'あさS', color: 'bg-pink-200', textColor: 'text-pink-900' },
  { id: 'asa_mid_1', name: 'あさ中①', shortName: 'あ中①', color: 'bg-rose-200', textColor: 'text-rose-900' },
  { id: 'asa_mid_2', name: 'あさ中②', shortName: 'あ中②', color: 'bg-rose-200', textColor: 'text-rose-900' },
  
  // Day / Noon Series
  { id: 'day_shift', name: '日勤', shortName: '日勤', color: 'bg-blue-100', textColor: 'text-blue-900' },
  { id: 'day_mid', name: '昼中', shortName: '昼中', color: 'bg-blue-100', textColor: 'text-blue-900' },
  { id: 'day_n', name: '昼N', shortName: '昼N', color: 'bg-sky-200', textColor: 'text-sky-900' },
  
  // Catch Series
  { id: 'catch_m', name: 'キャッチM', shortName: 'キM', color: 'bg-yellow-100', textColor: 'text-yellow-900' },
  { id: 'catch_c', name: 'キャッチC', shortName: 'キC', color: 'bg-yellow-200', textColor: 'text-yellow-900' },
  { id: 'catch_s', name: 'キャッチS', shortName: 'キS', color: 'bg-amber-100', textColor: 'text-amber-900' },
  { id: 'catch_e', name: 'キャッチE', shortName: 'キE', color: 'bg-amber-200', textColor: 'text-amber-900' },
  
  // C Narr / Coming Series
  { id: 'c_narr', name: 'Cナレ', shortName: 'Cナレ', color: 'bg-orange-100', textColor: 'text-orange-900' },
  { id: 'c_narr_1', name: 'Cナレ①', shortName: 'Cナ①', color: 'bg-orange-100', textColor: 'text-orange-900' },
  { id: 'c_narr_3', name: 'Cナレ③', shortName: 'Cナ③', color: 'bg-orange-100', textColor: 'text-orange-900' },
  { id: 'coming', name: 'カミング', shortName: 'カミ', color: 'bg-orange-200', textColor: 'text-orange-900' },
  { id: 'coming_narr', name: 'カミングナレ', shortName: 'カミナ', color: 'bg-orange-200', textColor: 'text-orange-900' },

  // Night / Drill
  { id: 'night_n', name: '夜N', shortName: '夜N', color: 'bg-indigo-200', textColor: 'text-indigo-900' },
  { id: 'night_s', name: '夜S', shortName: '夜S', color: 'bg-indigo-300', textColor: 'text-indigo-900' },
  { id: 'quake_drill', name: '地震訓練', shortName: '訓練', color: 'bg-green-200', textColor: 'text-green-900' },

  // Special / Leaves
  { id: 'comp_leave', name: '必休', shortName: '必休', color: 'bg-gray-400', textColor: 'text-white' },
  { id: 'rest', name: '休', shortName: '休', color: 'bg-gray-400', textColor: 'text-white' },
  { id: 'paid_leave', name: '有休', shortName: '有休', color: 'bg-gray-400', textColor: 'text-white' },
  { id: 'special_leave', name: '特休', shortName: '特休', color: 'bg-gray-400', textColor: 'text-white' },
  
  // Others
  { id: 'business_trip', name: '出張', shortName: '出張', color: 'bg-yellow-300', textColor: 'text-yellow-900' },
  { id: 'ma', name: 'MA', shortName: 'MA', color: 'bg-purple-100', textColor: 'text-purple-900' },
  { id: 'refresh', name: 'リフレ', shortName: 'リフレ', color: 'bg-teal-200', textColor: 'text-teal-900' },
];

// Mandatory Shifts for Weekdays (Mon=1 to Fri=5)
const WEEKDAY_MANDATORY = [
  'asad_m',
  'asad_s',
  'asa_mid_1',
  'asa_mid_2',
  'day_n',
  'catch_m',
  'catch_c',
  'catch_s',
  'catch_e',
  'quake_drill',
  'night_n'
];

export const REQUIRED_SHIFTS_BY_DAY: Record<number, string[]> = {
  1: WEEKDAY_MANDATORY, // Mon
  2: WEEKDAY_MANDATORY, // Tue
  3: WEEKDAY_MANDATORY, // Wed
  4: WEEKDAY_MANDATORY, // Thu
  5: WEEKDAY_MANDATORY, // Fri
  // Sat(6) and Sun(0) have no defaults as per prompt, editable in settings
};

// Demo Holidays (Assuming 2025/12)
export const HOLIDAYS = [
  '2025-12-29', // Year end
  '2025-12-30', // Year end
  '2025-12-31', // Year end
];

// Helper to generate dates for current month
export const getDaysInMonth = (year: number, month: number) => {
  const date = new Date(year, month, 1);
  const days = [];
  while (date.getMonth() === month) {
    days.push(new Date(date));
    date.setDate(date.getDate() + 1);
  }
  return days;
};

// Populating initial schedule with sample data for demonstration
export const INITIAL_SCHEDULE: ScheduleData = {
  '2025-12-01': {
    'emp1': { shiftIds: ['asad_m'] },
    'emp2': { shiftIds: ['asad_s'] },
    'emp3': { shiftIds: ['asa_mid_1'] },
    'emp4': { shiftIds: ['catch_m'] },
    'emp5': { shiftIds: ['catch_s'] },
    'emp6': { shiftIds: ['night_n'] },
  },
  '2025-12-02': {
    'emp1': { shiftIds: ['catch_m'] },
    'emp2': { shiftIds: ['catch_c'] },
    'emp3': { shiftIds: ['asa_mid_2'] },
    'emp10': { shiftIds: ['asad_m'] },
    'emp11': { shiftIds: ['night_n'] },
    'emp12': { shiftIds: ['c_narr'] },
  },
  '2025-12-03': {
    'emp4': { shiftIds: ['asad_m'] },
    'emp5': { shiftIds: ['asad_s'] },
    'emp1': { shiftIds: ['catch_e'] },
    'emp7': { shiftIds: ['c_narr_1'] },
    'emp8': { shiftIds: ['night_n'] },
  },
  '2025-12-04': {
    'emp1': { shiftIds: ['ma'], ma: { time: '1300', content: '番組収録' } },
    'emp2': { shiftIds: ['business_trip'], businessTrip: { destination: '大阪' } },
    'emp10': { shiftIds: ['catch_m'] },
    'emp13': { shiftIds: ['c_narr_3'] },
  },
  '2025-12-05': {
    'emp3': { shiftIds: ['asad_m'] },
    'emp4': { shiftIds: ['asad_s'] },
    'emp5': { shiftIds: ['asa_mid_1'] },
    'emp6': { shiftIds: ['asa_mid_2'] },
    'emp1': { shiftIds: ['catch_m'] },
    'emp2': { shiftIds: ['catch_s'] },
    'emp7': { shiftIds: ['catch_e'] },
  },
};
