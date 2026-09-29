import React, { useState, useEffect } from 'react';
import { 
  Home, Search, Info, Calendar, FileText, CreditCard, History, 
  Heart, MessageSquare, Bell, Star, Settings, CheckCircle2, 
  Trash2, MapPin, Phone, UserCheck, Shield, ChevronRight,
  Loader2, Printer, ArrowRight, CornerDownRight, ThumbsUp, Send, User, ChevronDown, Clock, Minus, Plus, Camera,
  Download, Receipt, RotateCcw, Check, Filter, X, Eye, ExternalLink
} from 'lucide-react';
import { Equipment, Chat, FarmerProfile, CategoryType } from '../types';
import MessagesView from './MessagesView';
import { DISTRICTS } from '../data';
import { StarRating } from './StarRating';
import { saveNewReview } from '../reviewData';
import { processBookingChat, ensureBookedEquipmentChatsExist } from '../bookingChatService';

interface FarmerDashboardProps {
  user: FarmerProfile;
  equipmentList: Equipment[];
  chats: Chat[];
  language: 'te' | 'en';
  onSignOut: () => void;
  updateEquipment: (newList: Equipment[]) => void;
  updateUserProfile: (newProfile: FarmerProfile) => void;
  onSendMessage: (chatId: string, text: string) => void;
  onReceiveReply: (chatId: string, text: string) => void;
  onMarkAsRead: (chatId: string) => void;
  onDeleteChat: (chatId: string) => void;
  onDeleteMessage?: (chatId: string, messageId: string, type: 'for-me' | 'for-everyone') => void;
  updateChatsList?: (chats: Chat[]) => void;
  triggerToast: (text: string, type: 'success' | 'info' | 'error') => void;
}

// Pre-defined static notifications for realistic farming updates
export interface FarmNotification {
  id: string;
  title: string;
  titleEn: string;
  msg: string;
  msgEn: string;
  time: string;
  read: boolean;
  type: 'alert' | 'success' | 'info';
}

// App onboarding & feature notifications for new registered/logged-in users
export const APP_ONBOARDING_NOTIFICATIONS: FarmNotification[] = [
  {
    id: 'notif_welcome',
    title: 'రైతు వేదికకు స్వాగతం!',
    titleEn: 'Welcome to E-Raitu Vedika!',
    type: 'success',
    msg: 'ఈ రైతు వేదిక సహకార వ్యవసాయ యంత్రాల పోర్టల్‌లో సభ్యత్వం పొందినందుకు అభినందనలు. మీ పొలాలకు అవసరమైన ట్రాక్టర్లు, హార్వెస్టర్లు, స్ప్రేయర్లను పారదర్శకమైన అద్దె ధరలకు పొందండి.',
    msgEn: 'Welcome to E-Raitu Vedika Cooperative Agricultural Machinery Portal! Rent modern tractors, harvesters, and sprayers at affordable cooperative rates.',
    time: 'ఇప్పుడే (Just now)',
    read: false
  },
  {
    id: 'notif_how_to_rent',
    title: 'యంత్రాలు ఎలా అద్దెకు తీసుకోవాలి?',
    titleEn: 'How to Book Farm Equipment',
    type: 'info',
    msg: 'హోమ్ పేజీ లేదా శోధనలో యంత్రాన్ని ఎంచుకుని, "ఇప్పుడే బుక్ చేయండి" క్లిక్ చేయండి. వ్యవధి (గంటలు/రోజులు) మరియు మీ పొలం చిరునామా ఎంచుకుంటే యజమాని నేరుగా రవాణా చేస్తారు.',
    msgEn: 'Browse tractors or implements, tap "Book Now", choose your working duration and field delivery location. The owner coordinates direct field dispatch.',
    time: 'ఈరోజే (Today)',
    read: false
  },
  {
    id: 'notif_subsidies',
    title: 'సహకార సంఘం సభ్యత్వ ప్రయోజనాలు',
    titleEn: 'Cooperative Member Subsidies',
    type: 'info',
    msg: 'ఈ రైతు వేదికలో నమోదైన రైతులకు మధ్యవర్తుల కమీషన్లు ఉండవు. డీజిల్ మరియు అద్దెపై ప్రత్యేక సహకార రాయితీలు మరియు ప్రభుత్వ మార్గదర్శకాలు వర్తిస్తాయి.',
    msgEn: 'Registered cooperative members enjoy zero middleman fees, transparent rental tariffs, and verified equipment condition.',
    time: 'ఈరోజే (Today)',
    read: false
  },
  {
    id: 'notif_support',
    title: 'రైతు హెల్ప్‌లైన్ & మద్దతు (24x7 Support)',
    titleEn: 'Farmer Helpline & Field Support',
    type: 'info',
    msg: 'మీకు బుకింగ్స్ లేదా రవాణాలో ఏ సహాయం కావాలన్నా యాప్‌లోని "హెల్ప్ & సపోర్ట్" లేదా టోల్-ఫ్రీ 1800-425-1555 ద్వారా సంప్రదించవచ్చు.',
    msgEn: 'For booking assistance, driver queries, or feedback, visit the Help & Support page or call our toll-free farmer helpline 1800-425-1555.',
    time: 'ఈరోజే (Today)',
    read: true
  }
];

interface FarmReview {
  id: string;
  equipmentId: string;
  equipmentTitle: string;
  farmerName: string;
  rating: number;
  comment: string;
  date: string;
}

interface FarmPayment {
  id: string;
  equipmentTitle: string;
  amount: number;
  date: string;
  status: 'Completed' | 'Pending' | 'Refunded';
  txId: string;
  method: string;
}

export interface PastRentalRecord {
  id: string;
  bookingCode: string;
  equipmentId: string;
  equipmentTitle: string;
  equipmentTitleEn: string;
  category: string;
  categoryLabel: string;
  imageUrl: string;
  ownerName: string;
  ownerPhone: string;
  location: string;
  locationEn: string;
  bookingDate: string;
  completedDate: string;
  duration: number;
  rateType: 'hour' | 'day';
  rateTypeLabel: string;
  ratePrice: number;
  totalPaid: number;
  driverIncluded: boolean;
  workDescription: string;
  workDescriptionEn: string;
  status: 'completed' | 'returned' | 'in_progress';
  paymentTxId: string;
  paymentMethod: string;
  paymentDate: string;
  rating?: number;
  reviewText?: string;
}

export const INITIAL_RENTAL_HISTORY: PastRentalRecord[] = [
  {
    id: 'rent_01',
    bookingCode: 'RV-BOK-8921',
    equipmentId: 'eq1',
    equipmentTitle: 'మహీంద్రా జీవో 245 DI 4WD ట్రాక్టర్',
    equipmentTitleEn: 'Mahindra Jivo 245 DI 4WD Tractor',
    category: 'Tractor',
    categoryLabel: 'ట్రాక్టర్',
    imageUrl: 'https://assets.khetigaadi.com/tr:h-350,w-500/new-tractor/Mahindra-JIVO-245-DI-4WD1735712127_mCvMHPx10X.png',
    ownerName: 'కిరణ్ కుమార్',
    ownerPhone: '9440123456',
    location: 'అనంతపురము / బుక్కరాయసముద్రం',
    locationEn: 'Anantapuramu / Bukkarayasamudram',
    bookingDate: '2026-06-03',
    completedDate: '2026-06-05',
    duration: 4,
    rateType: 'hour',
    rateTypeLabel: 'గంట',
    ratePrice: 1100,
    totalPaid: 4400,
    driverIncluded: true,
    workDescription: 'మెట్ట నేల దుక్కి మరియు కల్టివేటర్ పని సజావుగా పూర్తయింది',
    workDescriptionEn: 'Dryland cultivation and harrowing completed smoothly',
    status: 'completed',
    paymentTxId: 'RV-UPI-481920392182',
    paymentMethod: 'UPI (PhonePe)',
    paymentDate: '2026-06-03',
    rating: 5,
    reviewText: 'చాలా అద్భుతమైన ట్రాక్టర్. తక్కువ మైలేజ్ లో ఎక్కువ విస్తీర్ణం దున్నింది.'
  },
  {
    id: 'rent_02',
    bookingCode: 'RV-BOK-7412',
    equipmentId: 'eq2',
    equipmentTitle: 'కుబోటా హార్వెస్టర్ DC-68G',
    equipmentTitleEn: 'Kubota Harvester DC-68G',
    category: 'Harvester',
    categoryLabel: 'హార్వెస్టర్',
    imageUrl: 'https://5.imimg.com/data5/BR/IH/FT/GLADMIN-22469/kubota-harvesking-dc-68g-900-x-1903-mm-combine-harvester.png',
    ownerName: 'గోవింద్ రావు',
    ownerPhone: '9848023456',
    location: 'అనంతపురము / అనంతపురం అర్బన్',
    locationEn: 'Anantapuramu / Anantapur Urban',
    bookingDate: '2026-05-26',
    completedDate: '2026-05-28',
    duration: 3,
    rateType: 'hour',
    rateTypeLabel: 'గంట',
    ratePrice: 2700,
    totalPaid: 8100,
    driverIncluded: true,
    workDescription: 'వరి కోత మరియు నూర్పిడి వేగంగా పూర్తయింది, ధాన్యం నష్టం లేదు',
    workDescriptionEn: 'Paddy harvesting & threshing done with zero grain loss',
    status: 'completed',
    paymentTxId: 'RV-CRD-820938120392',
    paymentMethod: 'Coop-Credit',
    paymentDate: '2026-05-26',
    rating: 4.8,
    reviewText: 'వరి కోత చాలా పరిపూర్ణంగా జరిగింది. గింజలు చాలా తక్కువగా నష్టపడ్డాయి.'
  },
  {
    id: 'rent_03',
    bookingCode: 'RV-BOK-6190',
    equipmentId: 'eq3',
    equipmentTitle: 'హై ప్రెషర్ పవర్ స్ప్రేయర్ STIHL SG 20',
    equipmentTitleEn: 'STIHL SG 20 Power Sprayer',
    category: 'Sprayer',
    categoryLabel: 'స్ప్రేయర్',
    imageUrl: 'https://cdn11.bigcommerce.com/s-ncw6oteeon/images/stencil/1280x1280/products/1427992/2018954/75004__60702.1770407213.jpg?c=1',
    ownerName: 'సాయి మోహన్',
    ownerPhone: '9949112233',
    location: 'అనంతపురము / బుక్కరాయసముద్రం',
    locationEn: 'Anantapuramu / Bukkarayasamudram',
    bookingDate: '2026-05-18',
    completedDate: '2026-05-18',
    duration: 1,
    rateType: 'day',
    rateTypeLabel: 'రోజు',
    ratePrice: 1700,
    totalPaid: 1700,
    driverIncluded: false,
    workDescription: 'మిరప తోటకి మరియు పత్తికి పురుగు మందు పిచికారీ విజయవంతం',
    workDescriptionEn: 'Pest spray application across 4 acres chilli farm',
    status: 'returned',
    paymentTxId: 'RV-CSH-981203982012',
    paymentMethod: 'Cash on Delivery',
    paymentDate: '2026-05-18',
    rating: 5,
    reviewText: '100 మీటర్ల పొడవైన పైపు ఉండటం వలన మా మిరప తోటకి మందు చల్లడం ఎంతో సులువైంది.'
  },
  {
    id: 'rent_04',
    bookingCode: 'RV-BOK-5521',
    equipmentId: 'eq4',
    equipmentTitle: 'జాన్ డీర్ 5050 D 4WD ట్రాక్టర్',
    equipmentTitleEn: 'John Deere 5050 D 4WD Tractor',
    category: 'Tractor',
    categoryLabel: 'ట్రాక్టర్',
    imageUrl: 'https://tractorkarvan.com/storage/images/JD/New-Model/5050-D-GearPro-4WD.jpg',
    ownerName: 'రాఘవ రెడ్డి',
    ownerPhone: '9391044556',
    location: 'అనంతపురము / అనంతపురం అర్బన్',
    locationEn: 'Anantapuramu / Anantapur Urban',
    bookingDate: '2026-05-02',
    completedDate: '2026-05-04',
    duration: 4,
    rateType: 'hour',
    rateTypeLabel: 'గంట',
    ratePrice: 1200,
    totalPaid: 4800,
    driverIncluded: true,
    workDescription: 'వేరుశనగ నాటు వేయుటకు లోతైన నాగలి దుక్కి',
    workDescriptionEn: 'Deep plowing and soil aeration for groundnut planting',
    status: 'returned',
    paymentTxId: 'RV-UPI-991204812390',
    paymentMethod: 'UPI (GPay)',
    paymentDate: '2026-05-02',
    rating: 4.9,
    reviewText: 'శక్తివంతమైన ఇంజిన్. నల్లరేగడి నేలలో కూడా వేగంగా పనిచేసింది.'
  },
  {
    id: 'rent_05',
    bookingCode: 'RV-BOK-4389',
    equipmentId: 'eq5',
    equipmentTitle: 'శక్తిమాన్ రెగ్యులర్ లైట్ రోటవేటర్ 6 అడుగులు',
    equipmentTitleEn: 'Shaktiman Regular Light Rotavator 6ft',
    category: 'Rotavator',
    categoryLabel: 'రోటవేటర్',
    imageUrl: 'https://tractorguru.in/blog/wp-content/uploads/2021/02/unnamed.jpg',
    ownerName: 'వెంకటేశ్వర్లు',
    ownerPhone: '9177234567',
    location: 'అనంతపురము / బుక్కరాయసముద్రం',
    locationEn: 'Anantapuramu / Bukkarayasamudram',
    bookingDate: '2026-04-14',
    completedDate: '2026-04-14',
    duration: 2,
    rateType: 'hour',
    rateTypeLabel: 'గంట',
    ratePrice: 1500,
    totalPaid: 3000,
    driverIncluded: false,
    workDescription: 'వరి నారుమడి సిద్ధం చేయడం కొరకు మట్టిని మెత్తగా పొడి చేయడం',
    workDescriptionEn: 'Soil clod crushing and fine nursery bed preparation',
    status: 'completed',
    paymentTxId: 'RV-UPI-331298402911',
    paymentMethod: 'UPI (Paytm)',
    paymentDate: '2026-04-14',
    rating: 4.7,
    reviewText: 'బ్లేడ్లు చాలా పదునుగా ఉన్నాయి, తక్కువ సమయంలో పని అయిపోయింది.'
  }
];

