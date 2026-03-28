import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Flag, CheckCircle, XCircle, AlertTriangle, Eye,
    Search, Filter, Clock, User, FileText, Shield,
    ChevronDown, X, MessageSquare, TrendingUp, Loader2,
    ThumbsUp, ThumbsDown, ArrowUpCircle, HelpCircle,
    Bell, Menu, MoreHorizontal, Inbox
} from 'lucide-react';
import { AdminSidebar } from './AdminDashboardPage';
import { useAuth } from '../helpers/AuthContext';
import AdminNavbar from '../Components/AdminNavbar';

/* ══════════════════════════════════════════
   DATA HOOK — wire up API calls here
══════════════════════════════════════════ */
function useModerationData() {
    const [loading, setLoading] = useState(true);

    /* Stats strip */
    const [stats, setStats] = useState({
        pendingReviews: 0,
        highPriority: 0,
        resolvedToday: 0,
        avgResponseTime: '—',
    });

    /*
     * Queue items shape:
     * {
     *   id, type: 'report'|'user'|'appeal',
     *   title, submittedBy, date,
     *   priority: 'high'|'medium'|'low',
     *   status: 'pending'|'under_review'|'escalated',
     *   description, division, age (for reports),
     *   reason (for user flags & appeals),
     *   notes,
     * }
     */
    const [pendingReports, setPendingReports] = useState([]);
    const [flaggedUsers, setFlaggedUsers] = useState([]);
    const [appeals, setAppeals] = useState([]);

    useEffect(() => {
        /* ─────────────────────────────────────────────
           TODO: replace with real API calls, e.g.:
             const [statsRes, reportRes, usersRes, appealsRes] = await Promise.all([
               apiClient.get('/admin/moderation/stats'),
               apiClient.get('/admin/moderation/reports'),
               apiClient.get('/admin/moderation/flagged-users'),
               apiClient.get('/admin/moderation/appeals'),
             ]);
             setStats(statsRes.data);
             setPendingReports(reportRes.data);
             setFlaggedUsers(usersRes.data);
             setAppeals(appealsRes.data);
           ───────────────────────────────────────────── */
        setLoading(false);  // remove once real data is fetched
    }, []);

    return {
        loading,
        stats, setStats,
        pendingReports, setPendingReports,
        flaggedUsers, setFlaggedUsers,
        appeals, setAppeals,
    };
}

/* ══════════════════════════════════════════
   SHARED CONSTANTS
══════════════════════════════════════════ */
const PRIORITY_STYLE = {
    high: { cls: 'bg-red-50 text-red-600 border-red-200', dot: 'bg-red-500', label: 'উচ্চ' },
    medium: { cls: 'bg-amber-50 text-amber-600 border-amber-200', dot: 'bg-amber-500', label: 'মধ্যম' },
    low: { cls: 'bg-gray-50 text-gray-500 border-gray-200', dot: 'bg-gray-400', label: 'নিম্ন' },
};

const STATUS_STYLE = {
    pending: { cls: 'bg-amber-50 text-amber-700 border-amber-200', label: 'অপেক্ষমাণ' },
    under_review: { cls: 'bg-blue-50 text-blue-700 border-blue-200', label: 'পর্যালোচনাধীন' },
    escalated: { cls: 'bg-red-50 text-red-700 border-red-200', label: 'এস্কেলেটেড' },
};

