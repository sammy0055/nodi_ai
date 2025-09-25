import type { ReactNode } from 'react';
import { useState } from 'react';
import {
  FiHome,
  FiSettings,
  FiShoppingCart,
  FiPackage,
  FiDollarSign,
  FiTrendingUp,
  FiUsers,
  FiMenu,
  FiX,
  FiLogOut,
} from 'react-icons/fi';
import { Link, useLocation, useNavigate } from 'react-router';
import { PageRoutes } from '../routes';

type TenantLayoutProps = {
  children: ReactNode;
};
export const TenantLayout = ({ children }: TenantLayoutProps) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  // Mock data for tenant/organization
  const tenantData = {
    name: 'Fashion Boutique',
    plan: 'Premium',
    photoUrl:
      'https://images.unsplash.com/photo-1560250097-0b93528c311a?ixlib=rb-4.0.3&auto=format&fit=crop&w=64&h=64&q=80',
  };

  // Navigation items
  const navigationItems = [
    { path: `/app/${PageRoutes.APP_DASHBOARD}`, label: 'Dashboard', icon: <FiHome className="text-lg" /> },
    { path: `/app/${PageRoutes.ORDERS}`, label: 'Orders', icon: <FiShoppingCart className="text-lg" /> },
    { path: `/app/${PageRoutes.PRODUCTS}`, label: 'Products', icon: <FiPackage className="text-lg" /> },
    { path: `/app/${PageRoutes.INVENTORY}`, label: 'Branch Inventory', icon: <FiTrendingUp className="text-lg" /> },
    { path: `/app/${PageRoutes.CUSTOMERS}`, label: 'Customers', icon: <FiUsers className="text-lg" /> },
    { path: `/app/${PageRoutes.BILLING}`, label: 'Billing', icon: <FiDollarSign className="text-lg" /> },
    { path: `/app/${PageRoutes.SETTINGS}`, label: 'Settings', icon: <FiSettings className="text-lg" /> },
  ];

  const handleLogout = () => {
    // Handle logout logic
    console.log('Logging out...');
    navigate('/login');
  };
  return (
    <>
      <div className="flex h-screen bg-neutral-50">
        {/* Mobile sidebar backdrop */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-neutral-900 bg-opacity-50 z-40 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Sidebar */}
        <aside
          className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out
        lg:relative lg:translate-x-0 lg:shadow-none
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}
        >
          <div className="flex flex-col h-full">
            {/* Organization header */}
            <div className="flex items-center justify-between p-4 border-b border-neutral-200">
              <div className="flex items-center space-x-3">
                <img src={tenantData.photoUrl} alt={tenantData.name} className="w-10 h-10 rounded-lg object-cover" />
                <div>
                  <h2 className="font-semibold text-neutral-900">{tenantData.name}</h2>
                  <p className="text-xs text-primary-600">{tenantData.plan} Plan</p>
                </div>
              </div>
              <button
                className="lg:hidden p-1 rounded-md text-neutral-500 hover:bg-neutral-100"
                onClick={() => setSidebarOpen(false)}
              >
                <FiX className="text-xl" />
              </button>
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
              {navigationItems.map((item) => {
                const isActive = location.pathname === item.path;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`
                    flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200
                    ${
                      isActive
                        ? 'bg-primary-50 text-primary-700 border-r-2 border-primary-700'
                        : 'text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900'
                    }
                  `}
                    onClick={() => setSidebarOpen(false)}
                  >
                    {item.icon}
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </nav>

            {/* Footer with logout */}
            <div className="p-4 border-t border-neutral-200">
              <button
                onClick={handleLogout}
                className="flex items-center space-x-3 w-full px-4 py-3 rounded-lg text-sm font-medium text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900 transition-all duration-200"
              >
                <FiLogOut className="text-lg" />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </aside>

        {/* Main content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Top header */}
          <header className="bg-white shadow-sm z-10">
            <div className="flex items-center justify-between px-6 py-4">
              <div className="flex items-center">
                <button
                  className="lg:hidden p-2 rounded-md text-neutral-500 hover:bg-neutral-100 mr-2"
                  onClick={() => setSidebarOpen(true)}
                >
                  <FiMenu className="text-xl" />
                </button>
                <h1 className="text-xl font-semibold text-neutral-900">
                  {navigationItems.find((item) => item.path === location.pathname)?.label || 'Dashboard'}
                </h1>
              </div>

              <div className="flex items-center space-x-4">
                {/* Notifications placeholder */}
                <div className="relative">
                  <div className="w-2 h-2 bg-red-500 rounded-full absolute top-0 right-0"></div>
                  <button className="p-2 rounded-full hover:bg-neutral-100">
                    <svg className="w-5 h-5 text-neutral-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                      />
                    </svg>
                  </button>
                </div>

                {/* User profile placeholder */}
                <div className="flex items-center space-x-2">
                  <img
                    src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&auto=format&fit=facearea&facepad=2&w=32&h=32&q=80"
                    alt="User profile"
                    className="w-8 h-8 rounded-full"
                  />
                  <span className="text-sm font-medium text-neutral-700 hidden md:inline-block">John Doe</span>
                </div>
              </div>
            </div>
          </header>

          {/* Page content */}
          <main className="flex-1 overflow-y-auto p-6 bg-neutral-50">
            <div className="max-w-7xl mx-auto">{children}</div>
          </main>
        </div>
      </div>
    </>
  );
};
