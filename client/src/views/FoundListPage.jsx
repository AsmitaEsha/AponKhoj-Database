import { useState } from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Shirt, ArrowRight, SlidersHorizontal, ChevronLeft, ChevronRight, PanelLeftClose, PanelLeftOpen, Shield, Calendar } from 'lucide-react';

const avatar = (seed, gender, age) => {
    if (!seed) return `https://api.dicebear.com/7.x/shapes/png?seed=unknown&size=200&backgroundColor=d4ede9`;
    const style = gender === 'female' ? 'lorelei' : 'adventurer';
    const bg = gender === 'female' ? 'e8f5f2' : 'd4ede9';
    return `https://api.dicebear.com/7.x/${style}/png?seed=${encodeURIComponent(seed)}&size=300&backgroundColor=${bg}`;
};

const ALL_FOUND = [
    { id: 1, name: 'অচেনা বৃদ্ধ', age: 70, gender: 'male', division: 'ঢাকা', district: 'মিরপুর, ঢাকা', clothing: 'সাদা পাঞ্জাবি', foundAt: 'মিরপুর ১০ নং বাসস্ট্যান্ড', foundDate: '২ মার্চ, ২০২৫', seed: 'elder1', condition: 'স্বাভাবিক' },
    { id: 2, name: 'অচেনা নারী', age: 35, gender: 'female', division: 'চট্টগ্রাম', district: 'হালিশহর, চট্টগ্রাম', clothing: 'লাল শাড়ি', foundAt: 'চট্টগ্রাম রেলস্টেশন', foundDate: '২৮ ফেব্রুয়ারি, ২০২৫', seed: 'woman35', condition: 'চিকিৎসাধীন' },
    { id: 3, name: 'অচেনা কিশোর', age: 14, gender: 'male', division: 'ঢাকা', district: 'সাভার, ঢাকা', clothing: 'নীল জিন্স ও সবুজ শার্ট', foundAt: 'সাভার ইপিজেড গেট', foundDate: '১ মার্চ, ২০২৫', seed: 'boy14', condition: 'স্বাভাবিক' },
    { id: 4, name: 'অচেনা শিশু', age: 4, gender: 'female', division: 'রাজশাহী', district: 'রাজশাহী সদর', clothing: 'হলুদ ফ্রক', foundAt: 'রাজশাহী কেন্দ্রীয় উদ্যান', foundDate: '২৫ ফেব্রুয়ারি, ২০২৫', seed: '', condition: 'স্বাভাবিক' },
    { id: 5, name: 'অচেনা পুরুষ', age: 45, gender: 'male', division: 'সিলেট', district: 'জালালাবাদ, সিলেট', clothing: 'ধূসর শার্ট', foundAt: 'সিলেট শহীদ মিনার চত্বর', foundDate: '২০ ফেব্রুয়ারি, ২০২৫', seed: 'man45', condition: 'চিকিৎসাধীন' },
    { id: 6, name: 'অচেনা কিশোরী', age: 16, gender: 'female', division: 'খুলনা', district: 'খুলনা সদর', clothing: 'কমলা সালোয়ার কামিজ', foundAt: 'খুলনা বড় বাজার', foundDate: '15 ফেব্রুয়ারি, ২০২৫', seed: 'girl16', condition: 'স্বাভাবিক' },
    { id: 7, name: 'অচেনা বৃদ্ধা', age: 65, gender: 'female', division: 'বরিশাল', district: 'বরিশাল সদর', clothing: 'কালো বোরকা', foundAt: 'বরিশাল লঞ্চঘাট', foundDate: '১০ ফেব্রুয়ারি, ২০২৫', seed: 'old65', condition: 'চিকিৎসাধীন' },
    { id: 8, name: 'অচেনা পুরুষ', age: 30, gender: 'male', division: 'রংপুর', district: 'রংপুর সদর', clothing: 'কালো টি-শার্ট', foundAt: 'রংপুর পার্ক', foundDate: '৫ ফেব্রুয়ারি, ২০২৫', seed: 'man30', condition: 'স্বাভাবিক' },
    { id: 9, name: 'অচেনা শিশু', age: 6, gender: 'male', division: 'ময়মনসিংহ', district: 'ময়মনসিংহ সদর', clothing: 'লাল টি-শার্ট', foundAt: 'ময়মনসিংহ কৃষি বিশ্ববিদ্যালয় এলাকা', foundDate: '১ ফেব্রুয়ারি, ২০২৫', seed: 'child6', condition: 'স্বাভাবিক' },
    { id: 10, name: 'অচেনা নারী', age: 25, gender: 'female', division: 'ঢাকা', district: 'উত্তরা, ঢাকা', clothing: 'নীল ওড়না সহ সালোয়ার', foundAt: 'উত্তরা সেক্টর ৭', foundDate: '২৮ জানুয়ারি, ২০২৫', seed: 'woman25', condition: 'স্বাভাবিক' },
    { id: 11, name: 'অচেনা পুরুষ', age: 55, gender: 'male', division: 'চট্টগ্রাম', district: 'পতেঙ্গা, চট্টগ্রাম', clothing: 'সাদা লুঙ্গি ও গেঞ্জি', foundAt: 'পতেঙ্গা সমুদ্র সৈকত', foundDate: '২২ জানুয়ারি, ২০২৫', seed: 'man55', condition: 'চিকিৎসাধীন' },
    { id: 12, name: 'অচেনা কিশোরী', age: 13, gender: 'female', division: 'সিলেট', district: 'সুনামগঞ্জ', clothing: 'সবুজ কামিজ', foundAt: 'সুনামগঞ্জ বাসস্ট্যান্ড', foundDate: '১৫ জানুয়ারি, ২০২৫', seed: 'teen13', condition: 'স্বাভাবিক' },
];

