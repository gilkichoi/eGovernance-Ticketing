import React from 'react';
import { useAppContext } from '../store';
import { User, ShieldCheck, BarChart3, Menu, Monitor } from 'lucide-react';
import { motion } from 'motion/react';

export const Navigation: React.FC = () => {
  const { activeTab, setActiveTab, currentStaff } = useAppContext();

  const tabs = [
    { id: 'citizen', label: 'Citizen Portal', icon: User },
    { id: 'staff', label: 'Staff Portal', icon: ShieldCheck },
    ...(currentStaff ? [{ id: 'dashboard', label: 'Analytics', icon: BarChart3 }] : []),
    { id: 'display', label: 'Display Mode', icon: Monitor },
  ];

  return (
    <div className="bg-emerald-800 shadow-lg mb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row justify-between items-center h-auto sm:h-20 py-4 sm:py-0">
          
          {/* Logo / Title Area */}
          <div className="flex items-center gap-4 mb-4 sm:mb-0">
            {/* Simple geometric logo resembling the Taita Taveta flag colors */}
            <div className="flex flex-col gap-0.5">
              <div className="w-8 h-2 bg-emerald-500 rounded-sm"></div>
              <div className="w-8 h-2 bg-yellow-400 rounded-sm"></div>
              <div className="w-8 h-2 bg-white rounded-sm"></div>
            </div>
            <div>
              <h1 className="text-xl font-bold text-white leading-tight">County Government</h1>
              <p className="text-emerald-300 text-xs tracking-wider uppercase">Taita Taveta</p>
            </div>
          </div>

          {/* Nav Tabs */}
          <div className="flex space-x-1 sm:space-x-2 w-full sm:w-auto overflow-x-auto pb-2 sm:pb-0 hide-scrollbar">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`relative flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium text-sm transition-all whitespace-nowrap ${
                    isActive 
                      ? 'text-emerald-900 bg-white shadow-sm' 
                      : 'text-emerald-100 hover:text-white hover:bg-emerald-700'
                  }`}
                >
                  <Icon size={18} />
                  {tab.label}
                  {isActive && (
                    <motion.div 
                      layoutId="activeTab" 
                      className="absolute inset-0 border-2 border-yellow-400 rounded-lg" 
                      initial={false} 
                      transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }} 
                    />
                  )}
                </button>
              );
            })}
          </div>
          
        </div>
      </div>
    </div>
  );
};
