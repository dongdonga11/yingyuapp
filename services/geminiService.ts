import { GoogleGenAI, Type, Schema } from "@google/genai";
import { WordData, TarotArcana, OracleTopic, TarotReadingResponse } from "../types";

const apiKey = process.env.API_KEY || '';
const ai = new GoogleGenAI({ apiKey });

// Schema for structured output - Words
const wordDataSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    word: { type: Type.STRING },
    root_family: { type: Type.STRING },
    root_meaning: { type: Type.STRING, description: "Chinese meaning of the root" },
    components: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          part: { type: Type.STRING },
          meaning: { type: Type.STRING, description: "Chinese meaning of the component" },
          type: { type: Type.STRING, enum: ['prefix', 'root', 'suffix'] }
        },
        required: ['part', 'meaning', 'type']
      }
    },
    etymology_story: {
      type: Type.OBJECT,
      properties: {
        origin_image: { type: Type.STRING, description: "A vivid physical scene description in CHINESE." },
        logic: { type: Type.STRING, description: "Logic chain in CHINESE (A -> B -> C)." },
        modern_meaning: { type: Type.STRING, description: "Modern Chinese meaning (v. 聚集)" }
      },
      required: ['origin_image', 'logic', 'modern_meaning']
    },
    nuance: { type: Type.STRING, description: "Nuance explanation in CHINESE" },
    quote: {
        type: Type.OBJECT,
        properties: {
            text: {type: Type.STRING},
            author: {type: Type.STRING}
        }
    }
  },
  required: ['word', 'root_family', 'components', 'etymology_story', 'nuance']
};

// Schema for Linear Oracle Reading
const oracleSchema: Schema = {
    type: Type.OBJECT,
    properties: {
        card1_title: { type: Type.STRING, description: "Short Title for Card 1 (Status). e.g., 现状：隐士" },
        card1_content: { type: Type.STRING, description: "Interpretation of Card 1 as 'Current Status' in CHINESE." },
        
        card2_title: { type: Type.STRING, description: "Short Title for Card 2 (Obstacle). e.g., 障碍：高塔" },
        card2_content: { type: Type.STRING, description: "Interpretation of Card 2 as 'The Obstacle/Blockage' in CHINESE." },
        
        card3_title: { type: Type.STRING, description: "Short Title for Card 3 (Revelation). e.g., 启示：战车" },
        card3_content: { type: Type.STRING, description: "Interpretation of Card 3 as 'The Solution/Action' in CHINESE." },
        
        synthesis_title: { type: Type.STRING, description: "Title for summary. e.g. 终极指引" },
        synthesis_content: { type: Type.STRING, description: "Final actionable summary combining all 3 cards in CHINESE." }
    },
    required: ['card1_title', 'card1_content', 'card2_title', 'card2_content', 'card3_title', 'card3_content', 'synthesis_title', 'synthesis_content']
};

export const fetchWordDetails = async (word: string): Promise<WordData | null> => {
  if (!apiKey) {
    console.warn("No API Key provided for Gemini.");
    return null;
  }

  const prompt = `
    Analyze the word: "${word}".
    Target Audience: Chinese students learning English.
    Role: You are Logos, a mystical linguist. You explain words using ancient logic and visual storytelling.
    
    Task: 
    1. Break down the word.
    2. Provide a vivid "Origin Image" (Mental picture of ancient times) in **Simplified Chinese**.
    3. Explain the logic chain in **Simplified Chinese**.
    4. Give the modern definition in **Simplified Chinese**.
    5. Explain the nuance in **Simplified Chinese**.
    
    Return strict JSON matching the schema.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-preview-09-2025',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: wordDataSchema
      }
    });

    const jsonText = response.text;
    if (!jsonText) return null;
    
    const data = JSON.parse(jsonText);
    
    return {
      ...data,
      id: word.toLowerCase(),
      phonetic: `/${word.toLowerCase()}/`, 
      tags: ["AI Generated"]
    };

  } catch (error) {
    console.error("Gemini API Error:", error);
    return null;
  }
};

export const chatWithLogos = async (history: string[], message: string): Promise<string> => {
    if (!apiKey) return "请配置 API Key。";
    
    const systemPrompt = `你是一位神秘的语言学大师，名字叫 Logos。你的说话风格带有轻微的哲理和历史感（但不要晦涩难懂）。你的目标是用“逻辑”和“画面”解答学生关于单词的疑惑。请用中文回答。`;
    
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash-preview-09-2025',
            contents: `${systemPrompt}\n\nContext:\n${history.join('\n')}\n\nSeeker: ${message}`,
        });
        return response.text || "星辰沉默不语...";
    } catch (e) {
        return "连接中断...";
    }
}

export const getOracleReading = async (cards: TarotArcana[], topic: OracleTopic): Promise<TarotReadingResponse | null> => {
    if (!apiKey) return null;

    const topicMap: Record<OracleTopic, string> = {
        love: "姻缘 / 感情 (Love)",
        wealth: "事业 / 财运 (Career & Wealth)",
        energy: "综合运势 / 今日指引 (General Energy)",
        decision: "抉择 / 方向 (Decision Making)"
    };

    const prompt = `
    Role: You are a mystical Tarot Reader named Logos.
    Input:
    1. Card 1 [Position: The Status/Present State]: ${cards[0].name_cn} (${cards[0].name})
    2. Card 2 [Position: The Obstacle/Blockage]: ${cards[1].name_cn} (${cards[1].name})
    3. Card 3 [Position: The Revelation/Advice]: ${cards[2].name_cn} (${cards[2].name})
    4. User's Question Topic: ${topicMap[topic]}

    Task:
    Perform a Linear Narrative Tarot Reading.
    Interpret the cards strictly according to their position meanings ([Status] -> [Obstacle] -> [Revelation]).
    Finally, provide a synthesis conclusion.
    
    Tone: Mystical, immersive, yet giving clear, actionable advice. 
    Language: **Simplified Chinese**.

    Output JSON structure:
    - card1_title: "现状：[Card Name]"
    - card1_content: Interpretation of the user's current situation based on Card 1.
    - card2_title: "障碍：[Card Name]"
    - card2_content: Interpretation of what is holding the user back based on Card 2.
    - card3_title: "启示：[Card Name]"
    - card3_content: The solution or action the user must take based on Card 3.
    - synthesis_title: "终极指引"
    - synthesis_content: A final summary stringing it all together. "Although [Status] and [Obstacle], [Revelation] suggests you should..."
    `;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash-preview-09-2025',
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: oracleSchema
            }
        });

        const jsonText = response.text;
        if (!jsonText) return null;
        return JSON.parse(jsonText) as TarotReadingResponse;

    } catch (e) {
        console.error("Oracle Error:", e);
        return {
            card1_title: "现状：迷雾",
            card1_content: "星辰暂未连结...",
            card2_title: "障碍：静默",
            card2_content: "...",
            card3_title: "启示：等待",
            card3_content: "...",
            synthesis_title: "错误",
            synthesis_content: "无法读取星象，请稍后再试。"
        };
    }
};