export default function FarmerDashboard({
  user,
  equipmentList,
  chats,
  language,
  onSignOut,
  updateEquipment,
  updateUserProfile,
  onSendMessage,
  onReceiveReply,
  onMarkAsRead,
  onDeleteChat,
  onDeleteMessage,
  updateChatsList,
  triggerToast
}: FarmerDashboardProps) {
  
  // 14-page state machine
  type PageId = 
    | 'dashboard_home' | 'search_equipment' | 'equipment_details' 
    | 'my_bookings' | 'rental_history' | 'booking_details' | 'payment_page' 
    | 'payment_history' | 'favorite_equipment' | 'messages_chat' 
    | 'notifications' | 'reviews_ratings' | 'list_my_tools' | 'profile_settings';

  const [activePage, setActivePage] = useState<PageId>('dashboard_home');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Search equipment states
  const [searchKeyword, setSearchKeyword] = useState('');
  const [searchDistrict, setSearchDistrict] = useState('');
  const [searchMaxPrice, setSearchMaxPrice] = useState(5000);
  const [avatarInputUrl, setAvatarInputUrl] = useState('');

  // Deep detail selection variables
  const [selectedEqId, setSelectedEqId] = useState<string | null>(null);
  const [activeBookingId, setActiveBookingId] = useState<string | null>(null);
  const [checkoutEqId, setCheckoutEqId] = useState<string | null>(null);
  const [activeChatId, setActiveChatId] = useState<string | null>(null);

  // Auto-sync booking chats with owner details and confirmation response for any booked equipment
  useEffect(() => {
    if (!user.bookedEquipmentIds || user.bookedEquipmentIds.length === 0) return;
    const ensured = ensureBookedEquipmentChatsExist(
      user.bookedEquipmentIds,
      equipmentList,
      chats,
      user,
      language
    );
    if (ensured.length !== chats.length) {
      if (updateChatsList) {
        updateChatsList(ensured);
      } else {
        localStorage.setItem('rv_chats', JSON.stringify(ensured));
      }
    }
  }, [user.bookedEquipmentIds, equipmentList, language]);

  // Rent Out My Gear Form States inside FarmerDashboard
  const [showAddForm, setShowAddForm] = useState(false);
  const [toolTitle, setToolTitle] = useState('');
  const [toolTitleEn, setToolTitleEn] = useState('');
  const [toolCategory, setToolCategory] = useState<CategoryType>('other');
  const [toolPrice, setToolPrice] = useState('');
  const [toolRateType, setToolRateType] = useState<'day' | 'hour'>('day');
  const [toolImageUrl, setToolImageUrl] = useState('');
  const [toolDesc, setToolDesc] = useState('');
  const [toolDescEn, setToolDescEn] = useState('');
  const [toolHP, setToolHP] = useState('');
  const [toolFuel, setToolFuel] = useState('Diesel');
  const [toolDriver, setToolDriver] = useState(false);

  // User-scoped storage key to ensure new users start with a clean slate
  const userStorageKey = (user.phone ? user.phone.replace(/\D/g, '') : (user.id || user.uid || 'guest')) || 'default';
  const isDemoReviewer = userStorageKey === '9866012345' && (user.name || '').includes('Simulated');

  // Local persistent states - clean slate for new & registered users
  const [favorites, setFavorites] = useState<string[]>(() => {
    const userSpecific = localStorage.getItem(`rv_favorites_${userStorageKey}`);
    if (userSpecific) {
      try { return JSON.parse(userSpecific); } catch (_) {}
    }
    // New users start completely clean with no favorites
    return [];
  });

  const [notifications, setNotifications] = useState<FarmNotification[]>(() => {
    const userSpecific = localStorage.getItem(`rv_notifications_${userStorageKey}`);
    if (userSpecific) {
      try {
        const parsed = JSON.parse(userSpecific);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch (_) {}
    }
    // New users get clean app introductory and feature guide notifications
    return APP_ONBOARDING_NOTIFICATIONS;
  });

  const [reviews, setReviews] = useState<FarmReview[]>(() => {
    const saved = localStorage.getItem('rv_reviews');
    if (saved) return JSON.parse(saved);
    return [
      { id: 'r1', equipmentId: 'eq1', equipmentTitle: 'Mahindra Jivo 245 DI', farmerName: 'రాంబాబు నాయుడు', rating: 5, comment: 'చాలా అద్భుతమైన ట్రాక్టర్. తక్కువ మైలేజ్ లో ఎక్కువ విస్తీర్ణం దున్నింది.', date: '2026-06-05' },
      { id: 'r2', equipmentId: 'eq2', equipmentTitle: 'Kubota Harvester', farmerName: 'గోవింద్ రావు', rating: 4, comment: 'వరి కోత చాలా పరిపూర్ణంగా జరిగింది. గింజలు చాలా తక్కువగా నష్టపడ్డాయి.', date: '2026-05-28' },
      { id: 'r3', equipmentId: 'eq3', equipmentTitle: 'Power Sprayer', farmerName: 'సాయి మోహన్', rating: 5, comment: '100 మీటర్ల పొడవైన పైపు ఉండటం వలన మా మిరప తోటకి మందు చల్లడం ఎంతో సులువైంది.', date: '2026-06-01' }
    ];
  });

  const [payments, setPayments] = useState<FarmPayment[]>(() => {
    const userSpecific = localStorage.getItem(`rv_payments_${userStorageKey}`);
    if (userSpecific) {
      try { return JSON.parse(userSpecific); } catch (_) {}
    }
    // New users start with 0 payments
    return [];
  });

  // Rental History state (Past bookings & completed transactions)
  const [rentalHistory, setRentalHistory] = useState<PastRentalRecord[]>(() => {
    const userSpecific = localStorage.getItem(`rv_rental_history_${userStorageKey}`);
    if (userSpecific) {
      try {
        const parsed: PastRentalRecord[] = JSON.parse(userSpecific);
        if (Array.isArray(parsed)) return parsed;
      } catch (_) {}
    }
    // New users start with 0 rental history
    return [];
  });

  const [rentalHistoryTab, setRentalHistoryTab] = useState<'all' | 'past_bookings' | 'transactions'>('past_bookings');
  const [rentalSearchKeyword, setRentalSearchKeyword] = useState('');
  const [rentalStatusFilter, setRentalStatusFilter] = useState<'all' | 'completed' | 'returned' | 'in_progress'>('all');
  const [rentalPaymentFilter, setRentalPaymentFilter] = useState<'all' | 'upi' | 'credit' | 'cod'>('all');
  const [selectedRentalReceipt, setSelectedRentalReceipt] = useState<PastRentalRecord | null>(null);

  // Review Form state
  const [newReviewEqId, setNewReviewEqId] = useState('');
  const [newRating, setNewRating] = useState(5);
  const [newReviewComment, setNewReviewComment] = useState('');

  // Payment checkout helper states
  const [paymentChoice, setPaymentChoice] = useState<'upi' | 'credit' | 'cod'>('upi');
  const [upiMethod, setUpiMethod] = useState<'gpay' | 'phonepe' | 'paytm'>('phonepe');
  const [paymentProcessing, setPaymentProcessing] = useState(false);
  const [paymentDone, setPaymentDone] = useState(false);

  // Chat message dynamic input
  const [msgInputText, setMsgInputText] = useState('');

  // Dynamic booking duration and conversation pre-fill states
  const [duration, setDuration] = useState<number>(4);
  const [customMessage, setCustomMessage] = useState<string>('');

  // Memoise sorted equipment according to logged in user's mandal & district
  const sortedNearbyEquipment = React.useMemo(() => {
    const userDistrict = user.district || user.location || '';
    const userMandal = user.mandal || '';
    if (!userDistrict && !userMandal) return equipmentList;

    const districtLower = userDistrict.toLowerCase();
    const mandalLower = userMandal.toLowerCase();

    return [...equipmentList].sort((a, b) => {
      // Priority 1: Mandal match
      const aMandalMatch = mandalLower && (
        (a.mandal && a.mandal.toLowerCase().includes(mandalLower)) ||
        (a.location && a.location.toLowerCase().includes(mandalLower)) ||
        (a.locationEn && a.locationEn.toLowerCase().includes(mandalLower))
      );
      const bMandalMatch = mandalLower && (
        (b.mandal && b.mandal.toLowerCase().includes(mandalLower)) ||
        (b.location && b.location.toLowerCase().includes(mandalLower)) ||
        (b.locationEn && b.locationEn.toLowerCase().includes(mandalLower))
      );
      if (aMandalMatch && !bMandalMatch) return -1;
      if (!aMandalMatch && bMandalMatch) return 1;

      // Priority 2: District match
      const aDistMatch = districtLower && (
        (a.location && a.location.toLowerCase().includes(districtLower)) || 
        (a.district && a.district.toLowerCase().includes(districtLower)) || 
        (a.locationEn && a.locationEn.toLowerCase().includes(districtLower))
      );
      const bDistMatch = districtLower && (
        (b.location && b.location.toLowerCase().includes(districtLower)) || 
        (b.district && b.district.toLowerCase().includes(districtLower)) || 
        (b.locationEn && b.locationEn.toLowerCase().includes(districtLower))
      );
      if (aDistMatch && !bDistMatch) return -1;
      if (!aDistMatch && bDistMatch) return 1;

      return 0;
    });
  }, [equipmentList, user.district, user.location, user.mandal]);

  const getBookingDuration = (eqId: string, rateType: 'hour' | 'day') => {
    try {
      const saved = localStorage.getItem('rv_booking_durations');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed[eqId]) return parsed[eqId];
      }
    } catch (e) {}
    return rateType === 'day' ? 3 : 5;
  };

  const getBookingLocation = (eqId: string) => {
    try {
      const saved = localStorage.getItem('rv_booking_locations');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed[eqId]) return parsed[eqId];
      }
    } catch (e) {}
    const userDist = user.district || user.location || 'గుంటూరు';
    const userMand = user.mandal || 'గుంటూరు';
    const userVill = user.village || 'సమీప గ్రామం';
    return language === 'te' 
      ? `${userDist} Dist | Mandal: ${userMand} | Village: ${userVill} | GPS: [16.3067° N, 80.4365° E]`
      : `${userDist} Dist | Mandal: ${userMand} | Village: ${userVill} | GPS: [16.3067° N, 80.4365° E]`;
  };

  // Sync state when user switches (e.g. login or register fresh session)
  useEffect(() => {
    const userRentalKey = `rv_rental_history_${userStorageKey}`;
    const userPaymentKey = `rv_payments_${userStorageKey}`;
    const userFavKey = `rv_favorites_${userStorageKey}`;
    const userNotifKey = `rv_notifications_${userStorageKey}`;

    const savedRentals = localStorage.getItem(userRentalKey);
    setRentalHistory(savedRentals ? JSON.parse(savedRentals) : []);

    const savedPayments = localStorage.getItem(userPaymentKey);
    setPayments(savedPayments ? JSON.parse(savedPayments) : []);

    const savedFavs = localStorage.getItem(userFavKey);
    setFavorites(savedFavs ? JSON.parse(savedFavs) : []);

    const savedNotifs = localStorage.getItem(userNotifKey);
    setNotifications(savedNotifs ? JSON.parse(savedNotifs) : APP_ONBOARDING_NOTIFICATIONS);
  }, [userStorageKey]);

  // Sync state helpers
  useEffect(() => {
    localStorage.setItem(`rv_favorites_${userStorageKey}`, JSON.stringify(favorites));
    localStorage.setItem('rv_favorites', JSON.stringify(favorites));
  }, [favorites, userStorageKey]);

  useEffect(() => {
    localStorage.setItem(`rv_notifications_${userStorageKey}`, JSON.stringify(notifications));
    localStorage.setItem('rv_notifications', JSON.stringify(notifications));
  }, [notifications, userStorageKey]);

  useEffect(() => {
    localStorage.setItem('rv_reviews', JSON.stringify(reviews));
  }, [reviews]);

  useEffect(() => {
    localStorage.setItem(`rv_payments_${userStorageKey}`, JSON.stringify(payments));
    localStorage.setItem('rv_payments', JSON.stringify(payments));
  }, [payments, userStorageKey]);

  useEffect(() => {
    localStorage.setItem(`rv_rental_history_${userStorageKey}`, JSON.stringify(rentalHistory));
    localStorage.setItem('rv_rental_history', JSON.stringify(rentalHistory));
  }, [rentalHistory, userStorageKey]);

  // Handle equipment details redirection
  const showEquipmentDetails = (id: string) => {
    setSelectedEqId(id);
    setActivePage('equipment_details');
  };

  // Toggle Favorite
  const toggleFavorite = (id: string) => {
    if (favorites.includes(id)) {
      setFavorites(favorites.filter(fav => fav !== id));
      triggerToast(language === 'te' ? 'ఇష్టమైన పొజిషన్ నుండి తొలగించబడింది.' : 'Removed from bookmarks list.', 'info');
    } else {
      setFavorites([...favorites, id]);
      triggerToast(language === 'te' ? 'ఇష్టమైన జాబితాకు జోడించబడింది!' : 'Saved to favorites list!', 'success');
    }
  };

  // Check out helper
  const navigateToCheckout = (eqId: string) => {
    const eq = equipmentList.find(e => e.id === eqId);
    if (eq) {
      const defaultDur = eq.rateType === 'day' ? 3 : 5;
      setDuration(defaultDur);
      setCustomMessage(language === 'te' 
        ? `నమస్తే సార్, నేను మీ ${eq.title} వ్యవసాయ యంత్రాన్ని బుకింగ్ చేసాను. దయచేసి కాస్త మాట్లాడగలరు.`
        : `Hello, I rented your ${eq.titleEn || eq.title}. Let's chat regarding dispatch coordinates.`);
    }
    setCheckoutEqId(eqId);
    setPaymentDone(false);
    setPaymentProcessing(false);
    setActivePage('payment_page');
  };

  // Run payment simulation
  const handleProcessPayment = (e: React.FormEvent, eq: Equipment) => {
    e.preventDefault();
    setPaymentProcessing(true);
    
    setTimeout(() => {
      setPaymentProcessing(false);
      setPaymentDone(true);
      
      // Add transaction
      const newTx: FarmPayment = {
        id: `tx_${Date.now()}`,
        equipmentTitle: language === 'te' ? eq.title : (eq.titleEn || eq.title),
        amount: eq.price * duration,
        date: new Date().toISOString().split('T')[0],
        status: 'Completed',
        txId: `RV-TX-${Math.floor(100000 + Math.random() * 900000)}`,
        method: paymentChoice === 'upi' ? `UPI (${upiMethod.toUpperCase()})` : paymentChoice === 'credit' ? 'Coop-Credit' : 'Cash on Delivery'
      };
      
      setPayments([newTx, ...payments]);

      // Add to Rental History
      const newRentalRecord: PastRentalRecord = {
        id: `rent_${Date.now()}`,
        bookingCode: `RV-BOK-${Math.floor(1000 + Math.random() * 9000)}`,
        equipmentId: eq.id,
        equipmentTitle: eq.title,
        equipmentTitleEn: eq.titleEn || eq.title,
        category: eq.category,
        categoryLabel: eq.categoryLabel || eq.category,
        imageUrl: eq.imageUrl,
        ownerName: eq.ownerName,
        ownerPhone: eq.ownerPhone,
        location: eq.location,
        locationEn: eq.locationEn || eq.location,
        bookingDate: new Date().toISOString().split('T')[0],
        completedDate: new Date(Date.now() + duration * 86400000).toISOString().split('T')[0],
        duration: duration,
        rateType: eq.rateType || 'day',
        rateTypeLabel: eq.rateTypeLabel || (eq.rateType === 'day' ? 'రోజు' : 'గంట'),
        ratePrice: eq.price,
        totalPaid: eq.price * duration,
        driverIncluded: eq.includesDriver || false,
        workDescription: language === 'te' ? 'రైతు వేదిక ద్వారా బుక్ చేయబడిన వ్యవసాయ పని' : 'Field work booked via Raitu Vedika portal',
        workDescriptionEn: 'Field work booked via Raitu Vedika portal',
        status: 'in_progress',
        paymentTxId: newTx.txId,
        paymentMethod: newTx.method,
        paymentDate: newTx.date
      };

      setRentalHistory(prev => [newRentalRecord, ...prev]);

      // Save rental duration in local db
      try {
        const saved = localStorage.getItem('rv_booking_durations');
        const parsed = saved ? JSON.parse(saved) : {};
        parsed[eq.id] = duration;
        localStorage.setItem('rv_booking_durations', JSON.stringify(parsed));
      } catch (err) {}

      // Automatically construct owner chat with official booking details and owner response
      const totalPaid = eq.price * duration;
      const { updatedChats, targetChatId } = processBookingChat(chats, {
        equipment: eq,
        farmer: user,
        duration,
        rateType: eq.rateType || 'day',
        deliveryLocation: user.location,
        totalCost: totalPaid,
        language,
        customNote: customMessage.trim()
      });

      if (updateChatsList) {
        updateChatsList(updatedChats);
      } else {
        localStorage.setItem('rv_chats', JSON.stringify(updatedChats));
      }
      setActiveChatId(targetChatId);

      // Add state update in main applet to mark as booked
      const updated = equipmentList.map((item) => {
        if (item.id === eq.id) {
          return {
            ...item,
            status: 'booked' as const,
            statusLabel: language === 'te' ? 'బుకింగ్ చేయబడింది' : 'Booked'
          };
        }
        return item;
      });
      updateEquipment(updated);

      // Add to user profile booked lists
      const updatedUser = {
        ...user,
        bookedEquipmentIds: Array.from(new Set([...user.bookedEquipmentIds, eq.id]))
      };
      updateUserProfile(updatedUser);

      // Create booking ID setup and send notification
      const newNotification: FarmNotification = {
        id: `n_${Date.now()}`,
        title: 'చెల్లింపు విజయవంతమైంది!',
        titleEn: 'Payment Received Successfully!',
        type: 'success',
        msg: `మీ ${eq.title} బుకింగ్ నిర్ధారించబడింది. చెల్లింపు రసీదు జారీ చేయబడింది.`,
        msgEn: `Your payment was accepted for ${eq.titleEn || eq.title}. Official receipt generated.`,
        time: 'Just Now',
        read: false
      };
      setNotifications([newNotification, ...notifications]);

      triggerToast(language === 'te' ? 'చెల్లింపు విజయవంతమైంది!' : 'Receipt Generated & Paid Successfully!', 'success');
      
      // Redirect to Booking Details for the newly booked item
      setActiveBookingId(eq.id);
      setActivePage('booking_details');
    }, 2000);
  };

  const activeEquipment = selectedEqId 
    ? (equipmentList.find(e => e.id === selectedEqId) || equipmentList[0] || null) 
    : (equipmentList[0] || null);
  const activeBookingEq = activeBookingId ? equipmentList.find(e => e.id === activeBookingId) : null;
  const activeCheckoutEq = checkoutEqId ? equipmentList.find(e => e.id === checkoutEqId) : null;

  // Custom multi-star click handler
  const submitReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newReviewEqId) {
      triggerToast(language === 'te' ? 'దయచేసి పరికరాన్ని ఎంచుకోండి.' : 'Please select an equipment to rate.', 'error');
      return;
    }
    const matchedEq = equipmentList.find(eq => eq.id === newReviewEqId);
    if (!matchedEq) return;

    const newRevObj: FarmReview = {
      id: `r_${Date.now()}`,
      equipmentId: newReviewEqId,
      equipmentTitle: matchedEq.titleEn || matchedEq.title,
      farmerName: user.name,
      rating: newRating,
      comment: newReviewComment || 'Perfect service & very reliable utility.',
      date: new Date().toISOString().split('T')[0]
    };

    setReviews([newRevObj, ...reviews]);
    setNewReviewComment('');

    // Save to centralized reviews database & update equipment rating
    const saveResult = saveNewReview({
      equipmentId: newReviewEqId,
      farmerName: user.name,
      farmerPhone: user.phone,
      farmerId: user.id || user.uid,
      farmerLocation: user.location,
      rating: newRating,
      comment: newReviewComment || 'Very good experience with this equipment.',
      rentalExperience: 'దుక్కి (Plowing / Field Work)'
    });

    if (saveResult && saveResult.newAverage !== undefined) {
      const updatedList = equipmentList.map(eq => {
        if (eq.id === newReviewEqId) {
          return {
            ...eq,
            rating: saveResult.newAverage,
            reviewCount: saveResult.totalReviews
          };
        }
        return eq;
      });
      updateEquipment(updatedList);
    }

    triggerToast(language === 'te' ? 'సమీక్ష విజయవంతంగా నమోదు చేయబడింది!' : 'Thank you for your rating & review!', 'success');
  };

  // Count unread alerts
  const unreadCount = notifications.filter(n => !n.read).length;

  const handleSendMessageSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!msgInputText.trim() || !activeChatId) return;

    onSendMessage(activeChatId, msgInputText);
    const textSend = msgInputText;
    setMsgInputText('');

    // Simulate direct automatic responses matching Telugu agricultural issues
    setTimeout(() => {
      const activeChat = chats.find(c => c.id === activeChatId);
      if (activeChat) {
        const responsesTe = [
          "సరే సార్, అలాగే మా డ్రైవర్ ఫోన్ చేస్తాడు. ఉదయమే పొలానికి పంపిస్తాను.",
          "చాలా సంతోషం సార్, ధర విషయంలో కాస్త సహాయం చేయగలను.",
          "దయచేసి మీ ఖచ్చితమైన ఊరి చిరునామా కూడా పంపగలరు."
        ];
        const responsesEn = [
          "Got it! My driver will contact you tonight to adjust delivery timing.",
          "Perfect. The fuel is fully tanked, please remember to return it cleaned.",
          "Understood, please verify the soil moisture so we can use tilling discs."
        ];
        const autoText = language === 'te' 
          ? responsesTe[Math.floor(Math.random() * responsesTe.length)]
          : responsesEn[Math.floor(Math.random() * responsesEn.length)];
        onReceiveReply(activeChatId, autoText);
      }
    }, 2000);
  };

  // Nav metadata helper
  const sidebarItems = [
    { id: 'dashboard_home' as const, label: 'డ్యాష్‌బోర్డ్ హోమ్', labelEn: 'Dashboard Home', icon: Home, badge: 0 },
    { id: 'search_equipment' as const, label: 'యంత్రాల శోధన', labelEn: 'Search Equipment', icon: Search, badge: 0 },
    { id: 'equipment_details' as const, label: 'యంత్రం పూర్తి వివరాలు', labelEn: 'Equipment Details', icon: Info, badge: 0 },
    { id: 'my_bookings' as const, label: 'నా బుకింగ్స్', labelEn: 'My Bookings', icon: Calendar, badge: user.bookedEquipmentIds.length },
    { id: 'rental_history' as const, label: 'అద్దె చరిత్ర & లావాదేవీలు', labelEn: 'Rental History', icon: History, badge: rentalHistory.filter(r => r.status === 'completed' || r.status === 'returned').length },
    { id: 'booking_details' as const, label: 'బుకింగ్ రసీదు', labelEn: 'Booking Details', icon: FileText, badge: 0, disabled: !activeBookingId },
    { id: 'payment_page' as const, label: 'చెల్లింపు విధానం', labelEn: 'Payment Page', icon: CreditCard, badge: 0, disabled: !checkoutEqId },
    { id: 'payment_history' as const, label: 'లావాదేవీల రికార్డులు', labelEn: 'Payment History', icon: Receipt, badge: 0 },
    { id: 'favorite_equipment' as const, label: 'ఇష్టమైన యంత్రాలు', labelEn: 'Favorite Equipment', icon: Heart, badge: favorites.length },
    { id: 'list_my_tools' as const, label: 'నా యంత్రాలు (అద్దెకు ఇవ్వండి)', labelEn: 'Rent Out My Machinery', icon: Plus, badge: (user.listedEquipmentIds || []).length },
    { id: 'messages_chat' as const, label: 'మెసేజ్ చాటింగ్', labelEn: 'Messages/Chat', icon: MessageSquare, badge: chats.filter(c => c.unread).length },
    { id: 'notifications' as const, label: 'నోటిఫికేషన్లు', labelEn: 'Notifications', icon: Bell, badge: unreadCount },
    { id: 'reviews_ratings' as const, label: 'సమీక్షలు & రేటింగ్‌లు', labelEn: 'Reviews & Ratings', icon: Star, badge: 0 },
    { id: 'profile_settings' as const, label: 'ప్రొఫైల్ & సెట్టింగ్స్', labelEn: 'Profile & Settings', icon: Settings, badge: 0 }
  ];

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-slate-50 text-slate-800" id="farmer-dashboard-root">
      
      {/* Mobile Sidebar Trigger Nav */}
      <div className="md:hidden bg-[#1b6d24] text-white px-4 py-3 flex items-center justify-between shadow-md">
        <div className="flex items-center gap-2">
          <button 
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-1 px-2 border border-emerald-400 bg-emerald-800 rounded-md text-white text-xs font-bold"
            id="mobile-sidebar-toggle-btn"
          >
            {sidebarOpen ? '✕ మూసివేయి' : '☰ మెనూ'}
          </button>
          <span className="text-xs font-black uppercase tracking-wider">
            {language === 'te' ? 'సహకార రైతు డ్యాష్‌బోర్డ్' : 'Raitu Board'}
          </span>
        </div>

        {/* Display Active Tab Name */}
        <span className="text-[10px] font-black tracking-widest uppercase bg-emerald-800 border border-emerald-400/40 text-emerald-100 px-2.5 py-1 rounded-full">
          {language === 'te' 
            ? sidebarItems.find(i => i.id === activePage)?.label 
            : sidebarItems.find(i => i.id === activePage)?.labelEn}
        </span>
      </div>

      {/* Floating Side Nav Panel */}
      <aside className={`${sidebarOpen ? 'block' : 'hidden'} md:block w-full md:w-80 bg-white border-r border-[#eaf2eb] flex-shrink-0 z-40 transition-all duration-200`}>
        <div className="p-5 border-b border-[#f0f7f1] bg-gradient-to-r from-emerald-50/50 to-white">
          <div className="flex items-center gap-3">
            <img 
              src={user.avatar} 
              alt={user.name} 
              className="w-12 h-12 rounded-full border-2 border-[#1b6d24] object-cover"
              referrerPolicy="no-referrer"
            />
            <div>
              <h3 className="text-xs font-bold tracking-tight text-slate-800">
                {user.name}
              </h3>
              <p className="text-[10px] font-bold text-[#1b6d24] tracking-wider uppercase">
                {language === 'te' ? 'సహకార సభ్యుడు' : 'Cooperative Member'}
              </p>
              <p className="text-[10px] font-mono font-bold text-[#1b6d24] bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 inline-block mt-0.5">
                ID: {user.id || user.uid || user.phone}
              </p>
            </div>
          </div>
        </div>

        {/* Main 12 Links Stack */}
        <nav className="p-3.5 space-y-1">
          {sidebarItems.map((item) => {
            const IconComponent = item.icon;
            const isSelected = activePage === item.id;
            return (
              <button
                key={item.id}
                disabled={item.disabled}
                onClick={() => {
                  if (item.id === 'equipment_details' && !selectedEqId) {
                    setSelectedEqId(equipmentList[0]?.id || 'eq1');
                  }
                  setActivePage(item.id);
                  setSidebarOpen(false);
                }}
                className={`w-full text-left py-2 px-3.5 rounded-xl text-[11px] font-bold tracking-wide transition-all duration-150 flex items-center justify-between group cursor-pointer ${
                  item.disabled 
                    ? 'opacity-35 cursor-not-allowed text-slate-350' 
                    : isSelected
                      ? 'bg-gradient-to-r from-[#1b6d24] to-[#258130] text-white shadow-sm'
                      : 'text-slate-550 hover:bg-[#f6fbf6] hover:text-[#1b6d24]'
                }`}
                id={`dashboard-nav-${item.id}`}
              >
                <div className="flex items-center gap-2.5">
                  <IconComponent className={`w-4 h-4 ${isSelected ? 'text-white' : 'text-slate-400 group-hover:text-[#1b6d24]'}`} />
                  <span>
                    {language === 'te' ? item.label : item.labelEn}
                  </span>
                </div>
                
                {/* Badges or arrows */}
                {item.badge > 0 ? (
                  <span className={`px-1.5 py-0.5 rounded-full text-[9px] font-black ${
                    isSelected ? 'bg-white text-[#1b6d24]' : 'bg-red-500 text-white animate-pulse'
                  }`}>
                    {item.badge}
                  </span>
                ) : (
                  !item.disabled && <ChevronRight className="w-3 h-3 opacity-25 group-hover:opacity-100 transition-opacity" />
                )}
              </button>
            );
          })}
        </nav>

        {/* Dynamic Cooperative Credit Balance Banner */}
        <div className="m-4 mt-6 bg-emerald-50 border border-emerald-100/50 rounded-2xl p-4 text-center">
          <p className="text-[10px] text-emerald-800 font-extrabold uppercase tracking-widest pl-1">
            {language === 'te' ? 'రైతు సమూహ క్రెడిట్' : 'Coop-Credit Balance'}
          </p>
          <p className="text-xl font-black text-emerald-950 mt-1">
            ₹5,000.00
          </p>
          <span className="text-[8px] text-emerald-600 block mt-0.5 font-bold">
            {language === 'te' ? 'అద్దె చెల్లింపులకు ఉపయోగించగలరు' : 'Available for immediate zero-interest lease lines'}
          </span>
        </div>
      </aside>

      {/* Main Container Right Pane */}
      <main className="flex-1 p-4 md:p-8 overflow-y-auto max-w-7xl mx-auto w-full">

        {/* ----------------- PAGE 1: FARMER DASHBOARD HOME ----------------- */}
        {activePage === 'dashboard_home' && (
          <div className="space-y-6 animate-fade-in" id="view-dashboard-home">
            {/* Greeting Hero */}
            <div className="relative overflow-hidden bg-[#1b6d24] rounded-[2.5rem] p-6 lg:p-8 text-white shadow-md border border-emerald-800">
              <div className="relative z-10 max-w-xl">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-[9px] text-emerald-100 font-black tracking-widest uppercase bg-emerald-800/60 px-3 py-1 rounded-full border border-emerald-400/20">
                    {language === 'te' ? 'ఆంధ్రప్రదేశ్ సహకార రైతు వేదిక' : 'AP Cooperative Farming Hub'}
                  </span>
                  <span className="text-[10px] text-white font-mono font-bold bg-white/20 backdrop-blur-xs px-2.5 py-0.5 rounded-full border border-white/30" id="farmer-hero-user-id">
                    {language === 'te' ? 'రైతు ID' : 'User ID'}: {user.id || user.uid || user.phone}
                  </span>
                </div>
                
                <h1 className="text-xl md:text-2xl font-black leading-tight mt-3 text-white">
                  {language === 'te' 
                    ? `నమస్కారం, ${user.name} గారు!` 
                    : `Namaste & Welcome, ${user.name}!`}
                </h1>

                <p className="text-[11px] text-emerald-100 font-medium leading-relaxed mt-2 max-w-sm">
                  {language === 'te'
                    ? 'మీ అద్దె పొదుపులు, ప్రస్తుత బుకింగ్ వివరాలు, యంత్రాల లభ్యత మరియు డ్రైవర్ సమన్వయం అంతా ఒకే చోట చూసుకోండి.'
                    : 'Track your cooperative savings, active leases, real-time weather logs and driver dispatches effortlessly.'}
                </p>

                {/* Cooperative Action Buttons row */}
                <div className="mt-5 flex flex-wrap gap-2.5">
                  <button 
                    onClick={() => setActivePage('search_equipment')}
                    className="bg-white text-[#1b6d24] text-[10.5px] font-extrabold px-4 py-2 rounded-xl shadow-xs hover:bg-emerald-50 cursor-pointer"
                    id="btn-shortcut-search"
                  >
                    {language === 'te' ? 'పరికరాల శోధన' : 'Search Machinery'}
                  </button>
                  <button 
                    onClick={() => setActivePage('my_bookings')}
                    className="bg-emerald-800/80 border border-emerald-400/30 text-white text-[10.5px] font-extrabold px-4 py-2 rounded-xl hover:bg-emerald-900 cursor-pointer"
                    id="btn-shortcut-bookings"
                  >
                    {language === 'te' ? 'నా అద్దె బుకింగ్స్' : 'Active Bookings'}
                  </button>
                  <button 
                    onClick={() => setActivePage('rental_history')}
                    className="bg-emerald-900/90 border border-emerald-400/40 text-white text-[10.5px] font-extrabold px-4 py-2 rounded-xl hover:bg-emerald-950 flex items-center gap-1.5 cursor-pointer shadow-xs"
                    id="btn-shortcut-rental-history"
                  >
                    <History className="w-3.5 h-3.5 text-emerald-300" />
                    <span>{language === 'te' ? 'అద్దె చరిత్ర (Rental History)' : 'Rental History'}</span>
                  </button>
                </div>
              </div>
              
              {/* Background circular leaf design mockup */}
              <div className="absolute right-0 bottom-0 top-0 w-1/3 bg-radial from-emerald-700/50 via-transparent to-transparent opacity-60 pointer-events-none hidden md:block"></div>
            </div>

            {/* Quick Metrics Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-5 gap-3.5">
              <div className="bg-white border border-[#eaf2eb] rounded-2xl p-4 shadow-xs">
                <span className="text-[9px] text-slate-400 font-black tracking-wider uppercase block">
                  {language === 'te' ? 'మొత్తం ఆదా చేసిన సొమ్ము' : 'Estimated Annual Savings'}
                </span>
                <p className="text-lg font-black text-slate-800 mt-1">₹18,500</p>
                <span className="text-[9px] text-emerald-600 font-bold block mt-1">
                  ✓ {language === 'te' ? '40% పెట్టుబడి తగ్గుదల' : 'Compared to buying'}
                </span>
              </div>

              <div className="bg-white border border-[#eaf2eb] rounded-2xl p-4 shadow-xs">
                <span className="text-[9px] text-slate-400 font-black tracking-wider uppercase block">
                  {language === 'te' ? 'ప్రస్తుత బుకింగ్స్' : 'Active Leases'}
                </span>
                <p className="text-lg font-black text-slate-800 mt-1">
                  {user.bookedEquipmentIds.length} {language === 'te' ? 'పరికరాలు' : 'items'}
                </p>
                <span className="text-[9px] text-amber-600 font-bold block mt-1">
                  ▩ {language === 'te' ? '1 ఉదయమే డెలివరీ ఉంది' : '1 pending dispatch'}
                </span>
              </div>

              {/* Rental History Quick Metric Card */}
              <div 
                onClick={() => setActivePage('rental_history')}
                className="bg-white border border-emerald-100 hover:border-[#1b6d24] rounded-2xl p-4 shadow-xs cursor-pointer group transition-all"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[9px] text-[#1b6d24] font-black tracking-wider uppercase block">
                    {language === 'te' ? 'గత అద్దె చరిత్ర' : 'Rental History'}
                  </span>
                  <History className="w-3.5 h-3.5 text-[#1b6d24] group-hover:rotate-45 transition-transform" />
                </div>
                <p className="text-lg font-black text-slate-800 mt-1">
                  {rentalHistory.length} {language === 'te' ? 'పూర్తయిన రెంట్లు' : 'Past Leases'}
                </p>
                <span className="text-[9px] text-emerald-700 font-bold block mt-1 flex items-center gap-0.5">
                  <span>₹{rentalHistory.reduce((s, r) => s + r.totalPaid, 0).toLocaleString()} {language === 'te' ? 'లావాదేవీలు' : 'transacted'}</span>
                  <ChevronRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                </span>
              </div>

              <div className="bg-white border border-[#eaf2eb] rounded-2xl p-4 shadow-xs">
                <span className="text-[9px] text-slate-400 font-black tracking-wider uppercase block">
                  {language === 'te' ? 'ప్రాంతీయ జిల్లా గ్రిడ్' : 'Active Hub District'}
                </span>
                <p className="text-sm font-black text-slate-800 mt-1 truncate">
                  {(() => {
                    const parts = [
                      user.village,
                      user.mandal,
                      user.district
                    ].filter(Boolean).map(p => p!.split(' (')[0]);
                    return parts.length > 0 ? parts.join(', ') : (user.location || 'Anantapuramu');
                  })()}
                </p>
                <span className="text-[9px] text-slate-500 font-bold block mt-1">
                  ☉ {language === 'te' ? 'ఉచిత రవాణా జోన్' : 'Free transport zone'}
                </span>
              </div>

              <div className="bg-white border border-[#eaf2eb] rounded-2xl p-4 shadow-xs">
                <span className="text-[9px] text-slate-400 font-black tracking-wider uppercase block">
                  {language === 'te' ? 'నోటిఫికేషన్లు' : 'Pending Alerts'}
                </span>
                <p className="text-lg font-black text-red-600 mt-1">
                  {unreadCount} {language === 'te' ? 'కొత్త సమాచారం' : 'new warning'}
                </p>
                <span className="text-[9px] text-slate-500 font-bold block mt-1">
                  ⚠ {language === 'te' ? 'రాత్రి వర్ష సూచన' : 'Weather watch active'}
                </span>
              </div>
            </div>

            {/* Middle Section: Circular Progress + Quick Short Actions */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
              
              {/* Circular Gauge Utilization Tracker */}
              <div className="lg:col-span-5 bg-white border border-[#eaf2eb] rounded-[2rem] p-5">
                <h3 className="text-xs font-black text-slate-700 uppercase tracking-widest mb-4">
                  {language === 'te' ? 'వ్యవసాయ వనరుల వినియోగం' : 'Resource Utilization Index'}
                </h3>
                <div className="flex flex-col items-center justify-center py-4">
                  <div className="relative w-36 h-36 flex items-center justify-center">
                    <svg className="w-full h-full -rotate-90">
                      <circle cx="72" cy="72" r="58" className="stroke-slate-100 fill-none" strokeWidth="12" />
                      <circle cx="72" cy="72" r="58" className="stroke-[#1b6d24] fill-none" strokeWidth="12" strokeDasharray="364" strokeDashoffset="91" strokeLinecap="round" />
                    </svg>
                    <div className="absolute text-center">
                      <span className="text-2xl font-black text-slate-800">75%</span>
                      <p className="text-[8px] font-bold text-slate-400 uppercase tracking-wider mt-0.5">
                        {language === 'te' ? 'సేవింగ్స్ రేట్' : 'Efficiency'}
                      </p>
                    </div>
                  </div>
                  
                  <div className="text-center mt-5">
                    <p className="text-xs font-bold text-slate-700">
                      {language === 'te' ? 'మహోన్నత అద్దె వినియోగ స్థాయి' : 'Optimal cooperative usage this cycle'}
                    </p>
                    <p className="text-[9.5px] text-slate-400 mt-1 leading-relaxed">
                      {language === 'te' 
                        ? 'మీరు సొంతంగా యంత్రాలను కొనుగోలు చేయు అమౌంట్ తో పోలిస్తే ₹50,000 పై చిలుకు ఆదా చేయవచ్చు.'
                        : 'Sharing eliminates capital overhead on tilling machines and weed-removers.'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Instant Actions & Shortcuts Grid */}
              <div className="lg:col-span-7 bg-white border border-[#eaf2eb] rounded-[2rem] p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-black text-slate-700 uppercase tracking-widest">
                    {language === 'te' ? 'రైతుకు ఉపయుక్త డ్యూటీలు' : 'Action Item Checklist'}
                  </h3>
                  <span className="text-[9px] font-bold text-[#1b6d24] uppercase">AP Coop</span>
                </div>

                <div className="space-y-2.5">
                  <div className="p-3 border border-slate-150 rounded-2xl flex items-start gap-3 hover:border-[#1b6d24] transition-all">
                    <div className="w-6 h-6 rounded-full bg-orange-50 flex items-center justify-center flex-shrink-0 border border-orange-100 mt-0.5">
                      <span className="text-orange-600 text-xs font-black">!</span>
                    </div>
                    <div className="flex-1">
                      <h4 className="text-[11px] font-bold text-slate-700">
                        {language === 'te' ? 'పెండింగ్ చెల్లింపు పూర్తి చేయండి' : 'Complete Pending Checkout'}
                      </h4>
                      <p className="text-[9.5px] text-slate-450 mt-0.5">
                        {language === 'te' ? 'మీరు అద్దెకు కోరిన స్ప్రేయర్ కోసం ఛార్జీలు చెల్లించాల్సి ఉంది.' : ' sprayer payment is awaiting confirmation in your checkout portal.'}
                      </p>
                      <button 
                        onClick={() => navigateToCheckout('eq3')} 
                        className="text-[9.5px] text-[#1b6d24] font-black mt-2 flex items-center gap-1 hover:underline"
                      >
                        <span>{language === 'te' ? 'వెంటనే రూ.1,000 చెల్లించండి' : 'Proceed to Checkout (₹1,000)'}</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    </div>
                  </div>

                  <div className="p-3 border border-slate-100 bg-slate-50/50 rounded-2xl flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <h4 className="text-[11px] font-bold text-slate-500 line-through">
                        {language === 'te' ? 'మహీంద్రా ట్రాక్టర్ బుకింగ్ ఆమోదం' : 'Tractor Booking Verified'}
                      </h4>
                      <p className="text-[9.5px] text-slate-400 mt-0.5">
                        {language === 'te' ? 'యజమాని ఫోన్ కన్ఫర్మేషన్ పూర్తయింది.' : 'Owner telephone handshake is verified.'}
                      </p>
                    </div>
                  </div>

                  <div className="p-3 border border-dashed border-emerald-300 rounded-2xl bg-emerald-50/20 flex items-center justify-between">
                    <div>
                      <span className="text-[8.5px] font-bold text-emerald-700 uppercase tracking-widest block">
                        {language === 'te' ? 'నూతన యంత్రం చేర్చండి' : 'HAVE MACHINERY TO LEND?'}
                      </span>
                      <p className="text-[10px] font-bold text-slate-600 mt-0.5">
                        {language === 'te' ? 'మీ వద్ద ఉన్న వ్యవసాయ యంత్రాన్ని అద్దెకు పెట్టండి.' : 'List your idle tools and generate supplemental income.'}
                      </p>
                    </div>
                    <button 
                      onClick={() => setActivePage('profile_settings')}
                      className="bg-[#1b6d24] text-white text-[9px] font-black p-2 px-3 rounded-lg hover:bg-[#15541b] cursor-pointer"
                    >
                      {language === 'te' ? 'యాడ్ చేయు' : '+ Add Listing'}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Recommended Equipment Section */}
            <div>
              <div className="flex flex-col mb-4 gap-2">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-black text-slate-700 uppercase tracking-widest">
                    {language === 'te' ? 'మీ ప్రాంతంలో అందుబాటులో ఉన్న యంత్రాలు' : 'Cooperative Fleet Available Nearby'}
                  </h3>
                  <button 
                    onClick={() => setActivePage('search_equipment')}
                    className="text-xs font-black text-[#1b6d24] hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <span>{language === 'te' ? 'అన్నీ శోధించండి' : 'Browse All'}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
                {(user.district || user.location) && (
                  <div className="bg-emerald-50 border border-emerald-100 rounded-xl px-3 py-2 flex items-center justify-between text-[11px] font-bold text-emerald-800">
                    <span className="flex items-center gap-1.5 font-black text-xs">
                      📍 {language === 'te' ? `మీ జిల్లాలో కనుగొనబడినవి: ${user.district || user.location}` : `Nearby active listings tracked in: ${user.district || user.location}`}
                    </span>
                    <span className="text-[9px] bg-[#1b6d24] text-white px-2 py-0.5 rounded-full uppercase tracking-wider font-extrabold animate-pulse">Personalized</span>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {sortedNearbyEquipment.slice(0, 3).map((item) => (
                  <div key={item.id} className="bg-white border border-[#eaf2eb] rounded-2.5xl overflow-hidden shadow-xs hover:shadow-md transition-all">
                    <img 
                      src={item.imageUrl} 
                      alt={item.title} 
                      className="w-full h-40 object-cover"
                      referrerPolicy="no-referrer"
                    />
                    <div className="p-4">
                      <div className="flex items-center justify-between">
                        <span className="text-[8.5px] font-black bg-emerald-50 text-[#1b6d24] border border-emerald-100 rounded px-2 uppercase tracking-wide">
                          {language === 'te' ? item.categoryLabel : item.category.toUpperCase()}
                        </span>
                        {item.verified && (
                          <span className="text-[8.5px] font-bold text-emerald-700 flex items-center gap-0.5">
                            ★ {language === 'te' ? 'వెరిఫైడ్' : 'Verified'}
                          </span>
                        )}
                      </div>

                      <h4 className="text-xs font-black text-slate-800 mt-2">
                        {language === 'te' ? item.title : (item.titleEn || item.title)}
                      </h4>

                      <div className="mt-1">
                        <StarRating
                          rating={item.rating || 4.8}
                          reviewCount={item.reviewCount || 10}
                          size="sm"
                          language={language}
                        />
                      </div>

                      <div className="flex items-center gap-1.5 text-slate-400 mt-1">
                        <MapPin className="w-3.5 h-3.5" />
                        <span className="text-[10px] font-bold">
                          {language === 'te' ? item.location : item.locationEn}
                        </span>
                      </div>

                      <div className="border-t border-slate-100 mt-3 pt-3 flex items-center justify-between">
                        <div>
                          <p className="text-xs font-black text-[#1b6d24]">
                            ₹{item.price} <span className="text-[9px] font-normal text-slate-400">/ {language === 'te' ? item.rateTypeLabel : item.rateType}</span>
                          </p>
                        </div>
                        <div className="flex items-center gap-1">
                          <button 
                            onClick={() => toggleFavorite(item.id)}
                            className="bg-slate-50 hover:bg-slate-100 text-slate-500 p-2 rounded-lg cursor-pointer"
                            id={`fav-btn-eq-${item.id}`}
                          >
                            <Heart className={`w-3.5 h-3.5 ${favorites.includes(item.id) ? 'fill-red-500 text-red-500' : ''}`} />
                          </button>
                          <button 
                            onClick={() => showEquipmentDetails(item.id)}
                            className="bg-[#1b6d24] text-white text-[10px] font-extrabold px-3 py-1.5 rounded-lg hover:bg-[#15541b] cursor-pointer"
                          >
                            {language === 'te' ? 'వివరాలు' : 'Rent Info'}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* ----------------- RENTAL HISTORY PREVIEW WIDGET IN DASHBOARD HOME ----------------- */}
            <div className="bg-white border border-[#eaf2eb] rounded-[2rem] p-5 shadow-xs space-y-4" id="home-rental-history-section">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-emerald-50 text-[#1b6d24] flex items-center justify-center border border-emerald-100">
                    <History className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-xs font-black text-slate-800 uppercase tracking-widest flex items-center gap-2">
                      <span>{language === 'te' ? 'గత అద్దె చరిత్ర & పూర్తయిన లావాదేవీలు' : 'Rental History & Completed Transactions'}</span>
                      <span className="bg-emerald-100 text-[#1b6d24] text-[9px] font-black px-2 py-0.5 rounded-full lowercase">
                        {rentalHistory.length} {language === 'te' ? 'రికార్డులు' : 'records'}
                      </span>
                    </h3>
                    <p className="text-[10px] text-slate-400 font-medium">
                      {language === 'te' ? 'గతంలో మీరు అద్దెకు తీసుకున్న పరికరాల వివరాలు, రసీదులు మరియు చెల్లింపుల రికార్డులు' : 'Audit logs, verified lease receipts, and completed payment ledger'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => {
                      setRentalHistoryTab('transactions');
                      setActivePage('rental_history');
                    }}
                    className="text-[10px] text-slate-600 bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-xl font-bold cursor-pointer transition-colors"
                  >
                    {language === 'te' ? 'లావాదేవీల రసీదులు' : 'View Invoices'}
                  </button>
                  <button 
                    onClick={() => {
                      setRentalHistoryTab('past_bookings');
                      setActivePage('rental_history');
                    }}
                    className="text-[10px] text-white bg-[#1b6d24] hover:bg-[#15541b] px-3.5 py-1.5 rounded-xl font-extrabold flex items-center gap-1 cursor-pointer shadow-3xs transition-colors"
                  >
                    <span>{language === 'te' ? 'పూర్తి అద్దె చరిత్ర' : 'View Full History'}</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              </div>

              {/* Summary Cards for Recent Past Bookings */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                {rentalHistory.slice(0, 2).map((item) => (
                  <div 
                    key={item.id} 
                    className="border border-slate-150 hover:border-emerald-500 rounded-2xl p-3.5 bg-gradient-to-br from-white to-slate-50/50 flex flex-col justify-between gap-3 transition-all"
                  >
                    <div className="flex gap-3">
                      <img 
                        src={item.imageUrl} 
                        alt={item.equipmentTitle} 
                        className="w-16 h-16 rounded-xl object-cover border border-slate-150 flex-shrink-0"
                        referrerPolicy="no-referrer"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-1">
                          <span className="text-[8.5px] font-mono font-bold text-slate-400">
                            {item.bookingCode}
                          </span>
                          <span className="text-[8px] font-black bg-emerald-50 text-emerald-800 border border-emerald-200 px-1.5 py-0.5 rounded-md uppercase">
                            {language === 'te' ? (item.status === 'completed' ? 'పూర్తయింది' : 'తిరిగి ఇవ్వబడింది') : item.status.toUpperCase()}
                          </span>
                        </div>
                        <h4 className="text-xs font-black text-slate-800 truncate mt-0.5">
                          {language === 'te' ? item.equipmentTitle : item.equipmentTitleEn}
                        </h4>
                        <p className="text-[9.5px] text-slate-500 flex items-center gap-1 mt-0.5">
                          <User className="w-3 h-3 text-slate-400" />
                          <span>{item.ownerName}</span>
                          <span className="text-slate-300">•</span>
                          <span>{item.duration} {item.rateType === 'day' ? (language === 'te' ? 'రోజులు' : 'Days') : (language === 'te' ? 'గంటలు' : 'Hours')}</span>
                        </p>
                        <p className="text-[9px] text-[#1b6d24] font-black mt-0.5">
                          ₹{item.totalPaid.toLocaleString()} ({item.paymentMethod})
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-[9.5px]">
                      <span className="text-slate-400 font-medium">
                        📅 {item.completedDate}
                      </span>
                      <div className="flex items-center gap-1.5">
                        <button 
                          onClick={() => setSelectedRentalReceipt(item)}
                          className="text-[#1b6d24] hover:underline font-bold flex items-center gap-1 cursor-pointer"
                        >
                          <Receipt className="w-3 h-3" />
                          <span>{language === 'te' ? 'రసీదు' : 'Receipt'}</span>
                        </button>
                        <button 
                          onClick={() => {
                            navigateToCheckout(item.equipmentId);
                          }}
                          className="bg-[#1b6d24] text-white px-2.5 py-1 rounded-lg font-black hover:bg-[#15541b] cursor-pointer flex items-center gap-1"
                        >
                          <RotateCcw className="w-2.5 h-2.5" />
                          <span>{language === 'te' ? 'మళ్లీ అద్దెకు' : 'Rent Again'}</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ----------------- PAGE 2: SEARCH EQUIPMENT ----------------- */}
        {activePage === 'search_equipment' && (
          <div className="space-y-6 animate-fade-in" id="view-search-equipment">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h1 className="text-lg font-black text-slate-800">
                  {language === 'te' ? 'సహకార వ్యవసాయ యంత్రాలు' : 'Search Agriculture Rental Listings'}
                </h1>
                <p className="text-xs text-slate-400 font-medium">
                  {language === 'te' ? 'మీ సమీపంలో అద్దెకు లభించు అన్ని ట్రాక్టర్లు, స్ప్రేయర్లు శోధించండి' : 'Browse active and coming soon tools with verified dynamic operator support.'}
                </p>
              </div>
            </div>

            {/* Dynamic Interactive Filter Component */}
            <div className="bg-white border border-[#eaf2eb] rounded-[2rem] p-5">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="text-[10px] text-slate-400 font-black uppercase tracking-wider block mb-1.5">
                    {language === 'te' ? 'కీవర్డ్ శోధన' : 'Search by Keyword'}
                  </label>
                  <input 
                    type="text" 
                    placeholder={language === 'te' ? "ఉదా: ట్రాక్టర్, కిరణ్..." : "Search e.g. Tractor, Harvester..."}
                    value={searchKeyword}
                    onChange={(e) => setSearchKeyword(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-150 rounded-xl py-2 px-3 text-[11px] font-bold focus:outline-none focus:ring-1 focus:ring-[#1b6d24] text-slate-800"
                  />
                </div>

                <div>
                  <label className="text-[10px] text-slate-400 font-black uppercase tracking-wider block mb-1.5">
                    {language === 'te' ? 'ప్రాంతం (District)' : 'District Filter'}
                  </label>
                  <select 
                    value={searchDistrict}
                    onChange={(e) => setSearchDistrict(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-150 rounded-xl py-2 px-3 text-[11px] font-bold focus:outline-none cursor-pointer text-slate-800"
                  >
                    <option value="">{language === 'te' ? 'అన్ని జిల్లాలు' : 'All Districts'}</option>
                    {DISTRICTS.map((district) => {
                      if (district === 'అన్నీ') return null;
                      const parensMatch = (district || "").match(/\(([^)]+)\)/);
                      const cleanEnglish = parensMatch ? parensMatch[1] : district;
                      const cleanTelugu = district.split(' (')[0];
                      return (
                        <option key={district} value={cleanEnglish}>
                          {language === 'te' ? `${cleanTelugu} (${cleanEnglish})` : `${cleanEnglish} (${cleanTelugu})`}
                        </option>
                      );
                    })}
                  </select>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-1.5">
                    <label className="text-[10px] text-slate-400 font-black uppercase tracking-wider block">
                      {language === 'te' ? 'గరిష్ట ధర శ్రేణి (₹)' : 'Max Lease Budget Rate'}
                    </label>
                    <span className="text-[10px] text-[#1b6d24] font-black">₹{searchMaxPrice.toLocaleString()}</span>
                  </div>
                  <input 
                    type="range" 
                    min="500" 
                    max="10000" 
                    step="100"
                    value={searchMaxPrice}
                    onChange={(e) => setSearchMaxPrice(Number(e.target.value))}
                    className="w-full accent-[#1b6d24] mt-1 cursor-pointer"
                  />
                  <div className="flex justify-between text-[9px] text-slate-400 font-bold mt-1">
                    <span>₹500</span>
                    <span>₹5,000</span>
                    <span>₹10,000</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Search Grid List */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {(() => {
                const filtered = equipmentList.filter((item) => {
                  // 1. Keyword search (title / owner name / category)
                  const q = searchKeyword.toLowerCase().trim();
                  const titleMatch = !q || 
                    item.title.toLowerCase().includes(q) || 
                    (item.titleEn && item.titleEn.toLowerCase().includes(q)) ||
                    item.ownerName.toLowerCase().includes(q) ||
                    item.category.toLowerCase().includes(q);

                  // 2. District filter (universally matching)
                  const districtMatch = true;

                  // 3. Price rate budget filter
                  const priceMatch = item.price <= searchMaxPrice;

                  return titleMatch && districtMatch && priceMatch;
                });

                if (filtered.length === 0) {
                  return (
                    <div className="col-span-full bg-white border border-[#eaf2eb] rounded-[2rem] p-12 text-center space-y-3">
                      <div className="w-12 h-12 bg-slate-50 text-slate-400 rounded-full flex items-center justify-center mx-auto">
                        <Search className="w-6 h-6" />
                      </div>
                      <p className="text-xs font-black text-slate-700">
                        {language === 'te' ? 'ఎటువంటి పరికరాలు లభించలేదు' : 'No Matching Equipment Discovered'}
                      </p>
                      <p className="text-[10.5px] text-slate-400 max-w-xs mx-auto leading-relaxed">
                        {language === 'te' 
                          ? 'దయచేసి మీ శోధన కీవర్డ్ లేదా గరిష్ట ధర పరిమితిని మార్చి ప్రయత్నించండి.' 
                          : 'Please try adjusting your search terms or set a wider district filter option.'}
                      </p>
                    </div>
                  );
                }

                return filtered.map((item) => (
                  <div key={item.id} className="bg-white border border-[#eaf2eb] rounded-2.5xl overflow-hidden shadow-xs hover:shadow-sm transition-all" id={`card-eq-${item.id}`}>
                    <div className="relative">
                      <img 
                        src={item.imageUrl} 
                        alt={item.title} 
                        className="w-full h-36 object-cover"
                        referrerPolicy="no-referrer"
                      />
                      <span className={`absolute top-2.5 right-2.5 text-[8.5px] font-black px-2 py-0.5 rounded-full ${
                        item.status === 'available' ? 'bg-green-500 text-white' : 'bg-amber-500 text-white'
                      }`}>
                        {language === 'te' ? item.statusLabel : item.status.toUpperCase()}
                      </span>
                    </div>

                    <div className="p-4 space-y-2">
                      <h3 className="text-xs font-black text-slate-850">
                        {language === 'te' ? item.title : (item.titleEn || item.title)}
                      </h3>

                      <div className="pt-0.5">
                        <StarRating
                          rating={item.rating || 4.8}
                          reviewCount={item.reviewCount || 10}
                          size="sm"
                          language={language}
                        />
                      </div>

                      <div className="flex items-center justify-between text-[10px] text-slate-450 font-bold">
                        <span>{language === 'te' ? item.categoryLabel : item.category.toUpperCase()}</span>
                        <span className="text-[#1b6d24]">₹{item.price}/{language === 'te' ? item.rateTypeLabel : item.rateType}</span>
                      </div>

                      <p className="text-[10px] text-slate-400 line-clamp-2 leading-relaxed">
                        {language === 'te' ? item.description : item.descriptionEn}
                      </p>

                      <div className="border-t border-slate-100 pt-3 flex items-center justify-between gap-1">
                        <button 
                          onClick={() => toggleFavorite(item.id)}
                          className={`p-2 rounded-lg border hover:bg-slate-50 transition-colors duration-150 ${
                            favorites.includes(item.id) 
                              ? 'bg-red-50 text-red-500 border-red-100' 
                              : 'border-slate-100 text-slate-400'
                          }`}
                          id={`btn-fav-search-${item.id}`}
                        >
                          <Heart className={`w-3.5 h-3.5 ${favorites.includes(item.id) ? 'fill-red-500 text-red-500' : ''}`} />
                        </button>
                        
                        <button 
                          onClick={() => showEquipmentDetails(item.id)}
                          className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 text-[10px] py-2 px-1 rounded-lg font-bold"
                        >
                          {language === 'te' ? 'వివరాలు చూడండి' : 'Full Details'}
                        </button>

                        {item.status === 'available' ? (
                          <button 
                            onClick={() => navigateToCheckout(item.id)}
                            className="flex-1 bg-[#1b6d24] hover:bg-[#15541b] text-white text-[10px] py-2 px-1 rounded-lg font-bold"
                          >
                            {language === 'te' ? 'అద్దెకు తీసుకో' : 'Rent Now'}
                          </button>
                        ) : (
                          <button 
                            disabled
                            className="flex-1 bg-slate-100 text-slate-450 text-[10px] py-2 px-1 rounded-lg font-bold cursor-not-allowed"
                          >
                            {language === 'te' ? 'బిజీగా ఉంది' : 'Unavailable'}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ));
              })()}
            </div>
          </div>
        )}

        {/* ----------------- PAGE 3: EQUIPMENT DETAILS ----------------- */}
        {activePage === 'equipment_details' && (
          <div className="space-y-6 animate-fade-in" id="view-equipment-details">
            {/* Header & Quick Selector Banner */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[9px] font-black uppercase tracking-widest bg-emerald-100 text-[#1b6d24] px-2.5 py-0.5 rounded-full border border-emerald-300">
                    {language === 'te' ? 'యంత్రం పూర్తి వివరాలు' : 'Equipment Details'}
                  </span>
                  <span className="text-[9px] text-slate-400 font-bold">
                    • {equipmentList.length} {language === 'te' ? 'యంత్రాలు అందుబాటులో ఉన్నాయి' : 'Total Machinery'}
                  </span>
                </div>
                <h1 className="text-xl font-black text-slate-800 mt-1 flex items-center gap-2">
                  <Info className="w-5 h-5 text-[#1b6d24]" />
                  <span>{language === 'te' ? 'యంత్రం సమగ్ర వివరాలు & అద్దె బుకింగ్' : 'Equipment Details & Instant Lease'}</span>
                </h1>
                <p className="text-xs text-slate-400 font-medium">
                  {language === 'te'
                    ? 'మీ ప్రాంతంలో అందుబాటులో ఉన్న వ్యవసాయ యంత్రాలు, ధరలు మరియు పూర్తి సాంకేతిక వివరాలు'
                    : 'Verified machinery, hourly/daily lease rates, and technical specifications for your location.'}
                </p>
              </div>

              <button 
                onClick={() => setActivePage('search_equipment')}
                className="bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 text-xs px-3.5 py-2 rounded-xl font-bold flex items-center gap-1.5 cursor-pointer shadow-3xs transition-all w-fit"
              >
                <span>← {language === 'te' ? 'యంత్రాల జాబితా' : 'Browse All Machinery'}</span>
              </button>
            </div>

            {/* Quick Machinery Switcher Carousel / Cards */}
            <div className="bg-white border border-[#eaf2eb] rounded-2.5xl p-4 shadow-xs">
              <div className="flex items-center justify-between mb-3">
                <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                  {language === 'te' ? 'అందుబాటులో ఉన్న యంత్రాలు (క్లిక్ చేసి పూర్తి వివరాలు చూడండి)' : 'Select Equipment to View Full Details'}
                </span>
                <span className="text-[9px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">
                  📍 {user.village || user.mandal || user.district || 'Anantapuramu'}
                </span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5">
                {equipmentList.slice(0, 5).map((eq) => {
                  const isCur = activeEquipment?.id === eq.id;
                  return (
                    <button
                      key={eq.id}
                      onClick={() => setSelectedEqId(eq.id)}
                      className={`text-left p-2.5 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between ${
                        isCur
                          ? 'border-[#1b6d24] bg-emerald-50/70 shadow-sm ring-2 ring-[#1b6d24]/20'
                          : 'border-slate-150 bg-slate-50/60 hover:bg-white hover:border-emerald-200'
                      }`}
                      id={`select-eq-${eq.id}`}
                    >
                      <img
                        src={eq.imageUrl}
                        alt={eq.title}
                        className="w-full h-20 object-cover rounded-xl border border-slate-200 mb-2"
                        referrerPolicy="no-referrer"
                      />
                      <div>
                        <span className="text-[8px] font-black uppercase px-1.5 py-0.5 rounded bg-white text-[#1b6d24] border border-emerald-100 inline-block">
                          {language === 'te' ? eq.categoryLabel : eq.category}
                        </span>
                        <h5 className="text-[10.5px] font-black text-slate-800 line-clamp-1 mt-1">
                          {language === 'te' ? eq.title : (eq.titleEn || eq.title)}
                        </h5>
                        <p className="text-[11px] font-black text-[#1b6d24] mt-0.5">
                          ₹{eq.price.toLocaleString()} <span className="text-[8.5px] font-normal text-slate-400">/ {language === 'te' ? eq.rateTypeLabel : eq.rateType}</span>
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {activeEquipment ? (
              <div className="bg-white border border-[#eaf2eb] rounded-[2rem] p-5 md:p-8">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                  {/* Left Column: Media */}
                  <div className="lg:col-span-5 space-y-4">
                    <img 
                      src={activeEquipment.imageUrl} 
                      alt={activeEquipment.title} 
                      className="w-full h-64 md:h-80 object-cover rounded-2xl shadow-xs border border-slate-200"
                      referrerPolicy="no-referrer"
                    />

                    {/* Quick Specs badges */}
                    <div className="grid grid-cols-3 gap-2.5">
                      <div className="bg-slate-50 border border-slate-100 rounded-xl p-2.5 text-center">
                        <span className="text-[8px] text-slate-400 font-bold block uppercase">{language === 'te' ? 'సామర్థ్యం' : 'HP Rating'}</span>
                        <span className="text-xs font-extrabold text-slate-700">{activeEquipment.horsepower || '35 HP'}</span>
                      </div>
                      <div className="bg-slate-50 border border-slate-100 rounded-xl p-2.5 text-center">
                        <span className="text-[8px] text-slate-400 font-bold block uppercase">{language === 'te' ? 'ఇంధన రకం' : 'Fuel'}</span>
                        <span className="text-[10px] font-extrabold text-slate-700 leading-none block mt-0.5">{activeEquipment.fuelType || 'Diesel'}</span>
                      </div>
                      <div className="bg-slate-50 border border-slate-100 rounded-xl p-2.5 text-center">
                        <span className="text-[8px] text-slate-400 font-bold block uppercase">{language === 'te' ? 'డ్రైవర్ సేవ' : 'Operator'}</span>
                        <span className="text-[10px] font-extrabold text-[#1b6d24] block mt-0.5">{activeEquipment.includesDriver ? (language === 'te' ? 'ఉంది' : 'Included') : (language === 'te' ? 'లేదు' : 'Self-drive')}</span>
                      </div>
                    </div>
                  </div>

                  {/* Right Column: Descriptions & Actions */}
                  <div className="lg:col-span-7 space-y-5">
                    <div className="flex items-center justify-between">
                      <span className="text-[9px] font-black bg-emerald-100 text-[#1b6d24] px-3 py-1 rounded-full uppercase tracking-wider">
                        {language === 'te' ? activeEquipment.categoryLabel : activeEquipment.category.toUpperCase()}
                      </span>
                      
                      <button 
                        onClick={() => toggleFavorite(activeEquipment.id)}
                        className="text-slate-500 hover:text-red-500 flex items-center gap-1.5 text-xs font-bold"
                      >
                        <Heart className={`w-4 h-4 ${favorites.includes(activeEquipment.id) ? 'fill-red-500 text-red-500' : ''}`} />
                        <span>{favorites.includes(activeEquipment.id) ? (language === 'te' ? 'సేవ్ చేయబడింది' : 'Bookmarked') : (language === 'te' ? 'లిస్ట్ సేవ్ చేయి' : 'Save for later')}</span>
                      </button>
                    </div>

                    <div>
                      <h1 className="text-xl font-black text-slate-900 leading-snug">
                        {language === 'te' ? activeEquipment.title : (activeEquipment.titleEn || activeEquipment.title)}
                      </h1>
                      <div className="mt-1.5 flex items-center gap-2 text-slate-400">
                        <MapPin className="w-4 h-4 text-emerald-600" />
                        <span className="text-xs font-bold">
                          {language === 'te' ? activeEquipment.location : activeEquipment.locationEn} • {language === 'te' ? 'సహకార యూనిట్' : 'AP Cooperative Region'}
                        </span>
                      </div>
                    </div>

                    <div className="bg-slate-50 border border-slate-100/50 rounded-2xl p-4">
                      <h4 className="text-[10px] text-slate-400 font-black tracking-widest uppercase mb-1">{language === 'te' ? 'పరికరము పూర్తి వర్ణన' : 'Full Machinery Description'}</h4>
                      <p className="text-xs text-slate-600 leading-relaxed font-medium">
                        {language === 'te' ? activeEquipment.description : activeEquipment.descriptionEn}
                      </p>
                    </div>

                    {/* Owner detail badge */}
                    <div className="border border-slate-150 rounded-2xl p-3.5 flex items-center justify-between bg-[#fbfdfb]">
                      <div className="flex items-center gap-3">
                        <img 
                          src={activeEquipment.ownerAvatar} 
                          alt={activeEquipment.ownerName}
                          className="w-10 h-10 rounded-full border border-slate-200 object-cover"
                          referrerPolicy="no-referrer"
                        />
                        <div>
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{language === 'te' ? 'యంత్ర యజమాని' : 'Lender Contact'}</p>
                          <h4 className="text-xs font-black text-slate-800">{activeEquipment.ownerName}</h4>
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-[9px] bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold py-1.5 px-3 rounded-lg text-center block">
                          📞 {activeEquipment.ownerPhone}
                        </span>
                      </div>
                    </div>

                    {/* Listed Specs List */}
                    {activeEquipment.specs && (
                      <div className="space-y-1.5">
                        <h4 className="text-[10px] text-slate-400 font-black tracking-widest uppercase">{language === 'te' ? 'ముఖ్యమైన సాంకేతికత మరియు సౌకర్యాలు' : 'Technical Specifications Highlights'}</h4>
                        <ul className="space-y-1 text-slate-600">
                          {activeEquipment.specs.map((sp, idx) => (
                            <li key={idx} className="text-[10.5px] font-medium flex items-center gap-2">
                              <span className="w-1.5 h-1.5 bg-[#1b6d24] rounded-full"></span>
                              <span>{sp}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Action Panel Check-out */}
                    <div className="bg-emerald-50/50 border border-emerald-100 rounded-3xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div>
                        <span className="text-[9px] text-slate-400 font-black uppercase tracking-wider block">{language === 'te' ? 'సహకార అద్దె రుసుము' : 'Cooperative Guaranteed Rate'}</span>
                        <p className="text-lg font-black text-[#1b6d24]">
                          ₹{activeEquipment.price} <span className="text-xs text-slate-500 font-normal">/ {language === 'te' ? activeEquipment.rateTypeLabel : activeEquipment.rateType}</span>
                        </p>
                      </div>

                      {activeEquipment.status === 'available' ? (
                        <button 
                          onClick={() => navigateToCheckout(activeEquipment.id)}
                          className="bg-[#1b6d24] hover:bg-[#15541b] text-white font-extrabold text-xs py-3 px-6 rounded-xl shadow-md transition-all active:scale-95 cursor-pointer"
                        >
                          {language === 'te' ? 'వెంటనే బుక్ చేసుకోండి (Check out)' : 'Lease Now & Pay Receipt'}
                        </button>
                      ) : (
                        <button 
                          disabled
                          className="bg-slate-200 text-slate-400 font-extrabold text-xs py-3 px-6 rounded-xl cursor-not-allowed"
                        >
                          {language === 'te' ? 'ఇది ప్రస్తుతం బుక్ చేయబడి ఉంది' : 'Waitlist Blocked (Unavailable)'}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-12 bg-white rounded-2xl border border-slate-100">
                <p className="text-slate-400 text-xs font-bold">{language === 'te' ? 'దయచేసి ఒక యంత్రాన్ని ఎంచుకోండి.' : 'No equipment details are active.'}</p>
                <button 
                  onClick={() => setActivePage('search_equipment')}
                  className="mt-4 bg-[#1b6d24] text-white text-xs px-4 py-2 rounded-xl"
                >
                  {language === 'te' ? 'లిస్ట్ చూడండి' : 'Go to Search'}
                </button>
              </div>
            )}
          </div>
        )}

        {/* ----------------- PAGE 4: MY BOOKINGS ----------------- */}
        {activePage === 'my_bookings' && (
          <div className="space-y-6 animate-fade-in" id="view-my-bookings">
            <div>
              <h1 className="text-lg font-black text-slate-800">
                {language === 'te' ? 'నా వ్యవసాయ అద్దె బుకింగ్స్' : 'Your Cooperative Rental Bookings'}
              </h1>
              <p className="text-xs text-slate-400 font-medium">
                {language === 'te' ? 'ఇప్పటివరకు మీరు అద్దెకు తీసుకున్న లేదా తీసుకుంటున్న యంత్రాల కాలక్రమం' : 'Track pending approvals, driver dispatch coordinates, and previous rent leases state.'}
              </p>
            </div>

            {user.bookedEquipmentIds.length > 0 ? (
              <div className="space-y-3.5">
                {user.bookedEquipmentIds.map((bId) => {
                  const eqItem = equipmentList.find(e => e.id === bId);
                  if (!eqItem) return null;
                  return (
                    <div key={bId} className="bg-white border border-[#eaf2eb] rounded-[2rem] p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xs">
                      <div className="flex items-center gap-4">
                        <img 
                          src={eqItem.imageUrl} 
                          alt={eqItem.title} 
                          className="w-16 h-16 object-cover rounded-2xl"
                          referrerPolicy="no-referrer"
                        />
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-[8px] font-black bg-emerald-50 text-[#1b6d24] border border-emerald-100 rounded px-1.5 uppercase">
                              {language === 'te' ? eqItem.categoryLabel : eqItem.category.toUpperCase()}
                            </span>
                            <span className="text-[10px] font-extrabold text-emerald-800 flex items-center gap-0.5">
                              ● {language === 'te' ? 'నిర్ధారించబడింది' : 'Lease Confirmed'}
                            </span>
                          </div>
                          
                          <h4 className="text-xs font-black text-slate-800 mt-1">
                            {language === 'te' ? eqItem.title : (eqItem.titleEn || eqItem.title)}
                          </h4>
                          
                          <p className="text-[10px] text-slate-400">
                            {language === 'te' ? 'యజమాని:' : 'Lender:'} {eqItem.ownerName} • 📞 {eqItem.ownerPhone}
                          </p>
                          
                          <div className="mt-1 text-[11px] font-bold text-[#1b6d24] flex items-center gap-1.5 bg-emerald-50/50 py-1 px-2.5 rounded-lg w-fit border border-emerald-100/50">
                            <Clock className="w-3.5 h-3.5" />
                            <span>
                              {language === 'te' ? 'సమయం:' : 'Duration:'} {getBookingDuration(eqItem.id, eqItem.rateType)} {eqItem.rateType === 'day' ? (language === 'te' ? 'రోజులు' : 'days') : (language === 'te' ? 'గంటలు' : 'hours')}
                            </span>
                            <span className="text-slate-300">|</span>
                            <span>
                              {language === 'te' ? 'మొత్తం అద్దె:' : 'Total Rent:'} ₹{eqItem.price * getBookingDuration(eqItem.id, eqItem.rateType)}
                            </span>
                          </div>

                          {getBookingLocation(eqItem.id) && (
                            <div className="mt-1.5 p-1.5 px-3 bg-emerald-50 border border-emerald-100 rounded-xl text-[10px] text-[#1b6d24] font-bold leading-tight">
                              📍 {language === 'te' ? 'డెలివరీ ప్రాంతం:' : 'Delivery Location:'} {getBookingLocation(eqItem.id)}
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-2">
                        <button 
                          onClick={() => {
                            setActiveBookingId(eqItem.id);
                            setActivePage('booking_details');
                          }}
                          className="bg-slate-100 hover:bg-slate-200 text-slate-700 text-[10px] px-3.5 py-2 rounded-xl font-extrabold cursor-pointer"
                        >
                          {language === 'te' ? 'రసీదు చూడండి' : 'View Receipt'}
                        </button>

                        <button 
                          onClick={() => {
                            const targetChat = chats.find(c => c.equipmentId === eqItem.id || c.contactPhone === eqItem.ownerPhone);
                            if (targetChat) {
                              setActiveChatId(targetChat.id);
                            }
                            setActivePage('messages_chat');
                          }}
                          className="bg-emerald-50 hover:bg-emerald-100 text-[#1b6d24] border border-emerald-200 text-[10px] px-3 py-2 rounded-xl font-extrabold flex items-center gap-1.5 cursor-pointer shadow-3xs"
                        >
                          <MessageSquare className="w-3.5 h-3.5 text-[#1b6d24]" />
                          <span>{language === 'te' ? 'యజమానితో చాట్' : 'Chat with Owner'}</span>
                        </button>
                        
                        <button 
                          onClick={() => {
                            setNewReviewEqId(eqItem.id);
                            setActivePage('reviews_ratings');
                          }}
                          className="bg-[#1b6d24] hover:bg-[#15541b] text-white text-[10px] px-3.5 py-2 rounded-xl font-extrabold cursor-pointer"
                        >
                          {language === 'te' ? 'రివ్యూ రాయి' : 'Leave Review'}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-12 bg-white rounded-2xl border border-slate-100">
                <p className="text-slate-400 text-xs font-bold">
                  {language === 'te' ? 'మీరు ఇంకా ఎలాంటి పరికరాలను బుక్ చేయలేదు.' : 'No active rental bookings found in database.'}
                </p>
                <button 
                  onClick={() => setActivePage('search_equipment')}
                  className="mt-4 bg-[#1b6d24] text-white text-xs px-4 py-2 rounded-xl cursor-pointer"
                >
                  {language === 'te' ? 'పరికరాలను అద్దెకు తీసుకోండి' : 'Search & Book Machinery'}
                </button>
              </div>
            )}
          </div>
        )}

        {/* ----------------- RENTAL HISTORY & COMPLETED TRANSACTIONS ----------------- */}
        {activePage === 'rental_history' && (
          <div className="space-y-6 animate-fade-in" id="view-rental-history">
            {/* Header with Title and Quick Filter Info */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[9px] font-black uppercase tracking-widest bg-emerald-100 text-[#1b6d24] px-2.5 py-0.5 rounded-full border border-emerald-300">
                    {language === 'te' ? 'రైతు అద్దె లెడ్జర్' : 'Cooperative Lease Ledger'}
                  </span>
                  <span className="text-[9px] text-slate-400 font-bold">
                    • {rentalHistory.length} {language === 'te' ? 'పూర్తయిన రికార్డులు' : 'Total Records'}
                  </span>
                </div>
                <h1 className="text-xl font-black text-slate-800 mt-1 flex items-center gap-2">
                  <History className="w-5 h-5 text-[#1b6d24]" />
                  <span>{language === 'te' ? 'గత అద్దె చరిత్ర & పూర్తయిన లావాదేవీలు' : 'Rental History & Completed Transactions'}</span>
                </h1>
                <p className="text-xs text-slate-400 font-medium">
                  {language === 'te' 
                    ? 'గతంలో పూర్తయిన యంత్రాల అద్దెలు, చెల్లింపుల రశీదులు, రవాణా వివరాలు మరియు అధికారిక లెడ్జర్' 
                    : 'Track your completed equipment leases, official payment receipts, driver logs, and coop audit records.'}
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setActivePage('search_equipment')}
                  className="bg-[#1b6d24] hover:bg-[#15541b] text-white text-xs px-4 py-2 rounded-xl font-extrabold flex items-center gap-1.5 cursor-pointer shadow-3xs transition-all"
                  id="btn-rent-another-equipment"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>{language === 'te' ? 'కొత్త యంత్రం అద్దెకు తీసుకోండి' : 'Rent New Equipment'}</span>
                </button>
              </div>
            </div>

            {/* Top 4 Summary KPI Metric Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
              <div className="bg-white border border-[#eaf2eb] rounded-2xl p-4 shadow-xs">
                <div className="flex items-center justify-between">
                  <span className="text-[9px] text-slate-400 font-black tracking-wider uppercase block">
                    {language === 'te' ? 'పూర్తయిన అద్దెలు' : 'Completed Rentals'}
                  </span>
                  <div className="w-6 h-6 rounded-lg bg-emerald-50 text-[#1b6d24] flex items-center justify-center">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                  </div>
                </div>
                <p className="text-xl font-black text-slate-800 mt-1">
                  {rentalHistory.filter(r => r.status === 'completed' || r.status === 'returned').length}
                </p>
                <span className="text-[9px] text-emerald-700 font-bold block mt-1">
                  ✓ {language === 'te' ? '100% విజయవంతంగా తిరిగి ఇవ్వబడ్డాయి' : 'Returned in good condition'}
                </span>
              </div>

              <div className="bg-white border border-[#eaf2eb] rounded-2xl p-4 shadow-xs">
                <div className="flex items-center justify-between">
                  <span className="text-[9px] text-slate-400 font-black tracking-wider uppercase block">
                    {language === 'te' ? 'పూర్తయిన మొత్తం లావాదేవీలు' : 'Total Spent on Rentals'}
                  </span>
                  <div className="w-6 h-6 rounded-lg bg-emerald-50 text-[#1b6d24] flex items-center justify-center">
                    <Receipt className="w-3.5 h-3.5" />
                  </div>
                </div>
                <p className="text-xl font-black text-[#1b6d24] mt-1">
                  ₹{rentalHistory.reduce((sum, r) => sum + r.totalPaid, 0).toLocaleString()}
                </p>
                <span className="text-[9px] text-slate-400 font-bold block mt-1">
                  {language === 'te' ? 'సహకార బ్యాంక్ ఆడిట్ చేయబడింది' : 'Verified bank clearance'}
                </span>
              </div>

              <div className="bg-white border border-[#eaf2eb] rounded-2xl p-4 shadow-xs">
                <div className="flex items-center justify-between">
                  <span className="text-[9px] text-slate-400 font-black tracking-wider uppercase block">
                    {language === 'te' ? 'పొలంలో పనిచేసిన సమయం' : 'Total Working Time'}
                  </span>
                  <div className="w-6 h-6 rounded-lg bg-emerald-50 text-[#1b6d24] flex items-center justify-center">
                    <Clock className="w-3.5 h-3.5" />
                  </div>
                </div>
                <p className="text-xl font-black text-slate-800 mt-1">
                  {rentalHistory.reduce((sum, r) => sum + r.duration, 0)} {language === 'te' ? 'రోజులు' : 'Days'}
                </p>
                <span className="text-[9px] text-emerald-600 font-bold block mt-1">
                  {language === 'te' ? 'మెరుగైన వ్యవసాయ దిగుబడి' : 'Across paddy & dryland'}
                </span>
              </div>

              <div className="bg-white border border-[#eaf2eb] rounded-2xl p-4 shadow-xs">
                <div className="flex items-center justify-between">
                  <span className="text-[9px] text-slate-400 font-black tracking-wider uppercase block">
                    {language === 'te' ? 'సగటు రేటింగ్ & సమీక్షలు' : 'Farmer Rating Given'}
                  </span>
                  <div className="w-6 h-6 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
                    <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-500" />
                  </div>
                </div>
                <p className="text-xl font-black text-slate-800 mt-1 flex items-center gap-1">
                  <span>4.9</span>
                  <span className="text-xs text-amber-500">★★★★★</span>
                </p>
                <span className="text-[9px] text-slate-400 font-bold block mt-1">
                  {language === 'te' ? 'విశ్వసనీయ యజమానులతో లావాదేవీలు' : 'Trusted peer-to-peer network'}
                </span>
              </div>
            </div>

            {/* View Mode Sub-tabs (Past Bookings vs Completed Transactions vs All) */}
            <div className="bg-white border border-[#eaf2eb] rounded-[2rem] p-3 shadow-xs">
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                <div className="flex items-center bg-slate-100 p-1 rounded-2xl gap-1">
                  <button
                    onClick={() => setRentalHistoryTab('past_bookings')}
                    className={`flex-1 sm:flex-none px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                      rentalHistoryTab === 'past_bookings'
                        ? 'bg-[#1b6d24] text-white shadow-xs'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                    }`}
                  >
                    <Calendar className="w-3.5 h-3.5" />
                    <span>{language === 'te' ? 'గత బుకింగ్స్ (Past Bookings)' : 'Past Bookings'}</span>
                    <span className={`text-[9px] px-1.5 py-0.2 rounded-full ${rentalHistoryTab === 'past_bookings' ? 'bg-emerald-900 text-emerald-200' : 'bg-slate-200 text-slate-600'}`}>
                      {rentalHistory.length}
                    </span>
                  </button>

                  <button
                    onClick={() => setRentalHistoryTab('transactions')}
                    className={`flex-1 sm:flex-none px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                      rentalHistoryTab === 'transactions'
                        ? 'bg-[#1b6d24] text-white shadow-xs'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                    }`}
                  >
                    <Receipt className="w-3.5 h-3.5" />
                    <span>{language === 'te' ? 'పూర్తయిన లావాదేవీలు (Transactions)' : 'Completed Transactions'}</span>
                    <span className={`text-[9px] px-1.5 py-0.2 rounded-full ${rentalHistoryTab === 'transactions' ? 'bg-emerald-900 text-emerald-200' : 'bg-slate-200 text-slate-600'}`}>
                      {payments.length}
                    </span>
                  </button>

                  <button
                    onClick={() => setRentalHistoryTab('all')}
                    className={`flex-1 sm:flex-none px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                      rentalHistoryTab === 'all'
                        ? 'bg-[#1b6d24] text-white shadow-xs'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                    }`}
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>{language === 'te' ? 'అన్నీ (Unified View)' : 'Unified View'}</span>
                  </button>
                </div>

                {/* Print All / Export button */}
                <button
                  onClick={() => window.print()}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs px-3.5 py-2 rounded-xl font-bold flex items-center justify-center gap-1.5 cursor-pointer self-end sm:self-auto"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>{language === 'te' ? 'స్టేట్‌మెంట్ ప్రింట్' : 'Print Statement'}</span>
                </button>
              </div>
            </div>

            {/* Filter and Search Bar */}
            <div className="bg-white border border-[#eaf2eb] rounded-[2rem] p-4 shadow-xs">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {/* Search Keyword */}
                <div className="relative">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={rentalSearchKeyword}
                    onChange={(e) => setRentalSearchKeyword(e.target.value)}
                    placeholder={language === 'te' ? 'యంత్రం పేరు, బుకింగ్ ID లేదా యజమాని పేరు...' : 'Search machinery, Booking Code, Owner...'}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-xs font-bold text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#1b6d24]"
                  />
                  {rentalSearchKeyword && (
                    <button
                      onClick={() => setRentalSearchKeyword('')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs"
                    >
                      ✕
                    </button>
                  )}
                </div>

                {/* Status Filter */}
                <div className="flex items-center gap-2">
                  <Filter className="w-4 h-4 text-slate-400 flex-shrink-0" />
                  <select
                    value={rentalStatusFilter}
                    onChange={(e) => setRentalStatusFilter(e.target.value as any)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 focus:outline-none cursor-pointer"
                  >
                    <option value="all">{language === 'te' ? 'అన్ని స్థితులు (All Statuses)' : 'All Rental Statuses'}</option>
                    <option value="completed">{language === 'te' ? 'పూర్తయింది (Completed)' : 'Completed'}</option>
                    <option value="returned">{language === 'te' ? 'తిరిగి ఇవ్వబడింది (Returned)' : 'Returned'}</option>
                    <option value="in_progress">{language === 'te' ? 'ప్రస్తుతం అమల్లో ఉంది (In Progress)' : 'In Progress'}</option>
                  </select>
                </div>

                {/* Payment Method Filter */}
                <div>
                  <select
                    value={rentalPaymentFilter}
                    onChange={(e) => setRentalPaymentFilter(e.target.value as any)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 focus:outline-none cursor-pointer"
                  >
                    <option value="all">{language === 'te' ? 'అన్ని చెల్లింపు మార్గాలు (All Methods)' : 'All Payment Methods'}</option>
                    <option value="upi">UPI (GPay / PhonePe / Paytm)</option>
                    <option value="credit">{language === 'te' ? 'సహకార క్రెడిట్ (Coop-Credit)' : 'Cooperative Credit'}</option>
                    <option value="cod">{language === 'te' ? 'నగదు చెల్లింపు (Cash)' : 'Cash on Delivery'}</option>
                  </select>
                </div>
              </div>
            </div>

            {/* ---------------- SECTION A: PAST BOOKINGS LIST ---------------- */}
            {(rentalHistoryTab === 'past_bookings' || rentalHistoryTab === 'all') && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-sm font-black text-slate-800 uppercase tracking-wider flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-[#1b6d24]" />
                    <span>{language === 'te' ? 'గతంలో బుక్ చేసుకున్న యంత్రాలు' : 'Past Equipment Bookings'}</span>
                  </h2>
                  <span className="text-xs text-slate-400 font-bold">
                    {(() => {
                      const list = rentalHistory.filter((item) => {
                        const q = rentalSearchKeyword.toLowerCase().trim();
                        const matchQ = !q || 
                          item.equipmentTitle.toLowerCase().includes(q) ||
                          item.equipmentTitleEn.toLowerCase().includes(q) ||
                          item.bookingCode.toLowerCase().includes(q) ||
                          item.ownerName.toLowerCase().includes(q) ||
                          item.paymentTxId.toLowerCase().includes(q);
                        const matchStatus = rentalStatusFilter === 'all' || item.status === rentalStatusFilter;
                        const matchPayment = rentalPaymentFilter === 'all' || 
                          (rentalPaymentFilter === 'upi' && item.paymentMethod.toLowerCase().includes('upi')) ||
                          (rentalPaymentFilter === 'credit' && item.paymentMethod.toLowerCase().includes('credit')) ||
                          (rentalPaymentFilter === 'cod' && (item.paymentMethod.toLowerCase().includes('cash') || item.paymentMethod.toLowerCase().includes('cod')));
                        return matchQ && matchStatus && matchPayment;
                      });
                      return `${list.length} ${language === 'te' ? 'బుకింగ్స్' : 'Bookings'}`;
                    })()}
                  </span>
                </div>

                {(() => {
                  const filteredRentals = rentalHistory.filter((item) => {
                    const q = rentalSearchKeyword.toLowerCase().trim();
                    const matchQ = !q || 
                      item.equipmentTitle.toLowerCase().includes(q) ||
                      item.equipmentTitleEn.toLowerCase().includes(q) ||
                      item.bookingCode.toLowerCase().includes(q) ||
                      item.ownerName.toLowerCase().includes(q) ||
                      item.paymentTxId.toLowerCase().includes(q);
                    const matchStatus = rentalStatusFilter === 'all' || item.status === rentalStatusFilter;
                    const matchPayment = rentalPaymentFilter === 'all' || 
                      (rentalPaymentFilter === 'upi' && item.paymentMethod.toLowerCase().includes('upi')) ||
                      (rentalPaymentFilter === 'credit' && item.paymentMethod.toLowerCase().includes('credit')) ||
                      (rentalPaymentFilter === 'cod' && (item.paymentMethod.toLowerCase().includes('cash') || item.paymentMethod.toLowerCase().includes('cod')));
                    return matchQ && matchStatus && matchPayment;
                  });

                  if (rentalHistory.length === 0) {
                    return (
                      <div className="bg-white border border-[#eaf2eb] rounded-[2.5rem] p-10 text-center space-y-4 shadow-xs">
                        <div className="w-16 h-16 bg-emerald-50 text-[#1b6d24] rounded-2xl flex items-center justify-center mx-auto border border-emerald-100">
                          <History className="w-8 h-8 text-[#1b6d24]" />
                        </div>
                        <div className="max-w-md mx-auto space-y-1.5">
                          <h3 className="text-base font-black text-slate-800">
                            {language === 'te' ? 'ఇంకా ఎలాంటి అద్దె చరిత్ర లేదు' : 'No Rental History Yet'}
                          </h3>
                          <p className="text-xs text-slate-500 leading-relaxed font-medium">
                            {language === 'te' 
                              ? 'మీరు మొదటిసారి వ్యవసాయ యంత్రాలను అద్దెకు తీసుకున్నప్పుడు వాటి పూర్తి వివరాలు, అధికారిక రశీదులు, రవాణా స్టేటస్ మరియు డ్రైవర్ లాగ్స్ ఇక్కడ భద్రపరచబడతాయి.'
                              : 'Your completed farm equipment leases, official invoices, and work logs will appear here once you make your first booking.'}
                          </p>
                        </div>
                        <button
                          onClick={() => setActivePage('search_equipment')}
                          className="bg-[#1b6d24] hover:bg-[#15541b] text-white text-xs px-6 py-2.5 rounded-xl font-extrabold inline-flex items-center gap-2 cursor-pointer shadow-xs transition-all active:scale-95"
                          id="btn-rent-first-equipment"
                        >
                          <Plus className="w-4 h-4" />
                          <span>{language === 'te' ? 'యంత్రాలను శోధించి అద్దెకు తీసుకోండి' : 'Browse & Rent Farm Machinery'}</span>
                        </button>
                      </div>
                    );
                  }

                  if (filteredRentals.length === 0) {
                    return (
                      <div className="bg-white border border-[#eaf2eb] rounded-[2rem] p-8 text-center space-y-3">
                        <History className="w-10 h-10 text-slate-300 mx-auto" />
                        <h3 className="text-xs font-bold text-slate-700">
                          {language === 'te' ? 'ఎలాంటి అద్దె రికార్డులు కనుగొనబడలేదు.' : 'No rental records matching your filters.'}
                        </h3>
                        <p className="text-[10px] text-slate-400">
                          {language === 'te' ? 'దయచేసి మీ శోధన పదం లేదా ఫిల్టర్‌లను మార్చండి.' : 'Try adjusting your search keywords or clear the active status filter.'}
                        </p>
                        <button
                          onClick={() => {
                            setRentalSearchKeyword('');
                            setRentalStatusFilter('all');
                            setRentalPaymentFilter('all');
                          }}
                          className="text-xs text-[#1b6d24] font-bold underline cursor-pointer"
                        >
                          {language === 'te' ? 'ఫిల్టర్‌లను తొలగించండి' : 'Reset Filters'}
                        </button>
                      </div>
                    );
                  }

                  return (
                    <div className="space-y-4">
                      {filteredRentals.map((item) => (
                        <div
                          key={item.id}
                          className="bg-white border border-[#eaf2eb] hover:border-emerald-300 rounded-[2rem] p-5 shadow-xs transition-all space-y-4"
                        >
                          {/* Top Row: Equipment Info + Status */}
                          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                            <div className="flex gap-4">
                              <img
                                src={item.imageUrl}
                                alt={item.equipmentTitle}
                                className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl object-cover border border-slate-150 flex-shrink-0"
                                referrerPolicy="no-referrer"
                              />
                              <div>
                                <div className="flex items-center gap-2 flex-wrap">
                                  <span className="text-[9px] font-mono font-bold bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md border border-slate-200">
                                    {item.bookingCode}
                                  </span>
                                  <span className="text-[9px] font-bold bg-emerald-50 text-[#1b6d24] border border-emerald-200 px-2 py-0.5 rounded-md uppercase">
                                    {language === 'te' ? item.categoryLabel : item.category}
                                  </span>
                                  <span className={`text-[9px] font-black px-2 py-0.5 rounded-md uppercase flex items-center gap-1 ${
                                    item.status === 'completed'
                                      ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                                      : item.status === 'returned'
                                      ? 'bg-blue-100 text-blue-800 border border-blue-300'
                                      : 'bg-amber-100 text-amber-800 border border-amber-300'
                                  }`}>
                                    <Check className="w-2.5 h-2.5" />
                                    <span>
                                      {language === 'te'
                                        ? (item.status === 'completed' ? 'అద్దె పూర్తయింది' : item.status === 'returned' ? 'తిరిగి ఇచ్చేశారు' : 'ప్రస్తుతం పొలంలో ఉంది')
                                        : (item.status === 'completed' ? 'Completed & Cleared' : item.status === 'returned' ? 'Returned' : 'In Progress')}
                                    </span>
                                  </span>
                                </div>

                                <h3 className="text-sm font-black text-slate-800 mt-1.5">
                                  {language === 'te' ? item.equipmentTitle : item.equipmentTitleEn}
                                </h3>

                                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-slate-500 text-[10px] mt-1 font-medium">
                                  <span className="flex items-center gap-1">
                                    <MapPin className="w-3 h-3 text-slate-400" />
                                    <span>{language === 'te' ? item.location : item.locationEn}</span>
                                  </span>
                                  <span className="flex items-center gap-1">
                                    <User className="w-3 h-3 text-slate-400" />
                                    <span>{item.ownerName} ({item.ownerPhone})</span>
                                  </span>
                                </div>

                                <p className="text-[10px] text-slate-600 bg-slate-50 p-2 rounded-xl border border-slate-100 mt-2 max-w-xl">
                                  <span className="font-bold text-slate-700">{language === 'te' ? 'పని వివరాలు:' : 'Field work:'} </span>
                                  {language === 'te' ? item.workDescription : item.workDescriptionEn}
                                </p>
                              </div>
                            </div>

                            {/* Financial Summary Pill on Right */}
                            <div className="sm:text-right bg-emerald-50/50 border border-emerald-100 rounded-2xl p-3 sm:min-w-[170px] flex-shrink-0">
                              <span className="text-[8.5px] font-black uppercase text-slate-400 tracking-wider block">
                                {language === 'te' ? 'చెల్లించిన మొత్తం' : 'Total Amount Paid'}
                              </span>
                              <p className="text-base font-black text-[#1b6d24] mt-0.5">
                                ₹{item.totalPaid.toLocaleString()}
                              </p>
                              <span className="text-[9.5px] text-slate-500 font-bold block mt-0.5">
                                {item.duration} {item.rateType === 'day' ? (language === 'te' ? 'రోజులు' : 'Days') : (language === 'te' ? 'గంటలు' : 'Hours')} @ ₹{item.ratePrice}/{language === 'te' ? item.rateTypeLabel : item.rateType}
                              </span>
                              <span className="text-[8.5px] font-mono text-slate-400 block mt-1">
                                {item.paymentMethod}
                              </span>
                            </div>
                          </div>

                          {/* Middle Row: Duration, Dates, Driver details */}
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 p-3 rounded-2xl text-[10px] border border-slate-100">
                            <div>
                              <span className="text-slate-400 font-bold block uppercase text-[8.5px]">
                                {language === 'te' ? 'బుకింగ్ తేదీ' : 'Booked Date'}
                              </span>
                              <span className="font-black text-slate-700">{item.bookingDate}</span>
                            </div>
                            <div>
                              <span className="text-slate-400 font-bold block uppercase text-[8.5px]">
                                {language === 'te' ? 'ముగింపు తేదీ' : 'Completed Date'}
                              </span>
                              <span className="font-black text-slate-700">{item.completedDate}</span>
                            </div>
                            <div>
                              <span className="text-slate-400 font-bold block uppercase text-[8.5px]">
                                {language === 'te' ? 'డ్రైవర్ సదుపాయం' : 'Driver Status'}
                              </span>
                              <span className={`font-black ${item.driverIncluded ? 'text-emerald-700' : 'text-slate-600'}`}>
                                {item.driverIncluded 
                                  ? (language === 'te' ? '✓ డ్రైవర్‌తో సహా' : '✓ Driver Included') 
                                  : (language === 'te' ? '✗ డ్రైవర్ లేకుండా' : '✗ Self Driven')}
                              </span>
                            </div>
                            <div>
                              <span className="text-slate-400 font-bold block uppercase text-[8.5px]">
                                {language === 'te' ? 'లావాదేవీ ID' : 'Transaction ID'}
                              </span>
                              <span className="font-mono font-bold text-slate-700 truncate block">
                                {item.paymentTxId}
                              </span>
                            </div>
                          </div>

                          {/* Review & Rating feedback */}
                          {item.rating && (
                            <div className="bg-amber-50/40 border border-amber-100/60 rounded-xl p-2.5 flex items-start gap-2 text-[10.5px]">
                              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-500 mt-0.5 flex-shrink-0" />
                              <div>
                                <span className="font-black text-amber-900">
                                  {language === 'te' ? 'మీ రేటింగ్:' : 'Your Rating:'} {item.rating} / 5
                                </span>
                                {item.reviewText && (
                                  <p className="text-slate-600 font-medium italic mt-0.5">
                                    "{item.reviewText}"
                                  </p>
                                )}
                              </div>
                            </div>
                          )}

                          {/* Action Buttons Toolbar */}
                          <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100">
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => showEquipmentDetails(item.equipmentId)}
                                className="bg-emerald-50 hover:bg-emerald-100 text-[#1b6d24] border border-emerald-200 text-xs px-3.5 py-2 rounded-xl font-bold flex items-center gap-1.5 cursor-pointer transition-colors"
                                id={`btn-details-${item.id}`}
                              >
                                <Info className="w-3.5 h-3.5 text-[#1b6d24]" />
                                <span>{language === 'te' ? 'యంత్రం వివరాలు' : 'Equipment Details'}</span>
                              </button>

                              <button
                                onClick={() => setSelectedRentalReceipt(item)}
                                className="bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs px-3.5 py-2 rounded-xl font-bold flex items-center gap-1.5 cursor-pointer transition-colors"
                              >
                                <Receipt className="w-3.5 h-3.5 text-[#1b6d24]" />
                                <span>{language === 'te' ? 'రసీదు చూడండి (Receipt)' : 'View Receipt'}</span>
                              </button>

                              <button
                                onClick={() => {
                                  const targetChat = chats.find(c => c.equipmentId === item.equipmentId || c.contactPhone === item.ownerPhone);
                                  if (targetChat) {
                                    setActiveChatId(targetChat.id);
                                  }
                                  setActivePage('messages_chat');
                                }}
                                className="bg-emerald-50 hover:bg-emerald-100 text-[#1b6d24] border border-emerald-200 text-xs px-3.5 py-2 rounded-xl font-bold flex items-center gap-1.5 cursor-pointer transition-colors"
                              >
                                <MessageSquare className="w-3.5 h-3.5" />
                                <span>{language === 'te' ? 'యజమానితో చాట్' : 'Chat Owner'}</span>
                              </button>

                              <button
                                onClick={() => {
                                  setNewReviewEqId(item.equipmentId);
                                  setActivePage('reviews_ratings');
                                }}
                                className="text-slate-500 hover:text-slate-800 text-xs px-3 py-2 rounded-xl font-bold flex items-center gap-1 cursor-pointer"
                              >
                                <Star className="w-3 h-3 text-amber-500" />
                                <span>{language === 'te' ? 'సమీక్ష రాయి' : 'Leave Review'}</span>
                              </button>
                            </div>

                            <button
                              onClick={() => {
                                navigateToCheckout(item.equipmentId);
                              }}
                              className="bg-[#1b6d24] hover:bg-[#15541b] text-white text-xs px-4 py-2 rounded-xl font-black flex items-center gap-1.5 cursor-pointer shadow-3xs transition-all ml-auto"
                            >
                              <RotateCcw className="w-3.5 h-3.5" />
                              <span>{language === 'te' ? 'మళ్లీ అద్దెకు తీసుకోండి' : 'Rent Again'}</span>
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  );
                })()}
              </div>
            )}

            {/* ---------------- SECTION B: COMPLETED TRANSACTIONS ---------------- */}
            {(rentalHistoryTab === 'transactions' || rentalHistoryTab === 'all') && (
              <div className="space-y-4 pt-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-sm font-black text-slate-800 uppercase tracking-wider flex items-center gap-2">
                    <Receipt className="w-4 h-4 text-[#1b6d24]" />
                    <span>{language === 'te' ? 'పూర్తయిన చెల్లింపుల లావాదేవీల రికార్డులు' : 'Completed Payment Transactions'}</span>
                  </h2>
                  <span className="text-xs text-slate-400 font-bold">
                    {payments.length} {language === 'te' ? 'లావాదేవీలు' : 'Transactions'}
                  </span>
                </div>

                <div className="bg-white border border-[#eaf2eb] rounded-[2rem] overflow-hidden shadow-xs">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs font-medium">
                      <thead className="bg-slate-50 text-slate-400 font-black uppercase tracking-widest border-b border-slate-100">
                        <tr>
                          <th className="p-4">{language === 'te' ? 'లావాదేవీ ID / తేదీ' : 'TX ID & Date'}</th>
                          <th className="p-4">{language === 'te' ? 'యంత్రం & ప్రయోజనం' : 'Equipment Details'}</th>
                          <th className="p-4">{language === 'te' ? 'చెల్లింపు విధానం' : 'Payment Method'}</th>
                          <th className="p-4">{language === 'te' ? 'మొత్తం చెల్లింపు' : 'Amount Paid'}</th>
                          <th className="p-4">{language === 'te' ? 'ఆడిట్ స్థితి' : 'Status'}</th>
                          <th className="p-4 text-right">{language === 'te' ? 'చర్య' : 'Action'}</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 font-bold">
                        {payments.map((p) => {
                          const matchedRecord = rentalHistory.find(r => r.paymentTxId === p.txId || r.equipmentTitle === p.equipmentTitle);
                          return (
                            <tr key={p.id} className="hover:bg-slate-50/50 transition-colors">
                              <td className="p-4">
                                <span className="font-mono text-slate-800 block text-xs font-black">{p.txId}</span>
                                <span className="text-[10px] text-slate-400 font-medium block mt-0.5">📅 {p.date}</span>
                              </td>
                              <td className="p-4">
                                <span className="text-slate-800 block text-xs">{p.equipmentTitle}</span>
                                <span className="text-[9.5px] text-slate-400 font-medium block">
                                  {language === 'te' ? 'సహకార రైతు అద్దె' : 'AP Cooperative Fleet Lease'}
                                </span>
                              </td>
                              <td className="p-4">
                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 text-[10px] font-bold">
                                  <CreditCard className="w-3 h-3 text-[#1b6d24]" />
                                  <span>{p.method}</span>
                                </span>
                              </td>
                              <td className="p-4">
                                <span className="text-sm font-black text-[#1b6d24]">₹{p.amount.toLocaleString()}</span>
                              </td>
                              <td className="p-4">
                                <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-800 border border-emerald-200 px-2.5 py-1 rounded-full text-[9.5px] font-black">
                                  <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                                  <span>{language === 'te' ? 'పూర్తయింది (Cleared)' : p.status}</span>
                                </span>
                              </td>
                              <td className="p-4 text-right">
                                <button
                                  onClick={() => {
                                    if (matchedRecord) {
                                      setSelectedRentalReceipt(matchedRecord);
                                    } else {
                                      // generate dynamic receipt object
                                      setSelectedRentalReceipt({
                                        id: p.id,
                                        bookingCode: `RV-BOK-${p.txId.slice(-4)}`,
                                        equipmentId: 'eq1',
                                        equipmentTitle: p.equipmentTitle,
                                        equipmentTitleEn: p.equipmentTitle,
                                        category: 'Machinery',
                                        categoryLabel: 'వ్యవసాయ యంత్రం',
                                        imageUrl: 'https://assets.khetigaadi.com/tr:h-350,w-500/new-tractor/Mahindra-JIVO-245-DI-4WD1735712127_mCvMHPx10X.png',
                                        ownerName: 'కిరణ్ కుమార్',
                                        ownerPhone: '9440123456',
                                        location: user.location || 'అనంతపురము',
                                        locationEn: user.location || 'Anantapuramu',
                                        bookingDate: p.date,
                                        completedDate: p.date,
                                        duration: 2,
                                        rateType: 'day',
                                        rateTypeLabel: 'రోజు',
                                        ratePrice: p.amount / 2,
                                        totalPaid: p.amount,
                                        driverIncluded: true,
                                        workDescription: 'పొలంలో విజయవంతంగా పూర్తి చేయబడిన పని',
                                        workDescriptionEn: 'Completed farm field work',
                                        status: 'completed',
                                        paymentTxId: p.txId,
                                        paymentMethod: p.method,
                                        paymentDate: p.date
                                      });
                                    }
                                  }}
                                  className="text-xs text-[#1b6d24] hover:underline font-bold inline-flex items-center gap-1 cursor-pointer bg-emerald-50 px-2.5 py-1.5 rounded-lg border border-emerald-200"
                                >
                                  <Receipt className="w-3 h-3" />
                                  <span>{language === 'te' ? 'రసీదు' : 'Receipt'}</span>
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>

                  {/* Summary Footer */}
                  <div className="bg-slate-50 border-t border-slate-100 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs font-bold text-slate-700">
                    <span className="text-slate-500">
                      {language === 'te' ? 'మొత్తం క్లియర్ చేయబడిన రికార్డులు:' : 'Total verified ledger records:'} {payments.length}
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="text-slate-500">{language === 'te' ? 'మొత్తం చెల్లింపుల విలువ:' : 'Total Transacted Value:'}</span>
                      <span className="text-sm font-black text-[#1b6d24]">
                        ₹{payments.reduce((s, p) => s + p.amount, 0).toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ----------------- PAGE 5: BOOKING DETAILS ----------------- */}
        {activePage === 'booking_details' && (
          <div className="space-y-6 animate-fade-in" id="view-booking-details">
            {activeBookingEq ? (
              <div className="max-w-xl mx-auto bg-white border border-[#eaf2eb] rounded-[2.5rem] overflow-hidden shadow-md">
                
                {/* Header card Receipt shape */}
                <div className="bg-[#1b6d24] p-5 text-white text-center pb-8">
                  <span className="text-[8px] font-black tracking-widest bg-emerald-800 px-3 py-1 rounded-full uppercase border border-emerald-400/20">
                    {language === 'te' ? 'అధికారిక రసీదుపత్రం' : 'Official Rent Lease Receipt'}
                  </span>
                  
                  <h3 className="text-lg font-black mt-3">
                    {language === 'te' ? activeBookingEq.title : (activeBookingEq.titleEn || activeBookingEq.title)}
                  </h3>
                  
                  <p className="text-[10px] text-emerald-100 mt-1">
                    Booking ID: RV-BOOK-2026-{Math.floor(10000 + Math.random() * 90000)}
                  </p>
                </div>

                {/* Body Details */}
                <div className="p-6 space-y-5 -mt-4 bg-white rounded-t-[2rem] relative">
                  
                  <div className="grid grid-cols-2 gap-4 border-b border-slate-100 pb-4">
                    <div>
                      <span className="text-[8.5px] text-slate-400 font-extrabold uppercase block">{language === 'te' ? 'బుకింగ్ తేదీ' : 'Booking Active Date'}</span>
                      <span className="text-xs font-black text-slate-700">2026-06-11 (Tomorrow)</span>
                    </div>
                    <div>
                      <span className="text-[8.5px] text-slate-400 font-extrabold uppercase block">{language === 'te' ? 'అద్దె కాలపరిమితి' : 'Lease Duration'}</span>
                      <span className="text-xs font-black text-slate-700">
                        {getBookingDuration(activeBookingEq.id, activeBookingEq.rateType)}{' '}
                        {activeBookingEq.rateType === 'day' 
                          ? (language === 'te' ? 'రోజులు' : 'Days') 
                          : (language === 'te' ? 'గంటలు' : 'Hours')}{' '}
                        guaranteed
                      </span>
                    </div>
                  </div>

                  {getBookingLocation(activeBookingEq.id) && (
                    <div className="border-b border-slate-100 pb-4">
                      <span className="text-[8.5px] text-slate-400 font-extrabold uppercase block">{language === 'te' ? '📍 డెలివరీ ప్రాంతం/చిరునామా' : '📍 Delivery Location Address'}</span>
                      <span className="text-xs font-black text-emerald-800 leading-relaxed block mt-0.5">
                        {getBookingLocation(activeBookingEq.id)}
                      </span>
                    </div>
                  )}

                  {/* Pricing Breakdown inside receipt */}
                  <div className="space-y-2 border-b border-slate-100 pb-4 text-xs font-medium">
                    <span className="text-[8.5px] text-slate-400 font-extrabold uppercase block mb-1">{language === 'te' ? 'ధర గణన (Bill calculation)' : 'Bill breakdown'}</span>
                    
                    <div className="flex justify-between">
                      <span className="text-slate-500">
                        {language === 'te' ? 'అద్దె ఛార్జ్' : 'Rental Rate'}{' '}
                        ({getBookingDuration(activeBookingEq.id, activeBookingEq.rateType)} x ₹{activeBookingEq.price})
                      </span>
                      <span className="text-slate-800 font-bold">
                        ₹{activeBookingEq.price * getBookingDuration(activeBookingEq.id, activeBookingEq.rateType)}
                      </span>
                    </div>
                    
                    <div className="flex justify-between">
                      <span className="text-slate-500">{language === 'te' ? 'రవాణా సమర్థత ఫీజు' : 'Cooperative Transport Fee'}</span>
                      <span className="text-emerald-700 font-bold">{language === 'te' ? 'రాయితీ (ఉచితం)' : 'Cooperative Free'}</span>
                    </div>

                    <div className="flex justify-between text-sm font-black border-t border-slate-50 pt-2 text-[#1b6d24]">
                      <span>{language === 'te' ? 'చెల్లించిన మొత్తం' : 'Total Net Paid'}</span>
                      <span>
                        ₹{activeBookingEq.price * getBookingDuration(activeBookingEq.id, activeBookingEq.rateType)}
                      </span>
                    </div>
                  </div>

                  {/* Interactive Verification QR Code block */}
                  <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 flex flex-col items-center text-center justify-center space-y-2.5">
                    
                    {/* SVG graphic to represent high-fidelity dynamic QR */}
                    <div className="w-24 h-24 bg-white p-2 border border-slate-200 rounded-lg flex items-center justify-center">
                      <svg className="w-full h-full" viewBox="0 0 100 100">
                        <rect x="5" y="5" width="20" height="20" className="fill-emerald-800" />
                        <rect x="10" y="10" width="10" height="10" className="fill-white" />
                        
                        <rect x="75" y="5" width="20" height="20" className="fill-emerald-800" />
                        <rect x="80" y="10" width="10" height="10" className="fill-white" />
                        
                        <rect x="5" y="75" width="20" height="20" className="fill-emerald-800" />
                        <rect x="10" y="80" width="10" height="10" className="fill-white" />
                        
                        {/* Dynamic bits */}
                        <path d="M 35 15 H 45 V 25 H 35 Z" className="fill-emerald-800" />
                        <path d="M 55 15 H 65 V 25 H 55 Z" className="fill-emerald-800" />
                        <path d="M 35 35 H 45 V 45 H 35 Z" className="fill-emerald-800" />
                        <path d="M 55 55 H 65 V 65 H 55 Z" className="fill-emerald-800" />
                        <path d="M 75 75 H 85 V 85 H 75 Z" className="fill-emerald-800" />
                        <path d="M 15 55 H 25 V 65 H 15 Z" className="fill-emerald-800" />
                        
                        {/* Core Verification Emblem */}
                        <circle cx="50" cy="50" r="12" className="fill-white" />
                        <circle cx="50" cy="50" r="8" className="fill-emerald-600" />
                      </svg>
                    </div>

                    <div>
                      <span className="text-[10px] font-black text-[#1b6d24] uppercase tracking-widest block">
                        {language === 'te' ? 'ధృవీకరణ క్యూఆర్ కోడ్' : 'Rent QR Handshake Token'}
                      </span>
                      <p className="text-[9.5px] text-slate-450 leading-relaxed max-w-xs mt-0.5">
                        {language === 'te' ? 'యంత్ర రవాణా డ్రైవర్ వచ్చినప్పుడు ఈ క్యూఆర్ కోడ్ చూపిస్తే సరిపోతుంది.' : 'Lenders or transport dispatchers scan this code at delivery checklist handovers.'}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-2">
                    <button 
                      onClick={() => {
                        const targetChat = chats.find(c => c.equipmentId === activeBookingEq.id || c.contactPhone === activeBookingEq.ownerPhone);
                        if (targetChat) {
                          setActiveChatId(targetChat.id);
                        }
                        setActivePage('messages_chat');
                      }}
                      className="flex-1 bg-emerald-700 hover:bg-emerald-800 text-white text-xs py-2.5 rounded-xl font-bold flex items-center justify-center gap-1.5 cursor-pointer shadow-3xs"
                    >
                      <MessageSquare className="w-4 h-4" />
                      <span>{language === 'te' ? 'యజమానితో మాట్లాడండి (Chat)' : 'Chat with Owner'}</span>
                    </button>

                    <button 
                      onClick={() => {
                        window.print();
                      }}
                      className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs py-2.5 rounded-xl font-bold flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <Printer className="w-4 h-4" />
                      <span>{language === 'te' ? 'రసీదు ప్రింట్' : 'Print Receipt'}</span>
                    </button>
                    
                    <button 
                      onClick={() => setActivePage('my_bookings')}
                      className="flex-1 bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs py-2.5 rounded-xl font-bold cursor-pointer"
                    >
                      {language === 'te' ? 'నా బుకింగ్స్' : 'Back to Bookings'}
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-12 bg-white rounded-2xl border border-slate-100">
                <p className="text-slate-400 text-xs font-bold">{language === 'te' ? 'దయచేసి ఒక బుకింగ్‌ను ఎంచుకోండి.' : 'Please select an active rent booking to load receipt metrics.'}</p>
                <button onClick={() => setActivePage('my_bookings')} className="mt-4 bg-[#1b6d24] text-white text-xs px-4 py-2 rounded-xl">
                  {language === 'te' ? 'నా బుకింగ్స్' : 'My Bookings'}
                </button>
              </div>
            )}
          </div>
        )}

        {/* ----------------- PAGE 6: PAYMENT PAGE ----------------- */}
        {activePage === 'payment_page' && (
          <div className="space-y-6 animate-fade-in" id="view-payment-page">
            {activeCheckoutEq ? (
              <div className="max-w-xl mx-auto bg-white border border-[#eaf2eb] rounded-[2.5rem] p-6 shadow-md">
                <h1 className="text-base font-black text-slate-800 border-b border-slate-100 pb-3">
                  {language === 'te' ? 'సురక్షిత అద్దె చెల్లింపు గేట్‌వే' : 'Secure Cooperative Checkout'}
                </h1>

                {/* Selected Item Recap card */}
                <div className="py-4 flex gap-3.5">
                  <img 
                    src={activeCheckoutEq.imageUrl} 
                    alt={activeCheckoutEq.title} 
                    className="w-16 h-16 object-cover rounded-xl"
                    referrerPolicy="no-referrer"
                  />
                  <div>
                    <h4 className="text-xs font-black text-slate-800">
                      {language === 'te' ? activeCheckoutEq.title : (activeCheckoutEq.titleEn || activeCheckoutEq.title)}
                    </h4>
                    <span className="text-[9px] text-[#1b6d24] font-bold">
                      ₹{activeCheckoutEq.price} x {duration} {activeCheckoutEq.rateType === 'day' ? (language === 'te' ? 'రోజుల బుకింగ్' : 'days lease') : (language === 'te' ? 'గంటల బుకింగ్' : 'hours lease')}
                    </span>
                    <p className="text-sm font-black text-slate-850 mt-1">₹{activeCheckoutEq.price * duration}</p>
                  </div>
                </div>

                {/* Duration interactive selector (gantalu selector) */}
                <div className="py-3 border-y border-slate-100 mb-4 space-y-1.5 bg-slate-50/50 p-3.5 rounded-2xl">
                  <span className="text-[10px] text-slate-400 font-black uppercase tracking-widest block">
                    {language === 'te' ? 'వ్యవసాయ యంత్ర సమయం (Lease Duration):' : 'Select Rental Duration:'}
                  </span>
                  <div className="flex items-center gap-4">
                    <button
                      type="button"
                      onClick={() => setDuration(prev => Math.max(1, prev - 1))}
                      className="w-8 h-8 rounded-xl bg-white border border-slate-200 flex items-center justify-center hover:bg-slate-100 transition active:scale-95"
                    >
                      <Minus className="w-3.5 h-3.5 text-slate-600" />
                    </button>
                    <div className="text-center min-w-[70px]">
                      <span className="text-sm font-black text-slate-850">{duration}</span>
                      <span className="text-[10px] text-slate-500 font-bold ml-1">
                        {activeCheckoutEq.rateType === 'day' 
                          ? (language === 'te' ? 'రోజులు' : 'days') 
                          : (language === 'te' ? 'గంటలు' : 'hours')}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setDuration(prev => prev + 1)}
                      className="w-8 h-8 rounded-xl bg-white border border-slate-200 flex items-center justify-center hover:bg-slate-100 transition active:scale-95"
                    >
                      <Plus className="w-3.5 h-3.5 text-slate-600" />
                    </button>
                  </div>
                </div>

                {/* Owner message input (chat while booking) */}
                <div className="mb-4 space-y-1.5 bg-slate-50/50 p-3.5 rounded-2xl">
                  <span className="text-[10px] text-slate-400 font-black uppercase tracking-widest block">
                    {language === 'te' ? 'యజమానితో చాట్ ప్రారంభించండి (Message to Owner):' : 'Type message to send owner:'}
                  </span>
                  <textarea
                    rows={2}
                    value={customMessage}
                    onChange={(e) => setCustomMessage(e.target.value)}
                    className="w-full text-xs font-bold bg-white border border-slate-150 rounded-xl p-2.5 focus:outline-none focus:ring-1 focus:ring-[#1b6d24]"
                    placeholder={language === 'te' ? 'రవాణా సమయం లేదా డ్రైవర్ వివరాల గురించి యజమానికి పంపండి...' : 'Chat with owner regarding driver schedules, fuel, fields...'}
                  />
                </div>

                {/* Form Selection Checkout */}
                <form onSubmit={(e) => handleProcessPayment(e, activeCheckoutEq)} className="space-y-4">
                  
                  <div>
                    <span className="text-[10px] text-slate-400 font-black uppercase tracking-widest block mb-2">
                      {language === 'te' ? 'చెల్లింపు విధానాన్ని ఎంచుకోండి' : 'Choose Payment Method'}
                    </span>

                    <div className="space-y-2">
                      {/* UPI Option */}
                      <label className="flex items-center gap-3 p-3.5 border border-slate-150 rounded-2xl cursor-pointer hover:border-[#1b6d24] transition-all block">
                        <input 
                          type="radio" 
                          name="payment_choice" 
                          checked={paymentChoice === 'upi'}
                          onChange={() => setPaymentChoice('upi')}
                          className="accent-[#1b6d24] w-4 h-4"
                        />
                        <div className="flex-1">
                          <span className="text-xs font-extrabold text-slate-700 block">UPI Pay (GPAY/PhonePe)</span>
                          <span className="text-[9.5px] text-slate-400 block">{language === 'te' ? 'ఫోన్ ద్వారా తక్షణ చెల్లింపు' : 'Secure checkout from any mobile application'}</span>
                        </div>
                      </label>

                      {paymentChoice === 'upi' && (
                        <div className="pl-7 grid grid-cols-3 gap-2 py-1 animate-scale-up">
                          <button 
                            type="button" 
                            onClick={() => setUpiMethod('phonepe')}
                            className={`py-2 border text-[10px] font-black rounded-lg ${upiMethod === 'phonepe' ? 'border-purple-500 bg-purple-50/20 text-purple-700' : 'border-slate-200'}`}
                          >
                            PhonePe
                          </button>
                          <button 
                            type="button" 
                            onClick={() => setUpiMethod('gpay')}
                            className={`py-2 border text-[10px] font-black rounded-lg ${upiMethod === 'gpay' ? 'border-blue-500 bg-blue-50/20 text-blue-700' : 'border-slate-200'}`}
                          >
                            Google Pay
                          </button>
                          <button 
                            type="button" 
                            onClick={() => setUpiMethod('paytm')}
                            className={`py-2 border text-[10px] font-black rounded-lg ${upiMethod === 'paytm' ? 'border-cyan-500 bg-cyan-50/20 text-cyan-700' : 'border-slate-200'}`}
                          >
                            Paytm
                          </button>
                        </div>
                      )}

                      {/* Cooperative Credit Account */}
                      <label className="flex items-center gap-3 p-3.5 border border-slate-150 rounded-2xl cursor-pointer hover:border-[#1b6d24] transition-all block">
                        <input 
                          type="radio" 
                          name="payment_choice" 
                          checked={paymentChoice === 'credit'}
                          onChange={() => setPaymentChoice('credit')}
                          className="accent-[#1b6d24] w-4 h-4"
                        />
                        <div className="flex-1">
                          <span className="text-xs font-extrabold text-slate-700 block">{language === 'te' ? 'సహకార క్రెడిట్ (Cooperative Credit Line)' : 'Cooperative Credit Account'}</span>
                          <span className="text-[9.5px] text-emerald-700 font-bold block">{language === 'te' ? 'మెంబర్ క్రెడిట్ ద్వారా చెల్లించండి (వ్యవస్థీకృత బ్యాలెన్స్: ₹5,000)' : 'Deduct from membership ledger. Available Balance: ₹5,000'}</span>
                        </div>
                      </label>

                      {/* Cash on Delivery */}
                      <label className="flex items-center gap-3 p-3.5 border border-slate-150 rounded-2xl cursor-pointer hover:border-[#1b6d24] transition-all block">
                        <input 
                          type="radio" 
                          name="payment_choice" 
                          checked={paymentChoice === 'cod'}
                          onChange={() => setPaymentChoice('cod')}
                          className="accent-[#1b6d24] w-4 h-4"
                        />
                        <div className="flex-1">
                          <span className="text-xs font-extrabold text-slate-700 block">{language === 'te' ? 'యంత్రం అప్పగించినప్పుడు నగదు చెల్లింపు (COD)' : 'Cash on Delivery (COD)'}</span>
                          <span className="text-[9.5px] text-slate-400 block">{language === 'te' ? 'డ్రైవర్ వద్దకు వచ్చినప్పుడు నేరుగా చెల్లించండి' : 'Pay lender directly in hand during pickup.'}</span>
                        </div>
                      </label>
                    </div>
                  </div>

                  {paymentProcessing ? (
                    <div className="bg-slate-50 border border-slate-150 rounded-xl p-4 flex items-center justify-center gap-2">
                      <Loader2 className="w-4 h-4 text-[#1b6d24] animate-spin" />
                      <span className="text-xs font-extrabold text-[#1b6d24]">
                        {language === 'te' ? 'లావాదేవీ రికార్డు ప్రొసెస్ అవుతుంది...' : 'Syncing secure cooperative bank tokens...'}
                      </span>
                    </div>
                  ) : (
                    <button 
                      type="submit" 
                      className="w-full bg-[#1b6d24] hover:bg-[#15541b] text-white py-3 rounded-2xl font-extrabold text-xs shadow-md active:scale-95 transition-all text-center cursor-pointer"
                      id="btn-confirm-payment"
                    >
                      {language === 'te' 
                        ? `రూ. ${activeCheckoutEq.price * duration} చెల్లించి బుకింగ్ ఖరారు చేయండి` 
                        : `Confirm Rental Details & Pay ₹${activeCheckoutEq.price * duration}`}
                    </button>
                  )}
                </form>
              </div>
            ) : (
              <div className="text-center py-12 bg-white rounded-2xl border border-slate-100">
                <p className="text-slate-400 text-xs font-bold">{language === 'te' ? 'దయచేసి ఒక పరికరం ఎంచుకోండి.' : 'Checkout session is empty.'}</p>
                <button onClick={() => setActivePage('search_equipment')} className="mt-4 bg-[#1b6d24] text-white text-xs px-4 py-2 rounded-xl">
                  {language === 'te' ? 'మరొక పరికరం శోధించండి' : 'Browse Fleet'}
                </button>
              </div>
            )}
          </div>
        )}

        {/* ----------------- PAGE 7: PAYMENT HISTORY ----------------- */}
        {activePage === 'payment_history' && (
          <div className="space-y-6 animate-fade-in" id="view-payment-history">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h1 className="text-lg font-black text-slate-800">
                  {language === 'te' ? 'లావాదేవీల రికార్డుల చరిత్ర' : 'Your Rent Ledger Payment History'}
                </h1>
                <p className="text-xs text-slate-400 font-medium">
                  {language === 'te' ? 'రైతు వేదిక ద్వారా పూర్తయిన ఆర్థిక చెల్లింపుల రికార్డుల లెడ్జర్' : 'Printable receipts, bank audit logs, and lease tax statements.'}
                </p>
              </div>

              <button
                onClick={() => {
                  setRentalHistoryTab('transactions');
                  setActivePage('rental_history');
                }}
                className="bg-emerald-50 hover:bg-emerald-100 text-[#1b6d24] border border-emerald-200 text-xs px-3.5 py-2 rounded-xl font-bold flex items-center gap-1.5 self-start sm:self-auto cursor-pointer transition-colors"
                id="btn-goto-full-rental-history"
              >
                <History className="w-4 h-4 text-[#1b6d24]" />
                <span>{language === 'te' ? 'పూర్తి అద్దె చరిత్ర & రశీదులు' : 'View Full Rental History'}</span>
              </button>
            </div>

            <div className="bg-white border border-[#eaf2eb] rounded-[2rem] overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs font-medium">
                  <thead className="bg-slate-50 text-slate-400 font-black uppercase tracking-widest border-b border-slate-100">
                    <tr>
                      <th className="p-4">{language === 'te' ? 'యంత్రం పేరు' : 'Equipment'}</th>
                      <th className="p-4">{language === 'te' ? 'తేదీ' : 'Transaction Date'}</th>
                      <th className="p-4">{language === 'te' ? 'విధానం' : 'Method'}</th>
                      <th className="p-4">{language === 'te' ? 'మొత్తం' : 'Total Paid'}</th>
                      <th className="p-4">{language === 'te' ? 'స్థితి' : 'Status'}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-bold">
                    {payments.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="py-12 px-4 text-center">
                          <div className="max-w-md mx-auto space-y-3">
                            <Receipt className="w-10 h-10 text-slate-300 mx-auto" />
                            <p className="text-xs font-black text-slate-700">
                              {language === 'te' ? 'ఇంకా ఎలాంటి చెల్లింపు రికార్డులు లేవు' : 'No Payment Transactions Yet'}
                            </p>
                            <p className="text-[11px] text-slate-400 font-medium leading-relaxed">
                              {language === 'te'
                                ? 'మీరు యంత్రాలను అద్దెకు తీసుకుని యూపీఐ లేదా నగదు ద్వారా చెల్లించినప్పుడు అధికారిక రశీదులు మరియు బ్యాంక్ లెడ్జర్ వివరాలు ఇక్కడ కనిపిస్తాయి.'
                                : 'Your official payment receipts, transaction IDs, and cooperative audit logs will appear here once you rent equipment.'}
                            </p>
                            <button
                              onClick={() => setActivePage('search_equipment')}
                              className="mt-2 bg-[#1b6d24] text-white text-xs px-4 py-2 rounded-xl font-bold inline-flex items-center gap-1.5 cursor-pointer shadow-xs hover:bg-[#15541b] transition-all"
                            >
                              <Plus className="w-3.5 h-3.5" />
                              <span>{language === 'te' ? 'యంత్రాల జాబితా చూడండి' : 'Browse Machinery Fleet'}</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      payments.map((p) => (
                        <tr key={p.id} className="hover:bg-slate-50/50">
                          <td className="p-4">
                            <span className="text-slate-800 block text-xs">{p.equipmentTitle}</span>
                            <span className="text-[9px] text-slate-400 font-medium block">TXID: {p.txId}</span>
                          </td>
                          <td className="p-4 text-slate-500">{p.date}</td>
                          <td className="p-4 text-slate-600">{p.method}</td>
                          <td className="p-4 text-slate-800">₹{p.amount}</td>
                          <td className="p-4">
                            <span className="bg-emerald-50 text-emerald-800 border border-emerald-100 px-2 py-0.5 rounded-full text-[9px]">
                              {p.status}
                            </span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ----------------- PAGE 8: FAVORITE EQUIPMENT ----------------- */}
        {activePage === 'favorite_equipment' && (
          <div className="space-y-6 animate-fade-in" id="view-favorite-equipment">
            <div>
              <h1 className="text-lg font-black text-slate-800">
                {language === 'te' ? 'నా ఇష్టమైన వ్యవసాయ యంత్రాలు' : 'Your Bookmarked Machinery & Sprayers'}
              </h1>
              <p className="text-xs text-slate-400 font-medium">
                {language === 'te' ? 'త్వరగా క్లిక్ చేసి బుక్ చేసుకోడానికి వీలుగా మీరు సేవ్ చేసిన యంత్రాలు' : 'Instant 1-click access to tools you lease frequently this harvest season.'}
              </p>
            </div>

            {favorites.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {favorites.map((favId) => {
                  const eqItem = equipmentList.find(e => e.id === favId);
                  if (!eqItem) return null;
                  return (
                    <div key={favId} className="bg-white border border-[#eaf2eb] rounded-2.5xl overflow-hidden shadow-xs hover:shadow-sm">
                      <img 
                        src={eqItem.imageUrl} 
                        alt={eqItem.title} 
                        className="w-full h-36 object-cover"
                        referrerPolicy="no-referrer"
                      />
                      <div className="p-4 space-y-2">
                        <h4 className="text-xs font-black text-slate-800">
                          {language === 'te' ? eqItem.title : (eqItem.titleEn || eqItem.title)}
                        </h4>
                        <p className="text-[10px] text-slate-400 flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5" />
                          <span>{language === 'te' ? eqItem.location : eqItem.locationEn}</span>
                        </p>
                        <div className="flex justify-between items-center border-t border-slate-100 pt-3 mt-1.5">
                          <span className="text-xs font-black text-[#1b6d24]">₹{eqItem.price}/{language === 'te' ? eqItem.rateTypeLabel : eqItem.rateType}</span>
                          <div className="flex gap-1.5">
                            <button 
                              onClick={() => toggleFavorite(eqItem.id)}
                              className="p-1 px-1.5 text-red-500 bg-red-50 hover:bg-red-105 rounded-lg cursor-pointer"
                              id={`remove-fav-eq-${eqItem.id}`}
                            >
                              ✕
                            </button>
                            <button 
                              onClick={() => showEquipmentDetails(eqItem.id)}
                              className="bg-[#1b6d24] text-white text-[10px] py-1.5 px-3 rounded-lg font-extrabold cursor-pointer"
                            >
                              {language === 'te' ? 'బుక్ చేయు' : 'Show Details'}
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="bg-white border border-[#eaf2eb] rounded-[2.5rem] p-10 text-center space-y-4 shadow-xs">
                <div className="w-16 h-16 bg-rose-50 text-rose-500 rounded-2xl flex items-center justify-center mx-auto border border-rose-100">
                  <Heart className="w-8 h-8 text-rose-400" />
                </div>
                <div className="max-w-md mx-auto space-y-1.5">
                  <h3 className="text-base font-black text-slate-800">
                    {language === 'te' ? 'ఇష్టమైన పరికరాల జాబితా ఖాళీగా ఉంది' : 'No Favorite Equipment Saved Yet'}
                  </h3>
                  <p className="text-xs text-slate-500 leading-relaxed font-medium">
                    {language === 'te' 
                      ? 'మీకు నచ్చిన లేదా తరచుగా అద్దెకు తీసుకునే ట్రాక్టర్లు, హార్వెస్టర్లపై గుండె గుర్తు (❤️) పై క్లిక్ చేసి ఇక్కడ సులభంగా సేవ్ చేసుకోండి.' 
                      : 'Bookmark your favorite tractors, harvesters, or power sprayers with the heart icon for fast 1-click booking.'}
                  </p>
                </div>
                <button 
                  onClick={() => setActivePage('search_equipment')} 
                  className="bg-[#1b6d24] hover:bg-[#15541b] text-white text-xs px-6 py-2.5 rounded-xl font-extrabold inline-flex items-center gap-2 cursor-pointer shadow-xs transition-all active:scale-95"
                >
                  <Plus className="w-4 h-4" />
                  <span>{language === 'te' ? 'యంత్రాలను శోధించి సేవ్ చేయండి' : 'Browse & Add Favorites'}</span>
                </button>
              </div>
            )}
          </div>
        )}

        {/* ----------------- PAGE 9: MESSAGES/CHAT ----------------- */}
        {activePage === 'messages_chat' && (
          <div className="relative min-h-[600px]" id="view-messages-chat">
            <MessagesView
              chats={chats}
              equipmentList={equipmentList}
              language={language}
              initialChatId={activeChatId || (chats.length === 1 ? chats[0].id : undefined)}
              onSendMessage={onSendMessage}
              onReceiveReply={onReceiveReply}
              onMarkAsRead={onMarkAsRead}
              onDeleteChat={onDeleteChat}
              onDeleteMessage={onDeleteMessage}
              userAvatar={user.avatar}
              isOwnerPerspective={false}
            />
          </div>
        )}

        {/* ----------------- PAGE 10: NOTIFICATIONS ----------------- */}
        {activePage === 'notifications' && (
          <div className="space-y-6 animate-fade-in" id="view-notifications">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-lg font-black text-slate-800">
                  {language === 'te' ? 'వ్యవసాయ హెచ్చరికలు & నోటిఫికేషన్లు' : 'Cooperative Platform Alerts'}
                </h1>
                <p className="text-xs text-slate-400 font-medium">
                  {language === 'te' ? 'రాష్ట్ర వాతావరణ విభాగం, బుకింగ్స్ అంగీకార పత్రాలు, స్థానిక మార్కెట్ అప్డేట్స్' : 'Subsidies alerts, booking confirmations and dynamic climate reports.'}
                </p>
              </div>
              
              <button 
                onClick={() => {
                  setNotifications(notifications.map(n => ({ ...n, read: true })));
                  triggerToast(language === 'te' ? 'అన్నీ చదివినట్లుగా చేర్చబడింది.' : 'Cleared all alerts.', 'info');
                }}
                className="text-xs font-black text-[#1b6d24] hover:underline cursor-pointer"
              >
                {language === 'te' ? 'అన్నీ చదివినవిగా మార్చు' : 'Mark All Read'}
              </button>
            </div>

            <div className="space-y-3">
              {notifications.map((n) => (
                <div 
                  key={n.id} 
                  className={`border rounded-2.5xl p-4 flex items-start gap-3.5 transition-all ${
                    n.read ? 'bg-white border-slate-100 opacity-80' : 'bg-[#eaf9eb]/40 border-[#c4eec7] shadow-xs'
                  }`}
                >
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${
                    n.type === 'alert' ? 'bg-orange-50 border border-orange-100 text-orange-600' :
                    n.type === 'success' ? 'bg-emerald-50 border border-emerald-100 text-emerald-600' : 'bg-blue-50 border border-blue-100 text-blue-600'
                  }`}>
                    {n.type === 'alert' ? '⚠' : '✓'}
                  </div>

                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-black text-slate-805">
                        {language === 'te' ? n.title : n.titleEn}
                      </h4>
                      <span className="text-[9px] text-slate-400 font-bold">{n.time}</span>
                    </div>
                    <p className="text-[10.5px] text-slate-600 mt-1 leading-relaxed">
                      {language === 'te' ? n.msg : n.msgEn}
                    </p>
                  </div>
                  
                  <button 
                    onClick={() => {
                      setNotifications(notifications.filter(item => item.id !== n.id));
                      triggerToast(language === 'te' ? 'నోటిఫికేషన్ నిర్మూలించబడింది.' : 'Alert dismissed.', 'info');
                    }}
                    className="text-slate-300 hover:text-red-500 font-bold text-xs"
                    id={`del-notify-${n.id}`}
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ----------------- PAGE 11: REVIEWS & RATINGS ----------------- */}
        {activePage === 'reviews_ratings' && (
          <div className="space-y-6 animate-fade-in" id="view-reviews-ratings">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              
              {/* Write Review Form Card */}
              <div className="lg:col-span-5 bg-white border border-[#eaf2eb] rounded-[2rem] p-5 shadow-xs h-fit">
                <h3 className="text-xs font-black text-slate-700 uppercase tracking-widest border-b border-slate-100 pb-3 mb-4 flex items-center gap-1">
                  <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                  <span>{language === 'te' ? 'సమీక్ష మరియు రేటింగ్ ఇవ్వండి' : 'Review Cooperative Fleet'}</span>
                </h3>

                <form onSubmit={submitReview} className="space-y-4">
                  <div>
                    <label className="text-[10px] text-slate-400 font-black uppercase block mb-1.5">{language === 'te' ? 'యంత్రాన్ని ఎంచుకోండి' : 'Select Machinery Rented'}</label>
                    <select 
                      value={newReviewEqId}
                      onChange={(e) => setNewReviewEqId(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-150 rounded-xl py-2.5 px-3 text-xs font-bold focus:outline-none"
                    >
                      <option value="">-- {language === 'te' ? 'సెలెక్ట్ యంత్రం' : 'Select Tool'} --</option>
                      {equipmentList.map(eq => (
                        <option value={eq.id} key={eq.id}>
                          {language === 'te' ? eq.title : (eq.titleEn || eq.title)}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-[10px] text-slate-400 font-black uppercase block mb-1.5">{language === 'te' ? 'రేటింగ్ ఎంచుకోండి' : 'Your Rating (1-5 Stars)'}</label>
                    <div className="flex items-center gap-1.5">
                      {[1, 2, 3, 4, 5].map((starValue) => (
                        <button 
                          key={starValue}
                          type="button" 
                          onClick={() => setNewRating(starValue)}
                          className="focus:outline-none cursor-pointer"
                        >
                          <Star className={`w-6 h-6 ${starValue <= newRating ? 'text-amber-500 fill-amber-500' : 'text-slate-200'}`} />
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] text-slate-400 font-black uppercase block mb-1.5">{language === 'te' ? 'మీ అనుభవం వివరించండి' : 'Write Descriptive Feedback'}</label>
                    <textarea 
                      rows={3}
                      value={newReviewComment}
                      onChange={(e) => setNewReviewComment(e.target.value)}
                      placeholder={language === 'te' ? "పరికరం కండిషన్, యజమాని ప్రవర్తన, రవాణా సేవలు గురుంచి వ్రాయండి..." : "How was the engine horsepower, operator speed, or fuel performance?"}
                      className="w-full bg-slate-50 border border-slate-150 rounded-xl p-3 text-xs font-bold focus:outline-none"
                    />
                  </div>

                  <button 
                    type="submit" 
                    className="w-full bg-[#1b6d24] text-white font-extrabold text-xs py-2.5 rounded-xl shadow-xs hover:bg-[#15541b] text-center block cursor-pointer"
                  >
                    {language === 'te' ? 'సమీక్ష సమర్పించండి (Submit)' : 'Submit Review Record'}
                  </button>
                </form>
              </div>

              {/* Community Reviews List */}
              <div className="lg:col-span-7 bg-white border border-[#eaf2eb] rounded-[2rem] p-5 shadow-xs space-y-4">
                <h3 className="text-xs font-black text-slate-700 uppercase tracking-widest">{language === 'te' ? 'స్థానిక రైతుల రేటింగ్‌లు చూడండి' : 'Recent Rent Review Logs'}</h3>
                
                <div className="space-y-3.5 divide-y divide-slate-100">
                  {reviews.map((r, idx) => (
                    <div key={r.id} className={`pt-3.5 ${idx === 0 ? 'pt-0 border-t-0' : ''}`}>
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="text-[10px] bg-slate-100 px-2 py-0.5 rounded font-black text-slate-500">
                            {r.equipmentTitle}
                          </span>
                          <span className="text-xs font-black text-[#1b6d24] ml-2">★ {r.rating}/5</span>
                        </div>
                        <span className="text-[9px] text-slate-400 font-bold">{r.date}</span>
                      </div>
                      
                      <p className="text-[10.5px] text-slate-600 font-bold mt-1.5 leading-relaxed italic">
                        "{r.comment}"
                      </p>
                      
                      <span className="text-[9.5px] text-slate-400 block mt-1.5">
                        — {r.farmerName} ({language === 'te' ? 'ధృవీకృత అద్దెదారు' : 'Verified Lessee'})
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ----------------- PAGE: LIST & RENT OUT MY TOOLS ----------------- */}
        {activePage === 'list_my_tools' && (
          <div className="space-y-6 animate-fade-in" id="view-list-my-tools">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
              <div>
                <h2 className="text-sm font-black text-slate-800 uppercase tracking-wider">
                  {language === 'te' ? '⚙️ నా యంత్రాలు & ఉపకరణాలు' : '⚙️ My Machinery & Rental Catalog'}
                </h2>
                <p className="text-[11px] text-slate-450 mt-1 font-bold">
                  {language === 'te' 
                    ? 'మీ సొంత వ్యవసాయ పరికరాలను అద్దెకు ఇచ్చి అదనపు ఆదాయం సంపాదించండి.' 
                    : 'List your secondary equipment, weeding tools, or motor sprayers to generate cooperative revenue.'}
                </p>
              </div>

              <button
                type="button"
                onClick={() => setShowAddForm(!showAddForm)}
                className="bg-[#1b6d24] hover:bg-emerald-800 text-white font-black text-[11px] px-4 py-2.5 rounded-xl transition-all shadow-xs flex items-center gap-1.5 self-start sm:self-center"
              >
                {showAddForm ? (
                  <>✕ {language === 'te' ? 'మూసివేయి' : 'Cancel'}</>
                ) : (
                  <>+ {language === 'te' ? 'అద్దెకు పరికరం జోడించు' : 'Add Tool for Rent'}</>
                )}
              </button>
            </div>

            {/* List New Tool Form Panel */}
            {showAddForm && (
              <form 
                onSubmit={(e) => {
                  e.preventDefault();
                  if (!toolTitle.trim() && !toolTitleEn.trim()) {
                    triggerToast(language === 'te' ? 'దయచేసి పరికరం పేరు నమోదు చేయండి!' : 'Please enter equipment name!', 'error');
                    return;
                  }
                  if (!toolPrice || isNaN(Number(toolPrice))) {
                    triggerToast(language === 'te' ? 'సరైన రోజువారీ రేటును నమోదు చేయండి!' : 'Please enter a valid rental price!', 'error');
                    return;
                  }

                  const defaultImg = toolImageUrl || 'https://images.unsplash.com/photo-1592982537447-7440770cbfc9?auto=format&fit=crop&w=400&q=80';
                  const freshId = `eq_farm_${Date.now()}`;
                  
                  const freshEquipment: Equipment = {
                    id: freshId,
                    title: toolTitle || toolTitleEn,
                    titleEn: toolTitleEn || toolTitle,
                    category: toolCategory,
                    categoryLabel: toolCategory.toUpperCase(),
                    location: user.location || 'గుంటూరు',
                    locationEn: user.village || 'Guntur',
                    price: Number(toolPrice),
                    rateType: toolRateType,
                    rateTypeLabel: toolRateType === 'day' ? '/రోజు' : '/గంట',
                    imageUrl: defaultImg,
                    status: 'available',
                    statusLabel: 'అందుబాటులో ఉంది',
                    ownerName: user.name,
                    ownerPhone: user.phone,
                    ownerAvatar: user.avatar,
                    verified: true,
                    isCustom: true,
                    description: toolDesc || 'రైతు నేరుగా అద్దెకు ఇస్తున్న నాణ్యమైన పరికరం.',
                    descriptionEn: toolDescEn || 'High-efficiency farming tool listed directly by co-op farmer member.',
                    horsepower: toolHP || '15 HP',
                    fuelType: toolFuel,
                    includesDriver: toolDriver,
                    specs: [
                      language === 'te' ? 'రైతు భాగస్వామ్య ధృవీకరణ' : 'Farmer partner verified',
                      toolFuel ? `${toolFuel} engine` : 'Manual operations',
                      toolDriver ? (language === 'te' ? 'డ్రైవర్ సహకారం ఉంది' : 'With operator') : (language === 'te' ? 'సెల్ఫ్ ఆపరేషన్' : 'Self-run')
                    ]
                  };

                  // Update global parent state, which saves to localStorage
                  updateEquipment([freshEquipment, ...equipmentList]);
                  
                  // Update current user listed collection
                  const updatedUser = {
                    ...user,
                    listedEquipmentIds: [...(user.listedEquipmentIds || []), freshId]
                  };
                  updateUserProfile(updatedUser);

                  // Reset form fields
                  setToolTitle('');
                  setToolTitleEn('');
                  setToolPrice('');
                  setToolImageUrl('');
                  setToolDesc('');
                  setToolDescEn('');
                  setToolHP('');
                  setShowAddForm(false);

                  triggerToast(language === 'te' ? 'మీ పరికరం విజయవంతంగా జాబితా చేయబడింది!' : 'Tool listed for cooperative rent successfully!', 'success');
                }}
                className="bg-white border border-[#eaf2eb] rounded-[2rem] p-6 shadow-xs space-y-4 animate-scale-up"
              >
                <h3 className="text-xs font-black text-slate-800 uppercase tracking-widest border-b pb-2">
                  {language === 'te' ? '📝 పరికరం వివరాల ఫారం' : '📝 Equipment Specifications Form'}
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Telugu Name */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase text-slate-500 block">
                      {language === 'te' ? 'పరికరం పేరు (తెలుగు) *' : 'Equipment Name (Telugu) *'}
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="ఉదా: పవర్ టిల్లర్, పిచికారీ పంప్"
                      value={toolTitle}
                      onChange={(e) => setToolTitle(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:ring-1 focus:ring-[#1b6d24] outline-none"
                    />
                  </div>

                  {/* English Name */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase text-slate-500 block">
                      {language === 'te' ? 'పరికరం పేరు (English) *' : 'Equipment Name (English) *'}
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Power Tiller, Battery Sprayer"
                      value={toolTitleEn}
                      onChange={(e) => setToolTitleEn(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:ring-1 focus:ring-[#1b6d24] outline-none"
                    />
                  </div>

                  {/* Category select */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase text-slate-500 block">
                      {language === 'te' ? 'వర్గం (Category)' : 'Category'}
                    </label>
                    <select
                      value={toolCategory}
                      onChange={(e) => setToolCategory(e.target.value as CategoryType)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:ring-1 focus:ring-[#1b6d24] outline-none"
                    >
                      <option value="tractor">{language === 'te' ? 'ట్రాక్టర్ (Tractor)' : 'Tractor'}</option>
                      <option value="harvester">{language === 'te' ? 'వరి కోత మిషన్ (Harvester)' : 'Harvester'}</option>
                      <option value="sprayer">{language === 'te' ? 'పిచికారీ సాధనం (Sprayer)' : 'Sprayer'}</option>
                      <option value="tiller">{language === 'te' ? 'పవర్ టిల్లర్ (Tiller)' : 'Tiller'}</option>
                      <option value="rotavator">{language === 'te' ? 'రోటవేటర్ (Rotavator)' : 'Rotavator'}</option>
                      <option value="thresher">{language === 'te' ? 'నూర్పిడి మిషన్ (Thresher)' : 'Thresher'}</option>
                      <option value="other">{language === 'te' ? 'ఇతర చిన్న పనిముట్లు (Other)' : 'Other/Small Tools'}</option>
                    </select>
                  </div>

                  {/* Rental Price & RateType */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase text-slate-500 block">
                      {language === 'te' ? 'అద్దె ధర (రూ.) *' : 'Rental Price (₹) *'}
                    </label>
                    <div className="flex gap-2">
                      <div className="relative flex-1">
                        <span className="absolute left-3 top-2.5 text-slate-400 text-xs">₹</span>
                        <input
                          type="number"
                          required
                          placeholder="e.g. 500"
                          value={toolPrice}
                          onChange={(e) => setToolPrice(e.target.value)}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-6 pr-3 py-2 text-xs focus:ring-1 focus:ring-[#1b6d24] outline-none font-bold"
                        />
                      </div>
                      <select
                        value={toolRateType}
                        onChange={(e) => setToolRateType(e.target.value as 'day' | 'hour')}
                        className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:ring-1 focus:ring-[#1b6d24] outline-none"
                      >
                        <option value="day">{language === 'te' ? '/రోజుకు' : '/day'}</option>
                        <option value="hour">{language === 'te' ? '/గంటకు' : '/hour'}</option>
                      </select>
                    </div>
                  </div>

                  {/* Horsepower / Size */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase text-slate-500 block">
                      {language === 'te' ? 'సామర్థ్యం / హార్స్‌పవర్ (HP)' : 'Capacity / Horsepower (HP)'}
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. 12 HP, 20 Litres"
                      value={toolHP}
                      onChange={(e) => setToolHP(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:ring-1 focus:ring-[#1b6d24] outline-none"
                    />
                  </div>

                  {/* Fuel Type */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase text-slate-500 block">
                      {language === 'te' ? 'ఇంధన రకం (Fuel Type)' : 'Fuel Type'}
                    </label>
                    <select
                      value={toolFuel}
                      onChange={(e) => setToolFuel(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:ring-1 focus:ring-[#1b6d24] outline-none"
                    >
                      <option value="Diesel">{language === 'te' ? 'డీజిల్ (Diesel)' : 'Diesel'}</option>
                      <option value="Petrol">{language === 'te' ? 'పెట్రోల్ (Petrol)' : 'Petrol'}</option>
                      <option value="Battery/Electric">{language === 'te' ? 'బ్యాటరీ / ఎలక్ట్రిక్' : 'Battery/Electric'}</option>
                      <option value="Manual">{language === 'te' ? 'మాన్యువల్ / చేతితో పనిచేసేది' : 'Manual / Hand Operated'}</option>
                    </select>
                  </div>
                </div>

                {/* File custom upload placeholder */}
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-slate-500 block">
                    {language === 'te' ? 'పరికరం ఫోటో లేదా గ్యాలరీ ఎంపిక' : 'Equipment Image or Preset Selector'}
                  </label>
                  
                  {/* Preset Selector */}
                  <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                    {[
                      { name: 'Tractor', url: 'https://images.unsplash.com/photo-1592982537447-7440770cbfc9?auto=format&fit=crop&w=150&q=80' },
                      { name: 'Tiller', url: 'https://images.unsplash.com/photo-1500937386664-56d159062255?w=150' },
                      { name: 'Sprayer', url: 'https://images.unsplash.com/photo-1589311026402-bcf1c15f9227?w=150' },
                      { name: 'Harvester', url: 'https://images.unsplash.com/photo-1530595467537-0b5996c41f2d?w=150' }
                    ].map((pre, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setToolImageUrl(pre.url)}
                        className={`border rounded-lg overflow-hidden h-12 relative ${
                          toolImageUrl === pre.url ? 'border-2 border-[#1b6d24] scale-102 ring-1 ring-[#1b6d24]' : 'border-slate-200'
                        }`}
                      >
                        <img src={pre.url} alt={pre.name} className="w-full h-full object-cover" />
                        <span className="absolute bottom-0 inset-x-0 bg-black/55 text-[8px] text-white text-center font-bold">{pre.name}</span>
                      </button>
                    ))}

                    <label className="border border-dashed border-slate-300 rounded-lg h-12 flex flex-col items-center justify-center cursor-pointer hover:border-[#1b6d24] transition-all bg-slate-55">
                      <Camera className="w-4 h-4 text-slate-400" />
                      <span className="text-[7.5px] uppercase font-black text-slate-400 mt-0.5">{language === 'te' ? 'అప్‌లోడ్' : 'Upload'}</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(ev) => {
                          const file = ev.target.files?.[0];
                          if (file) {
                            const reader = new FileReader();
                            reader.onloadend = () => {
                              setToolImageUrl(reader.result as string);
                              triggerToast(language === 'te' ? 'చిత్రం లోడ్ చేయబడింది!' : 'Selected image loaded!', 'info');
                            };
                            reader.readAsDataURL(file);
                          }
                        }}
                      />
                    </label>
                  </div>

                  {toolImageUrl && (
                    <div className="flex items-center gap-2 mt-2 bg-slate-50 p-2 rounded-xl border">
                      <img src={toolImageUrl} alt="preview" className="w-10 h-10 rounded-md object-cover border" />
                      <span className="text-[10px] text-slate-400 truncate flex-1 font-mono">{toolImageUrl.substring(0, 50)}...</span>
                      <button type="button" onClick={() => setToolImageUrl('')} className="text-[10px] text-red-500 font-bold hover:underline">✕</button>
                    </div>
                  )}
                </div>

                {/* Driver options */}
                <div className="flex items-center gap-2.5 bg-slate-50 p-3.5 rounded-2xl border">
                  <input
                    type="checkbox"
                    id="tool-driver-checkbox"
                    checked={toolDriver}
                    onChange={(e) => setToolDriver(e.target.checked)}
                    className="w-4 h-4 text-[#1b6d24] border-slate-300 rounded focus:ring-[#1b6d24] cursor-pointer"
                  />
                  <label htmlFor="tool-driver-checkbox" className="text-xs font-bold text-[#1b6d24] cursor-pointer select-none">
                    {language === 'te' 
                      ? 'అద్దె ధరతో పాటు ఆపరేటర్/డ్రైవర్ సహాయం కూడా చేర్చబడింది' 
                      : 'Operator/Driver is included with this rental listing'}
                  </label>
                </div>

                {/* Telugu & English Description */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase text-slate-500 block">
                      {language === 'te' ? 'వివరణ (తెలుగు)' : 'Description (Telugu)'}
                    </label>
                    <textarea
                      placeholder="పరికరం పనితీరు, లభ్యత మొదలైన వివరాలు నమోదు చేయండి..."
                      value={toolDesc}
                      onChange={(e) => setToolDesc(e.target.value)}
                      rows={2}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:ring-1 focus:ring-[#1b6d24] outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase text-slate-500 block">
                      {language === 'te' ? 'Description (English)' : 'Description (English)'}
                    </label>
                    <textarea
                      placeholder="Enter specifications, operational status or transport instructions..."
                      value={toolDescEn}
                      onChange={(e) => setToolDescEn(e.target.value)}
                      rows={2}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:ring-1 focus:ring-[#1b6d24] outline-none"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full bg-[#1b6d24] hover:bg-emerald-800 text-white font-black text-xs py-3 rounded-2xl transition-all shadow-md mt-2"
                >
                  {language === 'te' ? '✓ సమర్పించు & అద్దెకు పెట్టు' : '✓ Publish & List Tool'}
                </button>
              </form>
            )}

            {/* List Table/Grid section of active listings */}
            <div className="space-y-4">
              <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">
                {language === 'te' ? 'మెంబర్ యాక్టివ్ జాబితాలు' : 'Active Member Rental Listings'}
              </h3>

              {(() => {
                const myListings = equipmentList.filter((eq) => {
                  return eq.ownerPhone === user.phone || (user.listedEquipmentIds || []).includes(eq.id);
                });

                if (myListings.length === 0) {
                  return (
                    <div className="bg-white border rounded-3xl p-8 text-center text-slate-400 space-y-2">
                      <p className="text-xs font-extrabold text-slate-550">
                        {language === 'te' ? 'ఇంకా ఎటువంటి యంత్రాలను అద్దెకు పెట్టలేదు.' : 'No machinery listed for rent yet.'}
                      </p>
                      <p className="text-[10.5px]">
                        {language === 'te' 
                          ? 'పైన ఉన్న "అద్దెకు పరికరం జోడించు" బటన్ క్లిక్ చేసి మొదటి పరికరాన్ని జాబితా చేయండి.' 
                          : 'Click the list button above to list small sprayers, backup motors or weeding attachments.'}
                      </p>
                    </div>
                  );
                }

                return (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {myListings.map((eq) => {
                      const displayTitle = language === 'te' ? eq.title : eq.titleEn;
                      const displayCat = language === 'te' ? eq.categoryLabel : eq.category;
                      return (
                        <div key={eq.id} className="bg-white border border-[#eaf2eb] rounded-[2rem] p-4 flex gap-4 items-center shadow-xs hover:border-[#1b6d24] transition-all duration-200">
                          <img src={eq.imageUrl} alt={displayTitle} className="w-16 h-16 rounded-2xl object-cover border shrink-0 bg-slate-50" />
                          <div className="flex-1 min-w-0">
                            <span className="text-[8.5px] uppercase tracking-widest font-black text-emerald-800 block mb-0.5">{displayCat}</span>
                            <h4 className="text-xs font-black text-slate-800 truncate">{displayTitle}</h4>
                            <p className="text-xs font-black text-[#1b6d24] mt-0.5">₹{eq.price} {language === 'te' ? (eq.rateType === 'day' ? '/రోజుకు' : '/గంటకు') : `/${eq.rateType}`}</p>
                            
                            <div className="flex items-center gap-1.5 mt-1.5">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                              <span className="text-[9px] uppercase tracking-wider font-extrabold text-[#1b6d24]">{language === 'te' ? 'అందుబాటులో ఉంది' : 'Active Available'}</span>
                            </div>
                          </div>

                          <button
                            type="button"
                            onClick={() => {
                              // Filter out from equipmentList
                              const filteredList = equipmentList.filter(item => item.id !== eq.id);
                              updateEquipment(filteredList);

                              // Filter out from user listedEquipmentIds
                              const filteredIds = (user.listedEquipmentIds || []).filter(id => id !== eq.id);
                              updateUserProfile({
                                ...user,
                                listedEquipmentIds: filteredIds
                              });

                              triggerToast(language === 'te' ? 'అద్దె జాబితా విజయవంతంగా తొలగించబడింది!' : 'Rental listing cataloged off successfully!', 'success');
                            }}
                            title={language === 'te' ? 'జాబితాను తొలగించండి' : 'Remove Listing'}
                            className="p-2 text-slate-400 hover:text-red-650 hover:bg-red-50 rounded-xl transition-all"
                          >
                            <Trash2 className="w-4 h-4 text-red-500" />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                );
              })()}
            </div>
          </div>
        )}

        {/* ----------------- PAGE 12: PROFILE & SETTINGS ----------------- */}
        {activePage === 'profile_settings' && (
          <div className="space-y-6 animate-fade-in" id="view-profile-settings">
            <div className="max-w-xl mx-auto bg-white border border-[#eaf2eb] rounded-[2.5rem] p-6 shadow-md space-y-6">
              
              <div className="flex flex-col gap-5 border-b border-slate-100 pb-5">
                <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                  <div className="relative mx-auto sm:mx-0 shrink-0">
                    <img 
                      src={user.avatar} 
                      alt={user.name} 
                      className="w-20 h-20 rounded-full border-4 border-[#1b6d24]/25 object-cover shadow-inner"
                      referrerPolicy="no-referrer"
                      id="farmer-dashboard-avatar-img"
                    />
                    <label 
                      htmlFor="upload-avatar-file-settings"
                      className="absolute -bottom-1 -right-1 bg-[#1b6d24] hover:bg-[#15541b] text-white p-1.5 rounded-full border border-white cursor-pointer shadow-md transition-transform hover:scale-110 flex items-center justify-center w-7 h-7"
                      title={language === 'te' ? 'ఫోటోను అప్‌లోడ్ చేయండి' : 'Upload custom photo'}
                    >
                      <Camera className="w-3.5 h-3.5 text-white" />
                      <input
                        type="file"
                        id="upload-avatar-file-settings"
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
                    <p className="text-[10px] font-bold text-[#1b6d24] uppercase tracking-wider">{language === 'te' ? 'రైతు సమూహ భాగస్వామ్యం' : 'Cooperative Core Member'}</p>
                    <p className="text-[9px] text-slate-400 font-bold mt-0.5">{language === 'te' ? 'పైన ఉన్న కెమెరా ఐకాన్ పై క్లిక్ చేసి మీ సొంత గ్యాలరీ సమాచారాన్ని అప్‌లోడ్ చేయవచ్చు' : 'Click the camera badge or choose a preset photo to save your avatar profile update.'}</p>
                  </div>
                </div>

                {/* Subcategorized Avatar Presets for unmatched customization accessibility */}
                <div className="bg-slate-50/70 p-3.5 rounded-2xl border border-slate-100 space-y-3.5">
                  <div>
                    <span className="text-[9px] text-emerald-800 font-black uppercase tracking-wider block mb-1.5">
                      👩‍🌾 {language === 'te' ? 'మహిళా సభ్యులు (Women presets)' : 'Women Farmer presets'}
                    </span>
                    <div className="flex gap-2 flex-wrap">
                      {[
                        'https://thumbs.dreamstime.com/b/illustration-smiling-farmer-overalls-sun-hat-cartoon-style-agricultural-avatar-illustration-smiling-farmer-400078747.jpg',
                        'https://www.creativefabrica.com/wp-content/uploads/2022/10/19/Cute-Farmer-Girl-Character-Illustration-Graphics-42284202-1.jpg'
                      ].map((av, idx) => (
                        <button
                          key={`w-${idx}`}
                          type="button"
                          onClick={() => {
                            updateUserProfile({ ...user, avatar: av });
                            triggerToast(language === 'te' ? 'ప్రొఫైల్ ఫోటో విజయవంతంగా మార్చబడింది!' : 'Avatar changed successfully!', 'success');
                          }}
                          className={`w-9 h-9 rounded-full overflow-hidden border-2 transition-all ${
                            user.avatar === av ? 'border-[#1b6d24] scale-110 shadow-md ring-2 ring-emerald-100' : 'border-transparent opacity-75 hover:opacity-100 hover:scale-105'
                          }`}
                        >
                          <img src={av} alt="women avatar" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <span className="text-[9px] text-emerald-800 font-black uppercase tracking-wider block mb-1.5">
                      👨‍🌾 {language === 'te' ? 'పురుష సభ్యులు (Men presets)' : 'Men Farmer presets'}
                    </span>
                    <div className="flex gap-2 flex-wrap">
                      {[
                        'https://img.freepik.com/premium-photo/young-smiling-man-farmer-agricultural-worker-gardening-farming-professional-occupation-concept_1240525-15057.jpg',
                        'https://img.freepik.com/premium-psd/3d-render-male-farmer-characters-isolated-professions-occupations-avatar-icons_570783-1397.jpg'
                      ].map((av, idx) => (
                        <button
                          key={`m-${idx}`}
                          type="button"
                          onClick={() => {
                            updateUserProfile({ ...user, avatar: av });
                            triggerToast(language === 'te' ? 'ప్రొఫైల్ ఫోటో విజయవంతంగా మార్చబడింది!' : 'Avatar changed successfully!', 'success');
                          }}
                          className={`w-9 h-9 rounded-full overflow-hidden border-2 transition-all ${
                            user.avatar === av ? 'border-[#1b6d24] scale-110 shadow-md ring-2 ring-emerald-100' : 'border-transparent opacity-75 hover:opacity-100 hover:scale-105'
                          }`}
                        >
                          <img src={av} alt="men avatar" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Input form field to let the user paste an arbitrary image URL directly! */}
                  <div className="pt-2 border-t border-slate-200/60">
                    <label className="text-[9px] text-slate-450 font-black block mb-1">
                      {language === 'te' ? '🔗 ఇంటర్నెట్ ఫోటో లింక్ (Paste Image URL):' : '🔗 Paste Custom Image URL:'}
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="url"
                        value={avatarInputUrl}
                        onChange={(e) => setAvatarInputUrl(e.target.value)}
                        placeholder="https://images.unsplash.com/... or any photo link"
                        className="flex-1 bg-white border border-slate-200 rounded-xl px-2.5 py-1.5 text-[10.5px] font-bold focus:outline-none focus:border-[#1b6d24] text-slate-850"
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
                        className="bg-[#1b6d24] hover:bg-[#15541b] text-white text-[10.5px] font-black px-3 py-1.5 rounded-xl cursor-pointer transition whitespace-nowrap"
                      >
                        {language === 'te' ? 'సేవ్ చేయి' : 'Apply Link'}
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Settings Form Block */}
              <div className="space-y-4">
                <span className="text-[10px] text-slate-400 font-black uppercase tracking-widest block">{language === 'te' ? 'సభ్యత్వ సమాచారం సవరించు' : 'Update Profile Information'}</span>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[9.5px] text-slate-450 font-bold block mb-1">{language === 'te' ? 'పూర్తి పేరు' : 'Full Name'}</label>
                    <input 
                      type="text" 
                      defaultValue={user.name}
                      className="w-full bg-slate-50 border border-slate-150 rounded-xl p-2.5 text-xs font-extrabold focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-[9.5px] text-slate-450 font-bold block mb-1">{language === 'te' ? 'ఫోన్ నెంబర్' : 'Mobile'}</label>
                    <input 
                      type="text" 
                      defaultValue={user.phone}
                      className="w-full bg-slate-50 border border-slate-150 rounded-xl p-2.5 text-xs font-extrabold focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[9.5px] text-slate-450 font-bold block mb-1">{language === 'te' ? 'ప్రాథమిక గ్రామం/జిల్లా' : 'Primary Village District'}</label>
                    <input 
                      type="text" 
                      defaultValue={user.location}
                      className="w-full bg-slate-50 border border-slate-150 rounded-xl p-2.5 text-xs font-extrabold focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-[9.5px] text-slate-450 font-bold block mb-1">{language === 'te' ? 'సహకార రైతు ఐడి (User ID)' : 'Cooperative User ID'}</label>
                    <input 
                      type="text" 
                      readOnly
                      defaultValue={user.id || user.uid || user.phone}
                      className="w-full bg-slate-100 border border-slate-200 rounded-xl p-2.5 text-xs font-mono font-bold text-[#1b6d24] focus:outline-none"
                    />
                  </div>
                </div>

                {/* Cooperative Preferences */}
                <div className="pt-3 border-t border-slate-100">
                  <span className="text-[10px] text-slate-400 font-black uppercase tracking-widest block mb-2">{language === 'te' ? 'ఫీచర్ ప్రిఫరెన్స్ సెట్టింగ్స్' : 'Cooperative Alert Settings'}</span>
                  
                  <div className="space-y-2.5 text-xs font-bold text-slate-700">
                    <label className="flex items-center justify-between p-1">
                      <span>{language === 'te' ? 'వాతావరణ హెచ్చరికల నోటిఫికేషన్లు' : 'Rain & Weather SMS Alerts'}</span>
                      <input type="checkbox" defaultChecked className="accent-[#1b6d24] w-4 h-4" />
                    </label>

                    <label className="flex items-center justify-between p-1">
                      <span>{language === 'te' ? 'ప్రతి బుకింగ్‌నకు ఫోన్ లో ఎస్ఎంఎస్ పంపండి' : 'Immediate Booking Confirmation Callbacks'}</span>
                      <input type="checkbox" defaultChecked className="accent-[#1b6d24] w-4 h-4" />
                    </label>

                    <label className="flex items-center justify-between p-1">
                      <span>{language === 'te' ? 'తెలుగు యాప్ లేఅవుట్ డిఫాల్ట్ చేయి' : 'Telugu Language Primary Layout'}</span>
                      <input type="checkbox" checked={language === 'te'} disabled className="accent-[#1b6d24] w-4 h-4" />
                    </label>
                  </div>
                </div>

                <div className="pt-4 flex gap-3">
                  <button 
                    onClick={() => {
                      triggerToast(language === 'te' ? 'సెట్టింగ్స్ సేవ్ చేయబడ్డాయి!' : 'Cooperative settings preserved successfully!', 'success');
                      setActivePage('dashboard_home');
                    }}
                    className="flex-1 bg-[#1b6d24] hover:bg-[#15541b] text-white py-2.5 text-xs font-extrabold rounded-xl text-center"
                  >
                    {language === 'te' ? 'మార్పులను సేవ్ చేయి' : 'Save Changes'}
                  </button>
                  
                  <button 
                    onClick={() => {
                      onSignOut();
                    }}
                    className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2.5 text-xs font-extrabold rounded-xl text-center cursor-pointer"
                  >
                    {language === 'te' ? 'లాగ్ అవుట్ (Sign Out)' : 'Sign Out Account'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* ---------------- OFFICIAL RENTAL RECEIPT MODAL ---------------- */}
      {selectedRentalReceipt && (
        <div 
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-fade-in"
          onClick={() => setSelectedRentalReceipt(null)}
          id="modal-rental-receipt"
        >
          <div 
            className="bg-white rounded-[2rem] max-w-lg w-full overflow-hidden shadow-2xl border border-slate-200 my-8 transition-all"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Cooperative Official Header */}
            <div className="bg-[#1b6d24] text-white p-6 relative">
              <button
                onClick={() => setSelectedRentalReceipt(null)}
                className="absolute right-4 top-4 w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 text-white flex items-center justify-center text-sm font-bold cursor-pointer transition-colors"
                id="btn-close-receipt-modal"
              >
                ✕
              </button>

              <div className="text-center space-y-1">
                <span className="text-[8.5px] font-black tracking-widest uppercase bg-emerald-800/80 border border-emerald-400/30 px-3 py-1 rounded-full text-emerald-100">
                  {language === 'te' ? 'ఆంధ్రప్రదేశ్ ప్రభుత్వం • సహకార రైతు వేదిక' : 'GOVT OF AP • RAITU VEDIKA COOPERATIVE'}
                </span>
                <h2 className="text-base font-black tracking-wide mt-2">
                  {language === 'te' ? 'అధికారిక అద్దె & చెల్లింపు రశీదు' : 'OFFICIAL LEASE & TAX RECEIPT'}
                </h2>
                <p className="text-[10px] text-emerald-100 font-mono">
                  RECEIPT NO: INV-{selectedRentalReceipt.paymentTxId.slice(-8)}
                </p>
              </div>
            </div>

            {/* Receipt Body */}
            <div className="p-6 space-y-5 text-xs text-slate-700">
              
              {/* Meta & Dates Bar */}
              <div className="flex justify-between items-center bg-slate-50 p-3 rounded-xl border border-slate-100 text-[10.5px]">
                <div>
                  <span className="text-slate-400 font-bold block text-[8.5px] uppercase">
                    {language === 'te' ? 'బుకింగ్ కోడ్' : 'Booking Ref'}
                  </span>
                  <span className="font-mono font-black text-slate-800">{selectedRentalReceipt.bookingCode}</span>
                </div>
                <div className="text-right">
                  <span className="text-slate-400 font-bold block text-[8.5px] uppercase">
                    {language === 'te' ? 'చెల్లింపు తేదీ' : 'Payment Date'}
                  </span>
                  <span className="font-bold text-slate-800">{selectedRentalReceipt.paymentDate}</span>
                </div>
              </div>

              {/* Farmer & Owner Parties Grid */}
              <div className="grid grid-cols-2 gap-4 border-b border-slate-100 pb-4 text-[10.5px]">
                <div className="space-y-0.5">
                  <span className="text-[8.5px] font-black uppercase text-[#1b6d24] tracking-wider block">
                    {language === 'te' ? 'అద్దెదారు (Farmer / Renter)' : 'Lender / Farmer (Renter)'}
                  </span>
                  <p className="font-black text-slate-800">{user.name}</p>
                  <p className="text-slate-500">ID: {user.id || user.uid || user.phone}</p>
                  <p className="text-slate-500">{user.phone}</p>
                  <p className="text-slate-500 truncate">{user.location}</p>
                </div>

                <div className="space-y-0.5 border-l border-slate-100 pl-4">
                  <span className="text-[8.5px] font-black uppercase text-[#1b6d24] tracking-wider block">
                    {language === 'te' ? 'యంత్ర యజమాని (Equipment Owner)' : 'Equipment Owner'}
                  </span>
                  <p className="font-black text-slate-800">{selectedRentalReceipt.ownerName}</p>
                  <p className="text-slate-500">{selectedRentalReceipt.ownerPhone}</p>
                  <p className="text-slate-500 truncate">{selectedRentalReceipt.location}</p>
                </div>
              </div>

              {/* Machinery & Field Work Details */}
              <div className="space-y-2 border-b border-slate-100 pb-4">
                <span className="text-[8.5px] font-black uppercase text-slate-400 tracking-wider block">
                  {language === 'te' ? 'యంత్రం & అద్దె వివరాలు' : 'Machinery & Lease Terms'}
                </span>

                <div className="flex items-center gap-3 bg-slate-50 p-3 rounded-xl border border-slate-100">
                  <img
                    src={selectedRentalReceipt.imageUrl}
                    alt={selectedRentalReceipt.equipmentTitle}
                    className="w-12 h-12 rounded-lg object-cover border border-slate-200"
                    referrerPolicy="no-referrer"
                  />
                  <div className="flex-1 min-w-0">
                    <h4 className="font-black text-slate-800 truncate">
                      {language === 'te' ? selectedRentalReceipt.equipmentTitle : selectedRentalReceipt.equipmentTitleEn}
                    </h4>
                    <p className="text-[10px] text-slate-500">
                      {language === 'te' ? selectedRentalReceipt.categoryLabel : selectedRentalReceipt.category} • {selectedRentalReceipt.driverIncluded ? (language === 'te' ? 'డ్రైవర్‌తో సహా' : 'Driver Included') : (language === 'te' ? 'డ్రైవర్ లేకుండా' : 'No Driver')}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-[10px] bg-emerald-50/40 p-2.5 rounded-xl border border-emerald-100">
                  <div>
                    <span className="text-slate-400 block text-[8.5px] uppercase">{language === 'te' ? 'అద్దె కాలం' : 'Duration'}</span>
                    <span className="font-black text-slate-800">
                      {selectedRentalReceipt.duration} {selectedRentalReceipt.rateType === 'day' ? (language === 'te' ? 'రోజులు' : 'Days') : (language === 'te' ? 'గంటలు' : 'Hours')}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[8.5px] uppercase">{language === 'te' ? 'పని ప్రయోజనం' : 'Work Purpose'}</span>
                    <span className="font-bold text-slate-800 truncate block">
                      {language === 'te' ? selectedRentalReceipt.workDescription : selectedRentalReceipt.workDescriptionEn}
                    </span>
                  </div>
                </div>
              </div>

              {/* Financial Breakdown Table */}
              <div className="space-y-2 border-b border-slate-100 pb-4">
                <span className="text-[8.5px] font-black uppercase text-slate-400 tracking-wider block">
                  {language === 'te' ? 'ఆర్థిక గణన (Financial Calculation)' : 'Financial Billing Breakdown'}
                </span>

                <div className="space-y-1.5 text-[11px]">
                  <div className="flex justify-between">
                    <span className="text-slate-500">
                      {language === 'te' ? 'అద్దె రేటు' : 'Rental Rate'} ({selectedRentalReceipt.duration} x ₹{selectedRentalReceipt.ratePrice})
                    </span>
                    <span className="font-bold text-slate-800">₹{selectedRentalReceipt.totalPaid}</span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-slate-500">{language === 'te' ? 'సహకార సేవా పన్ను' : 'Cooperative Platform GST'}</span>
                    <span className="font-bold text-emerald-700">{language === 'te' ? 'రాయితీ (ఉచితం)' : '0.00 (Subsidy Waived)'}</span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-slate-500">{language === 'te' ? 'చెల్లింపు విధానం' : 'Payment Mode'}</span>
                    <span className="font-bold text-slate-700">{selectedRentalReceipt.paymentMethod}</span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-slate-500">{language === 'te' ? 'బ్యాంక్ లావాదేవీ ID' : 'Bank Reference'}</span>
                    <span className="font-mono text-slate-700">{selectedRentalReceipt.paymentTxId}</span>
                  </div>

                  <div className="flex justify-between text-sm font-black border-t border-slate-150 pt-2 text-[#1b6d24]">
                    <span>{language === 'te' ? 'మొత్తం చెల్లించినది' : 'Net Total Paid'}</span>
                    <span>₹{selectedRentalReceipt.totalPaid.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              {/* Verified Stamp Seal */}
              <div className="flex items-center justify-between bg-emerald-50 border border-emerald-200 rounded-xl p-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-[#1b6d24] text-white flex items-center justify-center font-black text-xs">
                    ✓
                  </div>
                  <div>
                    <span className="text-[10px] font-black uppercase text-[#1b6d24] tracking-wider block">
                      {language === 'te' ? 'సహకార ధృవీకరణ పూర్తయింది' : 'AP RAITU VEDIKA VERIFIED'}
                    </span>
                    <span className="text-[9px] text-emerald-700 block">
                      {language === 'te' ? 'బ్యాంక్ మరియు యజమాని ఖాతా క్లియర్ చేయబడింది' : 'Cleared & Transacted Successfully'}
                    </span>
                  </div>
                </div>
                <span className="text-[9px] font-mono text-slate-400">
                  SEC-AP-{selectedRentalReceipt.id}
                </span>
              </div>

              {/* Action Buttons inside receipt */}
              <div className="flex gap-2 pt-2">
                <button
                  onClick={() => window.print()}
                  className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-800 py-2.5 rounded-xl font-bold flex items-center justify-center gap-1.5 cursor-pointer text-xs transition-colors"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>{language === 'te' ? 'ప్రింట్ రసీదు' : 'Print Invoice'}</span>
                </button>

                <button
                  onClick={() => {
                    setSelectedRentalReceipt(null);
                    navigateToCheckout(selectedRentalReceipt.equipmentId);
                  }}
                  className="flex-1 bg-[#1b6d24] hover:bg-[#15541b] text-white py-2.5 rounded-xl font-bold flex items-center justify-center gap-1.5 cursor-pointer text-xs transition-colors shadow-3xs"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>{language === 'te' ? 'మళ్లీ అద్దెకు తీసుకోండి' : 'Rent Again'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
