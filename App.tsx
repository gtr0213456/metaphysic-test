
import React, { useState } from 'react';
import { AppProvider } from './context/AppContext';
import { Layout } from './components/Layout';
import { DailyEnergyView } from './components/DailyEnergyView';
import { ProfileView } from './components/ProfileView';
import { RelationshipView } from './components/RelationshipView';

const MainApp: React.FC = () => {
  const [activeTab, setActiveTab] = useState('daily');

  const renderContent = () => {
    switch (activeTab) {
      case 'daily': return <DailyEnergyView />;
      case 'profile': return <ProfileView />;
      case 'relationship': return <RelationshipView />;
      default: return <DailyEnergyView />;
    }
  };

  return (
    <Layout activeTab={activeTab} onTabChange={setActiveTab}>
      {renderContent()}
    </Layout>
  );
};

const App: React.FC = () => {
  return (
    <AppProvider>
      <MainApp />
    </AppProvider>
  );
};

export default App;
