import { useState } from 'react';
import { api } from '../api';

function StarRating({ value, onChange }) {
  const [hovered, setHovered] = useState(0);
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => onChange(star === value ? null : star)}
          onMouseEnter={() => setHovered(star)}
          onMouseLeave={() => setHovered(0)}
          className="text-3xl transition-transform hover:scale-110 focus:outline-none"
        >
          <span className={star <= (hovered || value || 0) ? 'text-yellow-400' : 'text-gray-600'}>
            ★
          </span>
        </button>
      ))}
    </div>
  );
}

export default function AddToLibraryModal({ item, onClose, onAdded }) {
  const [rating, setRating] = useState(null);
  const [isLiked, setIsLiked] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSave() {
    setLoading(true);
    setError('');
    try {
      const { item: created } = await api.addToLibrary({
        tmdbId: item.tmdbId,
        type: item.type,
        title: item.title,
        posterPath: item.posterPath,
      });
      if (rating !== null || isLiked) {
        await api.updateLibraryItem(created.id, {
          ...(rating !== null && { rating }),
          ...(isLiked && { isLiked }),
        });
      }
      onAdded();
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm px-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-gray-900 border border-gray-700 rounded-2xl w-full max-w-sm shadow-2xl overflow-hidden">
        {/* Poster header */}
        <div className="relative h-40 bg-gray-800">
          {item.posterPath ? (
            <img src={item.posterPath} alt={item.title} className="w-full h-full object-cover opacity-40" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-600 text-5xl">🎬</div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-gray-900 to-transparent" />
          <div className="absolute bottom-4 left-5 right-5">
            <span className="text-xs font-bold text-violet-400 uppercase tracking-widest">
              {item.type}
            </span>
            <h2 className="text-white font-bold text-lg leading-tight mt-0.5 line-clamp-2">
              {item.title}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="absolute top-3 right-3 text-gray-400 hover:text-white bg-black/40 rounded-full w-7 h-7 flex items-center justify-center transition"
          >
            ✕
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Like */}
          <div className="flex items-center justify-between">
            <span className="text-gray-300 font-medium">Add to Favourites</span>
            <button
              type="button"
              onClick={() => setIsLiked((v) => !v)}
              className={`text-3xl transition-transform hover:scale-110 focus:outline-none ${
                isLiked ? 'text-red-500' : 'text-gray-600'
              }`}
            >
              {isLiked ? '♥' : '♡'}
            </button>
          </div>

          {/* Rating */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-gray-300 font-medium">Your Rating</span>
              {rating && (
                <button
                  onClick={() => setRating(null)}
                  className="text-xs text-gray-500 hover:text-gray-300 transition"
                >
                  Clear
                </button>
              )}
            </div>
            <StarRating value={rating} onChange={setRating} />
          </div>

          {error && (
            <p className="text-red-400 text-sm bg-red-400/10 border border-red-400/20 rounded-lg px-3 py-2">
              {error}
            </p>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-1">
            <button
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl border border-gray-700 text-gray-400 hover:text-white hover:border-gray-500 transition text-sm font-semibold"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={loading}
              className="flex-1 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 disabled:opacity-50 text-white font-semibold text-sm transition"
            >
              {loading ? 'Saving…' : 'Add to Library'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
