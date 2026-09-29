import React from 'react';
import { FarmerProfile } from '../types';
import { Leaf, Globe } from 'lucide-react';

interface HeaderProps {
  user: FarmerProfile;
  onProfileClick: () => void;
  language: 'te' | 'en';
  onLanguageToggle: () => void;
}

export default function Header({ user, onProfileClick, language, onLanguageToggle }: HeaderProps) {
  return (
    <header className="sticky top-0 z-30 bg-white border-b border-gray-100 px-4 py-3 flex items-center justify-between shadow-xs">
      <div className="flex items-center gap-2">
        <div className="w-9 h-9 rounded-full bg-[#1b6d24]/10 flex items-center justify-center">
          <Leaf className="w-5 h-5 text-[#1b6d24]" />
        </div>
        <div>
          <h1 className="text-base md:text-lg font-extrabold text-[#1b6d24] tracking-tight leading-none uppercase">
            {language === 'te' ? 'ఈ రైతు వేదిక' : 'E-Raitu Vedika'}
          </h1>
          <span className="text-[9px] text-gray-400 font-bold uppercase tracking-wider block mt-0.5">
            {language === 'te' ? 'రైతు సమూహ సేవ' : 'Cooperative Farming'}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-2.5">
        {/* Modern Language Segmented Switch */}
        <button
          onClick={onLanguageToggle}
          className="bg-emerald-50 text-[#1b6d24] border border-[#1b6d24]/10 p-1.5 px-3 rounded-full flex items-center gap-1.5 active:scale-95 transition-all text-[10px] font-extrabold hover:bg-emerald-100 cursor-pointer"
          id="btn-language-switch"
          title="Switch Language"
        >
          <Globe className="w-3.5 h-3.5 text-[#1b6d24]" />
          <span className="uppercase">
            {language === 'te' ? 'English' : 'తెలుగు'}
          </span>
        </button>

        <button
          onClick={onProfileClick}
          className="flex items-center gap-2 group transition-transform duration-200 active:scale-95 focus:outline-none cursor-pointer"
          aria-label="User profile"
          id="btn-header-profile"
        >
          <div className="hidden sm:flex flex-col items-end text-right">
            <span className="text-xs font-bold text-gray-800 leading-tight">{user.name}</span>
            <span className="text-[9.5px] font-mono font-bold text-[#1b6d24] bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200 mt-0.5">
              ID: {user.id || user.uid || user.phone}
            </span>
          </div>
          <div className="relative">
            <div className="w-9.5 h-9.5 rounded-full border-2 border-[#1b6d24] overflow-hidden shadow-sm">
              <img
                src={user.avatar}
                alt={user.name}
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
            <div className="absolute right-0 bottom-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
          </div>
        </button>
      </div>
    </header>
  );
}
