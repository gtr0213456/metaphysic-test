
import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Language, UserProfile } from '../types';
import { MOCK_USERS } from '../constants';

interface AppContextType {
  language: Language;
  toggleLanguage: () => void;
  users: UserProfile[];
  currentUser: UserProfile;
  partner: UserProfile;
  setCurrentUserId: (id: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>(Language.CN);
  const [currentUserId, setCurrentUserId] = useState<string>(MOCK_USERS[0].id);

  const toggleLanguage = () => {
    setLanguage(prev => prev === Language.EN ? Language.CN : Language.EN);
  };

  const currentUser = MOCK_USERS.find(u => u.id === currentUserId) || MOCK_USERS[0];
  const partner = MOCK_USERS.find(u => u.id !== currentUserId) || MOCK_USERS[1];

  return (
    <AppContext.Provider value={{ 
      language, 
      toggleLanguage, 
      users: MOCK_USERS, 
      currentUser, 
      partner,
      setCurrentUserId 
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useAppContext must be used within AppProvider');
  return context;
};
