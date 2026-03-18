import { useState, useRef, useMemo, useCallback } from 'react';
import { api } from '../api';
import AddToLibraryModal from '../components/AddToLibraryModal';
import CarouselRow from '../components/CarouselRow';

// TMDB genre IDs
const GENRES = {
  Comedy: 35,
  Drama:  18,
  Horror: 27,
};

// ─── Search result card (grid layout) ────────────────────────────────────────
function SearchCard({ item, onAdd, inLibrary }) {
  return (
    <div className="group bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden flex flex-col hover:border-violet-500/50 hover:shadow-lg hover:shadow-violet-900/20 transition-all duration-300">
      <div className="relative aspect-[2/3] bg-gray-800 overflow-hidden">
        {item.posterPath ? (
          <img
            src={item.posterPath}
            alt={item.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-600 text-6xl">🎬</div>
        )}
        <div className="absolute top-2 left-2">
          <span className="text-xs font-bold bg-black/60 backdrop-blur-sm text-violet-400 rounded-full px-2.5 py-1 border border-violet-500/30">
            {item.type}
          </span>
        </div>
        {item.voteAverage > 0 && (
          <div className="absolute top-2 right-2">
            <span className="text-xs font-bold bg-black/60 backdrop-blur-sm text-yellow-400 rounded-full px-2.5 py-1">
              ★ {item.voteAverage.toFixed(1)}
            </span>
          </div>
        )}
      </div>
      <div className="p-4 flex flex-col flex-1">
        <h3 className="font-semibold text-white text-sm leading-snug line-clamp-2 mb-1">{item.title}</h3>
        {item.releaseDate && (
          <p className="text-gray-500 text-xs mb-3">{item.releaseDate.slice(0, 4)}</p>
        )}
        <div className="mt-auto">
          {inLibrary ? (
            <div className="w-full text-center py-2 rounded-xl bg-green-500/10 border border-green-500/30 text-green-400 text-xs font-semibold">
              ✓ In Library
            </div>
          ) : (
            <button
              onClick={() => onAdd(item)}
              className="w-full py-2 rounded-xl bg-violet-600/20 hover:bg-violet-600 border border-violet-500/40 hover:border-violet-500 text-violet-300 hover:text-white text-xs font-semibold transition-all duration-200"
            >
              + Add to Library
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────
export default function HomePage() {
  const [activeTab, setActiveTab] = useState('movies'); // 'movies' | 'tv'
  const [query, setQuery]         = useState('');
  const [results, setResults]     = useState([]);
  const [searching, setSearching] = useState(false);
  const [searchError, setSearchError] = useState('');
  const [searched, setSearched]   = useState(false);
  const [modalItem, setModalItem] = useState(null);
  const [addedIds, setAddedIds]   = useState(new Set());
  const inputRef = useRef(null);

  // Stable fetch callbacks — recreated only when activeTab changes
  const fetchTrending = useCallback(
    () => api.getTrending(activeTab),
    [activeTab]
  );
  const fetchComedy = useCallback(
    () => api.getByGenre(activeTab, GENRES.Comedy),
    [activeTab]
  );
  const fetchDrama = useCallback(
    () => api.getByGenre(activeTab, GENRES.Drama),
    [activeTab]
  );
  const fetchHorror = useCallback(
    () => api.getByGenre(activeTab, GENRES.Horror),
    [activeTab]
  );

  const carousels = useMemo(() => [
    { key: `${activeTab}-trending`, title: '🔥 Trending',  fetchFn: fetchTrending },
    { key: `${activeTab}-comedy`,   title: '😂 Comedy',    fetchFn: fetchComedy   },
    { key: `${activeTab}-drama`,    title: '🎭 Drama',     fetchFn: fetchDrama    },
    { key: `${activeTab}-horror`,   title: '👻 Horror',    fetchFn: fetchHorror   },
  ], [activeTab, fetchTrending, fetchComedy, fetchDrama, fetchHorror]);

  async function handleSearch(e) {
    e.preventDefault();
    if (!query.trim()) return;
    setSearching(true);
    setSearchError('');
    setSearched(true);
    try {
      const data = await api.search(query.trim());
      setResults(data.results);
    } catch (err) {
      setSearchError(err.message);
    } finally {
      setSearching(false);
    }
  }

  function clearSearch() {
    setQuery('');
    setResults([]);
    setSearched(false);
    setSearchError('');
    inputRef.current?.focus();
  }

  function handleAdded() {
    setAddedIds((prev) => new Set([...prev, modalItem.tmdbId]));
    setModalItem(null);
  }

  const showCarousels = !searched;

  return (
    <div className="min-h-screen bg-gray-950 pb-16">
      <div className="max-w-6xl mx-auto px-4 pt-10">

        {/* ── Header ── */}
        <div className="text-center mb-8">
          <h2 className="text-3xl sm:text-4xl font-black text-white mb-2">
            Discover Movies &amp; Shows
          </h2>
          <p className="text-gray-400 text-sm mb-7">
            Search any title or browse curated categories below
          </p>

          {/* Search bar */}
          <form onSubmit={handleSearch} className="flex gap-3 max-w-xl mx-auto relative">
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search for a movie or TV show…"
              className="flex-1 bg-gray-900 border border-gray-700 rounded-xl px-5 py-3.5 text-white placeholder-gray-500 focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition pr-10"
            />
            {query && (
              <button
                type="button"
                onClick={clearSearch}
                className="absolute right-[88px] top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition text-lg leading-none"
              >
                ✕
              </button>
            )}
            <button
              type="submit"
              disabled={searching || !query.trim()}
              className="bg-violet-600 hover:bg-violet-500 disabled:opacity-50 text-white font-semibold px-6 py-3.5 rounded-xl transition-colors duration-200 whitespace-nowrap"
            >
              {searching ? '…' : 'Search'}
            </button>
          </form>
        </div>

        {/* ── Tabs (only shown when not searching) ── */}
        {showCarousels && (
          <div className="flex justify-center mb-10">
            <div className="flex bg-gray-900 border border-gray-800 rounded-xl p-1 gap-1">
              {[
                { key: 'movies', label: '🎬 Movies' },
                { key: 'tv',     label: '📺 TV Shows' },
              ].map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`px-6 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 ${
                    activeTab === tab.key
                      ? 'bg-violet-600 text-white shadow'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ── Search results ── */}
        {searched && (
          <>
            {/* Back to browse */}
            <button
              onClick={clearSearch}
              className="flex items-center gap-2 text-gray-400 hover:text-white transition text-sm mb-6"
            >
              ← Back to Browse
            </button>

            {searchError && (
              <p className="text-center text-red-400 bg-red-400/10 border border-red-400/20 rounded-xl px-4 py-3 max-w-xl mx-auto mb-8">
                {searchError}
              </p>
            )}

            {/* Loading skeleton */}
            {searching && (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {Array.from({ length: 10 }).map((_, i) => (
                  <div key={i} className="bg-gray-900 rounded-2xl overflow-hidden animate-pulse">
                    <div className="aspect-[2/3] bg-gray-800" />
                    <div className="p-4 space-y-2">
                      <div className="h-3 bg-gray-800 rounded w-3/4" />
                      <div className="h-3 bg-gray-800 rounded w-1/2" />
                      <div className="h-7 bg-gray-800 rounded-xl mt-3" />
                    </div>
                  </div>
                ))}
              </div>
            )}

            {!searching && results.length > 0 && (
              <>
                <p className="text-gray-500 text-sm mb-5">
                  {results.length} results for <span className="text-white font-semibold">"{query}"</span>
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                  {results.map((item) => (
                    <SearchCard
                      key={item.tmdbId}
                      item={item}
                      onAdd={setModalItem}
                      inLibrary={addedIds.has(item.tmdbId)}
                    />
                  ))}
                </div>
              </>
            )}

            {!searching && results.length === 0 && !searchError && (
              <div className="text-center py-20 text-gray-500">
                <p className="text-5xl mb-4">🔍</p>
                <p className="text-lg font-medium">No results found for "{query}"</p>
                <p className="text-sm mt-1">Try a different title or check the spelling</p>
              </div>
            )}
          </>
        )}

        {/* ── Carousels ── */}
        {showCarousels && (
          <div className="space-y-10">
            {carousels.map(({ key, title, fetchFn }) => (
              <CarouselRow
                key={key}
                title={title}
                fetchFn={fetchFn}
                onAdd={setModalItem}
                addedIds={addedIds}
              />
            ))}
          </div>
        )}
      </div>

      {/* ── Add to Library modal ── */}
      {modalItem && (
        <AddToLibraryModal
          item={modalItem}
          onClose={() => setModalItem(null)}
          onAdded={handleAdded}
        />
      )}
    </div>
  );
}
