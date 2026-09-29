import React, { useState, useEffect } from 'react';
import { getInitialLocalStorageData, saveEquipmentToLocalStorage, saveUserToLocalStorage, saveChatsToLocalStorage, DEFAULT_SILHOUETTE_AVATAR } from './data';
import { Equipment, Chat, FarmerProfile, CategoryType } from './types';
import { AP_LOCATION_DATABASE, AP_DISTRICTS_ENTRIES, getVillagesForDistrictAndMandal } from './locationData';
import { auth, db } from './lib/firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { doc, getDoc, setDoc, collection, getDocs } from 'firebase/firestore';
import Header from './components/Header';
import BottomNav from './components/BottomNav';
import HomeView from './components/HomeView';
import BrowseView from './components/BrowseView';
import MessagesView from './components/MessagesView';
import ProfileView from './components/ProfileView';
import AddListingModal from './components/AddListingModal';
import EquipmentDetailsModal from './components/EquipmentDetailsModal';
import PublicPages from './components/PublicPages';
import AuthPages from './components/AuthPages';
import FarmerDashboard from './components/FarmerDashboard';
import OwnerDashboard from './components/OwnerDashboard';
import AdminDashboard from './components/AdminDashboard';
import AdditionalFeatures from './components/AdditionalFeatures';
import { CheckCircle, AlertCircle, Calendar, MessageSquare, Plus, Minus, HelpCircle, X, Leaf, Shield, Globe, Users } from 'lucide-react';
import { processBookingChat, ensureBookedEquipmentChatsExist } from './bookingChatService';

