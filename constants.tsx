
import { Language, Gender, UserProfile, DailyEnergy } from './types';

export const MOCK_USERS: UserProfile[] = [
  {
    id: 'user-1',
    name: 'Ethan Zhang',
    chineseName: '張毅',
    birthDate: '1992-08-15T09:45:00',
    gender: Gender.MALE,
    avatar: 'https://picsum.photos/id/1012/400/400',
    element: { en: 'Yang Metal', cn: '陽金' },
    animal: { en: 'Tiger', cn: '虎' }
  },
  {
    id: 'user-2',
    name: 'Sophia Chen',
    chineseName: '陳雅',
    birthDate: '1994-03-22T14:30:00',
    gender: Gender.FEMALE,
    avatar: 'https://picsum.photos/id/1027/400/400',
    element: { en: 'Yin Wood', cn: '陰木' },
    animal: { en: 'Dog', cn: '狗' }
  }
];

export const MOCK_DAILY: DailyEnergy = {
  date: new Date().toISOString(),
  mayanKin: 123,
  mayanTitle: { en: 'Transformation', cn: '蛻變' },
  mayanDescription: { 
    en: 'Blue Night: Abundance, Intuition, and Dreaming. Today is a day to explore inner wealth and abundance.', 
    cn: '藍夜：豐盛、直覺與夢想。今天是探索內在直覺與豐盛的日子。' 
  },
  users: {
    'user-1': {
      value: 85,
      trend: 5,
      tags: [{ en: 'Focused', cn: '專注' }, { en: 'Productive', cn: '高效' }],
      primaryColor: '#00f2ff'
    },
    'user-2': {
      value: 70,
      trend: -2,
      tags: [{ en: 'Intuitive', cn: '直覺' }, { en: 'Restful', cn: '休息' }],
      primaryColor: '#a855f7'
    }
  },
  synergy: {
    value: 92,
    trend: 10,
    tags: [{ en: 'Harmonious', cn: '感情和諧' }, { en: 'Grounded', cn: '穩定成長' }],
    primaryColor: '#00f2ff'
  },
  insight: {
    category: { en: 'COMMUNICATION', cn: '溝通能量' },
    title: { en: 'Perfect time for deep talk', cn: '適合進行深度溝通' },
    content: { 
      en: "Today's vibration favors vulnerability and shared dreams.", 
      cn: '今天的振動有利於展現脆弱面與分享共同夢想。' 
    },
    image: 'https://picsum.photos/id/1041/600/400'
  }
};
