import { Equipment, Chat, FarmerProfile } from './types';
import { loadAllReviews, calculateRatingSummary } from './reviewData';

export const DEFAULT_SILHOUETTE_AVATAR = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 500 500" width="500" height="500" fill="none"><rect width="500" height="500" fill="white"/><circle cx="250" cy="175" r="95" stroke="black" stroke-width="22"/><path d="M 85 430 A 185 185 0 0 1 415 430" stroke="black" stroke-width="22" stroke-linecap="round"/></svg>`;

export const INITIAL_EQUIPMENT: Equipment[] = [
  {
    id: 'eq1',
    title: 'మహీంద్రా జీవో 245 DI 4WD ట్రాక్టర్',
    titleEn: 'Mahindra Jivo 245 DI 4WD Tractor',
    category: 'tractor',
    categoryLabel: 'ట్రాక్టర్',
    location: 'బుక్కరాయసముద్రం, అనంతపురం అర్బన్ (మండలం)',
    locationEn: 'Bukkarayasamudram, Anantapur Urban Mandal',
    price: 1100,
    rateType: 'hour',
    rateTypeLabel: 'గంట',
    imageUrl: 'https://assets.khetigaadi.com/tr:h-350,w-500/new-tractor/Mahindra-JIVO-245-DI-4WD1735712127_mCvMHPx10X.png',
    status: 'available',
    statusLabel: 'అందుబాటులో ఉంది',
    ownerName: 'కిరణ్ కుమార్',
    ownerPhone: '9440123456',
    ownerAvatar: 'https://images.unsplash.com/photo-1595152772835-219674b2a8a6?auto=format&fit=crop&w=150&q=80',
    verified: true,
    description: 'చిన్న పొలాలు మరియు తోటల కోసం సరైన 24 HP సవారీ ట్రాక్టర్. చాలా తక్కువ ఇంధనం వినియోగిస్తుంది.',
    descriptionEn: 'Perfect 24 HP compact ride-on 4WD tractor for small farms and orchards. Low fuel consumption.',
    horsepower: '24 HP',
    fuelType: 'Diesel (డీజిల్)',
    includesDriver: false,
    specs: ['కల్టివేటర్ సదుపాయం ఉంటుంది', '4-Wheel Drive (4WD) ఆప్షన్', 'పండ్ల తోటలకు సరిగ్గా సరిపోతుంది', 'తక్కువ పొగ, ఎక్కువ మైలేజ్']
  },
  {
    id: 'eq2',
    title: 'కుబోటా హార్వెస్టర్ DC-68G',
    titleEn: 'Kubota Harvester DC-68G',
    category: 'harvester',
    categoryLabel: 'హార్వెస్టర్',
    location: 'బుక్కరాయసముద్రం, అనంతపురం అర్బన్ (మండలం)',
    locationEn: 'Bukkarayasamudram, Anantapur Urban Mandal',
    price: 2700,
    rateType: 'hour',
    rateTypeLabel: 'గంట',
    imageUrl: 'https://5.imimg.com/data5/BR/IH/FT/GLADMIN-22469/kubota-harvesking-dc-68g-900-x-1903-mm-combine-harvester.png',
    status: 'booked',
    statusLabel: 'బుకింగ్ చేయబడింది',
    ownerName: 'గోవింద్ రావు',
    ownerPhone: '9848023456',
    ownerAvatar: 'https://images.unsplash.com/photo-1618018352910-c11fb33a71b5?auto=format&fit=crop&w=150&q=80',
    verified: true,
    description: 'వరి మరియు గోధుమ కోతకు అనువైన అత్యాధునిక కుబోటా DC-68G జపనీస్ యంత్రం. చాలా వేగంగా క్లీన్ పద్ధతిలో కోత చేస్తుంది.',
    descriptionEn: 'State of the art Japanese Kubota DC-68G combine harvester ideal for paddy and wheat with zero grain loss.',
    horsepower: '68 HP',
    fuelType: 'Diesel (డీజిల్)',
    includesDriver: true,
    specs: ['నైపుణ్యం కల ఆపరేటర్ సేవలు ఉచితం', 'పంట నష్టం మరియు గింజలు రాలడం ఉండదు', 'రోజుకు 8 ఎకరాల వరకు కోయగల సామర్థ్యం', 'బురద నేలల్లో కూడా సులభంగా నడుస్తుంది']
  },
  {
    id: 'eq3',
    title: 'హై ప్రెషర్ పవర్ స్ప్రేయర్ STIHL SG 20',
    titleEn: 'STIHL SG 20 Power Sprayer',
    category: 'sprayer',
    categoryLabel: 'స్ప్రేయర్',
    location: 'బుక్కరాయసముద్రం, అనంతపురం అర్బన్ (మండలం)',
    locationEn: 'Bukkarayasamudram, Anantapur Urban Mandal',
    price: 1700,
    rateType: 'day',
    rateTypeLabel: 'రోజు',
    imageUrl: 'https://cdn11.bigcommerce.com/s-ncw6oteeon/images/stencil/1280x1280/products/1427992/2018954/75004__60702.1770407213.jpg?c=1',
    status: 'available',
    statusLabel: 'అందుబాటులో ఉంది',
    ownerName: 'సాయి మోహన్',
    ownerPhone: '9949112233',
    ownerAvatar: 'https://images.unsplash.com/photo-1531427186611-ecfd6d936c79?auto=format&fit=crop&w=150&q=80',
    verified: false,
    description: 'పురుగుల మందులు మరియు పోషకాలు చల్లడానికి అనువైన STIHL SG 20 హైప్రెజర్ పవర్ స్ప్రేయర్. తోటలు మరియు పంటలకు అత్యుత్తమం.',
    descriptionEn: 'High-pressure STIHL SG 20 power sprayer package ideal for pesticides and liquid fertilizers across farms and orchards.',
    horsepower: '5.5 HP',
    fuelType: 'Petrol (పెట్రోల్)',
    includesDriver: false,
    specs: ['100 మీటర్ల అత్యుత్తమ ప్రెజర్ పైపు', 'రెండు పిస్టన్ల గల పవర్ పిస్టన్ పంప్', 'ద్విచక్ర బండిపై కూడా తీసుకెళ్లవచ్చు', 'అదనపు స్ప్రే నూజిల్స్ ఉచితం']
  },
  {
    id: 'eq4',
    title: 'జాన్ డీర్ 5050 D 4WD ట్రాక్టర్',
    titleEn: 'John Deere 5050 D 4WD Tractor',
    category: 'tractor',
    categoryLabel: 'ట్రాక్టర్',
    location: 'బుక్కరాయసముద్రం, అనంతపురం అర్బన్ (మండలం)',
    locationEn: 'Bukkarayasamudram, Anantapur Urban Mandal',
    price: 1200,
    rateType: 'hour',
    rateTypeLabel: 'గంట',
    imageUrl: 'https://tractorkarvan.com/storage/images/JD/New-Model/5050-D-GearPro-4WD.jpg',
    status: 'available',
    statusLabel: 'అందుబాటులో ఉంది',
    ownerName: 'రాఘవ రెడ్డి',
    ownerPhone: '9391044556',
    ownerAvatar: 'https://images.unsplash.com/photo-1607990283143-e81e7a2c93ab?auto=format&fit=crop&w=150&q=80',
    verified: true,
    description: 'భారీ వ్యవసాయ పనుల కోసం 50 HP శక్తివంతమైన జాన్ డీర్ 5050 D 4WD ట్రాక్టర్. లోతైన దుక్కికి మరియు భారీ లోడ్లకు అనుకూలం.',
    descriptionEn: 'Power-packed 50 HP John Deere 5050 D 4WD GearPro tractor for heavy tillage and rotavator operations.',
    horsepower: '50 HP',
    fuelType: 'Diesel (డీజిల్)',
    includesDriver: true,
    specs: ['రోటవేటర్ & నాగలి అదనపు అద్దెకు లభ్యం', 'సులభమైన పవర్ స్టీరింగ్ టెక్నాలజీ', 'డ్రైవర్ వేతనం అద్దె ధరలోనే చేర్చబడింది', 'భారీ బరువులను అలవోకగా లాగగలదు']
  },
  {
    id: 'eq5',
    title: 'శక్తిమాన్ రెగ్యులర్ లైట్ రోటవేటర్ 6 అడుగులు',
    titleEn: 'Shaktiman Regular Light Rotavator 6ft',
    category: 'rotavator',
    categoryLabel: 'రోటవేటర్',
    location: 'బుక్కరాయసముద్రం, అనంతపురం అర్బన్ (మండలం)',
    locationEn: 'Bukkarayasamudram, Anantapur Urban Mandal',
    price: 1500,
    rateType: 'hour',
    rateTypeLabel: 'గంట',
    imageUrl: 'https://tractorguru.in/blog/wp-content/uploads/2021/02/unnamed.jpg',
    status: 'available',
    statusLabel: 'అందుబాటులో ఉంది',
    ownerName: 'వెంకటేశ్వర్లు',
    ownerPhone: '9177234567',
    ownerAvatar: 'https://images.unsplash.com/photo-1509099836639-18ba1795216d?auto=format&fit=crop&w=150&q=80',
    verified: true,
    description: 'భూమిని చాలా మెత్తగా దున్నడానికి అనువైన శక్తిమాన్ రెగ్యులర్ లైట్ 6 అడుగుల రోటవేటర్. తక్కువ సమయంలో ఎక్కువ విస్తీర్ణం దున్నుతుంది.',
    descriptionEn: 'High efficiency Shaktiman Regular Light 6ft tractor-mounted rotavator for fine soil bed tillage and puddle aeration.',
    horsepower: '40 - 55 HP',
    fuelType: 'PTO Driven (ట్రాక్టర్ అనుసంధానం)',
    includesDriver: false,
    specs: ['6 అడుగుల వెడల్పు తోటల దుక్కికి సరైనది', 'అత్యంత దృఢమైన బోరాన్ స్టీల్ బ్లేడ్లు', 'గట్టి మట్టిని సైతం పొడిపొడిగా చేస్తుంది', 'ట్రాక్టర్ సులభంగా లాగగల సమతుల్య బరువు']
  },
  {
    id: 'eq6',
    title: 'పవర్ టిల్లర్',
    titleEn: 'Power Tiller',
    category: 'tiller',
    categoryLabel: 'టిల్లర్',
    location: 'నెల్లూరు',
    locationEn: 'Nellore',
    price: 150,
    rateType: 'hour',
    rateTypeLabel: 'గంట',
    imageUrl: 'https://telugu-cdn.b-cdn.net/media/bidl2zs1/whatsapp-image-2024-05-14-at-11-31-07-am.jpeg',
    status: 'available',
    statusLabel: 'అందుబాటులో ఉంది',
    ownerName: 'వెంకటేశ్వర్లు',
    ownerPhone: '9849054321',
    ownerAvatar: 'https://images.unsplash.com/photo-1566753323558-f4e0952af115?auto=format&fit=crop&w=150&q=80',
    verified: true,
    description: 'వరి మడులను దున్నడానికి ఎంతో అవసరమైన క్రాస్ క్రాప్ పవర్ టిల్లర్. తడి నేలల్లో అద్భుతంగా పని చేస్తుంది.',
    descriptionEn: 'Essential cross crop power tiller for plowing paddy fields. Performs incredibly in wet mud terrain.',
    horsepower: '12 HP',
    fuelType: 'Diesel (డీజిల్)',
    includesDriver: false,
    specs: ['బురద నేత గట్టి దుక్కి కోసం అమర్చిన బ్లేడ్లు', 'చాలా తేలికైనది, ఎవరైనా నడపగలరు', 'గంటకు కేవలం 1.2 లీటర్ల ఇంధనం మాత్రమే తీసుకుంటుంది', 'ఉపయోగించడం ఎంతో సురక్షితం']
  },
  {
    id: 'eq7',
    title: 'కుబోటా వరి నాటు యంత్రం NSP-6W',
    titleEn: 'Kubota Paddy Transplanter NSP-6W',
    category: 'transplanter',
    categoryLabel: 'నాటు యంత్రం',
    location: 'గుంటూరు',
    locationEn: 'Guntur',
    price: 1500,
    rateType: 'hour',
    rateTypeLabel: 'గంట',
    imageUrl: 'https://bsg-i.nbxc.com/product/b1/45/af/085312a2932c745bf0d93ce58b.jpg',
    status: 'available',
    statusLabel: 'అందుబాటులో ఉంది',
    ownerName: 'కోటేశ్వరరావు',
    ownerPhone: '9440567890',
    ownerAvatar: 'https://images.unsplash.com/photo-1621416894569-0f39ed31d247?auto=format&fit=crop&w=150&q=80',
    verified: true,
    description: 'వరి నాటు వేయడానికి అధునాతన జపాన్ యంత్రం. కూలీల అవసరం 70% వరకు తగ్గుతుంది మరియు పర్ఫెక్ట్ నాట్లు పడతాయి.',
    descriptionEn: 'Advanced Japanese paddy planting machine. Reduces labor requirements by up to 70% and ensures perfect transplant alignment.',
    horsepower: '20 HP',
    fuelType: 'Diesel (డీజిల్)',
    includesDriver: true,
    specs: ['లేబర్ ఖర్చు 70% తగ్గుతుంది', 'రోజుకు 5-6 ఎకరాలు వేగంగా నాటగలదు', 'సриసమానమైన దూరంలో నాట్ల పద్ధతి', 'ఆపరేటర్ మరియు గైడ్ సహాయం ఉచితం']
  },
  {
    id: 'eq8',
    title: 'మహీంద్రా రోటవేటర్ గైరోవేటర్',
    titleEn: 'Mahindra Gyrovator Rotavator',
    category: 'rotavator',
    categoryLabel: 'రోటവേటర్',
    location: 'కర్నూలు',
    locationEn: 'Kurnool',
    price: 1200,
    rateType: 'hour',
    rateTypeLabel: 'గంట',
    imageUrl: 'https://5.imimg.com/data5/SELLER/Default/2021/6/PJ/PU/PT/9782214/mahindra-gyrovator-zlx-plus-145-c-m-tractor-mounted-rotavator-1000x1000.jpg',
    status: 'available',
    statusLabel: 'అందుబాటులో ఉంది',
    ownerName: 'మధుసూదన్ రెడ్డి',
    ownerPhone: '9848523456',
    ownerAvatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=150&q=80',
    verified: true,
    description: 'భూమిని మెత్తగా చేయడానికి అనువైన డ్యూటీ రోటవేటర్. వరి మరియు వాణిజ్య పంటల భూమి తయారీకి చాలా ఉత్తమమైనది.',
    descriptionEn: 'Heavy duty rotavator for preparing fine soil beds. Best suited for paddy and cotton wet/dry preparation.',
    horsepower: '45 HP',
    fuelType: 'Diesel (డీజిల్)',
    includesDriver: false,
    specs: ['తక్కువ వ్యవధిలో లోతైన మెత్తటి దుక్కి చేస్తుంది', 'అత్యంత దృఢమైన బోరాన్ స్టీల్ బ్లేడ్లు', 'దున్నేటప్పుడు వైబ్రేషన్స్ చాలా తక్కువ ఉంటాయి', 'యంత్రం నిర్వహణతో కూడిన డెమో లభ్యం']
  },
  {
    id: 'eq9',
    title: 'మల్టీ-క్రాప్ నూర్పిడి యంత్రం',
    titleEn: 'Multi-Crop Thresher',
    category: 'thresher',
    categoryLabel: 'నూర్పిడి యంత్రం',
    location: 'విశాఖపట్నం',
    locationEn: 'Visakhapatnam',
    price: 1200,
    rateType: 'hour',
    rateTypeLabel: 'గంట',
    imageUrl: 'https://www.mahindratractor.com/sites/default/files/2024-07/DM_Paddy_Multi_Crop_Thresher.webp',
    status: 'available',
    statusLabel: 'అందుబాటులో ఉంది',
    ownerName: 'సీతారామయ్య',
    ownerPhone: '9177112233',
    ownerAvatar: 'https://images.unsplash.com/photo-1509099836639-18ba1795216d?auto=format&fit=crop&w=150&q=80',
    verified: false,
    description: 'వరి, జొన్నలు, సజ్జలు, రాగులు నూర్పిడి చేయడానికి అనువైన పెర్ఫెక్ట్ యంత్రం. గింజలు పగలకుండా శుభ్రంగా వేరు చేస్తుంది.',
    descriptionEn: 'High throughput thresher for processing paddy, sorghum, millet, and ragi. Clean threshing without seed damage.',
    horsepower: '35 HP',
    fuelType: 'Diesel (డీజిల్)',
    includesDriver: true,
    specs: ['ధాన్యం గింజలు విరిగిపోకుండా శుభ్రంగా వేరు చేయును', 'స్వయంగా దుమ్ము క్లీనింగ్ వాక్యూమ్ సిస్టమ్ గలదు', 'గంటకు 1200 కేజీల వరకు నూర్పిడి సామర్థ్యం', 'అదనపు ఆపరేటర్ సేవలు అద్దెలోనే చేర్చబడ్డాయి']
  },
  {
    id: 'eq10',
    title: 'స్వరాజ్ 744 FE',
    titleEn: 'Swaraj 744 FE',
    category: 'tractor',
    categoryLabel: 'ట్రాక్టర్',
    location: 'చిత్తూరు',
    locationEn: 'Chittoor',
    price: 1100,
    rateType: 'hour',
    rateTypeLabel: 'గంట',
    imageUrl: 'https://tse4.mm.bing.net/th/id/OIP.2eLfCbRCIibpK3LI3YG5JgHaFs?pid=Api&P=0&h=180',
    status: 'available',
    statusLabel: 'అందుబాటులో ఉంది',
    ownerName: 'గోవర్ధన్ రావు',
    ownerPhone: '9440543210',
    ownerAvatar: 'https://images.unsplash.com/photo-1618018352910-c11fb33a71b5?auto=format&fit=crop&w=150&q=80',
    verified: true,
    description: 'మల్టీ-స్పీడ్ రివర్స్ PTO సదుపాయం గల 48 HP శక్తివంతమైన స్వరాజ్ ట్రాక్టర్. సేద్య పనులన్నింటికీ అనుకూలం.',
    descriptionEn: 'Powerful 48 HP Swaraj tractor with multi-speed reverse PTO. Extremely reliable for all cultivating tasks.',
    horsepower: '48 HP',
    fuelType: 'Diesel (డీజిల్)',
    includesDriver: true,
    specs: ['మల్టీ-స్పీడ్ రివర్స్ PTO సదుపాయం', 'అత్యంత ఎక్కువ కాలం పని చేయగల ఇంజిన్', 'చెరకు మరియు పండ్ల తోటల దుక్కికి అనువైనది', 'డ్రైవర్ సహాయం అద్దెలోనే చేర్చబడింది']
  },
  {
    id: 'eq11',
    title: 'అగ్రికల్చరల్ స్ప్రేయింగ్ డ్రోన్',
    titleEn: 'Agricultural Spraying Drone',
    category: 'sprayer',
    categoryLabel: 'స్ప్రేయర్',
    location: 'గుంటూరు',
    locationEn: 'Guntur',
    price: 800,
    rateType: 'hour',
    rateTypeLabel: 'గంట',
    imageUrl: 'https://i.ytimg.com/vi/uYYw2hzJcvM/oardefault.jpg?sqp=-oaymwEkCJUDENAFSFqQAgHyq4qpAxMIARUAAAAAJQAAyEI9AICiQ3gB&rs=AOn4CLCM6vG_Ed25FXivfMzYU9dZpLhiHQ',
    status: 'available',
    statusLabel: 'అందుబాటులో ఉంది',
    ownerName: 'సాయి కృష్ణ',
    ownerPhone: '9154098765',
    ownerAvatar: 'https://images.unsplash.com/photo-1624561172888-ac93c696e10c?auto=format&fit=crop&w=150&q=80',
    verified: true,
    description: 'పంటల పై పురుగుల మందును వేగంగా మరియు సమానంగా చల్లడానికి అత్యాధునిక డ్రోన్. 10 లీటర్ల ట్యాంక్ సామర్థ్యం.',
    descriptionEn: 'High-tech agricultural spraying drone for fast and uniform pesticide distribution. 10L payload tank.',
    horsepower: 'Electric (ఎలక్ట్రిక్)',
    fuelType: 'Battery (లిథియం బ్యాటరీ)',
    includesDriver: true,
    specs: ['సర్టిఫైడ్ డ్రోన్ పైలట్ మీ పొలంలో స్ప్రే చేస్తారు', 'ఎకరా పొలంలో కేవలం 10 నిముషాల్లో స్ప్రే పూర్తి చేసాడు', 'పురుగుల మందు వృధా కాదు', 'సరిసమానమైన స్ప్రే పద్ధతి']
  },
  {
    id: 'eq12',
    title: 'ట్రాక్టర్ డిస్క్ నాగలి',
    titleEn: 'Tractor Disc Plough',
    category: 'other',
    categoryLabel: 'ఇతర పరికరాలు',
    location: 'అనంతపురము',
    locationEn: 'Anantapuramu',
    price: 400,
    rateType: 'hour',
    rateTypeLabel: 'గంట',
    imageUrl: 'https://image.made-in-china.com/2f0j00KwZVJAPCiOzE/Farm-Disc-Harrow-Tractor-Implements-Middle-Duty-Disc-Harrow-20-Discs-Harrow.jpg',
    status: 'available',
    statusLabel: 'అందుబాటులో ఉంది',
    ownerName: 'రామకృష్ణుడు',
    ownerPhone: '9494321098',
    ownerAvatar: 'https://images.unsplash.com/photo-1621416894569-0f39ed31d247?auto=format&fit=crop&w=150&q=80',
    verified: false,
    description: 'రైతులకు అత్యంత ఉపయోగకరమైన డిస్క్ నాగలి. గట్టి మట్టి నేలల లోతైన దుక్కి కొరకు సరిగ్గా సరిపోతుంది.',
    descriptionEn: 'Highly reliable tractor-mounted disk plough. Perfectly suited for deep soil preparation and mixing.',
    horsepower: '35 HP - 55 HP',
    fuelType: 'Loader Mounted (లేదు)',
    includesDriver: false,
    specs: ['దృఢమైన కార్బన్ స్టీల్ డిస్క్‌లు', 'మట్టిని బాగా వదులు చేస్తుంది', 'చెత్త మరియు కలుపు మొక్కలను శుభ్రంగా కప్పివేస్తుంది', 'తక్కువ పవర్ కన్జంప్షన్']
  },
  {
    id: 'eq13',
    title: 'కిర్లోస్కర్ హై-వాల్యూమ్ డీజిల్ వాటర్ పంప్',
    titleEn: 'Kirloskar High-Volume Diesel Water Pump (10 HP)',
    category: 'other',
    categoryLabel: 'ఇతర పరికరాలు',
    location: 'కర్నూలు',
    locationEn: 'Kurnool',
    price: 300,
    rateType: 'hour',
    rateTypeLabel: 'గంట',
    imageUrl: 'https://5.imimg.com/data5/SELLER/Default/2021/11/LB/DV/KD/3962274/111-2--1000x1000.jpg',
    status: 'available',
    statusLabel: 'అందుబాటులో ఉంది',
    ownerName: 'గోవిందురాజులు',
    ownerPhone: '9848123450',
    ownerAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
    verified: true,
    description: 'పొలాలకు నిరంతరాయంగా నీరు పెట్టడానికి అనువైన శక్తివంతమైన డీజిల్ పంప్ సెట్. అత్యధిక నీటి ఉత్సర్గ సామర్థ్యం గలదు.',
    descriptionEn: 'High capacity 10 HP diesel engine water pump set. Robust operations for medium to large field drainage and flood irrigation.',
    horsepower: '10 HP',
    fuelType: 'Diesel (డీజిల్)',
    includesDriver: false,
    specs: ['గంటకు 60,000 లీటర్ల అత్యుత్తమ నీటి సరఫరా', 'తక్కువ డీజిల్ వినియోగం - గంటకు కేవలం 0.8 లీటర్లు', '200 అడుగుల డెలివరీ హోస్ పైప్ లభ్యం', 'దృఢమైన ఇనుప రక్షణ ఫ్రేమ్‌తో సులభమైన రవాణా']
  },
  {
    id: 'eq14',
    title: 'హోండా మల్టీపర్పస్ పవర్ వీడర్',
    titleEn: 'Honda Multipurpose Power Weeder',
    category: 'tiller',
    categoryLabel: 'టిల్లర్',
    location: 'గుంటూరు',
    locationEn: 'Guntur',
    price: 200,
    rateType: 'hour',
    rateTypeLabel: 'గంట',
    imageUrl: 'https://aspee.com/attachments/products/power-weeder-ga.jpg',
    status: 'available',
    statusLabel: 'అందుబాటులో ఉంది',
    ownerName: 'లక్ష్మీ నారాయణ',
    ownerPhone: '9494765432',
    ownerAvatar: 'https://images.unsplash.com/photo-1624561172888-ac93c696e10c?auto=format&fit=crop&w=150&q=80',
    verified: true,
    description: 'పత్తి, మిరప, చెరకు తోటలలో కలుపు తీయడానికి మరియు మట్టిని వదులు చేయడానికి అత్యుత్తమ పవర్ వీడర్.',
    descriptionEn: 'Highly versatile Honda petrol power weeder & shallow rotary soil tiller. Eradicates dry weeds between row-crops.',
    horsepower: '5.5 HP',
    fuelType: 'Petrol (పెట్రోల్)',
    includesDriver: false,
    specs: ['కలుపు తీయుట, గట్లు వేయుట మరియు లోతు త్రవ్వటానికి అటాచ్‌మెంట్‌లు', 'చిన్న సైజు కావడం వల్ల మొక్కల మధ్య సులువుగా నడపవచ్చు', 'అధిక శక్తి గల హోండా 4-స్ట్రోక్ ఇంజిన్', 'వైబ్రేషన్ తగ్గించే పట్టుకు అనుకూలమైన హ్యాండిల్స్']
  },
  {
    id: 'eq15',
    title: 'క్రాంప్టన్ ఎలక్ట్రిక్ మోటార్ పంప్',
    titleEn: 'Crompton Electric Motor Pump',
    category: 'other',
    categoryLabel: 'ఇతర పరికరాలు',
    location: 'అనంతపురము',
    locationEn: 'Anantapuramu',
    price: 250,
    rateType: 'hour',
    rateTypeLabel: 'గంట',
    imageUrl: 'https://m.media-amazon.com/images/I/71hyKqYwR+L._AC_SL1500_.jpg',
    status: 'available',
    statusLabel: 'అందుబాటులో ఉంది',
    ownerName: 'తిరుపాల్ నాయక్',
    ownerPhone: '9988112233',
    ownerAvatar: 'https://images.unsplash.com/photo-1509099836639-18ba1795216d?auto=format&fit=crop&w=150&q=80',
    verified: false,
    description: 'బావులు మరియు బోర్ల నుండి నీరు తోడే రస్ట్-ఫ్రీ కాపర్ సబ్మెర్సిబుల్ మోటార్. ఎక్కువ బోర్ ప్రెజర్ తట్టుకోగలదు.',
    descriptionEn: 'High-lift submersible electric borewell and open well motor. Build with copper impeller, ideal for deep-well water lifting.',
    horsepower: '7.5 HP',
    fuelType: '3-Phase Electric (విద్యుత్తు)',
    includesDriver: false,
    specs: ['రాగి వైండింగ్ కలిగి ఉండటంతో ఎక్కువ కాలం మన్నుతుంది', 'ఓవర్-వోల్టేజ్ ప్రొటెక్షన్ స్టార్టర్ బాక్స్ లభ్యం', 'సెకనుకు 15 లీటర్ల ఎత్తైన మార్గంలో నీటి సరఫరా', 'సులభమైన కేబుల్ కౌప్లింగ్ సీలింగ్ కిట్']
  }
];

