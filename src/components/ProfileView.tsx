import React, { useState } from 'react';
import { FarmerProfile, Equipment } from '../types';
import { MapPin, Phone, Trash2, ShieldCheck, Plus, Calendar, Tag, MessageSquare, ToggleLeft, ToggleRight, LogOut } from 'lucide-react';

interface ProfileViewProps {
  user: FarmerProfile;
  equipmentList: Equipment[];
  onOpenAddListing: () => void;
  onCancelBooking: (id: string) => void;
  onRemoveListing: (id: string) => void;
  onToggleListingStatus: (id: string) => void;
  onTabRedirect: (tab: 'home' | 'search' | 'messages' | 'profile') => void;
  onOpenChatWithContact: (ownerName: string, equipmentTitle: string, equipmentId: string, equipmentImage: string, ownerPhone: string, ownerAvatar: string) => void;
  language: 'te' | 'en';
  onOpenPublicPage?: (pageId: 'about' | 'contact' | 'faq' | 'listing' | 'details' | 'search' | 'privacy' | 'terms' | 'help_support') => void;
  onSignOut?: () => void;
}

export default function ProfileView({
  user,
  equipmentList,
  onOpenAddListing,
  onCancelBooking,
  onRemoveListing,
  onToggleListingStatus,
  onTabRedirect,
  onOpenChatWithContact,
  language,
  onOpenPublicPage,
  onSignOut
}: ProfileViewProps) {
  const [activeSubTab, setActiveSubTab] = useState<'bookings' | 'listings'>('bookings');

  // Filter listings and bookings
  const myListings = equipmentList.filter(eq => eq.isCustom === true);
  const myBookings = equipmentList.filter(eq => user.bookedEquipmentIds.includes(eq.id));

  const getBookingDuration = (eqId: string, rateType: 'hour' | 'day') => {
    try {
      const saved = localStorage.getItem('rv_booking_durations');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed[eqId]) return parsed[eqId];
      }
    } catch (e) {}
    return rateType === 'day' ? 3 : 4;
  };

  const getBookingLocation = (eqId: string) => {
    try {
      const saved = localStorage.getItem('rv_booking_locations');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed[eqId]) return parsed[eqId];
      }
    } catch (e) {}
    if (eqId === 'eq1') {
      return language === 'te' 
        ? 'గుంటూరు Dist | Mandal: గుంటూరు | Village: చినకాకాని | GPS: [16.3067° N, 80.4365° E]'
        : 'Guntur Dist | Mandal: Guntur | Village: Chinakakani | GPS: [16.3067° N, 80.4365° E]';
    }
    return null;
  };

  const t = {
    te: {
      member: "రైతు సభ్యుడు (Verified Farmer)",
      bookingsTab: "నా బుకింగ్స్",
      listingsTab: "నా యంత్రాలు",
      bookingsTitle: "వ్యవసాయ బుకింగ్స్",
      noBookings: "ప్రస్తుతానికి బుకింగ్స్ ఏవీ లేవు",
      noBookingsDesc: "మార్కెట్ నుండి మీ పొలానికి అవసరమైన ట్రాక్టర్లు లేదా ఇతర యంత్రాలను శోధించి బుక్ చేయండి.",
      searchBtn: "పరికరాల కోసం శోధించండి",
      chatOwner: "యజమానితో చాట్",
      cancelRent: "రద్దు చేయి",
      myListingsTitle: "అద్దెకు ఇచ్చే యంత్రాలు",
      addMachinery: "యంత్రాన్ని చేర్చు",
      noListings: "మీరు ఏ పరికరాన్ని లిస్ట్ చేయలేదు",
      noListingsDesc: "మీ వద్ద ఖాళీగా ఉన్న ట్రాక్టర్లు, స్ప్రేయర్లు ఇతర యంత్రాలను అద్దెకు ఇవ్వడం ద్వారా ఆదా చేసుకోండి.",
      createBtn: "లిస్ట్ సృష్టించండి",
      available: "అందుబాటులో ఉంది",
      booked: "బుకింగ్ చేయబడింది",
      category: "వర్గం",
      confirmed: "కన్ఫర్మ్డ్",
      rateUnitDay: "రోజు",
      rateUnitHour: "గంట"
    },
    en: {
      member: "Verified Farmer Member",
      bookingsTab: "My Bookings",
      listingsTab: "My Listings",
      bookingsTitle: "Active Bookings",
      noBookings: "No bookings registered yet",
      noBookingsDesc: "Browse the cooperative marketplace to rent high quality tractors, harvesters, or sprayer equipment.",
      searchBtn: "Search Machinery",
      chatOwner: "Chat Owner",
      cancelRent: "Cancel Rent",
      myListingsTitle: "Your Listed Vehicles",
      addMachinery: "Add Machine",
      noListings: "No equipment listed yet",
      noListingsDesc: "List spare tools, tractors or lawn tillers to earn residual revenue and support neighboring smallholders.",
      createBtn: "Create Listing",
      available: "Available",
      booked: "Booked Out",
      category: "Category",
      confirmed: "Confirmed",
      rateUnitDay: "day",
      rateUnitHour: "hour"
    }
  }[language];

  return (
    <div className="pb-24 animate-fade-in px-5 mt-4 max-w-md mx-auto md:max-w-2xl">
      {/* Profile Header Card */}
      <div className="bg-white rounded-3xl p-5 border border-gray-100 shadow-sm mb-6 flex flex-col items-center text-center relative overflow-hidden">
        {/* Decorative backdrop glow */}
        <div className="absolute top-0 left-0 right-0 h-16 bg-gradient-to-r from-[#1b6d24]/10 to-emerald-500/10"></div>
        
        {/* Avatar */}
        <div className="relative mt-2 mb-3">
          <div className="w-20 h-20 rounded-full border-4 border-white overflow-hidden shadow-md">
            <img
              src={user.avatar}
              alt={user.name}
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
          </div>
          <div className="absolute bottom-1 right-1 bg-[#1b6d24] text-white p-1 rounded-full border border-white">
            <ShieldCheck className="w-3.5 h-3.5 text-white" />
          </div>
        </div>

        {/* Name and Basic details */}
        <h2 className="text-lg font-extrabold text-gray-800 tracking-tight">{user.name}</h2>
        <p className="text-xs text-gray-400 font-bold mt-0.5 tracking-wider uppercase">{t.member}</p>

        {/* Persistent User ID Badge */}
        <div className="mt-2.5 inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 border border-emerald-200 rounded-full text-xs font-mono font-bold text-[#1b6d24] shadow-2xs" id="profile-user-id-badge">
          <span className="text-[10px] text-gray-500 uppercase tracking-wider font-sans font-bold">
            {language === 'te' ? 'రైతు ID:' : 'User ID:'}
          </span>
          <span className="font-extrabold text-emerald-800">{user.id || user.uid || user.phone}</span>
        </div>

        {/* Contact list info */}
        <div className="flex flex-wrap gap-x-4 gap-y-1.5 justify-center mt-3.5 text-xs text-gray-500 font-semibold">
          <div className="flex items-center gap-1">
            <Phone className="w-3.5 h-3.5 text-gray-400" />
            <span>{user.phone}</span>
          </div>
          <div className="flex items-center gap-1">
            <MapPin className="w-3.5 h-3.5 text-gray-400" />
            <span>{user.location}</span>
          </div>
        </div>

        {/* Sign Out Button */}
        {onSignOut && (
          <button
            onClick={onSignOut}
            className="mt-4 flex items-center justify-center gap-1.5 px-4 py-1.5 border border-red-200 text-red-600 hover:bg-red-50 rounded-full text-xs font-bold transition cursor-pointer"
            id="btn-profile-signout"
          >
            <LogOut className="w-3.5 h-3.5 text-red-600" />
            <span>{language === 'te' ? 'లాగ్ అవుట్' : 'Sign Out'}</span>
          </button>
        )}
      </div>

      {/* Stats Board */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <button
          onClick={() => setActiveSubTab('bookings')}
          className={`p-4 rounded-2xl border text-center transition-all cursor-pointer ${
            activeSubTab === 'bookings'
              ? 'bg-[#1b6d24]/5 border-[#1b6d24] text-[#1b6d24]'
              : 'bg-white border-gray-100 text-gray-500 hover:bg-gray-50'
          }`}
          id="btn-subtab-bookings"
        >
          <Calendar className="w-5 h-5 mx-auto mb-1 text-[#1b6d24]" />
          <span className="block text-xs font-bold">{t.bookingsTab}</span>
          <span className="text-lg font-extrabold">{myBookings.length}</span>
        </button>

        <button
          onClick={() => setActiveSubTab('listings')}
          className={`p-4 rounded-2xl border text-center transition-all cursor-pointer ${
            activeSubTab === 'listings'
              ? 'bg-[#1b6d24]/5 border-[#1b6d24] text-[#1b6d24]'
              : 'bg-white border-gray-100 text-gray-500 hover:bg-gray-50'
          }`}
          id="btn-subtab-listings"
        >
          <Tag className="w-5 h-5 mx-auto mb-1 text-[#1b6d24]" />
          <span className="block text-xs font-bold">{t.listingsTab}</span>
          <span className="text-lg font-extrabold">{myListings.length}</span>
        </button>
      </div>

      {/* Sub-tab content list */}
      <div>
        {activeSubTab === 'bookings' ? (
          <div>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-sm font-extrabold text-gray-800">{t.bookingsTitle} ({myBookings.length})</h3>
            </div>

            {myBookings.length === 0 ? (
              <div className="bg-white rounded-3xl p-6 py-10 text-center border border-gray-150 shadow-3xs flex flex-col items-center">
                <Calendar className="w-10 h-10 text-gray-300 mb-2" />
                <p className="text-xs font-bold text-gray-700">{t.noBookings}</p>
                <p className="text-[11px] text-gray-400 mt-1 max-w-[220px]">
                  {t.noBookingsDesc}
                </p>
                <button
                  onClick={() => onTabRedirect('search')}
                  className="mt-4 px-4 py-2 bg-[#1b6d24] text-white text-xs font-extrabold rounded-lg hover:bg-[#15541b] cursor-pointer"
                  id="profile-goto-search"
                >
                  {t.searchBtn}
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {myBookings.map((eq) => (
                  <div
                    key={eq.id}
                    className="bg-white rounded-2xl border border-gray-100 p-3.5 flex gap-3.5 shadow-3xs hover:shadow-xs transition"
                    id={`my-booking-${eq.id}`}
                  >
                    <img
                      src={eq.imageUrl}
                      alt={eq.title}
                      className="w-16 h-16 rounded-xl object-cover border border-gray-100 shrink-0"
                      referrerPolicy="no-referrer"
                    />

                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start gap-1">
                        <h4 className="font-extrabold text-xs text-gray-800 truncate">
                          {language === 'te' ? eq.title : eq.titleEn}
                        </h4>
                        <span className="text-[9px] font-bold bg-green-50 text-green-700 border border-green-100 px-2 py-0.5 rounded-full inline-block">
                          {t.confirmed}
                        </span>
                      </div>

                      <p className="text-[10px] text-[#1b6d24] font-extrabold mt-0.5">
                        ₹{eq.price}/{language === 'te' ? eq.rateTypeLabel : (eq.rateType === 'day' ? t.rateUnitDay : t.rateUnitHour)}
                      </p>

                      <div className="text-[10px] text-emerald-800 font-extrabold mt-1">
                        {language === 'te' ? 'బుకింగ్ వ్యవధి:' : 'Duration:'} {getBookingDuration(eq.id, eq.rateType)} {eq.rateType === 'day' ? (language === 'te' ? 'రోజులు' : 'days') : (language === 'te' ? 'గంటలు' : 'hours')}
                      </div>

                      {getBookingLocation(eq.id) && (
                        <div className="mt-1 p-1 px-2 bg-emerald-50 border border-emerald-100 rounded-lg text-[9px] text-[#1b6d24] font-black leading-tight">
                          📍 {language === 'te' ? 'డెలివరీ ప్రాంతం:' : 'Delivery destination:'} {getBookingLocation(eq.id)}
                        </div>
                      )}
                      
                      <div className="flex items-center gap-1 mt-1 text-[10px] text-gray-400 font-semibold">
                        <MapPin className="w-3 h-3 text-gray-300" />
                        <span>{language === 'te' ? eq.location : eq.locationEn}</span>
                      </div>

                      <div className="flex items-center gap-2 mt-3.5">
                        <button
                          onClick={() => onOpenChatWithContact(
                            eq.ownerName,
                            eq.title,
                            eq.id,
                            eq.imageUrl,
                            eq.ownerPhone,
                            eq.ownerAvatar
                          )}
                          className="flex-1 py-1.5 px-3 bg-emerald-50 text-[#1b6d24] rounded-lg text-[11px] font-bold flex items-center justify-center gap-1 hover:bg-emerald-100 transition-colors cursor-pointer"
                          id={`btn-chat-owner-${eq.id}`}
                        >
                          <MessageSquare className="w-3.5 h-3.5" />
                          <span>{t.chatOwner}</span>
                        </button>

                        <button
                          onClick={() => onCancelBooking(eq.id)}
                          className="py-1.5 px-3 border border-red-100 text-red-600 font-bold text-[11px] rounded-lg bg-red-50/10 hover:bg-red-50 cursor-pointer"
                          id={`btn-cancel-${eq.id}`}
                        >
                          {t.cancelRent}
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-sm font-extrabold text-gray-800">{t.myListingsTitle} ({myListings.length})</h3>
              
              <button
                onClick={onOpenAddListing}
                className="text-[10px] bg-[#1b6d24] text-white font-extrabold px-3 py-1.5 rounded-lg flex items-center gap-1 hover:bg-[#15541b] active:scale-95 cursor-pointer"
                id="profile-add-machinery"
              >
                <Plus className="w-3.5 h-3.5 text-white" /> <span>{t.addMachinery}</span>
              </button>
            </div>

            {myListings.length === 0 ? (
              <div className="bg-white rounded-3xl p-6 py-10 text-center border border-gray-150 shadow-3xs flex flex-col items-center">
                <Tag className="w-10 h-10 text-gray-300 mb-2" />
                <p className="text-xs font-bold text-gray-700">{t.noListings}</p>
                <p className="text-[11px] text-gray-400 mt-1 max-w-[220px]">
                  {t.noListingsDesc}
                </p>
                <button
                  onClick={onOpenAddListing}
                  className="mt-4 px-4 py-2 border border-[#1b6d24] text-[#1b6d24] text-xs font-extrabold rounded-lg hover:bg-[#1b6d24]/5 cursor-pointer"
                  id="profile-list-tool"
                >
                  {t.createBtn}
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {myListings.map((eq) => (
                  <div
                    key={eq.id}
                    className="bg-white rounded-2xl border border-gray-100 p-3.5 flex gap-3.5 shadow-3xs hover:shadow-xs transition"
                    id={`my-listing-${eq.id}`}
                  >
                    <img
                      src={eq.imageUrl}
                      alt={eq.title}
                      className="w-16 h-16 rounded-xl object-cover border border-gray-100 shrink-0"
                      referrerPolicy="no-referrer"
                    />

                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start gap-1">
                        <h4 className="font-extrabold text-xs text-gray-800 truncate">
                          {language === 'te' ? eq.title : eq.titleEn}
                        </h4>
                        
                        {/* Toggle Availability status */}
                        <button
                          onClick={() => onToggleListingStatus(eq.id)}
                          className="text-gray-400 hover:text-[#1b6d24] transition-colors cursor-pointer"
                          title="Toggle Status"
                          id={`btn-listing-status-${eq.id}`}
                        >
                          {eq.status === 'available' ? (
                            <span className="text-[9px] bg-green-50 text-green-700 font-extrabold px-1.5 py-0.5 rounded-md border border-green-100">{t.available}</span>
                          ) : (
                            <span className="text-[9px] bg-red-50 text-red-700 font-extrabold px-1.5 py-0.5 rounded-md border border-red-100">{t.booked}</span>
                          )}
                        </button>
                      </div>

                      <p className="text-[10px] text-[#1b6d24] font-extrabold mt-0.5">
                        ₹{eq.price}/{language === 'te' ? eq.rateTypeLabel : (eq.rateType === 'day' ? t.rateUnitDay : t.rateUnitHour)}
                      </p>

                      <div className="flex items-center gap-1 mt-1 text-[10px] text-gray-400 font-semibold">
                        <MapPin className="w-3 h-3 text-gray-300" />
                        <span>{language === 'te' ? eq.location : eq.locationEn}</span>
                      </div>

                      <div className="flex items-center justify-between mt-3">
                        <span className="text-[10px] text-gray-450 font-bold">
                          {t.category}: {eq.categoryLabel}
                        </span>

                        <button
                          onClick={() => onRemoveListing(eq.id)}
                          className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors border border-transparent hover:border-red-100 cursor-pointer"
                          title="Remove Listing"
                          id={`btn-delete-listing-${eq.id}`}
                        >
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Helpful Links Grid Section inside profile */}
      <div className="mt-8 pt-6 border-t border-gray-150 space-y-3">
        <h4 className="text-xs font-extrabold text-gray-800 uppercase tracking-wider pl-1">
          {language === 'te' ? 'సహాయం & సమాచార కేంద్రం' : 'Help & Cooperative Policy'}
        </h4>

        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => onOpenPublicPage && onOpenPublicPage('help_support')}
            className="flex items-center gap-2.5 p-3 bg-white hover:bg-emerald-50/20 border border-gray-100 rounded-xl text-left transition text-xs font-bold text-gray-700 cursor-pointer"
          >
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            <span>{language === 'te' ? 'మద్దతు & ఫిర్యాదు' : 'Support desk'}</span>
          </button>

          <button
            type="button"
            onClick={() => onOpenPublicPage && onOpenPublicPage('faq')}
            className="flex items-center gap-2.5 p-3 bg-white hover:bg-emerald-50/20 border border-gray-100 rounded-xl text-left transition text-xs font-bold text-gray-700 cursor-pointer"
          >
            <span className="w-2 h-2 rounded-full bg-amber-500"></span>
            <span>{language === 'te' ? 'తరచుగా అడిగే ప్రశ్నలు' : 'FAQ Accordion'}</span>
          </button>

          <button
            type="button"
            onClick={() => onOpenPublicPage && onOpenPublicPage('about')}
            className="flex items-center gap-2.5 p-3 bg-white hover:bg-emerald-50/20 border border-gray-100 rounded-xl text-left transition text-xs font-bold text-gray-700 cursor-pointer"
          >
            <span className="w-2 h-2 rounded-full bg-blue-500"></span>
            <span>{language === 'te' ? 'మా గురించి ఎవరు?' : 'About E-Raitu'}</span>
          </button>

          <button
            type="button"
            onClick={() => onOpenPublicPage && onOpenPublicPage('privacy')}
            className="flex items-center gap-2.5 p-3 bg-white hover:bg-emerald-50/20 border border-gray-100 rounded-xl text-left transition text-xs font-bold text-gray-700 cursor-pointer"
          >
            <span className="w-2 h-2 rounded-full bg-red-400"></span>
            <span>{language === 'te' ? 'గోప్యత మరియు శరతులు' : 'Privacy Rules'}</span>
          </button>
        </div>
      </div>

    </div>
  );
}
