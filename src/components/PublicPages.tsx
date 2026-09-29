import React, { useState } from 'react';
import { 
  ArrowLeft, Leaf, Phone, Mail, MapPin, Check, HelpCircle, 
  ChevronDown, ChevronUp, Star, ShieldCheck, FileText, 
  BookOpen, Users, Award, Sprout, Search, Send, Landmark, 
  MessageSquare, UserCheck, Scale, Compass, Fuel, Settings
} from 'lucide-react';
import { Equipment, CategoryType } from '../types';

interface PublicPagesProps {
  pageId: 'about' | 'contact' | 'faq' | 'listing' | 'details' | 'search' | 'privacy' | 'terms' | 'help_support';
  language: 'te' | 'en';
  onClose: () => void;
  equipmentList: Equipment[];
  onBook: (id: string) => void;
  onOpenChat: (
    ownerName: string,
    ownerPhone: string,
    ownerAvatar: string,
    equipmentId: string,
    equipmentTitle: string,
    equipmentImage: string
  ) => void;
  onSelectEquipment?: (eq: Equipment) => void;
}

export default function PublicPages({
  pageId,
  language,
  onClose,
  equipmentList,
  onBook,
  onOpenChat,
  onSelectEquipment
}: PublicPagesProps) {
  
  // State for Accordion FAQ
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);

  // State for Contact Us Form submitting
  const [isContactSubmitted, setIsContactSubmitted] = useState(false);
  const [contactName, setContactName] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [contactMsg, setContactMsg] = useState('');
  const [contactCategory, setContactCategory] = useState('general');

  // State for Help & Support Grievance Form
  const [isGrievanceSubmitted, setIsGrievanceSubmitted] = useState(false);
  const [grievanceText, setGrievanceText] = useState('');
  const [grievanceTractor, setGrievanceTractor] = useState('');

  // Local Search & Filter States for equipment listing & search results
  const [filterCategory, setFilterCategory] = useState<CategoryType | 'all'>('all');
  const [sortOrder, setSortOrder] = useState<'low-high' | 'high-low' | 'default'>('default');
  const [localSearchQuery, setLocalSearchQuery] = useState('');
  const [selectedListingItem, setSelectedListingItem] = useState<Equipment | null>(null);

  const toggleFaq = (index: number) => {
    setOpenFaqIndex(openFaqIndex === index ? null : index);
  };

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (contactName.trim() && contactPhone.trim()) {
      setIsContactSubmitted(true);
      setTimeout(() => {
        setIsContactSubmitted(false);
        setContactName('');
        setContactPhone('');
        setContactMsg('');
      }, 5000);
    }
  };

  const handleGrievanceSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (grievanceText.trim()) {
      setIsGrievanceSubmitted(true);
      setTimeout(() => {
        setIsGrievanceSubmitted(false);
        setGrievanceText('');
        setGrievanceTractor('');
      }, 5000);
    }
  };

  // Filter and sort for local equipment list & search results
  const filteredEquipment = equipmentList.filter(eq => {
    const matchesCategory = filterCategory === 'all' || eq.category === filterCategory;
    const itemTitle = language === 'te' ? eq.title : (eq.titleEn || eq.title);
    const itemDesc = language === 'te' ? eq.description : (eq.descriptionEn || eq.description || '');
    const itemLoc = language === 'te' ? eq.location : (eq.locationEn || eq.location);
    const matchesSearch = itemTitle.toLowerCase().includes(localSearchQuery.toLowerCase()) ||
                          itemDesc.toLowerCase().includes(localSearchQuery.toLowerCase()) ||
                          itemLoc.toLowerCase().includes(localSearchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const sortedEquipment = [...filteredEquipment].sort((a, b) => {
    if (sortOrder === 'low-high') return a.price - b.price;
    if (sortOrder === 'high-low') return b.price - a.price;
    return 0;
  });

  // Multilingual content
  const t = {
    te: {
      back: 'తిరిగి వెళ్ళు',
      aboutTitle: 'మా గురించి - ఈ రైతు వేదిక',
      aboutSubtitle: 'ఆంధ్రప్రదేశ్ సన్నకారు రైతుల అద్దె సహకార విప్లవం',
      aboutContent1: 'ఈ రైతు వేదిక అనేది రైతుల ప్రయోజనాలను పరిరక్షించడానికి మరియు వ్యవసాయ ఉత్పాదకతను పెంచడానికి రూపొందించబడిన అత్యాధునిక సహకార సాంకేతిక వేదిక. అధిక పెట్టుబడి ఖర్చులతో వ్యవసాయ యంత్రాలను కొనుగోలు చేయలేని సన్నకారు రైతులకు సులభమైన, సరసమైన ధరకే అద్దె సేవలను అందించడమే మా ముఖ్య సంకల్పం.',
      aboutContent2: 'పొరుగు రైతులు తమ వద్ద ఉన్న ట్రాక్టర్లు, హార్వెస్టర్లు, లేదా స్ప్రేయర్లను పంచుకోవడం ద్వారా ఖర్చులను 40% వరకు తగ్గించుకోవచ్చు, మరియు పంచుకునే రైతులు అదనపు ఆదాయం పొందవచ్చు. ఇది ఆంధ్రప్రదేశ్ గ్రామాల్లోని పరస్పర సహకారాన్ని డిజిటల్ పద్ధతిలో మరింత బలోపేతం చేస్తుంది.',
      mission: 'మా లక్ష్యం',
      missionText: 'రాష్ట్ర వ్యాప్తంగా ఉన్న ప్రతి ఒక్క రైతుకు అధునాతన యంత్రాలను అతి తక్కువ ధరలో అందుబాటులో ఉంచడం.',
      vision: 'మా దార్శనికత',
      visionText: 'యాంత్రీకరణతో కూడిన ప్రగతిశీల వ్యవసాయ గ్రామాలను నిర్మించడం మరియు రైతు రుణాలను తగ్గించడం.',
      
      contactTitle: 'మమ్మల్ని సంప్రదించండి',
      contactSubtitle: 'మీకు ఏదైనా సహాయం కావాలా? ఈ క్రింది సమాచారం ద్వారా మమ్మల్ని సంప్రదించవచ్చు లేదా మెసేజ్ పంపవచ్చు.',
      contactFormHead: 'సహాయక కేంద్రానికి సందేశం',
      contactNameLabel: 'రైతు పేరు',
      contactPhoneLabel: 'ఫోన్ నంబర్',
      contactTypeLabel: 'విషయం / విభాగం',
      contactMsgLabel: 'సందేశం లేదా సమస్య',
      contactBtn: 'సందేశం పంపండి',
      contactSuccess: 'ధన్యవాదాలు! మీ సందేశం విజయవంతంగా చేరింది. 24 గంటలలో మా వ్యవసాయ అధికారి మిమ్మల్ని సంప్రదిస్తారు.',
      contactAddress: 'ఆంధ్రప్రదేశ్ రైతు సహకార విమానగరం, గుంటూరు, ఆంధ్రప్రదేశ్ - 522002',

      faqTitle: 'తరచుగా అడిగే ప్రశ్నలు (FAQ)',
      faqSubtitle: 'మీ సందేహాలకు త్వరిత సమాధానాలు',
      faqItems: [
        {
          q: 'యంత్రాల బుకింగ్స్ కోసం క్యాన్సలేషన్ చార్జీలు ఉంటాయా?',
          a: 'లేదు, బుకింగ్స్ రద్దు చేసుకోవడం పూర్తిగా ఉచితం ఉచితం! ఏవైనా అత్యవసరాలు ఉంటే వెంటనే రద్దు చేసుకుని ఇతర రైతులకు అవకాశం ఇవ్వవచ్చు.'
        },
        {
          q: 'డీజిల్ లేదా పెట్రోల్ ఖర్చులు ఎవరు భరించాలి?',
          a: 'సాధారణంగా నిర్ణయించబడిన రేటులో డ్రైవర్ చార్జీ ఉంటుంది. కానీ డీజిల్ వినియోగంపై అద్దె ప్రారంభానికి ముందే రైతుతో యజమాని పరస్పరం మాట్లాడుకోవాలి.'
        },
        {
          q: 'నిర్ణీత సమయంలో యంత్రం పాడైపోతే లేదా బ్రేక్‌డౌన్ అయితే పరిస్థితి ఏమిటి?',
          a: 'అలాంటి సమయంలో వెంటనే హెల్ప్‌లైన్ నంబర్ కు లేదా యజమానికి సమాచారం అందించాలి. నష్టపరిహార భీమా మార్గదర్శకాల ప్రకారం స్థానిక టెక్నీషియన్ సలహా తీసుకోబడుతుంది.'
        },
        {
          q: 'దీనిలో కమీషన్ లేదా అదనపు బ్రోకరేజ్ రుసుములు ఉంటాయా?',
          a: 'లేదు, ఈ రైతు వేదిక ఒక ఉచిత ప్రభుత్వ సహకార ఆధారిత సాఫ్ట్‌వేర్. ఎటువంటి కమీషన్లు లేదా దాచిన చార్జీలు ఉండవు.'
        },
        {
          q: 'ఒకే యంత్రాన్ని ఒకే రోజు ఎక్కువ మంది బుక్ చేస్తే ఏమి జరుగుతుంది?',
          a: 'ముందుగా బుక్ చేసుకున్న రైతు అభ్యర్థనకు ప్రాధాన్యత ఇవ్వబడుతుంది. లేదా అదే ఊరిలో ఉన్న వేరే యంత్రాన్ని మీకు సిఫార్సు చేస్తాము.'
        }
      ],

      listingTitle: 'అందుబాటులో ఉన్న వ్యవసాయ పరికరాల జాబితా',
      listingSubtitle: 'నమ్మకమైన పరికరాలు మీ ఊరిలోనే',
      searchHolder: 'ట్రాక్టర్, రోటవేటర్, లొకేషన్ మొదలైనవి వెతకండి...',
      filterCat: 'వర్గం ప్రకారం వడపోత',
      sortPrice: 'ధరల క్రమము',
      all: 'అన్నీ',
      lowToHigh: 'ధర: తక్కువ నుండి ఎక్కువ',
      highToLow: 'ధర: ఎక్కువ నుండి తక్కువ',
      noItems: 'ఆ రకమైన పరికరాలు లేదా శోధనలకు సరిపోయేవి ఏవి లభించలేదు.',

      detailsTitle: 'యంత్ర పరికర పూర్తి వివరాలు',
      specifications: 'సాంకేతిక వివరాలు',
      hp: 'హార్స్ పవర్',
      fuel: 'ఇంధన రకం',
      driverStatus: 'డ్రైవర్ సౌకర్యం',
      driverYes: 'ఉచిత ఆపరేటర్ / డ్రైవర్ చేర్చబడింది',
      driverNo: 'సొంత డ్రైవర్ లేదా డ్రైవర్ లేరు',
      ownerDetails: 'యజమాని వివరాలు',
      bookNow: 'ఇప్పుడే బుక్ చేయండి',
      chatWithOwner: 'యజమానితో చాట్ చేయండి',
      reviews: 'రైతుల సమీక్షలు మరియు రేటింగ్',
      ownerName: 'పేరు',
      ownerPhone: 'ఫోన్',

      privacyTitle: 'వ్యవసాయ గోప్యతా విధానం (Privacy Policy)',
      privacyText: 'ఈ రైతు వేదిక లో రైతుల వ్యక్తిగత వివరాలైన పేరు, ఫోన్ నంబర్, లొకేషన్ వివరాలు సమాజ శ్రేయస్సు కోసం మాత్రమే ఉపయోగించబడతాయి. ఎట్టి పరిస్థితుల్లోనూ రైతుల సమాచారాన్ని వ్యాపార ప్రకటనదారులకు లేదా ప్రైవేట్ సంస్ధలకు విక్రయించబోము మరియు షేర్ చేయము.',
      privacySecure: 'పూర్తి సురక్షితం',
      privacySecureText: 'మీ అన్ని సంభాషణలు, ఫోన్ నంబర్లు గుప్తీకరించబడి అత్యంత భద్రంగా ఉంచబడతాయి.',

      termsTitle: 'నిబంధనలు & షరతులు (Terms & Conditions)',
      termsItems: [
        'అద్దె తీసుకున్న యంత్రాన్ని నిర్దేశిత వ్యవసాయ అవసరాలకు మాత్రమే వాడాలి.',
        'యంత్ర అప్పగింత సమయానికి ఇరు రైతులు పరస్పరం గుర్తింపు కార్డులు నిర్ధారించుకోవాలి.',
        'యంత్రానికి ఏవైనా ఉద్దేశపూర్వక నష్టాలు కలిగిస్తే సదరు నష్టపరిహారం చెల్లించవలసి ఉంటుంది.',
        'రేట్లు మరియు సమయ గడువులను మార్చడానికి లేదా గడువు పొడిగించుకోవడానికి ముందస్తుగా తెలియజేయాలి.'
      ],

      helpTitle: 'సహాయం & మద్దతు (Help & Support)',
      helpSubtitle: 'గ్రామ ప్రాతిపదికన ఏ సమయంలోనైనా సహాయక సహాయం',
      emergencyHelp: 'ఉచిత హెల్ప్‌లైన్ నంబర్ (Toll-Free Helpline)',
      emergencyNo: '1800-425-1122 / 1800-425-2233',
      grievanceTitle: 'ఫిర్యాదు నమోదు చేసుకోండి',
      grievanceHolder: 'మీ సమస్య లేదా అభ్యంతరాన్ని ఇక్కడ వివరంగా రాయండి...',
      grievanceBtn: 'ఫిర్యాదు దాఖలు చేయండి',
      grievanceSuccess: 'మీ ఫిర్యాదు విజయవంతంగా నమోదైంది! సమస్య పరిశీలించి జిల్లా ప్రాజెక్ట్ మేనేజర్ 48 గంటలలో పరిష్కరిస్తారు.',
      regionalOfficer: 'ప్రాంతీయ వ్యవసాయ అధికారులు (AP Agricultural Advisors)'
    },
    en: {
      back: 'Go Back',
      aboutTitle: 'About Us - E-Raitu Vedika',
      aboutSubtitle: 'Coordinating Farm Mechanization & Peer Rental',
      aboutContent1: 'E-Raitu Vedika is an state-of-the-art cooperative agricultural platform designed to secure farm livelihoods and boost production across Andhra Pradesh. Our absolute priority is empowering small and marginal farmers, by providing seamless, affordable access to high-quality machinery rentals without heavy capital investments.',
      aboutContent2: 'By facilitating direct sharing of tractors, harvesters, and sprayers, we help farmers reduce operating costs by up to 40% while generating alternative income streams for machinery owners. It revitalizes regional rural cooperation with robust modern tools.',
      mission: 'Our Mission',
      missionText: 'To democratize access to advanced and high-horsepower agricultural machinery for every single rural farmer in AP.',
      vision: 'Our Vision',
      visionText: 'Building self-sustainable, debt-free, and technologically automated farming communities.',
      
      contactTitle: 'Contact Us',
      contactSubtitle: 'Need professional assistance? Get in touch with our helpdesk team or write to us directly below.',
      contactFormHead: 'Send a Message to Team',
      contactNameLabel: 'Farmer Name',
      contactPhoneLabel: 'Phone Number',
      contactTypeLabel: 'Query Subject',
      contactMsgLabel: 'Message or Feedback',
      contactBtn: 'Send Message',
      contactSuccess: 'Thank you! Your message was received successfully. A local agricultural advisor will reach out within 24 hours.',
      contactAddress: 'AP Farmer Cooperative Complex, Guntur, Andhra Pradesh - 522002',

      faqTitle: 'Frequently Asked Questions (FAQ)',
      faqSubtitle: 'Quick Answers for Smart Farmers',
      faqItems: [
        {
          q: 'Are there cancellation fees for bookings?',
          a: 'No, canceling a booking on E-Raitu Vedika is entirely free! We ask that you cancel promptly if plans change to accommodate other farmers.'
        },
        {
          q: 'Who covers the diesel / fuel consumption costs?',
          a: 'Standard listed rates typically include driver charges. However, fuel costs and starting diesel levels must be discussed and agreed upon directly with the owner before operations begin.'
        },
        {
          q: 'What if the machinery malfunctions during operation?',
          a: 'In case of breakdown, notify the machinery owner and our helpline immediately. Local cooperative mechanics will resolve the issues under the insurance guidelines.'
        },
        {
          q: 'Is there any hidden commission or brokerage fees?',
          a: 'None! E-Raitu Vedika is a 100% free community sharing app. There are no middleman margins, commissions, or hidden transaction fees.'
        },
        {
          q: 'How are priority claims resolved for high-demand seasons?',
          a: 'Bookings are strictly allocated on a first-come, first-served basis. If a requested tractor is unavailable, our team recommends alternative nearby lists.'
        }
      ],

      listingTitle: 'Agricultural Equipment Showroom',
      listingSubtitle: 'Find reliable verified tools posted by farmers nearby',
      searchHolder: 'Search by tractor name, model, district or owner...',
      filterCat: 'Filter by Category',
      sortPrice: 'Sort by Rent Rate',
      all: 'All Categories',
      lowToHigh: 'Price: Low to High',
      highToLow: 'Price: High to Low',
      noItems: 'No agricultural equipment found matching your current filter filters or search query.',

      detailsTitle: 'Equipment Specifications Sheet',
      specifications: 'Technical Specifications',
      hp: 'Horsepower Rating',
      fuel: 'Fuel Logistics',
      driverStatus: 'Driver Assistance',
      driverYes: 'Skilled Driver / Operator Included',
      driverNo: 'Excluding Custom Driver',
      ownerDetails: 'Owner Contact Desk',
      bookNow: 'Book Rent Booking Now',
      chatWithOwner: 'Start Discussion Chat',
      reviews: 'Farmer Ratings and Testimonials',
      ownerName: 'Owner Name',
      ownerPhone: 'Contact Number',

      privacyTitle: 'Privacy & Data Protection Policy',
      privacyText: 'Your trust as a farmer is invaluable. E-Raitu Vedika secures and encrypts your location, phone number, and personal agricultural details. We strictly prohibit selling, renting, or trading user information with private corporations or commercial advertisers.',
      privacySecure: 'Enterprise-Grade Security',
      privacySecureText: 'All farmer data is securely backed up and mapped strictly to direct peer communication protocols.',

      termsTitle: 'Cooperative sharing Terms & Conditions',
      termsItems: [
        'All hired machinery must be operated strictly for standard agricultural functions.',
        'Both renters and owners must inspect and acknowledge official identity cards prior to hand-off.',
        'Farmers are responsible for safe operations; intentional damage results in cooperative liability assessment.',
        'Any rental duration extensions must be requested and approved at least 6 hours in advance.'
      ],

      helpTitle: 'Help & Emergency Support Center',
      helpSubtitle: 'Always ready to back your farming operations 24/7',
      emergencyHelp: 'Regional Farmer Toll-Free Helpline',
      emergencyNo: '1800-425-1122 / 1800-425-2233',
      grievanceTitle: 'Submit a Support Ticket / Grievance',
      grievanceHolder: 'Describe your booking dispute or technical issues in detail...',
      grievanceBtn: 'File Official Grievance',
      grievanceSuccess: 'Your official support ticket has been filed successfully! The district coordinator will investigate and follow up within 48 hours.',
      regionalOfficer: 'Cooperative Extension Advisors Directory'
    }
  }[language];

  // Specific equipment details handler inside Listing view
  const handleItemSelect = (eq: Equipment) => {
    if (onSelectEquipment) {
      onSelectEquipment(eq);
    } else {
      setSelectedListingItem(eq);
    }
  };

  const activeDetailsItem = selectedListingItem;

  return (
    <div className="bg-[#f5f6f5] min-h-screen pb-24 animate-fade-in max-w-md mx-auto md:max-w-2xl px-4 mt-3">
      
      {/* Header row with back icon */}
      <div className="flex items-center gap-3 mb-6 bg-white p-3.5 rounded-2xl shadow-xs border border-gray-150/80">
        <button 
          onClick={() => {
            if (activeDetailsItem) {
              setSelectedListingItem(null);
            } else {
              onClose();
            }
          }}
          className="p-2 bg-gray-50 hover:bg-gray-100 rounded-xl text-gray-700 active:scale-95 transition-all cursor-pointer"
          id="btn-public-back"
        >
          <ArrowLeft className="w-5 h-5 text-gray-700" />
        </button>
        <div>
          <span className="text-[10px] text-[#1b6d24] font-extrabold tracking-wider uppercase flex items-center gap-1">
            <Leaf className="w-3.5 h-3.5" />
            E-Raitu Vedika
          </span>
          <h2 className="text-sm font-black text-gray-900 uppercase">
            {activeDetailsItem ? t.detailsTitle : t.back}
          </h2>
        </div>
      </div>

      {/* RENDER CHOSEN COMPONENT PAGE */}

      {/* 1. ABOUT US PAGE */}
      {pageId === 'about' && !activeDetailsItem && (
        <div className="space-y-6">
          <div className="bg-white rounded-[2rem] p-6 shadow-xs border border-gray-100 text-center relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-50 rounded-full -mr-10 -mt-10 opacity-60"></div>
            <div className="w-16 h-16 rounded-full bg-emerald-500/10 flex items-center justify-center mx-auto mb-4 border border-[#1b6d24]/10">
              <Leaf className="w-8 h-8 text-[#1b6d24]" />
            </div>
            <h1 className="text-lg font-black text-gray-900 leading-tight">
              {t.aboutTitle}
            </h1>
            <p className="text-[11px] font-extrabold text-[#1b6d24] mt-1.5 uppercase tracking-wide">
              {t.aboutSubtitle}
            </p>
            <div className="h-px bg-gray-100 w-1/2 mx-auto my-4"></div>
            <p className="text-xs text-gray-500 leading-relaxed text-left font-medium">
              {t.aboutContent1}
            </p>
            <p className="text-xs text-gray-500 leading-relaxed text-left font-medium mt-3">
              {t.aboutContent2}
            </p>
          </div>

          {/* Mission & Vision */}
          <div className="grid grid-cols-1 gap-4">
            <div className="bg-white rounded-3xl p-5 border border-gray-100/90 shadow-3xs">
              <div className="flex items-center gap-2.5 mb-2.5">
                <Compass className="w-5 h-5 text-emerald-600" />
                <h3 className="text-xs font-black text-gray-900 uppercase tracking-wider">{t.mission}</h3>
              </div>
              <p className="text-xs text-gray-400 font-bold leading-relaxed">{t.missionText}</p>
            </div>

            <div className="bg-white rounded-3xl p-5 border border-gray-100/90 shadow-3xs">
              <div className="flex items-center gap-2.5 mb-2.5">
                <Sprout className="w-5 h-5 text-[#1b6d24]" />
                <h3 className="text-xs font-black text-gray-900 uppercase tracking-wider">{t.vision}</h3>
              </div>
              <p className="text-xs text-gray-400 font-bold leading-relaxed">{t.visionText}</p>
            </div>
          </div>

          {/* Impact Stats Grid */}
          <div className="bg-[#1b6d24] text-white rounded-[2rem] p-6 shadow-sm">
            <h3 className="text-xs font-black uppercase tracking-wider text-emerald-100 mb-4 text-center">
              {language === 'te' ? 'సహకార సేవా విజయాలు' : 'Cooperative Core Indicators'}
            </h3>
            <div className="grid grid-cols-3 gap-3 text-center">
              <div>
                <span className="text-lg font-black block">1,200+</span>
                <span className="text-[10px] text-emerald-100 font-medium">
                  {language === 'te' ? 'రైతులు చేరారు' : 'Active Farmers'}
                </span>
              </div>
              <div className="border-x border-emerald-400/30">
                <span className="text-lg font-black block">150+</span>
                <span className="text-[10px] text-emerald-100 font-medium">
                  {language === 'te' ? 'ట్రాక్టర్లు అందుబాటు' : 'Tractors Shared'}
                </span>
              </div>
              <div>
                <span className="text-lg font-black block">₹35L+</span>
                <span className="text-[10px] text-emerald-100 font-medium">
                  {language === 'te' ? 'రైతు లాభం ఆదా' : 'Rental Savings'}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 2. CONTACT US PAGE */}
      {pageId === 'contact' && !activeDetailsItem && (
        <div className="space-y-6 animate-fade-in">
          <div className="bg-white rounded-[2rem] p-6 shadow-xs border border-gray-100">
            <h3 className="text-base font-black text-gray-950 mb-1.5 flex items-center gap-2">
              <Phone className="w-5 h-5 text-[#1b6d24]" />
              {t.contactTitle}
            </h3>
            <p className="text-xs text-gray-400 font-bold leading-relaxed mb-6">
              {t.contactSubtitle}
            </p>

            {/* Address Row Info */}
            <div className="space-y-3.5 mb-6 text-xs text-gray-500 font-semibold border-b border-gray-100 pb-6">
              <div className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>{t.contactAddress}</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-[#1b6d24] shrink-0" />
                <span>support@raituvedika.ap.gov.in</span>
              </div>
            </div>

            {/* Dynamic Submission Feedback */}
            {isContactSubmitted ? (
              <div className="bg-green-50 border border-green-200 rounded-2xl p-4 flex items-start gap-2.5 animate-scale-up">
                <Check className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />
                <p className="text-xs text-green-900 font-extrabold leading-relaxed">
                  {t.contactSuccess}
                </p>
              </div>
            ) : (
              <form onSubmit={handleContactSubmit} className="space-y-4">
                <div className="border border-emerald-100/50 rounded-2xl bg-emerald-50/15 p-1.5 mb-2 pl-3">
                  <span className="text-[10px] text-emerald-800 font-black uppercase tracking-wider block">
                    {t.contactFormHead}
                  </span>
                </div>

                <div>
                  <label className="text-[10px] text-gray-400 font-bold block mb-1.5 uppercase tracking-wider">{t.contactNameLabel}</label>
                  <input 
                    type="text" 
                    required
                    value={contactName}
                    onChange={(e) => setContactName(e.target.value)}
                    placeholder="e.g., కిరణ కుమార్ రెడ్డి"
                    className="w-full bg-gray-50 border border-gray-200 text-gray-800 font-semibold text-xs px-4 py-3 rounded-xl focus:ring-2 focus:ring-[#1b6d24]/50 focus:bg-white outline-none transition-all"
                  />
                </div>

                <div>
                  <label className="text-[10px] text-gray-400 font-bold block mb-1.5 uppercase tracking-wider">{t.contactPhoneLabel}</label>
                  <input 
                    type="tel" 
                    required
                    value={contactPhone}
                    onChange={(e) => setContactPhone(e.target.value)}
                    placeholder="9440XXXXXX"
                    className="w-full bg-gray-50 border border-gray-200 text-gray-800 font-semibold text-xs px-4 py-3 rounded-xl focus:ring-2 focus:ring-[#1b6d24]/50 focus:bg-white outline-none transition-all"
                  />
                </div>

                <div>
                  <label className="text-[10px] text-gray-400 font-bold block mb-1.5 uppercase tracking-wider">{t.contactTypeLabel}</label>
                  <select 
                    value={contactCategory}
                    onChange={(e) => setContactCategory(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 text-gray-800 font-bold text-xs p-3 px-4 rounded-xl focus:ring-2 focus:ring-[#1b6d24]/50 focus:bg-white outline-none"
                  >
                    <option value="general">{language === 'te' ? 'సాధారణ విచారణ' : 'General Inquiry'}</option>
                    <option value="booking">{language === 'te' ? 'అద్దె బుకింగ్ సహాయం' : 'Rent & Booking Support'}</option>
                    <option value="dispute">{language === 'te' ? 'యజమాని అభ్యంతర సమస్యలు' : 'Owner Dispute/Issues'}</option>
                    <option value="technical">{language === 'te' ? 'సాంకేతిక లోపాలు' : 'Technical App Error'}</option>
                  </select>
                </div>

                <div>
                  <label className="text-[10px] text-gray-400 font-bold block mb-1.5 uppercase tracking-wider">{t.contactMsgLabel}</label>
                  <textarea 
                    rows={3}
                    required
                    value={contactMsg}
                    onChange={(e) => setContactMsg(e.target.value)}
                    placeholder="సమస్య గురించి రాయండి..."
                    className="w-full bg-gray-50 border border-gray-200 text-gray-800 font-medium text-xs px-4 py-3 rounded-xl focus:ring-2 focus:ring-[#1b6d24]/50 focus:bg-white outline-none transition-all"
                  ></textarea>
                </div>

                <button 
                  type="submit"
                  className="w-full py-3 bg-[#1b6d24] text-white text-xs font-black rounded-xl hover:bg-[#15541b] active:scale-95 transition-all text-center flex items-center justify-center gap-2 shadow-xs cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                  {t.contactBtn}
                </button>
              </form>
            )}
          </div>
        </div>
      )}

      {/* 3. FAQ ACCORDION PAGE */}
      {pageId === 'faq' && !activeDetailsItem && (
        <div className="space-y-4">
          <div className="bg-white rounded-[2rem] p-5 shadow-xs border border-gray-100">
            <h3 className="text-base font-black text-gray-950 mb-1 flex items-center gap-1.5">
              <HelpCircle className="w-5 h-5 text-amber-500" />
              {t.faqTitle}
            </h3>
            <p className="text-xs text-gray-400 font-bold leading-relaxed mb-4">
              {t.faqSubtitle}
            </p>
          </div>

          <div className="space-y-2.5">
            {t.faqItems.map((item: any, idx: number) => {
              const isOpen = openFaqIndex === idx;
              return (
                <div 
                  key={idx}
                  className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-3xs transition-all duration-200"
                >
                  <button 
                    onClick={() => toggleFaq(idx)}
                    type="button"
                    className="w-full px-5 py-4 flex items-center justify-between text-left gap-3 focus:outline-none cursor-pointer"
                  >
                    <span className="text-xs font-black text-gray-800 flex-1 leading-snug">
                      {item.q}
                    </span>
                    {isOpen ? (
                      <ChevronUp className="w-4 h-4 text-emerald-700 shrink-0" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-gray-400 shrink-0" />
                    )}
                  </button>
                  {isOpen && (
                    <div className="px-5 pb-4.5 pt-1.5 border-t border-gray-50/50 bg-emerald-50/5 animate-fade-in">
                      <p className="text-[11px] text-gray-500 font-semibold leading-relaxed">
                        {item.a}
                      </p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 4. EQUIPMENT LISTING (SHOWROOM) PAGE */}
      {pageId === 'listing' && !activeDetailsItem && (
        <div className="space-y-4">
          <div className="bg-white rounded-[2rem] p-5 shadow-xs border border-gray-100">
            <div className="flex items-center gap-1.5 mb-1.5">
              <Award className="w-5 h-5 text-emerald-600" />
              <h3 className="text-base font-black text-gray-950">{t.listingTitle}</h3>
            </div>
            <p className="text-xs text-gray-400 font-bold leading-relaxed">
              {t.listingSubtitle}
            </p>

            {/* Interactive local search within listings */}
            <div className="relative mt-4.5">
              <input 
                type="text"
                placeholder={t.searchHolder}
                className="w-full bg-gray-50 border border-gray-200 text-gray-800 placeholder-gray-400 font-bold px-4 py-3.5 rounded-2xl pr-12 focus:outline-none focus:ring-2 focus:ring-[#1b6d24] text-xs transition-all"
                value={localSearchQuery}
                onChange={(e) => setLocalSearchQuery(e.target.value)}
              />
              <Search className="w-4 h-4 text-gray-400 absolute right-4 top-4" />
            </div>

            {/* Filters selectors row */}
            <div className="flex flex-col gap-2 mt-4.5 pt-3 border-t border-gray-100">
              <span className="text-[9px] text-[#1b6d24] font-black uppercase tracking-wider block">
                {t.filterCat}
              </span>
              <div className="flex gap-1.5 overflow-x-auto pb-1 no-scrollbar scroll-smooth">
                 {[
                  { value: 'all', labelTe: 'అన్నీ', labelEn: 'All' },
                  { value: 'tractor', labelTe: 'ట్రాక్టర్', labelEn: 'Tractor' },
                  { value: 'harvester', labelTe: 'హార్వెస్టర్', labelEn: 'Harvester' },
                  { value: 'sprayer', labelTe: 'స్ప్రేయర్', labelEn: 'Sprayer' },
                  { value: 'tiller', labelTe: 'టిల్లర్', labelEn: 'Tiller' },
                  { value: 'rotavator', labelTe: 'రోటవేటర్', labelEn: 'Rotavator' },
                  { value: 'transplanter', labelTe: 'నాటు యంత్రం', labelEn: 'Transplanter' },
                  { value: 'thresher', labelTe: 'నూర్పిడి యంత్రం', labelEn: 'Thresher' }
                ].map((btn) => (
                  <button
                    key={btn.value}
                    onClick={() => setFilterCategory(btn.value as any)}
                    className={`shrink-0 text-[10.5px] font-black py-1.5 px-3 rounded-full border transition-all cursor-pointer ${
                      filterCategory === btn.value
                        ? 'bg-[#1b6d24] text-white border-green-800'
                        : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100'
                    }`}
                  >
                    {language === 'te' ? btn.labelTe : btn.labelEn}
                  </button>
                ))}
              </div>

              {/* Pricing Sort Toggle */}
              <div className="flex items-center justify-between gap-2 mt-2 pt-2 border-t border-gray-50">
                <span className="text-[9px] text-gray-400 font-bold uppercase tracking-wider">
                  {t.sortPrice}
                </span>
                <select
                  value={sortOrder}
                  onChange={(e) => setSortOrder(e.target.value as any)}
                  className="bg-transparent text-[11px] font-bold text-emerald-800 outline-none border-b border-gray-200 pb-0.5 cursor-pointer"
                >
                  <option value="default">{language === 'te' ? 'సాధారణీకరణ' : 'Default Rating'}</option>
                  <option value="low-high">{t.lowToHigh}</option>
                  <option value="high-low">{t.highToLow}</option>
                </select>
              </div>
            </div>
          </div>

          {/* List display */}
          <div className="space-y-4.5">
            {sortedEquipment.length === 0 ? (
              <div className="bg-white border border-gray-100 rounded-3xl p-8 text-center text-gray-400 font-bold text-xs">
                {t.noItems}
              </div>
            ) : (
              sortedEquipment.map(eq => (
                <div 
                  key={eq.id}
                  onClick={() => handleItemSelect(eq)}
                  className="bg-white border border-gray-100 rounded-[2rem] p-4.5 shadow-3xs flex gap-4 cursor-pointer hover:border-emerald-200 active:scale-99 transition-all"
                  id={`showroom-card-${eq.id}`}
                >
                  <img
                    src={eq.imageUrl}
                    alt={eq.title}
                    className="w-20 h-20 rounded-2xl object-cover shrink-0 border border-gray-100"
                    referrerPolicy="no-referrer"
                  />
                  <div className="flex-1 min-w-0 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between gap-1">
                        <span className="text-[10px] bg-emerald-50 text-emerald-800 font-extrabold px-2 py-0.5 rounded-full border border-emerald-100/30">
                          {language === 'te' ? eq.category.toUpperCase() : eq.category.toUpperCase()}
                        </span>
                        <span className="text-xs font-extrabold text-[#1b6d24]">
                          ₹{eq.price}/{language === 'te' ? eq.rateTypeLabel : (eq.rateType === 'day' ? 'day' : 'hr')}
                        </span>
                      </div>
                      <h4 className="text-xs font-black text-gray-800 mt-1.5 truncate">
                        {language === 'te' ? eq.title : eq.titleEn}
                      </h4>
                      <p className="text-[10px] text-gray-400 mt-1 font-bold flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-gray-300" />
                        <span>{language === 'te' ? eq.location : eq.locationEn}</span>
                      </p>
                    </div>

                    <div className="flex items-center justify-between text-[10px] font-bold text-[#1b6d24] mt-2 pt-2 border-t border-gray-50">
                      <span>{eq.verified ? (language === 'te' ? '✓ వెరిఫైడ్ రైతు' : '✓ Verified Farmer') : ''}</span>
                      <span className="uppercase text-[9px] font-extrabold text-[#1b6d24] hover:underline">
                        {language === 'te' ? 'వివరాలు చూడండి >' : 'View Specifications >'}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* 5. SEARCH RESULTS PAGE */}
      {pageId === 'search' && !activeDetailsItem && (
        <div className="space-y-4">
          <div className="bg-white rounded-[2rem] p-5 shadow-xs border border-gray-100">
            <div className="flex items-center gap-1.5 mb-2">
              <Search className="w-5 h-5 text-emerald-600" />
              <h3 className="text-base font-black text-gray-950">
                {language === 'te' ? 'శోధన ఫలితాలు' : 'Search & Location Results'}
              </h3>
            </div>
            
            {/* Real Search Box */}
            <div className="relative">
              <input 
                type="text"
                placeholder={language === 'te' ? 'గ్రామం లేదా యంత్రము పేరుతో వెతకండి...' : 'Type village name or tool model...'}
                className="w-full bg-gray-50 border border-gray-200 text-gray-800 placeholder-gray-400 font-bold px-4 py-3 rounded-2xl pr-12 focus:outline-none focus:ring-2 focus:ring-[#1b6d24] text-xs transition-all"
                value={localSearchQuery}
                onChange={(e) => setLocalSearchQuery(e.target.value)}
              />
              <Search className="w-4 h-4 text-gray-400 absolute right-4 top-3.5" />
            </div>

            {/* Quick Tag Recommendations Assist */}
            <div className="flex gap-2.5 items-center mt-4 pt-1 flex-wrap text-[10px] font-bold text-gray-400">
              <span>{language === 'te' ? 'ప్రజాదరణ పొందిన కీవర్డ్లు:' : 'Popular keywords:'}</span>
              {['ట్రాక్టర్', 'Tractor', 'అనంతపురము', 'హార్వెస్టర్'].map(tag => (
                <button 
                  key={tag}
                  onClick={() => setLocalSearchQuery(tag)} 
                  className="bg-emerald-50 text-emerald-800 px-2 py-0.5 rounded-md hover:bg-emerald-100"
                >
                  #{tag}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-4.5">
            {sortedEquipment.length === 0 ? (
              <div className="bg-[#fffdf2] border border-amber-50 rounded-3xl p-8 text-center text-amber-900 font-extrabold text-xs">
                {language === 'te' 
                  ? 'మ్యాచింగ్ ఫలితాలు లేవు. దయచేసి శోధన పదాన్ని మార్చండి.' 
                  : 'No exact matches found. Try refining search keywords or village districts.'}
              </div>
            ) : (
              sortedEquipment.map(eq => (
                <div 
                  key={eq.id}
                  onClick={() => handleItemSelect(eq)}
                  className="bg-white border border-gray-100 rounded-[2rem] p-4.5 shadow-3xs flex gap-4 cursor-pointer hover:border-emerald-200 active:scale-99 transition-all"
                >
                  <img
                    src={eq.imageUrl}
                    alt={eq.title}
                    className="w-20 h-20 rounded-2xl object-cover shrink-0 border border-gray-100"
                    referrerPolicy="no-referrer"
                  />
                  <div className="flex-1 min-w-0 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="text-[9px] bg-amber-50 text-amber-800 font-extrabold px-2 py-0.5 rounded-full">
                          {eq.statusLabel}
                        </span>
                        <span className="text-xs font-black text-[#1b6d24]">₹{eq.price}/{language === 'te' ? eq.rateTypeLabel : eq.rateType}</span>
                      </div>
                      <h4 className="text-xs font-black text-gray-800 mt-1 truncate">
                        {language === 'te' ? eq.title : eq.titleEn}
                      </h4>
                      <p className="text-[10px] text-gray-400 mt-1 font-bold flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-slate-300" />
                        <span>{language === 'te' ? eq.location : eq.locationEn}</span>
                      </p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* 6. PRIVACY POLICY PAGE */}
      {pageId === 'privacy' && !activeDetailsItem && (
        <div className="space-y-4">
          <div className="bg-white rounded-[2rem] p-6 shadow-xs border border-gray-100">
            <h3 className="text-base font-black text-gray-990 mb-2.5 flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-600" />
              {t.privacyTitle}
            </h3>
            
            <p className="text-xs text-gray-500 leading-relaxed font-semibold">
              {t.privacyText}
            </p>

            <div className="bg-emerald-50/45 rounded-2xl p-4.5 border border-emerald-100/50 mt-6">
              <h4 className="text-xs font-black text-emerald-950 flex items-center gap-1.5 mb-1.5">
                <UserCheck className="w-4 h-4 text-[#1b6d24]" />
                {t.privacySecure}
              </h4>
              <p className="text-[11px] text-emerald-900 leading-relaxed font-bold">
                {t.privacySecureText}
              </p>
            </div>

            <div className="space-y-4.5 mt-6 border-t border-gray-100 pt-5 text-xs text-gray-400 font-bold">
              <div>
                <h5 className="text-gray-800 uppercase tracking-wider text-[10px] mb-1">1. DATA ENCRYPTION</h5>
                <p className="leading-relaxed">All chat logs, telephone links, and reservation credentials are secured through standard HTTPS and sandboxed database systems.</p>
              </div>

              <div>
                <h5 className="text-gray-800 uppercase tracking-wider text-[10px] mb-1">2. GEOLOCATION</h5>
                <p className="leading-relaxed">Village locations are checked purely to arrange optimal delivery and transport between cooperative users.</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 7. TERMS & CONDITIONS PAGE */}
      {pageId === 'terms' && !activeDetailsItem && (
        <div className="space-y-4">
          <div className="bg-white rounded-[2rem] p-6 shadow-xs border border-gray-100">
            <h3 className="text-base font-black text-gray-950 mb-4 flex items-center gap-2">
              <Scale className="w-5 h-5 text-[#1b6d24]" />
              {t.termsTitle}
            </h3>

            <div className="space-y-4">
              {t.termsItems.map((rule: string, rIdx: number) => (
                <div key={rIdx} className="flex gap-3 items-start">
                  <div className="w-5 h-5 rounded-md bg-emerald-50 text-emerald-800 font-black text-xs flex items-center justify-center shrink-0 mt-0.5 border border-emerald-100">
                    {rIdx + 1}
                  </div>
                  <p className="text-xs text-gray-500 leading-relaxed font-semibold">
                    {rule}
                  </p>
                </div>
              ))}
            </div>

            <p className="text-[10px] text-gray-400 font-bold border-t border-gray-100 pt-5 mt-6 leading-relaxed">
              AP Agricultural Cooperative Board guidelines govern this software completely to guarantee transparent, debt-free, crop production enhancement.
            </p>
          </div>
        </div>
      )}

      {/* 8. HELP & SUPPORT CENTRE PAGE */}
      {pageId === 'help_support' && !activeDetailsItem && (
        <div className="space-y-6">
          <div className="bg-white rounded-[2rem] p-6 shadow-xs border border-gray-100">
            <h3 className="text-base font-black text-slate-955 mb-1.5 flex items-center gap-2">
              <Phone className="w-5 h-5 text-[#1b6d24]" />
              {t.helpSubtitle}
            </h3>
            
            {/* Toll Free Emergency Card */}
            <div className="bg-[#1b6d24] text-white p-5 rounded-2xl shadow-sm mt-4.5 border border-green-800">
              <p className="text-[10px] text-emerald-100 uppercase font-extrabold tracking-widest">{t.emergencyHelp}</p>
              <h4 className="text-lg font-black tracking-tight mt-1.5 flex items-center gap-2">
                <Landmark className="w-5 h-5 text-white" />
                {t.emergencyNo}
              </h4>
            </div>
          </div>

          {/* Grievance Ticket Submission */}
          <div className="bg-white rounded-[2rem] p-6 shadow-xs border border-gray-100">
            <h4 className="text-xs font-black text-gray-950 uppercase tracking-wider mb-4 flex items-center gap-2">
              <FileText className="w-4.5 h-4.5 text-[#1b6d24]" />
              {t.grievanceTitle}
            </h4>

            {isGrievanceSubmitted ? (
              <div className="bg-green-50 border border-green-200 rounded-2xl p-4.5 animate-scale-up">
                <p className="text-xs text-[#1b6d24] font-black leading-relaxed">
                  {t.grievanceSuccess}
                </p>
              </div>
            ) : (
              <form onSubmit={handleGrievanceSubmit} className="space-y-4">
                <div>
                  <label className="text-[10px] text-gray-400 font-bold block mb-1.5 uppercase">{language === 'te' ? 'యంత్ర పరికర సంబంధం (ఐచ్ఛికం)' : 'Associated Machinery Name (Optional)'}</label>
                  <input 
                    type="text"
                    placeholder="e.g., Mahindra Jivo Tractor"
                    value={grievanceTractor}
                    onChange={(e) => setGrievanceTractor(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 text-gray-800 font-semibold text-xs px-4 py-3 rounded-xl outline-none"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-gray-400 font-bold block mb-1.5 uppercase">{language === 'te' ? 'ఫిర్యాదు వివరాలు' : 'Full Dispute / Problem Details'}</label>
                  <textarea 
                    rows={3}
                    required
                    value={grievanceText}
                    onChange={(e) => setGrievanceText(e.target.value)}
                    placeholder={t.grievanceHolder}
                    className="w-full bg-gray-50 border border-gray-200 text-gray-800 font-medium text-xs px-4 py-3 rounded-xl outline-none transition-all"
                  ></textarea>
                </div>
                <button 
                  type="submit"
                  className="w-full py-3 bg-[#1b6d24] text-white text-xs font-black rounded-xl hover:bg-[#15541b] active:scale-95 transition-all cursor-pointer text-center flex items-center justify-center gap-2 shadow-2xs"
                >
                  {t.grievanceBtn}
                </button>
              </form>
            )}
          </div>

          {/* Regional Table Officers List */}
          <div className="bg-white rounded-[2rem] p-5 shadow-xs border border-gray-100">
            <h4 className="text-[10px] font-black text-gray-800 uppercase tracking-widest mb-3.5 flex items-center gap-1.5">
              <Users className="w-4 h-4 text-emerald-600" />
              {t.regionalOfficer}
            </h4>
            
            <div className="space-y-2.5">
              {[
                { r: 'Guntur District Office', n: 'శ్రీ వెంకటేశ్వర రావు', p: '+91 94401 98765' },
                { r: 'Nellore District Office', n: 'యం. అనూరాధ ప్రసాద్', p: '+91 94402 87654' },
                { r: 'Anantapuramu District Office', n: 'కె. నరసింహ రెడ్డి', p: '+91 94403 76543' }
              ].map((off, oIdx) => (
                <div key={oIdx} className="bg-gray-50 border border-gray-100/50 p-3 rounded-xl flex justify-between items-center text-xs">
                  <div>
                    <span className="text-[9.5px] text-slate-400 font-bold block leading-none">{off.r}</span>
                    <span className="font-extrabold text-[#1b6d24] mt-1 block">{off.n}</span>
                  </div>
                  <a href={`tel:${off.p}`} className="bg-white border border-gray-200 hover:border-emerald-300 font-black text-[10.5px] text-[#1b6d24] px-3 py-1.5 rounded-lg flex items-center gap-1 shadow-3xs hover:bg-emerald-50 active:scale-95 transition-all">
                    <Phone className="w-3 h-3 text-emerald-700" />
                    {language === 'te' ? 'కాల్' : 'Call'}
                  </a>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 9. DETAILED SPECIFICATIONS VIEW PAGE */}
      {activeDetailsItem && (() => {
        const isBooked = activeDetailsItem.status === 'booked';
        const isComingSoon = activeDetailsItem.status === 'coming_soon';

        return (
          <div className="bg-white rounded-[2rem] p-5 border border-gray-100 shadow-xs space-y-6 animate-scale-up">
            <div className="relative h-56 bg-gray-100 rounded-2xl overflow-hidden shadow-3xs flex items-center justify-center">
              <div 
                className="absolute inset-0 bg-cover bg-center blur-lg opacity-40 scale-110 pointer-events-none"
                style={{ backgroundImage: `url(${activeDetailsItem.imageUrl})` }}
              />
              <img 
                src={activeDetailsItem.imageUrl}
                alt={activeDetailsItem.title}
                className="relative z-10 max-w-full max-h-full object-contain"
                referrerPolicy="no-referrer"
              />
              <div className="absolute top-3 left-3 bg-white/95 backdrop-blur-xs px-2.5 py-1 rounded-full text-[9px] font-extrabold text-[#1b6d24] z-20">
                {activeDetailsItem.verified ? 'VERIFIED FARMER' : 'COOPERATIVE APPROVED'}
              </div>
            </div>

            <div>
              <div className="flex justify-between items-start gap-4">
                <h3 className="text-base font-black text-gray-900 leading-tight">
                  {language === 'te' ? activeDetailsItem.title : activeDetailsItem.titleEn}
                </h3>
                <span className="text-base font-black text-[#1b6d24] whitespace-nowrap">
                  ₹{activeDetailsItem.price}/{language === 'te' ? activeDetailsItem.rateTypeLabel : activeDetailsItem.rateType}
                </span>
              </div>
              <p className="text-xs text-[#1b6d24] font-black mt-2 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5" />
                {language === 'te' ? activeDetailsItem.location : activeDetailsItem.locationEn}
                {activeDetailsItem.horsepower && ` • ${activeDetailsItem.horsepower}`}
              </p>
              
              <p className="text-xs text-gray-450 mt-3 font-semibold leading-relaxed">
                {language === 'te' ? activeDetailsItem.description : (activeDetailsItem.descriptionEn || activeDetailsItem.description)}
              </p>
            </div>

            {/* Specifications Box */}
            <div className="p-4 bg-emerald-50/20 border border-emerald-100/30 rounded-2xl space-y-3">
              <h4 className="text-[10px] text-[#1b6d24] font-black uppercase tracking-widest">{t.specifications}</h4>
              <div className="grid grid-cols-2 gap-3.5 text-xs">
                <div>
                  <span className="text-gray-400 block font-bold text-[10px] uppercase">{t.hp}</span>
                  <span className="font-extrabold text-gray-800">{activeDetailsItem.horsepower || '24 HP - 55 HP'}</span>
                </div>
                <div>
                  <span className="text-gray-400 block font-bold text-[10px] uppercase">{t.fuel}</span>
                  <span className="font-extrabold text-gray-800 flex items-center gap-1">
                    <Fuel className="w-3.5 h-3.5 text-amber-500" />
                    {activeDetailsItem.fuelType || 'Diesel'}
                  </span>
                </div>
                <div className="col-span-2 border-t border-gray-100/50 pt-2.5">
                  <span className="text-gray-400 block font-bold text-[10px] uppercase">{t.driverStatus}</span>
                  <span className="font-extrabold text-gray-800 flex items-center gap-1 mt-0.5">
                    <UserCheck className="w-4 h-4 text-[#1b6d24]" />
                    {activeDetailsItem.includesDriver ? t.driverYes : t.driverNo}
                  </span>
                </div>
              </div>
            </div>

            {/* Owner Contact details panel */}
            <div className="p-4 bg-gray-50 border border-gray-150 rounded-2xl">
              <h4 className="text-[10px] text-gray-400 font-black uppercase tracking-widest mb-3">{t.ownerDetails}</h4>
              <div className="flex items-center gap-3">
                <img 
                  src={activeDetailsItem.ownerAvatar || 'https://images.unsplash.com/photo-1595152772835-219674b2a8a6?auto=format&fit=crop&w=150&q=80'}
                  alt={activeDetailsItem.ownerName}
                  className="w-10 h-10 rounded-full object-cover border border-gray-200"
                  referrerPolicy="no-referrer"
                />
                <div>
                  <h5 className="text-xs font-black text-gray-800 leading-none">{activeDetailsItem.ownerName}</h5>
                  <span className="text-[10px] text-gray-400 font-bold mt-1.5 block">AP Farm Cooperative Member</span>
                </div>
              </div>
            </div>

            {/* Actions for this Details view */}
            <div className="flex gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => {
                  onOpenChat(
                    activeDetailsItem.ownerName,
                    activeDetailsItem.ownerPhone,
                    activeDetailsItem.ownerAvatar || 'https://images.unsplash.com/photo-1595152772835-219674b2a8a6?auto=format&fit=crop&w=150&q=80',
                    activeDetailsItem.id,
                    language === 'te' ? activeDetailsItem.title : (activeDetailsItem.titleEn || activeDetailsItem.title),
                    activeDetailsItem.imageUrl
                  );
                }}
                className="flex-1 py-3 border border-[#1b6d24] text-[#1b6d24] hover:bg-emerald-50 text-xs font-black rounded-xl active:scale-95 transition-all text-center flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <MessageSquare className="w-4 h-4" />
                {t.chatWithOwner}
              </button>

              {isBooked ? (
                <button
                  type="button"
                  disabled
                  className="py-3 px-4 bg-gray-100 text-gray-400 text-xs font-bold rounded-xl cursor-not-allowed border border-gray-200"
                >
                  {language === 'te' ? 'బుక్ చేయబడింది' : 'Already Booked'}
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    onBook(activeDetailsItem.id);
                    setSelectedListingItem(null);
                  }}
                  className={`py-3 px-5 text-white text-xs font-black rounded-xl active:scale-95 transition-all cursor-pointer shadow-xs ${
                    isComingSoon ? 'bg-amber-500 hover:bg-amber-600' : 'bg-[#1b6d24] hover:bg-[#15541b]'
                  }`}
                >
                  {t.bookNow}
                </button>
              )}
            </div>
            
            {/* Reviews list */}
            <div className="border-t border-gray-100 pt-5 space-y-4">
              <h4 className="text-[10.5px] font-black text-gray-800 uppercase tracking-wider">{t.reviews}</h4>
              <div className="space-y-3">
                <div className="bg-gray-50/50 p-3 rounded-2xl border border-gray-100">
                  <div className="flex items-center justify-between">
                    <span className="text-[10.5px] font-black text-[#1b6d24]">రాము (Anantapuramu Renter)</span>
                    <div className="flex gap-0.5 text-amber-500">
                      <Star className="w-3 h-3 fill-amber-500" />
                      <Star className="w-3 h-3 fill-amber-500" />
                      <Star className="w-3 h-3 fill-amber-500" />
                      <Star className="w-3 h-3 fill-amber-500" />
                      <Star className="w-3 h-3 fill-amber-500" />
                    </div>
                  </div>
                  <p className="text-[10.5px] text-gray-400 font-semibold mt-1">
                    {language === 'te' 
                      ? 'చాలా తక్కువ ధరకే లభించింది. పొలం దున్నడం చాలా బాగా కుదిరింది. ఆపరేటర్ చాలా సహకరించారు!' 
                      : 'Excellent tractor and powerful. Operated smoothly and driver was extremely cooperative.'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        );
      })()}
      
    </div>
  );
}