export const INITIAL_USER: FarmerProfile = {
  name: 'రామకృష్ణ ప్రసాద్',
  phone: '9866012345',
  location: 'అనంతపురము',
  avatar: DEFAULT_SILHOUETTE_AVATAR,
  listedEquipmentIds: [],
  bookedEquipmentIds: []
};

export const INITIAL_CHATS: Chat[] = [
  {
    id: 'chat1',
    equipmentId: 'eq1',
    equipmentTitle: 'మహీంద్రా జీవో 245 DI',
    equipmentImage: 'https://images.unsplash.com/photo-1530906358829-e84b2769270f?auto=format&fit=crop&w=800&q=80',
    contactName: 'కిరణ్ కుమార్',
    contactAvatar: 'https://images.unsplash.com/photo-1595152772835-219674b2a8a6?auto=format&fit=crop&w=150&q=80',
    contactPhone: '9440123456',
    lastMessage: 'నమస్కారం సార్, ట్రాక్టర్ రేపు ఉదయం అందుబాటులో ఉంటుంది.',
    lastMessageTime: '09:30 AM',
    unread: true,
    senderPhone: '9866012345',
    senderName: 'రామకృష్ణ ప్రసాద్',
    senderAvatar: 'https://images.unsplash.com/photo-1566385211905-2b44ef911c42?auto=format&fit=crop&w=150&q=80',
    ownerPhone: '9440123456',
    messages: [
      {
        id: 'm1',
        sender: 'user',
        text: 'నమస్తే శాస్ గారు, ఈ మహీంద్రా జీవో 245 DI ట్రాక్టర్ రేపు ఖాళీగా ఉందా?',
        time: 'Yesterday, 06:15 PM'
      },
      {
        id: 'm2',
        sender: 'owner',
        text: 'నమస్కారం సార్, అవును, ట్రాక్టర్ రేపు ఉదయం అందుబాటులో ఉంటుంది. మీకు ఎన్ని రోజులు అవసరం?',
        time: 'Yesterday, 07:05 PM'
      },
      {
        id: 'm3',
        sender: 'user',
        text: 'నాకు రెండు రోజులు పొలం దున్నడానికి కావాలి. డీజిల్ ఖర్చులు నేనే చూసుకుంటాను.',
        time: 'Today, 09:12 AM'
      },
      {
        id: 'm4',
        sender: 'owner',
        text: 'సరే సార్, అలాగే. మీరు బుక్ చేయండి, డీల్ ఫైనల్ చేద్దాం.',
        time: 'Today, 09:30 AM'
      }
    ]
  },
  {
    id: 'chat2',
    equipmentId: 'eq3',
    equipmentTitle: 'పవర్ స్ప్రేయర్',
    equipmentImage: 'https://5.imimg.com/data5/BZ/ZF/KN/SELLER-82588675/agricultural-power-sprayer-500x500.jpg',
    contactName: 'గోపాల్ రావు',
    contactAvatar: 'https://images.unsplash.com/photo-1531427186611-ecfd6d936c79?auto=format&fit=crop&w=150&q=80',
    contactPhone: '9989045612',
    lastMessage: 'అవునండీ, 100 మీటర్ల పైపు మరియు నోజిల్స్ కూడా కలిసి వస్తాయి.',
    lastMessageTime: 'Yesterday',
    unread: false,
    senderPhone: '9866012345',
    senderName: 'రామకృష్ణ ప్రసాద్',
    senderAvatar: 'https://images.unsplash.com/photo-1566385211905-2b44ef911c42?auto=format&fit=crop&w=150&q=80',
    ownerPhone: '9989045612',
    messages: [
      {
        id: 'm21',
        sender: 'user',
        text: 'పవర్ స్ప్రేయర్‌తో పాటు పైపు కూడా ఇస్తారా?',
        time: 'Yesterday, 11:20 AM'
      },
      {
        id: 'm22',
        sender: 'owner',
        text: 'అవునండీ, 100 మీటర్ల పైపు మరియు నోజిల్స్ కూడా కలిసి వస్తాయి.',
        time: 'Yesterday, 11:45 AM'
      }
    ]
  }
];

