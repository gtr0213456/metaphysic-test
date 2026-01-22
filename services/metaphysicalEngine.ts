import { UserProfile, MetaphysicalSystemData, RelationshipSynergy, SynergyMetric } from '../types';

export class MetaphysicalEngine {
  
  static getSystemData(user: UserProfile): MetaphysicalSystemData[] {
    return [
      this.getBazi(user),
      this.getHumanDesign(user),
      this.getAstrology(user),
      this.getZiWei(user),
      this.getNumerology(user),
      this.get81LingDong(user)
    ];
  }

  // --- 核心計算工具 ---

  private static calculateLifePath(birthday: string): number {
    const digits = birthday.replace(/\D/g, '');
    if (!digits) return 0;
    const reduce = (numStr: string): number => {
      const sum = numStr.split('').reduce((acc, d) => acc + parseInt(d, 10), 0);
      return sum > 9 ? reduce(sum.toString()) : sum;
    };
    return reduce(digits);
  }

  private static calculateStrokes(name: string): number {
    // 真正的筆劃計算通常需要後端 API 或大型字典檔
    // 這裡我們先用字串長度與字元編碼模擬一個穩定的計算邏輯
    if (!name) return 0;
    const base = name.split('').reduce((acc, char) => acc + (char.charCodeAt(0) % 10), 0);
    return (base % 81) || 81; // 確保在 1-81 之間
  }

  // --- 各系統實作 ---

  static getNumerology(user: UserProfile): MetaphysicalSystemData {
    const lifePath = this.calculateLifePath(user.birthday || '2000-01-01');
    return {
      id: `num-${user.id}`,
      type: 'NUMEROLOGY',
      title: { en: 'Core Numerology', cn: '生命靈數' },
      summary: { en: 'Vibrational frequency of birth date.', cn: '出生日期的振動頻率。' },
      attributes: [
        { label: { en: 'Life Path', cn: '生命道路' }, value: lifePath },
        { label: { en: 'Expression', cn: '表現數' }, value: lifePath } 
      ],
      details: { calculatedAt: new Date().toISOString() },
      tags: [{ en: `Path ${lifePath}`, cn: `${lifePath}號人` }]
    };
  }

  static get81LingDong(user: UserProfile): MetaphysicalSystemData {
    const totalStrokes = this.calculateStrokes(user.name);
    // 簡單判斷吉凶 (示範用)
    const isLucky = [1, 3, 5, 7, 8, 11, 13, 15, 16, 18, 21, 23, 24, 25, 31, 32, 33, 35, 37, 39, 41, 45, 47, 48, 52, 57, 61, 63, 65, 67, 68, 81].includes(totalStrokes);

    return {
      id: `81ld-${user.id}`,
      type: 'LING_DONG_81',
      title: { en: '81 Ling Dong', cn: '81靈動數' },
      summary: { en: 'Name stroke count vibrational analysis.', cn: '姓名筆劃振動分析。' },
      attributes: [
        { label: { en: 'Total Strokes', cn: '總格' }, value: totalStrokes },
        { label: { en: 'Vibration', cn: '振動' }, value: { en: isLucky ? 'Auspicious' : 'Average', cn: isLucky ? '吉' : '平' } }
      ],
      details: { nameAnalyzed: user.name },
      tags: []
    };
  }

  static getBazi(user: UserProfile): MetaphysicalSystemData {
    // 這裡目前仍為模擬數據，八字需要複雜的萬年曆轉換邏輯
    return {
      id: `bazi-${user.id}`,
      type: 'BAZI',
      title: { en: 'Bazi (Four Pillars)', cn: '八字命盤' },
      summary: { en: 'Structural analysis of innate elemental balance.', cn: '先天五行結構分析。' },
      attributes: [
        { label: { en: 'Wood', cn: '木' }, value: 20, intensity: 0.2 },
        { label: { en: 'Fire', cn: '火' }, value: 45, intensity: 0.45 },
        { label: { en: 'Earth', cn: '土' }, value: 15, intensity: 0.15 },
        { label: { en: 'Metal', cn: '金' }, value: 80, intensity: 0.8 },
        { label: { en: 'Water', cn: '水' }, value: 30, intensity: 0.3 }
      ],
      details: { pillars: ['壬申', '戊申', '癸酉', '丁巳'] },
      tags: [{ en: 'Metal Strong', cn: '金旺' }]
    };
  }

  // ... (其他 getHumanDesign, getAstrology, getZiWei 保持原狀) ...

  static getRelationshipSynergy(u1: UserProfile, u2: UserProfile): RelationshipSynergy {
    const p1 = this.calculateLifePath(u1.birthday);
    const p2 = this.calculateLifePath(u2.birthday);
    
    // 簡單的共振演算法：如果數字相同或相近，分數較高
    const diff = Math.abs(p1 - p2);
    const numScore = 100 - (diff * 10);

    const metrics: SynergyMetric[] = [
      {
        system: 'NUMEROLOGY',
        label: { en: 'Frequency Sync', cn: '頻率同步' },
        score: numScore,
        delta: diff / 10,
        description: { en: `Resonance between Path ${p1} and Path ${p2}.`, cn: `${p1}號人與${p2}號人的頻率共振。` }
      },
      {
        system: 'BAZI',
        label: { en: 'Elemental Balance', cn: '五行平衡' },
        score: 85,
        delta: 0.12,
        description: { en: 'High interaction density in Metal/Water phases.', cn: '金水相位交互密度高。' }
      }
    ];

    return {
      overallScore: Math.round((numScore + 85) / 2),
      metrics,
      dynamicFactors: [
        { type: { en: 'Tension', cn: '張力' }, value: 20 + (diff * 5) },
        { type: { en: 'Support', cn: '支撐' }, value: 80 - (diff * 2) },
        { type: { en: 'Growth', cn: '成長' }, value: 60 }
      ]
    };
  }
}
