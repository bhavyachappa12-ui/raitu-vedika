import React, { useState, useEffect } from 'react';
import { CategoryType, Equipment } from '../types';
import { X, Tractor, Sprout, ShieldAlert, Check } from 'lucide-react';
import { DISTRICTS, CATEGORIES } from '../data';

interface AddListingModalProps {
  onClose: () => void;
  onAdd: (newEquipment: Omit<Equipment, 'id' | 'status' | 'statusLabel' | 'ownerName' | 'ownerPhone' | 'ownerAvatar' | 'isCustom'>) => void;
}

const PRESET_MOCK_IMAGES = {
  tractor: 'https://www.mahindratractor.com/sites/default/files/2023-08/K2-Compact_2121_Desktop.jpg',
  harvester: 'https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEh2Okee4mQRQRbUZFRySaS_2-jmDvc_vdwlMneh9lwtIHNd-dy72he9pDQ-ck6vOh169spiy-VeRoBcOBWnYCoPglO6nUMZbjwmPx32fJ2rtJMNJhraHOc61nNXYE5dX4kGxxrbkFlpIR3u/s400/Image0553.jpg',
  sprayer: 'https://5.imimg.com/data5/BZ/ZF/KN/SELLER-82588675/agricultural-power-sprayer-500x500.jpg',
  tiller: 'https://telugu-cdn.b-cdn.net/media/bidl2zs1/whatsapp-image-2024-05-14-at-11-31-07-am.jpeg',
  rotavator: 'https://5.imimg.com/data5/SELLER/Default/2021/6/PJ/PU/PT/9782214/mahindra-gyrovator-zlx-plus-145-c-m-tractor-mounted-rotavator-1000x1000.jpg',
  transplanter: 'https://bsg-i.nbxc.com/product/b1/45/af/085312a2932c745bf0d93ce58b.jpg',
  thresher: 'https://www.mahindratractor.com/sites/default/files/2024-07/DM_Paddy_Multi_Crop_Thresher.webp',
  other: 'https://image.made-in-china.com/2f0j00KwZVJAPCiOzE/Farm-Disc-Harrow-Tractor-Implements-Middle-Duty-Disc-Harrow-20-Discs-Harrow.jpg',
};

