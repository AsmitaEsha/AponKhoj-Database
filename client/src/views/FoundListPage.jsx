import { useState, useEffect, useRef, useCallback } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import {
    MapPin, Shirt, ArrowRight, SlidersHorizontal, ChevronLeft, ChevronRight,
    PanelLeftClose, PanelLeftOpen, Shield, Calendar, Search, X, Loader2,
} from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// ── Constants ──────────────────────────────────────────────────────────────
const DISTRICTS = [
    'ঢাকা', 'চট্টগ্রাম', 'সিলেট', 'রাজশাহী', 'খুলনা',
    'বরিশাল', 'রংপুর', 'ময়মনসিংহ', 'গাজীপুর', 'নারায়ণগঞ্জ',
    'কুমিল্লা', 'বগুড়া', 'রাজবাড়ী', 'টাঙ্গাইল', 'ফরিদপুর',
    'নোয়াখালী', 'কক্সবাজার', 'যশোর', 'খাগড়াছড়ি', 'পটুয়াখালী',
    'দিনাজপুর', 'রাঙামাটি', 'বান্দরবান', 'নেত্রকোণা', 'শেরপুর',
    'ঝিনাইদহ', 'মাগুরা', 'নড়াইল', 'চুয়াডাঙ্গা', 'মেহেরপুর',
    'সাতক্ষীরা', 'বাগেরহাট', 'পিরোজপুর', 'ঝালকাঠি', 'বরগুনা',
    'ভোলা', 'লক্ষ্মীপুর', 'চাঁদপুর', 'ফেনী', 'ব্রাহ্মণবাড়িয়া',
    'হবিগঞ্জ', 'মৌলভীবাজার', 'সুনামগঞ্জ', 'কিশোরগঞ্জ', 'নরসিংদী',
    'মানিকগঞ্জ', 'মুন্সিগঞ্জ', 'শরীয়তপুর', 'মাদারীপুর', 'গোপালগঞ্জ',
    'পাবনা', 'সিরাজগঞ্জ', 'নাটোর', 'নওগাঁ', 'জয়পুরহাট',
    'চাঁপাইনবাবগঞ্জ', 'কুষ্টিয়া', 'নীলফামারী', 'লালমনিরহাট',
    'কুড়িগ্রাম', 'গাইবান্ধা', 'ঠাকুরগাঁও', 'পঞ্চগড়',
];

const DIVISIONS = [
    'পুরো বাংলাদেশ', 'ঢাকা', 'চট্টগ্রাম', 'সিলেট', 'রাজশাহী', 'খুলনা', 'বরিশাল', 'রংপুর', 'ময়মনসিংহ',
];

const SORT_OPTIONS = [
    { value: 'newest',  label: 'সর্বশেষ আগে' },
    { value: 'oldest',  label: 'সবচেয়ে পুরনো' },
    { value: 'age_asc', label: 'বয়স (কম → বেশি)' },
    { value: 'age_desc',label: 'বয়স (বেশি → কম)' },
];

const GENDER_OPTIONS = [
    { value: 'all',    label: 'সকল' },
    { value: 'male',   label: 'পুরুষ' },
    { value: 'female', label: 'নারী' },
    { value: 'other',  label: 'অন্যান্য' },
];

const PER_PAGE = 9;
const DEBOUNCE_MS = 500;

// ── Helpers ────────────────────────────────────────────────────────────────
const avatar = (seed, gender) => {
    if (!seed) return `https://api.dicebear.com/7.x/shapes/png?seed=unknown&size=200&backgroundColor=d4ede9`;
    const style = gender === 'female' ? 'lorelei' : 'adventurer';
    const bg    = gender === 'female' ? 'e8f5f2' : 'd4ede9';
    return `https://api.dicebear.com/7.x/${style}/png?seed=${encodeURIComponent(seed)}&size=300&backgroundColor=${bg}`;
};

const normalizeReport = (r) => ({
    id:         r.id,
    name:       r.name || 'অজ্ঞাত',
    age:        r.age ?? null,
    gender:     r.gender || 'other',
    district:   r.district || 'অজানা',
    foundAt:    r.address ? `${r.address}, ${r.district}` : (r.district || 'অজানা'),
    clothing:   r.clothingDescription || 'উল্লেখ নেই',
    foundDate:  r.foundDate || r.createdAt || '—',
    photoUrl:   r.photoUrl || '',
    contactPersonName: r.contactPersonName,
});

