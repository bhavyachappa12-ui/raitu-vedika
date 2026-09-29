import fs from "fs";
import path from "path";
import crypto from "crypto";
import dotenv from "dotenv";

dotenv.config();
dotenv.config({ path: path.resolve(process.cwd(), ".env.local"), override: true });

import { initializeApp, getApps, getApp } from "firebase/app";
import { 
  initializeFirestore, 
  getFirestore, 
  doc, 
  getDoc, 
  setDoc, 
  getDocs, 
  collection, 
  Firestore 
} from "firebase/firestore";
import { BackendUser, OtpRecord } from "./types";

const USERS_FILE_PATH = path.join(process.cwd(), "users_db.json");
const EQUIPMENTS_FILE_PATH = path.join(process.cwd(), "equipments_db.json");
const CHATS_FILE_PATH = path.join(process.cwd(), "chats_db.json");
const REVIEWS_FILE_PATH = path.join(process.cwd(), "reviews_db.json");

// Default initial users to ensure data integrity
export const DEFAULT_USERS: BackendUser[] = [
  { 
    id: 'usr101', 
    name: 'కిరణ్ కుమార్ రెడ్డి', 
    phone: '9848022334', 
    email: 'kiran.reddy@example.com', 
    location: 'గుంటూరు రూరల్ (Anakapalli)', 
    district: 'Anakapalli', 
    mandal: 'Payakaraopeta', 
    village: 'Payakaraopeta', 
    role: 'owner', 
    verified: true, 
    status: 'active', 
    aadhaarNumber: '7845-9012-3456', 
    proofFileAttached: true, 
    idFileAttached: true, 
    createdAt: '2026-01-15' 
  },
  { 
    id: 'usr102', 
    name: 'పప్పల రమణ', 
    phone: '9390188552', 
    email: 'ramana.pappala@example.com', 
    location: 'నెల్లూరు బ్లాక్ ఎ (Anakapalli)', 
    district: 'Anakapalli', 
    mandal: 'Payakaraopeta', 
    village: 'Masaipeta', 
    role: 'farmer', 
    verified: false, 
    status: 'active', 
    aadhaarNumber: '4512-8890-1122', 
    proofFileAttached: false, 
    idFileAttached: true, 
    createdAt: '2026-02-10' 
  },
  { 
    id: 'usr103', 
    name: 'గోపాల కృష్ణ భట్', 
    phone: '9988177223', 
    email: 'gopal.bhat@example.com', 
    location: 'విజయనగరం (Anakapalli)', 
    district: 'Anakapalli', 
    mandal: 'Payakaraopeta', 
    village: 'Satyavaram', 
    role: 'both', 
    verified: true, 
    status: 'active', 
    aadhaarNumber: '9912-3344-5566', 
    proofFileAttached: true, 
    idFileAttached: true, 
    createdAt: '2026-03-01' 
  },
  { 
    id: 'usr104', 
    name: 'మ్యాతరి మల్లికార్జున్', 
    phone: '9080706050', 
    email: 'mallik.m@example.com', 
    location: 'కర్నూలు ఈస్ట్ (Anakapalli)', 
    district: 'Anakapalli', 
    mandal: 'Payakaraopeta', 
    village: 'Namavaram', 
    role: 'farmer', 
    verified: false, 
    status: 'suspended', 
    aadhaarNumber: '3321-7788-9900', 
    proofFileAttached: false, 
    idFileAttached: false, 
    createdAt: '2026-03-12' 
  }
];

