import React, { useState } from 'react';
import { EquipmentReview, FarmerProfile } from '../types';
import { StarRating, StarRatingInput } from './StarRating';
import { calculateRatingSummary, saveNewReview } from '../reviewData';
import { MessageSquare, Star, CheckCircle, PlusCircle, UserCheck, Sparkles, Send, ShieldCheck, ThumbsUp } from 'lucide-react';

interface EquipmentReviewsSectionProps {
  equipmentId: string;
  equipmentTitle: string;
  reviews: EquipmentReview[];
  onReviewAdded?: (updatedReviews: EquipmentReview[], newAverage: number, totalCount: number) => void;
  currentUser?: FarmerProfile | null;
  language: 'te' | 'en';
}

export const EquipmentReviewsSection: React.FC<EquipmentReviewsSectionProps> = ({
  equipmentId,
  equipmentTitle,
  reviews,
  onReviewAdded,
  currentUser,
  language
}) => {
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [farmerName, setFarmerName] = useState(currentUser?.name || '');
  const [farmerLocation, setFarmerLocation] = useState(
    currentUser?.village || currentUser?.district || currentUser?.location || ''
  );
  const [rentalPurpose, setRentalPurpose] = useState('దుక్కి (Plowing / Tillage)');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [helpfulLiked, setHelpfulLiked] = useState<Record<string, boolean>>({});

  const summary = calculateRatingSummary(reviews);

  const rentalPurposes = [
    { te: 'దుక్కి / రోటవేటర్ (Plowing / Tillage)', en: 'Plowing / Rotavator' },
    { te: 'వరి కోత & నూర్పిడి (Harvesting & Threshing)', en: 'Harvesting & Threshing' },
    { te: 'వరి నాట్లు (Paddy Transplanting)', en: 'Paddy Transplanting' },
    { te: 'మందు పిచికారీ (Crop Spraying)', en: 'Crop Spraying' },
    { te: 'ట్రాలీ రవాణా (Transport / Hauling)', en: 'Crop Transport / Hauling' },
    { te: 'తోట సాగు పనులు (Orchard Maintenance)', en: 'Orchard Maintenance' }
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment.trim()) {
      alert(language === 'te' ? 'దయచేసి మీ అనుభవాన్ని రాయండి' : 'Please provide comments on your rental experience');
      return;
    }

    setIsSubmitting(true);

    const displayName = farmerName.trim() || currentUser?.name || (language === 'te' ? 'రైతు సోదరుడు' : 'Fellow Farmer');
    const displayLoc = farmerLocation.trim() || currentUser?.village || currentUser?.location || (language === 'te' ? 'ఆంధ్రప్రదేశ్' : 'Andhra Pradesh');

    setTimeout(() => {
      const result = saveNewReview({
        equipmentId,
        farmerName: displayName,
        farmerPhone: currentUser?.phone || '',
        farmerId: currentUser?.id || currentUser?.uid || 'farmer_guest',
        farmerLocation: displayLoc,
        rating,
        comment: comment.trim(),
        rentalExperience: rentalPurpose,
        verifiedRental: true
      });

      setIsSubmitting(false);
      setComment('');
      setShowReviewForm(false);
      setSuccessMessage(
        language === 'te' 
          ? 'మీ రివ్యూ విజయవంతంగా నమోదయింది! ధన్యవాదాలు.' 
          : 'Thank you! Your equipment review was successfully submitted.'
      );

      if (onReviewAdded) {
        onReviewAdded(result.updatedReviews.filter(r => r.equipmentId === equipmentId), result.newAverage, result.totalReviews);
      }

      setTimeout(() => setSuccessMessage(''), 5000);
    }, 400);
  };

  const toggleHelpful = (id: string) => {
    setHelpfulLiked(prev => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div className="space-y-4" id={`reviews-section-${equipmentId}`}>
      {/* Section Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center text-amber-700">
            <Star className="w-4 h-4 fill-amber-400 text-amber-500" />
          </div>
          <div>
            <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider">
              {language === 'te' ? 'రైతుల రేటింగ్‌లు & సమీక్షలు' : 'Farmer Reviews & Ratings'}
            </h3>
            <p className="text-[10px] text-slate-400 font-semibold">
              {language === 'te' 
                ? 'అద్దె తీసుకున్న రైతులు పంచుకున్న వాస్తవ అనుభవాలు' 
                : 'Verified rental feedback from neighboring farmers'}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setShowReviewForm(!showReviewForm)}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-[#1b6d24] bg-emerald-50 hover:bg-emerald-100 rounded-xl border border-emerald-200 transition-all cursor-pointer shadow-3xs active:scale-95"
          id="btn-toggle-add-review"
        >
          <PlusCircle className="w-3.5 h-3.5 text-[#1b6d24]" />
          <span>{showReviewForm ? (language === 'te' ? 'రద్దు' : 'Cancel') : (language === 'te' ? 'రివ్యూ రాయండి' : 'Write Review')}</span>
        </button>
      </div>

      {/* Success Notification Alert */}
      {successMessage && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center gap-2 text-xs font-extrabold text-[#1b6d24] animate-fade-in shadow-3xs">
          <CheckCircle className="w-4 h-4 text-[#1b6d24] shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* Rating Breakdown Card */}
      <div className="bg-gradient-to-br from-amber-50/70 via-slate-50 to-emerald-50/30 rounded-2xl p-4 border border-amber-200/60 shadow-3xs">
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-center">
          
          {/* Big Score Block */}
          <div className="sm:col-span-5 flex flex-col items-center justify-center p-3 bg-white rounded-xl border border-amber-100 shadow-3xs text-center">
            <span className="text-3xl font-black text-slate-800 leading-none tracking-tight">
              {summary.average.toFixed(1)}
            </span>
            <div className="mt-1.5">
              <StarRating rating={summary.average} reviewCount={summary.count} size="md" showCount={false} showScore={false} />
            </div>
            <span className="text-[11px] font-bold text-slate-500 mt-1">
              {summary.count} {language === 'te' ? 'రైతు సమీక్షలు' : 'verified reviews'}
            </span>
            <span className="text-[9.5px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 mt-1.5 flex items-center gap-1">
              <ShieldCheck className="w-3 h-3 text-emerald-600" />
              <span>{language === 'te' ? '100% అసలైన రైతులు' : '100% Genuine Renters'}</span>
            </span>
          </div>

          {/* Star Bar Distribution */}
          <div className="sm:col-span-7 space-y-1.5">
            {[5, 4, 3, 2, 1].map((stars) => {
              const count = summary.breakdown[stars] || 0;
              const percentage = summary.count > 0 ? Math.round((count / summary.count) * 100) : (stars >= 4 ? 60 : 0);

              return (
                <div key={stars} className="flex items-center gap-2 text-xs">
                  <span className="w-6 text-[10px] font-bold text-slate-500 text-right flex items-center justify-end gap-0.5">
                    {stars} <Star className="w-2.5 h-2.5 fill-amber-400 text-amber-400" />
                  </span>
                  <div className="flex-1 h-2 bg-slate-200/70 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-amber-400 rounded-full transition-all duration-500"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                  <span className="w-8 text-[10px] font-bold text-slate-400 text-right">
                    {count}
                  </span>
                </div>
              );
            })}
          </div>

        </div>
      </div>

      {/* Review Submission Form */}
      {showReviewForm && (
        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-2xl p-4.5 border-2 border-emerald-500/30 shadow-md space-y-4 animate-scale-up"
          id="equipment-review-form"
        >
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <div className="flex items-center gap-1.5 text-xs font-black text-slate-800">
              <Sparkles className="w-4 h-4 text-amber-500" />
              <span>{language === 'te' ? 'మీ అద్దె అనుభవాన్ని రేట్ చేయండి' : 'Rate Your Rental Experience'}</span>
            </div>
            <span className="text-[10px] font-mono text-[#1b6d24] font-bold bg-emerald-50 px-2 py-0.5 rounded">
              {equipmentTitle}
            </span>
          </div>

          {/* Interactive Star Picker */}
          <div className="p-3 bg-slate-50/80 rounded-xl border border-slate-200/70 flex flex-col items-center">
            <label className="text-[11px] font-extrabold text-slate-600 mb-2">
              {language === 'te' ? 'ఈ యంత్రానికి ఎన్ని స్టార్స్ ఇస్తారు?' : 'How would you rate this equipment?'}
            </label>
            <StarRatingInput value={rating} onChange={setRating} size="lg" language={language} />
          </div>

          {/* Rental Work Type Selector */}
          <div>
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5">
              {language === 'te' ? 'ఏ పని కోసం అద్దెకు తీసుకున్నారు?' : 'What agricultural task did you rent for?'}
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
              {rentalPurposes.map((item) => (
                <button
                  key={item.en}
                  type="button"
                  onClick={() => setRentalPurpose(language === 'te' ? item.te : item.en)}
                  className={`text-left p-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                    rentalPurpose === (language === 'te' ? item.te : item.en)
                      ? 'bg-emerald-50 border-emerald-500 text-emerald-800 shadow-3xs'
                      : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {language === 'te' ? item.te : item.en}
                </button>
              ))}
            </div>
          </div>

          {/* Review Comment Textarea */}
          <div>
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5">
              {language === 'te' ? 'మీ అనుభవం మరియు అభిప్రాయం (Review Comment)' : 'Detailed Feedback & Experience'}
            </label>
            <textarea
              rows={3}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder={
                language === 'te'
                  ? 'యంత్రం పనితీరు ఎలా ఉంది? డీజిల్ వినియోగం, ఇంజిన్ కండిషన్, సమయపాలన మరియు యజమాని సహకారం గురించి ఇతర రైతులకు ఉపయోగపడేలా రాయండి...'
                  : 'Describe machine condition, fuel efficiency, operator timeliness, and ease of work for other farmers...'
              }
              required
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs font-medium text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-[#1b6d24] focus:bg-white resize-none"
              id="review-comment-textarea"
            />
          </div>

          {/* Reviewer Name and Location fields */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <div>
              <label className="text-[9.5px] font-bold text-slate-400 block mb-1">
                {language === 'te' ? 'మీ పేరు (Farmer Name)' : 'Your Name'}
              </label>
              <input
                type="text"
                value={farmerName}
                onChange={(e) => setFarmerName(e.target.value)}
                placeholder={language === 'te' ? 'ఉదా: వెంకటేశ్వర రావు' : 'e.g. Venkateswara Rao'}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs font-bold text-slate-700 focus:outline-none focus:border-[#1b6d24]"
                id="review-farmer-name"
              />
            </div>
            <div>
              <label className="text-[9.5px] font-bold text-slate-400 block mb-1">
                {language === 'te' ? 'గ్రామం / మండలం (Location)' : 'Village / District'}
              </label>
              <input
                type="text"
                value={farmerLocation}
                onChange={(e) => setFarmerLocation(e.target.value)}
                placeholder={language === 'te' ? 'ఉదా: పాయకరావుపేట' : 'e.g. Payakaraopeta'}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs font-bold text-slate-700 focus:outline-none focus:border-[#1b6d24]"
                id="review-farmer-location"
              />
            </div>
          </div>

          {/* Submit Action */}
          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setShowReviewForm(false)}
              className="py-2.5 px-4 rounded-xl text-xs font-bold text-slate-500 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              {language === 'te' ? 'రద్దు' : 'Cancel'}
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !comment.trim()}
              className="py-2.5 px-5 bg-[#1b6d24] hover:bg-[#15541b] disabled:bg-slate-200 disabled:text-slate-400 text-white text-xs font-black rounded-xl flex items-center gap-1.5 transition-all shadow-3xs cursor-pointer active:scale-95"
              id="submit-review-btn"
            >
              <Send className="w-3.5 h-3.5 text-white" />
              <span>{isSubmitting ? (language === 'te' ? 'సమర్పిస్తోంది...' : 'Submitting...') : (language === 'te' ? 'రివ్యూ సమర్పించండి' : 'Submit Review')}</span>
            </button>
          </div>
        </form>
      )}

      {/* Reviews List */}
      <div className="space-y-3">
        {reviews.length === 0 ? (
          <div className="p-6 bg-slate-50 rounded-2xl text-center border border-slate-200/60">
            <MessageSquare className="w-8 h-8 text-slate-300 mx-auto mb-2" />
            <p className="text-xs font-extrabold text-slate-600">
              {language === 'te' ? 'ఇంకా రివ్యూలు రాలేదు' : 'No reviews submitted yet'}
            </p>
            <p className="text-[10.5px] text-slate-400 mt-0.5">
              {language === 'te'
                ? 'ఈ యంత్రాన్ని అద్దెకు తీసుకున్న మొదటి రైతుగా మీ సమీక్షను అందించండి!'
                : 'Be the first farmer to share your rental experience!'}
            </p>
            <button
              type="button"
              onClick={() => setShowReviewForm(true)}
              className="mt-3 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black rounded-xl transition-all cursor-pointer shadow-3xs"
            >
              {language === 'te' ? 'మొదటి రివ్యూ రాయండి' : 'Write the First Review'}
            </button>
          </div>
        ) : (
          reviews.map((rev) => (
            <div
              key={rev.id}
              className="bg-white rounded-2xl p-4 border border-slate-150 shadow-3xs hover:border-emerald-200 transition-all space-y-2"
              id={`review-item-${rev.id}`}
            >
              {/* Header: Farmer name, rating & date */}
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-black text-slate-800">
                      {rev.farmerName}
                    </span>
                    {rev.verifiedRental && (
                      <span className="inline-flex items-center gap-0.5 text-[8.5px] font-black text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200 uppercase tracking-wide">
                        <UserCheck className="w-2.5 h-2.5 text-emerald-600" />
                        <span>{language === 'te' ? 'ధృవీకరించిన అద్దె' : 'Verified Renter'}</span>
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-[10px] text-slate-400 font-semibold mt-0.5">
                    {rev.farmerLocation && <span>📍 {rev.farmerLocation}</span>}
                    <span>• {rev.createdAt}</span>
                  </div>
                </div>

                <div className="flex items-center gap-1 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                  <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                  <span className="text-xs font-black text-amber-900">{rev.rating}.0</span>
                </div>
              </div>

              {/* Rental experience tag */}
              {rev.rentalExperience && (
                <div className="inline-block bg-slate-100 text-slate-600 text-[9.5px] font-bold px-2 py-0.5 rounded-md">
                  🌾 {rev.rentalExperience}
                </div>
              )}

              {/* Comment text */}
              <p className="text-xs text-slate-700 font-medium leading-relaxed bg-slate-50/50 rounded-xl p-2.5 border border-slate-100">
                "{rev.comment}"
              </p>

              {/* Helpful footer */}
              <div className="flex items-center justify-between pt-1 text-[10px] text-slate-400 font-bold">
                <span>{language === 'te' ? 'రైతు వేదిక ధృవీకరణ' : 'Raitu Vedika Verified'}</span>
                <button
                  type="button"
                  onClick={() => toggleHelpful(rev.id)}
                  className={`inline-flex items-center gap-1 px-2 py-0.5 rounded transition-colors cursor-pointer ${
                    helpfulLiked[rev.id]
                      ? 'text-emerald-700 bg-emerald-50 font-black'
                      : 'text-slate-450 hover:text-slate-700'
                  }`}
                  id={`helpful-btn-${rev.id}`}
                >
                  <ThumbsUp className={`w-3 h-3 ${helpfulLiked[rev.id] ? 'fill-emerald-600 text-emerald-600' : ''}`} />
                  <span>{helpfulLiked[rev.id] ? (language === 'te' ? 'సహాయకరమైనది (1)' : 'Helpful (1)') : (language === 'te' ? 'సహాయపడింది' : 'Helpful')}</span>
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
