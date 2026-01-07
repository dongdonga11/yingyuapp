
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
    lucky_word: string; // The "Key" word
    lucky_meaning: string;
    dos: string[]; // 宜
    donts: string[]; // 忌
    prophecy_text: string; // The final philosophical reveal
}
