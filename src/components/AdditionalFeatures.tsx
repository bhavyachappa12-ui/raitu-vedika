import React, { useState } from 'react';
import { DISTRICTS } from '../data';
import { 
  Users, MessageSquare, ThumbsUp, CloudSun, Wind, 
  Droplets, Thermometer, ShieldCheck, Landmark, Calculator, 
  HelpCircle, AlertOctagon, HeartHandshake, Globe, Compass, 
  Send, Sprout, LandmarkIcon, Check, MapPin, FileText,
  TrendingUp, Calendar, AlertTriangle, CheckCircle2, Award, Droplet, Layers,
  Sun, CloudRain, Eye, ShieldAlert, Share2, Download, Bell, Clock
} from 'lucide-react';

interface AdditionalFeaturesProps {
  language: 'te' | 'en';
  onLanguageToggle: () => void;
  triggerToast: (text: string, type: 'success' | 'info' | 'error') => void;
}

interface ForumPost {
  id: string;
  author: string;
  avatar: string;
  title: string;
  category: string;
  likes: number;
  repliesCount: number;
  time: string;
  replies: string[];
}

interface EmerRequest {
  id: string;
  village: string;
  machineryNeeded: string;
  priority: 'CRITICAL' | 'HIGH';
  problem: string;
  contact: string;
  status: 'OPEN' | 'RESOLVING';
}

