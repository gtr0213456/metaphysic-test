
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

  static getBazi(user: UserProfile): MetaphysicalSystemData {
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

  static getHumanDesign(user: UserProfile): MetaphysicalSystemData {
    return {
      id: `hd-${user.id}`,
      type: 'HUMAN_DESIGN',
      title: { en: 'Human Design', cn: '人類圖' },
      summary: { en: 'Mechanical energetic blueprint.', cn: '能量運作機制藍圖。' },
      attributes: [
        { label: { en: 'Type', cn: '類型' }, value: { en: 'Projector', cn: '投射者' } },
        { label: { en: 'Profile', cn: '角色' }, value: { en: '1/3', cn: '1/3' } },
        { label: { en: 'Authority', cn: '權威' }, value: { en: 'Splenic', cn: '直覺' } }
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
      attributes: [
        { label: { en: 'Sun', cn: '太陽' }, value: { en: 'Leo', cn: '獅子座' } },
        { label: { en: 'Moon', cn: '月亮' }, value: { en: 'Pisces', cn: '雙魚座' } },
        { label: { en: 'Rising', cn: '上升' }, value: { en: 'Libra', cn: '天秤座' } }
      ],
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
      attributes: [
        { label: { en: 'Main Palace', cn: '命宮' }, value: { en: 'Wu Qu', cn: '武曲' } },
        { label: { en: 'Star 2', cn: '副星' }, value: { en: 'Tan Lang', cn: '貪狼' } }
      ],
      details: {},
      tags: []
    };
  }

  static getNumerology(user: UserProfile): MetaphysicalSystemData {
    return {
      id: `num-${user.id}`,
      type: 'NUMEROLOGY',
      title: { en: 'Core Numerology', cn: '生命靈數' },
      summary: { en: 'Vibrational frequency of birth date.', cn: '出生日期的振動頻率。' },
      attributes: [
        { label: { en: 'Life Path', cn: '生命道路' }, value: 7 },
        { label: { en: 'Expression', cn: '表現數' }, value: 5 }
      ],
      details: {},
      tags: []
    };
  }

  static get81LingDong(user: UserProfile): MetaphysicalSystemData {
    return {
      id: `81ld-${user.id}`,
      type: 'LING_DONG_81',
      title: { en: '81 Ling Dong', cn: '81靈動數' },
      summary: { en: 'Name stroke count vibrational analysis.', cn: '姓名筆劃振動分析。' },
      attributes: [
        { label: { en: 'Total Strokes', cn: '總格' }, value: 33 },
        { label: { en: 'Vibration', cn: '振動' }, value: { en: 'Powerful', cn: '吉/大吉' } }
      ],
      details: {},
      tags: []
    };
  }

  static getRelationshipSynergy(u1: UserProfile, u2: UserProfile): RelationshipSynergy {
    // Abstract data-driven synergy calculation
    const metrics: SynergyMetric[] = [
      {
        system: 'BAZI',
        label: { en: 'Elemental Balance', cn: '五行平衡' },
        score: 85,
        delta: 0.12,
        description: { en: 'High interaction density in Metal/Water phases.', cn: '金水相位交互密度高。' }
      },
      {
        system: 'HUMAN_DESIGN',
        label: { en: 'Center Definition', cn: '能量中心定義' },
        score: 72,
        delta: 0.45,
        description: { en: 'Defined root connection with open head synergy.', cn: '根部中心定義與頭部中心協作。' }
      },
      {
        system: 'NUMEROLOGY',
        label: { en: 'Frequency Sync', cn: '頻率同步' },
        score: 91,
        delta: 0.05,
        description: { en: 'Prime number resonance detected in core cycles.', cn: '核心週期偵測到質數共振。' }
      }
    ];

    return {
      overallScore: 82,
      metrics,
      dynamicFactors: [
        { type: { en: 'Tension', cn: '張力' }, value: 24 },
        { type: { en: 'Support', cn: '支撐' }, value: 76 },
        { type: { en: 'Growth', cn: '成長' }, value: 58 }
      ]
    };
  }
}
