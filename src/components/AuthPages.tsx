import React, { useState, useEffect } from 'react';
import { FarmerProfile } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { AP_LOCATION_DATABASE, AP_DISTRICTS_ENTRIES, AP_STATE_NAME, getVillagesForDistrictAndMandal, formatLocationName } from '../locationData';
import { DEFAULT_SILHOUETTE_AVATAR, saveUserToLocalStorage, getRegisteredUsersFromLocalStorage, addRegisteredUserToRegistry } from '../data';
import { APP_ONBOARDING_NOTIFICATIONS } from './FarmerDashboard';
import { auth, db } from '../lib/firebase';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  sendPasswordResetEmail,
  signInAnonymously,
  signOut
} from 'firebase/auth';
import { doc, getDoc, setDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { 
  Lock, 
  Phone, 
  User, 
  MapPin, 
  ArrowRight, 
  ArrowLeft, 
  Check, 
  Key, 
  ShieldAlert, 
  Leaf, 
  Globe, 
  Eye, 
  EyeOff, 
  HelpCircle,
  CheckCircle2,
  Info,
  Building,
  Upload,
  FileCheck,
  Smartphone,
  UserCheck,
  ShieldCheck,
  Camera,
  Mail,
  Loader2,
  X
} from 'lucide-react';

interface AuthPagesProps {
  language: 'te' | 'en';
  onLanguageToggle: () => void;
  onLoginSuccess: (profile: FarmerProfile) => void;
  onCancel?: () => void;
  initialRole?: 'farmer' | 'owner' | 'admin';
}

type AuthScreen = 'login' | 'signup' | 'forgot' | 'otp' | 'reset-password';

const AVATARS = [
  DEFAULT_SILHOUETTE_AVATAR,
  'https://thumbs.dreamstime.com/b/illustration-smiling-farmer-overalls-sun-hat-cartoon-style-agricultural-avatar-illustration-smiling-farmer-400078747.jpg',
  'https://www.creativefabrica.com/wp-content/uploads/2022/10/19/Cute-Farmer-Girl-Character-Illustration-Graphics-42284202-1.jpg',
  'https://img.freepik.com/premium-photo/young-smiling-man-farmer-agricultural-worker-gardening-farming-professional-occupation-concept_1240525-15057.jpg',
  'https://img.freepik.com/premium-psd/3d-render-male-farmer-characters-isolated-professions-occupations-avatar-icons_570783-1397.jpg'
];

const DISTRICTS = [
  { value: 'అల్లూరి సీతారామరాజు', labelEn: 'Alluri Sitharama Raju' },
  { value: 'అనకాపల్లి', labelEn: 'Anakapalli' },
  { value: 'అనంతపురము', labelEn: 'Anantapuramu' },
  { value: 'అన్నమయ్య', labelEn: 'Annamayya' },
  { value: 'బాపట్ల', labelEn: 'Bapatla' },
  { value: 'చిత్తూరు', labelEn: 'Chittoor' },
  { value: 'డాక్టర్ బి.ఆర్. అంబేద్కర్ కోనసీమ', labelEn: 'Dr. B.R. Ambedkar Konaseema' },
  { value: 'తూర్పు గోదావరి', labelEn: 'East Godavari' },
  { value: 'ఏలూరు', labelEn: 'Eluru' },
  { value: 'గుంటూరు', labelEn: 'Guntur' },
  { value: 'కాకినాడ', labelEn: 'Kakinada' },
  { value: 'కృష్ణా', labelEn: 'Krishna' },
  { value: 'కర్నూలు', labelEn: 'Kurnool' },
  { value: 'నంద్యాల', labelEn: 'Nandyal' },
  { value: 'ఎన్టీఆర్', labelEn: 'NTR' },
  { value: 'పల్నాడు', labelEn: 'Palnadu' },
  { value: 'పార్వతీపురం మన్యం', labelEn: 'Parvathipuram Manyam' },
  { value: 'ప్రకాశం', labelEn: 'Prakasam' },
  { value: 'శ్రీకాకుళం', labelEn: 'Srikakulam' },
  { value: 'శ్రీ పొట్టి శ్రీరాములు నెల్లూరు', labelEn: 'Sri Potti Sriramulu Nellore' },
  { value: 'శ్రీ సత్యసాయి', labelEn: 'Sri Sathya Sai' },
  { value: 'తిరుపతి', labelEn: 'Tirupati' },
  { value: 'విశాఖపట్నం', labelEn: 'Visakhapatnam' },
  { value: 'విజయనగరం', labelEn: 'Vizianagaram' },
  { value: 'పశ్చిమ గోదావరి', labelEn: 'West Godavari' },
  { value: 'వైఎస్ఆర్ కడప', labelEn: 'YSR Kadapa' }
];

export default function AuthPages({ language, onLanguageToggle, onLoginSuccess, onCancel, initialRole }: AuthPagesProps) {
  const [screen, setScreen] = useState<AuthScreen>('login');
  const [userRole, setUserRole] = useState<'farmer' | 'owner' | 'admin'>(initialRole || 'farmer');

  useEffect(() => {
    if (initialRole) {
      setUserRole(initialRole);
      if (initialRole === 'admin') {
        setScreen('login');
      }
    }
  }, [initialRole]);
  
  // Dynamic role-specific custom option fields
  const [farmerType, setFarmerType] = useState('tenant'); 
  const [ownerCategory, setOwnerCategory] = useState('heavy'); 
  const [adminPin, setAdminPin] = useState('');
  const [farmerCoopId, setFarmerCoopId] = useState('');

  // Fields for login
  const [loginName, setLoginName] = useState('రామకృష్ణ ప్రసాద్');
  const [loginPhone, setLoginPhone] = useState('9866012345'); // Default to existing mock user
  const [loginEmail, setLoginEmail] = useState('farmer@example.com');
  const [loginPassword, setLoginPassword] = useState('123456');
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [selectedLoginDistrict, setSelectedLoginDistrict] = useState('Anantapuramu (అనంతపురము)');
  const [selectedLoginMandal, setSelectedLoginMandal] = useState('Anantapur Urban (అనంతపురం అర్బన్)');
  const [selectedLoginVillage, setSelectedLoginVillage] = useState('Bukkarayasamudram (బుక్కరాయసముద్రం)');
  const [selectedLoginPlace, setSelectedLoginPlace] = useState('Bukkarayasamudram (బుక్కరాయసముద్రం)');
  const [loginGender, setLoginGender] = useState<'male' | 'female'>('male');

  // Helper to extract district key
  const getDistrictKey = (districtRaw: string): string => {
    if (!districtRaw) return 'Anantapuramu';
    const part1 = districtRaw.split("(")[0].trim();
    if (AP_LOCATION_DATABASE.districts[part1]) return part1;

    const match = (districtRaw || "").match(/\(([^)]+)\)/);
    if (match && match[1]) {
      const dk = match[1].trim();
      if (AP_LOCATION_DATABASE.districts[dk]) return dk;
    }
    if (AP_LOCATION_DATABASE.districts[districtRaw]) return districtRaw;

    for (const dk of Object.keys(AP_LOCATION_DATABASE.districts)) {
      if (districtRaw.toLowerCase().includes(dk.toLowerCase()) ||
          (AP_LOCATION_DATABASE.districts[dk].english &&
           districtRaw.toLowerCase().includes(AP_LOCATION_DATABASE.districts[dk].english.toLowerCase()))) {
        return dk;
      }
    }
    return 'Anantapuramu';
  };

  // Sync login place list when selectedLoginDistrict or selectedLoginMandal changes
  useEffect(() => {
    const dKey = getDistrictKey(selectedLoginDistrict);
    const distData = AP_LOCATION_DATABASE.districts[dKey];
    if (distData) {
      if (distData.places && distData.places.length > 0 && (!selectedLoginMandal || !distData.places.includes(selectedLoginMandal))) {
        setSelectedLoginMandal(distData.places[0]);
      }
    }
  }, [selectedLoginDistrict]);

  useEffect(() => {
    const dKey = getDistrictKey(selectedLoginDistrict);
    const vList = getVillagesForDistrictAndMandal(dKey, selectedLoginMandal);
    if (vList && vList.length > 0) {
      setSelectedLoginVillage(vList[0]);
    }
  }, [selectedLoginDistrict, selectedLoginMandal]);

  // Cascading Location system state values
  const [selectedState, setSelectedState] = useState(AP_STATE_NAME.te);
  const [selectedDistrict, setSelectedDistrict] = useState('Anantapuramu');
  const [selectedCityMandal, setSelectedCityMandal] = useState('Anantapur Urban (అనంతపురం అర్బన్)');
  const [selectedVillage, setSelectedVillage] = useState('Bukkarayasamudram (బుక్కరాయసముద్రం)');

  // Extra verification fields for equipment owner role
  const [aadhaarNumber, setAadhaarNumber] = useState('');
  const [proofFileAttached, setProofFileAttached] = useState(false);
  const [idFileAttached, setIdFileAttached] = useState(false);
  const [proofFileName, setProofFileName] = useState('');
  const [idFileName, setIdFileName] = useState('');

  // Fields for signup
  const [signupName, setSignupName] = useState('');
  const [signupPhone, setSignupPhone] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupLocation, setSignupLocation] = useState('అనంతపురము'); // fallback legacy compatibility
  const [signupPassword, setSignupPassword] = useState('');
  const [signupConfirmPassword, setSignupConfirmPassword] = useState('');
  const [showSignupPassword, setShowSignupPassword] = useState(false);
  const [selectedAvatarIdx, setSelectedAvatarIdx] = useState(0);
  const [selectedAvatarUrl, setSelectedAvatarUrl] = useState<string>(DEFAULT_SILHOUETTE_AVATAR);
  const [agreeTerms, setAgreeTerms] = useState(true);

  // Update lists when district or mandal changes
  useEffect(() => {
    const list = AP_LOCATION_DATABASE.districts[selectedDistrict];
    if (list) {
      if (list.places && list.places.length > 0 && (!selectedCityMandal || !list.places.includes(selectedCityMandal))) {
        setSelectedCityMandal(list.places[0]);
      }
    }
  }, [selectedDistrict]);

  useEffect(() => {
    const vList = getVillagesForDistrictAndMandal(selectedDistrict, selectedCityMandal);
    if (vList && vList.length > 0) {
      setSelectedVillage(vList[0]);
    }
  }, [selectedDistrict, selectedCityMandal]);

  // Fields for forgot password and OTP reset flow
  const [isForgotModalOpen, setIsForgotModalOpen] = useState(false);
  const [forgotPhone, setForgotPhone] = useState('');
  const [forgotEmail, setForgotEmail] = useState('');
  const [otpInput, setOtpInput] = useState('');
  const [resetToken, setResetToken] = useState('');
  const [resetNewPassword, setResetNewPassword] = useState('');
  const [resetConfirmPassword, setResetConfirmPassword] = useState('');
  const [showResetNewPassword, setShowResetNewPassword] = useState(false);
  const [showResetConfirmPassword, setShowResetConfirmPassword] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);

  // Countdown timer for OTP resend cooldown
  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => {
        setResendCooldown(prev => prev - 1);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);
  
  // Alerts and loading
  const [errorText, setErrorText] = useState('');
  const [successText, setSuccessText] = useState('');
  const [isAuthLoading, setIsAuthLoading] = useState(false);
  const [unregisteredError, setUnregisteredError] = useState(false);
  const [alreadyRegisteredError, setAlreadyRegisteredError] = useState(false);

  // Reset errors and successes on screen change
  useEffect(() => {
    setErrorText('');
    setSuccessText('');
    setUnregisteredError(false);
    setAlreadyRegisteredError(false);
  }, [screen]);

  const showToast = (b: 'error' | 'success', text: string) => {
    if (b === 'error') {
      setErrorText(text);
      setSuccessText('');
    } else {
      setSuccessText(text);
      setErrorText('');
    }
    // Auto clear error
    setTimeout(() => {
      setErrorText(prev => prev === text ? '' : prev);
    }, 4500);
  };

  const persistUserOnBackend = (user: FarmerProfile) => {
    fetch('/api/register-user', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: user.name,
        phone: user.phone,
        email: user.email,
        location: (user.village ? `${user.village}, ${user.mandal}` : user.location) + ' (' + (user.district || 'AP') + ')',
        district: user.district,
        mandal: user.mandal,
        village: user.village,
        role: user.role || 'farmer',
        verified: user.verified || false,
        aadhaarNumber: user.aadhaarNumber,
        proofFileAttached: user.proofFileAttached,
        idFileAttached: user.idFileAttached
      })
    })
    .then(r => r.json())
    .catch(err => console.warn('Backend user registration sync offline/error:', err));
  };

  // Helper function to complete login process once credentials or OTP is verified
  const completeLoginFlow = (phoneToUse: string) => {
    const finalLoginVillage = selectedLoginVillage;
    const userLocation = finalLoginVillage || selectedLoginMandal || selectedLoginPlace || selectedLoginDistrict;
    const shortLocation = userLocation.split(' (')[0];
    const cleanDistrictKey = getDistrictKey(selectedLoginDistrict);

    const savedUserStr = localStorage.getItem('rv_user');
    let registeredUser: FarmerProfile | null = null;
    if (savedUserStr) {
      try {
        registeredUser = JSON.parse(savedUserStr);
      } catch (e) {
        // no-op
      }
    }

    const defaultPhone = '9866012345';
    const cleanPhone = phoneToUse.replaceAll(' ', '');
    const isDefault = cleanPhone === defaultPhone;
    const isSaved = registeredUser && cleanPhone === registeredUser.phone.replaceAll(' ', '');

    let activeUser: FarmerProfile;

    if (isDefault) {
      activeUser = {
        name: loginName.trim() || 'రామకృష్ణ ప్రసాద్',
        phone: '9866012345',
        email: loginEmail.trim() || 'farmer@example.com',
        location: shortLocation,
        district: cleanDistrictKey,
        mandal: selectedLoginMandal,
        village: finalLoginVillage,
        avatar: selectedAvatarUrl || DEFAULT_SILHOUETTE_AVATAR, 
        listedEquipmentIds: [],
        bookedEquipmentIds: [],
        role: userRole
      };
      if (savedUserStr) {
        try {
          const loaded = JSON.parse(savedUserStr);
          if (loaded.phone === defaultPhone) {
            activeUser.bookedEquipmentIds = loaded.bookedEquipmentIds || [];
            activeUser.listedEquipmentIds = loaded.listedEquipmentIds || [];
            if (loaded.email) activeUser.email = loaded.email;
          }
        } catch (_) {}
      }
    } else if (isSaved && registeredUser) {
      activeUser = { 
        ...registeredUser, 
        name: loginName.trim() || registeredUser.name,
        email: loginEmail.trim() || registeredUser.email || 'farmer@example.com',
        location: shortLocation,
        district: cleanDistrictKey,
        mandal: selectedLoginMandal,
        village: finalLoginVillage,
        avatar: selectedAvatarUrl || registeredUser.avatar || DEFAULT_SILHOUETTE_AVATAR,
        role: userRole 
      };
    } else {
      activeUser = {
        name: loginName.trim() || (language === 'te' ? 'నవ రైతు సభ్యులు' : 'New Farmer Member'),
        phone: phoneToUse,
        email: loginEmail.trim() || 'farmer@example.com',
        location: shortLocation,
        district: cleanDistrictKey,
        mandal: selectedLoginMandal,
        village: finalLoginVillage,
        avatar: selectedAvatarUrl || DEFAULT_SILHOUETTE_AVATAR,
        listedEquipmentIds: [],
        bookedEquipmentIds: [],
        role: userRole
      };
    }

    const cleanKey = cleanPhone || phoneToUse.replaceAll(' ', '');
    if (!isDefault) {
      if (!localStorage.getItem(`rv_rental_history_${cleanKey}`)) {
        localStorage.setItem(`rv_rental_history_${cleanKey}`, JSON.stringify([]));
      }
      if (!localStorage.getItem(`rv_payments_${cleanKey}`)) {
        localStorage.setItem(`rv_payments_${cleanKey}`, JSON.stringify([]));
      }
      if (!localStorage.getItem(`rv_favorites_${cleanKey}`)) {
        localStorage.setItem(`rv_favorites_${cleanKey}`, JSON.stringify([]));
      }
      if (!localStorage.getItem(`rv_notifications_${cleanKey}`)) {
        localStorage.setItem(`rv_notifications_${cleanKey}`, JSON.stringify(APP_ONBOARDING_NOTIFICATIONS));
      }

      localStorage.setItem('rv_rental_history', localStorage.getItem(`rv_rental_history_${cleanKey}`) || '[]');
      localStorage.setItem('rv_payments', localStorage.getItem(`rv_payments_${cleanKey}`) || '[]');
      localStorage.setItem('rv_favorites', localStorage.getItem(`rv_favorites_${cleanKey}`) || '[]');
      localStorage.setItem('rv_notifications', localStorage.getItem(`rv_notifications_${cleanKey}`) || JSON.stringify(APP_ONBOARDING_NOTIFICATIONS));
    }

    persistUserOnBackend(activeUser);
    showToast('success', language === 'te' ? 'విజయవంతంగా లాగిన్ అయ్యారు!' : 'Logged in successfully!');
    setTimeout(() => {
      onLoginSuccess(activeUser);
    }, 1000);
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setUnregisteredError(false);

    if (userRole === 'admin') {
      if (loginEmail.trim() && loginPassword && loginPassword.length >= 6) {
        try {
          setIsAuthLoading(true);
          const userCred = await signInWithEmailAndPassword(auth, loginEmail.trim(), loginPassword);
          const uid = userCred.user.uid;
          const userDocSnap = await getDoc(doc(db, 'users', uid));
          if (userDocSnap.exists()) {
            const profile = userDocSnap.data() as FarmerProfile;
            profile.uid = uid;
            if (profile.role === 'admin') {
              showToast('success', language === 'te' ? 'అడ్మినిస్ట్రేటర్ విజయవంతంగా లాగిన్ అయ్యారు!' : 'Administrator login authenticated successfully!');
              onLoginSuccess(profile);
              return;
            } else {
              showToast('error', language === 'te' ? 'అడ్మిన్ యాక్సెస్ నిరాకరించబడింది. సాధారణ రైతు ఖాతా.' : 'Access denied. Only Admin accounts can sign in here.');
              return;
            }
          }
        } catch (err: any) {
          console.warn("Firebase Admin Auth fallback to PIN check:", err);
        } finally {
          setIsAuthLoading(false);
        }
      }

      if (!adminPin.trim()) {
        showToast('error', language === 'te' ? 'దయచేసి అడ్మిన్ భద్రతా కోడ్ లేదా ఈమెయిల్ పాస్‌వర్డ్ నమోదు చేయండి.' : 'Please enter the Admin verification PIN or Email/Password.');
        return;
      }

      fetch('/api/admin/verify-pin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pin: adminPin.trim() })
      })
      .then(res => {
        if (!res.ok) {
          return res.json().then(data => { throw new Error(data.error || 'PIN assessment failed') });
        }
        return res.json();
      })
      .then(async () => {
        let adminUid = auth.currentUser ? auth.currentUser.uid : 'admin_coop_001';
        if (!auth.currentUser) {
          try {
            const anon = await signInAnonymously(auth);
            adminUid = anon.user.uid;
          } catch (e) {
            console.warn("Anonymous auth fallback skipped:", e);
          }
        }
        const adminUser: FarmerProfile = {
          uid: adminUid,
          name: 'Cooperative Administrator',
          phone: '9999999999',
          email: loginEmail.trim() || 'admin@raituvedika.com',
          location: 'Cooperative HQ',
          district: 'Amaravati',
          mandal: 'Capital Region',
          village: 'Amaravati Central',
          avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=150&q=80',
          listedEquipmentIds: [],
          bookedEquipmentIds: [],
          role: 'admin',
          status: 'active',
          createdAt: new Date().toISOString()
        };

        // Resilient Firestore save: if offline or permission denied on localhost, do not break login
        if (auth.currentUser) {
          try {
            await setDoc(doc(db, 'users', adminUid), adminUser, { merge: true });
          } catch (fireErr) {
            console.warn("Could not sync admin to Firestore (local session active):", fireErr);
          }
        }

        try {
          localStorage.setItem('rv_user', JSON.stringify(adminUser));
        } catch (_) {}

        persistUserOnBackend(adminUser);
        showToast('success', language === 'te' ? 'అడ్మినిస్ట్రేటర్ విజయవంతంగా లాగిన్ అయ్యారు!' : 'Administrator login authenticated successfully!');
        setTimeout(() => {
          onLoginSuccess(adminUser);
        }, 400);
      })
      .catch(err => {
        const errorMsg = err.message || (language === 'te' ? 'తప్పు పిన్' : 'Authentication failed');
        showToast('error', errorMsg);
      });

      return;
    }

    const rawEmail = loginEmail.trim();
    const cleanPhone = loginPhone.replace(/\D/g, '');

    if (!rawEmail && !cleanPhone) {
      showToast('error', language === 'te' ? 'దయచేసి ఈమెయిల్ లేదా 10 అంకెల మొబైల్ నెంబర్ నమోదు చేయండి.' : 'Please enter your email or 10-digit phone number.');
      return;
    }

    if (!loginPassword) {
      showToast('error', language === 'te' ? 'దయచేసి పాస్‌వర్డ్ నమోదు చేయండి.' : 'Please enter your password.');
      return;
    }

    setIsAuthLoading(true);
    setUnregisteredError(false);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: rawEmail,
          phone: cleanPhone,
          identifier: rawEmail || cleanPhone,
          password: loginPassword
        })
      });

      const data = await res.json();

      if (res.status === 404) {
        setUnregisteredError(true);
        showToast('error', language === 'te' ? 'ఖాతా కనుగొనబడలేదు. దయచేసి ముందుగా నమోదు చేసుకోండి.' : 'Account not found. Please register first.');
        return;
      }

      if (res.status === 401) {
        setUnregisteredError(false);
        showToast('error', language === 'te' ? 'తప్పు పాస్‌వర్డ్. దయచేసి మళ్ళీ ప్రయత్నించండి.' : 'Incorrect password. Please try again.');
        return;
      }

      if (res.status === 403) {
        setUnregisteredError(false);
        showToast('error', data.error || (language === 'te' ? 'మీ ఖాతా నిర్వాహకులచే తాత్కాలికంగా నిలిపివేయబడింది.' : 'Your account has been suspended by the administrator.'));
        return;
      }

      if (!res.ok) {
        setUnregisteredError(false);
        showToast('error', data.error || (language === 'te' ? 'లాగిన్ విఫలమైంది. దయచేసి మళ్ళీ ప్రయత్నించండి.' : 'Login failed. Please try again.'));
        return;
      }

      // Successful login!
      const beUser = data.user;
      const registeredId = beUser.id || `usr_${cleanPhone || Date.now()}`;
      const profile: FarmerProfile = {
        uid: registeredId,
        id: registeredId,
        name: beUser.name,
        phone: beUser.phone,
        email: beUser.email,
        location: beUser.location || `${beUser.village || 'Payakaraopeta'}, ${beUser.mandal || 'Payakaraopeta'} (${beUser.district || 'Anakapalli'})`,
        district: beUser.district || selectedLoginDistrict || 'Anakapalli',
        mandal: beUser.mandal || selectedLoginMandal || 'Payakaraopeta',
        village: beUser.village || selectedLoginVillage || 'Payakaraopeta',
        avatar: selectedAvatarUrl || DEFAULT_SILHOUETTE_AVATAR,
        listedEquipmentIds: [],
        bookedEquipmentIds: [],
        role: beUser.role || userRole,
        status: beUser.status || 'active',
        verified: beUser.verified || false,
        aadhaarNumber: beUser.aadhaarNumber,
        proofFileAttached: beUser.proofFileAttached,
        idFileAttached: beUser.idFileAttached,
        createdAt: beUser.createdAt || new Date().toISOString()
      };

      // Background silent sync with Firebase Auth if available
      try {
        const targetAuthEmail = (profile.email && profile.email.includes('@')) ? profile.email : `${cleanPhone}@raituvedika.com`;
        try {
          await signInWithEmailAndPassword(auth, targetAuthEmail, loginPassword);
        } catch (_) {
          if (!auth.currentUser) {
            await signInAnonymously(auth);
          }
        }
      } catch (_) {}

      // Persist session
      saveUserToLocalStorage(profile);
      addRegisteredUserToRegistry(profile);
      if (data.token) {
        localStorage.setItem('rv_session_token', data.token);
      }

      const cleanKey = cleanPhone || registeredId;
      // Initialize fresh user storage if first time logging in (clean slate)
      if (!localStorage.getItem(`rv_rental_history_${cleanKey}`)) {
        localStorage.setItem(`rv_rental_history_${cleanKey}`, JSON.stringify([]));
      }
      if (!localStorage.getItem(`rv_payments_${cleanKey}`)) {
        localStorage.setItem(`rv_payments_${cleanKey}`, JSON.stringify([]));
      }
      if (!localStorage.getItem(`rv_favorites_${cleanKey}`)) {
        localStorage.setItem(`rv_favorites_${cleanKey}`, JSON.stringify([]));
      }
      if (!localStorage.getItem(`rv_notifications_${cleanKey}`)) {
        localStorage.setItem(`rv_notifications_${cleanKey}`, JSON.stringify(APP_ONBOARDING_NOTIFICATIONS));
      }

      // Sync active global keys with this user's data
      localStorage.setItem('rv_rental_history', localStorage.getItem(`rv_rental_history_${cleanKey}`) || '[]');
      localStorage.setItem('rv_payments', localStorage.getItem(`rv_payments_${cleanKey}`) || '[]');
      localStorage.setItem('rv_favorites', localStorage.getItem(`rv_favorites_${cleanKey}`) || '[]');
      localStorage.setItem('rv_notifications', localStorage.getItem(`rv_notifications_${cleanKey}`) || JSON.stringify(APP_ONBOARDING_NOTIFICATIONS));

      showToast(
        'success', 
        language === 'te' 
          ? `విజయవంతంగా లాగిన్ అయ్యారు! మీ రైతు ID: ${registeredId}` 
          : `Logged in successfully! User ID: ${registeredId}`
      );
      setTimeout(() => {
        onLoginSuccess(profile);
      }, 500);

    } catch (err: any) {
      console.error("Login submission error:", err);
      showToast('error', language === 'te' ? 'లాగిన్ చేయడంలో లోపం సంభవించింది. దయచేసి మళ్ళీ ప్రయత్నించండి.' : 'Login failed. Please check network connection and try again.');
    } finally {
      setIsAuthLoading(false);
    }
  };

  // Direct Signup Handler (Bypasses OTP verification, strictly creates account)
  const handleSignupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAlreadyRegisteredError(false);

    if (!signupName.trim()) {
      showToast('error', language === 'te' ? 'దయచేసి మీ పూర్తి పేరును నమోదు చేయండి.' : 'Please enter your full name.');
      return;
    }
    const cleanPhone = signupPhone.replace(/\D/g, '');
    if (!cleanPhone || cleanPhone.length < 10) {
      showToast('error', language === 'te' ? 'సరైన 10 అంకెల మొబైల్ నెంబర్ నమోదు చేయండి.' : 'Please enter a valid 10-digit phone number.');
      return;
    }
    if (!signupPassword) {
      showToast('error', language === 'te' ? 'దయచేసి పాస్‌వర్డ్ నమోదు చేయండి.' : 'Please enter a password.');
      return;
    }
    if (signupPassword.length < 6) {
      showToast('error', language === 'te' ? 'పాస్‌వర్డ్ కనీసం 6 అక్షరాలు ఉండాలి.' : 'Password must be at least 6 characters.');
      return;
    }
    if (signupPassword !== signupConfirmPassword) {
      showToast('error', language === 'te' ? 'పాస్‌వర్డ్‌లు సరిపోలడం లేదు.' : 'Passwords do not match.');
      return;
    }
    if (!agreeTerms) {
      showToast('error', language === 'te' ? 'నిబంధనలు మరియు షరతులను అంగీకరించాలి.' : 'You must agree to the Terms of Service.');
      return;
    }

    if (userRole === 'owner') {
      if (!aadhaarNumber.trim() || aadhaarNumber.replace(/\D/g, '').length < 12) {
        showToast('error', language === 'te' ? 'యజమానులకు తప్పనిసరిగా 12 అంకెల ఆధార్ నెంబర్ ఉండాలి.' : 'Owners must provide a valid 12-digit Aadhaar Number.');
        return;
      }
      if (!proofFileAttached) {
        showToast('error', language === 'te' ? 'కృపతో యంత్ర యాజమాన్య రుజువు అటాచ్ చేయండి.' : 'Please upload or attach Proof of Ownership.');
        return;
      }
      if (!idFileAttached) {
        showToast('error', language === 'te' ? 'ఐడి ధృవీకరణ ఫైల్ అటాచ్ చేయండి.' : 'Please upload or attach ID Verification file.');
        return;
      }
    }

    setIsAuthLoading(true);
    const normalizedEmail = signupEmail.trim().toLowerCase();

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: signupName.trim(),
          phone: cleanPhone,
          email: normalizedEmail || `${cleanPhone}@eraitu.app`,
          password: signupPassword,
          location: `${selectedVillage}, ${selectedCityMandal} (${selectedDistrict})`,
          district: selectedDistrict,
          mandal: selectedCityMandal,
          village: selectedVillage,
          role: userRole === 'admin' ? 'farmer' : userRole,
          verified: userRole === 'owner' ? proofFileAttached : false,
          aadhaarNumber: userRole === 'owner' ? aadhaarNumber : undefined,
          proofFileAttached: userRole === 'owner' ? proofFileAttached : false,
          idFileAttached: userRole === 'owner' ? idFileAttached : false
        })
      });

      const data = await res.json();

      if (res.status === 409) {
        setAlreadyRegisteredError(true);
        showToast('error', language === 'te' ? 'ఈ ఈమెయిల్ లేదా ఫోన్ నంబర్‌తో ఇప్పటికే ఖాతా ఉంది. దయచేసి లాగిన్ చేయండి.' : 'An account with this email or phone number already exists. Please login.');
        return;
      }

      if (!res.ok) {
        showToast('error', data.error || (language === 'te' ? 'నమోదు లోపం సంభవించింది.' : 'Registration failed. Please try again.'));
        return;
      }

      // Registration Successful!
      const createdUser = data.user;
      const registeredId = createdUser.id;
      const newFarmer: FarmerProfile = {
        uid: registeredId,
        id: registeredId,
        name: createdUser.name,
        phone: createdUser.phone,
        email: createdUser.email,
        state: selectedState,
        district: selectedDistrict,
        city: selectedCityMandal,
        mandal: selectedCityMandal,
        village: selectedVillage,
        location: createdUser.location,
        avatar: selectedAvatarUrl || DEFAULT_SILHOUETTE_AVATAR,
        listedEquipmentIds: [],
        bookedEquipmentIds: [],
        role: createdUser.role,
        status: 'active',
        verified: createdUser.verified,
        aadhaarNumber: createdUser.aadhaarNumber,
        proofFileAttached: createdUser.proofFileAttached,
        idFileAttached: createdUser.idFileAttached,
        createdAt: createdUser.createdAt || new Date().toISOString()
      };

      // Firebase background create doc
      try {
        const targetAuthEmail = normalizedEmail || `${cleanPhone}@raituvedika.com`;
        const userCred = await createUserWithEmailAndPassword(auth, targetAuthEmail, signupPassword);
        if (userCred.user) {
          await setDoc(doc(db, 'users', userCred.user.uid), newFarmer, { merge: true });
          // Explicitly sign out so user is NOT auto-logged in
          await signOut(auth);
        }
      } catch (_) {}

      addRegisteredUserToRegistry(newFarmer);
      saveUserToLocalStorage(newFarmer);

      const cleanKey = cleanPhone || registeredId;
      // Clean slate for new registered user: no rental history, no payment history, no favorites, and onboarding app notifications
      localStorage.setItem(`rv_rental_history_${cleanKey}`, JSON.stringify([]));
      localStorage.setItem(`rv_payments_${cleanKey}`, JSON.stringify([]));
      localStorage.setItem(`rv_favorites_${cleanKey}`, JSON.stringify([]));
      localStorage.setItem(`rv_notifications_${cleanKey}`, JSON.stringify(APP_ONBOARDING_NOTIFICATIONS));

      // Also reset active global keys so dashboard starts fresh
      localStorage.setItem('rv_rental_history', JSON.stringify([]));
      localStorage.setItem('rv_payments', JSON.stringify([]));
      localStorage.setItem('rv_favorites', JSON.stringify([]));
      localStorage.setItem('rv_notifications', JSON.stringify(APP_ONBOARDING_NOTIFICATIONS));

      showToast(
        'success',
        language === 'te'
          ? `నమోదు విజయవంతమైంది! మీ రైతు ID: ${registeredId}. దయచేసి లాగిన్ చేయండి.`
          : `Registration successful! Your User ID: ${registeredId}. Please login with your credentials.`
      );

      // Prefill login credentials and switch to Login page
      if (normalizedEmail) {
        setLoginEmail(normalizedEmail);
      }
      if (cleanPhone) {
        setLoginPhone(cleanPhone);
      }
      setLoginPassword('');
      setScreen('login');
      setAlreadyRegisteredError(false);
      setUnregisteredError(false);

    } catch (err: any) {
      console.error("Signup error:", err);
      showToast('error', language === 'te' ? 'నమోదు లోపం సంభవించింది.' : 'Registration failed. Please try again.');
    } finally {
      setIsAuthLoading(false);
    }
  };

  // 1. Request Password Reset OTP
  const handleForgotSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const target = forgotEmail.trim().toLowerCase();
    if (!target || !target.includes('@')) {
      showToast('error', language === 'te' ? 'దయచేసి సరైన రిజిస్టర్డ్ ఈమెయిల్ అడ్రస్ నమోదు చేయండి.' : 'Please enter a valid registered email address.');
      return;
    }

    setIsAuthLoading(true);
    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: target })
      });

      const data = await res.json();

      if (res.status === 404) {
        showToast('error', language === 'te' ? 'ఈ ఈమెయిల్ అడ్రస్ తో ఏ ఖాతా కనుగొనబడలేదు.' : 'No account found with this email address.');
        return;
      }

      if (res.status === 429) {
        showToast('error', language === 'te' ? 'చాలా సార్లు అభ్యర్థించారు. దయచేసి కొన్ని నిమిషాలు వేచి ఉండండి.' : 'Too many OTP requests. Please wait a few minutes before trying again.');
        return;
      }

      if (!res.ok) {
        showToast('error', data.error || (language === 'te' ? 'OTP పంపడం విఫలమైంది.' : 'Failed to send OTP. Please try again.'));
        return;
      }

      showToast('success', language === 'te' 
        ? 'మీ రిజిస్టర్డ్ ఈమెయిల్ కు 6-అంకెల OTP సంకేతం పంపబడింది.' 
        : 'OTP has been sent to your registered email address.'
      );
      setResendCooldown(60);
      setOtpInput('');
      setScreen('otp');
    } catch (err: any) {
      console.error("Forgot password request error:", err);
      showToast('error', language === 'te' ? 'సర్వర్ లోపం సంభవించింది.' : 'Server connection failed. Please try again.');
    } finally {
      setIsAuthLoading(false);
    }
  };

  // 2. Resend OTP
  const handleResendOtp = async () => {
    if (resendCooldown > 0 || isAuthLoading) return;
    setIsAuthLoading(true);
    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: forgotEmail.trim().toLowerCase() })
      });
      const data = await res.json();
      if (res.ok) {
        setResendCooldown(60);
        showToast('success', language === 'te' ? 'కొత్త OTP విజయవంతంగా పంపబడింది.' : 'New OTP has been sent successfully.');
      } else {
        showToast('error', data.error || 'Failed to resend OTP.');
      }
    } catch (err) {
      showToast('error', 'Network error.');
    } finally {
      setIsAuthLoading(false);
    }
  };

  // 3. Verify OTP
  const handleVerifyOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanOtp = otpInput.replace(/\D/g, '');
    if (!cleanOtp || cleanOtp.length < 6) {
      showToast('error', language === 'te' ? 'దయచేసి 6-అంకెల OTP సంకేతాన్ని నమోదు చేయండి.' : 'Please enter the 6-digit OTP code.');
      return;
    }

    setIsAuthLoading(true);
    try {
      const res = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: forgotEmail.trim().toLowerCase(),
          otp: cleanOtp
        })
      });

      const data = await res.json();

      if (!res.ok) {
        if (data.error && data.error.toLowerCase().includes('expired')) {
          showToast('error', language === 'te' ? 'OTP గడువు ముగిసింది. దయచేసి కొత్త OTP అభ్యర్థించండి.' : 'OTP has expired. Please request a new OTP.');
        } else {
          showToast('error', language === 'te' ? 'చెల్లని OTP. దయచేసి మళ్ళీ ప్రయత్నించండి.' : 'Invalid OTP. Please try again.');
        }
        return;
      }

      setResetToken(data.resetToken);
      showToast('success', language === 'te' 
        ? 'OTP ధృవీకరణ విజయవంతమైంది. కొత్త పాస్‌వర్డ్ సెట్ చేసుకోండి.' 
        : 'OTP verified successfully. Please set your new password.'
      );
      setResetNewPassword('');
      setResetConfirmPassword('');
      setScreen('reset-password');
    } catch (err: any) {
      console.error("Verify OTP error:", err);
      showToast('error', language === 'te' ? 'OTP ధృవీకరణ విఫలమైంది.' : 'OTP verification failed. Please try again.');
    } finally {
      setIsAuthLoading(false);
    }
  };

  // 4. Reset Password
  const handleResetPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetNewPassword || resetNewPassword.length < 6) {
      showToast('error', language === 'te' ? 'పాస్‌వర్డ్ కనీసం 6 అక్షరాలు ఉండాలి.' : 'Password must be at least 6 characters.');
      return;
    }
    if (resetNewPassword !== resetConfirmPassword) {
      showToast('error', language === 'te' ? 'పాస్‌వర్డ్‌లు సరిపోలడం లేదు.' : 'Passwords do not match.');
      return;
    }

    setIsAuthLoading(true);
    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: forgotEmail.trim().toLowerCase(),
          resetToken: resetToken,
          newPassword: resetNewPassword
        })
      });

      const data = await res.json();

      if (!res.ok) {
        showToast('error', data.error || (language === 'te' ? 'పాస్‌వర్డ్ రీసెట్ విఫలమైంది.' : 'Password reset failed. Please restart the process.'));
        return;
      }

      showToast('success', language === 'te'
        ? 'పాస్‌వర్డ్ రీసెట్ విజయవంతమైంది. దయచేసి మీ కొత్త పాస్‌వర్డ్‌తో లాగిన్ అవ్వండి.'
        : 'Password reset successful. Please login with your new password.'
      );

      setLoginEmail(forgotEmail.trim().toLowerCase());
      setLoginPassword('');
      setOtpInput('');
      setResetToken('');
      setResetNewPassword('');
      setResetConfirmPassword('');
      setScreen('login');
    } catch (err: any) {
      console.error("Reset password error:", err);
      showToast('error', language === 'te' ? 'పాస్‌వర్డ్ రీసెట్ విఫలమైంది.' : 'Failed to reset password. Please try again.');
    } finally {
      setIsAuthLoading(false);
    }
  };

  // Translations object
  const t = {
    te: {
      tagline: 'సహకార వ్యవసాయ పరికరాల పంపకం వేదిక',
      back: 'వెనుకకు',
      or: 'లేదా',
      mandatory: 'కచ్చితంగా నింపాలి *',
      
      // Login screen
      loginTitle: 'ఈ రైతు వేదిక లాగిన్',
      loginSubtitle: 'మీ ఖాతాకు లాగిన్ అయి వ్యవసాయ యంత్రాలను సులభంగా అద్దెకు పొందండి',
      phoneLabel: 'మొబైల్ ఫోన్ నెంబర్',
      passwordLabel: 'రహస్య కోడ్ (పాస్‌వర్డ్)',
      forgotLink: 'పాస్‌వర్డ్ మర్చిపోయారా?',
      loginBtn: 'లాగిన్ చేయండి',
      loginOtpBtn: '📱 OTP ద్వారా లాగిన్ అవ్వండి',
      noAccount: 'మీకు అకౌంట్ లేదా?',
      signupLink: 'కొత్త ఖాతా సృష్టించండి',
      quickDemo: 'ఖాతా లేకపోతే డెమో ద్వారా లాగిన్ అవ్వడానికి క్రింది వివరాలు ఉపయోగించండి:',
      quickDemoCredential: 'ఫోన్: 9866012345 / పాస్‌వర్డ్: 123456',

      // Login OTP screen
      loginOtpTitle: 'మొబైల్ OTP లాగిన్ ధృవీకరణ',
      loginOtpSubtitle: 'మీ మొబైల్ నంబరుకు పంపబడిన 4 అంకెల OTP ని నమోదు చేయండి',
      verifyLoginBtn: 'లాగిన్ ధృవీకరించు',

      // Signup screen
      signupTitle: 'నూతన రైతు నమోదు',
      signupSubtitle: 'వేదికలో చేరండి, ఇతరుల యంత్రాలు తక్కువ ధరకు పొందండి లేదా అద్దెకు ఇవ్వండి',
      nameLabel: 'రైతు పూర్తి పేరు',
      locationLabel: 'జిల్లా',
      confirmPassLabel: 'పాస్‌వర్డ్ నిర్ధారించండి',
      avatarLabel: 'ప్రొఫైల్ చిత్రం ఎంచుకోండి',
      acceptTerms: 'నేను రైతు సేవా నిబంధనలు మరియు సహకార షరతులకు అంగీకరిస్తున్నాను',
      signupBtn: 'OTP పంపి నమోదు పూర్తి చేయండి',
      alreadyAccount: 'ఇప్పటికే ఖాతా ఉందా?',
      loginLink: 'ఇప్పుడే లాగిన్ అవ్వండి',

      // Signup OTP screen
      signupOtpTitle: 'రిజిస్ట్రేషన్ OTP ధృవీకరణ',
      signupOtpSubtitle: 'మీ మొబైల్ నంబరుకు పంపబడిన 4 అంకెల OTP ని నమోదు చేసి రిజిస్ట్రేషన్ పూర్తి చేయండి',
      verifySignupBtn: 'ఖాతాను ధృవీకరించు & పూర్తి చేయి',

      // Forgot Password screen
      forgotTitle: 'పాస్‌వర్డ్ పునరుద్ధరణ',
      forgotSubtitle: 'మీరు రిజిస్టర్ చేసుకున్న మొబైల్ నంబరును ఎంటర్ చేయండి. OTP పంపబడుతుంది',
      sendOtpBtn: 'OTP ని పంపండి',
      rememberPass: 'పాస్‌వర్డ్ గుర్తుంది కదా?',

      // OTP reset screen
      otpTitle: 'పాస్‌వర్డ్ రీసెట్ OTP ధృవీకరణ',
      otpSubtitle: 'మీ మొబైల్ నంబరుకు పంపబడిన 4 అంకెల OTP నమోదు చేసి కొత్త పాస్‌వర్డ్ అమర్చండి',
      otpInputLabel: '4-అంకెల OTP సంకేతం',
      newPassLabel: 'కొత్త పాస్‌వర్డ్ నమోదు చేయండి',
      confirmNewPassLabel: 'కొత్త పాస్‌వర్డ్ నిర్ధారించండి',
      resendOtp: 'మరోసారి OTP పంపించండి',
      verifyResetBtn: 'పాస్‌వర్డ్ నవీకరించు & లాగిన్ చేయి',
      otpHint: 'పైన పసుపు రంగు బాక్సులో చూపించిన OTP సంకేతం ఉపయోగించండి.'
    },
    en: {
      tagline: 'Cooperative Agricultural Machinery Sharing Portal',
      back: 'Back',
      or: 'or',
      mandatory: 'Required field *',

      // Login screen
      loginTitle: 'E-Raitu Vedika Portal',
      loginSubtitle: 'Log in to rent, list, and coordinate modern agritech machinery with neighbors',
      phoneLabel: 'Mobile Phone Number',
      passwordLabel: 'PIN / Password',
      forgotLink: 'Forgot Password?',
      loginBtn: 'Secure Sign In',
      loginOtpBtn: '📱 Log In via Mobile OTP',
      noAccount: "Don't have a cooperative account?",
      signupLink: 'Register New Farmer',
      quickDemo: 'Quick testing credentials (fully functional local database):',
      quickDemoCredential: 'Phone: 9866012345 / PIN: 123456',

      // Login OTP screen
      loginOtpTitle: 'Mobile OTP Login Verification',
      loginOtpSubtitle: 'Enter the 4-digit OTP code sent to your mobile phone number',
      verifyLoginBtn: 'Verify & Log In',

      // Signup screen
      signupTitle: 'Create Farmer Account',
      signupSubtitle: 'Join our cooperative network to share and book local equipment easily',
      nameLabel: 'Full Representative Name',
      locationLabel: 'Home District',
      confirmPassLabel: 'Confirm Password',
      avatarLabel: 'Choose your profile avatar style',
      acceptTerms: 'I agree to the cooperative terms of service and fair usage guidelines',
      signupBtn: 'Send OTP & Complete Registration',
      alreadyAccount: 'Already registered with e-Raitu?',
      loginLink: 'Sign In here',

      // Signup OTP screen
      signupOtpTitle: 'Registration OTP Verification',
      signupOtpSubtitle: 'Enter the 4-digit OTP code sent to complete your account registration',
      verifySignupBtn: 'Verify OTP & Complete Registration',

      // Forgot Password screen
      forgotTitle: 'Forgot Password',
      forgotSubtitle: 'Enter your registered mobile phone number. We will send a secure 4-digit OTP code',
      sendOtpBtn: 'Generate Verification OTP',
      rememberPass: 'Remember your PIN?',

      // OTP reset screen
      otpTitle: 'Password Reset OTP Verification',
      otpSubtitle: 'Complete verification with the dispatched code and configure your new PIN',
      otpInputLabel: '4-Digit Verification Code (OTP)',
      newPassLabel: 'Enter New Password',
      confirmNewPassLabel: 'Confirm New Password',
      resendOtp: 'Resend Verification Code',
      verifyResetBtn: 'Update Password & Access',
      otpHint: 'Please use the secure OTP code highlighted in the orange top bar.'
    }
  }[language];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between" id="auth-flow-container">
      {/* Interactive header bar for simple language/cancel navigation */}
      <div className="bg-white border-b border-gray-100 px-5 py-4 flex items-center justify-between shadow-xs">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-[#1b6d24]/10 flex items-center justify-center">
            <Leaf className="w-4.5 h-4.5 text-[#1b6d24]" />
          </div>
          <div>
            <span className="text-[10px] font-extrabold text-[#1b6d24] tracking-wider uppercase block">
              E-Raitu Vedika
            </span>
            <span className="text-[8px] text-gray-400 font-bold block leading-none">
              {language === 'te' ? 'రైతు భరోసా లాగిన్' : 'Cooperative Core Security'}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Language slide toggle switcher */}
          <button
            onClick={onLanguageToggle}
            className="bg-emerald-50 text-[#1b6d24] border border-[#1b6d24]/10 p-1.5 px-3 rounded-full flex items-center gap-1.5 active:scale-95 transition-all text-[10px] font-extrabold"
            id="btn-auth-lang-toggle"
          >
            <Globe className="w-3.5 h-3.5 text-[#1b6d24]" />
            <span className="uppercase">{language === 'te' ? 'English' : 'తెలుగు'}</span>
          </button>
          
          {onCancel && (
            <button
              onClick={onCancel}
              className="px-3 py-1.5 border border-gray-200 text-gray-500 rounded-lg text-[10px] font-bold hover:bg-gray-50"
            >
              {language === 'te' ? 'రద్దు' : 'Cancel'}
            </button>
          )}
        </div>
      </div>

      {/* Toasts and alerts */}
      <AnimatePresence mode="wait">
        {(errorText || successText) && (
          <div className="mx-4 mt-4 space-y-2">
            {errorText && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="bg-red-50 border border-red-200 rounded-xl p-3 flex items-center gap-2.5 text-xs text-red-800"
              >
                <ShieldAlert className="w-4 h-4 text-red-600 shrink-0" />
                <span className="font-bold">{errorText}</span>
              </motion.div>
            )}

            {successText && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="bg-green-50 border border-green-200 rounded-xl p-3 flex items-center gap-2.5 text-xs text-green-900"
              >
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span className="font-bold">{successText}</span>
              </motion.div>
            )}
          </div>
        )}
      </AnimatePresence>

      {/* Core slide layouts */}
      <div className="flex-1 flex items-center justify-center px-4 py-8 max-w-sm mx-auto w-full">
        <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-md w-full relative overflow-hidden">
          
          {/* Subtle decoration vector */}
          <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-[#1b6d24]/5 to-transparent rounded-full -mr-6 -mt-6"></div>

          {/* Top Navigation: Admin badge for Admin mode, Login/Register switcher for general users */}
          {userRole === 'admin' ? (
            <div className="flex justify-center mb-4">
              <div className="inline-flex items-center gap-1.5 bg-emerald-50 border border-emerald-200/60 px-4 py-1.5 rounded-full text-xs font-extrabold text-[#1b6d24] shadow-xs">
                <span>⚙️</span>
                <span>{language === 'te' ? 'అడ్మిన్ లాగిన్' : 'Admin Login'}</span>
              </div>
            </div>
          ) : (
            <div className="flex bg-slate-100 p-1 rounded-xl mb-5 text-xs font-bold gap-1 z-15 relative shadow-inner">
              <button
                type="button"
                onClick={() => setScreen('login')}
                className={`flex-1 py-1.5 px-1 rounded-lg text-center transition-all cursor-pointer ${
                  screen === 'login'
                    ? 'bg-white text-[#1b6d24] shadow-sm font-extrabold'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                {language === 'te' ? '🔐 లాగిన్' : '🔐 Login'}
              </button>
              <button
                type="button"
                onClick={() => setScreen('signup')}
                className={`flex-1 py-1.5 px-1 rounded-lg text-center transition-all cursor-pointer ${
                  screen === 'signup'
                    ? 'bg-white text-[#1b6d24] shadow-sm font-extrabold'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                {language === 'te' ? '📝 రిజిస్ట్రేషన్' : '📝 Register'}
              </button>
            </div>
          )}

          <AnimatePresence mode="wait">
            
            {/* 1. LOGIN SCREEN */}
            {screen === 'login' && (
              <motion.div
                key="login-screen"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.2 }}
                className="space-y-5"
              >
                <div className="text-center">
                  <span className="inline-block bg-[#1b6d24]/10 rounded-2xl p-3 text-[#1b6d24] mb-3">
                    <Leaf className="w-7 h-7 text-[#1b6d24]" />
                  </span>
                  <h2 className="text-xl font-extrabold text-gray-800 tracking-tight leading-normal">
                    {t.loginTitle}
                  </h2>
                  <p className="text-xs text-gray-400 font-medium leading-relaxed mt-1">
                    {t.loginSubtitle}
                  </p>
                </div>

                {/* Highly prominent language barrier breaker selection buttons */}
                <div className="bg-emerald-50/40 p-3 rounded-2xl border border-dashed border-emerald-100 space-y-2">
                  <p className="text-[9.5px] uppercase font-black text-emerald-800 text-center tracking-wider">
                    {language === 'te' ? '🌐 భాషా అవరోధం నివారణ - మీ ప్రాధాన్య భాషను ఎంచుకోండి' : '🌐 Select Preferred Language'}
                  </p>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => { if (language !== 'te') onLanguageToggle(); }}
                      className={`py-2 px-3 rounded-xl text-xs font-black transition-all ${
                        language === 'te' 
                          ? 'bg-[#1b6d24] text-white shadow-md scale-102' 
                          : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200'
                      }`}
                    >
                      తెలుగు (Telugu)
                    </button>
                    <button
                      type="button"
                      onClick={() => { if (language !== 'en') onLanguageToggle(); }}
                      className={`py-2 px-3 rounded-xl text-xs font-black transition-all ${
                        language === 'en' 
                          ? 'bg-[#1b6d24] text-white shadow-md scale-102' 
                          : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200'
                      }`}
                    >
                      English
                    </button>
                  </div>
                </div>

                <form onSubmit={handleLoginSubmit} className="space-y-4">
                  {userRole === 'admin' ? (
                    /* Minimalist security admin validation card */
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="p-5 bg-red-50/70 border border-red-200 rounded-2xl space-y-4 shadow-sm text-center"
                    >
                      <div className="flex flex-col items-center gap-1.5 text-red-900">
                        <div className="w-11 h-11 rounded-full bg-red-100 flex items-center justify-center mb-1">
                          <Lock className="w-6 h-6 text-red-700 animate-pulse" />
                        </div>
                        <label className="text-xs font-black uppercase tracking-wider block">
                          {language === 'te' ? '🔑 అడ్మినిస్ట్రేటర్ పిన్ (Admin Access PIN) *' : '🔑 Administrative Access PIN *'}
                        </label>
                      </div>
                      <input
                        type="password"
                        value={adminPin}
                        onChange={(e) => setAdminPin(e.target.value)}
                        placeholder="•••••••"
                        maxLength={10}
                        required
                        className="w-full px-4 py-3 bg-white border border-red-300 rounded-xl text-center text-lg font-mono font-black text-red-900 tracking-widest focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all shadow-inner"
                        id="input-login-admin-pin"
                      />
                      <p className="text-[10.5px] text-red-700 font-bold leading-normal">
                        {language === 'te' 
                          ? 'వ్యవస్థను నిర్వహించడానికి అధికారిక పిన్ నమోదు చేయండి. (డిఫాల్ట్ పిన్: 1234567)' 
                          : "Enter the system control PIN to gain management permissions. (Default PIN: 1234567)"}
                      </p>
                    </motion.div>
                  ) : (
                    /* General User login fields */
                    <>
                      {/* Name field as first form element */}
                      <div>
                        <label className="text-[10px] text-emerald-700 font-extrabold uppercase tracking-wider block mb-1">
                          {language === 'te' ? '👤 మీ పేరు (Your Name) *' : '👤 Your Name (Telugu / English) *'}
                        </label>
                        <div className="relative">
                          <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400 pointer-events-none">
                            <User className="w-4 h-4 text-emerald-600" />
                          </span>
                          <input
                            type="text"
                            value={loginName}
                            onChange={(e) => setLoginName(e.target.value)}
                            placeholder={language === 'te' ? "ఉదా: రామకృష్ణ ప్రసాద్" : "e.g. Ramakrishna Prasad"}
                            className="w-full pl-9 pr-3 py-2.5 bg-[#fbfdfa] border border-gray-200 rounded-xl text-xs font-black text-slate-800 focus:outline-none focus:border-[#1b6d24] focus:bg-white transition"
                            required
                            id="input-login-name-field"
                          />
                        </div>
                      </div>

                      {/* Gender selection field */}
                      <div>
                        <label className="text-[10px] text-emerald-700 font-extrabold uppercase tracking-wider block mb-1">
                          {language === 'te' ? '🚻 లింగం (Select Gender) *' : '🚻 Select Gender *'}
                        </label>
                        <div className="grid grid-cols-2 gap-2">
                          <button
                            type="button"
                            onClick={() => setLoginGender('male')}
                            className={`py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer border ${
                              loginGender === 'male'
                                ? 'bg-emerald-50 text-emerald-800 border-emerald-500 font-black'
                                : 'bg-[#fbfdfa] text-slate-500 border-slate-200 hover:bg-slate-50'
                            }`}
                            id="btn-gender-male"
                          >
                            <span>👨</span>
                            <span>{language === 'te' ? 'పురుషుడు (Male)' : 'Male'}</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => setLoginGender('female')}
                            className={`py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer border ${
                              loginGender === 'female'
                                ? 'bg-emerald-50 text-emerald-800 border-emerald-500 font-black'
                                : 'bg-[#fbfdfa] text-slate-500 border-slate-200 hover:bg-slate-50'
                            }`}
                            id="btn-gender-female"
                          >
                            <span>👩</span>
                            <span>{language === 'te' ? 'స్త్రీ (Female)' : 'Female'}</span>
                          </button>
                        </div>
                      </div>

                      <div>
                        <label className="text-[10px] text-emerald-700 font-extrabold uppercase tracking-wider block mb-1">
                          {language === 'te' ? 'వినియోగదారుడి పాత్ర (Select Role)' : 'Choose Account Type / Role'}
                        </label>
                        <select
                          value={userRole}
                          onChange={(e) => setUserRole(e.target.value as any)}
                          className="w-full px-3 py-2.5 bg-emerald-50/50 border border-emerald-250 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:border-[#1b6d24] focus:bg-white transition cursor-pointer"
                          id="select-login-role"
                        >
                          <option value="farmer">{language === 'te' ? '👨‍🌾 రైతు (Farmer Tenant)' : '👨‍🌾 Farmer (Tenant)'}</option>
                          <option value="owner">{language === 'te' ? '🚜 యంత్ర యజమాని (Equipment Owner)' : '🚜 Equipment Owner'}</option>
                        </select>
                      </div>


                      {userRole === 'owner' && (
                        <motion.div 
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="space-y-3 p-3 bg-amber-50/20 rounded-2xl border border-amber-150"
                        >
                          <div>
                            <label className="text-[9px] text-amber-800 font-extrabold uppercase tracking-wider block mb-1">
                              {language === 'te' ? '🚜 ప్రధాన యంత్ర వర్గం (Machinery Segment)' : '🚜 Primary Machinery Segment'}
                            </label>
                            <select
                              value={ownerCategory}
                              onChange={(e) => setOwnerCategory(e.target.value)}
                              className="w-full px-2.5 py-2 bg-white border border-amber-200 rounded-lg text-xs font-bold text-amber-950 focus:outline-none focus:border-amber-600"
                              id="select-login-owner-category"
                            >
                              <option value="heavy">{language === 'te' ? 'భారీ యంత్రాలు (Tractors & Rotavators)' : 'Heavy Duty (Tractors, Tillers)'}</option>
                              <option value="drones">{language === 'te' ? 'డ్రోన్లు & స్ప్రేయర్లు (Precision Drones)' : 'Modern Drone & Spray Tech'}</option>
                              <option value="tools">{language === 'te' ? 'సన్నకారు పరికరాలు (Weeders & Cutters)' : 'Handheld & Horticultural Tools'}</option>
                            </select>
                          </div>
                        </motion.div>
                      )}

                      <div className="grid grid-cols-3 gap-1.5 bg-emerald-50/20 p-2 rounded-xl border border-emerald-500/10">
                        <div>
                          <label className="text-[8px] text-[#1b6d24] font-extrabold uppercase tracking-wider block mb-0.5">
                            {language === 'te' ? 'జిల్లా (District)' : 'District'}
                          </label>
                          <select
                            value={selectedLoginDistrict}
                            onChange={(e) => setSelectedLoginDistrict(e.target.value)}
                            className="w-full px-1.5 py-1.5 bg-white border border-emerald-100 rounded-lg text-[10px] font-bold text-gray-800 focus:outline-none focus:border-[#1b6d24] cursor-pointer"
                            id="select-login-district-dropdown"
                          >
                            {DISTRICTS.map((dist) => (
                              <option key={dist.value} value={`${dist.labelEn} (${dist.value})`}>
                                {`${dist.labelEn} (${dist.value})`}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="text-[8px] text-[#1b6d24] font-extrabold uppercase tracking-wider block mb-0.5">
                            {language === 'te' ? 'మండలం / పట్టణం' : 'Town / Mandal'}
                          </label>
                          <select
                            value={selectedLoginMandal}
                            onChange={(e) => setSelectedLoginMandal(e.target.value)}
                            className="w-full px-1.5 py-1.5 bg-white border border-emerald-100 rounded-lg text-[10px] font-bold text-gray-800 focus:outline-none focus:border-[#1b6d24] cursor-pointer"
                            id="select-login-mandal-dropdown"
                          >
                            {(() => {
                              const dKey = getDistrictKey(selectedLoginDistrict);
                              const distData = AP_LOCATION_DATABASE.districts[dKey];
                              const places = distData ? (distData.places || []) : [];
                              return (places.length > 0 ? places : ['Default Place']).map((p) => (
                                <option key={p} value={p}>
                                  {p}
                                </option>
                              ));
                            })()}
                          </select>
                        </div>

                        <div>
                          <label className="text-[8px] text-[#1b6d24] font-extrabold uppercase tracking-wider block mb-0.5">
                            {language === 'te' ? 'గ్రామం (Village)' : 'Village'}
                          </label>
                          <select
                            value={selectedLoginVillage}
                            onChange={(e) => setSelectedLoginVillage(e.target.value)}
                            className="w-full px-1.5 py-1.5 bg-white border border-emerald-100 rounded-lg text-[10px] font-bold text-gray-800 focus:outline-none focus:border-[#1b6d24] cursor-pointer"
                            id="select-login-village-dropdown"
                            required
                          >
                            {(() => {
                              const dKey = getDistrictKey(selectedLoginDistrict);
                              const villages = getVillagesForDistrictAndMandal(dKey, selectedLoginMandal);
                              return villages.map((v) => (
                                <option key={v} value={v}>
                                  {v}
                                </option>
                              ));
                            })()}
                          </select>
                        </div>
                      </div>

                      <div className="space-y-3">
                        <div>
                          <label className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block mb-1">
                            {t.phoneLabel}
                          </label>
                          <div className="relative">
                            <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">
                              <Phone className="w-4 h-4 text-gray-300" />
                            </span>
                            <input
                              type="tel"
                              value={loginPhone}
                              onChange={(e) => {
                                setLoginPhone(e.target.value);
                                if (unregisteredError) setUnregisteredError(false);
                              }}
                              placeholder="e.g. 9866012345"
                              maxLength={13}
                              className="w-full pl-9 pr-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold text-gray-800 focus:outline-none focus:border-[#1b6d24] focus:bg-white transition"
                              id="input-login-phone"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block mb-1">
                            {language === 'te' ? '📧 ఇమెయిల్ అడ్రస్ (Email Address)' : '📧 Email Address'}
                          </label>
                          <div className="relative">
                            <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">
                              <Mail className="w-4 h-4 text-emerald-600" />
                            </span>
                            <input
                              type="email"
                              value={loginEmail}
                              onChange={(e) => {
                                setLoginEmail(e.target.value);
                                if (unregisteredError) setUnregisteredError(false);
                              }}
                              placeholder="e.g. farmer@gmail.com"
                              className="w-full pl-9 pr-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold text-gray-800 focus:outline-none focus:border-[#1b6d24] focus:bg-white transition"
                              id="input-login-email"
                            />
                          </div>
                        </div>
                      </div>

                      <div>
                        <div className="flex justify-between items-center mb-1">
                          <label className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">
                            {t.passwordLabel}
                          </label>
                          <button
                            type="button"
                            onClick={() => setIsForgotModalOpen(true)}
                            className="text-[10px] text-emerald-600 font-extrabold hover:underline cursor-pointer"
                            id="btn-login-forgot"
                          >
                            {t.forgotLink}
                          </button>
                        </div>
                        <div className="relative">
                          <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">
                            <Lock className="w-4 h-4 text-gray-300" />
                          </span>
                          <input
                            type={showLoginPassword ? 'text' : 'password'}
                            value={loginPassword}
                            onChange={(e) => {
                              setLoginPassword(e.target.value);
                              if (unregisteredError) setUnregisteredError(false);
                            }}
                            placeholder="••••••"
                            className="w-full pl-9 pr-10 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-mono text-gray-800 focus:outline-none focus:border-[#1b6d24] focus:bg-white transition"
                            required
                            id="input-login-pass"
                          />
                          <button
                            type="button"
                            onClick={() => setShowLoginPassword(!showLoginPassword)}
                            className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                          >
                            {showLoginPassword ? <EyeOff className="w-4 h-4 text-gray-400" /> : <Eye className="w-4 h-4 text-gray-400" />}
                          </button>
                        </div>
                      </div>
                    </>
                  )}

                  {unregisteredError && (
                    <div className="p-3 bg-amber-50 border-2 border-amber-300 rounded-xl space-y-2 text-center text-xs text-amber-950 font-bold shadow-sm">
                      <p>{language === 'te' ? '⚠️ ఖాతా కనుగొనబడలేదు. దయచేసి ముందుగా నమోదు చేసుకోండి.' : '⚠️ Account not found. Please register first.'}</p>
                      <button
                        type="button"
                        onClick={() => {
                          setUnregisteredError(false);
                          setScreen('signup');
                        }}
                        className="w-full py-2 bg-[#1b6d24] text-white rounded-lg font-extrabold hover:bg-[#15541b] transition shadow-xs flex items-center justify-center gap-1.5"
                        id="btn-login-prompt-create-account"
                      >
                        <span>{language === 'te' ? '➕ క్రొత్త ఖాతాను నమోదు చేసుకోండి (Create Account)' : '➕ Create New Account'}</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={isAuthLoading}
                    className="w-full py-3 bg-[#1b6d24] text-white rounded-xl text-xs font-extrabold hover:bg-[#15541b] active:scale-98 transition flex items-center justify-center gap-1.5 cursor-pointer shadow-sm shadow-[#1b6d24]/10 mt-2 disabled:opacity-60"
                    id="btn-login-submit"
                  >
                    {isAuthLoading ? (
                      <Loader2 className="w-4 h-4 animate-spin text-white" />
                    ) : (
                      <>
                        <span>{userRole === 'admin' ? (language === 'te' ? '🔐 ధృవీకరించు & లాగిన్' : '🔐 Verify & Login') : t.loginBtn}</span>
                        <ArrowRight className="w-4 h-4 text-white" />
                      </>
                    )}
                  </button>
                </form>

                {userRole === 'admin' && (
                  /* Professional admin access notice */
                  <div className="p-3 bg-red-50/50 border border-red-100 rounded-xl text-[10px] text-red-800 font-medium leading-normal text-center">
                    <p className="font-extrabold text-red-900 mb-0.5 uppercase tracking-wide">
                      🔒 {language === 'te' ? 'అధికారిక లాగిన్ మాత్రమే' : 'Authorized Access Only'}
                    </p>
                    <p className="text-red-700">
                      {language === 'te' 
                        ? 'భద్రతా అనుగుణంగా సిస్టమ్ అడ్మినిస్ట్రేటర్ అనుమతి పొందేందుకు మీ ప్రత్యేక పిన్ ఉపయోగించండి.' 
                        : 'Please use your secure verification credentials to gain organizational entry.'}
                    </p>
                  </div>
                )}

                {userRole !== 'admin' && (
                  <div className="text-center border-t border-gray-100 pt-3 text-xs">
                    <span className="text-gray-400 font-semibold">{t.noAccount} </span>
                    <button
                      onClick={() => setScreen('signup')}
                      className="text-emerald-700 font-extrabold hover:underline"
                      id="btn-login-to-register"
                    >
                      {t.signupLink}
                    </button>
                  </div>
                )}
              </motion.div>
            )}

            {/* 2. SIGNUP SCREEN */}
            {screen === 'signup' && (
              <motion.div
                key="signup-screen"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
                className="space-y-4"
              >
                <div className="text-center">
                  <span className="inline-block bg-[#1b6d24]/10 rounded-2xl p-2.5 text-[#1b6d24] mb-2 leading-none">
                    <User className="w-6 h-6 text-[#1b6d24]" />
                  </span>
                  <h2 className="text-lg font-extrabold text-gray-800 tracking-tight leading-normal">
                    {t.signupTitle}
                  </h2>
                  <p className="text-[10px] text-gray-400 font-medium leading-normal mt-0.5">
                    {t.signupSubtitle}
                  </p>
                </div>

                <form onSubmit={handleSignupSubmit} className="space-y-3">
                  <div>
                    <label className="text-[9px] text-emerald-700 font-extrabold uppercase tracking-wider block mb-0.5">
                      {language === 'te' ? 'మీ సభ్యత్వ పాత్ర (Choose Account Role)' : 'Registering Account Role Type'}
                    </label>
                    <select
                      value={userRole}
                      onChange={(e) => setUserRole(e.target.value as any)}
                      className="w-full px-3 py-2 bg-emerald-50/50 border border-emerald-250 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:border-[#1b6d24] focus:bg-white transition cursor-pointer"
                      id="select-signup-role"
                    >
                      <option value="farmer">{language === 'te' ? '👨‍🌾 రైతు (Farmer Tenant)' : '👨‍🌾 Farmer (Tenant)'}</option>
                      <option value="owner">{language === 'te' ? '🚜 యంత్ర యజమాని (Equipment Owner)' : '🚜 Equipment Owner'}</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-[9px] text-gray-400 font-bold uppercase tracking-wider block mb-0.5">
                      {t.nameLabel} <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">
                        <User className="w-3.5 h-3.5 text-gray-300" />
                      </span>
                      <input
                        type="text"
                        value={signupName}
                        onChange={(e) => setSignupName(e.target.value)}
                        placeholder="e.g. రాఘవ రెడ్డి"
                        className="w-full pl-8 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold text-gray-800 focus:outline-none focus:border-[#1b6d24] focus:bg-white transition"
                        required
                        id="input-signup-name"
                      />
                    </div>
                  </div>

                  <div className="space-y-2.5">
                    <div>
                      <label className="text-[9px] text-gray-400 font-bold uppercase tracking-wider block mb-0.5">
                        {t.phoneLabel} <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">
                          <Phone className="w-3.5 h-3.5 text-gray-400" />
                        </span>
                        <input
                          type="tel"
                          value={signupPhone}
                          onChange={(e) => {
                            setSignupPhone(e.target.value.replaceAll(/[^0-9]/g, ''));
                            if (alreadyRegisteredError) setAlreadyRegisteredError(false);
                          }}
                          placeholder="e.g. 9154098765"
                          maxLength={10}
                          className="w-full pl-9 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold text-gray-800 focus:outline-none focus:border-[#1b6d24] focus:bg-white transition"
                          required
                          id="input-signup-phone"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-[9px] text-gray-400 font-bold uppercase tracking-wider block mb-0.5">
                        {language === 'te' ? 'ఇమెయిల్ అడ్రస్ (Email)' : 'Email Address'}
                      </label>
                      <div className="relative">
                        <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">
                          <Mail className="w-3.5 h-3.5 text-emerald-600" />
                        </span>
                        <input
                          type="email"
                          value={signupEmail}
                          onChange={(e) => {
                            setSignupEmail(e.target.value);
                            if (alreadyRegisteredError) setAlreadyRegisteredError(false);
                          }}
                          placeholder="e.g. farmer@gmail.com"
                          className="w-full pl-9 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold text-gray-800 focus:outline-none focus:border-[#1b6d24] focus:bg-white transition"
                          id="input-signup-email"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-[9px] text-gray-400 font-bold uppercase tracking-wider block mb-0.5">
                        {language === 'te' ? 'రాష్ట్రం' : 'State'}
                      </label>
                      <div className="relative">
                        <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">
                          <Building className="w-3.5 h-3.5 text-emerald-600" />
                        </span>
                        <select
                          disabled
                          value={selectedState}
                          className="w-full pl-9 pr-3 py-2 bg-emerald-50/40 border border-emerald-100 rounded-xl text-xs font-bold text-emerald-800 focus:outline-none cursor-not-allowed"
                          id="select-signup-state"
                        >
                          <option value={selectedState}>{selectedState}</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Cascade Dropdowns: District, City/Mandal, Village */}
                  <div className="grid grid-cols-3 gap-1.5 bg-emerald-50/20 p-2 rounded-xl border border-emerald-500/10">
                    <div>
                      <label className="text-[8px] text-[#1b6d24] font-extrabold uppercase tracking-wider block mb-0.5">
                        {language === 'te' ? 'జిల్లా' : 'District'}
                      </label>
                      <select
                        value={selectedDistrict}
                        onChange={(e) => setSelectedDistrict(e.target.value)}
                        className="w-full px-1.5 py-1.5 bg-white border border-emerald-100 rounded-lg text-[11px] font-bold text-gray-800 focus:outline-none focus:border-[#1b6d24] cursor-pointer"
                        id="select-cascading-district"
                      >
                        {AP_DISTRICTS_ENTRIES.map((dist) => (
                          <option key={dist} value={dist}>
                            {dist}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="text-[8px] text-[#1b6d24] font-extrabold uppercase tracking-wider block mb-0.5">
                        {language === 'te' ? 'పట్టణం / మండలం' : 'Town / Mandal'}
                      </label>
                      <select
                        value={selectedCityMandal}
                        onChange={(e) => setSelectedCityMandal(e.target.value)}
                        className="w-full px-1.5 py-1.5 bg-white border border-emerald-100 rounded-lg text-[11px] font-bold text-gray-800 focus:outline-none focus:border-[#1b6d24] cursor-pointer"
                        id="select-cascading-city-mandal"
                      >
                        {(AP_LOCATION_DATABASE.districts[selectedDistrict]?.places || ['Default Place']).map((p) => (
                          <option key={p} value={p}>
                            {formatLocationName(p, language)}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="text-[8px] text-[#1b6d24] font-extrabold uppercase tracking-wider block mb-0.5">
                        {language === 'te' ? 'గ్రామం' : 'Village'}
                      </label>
                      <select
                        value={selectedVillage}
                        onChange={(e) => setSelectedVillage(e.target.value)}
                        className="w-full px-1.5 py-1.5 bg-white border border-emerald-100 rounded-lg text-[11px] font-bold text-gray-800 focus:outline-none focus:border-[#1b6d24] cursor-pointer"
                        id="select-cascading-village"
                        required
                      >
                        {getVillagesForDistrictAndMandal(selectedDistrict, selectedCityMandal).map((v) => (
                          <option key={v} value={v}>
                            {formatLocationName(v, language)}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Owner-specific Aadhaar and documentation controls if role === owner */}
                  {userRole === 'owner' && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className="p-2.5 bg-amber-50/50 rounded-xl border border-amber-200 space-y-2.5 overflow-hidden"
                    >
                      <div className="flex items-center gap-1.5 text-amber-800">
                        <ShieldCheck className="w-4 h-4 text-amber-600" />
                        <span className="text-[10px] font-extrabold uppercase tracking-wider">
                          {language === 'te' ? 'యజమాని ధృవీకరణ వివరాలు' : 'Owner Identity Verification Upload'}
                        </span>
                      </div>

                      <div>
                        <label className="text-[9px] text-amber-900 font-bold block mb-0.5">
                          {language === 'te' ? 'ఆధార్ నంబర్' : 'Aadhaar Number'} <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={aadhaarNumber}
                          onChange={(e) => setAadhaarNumber(e.target.value.replaceAll(/[^0-9]/g, ''))}
                          placeholder={language === 'te' ? '12 అంకెల ఆధార్ నంబర్' : '12-digit Aadhaar UIDAI'}
                          maxLength={12}
                          className="w-full px-3 py-1.5 bg-white border border-amber-200 rounded-lg text-xs font-bold text-gray-850 focus:outline-none focus:border-amber-600"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        {/* Proof of ownership wrapper */}
                        <div>
                          <label className="text-[8px] text-amber-900 font-bold block mb-0.5 leading-tight">
                            {language === 'te' ? 'పరికర యాజమాన్య రుజువు' : 'Equipment Proof of Ownership'} <span className="text-red-500">*</span>
                          </label>
                          <label 
                            htmlFor="input-file-proof-ownership"
                            className={`p-2 border-2 border-dashed rounded-lg flex flex-col items-center justify-center cursor-pointer transition ${
                              proofFileAttached ? 'border-emerald-500 bg-emerald-500/10 text-emerald-800' : 'border-amber-200 bg-white hover:bg-amber-50/30 text-amber-600'
                            }`}
                          >
                            <input 
                              type="file" 
                              id="input-file-proof-ownership" 
                              accept="image/*,.pdf,.doc,.docx" 
                              className="hidden"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) {
                                  setProofFileAttached(true);
                                  setProofFileName(file.name);
                                }
                              }}
                            />
                            {proofFileAttached ? (
                              <>
                                <FileCheck className="w-4 h-4 text-emerald-600" />
                                <span className="text-[9px] font-bold mt-1 text-center truncate w-full">{proofFileName}</span>
                              </>
                            ) : (
                              <>
                                <Upload className="w-4 h-4 text-amber-400" />
                                <span className="text-[8px] font-bold mt-0.5 text-center leading-tight">
                                  {language === 'te' ? 'ఫైల్ ఎంచుకోండి' : 'Attach File'}
                                </span>
                              </>
                            )}
                          </label>
                        </div>

                        {/* ID Verification file */}
                        <div>
                          <label className="text-[8px] text-amber-900 font-bold block mb-0.5 leading-tight">
                            {language === 'te' ? 'ఐడి ధృవీకరణ కార్డ్' : 'National ID Verification Card File'} <span className="text-red-500">*</span>
                          </label>
                          <label 
                            htmlFor="input-file-national-id"
                            className={`p-2 border-2 border-dashed rounded-lg flex flex-col items-center justify-center cursor-pointer transition ${
                              idFileAttached ? 'border-emerald-500 bg-emerald-500/10 text-emerald-800' : 'border-amber-200 bg-white hover:bg-amber-50/30 text-amber-600'
                            }`}
                          >
                            <input 
                              type="file" 
                              id="input-file-national-id" 
                              accept="image/*,.pdf,.doc,.docx" 
                              className="hidden"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) {
                                  setIdFileAttached(true);
                                  setIdFileName(file.name);
                                }
                              }}
                            />
                            {idFileAttached ? (
                              <>
                                <FileCheck className="w-4 h-4 text-emerald-600" />
                                <span className="text-[9px] font-bold mt-1 text-center truncate w-full">{idFileName}</span>
                              </>
                            ) : (
                              <>
                                <Upload className="w-4 h-4 text-amber-400" />
                                <span className="text-[8px] font-bold mt-0.5 text-center leading-tight">
                                  {language === 'te' ? 'ఫైల్ ఎంచుకోండి' : 'Attach File'}
                                </span>
                              </>
                            )}
                          </label>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[9px] text-gray-400 font-bold uppercase tracking-wider block mb-0.5">
                        {t.passwordLabel}
                      </label>
                      <input
                        type="password"
                        value={signupPassword}
                        onChange={(e) => setSignupPassword(e.target.value)}
                        placeholder="••••"
                        className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-mono text-gray-800 focus:outline-none focus:border-[#1b6d24] focus:bg-white transition"
                        required
                        id="input-signup-pass"
                      />
                    </div>

                    <div>
                      <label className="text-[9px] text-gray-400 font-bold uppercase tracking-wider block mb-0.5">
                        {t.confirmPassLabel}
                      </label>
                      <input
                        type="password"
                        value={signupConfirmPassword}
                        onChange={(e) => setSignupConfirmPassword(e.target.value)}
                        placeholder="••••"
                        className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-mono text-gray-800 focus:outline-none focus:border-[#1b6d24] focus:bg-white transition"
                        required
                        id="input-signup-confirm-pass"
                      />
                    </div>
                  </div>

                  <label className="flex items-start gap-2 mt-1 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={agreeTerms}
                      onChange={(e) => setAgreeTerms(e.target.checked)}
                      className="mt-0.5 accent-emerald-700 cursor-pointer text-emerald-600"
                    />
                    <span className="text-[9px] text-gray-400 font-bold leading-normal">
                      {t.acceptTerms}
                    </span>
                  </label>

                  {alreadyRegisteredError && (
                    <div className="p-3 bg-amber-50 border-2 border-amber-300 rounded-xl space-y-2 text-center text-xs text-amber-950 font-bold shadow-sm mt-2">
                      <p>{language === 'te' ? '⚠️ ఈ ఈమెయిల్ లేదా ఫోన్ నంబర్‌తో ఇప్పటికే ఖాతా ఉంది. దయచేసి లాగిన్ చేయండి.' : '⚠️ An account with this email or phone number already exists. Please login.'}</p>
                      <button
                        type="button"
                        onClick={() => {
                          setAlreadyRegisteredError(false);
                          setScreen('login');
                        }}
                        className="w-full py-2 bg-[#1b6d24] text-white rounded-lg font-extrabold hover:bg-[#15541b] transition shadow-xs flex items-center justify-center gap-1.5 cursor-pointer"
                        id="btn-signup-prompt-login"
                      >
                        <span>{language === 'te' ? '🔑 లాగిన్ పేజీకి వెళ్ళండి (Login)' : '🔑 Login'}</span>
                        <ArrowRight className="w-3.5 h-3.5 text-white" />
                      </button>
                    </div>
                  )}

                  <div className="space-y-2 mt-2 font-sans">
                    <button
                      type="submit"
                      disabled={isAuthLoading}
                      className="w-full py-3 bg-[#1b6d24] text-white rounded-xl text-xs font-extrabold hover:bg-[#15541b] active:scale-98 transition flex items-center justify-center gap-1.5 cursor-pointer shadow-sm shadow-[#1b6d24]/10 disabled:opacity-60"
                      id="btn-signup-submit"
                    >
                      {isAuthLoading ? (
                        <Loader2 className="w-4 h-4 animate-spin text-white" />
                      ) : (
                        <>
                          <span>{language === 'te' ? 'ఖాతా నమోదు పూర్తి చేయండి' : 'Complete Registration'}</span>
                          <ArrowRight className="w-4 h-4 text-white" />
                        </>
                      )}
                    </button>
                  </div>
                </form>

                <div className="text-center border-t border-gray-100 pt-3 text-xs">
                  <span className="text-gray-400 font-semibold">{t.alreadyAccount} </span>
                  <button
                    onClick={() => setScreen('login')}
                    className="text-emerald-700 font-extrabold hover:underline"
                    id="btn-register-to-login"
                  >
                    {t.loginLink}
                  </button>
                </div>
              </motion.div>
            )}

            {/* 3. FORGOT PASSWORD - STEP 1: ENTER REGISTERED EMAIL */}
            {screen === 'forgot' && (
              <motion.div
                key="forgot-screen"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.2 }}
                className="space-y-4"
              >
                <div className="flex items-center gap-1 text-xs">
                  <button
                    onClick={() => setScreen('login')}
                    className="text-gray-400 font-extrabold hover:text-gray-700 flex items-center gap-0.5"
                    id="btn-forgot-back"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>{t.back}</span>
                  </button>
                </div>

                <div className="text-center">
                  <span className="inline-block bg-emerald-50 rounded-2xl p-3 text-[#1b6d24] mb-2 leading-none">
                    <Key className="w-6 h-6 text-[#1b6d24]" />
                  </span>
                  <h2 className="text-lg font-extrabold text-gray-800 tracking-tight leading-normal">
                    {language === 'te' ? 'పాస్‌వర్డ్ పునరుద్ధరణ (Forgot Password)' : 'Password Recovery'}
                  </h2>
                  <p className="text-[10px] text-gray-400 font-medium leading-relaxed mt-1">
                    {language === 'te' 
                      ? 'మీ రిజిస్టర్డ్ ఈమెయిల్ అడ్రస్ నమోదు చేయండి. మేము 6-అంకెల OTP సంకేతాన్ని పంపుతాము.' 
                      : 'Enter your registered email address to receive a 6-digit OTP verification code.'}
                  </p>
                </div>

                <form onSubmit={handleForgotSubmit} className="space-y-4">
                  <div>
                    <label className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block mb-1">
                      {language === 'te' ? 'రిజిస్టర్డ్ ఈమెయిల్ అడ్రస్ (Registered Email)' : 'Registered Email Address'}
                    </label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">
                        <Mail className="w-4 h-4 text-gray-300" />
                      </span>
                      <input
                        type="email"
                        value={forgotEmail}
                        onChange={(e) => setForgotEmail(e.target.value)}
                        placeholder="e.g. farmer@example.com"
                        className="w-full pl-9 pr-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold text-gray-800 focus:outline-none focus:border-[#1b6d24] focus:bg-white transition"
                        required
                        id="input-forgot-email"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isAuthLoading}
                    className="w-full py-2.5 bg-[#1b6d24] hover:bg-[#15541b] text-white rounded-xl text-xs font-extrabold active:scale-98 transition flex items-center justify-center gap-1.5 cursor-pointer shadow-xs disabled:opacity-60"
                    id="btn-forgot-submit"
                  >
                    {isAuthLoading ? (
                      <Loader2 className="w-4 h-4 animate-spin text-white" />
                    ) : (
                      <>
                        <span>{language === 'te' ? '6-అంకెల OTP పంపండి (Send OTP)' : 'Send 6-Digit OTP'}</span>
                        <ArrowRight className="w-4 h-4 text-white" />
                      </>
                    )}
                  </button>
                </form>

                <div className="text-center border-t border-gray-100 pt-3 text-xs">
                  <button
                    onClick={() => setScreen('login')}
                    className="text-gray-400 font-extrabold hover:text-gray-600 hover:underline"
                    id="btn-forgot-to-login"
                  >
                    {t.rememberPass}
                  </button>
                </div>
              </motion.div>
            )}

            {/* 4. FORGOT PASSWORD - STEP 2: VERIFY 6-DIGIT OTP */}
            {screen === 'otp' && (
              <motion.div
                key="otp-screen"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.2 }}
                className="space-y-4"
              >
                <div className="flex items-center gap-1 text-xs">
                  <button
                    onClick={() => setScreen('forgot')}
                    className="text-gray-400 font-extrabold hover:text-gray-700 flex items-center gap-0.5"
                    id="btn-otp-back"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>{t.back}</span>
                  </button>
                </div>

                <div className="text-center">
                  <span className="inline-block bg-blue-50 rounded-2xl p-3 text-blue-600 mb-2 leading-none">
                    <ShieldCheck className="w-6 h-6 text-blue-600" />
                  </span>
                  <h2 className="text-lg font-extrabold text-gray-800 tracking-tight leading-normal">
                    {language === 'te' ? 'OTP ధృవీకరణ' : 'Verify OTP Code'}
                  </h2>
                  <p className="text-[10px] text-gray-400 font-medium leading-relaxed mt-1">
                    {language === 'te' 
                      ? `${forgotEmail} కు పంపిన 6-అంకెల OTP సంకేతాన్ని నమోదు చేయండి.` 
                      : `Enter the 6-digit OTP sent to ${forgotEmail}`}
                  </p>
                </div>

                <form onSubmit={handleVerifyOtpSubmit} className="space-y-4">
                  <div>
                    <label className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block mb-1">
                      {language === 'te' ? '6-అంకెల OTP సంకేతం' : '6-Digit OTP Code'}
                    </label>
                    <input
                      type="text"
                      maxLength={6}
                      value={otpInput}
                      onChange={(e) => setOtpInput(e.target.value.replace(/\D/g, ''))}
                      placeholder="••••••"
                      className="w-full px-3 py-3 bg-gray-50 border border-gray-200 rounded-xl text-center text-xl font-mono tracking-widest font-bold text-gray-800 focus:outline-none focus:border-[#1b6d24] focus:bg-white transition"
                      required
                      autoFocus
                      id="input-otp-code"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isAuthLoading || otpInput.length < 6}
                    className="w-full py-2.5 bg-[#1b6d24] hover:bg-[#15541b] text-white rounded-xl text-xs font-extrabold active:scale-98 transition flex items-center justify-center gap-1.5 cursor-pointer shadow-xs disabled:opacity-60"
                    id="btn-verify-otp-submit"
                  >
                    {isAuthLoading ? (
                      <Loader2 className="w-4 h-4 animate-spin text-white" />
                    ) : (
                      <>
                        <span>{language === 'te' ? 'OTP ధృవీకరించండి' : 'Verify OTP Code'}</span>
                        <ArrowRight className="w-4 h-4 text-white" />
                      </>
                    )}
                  </button>
                </form>

                <div className="flex items-center justify-between text-xs pt-2">
                  <button
                    type="button"
                    onClick={handleResendOtp}
                    disabled={resendCooldown > 0 || isAuthLoading}
                    className="text-emerald-700 font-extrabold hover:underline disabled:text-gray-400 disabled:no-underline"
                    id="btn-resend-otp"
                  >
                    {resendCooldown > 0
                      ? `${language === 'te' ? 'మళ్ళీ పంపండి' : 'Resend OTP'} (${resendCooldown}s)`
                      : (language === 'te' ? 'మరోసారి OTP పంపించండి' : 'Resend OTP')
                    }
                  </button>
                  <button
                    onClick={() => setScreen('login')}
                    className="text-gray-400 font-semibold hover:underline"
                    id="btn-otp-to-login"
                  >
                    {t.back}
                  </button>
                </div>
              </motion.div>
            )}

            {/* 5. FORGOT PASSWORD - STEP 3: RESET PASSWORD */}
            {screen === 'reset-password' && (
              <motion.div
                key="reset-password-screen"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.2 }}
                className="space-y-4"
              >
                <div className="text-center">
                  <span className="inline-block bg-emerald-50 rounded-2xl p-3 text-[#1b6d24] mb-2 leading-none">
                    <Lock className="w-6 h-6 text-[#1b6d24]" />
                  </span>
                  <h2 className="text-lg font-extrabold text-gray-800 tracking-tight leading-normal">
                    {language === 'te' ? 'కొత్త పాస్‌వర్డ్ అమర్చండి' : 'Set New Password'}
                  </h2>
                  <p className="text-[10px] text-gray-400 font-medium leading-relaxed mt-1">
                    {language === 'te' 
                      ? 'మీ ఖాతా భద్రత కోసం కొత్త మరియు బలమైన పాస్‌వర్డ్‌ను నమోదు చేయండి.' 
                      : 'Enter and confirm your new secure password.'}
                  </p>
                </div>

                <form onSubmit={handleResetPasswordSubmit} className="space-y-3">
                  <div>
                    <label className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block mb-1">
                      {language === 'te' ? 'కొత్త పాస్‌వర్డ్' : 'New Password'}
                    </label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">
                        <Lock className="w-4 h-4 text-gray-300" />
                      </span>
                      <input
                        type={showResetNewPassword ? 'text' : 'password'}
                        value={resetNewPassword}
                        onChange={(e) => setResetNewPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full pl-9 pr-9 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-mono text-gray-800 focus:outline-none focus:border-[#1b6d24] focus:bg-white transition"
                        required
                        id="input-reset-new-password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowResetNewPassword(!showResetNewPassword)}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                      >
                        {showResetNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4 text-gray-400" />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block mb-1">
                      {language === 'te' ? 'కొత్త పాస్‌వర్డ్ నిర్ధారణ' : 'Confirm New Password'}
                    </label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">
                        <Lock className="w-4 h-4 text-gray-300" />
                      </span>
                      <input
                        type={showResetConfirmPassword ? 'text' : 'password'}
                        value={resetConfirmPassword}
                        onChange={(e) => setResetConfirmPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full pl-9 pr-9 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-mono text-gray-800 focus:outline-none focus:border-[#1b6d24] focus:bg-white transition"
                        required
                        id="input-reset-confirm-password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowResetConfirmPassword(!showResetConfirmPassword)}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                      >
                        {showResetConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4 text-gray-400" />}
                      </button>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isAuthLoading}
                    className="w-full py-2.5 bg-[#1b6d24] hover:bg-[#15541b] text-white rounded-xl text-xs font-extrabold active:scale-98 transition flex items-center justify-center gap-1.5 cursor-pointer shadow-xs disabled:opacity-60 mt-2"
                    id="btn-reset-password-submit"
                  >
                    {isAuthLoading ? (
                      <Loader2 className="w-4 h-4 animate-spin text-white" />
                    ) : (
                      <>
                        <span>{language === 'te' ? 'పాస్‌వర్డ్‌ను నవీకరించండి & లాగిన్ చేయండి' : 'Update Password & Login'}</span>
                        <ArrowRight className="w-4 h-4 text-white" />
                      </>
                    )}
                  </button>
                </form>

                <div className="text-center border-t border-gray-100 pt-3 text-xs">
                  <button
                    onClick={() => setScreen('login')}
                    className="text-gray-400 font-extrabold hover:text-gray-600 hover:underline"
                    id="btn-reset-to-login"
                  >
                    {t.rememberPass}
                  </button>
                </div>
              </motion.div>
            )}

          </AnimatePresence>
        </div>
      </div>

      {/* Modern, elegant, clean cooperative footer */}
      <div className="bg-slate-150 border-t border-gray-100 py-4 text-center px-4">
        <p className="text-[9px] text-gray-400 font-bold uppercase tracking-wider">
          {language === 'te' 
            ? 'ఈ రైతు వేదిక సహకార భద్రత సర్వీసు ప్యాకేజీ ద్వారా ప్రొటెక్ట్ చేయబడింది' 
            : 'Protected by E-Raitu Cooperative Safety Compliance'
          }
        </p>
      </div>

      {/* Forgot Password Modal */}
      <ForgotPasswordModal
        isOpen={isForgotModalOpen}
        onClose={() => setIsForgotModalOpen(false)}
        language={language}
        onOtpSent={(sentEmail) => {
          setForgotEmail(sentEmail);
          setIsForgotModalOpen(false);
          setScreen('otp');
          setResendCooldown(60);
          showToast('success', language === 'te' 
            ? 'మీ రిజిస్టర్డ్ ఈమెయిల్ కు 6-అంకెల OTP సంకేతం పంపబడింది.' 
            : 'OTP has been sent to your registered email address.'
          );
        }}
      />

    </div>
  );
}

// Standalone Modal Component for Forgot Password
export interface ForgotPasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  language: 'te' | 'en';
  onOtpSent: (email: string) => void;
}

export function ForgotPasswordModal({
  isOpen,
  onClose,
  language,
  onOtpSent,
}: ForgotPasswordModalProps) {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  if (!isOpen) return null;

  const handleModalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const target = email.trim().toLowerCase();
    if (!target || !target.includes('@')) {
      setErrorMessage(
        language === 'te'
          ? 'దయచేసి సరైన రిజిస్టర్డ్ ఈమెయిల్ అడ్రస్ నమోదు చేయండి.'
          : 'Please enter a valid registered email address.'
      );
      return;
    }

    setIsLoading(true);
    setErrorMessage('');
    setSuccessMessage('');

    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: target }),
      });

      const data = await res.json();

      if (!res.ok) {
        setErrorMessage(
          data.error ||
            (language === 'te'
              ? 'OTP పంపడం విఫలమైంది. దయచేసి మళ్ళీ ప్రయత్నించండి.'
              : 'Failed to send OTP. Please try again.')
        );
        return;
      }

      setSuccessMessage(
        language === 'te'
          ? 'మీ రిజిస్టర్డ్ ఈమెయిల్ కు 6-అంకెల OTP విజయవంతంగా పంపబడింది!'
          : '6-digit OTP sent successfully to your registered email!'
      );

      setTimeout(() => {
        onOtpSent(target);
      }, 750);
    } catch (err: any) {
      setErrorMessage(
        language === 'te'
          ? 'సర్వర్ కనెక్షన్ లోపం సంభవించింది. దయచేసి మళ్ళీ ప్రయత్నించండి.'
          : 'Server connection error. Please try again.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto"
      id="modal-forgot-password-backdrop"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        transition={{ duration: 0.2 }}
        className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden"
        id="modal-forgot-password"
      >
        {/* Header */}
        <div className="bg-[#1b6d24] text-white px-6 py-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/15 flex items-center justify-center backdrop-blur-xs">
              <Key className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-extrabold text-base leading-tight">
                {language === 'te' ? 'పాస్‌వర్డ్ పునరుద్ధరణ' : 'Forgot Password'}
              </h3>
              <p className="text-xs text-white/80 mt-0.5 font-medium">
                {language === 'te' ? 'ఈమెయిల్ ద్వారా OTP పొందండి' : 'Recover via Email OTP'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition cursor-pointer"
            id="btn-close-forgot-modal"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          <p className="text-xs text-gray-600 font-medium leading-relaxed">
            {language === 'te'
              ? 'మీ ఖాతాకు లింక్ చేయబడిన రిజిస్టర్డ్ ఈమెయిల్ అడ్రస్‌ను నమోదు చేయండి. మేము మీ పాస్‌వర్డ్ రీసెట్ కోసం 6-అంకెల OTP సంకేతాన్ని పంపుతాము.'
              : 'Enter your registered email address below. We will send a secure 6-digit OTP code to verify your identity and reset your password.'}
          </p>

          {/* Error Notice */}
          {errorMessage && (
            <div
              className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-800 font-medium flex items-start gap-2 leading-relaxed"
              id="forgot-modal-error"
            >
              <ShieldAlert className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Success Notice */}
          {successMessage && (
            <div
              className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 font-medium flex items-start gap-2 leading-relaxed"
              id="forgot-modal-success"
            >
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span>{successMessage}</span>
            </div>
          )}

          <form onSubmit={handleModalSubmit} className="space-y-4">
            <div>
              <label className="text-[10px] text-gray-500 font-bold uppercase tracking-wider block mb-1.5">
                {language === 'te' ? 'రిజిస్టర్డ్ ఈమెయిల్ అడ్రస్' : 'Registered Email Address'} <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                  <Mail className="w-4 h-4 text-emerald-600" />
                </span>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (errorMessage) setErrorMessage('');
                  }}
                  placeholder="e.g. farmer@gmail.com"
                  className="w-full pl-10 pr-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold text-gray-800 focus:outline-none focus:border-[#1b6d24] focus:bg-white transition"
                  required
                  autoFocus
                  id="input-modal-forgot-email"
                />
              </div>
            </div>

            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="w-1/3 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-xs font-extrabold transition cursor-pointer text-center"
                id="btn-modal-cancel"
              >
                {language === 'te' ? 'రద్దు చేయండి' : 'Cancel'}
              </button>
              <button
                type="submit"
                disabled={isLoading || !email.trim()}
                className="w-2/3 py-2.5 bg-[#1b6d24] hover:bg-[#15541b] text-white rounded-xl text-xs font-extrabold active:scale-98 transition flex items-center justify-center gap-1.5 cursor-pointer shadow-xs disabled:opacity-60"
                id="btn-modal-send-otp"
              >
                {isLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin text-white" />
                ) : (
                  <>
                    <span>{language === 'te' ? 'OTP పంపండి' : 'Send OTP'}</span>
                    <ArrowRight className="w-4 h-4 text-white" />
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </motion.div>
    </div>
  );
}
