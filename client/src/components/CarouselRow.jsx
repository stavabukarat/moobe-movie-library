import { useRef, useState, useEffect, useCallback } from 'react';
import { api } from '../api';

// ─── Skeleton card ───────────────────────────────────────────────────────────
function SkeletonCard() {
  return (
    <div className="flex-none w-36 sm:w-40 rounded-xl overflow-hidden bg-gray-900 animate-pulse">
      <div className="aspect-[2/3] bg-gray-800" />
      <div className="p-2.5 space-y-1.5">
        <div className="h-2.5 bg-gray-800 rounded w-4/5" />
        <div className="h-2 bg-gray-800 rounded w-2/5" />
      </div>
    </div>
  );
}

// ─── Individual card ─────────────────────────────────────────────────────────
function CarouselCard({ item, onAdd, inLibrary }) {
  return (
    <div
      onClick={() => !inLibrary && onAdd(item)}
      className={`group flex-none w-36 sm:w-40 rounded-xl overflow-hidden bg-gray-900 border transition-all duration-300 cursor-pointer
        ${inLibrary
          ? 'border-green-500/30'
          : 'border-gray-800 hover:border-violet-500/60 hover:shadow-lg hover:shadow-violet-900/20'
        }`}
    >
      {/* Poster */}
      <div className="relative aspect-[2/3] bg-gray-800 overflow-hidden">
        {item.posterPath ? (
          <img
            src={item.posterPath}
            alt={item.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-600 text-4xl">🎬</div>
        )}

        {/* Hover overlay */}
        {!inLibrary && (
          <div className="absolute inset-0 bg-violet-900/0 group-hover:bg-violet-900/30 transition-colors duration-300 flex items-center justify-center">
            <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 text-white text-xs font-bold bg-violet-600 rounded-full px-3 py-1.5 shadow">
              + Add
            </span>
          </div>
        )}

        {inLibrary && (
          <div className="absolute inset-0 bg-green-900/20 flex items-end justify-center pb-2">
            <span className="text-xs font-bold bg-green-500/90 text-white rounded-full px-2.5 py-1">
              ✓ Saved
            </span>
          </div>
        )}

        {item.voteAverage > 0 && (
          <div className="absolute top-1.5 right-1.5">
            <span className="text-xs font-bold bg-black/70 backdrop-blur-sm text-yellow-400 rounded-full px-2 py-0.5">
              ★ {item.voteAverage.toFixed(1)}
            </span>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-2.5">
        <p className="text-white text-xs font-semibold leading-snug line-clamp-2">{item.title}</p>
        {item.releaseDate && (
          <p className="text-gray-500 text-xs mt-0.5">{item.releaseDate.slice(0, 4)}</p>
        )}
      </div>
    </div>
  );
}

// ─── Arrow button ─────────────────────────────────────────────────────────────
function Arrow({ direction, onClick, visible }) {
  return (
    <button
      onClick={onClick}
      className={`absolute top-1/2 -translate-y-1/2 z-10 w-9 h-9 flex items-center justify-center
        rounded-full bg-gray-900/90 border border-gray-700 text-white shadow-lg
        transition-all duration-200 hover:bg-violet-600 hover:border-violet-500
        ${direction === 'left' ? '-left-4' : '-right-4'}
        ${visible ? 'opacity-100 scale-100' : 'opacity-0 scale-90 pointer-events-none'}`}
    >
      {direction === 'left' ? '‹' : '›'}
    </button>
  );
}

// ─── Main CarouselRow ─────────────────────────────────────────────────────────
export default function CarouselRow({ title, fetchFn, onAdd, addedIds }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showLeft, setShowLeft] = useState(false);
  const [showRight, setShowRight] = useState(false);
  const [hovered, setHovered] = useState(false);
  const trackRef = useRef(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    fetchFn()
      .then((data) => { if (!cancelled) setItems(data.results ?? []); })
      .catch(() => { if (!cancelled) setItems([]); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [fetchFn]);

  const updateArrows = useCallback(() => {
    const el = trackRef.current;
    if (!el) return;
    setShowLeft(el.scrollLeft > 8);
    setShowRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 8);
  }, []);

  useEffect(() => {
    const el = trackRef.current;
    if (!el) return;
    updateArrows();
    el.addEventListener('scroll', updateArrows, { passive: true });
    window.addEventListener('resize', updateArrows);
    return () => {
      el.removeEventListener('scroll', updateArrows);
      window.removeEventListener('resize', updateArrows);
    };
  }, [items, updateArrows]);

  function scroll(dir) {
    trackRef.current?.scrollBy({ left: dir * 640, behavior: 'smooth' });
  }

  return (
    <div
      className="relative"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Row header */}
      <h3 className="text-white font-bold text-lg mb-3 px-1">{title}</h3>

      {/* Arrows */}
      <Arrow direction="left"  onClick={() => scroll(-1)} visible={hovered && showLeft} />
      <Arrow direction="right" onClick={() => scroll(1)}  visible={hovered && showRight} />

      {/* Track */}
      <div
        ref={trackRef}
        className="flex gap-3 overflow-x-auto pb-2 scroll-smooth"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {loading
          ? Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)
          : items.map((item) => (
              <CarouselCard
                key={item.tmdbId}
                item={item}
                onAdd={onAdd}
                inLibrary={addedIds.has(item.tmdbId)}
              />
            ))}
      </div>

      {/* Edge fade — right */}
      <div className="pointer-events-none absolute top-8 right-0 bottom-2 w-16 bg-gradient-to-l from-gray-950 to-transparent" />
    </div>
  );
}
