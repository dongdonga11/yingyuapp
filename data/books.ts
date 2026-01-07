import { Grimoire } from '../types';

export const LIBRARY_ARCHIVE: Grimoire[] = [
    // --- APPRENTICE REALM (K12) ---
    {
        id: 'middle_school',
        title: 'Junior High',
        sub_title: 'Scroll of the Sprout',
        realm: 'apprentice',
        word_count: 2500,
        difficulty_level: 2,
        theme_color: '#10B981', // Emerald
        icon: '🌱',
        description: "一本温顺的典籍，封面上缠绕着新生的藤蔓。它轻声细语，适合初踏旅途的冒险者打好地基。"
    },
    {
        id: 'high_school',
        title: 'Senior High',
        sub_title: 'Tome of the Oak',
        realm: 'apprentice',
        word_count: 3500,
        difficulty_level: 3,
        theme_color: '#34D399', // Green
        icon: '🌳',
        description: "书脊坚硬如橡木。它记载着世界的基础法则，是通往更高魔法塔楼的必经之路。"
    },

    // --- ADEPT REALM (University) ---
    {
        id: 'cet_4',
        title: 'CET-4',
        sub_title: 'Codex of the Scholar',
        realm: 'adept',
        word_count: 4500,
        difficulty_level: 4,
        theme_color: '#60A5FA', // Blue
        icon: '📘',
        description: "深蓝色的封皮上流动着星辰的轨迹。当你翻开它时，能听到理性的低吟，要求你掌握规则与逻辑。"
    },
    {
        id: 'cet_6',
        title: 'CET-6',
        sub_title: 'Grimoire of the Adept',
        realm: 'adept',
        word_count: 5500,
        difficulty_level: 6,
        theme_color: '#3B82F6', // Darker Blue
        icon: '🧿',
        description: "比四级典籍更加厚重，书页间夹杂着复杂的长难句咒语。只有专注者才能驾驭其中的力量。"
    },

    // --- ARCHMAGE REALM (Advanced) ---
    {
        id: 'toefl',
        title: 'TOEFL',
        sub_title: 'Scepter of the West',
        realm: 'archmage',
        word_count: 8000,
        difficulty_level: 8,
        theme_color: '#F472B6', // Pink/Rose
        icon: '🏛️',
        description: "这本书记载着异域的文化与学术。它像一面镜子，不仅映照语言，更映照出你的思维逻辑。"
    },
    {
        id: 'gre',
        title: 'GRE',
        sub_title: 'The Void Contract',
        realm: 'archmage',
        word_count: 12000,
        difficulty_level: 10,
        theme_color: '#9F1239', // Dark Red
        icon: '🐉',
        description: "警告：这本书看起来很暴躁，时不时冒出黑烟。它凝视过深渊，充满了晦涩的古语。你确定要与它缔结契约吗？"
    },
    {
        id: 'ielts',
        title: 'IELTS',
        sub_title: 'Compass of the Isles',
        realm: 'archmage',
        word_count: 7000,
        difficulty_level: 7,
        theme_color: '#818CF8', // Indigo
        icon: '🧭',
        description: "一本精致的手账式魔法书，注重交流与生存。它不仅考验记忆，更考验你的听觉与反应。"
    },

    // --- GUILD TOMES (Professional) ---
    {
        id: 'business',
        title: 'Business',
        sub_title: 'Ledger of Gold',
        realm: 'guild',
        word_count: 3000,
        difficulty_level: 5,
        theme_color: '#F59E0B', // Amber
        icon: '⚖️',
        description: "黄铜封皮，带有齿轮锁扣。书页间流淌着金币的撞击声，记载着商业帝国的交易法则。"
    },
    {
        id: 'programming',
        title: 'Code',
        sub_title: 'Silicon Scripture',
        realm: 'guild',
        word_count: 2000,
        difficulty_level: 6,
        theme_color: '#14B8A6', // Teal
        icon: '💾',
        description: "散发着幽幽的绿光，封面上的文字由0和1组成。这是构建数字世界的底层咒语。"
    }
];