export const DISTRICTS = [
  'అన్నీ',
  'Alluri Sitharama Raju (అల్లూరి సీతారామరాజు)',
  'Anakapalli (అనకాపల్లి)',
  'Anantapuramu (అనంతపురము)',
  'Annamayya (అన్నమయ్య)',
  'Bapatla (బాపట్ల)',
  'Chittoor (చిత్తూరు)',
  'Dr. B.R. Ambedkar Konaseema (డాక్టర్ బి.ఆర్. అంబేద్కర్ కోనసీమ)',
  'East Godavari (తూర్పు గోదావరి)',
  'Eluru (ఏలూరు)',
  'Guntur (గుంటూరు)',
  'Kakinada (కాకినాడ)',
  'Krishna (కృష్ణా)',
  'Kurnool (కర్నూలు)',
  'Nandyal (నంద్యాల)',
  'NTR (ఎన్టీఆర్)',
  'Palnadu (పల్నాడు)',
  'Parvathipuram Manyam (పార్వతీపురం మన్యం)',
  'Prakasam (ప్రకాశం)',
  'Srikakulam (శ్రీకాకుళం)',
  'Sri Potti Sriramulu Nellore (శ్రీ పొట్టి శ్రీరాములు నెల్లూరు)',
  'Sri Sathya Sai (శ్రీ సత్యసాయి)',
  'Tirupati (తిరుపతి)',
  'Visakhapatnam (విశాఖపట్నం)',
  'Vizianagaram (విజయనగరం)',
  'West Godavari (పశ్చిమ గోదావరి)',
  'YSR Kadapa (వైఎస్ఆర్ కడప)'
];

export const CATEGORIES = [
  { id: 'tractor', label: 'ట్రాక్టర్', iconName: 'Tractor', color: 'bg-[#e2f0d9] text-[#1b6d24]' },
  { id: 'harvester', label: 'హార్వెస్టర్', iconName: 'Workflow', color: 'bg-[#fce5cd] text-[#b45f06]' },
  { id: 'sprayer', label: 'స్ప్రేయర్', iconName: 'Sprout', color: 'bg-[#fff2cc] text-[#bf9000]' },
  { id: 'tiller', label: 'టిల్లర్', iconName: 'Leaf', color: 'bg-[#e8f5e9] text-[#2e7d32]' },
  { id: 'rotavator', label: 'రోటవేటర్', iconName: 'Layers', color: 'bg-[#f3e5f5] text-[#8e24aa]' },
  { id: 'transplanter', label: 'నాటు యంత్రం', iconName: 'Sprout', color: 'bg-[#e0f2f1] text-[#00695c]' },
  { id: 'thresher', label: 'నూర్పిడి యంత్రం', iconName: 'Workflow', color: 'bg-[#efebe9] text-[#4e342e]' },
  { id: 'other', label: 'ఇతర పరికరాలు', iconName: 'HelpCircle', color: 'bg-[#eceff1] text-[#37474f]' }
];

export const MOCK_OWNER_REPLIES = [
  "సరే సార్, మీరు పలానా సమయానికి వస్తే పరికరం సిద్ధంగా ఉంచుతాను.",
  "బుకింగ్ కన్ఫర్మ్ చేసుకోండి సార్. ఫోన్ నెంబర్ లేదా లొకేషన్ పంపిస్తాను.",
  "ఖచ్చితంగా సార్, మా డ్రైవర్ అక్కడకు తీసుకొని వస్తాడు. అదనపు చార్జీలు ఉండవు.",
  "మీకు బుకింగ్ గురించి ఏదైనా సందేహం ఉంటే దయచేసి నేరుగా కాల్ చేయండి.",
  "పరికరం పూర్తి కండిషన్‌లో ఉంది సార్. వాడిన తర్వాత తిరిగే ఇచ్చేటప్పుడు శుభ్రంగా ఇవ్వవలెను."
];

export type MachineryIntent =
  | 'PRICE_INQUIRY'
  | 'PRICE_NEGOTIATION'
  | 'PRICE_CALCULATION'
  | 'DRIVER_OPERATOR'
  | 'LOCATION'
  | 'DELIVERY'
  | 'AVAILABILITY'
  | 'TIMING_ARRIVAL'
  | 'FUEL_DIESEL'
  | 'SUITABILITY_CROPS'
  | 'CONTACT_PHONE'
  | 'BOOKING'
  | 'PAYMENT'
  | 'CONDITION_SPECS'
  | 'ATTACHMENTS'
  | 'OWNER_DETAILS'
  | 'GREETING'
  | 'GENERAL_QUESTION';

