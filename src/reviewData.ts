import { EquipmentReview } from './types';

export const INITIAL_REVIEWS: EquipmentReview[] = [
  // eq1: మహీంద్రా జీవో 245 DI
  {
    id: 'rev_101',
    equipmentId: 'eq1',
    farmerName: 'లక్ష్మణ రావు (Laxman Rao)',
    farmerId: 'usr101',
    farmerLocation: 'పాయకరావుపేట (Payakaraopeta)',
    rating: 5,
    comment: 'తోట పనులకు చాలా అనువైన ట్రాక్టర్. డీజిల్ చాలా తక్కువ తాగుతుంది. యజమాని కిరణ్ గారు సమయానికి అందించారు. చాలా సంతోషం!',
    rentalExperience: 'తోట దుక్కి (Orchard Cultivation)',
    createdAt: '2026-03-10',
    verifiedRental: true
  },
  {
    id: 'rev_102',
    equipmentId: 'eq1',
    farmerName: 'సూర్యనారాయణ (Surya Narayana)',
    farmerId: 'usr102',
    farmerLocation: 'అనంతపురము (Anantapur)',
    rating: 5,
    comment: 'గంటకు ₹1000 రీజనబుల్ ధర. రోటవేటర్ వేసి 3 ఎకరాల పొలం చాలా చక్కగా దున్నారు. మైలేజ్ అద్భుతం.',
    rentalExperience: 'రోటవేటర్ దుక్కి (Rotavator Plowing)',
    createdAt: '2026-03-02',
    verifiedRental: true
  },
  {
    id: 'rev_103',
    equipmentId: 'eq1',
    farmerName: 'వెంకటరమణ (Venkata Ramana)',
    farmerLocation: 'కళ్యాణదుర్గం (Kalyandurg)',
    rating: 4,
    comment: 'యంత్రం మంచి కండిషన్‌లో ఉంది. చిన్న ఇబ్బంది కూడా లేకుండా పని పూర్తయింది. యజమాని స్పందన బాగుంది.',
    rentalExperience: 'పండ్ల తోటలు (Fruit Orchards)',
    createdAt: '2026-02-22',
    verifiedRental: true
  },

  // eq2: కుబోటా హార్వెస్టర్
  {
    id: 'rev_201',
    equipmentId: 'eq2',
    farmerName: 'రమేష్ బాబు (Ramesh Babu)',
    farmerLocation: 'నంద్యాల (Nandyal)',
    rating: 5,
    comment: 'వరి కోత చాలా క్లీన్‌గా జరిగింది. గింజలు రాలడం అస్సలు లేదు. 6 ఎకరాలు సాయంత్రానికే పూర్తయింది. సూపర్ మిషన్!',
    rentalExperience: 'వరి కోత (Paddy Harvesting)',
    createdAt: '2026-03-12',
    verifiedRental: true
  },
  {
    id: 'rev_202',
    equipmentId: 'eq2',
    farmerName: 'అప్పారావు (Appa Rao)',
    farmerLocation: 'కర్నూలు (Kurnool)',
    rating: 5,
    comment: 'కుబోటా బెస్ట్ హార్వెస్టర్. డ్రైవర్ పనితనం అద్భుతం, ఎలాంటి పంట నష్టం లేకుండా క్లీన్‌గా నూర్పిడి చేశారు.',
    rentalExperience: 'వరి కోత (Paddy Harvesting)',
    createdAt: '2026-02-28',
    verifiedRental: true
  },
  {
    id: 'rev_203',
    equipmentId: 'eq2',
    farmerName: 'శివకుమార్ (Siva Kumar)',
    farmerLocation: 'డోన్ (Dhone)',
    rating: 5,
    comment: 'సమయానికి వచ్చి పని పూర్తి చేశారు. వర్షం వచ్చేలోపే కోత అయిపోయింది. చాలా కృతజ్ఞతలు.',
    rentalExperience: 'వరి కోత & నూర్పిడి (Harvesting & Threshing)',
    createdAt: '2026-02-15',
    verifiedRental: true
  },

  // eq3: పవర్ స్ప్రేయర్
  {
    id: 'rev_301',
    equipmentId: 'eq3',
    farmerName: 'నరసింహ మూర్తి (Narasimha Murthy)',
    farmerLocation: 'మదనపల్లె (Madanapalle)',
    rating: 5,
    comment: 'మిర్చి తోటకు మందు పిచికారీ చాలా సమానంగా పడింది. ప్రెషర్ చాలా బాగుంది, పురుగు మందు వృధా కాలేదు.',
    rentalExperience: 'మిర్చి తోట పిచికారీ (Chili Spraying)',
    createdAt: '2026-03-08',
    verifiedRental: true
  },
  {
    id: 'rev_302',
    equipmentId: 'eq3',
    farmerName: 'వెంకటేష్ (Venkatesh)',
    farmerLocation: 'చిత్తూరు (Chittoor)',
    rating: 4,
    comment: 'యంత్రం తేలికగా ఉంది. 4 గంటల్లో మొత్తం పొలం పూర్తయింది. తక్కువ ఖర్చుతో పని జరిగింది.',
    rentalExperience: 'టమాటా తోట (Tomato Field)',
    createdAt: '2026-02-20',
    verifiedRental: true
  },

  // eq4: శక్తి పవర్ టిల్లర్
  {
    id: 'rev_401',
    equipmentId: 'eq4',
    farmerName: 'ప్రసాద్ రెడ్డి (Prasad Reddy)',
    farmerLocation: 'నెల్లూరు (Nellore)',
    rating: 5,
    comment: 'వరి నారుమడి తయారీకి చాలా బాగా ఉపయోగపడింది. బురదలో కూడా అలవోకగా తిరిగింది.',
    rentalExperience: 'నారుమడి తయారీ (Paddy Nursery Bed)',
    createdAt: '2026-03-05',
    verifiedRental: true
  },
  {
    id: 'rev_402',
    equipmentId: 'eq4',
    farmerName: 'సుబ్బారావు (Subba Rao)',
    farmerLocation: 'గూడూరు (Gudur)',
    rating: 4,
    comment: 'రోజుకు ₹800 అద్దె చాలా గిట్టుబాటు. మా చిన్న పొలానికి సరైన యంత్రం.',
    rentalExperience: 'చిన్న కమతం దుక్కి (Small Holding Tillage)',
    createdAt: '2026-02-18',
    verifiedRental: true
  },

  // eq5: సోనాలికా DI 745 III
  {
    id: 'rev_501',
    equipmentId: 'eq5',
    farmerName: 'కొండలరావు (Kondala Rao)',
    farmerLocation: 'గుంటూరు (Guntur)',
    rating: 5,
    comment: 'భారీ దుక్కికి తిరుగులేని ట్రాక్టర్. 50 HP ఇంజిన్ పవర్ అదిరింది. రాతి నేలల్లో కూడా డీప్ ప్లోవింగ్ ఈజీగా చేసింది.',
    rentalExperience: 'భారీ లోతైన దుక్కి (Deep Plowing)',
    createdAt: '2026-03-09',
    verifiedRental: true
  },
  {
    id: 'rev_502',
    equipmentId: 'eq5',
    farmerName: 'నాగరాజు (Nagaraju)',
    farmerLocation: 'తెనాలి (Tenali)',
    rating: 5,
    comment: 'ట్రాలీ రవాణాకు మరియు కల్టివేటర్‌కి చాలా పవర్‌ఫుల్. డ్రైవర్ చాలా అనుభవజ్ఞుడు.',
    rentalExperience: 'పంట రవాణా (Crop Transport)',
    createdAt: '2026-02-26',
    verifiedRental: true
  },

  // eq6: యాన్మార్ పాడీ ట్రాన్స్‌ప్లాంటర్
  {
    id: 'rev_601',
    equipmentId: 'eq6',
    farmerName: 'సురేష్ వర్మ (Suresh Varma)',
    farmerLocation: 'బాపట్ల (Bapatla)',
    rating: 5,
    comment: 'వరి నాట్లు చాలా సరైన వరుసల్లో నాటింది. కూలీల కొరత ఉన్నప్పుడు ఈ యంత్రం ఒక వరం లాంటిది. ఖర్చు సగానికి తగ్గింది.',
    rentalExperience: 'యాంత్రిక వరి నాట్లు (Mechanical Transplanter)',
    createdAt: '2026-03-07',
    verifiedRental: true
  },

  // eq7: జాన్ డీరే 5050 D
  {
    id: 'rev_701',
    equipmentId: 'eq7',
    farmerName: 'హరినాథ్ రెడ్డి (Harinath Reddy)',
    farmerLocation: 'అనకాపల్లి (Anakapalli)',
    rating: 5,
    comment: 'చెరకు తోటల దుక్కికి చాలా బాగా పనిచేసింది. సమయపాలన సూపర్. యజమాని నారాయణ రావు గారు చాలా సహకరించారు.',
    rentalExperience: 'చెరకు తోట దుక్కి (Sugarcane Cultivation)',
    createdAt: '2026-03-11',
    verifiedRental: true
  },
  {
    id: 'rev_702',
    equipmentId: 'eq7',
    farmerName: 'మల్లికార్జున (Mallikarjuna)',
    farmerLocation: 'చోడవరం (Chodavaram)',
    rating: 5,
    comment: 'జాన్ డీరే పవర్ తిరుగులేదు. హైడ్రాలిక్స్ చాలా స్మూత్ గా ఉన్నాయి.',
    rentalExperience: 'కల్టివేటర్ (Cultivator)',
    createdAt: '2026-02-24',
    verifiedRental: true
  },

  // eq8: డ్రౌన్ అగ్రి స్ప్రేయర్
  {
    id: 'rev_801',
    equipmentId: 'eq8',
    farmerName: 'సతీష్ గౌడ్ (Satish Goud)',
    farmerLocation: 'ఏలూరు (Eluru)',
    rating: 5,
    comment: 'డ్రోన్ తో 10 నిమిషాల్లో ఎకరం పిచికారీ పూర్తయింది! నానో యూరియా స్ప్రేకి అద్భుతంగా పనిచేసింది.',
    rentalExperience: 'డ్రోన్ పిచికారీ (Drone Agri Spraying)',
    createdAt: '2026-03-14',
    verifiedRental: true
  }
];