export default function AdditionalFeatures({
  language,
  onLanguageToggle,
  triggerToast
}: AdditionalFeaturesProps) {

  type ExtraPageId = 
    | 'community_forum' | 'weather_info' | 'gov_schemes' 
    | 'crop_suggestions' | 'emerg_requests' | 'lang_settings';

  const [activeTab, setActiveTab] = useState<ExtraPageId>('community_forum');

  // Community State with complete bilingual assets built in
  const [forumPosts, setForumPosts] = useState<any[]>([
    {
      id: 'p1',
      authorTe: 'వెంకట సుబ్బారావు',
      authorEn: 'Venkata Subba Rao',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
      titleTe: 'మిరప తోటలో ముడత తెగులు నివారణకు ఏ మందులు మంచివి?',
      titleEn: 'What are the best remedies for leaf curl disease in chilli crop fields?',
      categoryTe: 'కీటక నివారణ',
      categoryEn: 'Pest Control',
      likes: 12,
      repliesCount: 3,
      timeTe: '2 గంటల క్రితం',
      timeEn: '2 hours ago',
      repliesTe: [
        'లీటరు నీటికి 2 మి.లీ డైఫెన్త్యూరాన్ కలిపి పిచికారీ చేయండి.',
        'సేంద్రీయ పద్ధతిలో వేప కషాయం కూడా మంచి ఫలితం ఇస్తుంది.'
      ],
      repliesEn: [
        'Mix 2 ml of Diafenthiuron per liter of water and spray carefully.',
        'Neem decoction also gives excellent results in organic style.'
      ]
    },
    {
      id: 'p2',
      authorTe: 'ఎం. జగన్నాధం',
      authorEn: 'M. Jagannadham',
      avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150',
      titleTe: 'అన్నదాత సుఖీభవ పెట్టుబడి మద్దతు మొదటి విడత ఎప్పుడు పడుతుంది?',
      titleEn: 'When will the first installment of Annadata Sukhibhava state subvention be released?',
      categoryTe: 'ప్రభుత్వ పథకాలు',
      categoryEn: 'Subsidies',
      likes: 24,
      repliesCount: 1,
      timeTe: '1 రోజు క్రితం',
      timeEn: '1 day ago',
      repliesTe: [
        'ఈ నెల మూడో వారంలో నేరుగా అన్నదాత సుఖీభవ ద్వారా బ్యాంక్ ఖాతాల్లో రూ. 20,000 జమ చేయబడుతుంది అని తాజా సమాచారం.'
      ],
      repliesEn: [
        'According to official updates, direct bank transfer of ₹20,000 will be credited directly during the third week of this month.'
      ]
    }
  ]);

  const [newPostTitle, setNewPostTitle] = useState('');
  const [newPostCat, setNewPostCat] = useState('Pest Control');

  // Crop Suggestion Calculator Tool
  const [soilType, setSoilType] = useState<string>('red');
  const [seasonSelect, setSeasonSelect] = useState<string>('kharif');
  const [suggestDistrict, setSuggestDistrict] = useState<string>('Anantapuramu');
  const [waterAvailability, setWaterAvailability] = useState<string>('medium');
  const [farmSizeCategory, setFarmSizeCategory] = useState<string>('medium');
  const [calcResult, setCalcResult] = useState<any>(null);

  // Weather Advisor State
  const [weatherCrop, setWeatherCrop] = useState<'paddy' | 'chilli' | 'cotton' | 'maize' | 'groundnut'>('paddy');
  const [weatherStation, setWeatherStation] = useState<string>('Guntur');

  // Emergency Grid State with complete bilingual assets built in
  const [emergencies, setEmergencies] = useState<any[]>([
    {
      id: 'em_101',
      villageTe: 'మంగళగిరి శివారు పొలాలు',
      villageEn: 'Mangalagiri Outer Fields',
      machineryNeededTe: 'హై వాల్యూమ్ సబ్‌మెర్сиబుల్ వాటర్ పంప్ (10 HP)',
      machineryNeededEn: 'High Volume Submersible Water Pump (10 HP)',
      priority: 'CRITICAL',
      problemTe: 'స్థానిక కాలువ లీకేజీ వల్ల 4 ఎకరాల మొక్కజొన్న పొలం మునిగిపోతోంది. అత్యవసరంగా నీటి పంప్ అవసరం.',
      problemEn: 'Emergency SOS: Sudden local canal leakage flooded 4 acres of maize fields. Immediate water drainage required.',
      contact: '99884 41100 (Sastry)',
      status: 'OPEN'
    },
    {
      id: 'em_102',
      villageTe: 'తెనాలి దక్షిణ బ్లాక్',
      villageEn: 'Tenali South Block',
      machineryNeededTe: 'రొటవేటర్ అటాచ్‌మెంట్ ఉన్న ట్రాక్టర్',
      machineryNeededEn: 'Heavy Tractor with Rotavator Attachment',
      priority: 'HIGH',
      problemTe: 'ఉరుములు పడే లోపు పొలం సిద్ధం చేయాలి, కానీ మా సొంత మెషిన్ మధ్యలో పాడైపోయింది.',
      problemEn: 'Our own tractor machine broke down mid-clearing before scheduled rain block. Requesting rotary tiller help.',
      contact: '90123 45678 (Kishore)',
      status: 'RESOLVING'
    }
  ]);

  const [newEmerVillage, setNewEmerVillage] = useState('');
  const [newEmerNeed, setNewEmerNeed] = useState('');
  const [newEmerProblem, setNewEmerProblem] = useState('');
  const [newEmerContact, setNewEmerContact] = useState('');

  // Government Scheme form application state
  const [appliedScheme, setAppliedScheme] = useState<string | null>(null);

  // Interactive Subsidy & Airing calculator state variables
  const [subsidyLandAcres, setSubsidyLandAcres] = useState<number>(3);
  const [subsidyCategory, setSubsidyCategory] = useState<'general' | 'obc' | 'sc_st' | 'tenant' | 'women'>('general');
  const [subsidyMachinery, setSubsidyMachinery] = useState<'tractor' | 'harvester' | 'drone' | 'water_pump' | 'weeder'>('water_pump');
  const [subsidyAadhaar, setSubsidyAadhaar] = useState<string>('');
  const [subsidyPassbook, setSubsidyPassbook] = useState<string>('');
  const [simulatedCertificate, setSimulatedCertificate] = useState<any | null>(null);

  // Smart Crop Recommendation Engine
  const handleCalculateCrop = (e: React.FormEvent) => {
    e.preventDefault();

    let crops = [];
    let sowingWindowTe = '15 జూన్ - 10 జూలై';
    let sowingWindowEn = '15 June – 10 July';
    let rainfallTe = 'సాధారణం కంటే ఎక్కువ వర్షపాతం అంచనా (మంచి నైరుతి రుతుపవనాలు)';
    let rainfallEn = 'Above Normal Rainfall Expected (Favorable Monsoon Moisture)';
    let pestAlertTe = 'మధ్యస్థ గులాబీ రంగు పురుగు నివారణ & అగ్గితెగులు ముందస్తు జాగ్రత్తలు';
    let pestAlertEn = 'Moderate Pest Alert: Monitor for Pink Bollworm & Blast Disease';

    if (soilType === 'black') {
      if (seasonSelect === 'kharif') {
        crops = [
          {
            nameTe: 'పత్తి (BT Cotton)',
            nameEn: 'BT Cotton',
            icon: '🧶',
            matchPercent: waterAvailability === 'high' ? 96 : 91,
            waterNeedTe: 'మధ్యస్థం (Medium)',
            waterNeedEn: 'Medium (Rainfed / Drip)',
            expectedYieldTe: '15 - 18 క్వింటాళ్లు / ఎకరా',
            expectedYieldEn: '15 - 18 Quintals / Acre',
            estimatedProfitTe: '₹32,000 - ₹42,000 / ఎకరా',
            estimatedProfitEn: '₹32,000 - ₹42,000 / Acre',
            seedRateTe: '2 కేజీలు / ఎకరా',
            seedRateEn: '2 kg / Acre',
            spacing: '90cm x 60cm',
            badgeTe: 'అత్యధిక నికర ఆదాయం',
            badgeEn: 'Top Net Return',
          },
          {
            nameTe: 'హైబ్రిడ్ మొక్కజొన్న (Hybrid Maize)',
            nameEn: 'Hybrid Maize',
            icon: '🌽',
            matchPercent: 88,
            waterNeedTe: 'మధ్యస్థం (Medium)',
            waterNeedEn: 'Medium',
            expectedYieldTe: '30 - 35 క్వింటాళ్లు / ఎకరా',
            expectedYieldEn: '30 - 35 Quintals / Acre',
            estimatedProfitTe: '₹28,000 - ₹34,000 / ఎకరా',
            estimatedProfitEn: '₹28,000 - ₹34,000 / Acre',
            seedRateTe: '8 కేజీలు / ఎకరా',
            seedRateEn: '8 kg / Acre',
            spacing: '60cm x 20cm',
            badgeTe: 'వేగవంతమైన దిగుబడి',
            badgeEn: 'Fast Crop Cycle',
          },
          {
            nameTe: 'మినుములు (Black Gram / Urad)',
            nameEn: 'Black Gram (Urad)',
            icon: '🫘',
            matchPercent: 83,
            waterNeedTe: 'తక్కువ (Low)',
            waterNeedEn: 'Low (Drought Resilient)',
            expectedYieldTe: '8 - 10 క్వింటాళ్లు / ఎకరా',
            expectedYieldEn: '8 - 10 Quintals / Acre',
            estimatedProfitTe: '₹22,000 - ₹28,000 / ఎకరా',
            estimatedProfitEn: '₹22,000 - ₹28,000 / Acre',
            seedRateTe: '10 కేజీలు / ఎకరా',
            seedRateEn: '10 kg / Acre',
            spacing: '30cm x 10cm',
            badgeTe: 'తక్కువ ఖర్చు',
            badgeEn: 'Low Cost Input',
          }
        ];
        sowingWindowTe = '20 జూన్ - 15 జూలై';
        sowingWindowEn = '20 June – 15 July';
      } else if (seasonSelect === 'rabi') {
        crops = [
          {
            nameTe: 'శనగలు (Bengal Gram / Chickpea)',
            nameEn: 'Bengal Gram (Chickpea)',
            icon: '🫘',
            matchPercent: 95,
            waterNeedTe: 'తక్కువ (Low)',
            waterNeedEn: 'Low (Residual Moisture)',
            expectedYieldTe: '10 - 12 క్వింటాళ్లు / ఎకరా',
            expectedYieldEn: '10 - 12 Quintals / Acre',
            estimatedProfitTe: '₹25,000 - ₹32,000 / ఎకరా',
            estimatedProfitEn: '₹25,000 - ₹32,000 / Acre',
            seedRateTe: '35 కేజీలు / ఎకరా',
            seedRateEn: '35 kg / Acre',
            spacing: '30cm x 10cm',
            badgeTe: 'ఉత్తమ రబీ ఎంపిక',
            badgeEn: 'Top Rabi Recommendation',
          },
          {
            nameTe: 'పొగాకు (FCV Tobacco)',
            nameEn: 'FCV Commercial Tobacco',
            icon: '🍂',
            matchPercent: 87,
            waterNeedTe: 'మధ్యస్థం (Medium)',
            waterNeedEn: 'Medium',
            expectedYieldTe: '12 - 14 క్వింటాళ్లు / ఎకరా',
            expectedYieldEn: '12 - 14 Quintals / Acre',
            estimatedProfitTe: '₹35,000 - ₹45,000 / ఎకరా',
            estimatedProfitEn: '₹35,000 - ₹45,000 / Acre',
            seedRateTe: '25 గ్రాములు (నూర్సరీ)',
            seedRateEn: '25 grams (Nursery)',
            spacing: '60cm x 60cm',
            badgeTe: 'అధిక మార్కెట్ లాభం',
            badgeEn: 'High Commercial Demand',
          }
        ];
        sowingWindowTe = '15 అక్టోబర్ - 15 నవంబర్';
        sowingWindowEn = '15 October – 15 November';
      } else {
        crops = [
          {
            nameTe: 'నువ్వులు (Sesame Seeds)',
            nameEn: 'Sesame Seeds',
            icon: '🌱',
            matchPercent: 90,
            waterNeedTe: 'తక్కువ (Low)',
            waterNeedEn: 'Low',
            expectedYieldTe: '4 - 5 క్వింటాళ్లు / ఎకరా',
            expectedYieldEn: '4 - 5 Quintals / Acre',
            estimatedProfitTe: '₹20,000 - ₹26,000 / ఎకరా',
            estimatedProfitEn: '₹20,000 - ₹26,000 / Acre',
            seedRateTe: '2 కేజీలు / ఎకరా',
            seedRateEn: '2 kg / Acre',
            spacing: '30cm x 15cm',
            badgeTe: 'వేసవికి అనుకూలం',
            badgeEn: 'Ideal Summer Selection',
          }
        ];
        sowingWindowTe = '01 ఫిబ్రవరి - 28 ఫిబ్రవరి';
        sowingWindowEn = '01 February – 28 February';
      }
    } else if (soilType === 'loamy') {
      if (waterAvailability === 'high') {
        crops = [
          {
            nameTe: 'స్వర్ణ/బిపిటి వరి (Swarna Paddy)',
            nameEn: 'Swarna / BPT Paddy',
            icon: '🌾',
            matchPercent: 97,
            waterNeedTe: 'చాలా ఎక్కువ (High)',
            waterNeedEn: 'High (Irrigation Canal / Bore)',
            expectedYieldTe: '32 - 38 క్వింటాళ్లు / ఎకరా',
            expectedYieldEn: '32 - 38 Quintals / Acre',
            estimatedProfitTe: '₹30,000 - ₹38,000 / ఎకరా',
            estimatedProfitEn: '₹30,000 - ₹38,000 / Acre',
            seedRateTe: '25 కేజీలు / ఎకరా',
            seedRateEn: '25 kg / Acre',
            spacing: '20cm x 15cm',
            badgeTe: 'అత్యుత్తమ దిగుబడి సామర్థ్యం',
            badgeEn: 'Maximum Yield Potential',
          },
          {
            nameTe: 'చెరకు (Sugarcane)',
            nameEn: 'Commercial Sugarcane',
            icon: '🎋',
            matchPercent: 89,
            waterNeedTe: 'చాలా ఎక్కువ (High)',
            waterNeedEn: 'High',
            expectedYieldTe: '40 - 50 టన్నులు / ఎకరా',
            expectedYieldEn: '40 - 50 Tons / Acre',
            estimatedProfitTe: '₹45,000 - ₹60,000 / ఎకరా',
            estimatedProfitEn: '₹45,000 - ₹60,000 / Acre',
            seedRateTe: '40,000 సెట్స్ / ఎకరా',
            seedRateEn: '40,000 Setts / Acre',
            spacing: '90cm Single Row',
            badgeTe: 'వార్షిక స్థిర ఆదాయం',
            badgeEn: 'High Annual Income',
          }
        ];
        sowingWindowTe = '01 జూలై - 25 జూలై';
        sowingWindowEn = '01 July – 25 July';
      } else {
        crops = [
          {
            nameTe: 'హైబ్రిడ్ మిరప (Red Chilli)',
            nameEn: 'Hybrid Red Chilli',
            icon: '🌶️',
            matchPercent: 94,
            waterNeedTe: 'మధ్యస్థం (Medium - Drip)',
            waterNeedEn: 'Medium (Drip Irrigation)',
            expectedYieldTe: '20 - 25 క్వింటాళ్లు / ఎకరా',
            expectedYieldEn: '20 - 25 Quintals / Acre',
            estimatedProfitTe: '₹50,000 - ₹75,000 / ఎకరా',
            estimatedProfitEn: '₹50,000 - ₹75,000 / Acre',
            seedRateTe: '1 కేజీ / ఎకరా (నూర్సరీ)',
            seedRateEn: '1 kg / Acre (Nursery)',
            spacing: '60cm x 45cm',
            badgeTe: 'అత్యధిక లాభదాయకం',
            badgeEn: 'Highest Market Demand',
          },
          {
            nameTe: 'మొక్కజొన్న (Commercial Maize)',
            nameEn: 'Commercial Maize',
            icon: '🌽',
            matchPercent: 88,
            waterNeedTe: 'మధ్యస్థం (Medium)',
            waterNeedEn: 'Medium',
            expectedYieldTe: '32 - 36 క్వింటాళ్లు / ఎకరా',
            expectedYieldEn: '32 - 36 Quintals / Acre',
            estimatedProfitTe: '₹28,000 - ₹35,000 / ఎకరా',
            estimatedProfitEn: '₹28,000 - ₹35,000 / Acre',
            seedRateTe: '8 కేజీలు / ఎకరా',
            seedRateEn: '8 kg / Acre',
            spacing: '60cm x 20cm',
            badgeTe: 'స్థిరమైన మార్కెట్ ధర',
            badgeEn: 'Stable Commercial Market',
          }
        ];
      }
    } else if (soilType === 'sandy') {
      crops = [
        {
          nameTe: 'పుచ్చకాయ (Watermelon / Muskmelon)',
          nameEn: 'Watermelon / Muskmelon',
          icon: '🍉',
          matchPercent: 95,
          waterNeedTe: 'మధ్యస్థం (Drip)',
          waterNeedEn: 'Medium (Drip Mulching)',
          expectedYieldTe: '15 - 20 టన్నులు / ఎకరా',
          expectedYieldEn: '15 - 20 Tons / Acre',
          estimatedProfitTe: '₹40,000 - ₹55,000 / ఎకరా',
          estimatedProfitEn: '₹40,000 - ₹55,000 / Acre',
          seedRateTe: '1.5 కేజీలు / ఎకరా',
          seedRateEn: '1.5 kg / Acre',
          spacing: '1.5m x 1.0m',
          badgeTe: 'తక్కువ కాలపరిమితి (80 రోజులు)',
          badgeEn: 'Short Duration (80 Days)',
        },
        {
          nameTe: 'వేరుశనగ (Groundnut)',
          nameEn: 'Groundnut (Peanut)',
          icon: '🫘',
          matchPercent: 89,
          waterNeedTe: 'మధ్యస్థం (Medium)',
          waterNeedEn: 'Medium',
          expectedYieldTe: '12 - 15 క్వింటాళ్లు / ఎకరా',
          expectedYieldEn: '12 - 15 Quintals / Acre',
          estimatedProfitTe: '₹26,000 - ₹34,000 / ఎకరా',
          estimatedProfitEn: '₹26,000 - ₹34,000 / Acre',
          seedRateTe: '65 - 70 కేజీలు / ఎకరా',
          seedRateEn: '65 - 70 kg / Acre',
          spacing: '30cm x 10cm',
          badgeTe: 'ఇసుక నేలలకు అనుకూలం',
          badgeEn: 'Ideal for River Sandy Soil',
        }
      ];
      sowingWindowTe = '10 జనవరి - 15 ఫిబ్రవరి';
      sowingWindowEn = '10 January – 15 February';
    } else {
      // Red Soil / Laterite
      crops = [
        {
          nameTe: 'కదిరి-6 వేరుశనగ (Kadiri Groundnut)',
          nameEn: 'Kadiri-6 Groundnut',
          icon: '🫘',
          matchPercent: 95,
          waterNeedTe: 'తక్కువ - మధ్యస్థం',
          waterNeedEn: 'Low to Medium',
          expectedYieldTe: '14 - 16 క్వింటాళ్లు / ఎకరా',
          expectedYieldEn: '14 - 16 Quintals / Acre',
          estimatedProfitTe: '₹28,000 - ₹35,000 / ఎకరా',
          estimatedProfitEn: '₹28,000 - ₹35,000 / Acre',
          seedRateTe: '65 - 70 కేజీలు / ఎకరా',
          seedRateEn: '65 - 70 kg / Acre',
          spacing: '30cm x 10cm',
          badgeTe: 'రాయలసీమ కరువు నిరోధక రకం',
          badgeEn: 'Drought Resilient Crop',
        },
        {
          nameTe: 'కందులు (Red Gram / Pigeon Pea)',
          nameEn: 'Red Gram (Pigeon Pea)',
          icon: '🌱',
          matchPercent: 88,
          waterNeedTe: 'తక్కువ (Low)',
          waterNeedEn: 'Low (Rainfed)',
          expectedYieldTe: '6 - 8 క్వింటాళ్లు / ఎకరా',
          expectedYieldEn: '6 - 8 Quintals / Acre',
          estimatedProfitTe: '₹22,000 - ₹28,000 / ఎకరా',
          estimatedProfitEn: '₹22,000 - ₹28,000 / Acre',
          seedRateTe: '4 - 5 కేజీలు / ఎకరా',
          seedRateEn: '4 - 5 kg / Acre',
          spacing: '120cm x 20cm',
          badgeTe: 'నేల నత్రజని సారం పెంచుతుంది',
          badgeEn: 'Soil Nitrogen Enricher',
        },
        {
          nameTe: 'హైబ్రిడ్ జొన్నలు (Sorghum Millet)',
          nameEn: 'Hybrid Sorghum Millet',
          icon: '🌾',
          matchPercent: 82,
          waterNeedTe: 'చాలా తక్కువ (Very Low)',
          waterNeedEn: 'Very Low',
          expectedYieldTe: '10 - 12 క్వింటాళ్లు / ఎకరా',
          expectedYieldEn: '10 - 12 Quintals / Acre',
          estimatedProfitTe: '₹18,000 - ₹24,000 / ఎకరా',
          estimatedProfitEn: '₹18,000 - ₹24,000 / Acre',
          seedRateTe: '4 కేజీలు / ఎకరా',
          seedRateEn: '4 kg / Acre',
          spacing: '45cm x 15cm',
          badgeTe: 'డ్రైల్యాండ్ సూపర్ పంట',
          badgeEn: 'Super Dryland Crop',
        }
      ];
    }

    setCalcResult({
      accuracy: 94,
      district: suggestDistrict,
      sowingWindowTe,
      sowingWindowEn,
      rainfallTe,
      rainfallEn,
      pestAlertTe,
      pestAlertEn,
      crops
    });

    triggerToast(language === 'te' ? 'స్మార్ట్ పంటల సిఫార్సులు సిద్ధమయ్యాయి!' : 'Smart Crop Recommendations Generated!', 'success');
  };

  // Add Forum post
  const handleAddPost = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPostTitle.trim()) return;
    const fresh = {
      id: `post_${Date.now()}`,
      authorTe: 'ఆంధ్ర రైతు సదస్యుడు',
      authorEn: 'AP Cooperative Farmer',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150',
      titleTe: newPostTitle,
      titleEn: newPostTitle,
      categoryTe: newPostCat === 'Pest Control' ? 'కీటక నివారణ' : newPostCat === 'Fertiliser' ? 'ఎరువులు' : 'సబ్సిడీలు',
      categoryEn: newPostCat,
      likes: 1,
      repliesCount: 0,
      timeTe: 'ఇప్పుడే',
      timeEn: 'Just Now',
      repliesTe: [],
      repliesEn: []
    };
    setForumPosts([fresh, ...forumPosts]);
    setNewPostTitle('');
    triggerToast(language === 'te' ? 'మీ సందేహం ఫోరమ్‌లో చేర్చబడింది!' : 'Forum topic published!', 'success');
  };

  // Upvote post
  const handleLikePost = (id: string) => {
    setForumPosts(forumPosts.map(p => {
      if (p.id === id) {
        return { ...p, likes: p.likes + 1 };
      }
      return p;
    }));
  };

  // Add Emergency rescue request
  const handleAddEmergency = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEmerVillage.trim() || !newEmerNeed.trim()) {
      triggerToast('Please fill out the needed rescue details.', 'error');
      return;
    }
    const fresh = {
      id: `em_${Date.now()}`,
      villageTe: newEmerVillage,
      villageEn: newEmerVillage,
      machineryNeededTe: newEmerNeed,
      machineryNeededEn: newEmerNeed,
      priority: 'CRITICAL' as const,
      problemTe: newEmerProblem,
      problemEn: newEmerProblem,
      contact: newEmerContact,
      status: 'OPEN' as const
    };
    setEmergencies([fresh, ...emergencies]);
    setNewEmerVillage('');
    setNewEmerNeed('');
    setNewEmerProblem('');
    setNewEmerContact('');
    triggerToast(language === 'te' ? 'అత్యవసర సహాయ అభ్యర్థన పోస్ట్ చేయబడింది!' : 'Emergency SOS request broadcasted to neighbors!', 'success');
  };

  return (
    <div id="additional-cooperative-utilities" className="flex flex-col md:flex-row min-h-[80vh] bg-white rounded-3xl overflow-hidden shadow-xl border border-slate-200">
      
      {/* Sidenav */}
      <aside className="w-full md:w-60 bg-emerald-950 text-slate-200 flex-shrink-0 p-4 font-sans text-left">
        <div className="py-4 border-b border-emerald-800 mb-4 flex items-center gap-2">
          <Compass className="w-5 h-5 text-emerald-400" />
          <h4 className="text-sm font-black uppercase text-emerald-100">
            {language === 'te' ? 'అదనపు సేవలు' : 'Coop Extras'}
          </h4>
        </div>

        <nav className="space-y-1">
          {[
            { id: 'community_forum', label: 'రైతు సామాజిక వేదిక', en: 'Community Forum', icon: Users },
            { id: 'weather_info', label: 'వ్యవసాయ వాతావరణం', en: 'Live Crop Weather', icon: CloudSun },
            { id: 'gov_schemes', label: 'ప్రభుత్వ పథకాల సమాచారం', en: 'Government Schemes', icon: LandmarkIcon },
            { id: 'crop_suggestions', label: 'నేల పట్టిక పంట సలహా', en: 'Crop Recommendation', icon: Sprout },
            { id: 'emerg_requests', label: 'అత్యవసర యంత్రాల సహాయం', en: 'Emergency Requests', icon: AlertOctagon },
            { id: 'lang_settings', label: 'భాష సెట్టింగ్స్ - Language', en: 'Language Switcher', icon: Globe }
          ].map(item => {
            const Icon = item.icon;
            const active = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id as ExtraPageId)}
                className={`w-full flex items-center gap-2 px-3 py-2.5 rounded-xl text-[11px] font-bold tracking-wide text-left transition-all ${
                  active 
                    ? 'bg-[#1b6d24] text-white' 
                    : 'text-emerald-300/80 hover:bg-emerald-900/60 hover:text-white'
                }`}
              >
                <Icon className="w-3.5 h-3.5 flex-shrink-0" />
                <span>{language === 'te' ? item.label : item.en}</span>
              </button>
            );
          })}
        </nav>
      </aside>

      {/* Pane Display */}
      <main className="flex-1 p-5 md:p-8 overflow-y-auto max-w-4xl mx-auto w-full text-slate-800 relative">
        <div className="flex justify-between items-center gap-4 mb-6 border-b border-gray-100 pb-4 animate-fade-in" id="extras-header">
          <div className="flex items-center gap-2">
            <div className="hidden sm:flex w-8 h-8 rounded-full bg-[#1b6d24]/10 items-center justify-center">
              <Sprout className="w-4 h-4 text-[#1b6d24]" />
            </div>
            <div>
              <h2 className="text-xs sm:text-sm font-black uppercase tracking-wider text-[#1b6d24]">
                {language === 'te' ? 'అగ్రిటెక్ అదనపు సేవలు' : 'Agritech Extension Services'}
              </h2>
              <p className="text-[9.5px] text-gray-400 font-bold block leading-none mt-0.5">
                {language === 'te' ? 'రైతు సామాజిక వేదిక మరియు సహాయ కేంద్రం' : 'Knowledge Center & Community SOS'}
              </p>
            </div>
          </div>
          
          <button
            onClick={onLanguageToggle}
            className="bg-emerald-50 hover:bg-emerald-100 text-[#1b6d24] border border-[#1b6d24]/10 p-1.5 px-3 rounded-full flex items-center gap-1.5 active:scale-95 transition-all text-[10px] font-extrabold cursor-pointer"
            id="btn-extras-lang-toggle"
          >
            <Globe className="w-3.5 h-3.5 text-[#1b6d24]" />
            <span className="uppercase">{language === 'te' ? 'English' : 'తెలుగు'}</span>
          </button>
        </div>
        
        {/* TAB 1: COMMUNITY FORUM */}
        {activeTab === 'community_forum' && (
          <div className="space-y-6">
            <div>
              <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">{language === 'te' ? 'ఆంధ్రప్రదేశ్ సన్నకారు రైతుల ఫోరమ్' : 'Cooperative Farmers Knowledge Sharing'}</h3>
              <p className="text-xs text-slate-450 mt-1">{language === 'te' ? 'రైతులు ఒకరికొకరు ఎరువులు, సాగు సలహాలు, పెస్ట్ నివారణల గురించి అడిగి తెలుసుకునే స్థలం.' : 'Seek opinions, agricultural advice and trade insights with registered local farmers.'}</p>
            </div>

            {/* Posting input form */}
            <form onSubmit={handleAddPost} className="bg-slate-50 border p-4 rounded-2xl space-y-3">
              <span className="text-[10px] text-[#1b6d24] uppercase font-bold tracking-widest">Post to Forum Community</span>
              <input 
                type="text" 
                required
                value={newPostTitle}
                onChange={(e) => setNewPostTitle(e.target.value)}
                placeholder={language === 'te' ? 'మిరప తోట లేదా వరి తెగుళ్ల గురించి మీ సందేహం ఇక్కడ రాయండి...' : 'What agrarian doubt do you have today?'}
                className="w-full text-xs font-bold bg-white border rounded-xl py-2 px-3 focus:outline-none" 
              />
              <div className="flex justify-between items-center">
                <select value={newPostCat} onChange={(e) => setNewPostCat(e.target.value)} className="text-[10px] font-bold border rounded p-1 bg-white">
                  <option value="Pest Control">Pest Control</option>
                  <option value="Fertiliser">Fertilisers & Organic Soil</option>
                  <option value="Coop Subsidies">Coop Subsidies</option>
                </select>
                <button type="submit" className="bg-[#1b6d24] text-white text-[10.5px] font-bold px-3 py-1.5 rounded-lg">
                  Publish Query
                </button>
              </div>
            </form>

            {/* List */}
            <div className="space-y-3">
              {forumPosts.map(post => {
                const author = language === 'te' ? (post.authorTe || post.author) : (post.authorEn || post.author);
                const title = language === 'te' ? (post.titleTe || post.title) : (post.titleEn || post.title);
                const category = language === 'te' ? (post.categoryTe || post.category) : (post.categoryEn || post.category);
                const timeStr = language === 'te' ? (post.timeTe || post.time) : (post.timeEn || post.time);
                const repliesList = language === 'te' ? (post.repliesTe || post.replies) : (post.repliesEn || post.replies);

                return (
                  <div key={post.id} className="bg-white border rounded-2xl p-4 space-y-3">
                    <div className="flex items-center gap-2.5">
                      <img src={post.avatar || "user"} alt={author} className="w-8 h-8 rounded-full object-cover border" />
                      <div>
                        <h4 className="text-xs font-black text-slate-800">{author}</h4>
                        <p className="text-[9.5px] text-slate-400">{timeStr} • {language === 'te' ? 'వర్గం' : 'Category'}: {category}</p>
                      </div>
                    </div>

                    <p className="text-xs font-extrabold text-slate-750 line-clamp-3">"{title}"</p>

                    <div className="flex items-center gap-4 text-xs">
                      <button onClick={() => handleLikePost(post.id)} className="flex items-center gap-1 text-slate-400 hover:text-emerald-700">
                        <ThumbsUp className="w-3.5 h-3.5" />
                        <span>{post.likes} {language === 'te' ? 'సహాయపడింది' : 'Helpful'}</span>
                      </button>
                      <span className="text-slate-400 text-[10.5px]">💬 {repliesList.length} {language === 'te' ? 'సమాధానాలు' : 'replies'}</span>
                    </div>

                    {repliesList && repliesList.length > 0 && (
                      <div className="bg-slate-50 border-l-2 border-emerald-600 rounded p-3 space-y-1.5 text-xs">
                        <span className="text-[9px] uppercase font-black text-emerald-800">
                          {language === 'te' ? 'రైతు నేరుగా ఇచ్చిన సమాధానం:' : 'Direct Farmer Answers:'}
                        </span>
                        {repliesList.map((rep: string, rIdx: number) => (
                          <p key={rIdx} className="text-slate-755 font-medium">↳ {rep}</p>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB 2: LIVE CROP WEATHER */}
        {activeTab === 'weather_info' && (() => {
          const cropAdvisoriesData: Record<string, any> = {
            paddy: {
              cropTe: 'వరి (Paddy)',
              cropEn: 'Paddy',
              icon: '🌾',
              sprayIndexBadgeTe: '🟢 24-గంటల స్ప్రే ఇండెక్స్: అత్యుత్తమ స్థితి (EXCELLENT)',
              sprayIndexBadgeEn: '🟢 24-Hour Spray Index: EXCELLENT',
              sprayColor: 'emerald',
              summaryTe: 'నేడు పొలంలో గులాబీ పురుగు, అగ్గితెగులు నివారణ మందులు పిచికారీ చేయడానికి అనుకూల వాతావరణం ఉంది.',
              summaryEn: 'Optimal humidity and leaf dryness for blast disease and stem borer management spraying.',
              pointsTe: [
                'గాలి వేగం 14 km/h లోపే ఉన్నందున విచక్షణరహితంగా మందు పిచికారీ కాకుండా సమానంగా పడుతుంది',
                'మధ్యస్థ ఉష్ణోగ్రత మూలంగా ఆకులపై మందు త్వరగా శోషించబడుతుంది',
                'మధ్యాహ్నం 12 PM - 3 PM మధ్య వేడి ఎక్కువగా ఉండును కావున ఉదయం వేళల్లో స్ప్రే చేయండి'
              ],
              pointsEn: [
                'Wind speed at 14 km/h ensures safe, uniform spray application without drift',
                'Soil moisture at 64% provides ideal root uptake for systemics',
                'High UV index at noon — complete spraying before 10 AM'
              ],
              activities: [
                { labelTe: '🌱 నీటి యాజమాన్యం (Irrigation)', labelEn: '🌱 Irrigation', statusTe: '✅ అనుకూలం (2-3 సెం.మీ నీరు ఉంచండి)', statusEn: '✅ Recommended (Keep 2-3cm water)', color: 'emerald' },
                { labelTe: '🚜 మందుల పిచికారీ (Spraying)', labelEn: '🚜 Chemical Spraying', statusTe: '✅ సురక్షితం (ఉదయం 6-9 AM)', statusEn: '✅ Safe (Best 6–9 AM)', color: 'emerald' },
                { labelTe: '🌾 పంట కోత (Harvesting)', labelEn: '🌾 Harvesting', statusTe: '⚠️ మధ్యాహ్నం వద్దు (Avoid Afternoon)', statusEn: '⚠️ Avoid Afternoon Heat', color: 'amber' },
                { labelTe: '🌿 ఎరువుల వేత (Fertilizer)', labelEn: '🌿 Fertilizer Application', statusTe: '✅ చాలా అనుకూలం (Top Dressing)', statusEn: '✅ Suitable (Top Dressing)', color: 'emerald' },
              ]
            },
            chilli: {
              cropTe: 'మిరప (Red Chilli)',
              cropEn: 'Red Chilli',
              icon: '🌶️',
              sprayIndexBadgeTe: '🟢 24-గంటల స్ప్రే ఇండెక్స్: అత్యుత్తమ స్థితి (EXCELLENT)',
              sprayIndexBadgeEn: '🟢 24-Hour Spray Index: EXCELLENT',
              sprayColor: 'emerald',
              summaryTe: 'మిరపలో నల్ల తామర పురుగు & నల్లాకోడి నివారణకు ఉదయం వేళ స్ప్రింక్లర్/స్ప్రే చేయడానికి అనుకూలం.',
              summaryEn: 'Ideal micro-climate for Black Thrips & Mite spraying during early morning hours.',
              pointsTe: [
                'గాలి ప్రవాహం అనుకూలంగా ఉన్నందున స్ప్రే బిందువులు మొక్కల దిగువ ఆకుల వరకు చేరుతాయి',
                'డ్రిప్ ద్వారా నీటిని అందిస్తూ ఫర్టిగేషన్ ఇవ్వడానికి మంచి సమయం',
                'వర్షసూచన 15% మాత్రమే ఉన్నందున పీచికారీ వ్యర్థం కాదు'
              ],
              pointsEn: [
                'Moderate wind velocity ensures uniform chemical coverage under canopy',
                'Low 15% rain risk guarantees zero chemical wash-off',
                'Drip fertigation recommended during morning cycle'
              ],
              activities: [
                { labelTe: '🌱 నీటి యాజమాన్యం (Irrigation)', labelEn: '🌱 Irrigation', statusTe: '✅ డ్రిప్ ద్వారా ఇవ్వండి (Drip Only)', statusEn: '✅ Recommended (Drip Only)', color: 'emerald' },
                { labelTe: '🚜 మందుల పిచికారీ (Spraying)', labelEn: '🚜 Chemical Spraying', statusTe: '✅ ఉదయం 6-9 సురక్షితం (Safe)', statusEn: '✅ Safe (Best 6–9 AM)', color: 'emerald' },
                { labelTe: '🌾 కోతలు / ఏరడం (Picking)', labelEn: '🌾 Pod Picking', statusTe: '✅ అనుకూలం (Suitable)', statusEn: '✅ Suitable', color: 'emerald' },
                { labelTe: '🌿 ఎరువుల వేత (Fertilizer)', labelEn: '🌿 Fertigation', statusTe: '✅ ఫర్టిగేషన్ అనుకూలం', statusEn: '✅ Ideal via Drip', color: 'emerald' },
              ]
            },
            cotton: {
              cropTe: 'పత్తి (Cotton)',
              cropEn: 'Cotton',
              icon: '🧶',
              sprayIndexBadgeTe: '🟢 24-గంటల స్ప్రే ఇండెక్స్: సురక్షితం (SAFE)',
              sprayIndexBadgeEn: '🟢 24-Hour Spray Index: SAFE',
              sprayColor: 'emerald',
              summaryTe: 'పత్తి పొలంలో గులాబీ రంగు పురుగు నివారణకు వేప నూనె లేదా కెమికల్ స్ప్రే చేయడానికి పొడి వాతావరణం అనుకూలం.',
              summaryEn: 'Dry foliage conditions ideal for pink bollworm management and boll inspection.',
              pointsTe: [
                'లింగ ఆకర్షణ బుట్టలు తనిఖీ చేసి గులాబీ పురుగు ఉధృతిని గమనించండి',
                'మధ్యాహ్నం ముందు పిచికారీ ముగించడం శ్రేయస్కరం',
                'ఆకులపై తేమ ఆరిపోయిన తర్వాత స్ప్రే చేయండి'
              ],
              pointsEn: [
                'Check pink bollworm pheromone traps today',
                'Apply foliar spray after morning dew clears around 8 AM',
                'Ideal picking conditions after 9 AM'
              ],
              activities: [
                { labelTe: '🌱 నీటి యాజమాన్యం (Irrigation)', labelEn: '🌱 Irrigation', statusTe: '🟢 తేలికపాటి తడి (Light Irrigation)', statusEn: '🟢 Light Irrigation', color: 'emerald' },
                { labelTe: '🚜 మందుల పిచికారీ (Spraying)', labelEn: '🚜 Chemical Spraying', statusTe: '✅ సురక్షితం (Safe)', statusEn: '✅ Safe Condition', color: 'emerald' },
                { labelTe: '🌾 పత్తి ఏరడం (Picking)', labelEn: '🌾 Cotton Picking', statusTe: '✅ అత్యంత అనుకూలం (Highly Recommended)', statusEn: '✅ Highly Recommended', color: 'emerald' },
                { labelTe: '🌿 ఎరువుల వేత (Fertilizer)', labelEn: '🌿 Foliar Feeding', statusTe: '✅ స్ప్రే రూపంలో ఇవ్వవచ్చు', statusEn: '✅ Foliar Feeding Suitable', color: 'emerald' },
              ]
            },
            maize: {
              cropTe: 'మొక్కజొన్న (Maize)',
              cropEn: 'Maize',
              icon: '🌽',
              sprayIndexBadgeTe: '🟢 24-గంటల స్ప్రే ఇండెక్స్: అత్యుత్తమ స్థితి (EXCELLENT)',
              sprayIndexBadgeEn: '🟢 24-Hour Spray Index: EXCELLENT',
              sprayColor: 'emerald',
              summaryTe: 'మొక్కజొన్నలో కత్తెర పురుగు (Fall Armyworm) నివారణకు సుడిలో గుళికలు వేయడానికి అనుకూల సమయం.',
              summaryEn: 'Fall Armyworm whorl application recommended. Dry leaf whorls ensure maximum efficacy.',
              pointsTe: [
                'సుడిలో నీరు లేనందున పురుగు నివారణ గుళికలు వేయడం లేదా మందు పిచికారీ శ్రేయస్కరం',
                'యూరియా మేలైన మోతాదులో సుడి పక్కన వేయవచ్చు',
                'వాతావరణం పొడిగా ఉన్నందున పని త్వరగా పూర్తవుతుంది'
              ],
              pointsEn: [
                'Dry whorls maximize efficacy of bio-pesticide granules',
                'Safe for urea top-dressing along crop rows',
                'Low wind speed prevents granule loss'
              ],
              activities: [
                { labelTe: '🌱 నీటి యాజమాన్యం (Irrigation)', labelEn: '🌱 Irrigation', statusTe: '✅ అనుకూలం (Recommended)', statusEn: '✅ Recommended', color: 'emerald' },
                { labelTe: '🚜 మందుల పిచికారీ (Spraying)', labelEn: '🚜 Whorl Application', statusTe: '✅ సురక్షితం (Safe)', statusEn: '✅ Safe', color: 'emerald' },
                { labelTe: '🌾 కోత యంత్రాలు (Harvesting)', labelEn: '🌾 Harvesting', statusTe: '✅ సురక్షితం (Safe)', statusEn: '✅ Safe', color: 'emerald' },
                { labelTe: '🌿 ఎరువుల వేత (Fertilizer)', labelEn: '🌿 Urea Top Dressing', statusTe: '✅ యూరియా వేత సురక్షితం', statusEn: '✅ Top Dressing Safe', color: 'emerald' },
              ]
            },
            groundnut: {
              cropTe: 'వేరుశనగ (Groundnut)',
              cropEn: 'Groundnut',
              icon: '🫘',
              sprayIndexBadgeTe: '🟢 24-గంటల స్ప్రే ఇండెక్స్: అత్యుత్తమ స్థితి (EXCELLENT)',
              sprayIndexBadgeEn: '🟢 24-Hour Spray Index: EXCELLENT',
              sprayColor: 'emerald',
              summaryTe: 'వేరుశనగలో ఆకుమచ్చ తెగులు నివారణకు మరియు గుంటక (Inter-cultivation) తోలడానికి నేల తేమ సరైన స్థాయిలో ఉంది.',
              summaryEn: 'Soil moisture is ideal for inter-cultivation weeding and gypsum top application.',
              pointsTe: [
                'నేలలో 64% తేమ ఉన్నందున కాయ తొడిమ ఊడలు సులభంగా దిగుతాయి',
                'ఆకుమచ్చ నివారణ మందుల స్ప్రింక్లింగ్ కి ఉదయం సమయం శ్రేయస్కరం',
                '24 గంటల వ్యవధిలో వర్షభయం లేదు'
              ],
              pointsEn: [
                '64% soil moisture promotes smooth peg penetration',
                'Gypsum application ideal with current moisture levels',
                'Zero heavy rain threat for the next 24 hours'
              ],
              activities: [
                { labelTe: '🌱 నీటి యాజమాన్యం (Irrigation)', labelEn: '🌱 Irrigation', statusTe: '🟢 తేలికపాటి తడి చాలు (Light Moisture)', statusEn: '🟢 Light Irrigation', color: 'emerald' },
                { labelTe: '🚜 మందుల పిచికారీ (Spraying)', labelEn: '🚜 Chemical Spraying', statusTe: '✅ సురక్షితం (Safe)', statusEn: '✅ Safe Condition', color: 'emerald' },
                { labelTe: '🌾 అంతరకృషి / తొవ్వడం (Weeding)', labelEn: '🌾 Inter-cultivation', statusTe: '✅ అత్యంత అనుకూలం (Ideal)', statusEn: '✅ Highly Recommended', color: 'emerald' },
                { labelTe: '🌿 ఎరువుల వేత (Gypsum)', labelEn: '🌿 Gypsum / Fertilizer', statusTe: '✅ జిప్సమ్ వేయడానికి అనుకూలం', statusEn: '✅ Gypsum Application Ideal', color: 'emerald' },
              ]
            }
          };

          const weatherForecastDays = [
            { dayTe: 'సోమ (నేడు)', dayEn: 'Mon (Today)', icon: '☀️', temp: '32°C', rainProb: '15%', riskTe: '🟢 అనుకూలం', riskEn: '🟢 Safe', color: 'emerald' },
            { dayTe: 'మంగళ', dayEn: 'Tue', icon: '🌦️', temp: '30°C', rainProb: '35%', riskTe: '🟡 మధ్యస్థం', riskEn: '🟡 Moderate', color: 'amber' },
            { dayTe: 'బుధ', dayEn: 'Wed', icon: '🌧️', temp: '28°C', rainProb: '75%', riskTe: '🔴 భారీ వర్షం', riskEn: '🔴 Rain Risk', color: 'red' },
            { dayTe: 'గురు', dayEn: 'Thu', icon: '🌤️', temp: '31°C', rainProb: '15%', riskTe: '🟢 అనుకూలం', riskEn: '🟢 Safe', color: 'emerald' },
            { dayTe: 'శుక్ర', dayEn: 'Fri', icon: '☀️', temp: '33°C', rainProb: '05%', riskTe: '🟢 ఉత్తమం', riskEn: '🟢 Excellent', color: 'emerald' },
          ];

          const apWeatherStationsData: Record<string, {
            id: string;
            districtTe: string;
            districtEn: string;
            nameTe: string;
            nameEn: string;
            temp: number;
            feelsLike: number;
            moisture: number;
            windSpeed: number;
            windDir: string;
            rainProb: number;
            uvIndex: string;
            aqi: number;
            visibility: string;
            conditionTe: string;
            conditionEn: string;
          }> = {
            'Guntur': {
              id: 'Guntur',
              districtTe: 'గుంటూరు',
              districtEn: 'Guntur',
              nameTe: 'గుంటూరు లాం ఫారమ్ ఆర్‌ఏఆర్‌ఎస్ (Guntur LAM RARS)',
              nameEn: 'Guntur LAM Regional Station (RARS)',
              temp: 32,
              feelsLike: 35,
              moisture: 64,
              windSpeed: 14,
              windDir: 'NW',
              rainProb: 15,
              uvIndex: 'High (8)',
              aqi: 45,
              visibility: '8 km',
              conditionTe: 'స్పష్టమైన ఆకాశం • మితమైన గాలి వాలు',
              conditionEn: 'Clear Skies • Gentle Wind Shear'
            },
            'Alluri Sitharama Raju': {
              id: 'Alluri Sitharama Raju',
              districtTe: 'అల్లూరి సీతారామరాజు',
              districtEn: 'Alluri Sitharama Raju',
              nameTe: 'పాడేరు చింతపల్లి కాఫీ & ఏజెన్సీ అగ్రోమెట్ స్టేషన్',
              nameEn: 'Paderu & Chintapalli Agency AgMet Station',
              temp: 24,
              feelsLike: 25,
              moisture: 78,
              windSpeed: 10,
              windDir: 'NE',
              rainProb: 35,
              uvIndex: 'Moderate (5)',
              aqi: 28,
              visibility: '6 km',
              conditionTe: 'చల్లని ఏజెన్సీ హేమంత పవనాలు • తేలికపాటి పొగమంచు',
              conditionEn: 'Cool Hill Breeze • Light Morning Dew'
            },
            'Anakapalli': {
              id: 'Anakapalli',
              districtTe: 'అనకాపల్లి',
              districtEn: 'Anakapalli',
              nameTe: 'అనకాపల్లి చెరకు వ్యవసాయ పరిశోధనా స్థానం (ARS)',
              nameEn: 'Anakapalli Sugarcane Research Station',
              temp: 31,
              feelsLike: 34,
              moisture: 70,
              windSpeed: 16,
              windDir: 'E',
              rainProb: 20,
              uvIndex: 'High (7)',
              aqi: 42,
              visibility: '8 km',
              conditionTe: 'తీరప్రాంత తేమ పవనాలు • పిచికారీకి అనుకూలం',
              conditionEn: 'Coastal Humidity • Good Spray Window'
            },
            'Anantapuramu': {
              id: 'Anantapuramu',
              districtTe: 'అనంతపురము',
              districtEn: 'Anantapuramu',
              nameTe: 'అనంతపురం కరువు మండల పరిశోధనా కేంద్రం (ARS)',
              nameEn: 'Anantapuramu Dryland AgMet Station',
              temp: 35,
              feelsLike: 38,
              moisture: 42,
              windSpeed: 22,
              windDir: 'W',
              rainProb: 5,
              uvIndex: 'Very High (9)',
              aqi: 52,
              visibility: '10 km',
              conditionTe: 'పొడి వాతావరణం • వేడిగాలుల ప్రభావం',
              conditionEn: 'Dry Microclimate • High Wind Drift'
            },
            'Annamayya': {
              id: 'Annamayya',
              districtTe: 'అన్నమయ్య',
              districtEn: 'Annamayya',
              nameTe: 'మదనపల్లె & రాజంపేట వ్యవసాయ పరిశోధన కేంద్రం',
              nameEn: 'Madanapalle & Rajampet AgMet Center',
              temp: 30,
              feelsLike: 32,
              moisture: 55,
              windSpeed: 17,
              windDir: 'SW',
              rainProb: 10,
              uvIndex: 'High (8)',
              aqi: 38,
              visibility: '9 km',
              conditionTe: 'తోటబడి పంటలకు అనుకూల గాలి వేగం',
              conditionEn: 'Optimal Wind Flow for Horticulture'
            },
            'Bapatla': {
              id: 'Bapatla',
              districtTe: 'బాపట్ల',
              districtEn: 'Bapatla',
              nameTe: 'బాపట్ల సముద్రతీర వ్యవసాయ పరిశోధనా స్థానం',
              nameEn: 'Bapatla Coastal AgMet Station',
              temp: 31,
              feelsLike: 35,
              moisture: 76,
              windSpeed: 20,
              windDir: 'SE',
              rainProb: 25,
              uvIndex: 'High (7)',
              aqi: 35,
              visibility: '7 km',
              conditionTe: 'సముద్ర గాలి ప్రవాహం • ఆకు తేమ స్పష్టత',
              conditionEn: 'Sea Breeze Flow • Mild Coastal Humidity'
            },
            'Chittoor': {
              id: 'Chittoor',
              districtTe: 'చిత్తూరు',
              districtEn: 'Chittoor',
              nameTe: 'చిత్తూరు ప్రాంతీయ మామిడి & పంటల అగ్రోమెట్ సెంటర్',
              nameEn: 'Chittoor Regional Mango & Crops AgMet Center',
              temp: 32,
              feelsLike: 34,
              moisture: 58,
              windSpeed: 15,
              windDir: 'S',
              rainProb: 15,
              uvIndex: 'High (8)',
              aqi: 40,
              visibility: '9 km',
              conditionTe: 'మామిడి, టమోటా తోటలకు సురక్షిత వాతావరణం',
              conditionEn: 'Safe Conditions for Orchard Spraying'
            },
            'Dr. B.R. Ambedkar Konaseema': {
              id: 'Dr. B.R. Ambedkar Konaseema',
              districtTe: 'డాక్టర్ బి.ఆర్. అంబేడ్కర్ కోనసీమ',
              districtEn: 'Dr. B.R. Ambedkar Konaseema',
              nameTe: 'అమలాపురం కొబ్బరి & పంటల పరిశోధనా స్థానం',
              nameEn: 'Amalapuram Coconut Research Station',
              temp: 30,
              feelsLike: 34,
              moisture: 82,
              windSpeed: 18,
              windDir: 'E',
              rainProb: 30,
              uvIndex: 'Moderate (7)',
              aqi: 30,
              visibility: '8 km',
              conditionTe: 'కొబ్బరి డెల్టా అధిక తేమ • డ్రిప్ అనుకూలం',
              conditionEn: 'High Delta Soil Moisture • Drip Recommended'
            },
            'East Godavari': {
              id: 'East Godavari',
              districtTe: 'తూర్పు గోదావరి',
              districtEn: 'East Godavari',
              nameTe: 'రాజమండ్రి డెల్టా అగ్రోమెట్ స్టేషన్',
              nameEn: 'Rajahmundry Delta AgMet Station',
              temp: 31,
              feelsLike: 35,
              moisture: 75,
              windSpeed: 14,
              windDir: 'E',
              rainProb: 20,
              uvIndex: 'High (8)',
              aqi: 36,
              visibility: '8 km',
              conditionTe: 'గోదావరి పండించిన పొలాల్లో అధిక నేల తేమ',
              conditionEn: 'Rich Alluvial Moisture • Excellent Conditions'
            },
            'Eluru': {
              id: 'Eluru',
              districtTe: 'ఏలూరు',
              districtEn: 'Eluru',
              nameTe: 'ఏలూరు ప్రాంతీయ వ్యవసాయ పరిశోధనా కేంద్రం',
              nameEn: 'Eluru Regional Agricultural Center',
              temp: 32,
              feelsLike: 35,
              moisture: 68,
              windSpeed: 13,
              windDir: 'NE',
              rainProb: 15,
              uvIndex: 'High (8)',
              aqi: 41,
              visibility: '8 km',
              conditionTe: 'వరి, ఆక్వా వ్యవసాయ ప్రాంత సురక్షిత గాలి',
              conditionEn: 'Safe Paddy & Aqua Belt Weather'
            },
            'Kakinada': {
              id: 'Kakinada',
              districtTe: 'కాకినాడ',
              districtEn: 'Kakinada',
              nameTe: 'సామర్లకోట వ్యవసాయ పరిశోధనా స్థానం (ARS)',
              nameEn: 'Samalkot Agricultural Research Station',
              temp: 30,
              feelsLike: 34,
              moisture: 78,
              windSpeed: 17,
              windDir: 'SE',
              rainProb: 25,
              uvIndex: 'High (7)',
              aqi: 34,
              visibility: '8 km',
              conditionTe: 'తీరప్రాంత పంటల సురక్షిత విత్తన వాతావరణం',
              conditionEn: 'Coastal Agricultural Advisory Active'
            },
            'Krishna': {
              id: 'Krishna',
              districtTe: 'కృష్ణా',
              districtEn: 'Krishna',
              nameTe: 'విజయవాడ గన్నవరం అగ్రోమెట్ స్టేషన్',
              nameEn: 'Krishna Delta Station (Gannavaram)',
              temp: 33,
              feelsLike: 36,
              moisture: 66,
              windSpeed: 14,
              windDir: 'NW',
              rainProb: 15,
              uvIndex: 'High (8)',
              aqi: 48,
              visibility: '8 km',
              conditionTe: 'కృష్ణా డెల్టా ప్రాంతపు స్థిరమైన గాలి వేగం',
              conditionEn: 'Stable Wind Vectors across Krishna Basin'
            },
            'Kurnool': {
              id: 'Kurnool',
              districtTe: 'కర్నూలు',
              districtEn: 'Kurnool',
              nameTe: 'కర్నూలు రాయలసీమ వెదర్ స్టేషన్',
              nameEn: 'Kurnool Rayalaseema AgMet Station',
              temp: 34,
              feelsLike: 37,
              moisture: 50,
              windSpeed: 19,
              windDir: 'W',
              rainProb: 10,
              uvIndex: 'Very High (9)',
              aqi: 46,
              visibility: '10 km',
              conditionTe: 'తక్కువ తేమ • ఉదయం వేళ పిచికారీ సురక్షితం',
              conditionEn: 'Low Dew Humidity • Early Spray Safe'
            },
            'Nandyal': {
              id: 'Nandyal',
              districtTe: 'నంద్యాల',
              districtEn: 'Nandyal',
              nameTe: 'నంద్యాల ప్రాంతీయ వ్యవసాయ పరిశోధనా స్థానం (RARS)',
              nameEn: 'Nandyal Regional Station (RARS)',
              temp: 33,
              feelsLike: 36,
              moisture: 58,
              windSpeed: 16,
              windDir: 'W',
              rainProb: 10,
              uvIndex: 'High (8)',
              aqi: 43,
              visibility: '9 km',
              conditionTe: 'నల్లరేగడి నేలల్లో సరైన తేమ నిల్వలు',
              conditionEn: 'Black Cotton Soil Optimal Moisture'
            },
            'NTR': {
              id: 'NTR',
              districtTe: 'ఎన్టీఆర్ జిల్లా',
              districtEn: 'NTR',
              nameTe: 'నందిగామ & విజయవాడ రూరల్ అగ్రోమెట్ కేంద్రం',
              nameEn: 'Nandigama Rural AgMet Center',
              temp: 33,
              feelsLike: 36,
              moisture: 62,
              windSpeed: 15,
              windDir: 'NW',
              rainProb: 15,
              uvIndex: 'High (8)',
              aqi: 46,
              visibility: '8 km',
              conditionTe: 'మిరప, మొక్కజొన్న పైర్లకు అనుకూల గాలి',
              conditionEn: 'Ideal Conditions for Chilli & Maize'
            },
            'Palnadu': {
              id: 'Palnadu',
              districtTe: 'పల్నాడు',
              districtEn: 'Palnadu',
              nameTe: 'నరసరావుపేట మిరప & పత్తి వెదర్ స్టేషన్',
              nameEn: 'Narasaraopet Regional AgMet Station',
              temp: 34,
              feelsLike: 37,
              moisture: 56,
              windSpeed: 17,
              windDir: 'NW',
              rainProb: 10,
              uvIndex: 'High (8)',
              aqi: 44,
              visibility: '9 km',
              conditionTe: 'మిరప తామర పురుగు నివారణ స్ప్రేకి అనుకూలం',
              conditionEn: 'Optimal Window for Chilli Thrips Treatment'
            },
            'Parvathipuram Manyam': {
              id: 'Parvathipuram Manyam',
              districtTe: 'పార్వతీపురం మన్యం',
              districtEn: 'Parvathipuram Manyam',
              nameTe: 'సీతానగరం గిరిజన వ్యవసాయ పరిశోధనా కేంద్రం',
              nameEn: 'Seethanagaram & Parvathipuram Station',
              temp: 28,
              feelsLike: 30,
              moisture: 74,
              windSpeed: 12,
              windDir: 'NE',
              rainProb: 30,
              uvIndex: 'Moderate (7)',
              aqi: 32,
              visibility: '7 km',
              conditionTe: 'మన్యం కొండల ప్రాంతీయ చల్లని తేమ గాలి',
              conditionEn: 'High Relative Humidity in Valley Belt'
            },
            'Prakasam': {
              id: 'Prakasam',
              districtTe: 'ప్రకాశం',
              districtEn: 'Prakasam',
              nameTe: 'ఒంగోలు పొగాకు & వాణిజ్య పైర్ల పరిశోధనా స్థానం',
              nameEn: 'Ongole Commercial Crops Station',
              temp: 33,
              feelsLike: 36,
              moisture: 60,
              windSpeed: 18,
              windDir: 'SE',
              rainProb: 10,
              uvIndex: 'High (8)',
              aqi: 42,
              visibility: '9 km',
              conditionTe: 'పొగాకు, శనగ పంటలకు అనుకూల పొడి ఆకాశం',
              conditionEn: 'Dry Atmospheric Stability for Field Work'
            },
            'Srikakulam': {
              id: 'Srikakulam',
              districtTe: 'శ్రీకాకుళం',
              districtEn: 'Srikakulam',
              nameTe: 'ఆముదాలవలస అగ్రోమెట్ పరిశోధనా స్థానం',
              nameEn: 'Amadalavalasa AgMet Station',
              temp: 29,
              feelsLike: 32,
              moisture: 76,
              windSpeed: 15,
              windDir: 'NE',
              rainProb: 25,
              uvIndex: 'Moderate (7)',
              aqi: 33,
              visibility: '8 km',
              conditionTe: 'శ్రీకాకుళ తీరప్రాంత తేమ పవనాలు',
              conditionEn: 'North Coastal Dew & Moisture Standard'
            },
            'Sri Potti Sriramulu Nellore': {
              id: 'Sri Potti Sriramulu Nellore',
              districtTe: 'శ్రీ పొట్టి శ్రీరాములు నెల్లూరు',
              districtEn: 'Sri Potti Sriramulu Nellore',
              nameTe: 'నెల్లూరు రైస్ రీసెర్చ్ స్టేషన్ (ARS Nellore)',
              nameEn: 'Nellore Rice Research Station (ARS)',
              temp: 32,
              feelsLike: 36,
              moisture: 72,
              windSpeed: 19,
              windDir: 'SE',
              rainProb: 20,
              uvIndex: 'High (8)',
              aqi: 38,
              visibility: '8 km',
              conditionTe: 'వరి పొలాల నీటి యాజమాన్యానికి అనుకూలం',
              conditionEn: 'Favorable Irrigation Runoff Moisture'
            },
            'Sri Sathya Sai': {
              id: 'Sri Sathya Sai',
              districtTe: 'శ్రీ సత్యసాయి',
              districtEn: 'Sri Sathya Sai',
              nameTe: 'కదిరి వేరుశనగ వ్యవసాయ పరిశోధనా స్థానం (ARS)',
              nameEn: 'Kadiri Groundnut Research Station (ARS)',
              temp: 34,
              feelsLike: 37,
              moisture: 48,
              windSpeed: 21,
              windDir: 'W',
              rainProb: 5,
              uvIndex: 'Very High (9)',
              aqi: 45,
              visibility: '10 km',
              conditionTe: 'వేరుశనగ అంతరకృషి పనులకు శ్రేయస్కరం',
              conditionEn: 'Ideal Moisture for Groundnut Cultivation'
            },
            'Tirupati': {
              id: 'Tirupati',
              districtTe: 'తిరుపతి',
              districtEn: 'Tirupati',
              nameTe: 'తిరుపతి ప్రాంతీయ వ్యవసాయ పరిశోధనా స్థానం (RARS)',
              nameEn: 'Tirupati Regional Research Station (RARS)',
              temp: 33,
              feelsLike: 36,
              moisture: 58,
              windSpeed: 16,
              windDir: 'SE',
              rainProb: 15,
              uvIndex: 'High (8)',
              aqi: 37,
              visibility: '9 km',
              conditionTe: 'రాయలసీమ సరిహద్దు అనుకూల పంట వాతావరణం',
              conditionEn: 'Balanced Agro-climatic Conditions'
            },
            'Visakhapatnam': {
              id: 'Visakhapatnam',
              districtTe: 'విశాఖపట్నం',
              districtEn: 'Visakhapatnam',
              nameTe: 'విశాఖపట్నం కోస్టల్ అగ్రోమెట్ వెదర్ స్టేషన్',
              nameEn: 'Visakhapatnam Coastal AgMet Station',
              temp: 29,
              feelsLike: 33,
              moisture: 80,
              windSpeed: 18,
              windDir: 'E',
              rainProb: 25,
              uvIndex: 'Moderate (7)',
              aqi: 35,
              visibility: '8 km',
              conditionTe: 'తీరప్రాంత గాలి మితమైన వర్ష సూచన',
              conditionEn: 'Coastal Humidity & Moderate Wind Flow'
            },
            'Vizianagaram': {
              id: 'Vizianagaram',
              districtTe: 'విజయనగరం',
              districtEn: 'Vizianagaram',
              nameTe: 'విజయనగరం ధాన్యాల పరిశోధనా కేంద్రం',
              nameEn: 'Vizianagaram Grain Research Station',
              temp: 30,
              feelsLike: 33,
              moisture: 72,
              windSpeed: 14,
              windDir: 'NE',
              rainProb: 20,
              uvIndex: 'High (7)',
              aqi: 36,
              visibility: '8 km',
              conditionTe: 'చిరుధాన్యాల పంటల పిచికారీకి అత్యుత్తమం',
              conditionEn: 'Excellent Millets & Grain Weather'
            },
            'West Godavari': {
              id: 'West Godavari',
              districtTe: 'పశ్చిమ గోదావరి',
              districtEn: 'West Godavari',
              nameTe: 'తాడేపల్లిగూడెం ఉద్యాన పరిశోధనా స్థానం',
              nameEn: 'Tadepalligudem Horticultural Station',
              temp: 32,
              feelsLike: 35,
              moisture: 74,
              windSpeed: 14,
              windDir: 'NE',
              rainProb: 15,
              uvIndex: 'High (8)',
              aqi: 39,
              visibility: '8 km',
              conditionTe: 'పండ్ల తోటలు, వరి నీటి పారుదలకు అనుకూలం',
              conditionEn: 'High Irrigation Efficiency Conditions'
            },
            'YSR Kadapa': {
              id: 'YSR Kadapa',
              districtTe: 'వైఎస్సార్ కడప',
              districtEn: 'YSR Kadapa',
              nameTe: 'ఉటుకూరు ప్రాంతీయ వ్యవసాయ పరిశోధనా స్థానం',
              nameEn: 'Utukur Regional Station (ARS)',
              temp: 35,
              feelsLike: 38,
              moisture: 50,
              windSpeed: 18,
              windDir: 'W',
              rainProb: 5,
              uvIndex: 'Very High (9)',
              aqi: 47,
              visibility: '10 km',
              conditionTe: 'పండ్ల తోటల సూర్యకాంతి వాతావరణం',
              conditionEn: 'High Sunshine Hours for Citrus & Mango'
            }
          };

          const weatherStations = Object.values(apWeatherStationsData).map((st) => ({
            id: st.id,
            nameTe: `${st.districtTe} - ${st.nameTe}`,
            nameEn: `${st.districtEn} - ${st.nameEn}`
          }));

          const activeStation = apWeatherStationsData[weatherStation] || apWeatherStationsData['Guntur'];

          return (
            <div className="space-y-6 text-left animate-fade-in">
              
              {/* Header & Station Location Bar */}
              <div className="bg-white border border-slate-200/90 rounded-[20px] p-5 shadow-[0_4px_20px_rgba(0,0,0,0.04)] flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="inline-flex items-center gap-1.5 text-xs font-black text-[#1b6d24] bg-emerald-50 border border-emerald-200/80 px-2.5 py-0.5 rounded-full">
                    <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                    <span>📍 {language === 'te' ? activeStation.districtTe : activeStation.districtEn}, AP ({language === 'te' ? activeStation.nameTe : activeStation.nameEn})</span>
                  </div>
                  <h3 className="text-lg md:text-xl font-black text-slate-800 tracking-tight flex items-center gap-2">
                    <span>{language === 'te' ? 'ఆంధ్రప్రదేశ్ 26 జిల్లాల గ్రామ వ్యవసాయ వాతావరణ హెచ్చరికలు' : 'Andhra Pradesh 26-District AgMet Weather Advisor'}</span>
                  </h3>
                  <p className="text-xs text-slate-500 font-medium">
                    {language === 'te' 
                      ? 'అధికారిక ఆంగ్రూ (ANGRAU), ఐసిఏఆర్ (ICAR) మరియు ఐఎండి (IMD) 26 జిల్లాల సమాచారం.' 
                      : 'Synced with all 26 official AP District ANGRAU & IMD AgMet Research Stations.'}
                  </p>
                </div>

                {/* Station Dropdown Picker */}
                <div className="w-full md:w-auto shrink-0 space-y-1">
                  <label className="text-[10px] uppercase font-extrabold text-slate-400 block tracking-wider">
                    {language === 'te' ? 'వాతావరణ కేంద్రం ఎంచుకోండి (26 జిల్లాలు)' : 'Select AP District Station (26 Districts)'}
                  </label>
                  <select
                    value={weatherStation}
                    onChange={(e) => setWeatherStation(e.target.value)}
                    className="w-full text-xs font-extrabold bg-slate-50 border border-slate-200 focus:border-[#1b6d24] focus:ring-2 focus:ring-[#1b6d24]/10 rounded-xl py-2 px-3 text-slate-800 outline-none cursor-pointer max-w-md"
                  >
                    {weatherStations.map((st) => (
                      <option key={st.id} value={st.id}>
                        {language === 'te' ? st.nameTe : st.nameEn}
                      </option>
                    ))}
                  </select>
                  <span className="text-[10px] text-slate-400 font-bold block text-right">
                    {language === 'te' ? 'తాజాకరణ: నేడు 10:30 AM' : 'Updated: Today 10:30 AM'}
                  </span>
                </div>
              </div>

              {/* Current Weather Card + 6 Weather Metrics Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
                
                {/* Left / Top Hero Card: Weather & Status (5 cols) */}
                <div className="lg:col-span-5 bg-gradient-to-br from-blue-950 via-blue-900 to-sky-900 text-white rounded-[22px] p-6 shadow-md relative overflow-hidden flex flex-col justify-between space-y-6">
                  
                  <div className="space-y-4 z-10">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-black uppercase tracking-widest text-sky-200 bg-sky-800/60 border border-sky-400/30 px-3 py-1 rounded-full flex items-center gap-1.5">
                        <Sun className="w-3.5 h-3.5 text-amber-300" />
                        <span>{language === 'te' ? '☀️ ప్రకాశవంతమైన సూర్యకాంతి' : '☀️ Sunny & Clear'}</span>
                      </span>
                      <span className="text-[10px] text-sky-200/80 font-bold">Station ID: #AP-{activeStation.id.substring(0, 4).toUpperCase()}</span>
                    </div>

                    <div className="flex items-center justify-between pt-2">
                      <div>
                        <div className="flex items-baseline gap-2">
                          <span className="text-5xl font-black tracking-tight text-white">{activeStation.temp}°C</span>
                          <span className="text-xs font-bold text-sky-200">
                            {language === 'te' ? `స్పర్శకి: ${activeStation.feelsLike}°C` : `Feels Like: ${activeStation.feelsLike}°C`}
                          </span>
                        </div>
                        <p className="text-xs text-sky-100 font-semibold mt-1">
                          {language === 'te' ? activeStation.conditionTe : activeStation.conditionEn}
                        </p>
                      </div>
                      <div className="p-3 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 shrink-0">
                        <CloudSun className="w-12 h-12 text-amber-300 animate-pulse" />
                      </div>
                    </div>
                  </div>

                  {/* Micro Weather Bar inside Hero */}
                  <div className="bg-white/10 backdrop-blur-md border border-white/15 rounded-xl p-3 grid grid-cols-3 gap-2 text-center text-xs z-10">
                    <div>
                      <span className="text-[9px] uppercase font-bold text-sky-200 block">{language === 'te' ? 'గాలి దిశ' : 'Wind Dir'}</span>
                      <span className="font-black text-white text-xs">{activeStation.windSpeed} km/h {activeStation.windDir}</span>
                    </div>
                    <div className="border-x border-white/15">
                      <span className="text-[9px] uppercase font-bold text-sky-200 block">{language === 'te' ? 'వర్ష ప్రమాదం' : 'Rain Risk'}</span>
                      <span className="font-black text-emerald-300 text-xs">{activeStation.rainProb}% ({activeStation.rainProb > 30 ? 'Moderate' : 'Low'})</span>
                    </div>
                    <div>
                      <span className="text-[9px] uppercase font-bold text-sky-200 block">{language === 'te' ? 'గాలి నాణ్యత' : 'Air Quality'}</span>
                      <span className="font-black text-emerald-300 text-xs">AQI {activeStation.aqi} (Good)</span>
                    </div>
                  </div>

                  {/* Subtle background glow decoration */}
                  <div className="absolute -left-10 -bottom-10 w-40 h-40 bg-sky-500/20 rounded-full blur-2xl pointer-events-none"></div>
                </div>

                {/* Right: 6 Weather Metrics Grid (7 cols) */}
                <div className="lg:col-span-7 bg-white border border-slate-200/90 rounded-[22px] p-6 shadow-[0_4px_20px_rgba(0,0,0,0.04)] space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <h4 className="text-xs font-black uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                      <CloudSun className="w-4 h-4 text-[#1b6d24]" />
                      <span>{language === 'te' ? 'వ్యవసాయ సూచికల మెట్రిక్స్ (6 Field Weather Metrics)' : 'Field Weather Metrics (6 Essential Indicators)'}</span>
                    </h4>
                    <span className="text-[10px] font-bold text-slate-400">{language === 'te' ? 'నిజసమయ డేటా' : 'Live Sensors'}</span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    
                    {/* Metric 1: Temperature */}
                    <div className="bg-slate-50/90 border border-slate-200/80 p-3.5 rounded-2xl space-y-1 hover:border-amber-400/60 transition-all">
                      <div className="flex items-center justify-between text-amber-600">
                        <span className="text-[10px] font-extrabold uppercase text-slate-500">{language === 'te' ? '🌡 ఉష్ణోగ్రత' : '🌡 Temperature'}</span>
                        <Thermometer className="w-5 h-5" />
                      </div>
                      <div className="font-black text-slate-900 text-lg">{activeStation.temp}°C</div>
                      <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded block w-fit">
                        {language === 'te' ? `స్పర్శకి: ${activeStation.feelsLike}°C` : `Feels Like: ${activeStation.feelsLike}°C`}
                      </span>
                    </div>

                    {/* Metric 2: Soil Moisture / Humidity */}
                    <div className="bg-slate-50/90 border border-slate-200/80 p-3.5 rounded-2xl space-y-1 hover:border-blue-400/60 transition-all">
                      <div className="flex items-center justify-between text-blue-600">
                        <span className="text-[10px] font-extrabold uppercase text-slate-500">{language === 'te' ? '💧 తేమ శాతం' : '💧 Humidity'}</span>
                        <Droplets className="w-5 h-5" />
                      </div>
                      <div className="font-black text-slate-900 text-lg">{activeStation.moisture}%</div>
                      <span className="text-[10px] font-bold text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded block w-fit">
                        {language === 'te' ? 'ఆదర్శవంతమైన స్థాయి' : 'Optimal Level'}
                      </span>
                    </div>

                    {/* Metric 3: Wind Speed */}
                    <div className="bg-slate-50/90 border border-slate-200/80 p-3.5 rounded-2xl space-y-1 hover:border-teal-400/60 transition-all">
                      <div className="flex items-center justify-between text-teal-600">
                        <span className="text-[10px] font-extrabold uppercase text-slate-500">{language === 'te' ? '🌬 గాలి వేగం' : '🌬 Wind Speed'}</span>
                        <Wind className="w-5 h-5" />
                      </div>
                      <div className="font-black text-slate-900 text-lg">{activeStation.windSpeed} km/h</div>
                      <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded block w-fit">
                        {language === 'te' ? 'సురక్షిత ప్రవాహం' : 'Safe for Spraying'}
                      </span>
                    </div>

                    {/* Metric 4: Rain Chance */}
                    <div className="bg-slate-50/90 border border-slate-200/80 p-3.5 rounded-2xl space-y-1 hover:border-sky-400/60 transition-all">
                      <div className="flex items-center justify-between text-sky-600">
                        <span className="text-[10px] font-extrabold uppercase text-slate-500">{language === 'te' ? '🌧 వర్ష అవకాశం' : '🌧 Rain Chance'}</span>
                        <CloudRain className="w-5 h-5" />
                      </div>
                      <div className="font-black text-slate-900 text-lg">{activeStation.rainProb}%</div>
                      <span className="text-[10px] font-bold text-sky-700 bg-sky-50 px-1.5 py-0.5 rounded block w-fit">
                        {activeStation.rainProb > 30 
                          ? (language === 'te' ? 'మధ్యస్థ వర్ష ప్రభావం' : 'Moderate Chance') 
                          : (language === 'te' ? 'తక్కువ ప్రమాదం' : 'Low Probability')}
                      </span>
                    </div>

                    {/* Metric 5: UV Index */}
                    <div className="bg-slate-50/90 border border-slate-200/80 p-3.5 rounded-2xl space-y-1 hover:border-orange-400/60 transition-all">
                      <div className="flex items-center justify-between text-orange-600">
                        <span className="text-[10px] font-extrabold uppercase text-slate-500">{language === 'te' ? '☀️ UV సూచిక' : '☀️ UV Index'}</span>
                        <Sun className="w-5 h-5" />
                      </div>
                      <div className="font-black text-slate-900 text-lg">{activeStation.uvIndex}</div>
                      <span className="text-[10px] font-bold text-amber-800 bg-amber-50 px-1.5 py-0.5 rounded block w-fit">
                        {language === 'te' ? 'రక్షణ అవసరం' : 'Solar Radiation'}
                      </span>
                    </div>

                    {/* Metric 6: AQI & Visibility */}
                    <div className="bg-slate-50/90 border border-slate-200/80 p-3.5 rounded-2xl space-y-1 hover:border-emerald-400/60 transition-all">
                      <div className="flex items-center justify-between text-emerald-600">
                        <span className="text-[10px] font-extrabold uppercase text-slate-500">{language === 'te' ? '👁 దృశ్యత / AQI' : '👁 Visibility'}</span>
                        <Eye className="w-5 h-5" />
                      </div>
                      <div className="font-black text-slate-900 text-lg">{activeStation.visibility}</div>
                      <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded block w-fit">
                        AQI {activeStation.aqi} (Good)
                      </span>
                    </div>

                  </div>
                </div>

              </div>

              {/* Crop Selector & Crop-Specific Advisory Panel */}
              <div className="bg-white border border-slate-200/90 rounded-[22px] p-6 shadow-[0_4px_20px_rgba(0,0,0,0.04)] space-y-5">
                
                {/* Crop Selector Bar */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
                  <div>
                    <h4 className="text-sm font-black text-slate-800 flex items-center gap-2">
                      <Sprout className="w-5 h-5 text-[#1b6d24]" />
                      <span>{language === 'te' ? 'పంటల వారీ ప్రత్యేకాధికార సలహాలు' : 'Crop-Specific Agronomy Advisories'}</span>
                    </h4>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {language === 'te' ? 'మీరు సాగు చేస్తున్న పంటను ఎంచుకుని పొలం పనుల మార్గదర్శకాలు చూడండి:' : 'Select your active crop to view real-time spraying & field advisories:'}
                    </p>
                  </div>

                  {/* Crop Selection Buttons */}
                  <div className="flex flex-wrap gap-1.5 w-full sm:w-auto">
                    {[
                      { id: 'paddy', labelTe: '🌾 వరి', labelEn: '🌾 Paddy' },
                      { id: 'chilli', labelTe: '🌶️ మిరప', labelEn: '🌶️ Chilli' },
                      { id: 'cotton', labelTe: '🧶 పత్తి', labelEn: '🧶 Cotton' },
                      { id: 'maize', labelTe: '🌽 మొక్కజొన్న', labelEn: '🌽 Maize' },
                      { id: 'groundnut', labelTe: '🫘 వేరుశనగ', labelEn: '🫘 Groundnut' },
                    ].map((c) => (
                      <button
                        key={c.id}
                        onClick={() => setWeatherCrop(c.id as any)}
                        className={`px-3.5 py-2 rounded-xl text-xs font-black transition-all cursor-pointer border ${
                          weatherCrop === c.id
                            ? 'bg-[#1b6d24] text-white border-[#1b6d24] shadow-sm scale-[1.02]'
                            : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                        }`}
                      >
                        {language === 'te' ? c.labelTe : c.labelEn}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Advisory Details for Selected Crop */}
                {(() => {
                  const cropData = cropAdvisoriesData[weatherCrop] || cropAdvisoriesData.paddy;
                  return (
                    <div className="space-y-4">
                      
                      {/* Status Badge & Summary */}
                      <div className="bg-emerald-50/80 border border-emerald-200/80 rounded-2xl p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
                        <div className="space-y-1">
                          <span className="inline-block bg-[#1b6d24] text-white text-[10px] font-black uppercase px-3 py-1 rounded-full shadow-sm">
                            {language === 'te' ? cropData.sprayIndexBadgeTe : cropData.sprayIndexBadgeEn}
                          </span>
                          <p className="text-xs font-bold text-slate-800 pt-1 leading-relaxed">
                            {language === 'te' ? cropData.summaryTe : cropData.summaryEn}
                          </p>
                        </div>

                        <div className="bg-white border border-emerald-200 px-4 py-2.5 rounded-xl shrink-0 text-center text-xs font-extrabold text-[#1b6d24]">
                          <span>{language === 'te' ? 'పిచికారీ స్థితి' : 'Spray Index Status'}</span>
                          <span className="block text-emerald-700 font-black text-sm">🟢 EXCELLENT</span>
                        </div>
                      </div>

                      {/* Scannable Bullet Points */}
                      <div className="bg-slate-50/80 border border-slate-200/80 p-4 rounded-2xl space-y-2">
                        <h5 className="text-[11px] font-black uppercase tracking-wider text-slate-600 mb-1">
                          {language === 'te' ? 'కీలక మార్గదర్శకాలు (Scannable Guidelines):' : 'Key Advisory Highlights:'}
                        </h5>
                        <ul className="space-y-1.5 text-xs text-slate-700 font-medium">
                          {(language === 'te' ? cropData.pointsTe : cropData.pointsEn).map((pt: string, i: number) => (
                            <li key={i} className="flex items-start gap-2">
                              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                              <span>{pt}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* Recommended Farming Activity Grid */}
                      <div className="space-y-2">
                        <h5 className="text-[11px] font-black uppercase tracking-wider text-slate-600">
                          {language === 'te' ? 'నేటి వ్యవసాయ పనుల సిఫార్సులు (Today\'s Recommended Farming Activities):' : "Today's Recommended Farming Activities:"}
                        </h5>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                          {cropData.activities.map((act: any, idx: number) => (
                            <div key={idx} className="bg-white border border-slate-200 p-3.5 rounded-xl space-y-1 shadow-sm">
                              <span className="text-[11px] font-extrabold text-slate-600 block">
                                {language === 'te' ? act.labelTe : act.labelEn}
                              </span>
                              <span className="text-xs font-black text-[#1b6d24] block">
                                {language === 'te' ? act.statusTe : act.statusEn}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>

                    </div>
                  );
                })()}

              </div>

              {/* 5-Day Rain & Weather Forecast + Best Farming Window */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
                
                {/* 5-Day Mini Forecast (7 cols) */}
                <div className="lg:col-span-7 bg-white border border-slate-200/90 rounded-[22px] p-5 shadow-[0_4px_20px_rgba(0,0,0,0.04)] space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <h4 className="text-xs font-black uppercase tracking-wider text-slate-700 flex items-center gap-2">
                      <CloudRain className="w-5 h-5 text-blue-600" />
                      <span>{language === 'te' ? '5 రోజుల వర్షపాతం & వాతావరణ అంచనా' : 'Rain Forecast (5-Day Outlook)'}</span>
                    </h4>
                    <span className="text-[10px] font-bold text-slate-400">{language === 'te' ? 'వారాంతపు అంచనాలు' : 'Weekly Outlook'}</span>
                  </div>

                  <div className="grid grid-cols-5 gap-2 text-center">
                    {weatherForecastDays.map((fc, idx) => (
                      <div 
                        key={idx} 
                        className={`p-3 rounded-2xl border transition-all ${
                          idx === 0 
                            ? 'bg-emerald-50/80 border-emerald-300 ring-2 ring-emerald-500/20' 
                            : 'bg-slate-50 border-slate-200'
                        }`}
                      >
                        <span className="text-[10px] font-black text-slate-600 block">
                          {language === 'te' ? fc.dayTe : fc.dayEn}
                        </span>
                        <span className="text-2xl my-1 block">{fc.icon}</span>
                        <span className="font-extrabold text-slate-900 text-xs block">{fc.temp}</span>
                        <div className="mt-1 pt-1 border-t border-slate-200/60">
                          <span className="text-[9px] font-bold text-blue-600 block">🌧 {fc.rainProb}</span>
                          <span className="text-[9px] font-black block mt-0.5" style={{ color: fc.color === 'emerald' ? '#1b6d24' : fc.color === 'amber' ? '#d97706' : '#dc2626' }}>
                            {language === 'te' ? fc.riskTe : fc.riskEn}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Best Time for Farming Window (5 cols) */}
                <div className="lg:col-span-5 bg-gradient-to-br from-slate-900 via-slate-850 to-slate-950 text-white rounded-[22px] p-5 shadow-md space-y-3 flex flex-col justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-amber-400 font-extrabold text-xs uppercase tracking-wider">
                      <Clock className="w-5 h-5 text-amber-300" />
                      <span>{language === 'te' ? 'నేటి ఉత్తమ వ్యవసాయ పని వేళలు' : 'Best Time Today (Farming Window)'}</span>
                    </div>

                    <div className="space-y-2 pt-1 text-xs">
                      
                      {/* Morning Window */}
                      <div className="bg-slate-800/90 border border-slate-700/80 p-3 rounded-xl flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-xl">🌅</span>
                          <div>
                            <span className="font-black text-emerald-400 block text-xs">6:00 AM – 9:30 AM</span>
                            <span className="text-[10px] text-slate-300 font-medium">{language === 'te' ? 'మందుల స్ప్రేయింగ్ & గుంటక తోలడానికి ఉత్తమం' : 'Ideal for Spraying & Inter-cultivation'}</span>
                          </div>
                        </div>
                        <span className="text-[9px] bg-emerald-900/80 text-emerald-300 border border-emerald-600/50 px-2 py-0.5 rounded font-bold">{language === 'te' ? 'అత్యుత్తమం' : 'BEST'}</span>
                      </div>

                      {/* Evening Window */}
                      <div className="bg-slate-800/90 border border-slate-700/80 p-3 rounded-xl flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-xl">🌇</span>
                          <div>
                            <span className="font-black text-sky-400 block text-xs">4:30 PM – 6:30 PM</span>
                            <span className="text-[10px] text-slate-300 font-medium">{language === 'te' ? 'నీటి తడులు & ఎరువులు వేయడానికి అనుకూలం' : 'Recommended for Irrigation & Fertigation'}</span>
                          </div>
                        </div>
                        <span className="text-[9px] bg-sky-900/80 text-sky-300 border border-sky-600/50 px-2 py-0.5 rounded font-bold">{language === 'te' ? 'అనుకూలం' : 'GOOD'}</span>
                      </div>

                      {/* Avoid Period */}
                      <div className="bg-amber-950/40 border border-amber-800/50 p-2.5 rounded-xl flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-xl">🚫</span>
                          <div>
                            <span className="font-extrabold text-amber-400 block text-xs">12:00 PM – 3:30 PM ({language === 'te' ? 'తప్పించండి' : 'AVOID'})</span>
                            <span className="text-[10px] text-amber-200/80">{language === 'te' ? 'తీవ్రమైన ఎండ & ఉష్ణోగ్రత ఒత్తిడి' : 'Avoid Afternoon Heat & High UV'}</span>
                          </div>
                        </div>
                      </div>

                    </div>
                  </div>

                </div>

              </div>

              {/* Action Bar (Download Report, Subscribe, Share) */}
              <div className="bg-white border border-slate-200/90 rounded-[20px] p-4 shadow-[0_4px_20px_rgba(0,0,0,0.04)] flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-600">
                  <ShieldCheck className="w-5 h-5 text-[#1b6d24]" />
                  <span>{language === 'te' ? 'అధికారిక ఐసిఏఆర్ (ICAR) మరియు అంగ్రూ (ANGRAU) వెదర్ నెట్‌వర్క్' : 'Official AgMet Advisory synced with ICAR & ANGRAU Stations'}</span>
                </div>

                <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
                  
                  {/* Download Report */}
                  <button
                    onClick={() => triggerToast(language === 'te' ? 'వాతావరణ నివేదిక పిడిఎఫ్ డౌన్‌లోడ్ అయింది!' : 'Weather Advisory PDF Downloaded!', 'success')}
                    className="flex-1 sm:flex-initial px-3.5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-extrabold flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                  >
                    <Download className="w-4 h-4 text-slate-600" />
                    <span>{language === 'te' ? 'రిపోర్ట్ డౌన్‌లోడ్' : 'Download Report'}</span>
                  </button>

                  {/* Subscribe Alerts */}
                  <button
                    onClick={() => triggerToast(language === 'te' ? 'రోజువారీ ఎస్‌ఎమ్‌ఎస్ హెచ్చరికలకు సభ్యత్వం నమోదైంది!' : 'Subscribed to Daily AgMet SMS Alerts!', 'success')}
                    className="flex-1 sm:flex-initial px-3.5 py-2.5 bg-emerald-50 hover:bg-emerald-100 text-[#1b6d24] border border-emerald-200 rounded-xl text-xs font-extrabold flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                  >
                    <Bell className="w-4 h-4 text-emerald-600" />
                    <span>{language === 'te' ? 'SMS హెచ్చరికలు' : 'Subscribe Alerts'}</span>
                  </button>

                  {/* Share WhatsApp */}
                  <button
                    onClick={() => triggerToast(language === 'te' ? 'రైతు వాట్సాప్ గ్రూపుకి సమాచారం షేర్ చేయబడింది!' : 'Weather Advisory Shared to WhatsApp Group!', 'info')}
                    className="flex-1 sm:flex-initial px-3.5 py-2.5 bg-[#1b6d24] hover:bg-[#15571c] text-white rounded-xl text-xs font-extrabold flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-sm"
                  >
                    <Share2 className="w-4 h-4" />
                    <span>{language === 'te' ? 'షేర్ చేయండి' : 'Share'}</span>
                  </button>

                </div>
              </div>

            </div>
          );
        })()}

        {/* TAB 3: GOVERNMENT SCHEMES */}
        {activeTab === 'gov_schemes' && (
          <div className="space-y-8 animate-fade-in text-left">
            {/* Page Header */}
            <div className="bg-gradient-to-r from-emerald-900 to-emerald-800 text-white p-6 rounded-[2rem] shadow-sm relative overflow-hidden">
              <div className="absolute right-0 top-0 opacity-10 translate-x-6 -translate-y-6">
                <LandmarkIcon className="w-48 h-48 text-white" />
              </div>
              <div className="relative z-10 space-y-2">
                <span className="text-[9px] bg-emerald-700/60 text-emerald-100 font-extrabold uppercase tracking-widest px-3 py-1 rounded-full border border-emerald-500/20">
                  {language === 'te' ? 'అన్నదాత సుఖీభవ & పీఎం కిసాన్ పోర్టల్' : 'Annadhata Sukhibhava & PM Kisan Portal'}
                </span>
                <h3 className="text-base font-black text-white">
                  {language === 'te' ? 'రాష్ట్ర & కేంద్ర ప్రభుత్వ సబ్సిడీలు' : 'Union & State Agricultural Subsidy Engine'}
                </h3>
                <p className="text-[11px] text-emerald-100 max-w-xl font-medium leading-relaxed">
                  {language === 'te' 
                    ? 'చిన్న, సన్నకారు మరియు కౌలు రైతులకు వ్యవసాయ యంత్రాలపై లభించే ప్రభుత్వ సబ్సిడీలను ఇక్కడే లెక్కించుకోండి మరియు అధికారిక దరఖాస్తు ప్రతులను పొందండి.' 
                    : 'Analyze accurate government machine subvention ratios, calculate precise out-of-pocket costs, and simulate real-time green eligibility vouchers.'}
                </p>
              </div>
            </div>

            {/* Split Grid Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              
              {/* Left Side: Dynamic Calculator (7 cols) */}
              <div className="lg:col-span-7 space-y-6">
                <div className="bg-white border border-slate-100 rounded-[2rem] p-5 shadow-xs space-y-5">
                  <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
                    <Calculator className="w-4 h-4 text-[#1b6d24]" />
                    <h4 className="text-xs font-extrabold text-slate-800">
                      {language === 'te' ? 'వ్యవసాయ యంత్రాల సబ్సిడీ క్యాలిక్యులేటర్' : 'Interactive Machinery Subsidy Estimator'}
                    </h4>
                  </div>

                  {/* Calculator Inputs */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Land Acres */}
                    <div className="space-y-1.55">
                      <label className="text-[10px] text-slate-500 font-bold block">
                        {language === 'te' ? 'భూమి వైశాల్యం (Acres):' : 'Land Size (Acres):'} {subsidyLandAcres}
                      </label>
                      <input 
                        type="range"
                        min="1"
                        max="20"
                        value={subsidyLandAcres}
                        onChange={(e) => setSubsidyLandAcres(Number(e.target.value))}
                        className="w-full accent-[#1b6d24] h-1.5 bg-slate-100 rounded-lg cursor-pointer"
                      />
                      <div className="flex justify-between text-[8.5px] text-slate-400 font-bold">
                        <span>1 {language === 'te' ? 'ఎకరం' : 'Acres'}</span>
                        <span>10 {language === 'te' ? 'ఎకరాలు' : 'Acres'}</span>
                        <span>20 {language === 'te' ? 'ఎకరాలు' : 'Acres'}</span>
                      </div>
                    </div>

                    {/* Social / Tenant Category selector */}
                    <div className="space-y-1.5">
                      <label className="text-[10px] text-slate-550 font-bold block">
                        {language === 'te' ? 'సామాజిక వర్గం / రైతు రకం:' : 'Farmer Category & Sub-Class:'}
                      </label>
                      <select
                        value={subsidyCategory}
                        onChange={(e: any) => setSubsidyCategory(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-2 text-[11px] font-bold text-slate-800 focus:outline-none focus:border-[#1b6d24]"
                      >
                        <option value="general">{language === 'te' ? 'సాధారణ రైతు (General - 50% Subsidy)' : 'General Cultivator (50% Subvention)'}</option>
                        <option value="obc">{language === 'te' ? 'వెనుకబడిన తరగతి (OBC - 65% Subsidy)' : 'OBC Cooperative (65% Subvention)'}</option>
                        <option value="women">{language === 'te' ? 'మహిళా రైతు (Women Farmer - 75% Subsidy)' : 'Female Shareholder (75% Subvention)'}</option>
                        <option value="tenant">{language === 'te' ? 'కౌలు రైతు (Tenant CCRC - 80% Subsidy)' : 'Tenant Farmer (CCRC CardHolder - 80%)'}</option>
                        <option value="sc_st">{language === 'te' ? 'ఎస్సీ / ఎస్టీ వర్గాలు (SC / ST - 90% Subsidy)' : 'SC / ST Agrarian (90% Subvention)'}</option>
                      </select>
                    </div>

                    {/* Machinery selection */}
                    <div className="space-y-1.5 sm:col-span-2">
                      <label className="text-[10px] text-slate-550 font-bold block">
                        {language === 'te' ? 'సబ్సిడీ కోరుకునే యంత్రం:' : 'Desired Machinery Type (SMAM Target):'}
                      </label>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                        {[
                          { id: 'water_pump', te: 'నీటి పంప్ సెట్', en: 'Water Pump Set (10HP)', price: 50000 },
                          { id: 'weeder', te: 'పవర్ వీడర్', en: 'Power Weeder Set', price: 40000 },
                          { id: 'drone', te: 'స్ప్రేయింగ్ డ్రోన్', en: 'Spraying Drone Tech', price: 450000 },
                          { id: 'tractor', te: 'భారీ ట్రాక్టర్', en: 'Heavy 50HP Tractor', price: 800000 },
                          { id: 'harvester', te: 'కోత మిషన్', en: 'Combine Harvester', price: 1800000 }
                        ].map(m => (
                          <button
                            key={m.id}
                            type="button"
                            onClick={() => setSubsidyMachinery(m.id as any)}
                            className={`p-2.5 rounded-xl border text-[10px] font-black text-center transition-all ${
                              subsidyMachinery === m.id
                                ? 'bg-[#1b6d24]/5 border-[#1b6d24] text-[#1b6d24]'
                                : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                            }`}
                          >
                            <span className="block text-ellipsis overflow-hidden whitespace-nowrap">{language === 'te' ? m.te : m.en}</span>
                            <span className="text-[8.5px] font-bold text-slate-400">₹{m.price.toLocaleString()}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Live Calculation Output Dashboard */}
                  {(() => {
                    const params: Record<string, { basePrice: number, labelTe: string, labelEn: string }> = {
                      water_pump: { basePrice: 50000, labelTe: 'డీజిల్ నీటి పంప్ సెట్ (10 HP)', labelEn: 'Diesel Water Pump Set (10 HP)' },
                      weeder: { basePrice: 40000, labelTe: 'మల్టీపర్పస్ పవర్ వీడర్', labelEn: 'Multipurpose Power Weeder' },
                      drone: { basePrice: 450000, labelTe: 'ఇంటిగ్రేటెడ్ స్ప్రేయింగ్ డ్రోన్', labelEn: 'Integrated Spraying Drone Tech' },
                      tractor: { basePrice: 800000, labelTe: 'జాన్ డీర్ భారీ ట్రాక్టర్ (50 HP)', labelEn: 'Heavy 50 HP Tractor Machine' },
                      harvester: { basePrice: 1800000, labelTe: 'కుబోటా మల్టీ-క్రాప్ హార్వెస్టర్', labelEn: 'Kubota Combine Harvester' }
                    };

                    const categorySubsidies: Record<string, number> = {
                      general: 0.50,
                      obc: 0.65,
                      women: 0.75,
                      tenant: 0.80,
                      sc_st: 0.90
                    };

                    const chosen = params[subsidyMachinery] || params.water_pump;
                    const pct = categorySubsidies[subsidyCategory] || 0.50;
                    
                    // Small landholding multiplier bonus
                    let finalPct = pct;
                    if (subsidyLandAcres <= 2) {
                      finalPct = Math.min(0.95, pct + 0.05); // 5% bonus for small marginal farmers
                    }

                    const govShare = chosen.basePrice * finalPct;
                    const farmerShare = chosen.basePrice - govShare;

                    return (
                      <div className="bg-[#1b6d24]/5 rounded-2xl border border-[#1b6d24]/20 p-4 space-y-3.5">
                        <div className="flex justify-between items-center text-[10.5px] font-black text-slate-800">
                          <span>{language === 'te' ? 'యంత్రం విలువ:' : 'Core Machine Price:'}</span>
                          <span className="font-mono text-[#1b6d24] text-xs">₹{chosen.basePrice.toLocaleString()}</span>
                        </div>

                        <div className="space-y-1">
                          <div className="flex justify-between text-[10px] font-bold text-slate-500">
                            <span>{language === 'te' ? 'ప్రభుత్వ రాయితీ కోటా (Approved Subsidy %):' : 'Cooperative Subsidy Rate (%):'}</span>
                            <span className="text-[#1b6d24] text-xs font-black">{(finalPct * 100).toFixed(0)}%</span>
                          </div>
                          {/* Visual progress bar */}
                          <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                            <div 
                              className="bg-[#1b6d24] h-full transition-all duration-300"
                              style={{ width: `${finalPct * 100}%` }}
                            ></div>
                          </div>
                          {subsidyLandAcres <= 2 && (
                            <span className="text-[8.5px] font-bold text-emerald-700 block animate-pulse">
                              ✦ {language === 'te' ? 'సన్నకారు రైతు బోనస్: +5% అదనపు రాయితీ వర్తింపబడింది!' : 'Marginal Farmer Bonus: +5% extra subvention applied!'}
                            </span>
                          )}
                        </div>

                        <div className="grid grid-cols-2 gap-3 pt-2.5 border-t border-slate-200/65">
                          <div className="bg-white p-2.5 rounded-xl border border-slate-100 text-left">
                            <span className="text-[8px] text-slate-400 font-extrabold uppercase tracking-wide block">
                              {language === 'te' ? '🏛️ ప్రభుత్వం భరించే ధర:' : '🏛️ Govt. Subvention:'}
                            </span>
                            <span className="text-xs font-black text-emerald-800 font-mono block">
                              ₹{govShare.toLocaleString()}
                            </span>
                          </div>

                          <div className="bg-white p-2.5 rounded-xl border border-slate-100 text-left">
                            <span className="text-[8px] text-slate-400 font-extrabold uppercase tracking-wide block">
                              {language === 'te' ? '🧑‍🌾 రైతు వాటా (కరడు):' : '🧑‍🌾 Farmer Share:'}
                            </span>
                            <span className="text-xs font-black text-[#1b6d24] font-mono block">
                              ₹{farmerShare.toLocaleString()}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })()}

                  {/* Simulated Online Pre-Application Form Block - Redesigned Card */}
                  <div className="bg-white border border-slate-200/90 rounded-[18px] p-5 shadow-[0_10px_30px_rgba(0,0,0,0.06)] space-y-4 text-left">
                    
                    {/* Header & Hierarchy */}
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4 text-[#1b6d24]" />
                        <h4 className="text-sm font-black text-slate-800">
                          {language === 'te' ? 'సబ్సిడీ పాస్ జారీ చేయండి' : 'Generate Subsidy Pass'}
                        </h4>
                      </div>
                      <p className="text-[11px] text-slate-500 font-semibold italic">
                        {language === 'te' 
                          ? 'అన్నదాత సుఖీభవ అర్హత తనిఖీ (డెమో)' 
                          : 'Annadhata Sukhibhava Eligibility Check (Demo)'}
                      </p>
                    </div>

                    {/* Process Indicator */}
                    <div className="grid grid-cols-3 gap-2 bg-slate-50 border border-slate-200/80 p-2 rounded-xl text-center">
                      <div className="flex items-center justify-center gap-1.5 text-[10px] font-extrabold text-[#1b6d24]">
                        <span className="w-4 h-4 rounded-full bg-[#1b6d24] text-white flex items-center justify-center text-[9px] font-extrabold">1</span>
                        <span>{language === 'te' ? 'వివరాలు ఇవ్వండి' : 'Enter Details'}</span>
                      </div>
                      <div className="flex items-center justify-center gap-1.5 text-[10px] font-extrabold text-slate-500">
                        <span className="w-4 h-4 rounded-full bg-slate-200 text-slate-600 flex items-center justify-center text-[9px] font-extrabold">2</span>
                        <span>{language === 'te' ? 'పరిశీలన' : 'Verify'}</span>
                      </div>
                      <div className="flex items-center justify-center gap-1.5 text-[10px] font-extrabold text-slate-500">
                        <span className="w-4 h-4 rounded-full bg-slate-200 text-slate-600 flex items-center justify-center text-[9px] font-extrabold">3</span>
                        <span>{language === 'te' ? 'పాస్ పొందండి' : 'Download Pass'}</span>
                      </div>
                    </div>

                    {/* Inputs Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      
                      {/* Aadhaar Input */}
                      <div className="space-y-1.5">
                        <div className="flex justify-between items-center">
                          <label className="text-[11px] font-bold text-slate-700 flex items-center gap-1.5">
                            <span>🪪</span>
                            <span>{language === 'te' ? 'ఆధార్ సంఖ్య (Aadhaar Number):' : 'Aadhaar Number:'}</span>
                          </label>
                          <button
                            type="button"
                            onClick={() => setSubsidyAadhaar('990188471234')}
                            className="text-[9px] text-emerald-700 hover:text-emerald-900 font-extrabold underline cursor-pointer"
                          >
                            {language === 'te' ? 'సాంపిల్ నింపు' : 'Sample fill'}
                          </button>
                        </div>
                        <input
                          type="text"
                          maxLength={12}
                          value={subsidyAadhaar}
                          onChange={(e) => setSubsidyAadhaar(e.target.value.replace(/\D/g, ''))}
                          placeholder="9901 8847 1234"
                          className="w-full bg-slate-50/90 hover:bg-white focus:bg-white border border-slate-200 focus:border-[#1b6d24] focus:ring-2 focus:ring-[#1b6d24]/10 rounded-xl px-3.5 py-2.5 text-xs font-mono font-semibold text-slate-800 transition-all focus:outline-none"
                        />
                        <div className="flex justify-between items-center text-[9.5px]">
                          <span className="text-slate-400 font-medium">
                            {language === 'te' ? '12 అంకెల ఆధార్ సంఖ్య నమోదు చేయండి.' : 'Enter your 12-digit Aadhaar number.'}
                          </span>
                          {subsidyAadhaar.length === 12 && (
                            <span className="font-extrabold text-emerald-600 flex items-center gap-1">
                              ✓ {language === 'te' ? 'సరైన ఆధార్ సంఖ్య' : 'Valid Aadhaar Number'}
                            </span>
                          )}
                          {subsidyAadhaar.length > 0 && subsidyAadhaar.length < 12 && (
                            <span className="font-extrabold text-red-500 flex items-center gap-1">
                              ❌ {language === 'te' ? '12 అంకెలు ఉండాలి' : 'Must contain 12 digits'} ({subsidyAadhaar.length}/12)
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Passbook / CCRC ID Input */}
                      <div className="space-y-1.5">
                        <div className="flex justify-between items-center">
                          <label className="text-[11px] font-bold text-slate-700 flex items-center gap-1.5">
                            <span>📘</span>
                            <span>{language === 'te' ? 'పట్టాదారు పాస్‌బుక్ / CCRC ID:' : 'Pattadar Passbook / CCRC ID:'}</span>
                          </label>
                          <button
                            type="button"
                            onClick={() => setSubsidyPassbook('AP/GTR/30894')}
                            className="text-[9px] text-emerald-700 hover:text-emerald-900 font-extrabold underline cursor-pointer"
                          >
                            {language === 'te' ? 'సాంపిల్ నింపు' : 'Sample fill'}
                          </button>
                        </div>
                        <input
                          type="text"
                          value={subsidyPassbook}
                          onChange={(e) => setSubsidyPassbook(e.target.value)}
                          placeholder="AP/GTR/30894"
                          className="w-full bg-slate-50/90 hover:bg-white focus:bg-white border border-slate-200 focus:border-[#1b6d24] focus:ring-2 focus:ring-[#1b6d24]/10 rounded-xl px-3.5 py-2.5 text-xs font-mono font-semibold text-slate-800 transition-all focus:outline-none"
                        />
                        <div className="flex justify-between items-center text-[9.5px]">
                          <span className="text-slate-400 font-medium">
                            {language === 'te' ? 'ఉదాహరణ: AP/GTR/30894' : 'Example: AP/GTR/30894'}
                          </span>
                          {subsidyPassbook.trim().length >= 4 && (
                            <span className="font-extrabold text-emerald-600 flex items-center gap-1">
                              ✓ {language === 'te' ? 'సరైన ఫార్మాట్' : 'Valid Passbook format'}
                            </span>
                          )}
                        </div>
                      </div>

                    </div>

                    {/* Government Trust Note */}
                    <div className="bg-emerald-50/70 border border-emerald-200/60 rounded-xl p-2.5 flex items-center gap-2">
                      <span className="text-base">🔒</span>
                      <p className="text-[10px] text-emerald-900 font-medium leading-tight">
                        {language === 'te'
                          ? 'మీ సమాచారం భద్రంగా ప్రాసెస్ చేయబడుతుంది. డెమో వర్షన్ — ఏ వ్యక్తిగత డేటా నిల్వ చేయబడదు.'
                          : 'Your information is securely processed. Demo version — no personal data is stored.'}
                      </p>
                    </div>

                    {/* Submit Button */}
                    <button
                      type="button"
                      onClick={() => {
                        if (subsidyAadhaar.length < 12) {
                          triggerToast(language === 'te' ? 'దయచేసి సరైన 12 అంకెల ఆధార్ సంఖ్య ఇవ్వండి!' : 'Please enter a valid 12-digit Aadhaar number!', 'error');
                          return;
                        }
                        if (!subsidyPassbook.trim()) {
                          triggerToast(language === 'te' ? 'దయచేసి పట్టాదారు పాస్‌బుక్ లేదా కౌలు కార్డు సంఖ్య ఇవ్వండి!' : 'Please provide passbook or CCRC number!', 'error');
                          return;
                        }

                        // Generate certificate object info
                        const certId = `AP-RBK-${Math.floor(1000 + Math.random() * 9000)}`;
                        const d = new Date();
                        const formattedDate = `${d.getDate()}-${d.getMonth() + 1}-${d.getFullYear()}`;
                        
                        setSimulatedCertificate({
                          id: certId,
                          date: formattedDate,
                          aadhaarLast4: subsidyAadhaar.slice(-4),
                          passbook: subsidyPassbook,
                          acres: subsidyLandAcres,
                          category: subsidyCategory,
                          machinery: subsidyMachinery
                        });

                        triggerToast(language === 'te' ? 'డిజిటల్ రాయితీ అనుమతి పత్రం విజయవంతంగా జారీ చేయబడింది!' : 'Digital Subsidy Pre-Selection Voucher generated!', 'success');
                      }}
                      className="w-full bg-gradient-to-r from-[#1E7E34] to-[#2E9E44] hover:from-[#1b6d24] hover:to-[#248235] text-white text-xs font-extrabold h-13 rounded-xl transition-all shadow-md hover:shadow-lg hover:shadow-emerald-700/25 hover:-translate-y-0.5 active:translate-y-0 flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <span>✅</span>
                      <span>{language === 'te' ? 'డిజిటల్ సబ్సిడీ పాస్ జారీ చేయండి' : 'Generate Digital Subsidy Pass'}</span>
                    </button>
                  </div>
                </div>

                {/* Simulated Certificate Display (If Generated) */}
                {simulatedCertificate && (
                  <div className="bg-emerald-950 text-emerald-100 border-2 border-emerald-500 rounded-[2rem] p-5 shadow-lg relative overflow-hidden space-y-4 animate-fade-in text-left">
                    {/* Watermark security backdrop */}
                    <div className="absolute right-3 top-3 opacity-15">
                      <ShieldCheck className="w-24 h-24 text-emerald-400" />
                    </div>

                    <div className="flex justify-between items-start border-b border-emerald-800 pb-3">
                      <div>
                        <span className="text-[7.5px] font-black uppercase tracking-widest text-emerald-400">
                          {language === 'te' ? 'ఆంధ్రప్రదేశ్ ప్రభుత్వం - వ్యవసాయ మంత్రిత్వ శాఖ' : 'GOVT OF ANDHRA PRADESH - DEPT OF AGR'}
                        </span>
                        <h5 className="text-[11.5px] font-black text-white">
                          {language === 'te' ? 'డిజిటల్ లబ్ధిదారు సబ్సిడీ వోచర్' : 'Marginal Farmer Subvention Approval Voucher'}
                        </h5>
                      </div>
                      <span className="text-[9px] bg-emerald-800/80 border border-emerald-500 text-white px-2 py-0.5 rounded font-mono font-bold">
                        {simulatedCertificate.id}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-[10px] font-semibold text-emerald-200">
                      <div>
                        <span className="text-[8px] text-emerald-400 block">{language === 'te' ? 'రైతు సామాజిక శ్రేణి:' : 'Farmer Class:'}</span>
                        <span className="font-extrabold text-white uppercase">{simulatedCertificate.category}</span>
                      </div>
                      <div>
                        <span className="text-[8px] text-emerald-400 block">{language === 'te' ? 'నమోదిత భూమి:' : 'Land Verified:'}</span>
                        <span className="font-extrabold text-white text-emerald-100">{simulatedCertificate.acres} {language === 'te' ? 'ఎకరాలు' : 'Acres'}</span>
                      </div>
                      <div>
                        <span className="text-[8px] text-emerald-400 block">{language === 'te' ? 'జారీ చేసిన తేదీ:' : 'Issued Date:'}</span>
                        <span className="font-extrabold text-emerald-100 font-mono">{simulatedCertificate.date}</span>
                      </div>
                      <div>
                        <span className="text-[8px] text-emerald-400 block">{language === 'te' ? 'ఆధార్ (చివరి 4 అంకెలు):' : 'Aadhaar Index:'}</span>
                        <span className="font-extrabold text-emerald-100 font-mono">XXXX-XXXX-{simulatedCertificate.aadhaarLast4}</span>
                      </div>
                      <div>
                        <span className="text-[8px] text-emerald-400 block">{language === 'te' ? 'పట్టాదారు/CCRC సంఖ్య:' : 'Pattadar/CCRC Unique:'}</span>
                        <span className="font-extrabold text-emerald-100 font-mono">{simulatedCertificate.passbook}</span>
                      </div>
                      <div>
                        <span className="text-[8px] text-emerald-400 block">{language === 'te' ? 'ఎంపిక చేసిన యంత్రం:' : 'Equipment Approved:'}</span>
                        <span className="font-extrabold text-white uppercase font-black text-emerald-100">{simulatedCertificate.machinery}</span>
                      </div>
                    </div>

                    <div className="bg-emerald-900/50 p-2.5 rounded-xl border border-emerald-800/60 flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></div>
                      <p className="text-[8.5px] text-emerald-300 font-bold leading-normal">
                        {language === 'te' 
                          ? 'గమనిక: ఈ ప్రీ-అప్రూవల్ వోచర్ తీసుకొని నివాస గ్రామ రైతు సేవా కేంద్రాన్ని (RSK) సంప్రదించండి.' 
                          : 'Valid Pre-Approval. Carry your physical Annadhata Sukhibhava cards and CCRC to nearest RSK for matching biometric clearance.'}
                      </p>
                    </div>

                    <div className="flex justify-end gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => {
                          setSimulatedCertificate(null);
                          triggerToast(language === 'te' ? 'వోచర్ క్లియర్ చేయబడింది.' : 'Voucher cleared.', 'info');
                        }}
                        className="text-[9px] text-emerald-400 hover:text-white font-bold"
                      >
                        {language === 'te' ? 'రద్దు చేయి' : 'Clear Pass'}
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          window.print();
                        }}
                        className="bg-emerald-700 hover:bg-emerald-600 text-white text-[9px] font-black px-2.5 py-1 rounded"
                      >
                        {language === 'te' ? 'ప్రింట్ తీసుకోండి ⎙' : 'Print Voucher ⎙'}
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Right Side: Major State Schemes & Offical Redirect Links (5 cols) */}
              <div className="lg:col-span-5 space-y-4">
                <span className="text-[10px] text-slate-400 font-black uppercase tracking-widest block pl-1">
                  {language === 'te' ? 'లైవ్ అప్లికేషన్ లింకులు' : 'Direct Official Portals'}
                </span>

                <div className="space-y-3">
                  {[
                    { 
                      titleTe: 'అన్నదాత సుఖీభవ - పీఎం కిసాన్ (Annadhata Sukhibhava)',
                      titleEn: 'Annadhata Sukhibhava - PM Kisan',
                      valTe: 'సాయం రూ. 20,000 / ఏడాది',
                      valEn: '₹20,000 Crop Support',
                      noteTe: 'చిన్న సన్నకారు & కౌలు రైతులకు ఉచిత ఎరువులు, విత్తనాలు మరియు క్రెడిట్ సహాయం',
                      noteEn: 'Direct benefit transfer and financial assistance to help farmers sustain agricultural operations',
                      url: 'https://annadathasukhibhava.ap.gov.in/'
                    },
                    {
                      titleTe: 'పి.ఎం కిసాన్ సమ్మాన్ నిధి (PM Kisan)',
                      titleEn: 'PM Kisan Samman Nidhi',
                      valTe: 'ఆర్థిక సాయం రూ. 6,000 / ఏడాది',
                      valEn: '₹6,000 Direct Support',
                      noteTe: 'కేంద్ర ప్రభుత్వం ద్వారా సమాన విడతలలో లభించే సులభమైన నగదు బదిలీ',
                      noteEn: 'Direct income support program linked to landholder registry database',
                      url: 'https://pmkisan.gov.in/'
                    },
                    {
                      titleTe: 'ఫసల్ బీమా యోజన - పంట బీమా (PMFBY)',
                      titleEn: 'Crop Insurance (PMFBY)',
                      valTe: '100% నష్ట పరిహారం భద్రత',
                      valEn: 'Complete Crop Protection Cover',
                      noteTe: 'వాతావరణ దోషాలు, అకాల వర్షాలు, తుఫాను వల్ల నష్టాలకు త్వరిత బీమా చెల్లింపులు',
                      noteEn: 'Fast insurance disbursal during rainfall blocks, pest swarms, storms',
                      url: 'https://pmfby.gov.in/'
                    },
                    {
                      titleTe: 'కిసాన్ క్రెడిట్ కార్డ్ రుణం (KCC)',
                      titleEn: 'Kisan Credit Card (Agri Loan)',
                      valTe: '4% అతి తక్కువ వడ్డీ రుణాలు',
                      valEn: '4% Subsidized Agri Credit',
                      noteTe: 'విత్తనాలు, రసాయనాలు మరియు చిన్న గృహ అవసరాల కొరకు శీఘ్ర రుణాల ఆఫర్',
                      noteEn: 'Hassle-free micro credit support for purchasing seeds and operating fuels',
                      url: 'https://www.myscheme.gov.in/schemes/kcc'
                    },
                    {
                      titleTe: 'యాంత్రీకరణ సబ్-మిషన్ పథకం (SMAM)',
                      titleEn: 'Machinery Subsidy SMAM Portal',
                      valTe: 'ట్రాక్టర్లపై 45%-90% సబ్సిడీ రాయితీ',
                      valEn: '40% - 90% Tractor Subsidy',
                      noteTe: 'కలెక్టివ్ కస్టమ్ హైరింగ్ సెంటర్ల కొరకు భారీ రాయితీల పంపిణీ',
                      noteEn: 'Integrated farm mechanization support with remote custom center options',
                      url: 'https://agrimachinery.nic.in/'
                    }
                  ].map((scheme, idx) => {
                    const title = language === 'te' ? scheme.titleTe : scheme.titleEn;
                    const value = language === 'te' ? scheme.valTe : scheme.valEn;
                    const note = language === 'te' ? scheme.noteTe : scheme.noteEn;

                    return (
                      <div 
                        key={idx} 
                        className="bg-white border border-slate-100 rounded-2xl p-4 shadow-3xs hover:border-[#1b6d24]/50 transition-all flex flex-col justify-between gap-3 text-left"
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
                            <span className="text-[10px] font-black text-slate-800">{title}</span>
                          </div>
                          <p className="text-[8.5px] text-slate-400 font-bold leading-normal">{note}</p>
                          <span className="text-[9.5px] font-extrabold text-[#1b6d24] block">{value}</span>
                        </div>

                        {appliedScheme === title ? (
                          <span className="w-full text-center text-[9px] font-black bg-emerald-50 text-emerald-700 border border-emerald-100 py-1.5 rounded-lg block">
                            ✓ {language === 'te' ? 'లింక్ ఓపెన్ చేయబడింది' : 'Direct Link Activated'}
                          </span>
                        ) : (
                          <button
                            type="button"
                            onClick={() => {
                              setAppliedScheme(title);
                              triggerToast(language === 'te' ? `అధికారిక వెబ్‌సైట్ ఓపెన్ చేయబడుతోంది: ${title}` : `Redirecting to official: ${title}`, 'success');
                              setTimeout(() => {
                                window.open(scheme.url, '_blank', 'noopener,noreferrer');
                              }, 750);
                            }}
                            className="w-full text-center text-[9px] font-black bg-[#1b6d24]/10 hover:bg-[#1b6d24] hover:text-white text-[#1b6d24] py-1.5 rounded-lg transition-all"
                          >
                            {language === 'te' ? 'లింక్ ఓపెన్ చేయి ↗' : 'Launch Official Portal ↗'}
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

            </div>

          </div>
        )}

        {/* TAB 4: CROP RECOMMENDATION */}
        {activeTab === 'crop_suggestions' && (
          <div className="space-y-6 text-left">
            
            {/* Header & Illustration Card */}
            <div className="bg-gradient-to-r from-emerald-900 via-emerald-800 to-green-950 text-white rounded-[20px] p-6 shadow-md relative overflow-hidden flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div className="space-y-1.5 z-10 max-w-2xl">
                <div className="inline-flex items-center gap-1.5 bg-emerald-700/50 backdrop-blur-md border border-emerald-500/40 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider text-emerald-200">
                  <Sprout className="w-3.5 h-3.5 text-emerald-300" />
                  <span>{language === 'te' ? 'నేల రకం & అగ్రోనమీ సహాయక సిస్టమ్' : 'Soil & Agronomic Decision Support'}</span>
                </div>
                <h3 className="text-xl md:text-2xl font-black text-white tracking-tight flex items-center gap-2">
                  <span>🌱</span>
                  <span>{language === 'te' ? 'స్మార్ట్ పంటల సిఫార్సు వ్యవస్థ' : 'Smart Crop Recommendation System'}</span>
                </h3>
                <p className="text-xs text-emerald-100/90 leading-relaxed font-medium">
                  {language === 'te' 
                    ? 'మీ నేల రకం, పంట కాలం, జిల్లా మరియు నీటి లభ్యత ఆధారంగా గరిష్ట దిగుబడినిచ్చే పంటలను ఎంచుకోండి.' 
                    : 'Get personalized crop suggestions based on soil type, season, district, water availability, and farm size.'}
                </p>
              </div>

              {/* Decorative Banner Graphics */}
              <div className="z-10 flex items-center gap-2 bg-white/10 backdrop-blur-md border border-white/20 p-3 rounded-2xl shrink-0">
                <div className="text-center">
                  <span className="text-2xl block">🌾</span>
                  <span className="text-[9px] font-bold text-emerald-200 uppercase">{language === 'te' ? 'దిగుబడి' : 'Yield Cap'}</span>
                </div>
                <div className="w-px h-8 bg-white/20"></div>
                <div className="text-center">
                  <span className="text-2xl block">💰</span>
                  <span className="text-[9px] font-bold text-emerald-200 uppercase">{language === 'te' ? 'లాభం' : 'Profit'}</span>
                </div>
                <div className="w-px h-8 bg-white/20"></div>
                <div className="text-center">
                  <span className="text-2xl block">🎯</span>
                  <span className="text-[9px] font-bold text-yellow-300 uppercase">94% Acc.</span>
                </div>
              </div>

              {/* Background gradient blur decoration */}
              <div className="absolute -right-10 -bottom-10 w-48 h-48 bg-emerald-500/20 rounded-full blur-2xl pointer-events-none"></div>
            </div>

            {/* Main Interactive Form Card */}
            <form onSubmit={handleCalculateCrop} className="bg-white border border-slate-200/90 rounded-[20px] p-6 shadow-[0_8px_24px_rgba(0,0,0,0.06)] space-y-6">
              
              {/* Quick Soil Type Presets */}
              <div className="space-y-2">
                <label className="text-xs font-extrabold text-slate-700 flex items-center gap-1.5">
                  <Layers className="w-4 h-4 text-[#1b6d24]" />
                  <span>{language === 'te' ? 'నేల రకం ఎంచుకోండి (Quick Soil Presets):' : 'Select Soil Type (Quick Presets):'}</span>
                </label>
                <div className="flex flex-wrap gap-2">
                  {[
                    { id: 'red', nameTe: '🟤 ఎర్ర నేలలు (Red Sandy)', nameEn: '🟤 Red Sandy Soil' },
                    { id: 'black', nameTe: '⚫ నల్ల రేగడి (Black Cotton)', nameEn: '⚫ Black Cotton Soil' },
                    { id: 'loamy', nameTe: '🟡 ఒండ్రు / మట్టి నేలలు (Loamy/Clay)', nameEn: '🟡 Loamy / Clay Soil' },
                    { id: 'sandy', nameTe: '⚪ ఇసుక నేలలు (Alluvial River)', nameEn: '⚪ Alluvial River Sandy' },
                    { id: 'laterite', nameTe: '🟠 లాటరైట్ నేలలు (Laterite)', nameEn: '🟠 Laterite Soil' },
                  ].map((preset) => (
                    <button
                      key={preset.id}
                      type="button"
                      onClick={() => setSoilType(preset.id)}
                      className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
                        soilType === preset.id
                          ? 'bg-[#1b6d24] text-white border-[#1b6d24] shadow-sm scale-[1.02]'
                          : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                      }`}
                    >
                      {language === 'te' ? preset.nameTe : preset.nameEn}
                    </button>
                  ))}
                </div>
              </div>

              {/* Form Input Parameters Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-2">
                
                {/* 1. Soil Type Dropdown */}
                <div className="space-y-1.5">
                  <label className="text-[11px] uppercase tracking-wider font-extrabold text-slate-600 block">
                    {language === 'te' ? 'నేల రకం (Soil Type)' : 'Soil Type'}
                  </label>
                  <select 
                    value={soilType} 
                    onChange={(e) => setSoilType(e.target.value)} 
                    className="w-full text-xs font-bold bg-slate-50/90 hover:bg-white focus:bg-white border border-slate-200 focus:border-[#1b6d24] focus:ring-2 focus:ring-[#1b6d24]/10 rounded-xl py-2.5 px-3 text-slate-800 transition-all outline-none"
                  >
                    <option value="red">{language === 'te' ? '🟤 ఎర్ర నేలలు (Red Sandy Soil)' : '🟤 Red Sandy Soil'}</option>
                    <option value="black">{language === 'te' ? '⚫ నల్ల రేగడి నేలలు (Black Cotton Soil)' : '⚫ Black Cotton Soil'}</option>
                    <option value="loamy">{language === 'te' ? '🟡 ఒండ్రు / మట్టి నేలలు (Loamy / Clay Soil)' : '🟡 Loamy / Heavy Clay Soil'}</option>
                    <option value="sandy">{language === 'te' ? '⚪ ఇసుక నేలలు (River Alluvial Sandy)' : '⚪ River Alluvial Sandy'}</option>
                    <option value="laterite">{language === 'te' ? '🟠 లాటరైట్ నేలలు (Laterite Soil)' : '🟠 Laterite Red Soil'}</option>
                  </select>
                </div>

                {/* 2. Crop Season Dropdown */}
                <div className="space-y-1.5">
                  <label className="text-[11px] uppercase tracking-wider font-extrabold text-slate-600 block">
                    {language === 'te' ? 'పంట కాలం (Season)' : 'Crop Season'}
                  </label>
                  <select 
                    value={seasonSelect} 
                    onChange={(e) => setSeasonSelect(e.target.value)} 
                    className="w-full text-xs font-bold bg-slate-50/90 hover:bg-white focus:bg-white border border-slate-200 focus:border-[#1b6d24] focus:ring-2 focus:ring-[#1b6d24]/10 rounded-xl py-2.5 px-3 text-slate-800 transition-all outline-none"
                  >
                    <option value="kharif">{language === 'te' ? '🌦 ఖరీఫ్ (Kharif - Monsoon)' : '🌦 Kharif (Rainy Monsoon)'}</option>
                    <option value="rabi">{language === 'te' ? '❄️ రబీ (Rabi - Winter)' : '❄️ Rabi (Winter Crop)'}</option>
                    <option value="summer">{language === 'te' ? '☀️ వేసవి (Summer Dry / Zaid)' : '☀️ Summer Dry (Zaid)'}</option>
                  </select>
                </div>

                {/* 3. District Dropdown */}
                <div className="space-y-1.5">
                  <label className="text-[11px] uppercase tracking-wider font-extrabold text-slate-600 block">
                    {language === 'te' ? 'ఆంధ్రప్రదేశ్ జిల్లా (District)' : 'AP District'}
                  </label>
                  <select 
                    value={suggestDistrict} 
                    onChange={(e) => setSuggestDistrict(e.target.value)} 
                    className="w-full text-xs font-bold bg-slate-50/90 hover:bg-white focus:bg-white border border-slate-200 focus:border-[#1b6d24] focus:ring-2 focus:ring-[#1b6d24]/10 rounded-xl py-2.5 px-3 text-slate-800 transition-all outline-none"
                  >
                    {DISTRICTS.filter(d => d !== 'అన్నీ').map((district) => {
                      const parensMatch = (district || "").match(/\(([^)]+)\)/);
                      const cleanEnglish = parensMatch ? parensMatch[1] : district;
                      const cleanTelugu = district.split(' (')[0];
                      return (
                        <option key={cleanEnglish} value={cleanEnglish}>
                          {language === 'te' ? `${cleanTelugu} (${cleanEnglish})` : `${cleanEnglish} (${cleanTelugu})`}
                        </option>
                      );
                    })}
                  </select>
                </div>

                {/* 4. Water Availability */}
                <div className="space-y-1.5">
                  <label className="text-[11px] uppercase tracking-wider font-extrabold text-slate-600 block">
                    {language === 'te' ? 'నీటి లభ్యత (Water Availability)' : 'Water Availability'}
                  </label>
                  <select 
                    value={waterAvailability} 
                    onChange={(e) => setWaterAvailability(e.target.value)} 
                    className="w-full text-xs font-bold bg-slate-50/90 hover:bg-white focus:bg-white border border-slate-200 focus:border-[#1b6d24] focus:ring-2 focus:ring-[#1b6d24]/10 rounded-xl py-2.5 px-3 text-slate-800 transition-all outline-none"
                  >
                    <option value="high">{language === 'te' ? '💧💧💧 సమృద్ధిగా (High - Canal / Borewell)' : '💧💧💧 High (Canal / Continuous Bore)'}</option>
                    <option value="medium">{language === 'te' ? '💧💧 మధ్యస్థం (Medium - Rainfed + Drip)' : '💧💧 Medium (Rainfed / Drip System)'}</option>
                    <option value="low">{language === 'te' ? '💧 పరిమితం (Low - Dryland Rainfed)' : '💧 Low (Dryland Rainfed)'}</option>
                  </select>
                </div>

                {/* 5. Farm Size */}
                <div className="space-y-1.5">
                  <label className="text-[11px] uppercase tracking-wider font-extrabold text-slate-600 block">
                    {language === 'te' ? 'వ్యవసాయ పరిమాణం (Farm Size)' : 'Farm Size'}
                  </label>
                  <select 
                    value={farmSizeCategory} 
                    onChange={(e) => setFarmSizeCategory(e.target.value)} 
                    className="w-full text-xs font-bold bg-slate-50/90 hover:bg-white focus:bg-white border border-slate-200 focus:border-[#1b6d24] focus:ring-2 focus:ring-[#1b6d24]/10 rounded-xl py-2.5 px-3 text-slate-800 transition-all outline-none"
                  >
                    <option value="small">{language === 'te' ? '2 ఎకరాల లోపు (Small < 2 Acres)' : '< 2 Acres (Small Farmer)'}</option>
                    <option value="medium">{language === 'te' ? '2 నుండి 5 ఎకరాలు (Medium 2-5 Acres)' : '2 – 5 Acres (Medium Farm)'}</option>
                    <option value="large">{language === 'te' ? '5 ఎకరాల పైన (Commercial 5+ Acres)' : '5+ Acres (Commercial Farm)'}</option>
                  </select>
                </div>

                {/* Quick Hint */}
                <div className="flex items-center gap-2 bg-emerald-50/80 border border-emerald-200/70 p-2.5 rounded-xl text-[10px] text-emerald-900 font-semibold leading-tight">
                  <span className="text-sm">💡</span>
                  <span>
                    {language === 'te' 
                      ? 'ఈ వివరాలు ఆచార్య ఎన్.జి. రంగా వ్యవసాయ విశ్వవిద్యాలయ మార్గదర్శకాలతో అనుసంధానించబడ్డాయి.' 
                      : 'Data synced with ANGRAU agronomy recommendation protocols.'}
                  </span>
                </div>

              </div>

              {/* Submit Action Button */}
              <button 
                type="submit" 
                className="w-full bg-gradient-to-r from-[#1E7E34] to-[#2E9E44] hover:from-[#1b6d24] hover:to-[#248235] text-white text-sm font-extrabold h-13 rounded-xl transition-all shadow-md hover:shadow-lg hover:shadow-emerald-700/20 hover:-translate-y-0.5 active:translate-y-0 flex items-center justify-center gap-2 cursor-pointer"
              >
                <span className="text-base">🌱</span>
                <span>{language === 'te' ? 'పంటల సిఫార్సులు పొందండి' : 'Get Crop Suggestions'}</span>
              </button>
            </form>

            {/* Results Block */}
            {calcResult && (
              <div className="space-y-5 animate-scale-up">
                
                {/* Result Header & System Confidence Score */}
                <div className="bg-white border border-slate-200/80 rounded-[20px] p-5 shadow-[0_8px_24px_rgba(0,0,0,0.06)] flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-[#1b6d24]">
                      <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                      <h4 className="text-base font-black text-slate-800">
                        {language === 'te' ? 'అనుకూలమైన పంటల విశ్లేషణ' : 'Recommended Crops Breakdown'}
                      </h4>
                    </div>
                    <p className="text-xs text-slate-500 font-medium">
                      {language === 'te' 
                        ? `${calcResult.district} జిల్లా వాతావరణం, ${soilType.toUpperCase()} నేలలకు ఉత్తమ ఎంపికలు.` 
                        : `Optimized selections for ${calcResult.district} district and selected conditions.`}
                    </p>
                  </div>

                  {/* Recommendation Accuracy Score Badge */}
                  <div className="bg-emerald-50 border border-emerald-200/80 px-4 py-2.5 rounded-xl space-y-1 text-center shrink-0 w-full md:w-auto">
                    <div className="flex items-center justify-between gap-3 text-xs font-black text-[#1b6d24]">
                      <span>{language === 'te' ? 'సిఫార్సు కచ్చితత్వం' : 'Recommendation Accuracy'}</span>
                      <span className="bg-[#1b6d24] text-white px-2 py-0.5 rounded-md text-[10px] font-black">{calcResult.accuracy}%</span>
                    </div>
                    <div className="w-full bg-emerald-200/70 h-2 rounded-full overflow-hidden">
                      <div className="bg-[#1b6d24] h-full rounded-full transition-all duration-1000" style={{ width: `${calcResult.accuracy}%` }}></div>
                    </div>
                  </div>
                </div>

                {/* Recommended Crop Cards Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {calcResult.crops.map((crop: any, idx: number) => (
                    <div 
                      key={idx}
                      className="bg-white border border-slate-200 hover:border-emerald-500/50 rounded-[18px] p-5 shadow-[0_4px_20px_rgba(0,0,0,0.04)] hover:shadow-md transition-all space-y-4 relative overflow-hidden flex flex-col justify-between"
                    >
                      {/* Top Rank Badge & Match % */}
                      <div>
                        <div className="flex items-center justify-between gap-2 mb-2">
                          <span className="text-xs font-extrabold text-emerald-700 bg-emerald-50 border border-emerald-200/80 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                            <Award className="w-3.5 h-3.5 text-emerald-600" />
                            <span>#{idx + 1} {language === 'te' ? 'ఎంపిక' : 'Choice'}</span>
                          </span>
                          <span className="text-xs font-black text-[#1b6d24] bg-emerald-100/80 px-2.5 py-0.5 rounded-full">
                            {crop.matchPercent}% {language === 'te' ? 'అనుకూలత' : 'Match'}
                          </span>
                        </div>

                        {/* Crop Title & Icon */}
                        <div className="flex items-start gap-3 my-2">
                          <span className="text-3xl bg-slate-50 border border-slate-100 p-2 rounded-2xl shrink-0">{crop.icon}</span>
                          <div>
                            <h5 className="font-black text-slate-900 text-sm leading-snug">
                              {language === 'te' ? crop.nameTe : crop.nameEn}
                            </h5>
                            <span className="inline-block mt-1 text-[10px] font-bold text-emerald-800 bg-emerald-50 border border-emerald-200/60 px-2 py-0.5 rounded-md">
                              {language === 'te' ? crop.badgeTe : crop.badgeEn}
                            </span>
                          </div>
                        </div>

                        {/* Match Progress Bar */}
                        <div className="space-y-1 my-3">
                          <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                            <div 
                              className="bg-gradient-to-r from-emerald-600 to-[#1b6d24] h-full rounded-full transition-all duration-700"
                              style={{ width: `${crop.matchPercent}%` }}
                            ></div>
                          </div>
                        </div>

                        {/* Metrics Grid */}
                        <div className="space-y-2 text-xs pt-1 border-t border-slate-100">
                          
                          <div className="flex items-center justify-between py-0.5">
                            <span className="text-slate-500 font-semibold flex items-center gap-1.5 text-[11px]">
                              <Droplets className="w-3.5 h-3.5 text-blue-500" />
                              <span>{language === 'te' ? 'నీటి అవసరం:' : 'Water Need:'}</span>
                            </span>
                            <span className="font-extrabold text-slate-800 text-[11px]">
                              {language === 'te' ? crop.waterNeedTe : crop.waterNeedEn}
                            </span>
                          </div>

                          <div className="flex items-center justify-between py-0.5">
                            <span className="text-slate-500 font-semibold flex items-center gap-1.5 text-[11px]">
                              <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />
                              <span>{language === 'te' ? 'అంచనా దిగుబడి:' : 'Expected Yield:'}</span>
                            </span>
                            <span className="font-bold text-emerald-800 text-[11px]">
                              {language === 'te' ? crop.expectedYieldTe : crop.expectedYieldEn}
                            </span>
                          </div>

                          <div className="flex items-center justify-between py-0.5">
                            <span className="text-slate-500 font-semibold flex items-center gap-1.5 text-[11px]">
                              <span>💰</span>
                              <span>{language === 'te' ? 'అంచనా నికర లాభం:' : 'Est. Net Profit:'}</span>
                            </span>
                            <span className="font-extrabold text-[#1b6d24] text-[11px]">
                              {language === 'te' ? crop.estimatedProfitTe : crop.estimatedProfitEn}
                            </span>
                          </div>

                          <div className="flex items-center justify-between py-0.5">
                            <span className="text-slate-500 font-semibold flex items-center gap-1.5 text-[11px]">
                              <span>🌾</span>
                              <span>{language === 'te' ? 'విత్తన మోతాదు:' : 'Seed Rate:'}</span>
                            </span>
                            <span className="font-bold text-slate-700 text-[11px]">
                              {language === 'te' ? crop.seedRateTe : crop.seedRateEn}
                            </span>
                          </div>

                          <div className="flex items-center justify-between py-0.5">
                            <span className="text-slate-500 font-semibold flex items-center gap-1.5 text-[11px]">
                              <span>📏</span>
                              <span>{language === 'te' ? 'మొక్కల సాంద్రత:' : 'Spacing:'}</span>
                            </span>
                            <span className="font-mono font-bold text-slate-700 text-[11px]">
                              {crop.spacing}
                            </span>
                          </div>

                        </div>
                      </div>

                    </div>
                  ))}
                </div>

                {/* Quick Insights Advisory Panel */}
                <div className="bg-slate-900 text-white rounded-[20px] p-5 shadow-lg space-y-3">
                  <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
                    <Sprout className="w-4 h-4 text-emerald-400" />
                    <h5 className="text-xs font-extrabold uppercase tracking-widest text-slate-200">
                      {language === 'te' ? 'రైతు సలహా ప్యానెల్ (Agronomy Advisory Insights)' : 'Agronomy Advisory Insights'}
                    </h5>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                    
                    {/* Sowing Window */}
                    <div className="bg-slate-800/80 border border-slate-700/80 p-3.5 rounded-xl space-y-1">
                      <div className="flex items-center gap-1.5 text-emerald-400 font-extrabold text-[11px]">
                        <Calendar className="w-3.5 h-3.5" />
                        <span>{language === 'te' ? 'ఉత్తమ విత్తు సమయం' : 'Best Sowing Window'}</span>
                      </div>
                      <p className="font-black text-white text-sm">
                        {language === 'te' ? calcResult.sowingWindowTe : calcResult.sowingWindowEn}
                      </p>
                    </div>

                    {/* Rainfall Forecast */}
                    <div className="bg-slate-800/80 border border-slate-700/80 p-3.5 rounded-xl space-y-1">
                      <div className="flex items-center gap-1.5 text-sky-400 font-extrabold text-[11px]">
                        <CloudSun className="w-3.5 h-3.5" />
                        <span>{language === 'te' ? 'వర్షపాత అంచనా' : 'Expected Rainfall'}</span>
                      </div>
                      <p className="font-bold text-slate-200 leading-snug">
                        {language === 'te' ? calcResult.rainfallTe : calcResult.rainfallEn}
                      </p>
                    </div>

                    {/* Pest Risk Alert */}
                    <div className="bg-slate-800/80 border border-slate-700/80 p-3.5 rounded-xl space-y-1">
                      <div className="flex items-center gap-1.5 text-amber-400 font-extrabold text-[11px]">
                        <AlertTriangle className="w-3.5 h-3.5" />
                        <span>{language === 'te' ? 'పురుగు తెగుళ్ల హెచ్చరిక' : 'Pest Risk Alert'}</span>
                      </div>
                      <p className="font-bold text-amber-200 leading-snug">
                        {language === 'te' ? calcResult.pestAlertTe : calcResult.pestAlertEn}
                      </p>
                    </div>

                  </div>
                </div>

              </div>
            )}
          </div>
        )}

        {/* TAB 5: EMERGENCY SOS */}
        {activeTab === 'emerg_requests' && (
          <div className="space-y-6">
            <div>
              <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">{language === 'te' ? 'అత్యవసర వ్యవసాయ సహాయ వేదిక (SOS)' : 'AP Cooperative Emergency Rescue'}</h3>
              <p className="text-xs text-slate-450 mt-1">{language === 'te' ? 'వరదలు లేదా యంత్రాంగం దెబ్బతిన్నప్పుడు పొరుగు రైతులను అత్యవసర పంపుల కొరకు అభ్యర్థించండి.' : 'Flood emergency pump evacuations, sandbags, and express heavy digger requests.'}</p>
            </div>

            <form onSubmit={handleAddEmergency} className="bg-red-50 border border-red-200 p-4 rounded-2xl space-y-3">
              <span className="text-[9.5px] uppercase font-black text-red-750">Publish High-Priority SOS Request</span>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <input 
                  type="text" 
                  required
                  value={newEmerVillage}
                  onChange={(e) => setNewEmerVillage(e.target.value)}
                  placeholder="Village / Location details" 
                  className="bg-white border rounded-xl py-1.5 px-3 text-xs font-bold" 
                />
                <input 
                  type="text" 
                  required
                  value={newEmerNeed}
                  onChange={(e) => setNewEmerNeed(e.target.value)}
                  placeholder="Machinery Required (e.g. 10 HP water evacuators)" 
                  className="bg-white border rounded-xl py-1.5 px-3 text-xs font-bold" 
                />
              </div>
              <textarea 
                rows={2} 
                required
                value={newEmerProblem}
                onChange={(e) => setNewEmerProblem(e.target.value)}
                placeholder="Briefly state problem (e.g. Field water levels rising fast!)" 
                className="w-full bg-white border rounded-xl p-3 text-xs font-bold" 
              />
              <div className="flex justify-between items-center">
                <input 
                  type="text" 
                  required
                  value={newEmerContact}
                  onChange={(e) => setNewEmerContact(e.target.value)}
                  placeholder="Phone number" 
                  className="bg-white border rounded-xl px-3 py-1 text-xs font-bold" 
                />
                <button type="submit" className="bg-red-650 bg-red-700 text-white text-[11px] font-black uppercase px-4 py-1.5 rounded-lg">
                  Submit SOS Request
                </button>
              </div>
            </form>

            <div className="space-y-3">
              {emergencies.map(e => {
                const village = language === 'te' ? (e.villageTe || e.village) : (e.villageEn || e.village);
                const machineryNeeded = language === 'te' ? (e.machineryNeededTe || e.machineryNeeded) : (e.machineryNeededEn || e.machineryNeeded);
                const problem = language === 'te' ? (e.problemTe || e.problem) : (e.problemEn || e.problem);

                return (
                  <div key={e.id} className="bg-white border border-red-150 rounded-2xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-3 animate-fade-in animate-scale-up">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="bg-red-500 text-white text-[8.5px] font-black px-1.5 rounded">
                          {e.priority}
                        </span>
                        <h4 className="text-xs font-black text-slate-800">{machineryNeeded}</h4>
                      </div>
                      <p className="text-[10px] text-slate-500 font-bold">{village} • {language === 'te' ? 'సంప్రదించండి' : 'Contact'}: {e.contact}</p>
                      <p className="text-xs text-slate-600 italic">"{problem}"</p>
                    </div>
                    <span className={`text-[10px] font-black px-2 py-0.5 rounded ${
                      e.status === 'OPEN' ? 'bg-red-100 text-red-700 animate-pulse' : 'bg-slate-50 text-slate-500'
                    }`}>{language === 'te' ? (e.status === 'OPEN' ? 'సహాయం కావాలి' : 'పరిష్కరిస్తున్నారు') : e.status}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB 6: LANGUAGE SETTINGS */}
        {activeTab === 'lang_settings' && (
          <div className="bg-slate-50 border rounded-2xl p-6 text-center space-y-4">
            <Globe className="w-12 h-12 text-[#1b6d24] mx-auto" />
            <div>
              <h3 className="text-xs font-black text-slate-700 uppercase tracking-widest">Cooperative Multilingual Settings</h3>
              <p className="text-xs text-slate-400 mt-1">AP Raitu Cooperative runs fully bilingual to support maximum rural literacy.</p>
            </div>

            <div className="flex justify-center gap-3">
              <button 
                onClick={() => { if (language !== 'te') onLanguageToggle(); }}
                className={`py-2 px-6 rounded-xl font-black text-xs ${language === 'te' ? 'bg-[#1b6d24] text-white' : 'bg-white text-slate-800 border'}`}
              >
                తెలుగు (Telugu)
              </button>
              <button 
                onClick={() => { if (language !== 'en') onLanguageToggle(); }}
                className={`py-2 px-6 rounded-xl font-black text-xs ${language === 'en' ? 'bg-[#1b6d24] text-white' : 'bg-white text-slate-800 border'}`}
              >
                English
              </button>
            </div>
          </div>
        )}

      </main>
    </div>
  );
}
