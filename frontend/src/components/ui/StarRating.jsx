import { Star } from 'lucide-react';

export default function StarRating({ value, onChange, readonly = false, size = 20 }) {
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          disabled={readonly}
          onClick={() => onChange?.(star)}
          className={`transition-transform ${!readonly ? 'hover:scale-110 active:scale-95' : 'cursor-default'}`}
        >
          <Star
            size={size}
            className={star <= value ? 'text-amber-400 fill-amber-400' : 'text-cream-400'}
          />
        </button>
      ))}
    </div>
  );
}
