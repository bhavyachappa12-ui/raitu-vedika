import React, { useState } from 'react';
import { Equipment, CategoryType } from '../types';
import { Tractor, Sprout, Search, MapPin, ChevronRight, Sliders, Leaf, Award, HelpCircle, Droplets, TrendingDown, Layers, ShieldCheck, MessageSquare } from 'lucide-react';
import { StarRating } from './StarRating';

interface HomeViewProps {
  equipmentList: Equipment[];
  onBook: (id: string) => void;
  onSearchRedirect: (searchQuery: string, category?: CategoryType) => void;
  onViewDetails: (id: string) => void;
  onOpenChat: (
    ownerName: string,
    equipmentTitle: string,
    equipmentId: string,
    equipmentImage: string,
    ownerPhone: string,
    ownerAvatar: string
  ) => void;
  language: 'te' | 'en';
  onOpenPublicPage?: (pageId: 'about' | 'contact' | 'faq' | 'listing' | 'details' | 'search' | 'privacy' | 'terms' | 'help_support') => void;
  onSwitchToExtras?: () => void;
  userDistrict?: string;
}

export default function HomeView({
  equipmentList,
  onBook,
  onSearchRedirect,
  onViewDetails,
  onOpenChat,
  language,
  onOpenPublicPage,
  onSwitchToExtras,
  userDistrict
}: HomeViewProps) {
  const [quickSearch, setQuickSearch] = useState('');

  // Prioritize user's own district on top
  const sortedEquipmentList = React.useMemo(() => {
    if (!userDistrict) return equipmentList;
    const districtLower = userDistrict.toLowerCase();
    return [...equipmentList].sort((a, b) => {
      const aMatch = 
        (a.location && a.location.toLowerCase().includes(districtLower)) || 
        (a.district && a.district.toLowerCase().includes(districtLower)) || 
        (a.locationEn && a.locationEn.toLowerCase().includes(districtLower));
      const bMatch = 
        (b.location && b.location.toLowerCase().includes(districtLower)) || 
        (b.district && b.district.toLowerCase().includes(districtLower)) || 
        (b.locationEn && b.locationEn.toLowerCase().includes(districtLower));
      if (aMatch && !bMatch) return -1;
      if (!aMatch && bMatch) return 1;
      return 0;
    });
  }, [equipmentList, userDistrict]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (quickSearch.trim()) {
      onSearchRedirect(quickSearch);
    }
  };

  const mainCategories = [
    { id: 'tractor' as CategoryType, nameTe: 'ట్రాక్టర్', nameEn: 'Tractor', icon: Tractor, bgColor: 'bg-[#e8f5e9]', iconColor: 'text-[#1b6d24]' },
    { id: 'harvester' as CategoryType, nameTe: 'హార్వెస్టర్', nameEn: 'Harvester', icon: Sprout, bgColor: 'bg-[#ffebee]', iconColor: 'text-[#c62828]' },
    { id: 'sprayer' as CategoryType, nameTe: 'స్ప్రేయర్', nameEn: 'Sprayer', icon: Droplets, bgColor: 'bg-[#fff8e1]', iconColor: 'text-[#e65100]' },
    { id: 'tiller' as CategoryType, nameTe: 'టిల్లర్', nameEn: 'Tiller', icon: Leaf, bgColor: 'bg-[#f1f8e9]', iconColor: 'text-[#558b2f]' },
    { id: 'rotavator' as CategoryType, nameTe: 'రోటవేటర్', nameEn: 'Rotavator', icon: Layers, bgColor: 'bg-[#f3e5f5]', iconColor: 'text-[#8e24aa]' },
    { id: 'transplanter' as CategoryType, nameTe: 'నాటు యంత్రం', nameEn: 'Transplanter', icon: Sprout, bgColor: 'bg-[#e0f2f1]', iconColor: 'text-[#00695c]' }
  ];

  const t = {
    te: {
      heroTitle: "వ్యవసాయ పరికరాలను పంచుకోండి – ఖర్చులను తగ్గించుండి",
      searchPlaceholder: "పరికరాల లేదా యజమాని పేరు కోసం వెతకండి...",
      categories: "ప్రధాన వర్గాలు (Main Categories)",
      availableMachinery: "అందుబాటులో ఉన్న యంత్రాలు (Machinery)",
      viewAll: "అన్నీ చూడండి",
      verified: "రైతు వెరిఫైడ్",
      waiting: "వెయిటింగ్ లిస్ట్ (Booked)",
      book: "బుక్ చేయండి",
      details: "వివరాలు చూడండి",
      statsTitle: "మీ ఆదా మరియు ప్రయోజనాల డ్యాష్‌బోర్డ్",
      amtSaved: "సగటు వార్షిక ఆదా",
      activeMachines: "చుట్టుపక్కల అందుబాటు",
      coopPercent: "అద్దె అనుకూలత",
      amtSavedVal: "₹18,500/రైతు",
      activeMachinesVal: "24 క్రియాశీల యంత్రాలు",
      coopPercentVal: "40% వరకు తక్కువ ధర",
      faqTitle: "తరచూ అడిగే ప్రశ్నలు (FAQ)",
      faq1Q: "E-Raitu Vedika వేదిక ఎలా పనిచేస్తుంది?",
      faq1A: "ఇది స్థానిక రైతుల మధ్య యంత్రాల ఇచ్చిపుచ్చుకునే సహకార వేదిక. ఎక్కువ రేటు పెట్టి కొనే పని లేకుండా సులభంగా అద్దెకు తీసుకోవచ్చు.",
      faq2Q: "బుకింగ్ చెల్లింపులు ఎలా జరపాలి?",
      faq2A: "బుకింగ్ పూర్తిగా ఉచితం! యంత్ర అప్పగింత సమయాన నేరుగా యజమానితో మాట్లాడి నగదు లేదా ఆన్‌లైన్ పేమెంట్ చేయవచ్చు."
    },
    en: {
      heroTitle: "Share Agritech Equipment – Lower Cultivation Costs",
      searchPlaceholder: "Search machinery, tools or owners...",
      categories: "Main Categories",
      availableMachinery: "Available Machinery Nearby",
      viewAll: "View All Listings",
      verified: "Farmer Verified",
      waiting: "Reserved / Booked",
      book: "Rent Now",
      details: "View Info & Specifications",
      statsTitle: "Your Shared Economy Impact",
      amtSaved: "Avg Annual Savings",
      activeMachines: "Active Fleet Nearby",
      coopPercent: "Rental Price Advantage",
      amtSavedVal: "₹18,500/Farmer",
      activeMachinesVal: "24+ Active Tools",
      coopPercentVal: "Up to 40% Cheaper",
      faqTitle: "Frequently Asked Questions",
      faq1Q: "How does E-Raitu Vedika work?",
      faq1A: "E-Raitu Vedika is a community sharing platform, enabling farmers to loan or rent local machinery directly, cutting down capital costs.",
      faq2Q: "How do I make the final payments?",
      faq2A: "Booking registration is totally free. Final payments are completed directly with the machinery owner during pickup or dropoff."
    }
  }[language];

  return (
    <div className="pb-24 animate-fade-in">
      {/* Hero Banner Section */}
      <div 
        className="relative h-64 md:h-80 bg-cover bg-center rounded-b-[2rem] overflow-hidden flex flex-col justify-end p-6 shadow-md"
        style={{
          backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.25), rgba(0, 0, 0, 0.7)), url('https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1200&q=80')`
        }}
      >
        <div className="relative z-10 text-center max-w-lg mx-auto mb-4">
          <h2 className="text-lg md:text-2xl font-black text-white mb-3.5 leading-snug drop-shadow-md px-2">
            {t.heroTitle}
          </h2>
          
          {/* Quick Search Input */}
          <form onSubmit={handleSearchSubmit} className="relative mt-2">
            <input
              type="text"
              placeholder={t.searchPlaceholder}
              className="w-full bg-white text-gray-800 placeholder-gray-400 font-bold px-4 py-3.5 rounded-2xl pr-14 focus:outline-none focus:ring-2 focus:ring-[#1b6d24] shadow-lg text-xs transition-all duration-200"
              value={quickSearch}
              onChange={(e) => setQuickSearch(e.target.value)}
              id="input-quick-search"
              autoComplete="off"
            />
            <button
              type="submit"
              className="absolute right-1 top-1 bottom-1 bg-[#1b6d24] text-white w-10.5 h-10.5 rounded-full flex items-center justify-center hover:bg-[#15541b] active:scale-90 transition-all duration-150 cursor-pointer"
              id="btn-quick-search"
            >
              <Search className="w-4 h-4 text-white" />
            </button>
          </form>
        </div>
      </div>

      <div className="px-5 mt-6 max-w-md mx-auto md:max-w-2xl">
        
        {/* Dynamic Shared Economy Stats Dashboard Widget */}
        <div className="mb-8 bg-white border border-gray-100 rounded-[2rem] p-5 shadow-xs">
          <div className="flex items-center gap-1.5 mb-3.5">
            <Award className="w-5 h-5 text-emerald-600" />
            <h3 className="text-xs font-black text-gray-800 uppercase tracking-wider">
              {t.statsTitle}
            </h3>
          </div>

          <div className="grid grid-cols-3 gap-2.5">
            {/* Stat item 1 */}
            <div className="bg-emerald-50/45 border border-emerald-50 rounded-2xl p-3 text-center">
              <TrendingDown className="w-4 h-4 text-emerald-700 mx-auto mb-1.5" />
              <p className="text-[14px] font-extrabold text-emerald-800 leading-none">
                {t.amtSavedVal}
              </p>
              <p className="text-[9.5px] text-gray-400 font-bold mt-1 leading-snug">
                {t.amtSaved}
              </p>
            </div>

            {/* Stat item 2 */}
            <div className="bg-[#fffdf2] border border-amber-50 rounded-2xl p-3 text-center">
              <Sliders className="w-4 h-4 text-amber-500 mx-auto mb-1.5" />
              <p className="text-[14px] font-extrabold text-amber-800 leading-none">
                {t.activeMachinesVal}
              </p>
              <p className="text-[9.5px] text-gray-400 font-bold mt-1 leading-snug">
                {t.activeMachines}
              </p>
            </div>

            {/* Stat item 3 */}
            <div className="bg-sky-50/30 border border-sky-50/50 rounded-2xl p-3 text-center">
              <Layers className="w-4 h-4 text-sky-600 mx-auto mb-1.5" />
              <p className="text-[14px] font-extrabold text-sky-800 leading-none">
                {t.coopPercentVal}
              </p>
              <p className="text-[9.5px] text-gray-400 font-bold mt-1 leading-snug">
                {t.coopPercent}
              </p>
            </div>
          </div>
        </div>

        {/* Dynamic Premium Agritech Extras Promotional Card */}
        <div className="mb-8 bg-gradient-to-br from-emerald-900 to-emerald-950 text-white rounded-[2rem] p-6 shadow-md border-2 border-emerald-400/20 relative overflow-hidden">
          <div className="absolute right-0 bottom-0 translate-x-4 translate-y-4 opacity-10">
            <Sprout className="w-40 h-40" />
          </div>
          
          <div className="relative z-10 space-y-4">
            <div className="flex items-center gap-2">
              <span className="bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 font-black text-[9px] px-2 py-0.5 rounded-full uppercase tracking-widest">
                {language === 'te' ? 'సహకార సేవల అదనపు విభాగం' : 'Cooperative Extension'}
              </span>
              <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
            </div>

            <div>
              <h3 className="text-sm md:text-base font-extrabold text-[#d2f4d3]">
                {language === 'te' ? '🌟 అగ్రిటెక్ అదనపు సేవలు (Agritech Extras)' : '🌟 Agritech Cooperative Extras'}
              </h3>
              <p className="text-[10px] text-emerald-300 mt-1 leading-relaxed">
                {language === 'te' 
                  ? 'ఆంధ్రప్రదేశ్ సన్నకారు రైతుల సమాజ సాధికారతకు మరియు ఉచిత సహాయ సేవల కొరకు ఇక్కడ క్లిక్ చేయండి' 
                  : 'Free community tools designed to support productivity, networking, and security of AP farmers.'}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-x-3 gap-y-1.5 text-[9.5px] font-bold text-emerald-250 border-t border-emerald-800 pt-3">
              <span className="flex items-center gap-1">🌾 {language === 'te' ? 'సామాజిక వేదిక' : 'Community Forum'}</span>
              <span className="flex items-center gap-1">⛅ {language === 'te' ? 'వాతావరణ నివేదిక' : 'Crop Weather'}</span>
              <span className="flex items-center gap-1">🏛️ {language === 'te' ? 'ప్రభుత్వ పథకాలు' : 'Govt schemes'}</span>
              <span className="flex items-center gap-1">🌱 {language === 'te' ? 'పంటల సలహాదారు' : 'Crop Recommender'}</span>
              <span className="flex items-center gap-1 col-span-2">🚨 {language === 'te' ? 'అత్యవసర యంత్రాల సమూహ సహాయం (SOS)' : 'Emergency Neighbor SOS Help Desk'}</span>
            </div>

            <button
              onClick={() => {
                if (onSwitchToExtras) {
                  onSwitchToExtras();
                }
              }}
              className="w-full mt-1.5 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white font-extrabold rounded-xl text-xs flex items-center justify-center gap-1.5 active:scale-98 transition shadow-sm cursor-pointer"
              id="btn-open-extras-promo"
            >
              <span>{language === 'te' ? 'అన్ని ఉచిత సేవలను వీక్షించండి' : 'Open Cooperative Tools Desk'}</span>
              <ChevronRight className="w-4 h-4 text-white" />
            </button>
          </div>
        </div>

        {/* Main Categories Section */}
        <div className="mb-8">
          <h3 className="text-base font-black text-gray-800 mb-4 tracking-tight flex items-center gap-1.5">
            <Leaf className="w-4.5 h-4.5 text-[#1b6d24]" />
            <span>{t.categories}</span>
          </h3>
          <div className="grid grid-cols-3 gap-3">
            {mainCategories.map((cat) => {
              const Icon = cat.icon;
              return (
                <button
                  key={cat.id}
                  onClick={() => onSearchRedirect('', cat.id)}
                  className="flex flex-col items-center justify-center p-4 bg-white rounded-2xl shadow-xs border border-gray-100 hover:border-[#1b6d24]/30 hover:shadow-sm active:scale-95 transition-all duration-200 cursor-pointer"
                  id={`home-category-${cat.id}`}
                >
                  <div className={`w-11 h-11 rounded-full ${cat.bgColor} flex items-center justify-center mb-2.5`}>
                    <Icon className={`w-5 h-5 ${cat.iconColor}`} />
                  </div>
                  <span className="text-[11px] font-black text-gray-700">
                    {language === 'te' ? cat.nameTe : cat.nameEn}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Featured / Available Section Header */}
        <div className="flex flex-col mb-4.5 gap-1.5">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-black text-gray-800 tracking-tight flex items-center gap-1.5">
              <Tractor className="w-4.5 h-4.5 text-[#1b6d24]" />
              <span>{t.availableMachinery}</span>
            </h3>
            <button
              onClick={() => onSearchRedirect('')}
              className="text-xs font-bold text-[#1b6d24] hover:underline flex items-center gap-0.5 cursor-pointer"
              id="btn-view-all"
            >
              {t.viewAll} <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
          {userDistrict && (
            <div className="bg-emerald-50/70 border border-emerald-100 rounded-xl px-3 py-1.5 flex items-center justify-between text-[11px] font-bold text-emerald-800">
              <span className="flex items-center gap-1">📍 {language === 'te' ? `మీ స్థానిక జిల్లా ఆధారంగా అమర్చబడింది: ${userDistrict}` : `Filtered by your login place: ${userDistrict}`}</span>
              <span className="text-[10px] bg-emerald-500 text-white rounded px-1.5 py-0.5 uppercase tracking-wide">Nearby</span>
            </div>
          )}
        </div>

        {/* Equipment list with clickable covers and action drawers */}
        <div className="space-y-6">
          {sortedEquipmentList.slice(0, 3).map((eq) => {
            const isBooked = eq.status === 'booked';
            const isComingSoon = eq.status === 'coming_soon';

            return (
              <div
                key={eq.id}
                className="bg-white rounded-[2rem] overflow-hidden border border-gray-100/90 shadow-xs hover:shadow-md transition-all duration-300 flex flex-col group"
                id={`featured-card-${eq.id}`}
              >
                {/* Product Image Container */}
                <div 
                  onClick={() => onViewDetails(eq.id)}
                  className="relative h-48 bg-gray-50 cursor-pointer overflow-hidden flex items-center justify-center"
                >
                  <div 
                    className="absolute inset-0 bg-cover bg-center blur-md opacity-25 scale-110 pointer-events-none"
                    style={{ backgroundImage: `url(${eq.imageUrl})` }}
                  />
                  <img
                    src={eq.imageUrl}
                    alt={eq.title}
                    className="relative z-10 max-w-full max-h-full object-contain group-hover:scale-103 transition-transform duration-500"
                    referrerPolicy="no-referrer"
                    onError={(e) => {
                      e.currentTarget.src = 'https://images.unsplash.com/photo-1593113598332-cd59c5bc3f90?w=600';
                    }}
                  />
                  
                  {/* Rating Floating Tag */}
                  {eq.verified && (
                    <div className="absolute top-3 left-3 bg-white/95 backdrop-blur-xs px-2.5 py-1 rounded-full flex items-center gap-1 shadow-2xs border border-green-500/20">
                      <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
                      <span className="text-[9px] font-extrabold text-[#1b6d24] tracking-wide uppercase">
                        {t.verified}
                      </span>
                    </div>
                  )}

                  {/* Status Badge */}
                  <div className="absolute top-3 right-3">
                    <span
                      className={`px-3 py-1 rounded-full text-[10px] font-black shadow-2xs ${
                        eq.status === 'available'
                          ? 'bg-green-50 text-green-700 border border-green-100'
                          : eq.status === 'coming_soon'
                          ? 'bg-amber-50 text-amber-700 border border-amber-100'
                          : 'bg-orange-50 text-orange-700 border border-orange-100'
                      }`}
                    >
                      {eq.statusLabel}
                    </span>
                  </div>
                </div>

                {/* Info Description */}
                <div className="p-5 flex-1 flex flex-col justify-between">
                  <div onClick={() => onViewDetails(eq.id)} className="cursor-pointer">
                    <div className="flex justify-between items-start mb-1.5">
                      <h4 className="text-base font-black text-gray-800 leading-tight hover:text-[#1b6d24] transition-colors">
                        {language === 'te' ? eq.title : eq.titleEn}
                      </h4>
                      <p className="text-base font-extrabold text-[#1b6d24] whitespace-nowrap pl-2">
                        ₹{eq.price}/{language === 'te' ? eq.rateTypeLabel : (eq.rateType === 'day' ? 'day' : 'hr')}
                      </p>
                    </div>

                    {/* Star Rating & Review Count */}
                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                      <StarRating
                        rating={eq.rating || 4.8}
                        reviewCount={eq.reviewCount || 12}
                        size="sm"
                        language={language}
                      />
                    </div>

                    <div className="flex items-center gap-1 text-[11px] text-gray-400 mb-3.5 font-bold">
                      <MapPin className="w-3.5 h-3.5 text-gray-300" />
                      <span>{language === 'te' ? eq.location : eq.locationEn}</span>
                      {eq.horsepower && (
                        <>
                          <span className="mx-1">•</span>
                          <span>{eq.horsepower}</span>
                        </>
                      )}
                    </div>

                    {eq.description && (
                      <p className="text-xs text-gray-450 line-clamp-2 leading-relaxed mb-4 font-semibold">
                        {language === 'te' ? eq.description : (eq.descriptionEn || eq.description)}
                      </p>
                    )}
                  </div>

                  {/* CTA Buttons Row */}
                  <div className="pt-2 flex gap-2">
                    <button
                      onClick={() => onViewDetails(eq.id)}
                      className="flex-1 py-2.5 px-3 bg-gray-50 border border-gray-150 hover:bg-gray-100 text-gray-600 font-bold text-xs rounded-xl transition-all cursor-pointer text-center"
                      id={`btn-view-${eq.id}`}
                    >
                      {t.details}
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
                      id={`btn-chat-direct-${eq.id}`}
                      title={language === 'te' ? 'యజమానితో చాట్ చేయండి' : 'Chat with Owner'}
                    >
                      <MessageSquare className="w-4 h-4 shrink-0 text-[#1b6d24]" />
                      <span className="hidden sm:inline">{language === 'te' ? 'చాట్' : 'Chat'}</span>
                    </button>

                    {isBooked ? (
                      <button
                        disabled
                        className="py-2.5 px-4 bg-gray-100 text-gray-400 font-bold text-xs rounded-xl cursor-not-allowed flex items-center justify-center border border-gray-200"
                        id={`btn-waiting-list-${eq.id}`}
                      >
                        {t.waiting}
                      </button>
                    ) : (
                      <button
                        onClick={() => onBook(eq.id)}
                        className={`py-2.5 px-4 font-black text-xs rounded-xl flex items-center justify-center gap-1 transition-all duration-200 active:scale-95 cursor-pointer ${
                          isComingSoon
                            ? 'bg-amber-500 hover:bg-amber-600 text-white'
                            : 'bg-[#1b6d24] hover:bg-[#15541b] text-white shadow-xs'
                        }`}
                        id={`btn-book-${eq.id}`}
                      >
                        {t.book}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Dynamic local knowledge FAQ guidelines for smallholder farmers */}
        <div className="mt-10 bg-emerald-50/20 border border-emerald-100/30 rounded-[2rem] p-5">
          <div className="flex items-center gap-1.5 mb-4">
            <HelpCircle className="w-5 h-5 text-[#1b6d24]" />
            <h4 className="text-xs font-black text-gray-800 uppercase tracking-wider">{t.faqTitle}</h4>
          </div>

          <div className="space-y-4">
            <div className="bg-white p-3.5 rounded-2xl border border-gray-100/50">
              <h5 className="text-xs font-extrabold text-[#1b6d24]">{t.faq1Q}</h5>
              <p className="text-[11px] text-gray-400 font-bold mt-1.5 leading-relaxed">{t.faq1A}</p>
            </div>

            <div className="bg-white p-3.5 rounded-2xl border border-gray-100/50">
              <h5 className="text-xs font-extrabold text-[#1b6d24]">{t.faq2Q}</h5>
              <p className="text-[11px] text-gray-400 font-bold mt-1.5 leading-relaxed">{t.faq2A}</p>
            </div>
          </div>
        </div>

        {/* Cooperative Footer with Public Pages Links */}
        <footer className="mt-12 pt-6 border-t border-gray-200/80 text-center pb-6">
          <div className="flex justify-center items-center gap-1.5 mb-3 text-[#1b6d24]">
            <Leaf className="w-4.5 h-4.5 animate-bounce" />
            <span className="text-[11px] font-black uppercase tracking-widest">{language === 'te' ? 'ఈ రైతు వేదిక సహకారం' : 'E-Raitu Vedika'}</span>
          </div>
          <p className="text-[10px] text-gray-450 font-bold px-4 leading-relaxed">
            {language === 'te' 
              ? 'ఆంధ్రప్రదేశ్ సన్నకారు వ్యవసాయ ప్రగతి మరియు యంత్ర సంక్షేమ బోర్డు పరస్పర సేవా పథకం.' 
              : 'Andhra Pradesh Agricultural Mechanization & Welfare Board Initiative.'}
          </p>
          
          <div className="grid grid-cols-2 gap-x-4 gap-y-2.5 mt-6 max-w-xs mx-auto text-left text-[11px] font-bold text-gray-400">
            <button type="button" onClick={() => onOpenPublicPage && onOpenPublicPage('about')} className="hover:text-[#1b6d24] text-left cursor-pointer transition-colors duration-100">{language === 'te' ? '• మా గురించి (About Us)' : '• About Us'}</button>
            <button type="button" onClick={() => onOpenPublicPage && onOpenPublicPage('contact')} className="hover:text-[#1b6d24] text-left cursor-pointer transition-colors duration-100">{language === 'te' ? '• సంప్రదించండి (Contact)' : '• Contact Us'}</button>
            <button type="button" onClick={() => onOpenPublicPage && onOpenPublicPage('faq')} className="hover:text-[#1b6d24] text-left cursor-pointer transition-colors duration-100">{language === 'te' ? '• ప్రశ్నలు (FAQ)' : '• FAQ'}</button>
            <button type="button" onClick={() => onOpenPublicPage && onOpenPublicPage('listing')} className="hover:text-[#1b6d24] text-left cursor-pointer transition-colors duration-100">{language === 'te' ? '• షోరూమ్ (Showroom)' : '• Equipment Listing'}</button>
            <button type="button" onClick={() => onOpenPublicPage && onOpenPublicPage('help_support')} className="hover:text-[#1b6d24] text-left cursor-pointer transition-colors duration-100">{language === 'te' ? '• మద్దతు (Support)' : '• Help & Support'}</button>
            <button type="button" onClick={() => onOpenPublicPage && onOpenPublicPage('privacy')} className="hover:text-[#1b6d24] text-left cursor-pointer transition-colors duration-100">{language === 'te' ? '• గోప్యత (Privacy)' : '• Privacy Policy'}</button>
            <button type="button" onClick={() => onOpenPublicPage && onOpenPublicPage('terms')} className="hover:text-[#1b6d24] text-left cursor-pointer transition-colors duration-100">{language === 'te' ? '• నిబంధనలు (Terms)' : '• Terms & Conditions'}</button>
            <button type="button" onClick={() => onOpenPublicPage && onOpenPublicPage('search')} className="hover:text-[#1b6d24] text-left cursor-pointer transition-colors duration-100">{language === 'te' ? '• శోధన (Search)' : '• Search Results'}</button>
          </div>
          
          <p className="text-[9px] text-gray-400 font-bold mt-8 uppercase tracking-wider">
            © 2026 E-Raitu Vedika • AP Cooperative Logistics
          </p>
        </footer>

      </div>
    </div>
  );
}
