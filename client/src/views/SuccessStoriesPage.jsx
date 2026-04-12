import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { MapPin, ArrowRight, Heart, Users, Trophy, Loader2, Clock, Calendar, Search, AlertTriangle } from 'lucide-react';

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
const DIVISIONS = ['সব বিভাগ', 'ঢাকা', 'চট্টগ্রাম', 'রাজশাহী', 'খুলনা', 'বরিশাল', 'সিলেট', 'রংপুর', 'ময়মনসিংহ'];
const PER_PAGE = 9;

const PLACEHOLDER_IMG = 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=600&q=80';

function StoryCard({ story }) {
    return (
        <article className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-lg transition-all duration-300 group flex flex-col">
            {/* Image */}
            <div className="relative h-52 overflow-hidden bg-gray-100">
                <img
                    src={story.photoUrl || PLACEHOLDER_IMG}
                    alt={story.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    onError={e => { e.target.src = PLACEHOLDER_IMG; }}
                />
                {/* Status badge */}
                <span className="absolute top-3 left-3 bg-emerald-500 text-white text-[10px] font-bold px-2.5 py-1 rounded-full shadow flex items-center gap-1">
                    <Trophy size={10} /> সফল
                </span>
                {story.daysLost && (
                    <span className="absolute top-3 right-3 bg-black/60 text-white text-[10px] font-bold px-2.5 py-1 rounded-full shadow flex items-center gap-1 backdrop-blur-sm">
                        <Clock size={10} /> {story.daysLost} দিন পর
                    </span>
                )}
                {/* Gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent pointer-events-none" />
            </div>

            {/* Content */}
            <div className="p-5 flex flex-col flex-1">
                {/* Location */}
                <div className="flex items-center gap-1 text-xs text-gray-400 mb-2">
                    <MapPin size={11} className="text-red-400 flex-shrink-0" />
                    {story.division}{story.district ? ` · ${story.district}` : ''}
                </div>

                {/* Title */}
                <h2 className="font-black text-gray-800 text-base leading-snug mb-2 line-clamp-2">
                    {story.title}
                </h2>

                {/* Summary */}
                <p className="text-xs text-gray-500 leading-relaxed mb-4 line-clamp-3 flex-1">
                    {story.summary || story.content?.slice(0, 180) + '...'}
                </p>

                {/* Person + date row */}
                <div className="flex items-center justify-between pt-3 border-t border-gray-50">
                    <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-red-50 flex items-center justify-center text-[10px] font-black text-red-400 flex-shrink-0">
                            {story.personName?.[0]}
                        </div>
                        <span className="text-xs font-semibold text-gray-600">{story.personName}</span>
                    </div>
                    <div className="flex items-center gap-3">
                        {story.reunionDate && (
                            <span className="flex items-center gap-1 text-[10px] text-gray-300">
                                <Calendar size={10} />
                                {new Date(story.reunionDate).toLocaleDateString('bn-BD')}
                            </span>
                        )}
                        <Link
                            to={`/success-stories/${story.id}`}
                            className="flex items-center gap-1 text-red-500 text-xs font-bold hover:underline"
                        >
                            বিস্তারিত <ArrowRight size={12} />
                        </Link>
                    </div>
                </div>
            </div>
        </article>
    );
}

function SkeletonCard() {
    return (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden animate-pulse">
            <div className="h-52 bg-gray-100" />
            <div className="p-5 space-y-3">
                <div className="h-3 bg-gray-100 rounded w-1/3" />
                <div className="h-4 bg-gray-100 rounded w-4/5" />
                <div className="h-3 bg-gray-100 rounded w-full" />
                <div className="h-3 bg-gray-100 rounded w-2/3" />
            </div>
        </div>
    );
}

export default function SuccessStoriesPage() {
    const [stories, setStories] = useState([]);
    const [total, setTotal] = useState(0);
    const [totalPages, setTotalPages] = useState(1);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeDiv, setActiveDiv] = useState('সব বিভাগ');
    const [page, setPage] = useState(1);
    const [searchQ, setSearchQ] = useState('');
    const [searchInput, setSearchInput] = useState('');

    const fetchStories = async () => {
        setLoading(true);
        setError(null);
        try {
            const params = new URLSearchParams({
                page: String(page),
                limit: String(PER_PAGE),
            });
            if (activeDiv !== 'সব বিভাগ') params.set('division', activeDiv);

            const res = await fetch(`${API}/success-stories?${params}`);
            if (!res.ok) throw new Error('Failed to fetch');
            const data = await res.json();

            setStories(data.stories || []);
            setTotal(data.total || 0);
            setTotalPages(data.totalPages || 1);
        } catch (err) {
            setError('সাফল্যের গল্প লোড করতে ব্যর্থ হয়েছে। পরে আবার চেষ্টা করুন।');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchStories();
    }, [activeDiv, page]);

    const displayStories = searchQ
        ? stories.filter(s =>
            s.title?.toLowerCase().includes(searchQ.toLowerCase()) ||
            s.personName?.toLowerCase().includes(searchQ.toLowerCase()) ||
            s.division?.includes(searchQ)
        )
        : stories;

    return (
        <div className="bg-gray-50 min-h-screen">
            {/* ── Hero Banner ── */}
            <div className="bg-gradient-to-br from-red-600 via-red-500 to-rose-600 text-white">
                <div className="max-w-7xl mx-auto px-4 py-14">
                    <div className="flex flex-col items-center text-center max-w-2xl mx-auto">
                        <div className="w-16 h-16 bg-white/15 backdrop-blur-sm rounded-2xl flex items-center justify-center mb-5 border border-white/20">
                            <Trophy size={32} className="text-yellow-300" />
                        </div>
                        <h1 className="text-3xl sm:text-4xl font-black mb-3 leading-tight">সাফল্যের গল্প</h1>
                        <p className="text-red-100 text-sm sm:text-base leading-relaxed mb-6">
                            আপনখোঁজ-এর মাধ্যমে প্রিয়জনদের পরিবারে ফিরে আসার অনুপ্রেরণামূলক কাহিনী।
                            প্রতিটি পুনর্মিলন আমাদের পথচলার নতুন শক্তি যোগায়।
                        </p>

                        {/* Stats row */}
                        <div className="flex items-center gap-6 bg-white/10 backdrop-blur-sm rounded-2xl px-6 py-3 border border-white/15">
                            <div className="text-center">
                                <p className="text-2xl font-black text-yellow-300">{total}+</p>
                                <p className="text-[10px] text-red-200 mt-0.5">সাফল্যের গল্প</p>
                            </div>
                            <div className="w-px h-8 bg-white/20" />
                            <div className="text-center">
                                <p className="text-2xl font-black text-yellow-300">৮টি</p>
                                <p className="text-[10px] text-red-200 mt-0.5">বিভাগ</p>
                            </div>
                            <div className="w-px h-8 bg-white/20" />
                            <div className="flex items-center gap-1.5">
                                <Heart size={16} className="text-pink-300" />
                                <span className="text-sm font-bold text-white">পরিবার একত্রিত</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 py-8">
                {/* ── Search + Filter Bar ── */}
                <div className="bg-white border border-gray-100 shadow-sm rounded-2xl p-4 mb-6">
                    {/* Search */}
                    <div className="relative mb-4">
                        <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-300" />
                        <input
                            type="text"
                            value={searchInput}
                            onChange={e => setSearchInput(e.target.value)}
                            onKeyDown={e => { if (e.key === 'Enter') setSearchQ(searchInput); }}
                            placeholder="গল্পের শিরোনাম বা ব্যক্তির নাম খুঁজুন..."
                            className="w-full pl-10 pr-4 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-200"
                        />
                        {searchInput && (
                            <button onClick={() => { setSearchInput(''); setSearchQ(''); }}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-300 hover:text-gray-500">
                                ✕
                            </button>
                        )}
                    </div>

                    {/* Division filter */}
                    <p className="text-xs text-gray-400 font-medium mb-2">বিভাগ অনুযায়ী ফিল্টার করুন</p>
                    <div className="flex flex-wrap gap-2">
                        {DIVISIONS.map(d => (
                            <button
                                key={d}
                                onClick={() => { setActiveDiv(d); setPage(1); setSearchQ(''); setSearchInput(''); }}
                                className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all border ${
                                    activeDiv === d
                                        ? 'bg-red-500 text-white border-red-500 shadow-sm'
                                        : 'bg-white text-gray-500 border-gray-200 hover:border-red-300 hover:text-red-500'
                                }`}
                            >
                                {d}
                            </button>
                        ))}
                    </div>
                </div>

                {/* ── Results info ── */}
                {!loading && !error && (
                    <div className="flex items-center justify-between mb-5">
                        <p className="text-sm text-gray-500">
                            {searchQ ? (
                                <><strong className="text-gray-800">{displayStories.length}টি</strong> ফলাফল পাওয়া গেছে</>
                            ) : (
                                <>মোট <strong className="text-gray-800">{total}টি</strong> সাফল্যের গল্প</>
                            )}
                        </p>
                        {activeDiv !== 'সব বিভাগ' && (
                            <span className="text-xs text-red-500 bg-red-50 border border-red-200 px-3 py-1 rounded-full font-semibold flex items-center gap-1">
                                <MapPin size={10} /> {activeDiv}
                            </span>
                        )}
                    </div>
                )}

                {/* ── Error State ── */}
                {error && (
                    <div className="bg-red-50 border border-red-200 rounded-2xl p-8 text-center">
                        <AlertTriangle size={32} className="text-red-300 mx-auto mb-3" />
                        <p className="text-gray-600 font-medium text-sm">{error}</p>
                        <button
                            onClick={fetchStories}
                            className="mt-4 px-5 py-2 bg-red-500 text-white text-sm rounded-xl hover:bg-red-600 transition-colors"
                        >
                            আবার চেষ্টা করুন
                        </button>
                    </div>
                )}

                {/* ── Loading Skeleton ── */}
                {loading && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
                        {Array(6).fill(0).map((_, i) => <SkeletonCard key={i} />)}
                    </div>
                )}

                {/* ── Empty State ── */}
                {!loading && !error && displayStories.length === 0 && (
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm py-20 text-center">
                        <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                            <Trophy size={28} className="text-gray-200" />
                        </div>
                        <p className="text-gray-500 font-semibold mb-1">কোনো গল্প পাওয়া যায়নি</p>
                        <p className="text-xs text-gray-400">
                            {searchQ ? 'অন্য কীওয়ার্ড দিয়ে খোঁজ করুন' : 'এই বিভাগে এখনো কোনো সাফল্যের গল্প নেই'}
                        </p>
                        {(activeDiv !== 'সব বিভাগ' || searchQ) && (
                            <button
                                onClick={() => { setActiveDiv('সব বিভাগ'); setSearchQ(''); setSearchInput(''); setPage(1); }}
                                className="mt-4 px-5 py-2 text-red-500 border border-red-200 text-sm rounded-xl hover:bg-red-50 transition-colors"
                            >
                                সব গল্প দেখুন
                            </button>
                        )}
                    </div>
                )}

                {/* ── Stories Grid ── */}
                {!loading && !error && displayStories.length > 0 && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
                        {displayStories.map(story => (
                            <StoryCard key={story.id} story={story} />
                        ))}
                    </div>
                )}

                {/* ── Pagination ── */}
                {!searchQ && totalPages > 1 && (
                    <div className="flex items-center justify-center gap-1">
                        <button
                            onClick={() => { setPage(p => Math.max(1, p - 1)); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                            disabled={page === 1}
                            className="w-9 h-9 flex items-center justify-center rounded-xl border border-gray-200 text-gray-500 hover:border-red-300 disabled:opacity-30 transition-colors"
                        >‹</button>
                        {Array.from({ length: totalPages }, (_, i) => i + 1).map(n => (
                            <button
                                key={n}
                                onClick={() => { setPage(n); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                                className={`w-9 h-9 rounded-xl text-sm font-medium transition-all ${
                                    page === n ? 'bg-red-500 text-white shadow-sm' : 'border border-gray-200 text-gray-600 hover:border-red-300'
                                }`}
                            >{n}</button>
                        ))}
                        <button
                            onClick={() => { setPage(p => Math.min(totalPages, p + 1)); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                            disabled={page === totalPages}
                            className="w-9 h-9 flex items-center justify-center rounded-xl border border-gray-200 text-gray-500 hover:border-red-300 disabled:opacity-30 transition-colors"
                        >›</button>
                    </div>
                )}
            </div>
        </div>
    );
}