const STORAGE_KEY = 'rv_equipment_reviews';

export function loadAllReviews(): EquipmentReview[] {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) {
        // Merge missing seed reviews
        const savedIds = new Set(parsed.map((r: EquipmentReview) => r.id));
        const missing = INITIAL_REVIEWS.filter(r => !savedIds.has(r.id));
        if (missing.length > 0) {
          const merged = [...parsed, ...missing];
          localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
          return merged;
        }
        return parsed;
      }
    }
  } catch (e) {
    console.error('Error loading reviews from localStorage:', e);
  }
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_REVIEWS));
  } catch (_) {}
  return INITIAL_REVIEWS;
}

export function saveAllReviews(reviews: EquipmentReview[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(reviews));
  } catch (e) {
    console.error('Error saving reviews to localStorage:', e);
  }
}

export function getEquipmentReviews(equipmentId: string): EquipmentReview[] {
  const all = loadAllReviews();
  return all.filter(r => r.equipmentId === equipmentId);
}

export function calculateRatingSummary(reviews: EquipmentReview[]): {
  average: number;
  count: number;
  breakdown: Record<number, number>;
} {
  const breakdown: Record<number, number> = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
  if (!reviews || reviews.length === 0) {
    return { average: 4.8, count: 0, breakdown };
  }

  let totalScore = 0;
  reviews.forEach(r => {
    const star = Math.max(1, Math.min(5, Math.round(r.rating || 5)));
    breakdown[star] = (breakdown[star] || 0) + 1;
    totalScore += (r.rating || 5);
  });

  const average = Number((totalScore / reviews.length).toFixed(1));
  return {
    average,
    count: reviews.length,
    breakdown
  };
}

