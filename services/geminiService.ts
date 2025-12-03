import { GoogleGenAI } from "@google/genai";
import { Employee, ShiftType, ScheduleData } from '../types';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

export interface AgentResponse {
  type: 'UPDATE' | 'ANSWER' | 'ERROR';
  message: string;
  updates?: {
    date: string;
    employeeId: string;
    shiftIds: string[]; // Updated to array
    note?: string;
  }[];
}

/**
 * Processes a natural language request to modify or query the roster.
 */
export const processRosterRequest = async (
  userPrompt: string,
  employees: Employee[],
  shiftTypes: ShiftType[],
  currentSchedule: ScheduleData,
  year: number,
  month: number
): Promise<AgentResponse> => {
  try {
    const model = 'gemini-2.5-flash';
    
    // Construct context
    const employeeList = employees.map(e => `${e.name} (ID: ${e.id})`).join(', ');
    const shiftList = shiftTypes.map(s => `${s.name} (ID: ${s.id})`).join(', ');
    
    // Simplify schedule for context to save tokens (map keys to readable format if needed, 
    // but sending raw JSON is usually fine for this scale)
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

  } catch (error) {
    console.error("Gemini API Error:", error);
    return {
      type: 'ERROR',
      message: "AI処理中にエラーが発生しました。もう一度お試しください。"
    };
  }
};
