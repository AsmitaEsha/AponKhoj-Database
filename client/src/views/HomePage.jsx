import { Link } from 'react-router-dom';
import { Search, ArrowRight, Users, MapPin, CheckCircle, AlertTriangle, Heart, Zap } from 'lucide-react';

const DIVISIONS = ['ঢাকা', 'চট্টগ্রাম', 'রাজশাহী', 'খুলনা', 'বরিশাল', 'সিলেট', 'রংপুর', 'ময়মনসিংহ'];

const STEPS = [
    { icon: Search, label: 'রিপোর্ট করুন', desc: 'নিখোঁজ বা উদ্ধার হওয়া ব্যক্তির তথ্য জমা দিন', color: 'bg-secondary/10 text-secondary' },
    { icon: Zap, label: 'AI-চালিত স্মার্ট সনাক্তকরণ', desc: 'AI ফেস রিকগনিশন মাধ্যমে তথ্য বিশ্লেষণ করে সম্ভাব্য মিল খুঁজে বের করা হয়।', color: 'bg-accent-teal/10 text-accent-teal' },
    { icon: Heart, label: 'পুনর্মিলন', desc: 'পরিবার ও প্রিয়জন একত্রিত হন', color: 'bg-primary/10 text-primary' },
];

const avatar = (seed, gender, type = 'missing') => {
    if (!seed) return `https://api.dicebear.com/7.x/shapes/png?seed=unknown&size=200&backgroundColor=f3f4f6`;
    const style = gender === 'female' ? 'lorelei' : 'adventurer';
    const bg = type === 'missing' ? 'ffe4e6' : 'd4ede9'; 
    return `https://api.dicebear.com/7.x/${style}/png?seed=${encodeURIComponent(seed)}&size=300&backgroundColor=${bg}`;
};

const RECENT = [
    { id: 1, name: 'রহিম উদ্দিন', age: 45, gender: 'male', division: 'ঢাকা', district: 'মিরপুর, ঢাকা', date: '২ দিন আগে', status: 'missing', seed: 'rahim' },
    { id: 2, name: 'সুমাইয়া বেগম', age: 28, gender: 'female', division: 'চট্টগ্রাম', district: 'হালিশহর, চট্টগ্রাম', date: '৩ দিন আগে', status: 'found', seed: 'sumaiya' },
    { id: 3, name: 'আনোয়ার হোসেন', age: 60, gender: 'male', division: 'খুলনা', district: 'কয়রা, খুলনা', date: '৫ দিন আগে', status: 'missing', seed: 'anwar' },
];