export function saveNewReview(reviewData: Omit<EquipmentReview, 'id' | 'createdAt'>): {
  newReview: EquipmentReview;
  updatedReviews: EquipmentReview[];
  newAverage: number;
  totalReviews: number;
} {
  const allReviews = loadAllReviews();
  const newReview: EquipmentReview = {
    ...reviewData,
    id: `rev_${Date.now()}_${Math.floor(100 + Math.random() * 900)}`,
    createdAt: new Date().toISOString().split('T')[0],
    verifiedRental: true
  };

  const updatedReviews = [newReview, ...allReviews];
  saveAllReviews(updatedReviews);

  const eqReviews = updatedReviews.filter(r => r.equipmentId === reviewData.equipmentId);
  const { average, count } = calculateRatingSummary(eqReviews);

  // Also update equipment list in localStorage
  try {
    const savedEq = localStorage.getItem('rv_equipment');
    if (savedEq) {
      const parsed = JSON.parse(savedEq);
      if (Array.isArray(parsed)) {
        const updatedEqList = parsed.map((eq: any) => {
          if (eq.id === reviewData.equipmentId) {
            return {
              ...eq,
              rating: average,
              reviewCount: count
            };
          }
          return eq;
        });
        localStorage.setItem('rv_equipment', JSON.stringify(updatedEqList));
      }
    }
  } catch (e) {
    console.error('Error updating equipment ratings in localStorage:', e);
  }

  // Attempt async sync to backend
  try {
    fetch('/api/reviews', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newReview)
    }).catch(err => console.log('Backend review sync postponed:', err));
  } catch (_) {}

  return {
    newReview,
    updatedReviews,
    newAverage: average,
    totalReviews: count
  };
}
