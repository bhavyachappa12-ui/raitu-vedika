import React from 'react';
import { Home, Search, MessageSquare, User } from 'lucide-react';

interface BottomNavProps {
  activeTab: 'home' | 'search' | 'messages' | 'profile';
  setActiveTab: (tab: 'home' | 'search' | 'messages' | 'profile') => void;
  unreadCount: number;
}

export default function BottomNav({ activeTab, setActiveTab, unreadCount }: BottomNavProps) {
  const navItems = [
    { id: 'home' as const, label: 'హోమ్', icon: Home },
    { id: 'search' as const, label: 'శోధన', icon: Search },
    { id: 'messages' as const, label: 'సందేశాలు', icon: MessageSquare, badge: unreadCount },
    { id: 'profile' as const, label: 'ప్రొఫైల్', icon: User },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-gray-100 py-2 px-6 shadow-[0_-2px_10px_rgba(0,0,0,0.03)] flex justify-around items-center max-w-md mx-auto rounded-t-xl md:max-w-7xl md:rounded-none">
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = activeTab === item.id;
        return (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className="relative flex flex-col items-center justify-center py-1 px-3 min-w-[70px] active:scale-95 transition-all duration-150 focus:outline-none"
            id={`nav-item-${item.id}`}
          >
            {/* Active Highlight Glow */}
            <div
              className={`flex items-center justify-center p-2 rounded-full mb-1 transition-all duration-300 ${
                isActive
                  ? 'bg-[#1b6d24] text-white scale-110 shadow-md shadow-green-900/10'
                  : 'text-gray-500 hover:bg-gray-100 hover:text-[#1b6d24]'
              }`}
            >
              <Icon className="w-5 h-5 transition-transform duration-200" />
            </div>

            {/* Label */}
            <span
              className={`text-[11px] font-semibold transition-colors duration-200 ${
                isActive ? 'text-[#1b6d24]' : 'text-gray-500'
              }`}
            >
              {item.label}
            </span>

            {/* Unread Message Badge */}
            {!!item.badge && (
              <span className="absolute top-1.5 right-4 bg-red-500 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center animate-pulse border border-white">
                {item.badge}
              </span>
            )}
          </button>
        );
      })}
    </nav>
  );
}
