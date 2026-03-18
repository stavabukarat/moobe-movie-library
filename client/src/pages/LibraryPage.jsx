import { useState, useEffect, useCallback } from 'react';
import { api } from '../api';

const FILTERS = [
  { key: 'all', label: 'All' },
  { key: 'Movie', label: 'Movies' },
  { key: 'TV', label: 'TV Shows' },
  { key: 'liked', label: '♥ Favourites' },
];

function StarDisplay({ rating }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <span key={s} className={`text-sm ${s <= rating ? 'text-yellow-400' : 'text-gray-700'}`}>
          ★
        </span>
      ))}
    </div>
  );
}

function LibraryCard({ item, onUpdate }) {
  const [isLiked, setIsLiked] = useState(item.isLiked);
  const [rating, setRating] = useState(item.rating);
  const [hovered, setHovered] = useState(0);
  const [saving, setSaving] = useState(false);

  async function patch(data) {
    setSaving(true);
    try {
      const { item: updated } = await api.updateLibraryItem(item.id, data);
      setIsLiked(updated.isLiked);
      setRating(updated.rating);
      onUpdate(updated);
    } finally {
      setSaving(false);
    }
  }

  function handleStarClick(star) {
    const newRating = star === rating ? null : star;
    setRating(newRating);
    patch({ rating: newRating });
  }

  function handleLikeClick() {
    const next = !isLiked;
    setIsLiked(next);
    patch({ isLiked: next });
  }

  return (
    <div className="group bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden flex flex-col hover:border-gray-700 transition-all duration-300">
      {/* Poster */}
      <div className="relative aspect-[2/3] bg-gray-800 overflow-hidden">
        {item.posterPath ? (
          <img
            src={item.posterPath}
            alt={item.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-600 text-5xl">
            🎬
          </div>
        )}
        <div className="absolute top-2 left-2">
          <span className="text-xs font-bold bg-black/60 backdrop-blur-sm text-violet-400 rounded-full px-2.5 py-1 border border-violet-500/30">
            {item.type}
          </span>
        </div>
        {/* Like button overlay */}
        <button
          onClick={handleLikeClick}
          disabled={saving}
          className={`absolute top-2 right-2 w-8 h-8 flex items-center justify-center rounded-full bg-black/60 backdrop-blur-sm transition-all ${
            isLiked ? 'text-red-500' : 'text-gray-500 opacity-0 group-hover:opacity-100'
          }`}
        >
          {isLiked ? '♥' : '♡'}
        </button>
      </div>

      {/* Info */}
      <div className="p-4 flex flex-col flex-1">
        <h3 className="font-semibold text-white text-sm leading-snug line-clamp-2 mb-3">
          {item.title}
        </h3>
        <div className="mt-auto">
          {/* Inline star rating */}
          <div className="flex gap-0.5">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => handleStarClick(star)}
                onMouseEnter={() => setHovered(star)}
                onMouseLeave={() => setHovered(0)}
                disabled={saving}
                className={`text-lg transition-transform hover:scale-110 focus:outline-none disabled:cursor-not-allowed ${
                  star <= (hovered || rating || 0) ? 'text-yellow-400' : 'text-gray-700'
                }`}
              >
                ★
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LibraryPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('all');

  const fetchLibrary = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = await api.getLibrary();
      setItems(data.items);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLibrary();
  }, [fetchLibrary]);

  function handleUpdate(updated) {
    setItems((prev) => prev.map((i) => (i.id === updated.id ? updated : i)));
  }

  const filtered = items.filter((item) => {
    if (filter === 'liked') return item.isLiked;
    if (filter === 'all') return true;
    return item.type === filter;
  });

  return (
    <div className="min-h-screen bg-gray-950 px-4 py-10">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h2 className="text-3xl font-black text-white">My Library</h2>
            <p className="text-gray-500 text-sm mt-1">
              {items.length} {items.length === 1 ? 'title' : 'titles'} saved
            </p>
          </div>

          {/* Filter tabs */}
          <div className="flex bg-gray-900 border border-gray-800 rounded-xl p-1 gap-1 flex-wrap">
            {FILTERS.map((f) => (
              <button
                key={f.key}
                onClick={() => setFilter(f.key)}
                className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${
                  filter === f.key
                    ? 'bg-violet-600 text-white shadow'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                {f.label}
                {f.key !== 'all' && (
                  <span className="ml-1.5 text-xs opacity-60">
                    {f.key === 'liked'
                      ? items.filter((i) => i.isLiked).length
                      : items.filter((i) => i.type === f.key).length}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="text-center py-10">
            <p className="text-red-400 bg-red-400/10 border border-red-400/20 rounded-xl px-4 py-3 inline-block">
              {error}
            </p>
            <button onClick={fetchLibrary} className="ml-4 text-violet-400 hover:underline text-sm">
              Retry
            </button>
          </div>
        )}

        {/* Loading skeleton */}
        {loading && (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="bg-gray-900 rounded-2xl overflow-hidden animate-pulse">
                <div className="aspect-[2/3] bg-gray-800" />
                <div className="p-4 space-y-2">
                  <div className="h-3 bg-gray-800 rounded w-3/4" />
                  <div className="h-3 bg-gray-800 rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Grid */}
        {!loading && !error && filtered.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {filtered.map((item) => (
              <LibraryCard key={item.id} item={item} onUpdate={handleUpdate} />
            ))}
          </div>
        )}

        {/* Empty library */}
        {!loading && !error && items.length === 0 && (
          <div className="text-center py-24 text-gray-500">
            <p className="text-6xl mb-4">📚</p>
            <p className="text-xl font-semibold text-gray-400">Your library is empty</p>
            <p className="text-sm mt-2">Search for movies and shows to get started</p>
          </div>
        )}

        {/* Filter empty state */}
        {!loading && !error && items.length > 0 && filtered.length === 0 && (
          <div className="text-center py-24 text-gray-500">
            <p className="text-5xl mb-4">
              {filter === 'liked' ? '💔' : '🔍'}
            </p>
            <p className="text-lg font-medium text-gray-400">No {filter === 'liked' ? 'favourites' : filter === 'Movie' ? 'movies' : 'TV shows'} yet</p>
          </div>
        )}
      </div>
    </div>
  );
}