export default function AddListingModal({ onClose, onAdd }: AddListingModalProps) {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<CategoryType>('tractor');
  const [location, setLocation] = useState('అనంతపురము');
  const [price, setPrice] = useState('');
  const [rateType, setRateType] = useState<'day' | 'hour'>('hour');
  const [description, setDescription] = useState('');
  
  // Custom states for error messages
  const [errors, setErrors] = useState<{ title?: string; price?: string }>({});

  // Auto set hourly rate for tractor/harvester/sprayer
  useEffect(() => {
    if (category === 'tractor' || category === 'harvester' || category === 'sprayer') {
      setRateType('hour');
    } else {
      setRateType('day');
    }
  }, [category]);

  const validateForm = () => {
    const newErrors: { title?: string; price?: string } = {};
    if (!title.trim()) {
      newErrors.title = 'పరికరం పేరు తప్పనిసరి!';
    }
    const numPrice = Number(price);
    if (!price || isNaN(numPrice) || numPrice <= 0) {
      newErrors.price = 'చెల్లుబాటయ్యే అద్దె ధరను నమోదు చేయండి!';
    } else if (category === 'tractor' && rateType === 'hour' && numPrice < 1000) {
      newErrors.price = 'ట్రాక్టర్ కనీస రేటు గంటకు కనీసం ₹1000 ఉండాలి!';
    } else if (category === 'sprayer' && rateType === 'hour' && numPrice > 1500) {
      newErrors.price = 'స్ప్రేయర్ గంట రేటు ₹1500 కంటే లోపు నమోదు చేయండి!';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    onAdd({
      title: title.trim(),
      titleEn: title.trim(), // simple mirror for translation ease
      category,
      categoryLabel: CATEGORIES.find(c => c.id === category)?.label || 'ఇతరాలు',
      location,
      locationEn: (() => {
        const match = (location || "").match(/\(([^)]+)\)/);
        return match ? match[1] : location;
      })(),
      price: Number(price),
      rateType,
      rateTypeLabel: rateType === 'day' ? 'రోజు' : 'గంట',
      imageUrl: PRESET_MOCK_IMAGES[category] || PRESET_MOCK_IMAGES['other'],
      description: description.trim() || 'పొలం పనుల కోసం సిద్ధంగా ఉంది.'
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-end justify-center p-0">
      <div className="bg-white w-full max-w-md rounded-t-[2.5rem] p-6 pb-8 shadow-2xl relative animate-slide-up flex flex-col max-h-[90vh] overflow-y-auto">
        
        {/* Header Drag Bar indicator */}
        <div className="w-12 h-1 bg-gray-200 rounded-full mx-auto mb-5"></div>

        {/* Header Title Controls */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-extrabold text-gray-800 tracking-tight">అద్దె పరికరాన్ని చేర్చండి</h3>
            <p className="text-[11px] text-gray-400 font-semibold mt-0.5 uppercase tracking-wider">కొత్త యంత్రం వివరాలు</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 bg-gray-50 border border-gray-100 rounded-full hover:bg-gray-100 transition-colors focus:outline-none"
            id="btn-close-modal"
          >
            <X className="w-4 h-4 text-gray-500" />
          </button>
        </div>

        {/* Input Form with high readability labels */}
        <form onSubmit={handleSubmit} className="space-y-4 flex-1">
          {/* Label strictly on top of field */}
          <div className="flex flex-col">
            <label className="text-[11px] font-extrabold text-[#1b6d24] mb-1 uppercase tracking-wider">
              పరికరం అద్దె వర్గం (Category) *
            </label>
            <div className="grid grid-cols-3 gap-2.5">
              {CATEGORIES.map((cat) => {
                const isSelected = category === cat.id;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setCategory(cat.id as CategoryType)}
                    className={`py-2.5 px-2 rounded-xl border text-center transition-all flex flex-col items-center justify-center cursor-pointer ${
                      isSelected
                        ? 'bg-[#1b6d24]/5 border-[#1b6d24] text-[#1b6d24] font-extrabold shadow-3xs'
                        : 'bg-white border-gray-200 text-gray-500 hover:bg-gray-50 font-semibold'
                    }`}
                    id={`modal-select-category-${cat.id}`}
                  >
                    <span className="text-xs">{cat.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Device Title Input */}
          <div className="flex flex-col">
            <label className="text-[11px] font-extrabold text-[#1b6d24] mb-1.5 uppercase tracking-wider">
              పరికరం/యంత్రం పేరు (Machine Name) *
            </label>
            <input
              type="text"
              placeholder="ఉదా: జాన్ డీర్ ట్రాక్టర్ 50HP"
              className={`w-full bg-gray-50 border px-4 py-3 rounded-xl font-medium text-xs text-gray-850 focus:outline-none focus:ring-1 focus:ring-[#1b6d24] focus:bg-white transition-all ${
                errors.title ? 'border-red-400 bg-red-50/10' : 'border-gray-200'
              }`}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              id="input-modal-title"
            />
            {errors.title && (
              <p className="text-[10px] text-red-500 font-semibold mt-1 px-1 flex items-center gap-1">
                <ShieldAlert className="w-3.5 h-3.5" /> {errors.title}
              </p>
            )}
          </div>

          {/* Pricing Details */}
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col">
              <label className="text-[11px] font-extrabold text-[#1b6d24] mb-1.5 uppercase tracking-wider">
                అద్దె ధర (Rental Charge in ₹) *
              </label>
              <input
                type="number"
                placeholder="ఉదా: 1500"
                className={`w-full bg-gray-50 border px-4 py-3 rounded-xl font-semibold text-xs text-gray-850 focus:outline-none focus:ring-1 focus:ring-[#1b6d24] focus:bg-white transition-all ${
                  errors.price ? 'border-red-400 bg-red-50/10' : 'border-gray-250'
                }`}
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                id="input-modal-price"
              />
              {errors.price && (
                <p className="text-[10px] text-red-500 font-semibold mt-1 px-1 flex items-center gap-1">
                  <ShieldAlert className="w-3.5 h-3.5" /> {errors.price}
                </p>
              )}
            </div>

            <div className="flex flex-col">
              <label className="text-[11px] font-extrabold text-[#1b6d24] mb-1.5 uppercase tracking-wider">
                అద్దె నమూనా (Rental Rate Type) *
              </label>
              <div className="grid grid-cols-2 border border-gray-200 rounded-xl overflow-hidden mt-0.5">
                <button
                  type="button"
                  onClick={() => setRateType('day')}
                  className={`py-3 text-xs font-bold text-center border-r border-gray-150 cursor-pointer ${
                    rateType === 'day'
                      ? 'bg-[#1b6d24] text-white'
                      : 'bg-gray-50 text-gray-500 hover:bg-gray-100'
                  }`}
                  id="modal-select-rate-day"
                >
                  రోజులవారీ
                </button>
                <button
                  type="button"
                  onClick={() => setRateType('hour')}
                  className={`py-3 text-xs font-bold text-center cursor-pointer ${
                    rateType === 'hour'
                      ? 'bg-[#1b6d24] text-white'
                      : 'bg-gray-50 text-gray-500 hover:bg-gray-100'
                  }`}
                  id="modal-select-rate-hour"
                >
                  గంటకు
                </button>
              </div>
            </div>
          </div>

          {/* Location Area selection */}
          <div className="flex flex-col">
            <label className="text-[11px] font-extrabold text-[#1b6d24] mb-1.5 uppercase tracking-wider">
              అందుబాటులో ఉన్న ప్రాంతం (District / Town) *
            </label>
            <select
              className="w-full bg-gray-50 border border-gray-200 px-4 py-3 rounded-xl font-bold text-xs text-gray-700 focus:outline-none focus:ring-1 focus:ring-[#1b6d24] focus:bg-white transition-all cursor-pointer"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              id="select-modal-location"
            >
              {DISTRICTS.filter(d => d !== 'అన్నీ').map((district) => (
                <option key={district} value={district}>
                  {district}
                </option>
              ))}
            </select>
          </div>

          {/* Description */}
          <div className="flex flex-col">
            <label className="text-[11px] font-extrabold text-[#1b6d24] mb-1.5 uppercase tracking-wider">
              అదనపు వివరాలు (Description Details)
            </label>
            <textarea
              placeholder="మరింత సమాచారం లేదా కండిషన్ల వివరాలు రాయండి..."
              rows={3}
              className="w-full bg-gray-50 border border-gray-200 px-4 py-3 rounded-xl font-medium text-xs text-gray-800 focus:outline-none focus:ring-1 focus:ring-[#1b6d24] focus:bg-white transition-all resize-none"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              id="textarea-modal-description"
            ></textarea>
          </div>

          {/* Preset image banner indicator */}
          <div className="bg-emerald-50/60 rounded-xl p-3 border border-emerald-100 flex items-center gap-3">
            <img
              src={PRESET_MOCK_IMAGES[category]}
              alt="preset-preview"
              className="w-12 h-12 rounded-lg object-cover border border-emerald-200 shadow-3xs"
              referrerPolicy="no-referrer"
            />
            <div className="flex-1 min-w-0">
              <span className="text-[10px] bg-emerald-100 text-[#1b6d24] font-extrabold px-2 py-0.5 rounded-full inline-block mb-1">
                ఆటో-పిక్చర్
              </span>
              <p className="text-[10.5px] text-emerald-800 leading-snug font-bold">
                ఈ లిస్టింగ్ కోసం వృత్తిపరమైన హై-రిజల్యూషన్ ఫోటో అటాచ్ చేయబడింది.
              </p>
            </div>
          </div>

          {/* CTA Submit Button */}
          <button
            type="submit"
            className="w-full bg-[#1b6d24] hover:bg-[#15541b] text-white py-3.5 rounded-xl font-bold text-xs tracking-wider uppercase mt-3 hover:translate-y-[-1px] transition-all shadow-md focus:outline-none flex items-center justify-center gap-1.5 cursor-pointer"
            id="btn-modal-submit"
          >
            <Check className="w-4 h-4 text-white" /> యంత్రం లిస్టింగ్‌ను జోడించు
          </button>
        </form>
      </div>
    </div>
  );
}
