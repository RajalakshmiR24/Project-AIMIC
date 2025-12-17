import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Shield, Menu, X, LogOut, Settings, User, HelpCircle, Download } from 'lucide-react';

import { useAuth } from '../../contexts/AuthContext';

interface MenuItem {
  icon: React.ReactNode;
  label: string;
  path: string;
}

interface PortalLayoutProps {
  title: string;
  menuItems: MenuItem[];
  currentPath: string;
  headerColor: string;
  children: React.ReactNode;
}

const PortalLayout: React.FC<PortalLayoutProps> = ({
  title,
  menuItems,
  currentPath,
  headerColor,
  children
}) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const { user, logout } = useAuth();

  const handleLogout = () => {
    if (confirm('Are you sure you want to logout?')) {
      logout();
    }
  };



  const handleDownloadUserGuide = () => {
    alert('Downloading user guide PDF...');
  };

  const handleContactSupport = () => {
    alert('Opening support contact form...');
  };


  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className={`${headerColor} text-white shadow-lg fixed top-0 left-0 right-0 z-40`}>
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="md:hidden p-2 rounded-lg hover:bg-white hover:bg-opacity-20 transition-colors"
            >
              {isSidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
            <Link to="/" className="flex items-center space-x-3 hover:opacity-90 transition-opacity">
              <Shield className="w-8 h-8" />
              <span className="text-xl font-bold">MediClaim AI</span>
            </Link>
            <span className="hidden md:block text-lg opacity-90">| {title}</span>
          </div>

          <div className="flex items-center space-x-2">
            {/* Notifications Removed */}


            <div className="relative">
              <button
                onClick={() => setShowProfile(!showProfile)}
                className="flex items-center space-x-2 p-2 rounded-lg hover:bg-white hover:bg-opacity-20 transition-colors"
              >
                <User className="w-5 h-5" />
                <span className="hidden md:block text-sm">Profile</span>
              </button>

              {showProfile && (
                <div className="absolute right-0 top-12 w-64 bg-white rounded-xl shadow-2xl border z-50 text-gray-900">
                  <div className="p-4 border-b border-gray-200">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <User className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-semibold">{user?.name || 'User'}</p>
                        <p className="text-sm text-gray-600">{user?.email || 'user@example.com'}</p>
                      </div>
                    </div>
                  </div>
                  <div className="p-2">

                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-3 py-2 text-sm hover:bg-red-50 text-red-600 rounded-lg transition-colors flex items-center space-x-2"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Logout</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      <div className="h-screen flex overflow-hidden">
        {/* Sidebar */}
        <aside
          className={`${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      md:translate-x-0 fixed md:sticky top-[60px] left-0 z-50 md:z-20
      w-64 h-[calc(100vh-10px)] bg-white shadow-lg transform transition-transform duration-300 ease-in-out
      overflow-hidden`}
        >
          <div className="flex flex-col h-full">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">{title}</h2>
              <p className="text-sm text-gray-600 mt-1">
                Welcome back, {user?.name?.split(' ')[0] || 'User'}
              </p>
            </div>

            {/* Sidebar links */}
            <nav className="flex-1 p-6 overflow-hidden">
              <ul className="space-y-2">
                {menuItems.map((item, index) => {
                  const isActive =
                    currentPath === item.path ||
                    (item.path !== '/' && currentPath.startsWith(item.path));
                  return (
                    <li key={index}>
                      <Link
                        to={item.path}
                        className={`flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 ${isActive
                          ? 'bg-blue-50 text-blue-600 border-r-4 border-blue-600 shadow-sm'
                          : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                          }`}
                        onClick={() => setIsSidebarOpen(false)}
                      >
                        <div
                          className={`p-1 rounded-lg ${isActive ? 'bg-blue-100' : 'bg-gray-100'
                            }`}
                        >
                          {item.icon}
                        </div>
                        <span className="font-medium">{item.label}</span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </nav>


          </div>
        </aside>

        {/* Overlay for mobile */}
        {isSidebarOpen && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}

        {/* Main Content (scrollable) */}
        <main className="flex-1 h-screen overflow-y-auto p-6 md:p-8 mt-[72px]">
          {children}
        </main>
      </div>

    </div>
  );
};

export default PortalLayout;