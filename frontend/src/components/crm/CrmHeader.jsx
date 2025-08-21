import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, Search, ChevronDown, User, Settings, LogOut, Menu } from 'lucide-react';

export default function CrmHeader({ user, toggleMobileMenu }) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    navigate('/login');
  };

  return (
    <header className="bg-white shadow-sm z-10 p-4 border-b border-gray-200">
      <div className="flex items-center justify-between h-full">
        <div className="flex items-center">
          {/* Hamburger Menu Button for Mobile */}
          <button 
            onClick={toggleMobileMenu} 
            className="lg:hidden mr-4 text-gray-600 hover:text-gray-800"
          >
            <Menu className="w-6 h-6" />
          </button>

          {/* Search bar */}
          <div className="relative hidden md:block">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg leading-5 bg-gray-50 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition"
              placeholder="Search..."
              type="search"
            />
          </div>
        </div>

        {/* Right side icons and profile */}
        <div className="flex items-center space-x-5">
          <button className="p-1 rounded-full text-gray-500 hover:text-gray-700 focus:outline-none relative">
            <Bell className="h-6 w-6" />
            <span className="absolute top-0 right-0 h-2.5 w-2.5 rounded-full bg-red-500 border-2 border-white"></span>
          </button>

          {/* Profile dropdown */}
          <div className="relative">
            <button 
              onClick={() => setDropdownOpen(!dropdownOpen)} 
              className="flex items-center space-x-2 focus:outline-none"
            >
              <img 
                className="w-9 h-9 rounded-full" 
                src={`https://ui-avatars.com/api/?name=${user?.name || 'U'}&background=c7d2fe&color=3730a3`} 
                alt="User avatar" 
              />
              <div className="hidden md:block text-left">
                <div className="text-sm font-semibold text-gray-800">{user?.name}</div>
                <div className="text-xs text-gray-500 capitalize">{user?.role}</div>
              </div>
              <ChevronDown className={`h-4 w-4 text-gray-400 transition-transform duration-200 ${dropdownOpen ? 'rotate-180' : ''}`} />
            </button>
            
            {dropdownOpen && (
              <div className="absolute right-0 mt-3 w-56 origin-top-right bg-white rounded-lg shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                <div className="py-1">
                  <a href="#" className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                    <User className="w-4 h-4 mr-3 text-gray-500"/> My Profile
                  </a>
                  <button 
                    onClick={handleLogout} 
                    className="w-full text-left flex items-center px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                  >
                    <LogOut className="w-4 h-4 mr-3"/> Sign Out
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
