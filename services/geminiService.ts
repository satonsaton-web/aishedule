
import { GoogleGenAI } from "@google/genai";
import { Employee, ShiftType, ScheduleData } from '../types';

// APIキーを安全に取得する関数
const getApiKey = () => {
  // 1. 標準的なプロセス環境変数 (Node.js/Next.js等)
  if (typeof process !== 'undefined' && process.env && process.env.API_KEY) {
    return process.env.API_KEY;
  }
  // 2. Vite環境変数 (import.meta.env)
  // @ts-ignore
  if (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_API_KEY) {
    // @ts-ignore
    return import.meta.env.VITE_API_KEY;
  }
  return '';
};

export interface AgentResponse {
  type: 'UPDATE' | 'ANSWER' | 'ERROR';
  message: string;
  updates?: {
    date: string;
    employeeId: string;
    shiftIds: string[];
    note?: string;
  }[];
}

export const processRosterRequest = async (
  userPrompt: string,
  employees: Employee[],
  shiftTypes: ShiftType[],
  currentSchedule: ScheduleData,
  year: number,
  month: number
): Promise<AgentResponse> => {
  const apiKey = getApiKey();

  // API Key Check
  if (!apiKey) {
    console.error("API Key is missing. Checked process.env.API_KEY and VITE_API_KEY.");
    return {
      type: 'ERROR',
      message: "APIキーが設定されていません。Vercelの環境変数名を 'VITE_API_KEY' に変更して再デプロイしてください。"
    };
  }

  try {
    // クライアントをリクエストの都度生成（キーの確実な適用）
    const ai = new GoogleGenAI({ apiKey: apiKey });
    const model = 'gemini-2.5-flash';
    
    // Construct context
    const employeeList = employees.map(e => `${e.name} (ID: ${e.id})`).join(', ');
    const shiftList = shiftTypes.map(s => `${s.name} (ID: ${s.id})`).join(', ');
    const scheduleContext = JSON.stringify(currentSchedule);

    const systemInstruction = `
      You are an intelligent Roster Assistant. You manage a shift schedule for ${year}-${month + 1}.
      
      **CRITICAL RULE: All output text in the 'message' field MUST be in Japanese.**
      
      **Context Data:**
      - Employees: ${employeeList}
      - Valid Shift Types: ${shiftList}
      - Current Year/Month: ${year}-${month + 1}
      - **Current Schedule Data**: ${scheduleContext}
      
      **Your Goal:**
      Analyze the user's request.
      
      1. **UPDATE Requests** (e.g., "Set Tanaka to Morning shift on Fridays", "Add Meeting for Suzuki today"):
         - Identify specific dates in ${year}-${month + 1}.
         - Identify the Employee ID.
         - Identify Shift IDs.
         - Return a JSON with type="UPDATE".
         - The "message" field must be a polite Japanese summary of what you did.
      
      2. **QUESTION Requests** (e.g., "Who is working today?", "Who has no schedule on Tuesday?", "Count holidays for Abe"):
         - Analyze the "Current Schedule Data" provided above.
         - If checking for "no schedule" or "free", look for entries where shiftIds is empty or the date key is missing for that employee.
         - If checking for specific shifts (e.g., "Who is on Night Shift"), check if the shiftId is present.
         - Return a JSON with type="ANSWER" and a text message containing the answer.
         - The "message" field must be in Japanese.
      
      **JSON Response Format:**
      
      For Updates:
      {
        "type": "UPDATE",
        "message": "変更内容の要約（日本語）",
        "updates": [
          { 
            "date": "YYYY-MM-DD", 
            "employeeId": "emp1", 
            "shiftIds": ["morning_n", "meeting"], 
            "note": "optional text" 
          }
        ]
      }
      
      For Answers:
      {
        "type": "ANSWER",
        "message": "スケジュールデータに基づく回答（日本語）"
      }

      **Rules:**
      - Date format: YYYY-MM-DD.
      - Only generate dates for ${month + 1} (Month index ${month}).
      - Be strict about IDs.
      - **ALWAYS RESPOND IN JAPANESE.**
    `;

    const response = await ai.models.generateContent({
      model,
      contents: userPrompt,
      config: {
        systemInstruction,
        responseMimeType: "application/json",
      }
    });

    const responseText = response.text;
    if (!responseText) {
        throw new Error("No response from AI");
    }

    const parsedData = JSON.parse(responseText) as AgentResponse;
    return parsedData;

  } catch (error: any) {
    console.error("Gemini API Error:", error);
    // 生のエラーメッセージを取得して表示
    const detailedMsg = error.message || JSON.stringify(error);
    
    // APIキー関連のエラーの場合、親切なメッセージを返す
    if (detailedMsg.includes('API key') || detailedMsg.includes('400')) {
         return {
            type: 'ERROR',
            message: `APIキーエラーが発生しました。\nVercelの設定で変数名を「VITE_API_KEY」に変更し、再デプロイしてください。\n詳細: ${detailedMsg}`
        };
    }

    return {
      type: 'ERROR',
      message: `AI処理エラー: ${detailedMsg}`
    };
  }
};