export function detectMachineryIntent(userText: string): MachineryIntent {
  const text = (userText || '').trim().toLowerCase();

  // 0. TIMING / ARRIVAL SCHEDULE INTENT (Highest priority for questions like "a time ki", "a time ki vastharu", "what time", "morning 6:30")
  if (
    text.includes('a time ki') ||
    text.includes('ye time ki') ||
    text.includes('e time ki') ||
    text.includes('time ki') ||
    text.includes('vastharu') ||
    text.includes('vasthara') ||
    text.includes('vasthundi') ||
    text.includes('vasthada') ||
    text.includes('vachedi') ||
    text.includes('vache time') ||
    text.includes('vache samayam') ||
    text.includes('eppudu vastharu') ||
    text.includes('eppudu vasthara') ||
    text.includes('eppudu thestharu') ||
    text.includes('eppudu pamputharu') ||
    text.includes('enni gantlaku') ||
    text.includes('enni gantalaku') ||
    text.includes('gantlaku') ||
    text.includes('gantalaku') ||
    text.includes('morning vasthara') ||
    text.includes('morning vastharu') ||
    text.includes('what time') ||
    text.includes('at what time') ||
    text.includes('which time') ||
    text.includes('when will you come') ||
    text.includes('when will it arrive') ||
    text.includes('when will the machine come') ||
    text.includes('when can you bring') ||
    text.includes('arrival time') ||
    text.includes('dispatch time') ||
    text.includes('start time') ||
    text.includes('work timing') ||
    text.includes('morning time') ||
    text.includes('repu morning') ||
    text.includes('repu udayam') ||
    text.includes('ఉదయం ఏ సమయం') ||
    text.includes('ఏ సమయానికి') ||
    text.includes('ఎప్పుడు వస్తారు') ||
    text.includes('వచ్చే సమయం') ||
    text.includes('టైం కి') ||
    text.includes('టైమ్‌కి') ||
    /(\d{1,2}(:\d{2})?\s*(am|pm|గంటలకి|గంటలకు|గం))/i.test(text)
  ) {
    return 'TIMING_ARRIVAL';
  }

  // 1. DRIVER / OPERATOR INTENT
  // Checks first so "Is a driver included with this price?" is not hijacked by price
  if (
    text.includes('driver') || 
    text.includes('operator') || 
    text.includes('person to drive') ||
    text.includes('who will drive') ||
    text.includes('drive it') ||
    text.includes('డ్రైవర్') || 
    text.includes('ఆపరేటర్') || 
    text.includes('నడిపే') || 
    text.includes('తోలే') || 
    text.includes('మనిషి') || 
    text.includes('డ్రైవింగ్') ||
    text.includes('driver untara') ||
    text.includes('driver unnara') ||
    text.includes('driver kavali') ||
    text.includes('driver unda') ||
    text.includes('nadipe') ||
    text.includes('tole')
  ) {
    return 'DRIVER_OPERATOR';
  }

  // 2. DURATION / ESTIMATE CALCULATION INTENT
  // e.g. "I need it for 2 days, what is the best price?", "for 2 days", "3 days"
  if (
    /(\d+)\s*(day|days|రోజు|రోజులు|రోజ్|hour|hours|గంట|గంటలు|rojulu|rojulaku|roju)/i.test(text) ||
    text.includes('2 days') || text.includes('3 days') || text.includes('4 days') || text.includes('5 days') ||
    text.includes('for 2 days') || text.includes('for 3 days') || text.includes('రెండు రోజులు') || 
    text.includes('మూడు రోజులు') || text.includes('ఎన్ని రోజులు') || text.includes('వారం') ||
    text.includes('rendu rojulu') || text.includes('moodu rojulu') || text.includes('enni rojulu')
  ) {
    return 'PRICE_CALCULATION';
  }

  // 3. CONTACT / PHONE NUMBER INTENT
  if (
    text.includes('phone') || 
    text.includes('number') || 
    text.includes('call') || 
    text.includes('mobile') || 
    text.includes('contact') || 
    text.includes('ఫోన్') || 
    text.includes('నెంబర్') || 
    text.includes('నంబర్') || 
    text.includes('కాల్') || 
    text.includes('సంప్రదించండి') ||
    text.includes('ఫోన్ చేయండి') ||
    text.includes('phone number') ||
    text.includes('call cheyyocha') ||
    text.includes('call cheyandi') ||
    text.includes('number ivvandi')
  ) {
    return 'CONTACT_PHONE';
  }

  // 4. FUEL / DIESEL INTENT
  if (
    text.includes('diesel') || 
    text.includes('fuel') || 
    text.includes('oil') || 
    text.includes('petrol') || 
    text.includes('mileage') ||
    text.includes('డీజిల్') || 
    text.includes('ఇంధనం') || 
    text.includes('ఆయిల్') || 
    text.includes('మైలేజ్') ||
    text.includes('diesel evaridhi') ||
    text.includes('diesel evaru') ||
    text.includes('indhanam')
  ) {
    return 'FUEL_DIESEL';
  }

  // 5. ATTACHMENTS / IMPLEMENTS INTENT
  if (
    text.includes('rotavator') || 
    text.includes('plow') || 
    text.includes('cultivator') || 
    text.includes('attachment') || 
    text.includes('blades') || 
    text.includes('రోటవేటర్') || 
    text.includes('కల్టివేటర్') || 
    text.includes('నాగలి') || 
    text.includes('బ్లేడ్లు') || 
    text.includes('పరికరాలు') ||
    text.includes('rotavator undha') ||
    text.includes('cultivator undha') ||
    text.includes('nagali')
  ) {
    return 'ATTACHMENTS';
  }

  // 6. SUITABILITY FOR CROPS / PLOWING / HARVESTING
  if (
    text.includes('వరి') || 
    text.includes('పంట') || 
    text.includes('దున్నటం') || 
    text.includes('చేను') || 
    text.includes('పొలం') || 
    text.includes('ఎకరాలు') || 
    text.includes('మట్టి') || 
    text.includes('తోట') || 
    text.includes('నూర్పిడి') || 
    text.includes('కోత') ||
    text.includes('paddy') || 
    text.includes('harvest') || 
    text.includes('crop') || 
    text.includes('acres') || 
    text.includes('soil') || 
    text.includes('plowing') ||
    text.includes('vari') || 
    text.includes('kotha') || 
    text.includes('dunnatam') || 
    text.includes('polam') || 
    text.includes('ekaram') || 
    text.includes('thota')
  ) {
    return 'SUITABILITY_CROPS';
  }

  // 7. LOCATION / PICKUP INTENT
  if (
    text.includes('where should i come') ||
    text.includes('where to pick') || 
    text.includes('pick up') || 
    text.includes('pickup') || 
    text.includes('where') || 
    text.includes('address') || 
    text.includes('yard') || 
    text.includes('reach') ||
    text.includes('come to') ||
    text.includes('లొకేషన్') || 
    text.includes('ఎక్కడ') || 
    text.includes('తీసుకోవాలి') || 
    text.includes('రావాలి') || 
    text.includes('అడ్రస్') ||
    text.includes('చిరునామా') ||
    text.includes('తోట') ||
    text.includes('గ్యారేజ్') ||
    text.includes('ekkada') ||
    text.includes('theesukovali') ||
    text.includes('ravali')
  ) {
    return 'LOCATION';
  }

  // 8. DELIVERY / TRANSPORT INTENT
  if (
    text.includes('deliver') ||
    text.includes('delivery') ||
    text.includes('transport') ||
    text.includes('bring to') ||
    text.includes('to my field') ||
    text.includes('to my farm') ||
    text.includes('రవాణా') ||
    text.includes('తోలకం') ||
    text.includes('డెలివరీ') ||
    text.includes('పొలానికి') ||
    text.includes('ravana') ||
    text.includes('delivery chesthara')
  ) {
    return 'DELIVERY';
  }

  // 9. AVAILABILITY / TIMING INTENT
  if (
    text.includes('tomorrow') || 
    text.includes('available') || 
    text.includes('availability') || 
    text.includes('timing') || 
    text.includes('when') || 
    text.includes('today') || 
    text.includes('schedule') || 
    text.includes('slot') || 
    text.includes('free') ||
    text.includes('రేపు') || 
    text.includes('ఉదయం') || 
    text.includes('ఎప్పుడు') || 
    text.includes('అందుబాటు') || 
    text.includes('ఈరోజు') || 
    text.includes('సమయం') ||
    text.includes('తేదీ') || 
    text.includes('ఖాళీ') ||
    text.includes('repu') ||
    text.includes('eppudu') ||
    text.includes('andhubatu') ||
    text.includes('khali')
  ) {
    return 'AVAILABILITY';
  }

  // 10. PRICE NEGOTIATION / DISCOUNT INTENT
  if (
    text.includes('negotiate') || 
    text.includes('discount') || 
    text.includes('concession') ||
    text.includes('reduce') || 
    text.includes('bargain') || 
    text.includes('cheaper') || 
    text.includes('less price') || 
    text.includes('best price') ||
    text.includes('తగ్గింపు') || 
    text.includes('తగ్గించడం') || 
    text.includes('కుదురుతుందా') || 
    text.includes('తగ్గుతుందా') || 
    text.includes('తక్కువ') || 
    text.includes('రాయితీ') ||
    text.includes('కొంచెం తగ్గించ') ||
    text.includes('tagginchandi') ||
    text.includes('koddiga') ||
    text.includes('rayithi')
  ) {
    return 'PRICE_NEGOTIATION';
  }

  // 11. PRICE INQUIRY (What is the price / rate)
  if (
    text.includes('price') || 
    text.includes('rate') || 
    text.includes('cost') || 
    text.includes('budget') || 
    text.includes('rent') ||
    text.includes('how much') ||
    text.includes('ధర ఎంత') || 
    text.includes('రేటు ఎంత') || 
    text.includes('ధర') || 
    text.includes('రేటు') || 
    text.includes('ఎంత') ||
    text.includes('dhara') ||
    text.includes('entha') ||
    text.includes('dhara entha') ||
    text.includes('rate entha')
  ) {
    return 'PRICE_INQUIRY';
  }

  // 12. BOOKING / CONFIRMATION INTENT
  if (
    text.includes('book') || 
    text.includes('confirm') ||
    text.includes('reserve') ||
    text.includes('బుకింగ్') || 
    text.includes('బుక్ చేయండి') || 
    text.includes('కన్ఫర్మ్') ||
    text.includes('booking') ||
    text.includes('ela book cheyali')
  ) {
    return 'BOOKING';
  }

  // 13. PAYMENT / ADVANCE INTENT
  if (
    text.includes('pay') ||
    text.includes('payment') ||
    text.includes('advance') ||
    text.includes('deposit') ||
    text.includes('cash') ||
    text.includes('upi') ||
    text.includes('చెల్లింపు') ||
    text.includes('డబ్బులు') ||
    text.includes('అడ్వాన్స్') ||
    text.includes('డిపాజిట్') ||
    text.includes('dabulu') ||
    text.includes('advance ivvala')
  ) {
    return 'PAYMENT';
  }

  // 14. CONDITION / SPECS INTENT
  if (
    text.includes('condition') || 
    text.includes('hp') || 
    text.includes('horsepower') || 
    text.includes('specs') || 
    text.includes('working') ||
    text.includes('servicing') ||
    text.includes('repair') ||
    text.includes('కండిషన్') || 
    text.includes('బాగుందా') || 
    text.includes('హార్స్‌పవర్') || 
    text.includes('సర్వీసింగ్') ||
    text.includes('condition ela undi') ||
    text.includes('bagundha')
  ) {
    return 'CONDITION_SPECS';
  }

  // 15. OWNER DETAILS INTENT
  if (
    text.includes('who is the owner') ||
    text.includes('who are you') ||
    text.includes('owner') ||
    text.includes('యజమాని ఎవరు') ||
    text.includes('మీ పేరేంటి') ||
    text.includes('యజమాని') ||
    text.includes('owner evaru')
  ) {
    return 'OWNER_DETAILS';
  }

  // 16. GREETING INTENT
  if (
    text.includes('hi') ||
    text.includes('hello') ||
    text.includes('hey') ||
    text.includes('namaste') ||
    text.includes('namasthe') ||
    text.includes('namaskaram') ||
    text.includes('నమస్తే') ||
    text.includes('హలో') ||
    text.includes('నమస్కారం') ||
    text.includes('బాగున్నారా')
  ) {
    return 'GREETING';
  }

  return 'GENERAL_QUESTION';
}

export function detectMessageLanguage(text: string, defaultUiLang: 'te' | 'te-en' | 'en' = 'te'): 'te' | 'te-en' | 'en' {
  const trimmed = (text || '').trim();
  if (!trimmed) {
    return defaultUiLang === 'en' ? 'en' : defaultUiLang === 'te-en' ? 'te-en' : 'te';
  }

  // 1. If contains Telugu Unicode characters, it's authentic Telugu script
  if (/[\u0C00-\u0C7F]/.test(trimmed)) {
    return 'te';
  }

  const lower = trimmed.toLowerCase();

  // 2. Strong Telugish patterns (Telugu words transliterated into English/Latin letters)
  const telugishPatterns = [
    /\b(a|e|ye)\s+time(\s+ki)?\b/,
    /\btime\s*ki\b/,
    /\b(vastharu|vasthara|vasthundi|vasthada|vachedi|vache)\b/,
    /\b(untara|untaara|unnara|unnaara|unda|undhi|undi)\b/,
    /\b(eppudu|ekkada|endhuku|yentha|entha|ela|evaru|evvaru)\b/,
    /\b(meeru|nenu|naaku|maaku|mee|maa|memu)\b/,
    /\b(tagginchandi|taggiddha|tagguthaada|thagginchandi)\b/,
    /\b(konchem|koncham|koddiga|chala|bagundi|bavundi|bavundha)\b/,
    /\b(polam|polaniki|chenu|chenuki|madiki)\b/,
    /\b(thesthara|chesthara|isthara|pamputhara|pampisthara)\b/,
    /\b(dorukuthunda|dorukuthundha|dorukuthaada)\b/,
    /\b(kavali|kaavali|lekapothe|anukuntunna|cheyali|cheyyali)\b/,
    /\b(cheyandi|ivvandi|randi|pampandi|chudandi)\b/,
    /\b(repu|ivala|ninna|udayam|sayanthram|rathri)\b/,
    /\b(rojulu|rojulaku|rojuki|gantalu|gantlaku|gantalaku)\b/,
    /\b(dhara|dharalu|rayithi|bata|kulie)\b/,
    /\b(rendu|moodu|nalugu|aidhu|aaru)\b/,
    /\b(koddhiga|saripothunda|kuduruthunda|kudhurthundha)\b/,
    /\b(chesukondi|telusukondi|cheppandi)\b/,
    /\b(chesi|theesi|petti|vachi|poyi)\b/
  ];

  const hasTelugishMarker = telugishPatterns.some(pattern => pattern.test(lower));
  if (hasTelugishMarker) {
    return 'te-en';
  }

  // 3. Count recognizable English words
  const englishWords = [
    'what', 'when', 'where', 'who', 'which', 'why', 'how',
    'is', 'are', 'was', 'were', 'am', 'can', 'could', 'will', 'would', 'should',
    'the', 'this', 'that', 'these', 'those', 'there', 'here',
    'included', 'available', 'availability', 'price', 'rate', 'cost',
    'driver', 'operator', 'tractor', 'rotavator', 'plow', 'harvester',
    'pickup', 'deliver', 'delivery', 'transport', 'tomorrow', 'today',
    'hello', 'hi', 'please', 'thank', 'thanks', 'contact', 'number',
    'need', 'want', 'hours', 'days', 'book', 'booking', 'farm', 'field'
  ];

  const words = lower.replace(/[^a-z0-9\s]/g, ' ').split(/\s+/).filter(Boolean);
  let englishCount = 0;
  for (const w of words) {
    if (englishWords.includes(w)) {
      englishCount++;
    }
  }

  if (englishCount > 0 && englishCount >= Math.ceil(words.length * 0.4)) {
    return 'en';
  }

  if (defaultUiLang === 'en' && englishCount > 0) {
    return 'en';
  }

  if (defaultUiLang === 'te') {
    return 'te-en';
  }

  return 'en';
}

