
import React from 'react';
import { useAppContext } from '../context/AppContext';
import { MOCK_DAILY } from '../constants';
import { Card, Badge } from './Common';

const EnergyCircle: React.FC<{ value: number, color: string, icon: string }> = ({ value, color, icon }) => (
  <div className="relative w-20 h-20 flex items-center justify-center">
    <svg className="w-full h-full -rotate-90">
      <circle cx="40" cy="40" r="36" stroke="rgba(255,255,255,0.05)" strokeWidth="4" fill="transparent" />
      <circle 
        cx="40" cy="40" r="36" 
        stroke={color} 
        strokeWidth="4" 
        fill="transparent" 
        strokeDasharray={226}
        strokeDashoffset={226 - (226 * value) / 100}
        strokeLinecap="round"
      />
    </svg>
    <div className="absolute inset-0 flex items-center justify-center text-2xl" style={{ color }}>
      <i className={icon}></i>
    </div>
  </div>
);

export const DailyEnergyView: React.FC = () => {
  const { language, currentUser, partner } = useAppContext();
  const d = MOCK_DAILY;

  return (
    <div className="space-y-6 pb-24">
      {/* Mayan Hero */}
      <div className="text-center py-8">
        <div className="relative inline-block mb-6">
          <div className="w-40 h-40 rounded-full border border-cyan-500/30 flex items-center justify-center animate-float">
            <div className="w-32 h-32 rounded-full bg-cyan-500/10 flex items-center justify-center text-5xl text-cyan-400">
               <i className="fa-solid fa-sun"></i>
            </div>
            <div className="absolute -bottom-2 bg-cyan-400 text-slate-900 text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-widest">
              Kin {d.mayanKin}
            </div>
          </div>
        </div>
        <h1 className="text-3xl font-bold mb-2">{d.mayanTitle[language]}</h1>
        <p className="text-slate-400 max-w-xs mx-auto text-sm leading-relaxed">
          {d.mayanDescription[language]}
        </p>
      </div>

      {/* Status Overview */}
      <div>
        <div className="flex justify-between items-end mb-4 px-2">
          <h2 className="text-xl font-bold">{language === 'en' ? 'Status Overview' : '狀態概覽'}</h2>
          <button className="text-cyan-400 text-xs font-medium uppercase tracking-wider">
            {language === 'en' ? 'View History' : '查看歷史'}
          </button>
        </div>
        
        <div className="grid grid-cols-2 gap-4 mb-4">
          <Card className="border-l-4 border-cyan-400/50">
            <div className="flex justify-between items-start mb-4">
               <div>
                 <p className="text-xs text-slate-400 mb-1">{language === 'en' ? 'Him' : '他'}</p>
                 <h3 className="text-3xl font-bold">{d.users[currentUser.id].value}%</h3>
               </div>
               <span className="text-cyan-400"><i className="fa-solid fa-bolt"></i></span>
            </div>
            <p className="text-[10px] text-green-400 font-bold mb-3">+{d.users[currentUser.id].trend}% from yesterday</p>
            <div className="flex flex-wrap gap-1">
              {d.users[currentUser.id].tags.map((t, i) => (
                <Badge key={i} text={t} lang={language} className="bg-cyan-900/40 text-cyan-400" />
              ))}
            </div>
          </Card>

          <Card className="border-l-4 border-purple-400/50">
            <div className="flex justify-between items-start mb-4">
               <div>
                 <p className="text-xs text-slate-400 mb-1">{language === 'en' ? 'Her' : '她'}</p>
                 <h3 className="text-3xl font-bold">{d.users[partner.id].value}%</h3>
               </div>
               <span className="text-purple-400"><i className="fa-solid fa-sparkles"></i></span>
            </div>
            <p className="text-[10px] text-red-400 font-bold mb-3">{d.users[partner.id].trend}% from yesterday</p>
            <div className="flex flex-wrap gap-1">
              {d.users[partner.id].tags.map((t, i) => (
                <Badge key={i} text={t} lang={language} className="bg-purple-900/40 text-purple-400" />
              ))}
            </div>
          </Card>
        </div>

        <Card className="bg-gradient-to-br from-cyan-950/20 to-slate-900">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-xs text-slate-400 mb-1">{language === 'en' ? 'Us (Synergy)' : '我們 (Synergy)'}</p>
              <h3 className="text-4xl font-bold mb-1">{d.synergy.value}%</h3>
              <p className="text-xs text-green-400 font-bold mb-4">+{d.synergy.trend}%</p>
              <div className="flex gap-2">
                {d.synergy.tags.map((t, i) => (
                  <Badge key={i} text={t} lang={language} className="bg-slate-800 text-slate-300" />
                ))}
              </div>
            </div>
            <EnergyCircle value={d.synergy.value} color="#00f2ff" icon="fa-solid fa-heart" />
          </div>
        </Card>
      </div>

      {/* Energy Insights */}
      <div>
        <h2 className="text-xl font-bold mb-4 px-2">{language === 'en' ? 'Energy Insights' : '能量洞察'}</h2>
        <Card className="overflow-hidden p-0">
          <div className="flex flex-col md:flex-row">
            <div className="p-6 flex-1">
              <p className="text-[10px] font-black text-cyan-400 uppercase tracking-widest mb-2">{d.insight.category[language]}</p>
              <h3 className="text-xl font-bold mb-3">{d.insight.title[language]}</h3>
              <p className="text-sm text-slate-400 leading-relaxed mb-6">{d.insight.content[language]}</p>
              <button className="w-full bg-cyan-400 text-slate-900 py-3 rounded-2xl font-bold text-sm hover:bg-cyan-300 transition-colors">
                {language === 'en' ? 'Read More' : '閱讀更多'}
              </button>
            </div>
            <div className="md:w-1/3 h-48 md:h-auto overflow-hidden">
               <img src={d.insight.image} alt="Insight" className="w-full h-full object-cover grayscale brightness-75 hover:grayscale-0 transition-all duration-700" />
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};