function activeFilterCount(filters) {
    let n = 0;
    if (filters.district && filters.district !== 'all') n++;
    if (filters.gender   && filters.gender   !== 'all') n++;
    if (filters.age_min > 0)   n++;
    if (filters.age_max < 100) n++;
    if (filters.search.trim()) n++;
    return n;
}

async function fetchFoundReports(filters) {
    try {
        const params = new URLSearchParams();
        if (filters.district && filters.district !== 'all') params.set('district', filters.district);
        if (filters.gender   && filters.gender   !== 'all') params.set('gender',   filters.gender);
        if (filters.age_min > 0)   params.set('age_min',  filters.age_min);
        if (filters.age_max < 100) params.set('age_max',  filters.age_max);
        if (filters.search.trim()) params.set('search',   filters.search.trim());
        if (filters.sort && filters.sort !== 'newest') params.set('sort', filters.sort);
        if (filters.page > 1)      params.set('page',     filters.page);
        params.set('per_page', filters.per_page);

        const qs  = params.toString();
        const url = `${API_URL}/found-reports/published${qs ? `?${qs}` : ''}`;
        const res = await axios.get(url);

        return {
            success:  true,
            reports:  res.data.reports  || [],
            total:    res.data.total    || 0,
            last_page:res.data.last_page || 1,
            current_page: res.data.current_page || 1,
        };
    } catch (err) {
        return {
            success:   false,
            reports:   [],
            total:     0,
            last_page: 1,
            current_page: 1,
            message:   err.response?.data?.message || err.message || 'Failed to fetch reports',
        };
    }
}

// ── Card ───────────────────────────────────────────────────────────────────
const Card = ({ r }) => (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-md transition-shadow group">
        <div className="relative h-52 overflow-hidden bg-[#e8f5f2] flex items-center justify-center">
            <img
                src={r.photoUrl || avatar(r.name, r.gender)}
                alt={r.name}
                className="h-full w-full object-cover object-top group-hover:scale-105 transition-transform duration-300"
                onError={e => { e.target.src = `https://api.dicebear.com/7.x/shapes/png?seed=${r.id}&size=300&backgroundColor=d4ede9`; }}
            />
            <span className="absolute top-2 left-2 bg-accent-teal text-white text-[10px] font-bold px-2.5 py-1 rounded-full shadow">
                পাওয়া গেছে
            </span>
        </div>
        <div className="p-4">
            <div className="flex items-baseline gap-2 mb-2">
                <h3 className="font-black text-gray-800 text-base">{r.name}</h3>
                {r.age && <span className="text-xs text-gray-400">~{r.age} বছর</span>}
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
                    <span className="line-clamp-1">{r.clothing}</span>
                </div>
                <div className="flex items-center gap-1.5">
                    <Calendar size={11} className="text-gray-300 flex-shrink-0" />
                    <span className="text-gray-300">{r.foundDate}</span>
                </div>
            </div>
            <Link to={`/report/f-${r.id}`}
                className="flex items-center justify-center gap-1.5 w-full border border-accent-teal text-accent-teal text-xs py-2 rounded-xl hover:bg-accent-teal hover:text-white transition-colors font-medium">
                বিস্তারিত দেখুন <ArrowRight size={12} />
            </Link>
        </div>
    </div>
);

// ── Skeleton ───────────────────────────────────────────────────────────────
const CardSkeleton = () => (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden animate-pulse">
        <div className="h-52 bg-gray-200" />
        <div className="p-4 space-y-2">
            <div className="h-4 bg-gray-200 rounded w-3/4" />
            <div className="h-3 bg-gray-100 rounded w-1/2" />
            <div className="h-3 bg-gray-100 rounded w-full" />
            <div className="h-8 bg-gray-100 rounded-xl mt-3" />
        </div>
    </div>
);