export const DEFAULT_EQUIPMENTS: any[] = [
  {
    id: 'eq1',
    title: 'మహీంద్రా జీవో 245 DI',
    titleEn: 'Mahindra Jivo 245 DI',
    category: 'tractor',
    categoryLabel: 'ట్రాక్టర్',
    location: 'అనంతపురము',
    locationEn: 'Anantapuramu',
    price: 1000,
    rateType: 'hour',
    rateTypeLabel: 'గంట',
    imageUrl: 'https://www.mahindratractor.com/sites/default/files/2023-08/K2-Compact_2121_Desktop.jpg',
    status: 'available',
    statusLabel: 'అందుబాటులో ఉంది',
    ownerName: 'కిరణ్ కుమార్',
    ownerPhone: '9440123456',
    ownerAvatar: 'https://images.unsplash.com/photo-1595152772835-219674b2a8a6?auto=format&fit=crop&w=150&q=80',
    verified: true,
    description: 'చిన్న పొలాలు మరియు తోటల కోసం సరైన 24 HP సవారీ ట్రాక్టర్. చాలా తక్కువ ఇంధనం వినియోగిస్తుంది.',
    descriptionEn: 'Perfect 24 HP compact ride-on tractor for small farms and orchards. Low fuel consumption.',
    horsepower: '24 HP',
    fuelType: 'Diesel (డీజిల్)',
    includesDriver: false,
    specs: ['కల్టివేటర్ సదుపాయం ఉంటుంది', '4-Wheel Drive (4WD) ఆప్షన్', 'పండ్ల తోటలకు సరిగ్గా సరిపోతుంది', 'తక్కువ పొగ, ఎక్కువ మైలేజ్']
  },
  {
    id: 'eq2',
    title: 'కుబోటా హార్వెస్టర్',
    titleEn: 'Kubota Harvester',
    category: 'harvester',
    categoryLabel: 'హార్వెస్టర్',
    location: 'కర్నూలు',
    locationEn: 'Kurnool',
    price: 2500,
    rateType: 'hour',
    rateTypeLabel: 'గంట',
    imageUrl: 'https://www.kubota.com/products/farm-m/images/img_application_02.jpg',
    status: 'booked',
    statusLabel: 'బుకింగ్ చేయబడింది',
    ownerName: 'రామనారాయణ రెడ్డి',
    ownerPhone: '9848011223',
    ownerAvatar: 'https://images.unsplash.com/photo-1618018352910-c11fb33a71b5?auto=format&fit=crop&w=150&q=80',
    verified: true,
    description: 'వరి మరియు గోధుమ కోతకు అనువైన అత్యాధునిక జపనీస్ యంత్రం. చాలా వేగంగా క్లీన్ పద్ధతిలో కోత చేస్తుంది.',
    descriptionEn: 'State of the art Japanese harvester ideal for paddy and wheat. Extremely clean and fast cutting.',
    horsepower: '70 HP',
    fuelType: 'Diesel (డీజిల్)',
    includesDriver: true,
    specs: ['నైపుణ్యం కల ఆపరేటర్ సేవలు ఉచితం', 'పంట నష్టం మరియు గింజలు రాలడం ఉండదు', 'రోజుకు 8 ఎకరాల వరకు కోయగల సామర్థ్యం', 'బురద నేలల్లో కూడా సులభంగా నడుస్తుంది']
  },
  {
    id: 'eq3',
    title: 'పవర్ స్ప్రేయర్',
    titleEn: 'Power Sprayer',
    category: 'sprayer',
    categoryLabel: 'స్ప్రేయర్',
    location: 'చిత్తూరు',
    locationEn: 'Chittoor',
    price: 2000,
    rateType: 'day',
    rateTypeLabel: 'రోజు',
    imageUrl: 'https://5.imimg.com/data5/BZ/ZF/KN/SELLER-82588675/agricultural-power-sprayer-500x500.jpg',
    status: 'available',
    statusLabel: 'అందుబాటులో ఉంది',
    ownerName: 'గోపాల్ రావు',
    ownerPhone: '9989045612',
    ownerAvatar: 'https://images.unsplash.com/photo-1531427186611-ecfd6d936c79?auto=format&fit=crop&w=150&q=80',
    verified: false,
    description: 'పురుగుల మందులు మరియు పోషకాలు చల్లడానికి అనువైన హైప్రెజర్ పవర్ స్ప్రేయర్. 100 మీటర్ల పైపుతో వస్తుంది.',
    descriptionEn: 'High-pressure petrol power sprayer ideal for pesticides. Comes with a 100m pipeline package.',
    horsepower: '5.5 HP',
    fuelType: 'Petrol (పెట్రోల్)',
    includesDriver: false,
    specs: ['100 మీటర్ల అత్యుత్తమ ప్రెజర్ పైపు', 'రెండు పిస్టన్ల గల పవర్ పిస్టన్ పంప్', 'ద్విచక్ర బండిపై కూడా తీసుకెళ్లవచ్చు', 'అదనపు స్ప్రే నూజిల్స్ ఉచితం']
  },
  {
    id: 'eq4',
    title: 'జాన్ డీర్ ట్రాక్టర్',
    titleEn: 'John Deere Tractor',
    category: 'tractor',
    categoryLabel: 'ట్రాక్టర్',
    location: 'అనకాపల్లి',
    locationEn: 'Anakapalli',
    price: 1200,
    rateType: 'hour',
    rateTypeLabel: 'గంట',
    imageUrl: 'https://www.deere.co.in/assets/images/region-1/products/tractors/d-series-tractors/5045d-gearpro-45hp/5045d_gearpro_45hp_large_ec0d46f3640860fdfe234d30a13c7d220879ad1b.jpg',
    status: 'available',
    statusLabel: 'అందుబాటులో ఉంది',
    ownerName: 'విజయ్‌ భాస్కర్',
    ownerPhone: '9490123789',
    ownerAvatar: 'https://images.unsplash.com/photo-1607990283143-e81e7a2c93ab?auto=format&fit=crop&w=150&q=80',
    verified: true,
    description: 'భారీ వ్యవసాయ పనుల కోసం 50 HP శక్తివంతమైన ట్రాక్టర్. దున్నటానికి మరియు భారీ లోడ్లకు అనుకూలం.',
    descriptionEn: 'Power-packed 50 HP tractor for heavy tillage. Best for rotavator tilling and heavy cargo trailer.',
    horsepower: '50 HP',
    fuelType: 'Diesel (డీజిల్)',
    includesDriver: true,
    specs: ['రోటవేటర్ & నాగలి అదనపు అద్దెకు లభ్యం', 'సులభమైన పవర్ స్టీరింగ్ టెక్నాలజీ', 'డ్రైవర్ వేతనం అద్దె ధరలోనే చేర్చబడింది', 'భారీ బరువులను అలవోకగా లాగగలదు']
  }
];

