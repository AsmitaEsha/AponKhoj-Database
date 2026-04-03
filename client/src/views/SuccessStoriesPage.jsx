import { useState } from 'react';
import { Link } from 'react-router-dom';
import { MapPin, ArrowRight, Plus, Heart, Share2 } from 'lucide-react';

const STORIES = [];

const DIVISIONS = ['সব গল্প', 'ঢাকা', 'চট্টগ্রাম', 'রাজশাহী', 'খুলনা', 'বরিশাল', 'সিলেট', 'রংপুর', 'ময়মনসিংহ'];
const PER_PAGE = 6;

export default function SuccessStoriesPage() {
    const [activeDiv, setActiveDiv] = useState('সব গল্প');
    const [page, setPage] = useState(1);

    const filtered = activeDiv === 'সব গল্প' ? STORIES : STORIES.filter(s => s.division === activeDiv);
    const totalPages = Math.ceil(filtered.length / PER_PAGE);
    const paginated = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

    return (
        <div className="bg-background min-h-screen">
            <div className="max-w-7xl mx-auto px-4 py-10">

                {/* ── Page Header ── */}
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-8">
                    <div>
                        <h1 className="text-4xl font-black text-gray-800 mb-2">সাফল্যের গল্প</h1>
                        <p className="text-sm text-gray-500 max-w-lg leading-relaxed">
                            আপনখোঁজ-এর মাধ্যমে প্রিয়জনদের পরিবারে ফিরে আসার অনুপ্রেরণামূলক কাহিনী।
                            প্রতিটি গল্প আমাদের পথচলার নতুন শক্তি যোগায়।
                        </p>
                    </div>
                  
                </div>

                {/* ── Division Filter ── */}
                <div className="bg-white border border-gray-100 shadow-sm rounded-2xl p-4 mb-8">
                    <p className="text-xs text-gray-500 mb-3 font-medium">বিভাগ অনুযায়ী খুঁজুন</p>
                    <div className="flex flex-wrap gap-2">
                        {DIVISIONS.map(d => (
                            <button
                                key={d}
                                onClick={() => { setActiveDiv(d); setPage(1); }}
                                className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all border ${activeDiv === d
                                    ? 'bg-secondary text-white border-secondary shadow-sm'
                                    : 'bg-white text-gray-600 border-gray-200 hover:border-secondary hover:text-secondary'
                                    }`}
                            >
                                {d}
                            </button>
                        ))}
                    </div>
                </div>

                {/* ── Stories Grid ── */}
                {paginated.length === 0 ? (
                    <div className="text-center py-20">
                        <div className="text-4xl mb-3">📖</div>
                        <p className="text-gray-500 font-medium">এই বিভাগে কোনো গল্প নেই</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
                        {paginated.map(story => (
                            <article
                                key={story.id}
                                className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-md transition-shadow group"
                            >
                                {/* Image */}
                                <div className="relative h-52 overflow-hidden">
                                    <img
                                        src={story.img}
                                        alt={story.title}
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                        onError={e => { e.target.src = `https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=600&q=80`; }}
                                    />
                                    {/* Badge */}
                                    <span className="absolute top-2 right-2 bg-secondary text-white text-[10px] font-bold px-2.5 py-1 rounded-full shadow">
                                        {story.tag}
                                    </span>
                                    {/* Gradient overlay */}
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent pointer-events-none" />
                                </div>

                                {/* Content */}
                                <div className="p-5">
                                    {/* Location */}
                                    <div className="flex items-center gap-1 text-xs text-gray-400 mb-2">
                                        <MapPin size={11} className="text-secondary flex-shrink-0" />
                                        {story.division} বিভাগ
                                    </div>

                                    {/* Title */}
                                    <h2 className="font-black text-gray-800 text-base leading-snug mb-2 line-clamp-2">
                                        {story.title}
                                    </h2>

                                    {/* Description */}
                                    <p className="text-xs text-gray-500 leading-relaxed mb-4 line-clamp-3">
                                        {story.desc}
                                    </p>

                                    {/* Footer row */}
                                    <div className="flex items-center justify-between">
                                        <span className="text-[11px] text-gray-300">{story.date}</span>
                                        <div className="flex items-center gap-3">
                                            <button className="text-gray-300 hover:text-accent-red transition-colors">
                                                <Heart size={13} />
                                            </button>
                                            <button className="text-gray-300 hover:text-primary transition-colors">
                                                <Share2 size={13} />
                                            </button>
                                            <Link
                                                to={`/success-stories/${story.id}`}
                                                className="flex items-center gap-1 text-secondary text-xs font-bold hover:underline"
                                            >
                                                বিস্তারিত <ArrowRight size={12} />
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                            </article>
                        ))}
                    </div>
                )}

                {/* ── Pagination ── */}
                {totalPages > 1 && (
                    <div className="flex items-center justify-center gap-1">
                        <button
                            onClick={() => {
                                setPage(p => Math.max(1, p - 1));
                                window.scrollTo({ top: 0, behavior: 'smooth' });
                            }}
                            disabled={page === 1}
                            className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 text-gray-500 hover:border-secondary hover:text-secondary disabled:opacity-30 transition-colors text-sm"
                        >‹</button>

                        {Array.from({ length: totalPages }, (_, i) => i + 1).map(n => (
                            <button
                                key={n}
                                onClick={() => {
                                    setPage(n);
                                    window.scrollTo({ top: 0, behavior: 'smooth' });
                                }}
                                className={`w-8 h-8 rounded-lg text-sm font-medium transition-all ${page === n
                                    ? 'bg-secondary text-white shadow-sm'
                                    : 'border border-gray-200 text-gray-600 hover:border-secondary hover:text-secondary'
                                    }`}
                            >
                                {n}
                            </button>
                        ))}

                        <button
                            onClick={() => {
                                setPage(p => Math.min(totalPages, p + 1));
                                window.scrollTo({ top: 0, behavior: 'smooth' });
                            }}
                            disabled={page === totalPages}
                            className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 text-gray-500 hover:border-secondary hover:text-secondary disabled:opacity-30 transition-colors text-sm"
                        >›</button>
                    </div>
                )}
            </div>
        </div>
    );
}