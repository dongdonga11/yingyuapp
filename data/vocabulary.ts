import { WordData } from '../types';

export const initialVocabulary: WordData[] = [
  // --- ROOT: GREG (羊群/聚集) ---
  {
    id: "congregate",
    word: "Congregate",
    phonetic: "/ˈkɒŋɡrɪɡeɪt/",
    root_family: "Greg",
    root_meaning: "羊群 (Flock)",
    components: [
      { part: "Con-", meaning: "一起 (Together)", type: "prefix" },
      { part: "greg", meaning: "羊群 (Flock)", type: "root" },
      { part: "-ate", meaning: "动词 (Action)", type: "suffix" }
    ],
    etymology_story: {
      origin_image: "古罗马的牧羊人挥动牧杖，将散乱在山坡上的羊群驱赶到一个狭窄的围栏里。羊群因本能而挤在一起，彼此摩擦，发出嘈杂的叫声。",
      logic: "牧羊人把羊赶到一起 (Physical) → 人群的聚集 (Social)。",
      modern_meaning: "v. 聚集，集合"
    },
    nuance: "这个词带有强烈的‘生物本能’色彩。它不只是开会(Meet)，而是像动物一样出于本能或外力而聚成一团。",
    quote: { text: "Birds of a feather flock together.", author: "Proverb" },
    related_words: [
        { word: "Segregate", meaning: "隔离", relation: "Se- (分开) + Greg → 把羊群分开" },
        { word: "Aggregate", meaning: "合计", relation: "Ag- (去) + Greg → 往羊群里加" },
        { word: "Egregious", meaning: "极坏的", relation: "E- (出) + Greg → 羊群里的异类" }
    ],
    tags: ["GRE", "Greg家族"]
  },
  {
    id: "segregate",
    word: "Segregate",
    phonetic: "/ˈsɛɡrɪɡeɪt/",
    root_family: "Greg",
    root_meaning: "羊群 (Flock)",
    components: [
      { part: "Se-", meaning: "分开 (Apart)", type: "prefix" },
      { part: "greg", meaning: "羊群 (Flock)", type: "root" },
      { part: "-ate", meaning: "动词 (Action)", type: "suffix" }
    ],
    etymology_story: {
      origin_image: "牧羊人检查羊群，发现一只生病的羊，为了防止传染，将其强行拉出羊群，关在另一个围栏里。",
      logic: "从羊群中分离 (Physical) → 种族或群体的隔离 (Social)。",
      modern_meaning: "v. 隔离，分开"
    },
    nuance: "通常带有强制性，暗示被隔离者是‘非主流’的。",
    tags: ["GRE", "Greg家族"]
  },
  {
    id: "aggregate",
    word: "Aggregate",
    phonetic: "/ˈæɡrɪɡət/",
    root_family: "Greg",
    root_meaning: "羊群 (Flock)",
    components: [
      { part: "Ag-", meaning: "去，往 (To)", type: "prefix" },
      { part: "greg", meaning: "羊群 (Flock)", type: "root" },
      { part: "-ate", meaning: "动词 (Action)", type: "suffix" }
    ],
    etymology_story: {
      origin_image: "秋天到了，牧羊人将几个小羊群从不同的山头驱赶到一个大山谷里，为了过冬将它们合并成一个巨大的羊群。",
      logic: "把小的羊群加到一个大的羊群里 (Physical) → 总计，合计 (Math)。",
      modern_meaning: "v. 合计，总计; n. 总数"
    },
    nuance: "强调由零散的部分组成一个整体（Sum），常用于数据统计。",
    tags: ["TOEFL", "Greg家族"]
  },
  
  // --- ROOT: SPECT (看) ---
  {
    id: "spectacular",
    word: "Spectacular",
    phonetic: "/spɛkˈtakjʊlə/",
    root_family: "Spect",
    root_meaning: "看 (Look)",
    components: [
      { part: "Spect", meaning: "看 (Look)", type: "root" },
      { part: "-acular", meaning: "形容词 (Adjective)", type: "suffix" }
    ],
    etymology_story: {
      origin_image: "古罗马斗兽场中，成千上万的观众屏住呼吸，注视着场中央角斗士的殊死搏斗。",
      logic: "值得万人围观的 → 壮观的。",
      modern_meaning: "adj. 壮观的，引人注目的"
    },
    nuance: "强调视觉上的冲击力。",
    related_words: [
        { word: "Spectator", meaning: "观众", relation: "看的人" },
        { word: "Inspect", meaning: "检查", relation: "In- (往里) + Spect → 往里看" }
    ],
    tags: ["通用", "Spect家族"]
  },
  {
    id: "conspicuous",
    word: "Conspicuous",
    phonetic: "/kənˈspɪkjʊəs/",
    root_family: "Spect",
    root_meaning: "看 (Look)",
    components: [
      { part: "Con-", meaning: "完全 (Thoroughly)", type: "prefix" },
      { part: "spic", meaning: "看 (Look)", type: "root" },
      { part: "-uous", meaning: "形容词 (Adj)", type: "suffix" }
    ],
    etymology_story: {
      origin_image: "在一片低矮的平房中，矗立着一座金色的高塔，在阳光下熠熠生辉，无论从哪里都能完全看见它。",
      logic: "能被彻底看到的 → 显眼的。",
      modern_meaning: "adj. 显著的，显而易见的"
    },
    nuance: "有时暗示‘招摇’。",
    tags: ["SAT", "Spect家族"]
  },
  {
    id: "perspective",
    word: "Perspective",
    phonetic: "/pəˈspɛktɪv/",
    root_family: "Spect",
    root_meaning: "看 (Look)",
    components: [
      { part: "Per-", meaning: "穿过 (Through)", type: "prefix" },
      { part: "spect", meaning: "看 (Look)", type: "root" },
      { part: "-ive", meaning: "名词/形容词", type: "suffix" }
    ],
    etymology_story: {
      origin_image: "画家透过一个透明的玻璃框观察风景，为了在画布上画出远近的层次感。",
      logic: "透过现象看本质/透过空间看距离 (Physical) → 视角，透视法 (Abstract)。",
      modern_meaning: "n. 视角，观点；透视法"
    },
    nuance: "强调观察事物的‘角度’或‘深度’。",
    tags: ["IELTS", "Spect家族"]
  }
];