// Contextual smart machinery chat response generator
export function generateSmartMachineryResponse(
  userText: string,
  equipment: any,
  language: 'te' | 'te-en' | 'en' = 'te'
): { reply: string; suggestions: string[]; intent: MachineryIntent } {
  const text = (userText || '').trim();
  const intent = detectMachineryIntent(text);
  const effectiveLang: 'te' | 'te-en' | 'en' = (language === 'te-en' || language === 'en')
    ? (detectMessageLanguage(text, language) === 'te' ? 'te' : language)
    : detectMessageLanguage(text, 'te');
  const isTe = effectiveLang === 'te';
  const isTeEn = effectiveLang === 'te-en';
  const title = (isTe ? equipment?.title : (equipment?.titleEn || equipment?.title)) || (isTe ? 'వ్యవసాయ యంత్రం' : 'Farm Equipment');
  const price = equipment?.price || 1000;
  const rateType = isTe ? (equipment?.rateTypeLabel || 'గంట') : (equipment?.rateType || 'hour');
  const rateTypeLabel = isTe ? (equipment?.rateTypeLabel || 'గంట') : isTeEn ? (equipment?.rateType === 'day' ? 'day' : 'hour') : (equipment?.rateType || 'hour');
  const location = (isTe ? equipment?.location : (equipment?.locationEn || equipment?.location)) || (isTe ? 'ఆంధ్రప్రదేశ్' : 'Andhra Pradesh');
  const owner = equipment?.ownerName || (isTe ? 'యంత్ర యజమాని' : isTeEn ? (equipment?.ownerName || 'Owner') : 'Machine Owner');
  const ownerPhone = equipment?.ownerPhone || '9440123456';
  const hasDriverField = equipment && (
    (equipment.includesDriver !== undefined && equipment.includesDriver !== null) ||
    (equipment.driverIncluded !== undefined && equipment.driverIncluded !== null)
  );
  const driverIncluded = equipment?.includesDriver !== undefined 
    ? Boolean(equipment.includesDriver) 
    : Boolean(equipment?.driverIncluded);
  const status = equipment?.status || 'available';
  const hp = equipment?.horsepower || '24-45 HP';
  const specs = Array.isArray(equipment?.specs) && equipment.specs.length > 0 ? equipment.specs.join(', ') : '';
  const isHourly = rateType === 'hour' || rateType === 'గంట' || equipment?.rateType === 'hour';

  // 0. TIMING_ARRIVAL
  if (intent === 'TIMING_ARRIVAL') {
    const timeMatch = text.match(/(\d{1,2}(:\d{2})?\s*(am|pm|గంటలకి|గంటలకు|గం))/i);
    if (timeMatch) {
      const requestedTime = timeMatch[0];
      if (isTe) {
        return {
          intent,
          reply: `సరేనండి! రేపు ఉదయం ${requestedTime} సమయానికే ${title} మీ పొలానికి చేరుకునేలా పంపిస్తాము. దయచేసి యాప్‌లోని 'బుక్ చేయండి' బటన్ ద్వారా మీ బుకింగ్ స్లాట్ కన్ఫర్మ్ చేసుకోండి లేదా మీ చేను లొకేషన్ వివరాలు పంపించండి.`,
          suggestions: [
            "ఈ ధరలో డ్రైవర్ ఉంటారా?",
            "యంత్రం తీసుకోవడానికి ఎక్కడికి రావాలి?",
            "ధర కొంచెం తగ్గించడం కుదురుతుందా?"
          ]
        };
      } else if (isTeEn) {
        return {
          intent,
          reply: `Sarenandi! Repu udayam ${requestedTime} samayanike ${title} mee polaniki vachedham. Dayachesi app lo 'Book Now' button dwara mee booking slot confirm cheskondi leda mee field landmark share cheyandi.`,
          suggestions: [
            "Ee price lo driver untara?",
            "Yanthram theesukovadaniki ekkadiki ravali?",
            "Dhara konchem tagginchadam kudhurthundha?"
          ]
        };
      } else {
        return {
          intent,
          reply: `Noted! We will prepare to dispatch the ${title} to reach your farm at around ${requestedTime} tomorrow morning. Please confirm your slot using the 'Book Now' button or share your farm landmark so we can head directly there.`,
          suggestions: [
            "Is a driver included with this price?",
            "Where should I come to pick it up?",
            "Can we negotiate the price slightly?"
          ]
        };
      }
    }

    if (isTe) {
      return {
        intent,
        reply: `యంత్రం సాధారణంగా ఉదయం 6:00 AM నుండి 7:00 AM మధ్య మీ పొలానికి చేరుకుంటుంది. మీ వ్యవసాయ పనులకు రేపు ఉదయం ఏ సమయం (ఉదా: 6:00 AM, 7:00 AM లేదా 8:00 AM) అనుకూలమో చెబితే, ఆ సమయానికే ఖచ్చితంగా డ్రైవర్‌తో యంత్రాన్ని పంపిస్తాము! మీకు ఏ సమయం వీలవుతుందో చెప్పండి.`,
        suggestions: [
          "రేపు ఉదయం 6:30 కి రండి",
          "ఈ ధరలో డ్రైవర్ ఉంటారా?",
          "యంత్రం తీసుకోవడానికి ఎక్కడికి రావాలి?"
        ]
      };
    } else if (isTeEn) {
      return {
        intent,
        reply: `Yanthram sadharanamga poddhune 6:00 AM nundi 7:00 AM madhya mee polaniki vasthundi. Mee vyavasaya panulaku repu udayam e time (e.g. 6:00 AM, 7:00 AM leda 8:00 AM) convenient ga untundho chepthe, aa time ke driver tho yanthranni pampistham! Meeku e samayam veelavuthundho cheppandi.`,
        suggestions: [
          "Repu morning 6:30 ki randi",
          "Ee price lo driver untara?",
          "Yanthram theesukovadaniki ekkadiki ravali?"
        ]
      };
    } else {
      return {
        intent,
        reply: `The ${title} is typically dispatched and delivered to your farm early morning between 6:00 AM and 7:00 AM so you can start right with daylight. What specific time (e.g., 6:00 AM, 7:00 AM, or 8:00 AM) works best for you tomorrow?`,
        suggestions: [
          "Can you come at 6:30 AM tomorrow?",
          "Is a driver included with this price?",
          "Where should I come to pick it up?"
        ]
      };
    }
  }

  // 1. DRIVER_OPERATOR
  if (intent === 'DRIVER_OPERATOR') {
    if (!hasDriverField) {
      if (isTe) {
        return {
          intent,
          reply: `లిస్టింగ్‌లో డ్రైవర్/ఆపరేటర్ వివరాలు స్పష్టంగా పేర్కొనబడలేదు. దయచేసి బుకింగ్ ఖరారు చేసే ముందు యజమానిని (${owner}) నేరుగా సంప్రదించి డ్రైవర్ అందుబాటును నిర్ధారించుకోండి.`,
          suggestions: [
            "ధర కొంచెం తగ్గించడం కుదురుతుందా?",
            "యంత్రం తీసుకోవడానికి ఎక్కడికి రావాలి?",
            "రేపు ఈ యంత్రం అందుబాటులో ఉంటుందా?"
          ]
        };
      } else if (isTeEn) {
        return {
          intent,
          reply: `Listing lo driver/operator details clear ga levu. Dayachesi booking finalize chese mundhu owner (${owner}) tho direct ga matladi driver availability confirm cheskondi.`,
          suggestions: [
            "Dhara konchem tagginchadam kudhurthundha?",
            "Yanthram theesukovadaniki ekkadiki ravali?",
            "Repu available aa?"
          ]
        };
      } else {
        return {
          intent,
          reply: `Driver/operator information is not specified in the listing. Please confirm directly with the owner (${owner}) before finalizing your booking.`,
          suggestions: [
            "Can we negotiate the price slightly?",
            "Where should I come to pick it up?",
            "Is this machine available tomorrow?"
          ]
        };
      }
    } else if (driverIncluded) {
      if (isTe) {
        return {
          intent,
          reply: `అవును. ఈ ${title} లిస్టింగ్‌లో అనుభవజ్ఞుడైన డ్రైవర్/ఆపరేటర్ ఉచితంగా చేర్చబడ్డారు, కాబట్టి నిర్ణయించిన ₹${price}/${rateTypeLabel} ధరలో డ్రైవర్ సేవలు కలిసి ఉన్నాయి.`,
          suggestions: [
            "ధర కొంచెం తగ్గించడం కుదురుతుందా?",
            "యంత్రం తీసుకోవడానికి ఎక్కడికి రావాలి?",
            "రేపు ఈ యంత్రం అందుబాటులో ఉంటుందా?"
          ]
        };
      } else if (isTeEn) {
        return {
          intent,
          reply: `Avunandi! Ee ${title} rental lo experienced driver/operator free ga unnaru, kabatti listed ₹${price}/${rateTypeLabel} rate lo driver services kuda kalise unnai.`,
          suggestions: [
            "Repu morning a time ki vastharu?",
            "Yanthram theesukovadaniki ekkadiki ravali?",
            "Dhara konchem tagginchadam kudhurthundha?"
          ]
        };
      } else {
        return {
          intent,
          reply: `Yes. An experienced driver/operator is included with the ${title} at no extra charge, so the listed ₹${price}/${rateType} price includes a driver.`,
          suggestions: [
            "Can we negotiate the price slightly?",
            "Where should I come to pick it up?",
            "Is this machine available tomorrow?"
          ]
        };
      }
    } else {
      if (isTe) {
        return {
          intent,
          reply: `లేదు. ఈ లిస్టింగ్ 'డ్రైవర్ లేదు' (No Driver) అని గుర్తించబడింది, కాబట్టి నిర్ణయించిన ₹${price}/${rateTypeLabel} ధరలో డ్రైవర్ ఉండరు. మీరే స్వయంగా నడపవచ్చు లేదా మీ డ్రైవర్‌తో పనిచేయించుకోవచ్చు, లేదా యజమాని రోజుకు ₹400-₹500 భత్యంతో స్థానిక డ్రైవర్‌ను ఏర్పాటు చేయగలరు.`,
          suggestions: [
            "ధర కొంచెం తగ్గించడం కుదురుతుందా?",
            "యంత్రం తీసుకోవడానికి ఎక్కడికి రావాలి?",
            "రేపు ఈ యంత్రం అందుబాటులో ఉంటుందా?"
          ]
        };
      } else if (isTeEn) {
        return {
          intent,
          reply: `Ledu andi. Ee listing 'No Driver' ga register cheyabadindhi, kabatti ₹${price}/${rateTypeLabel} rate lo driver ledu. Meeru leda mee operator drive cheskovali, leda roju ku ₹400-₹500 bata tho local driver ni owner arrange cheyagalaru.`,
          suggestions: [
            "Dhara konchem tagginchadam kudhurthundha?",
            "Yanthram theesukovadaniki ekkadiki ravali?",
            "Repu morning a time ki vastharu?"
          ]
        };
      } else {
        return {
          intent,
          reply: `No. This listing is marked as 'No Driver', so the listed ₹${price}/${rateType} price does not include a driver. You can operate it yourself or bring your own operator, or the owner can arrange a skilled local driver for standard daily bata of ₹400–₹500.`,
          suggestions: [
            "Can we negotiate the price slightly?",
            "Where should I come to pick it up?",
            "Is this machine available tomorrow?"
          ]
        };
      }
    }
  }

  // 2. PRICE_INQUIRY (Direct rate statement)
  if (intent === 'PRICE_INQUIRY') {
    if (isTe) {
      return {
        intent,
        reply: `${title} అద్దె ధర నిర్ణయించిన ప్రకారం ₹${price} ప్రతి ${rateTypeLabel}కి. ${isHourly ? 'ఇది యంత్రం రన్నింగ్ గంటల (Hour Meter) ప్రాతిపదికన లెక్కించబడుతుంది.' : 'ఇది రోజువారీ అద్దె ప్రాతిపదికన లెక్కించబడుతుంది.'} మీకు ఎన్ని ${rateTypeLabel}ల పని ఉందో చెబితే పూర్తి బడ్జెట్ లెక్కించి ఇస్తాను.`,
        suggestions: [
          "ధర కొంచెం తగ్గించడం కుదురుతుందా?",
          "ఈ ధరలో డ్రైవర్ ఉంటారా?",
          "యంత్రం తీసుకోవడానికి ఎక్కడికి రావాలి?"
        ]
      };
    } else if (isTeEn) {
      return {
        intent,
        reply: `${title} rental rate ₹${price} per ${rateTypeLabel}. ${isHourly ? 'Idi running hours (Hour Meter) batti calculate avuthundi.' : 'Idi daily rent basis meeda calculate avuthundi.'} Meeku enni ${rateTypeLabel}la pani undo chepthe total estimate chepthanu.`,
        suggestions: [
          "Dhara konchem tagginchadam kudhurthundha?",
          "Ee price lo driver untara?",
          "Repu morning a time ki vastharu?"
        ]
      };
    } else {
      return {
        intent,
        reply: `The listed rental rate for ${title} is ₹${price} per ${rateType}. ${isHourly ? 'Charges are billed as per the tractor hour-meter.' : 'Charges are calculated on a daily rental basis.'} Let me know how many ${rateType}s of work you are planning!`,
        suggestions: [
          "Can we negotiate the price slightly?",
          "Is a driver included with this price?",
          "Where should I come to pick it up?"
        ]
      };
    }
  }

  // 3. PRICE_CALCULATION (Duration estimate)
  if (intent === 'PRICE_CALCULATION') {
    const daysMatch = text.match(/(\d+)\s*(day|days|రోజు|రోజులు|rojulu)/i);
    const parsedDays = daysMatch ? parseInt(daysMatch[1], 10) : (text.includes('3') || text.includes('మూడు') || text.includes('moodu') ? 3 : 2);
    const isDayRate = rateType === 'day' || rateType === 'రోజు' || equipment?.rateType === 'day';

    if (isDayRate) {
      const baseTotal = parsedDays * price;
      const discountedTotal = Math.round(baseTotal * 0.90); // 10% farmer concession
      if (isTe) {
        return {
          intent,
          reply: `${title} రోజువారీ అద్దె రేటు ₹${price}/${rateTypeLabel}. ${parsedDays} రోజులకు సాధారణ మొత్తం ₹${baseTotal} అవుతుంది. ${parsedDays} రోజుల నిరంతర పని కోసం 10% రైతు రాయితీతో అత్యుత్తమ మొత్తం దాదాపు ₹${discountedTotal} అవుతుంది.`,
          suggestions: [
            "ఈ ధరలో డ్రైవర్ ఉంటారా?",
            "యంత్రం తీసుకోవడానికి ఎక్కడికి రావాలి?",
            "రేపు ఈ యంత్రం అందుబాటులో ఉంటుందా?"
          ]
        };
      } else if (isTeEn) {
        return {
          intent,
          reply: `${title} daily rental rate ₹${price}/${rateTypeLabel}. ${parsedDays} rojulaku regular total ₹${baseTotal} avuthundi. ${parsedDays} days continuous work kosam 10% farmer concession tho best price around ₹${discountedTotal} ivvagalanu!`,
          suggestions: [
            "Ee price lo driver untara?",
            "Yanthram theesukovadaniki ekkadiki ravali?",
            "Repu morning a time ki vastharu?"
          ]
        };
      } else {
        return {
          intent,
          reply: `The listed daily rental for ${title} is ₹${price}/${rateType}. For ${parsedDays} days, the standard total comes to ₹${baseTotal}. For a ${parsedDays}-day continuous booking, I can offer a 10% farmer concession, bringing the best price to approximately ₹${discountedTotal}.`,
          suggestions: [
            "Is a driver included with this price?",
            "Where should I come to pick it up?",
            "Is this machine available tomorrow?"
          ]
        };
      }
    } else {
      const estHoursPerDay = 8;
      const totalHours = parsedDays * estHoursPerDay;
      const baseTotal = totalHours * price;
      const discountedTotal = Math.round(baseTotal * 0.92); // 8% concession
      if (isTe) {
        return {
          intent,
          reply: `${title} గంటల ప్రాతిపదికన ₹${price}/${rateTypeLabel} నిర్ణయించబడింది. రోజుకు సగటున 8 గంటల పని అనుకుంటే, ${parsedDays} రోజులకు (మొత్తం ${totalHours} గంటలు) అద్దె ₹${baseTotal} అవుతుంది, మరియు 8% రాయితీతో సుమారు ₹${discountedTotal} అవుతుంది. మీ పొలంలో రోజుకు ఎన్ని గంటల పని ఉంటుందో చెబితే ఖచ్చితమైన బడ్జెట్ లెక్కించగలను!`,
          suggestions: [
            "ఈ ధరలో డ్రైవర్ ఉంటారా?",
            "యంత్రం తీసుకోవడానికి ఎక్కడికి రావాలి?",
            "రేపు ఈ యంత్రం అందుబాటులో ఉంటుందా?"
          ]
        };
      } else if (isTeEn) {
        return {
          intent,
          reply: `${title} hourly rate ₹${price}/${rateTypeLabel}. Standard ga roju ku 8 hours pani anukunte, ${parsedDays} rojulaku (${totalHours} hours) rental ₹${baseTotal} avuthundi, and 8% multi-day farmer discount tho around ₹${discountedTotal} avuthundi. Mee polam lo daily enni hours pani untundho chepthe exact budget chepthanu!`,
          suggestions: [
            "Ee price lo driver untara?",
            "Yanthram theesukovadaniki ekkadiki ravali?",
            "Repu morning a time ki vastharu?"
          ]
        };
      } else {
        return {
          intent,
          reply: `The ${title} is listed at ₹${price} per ${rateType}. Assuming a standard 8-hour workday, ${parsedDays} days (${totalHours} total hours) comes to ₹${baseTotal}, and with an 8% multi-day farmer discount it would be around ₹${discountedTotal}. If your working hours per day are different, let me know so I can calculate the exact figure!`,
          suggestions: [
            "Is a driver included with this price?",
            "Where should I come to pick it up?",
            "Is this machine available tomorrow?"
          ]
        };
      }
    }
  }

  // 4. PRICE_NEGOTIATION
  if (intent === 'PRICE_NEGOTIATION') {
    if (isTe) {
      return {
        intent,
        reply: `నమస్కారం! ${title} కి సాధారణ అద్దె ₹${price}/${rateTypeLabel} నిర్ణయించబడింది. మీరు 1 రోజు కంటే ఎక్కువ సమయం లేదా ఎక్కువ ఎకరాల పొలం పని కోసం తీసుకుంటే 5% నుండి 10% వరకు రైతు రాయితీ ఇవ్వగలను. మీకు ఎన్ని గంటలు లేదా రోజులు అవసరమో చెప్పండి!`,
        suggestions: [
          "నాకు 2 రోజుల వరకు అవసరం ఉంది, ఎంత అవుతుంది?",
          "ఈ ధరలో డ్రైవర్ ఉంటారా?",
          "యంత్రం తీసుకోవడానికి ఎక్కడికి రావాలి?"
        ]
      };
    } else if (isTeEn) {
      return {
        intent,
        reply: `Namaskaram! ${title} standard rate ₹${price}/${rateTypeLabel}. Meeru 1 day kante ekkuva rojulaku leda continuous ga polam paniki theesukunte 5% nundi 10% varaku farmer discount ivvagalanu. Meeku enni rojulu kavalo cheppandi!`,
        suggestions: [
          "Repu morning a time ki vastharu?",
          "Ee price lo driver untara?",
          "Dhara konchem tagginchadam kudhurthundha?"
        ]
      };
    } else {
      return {
        intent,
        reply: `Hello! The standard listed rate for ${title} is ₹${price} per ${rateType}. If you need it for full-day work, multiple days, or continuous acreage, I am happy to offer a 5% to 10% farmer concession! How many hours or days are you planning to rent it for?`,
        suggestions: [
          "I need it for 2 days, what is the best price?",
          "Is a driver included with this price?",
          "Where should I come to pick it up?"
        ]
      };
    }
  }

  // 5. CONTACT_PHONE
  if (intent === 'CONTACT_PHONE') {
    if (isTe) {
      return {
        intent,
        reply: `రైతు మిత్రమా, నా ఫోన్ నెంబర్ ${ownerPhone}. అలాగే మీరు ఈ స్క్రీన్‌పై ఉన్న 'బుక్ చేయండి' (Book Now) బటన్ క్లిక్ చేసి బుకింగ్ రిక్వెస్ట్ పంపగానే నా నెంబర్‌కు నేరుగా కాల్ చేసే ఆప్షన్ అన్‌లాక్ అవుతుంది మరియు పరస్పరం కాల్ చేసి సమన్వయం చేసుకోవచ్చు!`,
        suggestions: [
          "ధర కొంచెం తగ్గించడం కుదురుతుందా?",
          "యంత్రం తీసుకోవడానికి ఎక్కడికి రావాలి?",
          "రేపు ఈ యంత్రం అందుబాటులో ఉంటుందా?"
        ]
      };
    } else if (isTeEn) {
      return {
        intent,
        reply: `Raithu mithrama, na contact number ${ownerPhone}. App lo 'Book Now' button click chesi booking request pampagane na number direct call cheyadaniki unlock avuthundi!`,
        suggestions: [
          "Repu morning a time ki vastharu?",
          "Ee price lo driver untara?",
          "Dhara konchem tagginchadam kudhurthundha?"
        ]
      };
    } else {
      return {
        intent,
        reply: `Hello farmer, my contact number is ${ownerPhone}. You can also tap the 'Book Now' button right here on the equipment screen to immediately unlock direct calling and field coordination!`,
        suggestions: [
          "Can we negotiate the price slightly?",
          "Where should I come to pick it up?",
          "Is this machine available tomorrow?"
        ]
      };
    }
  }

  // 6. FUEL_DIESEL
  if (intent === 'FUEL_DIESEL') {
    if (isTe) {
      return {
        intent,
        reply: `యంత్రం పూర్తి ట్యాంక్ డీజిల్‌తో మీకు అప్పగించబడుతుంది. మీ పొలం పనిలో ఖర్చయ్యే డీజిల్‌ను అద్దెకు తీసుకునే రైతు భరించాల్సి ఉంటుంది. పని పూర్తయిన తర్వాత ఎంత డీజిల్ వినియోగించారో అంత తిరిగి నింపవచ్చు లేదా అవర్ మీటర్ రీడింగ్ ప్రకారం డీజిల్ చార్జీలు చెల్లించవచ్చు.`,
        suggestions: [
          "గంటకు సగటున ఎంత డీజిల్ తాగుతుంది?",
          "ఈ ధరలో డ్రైవర్ ఉంటారా?",
          "యంత్రం తీసుకోవడానికి ఎక్కడికి రావాలి?"
        ]
      };
    } else if (isTeEn) {
      return {
        intent,
        reply: `Yanthram full tank diesel tho hand over chestham. Field work lo use ayye diesel renter bharinchali. Work complete ayyaka diesel refill cheyochu leda meter reading batti pay cheyochu.`,
        suggestions: [
          "Ee price lo driver untara?",
          "Repu morning a time ki vastharu?",
          "Dhara konchem tagginchadam kudhurthundha?"
        ]
      };
    } else {
      return {
        intent,
        reply: `The machinery is handed over with a full fuel tank. The diesel consumed during your field operations is to be borne by the renter. You can either top up the tank before returning or settle the fuel cost based on the hour-meter reading.`,
        suggestions: [
          "Is a driver included with this price?",
          "Where should I come to pick it up?",
          "Can we negotiate the price slightly?"
        ]
      };
    }
  }

  // 7. SUITABILITY_CROPS
  if (intent === 'SUITABILITY_CROPS') {
    if (isTe) {
      return {
        intent,
        reply: `ఖచ్చితంగా! ఈ ${title} (${hp}) అన్ని రకాల వ్యవసాయ నేలలు మరియు పంట పనులకు చాలా సమర్థవంతంగా సరిపోతుంది. కల్టివేటర్, నాగలి లేదా రోటవేటర్ అమర్చి దున్నటానికి, వరి పొలాల్లో దమ్ము చేయడానికి మరియు చేను పనులకు పూర్తి అనుకూలం. మీ పొలంలో ఎన్ని ఎకరాలు మరియు ఏ పని చేయాలో చెప్పండి!`,
        suggestions: [
          "ధర కొంచెం తగ్గించడం కుదురుతుందా?",
          "ఈ ధరలో డ్రైవర్ ఉంటారా?",
          "రేపు ఈ యంత్రం అందుబాటులో ఉంటుందా?"
        ]
      };
    } else if (isTeEn) {
      return {
        intent,
        reply: `Kharachitanga! Ee ${title} (${hp}) anni rakala vyavasaya nela lu and crops ki baga suit avuthundi. Cultivator, plow, rotavator attachments tho plowing, paddy puddling panulaku perfect. Mee polam lo enni acres undo cheppandi!`,
        suggestions: [
          "Repu morning a time ki vastharu?",
          "Ee price lo driver untara?",
          "Dhara konchem tagginchadam kudhurthundha?"
        ]
      };
    } else {
      return {
        intent,
        reply: `Absolutely! The ${title} (${hp}) is very well suited for agricultural tillage, field preparation, and crop operations. It delivers reliable power for deep plowing, rotary tilling, and puddling. How many acres and what specific field work do you need done?`,
        suggestions: [
          "Is a driver included with this price?",
          "Where should I come to pick it up?",
          "Can we negotiate the price slightly?"
        ]
      };
    }
  }

  // 8. LOCATION
  if (intent === 'LOCATION') {
    if (isTe) {
      return {
        intent,
        reply: `${title} ప్రస్తుతం ${location} లోని మా తోట/గ్యారేజ్ వద్ద అందుబాటులో ఉంది. మీరు నేరుగా ఇక్కడికి వచ్చి తీసుకోవచ్చు, లేదా మీ పొలం సమీపంలో ఉంటే స్వల్ప డీజిల్ చార్జీతో నేరుగా మీ పొలానికే డెలివరీ చేయగలను. మీ గ్రామం మరియు మండలం వివరాలు చెప్పండి.`,
        suggestions: [
          "మా పొలానికి డెలివరీ చేయగలరా?",
          "ఈ ధరలో డ్రైవర్ ఉంటారా?",
          "రేపు ఈ యంత్రం అందుబాటులో ఉంటుందా?"
        ]
      };
    } else if (isTeEn) {
      return {
        intent,
        reply: `${title} prastutham ${location} lo maa yard/garage daggara undi. Meeru direct ga theesukellavachu leda nominal diesel charges tho mee polaniki transport arrange chestham. Mee gramam ekkado cheppandi!`,
        suggestions: [
          "Polaniki delivery chesthara?",
          "Ee price lo driver untara?",
          "Repu morning a time ki vastharu?"
        ]
      };
    } else {
      return {
        intent,
        reply: `The ${title} is located at my yard in ${location}. You can pick it up directly from here, or if your field is within 5–10 km, I can arrange transport/road driving directly to your farm for nominal fuel cost. Which village and mandal is your farm located in?`,
        suggestions: [
          "Can you deliver it to my field?",
          "Is a driver included with this price?",
          "Is this machine available tomorrow?"
        ]
      };
    }
  }

  // 9. DELIVERY
  if (intent === 'DELIVERY') {
    if (isTe) {
      return {
        intent,
        reply: `అవునండీ, మీ పొలానికి డెలివరీ చేయగలం! మీ పొలం ${location} లేదా చుట్టుపక్కల 5-10 కి.మీ దూరంలో ఉంటే సాధారణ డీజిల్ ఖర్చుతో నేరుగా మీ చేను వద్దకే రవాణా ఏర్పాటు చేయగలను. రవాణా ఖర్చు దూరాన్ని బట్టి రైతు భరించాల్సి ఉంటుంది. మీ పొలం ఉన్న గ్రామం వివరాలు చెప్పండి.`,
        suggestions: [
          "యంత్రం తీసుకోవడానికి ఎక్కడికి రావాలి?",
          "ఈ ధరలో డ్రైవర్ ఉంటారా?",
          "ధర కొంచెం తగ్గించడం కుదురుతుందా?"
        ]
      };
    } else if (isTeEn) {
      return {
        intent,
        reply: `Avunandi, mee polaniki delivery cheyagalamu! Mee polam ${location} daggarlo unte nominal diesel charges tho direct ga mee polaniki transport arrange chestham. Mee gramam landmark cheppandi.`,
        suggestions: [
          "Repu morning a time ki vastharu?",
          "Ee price lo driver untara?",
          "Dhara konchem tagginchadam kudhurthundha?"
        ]
      };
    } else {
      return {
        intent,
        reply: `Yes, farm delivery is available! If your field is near ${location}, road transport directly to your field can be arranged for nominal diesel cost. Delivery fuel charges are typically covered by the renter depending on distance. Please share your village name!`,
        suggestions: [
          "Where should I come to pick it up?",
          "Is a driver included with this price?",
          "Can we negotiate the price slightly?"
        ]
      };
    }
  }

  // 10. AVAILABILITY
  if (intent === 'AVAILABILITY') {
    if (status === 'available') {
      if (isTe) {
        return {
          intent,
          reply: `అవునండీ, ${title} ప్రస్తుతం అందుబాటులో ఉంది మరియు రేపు మీ పొలం పనికి సిద్ధంగా ఉంది! రేపు ఉదయం ఏ సమయానికి కావాలో చెబితే ఆ సమయానికి యంత్రం సిద్ధం చేస్తాను. మీరు యాప్‌లో 'బుక్ చేయండి' బటన్ ద్వారా స్లాట్ రిజర్వ్ చేసుకోవచ్చు.`,
          suggestions: [
            "రేపు ఉదయం 6:30 కి కావాలి.",
            "ఈ ధరలో డ్రైవర్ ఉంటారా?",
            "యంత్రం తీసుకోవడానికి ఎక్కడికి రావాలి?"
          ]
        };
      } else if (isTeEn) {
        return {
          intent,
          reply: `Avunandi, ${title} prastutham available ga undi, repu mee polam paniki ready ga undi! Repu udayam e samayaniki kavalo chepthe arrange chestham. App lo 'Book Now' dwara slot reserve cheskondi.`,
          suggestions: [
            "Repu morning a time ki vastharu?",
            "Ee price lo driver untara?",
            "Yanthram theesukovadaniki ekkadiki ravali?"
          ]
        };
      } else {
        return {
          intent,
          reply: `Yes, the ${title} is currently available and ready for field work tomorrow! What time in the morning would you like to start? You can also reserve your slot directly using the 'Book Now' button in the app.`,
          suggestions: [
            "Where should I come to pick it up?",
            "Is a driver included with this price?",
            "Can we negotiate the price slightly?"
          ]
        };
      }
    } else if (status === 'booked') {
      if (isTe) {
        return {
          intent,
          reply: `ప్రస్తుతం ${title} వేరొక రైతు పని కోసం బుక్ చేయబడి ఉంది. 1-2 రోజుల్లో ఖాళీ అవుతుంది. మీకు ఏ తేదీల్లో కావాలో చెబితే తదుపరి ఖాళీ స్లాట్ చూసి ఖరారు చేస్తాను.`,
          suggestions: [
            "ఎప్పటికి ఖాళీ అవుతుంది?",
            "ధర కొంచెం తగ్గించడం కుదురుతుందా?",
            "ఈ ధరలో డ్రైవర్ ఉంటారా?"
          ]
        };
      } else if (isTeEn) {
        return {
          intent,
          reply: `Prastutham ${title} veroka raithu pani kosam book ayyi undi, 1-2 days lo free avuthundi. Meeku e dates lo kavalo chepthe next opening reserve chesthanu.`,
          suggestions: [
            "Eppatiki available loki vasthundi?",
            "Dhara konchem tagginchadam kudhurthundha?",
            "Ee price lo driver untara?"
          ]
        };
      } else {
        return {
          intent,
          reply: `The ${title} is currently booked for scheduled field work and will be free in 1-2 days. Please let me know your required dates so I can reserve the next opening for you.`,
          suggestions: [
            "When will it be available next?",
            "Can we negotiate the price slightly?",
            "Is a driver included with this price?"
          ]
        };
      }
    } else {
      if (isTe) {
        return {
          intent,
          reply: `ఈ యంత్రం సర్వీసింగ్ జరుగుతోంది, త్వరలోనే అద్దెకు అందుబాటులోకి రానుంది.`,
          suggestions: [
            "ఎప్పటికి అందుబాటులోకి వస్తుంది?",
            "ఈ ధరలో డ్రైవర్ ఉంటారా?",
            "యంత్రం తీసుకోవడానికి ఎక్కడికి రావాలి?"
          ]
        };
      } else if (isTeEn) {
        return {
          intent,
          reply: `Ee yanthram routine servicing jaruguthondi, twaraloney rental ki available loki vasthundi.`,
          suggestions: [
            "Eppatiki available loki vasthundi?",
            "Ee price lo driver untara?",
            "Yanthram theesukovadaniki ekkadiki ravali?"
          ]
        };
      } else {
        return {
          intent,
          reply: `This machine is undergoing routine servicing and will be available for rental shortly.`,
          suggestions: [
            "When will it become available?",
            "Is a driver included with this price?",
            "Where should I come to pick it up?"
          ]
        };
      }
    }
  }

  // 11. BOOKING
  if (intent === 'BOOKING') {
    if (isTe) {
      return {
        intent,
        reply: `బుకింగ్ చేయడం చాలా సులభం! ఈ స్క్రీన్ పై ఉన్న 'బుక్ చేయండి' (Book Now) బటన్ క్లిక్ చేసి మీకు కావలసిన రోజులు మరియు పొలం వివరాలు నమోదు చేయండి. వెంటనే నా వద్దకు రిక్వెస్ట్ వస్తుంది మరియు నేను కన్ఫర్మ్ చేస్తాను! నిర్ధారించగానే నేరుగా కాల్ చేసుకునే సదుపాయం లభిస్తుంది.`,
        suggestions: [
          "ఇప్పుడే బుకింగ్ చేస్తాను.",
          "యంత్రం తీసుకోవడానికి ఎక్కడికి రావాలి?",
          "ధర కొంచెం తగ్గించడం కుదురుతుందా?"
        ]
      };
    } else if (isTeEn) {
      return {
        intent,
        reply: `Booking chala simple andi! Ee screen pai unna 'Book Now' button click chesi mee duration & farm details enter cheyandi. Booking confirm avvagane direct ga call matladukundham!`,
        suggestions: [
          "Repu morning a time ki vastharu?",
          "Ee price lo driver untara?",
          "Yanthram theesukovadaniki ekkadiki ravali?"
        ]
      };
    } else {
      return {
        intent,
        reply: `Booking is very easy! Tap the green 'Book Now' button right here on the equipment screen, select your duration and farm location, and submit. I will immediately confirm your reservation!`,
        suggestions: [
          "I will book it right now.",
          "Where should I come to pick it up?",
          "Can we negotiate the price slightly?"
        ]
      };
    }
  }

  // 12. PAYMENT
  if (intent === 'PAYMENT') {
    if (isTe) {
      return {
        intent,
        reply: `ముందస్తు అడ్వాన్స్ ఏమీ అవసరం లేదు! యంత్రం మీ పొలానికి చేరుకుని పని ప్రారంభించిన తర్వాత UPI (PhonePe / GPay) లేదా నగదు రూపంలో సులభంగా చెల్లించవచ్చు.`,
        suggestions: [
          "ధర కొంచెం తగ్గించడం కుదురుతుందా?",
          "ఈ ధరలో డ్రైవర్ ఉంటారా?",
          "రేపు ఈ యంత్రం అందుబాటులో ఉంటుందా?"
        ]
      };
    } else if (isTeEn) {
      return {
        intent,
        reply: `Advance emi avasaram ledu! Yanthram mee polaniki vachi pani start chesaka UPI (PhonePe / GPay) leda cash dwara easy ga pay cheyochu.`,
        suggestions: [
          "Repu morning a time ki vastharu?",
          "Ee price lo driver untara?",
          "Dhara konchem tagginchadam kudhurthundha?"
        ]
      };
    } else {
      return {
        intent,
        reply: `No advance payment is needed! You can pay conveniently via UPI (PhonePe / Google Pay) or cash once the equipment reaches your field and starts running smoothly.`,
        suggestions: [
          "Can we negotiate the price slightly?",
          "Is a driver included with this price?",
          "Is this machine available tomorrow?"
        ]
      };
    }
  }

  // 13. CONDITION_SPECS
  if (intent === 'CONDITION_SPECS') {
    if (isTe) {
      return {
        intent,
        reply: `${title} (${hp}) చాలా మంచి రన్నింగ్ కండిషన్‌లో ఉంది. ఇటీవలనే పూర్తి సర్వీసింగ్ చేయించి ఇంజిన్ ఆయిల్ మార్చబడింది. ఎలాంటి మెకానికల్ సమస్యలు లేవు, మీ పొలం పని అంతరాయం లేకుండా పూర్తవుతుంది.`,
        suggestions: [
          "గంటకు అద్దె రేటు ఎంత?",
          "ఈ ధరలో డ్రైవర్ ఉంటారా?",
          "యంత్రం తీసుకోవడానికి ఎక్కడికి రావాలి?"
        ]
      };
    } else if (isTeEn) {
      return {
        intent,
        reply: `${title} (${hp}) chala manchi running condition lo undi, recently service ayyindi. Engine oil change chesam, edhaina paniki smooth ga panichesthundi.`,
        suggestions: [
          "Ee price lo driver untara?",
          "Dhara konchem tagginchadam kudhurthundha?",
          "Repu morning a time ki vastharu?"
        ]
      };
    } else {
      return {
        intent,
        reply: `The ${title} (${hp}) is in excellent working condition with recent servicing and fresh engine oil. Everything operates smoothly to ensure uninterrupted work on your field.`,
        suggestions: [
          "Is a driver included with this price?",
          "Can we negotiate the price slightly?",
          "Where should I come to pick it up?"
        ]
      };
    }
  }

  // 14. ATTACHMENTS
  if (intent === 'ATTACHMENTS') {
    if (isTe) {
      return {
        intent,
        reply: `${title} తో పాటు: ${specs || 'కల్టివేటర్ మరియు సాధారణ దుక్కి నాగలి సదుపాయం'} అందుబాటులో ఉన్నాయి. మీకు ప్రత్యేకంగా రోటవేటర్ లేదా ఇతర పరికరాలు అవసరమైతే బుకింగ్ సమయంలో తెలపండి.`,
        suggestions: [
          "గంటకు అద్దె రేటు ఎంత?",
          "ఈ ధరలో డ్రైవర్ ఉంటారా?",
          "యంత్రం తీసుకోవడానికి ఎక్కడికి రావాలి?"
        ]
      };
    } else if (isTeEn) {
      return {
        intent,
        reply: `${title} tho patu: ${specs || 'cultivator and plow attachments'} unnai. Meeku rotavator leda other attachments kavalo booking time lo chepthe arrange chestham.`,
        suggestions: [
          "Ee price lo driver untara?",
          "Dhara konchem tagginchadam kudhurthundha?",
          "Repu morning a time ki vastharu?"
        ]
      };
    } else {
      return {
        intent,
        reply: `Along with the ${title}: ${specs || 'cultivator and standard tillage implements'} are supported. If you specifically need a rotary tiller, plow, or extra blades, please let me know so it can be arranged!`,
        suggestions: [
          "Is a driver included with this price?",
          "Can we negotiate the price slightly?",
          "Where should I come to pick it up?"
        ]
      };
    }
  }

  // 15. OWNER_DETAILS
  if (intent === 'OWNER_DETAILS') {
    if (isTe) {
      return {
        intent,
        reply: `నేను ${owner} ని, ఈ ${title} యజమానిని. మా యంత్రం ${location} పరిధిలో వ్యవసాయ పనులకు అందుబాటులో ఉంది. మీకు ఏ సహాయం లేదా వివరాలు కావాలో అడగండి.`,
        suggestions: [
          "ధర కొంచెం తగ్గించడం కుదురుతుందా?",
          "ఈ ధరలో డ్రైవర్ ఉంటారా?",
          "యంత్రం తీసుకోవడానికి ఎక్కడికి రావాలి?"
        ]
      };
    } else if (isTeEn) {
      return {
        intent,
        reply: `Nenu ${owner} ni, ee ${title} owner ni. Maa yanthram ${location} lo farm work kosam available ga undi. Ee details kavalo adagandi!`,
        suggestions: [
          "Repu morning a time ki vastharu?",
          "Ee price lo driver untara?",
          "Dhara konchem tagginchadam kudhurthundha?"
        ]
      };
    } else {
      return {
        intent,
        reply: `I am ${owner}, the owner of this ${title} located in ${location}. Feel free to ask any details you need for your field work!`,
        suggestions: [
          "Where should I come to pick it up?",
          "Is a driver included with this price?",
          "Can we negotiate the price slightly?"
        ]
      };
    }
  }

  // 16. GREETING
  if (intent === 'GREETING') {
    if (isTe) {
      return {
        intent,
        reply: `నమస్కారం అండీ! ${title} (అద్దె: ₹${price}/${rateTypeLabel}, స్థలం: ${location}) గురించి మీకు స్వాగతం. అద్దె ధర, డ్రైవర్ సదుపాయం, యంత్రం లభ్యత లేదా పొలానికి రవాణా గురించి ఏ సమాచారం కావాలో అడగండి, సంతోషంగా తెలియజేస్తాను!`,
        suggestions: [
          "ఈ ధరలో డ్రైవర్ ఉంటారా?",
          "ధర కొంచెం తగ్గించడం కుదురుతుందా?",
          "యంత్రం తీసుకోవడానికి ఎక్కడికి రావాలి?"
        ]
      };
    } else if (isTeEn) {
      return {
        intent,
        reply: `Namaskaram andi! ${title} (Rental: ₹${price}/${rateTypeLabel}, Location: ${location}) gurinchi welcome. Rate, driver, availability leda delivery gurinchi e details kavalo adagandi, ventane chepthanu!`,
        suggestions: [
          "Repu morning a time ki vastharu?",
          "Ee price lo driver untara?",
          "Dhara konchem tagginchadam kudhurthundha?"
        ]
      };
    } else {
      return {
        intent,
        reply: `Hello and welcome! Regarding the ${title} (Rental: ₹${price}/${rateType}, Location: ${location}), how can I assist you today? Feel free to ask about rates, driver availability, delivery, or field operations!`,
        suggestions: [
          "I need it for 2 days, what is the best price?",
          "Is a driver included with this price?",
          "Where should I come to pick it up?"
        ]
      };
    }
  }

  // 17. GENERAL_QUESTION (Contextual acknowledgment)
  if (isTe) {
    const snippet = text.length > 0 ? `'${text.slice(0, 40)}'` : 'మీ ప్రశ్న';
    return {
      intent,
      reply: `మీరు ${snippet} గురించి అడిగారు. ${title} (అద్దె: ₹${price}/${rateTypeLabel}, స్థలం: ${location}) వ్యవసాయ పనులకు పూర్తి పనితీరుతో సిద్ధంగా ఉంది. దీని అద్దె ధర (₹${price}), డ్రైవర్ (${driverIncluded ? 'ఉచితంగా ఉంటారు' : 'డ్రైవర్ ఉండరు'}), రేపటి లభ్యత లేదా బుకింగ్ గురించి మీకు ఏ సమాచారం కావాలో చెప్పండి, వెంటనే సమాధానం ఇస్తాను.`,
      suggestions: [
        "ఈ ధరలో డ్రైవర్ ఉంటారా?",
        "ధర కొంచెం తగ్గించడం కుదురుతుందా?",
        "యంత్రం తీసుకోవడానికి ఎక్కడికి రావాలి?"
      ]
    };
  } else if (isTeEn) {
    return {
      intent,
      reply: `Mee message andhindi! ${title} (Rental: ₹${price}/${rateTypeLabel}) gurinchi meeku arrival time, driver kavala, leda rate discount gurinchi e details kavalo cheppandi, ventane reply isthanu. Leda direct ga 'Book Now' dwara reserve cheskondi.`,
      suggestions: [
        "Repu morning a time ki vastharu?",
        "Ee price lo driver untara?",
        "Dhara konchem tagginchadam kudhurthundha?"
      ]
    };
  } else {
    const snippet = text.length > 0 ? `'${text.slice(0, 40)}'` : 'your question';
    return {
      intent,
      reply: `Regarding your query about ${snippet}: The ${title} (Rental: ₹${price}/${rateType}, Location: ${location}) is ready for farm work. Let me know if you need specific details regarding pricing (₹${price}), driver (${driverIncluded ? 'included' : 'no driver'}), pickup location, or booking!`,
      suggestions: [
        "I need it for 2 days, what is the best price?",
        "Is a driver included with this price?",
        "Where should I come to pick it up?"
      ]
    };
  }
}