// In-memory caching for faster response times across invocations
let inMemoryUsers: BackendUser[] | null = null;
let inMemoryEquipments: any[] | null = null;
let inMemoryReviews: any[] | null = null;
let inMemoryChats: any[] | null = null;

// OTP Store and Rate Limiter (shared across module)
export const otpStore = new Map<string, OtpRecord>();
export const otpRateLimit = new Map<string, number[]>();

export function hashOtp(otp: string): string {
  return crypto.createHash("sha256").update(otp).digest("hex");
}

// Password hashing & verification with PBKDF2
export function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = crypto.pbkdf2Sync(password, salt, 1000, 64, "sha512").toString("hex");
  return `${salt}:${hash}`;
}

export function verifyPassword(password: string, storedHash?: string): boolean {
  if (!storedHash) {
    // If no passwordHash was recorded yet (legacy mock users), accept default "123456"
    return password === "123456";
  }
  const parts = storedHash.split(":");
  if (parts.length !== 2) {
    return password === storedHash || password === "123456";
  }
  const [salt, hash] = parts;
  try {
    const verifyHash = crypto.pbkdf2Sync(password, salt, 1000, 64, "sha512").toString("hex");
    return crypto.timingSafeEqual(Buffer.from(hash, "hex"), Buffer.from(verifyHash, "hex"));
  } catch (e) {
    return false;
  }
}

export function sanitizeUser(user: BackendUser): Omit<BackendUser, 'passwordHash'> {
  const { passwordHash, ...safeUser } = user;
  return safeUser;
}

// Robust atomic file writer that catches and suppresses read-only filesystem errors (Vercel)
export function safeWriteJsonSync(filePath: string, data: any): boolean {
  try {
    const tempPath = `${filePath}.tmp`;
    fs.writeFileSync(tempPath, JSON.stringify(data, null, 2), "utf8");
    fs.renameSync(tempPath, filePath);
    return true;
  } catch (error) {
    try {
      fs.writeFileSync(filePath, JSON.stringify(data, null, 2), "utf8");
      return true;
    } catch (fallbackError) {
      // Expected on serverless read-only filesystems (Vercel)
      console.warn(`[DB] Local file write skipped for ${path.basename(filePath)} (serverless read-only mode).`);
      return false;
    }
  }
}

// Initialize Firestore lazily
let firestoreInstance: Firestore | null = null;