export default function App() {
  // Cooperative System Workspace Selector Mode
  const [workspaceMode, setWorkspaceMode] = useState<'farmer' | 'owner' | 'admin' | 'public' | 'auth' | 'extras' | 'admin-login'>('public');

  // Navigation tabs
  const [activeTab, setActiveTab] = useState<'home' | 'search' | 'messages' | 'profile'>('home');
  const [activePublicPage, setActivePublicPage] = useState<'about' | 'contact' | 'faq' | 'listing' | 'details' | 'search' | 'privacy' | 'terms' | 'help_support' | null>(null);

  // Load persistent states
  const [equipmentList, setEquipmentList] = useState<Equipment[]>([]);
  const [userProfile, setUserProfile] = useState<FarmerProfile | null>(null);
  const [chatsList, setChatsList] = useState<Chat[]>([]);

  // Default mock user in case reviewer is simulating dashboard modes directly
  const DEFAULT_FARMER_USER: FarmerProfile = {
    name: 'రామకృష్ణ (Simulated Farmer)',
    phone: '9866012345',
    district: 'Anantapuramu',
    mandal: 'Anantapur Urban (అనంతపురం అర్బన్)',
    village: 'Bukkarayasamudram (బుక్కరాయసముద్రం)',
    location: 'బుక్కరాయసముద్రం, అనంతపురం అర్బన్ (అనంతపురము)',
    avatar: DEFAULT_SILHOUETTE_AVATAR,
    listedEquipmentIds: [],
    bookedEquipmentIds: []
  };

  // Multilingual toggle state default to 'te' (Telugu)
  const [language, setLanguage] = useState<'te' | 'en'>(() => {
    return (localStorage.getItem('rv_lang') as 'te' | 'en') || 'te';
  });

  // Modal specs overlay trigger state
  const [selectedDetailsEquipment, setSelectedDetailsEquipment] = useState<Equipment | null>(null);

  // Search and Category bridging states (Home -> Search)
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<CategoryType | ''>('');

  // Modals and Alerts
  const [isAddListingOpen, setIsAddListingOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<{ type: 'success' | 'info' | 'error'; text: string } | null>(null);
  
  // Interactive checkout states
  const [preBookingEquipment, setPreBookingEquipment] = useState<Equipment | null>(null);
  const [preBookingDuration, setPreBookingDuration] = useState<number>(4);
  const [preBookingMessage, setPreBookingMessage] = useState<string>('');
  const [preBookingPlace, setPreBookingPlace] = useState<string>('బుక్కరాయసముద్రం (Bukkarayasamudram)');

  // Improved Delivery Logistics states
  const [deliveryDistrict, setDeliveryDistrict] = useState<string>('Anantapuramu');
  const [deliveryMandal, setDeliveryMandal] = useState<string>('');
  const [deliveryVillage, setDeliveryVillage] = useState<string>('');
  const [deliveryCustomVillage, setDeliveryCustomVillage] = useState<string>('');
  const [deliveryLandmark, setDeliveryLandmark] = useState<string>('');
  const [pinGpsCoordinates, setPinGpsCoordinates] = useState<boolean>(false);
  const [saveAsDefaultLocation, setSaveAsDefaultLocation] = useState<boolean>(false);

  // Logout custom confirmation states
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const [bookingSuccessModal, setBookingSuccessModal] = useState<{
    show: boolean;
    equipment: Equipment;
  } | null>(null);

  // Helper to adjust equipment locations dynamically based on user district, mandal, & village given at login
  const adjustEquipmentLocationsForUser = (profile: FarmerProfile | null, currentEquipments: Equipment[]) => {
    if (!profile) return currentEquipments;
    
    const userDistrictRaw = profile.district || profile.location || 'Anantapuramu';
    const userMandalRaw = profile.mandal || 'Anantapur Urban';
    const userVillageRaw = profile.village || profile.location || '';
    
    let districtKey = 'Anantapuramu';
    const match = (userDistrictRaw || "").match(/\(([^)]+)\)/);
    if (match && match[1]) {
      districtKey = match[1].trim();
    } else if (AP_LOCATION_DATABASE.districts[userDistrictRaw]) {
      districtKey = userDistrictRaw;
    } else {
      for (const dk of Object.keys(AP_LOCATION_DATABASE.districts)) {
        if (userDistrictRaw.toLowerCase().includes(dk.toLowerCase()) || 
            (AP_LOCATION_DATABASE.districts[dk].english && 
             userDistrictRaw.toLowerCase().includes(AP_LOCATION_DATABASE.districts[dk].english.toLowerCase()))) {
          districtKey = dk;
          break;
        }
      }
    }
    
    const distData = AP_LOCATION_DATABASE.districts[districtKey] || AP_LOCATION_DATABASE.districts['Anantapuramu'];
    if (!distData) return currentEquipments;
    
    // Fetch authentic villages for the user's mandal
    const mandalVillages = getVillagesForDistrictAndMandal(districtKey, userMandalRaw);
    const mandalPlaces = (distData.places || []).filter(p => p.toLowerCase().includes(userMandalRaw.toLowerCase()));
    
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

    const cleanMandalTe = userMandalRaw.replace(/\s*\([^)]*\)/, '').trim();
    const cleanMandalEn = ((userMandalRaw || "").match(/\(([^)]+)\)/) || [])[1] || cleanMandalTe;

    // Login village is top priority: equipment will be placed in the user's exact login location
    const candidatePlaces: string[] = [];
    if (userVillageRaw) {
      candidatePlaces.push(userVillageRaw);
    }
    if (mandalVillages.length > 0) {
      candidatePlaces.push(...mandalVillages);
    }
    if (mandalPlaces.length > 0) {
      candidatePlaces.push(...mandalPlaces);
    }
    if (candidatePlaces.length === 0) {
      candidatePlaces.push(...(distData.places || []), ...(distData.villages || []));
    }

    const adjusted = currentEquipments.map((eq, index) => {
      if (eq.isCustom) return eq;

      // Assign strictly within login location: user's village for top equipment, and local mandal villages
      const locStr = candidatePlaces[index % candidatePlaces.length];
      const parsed = parseLocationPair(locStr);

      const locTe = `${parsed.te}, ${cleanMandalTe} (మండలం)`;
      const locEn = `${parsed.en}, ${cleanMandalEn} Mandal, ${distData.english || districtKey}`;

      return {
        ...eq,
        location: locTe,
        locationEn: locEn,
        district: districtKey,
        city: cleanMandalEn,
        mandal: cleanMandalEn,
        village: parsed.te
      };
    });

    try {
      localStorage.setItem('rv_equipment', JSON.stringify(adjusted));
    } catch (_) {}

    return adjusted;
  };

  // Initial load
  useEffect(() => {
    const data = getInitialLocalStorageData();
    setUserProfile(data.user);
    if (data.user && data.user.role) {
      setWorkspaceMode(data.user.role);
    }
    
    // Set initial client state
    const adjusted = adjustEquipmentLocationsForUser(data.user, data.equipment);
    setEquipmentList(adjusted);
    setChatsList(data.chats);

    // Observe Firebase Authentication persistent session
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          const userDocSnap = await getDoc(doc(db, 'users', firebaseUser.uid));
          if (userDocSnap.exists()) {
            const profile = userDocSnap.data() as FarmerProfile;
            const savedStr = localStorage.getItem('rv_user');
            let savedId = '';
            if (savedStr) {
              try {
                const parsed = JSON.parse(savedStr);
                savedId = parsed.id || parsed.uid;
              } catch (_) {}
            }
            const persistentId = profile.id || savedId || profile.uid || firebaseUser.uid;
            profile.id = persistentId;
            profile.uid = persistentId;
            setUserProfile(profile);
            saveUserToLocalStorage(profile);
            if (profile.role) {
              setWorkspaceMode(profile.role);
            }
          }
        } catch (e) {
          console.warn("Firestore user sync exception:", e);
        }
      }
    });

    // Dynamic Full-Stack background sync with Node.js Express Server
    fetch('/api/equipments')
      .then(res => res.json())
      .then(serverEquips => {
        if (Array.isArray(serverEquips) && serverEquips.length > 0) {
          // Merge server-saved equipments with local equipments without duplicating ids
          const localIdSet = new Set(data.equipment.map((eq: any) => eq.id));
          const newItems = serverEquips.filter((sEq: any) => sEq && sEq.id && !localIdSet.has(sEq.id));
          
          if (newItems.length > 0) {
            const merged = [...data.equipment, ...newItems];
            const updatedAdjusted = adjustEquipmentLocationsForUser(data.user, merged);
            setEquipmentList(updatedAdjusted);
            saveEquipmentToLocalStorage(merged);
          }
        }
      })
      .catch(err => console.warn("Backend equipments fetch delayed/offline:", err));

    fetch('/api/chats')
      .then(res => res.json())
      .then(serverChats => {
        if (Array.isArray(serverChats) && serverChats.length > 0) {
          // Merge server chats with local ones
          const localIds = new Set(data.chats.map((c: any) => c.id));
          const toAdd = serverChats.filter((sc: any) => !localIds.has(sc.id));
          
          if (toAdd.length > 0) {
            const mergedChats = [...data.chats, ...toAdd];
            setChatsList(mergedChats);
            saveChatsToLocalStorage(mergedChats);
          }
        }
      })
      .catch(err => console.warn("Backend chats fetch delayed/offline:", err));

    return () => unsubscribe();
  }, []);

  // Sync delivery location defaults and equipment location tags whenever userProfile changes
  useEffect(() => {
    if (userProfile) {
      if (userProfile.district) {
        let cleanDist = userProfile.district;
        const m = (cleanDist || "").match(/\(([^)]+)\)/);
        if (m) cleanDist = m[1].trim();
        setDeliveryDistrict(cleanDist);
      }
      if (userProfile.mandal) {
        setDeliveryMandal(userProfile.mandal);
      }
      if (userProfile.village) {
        setDeliveryVillage(userProfile.village);
      }

      setEquipmentList((prevList) => adjustEquipmentLocationsForUser(userProfile, prevList));
    }
  }, [userProfile?.district, userProfile?.mandal, userProfile?.village, userProfile?.phone]);

  // Auto-compose detailed delivery location preBookingPlace for communication
  useEffect(() => {
    const finalVillage = deliveryVillage === 'custom' || deliveryVillage === 'ఇతర గ్రామం' || deliveryVillage === 'Other' || deliveryVillage === 'Other Village'
      ? (deliveryCustomVillage || '')
      : deliveryVillage;
    
    let parts = [];
    if (deliveryDistrict) parts.push(`${deliveryDistrict} Dist`);
    if (deliveryMandal) parts.push(`Mandal: ${deliveryMandal}`);
    if (finalVillage) parts.push(`Village: ${finalVillage}`);
    if (deliveryLandmark) parts.push(`Landmark: ${deliveryLandmark}`);
    if (pinGpsCoordinates) {
      // Look up coordinate presets:
      const presetCoords: { [key: string]: string } = {
        'Alluri Sitharama Raju': '14.1500° N, 79.1200° E',
        'Anakapalli': '17.6895° N, 83.0024° E',
        'Anantapuramu': '14.6819° N, 77.6006° E',
        'Annamayya': '13.9780° N, 78.9647° E',
        'Bapatla': '15.9050° N, 80.4683° E',
        'Chittoor': '13.2172° N, 79.1003° E',
        'Dr. B.R. Ambedkar Konaseema': '16.5786° N, 82.0223° E',
        'East Godavari': '16.9891° N, 81.7848° E',
        'Eluru': '16.7101° N, 81.1035° E',
        'Guntur': '16.3067° N, 80.4365° E',
        'Kakinada': '16.9890° N, 82.2475° E',
        'Krishna': '16.1852° N, 81.1341° E',
        'Kurnool': '15.8281° N, 78.0373° E',
        'Nandyal': '15.4847° N, 78.4811° E',
        'NTR': '16.5062° N, 80.6480° E',
        'Palnadu': '16.3524° N, 80.1512° E',
        'Parvathipuram Manyam': '18.7797° N, 83.4241° E',
        'Prakasam': '15.5057° N, 80.0499° E',
        'Srikakulam': '18.2949° N, 83.8938° E',
        'Sri Potti Sriramulu Nellore': '14.4426° N, 79.9865° E',
        'Sri Sathya Sai': '14.1672° N, 77.8105° E',
        'Tirupati': '13.6280° N, 79.4192° E',
        'Visakhapatnam': '17.6868° N, 83.2185° E',
        'Vizianagaram': '18.1124° N, 83.3985° E',
        'West Godavari': '16.7104° N, 81.5424° E',
        'YSR Kadapa': '14.4673° N, 78.8242° E'
      };
      const gps = presetCoords[deliveryDistrict] || '16.3067° N, 80.4365° E';
      parts.push(`GPS: [${gps}] ✔ Pinned`);
    }

    setPreBookingPlace(parts.length > 0 ? parts.join(' | ') : 'బుక్కరాయసముద్రం (Bukkarayasamudram)');
  }, [deliveryDistrict, deliveryMandal, deliveryVillage, deliveryCustomVillage, deliveryLandmark, pinGpsCoordinates]);

  // Auto-save edited preBookingMessage draft to localStorage
  useEffect(() => {
    if (preBookingEquipment && preBookingMessage !== undefined) {
      localStorage.setItem(`rv_draft_message_${preBookingEquipment.id}`, preBookingMessage);
    }
  }, [preBookingMessage, preBookingEquipment]);

  // Sync to localStorage and backend Express database
  const updateEquipment = (newList: Equipment[]) => {
    setEquipmentList(newList);
    saveEquipmentToLocalStorage(newList);

    // Sync to backend equipments database
    fetch('/api/equipments/sync', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ equipments: newList })
    })
    .catch(err => console.warn("Background equipment sync delayed:", err));
  };

  const updateUserProfile = async (newProfile: FarmerProfile) => {
    setUserProfile(newProfile);
    saveUserToLocalStorage(newProfile);
    setEquipmentList(prev => adjustEquipmentLocationsForUser(newProfile, prev));

    const uidToUse = newProfile.uid || auth.currentUser?.uid;
    if (uidToUse) {
      try {
        await setDoc(doc(db, 'users', uidToUse), newProfile, { merge: true });
      } catch (err) {
        console.warn("Firestore profile update sync error:", err);
      }
    }
  };

  const handleSignOut = () => {
    setShowLogoutConfirm(true);
  };

  const executeActualSignOut = async () => {
    setIsLoggingOut(true);
    try {
      await signOut(auth);
    } catch (e) {
      console.warn("Firebase SignOut error:", e);
    }
    setTimeout(() => {
      setUserProfile(null);
      localStorage.removeItem('rv_user');
      localStorage.removeItem('rv_rental_history');
      localStorage.removeItem('rv_payments');
      localStorage.removeItem('rv_favorites');
      localStorage.removeItem('rv_notifications');
      setWorkspaceMode('public');
      setShowLogoutConfirm(false);
      setIsLoggingOut(false);
      const defaultData = getInitialLocalStorageData();
      setEquipmentList(defaultData.equipment);
      const msg = language === 'te' 
        ? 'కూటమి నెట్‌వర్క్ నుండి విజయవంతంగా లాగ్‌అవుట్ అయ్యారు!' 
        : 'Successfully logged out from the agrarian cooperative network!';
      triggerToast(msg, 'info');
    }, 1200);
  };

  const updateChatsList = (newChats: Chat[]) => {
    setChatsList(newChats);
    saveChatsToLocalStorage(newChats);

    // Sync chats list with backend database
    fetch('/api/chats/sync', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chats: newChats })
    })
    .catch(err => console.warn("Background chat sync delayed/offline:", err));
  };

  // Helper trigger Toast
  const triggerToast = (text: string, type: 'success' | 'info' | 'error' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  // Language Change Toggle Callback
  const handleLanguageToggle = () => {
    const nextLang = language === 'te' ? 'en' : 'te';
    setLanguage(nextLang);
    localStorage.setItem('rv_lang', nextLang);
    
    const notification = nextLang === 'te' 
      ? 'యాప్ భాష విజయవంతంగా తెలుగుకు మార్చబడింది!' 
      : 'E-Raitu Vedika language changed to English!';
    triggerToast(notification, 'info');
  };

  // 1. Core booking action - triggers pre-checkout duration and chat selector
  const handleBookEquipment = (equipmentId: string): boolean => {
    if (!userProfile) {
      triggerToast(language === 'te' ? 'దయచేసి ముందే లాగిన్ అవ్వండి!' : 'Please sign in first!', 'error');
      setWorkspaceMode('auth');
      return false;
    }

    const matched = equipmentList.find((e) => e.id === equipmentId);
    if (!matched) return false;

    setPreBookingEquipment(matched);
    setPreBookingDuration(matched.rateType === 'day' ? 3 : 5);
    
    // Check if there is already a saved draft in localStorage for this equipmentId
    const savedDraft = localStorage.getItem(`rv_draft_message_${matched.id}`);
    if (savedDraft) {
      setPreBookingMessage(savedDraft);
    } else {
      setPreBookingMessage(language === 'te' 
        ? `నమస్తే సార్, మీ ${matched.title} యంత్రాన్ని ఈ రైతు వేదిక ద్వారా నేను అద్దెకు బుక్ చేసుకున్నాను. రవాణా గురించి కాస్త మాట్లాడగలరు.` 
        : `Hello, I requested your ${matched.titleEn || matched.title} on E-Raitu Vedika. Let's chat regarding driver dispatch.`);
    }

    // Initialize delivery logistics states from developer or user profiles
    let userDist = 'Anantapuramu';
    if (userProfile.district && AP_LOCATION_DATABASE.districts[userProfile.district]) {
      userDist = userProfile.district;
    } else if (userProfile.location && AP_LOCATION_DATABASE.districts[userProfile.location]) {
      userDist = userProfile.location;
    } else {
      const pLoc = userProfile.location || '';
      for (const dk of Object.keys(AP_LOCATION_DATABASE.districts)) {
        if (pLoc.toLowerCase().includes(dk.toLowerCase())) {
          userDist = dk;
          break;
        }
      }
    }

    setDeliveryDistrict(userDist);

    const distData = AP_LOCATION_DATABASE.districts[userDist];
    const defaultMandal = (distData?.places && distData.places[0]) ? distData.places[0] : '';
    setDeliveryMandal(userProfile.mandal || defaultMandal);

    const defaultVillage = (distData?.villages && distData.villages[0]) ? distData.villages[0] : '';
    setDeliveryVillage(userProfile.village || defaultVillage);
    setDeliveryCustomVillage('');
    setDeliveryLandmark('');
    setPinGpsCoordinates(false);
    setSaveAsDefaultLocation(false);

    return true;
  };

  // Final confirmation logic committing duration and initiating owner chat
  const handleConfirmBookingFinal = (equipmentId: string, finalDuration: number, customMessageText: string) => {
    if (!userProfile) return;

    const matched = equipmentList.find((e) => e.id === equipmentId);
    if (!matched) return;

    // Save rental duration in local db
    try {
      const saved = localStorage.getItem('rv_booking_durations');
      const parsed = saved ? JSON.parse(saved) : {};
      parsed[matched.id] = finalDuration;
      localStorage.setItem('rv_booking_durations', JSON.stringify(parsed));
    } catch (e) {}

    // Save rental delivery location in local db
    try {
      const savedLocs = localStorage.getItem('rv_booking_locations');
      const parsedLocs = savedLocs ? JSON.parse(savedLocs) : {};
      parsedLocs[matched.id] = preBookingPlace;
      localStorage.setItem('rv_booking_locations', JSON.stringify(parsedLocs));
    } catch (e) {}

    // Add to owner booking requests so they are visible on OwnerDashboard
    try {
      const savedOwnerBookings = localStorage.getItem('rv_owner_bookings');
      let ownerBookings = savedOwnerBookings ? JSON.parse(savedOwnerBookings) : [];
      const newBookingId = `b_cust_${Date.now()}`;
      const newOwnerBooking = {
        id: newBookingId,
        equipmentId: matched.id,
        equipmentTitle: matched.title,
        equipmentTitleEn: matched.titleEn || matched.title,
        farmerName: userProfile ? userProfile.name : 'సిమ్యులేటెడ్ రైతు (Simulated Farmer)',
        farmerPhone: userProfile ? userProfile.phone : '9866012345',
        farmerAvatar: userProfile ? userProfile.avatar : 'https://images.unsplash.com/photo-1595152772835-219674b2a8a6?auto=format&fit=crop&w=150&q=80',
        startDate: new Date().toISOString().split('T')[0],
        endDate: new Date(Date.now() + finalDuration * 86400000).toISOString().split('T')[0],
        totalCost: parseInt(matched.price as any) * finalDuration,
        status: 'pending' as const,
        paymentStatus: 'pending' as const,
        fuelHandover: 'Self-filled',
        deliveryLocation: preBookingPlace
      };
      ownerBookings = [newOwnerBooking, ...ownerBookings];
      localStorage.setItem('rv_owner_bookings', JSON.stringify(ownerBookings));
    } catch (e) {}

    const updated = equipmentList.map((eq) => {
      if (eq.id === equipmentId) {
        return {
          ...eq,
          status: 'booked' as const,
          statusLabel: language === 'te' ? 'బుకింగ్ చేయబడింది' : 'Booked'
        };
      }
      return eq;
    });

    // Add to user bookings list and optionally save delivery location to profile
    const finalVillage = deliveryVillage === 'custom' || deliveryVillage === 'ఇతర గ్రామం' || deliveryVillage === 'Other' || deliveryVillage === 'Other Village'
      ? (deliveryCustomVillage || '')
      : deliveryVillage;

    const newUserProfile = {
      ...userProfile,
      bookedEquipmentIds: Array.from(new Set([...userProfile.bookedEquipmentIds, equipmentId])),
      ...(saveAsDefaultLocation ? {
        district: deliveryDistrict,
        mandal: deliveryMandal,
        village: finalVillage,
        location: `${deliveryDistrict} - ${finalVillage || deliveryMandal}`
      } : {})
    };

    updateEquipment(updated);
    updateUserProfile(newUserProfile);

    // Chat setup with official booking details (owner phone & details, farmer phone & details) and owner confirmation response
    const { updatedChats } = processBookingChat(chatsList, {
      equipment: matched,
      farmer: newUserProfile,
      duration: finalDuration,
      rateType: matched.rateType || 'day',
      deliveryLocation: preBookingPlace,
      totalCost: parseInt(matched.price as any) * finalDuration,
      language,
      customNote: customMessageText.trim()
    });

    updateChatsList(updatedChats);

    setPreBookingEquipment(null);
    localStorage.removeItem(`rv_draft_message_${equipmentId}`);

    // Open Success Modal
    setBookingSuccessModal({
      show: true,
      equipment: matched
    });

    const successMsg = language === 'te' 
      ? `"${matched.title}" విజయవంతంగా బుక్ చేయబడింది!` 
      : `Successfully booked "${matched.titleEn || matched.title}"!`;
    triggerToast(successMsg, 'success');
  };

  // Close booking dialog and redirect optionally to Chat
  const handleCloseBookingModalAndChat = (chatToOpen: boolean) => {
    if (!bookingSuccessModal) return;
    setBookingSuccessModal(null);

    if (chatToOpen) {
      setActiveTab('messages');
    } else {
      setActiveTab('profile'); // Show Bookings sub-tab
    }
  };

  // 2. Client custom agricultural machinery listing creation
  const handleAddNewListing = async (newEq: Omit<Equipment, 'id' | 'status' | 'statusLabel' | 'ownerName' | 'ownerPhone' | 'ownerAvatar' | 'isCustom'>) => {
    if (!userProfile) return;

    const freshId = `eq_custom_${Date.now()}`;
    const ownerUid = userProfile.uid || auth.currentUser?.uid || 'anonymous_owner';
    const freshListing: Equipment = {
      ...newEq,
      id: freshId,
      status: 'available',
      statusLabel: language === 'te' ? 'అందుబాటులో ఉంది' : 'Available',
      ownerName: userProfile.name,
      ownerPhone: userProfile.phone,
      ownerAvatar: userProfile.avatar,
      isCustom: true,
      verified: true // Farmer self-listed
    };

    const updatedList = [freshListing, ...equipmentList];
    const updatedUserProfile = {
      ...userProfile,
      listedEquipmentIds: [...userProfile.listedEquipmentIds, freshId]
    };

    updateEquipment(updatedList);
    updateUserProfile(updatedUserProfile);

    // Write equipment document to Firestore
    try {
      await setDoc(doc(db, 'equipments', freshId), {
        id: freshId,
        ownerId: ownerUid,
        ownerName: userProfile.name,
        ownerPhone: userProfile.phone,
        ownerAvatar: userProfile.avatar,
        title: freshListing.title,
        titleEn: freshListing.titleEn || freshListing.title,
        category: freshListing.category,
        categoryLabel: freshListing.categoryLabel,
        location: freshListing.location,
        locationEn: freshListing.locationEn || freshListing.location,
        price: freshListing.price,
        rateType: freshListing.rateType,
        rateTypeLabel: freshListing.rateTypeLabel,
        imageUrl: freshListing.imageUrl,
        description: freshListing.description,
        status: 'available',
        district: userProfile.district || 'Anantapuramu',
        mandal: userProfile.mandal || '',
        village: userProfile.village || '',
        createdAt: new Date().toISOString()
      });
    } catch (err) {
      console.warn("Firestore equipment creation error:", err);
    }

    const listingSuccessMsg = language === 'te' 
      ? 'మ్యాచింగ్ యంత్రం విజయవంతంగా చేర్చబడింది!' 
      : 'Your agritech machinery listing was created successfully!';
    triggerToast(listingSuccessMsg, 'success');
  };

  // 3. Complete user cancel booking action
  const handleCancelBooking = (equipmentId: string) => {
    if (!userProfile) return;

    const updated = equipmentList.map((eq) => {
      if (eq.id === equipmentId) {
        return {
          ...eq,
          status: 'available' as const,
          statusLabel: language === 'te' ? 'అందుబాటులో ఉంది' : 'Available'
        };
      }
      return eq;
    });

    const newUserProfile = {
      ...userProfile,
      bookedEquipmentIds: userProfile.bookedEquipmentIds.filter(id => id !== equipmentId)
    };

    updateEquipment(updated);
    updateUserProfile(newUserProfile);

    const cancelMsg = language === 'te' 
      ? 'బుకింగ్ విజయవంతంగా రద్దు చేయబడింది.' 
      : 'Your rental booking has been cancelled.';
    triggerToast(cancelMsg, 'info');
  };

  // 4. Farmer deletes listing
  const handleRemoveListing = (equipmentId: string) => {
    if (!userProfile) return;

    const updatedList = equipmentList.filter(eq => eq.id !== equipmentId);
    const updatedUserProfile = {
      ...userProfile,
      listedEquipmentIds: userProfile.listedEquipmentIds.filter(id => id !== equipmentId)
    };

    updateEquipment(updatedList);
    updateUserProfile(updatedUserProfile);

    const delMsg = language === 'te' 
      ? 'లిస్టింగ్ విజయవంతంగా తొలగించబడింది.' 
      : 'Machinery listing successfully removed.';
    triggerToast(delMsg, 'info');
  };

  // 5. Flip owner listing availability
  const handleToggleListingStatus = (equipmentId: string) => {
    const updatedList = equipmentList.map(eq => {
      if (eq.id === equipmentId) {
        const nextStatus = eq.status === 'available' ? 'booked' : 'available';
        const labelTe = nextStatus === 'available' ? 'అందుబాటులో ఉంది' : 'బుకింగ్ చేయబడింది';
        const labelEn = nextStatus === 'available' ? 'Available' : 'Booked';
        return {
          ...eq,
          status: nextStatus as 'available' | 'booked',
          statusLabel: language === 'te' ? labelTe : labelEn
        };
      }
      return eq;
    });
    updateEquipment(updatedList);
    
    const statusMsg = language === 'te' 
      ? 'లభ్యత స్టేటస్ మార్చబడింది.' 
      : 'Equipment availability status updated.';
    triggerToast(statusMsg, 'success');
  };

  // Interactive menu bridge from category click in Home to Search tab
  const handleSearchRedirect = (query: string, category?: CategoryType) => {
    setSearchQuery(query);
    if (category) {
      setSelectedCategory(category);
    } else {
      setSelectedCategory('');
    }
    setActiveTab('search');
  };

  // Helper trigger communication from Profile to specific message owner
  const handleOpenChatWithContact = (
    ownerName: string,
    equipmentTitle: string,
    equipmentId: string,
    equipmentImage: string,
    ownerPhone: string,
    ownerAvatar: string,
    initialMessageText?: string
  ) => {
    setChatsList((prevChats) => {
      const match = prevChats.find(c => c.contactPhone === ownerPhone);
      if (!match) {
        const newChat: Chat = {
          id: `chat_tr_${Math.random().toString(36).substring(2, 9)}_${Date.now()}`,
          equipmentId,
          equipmentTitle,
          equipmentImage,
          contactName: ownerName,
          contactAvatar: ownerAvatar,
          contactPhone: ownerPhone,
          lastMessage: initialMessageText || (language === 'te' ? 'మరింత వివరాల కోసం చాట్ ప్రారంభించబడింది.' : 'Chat initialized to discuss agri sharing details.'),
          lastMessageTime: '03:33 PM',
          unread: false,
          messages: [
            {
              id: `m_init_${Math.random().toString(36).substring(2, 9)}_${Date.now()}`,
              sender: 'owner',
              text: language === 'te' 
                ? `నమస్కారం సార్! పొలం దున్నడం గురించి లేదా రవాణా గురించి మాట్లాడటానికైతే మెసేజ్ చేయండి.` 
                : `Hello farmer! Please let me know how many days you need the machinery and where your fields are located.`,
              time: '03:33 PM'
            },
            ...(initialMessageText ? [{
              id: `m_user_init_${Math.random().toString(36).substring(2, 9)}_${Date.now()}`,
              sender: 'user' as const,
              text: initialMessageText,
              time: 'Just Now'
            }] : [])
          ]
        };
        const updated = [newChat, ...prevChats];
        saveChatsToLocalStorage(updated);
        return updated;
      } else if (initialMessageText) {
        // Chat already exists, append the custom message!
        const updated = prevChats.map((c) => {
          if (c.contactPhone === ownerPhone) {
            return {
              ...c,
              lastMessage: initialMessageText,
              lastMessageTime: 'Just Now',
              messages: [
                ...c.messages,
                {
                  id: `m_user_init_${Math.random().toString(36).substring(2, 9)}_${Date.now()}`,
                  sender: 'user' as const,
                  text: initialMessageText,
                  time: 'Just Now'
                }
              ]
            };
          }
          return c;
        });
        saveChatsToLocalStorage(updated);
        return updated;
      }
      return prevChats;
    });
    setWorkspaceMode('farmer');
    setActiveTab('messages');
  };

  // Message Sending and simulations
  const handleSendMessage = (chatId: string, text: string) => {
    const isOwnerRole = userProfile?.role === 'owner';
    const freshMsg = {
      id: `m_u_${Math.random().toString(36).substring(2, 9)}_${Date.now()}`,
      sender: (isOwnerRole ? 'owner' : 'user') as 'user' | 'owner',
      text,
      time: 'Just Now'
    };

    setChatsList((prevChats) => {
      const updated = prevChats.map((c) => {
        if (c.id === chatId) {
          return {
            ...c,
            messages: [...c.messages, freshMsg],
            lastMessage: text,
            lastMessageTime: 'Just Now'
          };
        }
        return c;
      });

      // Move active chat to the top of list
      const activeChatIdx = updated.findIndex(c => c.id === chatId);
      if (activeChatIdx > -1) {
        const activeObj = updated[activeChatIdx];
        updated.splice(activeChatIdx, 1);
        updated.unshift(activeObj);
      }

      saveChatsToLocalStorage(updated);
      return updated;
    });
  };

  const handleReceiveReply = (chatId: string, text: string) => {
    const isOwnerRole = userProfile?.role === 'owner';
    const freshReply = {
      id: `m_o_${Math.random().toString(36).substring(2, 9)}_${Date.now()}`,
      sender: (isOwnerRole ? 'user' : 'owner') as 'user' | 'owner',
      text,
      time: 'Just Now'
    };

    setChatsList((prevChats) => {
      const updated = prevChats.map((c) => {
        if (c.id === chatId) {
          return {
            ...c,
            messages: [...c.messages, freshReply],
            lastMessage: text,
            lastMessageTime: 'Just Now',
            unread: true
          };
        }
        return c;
      });

      saveChatsToLocalStorage(updated);
      return updated;
    });
  };

  const handleMarkAsRead = (chatId: string) => {
    setChatsList((prevChats) => {
      const updated = prevChats.map((c) => {
        if (c.id === chatId) {
          return { ...c, unread: false };
        }
        return c;
      });
      saveChatsToLocalStorage(updated);
      return updated;
    });
  };

  const handleDeleteChat = (chatId: string) => {
    setChatsList((prevChats) => {
      const updated = prevChats.filter(c => c.id !== chatId);
      saveChatsToLocalStorage(updated);
      return updated;
    });
    triggerToast(language === 'te' ? 'చాట్ తొలగించబడింది.' : 'Conversation deleted successfully.', 'info');
  };

  const handleDeleteMessage = (chatId: string, messageId: string, type: 'for-me' | 'for-everyone') => {
    setChatsList((prevChats) => {
      const updated = prevChats.map((c) => {
        if (c.id === chatId) {
          let updatedMsgs;
          if (type === 'for-everyone') {
            updatedMsgs = c.messages.map((m) => {
              if (m.id === messageId) {
                return {
                  ...m,
                  text: language === 'te' ? '🚫 ఈ సందేశం తొలగించబడింది' : '🚫 This message was deleted',
                  isDeleted: true
                };
              }
              return m;
            });
          } else {
            // Delete for me (remove from array)
            updatedMsgs = c.messages.filter(m => m.id !== messageId);
          }

          // Update lastMessage text if needed
          const lastMsgText = updatedMsgs.length > 0 ? updatedMsgs[updatedMsgs.length - 1].text : '';

          return {
            ...c,
            messages: updatedMsgs,
            lastMessage: lastMsgText
          };
        }
        return c;
      });
      saveChatsToLocalStorage(updated);
      return updated;
    });
    triggerToast(
      language === 'te' 
        ? 'సందేశం తొలగించబడింది.' 
        : 'Message deleted successfully.', 
      'info'
    );
  };

  // Auto-sync booking chats with owner details and confirmation response for any booked equipment
  useEffect(() => {
    if (!userProfile || !userProfile.bookedEquipmentIds || userProfile.bookedEquipmentIds.length === 0) return;
    setChatsList((prevChats) => {
      const ensured = ensureBookedEquipmentChatsExist(
        userProfile.bookedEquipmentIds,
        equipmentList,
        prevChats,
        userProfile,
        language
      );
      if (ensured.length !== prevChats.length) {
        saveChatsToLocalStorage(ensured);
        fetch('/api/chats/sync', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ chats: ensured })
        }).catch(() => {});
        return ensured;
      }
      return prevChats;
    });
  }, [userProfile?.bookedEquipmentIds, equipmentList, language]);

  // Filter and format chats list based on active user login role and credentials
  const filteredChats = (() => {
    if (!userProfile) return [];
    const currentPhone = userProfile.phone;
    const currentRole = userProfile.role || 'farmer';
    
    if (currentRole === 'owner') {
      // Owner should see chats where ownerPhone is their phone, or matching contactPhone
      const filtered = chatsList.filter(c => {
        return c.ownerPhone === currentPhone || c.contactPhone === currentPhone;
      });
      // For owners, reverse contact info to display the farmer's credentials
      return filtered.map(c => ({
        ...c,
        contactName: c.senderName || 'రామకృష్ణ ప్రసాద్',
        contactAvatar: c.senderAvatar || 'https://images.unsplash.com/photo-1566385211905-2b44ef911c42?auto=format&fit=crop&w=150&q=80',
        contactPhone: c.senderPhone || '9866012345',
      }));
    } else if (currentRole === 'farmer') {
      // Farmer should see:
      // 1. Chats where senderPhone matches their phone
      // 2. Chats where farmerUid matches their ID/UID
      // 3. Chats for any equipment they have booked
      // 4. Fallback for demo chats if user is demo farmer or empty sender
      return chatsList.filter(c => {
        if (c.senderPhone && currentPhone && c.senderPhone === currentPhone) return true;
        if (c.farmerUid && userProfile.uid && c.farmerUid === userProfile.uid) return true;
        if (c.farmerUid && userProfile.id && c.farmerUid === userProfile.id) return true;
        if (c.equipmentId && userProfile.bookedEquipmentIds && userProfile.bookedEquipmentIds.includes(c.equipmentId)) return true;
        if (!c.senderPhone || c.senderPhone === '9866012345' || currentPhone === '9866012345') return true;
        return false;
      });
    }
    return chatsList;
  })();

  const unreadMessagesCount = filteredChats.filter(c => c.unread).length;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col relative">
      
      {/* High-End Professional Simulation & Cooperative Portal Workspace Bar */}
      <div className="bg-zinc-950 border-b border-zinc-800 text-white px-5 py-2 flex flex-col lg:flex-row items-center justify-between gap-3 shadow-xs z-50">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-emerald-600/10 border border-emerald-500/20 flex items-center justify-center font-extrabold text-base text-emerald-400">
            🌾
          </div>
          <div className="text-left">
            <h1 className="text-xs font-bold tracking-widest text-zinc-100 uppercase flex items-center gap-2">
              <span>{language === 'te' ? 'రైతు వేదిక సహకార సేవలు' : 'Raitu Vedika Portal'}</span>
              <span className="text-[9px] bg-emerald-500/15 text-emerald-400 font-extrabold px-2 py-0.2 rounded-full border border-emerald-500/25 uppercase">
                {language === 'te' ? 'సహకార సేవల నెట్‌వర్క్' : 'Cooperative'}
              </span>
            </h1>
            <p className="text-[10px] text-zinc-400 mt-0.5 max-w-md hidden md:block">
              {language === 'te'
                ? 'ఆంధ్రప్రదేశ్ డిజిటల్ వ్యవసాయ సేవల అనుసంధానం మరియు యంత్రాల అద్దె మద్దతు పోర్టల్'
                : 'Digital Agritech Ecosystem & Mutual Machinery Leasing Services'}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-2">
          <div className="bg-zinc-900/70 p-1 rounded-full border border-zinc-800/80 flex flex-wrap items-center gap-0.5">
            {(() => {
              const tabs = [
                { id: 'public', labelTe: '🌐 పబ్లిక్ సైట్', labelEn: '🌐 Public' }
              ];

              if (!userProfile) {
                tabs.push({ id: 'auth', labelTe: '🔑 లాగిన్', labelEn: '🔑 Login' });
                tabs.push({ id: 'admin-login', labelTe: '⚙️ అడ్మిన్', labelEn: '⚙️ Admin' });
              } else {
                const role = userProfile.role || 'farmer';
                if (role === 'farmer') {
                  tabs.push({ id: 'farmer', labelTe: '👨‍🌾 రైతు డ్యాష్‌బోర్డ్', labelEn: '👨‍🌾 Farmer Panel' });
                  tabs.push({ id: 'admin-login', labelTe: '⚙️ అడ్మిన్', labelEn: '⚙️ Admin' });
                } else if (role === 'owner') {
                  tabs.push({ id: 'owner', labelTe: '🚜 యజమాని డ్యాష్‌బోర్డ్', labelEn: '🚜 Owner Panel' });
                  tabs.push({ id: 'admin-login', labelTe: '⚙️ అడ్మిన్', labelEn: '⚙️ Admin' });
                } else if (role === 'admin') {
                  tabs.push({ id: 'admin', labelTe: '⚙️ అడ్మిన్ కన్సోల్', labelEn: '⚙️ Admin Panel' });
                }
              }

              tabs.push({ id: 'extras', labelTe: '🌟 అదనపు సేవలు', labelEn: '🌟 Extras' });
              return tabs;
            })().map((m) => {
              const active = workspaceMode === m.id;
              const displayLabel = language === 'te' ? m.labelTe : m.labelEn;
              return (
                <button
                  key={m.id}
                  onClick={() => {
                    setWorkspaceMode(m.id as any);
                    if (m.id !== 'public' && m.id !== 'auth' && m.id !== 'admin-login' && m.id !== 'extras' && !userProfile) {
                      setUserProfile(DEFAULT_FARMER_USER);
                    }
                    
                    const switchedMsg = language === 'te'
                      ? `విభాగం మార్చబడింది: ${m.labelTe}`
                      : `Switched module to: ${m.labelEn}`;
                    triggerToast(switchedMsg, 'success');
                  }}
                  className={`px-3 py-1 rounded-full text-[11px] font-bold tracking-wide transition-all duration-200 cursor-pointer ${
                    active 
                      ? 'bg-emerald-600 text-white shadow-xs font-bold' 
                      : 'text-zinc-400 hover:text-white hover:bg-zinc-800/50 bg-transparent'
                  }`}
                >
                  {displayLabel}
                </button>
              );
            })}
          </div>

          {userProfile && (
            <button
              onClick={handleSignOut}
              className="px-3.5 py-1.5 rounded-full text-[11px] font-bold text-red-400 hover:text-white hover:bg-red-600 transition-all duration-200 cursor-pointer bg-red-950/20 border border-red-500/20"
              id="btn-global-logout"
            >
              {language === 'te' ? '🔓 లాగ్‌అవుట్' : '🔓 Sign Out'}
            </button>
          )}
        </div>
      </div>

      {/* Main Body Content rendering according to the value of workspaceMode */}
      <main className="flex-1">
        {workspaceMode === 'public' && (
          <div className="max-w-7xl mx-auto w-full p-4 space-y-4">
            {userProfile ? (
              <Header
                user={userProfile}
                onProfileClick={() => {
                  setWorkspaceMode('farmer');
                  triggerToast('Viewing Farmer Profile settings', 'info');
                }}
                language={language}
                onLanguageToggle={handleLanguageToggle}
              />
            ) : (
              <header className="sticky top-0 z-30 bg-white border-b border-gray-100 px-4 py-3 flex items-center justify-between shadow-xs rounded-2xl">
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

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleLanguageToggle}
                    className="bg-emerald-50 hover:bg-emerald-100 text-[#1b6d24] border border-[#1b6d24]/10 p-1.5 px-3 rounded-full flex items-center gap-1.5 active:scale-95 transition-all text-[10px] font-extrabold cursor-pointer"
                    id="btn-public-lang-toggle"
                  >
                    <Globe className="w-3.5 h-3.5 text-[#1b6d24]" />
                    <span className="uppercase">{language === 'te' ? 'English' : 'తెలుగు'}</span>
                  </button>
                </div>
              </header>
            )}

            {activePublicPage ? (
              <PublicPages
                pageId={activePublicPage}
                language={language}
                onClose={() => setActivePublicPage(null)}
                equipmentList={equipmentList}
                onBook={(id) => {
                  if (handleBookEquipment(id)) {
                    setActivePublicPage(null);
                    setWorkspaceMode('farmer');
                  } else {
                    setActivePublicPage(null);
                  }
                }}
                onOpenChat={(ownerName, ownerPhone, ownerAvatar, equipmentId, equipmentTitle, equipmentImage) => {
                  handleOpenChatWithContact(ownerName, equipmentTitle, equipmentId, equipmentImage, ownerPhone, ownerAvatar);
                  setActivePublicPage(null);
                  setWorkspaceMode('farmer');
                }}
              />
            ) : (
              <div className="space-y-6">
                {/* Horizontal tabs internally for public site */}
                <div id="public-tabs" className="bg-white border rounded-xl p-2.5 flex justify-center gap-1.5 max-w-md mx-auto">
                  <button 
                    onClick={() => { setActiveTab('home'); }} 
                    className={`px-4 py-1.5 rounded-lg text-xs font-black cursor-pointer ${activeTab === 'home' ? 'bg-[#1b6d24] text-white' : 'bg-slate-50 text-slate-600'}`}
                  >
                    {language === 'te' ? 'హోమ్ పేజీ' : 'Home Index'}
                  </button>
                  <button 
                    onClick={() => { setActiveTab('search'); }} 
                    className={`px-4 py-1.5 rounded-lg text-xs font-black cursor-pointer ${activeTab === 'search' ? 'bg-[#1b6d24] text-white' : 'bg-slate-50 text-slate-600'}`}
                  >
                    {language === 'te' ? 'యంత్రాంగల శోధన' : 'Search Results'}
                  </button>
                </div>

                {activeTab === 'home' ? (
                  <HomeView
                    equipmentList={equipmentList}
                    onBook={(id) => {
                      if (handleBookEquipment(id)) {
                        setWorkspaceMode('farmer');
                      }
                    }}
                    onSearchRedirect={handleSearchRedirect}
                    onViewDetails={(id) => {
                      const matched = equipmentList.find(e => e.id === id);
                      if (matched) {
                        setSelectedDetailsEquipment(matched);
                      }
                    }}
                    onOpenChat={handleOpenChatWithContact}
                    language={language}
                    userDistrict={userProfile?.district || userProfile?.location}
                    onOpenPublicPage={(pageId) => {
                      setActivePublicPage(pageId);
                    }}
                    onSwitchToExtras={() => {
                      setWorkspaceMode('extras');
                      triggerToast(language === 'te' ? 'అగ్రిటెక్ అదనపు విభాగం లోడ్ చేయబడింది!' : 'Agritech Extension Extras Desk opened!', 'info');
                    }}
                  />
                ) : (
                  <BrowseView
                    equipmentList={equipmentList}
                    selectedCategory={selectedCategory}
                    onBook={(id) => {
                      if (handleBookEquipment(id)) {
                        setWorkspaceMode('farmer');
                      }
                    }}
                    onViewDetails={(id) => {
                      const matched = equipmentList.find(e => e.id === id);
                      if (matched) {
                        setSelectedDetailsEquipment(matched);
                      }
                    }}
                    onOpenChat={handleOpenChatWithContact}
                    initialSearchQuery={searchQuery}
                    onClearInitialCategory={() => setSelectedCategory('')}
                    language={language}
                    userDistrict={userProfile?.district || userProfile?.location}
                  />
                )}
              </div>
            )}

                {/* Footer showing link options to other requested public pages */}
                <footer className="border-t border-slate-200 pt-8 pb-12 mt-12 text-center text-xs space-y-4 max-w-3xl mx-auto">
                  <div className="flex flex-wrap justify-center gap-4 text-slate-500 font-extrabold uppercase tracking-wide">
                    {['about', 'contact', 'faq', 'privacy', 'terms', 'help_support'].map((pgId) => (
                      <button 
                        key={pgId} 
                        onClick={() => setActivePublicPage(pgId as any)}
                        className="hover:text-[#1b6d24] transition cursor-pointer"
                      >
                        {pgId.replace('_', ' ')}
                      </button>
                    ))}
                  </div>
                  <p className="text-slate-400 font-bold text-[10.5px]">
                    © 2026 AP Farmer Mutual Cooperative Logistics Society. Zero Brokerage.
                  </p>
                </footer>
              </div>
            )}

        {(workspaceMode === 'auth' || workspaceMode === 'admin-login') && (
          <AuthPages
            language={language}
            onLanguageToggle={handleLanguageToggle}
            initialRole={workspaceMode === 'admin-login' ? 'admin' : undefined}
            onLoginSuccess={(profile) => {
              updateUserProfile(profile);
              const targetMode = profile.role || 'farmer';
              setWorkspaceMode(targetMode);
              const loginAlertTe = profile.role === 'admin'
                ? `నమస్తే అడ్మిన్! ${profile.name} ప్రొఫైల్‌తో కనెక్ట్ అయ్యారు.`
                : profile.role === 'owner'
                ? `నమస్తే యజమాని! ${profile.name} ప్రొఫైల్‌తో కనెక్ట్ అయ్యారు.`
                : `${profile.name} రైతు ప్రొఫైల్‌తో కనెక్ట్ అయ్యారు!`;
              triggerToast(language === 'te' ? loginAlertTe : `Welcome back, ${profile.name}!`, 'success');
            }}
          />
        )}

        {workspaceMode === 'farmer' && (
          <FarmerDashboard
            user={userProfile || DEFAULT_FARMER_USER}
            equipmentList={equipmentList}
            chats={filteredChats}
            language={language}
            onSignOut={handleSignOut}
            updateEquipment={setEquipmentList}
            updateUserProfile={updateUserProfile}
            onSendMessage={handleSendMessage}
            onReceiveReply={handleReceiveReply}
            onMarkAsRead={handleMarkAsRead}
            onDeleteChat={handleDeleteChat}
            onDeleteMessage={handleDeleteMessage}
            updateChatsList={updateChatsList}
            triggerToast={triggerToast}
          />
        )}

        {workspaceMode === 'owner' && (
          <OwnerDashboard
            user={userProfile || DEFAULT_FARMER_USER}
            equipmentList={equipmentList}
            chats={filteredChats}
            language={language}
            updateEquipment={setEquipmentList}
            updateUserProfile={updateUserProfile}
            onSendMessage={handleSendMessage}
            onReceiveReply={handleReceiveReply}
            onMarkAsRead={handleMarkAsRead}
            onDeleteChat={handleDeleteChat}
            onDeleteMessage={handleDeleteMessage}
            triggerToast={triggerToast}
          />
        )}

        {workspaceMode === 'admin' && (
          <AdminDashboard
            equipmentList={equipmentList}
            language={language}
            updateEquipment={setEquipmentList}
            triggerToast={triggerToast}
          />
        )}

        {workspaceMode === 'extras' && (
          <AdditionalFeatures
            language={language}
            onLanguageToggle={handleLanguageToggle}
            triggerToast={triggerToast}
          />
        )}
      </main>

      {/* Premium Equipment Specifications details Bottom overlay */}
      {selectedDetailsEquipment && (
        <EquipmentDetailsModal
          equipment={selectedDetailsEquipment}
          onClose={() => setSelectedDetailsEquipment(null)}
          onBook={(id) => {
            if (handleBookEquipment(id)) {
              setWorkspaceMode('farmer');
            }
            setSelectedDetailsEquipment(null);
          }}
          onOpenChat={handleOpenChatWithContact}
          language={language}
          currentUser={userProfile}
          onUpdateEquipment={(updated) => {
            setSelectedDetailsEquipment(updated);
            setEquipmentList(prev => prev.map(e => e.id === updated.id ? updated : e));
          }}
        />
      )}

      {/* Pre-booking Confirmation & Duration / Chat selector modal */}
      {preBookingEquipment && (
        <div className="fixed inset-0 z-[110] bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-[2.5rem] p-6 max-w-md w-full shadow-2xl relative border border-emerald-50 max-h-[90vh] overflow-y-auto">
            <button 
              onClick={() => setPreBookingEquipment(null)}
              className="absolute top-4 right-4 p-2 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-base font-black text-slate-850 mb-2 border-b border-slate-100 pb-2 flex items-center gap-1.5">
              <Leaf className="w-5 h-5 text-[#1b6d24]" />
              <span>{language === 'te' ? 'అద్దె బుకింగ్ నిర్ధారణ' : 'Rental Booking Confirmation'}</span>
            </h3>

            {/* Item summary */}
            <div className="flex gap-3 mb-4 bg-slate-50 border border-slate-105 p-3 rounded-2xl">
              <img 
                src={preBookingEquipment.imageUrl} 
                alt={preBookingEquipment.title} 
                className="w-14 h-14 rounded-xl object-cover border"
                referrerPolicy="no-referrer"
              />
              <div className="min-w-0 flex-1">
                <h4 className="text-xs font-black text-slate-800 truncate">
                  {language === 'te' ? preBookingEquipment.title : (preBookingEquipment.titleEn || preBookingEquipment.title)}
                </h4>
                <p className="text-[10px] text-slate-400 mt-0.5">
                  {language === 'te' ? 'ప్రాంతం:' : 'District:'} {language === 'te' ? preBookingEquipment.location : preBookingEquipment.locationEn}
                </p>
                <p className="text-xs font-bold text-[#1b6d24] mt-1">
                  ₹{preBookingEquipment.price}/{language === 'te' ? preBookingEquipment.rateTypeLabel : preBookingEquipment.rateType}
                </p>
              </div>
            </div>

            {/* Duration picker (Hours selection / enni gantalu) */}
            <div className="mb-4 space-y-1.5">
              <label className="text-[10px] uppercase font-black tracking-widest text-slate-400 block">
                {language === 'te' ? 'వ్యవసాయ యంత్ర వ్యవధి (Duration):' : 'Specify Lease Duration:'}
              </label>
              <div className="flex items-center justify-between border border-slate-200 rounded-2xl p-2 bg-slate-50/50">
                <button
                  type="button"
                  onClick={() => setPreBookingDuration(prev => Math.max(1, prev - 1))}
                  className="w-8 h-8 rounded-xl bg-white border border-slate-200 flex items-center justify-center hover:bg-slate-50"
                >
                  <Minus className="w-3.5 h-3.5 text-slate-600" />
                </button>
                <div className="text-center">
                  <span className="text-sm font-black text-slate-800">{preBookingDuration}</span>
                  <span className="text-[11px] text-slate-500 font-bold ml-1.5">
                    {preBookingEquipment.rateType === 'day' 
                      ? (language === 'te' ? 'రోజులు' : 'days') 
                      : (language === 'te' ? 'గంటలు' : 'hours')}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setPreBookingDuration(prev => prev + 1)}
                  className="w-8 h-8 rounded-xl bg-white border border-slate-200 flex items-center justify-center hover:bg-slate-50"
                >
                  <Plus className="w-3.5 h-3.5 text-slate-600" />
                </button>
              </div>
            </div>

            {/* Total rate calc */}
            <div className="mb-4 bg-emerald-50 border border-emerald-100 rounded-2xl p-3 flex justify-between items-center">
              <span className="text-xs font-bold text-emerald-800">
                {language === 'te' ? 'మొత్తం అద్దె రుసుము:' : 'Total Rental Price:'}
              </span>
              <span className="text-base font-black text-[#1b6d24]">
                ₹{parseInt(preBookingEquipment.price as any) * preBookingDuration}
              </span>
            </div>

            {/* Enhanced Interactive Delivery Target Place Configurator */}
            <div className="mb-4 bg-slate-50/40 p-3.5 border border-slate-100 rounded-[1.75rem] space-y-3">
              <span className="text-[10px] uppercase font-black tracking-widest text-[#1b6d24] block select-none">
                📍 {language === 'te' ? 'డెలివరీ గమ్యస్థానం (Delivery Address & Logistics):' : 'Delivery Destination Details:'}
              </span>

              {/* District & Mandal Row */}
              <div className="grid grid-cols-2 gap-2 mt-1">
                <div>
                  <label className="text-[9px] uppercase font-black text-slate-400 block mb-1">
                    {language === 'te' ? 'జిల్లా (District):' : 'District:'}
                  </label>
                  <select
                    value={deliveryDistrict}
                    onChange={(e) => {
                      const nextDist = e.target.value;
                      setDeliveryDistrict(nextDist);
                      const places = AP_LOCATION_DATABASE.districts[nextDist]?.places || [];
                      const nextMandal = places[0] || '';
                      setDeliveryMandal(nextMandal);
                      const villages = getVillagesForDistrictAndMandal(nextDist, nextMandal);
                      setDeliveryVillage(villages[0] || '');
                    }}
                    className="w-full text-[11px] font-black bg-white border border-slate-200 rounded-xl p-2 focus:outline-none focus:ring-1 focus:ring-[#1b6d24]"
                  >
                    {AP_DISTRICTS_ENTRIES.map((dist) => (
                      <option key={dist} value={dist}>{dist}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-[9px] uppercase font-black text-slate-400 block mb-1">
                    {language === 'te' ? 'మండలం/పట్టణం:' : 'Mandal / Town:'}
                  </label>
                  <select
                    value={deliveryMandal}
                    onChange={(e) => {
                      const newMandal = e.target.value;
                      setDeliveryMandal(newMandal);
                      const villages = getVillagesForDistrictAndMandal(deliveryDistrict, newMandal);
                      setDeliveryVillage(villages[0] || '');
                    }}
                    className="w-full text-[11px] font-black bg-white border border-slate-200 rounded-xl p-2 focus:outline-none focus:ring-1 focus:ring-[#1b6d24]"
                  >
                    {(AP_LOCATION_DATABASE.districts[deliveryDistrict]?.places || []).map((place) => (
                      <option key={place} value={place}>{place}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Village Selector Dropdown */}
              <div className="mt-2 text-left">
                <label className="text-[9px] uppercase font-black text-slate-400 block mb-1">
                  {language === 'te' ? 'గ్రామం (Village Select):' : 'Select Village:'}
                </label>
                <select
                  value={deliveryVillage}
                  onChange={(e) => setDeliveryVillage(e.target.value)}
                  className="w-full text-[11px] font-black bg-white border border-slate-200 rounded-xl p-2 focus:outline-none focus:ring-1 focus:ring-[#1b6d24]"
                >
                  {(getVillagesForDistrictAndMandal(deliveryDistrict, deliveryMandal)).map((village) => (
                    <option key={village} value={village}>{village}</option>
                  ))}
                  <option value="custom">{language === 'te' ? 'ఇతర గ్రామం రాయండి (Other...)' : 'Other Custom Village...'}</option>
                </select>
              </div>

              {/* Custom Village text input */}
              {(deliveryVillage === 'custom' || deliveryVillage === 'ఇతర గ్రామం') && (
                <div className="mt-2 animate-fadeIn text-left">
                  <label className="text-[9px] uppercase font-black text-[#1b6d24] block mb-1">
                    {language === 'te' ? 'గ్రామం పేరు రాయండి (Custom Village Name):' : 'Enter Custom Village Name:'}
                  </label>
                  <input
                    type="text"
                    value={deliveryCustomVillage}
                    onChange={(e) => setDeliveryCustomVillage(e.target.value)}
                    className="w-full text-xs font-black bg-white border border-slate-200 rounded-xl p-2 focus:outline-none focus:ring-1 focus:ring-[#1b6d24] text-slate-800"
                    placeholder={language === 'te' ? 'గ్రామం పేరు నమోదు చేయండి...' : 'Type village name...'}
                    required
                  />
                </div>
              )}

              {/* Landmark info */}
              <div className="mt-2 text-left">
                <label className="text-[9px] uppercase font-black text-slate-400 block mb-1">
                  {language === 'te' ? 'పొలం ల్యాండ్‌మార్క్ (Landmark / Field Address):' : 'Detailed Field Landmark:'}
                </label>
                <input
                  type="text"
                  value={deliveryLandmark}
                  onChange={(e) => setDeliveryLandmark(e.target.value)}
                  className="w-full text-xs font-black bg-white border border-slate-200 rounded-xl p-2 focus:outline-none focus:ring-1 focus:ring-[#1b6d24] text-slate-800"
                  placeholder={language === 'te' ? 'ఉదా: నీళ్ల ట్యాంకు దగ్గర, సర్వే నం. 24...' : 'e.g. Near water tank, survey no. 104...'}
                />
              </div>

              {/* GPS coordinates lock simulator */}
              <div className="mt-2 p-2 bg-slate-100 rounded-xl">
                <label className="flex items-center justify-between cursor-pointer select-none">
                  <span className="text-[10px] font-black text-slate-700 uppercase tracking-wide flex items-center gap-1.5">
                    <span>📍 {language === 'te' ? 'పొలం జీపీఎస్ పిన్ చేయి' : 'Pin Field GPS Coordinates'}</span>
                  </span>
                  <input
                    type="checkbox"
                    checked={pinGpsCoordinates}
                    onChange={(e) => setPinGpsCoordinates(e.target.checked)}
                    className="rounded text-[#1b6d24] focus:ring-[#1b6d24] h-4 w-4 cursor-pointer"
                  />
                </label>
                {pinGpsCoordinates && (
                  <div className="mt-2 p-1.5 bg-emerald-950 text-emerald-300 rounded-lg text-[9.5px] font-mono flex items-center justify-between animate-fadeIn leading-relaxed">
                    <div className="flex items-center gap-1">
                      <span className="relative flex h-1.5 w-1.5">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-400"></span>
                      </span>
                      <span>{language === 'te' ? 'సిగ్నల్ లాక్:' : 'GPS Pinned:'}</span>
                    </div>
                    <span className="font-bold">
                      {(() => {
                        const presetCoords: { [key: string]: string } = {
                          'Alluri Sitharama Raju': '14.1500° N, 79.1200° E',
                          'Anakapalli': '17.6895° N, 83.0024° E',
                          'Anantapuramu': '14.6819° N, 77.6006° E',
                          'Annamayya': '13.9780° N, 78.9647° E',
                          'Bapatla': '15.9050° N, 80.4683° E',
                          'Chittoor': '13.2172° N, 79.1003° E',
                          'Dr. B.R. Ambedkar Konaseema': '16.5786° N, 82.0223° E',
                          'East Godavari': '16.9891° N, 81.7848° E',
                          'Eluru': '16.7101° N, 81.1035° E',
                          'Guntur': '16.3067° N, 80.4365° E',
                          'Kakinada': '16.9890° N, 82.2475° E',
                          'Krishna': '16.1852° N, 81.1341° E',
                          'Kurnool': '15.8281° N, 78.0373° E',
                          'Nandyal': '15.4847° N, 78.4811° E',
                          'NTR': '16.5062° N, 80.6480° E',
                          'Palnadu': '16.3524° N, 80.1512° E',
                          'Parvathipuram Manyam': '18.7797° N, 83.4241° E',
                          'Prakasam': '15.5057° N, 80.0499° E',
                          'Srikakulam': '18.2949° N, 83.8938° E',
                          'Sri Potti Sriramulu Nellore': '14.4426° N, 79.9865° E',
                          'Sri Sathya Sai': '14.1672° N, 77.8105° E',
                          'Tirupati': '13.6280° N, 79.4192° E',
                          'Visakhapatnam': '17.6868° N, 83.2185° E',
                          'Vizianagaram': '18.1124° N, 83.3985° E',
                          'West Godavari': '16.7104° N, 81.5424° E',
                          'YSR Kadapa': '14.4673° N, 78.8242° E'
                        };
                        return presetCoords[deliveryDistrict] || '16.3067° N, 80.4365° E';
                      })()}
                    </span>
                  </div>
                )}
              </div>

              {/* Sync settings toggle */}
              <div className="mt-1 flex items-start gap-1.5 text-left">
                <input
                  type="checkbox"
                  id="save-loc-default-chk"
                  checked={saveAsDefaultLocation}
                  onChange={(e) => setSaveAsDefaultLocation(e.target.checked)}
                  className="rounded text-[#1b6d24] focus:ring-[#1b6d24] h-3.5 w-3.5 mt-0.5 cursor-pointer"
                />
                <label htmlFor="save-loc-default-chk" className="text-[9.5px] text-slate-500 font-extrabold leading-tight cursor-pointer select-none">
                  {language === 'te' ? 'నా ప్రొఫైల్‌లో డిఫాల్ట్ డెలివరీ చిరునామాగా మార్చు' : 'Set as default primary delivery address in profile'}
                </label>
              </div>

              {/* Address composition preview block */}
              <div className="bg-emerald-50/30 rounded-xl p-2.5 text-[9.5px] border border-emerald-100 text-slate-600 font-bold italic text-left leading-normal">
                <span className="font-extrabold text-[#1b6d24] block uppercase tracking-wide not-italic mb-0.5">
                  {language === 'te' ? '📍 బుకింగ్ డెలివరీ చిరునామా ప్రివ్యూ:' : '📍 Live Location Preview:'}
                </span>
                {preBookingPlace}
              </div>
            </div>

            {/* Chat message textarea */}
            <div className="mb-4 space-y-1.5">
              <label className="text-[10px] uppercase font-black tracking-widest text-slate-400 block">
                {language === 'te' ? 'యజమానికి చాట్ మెసేజ్ పంపండి (Message):' : 'Chat Message to Owner:'}
              </label>
              <textarea
                value={preBookingMessage}
                onChange={(e) => setPreBookingMessage(e.target.value)}
                className="w-full h-16 text-xs font-bold bg-slate-50 border border-slate-150 rounded-2xl p-2.5 focus:outline-none focus:ring-1 focus:ring-[#1b6d24]"
                placeholder={language === 'te' ? 'మీ ప్రశ్నను ఇక్కడ రాయండి...' : 'Type a message to initiate contact immediately...'}
              />
            </div>

            {/* Modal actions */}
            <div className="grid grid-cols-2 gap-3 mt-4">
              <button
                onClick={() => setPreBookingEquipment(null)}
                className="py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl text-xs font-bold cursor-pointer transition"
              >
                {language === 'te' ? 'రద్దు చేయి' : 'Cancel'}
              </button>
              <button
                onClick={() => handleConfirmBookingFinal(preBookingEquipment.id, preBookingDuration, preBookingMessage)}
                className="py-2.5 bg-[#1b6d24] hover:bg-[#15541b] text-white rounded-xl text-xs font-bold shadow-md cursor-pointer transition whitespace-nowrap"
              >
                {language === 'te' ? 'బుకింగ్ నిర్ధారించు' : 'Confirm Rent'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Booking complete modal */}
      {bookingSuccessModal && bookingSuccessModal.show && (
        <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-[2rem] p-6 text-center max-w-xs shadow-2xl relative border border-emerald-50">
            <div className="w-16 h-16 rounded-full bg-green-50 flex items-center justify-center mx-auto mb-4 border border-green-100">
              <CheckCircle className="w-10 h-10 text-emerald-600" />
            </div>
            
            <h3 className="text-base font-extrabold text-gray-800 leading-tight">
              {language === 'te' ? 'బుకింగ్ కన్ఫర్మ్ అయ్యింది!' : 'Booking Confirmed!'}
            </h3>
            
            <p className="text-[11px] text-gray-400 font-bold mt-1 tracking-wider uppercase">
              {language === 'te' ? bookingSuccessModal.equipment.title : bookingSuccessModal.equipment.titleEn}
            </p>

            <div className="bg-gray-50/80 border border-gray-100 rounded-2xl p-3.5 mt-4 text-left">
              <p className="text-xs text-gray-450 font-bold">
                {language === 'te' 
                  ? 'ఈ రైతు వేదిక ద్వారా మీ అభ్యర్థన విజయవంతంగా పంపబడింది.'
                  : 'Your rental request was successfully registered with cooperative logistics.'}
              </p>
              <div className="mt-2 text-xs text-[#1b6d24] font-extrabold flex items-center gap-1">
                <Leaf className="w-3.5 h-3.5" />
                <span>
                  {language === 'te' ? `యజమాని: ${bookingSuccessModal.equipment.ownerName}` : `Owner: ${bookingSuccessModal.equipment.ownerName}`}
                </span>
              </div>
            </div>

            <p className="text-[10px] text-gray-400 font-medium leading-relaxed mt-4">
              {language === 'te'
                ? 'యంత్ర రవాణా, గడువు మరియు చెల్లింపు వివరాల కోసం యజమానితో మాట్లాడవచ్చు.'
                : 'You may now call or text the owner to coordinate driver schedules and fuel.'}
            </p>

            <div className="flex flex-col gap-2 mt-5">
              <button
                onClick={() => handleCloseBookingModalAndChat(true)}
                className="w-full py-2.5 bg-[#1b6d24] text-white rounded-xl text-xs font-bold hover:bg-[#15541b] cursor-pointer"
                id="modal-success-chat"
              >
                {language === 'te' ? 'యజమానితో చాట్ చేయి' : 'Chat & Coordinate'}
              </button>
              <button
                onClick={() => handleCloseBookingModalAndChat(false)}
                className="w-full py-2.5 border border-gray-200 text-gray-500 hover:bg-gray-50 rounded-xl text-xs font-bold cursor-pointer"
                id="modal-success-bookings"
              >
                {language === 'te' ? 'నా బుకింగ్స్ చూడండి' : 'View My Bookings'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Elegantly styled, custom, updated Logout Confirmation overlay modal */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-[150] animate-fade-in p-4">
          <div className="bg-white border rounded-[2.5rem] max-w-sm w-full p-6 text-center space-y-4 shadow-xl animate-scale-up">
            <div className="w-12 h-12 bg-red-50 text-red-600 rounded-full flex items-center justify-center mx-auto mb-1">
              <Shield className="w-6 h-6 text-red-500" />
            </div>

            <div className="space-y-1">
              <h3 className="text-sm font-black text-slate-800">
                {language === 'te' ? 'నిశ్చయంగా లాగ్‌అవుట్ అవ్వాలనుకుంటున్నారా?' : 'Are you sure you want to log out?'}
              </h3>
              <p className="text-[10.5px] text-slate-500 leading-relaxed">
                {language === 'te' 
                  ? 'మీ కార్యకలాపాలు సురక్షితంగా రక్షించబడతాయి. మళ్లీ ఎప్పుడైనా సులభంగా లాగిన్ అవ్వవచ్చు.' 
                  : 'Your cooperative rentals and booking states will be safely saved offline.'}
              </p>
            </div>

            {isLoggingOut ? (
              <div className="flex flex-col items-center justify-center py-2 space-y-2">
                <div className="w-6 h-6 border-2 border-[#1b6d24] border-t-transparent rounded-full animate-spin"></div>
                <p className="text-[9.5px] text-emerald-800 font-bold tracking-wider animate-pulse uppercase">
                  {language === 'te' ? 'కూటమి నుండి సురక్షితంగా నిష్క్రమిస్తున్నారు...' : 'Securing and signing out...'}
                </p>
              </div>
            ) : (
              <div className="flex gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setShowLogoutConfirm(false)}
                  className="flex-1 py-2.5 border border-slate-200 text-slate-500 hover:bg-slate-50 rounded-xl text-xs font-bold transition-all cursor-pointer"
                >
                  {language === 'te' ? 'కాదు / వెనుకకు పో' : 'Cancel'}
                </button>
                <button
                  type="button"
                  onClick={executeActualSignOut}
                  className="flex-1 py-2.5 bg-[#ef4444] hover:bg-red-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer"
                >
                  {language === 'te' ? 'అవును, లాగ్‌అవుట్ చేయి' : 'Yes, Log Out'}
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Floating global Toast notification alert banner */}
      {toastMessage && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[200] bg-gray-900/95 backdrop-blur-xs text-white text-[11px] font-bold px-4 py-2.5 rounded-full shadow-lg flex items-center gap-2 border border-white/10 animate-fade-in whitespace-nowrap">
          {toastMessage.type === 'success' ? (
            <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
          ) : (
            <span className="w-2 h-2 rounded-full bg-amber-400"></span>
          )}
          {toastMessage.text}
          <button onClick={() => setToastMessage(null)} className="text-white/40 hover:text-white pl-1.5 focus:outline-none cursor-pointer">
            <X className="w-3.5 h-3.5 text-white" />
          </button>
        </div>
      )}

    </div>
  );
}