const DIVISIONS = ['সব', 'ঢাকা', 'চট্টগ্রাম', 'রাজশাহী', 'খুলনা', 'বরিশাল', 'সিলেট', 'রংপুর', 'ময়মনসিংহ'];
const CONDITIONS = ['সব', 'স্বাভাবিক', 'চিকিৎসাধীন'];
const GENDERS = ['সবাই', 'পুরুষ', 'নারী'];
const SORT_OPTIONS = ['সর্বশেষ আগে', 'সবচেয়ে পুরনো', 'বয়স (কম-বেশি)'];
const COLORS = ['লাল', 'নীল', 'হলুদ', 'সাদা', 'কালো', 'সবুজ'];
const PER_PAGE = 6;

const conditionColor = c => c === 'স্বাভাবিক'
    ? 'bg-accent-teal/10 text-accent-teal'
    : 'bg-accent-red/10 text-accent-red';

export default function FoundListPage() {
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [activeDiv, setActiveDiv] = useState('সব');
    const [genderFilter, setGenderFilter] = useState('সবাই');
    const [conditionFilter, setConditionFilter] = useState('সব');
    const [ageRange, setAgeRange] = useState(100);
    const [selectedColors, setSelectedColors] = useState([]);
    const [sortBy, setSortBy] = useState('সর্বশেষ আগে');
    const [page, setPage] = useState(1);

    const toggleColor = c =>
        setSelectedColors(prev => prev.includes(c) ? prev.filter(x => x !== c) : [...prev, c]);

    const clearAll = () => {
        setActiveDiv('সব');
        setGenderFilter('সবাই');
        setConditionFilter('সব');
        setAgeRange(100);
        setSelectedColors([]);
        setPage(1);
    };

    const filtered = ALL_FOUND.filter(r => {
        if (activeDiv !== 'সব' && r.division !== activeDiv) return false;
        if (genderFilter === 'পুরুষ' && r.gender !== 'male') return false;
        if (genderFilter === 'নারী' && r.gender !== 'female') return false;
        if (conditionFilter !== 'সব' && r.condition !== conditionFilter) return false;
        if (r.age > ageRange) return false;
        return true;
    });

    const totalPages = Math.ceil(filtered.length / PER_PAGE);
    const paginated = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

    const Card = ({ r }) => (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-md transition-shadow group">
            {/* Sketch Avatar */}
            <div className="relative h-52 overflow-hidden bg-[#e8f5f2] flex items-center justify-center">
                <img
                    src={avatar(r.seed, r.gender, r.age)}
                    alt={r.name}
                    className="h-full w-full object-cover object-top group-hover:scale-105 transition-transform duration-300"
                    onError={e => { e.target.src = `https://api.dicebear.com/7.x/shapes/png?seed=${r.id}&size=300&backgroundColor=d4ede9`; }}
                />
                {/* Found badge */}
                <span className="absolute top-2 left-2 bg-accent-teal text-white text-[10px] font-bold px-2.5 py-1 rounded-full shadow">
                    পাওয়া গেছে
                </span>
                <span className={`absolute top-2 right-2 text-[10px] font-bold px-2.5 py-1 rounded-full ${conditionColor(r.condition)}`}>
                    {r.condition}
                </span>
            </div>

            {/* Info */}
            <div className="p-4">
                <div className="flex items-baseline gap-2 mb-2">
                    <h3 className="font-black text-gray-800 text-base">{r.name}</h3>
                    <span className="text-xs text-gray-400">~{r.age} বছর</span>
                </div>
                <div className="space-y-1.5 text-xs text-gray-500 mb-3">
                    <div className="flex items-center gap-1.5">
                        <Shield size={11} className="text-accent-teal flex-shrink-0" />
                        <span className="truncate">{r.foundAt}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <MapPin size={11} className="text-primary flex-shrink-0" />
                        <span>{r.district}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <Shirt size={11} className="text-gray-400 flex-shrink-0" />
                        <span>{r.clothing}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <Calendar size={11} className="text-gray-300 flex-shrink-0" />
                        <span className="text-gray-300">{r.foundDate}</span>
                    </div>
                </div>
                <Link to={`/emergency/${r.id}`}
                    className="flex items-center justify-center gap-1.5 w-full border border-accent-teal text-accent-teal text-xs py-2 rounded-xl hover:bg-accent-teal hover:text-white transition-colors font-medium">
                    বিস্তারিত দেখুন <ArrowRight size={12} />
                </Link>
            </div>
        </div>
    );

    return (
        <div className="bg-background min-h-screen">
            {/* Page Header */}
            <div className="bg-accent-teal text-white py-10 px-4">
                <div className="max-w-7xl mx-auto">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                            <Shield size={20} />
                        </div>
                        <h1 className="text-3xl font-black">উদ্ধারকৃত তালিকা</h1>
                    </div>
                    <p className="text-white/70 text-sm max-w-xl">
                        পুলিশ, হাসপাতাল ও স্বেচ্ছাসেবীদের দ্বারা উদ্ধার হওয়া অজ্ঞাত পরিচয়ের ব্যক্তিদের তালিকা।
                        আপনার পরিচিত কেউ থাকলে যোগাযোগ করুন।
                    </p>
                    <div className="flex flex-wrap gap-4 mt-5 text-sm">
                        {[['১২', 'মোট উদ্ধার'], ['৮', 'পরিচয় অনিশ্চিত'], ['৪', 'চিকিৎসাধীন']].map(([v, l]) => (
                            <div key={l} className="bg-white/10 rounded-xl px-4 py-2 text-center">
                                <p className="font-black text-lg">{v}</p>
                                <p className="text-white/60 text-xs">{l}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 py-6 flex gap-6">
                {/* ── Sidebar ── */}
                <aside className={`flex-shrink-0 transition-all duration-300 ease-in-out overflow-hidden ${sidebarOpen ? 'w-52' : 'w-10'}`}>
                    <div className="relative">
                        {/* Toggle button */}
                        <button
                            onClick={() => setSidebarOpen(o => !o)}
                            className={`flex items-center justify-center w-8 h-8 rounded-lg bg-white border border-gray-200 shadow-sm text-accent-teal hover:bg-accent-teal hover:text-white transition-all mb-3 ${sidebarOpen ? 'ml-auto mr-0' : 'mx-auto'}`}>
                            {sidebarOpen ? <PanelLeftClose size={15} /> : <PanelLeftOpen size={15} />}
                        </button>

                        {/* Collapsed mini icons */}
                        {!sidebarOpen && (
                            <div className="flex flex-col items-center gap-3 pt-1">
                                <button onClick={() => setSidebarOpen(true)} className="text-gray-400 hover:text-accent-teal transition-colors"><SlidersHorizontal size={16} /></button>
                                <button onClick={() => setSidebarOpen(true)} className="text-[10px] font-bold text-gray-400 hover:text-accent-teal">বয়স</button>
                                <button onClick={() => setSidebarOpen(true)} className="text-[10px] font-bold text-gray-400 hover:text-accent-teal">রঙ</button>
                            </div>
                        )}

                        {/* Expanded panel */}
                        {sidebarOpen && (
                            <div className="space-y-5 w-52">
                                {/* Header */}
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-1.5 font-black text-gray-800">
                                        <SlidersHorizontal size={16} className="text-accent-teal" />
                                        ফিল্টার
                                    </div>
                                    <button onClick={clearAll} className="text-xs text-accent-teal hover:underline">সব মুছুন</button>
                                </div>

                                {/* Division */}
                                <div>
                                    <p className="text-xs font-bold text-gray-600 mb-2">বিভাগ</p>
                                    <select value={activeDiv} onChange={e => { setActiveDiv(e.target.value); setPage(1); }}
                                        className="w-full border border-gray-200 rounded-xl p-2 text-xs text-gray-700 focus:outline-none focus:ring-2 focus:ring-accent-teal/30 bg-white">
                                        {DIVISIONS.map(d => <option key={d}>{d}</option>)}
                                    </select>
                                </div>

                                {/* Gender */}
                                <div>
                                    <p className="text-xs font-bold text-gray-600 mb-2">লিঙ্গ</p>
                                    <div className="grid grid-cols-3 gap-1 bg-gray-100 p-1 rounded-xl">
                                        {GENDERS.map(g => (
                                            <button key={g} onClick={() => { setGenderFilter(g); setPage(1); }}
                                                className={`text-[10px] py-1.5 rounded-lg font-medium transition-all ${genderFilter === g ? 'bg-white shadow text-accent-teal' : 'text-gray-500'}`}>
                                                {g}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Condition */}
                                <div>
                                    <p className="text-xs font-bold text-gray-600 mb-2">শারীরিক অবস্থা</p>
                                    <div className="space-y-1">
                                        {CONDITIONS.map(c => (
                                            <button key={c} onClick={() => { setConditionFilter(c); setPage(1); }}
                                                className={`w-full text-left text-xs px-3 py-2 rounded-xl border transition-all ${conditionFilter === c ? 'border-accent-teal bg-accent-teal/5 text-accent-teal font-bold' : 'border-gray-100 text-gray-600 hover:border-accent-teal/40'}`}>
                                                {c}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Age Slider */}
                                <div>
                                    <p className="text-xs font-bold text-gray-600 mb-1">বয়সসীমা</p>
                                    <div className="flex justify-between text-[10px] text-gray-400 mb-2">
                                        <span>০ বছর</span><span>{ageRange} বছর</span>
                                    </div>
                                    <input type="range" min="0" max="100" value={ageRange}
                                        onChange={e => { setAgeRange(+e.target.value); setPage(1); }}
                                        className="w-full h-1.5 bg-gray-200 rounded-full appearance-none cursor-pointer accent-accent-teal" />
                                </div>

                                {/* Clothing Color */}
                                <div>
                                    <p className="text-xs font-bold text-gray-600 mb-2">পোশাকের রঙ</p>
                                    <div className="flex flex-wrap gap-1">
                                        {COLORS.map(c => (
                                            <button key={c} onClick={() => toggleColor(c)}
                                                className={`text-[10px] px-2 py-1 rounded-full border transition-all ${selectedColors.includes(c) ? 'bg-accent-teal text-white border-accent-teal' : 'border-gray-200 text-gray-600 hover:border-accent-teal hover:text-accent-teal'}`}>
                                                {c}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </aside>

                {/* ── Main Content ── */}
                <main className="flex-1 min-w-0">
                    {/* Division Pills */}
                    <div className="flex items-center gap-2 mb-5 overflow-x-auto pb-1">
                        {DIVISIONS.map(d => (
                            <button key={d} onClick={() => { setActiveDiv(d); setPage(1); }}
                                className={`flex-shrink-0 px-4 py-1.5 rounded-full text-sm font-medium transition-all border ${activeDiv === d ? 'bg-accent-teal text-white border-accent-teal shadow-sm' : 'bg-white text-gray-600 border-gray-200 hover:border-accent-teal hover:text-accent-teal'}`}>
                                {d}
                            </button>
                        ))}
                    </div>

                    {/* Title + Sort */}
                    <div className="flex items-start justify-between gap-4 mb-4">
                        <div>
                            <h2 className="text-xl font-black text-gray-800">উদ্ধার হওয়া অজ্ঞাত ব্যক্তি</h2>
                            <p className="text-xs text-gray-400 mt-0.5">{filtered.length}টি রেকর্ড পাওয়া গেছে</p>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                            <span className="text-xs text-gray-400 whitespace-nowrap">সর্ট:</span>
                            <select value={sortBy} onChange={e => setSortBy(e.target.value)}
                                className="text-xs border border-gray-200 rounded-lg px-2 py-1.5 focus:outline-none bg-white text-gray-700">
                                {SORT_OPTIONS.map(o => <option key={o}>{o}</option>)}
                            </select>
                        </div>
                    </div>

                    {/* Cards */}
                    {filtered.length === 0 ? (
                        <div className="text-center py-20">
                            <div className="text-4xl mb-3">🔍</div>
                            <p className="text-gray-500 font-medium">কোনো রেকর্ড পাওয়া যায়নি</p>
                            <button onClick={clearAll} className="mt-3 text-sm text-accent-teal hover:underline">ফিল্টার সাফ করুন</button>
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
                            {paginated.map(r => <Card key={r.id} r={r} />)}
                        </div>
                    )}

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className="flex items-center justify-center gap-1">
                            <button onClick={() => {
                                setPage(p => Math.max(1, p - 1));
                                window.scrollTo({ top: 0, behavior: 'smooth' });
                            }} disabled={page === 1}
                                className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 text-gray-500 hover:border-accent-teal hover:text-accent-teal disabled:opacity-30 transition-colors">
                                <ChevronLeft size={14} />
                            </button>
                            {Array.from({ length: totalPages }, (_, i) => i + 1).map(n => (
                                <button key={n} onClick={() => {
                                    setPage(n);
                                    window.scrollTo({ top: 0, behavior: 'smooth' });
                                }}
                                    className={`w-8 h-8 rounded-lg text-sm font-medium transition-all ${page === n ? 'bg-accent-teal text-white shadow-sm' : 'border border-gray-200 text-gray-600 hover:border-accent-teal hover:text-accent-teal'}`}>
                                    {n}
                                </button>
                            ))}
                            <button onClick={() => {
                                setPage(p => Math.min(totalPages, p + 1));
                                window.scrollTo({ top: 0, behavior: 'smooth' });
                            }} disabled={page === totalPages}
                                className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 text-gray-500 hover:border-accent-teal hover:text-accent-teal disabled:opacity-30 transition-colors">
                                <ChevronRight size={14} />
                            </button>
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
}