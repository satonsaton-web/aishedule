
import { Employee, ScheduleData, ShiftType } from '../types';

// Declare global XLSX variable from CDN
declare const XLSX: any;

export const exportScheduleToExcel = (
  year: number,
  month: number,
  employees: Employee[],
  schedule: ScheduleData,
  shiftTypes: ShiftType[]
) => {
  if (typeof XLSX === 'undefined') {
    alert('Excelライブラリが読み込まれていません。');
    return;
  }

  // Create Header Row
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const header = ['氏名', '役職'];
  const dates: string[] = [];

  for (let d = 1; d <= daysInMonth; d++) {
    const date = new Date(year, month, d);
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    dates.push(dateStr);
    header.push(`${month + 1}/${d}`);
  }

  // Create Data Rows
  const data = employees.map(emp => {
    const row: any[] = [emp.name, emp.role];
    dates.forEach(dateStr => {
      const entry = schedule[dateStr]?.[emp.id];
      if (entry && entry.shiftIds.length > 0) {
        // Combine shift names
        const shiftNames = entry.shiftIds.map(id => {
            if (id === 'business_trip' && entry.businessTrip) {
                return `出張(${entry.businessTrip.destination})`;
            }
            if (id === 'ma' && entry.ma) {
                return `MA${entry.ma.time}`;
            }
            const type = shiftTypes.find(s => s.id === id);
            return type ? type.shortName : '';
        }).join(',');
        row.push(shiftNames);
      } else {
        row.push('');
      }
    });
    return row;
  });

  const wsData = [header, ...data];
  const ws = XLSX.utils.aoa_to_sheet(wsData);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, `${year}年${month + 1}月`);

  XLSX.writeFile(wb, `勤務表_${year}_${month + 1}.xlsx`);
};

export const parseExcelToSchedule = async (
    file: File, 
    year: number, 
    month: number, 
    employees: Employee[], 
    shiftTypes: ShiftType[]
): Promise<ScheduleData | null> => {
    if (typeof XLSX === 'undefined') {
        alert('Excelライブラリが読み込まれていません。');
        return null;
    }

    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const data = new Uint8Array(e.target?.result as ArrayBuffer);
                const workbook = XLSX.read(data, { type: 'array' });
                const firstSheetName = workbook.SheetNames[0];
                const worksheet = workbook.Sheets[firstSheetName];
                const jsonData: any[][] = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

                // Basic validation
                if (jsonData.length < 2) {
                    alert('データが空のようです。');
                    resolve(null);
                    return;
                }

                const headerRow = jsonData[0];
                const dateMap: Record<number, string> = {};
                
                // Parse Headers to find Dates
                for (let i = 0; i < headerRow.length; i++) {
                    const headerVal = String(headerRow[i]);
                    // Look for patterns like "12/1", "1/1", etc.
                    // Or if Excel parsed it as date number, handled by sheet_to_json usually as text if we didn't specify raw:true, 
                    // but let's try to be flexible.
                    
                    const match = headerVal.match(/(\d{1,2})\/(\d{1,2})/);
                    if (match) {
                        const m = parseInt(match[1], 10);
                        const d = parseInt(match[2], 10);
                        
                        // Check if this matches our target month
                        // Note: month is 0-indexed in JS (0=Jan), but Excel header "1/1" implies Jan (1).
                        if (m === month + 1) {
                            const dateStr = `${year}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
                            dateMap[i] = dateStr;
                        }
                    }
                }

                if (Object.keys(dateMap).length === 0) {
                     alert(`ヘッダーから ${month + 1}月 の日付が見つかりませんでした。\nExcelのヘッダー形式は「12/1」のように入力してください。`);
                     resolve(null);
                     return;
                }

                const newSchedule: ScheduleData = {};

                // Iterate rows
                for (let i = 1; i < jsonData.length; i++) {
                    const row = jsonData[i];
                    // Name is usually col 0 or 1. Let's try to match existing employees.
                    let employee: Employee | undefined;
                    
                    // Try to find employee by checking first few columns
                    for(let c=0; c<2; c++) {
                        const val = row[c];
                        if (val) {
                             const found = employees.find(e => e.name === String(val).trim());
                             if (found) {
                                 employee = found;
                                 break;
                             }
                        }
                    }

                    if (!employee) continue; // Skip unknown rows

                    // Parse columns mapped to dates
                    Object.keys(dateMap).forEach((colIdxStr) => {
                        const colIdx = parseInt(colIdxStr, 10);
                        const dateStr = dateMap[colIdx];
                        const cellVal = row[colIdx];

                        if (!cellVal) return;

                        const valStr = String(cellVal);
                        const parts = valStr.split(/,|、/);
                        const shiftIds: string[] = [];
                        let businessTrip: any = undefined;
                        let ma: any = undefined;

                        parts.forEach(part => {
                            part = part.trim();
                            if (!part) return;

                            if (part.startsWith('出張')) {
                                shiftIds.push('business_trip');
                                const match = part.match(/\((.*?)\)/);
                                if (match) businessTrip = { destination: match[1] };
                                else businessTrip = { destination: '' };
                            } else if (part.startsWith('MA')) {
                                shiftIds.push('ma');
                                const time = part.replace('MA', '').trim();
                                ma = { time: time, content: '' };
                            } else {
                                const type = shiftTypes.find(s => s.shortName === part || s.name === part);
                                if (type) shiftIds.push(type.id);
                            }
                        });

                        if (shiftIds.length > 0) {
                            if (!newSchedule[dateStr]) newSchedule[dateStr] = {};
                            newSchedule[dateStr][employee.id] = {
                                shiftIds,
                                businessTrip,
                                ma
                            };
                        }
                    });
                }
                resolve(newSchedule);

            } catch (err) {
                console.error(err);
                alert('読み込みエラーが発生しました');
                resolve(null);
            }
        };
        reader.readAsArrayBuffer(file);
    });
};
