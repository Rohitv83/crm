import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import CrmHeader from './CrmHeader';
import Sidebar from './Sidebar';

export default function CrmLayout() {
  // FIX: Remove useState to ensure the latest user data is always read from localStorage
  const user = JSON.parse(localStorage.getItem('user'));
  
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const toggleMobileMenu = () => {
    setIsMobileOpen(!isMobileOpen);
  };

  return (
    <div className="flex h-screen bg-gray-100 font-sans">
      <Sidebar 
        user={user} 
        isMobileOpen={isMobileOpen} 
        toggleMobileMenu={toggleMobileMenu} 
      />

      <div className="flex-1 flex flex-col overflow-hidden">
        <CrmHeader 
          user={user} 
          toggleMobileMenu={toggleMobileMenu} 
        />
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100 p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
