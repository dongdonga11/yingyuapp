
import { TarotArcana, WordData, DailyProphecy } from '../types';

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
        task_title: '探索未知词汇',
        task_desc: '学习一组全新的单词，保持好奇心。',
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
        task_title: '掌握核心动词',
        task_desc: '攻克那些最具创造力和变化力的词根。',
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
        task_title: '词源深度阅读',
        task_desc: '不求速度，用心体会每一个词背后的故事。',
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
        task_title: '旧词深度复盘',
        task_desc: '在已经学过的知识中，寻找新的领悟。',
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
        task_title: '知识循环记忆',
        task_desc: '复习那些处于遗忘边缘的单词。',
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
        task_title: '词义辨析挑战',
        task_desc: '区分那些长相相似的双胞胎单词。',
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
        task_title: '难词攻坚战',
        task_desc: '挑战那些你总是记错的单词，重建记忆高塔。',
        task_count: 3,
        filter_logic: (words) => words.slice(0,3), 
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
        task_title: '高级词汇赏析',
        task_desc: '学习一组优美的高级词汇，点亮语言星空。',
        task_count: 4,
        filter_logic: (words) => words,
    }
];

export const getProphecy = (arcana: TarotArcana, luckyWord: WordData): DailyProphecy => {
    const prophecies = [
        "你今天背诵的单词里藏着一把钥匙，它将在未来的某个时刻为你打开机会之门。",
        "语言不是工具，而是你灵魂的延伸。今日的积累，是明日构筑世界的砖石。",
        "混沌中诞生秩序。你对这个词的理解，让世界的迷雾消散了一分。",
        "每一个单词都是古代灵魂留下的琥珀，你今日需拾起其中最亮的一颗。",
        "不要温和地走进那个良夜，去记忆，去复述，去对抗遗忘。"
    ];

    return {
        arcana: arcana,
        intro_text: "命运的碎片已散落在词汇的迷宫之中。唯有通过智慧的试炼，方能将它们逐一寻回。",
        mission_title: `今日任务：${arcana.task_title}`,
        mission_desc: arcana.task_desc,
        reward_text: `任务奖励：解锁【${arcana.name_cn}】牌面 & 获得今日指引`,
        prophecy_text: prophecies[Math.floor(Math.random() * prophecies.length)]
    };
};
