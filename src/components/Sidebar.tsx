import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Calendar, ChartBar, CircleHelp, House, Layers, LogOut, MessageSquare, Settings, User } from 'lucide-react';

interface SidebarProps {
  mobile?: boolean;
  onCloseSidebar?: () => void;
}

const Sidebar = ({ mobile = false, onCloseSidebar }: SidebarProps) => {
  const location = useLocation();
  const { user, logout } = useAuth();
  
  const isActive = (path: string) => location.pathname === path;

  const handleClick = () => {
    if (mobile && onCloseSidebar) {
      onCloseSidebar();
    }
  };

  const navigationItems = [
    { name: 'Dashboard', icon: House, path: '/dashboard' },
    { name: 'Personas', icon: User, path: '/personas', disabled: false },
    { name: 'Content', icon: MessageSquare, path: '/content', disabled: true },
    { name: 'Social Accounts', icon: Layers, path: '/accounts', disabled: false },
    { name: 'Schedule', icon: Calendar, path: '/schedule', disabled: true },
    { name: 'Analytics', icon: ChartBar, path: '/analytics', disabled: true },
  ];

  const secondaryItems = [
    { name: 'Settings', icon: Settings, path: '/settings' },
    { name: 'Profile', icon: User, path: '/profile' },
    { name: 'Help', icon: CircleHelp, path: '/help', disabled: true },
  ];

  return (
    <div className="h-full flex flex-col bg-white border-r border-gray-200">
      {/* User profile section */}
      <div className="p-4 border-b">
        <div className="flex items-center">
          <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-semibold">
            {user?.name.charAt(0) || 'U'}
          </div>
          <div className="ml-3">
            <p className="text-sm font-medium text-gray-900">{user?.name || 'User'}</p>
            <p className="text-xs text-gray-500 truncate">{user?.email || 'user@example.com'}</p>
          </div>
        </div>
      </div>
      
      {/* Main navigation */}
      <div className="flex-1 flex flex-col overflow-y-auto pt-5 pb-4">
        <nav className="mt-1 flex-1 px-2 space-y-1">
          {navigationItems.map((item) => (
            <Link
              key={item.name}
              to={item.disabled ? '#' : item.path}
              className={`${
                isActive(item.path) || (item.path !== '/dashboard' && location.pathname.startsWith(item.path))
                  ? 'bg-indigo-50 text-indigo-700'
                  : 'text-gray-700 hover:bg-gray-50'
              } ${
                item.disabled ? 'opacity-50 cursor-not-allowed' : ''
              } group flex items-center px-2 py-2 text-sm font-medium rounded-md`}
              onClick={item.disabled ? (e) => e.preventDefault() : handleClick}
            >
              <item.icon
                className={`${
                  isActive(item.path) || (item.path !== '/dashboard' && location.pathname.startsWith(item.path)) 
                    ? 'text-indigo-600' 
                    : 'text-gray-500 group-hover:text-gray-600'
                } mr-3 flex-shrink-0 h-5 w-5`}
                aria-hidden="true"
              />
              {item.name}
              {item.disabled && (
                <span className="ml-auto inline-block py-0.5 px-2 text-xs rounded-full bg-gray-100 text-gray-500">
                  Soon
                </span>
              )}
            </Link>
          ))}
        </nav>
      </div>
      
      {/* Secondary navigation */}
      <div className="pb-4 px-2 space-y-1">
        {secondaryItems.map((item) => (
          <Link
            key={item.name}
            to={item.disabled ? '#' : item.path}
            className={`${
              isActive(item.path)
                ? 'bg-indigo-50 text-indigo-700'
                : 'text-gray-700 hover:bg-gray-50'
            } ${
              item.disabled ? 'opacity-50 cursor-not-allowed' : ''
            } group flex items-center px-2 py-2 text-sm font-medium rounded-md`}
            onClick={item.disabled ? (e) => e.preventDefault() : handleClick}
          >
            <item.icon
              className={`${
                isActive(item.path) ? 'text-indigo-600' : 'text-gray-500 group-hover:text-gray-600'
              } mr-3 flex-shrink-0 h-5 w-5`}
              aria-hidden="true"
            />
            {item.name}
            {item.disabled && (
              <span className="ml-auto inline-block py-0.5 px-2 text-xs rounded-full bg-gray-100 text-gray-500">
                Soon
              </span>
            )}
          </Link>
        ))}
        
        <button 
          onClick={() => {
            logout();
            if (mobile && onCloseSidebar) {
              onCloseSidebar();
            }
          }}
          className="w-full text-left text-gray-700 hover:bg-gray-50 group flex items-center px-2 py-2 text-sm font-medium rounded-md"
        >
          <LogOut className="text-gray-500 group-hover:text-gray-600 mr-3 flex-shrink-0 h-5 w-5" aria-hidden="true" />
          Sign Out
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
