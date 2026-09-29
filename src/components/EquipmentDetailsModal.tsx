import React, { useState } from 'react';
import { Equipment, FarmerProfile, EquipmentReview } from '../types';
import { X, MapPin, User, Flame, Zap, CheckCircle2, ChevronRight, ShieldCheck, Phone, MessageSquare, Share2, Star } from 'lucide-react';
import { StarRating } from './StarRating';
import { EquipmentReviewsSection } from './EquipmentReviewsSection';
import { getEquipmentReviews } from '../reviewData';

interface EquipmentDetailsModalProps {
  equipment: Equipment;
  onClose: () => void;
  onBook: (id: string) => void;
  onOpenChat: (
    ownerName: string,
    equipmentTitle: string,
    equipmentId: string,
    equipmentImage: string,
    ownerPhone: string,
    ownerAvatar: string,
    initialMessage?: string
  ) => void;
  language: 'te' | 'en';
  currentUser?: FarmerProfile | null;
  onUpdateEquipment?: (updated: Equipment) => void;
}

export default function EquipmentDetailsModal({
  equipment,
  onClose,
  onBook,
  onOpenChat,
  language,
  currentUser,
  onUpdateEquipment
}: EquipmentDetailsModalProps) {
  const isBooked = equipment.status === 'booked';
  const isComingSoon = equipment.status === 'coming_soon';

  // Load reviews specific to this equipment
  const [reviews, setReviews] = useState<EquipmentReview[]>(() => {
    return getEquipmentReviews(equipment.id);
  });
  const [currentRating, setCurrentRating] = useState<number>(equipment.rating || 4.8);
  const [currentReviewCount, setCurrentReviewCount] = useState<number>(
    equipment.reviewCount || (reviews.length > 0 ? reviews.length : 12)
  );

  const t = {
    te: {
      details: 'యంత్రం పూర్తి వివరాలు',
      specifications: 'పరికరాల స్పెసిఫికేషన్స్',
      horsepower: 'మొత్తం పవర్',
      fuelType: 'ఇంధన రకం',
      driver: 'డ్రైవర్ సదుపాయం',
      driverYes: 'డ్రైవర్ ఉన్నారు',
      driverNo: 'డ్రైవర్ లేరు (స్వీయ డ్రైవింగ్)',
      verifiedOwner: 'వెరిఫైడ్ యజమాని',
      rentalRate: 'అద్దె ధర',
      bookNow: 'బుక్ చేయండి',
      contactOwner: 'యజమానితో మాట్లాడండి',
      call: 'కాల్ చేయండి',
      chat: 'చాట్ చేయండి',
      booked: 'రద్దు చేయబడినది / బుక్ చేయబడింది',
      comingSoon: 'త్వరలో లభ్యం',
      verifiedDesc: 'ఈ యంత్రం మరియు యజమాని వివరాలు రైతు వేదిక నిర్వాహకుల చేత ధృవీకరించబడ్డాయి.',
      additionalSpecs: 'ముఖ్యమైన విశేషాలు',
      rateUnit: equipment.rateType === 'day' ? 'రోజుకు' : 'గంటకు'
    },
    en: {
      details: 'Equipment Details',
      specifications: 'Technical Specifications',
      horsepower: 'Horsepower',
      fuelType: 'Fuel Type',
      driver: 'Driver Included',
      driverYes: 'Driver Included',
      driverNo: 'Self-Drive (No Driver)',
      verifiedOwner: 'Verified Owner',
      rentalRate: 'Rental Rate',
      bookNow: 'Book Now',
      contactOwner: 'Contact Owner',
      call: 'Call Owner',
      chat: 'Chat & Discuss',
      booked: 'Already Booked',
      comingSoon: 'Coming Soon',
      verifiedDesc: 'This machinery and owner profile is verified by the E-Raitu Vedika support team.',
      additionalSpecs: 'Key Highlights',
      rateUnit: equipment.rateType === 'day' ? 'per Day' : 'per Hour'
    }
  }[language];

  // Simulated Call click
  const handleCall = () => {
    window.location.href = `tel:${equipment.ownerPhone}`;
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4">
      {/* Background dismiss click overlay */}
      <div className="absolute inset-0" onClick={onClose}></div>

      {/* Slide up panel for mobile, rounded card for dekstop */}
      <div 
        className="relative bg-white w-full max-w-md sm:rounded-3xl rounded-t-[2.5rem] overflow-hidden shadow-2xl z-10 max-h-[92vh] sm:max-h-[85vh] flex flex-col animate-slide-up"
        id={`details-modal-${equipment.id}`}
      >
        
        {/* Header Visual with Close Button */}
        <div className="relative h-56 bg-gray-150 shrink-0 overflow-hidden flex items-center justify-center">
          <div 
            className="absolute inset-0 bg-cover bg-center blur-lg opacity-40 scale-110 pointer-events-none"
            style={{ backgroundImage: `url(${equipment.imageUrl})` }}
          />
          <img 
            src={equipment.imageUrl} 
            alt={equipment.title} 
            className="relative z-10 max-w-full max-h-full object-contain"
            referrerPolicy="no-referrer"
            onError={(e) => {
              e.currentTarget.src = 'https://images.unsplash.com/photo-1593113598332-cd59c5bc3f90?w=600';
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
          
          {/* Close button */}
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 bg-black/30 hover:bg-black/50 backdrop-blur-sm text-white p-2 rounded-full cursor-pointer transition-colors duration-150"
            id="btn-details-close"
          >
            <X className="w-5 h-5 text-white" />
          </button>

          {/* Floaters inside photo */}
          <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between">
            <div className="text-white">
              <span className="bg-emerald-600 text-white text-[9px] font-extrabold uppercase px-2.5 py-1 rounded-full inline-block mb-1 shadow-sm">
                {equipment.categoryLabel}
              </span>
              <h2 className="text-xl font-extrabold tracking-tight drop-shadow-md">
                {language === 'te' ? equipment.title : equipment.titleEn}
              </h2>
              <div className="flex items-center gap-2 mt-1 flex-wrap">
                <div className="flex items-center gap-1 bg-black/45 backdrop-blur-md px-2 py-0.5 rounded-full border border-white/20">
                  <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                  <span className="text-xs font-black text-white">{currentRating.toFixed(1)}</span>
                  <span className="text-[10px] text-gray-250 font-semibold">({currentReviewCount})</span>
                </div>
                <p className="text-[11px] text-gray-200 font-medium flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-emerald-400" />
                  <span>{language === 'te' ? equipment.location : equipment.locationEn}</span>
                </p>
              </div>
            </div>
            
            <div className="bg-white/95 backdrop-blur-xs rounded-2xl px-3 py-1.5 text-right shadow-md border border-gray-100 flex flex-col items-end">
              <span className="text-[9px] text-gray-400 font-bold uppercase tracking-wider">{t.rentalRate}</span>
              <span className="text-base font-extrabold text-[#1b6d24]">₹{equipment.price}<span className="text-xs font-semibold text-gray-500">/{language === 'te' ? equipment.rateTypeLabel : t.rateUnit}</span></span>
            </div>
          </div>
        </div>

        {/* Content Scrolling Area */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5 no-scrollbar">
          
          {/* Quick specs grid */}
          <div className="grid grid-cols-3 gap-2 bg-gray-50/80 rounded-2xl p-3 border border-gray-100/50">
            {/* Specs 1: HP */}
            <div className="flex flex-col items-center justify-center p-2 bg-white rounded-xl shadow-3xs text-center border border-gray-100/30">
              <Zap className="w-5 h-5 text-amber-500 mb-1" />
              <span className="text-[9px] text-gray-400 font-extrabold uppercase tracking-wide">{t.horsepower}</span>
              <span className="text-xs font-bold text-gray-700 mt-0.5">{equipment.horsepower || 'N/A'}</span>
            </div>

            {/* Specs 2: Fuel */}
            <div className="flex flex-col items-center justify-center p-2 bg-white rounded-xl shadow-3xs text-center border border-gray-100/30">
              <Flame className="w-5 h-5 text-red-500 mb-1" />
              <span className="text-[9px] text-gray-400 font-extrabold uppercase tracking-wide">{t.fuelType}</span>
              <span className="text-xs font-bold text-gray-700 mt-0.5 truncate max-w-full">
                {equipment.fuelType ? (language === 'te' ? equipment.fuelType.split(' ')[0] : 'Diesel') : 'Diesel'}
              </span>
            </div>

            {/* Specs 3: Driver */}
            <div className="flex flex-col items-center justify-center p-2 bg-white rounded-xl shadow-3xs text-center border border-gray-100/30">
              <User className="w-5 h-5 text-indigo-500 mb-1" />
              <span className="text-[9px] text-gray-400 font-extrabold uppercase tracking-wide">{t.driver}</span>
              <span className="text-xs font-bold text-gray-700 mt-0.5 truncate max-w-full">
                {equipment.includesDriver ? (language === 'te' ? 'ఉంది' : 'Yes') : (language === 'te' ? 'లేదు' : 'No')}
              </span>
            </div>
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <h4 className="text-xs font-extrabold text-gray-400 uppercase tracking-widest">
              {language === 'te' ? 'వివరణ' : 'Description'}
            </h4>
            <p className="text-xs text-gray-600 font-medium leading-relaxed bg-emerald-50/20 rounded-2xl p-3 border border-emerald-100/20">
              {language === 'te' 
                ? (equipment.description || 'వివరాలు అందుబాటులో లేవు') 
                : (equipment.descriptionEn || equipment.description || 'No description available')}
            </p>
          </div>

          {/* Specs bullet list */}
          {equipment.specs && equipment.specs.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-xs font-extrabold text-gray-400 uppercase tracking-widest flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-[#1b6d24]" />
                <span>{t.additionalSpecs}</span>
              </h4>
              <div className="grid grid-cols-1 gap-2">
                {equipment.specs.map((spec, i) => (
                  <div key={i} className="flex items-start gap-2 bg-white py-1.5 px-3 rounded-xl border border-gray-100/50">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
                    <span className="text-xs font-semibold text-gray-700">{spec}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Verified safety card */}
          {equipment.verified && (
            <div className="bg-gradient-to-r from-emerald-50 to-green-50 rounded-2xl p-3.5 border border-emerald-100 flex items-start gap-3">
              <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <h5 className="text-[11px] font-extrabold text-emerald-800 uppercase tracking-wider">{t.verifiedOwner}</h5>
                <p className="text-[10px] text-emerald-700 mt-0.5 leading-snug">{t.verifiedDesc}</p>
              </div>
            </div>
          )}

          {/* Rate Discussion / Bargaining Card */}
          <div className="bg-emerald-50/50 rounded-2xl p-4 border border-emerald-100 flex flex-col gap-3 shadow-3xs">
            <div className="flex items-start gap-2.5">
              <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center shrink-0 text-emerald-700">
                <MessageSquare className="w-4 h-4 text-emerald-700" />
              </div>
              <div>
                <h4 className="text-xs font-black text-[#1b6d24] uppercase tracking-wider">
                  {language === 'te' ? 'యజమానితో ధర గురించి మాట్లాడండి' : 'Chat & Discuss Rental Price'}
                </h4>
                <p className="text-[10px] text-gray-500 font-semibold leading-normal mt-0.5">
                  {language === 'te'
                    ? `అద్దె తీసుకోక ముందే ధర (₹${equipment.price}/${equipment.rateTypeLabel || 'రోజుకు'}), సమయం మరియు డ్రైవర్ సదుపాయం గురించి యజమానితో చాట్ చేసి తగ్గించుకోండి.`
                    : `Inquire about rental hours, driver details, or ask for a custom price discount with the owner directly on chat.`}
                </p>
              </div>
            </div>
            <button
              onClick={() => {
                onClose();
                const rateMsg = language === 'te'
                  ? `నమస్కారం సార్! నేను మీ "${equipment.title}"ని అద్దెకు తీసుకోవాలనుకుంటున్నాను. దీని అద్దె ధర (₹${equipment.price}/${equipment.rateTypeLabel || 'రోజుకు'}) గురించి మీతో మాట్లాడాలి. కొంచెం తగ్గించగలరా?`
                  : `Hello! I am interested in renting your "${equipment.titleEn || equipment.title}". I would like to negotiate/chat about the rental rate of ₹${equipment.price}/${equipment.rateType === 'day' ? 'day' : 'hour'}.`;
                onOpenChat(
                  equipment.ownerName,
                  equipment.title,
                  equipment.id,
                  equipment.imageUrl,
                  equipment.ownerPhone,
                  equipment.ownerAvatar,
                  rateMsg
                );
              }}
              className="w-full bg-emerald-700 hover:bg-emerald-800 text-white font-extrabold text-xs py-2.5 rounded-xl flex items-center justify-center gap-1.5 transition-all shadow-3xs cursor-pointer active:scale-95"
              id="details-btn-rate-chat"
            >
              <MessageSquare className="w-4 h-4 text-white" />
              <span>{language === 'te' ? 'ధర గురించి యజమానితో చాట్ చేయండి' : 'Chat with Owner About Price'}</span>
            </button>
          </div>

          {/* Owner details widget */}
          <div className="bg-gray-50 border border-gray-100/80 rounded-2xl p-3.5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative">
                <img 
                  src={equipment.ownerAvatar} 
                  alt={equipment.ownerName} 
                  className="w-11 h-11 rounded-full object-cover border border-white shadow-xs"
                  referrerPolicy="no-referrer"
                />
                <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></span>
              </div>
              <div>
                <span className="text-[10px] text-gray-400 font-extrabold uppercase tracking-wide">
                  {language === 'te' ? 'యజమాని (Owner)' : 'Machinery Owner'}
                </span>
                <h4 className="text-xs font-bold text-gray-800 leading-tight">
                  {equipment.ownerName}
                </h4>
              </div>
            </div>

            {/* Quick action buttons for owner */}
            <div className="flex gap-1.5">
              <button 
                onClick={handleCall}
                className="w-9 h-9 rounded-full bg-white hover:bg-emerald-50 text-emerald-700 border border-gray-200 flex items-center justify-center transition-all cursor-pointer shadow-3xs"
                title={t.call}
                id="details-btn-call"
              >
                <Phone className="w-4.5 h-4.5" />
              </button>
              <button
                onClick={() => {
                  onClose();
                  onOpenChat(
                    equipment.ownerName,
                    equipment.title,
                    equipment.id,
                    equipment.imageUrl,
                    equipment.ownerPhone,
                    equipment.ownerAvatar
                  );
                }}
                className="w-9 h-9 rounded-full bg-[#1b6d24] text-white hover:bg-[#15541b] flex items-center justify-center transition-all cursor-pointer shadow-3xs"
                title={t.chat}
                id="details-btn-chat"
              >
                <MessageSquare className="w-4.5 h-4.5" />
              </button>
            </div>
          </div>

          {/* Farmer Reviews & Star Rating Section */}
          <div className="pt-2 border-t border-slate-100">
            <EquipmentReviewsSection
              equipmentId={equipment.id}
              equipmentTitle={language === 'te' ? equipment.title : (equipment.titleEn || equipment.title)}
              reviews={reviews}
              currentUser={currentUser}
              language={language}
              onReviewAdded={(updatedReviews, newAvg, totalCount) => {
                setReviews(updatedReviews);
                setCurrentRating(newAvg);
                setCurrentReviewCount(totalCount);
                if (onUpdateEquipment) {
                  onUpdateEquipment({
                    ...equipment,
                    rating: newAvg,
                    reviewCount: totalCount,
                    reviews: updatedReviews
                  });
                }
              }}
            />
          </div>

          {/* Quick Share to WhatsApp section widget */}
          <div className="bg-emerald-50/45 rounded-2xl p-3.5 border border-emerald-100 flex flex-col gap-2.5">
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-[#1b6d24] font-black uppercase tracking-wider flex items-center gap-1.5">
                <Share2 className="w-3.5 h-3.5" />
                <span>{language === 'te' ? 'ఇతరులతో పంచుకోండి' : 'Quick Share Listing'}</span>
              </span>
              <span className="text-[9px] text-[#1b6d24] bg-emerald-100/60 font-black px-2 py-0.5 rounded-full uppercase tracking-wider">
                WhatsApp
              </span>
            </div>

            <p className="text-[10.5px] text-slate-500 font-semibold leading-relaxed">
              {language === 'te' 
                ? 'ఈ అద్దె పరికరాల వివరాలను ఇతరులతో వాట్సాప్ ద్వారా సులువుగా పంచుకోవచ్చు.' 
                : 'Share this rental machinery and price details directly with neighboring farmers.'}
            </p>

            <a
              href={`https://api.whatsapp.com/send?text=${encodeURIComponent(
                language === 'te'
                  ? `*రైతు వేదిక యంత్ర సహకారం (E-Raitu Vedika)*\n\n🌾 *పరికరము:* ${equipment.title}\n💰 *అద్దె ధర:* ₹${equipment.price}/${equipment.rateTypeLabel || 'రోజుకు'}\n📍 *ప్రాంతం:* ${equipment.location}\n🧑‍🌾 *యజమాని:* ${equipment.ownerName}\n\nబుక్ చేసుకోవడానికి లేదా మరిన్ని వివరాలు చూడటానికి క్రింది లింక్‌ని ఓపెన్ చేయండి:\n🔗 ${window.location.origin}/?id=${equipment.id}`
                  : `*E-Raitu Vedika Smart Agriculture*\n\n🌾 *Equipment:* ${equipment.titleEn || equipment.title}\n💰 *Rental Price:* ₹${equipment.price}/${equipment.rateType === 'day' ? 'day' : 'hour'}\n📍 *Location:* ${equipment.locationEn || equipment.location}\n🧑‍🌾 *Owner:* ${equipment.ownerName}\n\nTo view details and book, open this link:\n🔗 ${window.location.origin}/?id=${equipment.id}`
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-2.5 px-4 bg-[#25D366] hover:bg-[#20ba5c] text-white font-black text-xs rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer shadow-3xs active:scale-98"
              id={`whatsapp-share-${equipment.id}`}
            >
              <svg 
                viewBox="0 0 24 24" 
                className="w-4.5 h-4.5 fill-current text-white shrink-0"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.335-1.662c1.746.953 3.71 1.458 5.705 1.459h.008c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413" />
              </svg>
              <span className="font-extrabold">{language === 'te' ? 'వాట్సాప్ ద్వారా పంచుకోండి' : 'Share on WhatsApp'}</span>
            </a>
          </div>

        </div>

        {/* Sticky footer actions */}
        <div className="p-4 bg-white border-t border-gray-100 gap-2.5 flex sticky bottom-0 shrink-0">
          <button
            onClick={() => {
              onClose();
              onOpenChat(
                equipment.ownerName,
                equipment.title,
                equipment.id,
                equipment.imageUrl,
                equipment.ownerPhone,
                equipment.ownerAvatar
              );
            }}
            className="flex-1 py-3 text-xs font-extrabold text-gray-700 border border-gray-200 rounded-full hover:bg-gray-50 flex items-center justify-center gap-1.5 cursor-pointer active:scale-95 transition-all"
            id="details-action-chat-large"
          >
            <MessageSquare className="w-4 h-4 text-emerald-700" />
            <span>{t.contactOwner}</span>
          </button>

          {isBooked ? (
            <button
              disabled
              className="flex-1 py-3 text-xs font-extrabold text-gray-400 bg-gray-100 rounded-full cursor-not-allowed flex items-center justify-center"
              id="details-action-booked"
            >
              {t.booked}
            </button>
          ) : isComingSoon ? (
            <button
              disabled
              className="flex-1 py-3 text-xs font-extrabold text-amber-900 bg-amber-50 rounded-full cursor-not-allowed flex items-center justify-center"
              id="details-action-soon"
            >
              {t.comingSoon}
            </button>
          ) : (
            <button
              onClick={() => {
                onClose();
                onBook(equipment.id);
              }}
              className="flex-1 py-3 text-xs font-extrabold text-white bg-[#1b6d24] hover:bg-[#15541b] rounded-full flex items-center justify-center gap-1.5 cursor-pointer shadow-sm active:scale-95 transition-all"
              id="details-action-book"
            >
              <span>{t.bookNow}</span>
              <ChevronRight className="w-4 h-4 text-white" />
            </button>
          )}
        </div>

      </div>
    </div>
  );
}
