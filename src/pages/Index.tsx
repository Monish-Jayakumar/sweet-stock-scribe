
import React, { useState } from 'react';
import { Sidebar } from '@/components/Sidebar';
import { Dashboard } from '@/components/Dashboard';
import { InventoryPage } from '@/components/InventoryPage';
import { ProductionPage } from '@/components/ProductionPage';
import { ReportsPage } from '@/components/ReportsPage';
import { InventoryProvider } from '@/contexts/InventoryContext';

const Index = () => {
  const [activeTab, setActiveTab] = useState('dashboard');

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard />;
      case 'inventory':
        return <InventoryPage />;
      case 'production':
        return <ProductionPage />;
      case 'reports':
        return <ReportsPage />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <InventoryProvider>
      <div className="flex h-screen bg-gray-50">
        <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
        <div className="flex-1 overflow-auto">
          {renderContent()}
        </div>
      </div>
    </InventoryProvider>
  );
};

export default Index;
