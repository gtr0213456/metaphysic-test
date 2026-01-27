
import React from 'react';
import { useAppContext } from '../context/AppContext';
import { MetaphysicalEngine } from '../services/metaphysicalEngine';
import { Card, Badge, SectionHeader } from './Common';

export const ProfileView: React.FC = () => {
  const { language, currentUser } = useAppContext();
  const systems = MetaphysicalEngine.getSystemData(currentUser);

  return (
    <div className="space-y-8 pb-24 pt-4">
      {/* Profile Header */}
      <div className="text-center px-4">
        <div className="relative inline-block mb-4">
          <div className="w-32 h-32 rounded-full p-1 bg-gradient-to-tr from-slate-700 to-slate-400">
            <img 
              src={currentUser.avatar} 
              alt={currentUser.name} 
              className="w-full h-full rounded-full object-cover border-4 border-slate-950" 
            />
          </div>
          <button className="absolute bottom-1 right-1 bg-slate-200 text-slate-900 w-8 h-8 rounded-full flex items-center justify-center border-2 border-slate-950 text-sm">
            <i className="fa-solid fa-fingerprint"></i>
          </button>
        </div>
        <h1 className="text-2xl font-bold">{currentUser.name}</h1>
        <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mt-1 mb-4">System Identity Verified</p>
      </div>

      {/* Abstract System Matrix */}
      <section>
        <SectionHeader icon="fa-solid fa-cube" title={{ en: 'System Matrix', cn: '系統矩陣' }} lang={language} />
        <div className="space-y-6">
          {systems.map((system) => (
            <Card key={system.id} className="relative overflow-hidden group border-slate-800 hover:border-slate-600 transition-all">
              <div className="absolute top-0 right-0 p-4 opacity-10">
                <i className={`fa-solid fa-gear text-4xl group-hover:rotate-45 transition-transform duration-1000`}></i>
              </div>
              
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-sm font-black text-white uppercase tracking-wider mb-1">
                    {system.title[language]}
                  </h3>
                  <p className="text-[10px] text-slate-500 leading-tight">
                    {system.summary[language]}
                  </p>
                </div>
                <Badge text={system.type === 'LING_DONG_81' ? {en:'Active',cn:'啟用'}: {en:'Sync',cn:'同步'}} lang={language} className="bg-slate-800 text-[8px]" />
              </div>

              <div className="grid grid-cols-2 gap-y-3 gap-x-6">
                {system.attributes.map((attr, idx) => (
                  <div key={idx} className="space-y-1">
                    <div className="flex justify-between text-[9px] font-bold text-slate-600 uppercase">
                      <span>{attr.label[language]}</span>
                      {typeof attr.value === 'number' && <span>{attr.value}%</span>}
                    </div>
                    {typeof attr.value === 'number' ? (
                      <div className="w-full h-0.5 bg-slate-800 rounded-full">
                         <div 
                          className="h-full bg-slate-400" 
                          style={{ width: `${attr.value}%` }}
                         ></div>
                      </div>
                    ) : (
                      <div className="text-xs font-bold text-slate-300">
                        {(attr.value as any)[language] || attr.value}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
};
