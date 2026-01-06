import { TarotArcana, WordData } from '../types';

const getRandomStats = () => ({
    memory: Math.floor(Math.random() * 2) + 3, // 3-5
    focus: Math.floor(Math.random() * 3) + 2, // 2-5
    insight: Math.floor(Math.random() * 2) + 3  // 3-5
});

export const TAROT_DECK: TarotArcana[] = [
    {
        id: 'Fool',
        name: 'The Fool',
        name_cn: '愚人',
        meaning: 'Beginnings',
        theme_color: '#10B981', // Emerald
        icon: '🤡',
        stats: { memory: 4, focus: 3, insight: 5 },
        fortune_text: "像个孩子一样去探索未知，不要害怕犯错。",
        task_type: 'new',
        task_title: '任务：探索未知',
        task_desc: '今日适宜轻装上阵，学习全新的词汇。',
        task_count: 5,
        filter_logic: (words) => words.filter(w => !w.tags.includes('Hard')),
    },
    {
        id: 'Magician',
        name: 'The Magician',
        name_cn: '魔术师',
        meaning: 'Manifestation',
        theme_color: '#EF4444', // Red
        icon: '🪄',
        stats: { memory: 5, focus: 5, insight: 4 },
        fortune_text: "手中的魔杖已准备好。今日能量充沛，适宜创造。",
        task_type: 'new',
        task_title: '任务：开疆拓土',
        task_desc: '攻克那些最具创造力的动词。',
        task_count: 5,
        filter_logic: (words) => words.filter(w => w.word.length > 5),
    },
    {
        id: 'HighPriestess',
        name: 'High Priestess',
        name_cn: '女祭司',
        meaning: 'Intuition',
        theme_color: '#6366F1', // Indigo
        icon: '🌙',
        stats: { memory: 3, focus: 4, insight: 5 },
        fortune_text: "向内看。答案不在喧嚣中，而在静谧里。",
        task_type: 'deep',
        task_title: '任务：静心阅读',
        task_desc: '不求多，但求懂。深度阅读词源故事。',
        task_count: 3,
        filter_logic: (words) => words.slice(0, 3),
    },
    {
        id: 'Hermit',
        name: 'The Hermit',
        name_cn: '隐士',
        meaning: 'Introspection',
        theme_color: '#3B82F6', // Blue
        icon: '🏮',
        stats: { memory: 3, focus: 5, insight: 5 },
        fortune_text: "真理往往藏在深处。孤独是智慧的摇篮。",
        task_type: 'review',
        task_title: '任务：深度复盘',
        task_desc: '在旧知中寻找新的智慧。',
        task_count: 3,
        filter_logic: (words) => words.filter(w => w.root_family === 'Greg'),
    },
    {
        id: 'WheelOfFortune',
        name: 'Wheel of Fortune',
        name_cn: '命运之轮',
        meaning: 'Cycles',
        theme_color: '#F59E0B', // Amber
        icon: '🎡',
        stats: { memory: 5, focus: 3, insight: 4 },
        fortune_text: "命运之轮转动，旧的知识将在今日完成闭环。",
        task_type: 'review',
        task_title: '任务：知识轮回',
        task_desc: '复习那些快要遗忘的单词。',
        task_count: 5,
        filter_logic: (words) => words, // Random mix
    },
    {
        id: 'Justice',
        name: 'Justice',
        name_cn: '正义',
        meaning: 'Truth',
        theme_color: '#A855F7', // Purple
        icon: '⚖️',
        stats: { memory: 4, focus: 5, insight: 3 },
        fortune_text: "无论黑白，皆有法则。今日适宜厘清逻辑。",
        task_type: 'logic',
        task_title: '任务：逻辑辨析',
        task_desc: '区分那些长得像的双胞胎单词。',
        task_count: 4,
        filter_logic: (words) => words.filter(w => w.root_family === 'Spect'),
    },
    {
        id: 'Tower',
        name: 'The Tower',
        name_cn: '高塔',
        meaning: 'Sudden Change',
        theme_color: '#9F1239', // Rose
        icon: '⚡',
        stats: { memory: 5, focus: 2, insight: 5 },
        fortune_text: "只有推倒错误的认知，才能建立牢固的记忆。",
        task_type: 'quiz',
        task_title: '任务：破壁重建',
        task_desc: '挑战那些你总是记错的单词。',
        task_count: 3,
        filter_logic: (words) => words.slice(0,3), // Mock "hard" words
    },
    {
        id: 'Star',
        name: 'The Star',
        name_cn: '星星',
        meaning: 'Hope',
        theme_color: '#06B6D4', // Cyan
        icon: '✨',
        stats: { memory: 4, focus: 4, insight: 5 },
        fortune_text: "即使在最黑的夜里，希望也像星光一样指引方向。",
        task_type: 'new',
        task_title: '任务：追逐星光',
        task_desc: '学习一组优美的高级词汇。',
        task_count: 4,
        filter_logic: (words) => words,
    }
];

export const getProphecy = (arcana: TarotArcana, luckyWord: WordData) => {
    const prophecies = [
        "你今天背诵的单词里藏着一把钥匙，它将在未来的第 37 天为你打开一扇机会之门。",
        "语言不是工具，而是你灵魂的延伸。今日的积累，是明日构筑世界的砖石。",
        "孤独不是寂寞，而是像太阳一样，虽然独自燃烧，却拥有引力。",
        "混沌中诞生秩序。你对这个词的理解，让世界的迷雾消散了一分。",
        "每一个单词都是古代灵魂留下的琥珀，你今日拾起了其中最亮的一颗。",
        "不要温和地走进那个良夜，去记忆，去复述，去对抗遗忘。"
    ];

    const dosMap: Record<string, string[]> = {
        'new': ['尝试新事物', '大声朗读', '做笔记'],
        'review': ['温故知新', '整理思维导图', '喝茶'],
        'deep': ['独处', '冥想', '阅读长文'],
        'logic': ['理性分析', '做决定', '辩论'],
        'quiz': ['直面错误', '挑战自我', '运动'],
        'listen': ['散步', '听播客', '放空']
    };

    const dontsMap: Record<string, string[]> = {
        'new': ['墨守成规', '畏难', '死记硬背'],
        'review': ['贪多嚼不烂', '浮躁', '被打断'],
        'deep': ['社交', '看短视频', '碎片化'],
        'logic': ['情绪化', '模棱两可', '凭直觉'],
        'quiz': ['逃避', '自我怀疑', '拖延'],
        'listen': ['焦虑', '多任务处理', '噪音']
    };

    return {
        arcana: arcana,
        lucky_word: luckyWord.word,
        lucky_meaning: luckyWord.etymology_story.modern_meaning,
        dos: dosMap[arcana.task_type] || ['坚持', '专注'],
        donts: dontsMap[arcana.task_type] || ['放弃', '分心'],
        prophecy_text: prophecies[Math.floor(Math.random() * prophecies.length)]
    };
};