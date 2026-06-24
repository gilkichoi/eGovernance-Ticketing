/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect } from 'react';
import { AppProvider, useAppContext } from './store';
import { Navigation } from './components/Navigation';
import { CitizenPortal } from './components/CitizenPortal';
import { StaffPortal } from './components/StaffPortal';
import { Dashboard } from './components/Dashboard';
import { DisplayMode } from './components/DisplayMode';

const AppContent = () => {
  const { activeTab, setActiveTab, currentStaff } = useAppContext();

  useEffect(() => {
    if (activeTab === 'dashboard' && !currentStaff) {
      setActiveTab('staff');
    }
  }, [activeTab, currentStaff, setActiveTab]);

  if (activeTab === 'display') {
    return <DisplayMode onClose={() => setActiveTab('citizen')} />;
  }

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 font-sans">
      <Navigation />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        {activeTab === 'citizen' && <CitizenPortal />}
        {activeTab === 'staff' && <StaffPortal />}
        {activeTab === 'dashboard' && currentStaff && <Dashboard />}
      </main>
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