export function getInitialLocalStorageData() {
  const equipment = localStorage.getItem('rv_equipment');
  const user = localStorage.getItem('rv_user');
  const chats = localStorage.getItem('rv_chats');

  if (!equipment) {
    localStorage.setItem('rv_equipment', JSON.stringify(INITIAL_EQUIPMENT));
  }
  if (!chats) {
    localStorage.setItem('rv_chats', JSON.stringify(INITIAL_CHATS));
  }

  let parsedEquipment = equipment ? JSON.parse(equipment) : INITIAL_EQUIPMENT;
  let parsedUser: FarmerProfile | null = null;
  if (user) {
    try {
      parsedUser = JSON.parse(user);
    } catch (e) {
      parsedUser = null;
    }
  }
  let parsedChats = chats ? JSON.parse(chats) : INITIAL_CHATS;

  // Append any newly defined Andhra Pradesh agricultural equipment presets that do not exist yet in custom localStorage lists
  if (equipment) {
    const existingIds = new Set(parsedEquipment.map((eq: any) => eq.id));
    const newPresets = INITIAL_EQUIPMENT.filter(eq => !existingIds.has(eq.id));
    if (newPresets.length > 0) {
      parsedEquipment = [...parsedEquipment, ...newPresets];
      localStorage.setItem('rv_equipment', JSON.stringify(parsedEquipment));
    }
  }

  // Real-time migration to ensure equipment prices and pictures are updated to the requested configs
  let needsMigration = false;
  if (equipment) {
    needsMigration = parsedEquipment.some((eq: any) => {
      const matchingInitial = INITIAL_EQUIPMENT.find(item => item.id === eq.id);
      return (
        (eq.category === 'tractor' && eq.rateType === 'day') ||
        (matchingInitial && (
          eq.imageUrl !== matchingInitial.imageUrl || 
          eq.price !== matchingInitial.price || 
          eq.titleEn !== matchingInitial.titleEn || 
          eq.title !== matchingInitial.title || 
          eq.rateType !== matchingInitial.rateType ||
          eq.category !== matchingInitial.category
        ))
      );
    });

    if (needsMigration) {
      parsedEquipment = parsedEquipment.map((eq: any) => {
        const matchingInitial = INITIAL_EQUIPMENT.find(item => item.id === eq.id);
        if (matchingInitial) {
          // Keep user-booking status or custom listed status, but update attributes, prices, and original pictures
          return {
            ...eq,
            title: matchingInitial.title,
            titleEn: matchingInitial.titleEn,
            category: matchingInitial.category,
            categoryLabel: matchingInitial.categoryLabel,
            price: matchingInitial.price,
            rateType: matchingInitial.rateType,
            rateTypeLabel: matchingInitial.rateTypeLabel,
            imageUrl: matchingInitial.imageUrl,
            description: matchingInitial.description,
            descriptionEn: matchingInitial.descriptionEn,
            horsepower: matchingInitial.horsepower,
            fuelType: matchingInitial.fuelType,
            specs: matchingInitial.specs
          };
        }
        return eq;
      });
      localStorage.setItem('rv_equipment', JSON.stringify(parsedEquipment));
    }
  }

  // Real-time migration to ensure stale Devanagari names in localStorage are converted to Telugu
  let hasStaleName = false;
  parsedChats = parsedChats.map((c: any) => {
    if (c.contactName && c.contactName.includes('किरण్')) {
      hasStaleName = true;
      return { ...c, contactName: c.contactName.replace('किरण్', 'కిరణ్') };
    }
    // Also align chat equipment images if migrated
    const matchingEq = INITIAL_EQUIPMENT.find(eq => eq.id === c.equipmentId);
    if (matchingEq && c.equipmentImage !== matchingEq.imageUrl) {
      hasStaleName = true; // trigger update
      c.equipmentImage = matchingEq.imageUrl;
    }
    return c;
  });

  if (hasStaleName || needsMigration) {
    localStorage.setItem('rv_chats', JSON.stringify(parsedChats));
  }

  // Attach latest verified ratings and review counts from reviews storage
  try {
    const allStoredReviews = loadAllReviews();
    parsedEquipment = parsedEquipment.map((eq: any) => {
      const eqReviews = allStoredReviews.filter(r => r.equipmentId === eq.id);
      if (eqReviews.length > 0) {
        const summary = calculateRatingSummary(eqReviews);
        return {
          ...eq,
          rating: summary.average,
          reviewCount: summary.count,
          reviews: eqReviews
        };
      }
      return {
        ...eq,
        rating: eq.rating || 4.8,
        reviewCount: eq.reviewCount || 10
      };
    });
  } catch (e) {
    console.error('Error applying reviews summary to equipment:', e);
  }

  // Strictly deduplicate parsedEquipment by id to guarantee unique React keys
  if (Array.isArray(parsedEquipment)) {
    const seenMap = new Map<string, Equipment>();
    let hadDuplicates = false;
    for (const eq of parsedEquipment) {
      if (eq && eq.id) {
        if (!seenMap.has(eq.id)) {
          seenMap.set(eq.id, eq);
        } else {
          hadDuplicates = true;
        }
      }
    }
    parsedEquipment = Array.from(seenMap.values());
    if (hadDuplicates) {
      localStorage.setItem('rv_equipment', JSON.stringify(parsedEquipment));
    }
  }

  return {
    equipment: parsedEquipment,
    user: parsedUser,
    chats: parsedChats,
  };
}

