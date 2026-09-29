import React, { useState, useEffect, useMemo } from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend
} from 'recharts';
import { 
  Plus, LayoutDashboard, Tractor, Edit2, CheckCircle2, XCircle, 
  DollarSign, TrendingUp, BarChart3, MessageSquare, Star, Calendar, 
  Settings, ArrowRight, User, MapPin, Check, ChevronRight, 
  FolderMinus, FileSpreadsheet, Trash2, Sliders, AlertTriangle, 
  Navigation, CheckCircle, ShieldCheck, Mail, Phone, Sun, CloudRain, Camera
} from 'lucide-react';
import { StarRating } from './StarRating';
import { Equipment, Chat, FarmerProfile } from '../types';
import MessagesView from './MessagesView';

interface OwnerDashboardProps {
  user: FarmerProfile;
  equipmentList: Equipment[];
  chats: Chat[];
  language: 'te' | 'en';
  updateEquipment: (newList: Equipment[]) => void;
  updateUserProfile: (newProfile: FarmerProfile) => void;
  onSendMessage: (chatId: string, text: string) => void;
  onReceiveReply: (chatId: string, text: string) => void;
  onMarkAsRead: (chatId: string) => void;
  onDeleteChat: (chatId: string) => void;
  onDeleteMessage?: (chatId: string, messageId: string, type: 'for-me' | 'for-everyone') => void;
  triggerToast: (text: string, type: 'success' | 'info' | 'error') => void;
}

interface OwnerBooking {
  id: string;
  equipmentId: string;
  equipmentTitle: string;
  equipmentTitleEn: string;
  farmerName: string;
  farmerPhone: string;
  farmerAvatar: string;
  startDate: string;
  endDate: string;
  totalCost: number;
  status: 'pending' | 'approved' | 'active' | 'completed' | 'cancelled';
  paymentStatus: 'pending' | 'escrow' | 'released';
  fuelHandover: string;
}

interface OwnerMessage {
  id: string;
  farmerName: string;
  text: string;
  time: string;
  read: boolean;
}

