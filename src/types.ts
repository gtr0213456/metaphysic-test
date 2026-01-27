export enum Language {
  EN = 'en',
  CN = 'cn'
}

export enum Gender {
  MALE = 'Male',
  FEMALE = 'Female'
}

export interface BilingualText {
  en: string;
  cn: string;
}

// 基礎用戶資料
export interface UserProfile {
  id: string;
  name: string;
  chineseName: string;
  birthDate: string; // ISO string (包含時間與時區)
  gender: Gender;
  avatar: string;
  // 基礎屬性快照 (用於主頁面快速顯示)
  element: BilingualText; // 五行
  animal: BilingualText;  // 生肖
  lifePathNumber?: number; // 生命靈數
}

// 擴充命理系統類型 (包含你提到的所有系統)
export type MetaphysicalSystemType = 
  | 'BAZI'               // 八字
  | 'HUMAN_DESIGN'       // 人類圖
  | 'ASTROLOGY'          // 占星
  | 'ZI_WEI'             // 紫微斗數
  | 'LIFE_NUMEROLOGY'    // 生命靈數 (九宮格)
  | 'TZOLKIN'            // 卓爾金曆
  | 'NAME_LING_DONG_81'  // 姓名學 81 靈動數
  | 'ZODIAC_ANNUAL'      // 生肖流年 (犯太歲)
  | 'BIO_RHYTHM'         // 生物節律
  | 'QI_MEN';            // 奇門遁甲 (未來擴充)

// 通用的系統數據包裝 (這部分保留你原本的設計，但增加強型別)
export interface MetaphysicalSystemData {
  id: string;
  type: MetaphysicalSystemType;
  title: BilingualText;
  summary: BilingualText;
  // 核心數值 (例如：八字的身強身弱、靈數的 1-9)
  attributes: Array<{
    label: BilingualText;
    value: BilingualText | number | string;
    intensity?: number; 
  }>;
  // 各系統特定的深層數據 (例如紫微十二宮、人類圖通道)
  details: {
    baziChart?: string[][];     // 四柱
    ziweiPalaces?: any[];      // 十二宮數據
    numerologyGrid?: number[]; // 九宮格位置
    nameStrokes?: {            // 姓名五格筆劃
      heaven: number;
      person: number;
      earth: number;
      outer: number;
      total: number;
    };
  };
  tags: BilingualText[];
}

// 關係互動 (Synergy) 維度
export interface SynergyMetric {
  system: MetaphysicalSystemType;
  label: BilingualText;
  score: number; // 0 to 100
  delta: number; // 差異或互動方向
  description: BilingualText;
  warningTags?: BilingualText[]; // 雷區提醒
}

export interface RelationshipSynergy {
  overallScore: number;
  metrics: SynergyMetric[];
  bestInteractionTime?: string; // 建議最佳溝通時段
  communicationTone: BilingualText; // 建議溝通語氣
}

// 每日能量與狀態
export interface EnergyStatus {
  value: number; // 能量強度
  trend: number; // 趨勢 (上升或下降)
  tags: BilingualText[];
  primaryColor: string;
}

export interface DailyEnergy {
  date: string;
  mayanKin: number;
  mayanTitle: BilingualText;
  mayanDescription: BilingualText;
  users: Record<string, EnergyStatus>; // 男方與女方的狀態
  synergy: EnergyStatus; // 雙方共振狀態
  // 決策建議
  guidance: {
    work: BilingualText;
    relationship: BilingualText;
    avoid: BilingualText; // 忌諱事項
  };
}