export function saveEquipmentToLocalStorage(data: Equipment[]) {
  // Deduplicate before saving to prevent duplicate keys across components
  const uniqueMap = new Map<string, Equipment>();
  for (const item of data) {
    if (item && item.id && !uniqueMap.has(item.id)) {
      uniqueMap.set(item.id, item);
    }
  }
  localStorage.setItem('rv_equipment', JSON.stringify(Array.from(uniqueMap.values())));
}

export function addRegisteredUserToRegistry(data: FarmerProfile) {
  try {
    const listStr = localStorage.getItem('rv_all_registered_users');
    let list: FarmerProfile[] = listStr ? JSON.parse(listStr) : [];
    const cleanPhone = data.phone ? data.phone.replace(/\D/g, '') : '';
    const cleanEmail = data.email ? data.email.toLowerCase().trim() : '';
    
    const idx = list.findIndex(u => {
      const uId = u.id || u.uid;
      const dataId = data.id || data.uid;
      const uPhone = u.phone ? u.phone.replace(/\D/g, '') : '';
      const uEmail = u.email ? u.email.toLowerCase().trim() : '';
      return (uId && dataId && uId === dataId) || 
             (cleanPhone && uPhone && cleanPhone === uPhone) ||
             (cleanEmail && uEmail && cleanEmail === uEmail);
    });

    if (idx >= 0) {
      list[idx] = { ...list[idx], ...data, id: data.id || data.uid || list[idx].id || list[idx].uid, uid: data.uid || data.id || list[idx].uid || list[idx].id };
    } else {
      list.push({ ...data, id: data.id || data.uid, uid: data.uid || data.id });
    }
    localStorage.setItem('rv_all_registered_users', JSON.stringify(list));
  } catch (e) {
    console.warn('LocalStorage user registry update error:', e);
  }
}

