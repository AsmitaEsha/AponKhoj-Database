import { useState } from 'react';
import { Link } from 'react-router-dom';
import { MapPin, ArrowRight, Plus, Heart, Share2 } from 'lucide-react';

const STORIES = [
    {
        id: 1, division: 'ঢাকা',
        title: '১০ বছর পর মায়ের কোলে ফিরে এলো আরিফ',
        desc: 'ঢাকা এক দশকের অনুসন্ধান পর আপনখোঁজের AI-চালিত প্ল্যাটফর্মের মাধ্যমে আরিফকে তার পরিবারের সাথে পুনর্মিলিত করা হয়েছে। এক আনন্দময় মুহূর্তে বিদায় লগ্নে এই পরিবার...',
        date: '১০ মে, ২০২৫',
        img: 'https://images.unsplash.com/photo-1609220136736-443140cffec6?w=600&q=80',
        tag: 'পুনর্মিলিত',
    },
    {
        id: 2, division: 'চট্টগ্রাম',
        title: 'নিখোঁজ বৃদ্ধার আপন ঠিকানায় প্রত্যাবর্তন',
        desc: 'বুড়ি ফিরিয়ে দেওয়া হলো তার পরিবারের কাছে। ছিনিয়ে নেওয়া আনন্দের হালহকিকত এক কান্নার পটিয়ার হোম থেকে...',
        date: '২ মে, ২০২৫',
        img: 'https://images.unsplash.com/photo-1566616213894-2d4e1baee5d8?w=600&q=80',
        tag: 'পুনর্মিলিত',
    },
    {
        id: 3, division: 'রাজশাহী',
        title: 'সালামের ৩ বছরের অপেক্ষার অবসান',
        desc: 'রাজশাহী সুশান্ত হারানো তার সালাম বেগমকে তার সন্তান উচ্চমাধ্যমিকের পদধ্বনি শুনে চিনতে পারেন। তিন বছরের প্রতীক্ষা...',
        date: '২৫ এপ্রিল, ২০২৫',
        img: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=600&q=80',
        tag: 'পুনর্মিলিত',
    },
    {
        id: 4, division: 'খুলনা',
        title: 'হারানো কন্যাকে ফিরে পেল খুলনার পরিবার',
        desc: 'সাত বছর আগে হারিয়ে যাওয়া রুনু এখন তার মা-বাবার কাছে। আপনখোঁজের ফেস রিকগনিশন ম্যাচিং এই অসম্ভবকে সম্ভব করেছে...',
        date: '১৮ এপ্রিল, ২০২৫',
        img: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=600&q=80',
        tag: 'পুনর্মিলিত',
    },
    {
        id: 5, division: 'বরিশাল',
        title: 'বন্যার স্রোতে হারানো শিশু ফিরল পরিবারে',
        desc: 'বরিশালের ভয়াবহ বন্যায় হারিয়ে যাওয়া ছোট্ট মিথিলা ছয় মাস পরে পাওয়া গেল। স্থানীয় হাসপাতাল এবং আপনখোঁজের নেটওয়ার্ক মিলে...',
        date: '১০ এপ্রিল, ২০২৫',
        img: 'https://images.unsplash.com/photo-1516627145497-ae6968895b74?w=600&q=80',
        tag: 'পুনর্মিলিত',
    },
    {
        id: 6, division: 'সিলেট',
        title: 'সিলেটে চা বাগানে পাওয়া গেল বৃদ্ধ আব্দুল',
        desc: 'স্মৃতিভ্রংশ হওয়া আব্দুল সাহেব তিন মাস ধরে নিখোঁজ ছিলেন। আপনখোঁজে এলাকার মানুষের সহায়তায় অবশেষে খুঁজে পাওয়া গেছে...',
        date: '২ এপ্রিল, ২০২৫',
        img: 'https://images.unsplash.com/photo-1499996860823-5214fcc65f8f?w=600&q=80',
        tag: 'পুনর্মিলিত',
    },
    {
        id: 7, division: 'রংপুর',
        title: 'ভিন্ন দেশে হারানো নাদিম খুঁজে পেল স্বজন',
        desc: 'রংপুরের নাদিম ঢাকায় কাজের খোঁজে এসে কিছুদিন পর নিখোঁজ হয়ে যায়। পরিবার আপনখোঁজে রিপোর্ট করার পাঁচ দিনের মাথায়...',
        date: '২৫ মার্চ, ২০২৫',
        img: 'https://images.unsplash.com/photo-1521566652839-697aa473761a?w=600&q=80',
        tag: 'পুনর্মিলিত',
    },
    {
        id: 8, division: 'ময়মনসিংহ',
        title: 'দুই বছর পর ফিরল কিশোরী রিমা',
        desc: 'ময়মনসিংহ থেকে নিখোঁজ হওয়া রিমা দুই বছর পর পরিবারের কোলে ফিরেছে। তার পরিচয় নিশ্চিত করেছে পুলিশ ও আপনখোঁজের ভেরিফিকেশন দল...',
        date: '১৫ মার্চ, ২০২৫',
        img: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=600&q=80',
        tag: 'পুনর্মিলিত',
    },
    {
        id: 9, division: 'ঢাকা',
        title: 'আলোর পথে মিলন — গাজীপুরের জামাল পরিবার',
        desc: 'গাজীপুরের জামাল তার মানসিক ভারসাম্যহীন বাবাকে খুঁজে পেলেন আপনখোঁজের SMS আলার্টের মাধ্যমে। দুই মাসের প্রতীক্ষার অবসান...',
        date: '৫ মার্চ, ২০২৫',
        img: 'https://images.unsplash.com/photo-1525182008055-f88b95ff7980?w=600&q=80',
        tag: 'পুনর্মিলিত',
    },
];

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
                    <button className="flex-shrink-0 inline-flex items-center gap-2 bg-secondary text-white px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-secondary-dark transition-colors shadow-sm whitespace-nowrap">
                        <Plus size={16} />
                        একটি গল্প শেয়ার করুন
                    </button>
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