/* ══════════════════════════════════════════
   STATS STRIP
══════════════════════════════════════════ */
function StatsStrip({ stats }) {
    const cards = [
        { label: 'অপেক্ষমাণ পর্যালোচনা', value: stats.pendingReviews, icon: Inbox, color: 'bg-amber-50 text-amber-500 border-amber-100' },
        { label: 'উচ্চ অগ্রাধিকার', value: stats.highPriority, icon: AlertTriangle, color: 'bg-red-50 text-red-500 border-red-100' },
        { label: 'আজকে সমাধান করা হয়েছে', value: stats.resolvedToday, icon: CheckCircle, color: 'bg-emerald-50 text-emerald-500 border-emerald-100' },
        { label: 'গড় প্রতিক্রিয়া সময়', value: stats.avgResponseTime, icon: Clock, color: 'bg-blue-50 text-blue-500 border-blue-100' },
    ];

    return (
        <div className="grid grid-cols-2 xl:grid-cols-4 gap-3 mb-6">
            {cards.map((c, i) => (
                <div key={i} className={`flex items-center gap-3 p-4 rounded-2xl border ${c.color} bg-white shadow-sm`}>
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${c.color}`}>
                        <c.icon size={16} />
                    </div>
                    <div>
                        <p className="text-xl font-black text-gray-800">{c.value}</p>
                        <p className="text-[10px] text-gray-400 leading-tight">{c.label}</p>
                    </div>
                </div>
            ))}
        </div>
    );
}

/* ══════════════════════════════════════════
   FILTER BAR
══════════════════════════════════════════ */
function FilterBar({ search, setSearch, priority, setPriority, status, setStatus }) {
    return (
        <div className="flex flex-wrap items-center gap-3 mb-4">
            {/* Search */}
            <div className="relative flex-1 min-w-48">
                <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                <input
                    value={search} onChange={e => setSearch(e.target.value)}
                    placeholder="আইডি, নাম বা বিবরণ খুঁজুন..."
                    className="w-full pl-9 pr-4 py-2 text-xs border border-gray-200 rounded-xl
                               focus:outline-none focus:ring-2 focus:ring-red-200 focus:border-red-400 bg-white" />
            </div>

            {/* Priority filter */}
            <div className="relative">
                <Filter size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                <select value={priority} onChange={e => setPriority(e.target.value)}
                    className="pl-7 pr-8 py-2 text-xs border border-gray-200 rounded-xl bg-white
                               focus:outline-none focus:ring-2 focus:ring-red-200 appearance-none cursor-pointer">
                    <option value="">সব অগ্রাধিকার</option>
                    <option value="high">উচ্চ</option>
                    <option value="medium">মধ্যম</option>
                    <option value="low">নিম্ন</option>
                </select>
                <ChevronDown size={11} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            </div>

            {/* Status filter */}
            <div className="relative">
                <select value={status} onChange={e => setStatus(e.target.value)}
                    className="pl-3 pr-8 py-2 text-xs border border-gray-200 rounded-xl bg-white
                               focus:outline-none focus:ring-2 focus:ring-red-200 appearance-none cursor-pointer">
                    <option value="">সব স্ট্যাটাস</option>
                    <option value="pending">অপেক্ষমাণ</option>
                    <option value="under_review">পর্যালোচনাধীন</option>
                    <option value="escalated">এস্কেলেটেড</option>
                </select>
                <ChevronDown size={11} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            </div>
        </div>
    );
}

/* ══════════════════════════════════════════
   EMPTY STATE
══════════════════════════════════════════ */
function EmptyQueue({ label = 'কোনো আইটেম নেই' }) {
    return (
        <div className="flex flex-col items-center justify-center py-20 text-gray-300">
            <Inbox size={40} className="mb-3" />
            <p className="text-sm font-bold text-gray-400">{label}</p>
            <p className="text-xs text-gray-300 mt-1">ব্যাকএন্ড সংযুক্ত হলে এখানে তথ্য দেখাবে</p>
        </div>
    );
}

/* ══════════════════════════════════════════
   DETAIL SLIDE-IN PANEL
══════════════════════════════════════════ */
function DetailPanel({ item, onClose, onAction }) {
    const [note, setNote] = useState('');
    const [actioning, setActioning] = useState('');

    if (!item) return null;

    const prio = PRIORITY_STYLE[item.priority] ?? PRIORITY_STYLE.low;
    const stat = STATUS_STYLE[item.status] ?? STATUS_STYLE.pending;

    const handleAction = async (action) => {
        setActioning(action);
        await new Promise(r => setTimeout(r, 700));
        onAction(item.id, action, note);
        setActioning('');
    };

    return (
        <>
            {/* Backdrop */}
            <div className="fixed inset-0 bg-black/30 z-40 lg:hidden" onClick={onClose} />

            {/* Panel */}
            <aside className="fixed right-0 top-0 h-full w-full max-w-md bg-white shadow-2xl z-50
                              flex flex-col border-l border-gray-100 overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 bg-gray-50">
                    <div>
                        <p className="text-xs text-gray-400 font-medium">পর্যালোচনা</p>
                        <h3 className="font-black text-gray-800 text-sm leading-tight mt-0.5">{item.title}</h3>
                    </div>
                    <button onClick={onClose} className="w-8 h-8 flex items-center justify-center text-gray-400
                                                         hover:bg-gray-200 rounded-lg transition-colors">
                        <X size={16} />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-5 space-y-4">
                    {/* Meta */}
                    <div className="grid grid-cols-2 gap-3">
                        <div className="bg-gray-50 rounded-xl p-3">
                            <p className="text-[10px] text-gray-400 mb-0.5">জমা দিয়েছেন</p>
                            <p className="text-xs font-bold text-gray-700">{item.submittedBy ?? '—'}</p>
                        </div>
                        <div className="bg-gray-50 rounded-xl p-3">
                            <p className="text-[10px] text-gray-400 mb-0.5">তারিখ</p>
                            <p className="text-xs font-bold text-gray-700">{item.date ?? '—'}</p>
                        </div>
                        <div className="bg-gray-50 rounded-xl p-3">
                            <p className="text-[10px] text-gray-400 mb-0.5">অগ্রাধিকার</p>
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${prio.cls}`}>{prio.label}</span>
                        </div>
                        <div className="bg-gray-50 rounded-xl p-3">
                            <p className="text-[10px] text-gray-400 mb-0.5">স্ট্যাটাস</p>
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${stat.cls}`}>{stat.label}</span>
                        </div>
                    </div>

                    {/* Description / Reason */}
                    <div className="bg-white border border-gray-100 rounded-xl p-4">
                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-2">বিবরণ / কারণ</p>
                        <p className="text-sm text-gray-600 leading-relaxed">
                            {item.description ?? item.reason ?? 'কোনো বিবরণ নেই'}
                        </p>
                    </div>

                    {/* Notes */}
                    <div>
                        <label className="block text-xs font-bold text-gray-700 mb-1.5">মডারেটর নোট</label>
                        <textarea
                            value={note} onChange={e => setNote(e.target.value)}
                            rows={3}
                            placeholder="এখানে নোট লিখুন (ঐচ্ছিক)..."
                            className="w-full px-3 py-2.5 text-xs border border-gray-200 rounded-xl resize-none
                                       focus:outline-none focus:ring-2 focus:ring-red-200 focus:border-red-400" />
                    </div>
                </div>

                {/* Action buttons */}
                <div className="p-4 border-t border-gray-100 bg-gray-50">
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-3">অ্যাকশন নিন</p>
                    <div className="grid grid-cols-2 gap-2">
                        {[
                            { id: 'approve', label: 'অনুমোদন', icon: ThumbsUp, cls: 'bg-emerald-500 hover:bg-emerald-600 text-white' },
                            { id: 'reject', label: 'প্রত্যাখ্যান', icon: ThumbsDown, cls: 'bg-red-500 hover:bg-red-600 text-white' },
                            { id: 'info', label: 'তথ্য চাই', icon: HelpCircle, cls: 'bg-blue-50 hover:bg-blue-100 text-blue-600 border border-blue-200' },
                            { id: 'escalate', label: 'এস্কেলেট করুন', icon: ArrowUpCircle, cls: 'bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-200' },
                        ].map(a => (
                            <button key={a.id} onClick={() => handleAction(a.id)} disabled={!!actioning}
                                className={`flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-bold
                                            transition-all disabled:opacity-60 ${a.cls}`}>
                                {actioning === a.id
                                    ? <Loader2 size={12} className="animate-spin" />
                                    : <a.icon size={12} />}
                                {a.label}
                            </button>
                        ))}
                    </div>
                </div>
            </aside>
        </>
    );
}

/* ══════════════════════════════════════════
   QUEUE TABLE (shared by all 3 tabs)
══════════════════════════════════════════ */
function QueueTable({ items, onReview, loading, emptyLabel }) {
    if (loading) {
        return (
            <div className="flex items-center justify-center py-24">
                <Loader2 size={28} className="animate-spin text-gray-200" />
            </div>
        );
    }
    if (!items.length) return <EmptyQueue label={emptyLabel} />;

    return (
        <div className="overflow-x-auto">
            <table className="w-full text-sm">
                <thead>
                    <tr className="bg-gray-50">
                        {['আইডি', 'শিরোনাম', 'জমাকারী', 'অগ্রাধিকার', 'স্ট্যাটাস', 'তারিখ', 'অ্যাকশন'].map(h => (
                            <th key={h} className="px-4 py-3 text-left text-[11px] font-bold text-gray-400 uppercase tracking-wide whitespace-nowrap">{h}</th>
                        ))}
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                    {items.map(item => {
                        const prio = PRIORITY_STYLE[item.priority] ?? PRIORITY_STYLE.low;
                        const stat = STATUS_STYLE[item.status] ?? STATUS_STYLE.pending;
                        return (
                            <tr key={item.id} className="hover:bg-gray-50/60 transition-colors group">
                                <td className="px-4 py-3.5 text-xs text-gray-400 font-mono">#{item.id}</td>
                                <td className="px-4 py-3.5">
                                    <div className="flex items-center gap-2.5 max-w-xs">
                                        <div className={`w-1.5 h-8 rounded-full flex-shrink-0 ${prio.dot}`} />
                                        <div className="min-w-0">
                                            <p className="text-xs font-bold text-gray-700 truncate">{item.title}</p>
                                            <p className="text-[10px] text-gray-400 truncate mt-0.5">{item.description?.slice(0, 60) ?? '—'}</p>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-4 py-3.5 text-xs text-gray-500 whitespace-nowrap">{item.submittedBy ?? '—'}</td>
                                <td className="px-4 py-3.5">
                                    <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full border ${prio.cls}`}>{prio.label}</span>
                                </td>
                                <td className="px-4 py-3.5">
                                    <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full border ${stat.cls}`}>{stat.label}</span>
                                </td>
                                <td className="px-4 py-3.5 text-xs text-gray-400 whitespace-nowrap">{item.date ?? '—'}</td>
                                <td className="px-4 py-3.5">
                                    <div className="flex items-center gap-1">
                                        <button onClick={() => onReview(item)}
                                            className="flex items-center gap-1 text-[10px] font-bold text-white bg-red-500
                                                       hover:bg-red-600 px-3 py-1.5 rounded-lg transition-colors">
                                            <Eye size={11} /> পর্যালোচনা
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
}

/* ══════════════════════════════════════════
   MAIN PAGE
══════════════════════════════════════════ */
const TABS = [
    { id: 'reports', label: 'অপেক্ষমাণ রিপোর্ট', icon: FileText, emptyLabel: 'কোনো অপেক্ষমাণ রিপোর্ট নেই' },
    { id: 'users', label: 'ফ্ল্যাগড ব্যবহারকারী', icon: User, emptyLabel: 'কোনো ফ্ল্যাগড ব্যবহারকারী নেই' },
    { id: 'appeals', label: 'আপিল', icon: MessageSquare, emptyLabel: 'কোনো আপিল নেই' },
];

export default function AdminModerationPage() {
    const navigate = useNavigate();
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);
    const [activeTab, setActiveTab] = useState('reports');
    const [selectedItem, setSelectedItem] = useState(null);

    /* filters */
    const [search, setSearch] = useState('');
    const [priority, setPriority] = useState('');
    const [status, setStatus] = useState('');

    const data = useModerationData();
    const { loading, stats, pendingReports, setPendingReports, flaggedUsers, setFlaggedUsers, appeals, setAppeals } = data;

    /* derive current queue based on active tab */
    const queueMap = { reports: pendingReports, users: flaggedUsers, appeals };
    const setterMap = { reports: setPendingReports, users: setFlaggedUsers, appeals: setAppeals };
    const rawQueue = queueMap[activeTab] ?? [];

    /* apply filters */
    const filtered = rawQueue.filter(item => {
        const matchSearch = !search || item.title?.toLowerCase().includes(search.toLowerCase()) || String(item.id).includes(search);
        const matchPriority = !priority || item.priority === priority;
        const matchStatus = !status || item.status === status;
        return matchSearch && matchPriority && matchStatus;
    });

    /* handle moderation action */
    const handleAction = (id, action, note) => {
        /* TODO: call API — e.g. apiClient.post(`/admin/moderation/${id}/${action}`, { note }) */
        const setter = setterMap[activeTab];
        setter(prev => prev.filter(item => item.id !== id));
        setSelectedItem(null);
    };

    return (
        <div className="flex h-screen bg-gray-50 overflow-hidden">

            {/* Desktop sidebar */}
            <div className="hidden lg:flex">
                <AdminSidebar active="moderation"
                    onNav={id => navigate(`/admin/dashboard`)}
                    collapsed={sidebarCollapsed}
                    onToggle={() => setSidebarCollapsed(p => !p)} />
            </div>

            {/* Mobile sidebar overlay */}
            {mobileOpen && (
                <div className="lg:hidden fixed inset-0 z-50 flex">
                    <div className="flex-shrink-0">
                        <AdminSidebar active="moderation"
                            onNav={() => setMobileOpen(false)}
                            collapsed={false}
                            onToggle={() => setMobileOpen(false)} />
                    </div>
                    <div className="flex-1 bg-black/50" onClick={() => setMobileOpen(false)} />
                </div>
            )}

            {/* Main area */}
            <div className="flex-1 flex flex-col overflow-hidden">
                <AdminNavbar breadcrumb="মডারেশন প্যানেল" onMobileMenu={() => setMobileOpen(true)} />

                {/* Scrollable content */}
                <main className="flex-1 overflow-y-auto p-4 lg:p-6">

                    {/* Page heading */}
                    <div className="flex items-center justify-between mb-5">
                        <div>
                            <h1 className="text-xl font-black text-gray-800">মডারেশন প্যানেল</h1>
                            <p className="text-xs text-gray-400 mt-0.5">রিপোর্ট, ব্যবহারকারী ফ্ল্যাগ এবং আপিল পর্যালোচনা করুন</p>
                        </div>
                        <button onClick={() => navigate('/admin/dashboard')}
                            className="text-xs text-gray-500 hover:text-red-500 font-semibold transition-colors hidden lg:block">
                            ← ড্যাশবোর্ড
                        </button>
                    </div>

                    {/* Stats strip */}
                    <StatsStrip stats={stats} />

                    {/* Tab bar */}
                    <div className="flex gap-1 bg-white border border-gray-100 rounded-2xl p-1 mb-4 shadow-sm w-fit">
                        {TABS.map(tab => {
                            const count = queueMap[tab.id]?.length ?? 0;
                            return (
                                <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                                    className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold
                                                transition-all whitespace-nowrap
                                                ${activeTab === tab.id
                                            ? 'bg-red-500 text-white shadow-sm'
                                            : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'}`}>
                                    <tab.icon size={13} />
                                    {tab.label}
                                    <span className={`text-[10px] font-black px-1.5 py-0.5 rounded-full
                                                      ${activeTab === tab.id ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-400'}`}>
                                        {count}
                                    </span>
                                </button>
                            );
                        })}
                    </div>

                    {/* Main card */}
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                        {/* Filter bar */}
                        <div className="px-5 pt-5 pb-0">
                            <FilterBar search={search} setSearch={setSearch}
                                priority={priority} setPriority={setPriority}
                                status={status} setStatus={setStatus} />
                        </div>

                        {/* Divider */}
                        <div className="border-t border-gray-50 mx-5 mb-0" />

                        {/* Queue table */}
                        <QueueTable
                            items={filtered}
                            onReview={setSelectedItem}
                            loading={loading}
                            emptyLabel={TABS.find(t => t.id === activeTab)?.emptyLabel} />
                    </div>
                </main>
            </div>

            {/* Detail slide-in panel */}
            {selectedItem && (
                <DetailPanel
                    item={selectedItem}
                    onClose={() => setSelectedItem(null)}
                    onAction={handleAction} />
            )}
        </div>
    );
}