const HomePage = () => {
    return (
        <div className="bg-background min-h-screen overflow-x-hidden">

            {/* ── Hero Section ── */}
            <section className="relative overflow-hidden bg-gradient-to-br from-primary via-primary to-[#0c2e20] py-20 px-4">
                {/* Decorative circles */}
                <div className="absolute top-0 right-0 w-96 h-96 bg-secondary/20 rounded-full translate-x-1/2 -translate-y-1/2 blur-3xl pointer-events-none" />
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-accent-teal/20 rounded-full -translate-x-1/3 translate-y-1/3 blur-2xl pointer-events-none" />

                <div className="max-w-7xl mx-auto relative z-10 flex flex-col items-center justify-center text-center">
                    <div className="max-w-4xl">
                        <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-white leading-tight mb-4 tracking-tight drop-shadow-sm">
                            হারিয়ে যাওয়া প্রিয়জনকে<br className="hidden md:block" /> খুঁজুন <span className="text-[#ff5a2c]">আপনখোঁজে</span>
                        </h1>

                        <p className="text-white/80 text-base md:text-lg max-w-2xl mx-auto mb-10 md:mb-12 leading-relaxed px-4">
                            AI-চালিত ফেস রিকগনিশন, SMS আলার্ট এবং কমিউনিটি-ভিত্তিক রিপোর্টিং — একটি প্ল্যাটফর্মে।
                        </p>

                        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3 sm:gap-4 w-full px-4 sm:px-0">
                            <Link to="/report/missing"
                                className="w-full sm:w-auto flex items-center justify-center gap-2 bg-[#ff5a2c] hover:bg-[#e0451b] text-white px-6 sm:px-8 py-3 sm:py-3.5 rounded-xl font-bold text-sm shadow-xl shadow-[#ff5a2c]/20 transition-all"
                            >
                                <Search size={18} /> নিখোঁজ রিপোর্ট করুন
                            </Link>
                            <Link to="/report/found"
                                className="w-full sm:w-auto flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20 text-white px-6 sm:px-8 py-3 sm:py-3.5 rounded-xl font-bold text-sm transition-all shadow-lg"
                            >
                                <Users size={18} /> উদ্ধার তথ্য যোগ করুন
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            {/* ── Stats Strip ── */}
            <section className="bg-white border-b border-gray-100 py-4 sm:py-6 px-4 shadow-sm">
                <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-gray-100 gap-4 sm:gap-0">
                    {[
                        { icon: Search, value: '০', label: 'রিপোর্ট জমা', color: 'text-secondary' },
                        { icon: CheckCircle, value: '০', label: 'সফল পুনর্মিলন', color: 'text-accent-teal' },
                        { icon: MapPin, value: '৬৪', label: 'জেলা কভারেজ', color: 'text-primary' },
                    ].map(s => (
                        <div key={s.label} className="flex flex-row sm:flex-col lg:flex-row items-center justify-center sm:justify-center lg:justify-center gap-3 py-2 sm:py-0 px-4 text-center sm:text-left">
                            <div className={`w-12 h-12 sm:w-10 sm:h-10 rounded-xl bg-gray-50 flex items-center justify-center flex-shrink-0 ${s.color}`}>
                                <s.icon size={22} className="sm:w-5 sm:h-5" />
                            </div>
                            <div className="text-left sm:text-center lg:text-left">
                                <p className={`text-xl sm:text-xl font-black ${s.color}`}>{s.value}</p>
                                <p className="text-xs sm:text-xs text-gray-500">{s.label}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* ── Search Section ── */}
            <section className="max-w-7xl mx-auto px-4 py-12">
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                    <h3 className="text-base font-bold text-gray-700 mb-4 text-center sm:text-left">অনুসন্ধান করুন</h3>
                    <div className="flex flex-col lg:flex-row gap-4 items-stretch lg:items-end">
                        <div className="flex-1">
                            <label className="block text-xs text-gray-500 mb-1">অবস্থান</label>
                            <select className="w-full border border-gray-200 rounded-xl p-2.5 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary/30 bg-white">
                                <option value="">স্থান নির্বাচন করুন</option>
                                {DIVISIONS.map(d => <option key={d} value={d}>{d}</option>)}
                            </select>
                        </div>
                        <div className="flex-1">
                            <label className="block text-xs text-gray-500 mb-1">বয়স</label>
                            <input type="text" placeholder="বয়স লিখুন" className="w-full border border-gray-200 rounded-xl p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
                        </div>
                        <div className="flex-1">
                            <label className="block text-xs text-gray-500 mb-1">লিঙ্গ</label>
                            <select className="w-full border border-gray-200 rounded-xl p-2.5 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary/30 bg-white">
                                <option>উভয়</option>
                                <option>পুরুষ</option>
                                <option>নারী</option>
                            </select>
                        </div>
                        <div className="flex-1">
                            <label className="block text-xs text-gray-500 mb-1">অবস্থা</label>
                            <select className="w-full border border-gray-200 rounded-xl p-2.5 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary/30 bg-white">
                                <option>সব</option>
                                <option>নিখোঁজ</option>
                                <option>পাওয়া গেছে</option>
                            </select>
                        </div>
                        <div className="w-full lg:w-auto mt-2 lg:mt-0">
                            <Link to="/search"
                                className="w-full lg:w-auto flex justify-center items-center gap-2 bg-primary hover:bg-primary-dark text-white px-7 py-3 lg:py-2.5 rounded-xl text-sm font-bold whitespace-nowrap transition-colors shadow-md"
                            >
                                <Search size={16} /> অনুসন্ধান
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            {/* ── How it Works ── */}
            <section className="bg-gray-50 py-14 px-4">
                <div className="max-w-7xl mx-auto">
                    <h2 className="text-3xl font-black text-gray-800 text-center mb-2">কীভাবে কাজ করে</h2>
                    <p className="text-center text-gray-400 text-sm mb-10">মাত্র ৩টি ধাপে প্রিয়জনকে খুঁজুন</p>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {STEPS.map((s, i) => (
                            <div key={s.label} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 text-center relative">
                                <div className="absolute -top-3 -left-3 w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center text-xs font-black">
                                    {i + 1}
                                </div>
                                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4 ${s.color}`}>
                                    <s.icon size={26} />
                                </div>
                                <h3 className="font-black text-gray-800 mb-2">{s.label}</h3>
                                <p className="text-sm text-gray-400 leading-relaxed">{s.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── Recent Reports ── */}
            <section className="max-w-7xl mx-auto px-4 py-14">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h2 className="text-2xl font-black text-gray-800">সাম্প্রতিক রিপোর্ট</h2>
                        <p className="text-sm text-gray-400 mt-0.5">সর্বশেষ জমা দেওয়া রিপোর্ট</p>
                    </div>
                    <Link to="/search" className="flex items-center gap-1 text-sm text-primary font-medium hover:underline">
                        সব দেখুন <ArrowRight size={14} />
                    </Link>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                    {RECENT.map(r => (
                        <div key={r.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-md transition-shadow group flex flex-col h-full">
                            <div className="relative h-48 overflow-hidden bg-gray-50 flex items-center justify-center">
                                <img src={avatar(r.seed, r.gender, r.status)} alt={r.name} className="h-full w-full object-cover object-top group-hover:scale-105 transition-transform duration-300" />
                                <span className={`absolute top-2 left-2 text-[10px] font-bold px-2.5 py-1 rounded-full shadow ${r.status === 'missing' ? 'bg-[#ff5a2c] text-white' : 'bg-accent-teal text-white'}`}>
                                    {r.status === 'missing' ? 'নিখোঁজ' : 'পাওয়া গেছে'}
                                </span>
                            </div>
                            <div className="p-4 flex flex-col flex-1">
                                <div className="flex items-baseline gap-2 mb-2">
                                    <h3 className="font-black text-gray-800 text-base">{r.name}</h3>
                                    <span className="text-xs text-gray-400">~{r.age} বছর</span>
                                </div>
                                <div className="space-y-1.5 text-xs text-gray-500 mb-4 flex-1">
                                    <div className="flex items-center gap-1.5">
                                        <MapPin size={11} className="text-[#1B4332] flex-shrink-0" />
                                        <span>{r.district}</span>
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                        <div className="w-[11px] h-[11px] rounded flex items-center justify-center bg-gray-100 flex-shrink-0">
                                            <span className="text-[8px] font-bold text-gray-400">{r.status === 'missing' ? 'T' : 'D'}</span>
                                        </div>
                                        <span className="text-gray-400">{r.date}</span>
                                    </div>
                                </div>
                                <Link to={`/search/${r.id}`} className="flex items-center justify-center gap-1 w-full border border-gray-200 text-gray-600 text-xs py-2 rounded-xl hover:border-primary hover:text-primary transition-colors font-medium">
                                    বিস্তারিত দেখুন
                                </Link>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* ── CTA Banner ── */}
            <section className="bg-primary mx-4 mb-14 rounded-3xl py-14 px-6 text-center relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-secondary/20 to-accent-teal/20" />
                <div className="relative z-10">
                    <h2 className="text-3xl font-black text-white mb-3">আজই সাহায্য করুন</h2>
                    <p className="text-white/70 text-sm mb-8 max-w-md mx-auto">
                        একটি শেয়ার একটি পরিবারের জীবন বদলে দিতে পারে। সামাজিক মাধ্যমে ছড়িয়ে দিন।
                    </p>
                    <div className="flex flex-col sm:flex-row justify-center gap-3">
                        <Link to="/register" className="w-full sm:w-auto bg-secondary text-white px-7 py-3 rounded-xl font-bold text-sm hover:bg-secondary-dark transition-colors shadow-lg">
                            রেজিস্ট্রেশন করুন
                        </Link>
                        <Link to="/search-page" className="w-full sm:w-auto bg-white/10 border border-white/20 text-white px-7 py-3 rounded-xl font-bold text-sm hover:bg-white/20 transition-colors">
                            তালিকা দেখুন
                        </Link>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default HomePage;