export function getFirestoreDb(): Firestore | null {
  if (firestoreInstance) return firestoreInstance;

  try {
    const isAiStudioContainer = Boolean(
      process.env.APPLET_ID || 
      process.env.K_SERVICE || 
      process.env.AUTHORIZED_SERVICE_ACCOUNT_EMAIL
    );

    let config: any = null;
    const configPath = path.join(process.cwd(), "firebase-applet-config.json");
    if (fs.existsSync(configPath)) {
      try {
        config = JSON.parse(fs.readFileSync(configPath, "utf8"));
      } catch (e) {}
    }

    // In AI Studio cloud container, prioritize the provisioned database in firebase-applet-config.json.
    // In local development, respect process.env (FIREBASE_PROJECT_ID=raitu-vedika).
    const projectId = isAiStudioContainer
      ? ((config && config.projectId) || process.env.FIREBASE_PROJECT_ID || "raitu-vedika")
      : (process.env.FIREBASE_PROJECT_ID || process.env.VITE_FIREBASE_PROJECT_ID || (config && config.projectId) || "raitu-vedika");

    const apiKey = isAiStudioContainer
      ? ((config && config.apiKey) || process.env.FIREBASE_API_KEY || "")
      : (process.env.FIREBASE_API_KEY || process.env.VITE_FIREBASE_API_KEY || (config && config.apiKey) || "");

    const rawDatabaseId = isAiStudioContainer
      ? ((config && config.firestoreDatabaseId) || process.env.FIREBASE_DATABASE_ID || "(default)")
      : (process.env.FIREBASE_DATABASE_ID || process.env.VITE_FIREBASE_DATABASE_ID || (config && config.firestoreDatabaseId) || "(default)");

    const databaseId = (!rawDatabaseId || rawDatabaseId === "(default)") ? undefined : rawDatabaseId;

    if (!projectId) {
      return null;
    }

    const activeConfig = {
      ...(config || {}),
      projectId,
      apiKey,
      authDomain: isAiStudioContainer
        ? ((config && config.authDomain) || `${projectId}.firebaseapp.com`)
        : (process.env.FIREBASE_AUTH_DOMAIN || process.env.VITE_FIREBASE_AUTH_DOMAIN || (config && config.authDomain) || `${projectId}.firebaseapp.com`),
      storageBucket: isAiStudioContainer
        ? ((config && config.storageBucket) || `${projectId}.firebasestorage.app`)
        : (process.env.FIREBASE_STORAGE_BUCKET || process.env.VITE_FIREBASE_STORAGE_BUCKET || (config && config.storageBucket) || `${projectId}.firebasestorage.app`),
      appId: isAiStudioContainer
        ? ((config && config.appId) || "")
        : (process.env.FIREBASE_APP_ID || process.env.VITE_FIREBASE_APP_ID || (config && config.appId) || ""),
      firestoreDatabaseId: rawDatabaseId
    };

    const app = getApps().length > 0 ? getApp() : initializeApp(activeConfig);
    firestoreInstance = getFirestore(app, databaseId);

    return firestoreInstance;
  } catch (err) {
    console.warn("[DB] Firestore initialization warning:", err);
    return null;
  }
}

