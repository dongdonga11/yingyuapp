
export interface WordComponent {
  part: string;
  meaning: string;
  type: 'prefix' | 'root' | 'suffix';
}

export interface EtymologyStory {
  origin_image: string; // The physical scene description
  logic: string;        // The bridge from scene to meaning
  modern_meaning: string;
}

export interface Quote {
  text: string;
  author: string;
  source?: string;
}

export interface RelatedWord {
    word: string;
    meaning: string;
    relation: string; // e.g., "Separate the flock"
}

export interface WordData {
  id: string;
  word: string;
  phonetic: string;
  root_family: string; // e.g., "Greg", "Spect"
  root_meaning: string; // e.g., "Flock", "Look"
  components: WordComponent[];
  etymology_story: EtymologyStory;
  nuance: string;
  quote?: Quote;
  related_words?: RelatedWord[]; // Family Ties
  tags: string[];
  
  // NEW: Does this word hide a Tarot Card?
  hiddenTarot?: TarotArcana; 
}

// --- NEW TAROT TYPES ---

export type ArcanaType = 'Fool' | 'Magician' | 'HighPriestess' | 'Empress' | 'Emperor' | 'Hierophant' | 'Lovers' | 'Chariot' | 'Strength' | 'Hermit' | 'WheelOfFortune' | 'Justice' | 'HangedMan' | 'Death' | 'Temperance' | 'Devil' | 'Tower' | 'Star' | 'Moon' | 'Sun' | 'Judgement' | 'World';

export interface TarotStats {
    memory: number; // 1-5 stars
    focus: number;
    insight: number;
}

export interface TarotArcana {
    id: ArcanaType;
    name: string; // e.g., "The Magician"
    name_cn: string; // e.g., "魔术师"
    meaning: string; // e.g., "Creation & Action"
    theme_color: string; // Hex for glow effects
    icon: string; // Emoji or SVG path
    
    // Fortune
    stats: TarotStats;
    fortune_text: string; // "命运之轮转动..."
    
    // Task
    task_type: 'new' | 'review' | 'deep' | 'logic' | 'listen' | 'quiz';
    task_title: string; // "今日宜：开疆拓土"
    task_desc: string; // "手中的魔杖已准备好..."
    task_count: number;
    
    filter_logic: (words: WordData[]) => WordData[]; // Logic to select words
}

export interface DailyProphecy {
    arcana: TarotArcana;
    intro_text: string; // "卡片隐藏在任务中..."
    mission_title: string; // "今日任务：..."
    mission_desc: string;
    reward_text: string; // "任务奖励：..."
    prophecy_text: string; // The philosophical flavor text
}

// --- ORACLE READING TYPES ---

export type OracleTopic = 'love' | 'wealth' | 'energy' | 'decision';

export interface TarotReadingResponse {
    // Phase 1: The Present / Status
    card1_title: string; // e.g., "现状：隐士的内省"
    card1_content: string; // "你最近的学习状态比较封闭..."

    // Phase 2: The Obstacle / Challenge
    card2_title: string; // e.g., "障碍：高塔的突变"
    card2_content: string; // "外界的干扰打乱了你的节奏..."

    // Phase 3: The Revelation / Advice
    card3_title: string; // e.g., "启示：战车的行动"
    card3_content: string; // "不要想太多，直接行动..."

    // Phase 4: Synthesis
    synthesis_title: string; // e.g., "终极指引"
    synthesis_content: string; // "综上所述，虽然...但是...建议..."
}