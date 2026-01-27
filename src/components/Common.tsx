
import React from 'react';
import { BilingualText, Language } from '../types';

export const Badge: React.FC<{ text: BilingualText, lang: Language, className?: string }> = ({ text, lang, className = "" }) => (
  <span className={`px-3 py-1 rounded-full text-xs font-medium ${className}`}>
    {text[lang]}
  </span>
);

export const Card: React.FC<{ children: React.ReactNode, className?: string }> = ({ children, className = "" }) => (
  <div className={`glass-card rounded-3xl p-6 ${className}`}>
    {children}
  </div>
);

export const SectionHeader: React.FC<{ icon: string, title: BilingualText, lang: Language }> = ({ icon, title, lang }) => (
  <div className="flex items-center gap-3 mb-6">
    <span className="text-amber-400 text-xl"><i className={icon}></i></span>
    <h2 className="text-lg font-semibold tracking-wide">
      {title[lang]}
    </h2>
  </div>
);