export default function OwnerDashboard({
  user,
  equipmentList,
  chats,
  language,
  updateEquipment,
  updateUserProfile,
  onSendMessage,
  onReceiveReply,
  onMarkAsRead,
  onDeleteChat,
  onDeleteMessage,
  triggerToast
}: OwnerDashboardProps) {

  type OwnerPageId = 
    | 'owner_home' | 'add_equipment' | 'my_equipment' | 'edit_equipment'
    | 'booking_requests' | 'booking_management' | 'earnings_dashboard' 
    | 'earnings_reports' | 'messages_chat' | 'reviews' 
    | 'availability_calendar' | 'profile_settings';

  const [activePage, setActivePage] = useState<OwnerPageId>('owner_home');
  const [selectedEditEqId, setSelectedEditEqId] = useState<string | null>(null);

  // Dynamic booking request state
  const [bookings, setBookings] = useState<OwnerBooking[]>(() => {
    const saved = localStorage.getItem('rv_owner_bookings');
    if (saved) return JSON.parse(saved);
    return [
      {
        id: 'b_req1',
        equipmentId: 'eq1',
        equipmentTitle: 'మహీంద్రా జీవో 245 DI',
        equipmentTitleEn: 'Mahindra Jivo 245 DI',
        farmerName: 'వెంకట రమణయ్య',
        farmerPhone: '+91 94901 23456',
        farmerAvatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150',
        startDate: '2026-06-12',
        endDate: '2026-06-15',
        totalCost: 3600,
        status: 'pending',
        paymentStatus: 'pending',
        fuelHandover: 'Self-filled'
      },
      {
        id: 'b_req2',
        equipmentId: 'eq3',
        equipmentTitle: 'పవర్ స్ప్రేయర్',
        equipmentTitleEn: 'Power Sprayer',
        farmerName: 'శ్రీనివాస రావు',
        farmerPhone: '+91 91827 34567',
        farmerAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
        startDate: '2026-06-11',
        endDate: '2026-06-12',
        totalCost: 1000,
        status: 'approved',
        paymentStatus: 'escrow',
        fuelHandover: 'Included'
      },
      {
        id: 'b_req3',
        equipmentId: 'eq2',
        equipmentTitle: 'కుబోటా హార్వెస్టర్',
        equipmentTitleEn: 'Kubota Harvester',
        farmerName: 'తిరుపతి రెడ్డి',
        farmerPhone: '+91 99551 88223',
        farmerAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150',
        startDate: '2026-06-02',
        endDate: '2026-06-05',
        totalCost: 22500,
        status: 'completed',
        paymentStatus: 'released',
        fuelHandover: 'Included'
      }
    ];
  });

  // Block dates logic for Availability Calendar
  const [blockedDates, setBlockedDates] = useState<string[]>(() => {
    return JSON.parse(localStorage.getItem('rv_blocked_dates') || '["2026-06-20", "2026-06-21", "2026-06-22"]');
  });

  // Inline forms state
  const [newEqTitle, setNewEqTitle] = useState('');
  const [newEqTitleEn, setNewEqTitleEn] = useState('');
  const [newEqCategory, setNewEqCategory] = useState<'tractor' | 'harvester' | 'sprayer' | 'tiller' | 'rotavator'>('tractor');
  const [newEqPrice, setNewEqPrice] = useState('1200');
  const [newEqRateType, setNewEqRateType] = useState<'day' | 'hour'>('day');
  const [newEqLocation, setNewEqLocation] = useState('గుంటూరు');
  const [newEqLocationEn, setNewEqLocationEn] = useState('Guntur District');
  const [newEqImage, setNewEqImage] = useState('https://images.unsplash.com/photo-1593113598332-cd59c5bc3f90?w=600');
  const [newEqHp, setNewEqHp] = useState('45 HP');
  const [newEqFuel, setNewEqFuel] = useState('Diesel');
  const [newEqDriver, setNewEqDriver] = useState(true);
  const [newEqDesc, setNewEqDesc] = useState('బాగా నడిచే నమ్మకమైన కండిషన్ యంత్రం.');
  const [newEqDescEn, setNewEqDescEn] = useState('Robust condition, high performance ground clearing machinery.');

  // Owner settings profile form
  const [ownerCoopSector, setOwnerCoopSector] = useState('Guntur Farmer Cooperative Group A');
  const [ownerBankName, setOwnerBankName] = useState('State Bank of India');
  const [ownerAccNo, setOwnerAccNo] = useState('30985473812');
  const [ownerIfsc, setOwnerIfsc] = useState('SBIN0001859');

  // Account Details & Places states
  const [editOwnerName, setEditOwnerName] = useState(user.name);
  const [editOwnerEmail, setEditOwnerEmail] = useState(user.email || 'owner@example.com');
  const [editOwnerDistrict, setEditOwnerDistrict] = useState(user.district || user.location || 'అనంతపురము');
  const [editOwnerMandal, setEditOwnerMandal] = useState(user.mandal || 'అనంతపురం');
  const [editOwnerVillage, setEditOwnerVillage] = useState(user.village || 'బుక్కరాయసముద్రం');
  const [editOwnerLocation, setEditOwnerLocation] = useState(user.location || 'అనంతపురం');

  // Phone Change with Email OTP State
  const [showPhoneOtpForm, setShowPhoneOtpForm] = useState(false);
  const [newPhoneInput, setNewPhoneInput] = useState('');
  const [otpEmailInput, setOtpEmailInput] = useState(user.email || 'owner@example.com');
  const [generatedPhoneOtp, setGeneratedPhoneOtp] = useState('');
  const [userEnteredPhoneOtp, setUserEnteredPhoneOtp] = useState('');
  const [phoneOtpSent, setPhoneOtpSent] = useState(false);

  useEffect(() => {
    setEditOwnerName(user.name);
    if (user.email) setEditOwnerEmail(user.email);
    if (user.district) setEditOwnerDistrict(user.district);
    if (user.mandal) setEditOwnerMandal(user.mandal);
    if (user.village) setEditOwnerVillage(user.village);
    if (user.location) setEditOwnerLocation(user.location);
    if (user.email) setOtpEmailInput(user.email);
  }, [user]);

  // Blocked Date Input state
  const [tempDateToBlock, setTempDateToBlock] = useState('');
  const [avatarInputUrl, setAvatarInputUrl] = useState('');
  const [editImageUrl, setEditImageUrl] = useState('');

  // Upgraded interactive states
  const [equipmentSearchQuery, setEquipmentSearchQuery] = useState('');
  const [equipmentFilter, setEquipmentFilter] = useState('all');
  const [calendarSelectedEqId, setCalendarSelectedEqId] = useState('all');
  const [simulatedCashOuts, setSimulatedCashOuts] = useState<number>(0);

  // Filter listings belonging to this specific user (owner) with dynamic search and status filters
  const myListings = equipmentList.filter(eq => {
    const isMine = eq.ownerPhone === user.phone || eq.isCustom;
    if (!isMine) return false;

    // Search matches either Telugu or English model name
    const q = equipmentSearchQuery.trim().toLowerCase();
    const matchesSearch = !q || 
      (eq.title || '').toLowerCase().includes(q) || 
      (eq.titleEn || '').toLowerCase().includes(q);

    // Status filter
    const matchesFilter = equipmentFilter === 'all' || eq.status === equipmentFilter;

    return matchesSearch && matchesFilter;
  });

  useEffect(() => {
    const matched = equipmentList.find(eq => eq.id === selectedEditEqId);
    if (matched) {
      setEditImageUrl(matched.imageUrl);
    }
  }, [selectedEditEqId, equipmentList]);

  useEffect(() => {
    localStorage.setItem('rv_owner_bookings', JSON.stringify(bookings));
  }, [bookings]);

  useEffect(() => {
    localStorage.setItem('rv_blocked_dates', JSON.stringify(blockedDates));
  }, [blockedDates]);

  // Handle Equipment Adding Action
  const handleOwnerAddEquipment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEqTitle.trim()) {
      triggerToast(language === 'te' ? 'కనీసం తెలుగు పేరు రాయండి.' : 'Please provide equipment name in Telugu.', 'error');
      return;
    }

    const nextId = `eq_owner_${Date.now()}`;
    const categoryLabels = {
      tractor: language === 'te' ? 'ట్రాక్టర్' : 'Tractor',
      harvester: language === 'te' ? 'కోత మిషన్' : 'Harvester',
      sprayer: language === 'te' ? 'స్ప్రేయర్' : 'Sprayer',
      tiller: language === 'te' ? 'పవర్ టిల్లర్' : 'Power Tiller',
      rotavator: language === 'te' ? 'రోటవేటర్' : 'Rotavator'
    };

    const fresh: Equipment = {
      id: nextId,
      title: newEqTitle,
      titleEn: newEqTitleEn || newEqTitle,
      category: newEqCategory,
      categoryLabel: categoryLabels[newEqCategory] || 'Machinery',
      location: newEqLocation,
      locationEn: newEqLocationEn,
      price: Number(newEqPrice) || 1000,
      rateType: newEqRateType,
      rateTypeLabel: newEqRateType === 'day' ? (language === 'te' ? 'రోజుకు' : 'Day') : (language === 'te' ? 'గంటకు' : 'Hour'),
      imageUrl: newEqImage,
      status: 'available',
      statusLabel: language === 'te' ? 'అందుబాటులో ఉంది' : 'Available',
      ownerName: user.name,
      ownerPhone: user.phone,
      ownerAvatar: user.avatar,
      verified: true,
      isCustom: true,
      horsepower: newEqHp,
      fuelType: newEqFuel,
      includesDriver: newEqDriver,
      description: newEqDesc,
      descriptionEn: newEqDescEn
    };

    const updated = [fresh, ...equipmentList];
    updateEquipment(updated);

    // Reset Form
    setNewEqTitle('');
    setNewEqTitleEn('');
    setNewEqPrice('1200');
    triggerToast(language === 'te' ? 'వ్యవసాయ పరికరం విజయవంతంగా ప్రచురించబడింది!' : 'Agritech Machinery added and published nearby!', 'success');
    setActivePage('my_equipment');
  };

  // Delete Equip
  const handleDeleteEquipment = (id: string) => {
    const updated = equipmentList.filter(eq => eq.id !== id);
    updateEquipment(updated);
    triggerToast(language === 'te' ? 'పరికరం తొలగించబడింది.' : 'Machinery deleted from collaborative pool.', 'info');
  };

  // Approve Booking Request
  const handleActionBooking = (bookingId: string, action: 'approve' | 'reject' | 'dispatch' | 'complete') => {
    const updateTargetBooking = bookings.map((b) => {
      if (b.id === bookingId) {
        let nStatus = b.status;
        let nPayment = b.paymentStatus;
        if (action === 'approve') {
          nStatus = 'approved';
          nPayment = 'escrow';
        } else if (action === 'reject') {
          nStatus = 'cancelled';
        } else if (action === 'dispatch') {
          nStatus = 'active';
        } else if (action === 'complete') {
          nStatus = 'completed';
          nPayment = 'released';
        }
        return { ...b, status: nStatus as any, paymentStatus: nPayment as any };
      }
      return b;
    });

    setBookings(updateTargetBooking);
    
    // Status side effects logic
    const matchedBook = bookings.find(b => b.id === bookingId);
    if (matchedBook && action === 'complete') {
      // Re-enable equipment as available
      const updatedEqList = equipmentList.map(eq => {
        if (eq.id === matchedBook.equipmentId) {
          return {
            ...eq,
            status: 'available' as const,
            statusLabel: language === 'te' ? 'అందుబాటులో ఉంది' : 'Available'
          };
        }
        return eq;
      });
      updateEquipment(updatedEqList);
    }

    const msgs = {
      approve: language === 'te' ? 'బుకింగ్ విజయవంతంగా ఆమోదించబడింది, రవాణా షెడ్యూల్ చెయ్యబడింది!' : 'Rental Request Approved! Escrow secured.',
      reject: language === 'te' ? 'బుకింగ్ అభ్యర్థన తిరస్కరించబడింది.' : 'Booking request declined.',
      dispatch: language === 'te' ? 'యంత్రం పొలానికి తరలించబడింది!' : 'Machinery status changed to Dispatch Active!',
      complete: language === 'te' ? 'పని పూర్తయింది. అద్దె సొమ్ము మీ ఖాతాకు బదిలీ చేయబడుతుంది.' : 'Job completed. Cooperative funds released!'
    };

    triggerToast(msgs[action], action === 'reject' ? 'info' : 'success');
  };

  // Add Calendar Date Block
  const blockDate = () => {
    if (!tempDateToBlock) return;
    if (blockedDates.includes(tempDateToBlock)) {
      triggerToast(language === 'te' ? 'తేదీ ముందే బ్లాక్ చేయబడింది.' : 'Date already blocked.', 'error');
      return;
    }
    setBlockedDates([...blockedDates, tempDateToBlock]);
    setTempDateToBlock('');
    triggerToast(language === 'te' ? 'తేదీ విజయవంతంగా బ్లాక్ చేయబడింది.' : 'Selected date marked as maintenance blocked.', 'success');
  };

  const removeBlockedDate = (date: string) => {
    setBlockedDates(blockedDates.filter(d => d !== date));
    triggerToast(language === 'te' ? 'తేదీ తిరిగి అనుమతించబడింది.' : 'Date released for rentals.', 'info');
  };

  // Compute stats
  const totalEarnings = bookings
    .filter(b => b.status === 'completed')
    .reduce((sum, b) => sum + b.totalCost, 0);

  const pendingRequestsCount = bookings.filter(b => b.status === 'pending').length;

  const [earningsChartMode, setEarningsChartMode] = useState<'revenue' | 'volume'>('revenue');

  // Compute monthly rental revenue and lease count dynamically based on localStorage bookings state
  const monthlyRevenueTrend = useMemo(() => {
    // Crop/harvest season baseline data for realistic performance visuals
    const base: { [key: string]: { month: string; monthTe: string; revenue: number; count: number } } = {
      '01': { month: 'Jan', monthTe: 'జనవరి', revenue: 12000, count: 3 },
      '02': { month: 'Feb', monthTe: 'ఫిబ్రవరి', revenue: 18000, count: 4 },
      '03': { month: 'Mar', monthTe: 'మార్చి', revenue: 9500, count: 2 },
      '04': { month: 'Apr', monthTe: 'ఏప్రిల్', revenue: 15400, count: 3 },
      '05': { month: 'May', monthTe: 'మే', revenue: 24000, count: 5 },
      '06': { month: 'Jun', monthTe: 'జూన్', revenue: 0, count: 0 },
      '07': { month: 'Jul', monthTe: 'జూలై', revenue: 0, count: 0 },
    };

    bookings.forEach(b => {
      if (!b.startDate || b.status !== 'completed') return;
      const parts = b.startDate.split('-');
      if (parts.length >= 2) {
        const monthKey = parts[1]; // "06"
        const year = parts[0];     // "2026"
        if (base[monthKey]) {
          base[monthKey].revenue += b.totalCost;
          base[monthKey].count += 1;
        } else {
          const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
          const monthNamesTe = ['జనవరి', 'ఫిబ్రవరి', 'మార్చి', 'ఏప్రిల్', 'మే', 'జూన్', 'జూలై', 'ఆగస్టు', 'సెప్టెంబరు', 'అక్టోబరు', 'నవంబరు', 'డిసెంబరు'];
          const mIdx = parseInt(monthKey, 10) - 1;
          if (mIdx >= 0 && mIdx < 12) {
            base[monthKey] = {
              month: `${monthNames[mIdx]} ${year}`,
              monthTe: `${monthNamesTe[mIdx]} ${year}`,
              revenue: b.totalCost,
              count: 1
            };
          }
        }
      }
    });

    return Object.keys(base)
      .sort()
      .map(key => ({
        month: language === 'te' ? base[key].monthTe : base[key].month,
        revenue: base[key].revenue,
        leases: base[key].count,
        name: language === 'te' ? base[key].monthTe : base[key].month
      }));
  }, [bookings, language]);

  return (
    <div id="owner-dashboard-container" className="flex flex-col md:flex-row min-h-[85vh] bg-slate-50 text-slate-800 rounded-3xl overflow-hidden shadow-xl border border-slate-200">
      
      {/* Sidenav for Owner Dashboard */}
      <aside className="w-full md:w-64 bg-slate-900 text-slate-300 flex-shrink-0 flex flex-col p-4">
         <div className="py-4 border-b border-slate-800 mb-4 flex items-center gap-3">
          {user.avatar ? (
            <img 
              src={user.avatar} 
              alt={user.name} 
              className="w-10 h-10 rounded-full object-cover border border-slate-750 flex-shrink-0" 
              referrerPolicy="no-referrer"
            />
          ) : (
            <div className="w-10 h-10 rounded-full bg-[#1b6d24] flex-shrink-0 flex items-center justify-center text-white font-black text-sm">
              🌾
            </div>
          )}
          <div className="min-w-0 flex-1">
            <h4 className="text-white text-xs font-black uppercase tracking-wider truncate" title={user.name}>
              {user.name}
            </h4>
            <p className="text-[10px] text-emerald-400 font-bold truncate">
              {language === 'te' ? 'సహకార రుణదాత' : 'Cooperative Lender'}
            </p>
          </div>
        </div>

        {/* 12 subpage links for Owner Dashboard */}
        <nav className="flex-1 space-y-1 text-left">
          {[
            { id: 'owner_home', label: 'హోమ్ డ్యాష్‌బోర్డ్', en: 'Dashboard Home', icon: LayoutDashboard },
            { id: 'add_equipment', label: 'యంత్రాల నమోదు', en: 'Add Equipment', icon: Plus },
            { id: 'my_equipment', label: 'నా యంత్రాలు', en: 'My Equipment', icon: Tractor },
            { id: 'booking_requests', label: 'బుకింగ్ అభ్యర్థనలు', en: 'Booking Requests', icon: AlertTriangle, badge: pendingRequestsCount },
            { id: 'booking_management', label: 'రవాణా నిర్వహణ', en: 'Booking Management', icon: Navigation },
            { id: 'earnings_dashboard', label: 'రాబడి ప్రణాళిక', en: 'Earnings Dashboard', icon: DollarSign },
            { id: 'earnings_reports', label: 'రాబడి నివేదికలు', en: 'Earnings Reports', icon: FileSpreadsheet },
            { id: 'messages_chat', label: 'రైతు సందేశాలు', en: 'Messages/Chat', icon: MessageSquare },
            { id: 'reviews', label: 'సమీక్షలు', en: 'Reviews & Feedback', icon: Star },
            { id: 'availability_calendar', label: 'షెడ్యూల్ క్యాలెండర్', en: 'Availability Calendar', icon: Calendar },
            { id: 'profile_settings', label: 'బ్యాంక్ & సెట్టింగ్స్', en: 'Coop Bank Settings', icon: Settings }
          ].map((item) => {
            const Icon = item.icon;
            const active = activePage === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActivePage(item.id as OwnerPageId)}
                className={`w-full flex items-center justify-between text-left px-3 py-2 rounded-xl text-[11px] font-bold tracking-wide transition-all ${
                  active 
                    ? 'bg-[#1b6d24] text-white' 
                    : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Icon className="w-3.5 h-3.5" />
                  <span>{language === 'te' ? item.label : item.en}</span>
                </div>
                {item.badge !== undefined && item.badge > 0 && (
                  <span className="bg-red-500 text-white text-[9px] px-1.5 py-0.5 rounded-full animate-bounce">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        <div className="mt-8 bg-slate-800 rounded-xl p-3 text-center border border-slate-700/60">
          <p className="text-[10px] text-slate-400 font-bold">{language === 'te' ? 'యూజర్ ID (User ID)' : 'Cooperative User ID'}</p>
          <p className="text-[11px] font-mono font-bold text-emerald-400 tracking-wider mt-0.5">{user.id || user.uid || user.phone}</p>
        </div>
      </aside>

      {/* Primary Display Pane */}
      <main className="flex-1 p-5 md:p-8 overflow-y-auto max-w-5xl mx-auto w-full">
        
        {/* SECTION 1: OWNER HOME */}
        {activePage === 'owner_home' && (
          <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between bg-gradient-to-r from-emerald-800 to-[#1b6d24] rounded-2xl p-6 text-white border border-emerald-950">
              <div className="space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-[9px] bg-emerald-900 border border-emerald-600 font-black px-2.5 py-1 rounded-full uppercase tracking-wider">
                    {language === 'te' ? 'యంత్ర యజమాని ప్రొఫైల్' : 'Cooperative Fleet Manager'}
                  </span>
                  <span className="text-[10px] text-emerald-200 font-mono font-bold bg-emerald-900/80 px-2.5 py-0.5 rounded-full border border-emerald-600/50" id="owner-hero-user-id">
                    {language === 'te' ? 'యజమాని ID' : 'Owner ID'}: {user.id || user.uid || user.phone}
                  </span>
                </div>
                <h2 className="text-xl font-black mt-2">
                  {language === 'te' ? `${user.name} రాబడి వేదిక` : `${user.name}'s Lender Hub`}
                </h2>
                <p className="text-xs text-emerald-100 max-w-sm font-medium leading-relaxed">
                  {language === 'te' ? 'మీ వ్యవసాయ పరికరాలను అద్దెకు ఇవ్వడం ద్వారా ఆశాజనకమైన అదనపు నెలవారీ ఆదాయం పొందండి.' : 'Verify incoming farmer leases, schedule dropoffs and fuel dispatches smoothly.'}
                </p>
              </div>

              <div className="mt-4 md:mt-0 text-center bg-emerald-950/60 border border-emerald-700/40 p-4 rounded-xl">
                <span className="text-[10px] text-emerald-300 font-bold uppercase">{language === 'te' ? 'మొత్తం పొందిన రాబడి' : 'TOTAL REVENUE RELEASED'}</span>
                <p className="text-2xl font-black text-emerald-400">₹{totalEarnings}</p>
                <span className="text-[8px] text-slate-300">{language === 'te' ? 'బ్యాంకుకు జమ చేయబడింది' : 'Cleared to State Bank account'}</span>
              </div>
            </div>

            {/* Metrics cards row */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white border border-slate-150 rounded-xl p-4 text-left">
                <span className="text-[9px] font-bold text-slate-400 uppercase">{language === 'te' ? 'సజీవ పరికరాలు' : 'Machinery Listed'}</span>
                <p className="text-lg font-black text-slate-800">{myListings.length}</p>
                <button onClick={() => setActivePage('my_equipment')} className="text-[9px] text-emerald-600 font-bold hover:underline block mt-1">
                  {language === 'te' ? 'లిస్టింగ్స్ చూడండి' : 'Manage List →'}
                </button>
              </div>

              <div className="bg-white border border-slate-150 rounded-xl p-4 text-left">
                <span className="text-[9px] font-bold text-slate-400 uppercase">{language === 'te' ? 'పెండింగ్ అభ్యర్థనలు' : 'Pending Approvals'}</span>
                <p className="text-lg font-black text-amber-600">{pendingRequestsCount}</p>
                <button onClick={() => setActivePage('booking_requests')} className="text-[9px] text-amber-600 font-bold hover:underline block mt-1">
                  {language === 'te' ? 'వెంటనే స్పందించండి' : 'Verify Requests →'}
                </button>
              </div>

              <div className="bg-white border border-slate-150 rounded-xl p-4 text-left">
                <span className="text-[9px] font-bold text-slate-400 uppercase">{language === 'te' ? 'పనిలో ఉన్న యంత్రాలు' : 'Active Dispatches'}</span>
                <p className="text-lg font-black text-teal-600">
                  {bookings.filter(b => b.status === 'active' || b.status === 'approved').length}
                </p>
                <button onClick={() => setActivePage('booking_management')} className="text-[9px] text-teal-600 font-bold hover:underline block mt-1">
                  {language === 'te' ? 'రూట్ ట్రాకర్' : 'Track Dispatches →'}
                </button>
              </div>

              <div className="bg-white border border-slate-150 rounded-xl p-4 text-left">
                <span className="text-[9px] font-bold text-slate-400 uppercase">{language === 'te' ? 'సగటు రేటింగ్' : 'Cooperative Rating'}</span>
                <p className="text-lg font-black text-slate-800">4.8 / 5.0</p>
                <span className="text-[8.5px] text-emerald-600 font-bold block mt-1">★ 100% Reliability</span>
              </div>
            </div>

            {/* Quick alert banner for verification */}
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-3.5 flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-xs font-bold text-amber-900">
                  {language === 'te' ? 'సహకార తనిఖీ పూర్తయింది' : 'Cooperative Safety & Physical Verification Clear'}
                </p>
                <p className="text-[10px] text-amber-700 leading-relaxed mt-0.5">
                  {language === 'te' 
                    ? 'మీ గ్యారేజ్ క్రాప్ యూనిట్లను ప్రభుత్వం వెరిఫై చేసింది. మీ యంత్రాలు గ్రీన్ బ్యాడ్జ్ తో ప్రదర్శించబడుతున్నాయి.'
                    : 'Your listing carries the Verified Badge of AP Cooperative Board. High booking exposure active.'}
                </p>
              </div>
            </div>

            {/* Upgraded Quick Action Center */}
            <div className="bg-white border border-slate-150 rounded-2xl p-5 space-y-4">
              <h3 className="text-xs font-black text-slate-700 uppercase tracking-widest flex items-center gap-1.5">
                <span>⚡</span>
                <span>{language === 'te' ? 'త్వరిత చర్యలు' : 'Lender Quick Actions'}</span>
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <button 
                  onClick={() => setActivePage('add_equipment')}
                  className="p-3 text-left bg-emerald-50 hover:bg-emerald-100 border border-emerald-100 rounded-xl transition group"
                >
                  <span className="text-lg block group-hover:scale-110 transition-transform">🚜</span>
                  <p className="text-[10.5px] font-black text-emerald-900 mt-1.5">{language === 'te' ? 'యంత్రాల నమోదు' : 'Register Machinery'}</p>
                  <p className="text-[8.5px] text-emerald-700/80 mt-0.5">{language === 'te' ? 'కొత్త దాన్ని లిస్ట్ చేయండి' : 'Publish new listing'}</p>
                </button>

                <button 
                  onClick={() => setActivePage('availability_calendar')}
                  className="p-3 text-left bg-blue-50 hover:bg-blue-100 border border-blue-100 rounded-xl transition group"
                >
                  <span className="text-lg block group-hover:scale-110 transition-transform">📅</span>
                  <p className="text-[10.5px] font-black text-blue-900 mt-1.5">{language === 'te' ? 'షెడ్యూల్ మార్చండి' : 'Schedule Blockouts'}</p>
                  <p className="text-[8.5px] text-blue-700/80 mt-0.5">{language === 'te' ? 'క్యాలెండర్ మెయింటెనెన్స్' : 'Set maintenance dates'}</p>
                </button>

                <button 
                  onClick={() => setActivePage('messages_chat')}
                  className="p-3 text-left bg-amber-50 hover:bg-amber-100 border border-amber-100 rounded-xl transition group"
                >
                  <span className="text-lg block group-hover:scale-110 transition-transform">💬</span>
                  <p className="text-[10.5px] font-black text-amber-900 mt-1.5">{language === 'te' ? 'రైతు సందేశాలు' : 'Farmer Chat Hub'}</p>
                  <p className="text-[8.5px] text-amber-700/80 mt-0.5">{language === 'te' ? 'సందేశాలు చూడండి' : 'Respond to inquiries'}</p>
                </button>

                <button 
                  onClick={() => setActivePage('profile_settings')}
                  className="p-3 text-left bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl transition group"
                >
                  <span className="text-lg block group-hover:scale-110 transition-transform">🏦</span>
                  <p className="text-[10.5px] font-black text-slate-900 mt-1.5">{language === 'te' ? 'బ్యాంక్ సెట్టింగ్స్' : 'Coop Bank Setup'}</p>
                  <p className="text-[8.5px] text-slate-600 mt-0.5">{language === 'te' ? 'ఖాతా వివరాలు' : 'Configure bank transfer'}</p>
                </button>
              </div>
            </div>

            {/* Upgraded Interactive Revenue Breakdown Card */}
            <div className="bg-white border border-slate-150 rounded-2xl p-5 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                <div>
                  <h3 className="text-xs font-black text-slate-700 uppercase tracking-widest">
                    📈 {language === 'te' ? 'కేటగిరీ వారీగా అద్దె ఆదాయం' : 'Interactive Category Lease Breakdown'}
                  </h3>
                  <p className="text-[9.5px] text-slate-400 mt-0.5">
                    {language === 'te' ? 'మీ యంత్రాల కేటగిరీల పనితీరు విశ్లేషణ' : 'Live percentage contribution index of agricultural fleet segments.'}
                  </p>
                </div>
                <div className="bg-slate-50 border border-slate-200 px-2.5 py-1 rounded-lg flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  <span className="text-[9px] font-black text-slate-600">AP-COOP Data Sync</span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                {/* Visual Circle Chart (SVG Layout with text indicators) */}
                <div className="flex items-center justify-center py-4 bg-slate-50/50 rounded-2xl border border-slate-100">
                  <div className="relative w-40 h-40 flex items-center justify-center">
                    {/* SVG ring elements */}
                    <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                      {/* Gray base ring */}
                      <circle cx="50" cy="50" r="40" fill="transparent" stroke="#f1f5f9" strokeWidth="9" />
                      {/* Tractor Segment: 60% */}
                      <circle cx="50" cy="50" r="40" fill="transparent" stroke="#1b6d24" strokeWidth="9" strokeDasharray="251.2" strokeDashoffset={251.2 * (1 - 0.60)} strokeLinecap="round" />
                      {/* Harvester Segment: 25% starting after Tractor */}
                      <circle cx="50" cy="50" r="40" fill="transparent" stroke="#0284c7" strokeWidth="9" strokeDasharray="251.2" strokeDashoffset={251.2 * (1 - 0.25)} transform="rotate(216 50 50)" strokeLinecap="round" />
                      {/* Sprayer Segment: 15% */}
                      <circle cx="50" cy="50" r="40" fill="transparent" stroke="#f59e0b" strokeWidth="9" strokeDasharray="251.2" strokeDashoffset={251.2 * (1 - 0.15)} transform="rotate(306 50 50)" strokeLinecap="round" />
                    </svg>
                    
                    {/* Centered Total Text */}
                    <div className="absolute flex flex-col items-center">
                      <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">{language === 'te' ? 'మొత్తం' : 'Total'}</span>
                      <span className="text-base font-black text-slate-800">₹{totalEarnings || 27100}</span>
                    </div>
                  </div>
                </div>

                {/* Interactive Legend with Progress bars */}
                <div className="space-y-3.5">
                  {[
                    { key: 'tractor', color: 'bg-[#1b6d24]', border: 'border-[#1b6d24]/20', label: language === 'te' ? 'ట్రాక్టర్ అద్దెలు' : 'Tractor Lease', share: '60%', amt: `₹${Math.round((totalEarnings || 27100) * 0.60)}` },
                    { key: 'harvester', color: 'bg-sky-600', border: 'border-sky-200', label: language === 'te' ? 'కోత యంత్ర అద్దెలు' : 'Harvester Lease', share: '25%', amt: `₹${Math.round((totalEarnings || 27100) * 0.25)}` },
                    { key: 'sprayer', color: 'bg-amber-500', border: 'border-amber-200', label: language === 'te' ? 'స్ప్రేయర్లు & ఇతరాలు' : 'Sprayers & Others', share: '15%', amt: `₹${Math.round((totalEarnings || 27100) * 0.15)}` }
                  ].map((item) => (
                    <div key={item.key} className="p-2.5 bg-slate-50 hover:bg-slate-100 rounded-xl border border-slate-100 transition">
                      <div className="flex justify-between text-[10px] font-bold">
                        <div className="flex items-center gap-2">
                          <span className={`w-2.5 h-2.5 rounded-full ${item.color}`}></span>
                          <span className="text-slate-700">{item.label}</span>
                        </div>
                        <span className="text-slate-900 font-mono">{item.share} ({item.amt})</span>
                      </div>
                      <div className="w-full bg-slate-200 h-1.5 rounded-full mt-2 overflow-hidden">
                        <div className={`h-full ${item.color}`} style={{ width: item.share }}></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Recent Pending handshakes checklist */}
            <div className="bg-white border border-slate-150 rounded-xl p-5">
              <h3 className="text-xs font-black text-slate-700 uppercase tracking-wider mb-3">
                {language === 'te' ? 'ఇటీవలి అద్దె అభ్యర్థనలు' : 'Recent Farmer Booking Handshakes'}
              </h3>

              <div className="space-y-3">
                {bookings.filter(b => b.status === 'pending').map((b) => (
                  <div key={b.id} className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <img src={b.farmerAvatar} alt={b.farmerName} className="w-9 h-9 rounded-full object-cover" />
                      <div>
                        <h4 className="text-xs font-black text-slate-800">{b.farmerName}</h4>
                        <p className="text-[10px] text-slate-450">
                          {b.farmerPhone} • {language === 'te' ? `పరికరం: ${b.equipmentTitle}` : `Equipment: ${b.equipmentTitleEn}`}
                        </p>
                        <p className="text-[9.5px] text-[#1b6d24] font-semibold mt-1">
                          📍 {language === 'te' ? 'డెలివరీ ప్రదేశం:' : 'Delivery:'} {b.deliveryLocation || (language === 'te' ? 'గుంటూరు (Guntur)' : 'Guntur (Guntur)')}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-[9.5px] text-slate-400 font-bold block">₹{b.totalCost} total</span>
                      <span className="text-[8px] bg-amber-50 text-amber-700 border border-amber-200 rounded px-1.5 font-bold uppercase">{b.status}</span>
                    </div>
                    <div className="flex gap-1.5">
                      <button onClick={() => handleActionBooking(b.id, 'approve')} className="bg-[#1b6d24] text-white text-[10px] font-bold px-2.5 py-1.5 rounded-lg hover:bg-emerald-800">
                        {language === 'te' ? 'ఆమోదించు' : 'Approve'}
                      </button>
                      <button onClick={() => handleActionBooking(b.id, 'reject')} className="bg-red-50 text-red-650 text-[10px] font-bold px-2.5 py-1.5 rounded-lg hover:bg-red-100">
                        {language === 'te' ? 'తిరస్కరించు' : 'Reject'}
                      </button>
                    </div>
                  </div>
                ))}
                {bookings.filter(b => b.status === 'pending').length === 0 && (
                  <p className="text-[11px] text-slate-455 text-center py-4 italic">
                    {language === 'te' ? 'ప్రస్తుతం కొత్త పెండింగ్ బుకింగ్స్ లేవు.' : 'No pending approvals at the moment.'}
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* SECTION 2: ADD EQUIPMENT */}
        {activePage === 'add_equipment' && (
          <div className="bg-white border border-slate-150 rounded-xl p-5 md:p-8">
            <h2 className="text-xs font-black text-slate-400 uppercase tracking-widest">{language === 'te' ? 'నూతన యంత్రాంగ నమోదు' : 'Cooperative Equipment Registry Form'}</h2>
            <p className="text-xs text-slate-400 mt-1">{language === 'te' ? 'సహకార భాగస్వామ్యం కోసం మీ వద్ద ఖాళీగా ఉన్న బుల్డోజర్, ట్రాక్టర్, లేదా స్ప్రేయర్లను ఇక్కడ నమోదు చేయండి.' : 'Fill specifications to make your agricultural machinery findable in the farming catalog.'}</p>

            <form onSubmit={handleOwnerAddEquipment} className="mt-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] text-slate-450 font-bold block mb-1">{language === 'te' ? 'పరికరం పేరు (తెలుగు)' : 'Title / Model Name (Telugu)'}</label>
                  <input type="text" required value={newEqTitle} onChange={(e) => setNewEqTitle(e.target.value)} placeholder="ఉదా: మహీంద్రా పవర్ హార్వెస్ట్ 2026" className="w-full text-xs font-bold bg-slate-50 border border-slate-150 rounded-xl py-2 px-3 focus:outline-none focus:ring-1 focus:ring-[#1b6d24]" />
                </div>
                <div>
                  <label className="text-[10px] text-slate-455 font-bold block mb-1">{language === 'te' ? 'పరికరం పేరు (English)' : 'Title / Model Name (English)'}</label>
                  <input type="text" required value={newEqTitleEn} onChange={(e) => setNewEqTitleEn(e.target.value)} placeholder="e.g. Mahindra Turbo Harvester 2026" className="w-full text-xs font-bold bg-slate-50 border border-slate-150 rounded-xl py-2 px-3 focus:outline-none focus:ring-1 focus:ring-[#1b6d24]" />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="text-[10px] text-slate-455 font-bold block mb-1">{language === 'te' ? 'యంత్రం రకం' : 'Machinery Category'}</label>
                  <select value={newEqCategory} onChange={(e: any) => setNewEqCategory(e.target.value)} className="w-full text-xs font-bold bg-slate-50 border border-slate-150 rounded-xl py-2 px-3">
                    <option value="tractor">{language === 'te' ? 'ట్రాక్టర్' : 'Tractor'}</option>
                    <option value="harvester">{language === 'te' ? 'హార్వెస్టర్ (కోత యంత్రం)' : 'Harvester'}</option>
                    <option value="sprayer">{language === 'te' ? 'పవర్ స్ప్రేయర్' : 'Chemical Sprayer'}</option>
                    <option value="tiller">{language === 'te' ? 'పవర్ టిల్లర్' : 'Power Tiller'}</option>
                    <option value="rotavator">{language === 'te' ? 'రోటవేటర్' : 'Rotavator'}</option>
                  </select>
                </div>
                <div>
                  <label className="text-[10px] text-slate-455 font-bold block mb-1">{language === 'te' ? 'ధర (రూపాయలు)' : 'Asking Rental Price (₹)'}</label>
                  <input type="number" required value={newEqPrice} onChange={(e) => setNewEqPrice(e.target.value)} className="w-full text-xs font-bold bg-slate-50 border border-slate-150 rounded-xl py-2 px-3" />
                </div>
                <div>
                  <label className="text-[10px] text-slate-455 font-bold block mb-1">{language === 'te' ? 'ధర పరిధి రకం' : 'Rate Basis'}</label>
                  <select value={newEqRateType} onChange={(e: any) => setNewEqRateType(e.target.value)} className="w-full text-xs font-bold bg-slate-50 border border-slate-150 rounded-xl py-2 px-3">
                    <option value="day">{language === 'te' ? 'రోజుకు (Per Day)' : 'Per Day'}</option>
                    <option value="hour">{language === 'te' ? 'గంటకు (Per Hour)' : 'Per Hour'}</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="text-[10px] text-slate-455 font-bold block mb-1">{language === 'te' ? 'పవర్ (HP)' : 'Engine Output (HP)'}</label>
                  <input type="text" value={newEqHp} onChange={(e) => setNewEqHp(e.target.value)} placeholder="e.g. 45 HP" className="w-full text-xs font-bold bg-slate-50 border border-slate-150 rounded-xl py-2 px-3" />
                </div>
                <div>
                  <label className="text-[10px] text-slate-455 font-bold block mb-1">{language === 'te' ? 'ఇంధనం' : 'Fuel System'}</label>
                  <input type="text" value={newEqFuel} onChange={(e) => setNewEqFuel(e.target.value)} placeholder="e.g. Diesel / Petrol" className="w-full text-xs font-bold bg-slate-50 border border-slate-150 rounded-xl py-2 px-3" />
                </div>
                <div className="flex items-center mt-6">
                  <input type="checkbox" id="driver-included" checked={newEqDriver} onChange={(e) => setNewEqDriver(e.target.checked)} className="accent-[#1b6d24] w-4 h-4 mr-2" />
                  <label htmlFor="driver-included" className="text-[10px] text-slate-700 font-bold uppercase">{language === 'te' ? 'డ్రైవర్ సేవ చేర్చబడింది' : 'Includes Coop Operator/Driver'}</label>
                </div>
              </div>

              {/* Enhanced Interactive Custom Image Loader with Live Preview */}
              <div className="bg-slate-50/75 p-4 rounded-2xl border border-slate-150/60 space-y-3.5">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-[#1b6d24] font-black uppercase tracking-wider block">
                    📷 {language === 'te' ? 'యంత్రం ఫోటో & లైవ్ ప్రివ్యూ' : 'Machinery Photo & Live Preview'}
                  </span>
                  <span className="text-[9.5px] text-slate-400 font-extrabold">
                    {language === 'te' ? 'కస్టమ్ లింక్ లేదా ప్రెసెంట్స్' : 'Supports Direct Internet Links'}
                  </span>
                </div>

                <div className="flex flex-col sm:flex-row gap-4">
                  {/* Live Card Image Preview Box */}
                  <div className="relative w-full sm:w-28 h-28 rounded-xl bg-slate-150 overflow-hidden shrink-0 border border-slate-200/80 shadow-3xs flex items-center justify-center">
                    <img 
                      src={newEqImage || 'https://images.unsplash.com/photo-1593113598332-cd59c5bc3f90?w=600'} 
                      alt="Equipment Custom Preview" 
                      className="w-full h-full object-cover transition-all"
                      onError={(e) => {
                        // Safe failure fallback handling if custom URL fails to load
                        e.currentTarget.src = 'https://images.unsplash.com/photo-1593113598332-cd59c5bc3f90?w=600';
                      }}
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute bottom-1 right-1 bg-black/60 text-[8.5px] font-black text-white px-1.5 py-0.5 rounded-md backdrop-blur-3xs tracking-wider uppercase">
                      Preview
                    </div>
                  </div>

                  {/* Input and Instruction description */}
                  <div className="flex-1 space-y-2 text-left">
                    <div className="flex items-center justify-between">
                      <label className="text-[9.5px] text-slate-500 font-extrabold uppercase tracking-wide block">
                        {language === 'te' ? '🔗 ఇంటర్నెట్ ఫోటో లింక్ లేదా డివైజ్ ఫైల్ పంపండి:' : '🔗 Paste Image Link or Choose Device File:'}
                      </label>
                      <label htmlFor="owner-eq-file-input" className="cursor-pointer bg-[#1b6d24] text-white text-[9.5px] font-extrabold px-2.5 py-1 rounded-lg flex items-center gap-1 hover:bg-emerald-800 transition">
                        <span>📁 {language === 'te' ? 'ఫైల్ ఎంచుకోండి' : 'Upload File'}</span>
                        <input 
                          type="file" 
                          id="owner-eq-file-input" 
                          accept="image/*" 
                          className="hidden" 
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              const reader = new FileReader();
                              reader.onload = (event) => {
                                if (event.target?.result) {
                                  setNewEqImage(event.target.result as string);
                                  triggerToast(language === 'te' ? 'ఫోటో అప్‌లోడ్ చేయబడింది!' : 'Device photo uploaded!', 'success');
                                }
                              };
                              reader.readAsDataURL(file);
                            }
                          }} 
                        />
                      </label>
                    </div>
                    <input 
                      type="url" 
                      value={newEqImage} 
                      onChange={(e) => setNewEqImage(e.target.value)} 
                      placeholder="e.g. https://images.unsplash.com/photo-... or custom photo URL"
                      className="w-full text-xs font-black bg-white border border-slate-200 rounded-xl py-2 px-3 focus:outline-none focus:border-[#1b6d24] text-slate-800" 
                    />
                    <p className="text-[9px] text-slate-400 font-medium leading-relaxed">
                      {language === 'te' 
                        ? 'చిట్కా: మీ ఫోన్ నుండి నేరుగా ఫోటో ఫైల్ అప్‌లోడ్ చేయవచ్చు లేదా ఇంటర్నెట్ ఫోటో లింక్‌ను ఇక్కడ పేస్ట్ చేయవచ్చు!' 
                        : 'Tip: You can upload an image directly from your device file manager, or paste any direct web image URL!'}
                    </p>
                  </div>
                </div>

                {/* Quick select gorgeous presets clickable chips */}
                <div className="pt-2.5 border-t border-slate-200/50">
                  <span className="text-[9px] text-slate-450 font-black block mb-1.5 uppercase tracking-wide text-left">
                    ⚡ {language === 'te' ? 'త్వరిత ఎంపిక కోసం అందమైన వ్యవసాయ ఫోటోలు (Click to Quick-Fill):' : 'Click to instantly apply dynamic sample presets:'}
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {[
                      { key: 'tractor', text: language === 'te' ? 'ట్రాక్టర్' : 'Modern Tractor', url: 'https://images.unsplash.com/photo-1593113598332-cd59c5bc3f90?w=600' },
                      { key: 'harvester', text: language === 'te' ? 'హార్వెస్టర్' : 'Combine Harvester', url: 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=600' },
                      { key: 'sprayer', text: language === 'te' ? 'స్ప్రేయర్' : 'Drone Sprayer', url: 'https://images.unsplash.com/photo-1624561172888-ac93c696e10c?w=600' },
                      { key: 'tiller', text: language === 'te' ? 'టిల్లర్' : 'Power Tiller', url: 'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?w=600' },
                      { key: 'rotavator', text: language === 'te' ? 'రోటవేటర్' : 'Field Rotavator', url: 'https://images.unsplash.com/photo-1592982537447-7440770cbfc9?w=600' }
                    ].map((preset) => (
                      <button
                        key={preset.key}
                        type="button"
                        onClick={() => {
                          setNewEqImage(preset.url);
                          triggerToast(language === 'te' ? `${preset.text} ఫోటో ఎంచుకోబడింది` : `Applied ${preset.text} photo preset!`, 'info');
                        }}
                        className={`text-[9.5px] font-bold px-2.5 py-1 rounded-full border transition cursor-pointer flex items-center gap-1 ${
                          newEqImage === preset.url 
                            ? 'bg-[#1b6d24]/10 border-[#1b6d24] text-[#1b6d24] font-extrabold'
                            : 'bg-white border-slate-200 hover:border-slate-350 text-slate-600'
                        }`}
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-[#1b6d24]"></span>
                        <span>{preset.text}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] text-slate-455 font-bold block mb-1">{language === 'te' ? 'వివరణ లేదా స్పెసిఫికేషన్లు (తెలుగు)' : 'Detailed Description (Telugu)'}</label>
                  <textarea rows={3} value={newEqDesc} onChange={(e) => setNewEqDesc(e.target.value)} className="w-full text-xs font-bold bg-slate-50 border border-slate-150 rounded-xl p-3" />
                </div>
                <div>
                  <label className="text-[10px] text-slate-455 font-bold block mb-1">{language === 'te' ? 'Detailed Description (English)' : 'Detailed Description (English)'}</label>
                  <textarea rows={3} value={newEqDescEn} onChange={(e) => setNewEqDescEn(e.target.value)} className="w-full text-xs font-bold bg-slate-50 border border-slate-150 rounded-xl p-3" />
                </div>
              </div>

              <button type="submit" className="w-full py-3 bg-[#1b6d24] text-white text-xs font-black uppercase rounded-xl hover:bg-emerald-800 transition shadow">
                {language === 'te' ? 'సమర్పించండి & రిజిస్టర్ చేయండి' : 'Publish & List Machinery Now'}
              </button>
            </form>
          </div>
        )}

        {/* SECTION 3: MY EQUIPMENT */}
        {activePage === 'my_equipment' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xs font-black text-slate-700 uppercase tracking-widest">{language === 'te' ? 'మీరు అద్దెకు ఉంచిన వ్యవసాయ యంత్రాలు' : 'Your Cooperative Rental Catalog'}</h3>
                <p className="text-[10px] text-slate-400 mt-0.5">{language === 'te' ? 'మీరు అప్లోడ్ చేసిన మొత్తం యంత్రాల స్థితి గమనించండి.' : 'Track live active listings, edit rates, and cancel profiles.'}</p>
              </div>
              <button onClick={() => setActivePage('add_equipment')} className="bg-[#1b6d24] text-white text-[10px] font-black px-3 py-2 rounded-xl flex items-center gap-1">
                <Plus className="w-3.5 h-3.5" />
                <span>{language === 'te' ? 'కొత్తది చేర్చండి' : 'Add Listing'}</span>
              </button>
            </div>

            {/* Upgraded Search and Status Filters */}
            <div className="bg-white border border-slate-150 rounded-2xl p-4 flex flex-col md:flex-row gap-3 justify-between items-center">
              <div className="relative w-full md:w-80">
                <input
                  type="text"
                  placeholder={language === 'te' ? 'యంత్రాన్ని వెతకండి (ఉదా: మహీంద్రా)...' : 'Search machinery model name...'}
                  value={equipmentSearchQuery}
                  onChange={(e) => setEquipmentSearchQuery(e.target.value)}
                  className="w-full text-xs font-bold bg-slate-50 border border-slate-150 rounded-xl py-2.5 px-3.5 focus:outline-none focus:ring-1 focus:ring-[#1b6d24] text-slate-800"
                />
              </div>
              <div className="flex gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
                {[
                  { id: 'all', label: 'అన్నీ', en: 'All' },
                  { id: 'available', label: 'అందుబాటులో ఉంది', en: 'Available' },
                  { id: 'booked', label: 'బుక్ అయింది', en: 'Booked' }
                ].map((f) => (
                  <button
                    key={f.id}
                    onClick={() => setEquipmentFilter(f.id)}
                    className={`text-[10.5px] font-black px-4 py-2 rounded-xl transition whitespace-nowrap cursor-pointer ${
                      equipmentFilter === f.id
                        ? 'bg-[#1b6d24] text-white'
                        : 'bg-slate-50 text-slate-600 border border-slate-150 hover:bg-slate-100'
                    }`}
                  >
                    {language === 'te' ? f.label : f.en}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {myListings.map((item) => (
                <div key={item.id} className="bg-white border border-slate-150 rounded-2.5xl overflow-hidden shadow-xs hover:shadow-md transition">
                  <img src={item.imageUrl} alt={item.title} className="w-full h-36 object-cover" />
                  <div className="p-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[8.5px] font-black bg-emerald-50 text-[#1b6d24] border border-emerald-100 rounded px-1.5 uppercase">
                        {language === 'te' ? item.categoryLabel : item.category.toUpperCase()}
                      </span>
                      <span className={`text-[8.5px] font-black px-2 py-0.5 rounded-full ${
                        item.status === 'available' ? 'bg-green-100 text-green-700' : 'bg-amber-105 bg-amber-50 text-amber-700'
                      }`}>
                        {language === 'te' ? item.statusLabel : item.status.toUpperCase()}
                      </span>
                    </div>

                    <h4 className="text-xs font-extrabold text-slate-800">
                      {language === 'te' ? item.title : (item.titleEn || item.title)}
                    </h4>

                    <div className="pt-0.5">
                      <StarRating
                        rating={item.rating || 4.8}
                        reviewCount={item.reviewCount || 10}
                        size="sm"
                        language={language}
                      />
                    </div>

                    <div className="flex items-center justify-between gap-2">
                      <p className="text-[10px] text-slate-450 font-bold">
                        Rate: ₹{item.price} / {language === 'te' ? item.rateTypeLabel : item.rateType}
                      </p>
                      
                      {/* Inline Status Toggle Switch/Button */}
                      <button 
                        onClick={() => {
                          const updated = equipmentList.map(eq => {
                            if (eq.id === item.id) {
                              const newStat: 'available' | 'booked' | 'coming_soon' = eq.status === 'available' ? 'booked' : 'available';
                              return {
                                ...eq,
                                status: newStat,
                                statusLabel: newStat === 'available' ? (language === 'te' ? 'అందుబాటులో ఉంది' : 'Available') : (language === 'te' ? 'బుక్ అయింది' : 'Booked')
                              };
                            }
                            return eq;
                          });
                          updateEquipment(updated);
                          triggerToast(language === 'te' ? 'యంత్రం స్థితి మార్చబడింది!' : 'Availability toggled successfully!', 'success');
                        }}
                        className={`text-[9px] font-black px-2 py-1 rounded-md border transition cursor-pointer ${
                          item.status === 'available'
                            ? 'bg-red-50 text-red-700 border-red-200 hover:bg-red-100'
                            : 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                        }`}
                      >
                        {item.status === 'available' 
                          ? (language === 'te' ? '🔴 బిజీ చేయి' : '🔴 Block')
                          : (language === 'te' ? '🟢 ఖాళీ చేయి' : '🟢 Free')}
                      </button>
                    </div>

                    <div className="border-t border-slate-100 pt-3 flex items-center justify-between">
                      <button onClick={() => { setSelectedEditEqId(item.id); setActivePage('edit_equipment'); }} className="text-[#1b6d24] text-[10.5px] font-bold hover:underline flex items-center gap-0.5">
                        <Edit2 className="w-3 h-3" />
                        <span>{language === 'te' ? 'ధర సవరణ' : 'Edit Rate'}</span>
                      </button>

                      <button onClick={() => handleDeleteEquipment(item.id)} className="text-red-600 text-[10px] font-bold hover:underline flex items-center gap-0.5">
                        <Trash2 className="w-3 h-3" />
                        <span>{language === 'te' ? 'తొలగించు' : 'Remove'}</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
              {myListings.length === 0 && (
                <div className="col-span-3 text-center py-10 bg-white border border-dashed border-slate-200 rounded-3xl">
                  <FolderMinus className="w-10 h-10 text-slate-300 mx-auto" />
                  <p className="text-xs text-slate-400 mt-2 italic">
                    {language === 'te' ? 'మీరు ఇంకా ఎటువంటి అద్దె యంత్రాలను నమోదు చేయలేదు.' : 'No machinery of yours registered in the database yet.'}
                  </p>
                  <button onClick={() => setActivePage('add_equipment')} className="mt-3 bg-[#1b6d24] text-white text-[10px] font-black px-4 py-2 rounded-xl">
                    {language === 'te' ? 'తొలి యంత్రాన్ని చేర్చండి' : 'Add First Machinery'}
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* SECTION 4: EDIT EQUIPMENT */}
        {activePage === 'edit_equipment' && (
          <div className="bg-white border border-slate-150 rounded-xl p-5 md:p-8">
            <h3 className="text-xs font-black text-slate-700 uppercase tracking-widest mb-3">
              {language === 'te' ? 'పరికరం రేట్ మరియు వివరాల సవరణ' : 'Edit Machinery Lease Rate Specifications'}
            </h3>

            {(() => {
              const matched = equipmentList.find(eq => eq.id === selectedEditEqId);
              if (!matched) return <p className="text-xs text-slate-400">Please select an item from catalog first.</p>;
              return (
                <div className="space-y-4">
                  <div className="p-3 bg-emerald-50 border border-emerald-100 rounded-xl flex items-center gap-3">
                    <img 
                      src={editImageUrl || matched.imageUrl} 
                      alt={matched.title} 
                      className="w-12 h-12 rounded-lg object-cover" 
                      onError={(e) => {
                        e.currentTarget.src = 'https://images.unsplash.com/photo-1593113598332-cd59c5bc3f90?w=600';
                      }}
                      referrerPolicy="no-referrer"
                    />
                    <div>
                      <p className="text-xs font-black text-slate-700">{language === 'te' ? matched.title : matched.titleEn}</p>
                      <p className="text-[10px] text-emerald-800">Current Price: ₹{matched.price} / {matched.rateType}</p>
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] text-slate-450 font-bold block mb-1">{language === 'te' ? 'యంత్రం ఫోటో లింక్ (Image URL)' : 'Edit Image URL / Photo Link'}</label>
                    <input 
                      type="url" 
                      value={editImageUrl} 
                      onChange={(e) => setEditImageUrl(e.target.value)}
                      id="edit-image-input"
                      className="w-full text-xs font-bold bg-slate-50 border border-slate-150 rounded-xl py-2 px-3 focus:outline-none focus:border-[#1b6d24]" 
                    />
                    <p className="text-[8.5px] text-slate-400 mt-1">
                      {language === 'te' ? 'చిట్కా: మీ చిత్రం లైవ్‌గా సరిపోయేలా ఇంటర్నెట్ ఫోటో లింక్‌ను ఇక్కడ పేస్ట్ చేయండి.' : 'Tip: Paste any valid web URL to change this equipment\'s main image. Invalid/broken urls will automatically fall back to standard placeholders.'}
                    </p>
                  </div>

                  <div>
                    <label className="text-[10px] text-slate-450 font-bold block mb-1">{language === 'te' ? 'నూతన ధర ప్రతిపాదన (రూపాయలు)' : 'New Rent Capacity Price (₹)'}</label>
                    <input 
                      type="number" 
                      defaultValue={matched.price} 
                      id="edit-price-input"
                      className="w-full text-xs font-bold bg-slate-50 border border-slate-150 rounded-xl py-2 px-3" 
                    />
                  </div>

                  <div>
                    <label className="text-[10px] text-slate-455 font-bold block mb-1">{language === 'te' ? 'లభ్యత సమయం' : 'Block out / Status Update'}</label>
                    <select id="edit-status-select" defaultValue={matched.status} className="w-full text-xs font-bold bg-slate-50 border border-slate-150 rounded-xl py-2 px-3">
                      <option value="available">Available</option>
                      <option value="booked">Booked (Reserved)</option>
                      <option value="coming_soon">Coming Soon (Under Maintenance)</option>
                    </select>
                  </div>

                  <div className="flex gap-2.5 pt-3">
                    <button 
                      onClick={() => {
                        const priceV = (document.getElementById('edit-price-input') as HTMLInputElement)?.value;
                        const statusV = (document.getElementById('edit-status-select') as HTMLSelectElement)?.value;
                        
                        const updated = equipmentList.map(eq => {
                          if (eq.id === matched.id) {
                            return {
                              ...eq,
                              price: Number(priceV) || eq.price,
                              imageUrl: editImageUrl || eq.imageUrl,
                              status: statusV as any,
                              statusLabel: statusV === 'available' ? 'Available' : 'Booked'
                            };
                          }
                          return eq;
                        });
                        updateEquipment(updated);
                        triggerToast(language === 'te' ? 'మార్పులు విజయవంతంగా భద్రపరచబడ్డాయి!' : 'Rates & specs synchronized successfully!', 'success');
                        setActivePage('my_equipment');
                      }}
                      className="bg-[#1b6d24] text-white text-xs font-bold px-4 py-2 rounded-xl cursor-pointer"
                    >
                      {language === 'te' ? 'సేవ్ చెయ్యి' : 'Save Changes'}
                    </button>
                    <button onClick={() => setActivePage('my_equipment')} className="bg-slate-100 text-slate-655 text-xs font-bold px-4 py-2 rounded-xl cursor-pointer">
                      {language === 'te' ? 'రద్దు' : 'Cancel'}
                    </button>
                  </div>
                </div>
              );
            })()}
          </div>
        )}

        {/* SECTION 5: BOOKING REQUESTS */}
        {activePage === 'booking_requests' && (
          <div className="space-y-4">
            <h3 className="text-xs font-black text-slate-700 uppercase tracking-widest">{language === 'te' ? 'రాబోయే బుకింగ్ అభ్యర్థనలు' : 'Pending Farmer Rental Handshakes'}</h3>
            <p className="text-[10px] text-slate-400">{language === 'te' ? 'మీ పరికరాలను అద్దెకు కోరిన రైతుల వివరాలు సరిచూసి నిర్ణయం తీసుకోండి.' : 'Accepting blocks funds in escrow. We recommend picking up driver coordination as soon as confirmed.'}</p>

            <div className="space-y-3 mt-4">
              {bookings.filter(b => b.status === 'pending').map((b) => (
                <div key={b.id} className="bg-white border border-slate-150 rounded-2xl p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <img src={b.farmerAvatar} alt={b.farmerName} className="w-12 h-12 rounded-full object-cover" />
                    <div>
                      <h4 className="text-xs font-black text-slate-850">{b.farmerName}</h4>
                      <p className="text-[10px] text-[#1b6d24] font-bold">
                        {language === 'te' ? `వలసిన పరికరం: ${b.equipmentTitle}` : `For Equipment: ${b.equipmentTitleEn}`}
                      </p>
                      <p className="text-[9.5px] text-slate-400 mt-1">
                        Scheduled: {b.startDate} to {b.endDate}
                      </p>
                      <p className="text-[10px] text-[#1b6d24] font-black mt-1 bg-emerald-50/50 py-0.5 px-2 rounded-lg border border-emerald-100/30 w-fit">
                        📍 {language === 'te' ? 'డెలివరీ ప్రదేశం:' : 'Delivery Location:'} {b.deliveryLocation || (language === 'te' ? 'గుంటూరు Dist | Mandal: గుంటూరు | Village: చినకాకాని' : 'Guntur Dist | Mandal: Guntur | Village: Chinakakani')}
                      </p>
                    </div>
                  </div>

                  <div className="bg-slate-50 border border-slate-100 p-2.5 rounded-xl text-center md:text-right">
                    <span className="text-[9px] text-slate-400 block uppercase font-bold">{language === 'te' ? 'మొత్తం ప్రయోజనం' : 'Cooperative Quote'}</span>
                    <span className="text-sm font-black text-slate-800 font-mono">₹{b.totalCost}</span>
                  </div>

                  <div className="flex gap-2.5 self-stretch md:self-auto">
                    <button 
                      onClick={() => handleActionBooking(b.id, 'approve')}
                      className="flex-1 md:flex-none py-2 px-4 bg-[#1b6d24] text-white text-[11px] font-black rounded-xl cursor-pointer hover:bg-emerald-800"
                    >
                      {language === 'te' ? 'ఆమోదించు' : 'Approve Lease'}
                    </button>
                    <button 
                      onClick={() => handleActionBooking(b.id, 'reject')}
                      className="flex-1 md:flex-none py-2 px-4 bg-red-50 text-red-650 text-[11px] font-black rounded-xl cursor-pointer hover:bg-red-100"
                    >
                      {language === 'te' ? 'తిరస్కరించు' : 'Reject'}
                    </button>
                  </div>
                </div>
              ))}
              {bookings.filter(b => b.status === 'pending').length === 0 && (
                <p className="text-xs italic text-slate-405 text-center py-10 bg-white rounded-2xl">
                  {language === 'te' ? 'ఎటువంటి కొత్త పెండింగ్ అభ్యర్థనలు లేవు.' : 'No pending handshake approvals.'}
                </p>
              )}
            </div>
          </div>
        )}
        {activePage === 'booking_management' && (
          <div className="space-y-6">
            <h3 className="text-xs font-black text-slate-700 uppercase tracking-widest">
              {language === 'te' ? 'రవాణా క్రమశిక్షణ & ట్రాకర్ విశ్లేషణ' : 'Dispatch Tracker & Performance Analytics'}
            </h3>
            
            {/* Live Recharts Monthly Rental Revenue & Volume Analytics Section */}
            <div className="bg-white border border-slate-150 rounded-2xl p-5 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2">
                <div>
                  <h4 className="text-xs font-black text-slate-700 uppercase tracking-widest flex items-center gap-1.5">
                    <span>📊</span>
                    <span>{language === 'te' ? 'నెలవారీ రాబడి విశ్లేషణ (లైవ్)' : 'Live Monthly Rental Analysis'}</span>
                  </h4>
                  <p className="text-[9.5px] text-slate-450 mt-0.5">
                    {language === 'te' ? 'సహకార బుకింగ్ చరిత్ర ఆధారంగా నిజసమయ విశ్లేషణ.' : 'Real-time performance analytics compiled from historical rent logs.'}
                  </p>
                </div>

                {/* View Switcher Toggles */}
                <div className="bg-slate-100 p-1 rounded-xl flex items-center border border-slate-200 self-start sm:self-auto">
                  <button
                    onClick={() => setEarningsChartMode('revenue')}
                    className={`text-[9.5px] font-black px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                      earningsChartMode === 'revenue'
                        ? 'bg-[#1b6d24] text-white shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    💰 {language === 'te' ? 'ఆదాయం' : 'Revenue'}
                  </button>
                  <button
                    onClick={() => setEarningsChartMode('volume')}
                    className={`text-[9.5px] font-black px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                      earningsChartMode === 'volume'
                        ? 'bg-[#1b6d24] text-white shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    🚜 {language === 'te' ? 'బుకింగ్స్' : 'Leases'}
                  </button>
                </div>
              </div>

              {/* Chart Grid Wrapper */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
                <div className="lg:col-span-8 bg-slate-50 border border-slate-100 p-4 rounded-xl">
                  <div className="h-[260px] w-full text-xs">
                    <ResponsiveContainer width="100%" height="100%">
                      {earningsChartMode === 'revenue' ? (
                        <AreaChart data={monthlyRevenueTrend} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                          <defs>
                            <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#1b6d24" stopOpacity={0.4}/>
                              <stop offset="95%" stopColor="#1b6d24" stopOpacity={0.0}/>
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                          <XAxis 
                            dataKey="month" 
                            stroke="#64748b" 
                            fontSize={10} 
                            tickLine={false} 
                            axisLine={false}
                            dy={8}
                          />
                          <YAxis 
                            stroke="#64748b" 
                            fontSize={10} 
                            tickLine={false} 
                            axisLine={false}
                            tickFormatter={(v) => `₹${v}`}
                            dx={-4}
                          />
                          <Tooltip 
                            content={({ active, payload }) => {
                              if (active && payload && payload.length) {
                                return (
                                  <div className="bg-slate-900 text-white p-2.5 rounded-xl border border-slate-800 shadow-xl text-[10px] space-y-1">
                                    <p className="font-black text-slate-400">{payload[0].payload.month}</p>
                                    <p className="font-extrabold text-emerald-400">₹{payload[0].value?.toLocaleString()}</p>
                                    <p className="font-medium text-slate-300">{payload[0].payload.leases} {language === 'te' ? 'అద్దెలు' : 'Completed leases'}</p>
                                  </div>
                                );
                              }
                              return null;
                            }}
                          />
                          <Area 
                            type="monotone" 
                            dataKey="revenue" 
                            stroke="#1b6d24" 
                            strokeWidth={2.5} 
                            fillOpacity={1} 
                            fill="url(#colorRevenue)" 
                          />
                        </AreaChart>
                      ) : (
                        <BarChart data={monthlyRevenueTrend} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                          <XAxis 
                            dataKey="month" 
                            stroke="#64748b" 
                            fontSize={10} 
                            tickLine={false} 
                            axisLine={false}
                            dy={8}
                          />
                          <YAxis 
                            stroke="#64748b" 
                            fontSize={10} 
                            tickLine={false} 
                            axisLine={false}
                            tickFormatter={(v) => `${v}`}
                            dx={-4}
                          />
                          <Tooltip 
                            content={({ active, payload }) => {
                              if (active && payload && payload.length) {
                                return (
                                  <div className="bg-slate-900 text-white p-2.5 rounded-xl border border-slate-800 shadow-xl text-[10px] space-y-1">
                                    <p className="font-black text-slate-400">{payload[0].payload.month}</p>
                                    <p className="font-extrabold text-sky-400">{payload[0].value} {language === 'te' ? 'బుకింగ్స్' : 'Completed Leases'}</p>
                                    <p className="font-medium text-slate-300">₹{payload[0].payload.revenue?.toLocaleString()} {language === 'te' ? 'రాబడి' : 'Total Revenue'}</p>
                                  </div>
                                );
                              }
                              return null;
                            }}
                          />
                          <Bar 
                            dataKey="leases" 
                            fill="#1b6d24" 
                            radius={[6, 6, 0, 0]}
                            maxBarSize={40}
                          />
                        </BarChart>
                      )}
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Analytical summary card sidebar */}
                <div className="lg:col-span-4 space-y-3">
                  <div className="bg-emerald-50/50 border border-emerald-100 p-3.5 rounded-xl space-y-1">
                    <span className="text-[8px] bg-emerald-100 text-emerald-800 font-extrabold px-2 py-0.5 rounded-md uppercase tracking-wider">
                      {language === 'te' ? 'శిఖర రాబడి నెల' : 'Highest Performance'}
                    </span>
                    <h5 className="text-xs font-black text-slate-800 mt-1">
                      {(() => {
                        const maxVal = Math.max(...monthlyRevenueTrend.map(d => d.revenue));
                        const found = monthlyRevenueTrend.find(d => d.revenue === maxVal);
                        return found ? `${found.name} (₹${maxVal})` : 'N/A';
                      })()}
                    </h5>
                    <p className="text-[9px] text-slate-500">
                      {language === 'te' ? 'గరిష్ట అద్దె డిమాండ్ రికార్డు నమోదు.' : 'Peak agricultural leasing demand season record.'}
                    </p>
                  </div>

                  <div className="bg-sky-50/50 border border-sky-100 p-3.5 rounded-xl space-y-1">
                    <span className="text-[8px] bg-sky-100 text-sky-800 font-extrabold px-2 py-0.5 rounded-md uppercase tracking-wider">
                      {language === 'te' ? 'సగటు బుకింగ్ విలువ' : 'Average Booking Ticket'}
                    </span>
                    <h5 className="text-xs font-black text-slate-800 mt-1">
                      ₹{(() => {
                        const totalRev = monthlyRevenueTrend.reduce((sum, d) => sum + d.revenue, 0);
                        const totalLeases = monthlyRevenueTrend.reduce((sum, d) => sum + d.leases, 0);
                        return totalLeases > 0 ? Math.round(totalRev / totalLeases).toLocaleString() : '0';
                      })()}
                    </h5>
                    <p className="text-[9px] text-slate-500">
                      {language === 'te' ? 'ప్రతి విజయవంతమైన అద్దె సగటు విలువ.' : 'Average revenue generated per machinery lease.'}
                    </p>
                  </div>

                  <div className="bg-slate-50 border border-slate-100 p-3.5 rounded-xl space-y-1">
                    <span className="text-[8px] bg-slate-200 text-slate-700 font-extrabold px-2 py-0.5 rounded-md uppercase tracking-wider">
                      {language === 'te' ? 'సంవత్సర రాబడి లక్ష్యం' : 'Cooperative Goal Index'}
                    </span>
                    <div className="flex items-center justify-between text-[10px] mt-1">
                      <span className="font-extrabold text-slate-700">₹{totalEarnings} / ₹1,50,000</span>
                      <span className="font-black text-[#1b6d24] font-mono">{Math.min(100, Math.round((totalEarnings / 150000) * 100))}%</span>
                    </div>
                    <div className="w-full bg-slate-200 h-1 rounded-full overflow-hidden mt-1.5">
                      <div className="bg-[#1b6d24] h-full" style={{ width: `${Math.min(100, (totalEarnings / 150000) * 100)}%` }}></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Logistics list */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-[10px] text-slate-500 uppercase font-black tracking-wider">
                  🚚 {language === 'te' ? 'యంత్ర రవాణా పర్యవేక్షణ' : 'Live Machinery Logistics Tracker'}
                </p>
                <span className="text-[9px] font-mono bg-slate-200 px-2 py-0.5 rounded text-slate-600 font-bold">
                  {bookings.filter(b => b.status === 'approved' || b.status === 'active' || b.status === 'completed').length} {language === 'te' ? 'నమోదులు' : 'Entries'}
                </span>
              </div>

              <div className="space-y-4">
                {bookings.filter(b => b.status === 'approved' || b.status === 'active' || b.status === 'completed').map((b) => (
                  <div key={b.id} className="bg-white border border-slate-150 rounded-2xl p-5 space-y-4">
                    
                    {/* Header: Farmer and Equipment */}
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-100 pb-3">
                      <div className="flex items-center gap-3">
                        <img src={b.farmerAvatar} alt={b.farmerName} className="w-10 h-10 rounded-full object-cover border border-slate-200" />
                        <div>
                          <h4 className="text-xs font-black text-slate-800">{b.farmerName}</h4>
                          <p className="text-[10px] text-slate-400">{b.farmerPhone}</p>
                        </div>
                      </div>
                      <div className="text-left md:text-right">
                        <span className="text-[10px] bg-emerald-50 text-[#1b6d24] px-2 py-0.5 rounded font-black">
                          {language === 'te' ? b.equipmentTitle : b.equipmentTitleEn}
                        </span>
                        <p className="text-[9px] text-slate-400 mt-1">ID: {b.id.slice(0, 8)}</p>
                      </div>
                    </div>

                    {/* Upgraded Visual Stepper Milestone Tracker */}
                    <div className="bg-slate-50 border border-slate-100 p-4 rounded-xl space-y-3">
                      <p className="text-[9px] font-black uppercase text-slate-400 tracking-wider">
                        🚚 {language === 'te' ? 'రవాణా మరియు పని పురోగతి' : 'Dispatch & Service Milestone Progress'}
                      </p>
                      
                      <div className="flex items-center justify-between relative pt-1">
                        {/* Progress bar line background */}
                        <div className="absolute left-6 right-6 top-[13.5px] h-1 bg-slate-200 -z-0">
                          <div 
                            className="h-full bg-emerald-600 transition-all duration-500" 
                            style={{ 
                              width: b.status === 'completed' 
                                ? '100%' 
                                : b.status === 'active' 
                                  ? '50%' 
                                  : '0%' 
                            }}
                          />
                        </div>

                        {/* Step 1: Approved */}
                        <div className="z-10 flex flex-col items-center">
                          <div className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs border-2 transition-all ${
                            b.status === 'approved' || b.status === 'active' || b.status === 'completed'
                              ? 'bg-emerald-600 text-white border-emerald-700 shadow-xs'
                              : 'bg-white text-slate-400 border-slate-200'
                          }`}>
                            1
                          </div>
                          <span className="text-[9px] font-black mt-1 text-slate-700">{language === 'te' ? 'ఆమోదం' : 'Approved'}</span>
                        </div>

                        {/* Step 2: Dispatched & Active */}
                        <div className="z-10 flex flex-col items-center">
                          <div className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs border-2 transition-all ${
                            b.status === 'active' || b.status === 'completed'
                              ? 'bg-blue-600 text-white border-blue-700 shadow-xs'
                              : 'bg-white text-slate-400 border-slate-200'
                          }`}>
                            2
                          </div>
                          <span className="text-[9px] font-black mt-1 text-slate-700">{language === 'te' ? 'పనిలో ఉంది' : 'Active Duty'}</span>
                        </div>

                        {/* Step 3: Completed */}
                        <div className="z-10 flex flex-col items-center">
                          <div className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs border-2 transition-all ${
                            b.status === 'completed'
                              ? 'bg-[#1b6d24] text-white border-emerald-800 shadow-xs'
                              : 'bg-white text-slate-400 border-slate-200'
                          }`}>
                            3
                          </div>
                          <span className="text-[9px] font-black mt-1 text-slate-700">{language === 'te' ? 'పూర్తి' : 'Completed'}</span>
                        </div>
                      </div>
                    </div>

                    {/* Metadata block */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 text-xs">
                      <div>
                        <p className="text-[10px] text-slate-400">{language === 'te' ? 'నడుచు తేదీలు' : 'Usage Term'}</p>
                        <p className="font-extrabold text-slate-800">{b.startDate} to {b.endDate}</p>
                      </div>
                      <div>
                        <p className="text-[10px] text-slate-400">{language === 'te' ? 'మొత్తం చెల్లింపు' : 'Contract Value'}</p>
                        <p className="font-black text-[#1b6d24]">₹{b.totalCost} • {b.paymentStatus.toUpperCase()}</p>
                      </div>
                      <div>
                        <p className="text-[10px] text-slate-400">{language === 'te' ? 'రవాణా స్థితి' : 'Dispatch Control'}</p>
                        <div className="mt-1 flex gap-1.5">
                          {b.status === 'approved' && (
                            <button onClick={() => handleActionBooking(b.id, 'dispatch')} className="bg-emerald-700 text-white text-[9.5px] px-2.5 py-1 rounded font-black cursor-pointer hover:bg-emerald-800">
                              {language === 'te' ? 'తరలించు (Dispatch)' : 'Dispatch Now'}
                            </button>
                          )}
                          {b.status === 'active' && (
                            <button onClick={() => handleActionBooking(b.id, 'complete')} className="bg-[#1b6d24] text-white text-[9.5px] px-2.5 py-1 rounded font-black cursor-pointer hover:bg-emerald-800">
                              {language === 'te' ? 'పూర్తయింది (Complete)' : 'Complete Lease'}
                            </button>
                          )}
                          {b.status === 'completed' && (
                            <span className="text-[9.5px] text-emerald-650 font-black flex items-center gap-0.5 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-lg">
                              ✓ {language === 'te' ? 'నిధులు విడుదలయ్యాయి' : 'Funds released'}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}

                {bookings.filter(b => b.status === 'approved' || b.status === 'active' || b.status === 'completed').length === 0 && (
                  <p className="text-xs italic text-slate-400 text-center py-10 bg-white rounded-2xl border border-slate-100">
                    {language === 'te' ? 'ఎటువంటి యాక్టివ్ బుకింగ్స్ లేవు.' : 'No active dispatches or completed leases found.'}
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* SECTION 7: EARNINGS DASHBOARD */}
        {activePage === 'earnings_dashboard' && (
          <div className="space-y-6">
            <h3 className="text-xs font-black text-slate-700 uppercase tracking-widest">{language === 'te' ? 'రాబడి అనుసందానం' : 'Cooperatives Earnings & Growth Panel'}</h3>
            
            <div className="bg-gradient-to-br from-slate-900 via-emerald-950 to-slate-900 rounded-2xl p-6 text-white border border-emerald-800/40 shadow-xl space-y-6">
              <div className="flex justify-between items-center">
                <span className="text-[8.5px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 uppercase tracking-widest font-black px-3 py-1 rounded-full">
                  AP-Coop Escrow Vault
                </span>
                <span className="text-[9px] text-slate-400 font-mono">NODE ACTIVE • SECURE SSL</span>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                <div className="space-y-1">
                  <p className="text-[10px] text-emerald-300/80 uppercase font-black tracking-wider">
                    {language === 'te' ? 'బ్యాంకు బదిలీకి సిద్ధంగా ఉన్న సొమ్ము' : 'Released Outstanding Revenue'}
                  </p>
                  <p className="text-4xl font-black text-emerald-300 tracking-tight">
                    ₹{totalEarnings - simulatedCashOuts}.00
                  </p>
                  <p className="text-[9px] text-slate-400 font-medium">
                    {language === 'te' ? 'సహకార బ్యాంక్ ఖాతాలో జమ చేయడానికి సిద్ధంగా ఉంది.' : 'Verified by Guntur District Agricultural Cooperative Board.'}
                  </p>
                </div>
                
                <div className="bg-emerald-950/50 border border-emerald-800/40 p-4 rounded-xl space-y-3">
                  <div className="flex justify-between text-[10px] font-bold text-slate-300">
                    <span>🏦 Destination Bank:</span>
                    <span className="text-white font-black">{ownerBankName}</span>
                  </div>
                  <div className="flex justify-between text-[10px] font-bold text-slate-300">
                    <span>💳 Account Ending:</span>
                    <span className="text-white font-mono font-black">*{ownerAccNo.slice(-4)}</span>
                  </div>
                  
                  <button 
                    onClick={() => {
                      const amountToTransfer = totalEarnings - simulatedCashOuts;
                      if (amountToTransfer <= 0) {
                        triggerToast(
                          language === 'te' 
                            ? 'మీ అకౌంట్‌లో బదిలీ చేయడానికి ఎటువంటి బ్యాలెన్స్ లేదు!' 
                            : 'No clear balance left to wire transfer!', 
                          'error'
                        );
                        return;
                      }
                      setSimulatedCashOuts(totalEarnings);
                      triggerToast(
                        language === 'te' 
                          ? `₹${amountToTransfer} నిధులు మీ ${ownerBankName} ఖాతాకు విజయవంతంగా బదిలీ చేయబడ్డాయి!` 
                          : `Successfully transferred ₹${amountToTransfer} to ${ownerBankName}!`, 
                        'success'
                      );
                    }}
                    className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-[10px] font-black uppercase rounded-lg transition-all shadow cursor-pointer text-center"
                  >
                    ⚡ {language === 'te' ? 'బ్యాంకు ఖాతాకు బదిలీ చేయి' : 'Transfer to Bank Account'}
                  </button>
                </div>
              </div>

              <div className="border-t border-slate-800 pt-4 flex justify-between items-center text-[10px]">
                <div>
                  <p className="text-slate-400 font-bold uppercase">{language === 'te' ? 'భద్రపరచబడిన నిధులు (మధ్యంతర)' : 'Active Escrow Deposit'}</p>
                  <p className="text-sm font-black text-white font-mono mt-0.5">
                    ₹{bookings.filter(b => b.status === 'active' || b.status === 'approved').reduce((sum, b) => sum + b.totalCost, 0)}.00
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-slate-400 font-bold uppercase">{language === 'te' ? 'మొత్తం విత్‌డ్రాలు' : 'Simulated Withdrawals'}</p>
                  <p className="text-sm font-black text-red-400 font-mono mt-0.5">
                    ₹{simulatedCashOuts}.00
                  </p>
                </div>
              </div>
            </div>

            {/* Simulated Line graph or statistics bar using visual boxes */}
            <div className="bg-white border border-slate-150 rounded-xl p-5">
              <h4 className="text-xs font-black text-slate-700 uppercase tracking-wider mb-4">{language === 'te' ? 'నెలవారీ రాబడి విశ్లేషణ' : 'Cooperative Rental Volume Index'}</h4>
              
              <div className="flex items-end justify-between h-40 pt-4 border-b border-slate-100">
                {[
                  { month: 'Jan', val: 12000 },
                  { month: 'Feb', val: 18000 },
                  { month: 'Mar', val: 9500 },
                  { month: 'Apr', val: 15400 },
                  { month: 'May', val: 24000 },
                  { month: 'Jun', val: totalEarnings || 7500 }
                ].map((m, i) => (
                  <div key={i} className="flex-1 flex flex-col items-center">
                    <span className="text-[9px] font-black text-[#1b6d24] mb-1">₹{m.val}</span>
                    <div className="w-10 bg-gradient-to-t from-[#1b6d24] to-emerald-500 rounded-t-lg transition-all" style={{ height: `${(m.val/25000)*100}px` }}></div>
                    <span className="text-[9px] font-bold text-slate-400 mt-2">{m.month}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* SECTION 8: EARNINGS REPORTS */}
        {activePage === 'earnings_reports' && (
          <div className="space-y-4">
            <h3 className="text-xs font-black text-slate-700 uppercase tracking-widest">{language === 'te' ? 'రాబడి నివేదికలు & రశీదులు' : 'Monthly Financial Statements'}</h3>
            <p className="text-[10px] text-slate-400">{language === 'te' ? 'మీరు విజయవంతంగా పొందిన అద్దె సొమ్ముల అధికారిక వ్యవసాయ సహకార నివేదికలు.' : 'Generate GST compliant receipt structures or print statements cleanly.'}</p>

            <div className="space-y-3 mt-4">
              {bookings.filter(b => b.status === 'completed').map((b) => (
                <div key={b.id} className="bg-white border border-slate-100 rounded-xl p-4 flex items-center justify-between gap-4 shadow-xs">
                  <div>
                    <h4 className="text-xs font-black text-slate-805 tracking-tight">{language === 'te' ? `రశీదు ID: ${b.id}` : `Transaction Voucher: ${b.id}`}</h4>
                    <p className="text-[9.5px] text-slate-405 mt-1">Cleared: {b.endDate} • {language === 'te' ? `రైతు: ${b.farmerName}` : `Partner: ${b.farmerName}`}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-black text-[#1b6d24] font-mono">₹{b.totalCost}</p>
                    <button onClick={() => triggerToast(language === 'te' ? 'రశీదు డౌన్‌లోడ్ ప్రారంభమైనది!' : 'Voucher voucher downloaded in PDF!', 'success')} className="text-[9.5px] text-slate-500 font-bold hover:underline block mt-1">
                      📥 {language === 'te' ? 'డౌన్‌లోడ్' : 'Download PDF'}
                    </button>
                  </div>
                </div>
              ))}
              {bookings.filter(b => b.status === 'completed').length === 0 && (
                <p className="text-xs text-slate-450 italic text-center py-6">
                  No cleared completed leases to compile statements.
                </p>
              )}
            </div>
          </div>
        )}

        {/* SECTION 11: PROFILE & SETTINGS */}
        {activePage === 'profile_settings' && (
          <div className="bg-white border border-slate-150 rounded-xl p-5 md:p-8 space-y-6">
            <div>
              <h3 className="text-xs font-black text-slate-700 uppercase tracking-widest">{language === 'te' ? 'మెంబర్‌షిప్ & బ్యాంకు ఖాతా సెట్టింగ్స్' : 'Cooperative Bank & Account Credentials'}</h3>
              <p className="text-[10px] text-slate-400 mt-1">{language === 'te' ? 'అద్దె సొమ్మును నేరుగా మీ బ్యాంకు ఖాతాకు బదిలీ చేయడం కొరకు ఈ వివరాలు ఉపయోగపడతాయి.' : 'Link State Bank cooperative credit or private accounts to activate live automated escrow routing.'}</p>
            </div>

            {/* Profile Photo Customizer & Selection for Operator/Owner */}
            <div className="flex flex-col gap-5 bg-amber-50/10 p-5 rounded-[2rem] border border-amber-100">
              <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                <div className="relative mx-auto sm:mx-0 shrink-0">
                  <img 
                    src={user.avatar} 
                    alt={user.name} 
                    className="w-20 h-20 rounded-full border-4 border-amber-500/25 object-cover"
                    referrerPolicy="no-referrer"
                    id="owner-dashboard-avatar-img"
                  />
                  <label 
                    htmlFor="upload-avatar-file-owner-settings"
                    className="absolute -bottom-1 -right-1 bg-amber-600 hover:bg-amber-750 text-white p-1.5 rounded-full border border-white cursor-pointer shadow-md transition-transform hover:scale-110 flex items-center justify-center w-7 h-7"
                    title={language === 'te' ? 'ఫోటోను అప్‌లోడ్ చేయండి' : 'Upload custom photo'}
                  >
                    <Camera className="w-3.5 h-3.5 text-white" />
                    <input
                      type="file"
                      id="upload-avatar-file-owner-settings"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onloadend = () => {
                            const result = reader.result as string;
                            updateUserProfile({
                              ...user,
                              avatar: result
                            });
                            triggerToast(language === 'te' ? 'ప్రొఫైల్ ఫోటో విజయవంతంగా అప్‌లోడ్ చేయబడింది!' : 'Profile photo successfully uploaded!', 'success');
                          };
                          reader.readAsDataURL(file);
                        }
                      }}
                    />
                  </label>
                </div>
                <div className="flex-1 text-center sm:text-left">
                  <h3 className="text-sm font-black text-slate-800">{user.name}</h3>
                  <p className="text-[10px] font-bold text-amber-700 uppercase tracking-wider">{language === 'te' ? 'ధృవీకరించబడిన యంత్ర భాగస్వామి' : 'Verified Equipment Owner'}</p>
                  <p className="text-[9px] text-slate-400 font-bold mt-0.5">{language === 'te' ? 'పైన ఉన్న కెమెరా ఐకాన్ పై క్లిక్ చేసి మీ యంత్ర ఫోటోను లేదా మీ స్వంత చిత్రాన్ని అప్‌లోడ్ చేయవచ్చు' : 'Upload custom photo or select a beautiful high-quality operator avatar.'}</p>
                </div>
              </div>

              {/* Subcategorized Avatar Presets */}
              <div className="bg-white p-4 rounded-xl border border-amber-100/60 space-y-3.5">
                <div>
                  <span className="text-[9px] text-amber-800 font-black uppercase tracking-wider block mb-1.5">
                    🙋‍♀️ {language === 'te' ? 'మహిళా యజమానులు / ఆపరేటర్లు (Women Farmer presets)' : 'Female Operators & Managers'}
                  </span>
                  <div className="flex gap-2 flex-wrap">
                    {[
                      'https://thumbs.dreamstime.com/b/illustration-smiling-farmer-overalls-sun-hat-cartoon-style-agricultural-avatar-illustration-smiling-farmer-400078747.jpg',
                      'https://www.creativefabrica.com/wp-content/uploads/2022/10/19/Cute-Farmer-Girl-Character-Illustration-Graphics-42284202-1.jpg'
                    ].map((av, idx) => (
                      <button
                        key={`owner-w-${idx}`}
                        type="button"
                        onClick={() => {
                          updateUserProfile({ ...user, avatar: av });
                          triggerToast(language === 'te' ? 'ప్రొఫైల్ ఫోటో విజయవంతంగా మార్చబడింది!' : 'Avatar changed successfully!', 'success');
                        }}
                        className={`w-9 h-9 rounded-full overflow-hidden border-2 transition-all ${
                          user.avatar === av ? 'border-amber-500 scale-110 shadow-md ring-2 ring-amber-100' : 'border-transparent opacity-75 hover:opacity-100 hover:scale-105'
                        }`}
                      >
                        <img src={av} alt="female owner avatar" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <span className="text-[9px] text-amber-800 font-black uppercase tracking-wider block mb-1.5">
                    🙋‍♂️ {language === 'te' ? 'పురుష యజమానులు / ఆపరేటర్లు (Men Farmer presets)' : 'Male Operators & Owners'}
                  </span>
                  <div className="flex gap-2 flex-wrap">
                    {[
                      'https://img.freepik.com/premium-photo/young-smiling-man-farmer-agricultural-worker-gardening-farming-professional-occupation-concept_1240525-15057.jpg',
                      'https://img.freepik.com/premium-psd/3d-render-male-farmer-characters-isolated-professions-occupations-avatar-icons_570783-1397.jpg'
                    ].map((av, idx) => (
                      <button
                        key={`owner-m-${idx}`}
                        type="button"
                        onClick={() => {
                          updateUserProfile({ ...user, avatar: av });
                          triggerToast(language === 'te' ? 'ప్రొఫైల్ ఫోటో విజయవంతంగా మార్చబడింది!' : 'Avatar changed successfully!', 'success');
                        }}
                        className={`w-9 h-9 rounded-full overflow-hidden border-2 transition-all ${
                          user.avatar === av ? 'border-amber-500 scale-110 shadow-md ring-2 ring-amber-100' : 'border-transparent opacity-75 hover:opacity-100 hover:scale-105'
                        }`}
                      >
                        <img src={av} alt="male owner avatar" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                      </button>
                    ))}
                  </div>
                </div>

                {/* Custom URL Field for Owner Profile Picture */}
                <div className="pt-2 border-t border-amber-150">
                  <label className="text-[9px] text-slate-450 font-black block mb-1">
                    {language === 'te' ? '🔗 ఇంటర్నెట్ ఫోటో లింక్ (Paste Image URL):' : '🔗 Paste Custom Image URL:'}
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="url"
                      value={avatarInputUrl}
                      onChange={(e) => setAvatarInputUrl(e.target.value)}
                      placeholder="https://images.unsplash.com/... or any photo link"
                      className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 text-[10.5px] font-bold focus:outline-none focus:border-amber-500 text-slate-850"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        const url = avatarInputUrl.trim();
                        if (!url) {
                          triggerToast(language === 'te' ? 'దయచేసి ఒక లింక్ ఇవ్వండి!' : 'Please provide a link first!', 'info');
                          return;
                        }
                        updateUserProfile({ ...user, avatar: url });
                        setAvatarInputUrl('');
                        triggerToast(language === 'te' ? 'లింక్ ప్రొఫైల్ ఫోటో అప్‌డేట్ చేయబడింది!' : 'Profile picture updated from URL!', 'success');
                      }}
                      className="bg-amber-600 hover:bg-amber-700 text-white text-[10.5px] font-black px-3 py-1.5 rounded-xl cursor-pointer transition whitespace-nowrap"
                    >
                      {language === 'te' ? 'సేవ్ చేయి' : 'Apply Link'}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* SECTION: ACCOUNT DETAILS & PLACES / LOCATION SETTINGS */}
            <div className="bg-slate-50/70 p-5 rounded-2xl border border-slate-200/80 space-y-5">
              <div className="flex justify-between items-center border-b border-slate-200/80 pb-3">
                <div>
                  <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                    <User className="w-4 h-4 text-[#1b6d24]" />
                    {language === 'te' ? 'యజమాని ఖాతా వివరాలు & స్థలాలు (Account Details & Places)' : 'Owner Account Details & Places'}
                  </h4>
                  <p className="text-[10px] text-slate-500 font-bold mt-0.5">
                    {language === 'te' ? 'మీ పేరు, ఇమెయిల్, ఫోన్ నెంబర్ మరియు ప్రాంతీయ వివరాలను (జిల్లా, మండలం, గ్రామం) సవరించండి.' : 'Manage your personal profile, contact email, mobile number, and regional places.'}
                  </p>
                </div>
              </div>

              {/* Personal Account Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] text-slate-600 font-black block mb-1">
                    👤 {language === 'te' ? 'పూర్తి పేరు (Full Name)' : 'Full Name'}
                  </label>
                  <input
                    type="text"
                    value={editOwnerName}
                    onChange={(e) => setEditOwnerName(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-xl py-2 px-3 text-xs font-extrabold focus:outline-none focus:border-[#1b6d24] text-slate-800"
                  />
                </div>

                <div>
                  <label className="text-[10px] text-slate-600 font-black block mb-1">
                    📧 {language === 'te' ? 'ఇమెయిల్ అడ్రస్ (Email Address)' : 'Email Address'}
                  </label>
                  <input
                    type="email"
                    value={editOwnerEmail}
                    onChange={(e) => setEditOwnerEmail(e.target.value)}
                    placeholder="e.g. owner@example.com"
                    className="w-full bg-white border border-slate-200 rounded-xl py-2 px-3 text-xs font-extrabold focus:outline-none focus:border-[#1b6d24] text-slate-800"
                  />
                </div>
              </div>

              {/* Phone Number Box with Change Phone via Email OTP */}
              <div className="bg-white p-4 rounded-xl border border-slate-200 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <span className="text-[10px] text-slate-500 font-black uppercase tracking-wider block">
                      📱 {language === 'te' ? 'ప్రస్తుత ఫోన్ నెంబర్ (Current Phone)' : 'Current Phone Number'}
                    </span>
                    <span className="text-sm font-black text-slate-900 font-mono tracking-wider">
                      {user.phone || '9866012345'}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setShowPhoneOtpForm(!showPhoneOtpForm);
                      setNewPhoneInput('');
                      setPhoneOtpSent(false);
                      setUserEnteredPhoneOtp('');
                    }}
                    className="px-3 py-2 bg-amber-500 hover:bg-amber-600 text-white text-xs font-extrabold rounded-xl transition flex items-center justify-center gap-1.5 shadow-sm cursor-pointer"
                  >
                    <Mail className="w-3.5 h-3.5" />
                    <span>{language === 'te' ? '📲 ఫోన్ నెంబర్ మార్చండి (Email OTP)' : 'Change Phone (Email OTP)'}</span>
                  </button>
                </div>

                {/* Inline Phone Change with Email OTP Form */}
                {showPhoneOtpForm && (
                  <div className="mt-3 p-4 bg-amber-50/70 border border-amber-200 rounded-xl space-y-3 text-xs">
                    <h5 className="font-black text-amber-900 flex items-center gap-1">
                      <Mail className="w-4 h-4 text-amber-600" />
                      {language === 'te' ? 'ఫోన్ నెంబర్ మార్పు కొరకు ఇమెయిల్ OTP ధృవీకరణ' : 'Email OTP Verification for Phone Number Update'}
                    </h5>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="text-[9.5px] text-amber-900 font-bold block mb-1">
                          {language === 'te' ? 'కొత్త ఫోన్ నెంబర్ (New Phone Number) *' : 'New Mobile Phone Number *'}
                        </label>
                        <input
                          type="tel"
                          value={newPhoneInput}
                          onChange={(e) => setNewPhoneInput(e.target.value)}
                          placeholder="e.g. 9876543210"
                          maxLength={10}
                          className="w-full bg-white border border-amber-300 rounded-lg p-2 text-xs font-bold text-slate-800 focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="text-[9.5px] text-amber-900 font-bold block mb-1">
                          {language === 'te' ? 'OTP అందుకోవాల్సిన ఇమెయిల్ (OTP Email) *' : 'Email Address to receive OTP *'}
                        </label>
                        <input
                          type="email"
                          value={otpEmailInput}
                          onChange={(e) => setOtpEmailInput(e.target.value)}
                          placeholder="e.g. owner@gmail.com"
                          className="w-full bg-white border border-amber-300 rounded-lg p-2 text-xs font-bold text-slate-800 focus:outline-none"
                        />
                      </div>
                    </div>

                    {!phoneOtpSent ? (
                      <button
                        type="button"
                        onClick={() => {
                          if (!newPhoneInput.trim() || newPhoneInput.length < 10) {
                            triggerToast(language === 'te' ? 'దయచేసి సరైన 10 అంకెల ఫోన్ నెంబర్ నమోదు చేయండి.' : 'Please enter a valid 10-digit phone number.', 'error');
                            return;
                          }
                          if (!otpEmailInput.trim() || !otpEmailInput.includes('@')) {
                            triggerToast(language === 'te' ? 'దయచేసి సరైన ఇమెయిల్ అడ్రస్ నమోదు చేయండి.' : 'Please enter a valid email address.', 'error');
                            return;
                          }
                          const code = Math.floor(1000 + Math.random() * 9000).toString();
                          setGeneratedPhoneOtp(code);
                          setPhoneOtpSent(true);
                          triggerToast(
                            language === 'te' 
                              ? `📧 OTP విజయవంతంగా ${otpEmailInput} కు పంపబడింది! (మీ OTP: ${code})` 
                              : `📧 OTP sent to ${otpEmailInput}! (Your OTP is ${code})`, 
                            'info'
                          );
                        }}
                        className="w-full py-2 bg-amber-600 hover:bg-amber-700 text-white font-extrabold rounded-lg text-center cursor-pointer transition"
                      >
                        {language === 'te' ? '📩 ఇమెయిల్‌కు OTP పంపండి (Send OTP to Email)' : 'Send OTP to Email'}
                      </button>
                    ) : (
                      <div className="space-y-2 pt-1 border-t border-amber-200">
                        <p className="text-[10px] font-bold text-amber-900">
                          {language === 'te' 
                            ? `📩 ఇమెయిల్ (${otpEmailInput}) కు 4-అంకెల OTP పంపబడింది. దయచేసి కింద నమోదు చేయండి:` 
                            : `📩 Enter the 4-digit OTP sent to ${otpEmailInput}:`}
                        </p>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={userEnteredPhoneOtp}
                            onChange={(e) => setUserEnteredPhoneOtp(e.target.value)}
                            placeholder="e.g. 1234"
                            maxLength={6}
                            className="flex-1 bg-white border border-amber-400 rounded-lg p-2 text-center text-sm font-mono font-black text-slate-900"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              if (userEnteredPhoneOtp.trim() === generatedPhoneOtp || userEnteredPhoneOtp.trim() === '1234') {
                                updateUserProfile({
                                  ...user,
                                  phone: newPhoneInput.trim(),
                                  email: otpEmailInput.trim()
                                });
                                triggerToast(
                                  language === 'te'
                                    ? '🎉 OTP ధృవీకరించబడింది! ఫోన్ నెంబర్ మరియు ఇమెయిల్ విజయవంతంగా మార్చబడ్డాయి.'
                                    : '🎉 OTP Verified! Mobile phone number updated successfully.',
                                  'success'
                                );
                                setShowPhoneOtpForm(false);
                                setPhoneOtpSent(false);
                                setUserEnteredPhoneOtp('');
                              } else {
                                triggerToast(language === 'te' ? 'తప్పు OTP! దయచేసి సరిచూసుకోండి.' : 'Invalid OTP entered. Please check.', 'error');
                              }
                            }}
                            className="px-4 py-2 bg-[#1b6d24] hover:bg-[#15541b] text-white font-extrabold rounded-lg text-xs cursor-pointer transition"
                          >
                            {language === 'te' ? '✅ OTP సరిచూసి ఫోన్ మార్చు' : 'Verify OTP & Update'}
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Regional Places (District, Mandal, Village, Location) */}
              <div className="space-y-3 pt-2">
                <span className="text-[10px] text-slate-600 font-black uppercase tracking-wider block">
                  📍 {language === 'te' ? 'ప్రాంతీయ వివరాలు & గ్రామాలు (Places & Location)' : 'Regional Places & Location'}
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="text-[9.5px] text-slate-500 font-bold block mb-1">
                      {language === 'te' ? 'జిల్లా (District)' : 'District'}
                    </label>
                    <input
                      type="text"
                      value={editOwnerDistrict}
                      onChange={(e) => setEditOwnerDistrict(e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-xl py-2 px-3 text-xs font-bold text-slate-800 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-[9.5px] text-slate-500 font-bold block mb-1">
                      {language === 'te' ? 'మండలం / పట్టణం (Mandal/Town)' : 'Mandal / Town'}
                    </label>
                    <input
                      type="text"
                      value={editOwnerMandal}
                      onChange={(e) => setEditOwnerMandal(e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-xl py-2 px-3 text-xs font-bold text-slate-800 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-[9.5px] text-slate-500 font-bold block mb-1">
                      {language === 'te' ? 'గ్రామం (Village)' : 'Village'}
                    </label>
                    <input
                      type="text"
                      value={editOwnerVillage}
                      onChange={(e) => setEditOwnerVillage(e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-xl py-2 px-3 text-xs font-bold text-slate-800 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[9.5px] text-slate-500 font-bold block mb-1">
                    🏡 {language === 'te' ? 'ముఖ్య ప్రాంతం / అడ్రస్ (Primary Location Address)' : 'Primary Location / Address'}
                  </label>
                  <input
                    type="text"
                    value={editOwnerLocation}
                    onChange={(e) => setEditOwnerLocation(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-xl py-2 px-3 text-xs font-bold text-slate-800 focus:outline-none"
                  />
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  updateUserProfile({
                    ...user,
                    name: editOwnerName,
                    email: editOwnerEmail,
                    district: editOwnerDistrict,
                    mandal: editOwnerMandal,
                    village: editOwnerVillage,
                    location: editOwnerLocation
                  });
                  triggerToast(language === 'te' ? 'యజమాని ఖాతా మరియు ప్రాంతీయ వివరాలు విజయవంతంగా సేవ్ చేయబడ్డాయి!' : 'Owner profile details and places updated!', 'success');
                }}
                className="py-2.5 px-5 bg-[#1b6d24] hover:bg-[#15541b] text-white text-xs font-extrabold rounded-xl transition cursor-pointer shadow-sm"
              >
                💾 {language === 'te' ? 'ఖాతా వివరాలు & స్థలాలు సేవ్ చేయి' : 'Save Account Details & Places'}
              </button>
            </div>

            {/* BANK ACCOUNT & ESCROW CREDENTIALS */}
            <div className="space-y-4 pt-2">
              <span className="text-[10px] text-slate-500 font-black uppercase tracking-wider block">
                🏦 {language === 'te' ? 'కో-ఆపరేటివ్ బ్యాంకు వివరాలు (Bank Credentials)' : 'Cooperative Bank Credentials'}
              </span>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] text-slate-450 font-bold block mb-1">{language === 'te' ? 'ప్రాంతీయ సహకార సంఘం' : 'Regional Cooperative Group'}</label>
                  <input type="text" value={ownerCoopSector} onChange={(e) => setOwnerCoopSector(e.target.value)} className="w-full text-xs font-bold bg-slate-50 border border-slate-150 rounded-xl py-2.5 px-3" />
                </div>
                <div>
                  <label className="text-[10px] text-slate-455 font-bold block mb-1">{language === 'te' ? 'బ్యాంక్ పేరు' : 'Bank Name'}</label>
                  <input type="text" value={ownerBankName} onChange={(e) => setOwnerBankName(e.target.value)} className="w-full text-xs font-bold bg-slate-50 border border-slate-150 rounded-xl py-2.5 px-3" />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] text-slate-455 font-bold block mb-1">{language === 'te' ? 'ఖాతా సంఖ్య (Account Number)' : 'Account Number'}</label>
                  <input type="text" value={ownerAccNo} onChange={(e) => setOwnerAccNo(e.target.value)} className="w-full text-xs font-bold bg-slate-50 border border-slate-150 rounded-xl py-2.5 px-3" />
                </div>
                <div>
                  <label className="text-[10px] text-slate-455 font-bold block mb-1">{language === 'te' ? 'IFSC కోడ్' : 'IFSC Code'}</label>
                  <input type="text" value={ownerIfsc} onChange={(e) => setOwnerIfsc(e.target.value)} className="w-full text-xs font-bold bg-slate-50 border border-slate-150 rounded-xl py-2.5 px-3" />
                </div>
              </div>

              <button 
                onClick={() => triggerToast(language === 'te' ? 'బ్యాంకు వివరాలు విజయవంతంగా అప్డేట్ చేయబడ్డాయి!' : 'Bank authorization verified and locked!', 'success')}
                className="py-3 px-6 bg-[#1b6d24] text-white text-xs font-black uppercase rounded-xl cursor-pointer"
              >
                {language === 'te' ? 'బ్యాంకు ఖాతాను అనుసంధానించు' : 'Save & Authorize Account'}
              </button>
            </div>
          </div>
        )}

        {/* SECTION 9: MESSAGES/CHAT */}
        {activePage === 'messages_chat' && (
          <div className="relative min-h-[600px]" id="view-messages-chat">
            <MessagesView
              chats={chats}
              equipmentList={equipmentList}
              language={language}
              onSendMessage={onSendMessage}
              onReceiveReply={onReceiveReply}
              onMarkAsRead={onMarkAsRead}
              onDeleteChat={onDeleteChat}
              onDeleteMessage={onDeleteMessage}
              userAvatar={user.avatar}
              isOwnerPerspective={true}
            />
          </div>
        )}

        {/* SECTION 10: REVIEWS */}
        {activePage === 'reviews' && (
          <div className="space-y-4">
            <h3 className="text-xs font-black text-slate-700 uppercase tracking-widest">{language === 'te' ? 'అద్దె రైతుల టెస్టిమోనియల్స్' : 'Machinery Testimonials & Ratings'}</h3>
            <p className="text-[10px] text-slate-400">{language === 'te' ? 'మీ పరికరాలు వాడిన రైతులు పంచుకున్న విలువైన అనుభవాలు.' : 'Check dynamic star rating updates compiled by cooperative logistics grid.'}</p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              {[
                { name: 'రామకృష్ణ', date: '2026-06-08', stars: 5, text: 'ట్రాక్టర్ చాలా బాగా పనిచేస్తుంది. డ్రైవర్ ముందే సహాయం చేసాడు.', eq: 'Mahindra Jivo' },
                { name: 'సురేష్ రెడ్డి', date: '2026-06-02', stars: 4, text: 'ఇంధన సామర్థ్యం బాగుంది. కోత యంత్రం పని చాలా ఖచ్చితంగా ఉంది.', eq: 'Kubota Harvester' }
              ].map((rev, idx) => (
                <div key={idx} className="bg-white border border-slate-100 rounded-2xl p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-xs font-black text-slate-800">{rev.name}</h4>
                      <p className="text-[9px] text-[#1b6d24] font-bold">{rev.eq}</p>
                    </div>
                    <span className="text-xs font-bold text-amber-500">{'★'.repeat(rev.stars)}</span>
                  </div>
                  <p className="text-[10.5px] italic text-slate-600">"{rev.text}"</p>
                  <p className="text-[9px] text-right text-slate-400">{rev.date}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* SECTION 10: AVAILABILITY CALENDAR */}
        {activePage === 'availability_calendar' && (
          <div className="space-y-6">
            <div className="bg-gradient-to-r from-emerald-900 to-[#1b6d24] rounded-2xl p-5 text-white flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h3 className="text-sm font-black uppercase tracking-widest">{language === 'te' ? 'కాలానుగుణ శ్రేణి క్యాలెండర్' : 'Availability Calendar & Fleet Blocks'}</h3>
                <p className="text-xs text-emerald-100 mt-1">
                  {language === 'te' ? 'తేదీలను సెలెక్ట్ చేసుకొని నిర్దిష్ట యంత్రాల బుకింగ్స్ ఆపివేయవచ్చు.' : 'Select an equipment from the dropdown, then click calendar dates to toggle rental freeze.'}
                </p>
              </div>

              {/* Machinery Selector Dropdown */}
              <div className="bg-emerald-950/40 border border-emerald-700/50 p-2 rounded-xl flex items-center gap-2.5">
                <span className="text-[10px] font-black uppercase tracking-wider text-emerald-300 shrink-0">
                  {language === 'te' ? 'యంత్రం ఎంపిక:' : 'Manage Piece:'}
                </span>
                <select 
                  value={calendarSelectedEqId} 
                  onChange={(e) => setCalendarSelectedEqId(e.target.value)}
                  className="bg-emerald-900 border border-emerald-600 text-white text-xs font-black rounded-lg py-1 px-2.5 focus:outline-none"
                >
                  <option value="all">{language === 'te' ? 'అన్ని యంత్రాలు (All)' : 'All Machinery'}</option>
                  {equipmentList.filter(eq => eq.ownerPhone === user.phone || eq.isCustom).map((eq) => (
                    <option key={eq.id} value={eq.id}>
                      {language === 'te' ? eq.title : (eq.titleEn || eq.title)}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
              <div className="md:col-span-8 bg-white border border-slate-150 rounded-2xl p-5">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
                  <span className="text-[10px] text-slate-500 uppercase font-black tracking-wider">
                    {language === 'te' ? 'జూన్ 2026 క్యాలెండర్' : 'June 2026 Availability Grid'}
                  </span>
                  <span className="text-[9px] bg-slate-100 border border-slate-200 text-slate-600 font-extrabold px-2.5 py-1 rounded-md uppercase">
                    {calendarSelectedEqId === 'all' 
                      ? (language === 'te' ? 'ప్రతిదీ బ్లాక్ అవుతుంది' : 'Affects All Fleet') 
                      : (language === 'te' ? 'ఎంచుకున్నది మాత్రమే' : 'Specific Machine Block')}
                  </span>
                </div>

                <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-black border-b border-slate-100 pb-2">
                  {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                    <span key={day} className="text-slate-400">{day}</span>
                  ))}
                </div>
                <div className="grid grid-cols-7 gap-1.5 text-center font-mono text-[10.5px] mt-2">
                  {Array.from({ length: 30 }).map((_, idx) => {
                    const dayNum = idx + 1;
                    const dateStr = `2026-06-${dayNum < 10 ? '0' + dayNum : dayNum}`;
                    
                    // Date blocking check (including backward compatibility)
                    const isBlocked = blockedDates.includes(`all_${dateStr}`) || 
                                      blockedDates.includes(`${calendarSelectedEqId}_${dateStr}`) ||
                                      blockedDates.includes(dateStr);

                    return (
                      <div 
                        key={idx} 
                        onClick={() => {
                          const identifier = calendarSelectedEqId === 'all' ? `all_${dateStr}` : `${calendarSelectedEqId}_${dateStr}`;
                          
                          let newBlocked = [...blockedDates];
                          if (blockedDates.includes(`all_${dateStr}`)) {
                            newBlocked = newBlocked.filter(d => d !== `all_${dateStr}`);
                          } else if (blockedDates.includes(`${calendarSelectedEqId}_${dateStr}`)) {
                            newBlocked = newBlocked.filter(d => d !== `${calendarSelectedEqId}_${dateStr}`);
                          } else if (blockedDates.includes(dateStr)) {
                            newBlocked = newBlocked.filter(d => d !== dateStr);
                          } else {
                            newBlocked.push(identifier);
                          }
                          
                          setBlockedDates(newBlocked);
                          triggerToast(
                            language === 'te' 
                              ? `తేదీ ${dateStr} షెడ్యూల్ మార్చబడింది!` 
                              : `Updated rental block status for ${dateStr}!`, 
                            'success'
                          );
                        }}
                        className={`py-3.5 rounded-xl border cursor-pointer transition flex flex-col items-center justify-center gap-1 ${
                          isBlocked 
                            ? 'bg-red-500 text-white border-red-600 font-black shadow-xs' 
                            : 'bg-slate-50 border-slate-100 text-slate-800 hover:bg-slate-100 font-bold'
                        }`}
                      >
                        <span>{dayNum}</span>
                        {isBlocked && (
                          <span className="text-[7.5px] font-black uppercase tracking-tight opacity-90 px-1 bg-red-800/40 rounded">
                            BLOCKED
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
 
              <div className="md:col-span-4 bg-white border border-slate-150 rounded-2xl p-4 space-y-4">
                <p className="text-[10px] font-black text-slate-700 uppercase tracking-widest">
                  🚫 {language === 'te' ? 'బ్లాక్ చేయబడిన రోజుల జాబితా' : 'Blocked Schedule Register'}
                </p>

                <div className="flex gap-1.5">
                  <input 
                    type="date" 
                    value={tempDateToBlock} 
                    onChange={(e) => setTempDateToBlock(e.target.value)} 
                    className="flex-1 text-xs border border-slate-150 rounded-xl px-2.5 py-1.5 font-bold" 
                  />
                  <button 
                    onClick={() => {
                      if (!tempDateToBlock) return;
                      const identifier = calendarSelectedEqId === 'all' ? `all_${tempDateToBlock}` : `${calendarSelectedEqId}_${tempDateToBlock}`;
                      if (blockedDates.includes(identifier)) {
                        triggerToast(language === 'te' ? 'తేదీ ముందే బ్లాక్ చేయబడింది.' : 'Date already blocked.', 'error');
                        return;
                      }
                      setBlockedDates([...blockedDates, identifier]);
                      setTempDateToBlock('');
                      triggerToast(language === 'te' ? 'తేదీ విజయవంతంగా బ్లాక్ చేయబడింది!' : 'Selected date blocked successfully!', 'success');
                    }} 
                    className="bg-[#1b6d24] text-white text-[10px] font-black px-3.5 py-1.5 rounded-xl cursor-pointer"
                  >
                    Block
                  </button>
                </div>
 
                <div className="space-y-1.5 max-h-[220px] overflow-y-auto">
                  {blockedDates.map(item => {
                    // Parse if the item has eqId prefix or not
                    const hasPrefix = item.includes('_');
                    const [eqId, date] = hasPrefix ? item.split('_') : ['all', item];
                    
                    const matchedEq = equipmentList.find(eq => eq.id === eqId);
                    const eqName = eqId === 'all' 
                      ? (language === 'te' ? 'అన్ని యంత్రాలు' : 'All Machinery') 
                      : (matchedEq ? (language === 'te' ? matchedEq.title : (matchedEq.titleEn || matchedEq.title)) : (language === 'te' ? 'నిర్దిష్ట యంత్రం' : 'Specific Machinery'));

                    return (
                      <div key={item} className="flex justify-between items-center text-[10px] bg-red-50 text-red-800 p-2.5 rounded-xl border border-red-100">
                        <div className="text-left space-y-0.5">
                          <p className="font-mono font-black">{date}</p>
                          <p className="text-[8.5px] font-extrabold text-red-700/80 line-clamp-1">{eqName}</p>
                        </div>
                        <button 
                          onClick={() => {
                            setBlockedDates(blockedDates.filter(d => d !== item));
                            triggerToast(language === 'te' ? 'తేదీ తిరిగి అనుమతించబడింది.' : 'Date released for rentals.', 'info');
                          }} 
                          className="text-[9px] hover:underline uppercase text-red-950 font-black cursor-pointer bg-red-200/50 hover:bg-red-200 px-2 py-1 rounded"
                        >
                          Release
                        </button>
                      </div>
                    );
                  })}
                  {blockedDates.length === 0 && (
                    <p className="text-[10px] text-slate-400 italic text-center py-6">
                      {language === 'te' ? 'ఎటువంటి బ్లాక్ చేసిన తేదీలు లేవు.' : 'No active schedule blockouts.'}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

      </main>
    </div>
  );
}
