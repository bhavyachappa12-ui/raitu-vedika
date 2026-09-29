import React from 'react';
import { Star } from 'lucide-react';

interface StarRatingProps {
  rating: number; // e.g. 4.8
  reviewCount?: number;
  size?: 'xs' | 'sm' | 'md' | 'lg';
  showCount?: boolean;
  showScore?: boolean;
  className?: string;
  onClick?: () => void;
  language?: 'te' | 'en';
}

export const StarRating: React.FC<StarRatingProps> = ({
  rating,
  reviewCount,
  size = 'sm',
  showCount = true,
  showScore = true,
  className = '',
  onClick,
  language = 'te'
}) => {
  const safeRating = Math.max(0, Math.min(5, Number(rating) || 0));
  const roundedRating = Number(safeRating.toFixed(1));

  // Size mappings
  const iconSizes = {
    xs: 'w-3 h-3',
    sm: 'w-3.5 h-3.5',
    md: 'w-4 h-4',
    lg: 'w-5 h-5'
  };

  const textSizes = {
    xs: 'text-[10px]',
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base'
  };

  const subTextSizes = {
    xs: 'text-[9px]',
    sm: 'text-[10px]',
    md: 'text-xs',
    lg: 'text-sm'
  };

  return (
    <div
      onClick={onClick}
      className={`inline-flex items-center gap-1.5 ${onClick ? 'cursor-pointer hover:opacity-85 transition-opacity' : ''} ${className}`}
      title={`${roundedRating} out of 5 stars (${reviewCount || 0} reviews)`}
    >
      {/* 5-star graphical icons with fractional fill visualization */}
      <div className="flex items-center gap-0.5" aria-hidden="true">
        {[1, 2, 3, 4, 5].map((starIndex) => {
          const fillPercentage = Math.max(0, Math.min(100, (safeRating - (starIndex - 1)) * 100));

          return (
            <div key={starIndex} className="relative inline-block">
              {/* Background empty star */}
              <Star className={`${iconSizes[size]} text-amber-200 fill-amber-100/60`} />
              {/* Foreground filled star with clip width */}
              {fillPercentage > 0 && (
                <div
                  className="absolute top-0 left-0 overflow-hidden"
                  style={{ width: `${fillPercentage}%` }}
                >
                  <Star className={`${iconSizes[size]} text-amber-500 fill-amber-400`} />
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Numerical score */}
      {showScore && (
        <span className={`font-black text-slate-800 tracking-tight leading-none ${textSizes[size]}`}>
          {roundedRating.toFixed(1)}
        </span>
      )}

      {/* Review count badge */}
      {showCount && reviewCount !== undefined && reviewCount > 0 && (
        <span className={`font-semibold text-slate-450 leading-none ${subTextSizes[size]}`}>
          ({reviewCount})
        </span>
      )}
    </div>
  );
};

interface StarRatingInputProps {
  value: number;
  onChange: (rating: number) => void;
  size?: 'md' | 'lg';
  language?: 'te' | 'en';
}

export const StarRatingInput: React.FC<StarRatingInputProps> = ({
  value,
  onChange,
  size = 'lg',
  language = 'te'
}) => {
  const [hoverRating, setHoverRating] = React.useState<number | null>(null);

  const activeRating = hoverRating !== null ? hoverRating : value;

  const starLabels: Record<number, { te: string; en: string; color: string }> = {
    1: { te: 'బాగాలేదు (Poor)', en: 'Poor Experience', color: 'text-red-500' },
    2: { te: 'పర్వాలేదు (Fair)', en: 'Fair Experience', color: 'text-orange-500' },
    3: { te: 'బాగుంది (Good)', en: 'Good Performance', color: 'text-amber-500' },
    4: { te: 'చాలా బాగుంది (Very Good)', en: 'Very Good Quality', color: 'text-lime-600' },
    5: { te: 'అద్భుతం! (Excellent)', en: 'Outstanding / Top Quality', color: 'text-emerald-700' }
  };

  const iconClass = size === 'lg' ? 'w-8 h-8' : 'w-6 h-6';

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="flex items-center gap-2" role="radiogroup" aria-label="Rating">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => onChange(star)}
            onMouseEnter={() => setHoverRating(star)}
            onMouseLeave={() => setHoverRating(null)}
            className="p-1 cursor-pointer transition-transform duration-150 hover:scale-115 focus:outline-none focus:scale-115 active:scale-95"
            aria-label={`${star} star`}
            id={`star-input-btn-${star}`}
          >
            <Star
              className={`${iconClass} transition-colors ${
                star <= activeRating
                  ? 'text-amber-400 fill-amber-400 drop-shadow-xs'
                  : 'text-slate-200 fill-slate-100 hover:text-amber-200'
              }`}
            />
          </button>
        ))}
      </div>

      {/* Dynamic description label */}
      <div className="h-6 flex items-center justify-center">
        {activeRating > 0 ? (
          <span className={`text-xs font-black px-2.5 py-0.5 rounded-full bg-slate-100 ${starLabels[activeRating]?.color || 'text-slate-700'}`}>
            {language === 'te' ? starLabels[activeRating]?.te : starLabels[activeRating]?.en}
          </span>
        ) : (
          <span className="text-[11px] text-slate-400 font-semibold">
            {language === 'te' ? 'స్టార్ రేటింగ్ ఎంచుకోండి (1 నుండి 5)' : 'Select a rating (1 to 5 stars)'}
          </span>
        )}
      </div>
    </div>
  );
};
