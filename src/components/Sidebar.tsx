
import React from 'react';
import { 
  Home, 
  Package, 
  Factory, 
  BarChart3, 
  Settings,
  Store,
  Candy,
  Coffee,
  Cake
} from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const Sidebar = ({ activeTab, setActiveTab }: SidebarProps) => {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Home },
    { id: 'inventory', label: 'Inventory', icon: Package },
    { 
      id: 'production', 
      label: 'Production', 
      icon: Factory,
      submenu: [
        { id: 'production-sweets', label: 'Sweets', icon: Candy },
        { id: 'production-savouries', label: 'Savouries', icon: Coffee },
        { id: 'production-bakery', label: 'Bakery', icon: Cake },
      ]
    },
    { id: 'reports', label: 'Reports', icon: BarChart3 },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  const handleProductionClick = () => {
    // If not already in a production section, default to sweets
    if (!activeTab.startsWith('production')) {
      setActiveTab('production-sweets');
    }
  };

  return (
    <div className="w-64 bg-white shadow-lg h-full">
      <div className="p-6 border-b">
        <div className="flex items-center space-x-2">
          <Store className="h-8 w-8 text-blue-600" />
          <h1 className="text-xl font-bold text-gray-800">Inventory Pro</h1>
        </div>
      </div>
      
      <nav className="mt-6">
        <ul className="space-y-2 px-4">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const hasSubmenu = item.submenu && item.submenu.length > 0;
            const isProductionActive = activeTab.startsWith('production');
            
            return (
              <li key={item.id}>
                <button
                  onClick={() => hasSubmenu ? handleProductionClick() : setActiveTab(item.id)}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-colors duration-200 ${
                    (activeTab === item.id || (item.id === 'production' && isProductionActive))
                      ? 'bg-blue-100 text-blue-700 border-r-4 border-blue-700'
                      : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  <span className="font-medium">{item.label}</span>
                </button>
                
                {hasSubmenu && isProductionActive && (
                  <ul className="ml-8 mt-2 space-y-1">
                    {item.submenu.map((subItem) => {
                      const SubIcon = subItem.icon;
                      return (
                        <li key={subItem.id}>
                          <button
                            onClick={() => setActiveTab(subItem.id)}
                            className={`w-full flex items-center space-x-3 px-4 py-2 rounded-lg text-left transition-colors duration-200 ${
                              activeTab === subItem.id
                                ? 'bg-blue-50 text-blue-600'
                                : 'text-gray-500 hover:bg-gray-50 hover:text-gray-700'
                            }`}
                          >
                            <SubIcon className="h-4 w-4" />
                            <span className="text-sm">{subItem.label}</span>
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </li>
            );
          })}
        </ul>
      </nav>
      
      <div className="absolute bottom-0 w-64 p-4 border-t bg-gray-50">
        <div className="text-center">
          <p className="text-xs text-gray-500">Inventory Management System</p>
          <p className="text-xs text-gray-400">v1.0.0</p>
        </div>
      </div>
    </div>
  );
};