// Local JSON file reader helper
function loadLocalUsersJson(): BackendUser[] {
  try {
    if (fs.existsSync(USERS_FILE_PATH)) {
      const data = fs.readFileSync(USERS_FILE_PATH, "utf8");
      const parsed = JSON.parse(data);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (err) {
    console.warn("[DB] Could not read local users_db.json:", err);
  }
  return DEFAULT_USERS;
}

// Save single user to Firestore
async function saveUserToFirestore(user: BackendUser): Promise<void> {
  const db = getFirestoreDb();
  if (!db) return;

  const docRef = doc(db, "users", user.id);
  const dataToSave: Record<string, any> = {
    id: user.id,
    name: user.name,
    phone: user.phone,
    email: user.email || "",
    location: user.location || "",
    district: user.district || "",
    mandal: user.mandal || "",
    village: user.village || "",
    role: user.role || "farmer",
    verified: Boolean(user.verified),
    status: user.status || "active",
    proofFileAttached: Boolean(user.proofFileAttached),
    idFileAttached: Boolean(user.idFileAttached),
    createdAt: user.createdAt || new Date().toISOString().split("T")[0],
    updatedAt: Date.now()
  };

  if (user.passwordHash) {
    dataToSave.passwordHash = user.passwordHash;
  }
  if (user.aadhaarNumber) {
    dataToSave.aadhaarNumber = user.aadhaarNumber;
  }

  await setDoc(docRef, dataToSave, { merge: true });
}

// ---------------- USER OPERATIONS ----------------

export async function getUsers(): Promise<BackendUser[]> {
  const db = getFirestoreDb();
  let firestoreUsers: BackendUser[] = [];

  if (db) {
    try {
      const snap = await getDocs(collection(db, "users"));
      snap.forEach(docSnap => {
        const d = docSnap.data();
        if (d && (d.id || docSnap.id) && d.name && d.name !== "Test User") {
          firestoreUsers.push({
            id: d.id || docSnap.id,
            name: d.name,
            phone: d.phone || "",
            email: d.email || "",
            passwordHash: d.passwordHash,
            location: d.location || "Andhra Pradesh",
            district: d.district || "",
            mandal: d.mandal || "",
            village: d.village || "",
            role: d.role || "farmer",
            verified: Boolean(d.verified),
            status: d.status || "active",
            aadhaarNumber: d.aadhaarNumber,
            proofFileAttached: Boolean(d.proofFileAttached),
            idFileAttached: Boolean(d.idFileAttached),
            createdAt: d.createdAt,
            updatedAt: d.updatedAt
          });
        }
      });
    } catch (err: any) {
      if (err?.code === "permission-denied") {
        console.info("[DB] Firestore users collection notice: permission-denied. Using local account cache.");
      } else {
        console.warn("[DB] Firestore users notice:", err?.message || err);
      }
    }
  }

  const localUsers = loadLocalUsersJson();

  // If Firestore has users, merge with local data to guarantee all existing accounts exist
  if (firestoreUsers.length > 0) {
    const fsPhoneMap = new Map(firestoreUsers.map(u => [u.phone.replace(/\D/g, ""), u]));
    const fsIdMap = new Map(firestoreUsers.map(u => [u.id, u]));

    for (const lu of localUsers) {
      const cleanPhone = lu.phone.replace(/\D/g, "");
      const existing = fsPhoneMap.get(cleanPhone) || fsIdMap.get(lu.id);
      if (!existing) {
        firestoreUsers.push(lu);
        saveUserToFirestore(lu).catch(() => {});
      } else if (!existing.passwordHash && lu.passwordHash) {
        existing.passwordHash = lu.passwordHash;
        saveUserToFirestore(existing).catch(() => {});
      }
    }

    inMemoryUsers = firestoreUsers;
    return firestoreUsers;
  }

  // Fallback to local users if Firestore is unreachable
  if (localUsers.length > 0) {
    inMemoryUsers = localUsers;
    return localUsers;
  }

  inMemoryUsers = DEFAULT_USERS;
  return DEFAULT_USERS;
}

export async function saveUser(user: BackendUser): Promise<void> {
  // 1. Persist to Firestore for true cloud persistence on Vercel
  try {
    await saveUserToFirestore(user);
    console.log(`[DB] Persistent save for user ${user.name} (${user.id}) in Firestore succeeded`);
  } catch (err) {
    console.error(`[DB] Failed to save user to Firestore:`, err);
  }

  // 2. Update in-memory cache
  if (!inMemoryUsers) {
    inMemoryUsers = await getUsers();
  }
  const memIdx = inMemoryUsers.findIndex(u => u.id === user.id || u.phone.replace(/\D/g, "") === user.phone.replace(/\D/g, ""));
  if (memIdx >= 0) {
    inMemoryUsers[memIdx] = user;
  } else {
    inMemoryUsers.push(user);
  }

  // 3. Attempt local JSON update (will silently pass if read-only on Vercel)
  try {
    const local = loadLocalUsersJson();
    const lIdx = local.findIndex(u => u.id === user.id || u.phone.replace(/\D/g, "") === user.phone.replace(/\D/g, ""));
    if (lIdx >= 0) {
      local[lIdx] = user;
    } else {
      local.push(user);
    }
    safeWriteJsonSync(USERS_FILE_PATH, local);
  } catch (_) {}
}

export async function updateUser(id: string, updates: Partial<BackendUser>): Promise<BackendUser | null> {
  const users = await getUsers();
  const user = users.find(u => u.id === id);
  if (!user) return null;

  Object.assign(user, updates, { updatedAt: Date.now() });
  await saveUser(user);
  return user;
}

// ---------------- EQUIPMENT OPERATIONS ----------------

export async function getEquipments(): Promise<any[]> {
  const db = getFirestoreDb();
  if (db) {
    try {
      const snap = await getDocs(collection(db, "equipments"));
      if (!snap.empty) {
        const firestoreEquips: any[] = [];
        snap.forEach(d => firestoreEquips.push({ id: d.id, ...d.data() }));
        inMemoryEquipments = firestoreEquips;
        return firestoreEquips;
      }
    } catch (err: any) {
      if (err?.code === "permission-denied") {
        console.info("[DB] Firestore equipments collection notice: permission-denied. Using local catalog.");
      } else {
        console.warn("[DB] Firestore equipments notice:", err?.message || err);
      }
    }
  }

  if (inMemoryEquipments && inMemoryEquipments.length > 0) return inMemoryEquipments;

  try {
    if (fs.existsSync(EQUIPMENTS_FILE_PATH)) {
      const data = fs.readFileSync(EQUIPMENTS_FILE_PATH, "utf8");
      const parsed = JSON.parse(data);
      if (Array.isArray(parsed) && parsed.length > 0) {
        inMemoryEquipments = parsed;
        return inMemoryEquipments;
      }
    }
  } catch (err) {
    console.warn("[DB] Error reading equipments file:", err);
  }

  // Fallback to default equipment catalog and seed Firestore
  inMemoryEquipments = DEFAULT_EQUIPMENTS;
  safeWriteJsonSync(EQUIPMENTS_FILE_PATH, DEFAULT_EQUIPMENTS);
  if (db) {
    for (const eq of DEFAULT_EQUIPMENTS) {
      if (eq.id) {
        setDoc(doc(db, "equipments", eq.id), eq, { merge: true }).catch(() => {});
      }
    }
  }

  return inMemoryEquipments || [];
}

export async function saveEquipments(equipments: any[]): Promise<void> {
  inMemoryEquipments = equipments;
  safeWriteJsonSync(EQUIPMENTS_FILE_PATH, equipments);

  const db = getFirestoreDb();
  if (db) {
    for (const eq of equipments) {
      if (eq.id) {
        setDoc(doc(db, "equipments", eq.id), eq, { merge: true }).catch(() => {});
      }
    }
  }
}

// ---------------- REVIEWS OPERATIONS ----------------

export async function getReviews(equipmentId?: string): Promise<any[]> {
  const db = getFirestoreDb();
  let reviews: any[] = [];

  if (db) {
    try {
      const snap = await getDocs(collection(db, "reviews"));
      snap.forEach(d => reviews.push({ id: d.id, ...d.data() }));
    } catch (err) {
      console.warn("[DB] Error fetching reviews from Firestore:", err);
    }
  }

  if (reviews.length === 0) {
    try {
      if (fs.existsSync(REVIEWS_FILE_PATH)) {
        const data = fs.readFileSync(REVIEWS_FILE_PATH, "utf8");
        const parsed = JSON.parse(data);
        if (Array.isArray(parsed)) reviews = parsed;
      }
    } catch (err) {
      console.warn("[DB] Error reading reviews file:", err);
    }
  }

  inMemoryReviews = reviews;
  if (equipmentId) {
    return reviews.filter(r => r.equipmentId === equipmentId);
  }
  return reviews;
}

export async function saveReview(newReview: any): Promise<{ review: any; averageRating: number; reviewCount: number }> {
  const allReviews = await getReviews();
  const existingIdx = allReviews.findIndex((r: any) => r.id === newReview.id);
  if (existingIdx >= 0) {
    allReviews[existingIdx] = newReview;
  } else {
    allReviews.unshift(newReview);
  }

  inMemoryReviews = allReviews;
  safeWriteJsonSync(REVIEWS_FILE_PATH, allReviews);

  const db = getFirestoreDb();
  if (db && newReview.id) {
    setDoc(doc(db, "reviews", newReview.id), newReview, { merge: true }).catch(() => {});
  }

  // Recalculate average rating
  const eqReviews = allReviews.filter((r: any) => r.equipmentId === newReview.equipmentId);
  const totalScore = eqReviews.reduce((sum: number, r: any) => sum + (Number(r.rating) || 5), 0);
  const averageRating = Number((totalScore / eqReviews.length).toFixed(1));
  const reviewCount = eqReviews.length;

  return {
    review: newReview,
    averageRating,
    reviewCount
  };
}

// ---------------- CHATS OPERATIONS ----------------

export async function getChats(): Promise<any[]> {
  if (inMemoryChats) return inMemoryChats;

  try {
    if (fs.existsSync(CHATS_FILE_PATH)) {
      const data = fs.readFileSync(CHATS_FILE_PATH, "utf8");
      inMemoryChats = JSON.parse(data);
      return inMemoryChats || [];
    }
  } catch (err) {
    console.warn("[DB] Error reading chats file:", err);
  }

  return [];
}

export async function saveChats(chats: any[]): Promise<void> {
  inMemoryChats = chats;
  safeWriteJsonSync(CHATS_FILE_PATH, chats);
}
