import { GoogleGenerativeAI } from "@google/generative-ai";
import { UserProfile, MetaphysicalSystemData, RelationshipSynergy, SynergyMetric } from '../types';

// 初始化 Gemini AI (從環境變數讀取 VITE_GEMINI_API_KEY)
const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY || "");
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

export class MetaphysicalEngine {
  
  /**
   * AI 核心方法：將計算出的玄學數據發送給 Gemini 進行解讀
   */
  static async getAIReading(user: UserProfile): Promise<string> {
    const bazi = this.getBazi(user);
    const num = this.getNumerology(user);
    const lingdong = this.get81LingDong(user);

    const prompt = `
      你是一位精通中西命理與現代能量分析的導師。請根據以下計算出的玄學數據，為使用者提供一段約 150 字的專業分析與今日建議：
      - 使用者姓名：${user.name}
      - 八字年柱：${bazi.details.pillars[0]}
      - 生命靈數：${num.attributes[0].value} 號人
      - 姓名總格：${lingdong.attributes[0].value} (吉凶：${lingdong.attributes[1].value.cn})
      請用繁體中文回答，語氣要知性、溫暖且富有啟發性。
    `;

    try {
      const result = await model.generateContent(prompt);
      const response = await result.response;
      return response.text();
    } catch (error) {
      console.error("Gemini AI 讀取失敗:", error);
      return "目前的星象能量過於強大，AI 導師正在冥想中，請稍後再試。";
    }
  }

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
    if (!name) return 0;
    const base = name.split('').reduce((acc, char) => acc + (char.charCodeAt(0) % 10), 0);
    return (base % 81) || 81;
  }

  private static calculateBaziLogic(birthday: string) {
    const date = new Date(birthday || '1990-01-01');
    const year = date.getFullYear();
    const month = date.getMonth() + 1;

    const stems = ['庚', '辛', '壬', '癸', '甲', '乙', '丙', '丁', '戊', '己'];
    const branches = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];
    
    const yearStem = stems[(year - 1900) % 10];
    const yearBranch = branches[(year - 1900) % 12];

    let weights = { Wood: 20, Fire: 20, Earth: 20, Metal: 20, Water: 20 };

    if ([3, 4, 5].includes(month)) weights.Wood += 30;
    else if ([6, 7, 8].includes(month)) weights.Fire += 30;
    else if ([9, 10, 11].includes(month)) weights.Metal += 30;
    else weights.Water += 30;

    return {
      pillar: `${yearStem}${yearBranch}`,
      weights: Object.entries(weights).map(([key, val]) => ({
        label: key,
        value: val,
        intensity: val / 100
      }))
    };
  }

  // --- 各系統實作 ---

  static getBazi(user: UserProfile): MetaphysicalSystemData {
    const bazi = this.calculateBaziLogic(user.birthday);
    const elementNames: Record<string, string> = { 
      Wood: '木', Fire: '火', Earth: '土', Metal: '金', Water: '水' 
    };

    return {
      id: `bazi-${user.id}`,
      type: 'BAZI',
      title: { en: 'Bazi (Four Pillars)', cn: '八字命盤' },
      summary: { en: 'Analysis of innate elemental balance.', cn: '先天五行結構分析。' },
      attributes: bazi.weights.map(w => ({
        label: { en: w.label, cn: elementNames[w.label] },
        value: w.value,
        intensity: w.intensity
      })),
      details: { pillars: [bazi.pillar, '??', '??', '??'] },
      tags: [{ en: 'Dynamic Analysis', cn: '動態分析中' }]
    };
  }

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

  static getHumanDesign(user: UserProfile): MetaphysicalSystemData {
    return {
      id: `hd-${user.id}`,
      type: 'HUMAN_DESIGN',
      title: { en: 'Human Design', cn: '人類圖' },
      summary: { en: 'Mechanical energetic blueprint.', cn: '能量運作機制藍圖。' },
      attributes: [
        { label: { en: 'Type', cn: '類型' }, value: { en: 'Projector', cn: '投射者' } },
        { label: { en: 'Profile', cn: '角色' }, value: { en: '1/3', cn: '1/3' } }
      ],
      details: {},
      tags: [{ en: 'Strategy: Invite', cn: '策略：等待邀請' }]
    };
  }

  static getAstrology(user: UserProfile): MetaphysicalSystemData {
    return {
      id: `astro-${user.id}`,
      type: 'ASTROLOGY',
      title: { en: 'Western Astrology', cn: '西洋占星' },
      summary: { en: 'Geocentric planetary coordinates.', cn: '地球中心行星座標分析。' },
      attributes: [{ label: { en: 'Sun', cn: '太陽' }, value: { en: 'Leo', cn: '獅子座' } }],
      details: {},
      tags: []
    };
  }

  static getZiWei(user: UserProfile): MetaphysicalSystemData {
    return {
      id: `ziwei-${user.id}`,
      type: 'ZI_WEI',
      title: { en: 'Zi Wei Dou Shu', cn: '紫微斗數' },
      summary: { en: 'Stellar coordinates and palace distribution.', cn: '星曜座標與宮位分佈。' },
      attributes: [{ label: { en: 'Main Palace', cn: '命宮' }, value: { en: 'Wu Qu', cn: '武曲' } }],
      details: {},
      tags: []
    };
  }

  static getRelationshipSynergy(u1: UserProfile, u2: UserProfile): RelationshipSynergy {
    const p1 = this.calculateLifePath(u1.birthday);
    const p2 = this.calculateLifePath(u2.birthday);
    const diff = Math.abs(p1 - p2);
    const numScore = 100 - (diff * 10);

    return {
      overallScore: Math.round(numScore),
      metrics: [
        {
          system: 'NUMEROLOGY',
          label: { en: 'Frequency Sync', cn: '頻率同步' },
          score: numScore,
          delta: diff / 10,
          description: { en: `Resonance between Path ${p1} and ${p2}.`, cn: `${p1}號人與${p2}號人的共振。` }
        }
      ],
      dynamicFactors: [
        { type: { en: 'Support', cn: '支撐' }, value: 80 - (diff * 2) }
      ]
    };
  }
}
