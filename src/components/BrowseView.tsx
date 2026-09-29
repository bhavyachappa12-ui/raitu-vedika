import React, { useState, useEffect, useMemo } from 'react';
import { Equipment, CategoryType } from '../types';
import { MapPin, Search, CheckCircle, HelpCircle, Eye, Info, FilterX, MessageSquare } from 'lucide-react';
import { DISTRICTS, CATEGORIES } from '../data';
import { AP_LOCATION_DATABASE } from '../locationData';
import { StarRating } from './StarRating';

interface BrowseViewProps {
  equipmentList: Equipment[];
  selectedCategory: CategoryType | '';
  onBook: (id: string) => void;
  onViewDetails: (id: string) => void;
  onOpenChat: (
    ownerName: string,
    equipmentTitle: string,
    equipmentId: string,
    equipmentImage: string,
    ownerPhone: string,
    ownerAvatar: string
  ) => void;
  initialSearchQuery?: string;
  onClearInitialCategory?: () => void;
  language: 'te' | 'en';
  userDistrict?: string;
}

export default function BrowseView({
  equipmentList,
  selectedCategory,
  onBook,
  onViewDetails,
  onOpenChat,
  initialSearchQuery = '',
  onClearInitialCategory,
  language,
  userDistrict
}: BrowseViewProps) {
  const [searchQuery, setSearchQuery] = useState(initialSearchQuery);
  const [selectedDistrict, setSelectedDistrict] = useState('అన్నీ');
  const [activeCategory, setActiveCategory] = useState<CategoryType | ''>(selectedCategory);

  // Sync with user's registered district location on login
  useEffect(() => {
    if (userDistrict) {
      const match = DISTRICTS.find(d => 
        d.toLowerCase().includes(userDistrict.toLowerCase()) || 
        userDistrict.toLowerCase().includes(d.toLowerCase())
      );
      if (match) {
        setSelectedDistrict(match);
      }
    }
  }, [userDistrict]);

  // Sync with initial search queries and initial categories if passed from home screen redirect
  useEffect(() => {
    setSearchQuery(initialSearchQuery);
  }, [initialSearchQuery]);

  useEffect(() => {
    setActiveCategory(selectedCategory);
  }, [selectedCategory]);

  const t = {
    te: {
      title: "పరికరాల శోధన",
      sub: "మండలాలు, రకాల ఆధారంగా శోధించండి",
      placeholder: "ట్రాక్టర్, హార్వెస్టర్ లేదా రైతు పేరుతో వెతకండి...",
      clear: "క్లియర్",
      allDistricts: "అన్నీ",
      activeFilter: "ఫిల్టర్",
      removeFilter: "తీసివేయి",
      totalResult: "మొత్తం ఫలితాలు",
      resetBtn: "అన్నీ రీసెట్",
      noResults: "మ్యాచింగ్ యంత్రాలు కనుగొనబడలేదు",
      noResultsDesc: "దయచేసి వేరే పదం లేదా ప్రాంతం మార్చి ప్రయత్నించండి.",
      rateDay: "రోజుకు",
      rateHour: "గంటకు",
      booked: "బుకింగ్ చేయబడింది",
      bookBtn: "బుక్ చేయండి",
      detailsBtn: "వివరాలు"
    },
    en: {
      title: "Machinery Search Marketplace",
      sub: "Find by districts, categories, and keyword matching",
      placeholder: "Search for tractors, tillers, owners...",
      clear: "Clear",
      allDistricts: "All Districts",
      activeFilter: "Active Filter",
      removeFilter: "Remove",
      totalResult: "Total items discovered",
      resetBtn: "Reset All",
      noResults: "No Matching Machinery",
      noResultsDesc: "Please refine your keywords or select another district region.",
      rateDay: "per Day",
      rateHour: "per Hour",
      booked: "Already Booked",
      bookBtn: "Book Now",
      detailsBtn: "View Details"
    }
  }[language];

  // Helper dictionary to translate district labels on the chip bar
  const districtTranslation: Record<string, string> = {
    'అన్నీ': 'All',
    'అనంతపురము': 'Anantapur',
    'కర్నూలు': 'Kurnool',
    'చిత్తూరు': 'Chittoor',
    'विशाखपटनम': 'Visakhapatnam',
    'విశాఖపట్నం': 'Visakhapatnam',
    'గుంటూరు': 'Guntur',
    'నెల్లూరు': 'Nellore',
    'అనకాపల్లి': 'Anakapalli'
  };

  // Helper to extract district key
  const getPageDistrictKey = (districtRaw: string): string => {
    const match = (districtRaw || "").match(/\(([^)]+)\)/);
    if (match && match[1]) {
      const dk = match[1].trim();
      if (AP_LOCATION_DATABASE.districts[dk]) return dk;
    }
    if (AP_LOCATION_DATABASE.districts[districtRaw]) return districtRaw;
    
    // Fallbacks
    for (const dk of Object.keys(AP_LOCATION_DATABASE.districts)) {
      if (districtRaw.toLowerCase().includes(dk.toLowerCase()) || 
          (AP_LOCATION_DATABASE.districts[dk].english && 
           districtRaw.toLowerCase().includes(AP_LOCATION_DATABASE.districts[dk].english.toLowerCase()))) {
        return dk;
      }
    }
    return '';
  };

  // Helper to adjust equipment locations dynamically based on selected page district
  const adjustEquipmentLocationsForDistrict = (dist: string, currentEquipments: Equipment[]) => {
    if (!dist || dist === 'అన్నీ') return currentEquipments;
    
    const districtKey = getPageDistrictKey(dist);
    if (!districtKey) return currentEquipments;
    
    const distData = AP_LOCATION_DATABASE.districts[districtKey];
    if (!distData) return currentEquipments;
    
    const allLocalities = [...(distData.places || []), ...(distData.villages || [])];
    if (allLocalities.length === 0) return currentEquipments;
    
    const parseLocationPair = (locStr: string) => {
      const m = (locStr || "").match(/([^(]+)\(([^)]+)\)/);
      if (m) {
        return {
          te: m[1].trim(),
          en: m[2].trim()
        };
      }
      return { te: locStr, en: locStr };
    };

    const getDeterministicLoc = (eqId: string) => {
      let hash = 0;
      for (let i = 0; i < eqId.length; i++) {
        hash = eqId.charCodeAt(i) + ((hash << 5) - hash);
      }
      const index = Math.abs(hash) % allLocalities.length;
      return allLocalities[index];
    };
    
    return currentEquipments.map((eq) => {
      if (eq.isCustom) return eq;
      const locStr = getDeterministicLoc(eq.id);
      const parsed = parseLocationPair(locStr);
      return {
        ...eq,
        location: parsed.te,
        locationEn: parsed.en,
        district: districtKey,
        city: parsed.en,
        mandal: parsed.en,
        village: parsed.te
      };
    });
  };

  const adjustedEquipmentList = useMemo(() => {
    return adjustEquipmentLocationsForDistrict(selectedDistrict, equipmentList);
  }, [selectedDistrict, equipmentList]);

  // 1. Exact local matches for the selected district location (All vehicles are universally accessible in all places)
  const exactList = adjustedEquipmentList.filter((eq) => {
    let districtMatch = true;
    if (selectedDistrict !== 'అన్నీ') {
      const match = (selectedDistrict || "").match(/\(([^)]+)\)/);
      const districtKey = match ? match[1].toLowerCase().trim() : selectedDistrict.toLowerCase().trim();
      const teluguKey = selectedDistrict.split(' (')[0].trim();
      
      const eqDistrict = (eq.district || '').toLowerCase().trim();
      const eqLocation = (eq.location || '').toLowerCase().trim();
      const eqLocationEn = (eq.locationEn || '').toLowerCase().trim();
      
      districtMatch = 
        eqDistrict.includes(districtKey) ||
        eqLocation.includes(districtKey) ||
        eqLocationEn.includes(districtKey) ||
        districtKey.includes(eqDistrict) ||
        eqLocation.includes(teluguKey) ||
        teluguKey.includes(eqLocation);
    }
    
    const categoryMatch = !activeCategory || eq.category === activeCategory;

    const query = searchQuery.toLowerCase().trim();
    const searchMatch =
      !query ||
      eq.title.toLowerCase().includes(query) ||
      eq.titleEn.toLowerCase().includes(query) ||
      eq.location.toLowerCase().includes(query) ||
      eq.locationEn.toLowerCase().includes(query) ||
      eq.ownerName.toLowerCase().includes(query);

    return districtMatch && categoryMatch && searchMatch;
  });

  // 2. Regional matches is not needed anymore since all appear globally
  const otherList: Equipment[] = [];

  const totalDiscovered = exactList.length + otherList.length;

  return (
    <div className="pb-24 animate-fade-in px-5 mt-4 max-w-md mx-auto md:max-w-2xl">
      {/* Title */}
      <div className="mb-4">
        <h2 className="text-xl font-extrabold text-gray-800 tracking-tight flex items-center gap-1.5">
          {t.title}
        </h2>
        <p className="text-xs text-gray-400 mt-0.5">{t.sub}</p>
      </div>

      {/* Search Input Bar */}
      <div className="relative mb-5">
        <input
          type="text"
          placeholder={t.placeholder}
          className="w-full bg-white border border-gray-200 text-gray-800 font-bold px-4 py-3.5 rounded-2xl pl-11 pr-16 focus:outline-none focus:ring-2 focus:ring-[#1b6d24]/50 focus:border-[#1b6d24] shadow-xs text-xs transition-all duration-200 animate-pulse-once"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          id="input-browse-search"
          autoComplete="off"
        />
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-gray-400" />
        
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-red-600 hover:text-red-700 font-extrabold cursor-pointer"
            id="btn-clear-search"
          >
            {t.clear}
          </button>
        )}
      </div>

      {/* District Horizontal scrollable Chips with translated titles */}
      <div className="relative mb-6">
        <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar scroll-smooth snap-x snap-mandatory">
          {DISTRICTS.map((district) => {
            const isSelected = selectedDistrict === district;
            const parensMatch = (district || "").match(/\(([^)]+)\)/);
            let displayName = district;
            if (language === 'en') {
              if (district === 'అన్నీ') {
                displayName = 'All';
              } else {
                displayName = parensMatch ? parensMatch[1] : district;
              }
            }
            return (
              <button
                key={district}
                type="button"
                onClick={() => setSelectedDistrict(district)}
                className={`snap-center shrink-0 px-4 py-2 text-xs font-black rounded-full transition-all duration-150 cursor-pointer ${
                  isSelected
                    ? 'bg-[#1b6d24] text-white shadow-sm scale-102 border border-[#1b6d24]'
                    : 'bg-white border border-gray-200 text-gray-650 hover:bg-gray-50'
                }`}
                id={`chip-district-${district}`}
              >
                {displayName}
              </button>
            );
          })}
        </div>
      </div>

      {/* Category Sub-Filters if any active */}
      {activeCategory && (
        <div className="mb-5 flex items-center justify-between bg-emerald-50 rounded-2xl p-3 px-4 border border-emerald-100/50">
          <p className="text-xs text-[#1b6d24] font-black flex items-center gap-1.5">
            <Info className="w-4 h-4" />
            <span>
              {t.activeFilter}: <span className="underline">{CATEGORIES.find(c => c.id === activeCategory)?.label}</span>
            </span>
          </p>
          <button
            onClick={() => {
              setActiveCategory('');
              if (onClearInitialCategory) onClearInitialCategory();
            }}
            className="text-[10px] text-emerald-800 font-bold bg-white px-2.5 py-1 rounded-lg border border-emerald-200 shadow-3xs cursor-pointer active:scale-95"
            id="btn-clear-category-filter"
          >
            {t.removeFilter}
          </button>
        </div>
      )}
      {/* Results Header */}
      <div className="flex justify-between items-center mb-4">
        <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">
          {t.totalResult}: <span className="text-[#1b6d24] font-black text-sm">{totalDiscovered}</span>
        </p>

        {/* Quick Reset */}
        {(selectedDistrict !== 'అన్నీ' || searchQuery || activeCategory) && (
          <button
            onClick={() => {
              setSelectedDistrict('అన్నీ');
              setSearchQuery('');
              setActiveCategory('');
              if (onClearInitialCategory) onClearInitialCategory();
            }}
            className="text-xs text-red-600 font-extrabold hover:underline flex items-center gap-1 cursor-pointer"
            id="btn-reset-filters"
          >
            <FilterX className="w-3.5 h-3.5" />
            <span>{t.resetBtn}</span>
          </button>
        )}
      </div>

      {/* Search results listing layout */}
      {(() => {
        const renderEquipmentCard = (eq: Equipment, isRegional: boolean = false) => {
          const isBooked = eq.status === 'booked';

          return (
            <div
              key={eq.id}
              className="bg-white rounded-[2rem] overflow-hidden border border-gray-150/60 shadow-xs hover:shadow-md transition-all duration-300 flex flex-col group relative"
              id={`browse-card-${eq.id}`}
            >
              {/* Image Section */}
              <div 
                onClick={() => onViewDetails(eq.id)}
                className="relative h-44 bg-slate-50 cursor-pointer overflow-hidden flex items-center justify-center"
              >
                <div 
                  className="absolute inset-0 bg-cover bg-center blur-md opacity-25 scale-115 pointer-events-none"
                  style={{ backgroundImage: `url(${eq.imageUrl})` }}
                />
                <img
                  src={eq.imageUrl}
                  alt={eq.title}
                  className="relative z-10 max-w-full max-h-full object-contain group-hover:scale-102 transition-transform duration-500"
                  referrerPolicy="no-referrer"
                  onError={(e) => {
                    e.currentTarget.src = 'https://images.unsplash.com/photo-1593113598332-cd59c5bc3f90?w=600';
                  }}
                />
                
                {/* Custom badges */}
                <div className="absolute top-3 right-3 flex flex-col gap-1 items-end z-20">
                  <span
                    className={`px-3 py-1 rounded-full text-[9.5px] font-black shadow-xs ${
                      eq.status === 'available'
                        ? 'bg-green-50 text-green-700 border border-green-100'
                        : eq.status === 'coming_soon'
                        ? 'bg-amber-150 text-amber-900 border border-amber-200'
                        : 'bg-orange-50 text-orange-700 border border-orange-100'
                    }`}
                  >
                    {eq.statusLabel}
                  </span>
                  {isRegional && (
                    <span className="bg-[#1b6d24]/90 text-white font-black text-[8px] px-2.5 py-1 rounded-full shadow-xs border border-green-100/25 uppercase tracking-widest leading-none">
                      {language === 'te' ? '📍 పక్క లొకేషన్' : '📍 Transportable'}
                    </span>
                  )}
                </div>

                {eq.verified && (
                  <div className="absolute top-3 left-3 bg-white/95 px-2.5 py-1 rounded-full flex items-center gap-1 shadow-2xs border border-green-500/20 z-20">
                    <div className="w-1.5 h-1.5 rounded-full bg-green-500"></div>
                    <span className="text-[9px] font-black text-green-700 uppercase tracking-widest">VERIFIED</span>
                  </div>
                )}
              </div>

              {/* Details Section */}
              <div className="p-5 flex-1 flex flex-col">
                {/* Title */}
                <div 
                  onClick={() => onViewDetails(eq.id)}
                  className="flex items-center gap-1.5 mb-1 cursor-pointer"
                >
                  <h3 className="text-base font-black text-gray-800 leading-tight hover:text-[#1b6d24] transition-colors">
                    {language === 'te' ? eq.title : eq.titleEn || eq.title}
                  </h3>
                </div>

                {/* Star Rating Badge */}
                <div className="flex items-center gap-2 mb-2">
                  <StarRating
                    rating={eq.rating || 4.8}
                    reviewCount={eq.reviewCount || 10}
                    size="sm"
                    language={language}
                    onClick={() => onViewDetails(eq.id)}
                  />
                </div>

                {/* Location with Pin */}
                <div className="flex items-center gap-1 text-[11px] text-gray-400 mb-2 font-bold">
                  <MapPin className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span className="text-gray-600 font-extrabold">{language === 'te' ? eq.location : eq.locationEn || eq.location}</span>
                  {eq.horsepower && (
                    <>
                      <span className="mx-1 text-gray-300">•</span>
                      <span className="bg-slate-100 px-1.5 py-0.5 rounded text-[9.5px] text-slate-500 font-extrabold">{eq.horsepower}</span>
                    </>
                  )}
                </div>

                {isRegional && (
                  <div className="bg-emerald-50/70 border border-emerald-100/60 rounded-xl p-2 px-2.5 mb-2.5 text-[9.5px] text-emerald-800 font-black leading-normal flex items-start gap-1.5">
                    <span className="flex h-1.5 w-1.5 rounded-full bg-emerald-500 mt-1 shrink-0"></span>
                    <span>
                      {language === 'te' 
                        ? 'ఆంధ్రప్రదేశ్ లో ఎక్కడికైనా తక్కువ రవాణా చార్జీతో బుక్ చేసుకోవచ్చు!' 
                        : 'Available to hire in your area. Deliverable with minimal diesel/transport.'}
                    </span>
                  </div>
                )}

                {/* Horizontal Rule */}
                <hr className="border-gray-100 my-1 flex-1" />

                {/* Bottom Rate & CTA */}
                <div className="flex items-center justify-between pt-3">
                  <div className="flex flex-col">
                    <span className="text-[9px] font-extrabold text-gray-450 uppercase tracking-wider leading-none">
                      {eq.rateType === 'day' ? t.rateDay : t.rateHour}
                    </span>
                    <span className="text-base font-black text-[#1b6d24] mt-1 leading-none">
                      ₹{eq.price}
                    </span>
                  </div>

                  <div className="flex gap-1.5">
                    <button
                      onClick={() => onViewDetails(eq.id)}
                      className="py-2.5 px-3.5 font-bold text-xs rounded-xl bg-slate-50 border border-gray-200 hover:bg-slate-100 text-gray-600 transition-all cursor-pointer shadow-3xs active:scale-95"
                      id={`browse-btn-details-trigger-${eq.id}`}
                    >
                      {t.detailsBtn}
                    </button>

                    <button
                      onClick={() => onOpenChat(
                        eq.ownerName,
                        eq.title,
                        eq.id,
                        eq.imageUrl,
                        eq.ownerPhone,
                        eq.ownerAvatar
                      )}
                      className="py-2.5 px-3 bg-emerald-50 text-[#1b6d24] border border-emerald-200 hover:bg-emerald-100 font-bold text-xs rounded-xl transition-all cursor-pointer shadow-3xs active:scale-95 flex items-center justify-center gap-1"
                      id={`browse-btn-chat-${eq.id}`}
                      title={language === 'te' ? 'యజమానితో చాట్ చేయండి' : 'Chat with Owner'}
                    >
                      <MessageSquare className="w-4 h-4 shrink-0 text-[#1b6d24]" />
                      <span className="hidden sm:inline">{language === 'te' ? 'చాట్' : 'Chat'}</span>
                    </button>

                    {isBooked ? (
                      <button
                        disabled
                        className="py-2.5 px-3.5 bg-gray-150 text-gray-400 font-bold text-xs rounded-xl cursor-not-allowed border border-gray-200"
                        id={`browse-btn-booked-${eq.id}`}
                      >
                        {t.booked}
                      </button>
                    ) : (
                      <button
                        onClick={() => onBook(eq.id)}
                        className="py-2.5 px-4 font-black text-xs rounded-xl bg-[#1b6d24] hover:bg-[#15541b] text-white shadow-3xs transition-all active:scale-95 cursor-pointer"
                        id={`browse-btn-cta-${eq.id}`}
                      >
                        {t.bookBtn}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        };

        if (totalDiscovered === 0) {
          return (
            <div className="bg-white rounded-3xl p-8 py-16 text-center border border-gray-100 shadow-xs flex flex-col items-center">
              <div className="w-16 h-16 rounded-full bg-emerald-50 flex items-center justify-center mb-3.5 border border-emerald-100">
                <Search className="w-8 h-8 text-emerald-600" />
              </div>
              <h4 className="text-sm font-black text-gray-700">{t.noResults}</h4>
              <p className="text-xs text-gray-400 mt-1 max-w-[220px] leading-relaxed font-semibold">
                {t.noResultsDesc}
              </p>
            </div>
          );
        }

        return (
          <div className="space-y-6">
            {/* Direct matches */}
            {exactList.length > 0 && (
              <div className="space-y-4">
                {selectedDistrict !== 'అన్నీ' && (
                  <h4 className="text-[10px] text-emerald-700 font-black tracking-wider uppercase flex items-center gap-1.5 px-1 bg-emerald-50/50 p-2 rounded-xl border border-emerald-100/30">
                    <span className="w-2 h-2 rounded-full bg-[#1b6d24] animate-ping"></span>
                    <span>{language === 'te' ? `${selectedDistrict.split(' (')[0]} లో అందుబాటులో ఉన్నవి` : `Directly Available in ${selectedDistrict.split(' (')[0]}`}</span>
                  </h4>
                )}
                <div className="space-y-6">
                  {exactList.map(eq => renderEquipmentCard(eq, false))}
                </div>
              </div>
            )}

            {/* Other regional options */}
            {otherList.length > 0 && (
              <div className="pt-4 border-t border-dashed border-gray-200 mt-4 space-y-4">
                <h4 className="text-[10px] text-slate-500 font-black tracking-wider uppercase flex items-center gap-1.5 px-1 py-1">
                  <span>{language === 'te' ? '🚜 ఇతర జిల్లాల నుండి లభించు వ్యవసాయ యంత్రాలు (రవాణాతో)' : '🚜 Regional Machinery Available With Transport'}</span>
                </h4>
                <div className="space-y-6">
                  {otherList.map(eq => renderEquipmentCard(eq, true))}
                </div>
              </div>
            )}
          </div>
        );
      })()}
    </div>
  );
}