export function saveUserToLocalStorage(data: FarmerProfile) {
  localStorage.setItem('rv_user', JSON.stringify(data));
  addRegisteredUserToRegistry(data);
}

export function getRegisteredUsersFromLocalStorage(): FarmerProfile[] {
  try {
    const listStr = localStorage.getItem('rv_all_registered_users');
    let list: FarmerProfile[] = listStr ? JSON.parse(listStr) : [];
    const activeUserStr = localStorage.getItem('rv_user');
    if (activeUserStr) {
      const activeUser = JSON.parse(activeUserStr);
      if (activeUser) {
        const cleanPhone = activeUser.phone ? activeUser.phone.replace(/\D/g, '') : '';
        const cleanEmail = activeUser.email ? activeUser.email.toLowerCase().trim() : '';
        const exists = list.some(u => {
          const uPhone = u.phone ? u.phone.replace(/\D/g, '') : '';
          const uEmail = u.email ? u.email.toLowerCase().trim() : '';
          return (cleanPhone && uPhone === cleanPhone) || (cleanEmail && uEmail === cleanEmail);
        });
        if (!exists) {
          list.push(activeUser);
        }
      }
    }
    return list;
  } catch (e) {
    return [];
  }
}

export function saveChatsToLocalStorage(data: Chat[]) {
  localStorage.setItem('rv_chats', JSON.stringify(data));
}
