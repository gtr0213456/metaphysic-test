
import React from 'react';
import { useAppContext } from '../context/AppContext';
import { MetaphysicalEngine } from '../services/metaphysicalEngine';
import { Card, Badge, SectionHeader } from './Common';

export const RelationshipView: React.FC = () => {
  const { language, currentUser, partner } = useAppContext();
  const synergy = MetaphysicalEngine.getRelationshipSynergy(currentUser, partner);

  return (
    <div className="space-y-8 pb-24 pt-4">
      {/* Dynamic Interaction Header */}
      <div className="relative flex justify-center items-center h-48 mb-8">
        <div className="absolute inset-0 flex items-center justify-center opacity-20">
          <div className="w-64 h-64 rounded-full border border-cyan-400 animate-pulse"></div>
          <div className="absolute w-48 h-48 rounded-full border border-purple-500 animate-pulse [animation-delay:1s]"></div>
        </div>
        
        <div className="flex items-center gap-4 z-10">
          <div className="text-center group">
            <div className="w-20 h-20 rounded-full border-2 border-cyan-400 p-1 mb-2 group-hover:scale-110 transition-transform">
              <img src={currentUser.avatar} alt="User" className="w-full h-full rounded-full object-cover" />
            </div>
            <p className="text-[10px] font-bold text-cyan-400 uppercase">{currentUser.name}</p>
          </div>

          <div className="flex flex-col items-center">
            <div className="text-4xl font-black text-white mb-1 drop-shadow-2xl">{synergy.overallScore}%</div>
            <div className="text-[10px] font-black tracking-widest text-slate-500 uppercase">
              {language === 'en' ? 'Synergy Index' : '協作指數'}
            </div>
          </div>

          <div className="text-center group">
            <div className="w-20 h-20 rounded-full border-2 border-purple-400 p-1 mb-2 group-hover:scale-110 transition-transform">
              <img src={partner.avatar} alt="Partner" className="w-full h-full rounded-full object-cover" />
            </div>
            <p className="text-[10px] font-bold text-purple-400 uppercase">{partner.name}</p>
          </div>
        </div>
      </div>

      {/* Abstract Metrics */}
      <section>
        <SectionHeader icon="fa-solid fa-code-branch" title={{ en: 'System Delta', cn: '系統差值' }} lang={language} />
        <div className="space-y-4">
          {synergy.metrics.map((m, i) => (
            <Card key={i} className="bg-slate-900/40 border-slate-800">
              <div className="flex justify-between items-center mb-3">
                <div className="flex items-center gap-2">
                   <div className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center text-xs">
                     <i className={
                       m.system === 'BAZI' ? 'fa-solid fa-fire' : 
                       m.system === 'HUMAN_DESIGN' ? 'fa-solid fa-network-wired' : 
                       'fa-solid fa-hashtag'
                     }></i>
                   </div>
                   <h4 className="text-sm font-bold">{m.label[language]}</h4>
                </div>
                <div className="text-sm font-mono font-bold text-cyan-400">{m.score}%</div>
              </div>
              
              <div className="w-full h-1 bg-slate-800 rounded-full overflow-hidden mb-3">
                <div 
                  className="h-full bg-gradient-to-r from-cyan-500 to-purple-500" 
                  style={{ width: `${m.score}%` }}
                ></div>
              </div>
              
              <p className="text-xs text-slate-500 leading-relaxed italic">
                {m.description[language]}
              </p>
            </Card>
          ))}
        </div>
      </section>

      {/* Vector Analysis */}
      <section>
        <SectionHeader icon="fa-solid fa-compass-drafting" title={{ en: 'Dynamic Vector', cn: '動態矢量' }} lang={language} />
        <Card className="bg-gradient-to-br from-slate-900 to-[#0c1112]">
          <div className="flex justify-around items-end h-32 gap-4 pb-4">
            {synergy.dynamicFactors.map((f, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-3">
                <div 
                  className={`w-full rounded-t-xl transition-all duration-1000 ${
                    i === 0 ? 'bg-red-500/20' : i === 1 ? 'bg-green-500/20' : 'bg-blue-500/20'
                  }`}
                  style={{ height: `${f.value}%` }}
                ></div>
                <div className="text-[10px] font-bold text-slate-500 uppercase tracking-tighter">
                  {f.type[language]}
                </div>
              </div>
            ))}
          </div>
        </Card>
      </section>

      {/* Cross-System Integration */}
      <section>
        <SectionHeader icon="fa-solid fa-link" title={{ en: 'Integration Nodes', cn: '整合節點' }} lang={language} />
        <div className="grid grid-cols-2 gap-4">
          <Card className="p-4 border-dashed border-slate-700">
             <div className="text-[10px] text-slate-500 font-bold mb-1">NODE ALPHA</div>
             <div className="text-xs font-bold text-amber-400">{language === 'en' ? 'Synchronized Cycles' : '同步週期'}</div>
          </Card>
          <Card className="p-4 border-dashed border-slate-700">
             <div className="text-[10px] text-slate-500 font-bold mb-1">NODE BETA</div>
             <div className="text-xs font-bold text-purple-400">{language === 'en' ? 'Resonant Attributes' : '共鳴屬性'}</div>
          </Card>
        </div>
      </section>
    </div>
  );
};
