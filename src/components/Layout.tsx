
import React from 'react';
import { useAppContext } from '../context/AppContext';

export const Layout: React.FC<{ children: React.ReactNode, activeTab: string, onTabChange: (tab: string) => void }> = ({ children, activeTab, onTabChange }) => {
  const { language, toggleLanguage, currentUser } = useAppContext();

  const getTitle = () => {
    switch (activeTab) {
      case 'profile': return language === 'en' ? 'Profile' : '個人矩陣';
      case 'relationship': return language === 'en' ? 'Synergy' : '關係協作';
      default: return language === 'en' ? 'Daily Energy' : '今日能量';
    }
  };

  return (
    <div className="max-w-md mx-auto min-h-screen flex flex-col relative overflow-x-hidden">
      {/* Top Header */}
      <header className="p-6 flex justify-between items-center sticky top-0 z-50 bg-[#0c1112]/80 backdrop-blur-md border-b border-white/5">
        <button className="text-xl text-slate-400 hover:text-white transition-colors"><i className="fa-solid fa-bars-staggered"></i></button>
        <h1 className="text-sm font-black uppercase tracking-[0.25em]">
          {getTitle()}
        </h1>
        <div className="flex items-center gap-3">
          <button 
            onClick={toggleLanguage}
            className="text-[9px] font-black bg-slate-800 px-2 py-1 rounded text-slate-400 hover:text-white border border-white/5"
          >
            {language === 'en' ? '中文' : 'EN'}
          </button>
          <div className="w-8 h-8 rounded-full border border-white/10 overflow-hidden bg-slate-900">
            <img src={currentUser.avatar} alt="User" className="w-full h-full object-cover" />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 px-6 pb-20">
        {children}
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 max-w-md mx-auto px-6 py-4 z-50">
         <div className="bg-slate-900/90 backdrop-blur-2xl border border-white/10 rounded-[40px] flex items-center justify-around py-3 px-2 shadow-2xl">
            <button 
              onClick={() => onTabChange('daily')}
              className={`flex flex-col items-center gap-1 transition-all ${activeTab === 'daily' ? 'text-cyan-400' : 'text-slate-500'}`}
            >
              <i className="fa-solid fa-house-chimney text-base"></i>
              <span className="text-[9px] font-bold uppercase">{language === 'en' ? 'Home' : '首頁'}</span>
            </button>
            <button 
              onClick={() => onTabChange('relationship')}
              className={`flex flex-col items-center gap-1 transition-all ${activeTab === 'relationship' ? 'text-purple-400' : 'text-slate-500'}`}
            >
              <i className="fa-solid fa-infinity text-base"></i>
              <span className="text-[9px] font-bold uppercase">{language === 'en' ? 'Synergy' : '關係'}</span>
            </button>
            
            <button className="w-14 h-14 -mt-10 bg-white text-slate-900 rounded-full shadow-lg flex items-center justify-center text-xl active:scale-90 transition-transform">
               <i className="fa-solid fa-plus"></i>
            </button>

            <button className="flex flex-col items-center gap-1 text-slate-500 hover:text-slate-300 transition-all opacity-50 cursor-not-allowed">
              <i className="fa-solid fa-calendar-days text-base"></i>
              <span className="text-[9px] font-bold uppercase">{language === 'en' ? 'Luck' : '日曆'}</span>
            </button>
            <button 
              onClick={() => onTabChange('profile')}
              className={`flex flex-col items-center gap-1 transition-all ${activeTab === 'profile' ? 'text-white' : 'text-slate-500'}`}
            >
              <i className="fa-solid fa-fingerprint text-base"></i>
              <span className="text-[9px] font-bold uppercase">{language === 'en' ? 'Matrix' : '個人'}</span>
            </button>
         </div>
      </nav>
    </div>
  );
};