// ── Main Component ─────────────────────────────────────────────────────────
export default function FoundListPage() {
    const DEFAULT_FILTERS = {
        district: 'all',
        gender:   'all',
        age_min:  0,
        age_max:  100,
        search:   '',
        sort:     'newest',
        page:     1,
        per_page: PER_PAGE,
    };

    const [filters,     setFilters]     = useState(DEFAULT_FILTERS);
    const [draftSearch, setDraftSearch] = useState('');
    const [sidebarOpen, setSidebarOpen] = useState(true);

    const [reports,  setReports]  = useState([]);
    const [total,    setTotal]    = useState(0);
    const [lastPage, setLastPage] = useState(1);
    const [loading,  setLoading]  = useState(true);
    const [error,    setError]    = useState('');

    const debounceRef = useRef(null);
    const mountedRef  = useRef(true);

    // Fetch whenever filters change
    useEffect(() => {
        mountedRef.current = true;
        const load = async () => {
            setLoading(true);
            setError('');
            const result = await fetchFoundReports(filters);
            if (!mountedRef.current) return;
            if (result.success) {
                setReports(result.reports.map(normalizeReport));
                setTotal(result.total);
                setLastPage(result.last_page);
            } else {
                setReports([]);
                setTotal(0);
                setLastPage(1);
                setError(result.message || 'রিপোর্ট লোড করা যায়নি');
            }
            setLoading(false);
        };
        load();
        return () => { mountedRef.current = false; };
    }, [filters]);

    const handleSearchInput = (value) => {
        setDraftSearch(value);
        clearTimeout(debounceRef.current);
        debounceRef.current = setTimeout(() => {
            setFilters(f => ({ ...f, search: value, page: 1 }));
        }, DEBOUNCE_MS);
    };

    const setFilter = useCallback((key, value) => {
        setFilters(f => ({ ...f, [key]: value, page: 1 }));
    }, []);

    const goToPage = useCallback((p) => {
        setFilters(f => ({ ...f, page: p }));
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }, []);

    const clearAll = () => {
        setDraftSearch('');
        clearTimeout(debounceRef.current);
        setFilters(DEFAULT_FILTERS);
    };

    const filterBadgeCount = activeFilterCount(filters);

    const paginationPages = () => {
        const pages = [];
        for (let i = 1; i <= lastPage; i++) {
            if (i === 1 || i === lastPage || Math.abs(i - filters.page) <= 1) {
                pages.push(i);
            } else if (
                (i === 2 && filters.page > 4) ||
                (i === lastPage - 1 && filters.page < lastPage - 3)
            ) {
                pages.push('...');
            }
        }
        return pages.filter((v, i, a) => !(v === '...' && a[i - 1] === '...'));
    };

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
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 py-6 flex gap-6">
                {/* ── Sidebar ── */}
                <aside className={`flex-shrink-0 transition-all duration-300 ease-in-out overflow-hidden ${sidebarOpen ? 'w-56' : 'w-10'}`}>
                    <div className="relative">
                        {/* Toggle button */}
                        <button
                            onClick={() => setSidebarOpen(o => !o)}
                            title={sidebarOpen ? 'ফিল্টার লুকান' : 'ফিল্টার দেখুন'}
                            className="relative flex items-center justify-center w-8 h-8 rounded-lg bg-white border border-gray-200 shadow-sm text-accent-teal hover:bg-accent-teal hover:text-white transition-all"
                        >
                            {sidebarOpen ? <PanelLeftClose size={15} /> : <PanelLeftOpen size={15} />}
                            {!sidebarOpen && filterBadgeCount > 0 && (
                                <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-primary text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                                    {filterBadgeCount}
                                </span>
                            )}
                        </button>

                        {/* Expanded panel */}
                        {sidebarOpen && (
                            <div className="space-y-5 w-56 mt-4">
                                {/* Header */}
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-1.5 font-black text-gray-800">
                                        <SlidersHorizontal size={16} className="text-accent-teal" />
                                        ফিল্টার
                                        {filterBadgeCount > 0 && (
                                            <span className="ml-1 px-1.5 py-0.5 bg-accent-teal text-white text-[10px] font-bold rounded-full">
                                                {filterBadgeCount}
                                            </span>
                                        )}
                                    </div>
                                    {filterBadgeCount > 0 && (
                                        <button onClick={clearAll} className="text-xs text-accent-teal hover:underline flex items-center gap-0.5">
                                            <X size={11} /> মুছুন
                                        </button>
                                    )}
                                </div>

                                {/* Name Search */}
                                <div>
                                    <p className="text-xs font-bold text-gray-600 mb-2">নাম খুঁজুন</p>
                                    <div className="relative">
                                        <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
                                        <input
                                            type="text"
                                            value={draftSearch}
                                            onChange={e => handleSearchInput(e.target.value)}
                                            placeholder="ব্যক্তির নাম..."
                                            className="w-full pl-7 pr-7 py-2 border border-gray-200 rounded-xl text-xs text-gray-700 focus:outline-none focus:ring-2 focus:ring-accent-teal/30"
                                        />
                                        {draftSearch && (
                                            <button
                                                onClick={() => { setDraftSearch(''); setFilter('search', ''); }}
                                                className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                            >
                                                <X size={12} />
                                            </button>
                                        )}
                                    </div>
                                </div>

                                {/* District Dropdown */}
                                <div>
                                    <p className="text-xs font-bold text-gray-600 mb-2">জেলা</p>
                                    <select
                                        value={filters.district}
                                        onChange={e => setFilter('district', e.target.value)}
                                        className="w-full border border-gray-200 rounded-xl p-2 text-xs text-gray-700 focus:outline-none focus:ring-2 focus:ring-accent-teal/30 bg-white"
                                    >
                                        <option value="all">সকল জেলা</option>
                                        {DISTRICTS.map(d => <option key={d} value={d}>{d}</option>)}
                                    </select>
                                </div>

                                {/* Gender Filter */}
                                <div>
                                    <p className="text-xs font-bold text-gray-600 mb-2">লিঙ্গ</p>
                                    <div className="flex flex-wrap gap-1.5">
                                        {GENDER_OPTIONS.map(g => (
                                            <button
                                                key={g.value}
                                                onClick={() => setFilter('gender', g.value)}
                                                className={`text-[11px] px-3 py-1 rounded-full border transition-all ${
                                                    filters.gender === g.value
                                                        ? 'bg-accent-teal text-white border-accent-teal'
                                                        : 'border-gray-200 text-gray-600 hover:border-accent-teal hover:text-accent-teal'
                                                }`}
                                            >
                                                {g.label}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Age Range */}
                                <div>
                                    <div className="flex items-center justify-between mb-1">
                                        <p className="text-xs font-bold text-gray-600">বয়সসীমা</p>
                                        <span className="text-[10px] text-gray-500 font-medium bg-gray-100 px-2 py-0.5 rounded-full">
                                            {filters.age_min}–{filters.age_max} বছর
                                        </span>
                                    </div>
                                    <div className="space-y-2">
                                        <div>
                                            <div className="flex justify-between text-[10px] text-gray-400 mb-1">
                                                <span>সর্বনিম্ন</span><span>{filters.age_min} বছর</span>
                                            </div>
                                            <input
                                                type="range" min="0" max="99" step="1"
                                                value={filters.age_min}
                                                onChange={e => {
                                                    const val = Math.min(+e.target.value, filters.age_max - 1);
                                                    setFilter('age_min', val);
                                                }}
                                                className="w-full h-1.5 bg-gray-200 rounded-full appearance-none cursor-pointer accent-accent-teal"
                                            />
                                        </div>
                                        <div>
                                            <div className="flex justify-between text-[10px] text-gray-400 mb-1">
                                                <span>সর্বোচ্চ</span><span>{filters.age_max} বছর</span>
                                            </div>
                                            <input
                                                type="range" min="1" max="100" step="1"
                                                value={filters.age_max}
                                                onChange={e => {
                                                    const val = Math.max(+e.target.value, filters.age_min + 1);
                                                    setFilter('age_max', val);
                                                }}
                                                className="w-full h-1.5 bg-gray-200 rounded-full appearance-none cursor-pointer accent-accent-teal"
                                            />
                                        </div>
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
                        {DIVISIONS.map(d => {
                            const val = d === 'পুরো বাংলাদেশ' ? 'all' : d;
                            const isActive = filters.district === val;
                            return (
                                <button key={d} onClick={() => setFilter('district', val)}
                                    className={`flex-shrink-0 px-4 py-1.5 rounded-full text-sm font-medium transition-all border ${
                                        isActive
                                            ? 'bg-accent-teal text-white border-accent-teal shadow-sm'
                                            : 'bg-white text-gray-600 border-gray-200 hover:border-accent-teal hover:text-accent-teal'
                                    }`}>
                                    {d}
                                </button>
                            );
                        })}
                    </div>

                    {/* Title + Sort */}
                    <div className="flex items-start justify-between gap-4 mb-4">
                        <div>
                            <h2 className="text-xl font-black text-gray-800">উদ্ধার হওয়া অজ্ঞাত ব্যক্তি</h2>
                            <p className="text-xs text-gray-400 mt-0.5 flex items-center gap-1">
                                {loading
                                    ? <><Loader2 size={11} className="animate-spin" /> লোড হচ্ছে...</>
                                    : `${total}টি রেকর্ড পাওয়া গেছে`
                                }
                            </p>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                            <span className="text-xs text-gray-400 whitespace-nowrap hidden sm:block">সর্ট:</span>
                            <select value={filters.sort} onChange={e => setFilter('sort', e.target.value)}
                                className="text-xs border border-gray-200 rounded-lg px-2 py-1.5 focus:outline-none bg-white text-gray-700">
                                {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                            </select>
                        </div>
                    </div>

                    {/* Active filter chips */}
                    {filterBadgeCount > 0 && (
                        <div className="flex flex-wrap gap-1.5 mb-4">
                            {filters.search && (
                                <span className="inline-flex items-center gap-1 text-[11px] px-2.5 py-1 bg-accent-teal/10 text-accent-teal rounded-full font-medium">
                                    নাম: "{filters.search}"
                                    <button onClick={() => { setDraftSearch(''); setFilter('search', ''); }}><X size={10} /></button>
                                </span>
                            )}
                            {filters.district !== 'all' && (
                                <span className="inline-flex items-center gap-1 text-[11px] px-2.5 py-1 bg-primary/10 text-primary rounded-full font-medium">
                                    জেলা: {filters.district}
                                    <button onClick={() => setFilter('district', 'all')}><X size={10} /></button>
                                </span>
                            )}
                            {filters.gender !== 'all' && (
                                <span className="inline-flex items-center gap-1 text-[11px] px-2.5 py-1 bg-purple-100 text-purple-700 rounded-full font-medium">
                                    লিঙ্গ: {GENDER_OPTIONS.find(g => g.value === filters.gender)?.label}
                                    <button onClick={() => setFilter('gender', 'all')}><X size={10} /></button>
                                </span>
                            )}
                            {(filters.age_min > 0 || filters.age_max < 100) && (
                                <span className="inline-flex items-center gap-1 text-[11px] px-2.5 py-1 bg-orange-100 text-orange-700 rounded-full font-medium">
                                    বয়স: {filters.age_min}–{filters.age_max}
                                    <button onClick={() => { setFilter('age_min', 0); setFilter('age_max', 100); }}><X size={10} /></button>
                                </span>
                            )}
                        </div>
                    )}

                    {error && !loading && (
                        <div className="mb-6 rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">
                            {error}
                        </div>
                    )}

                    {/* Cards */}
                    {loading ? (
                        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                            {Array.from({ length: PER_PAGE }).map((_, i) => <CardSkeleton key={i} />)}
                        </div>
                    ) : reports.length > 0 ? (
                        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
                            {reports.map(r => <Card key={r.id} r={r} />)}
                        </div>
                    ) : (
                        <div className="text-center py-20">
                            <div className="text-4xl mb-3">🔍</div>
                            <p className="text-gray-500 font-medium">কোনো রেকর্ড পাওয়া যায়নি</p>
                            {filterBadgeCount > 0 && (
                                <button onClick={clearAll} className="mt-3 text-sm text-accent-teal hover:underline">
                                    ফিল্টার সাফ করুন
                                </button>
                            )}
                        </div>
                    )}

                    {/* Pagination */}
                    {!loading && lastPage > 1 && (
                        <div className="flex items-center justify-center gap-1 mt-8">
                            <button
                                onClick={() => goToPage(Math.max(1, filters.page - 1))}
                                disabled={filters.page === 1}
                                className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 text-gray-500 hover:border-accent-teal hover:text-accent-teal disabled:opacity-30 transition-colors"
                            >
                                <ChevronLeft size={14} />
                            </button>
                            {paginationPages().map((n, i) =>
                                n === '...'
                                    ? <span key={`dot-${i}`} className="w-8 text-center text-gray-400 text-sm">…</span>
                                    : (
                                        <button key={n} onClick={() => goToPage(n)}
                                            className={`w-8 h-8 rounded-lg text-sm font-medium transition-all ${
                                                filters.page === n
                                                    ? 'bg-accent-teal text-white shadow-sm'
                                                    : 'border border-gray-200 text-gray-600 hover:border-accent-teal hover:text-accent-teal'
                                            }`}>
                                            {n}
                                        </button>
                                    )
                            )}
                            <button
                                onClick={() => goToPage(Math.min(lastPage, filters.page + 1))}
                                disabled={filters.page === lastPage}
                                className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 text-gray-500 hover:border-accent-teal hover:text-accent-teal disabled:opacity-30 transition-colors"
                            >
                                <ChevronRight size={14} />
                            </button>
                        </div>
                    )}

                    {!loading && lastPage > 1 && (
                        <p className="text-center text-[11px] text-gray-400 mt-2">
                            পৃষ্ঠা {filters.page} / {lastPage} — মোট {total}টি রেকর্ড
                        </p>
                    )}
                </main>
            </div>
        </div>
    );
}