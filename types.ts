
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

export interface UserProfile {
  id: string;
  name: string;
  chineseName: string;
  birthDate: string; // ISO string
  gender: Gender;
  avatar: string;
  element: BilingualText;
  animal: BilingualText;
}

export type MetaphysicalSystemType = 
  | 'BAZI' 
  | 'HUMAN_DESIGN' 
  | 'ASTROLOGY' 
  | 'ZI_WEI' 
  | 'NUMEROLOGY' 
  | 'TZOLKIN'
  | 'LING_DONG_81';

export interface MetaphysicalSystemData {
  id: string;
  type: MetaphysicalSystemType;
  title: BilingualText;
  summary: BilingualText;
  attributes: Array<{
    label: BilingualText;
    value: BilingualText | number;
    intensity?: number; // 0 to 1
  }>;
  details: Record<string, any>;
  tags: BilingualText[];
}

export interface SynergyMetric {
  system: MetaphysicalSystemType;
  label: BilingualText;
  score: number; // 0 to 100
  delta: number; // Difference or interaction value
  description: BilingualText;
}

export interface RelationshipSynergy {
  overallScore: number;
  metrics: SynergyMetric[];
  dynamicFactors: Array<{
    type: BilingualText;
    value: number;
  }>;
}

export interface EnergyStatus {
  value: number;
  trend: number;
  tags: BilingualText[];
  primaryColor: string;
}

export interface DailyEnergy {
  date: string;
  mayanKin: number;
  mayanTitle: BilingualText;
  mayanDescription: BilingualText;
  users: Record<string, EnergyStatus>; // Keyed by user ID
  synergy: EnergyStatus;
  insight: {
    category: BilingualText;
    title: BilingualText;
    content: BilingualText;
    image: string;
  };
}
