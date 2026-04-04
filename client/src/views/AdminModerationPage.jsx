import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Flag, CheckCircle, XCircle, Eye,
    Search, Clock, User, FileText, Shield,
    X, Loader2, ThumbsUp, ThumbsDown,
    Bell, Inbox, MapPin, Phone, Shirt, Calendar,
    AlertTriangle, Info
} from 'lucide-react';
import { AdminSidebar } from '../Components/AdminSidebar';
import AdminNavbar from '../Components/AdminNavbar';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { useAuth } from '../helpers/AuthContext';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

/* ══════════════════════════════════════════
   DATA HOOK
══════════════════════════════════════════ */
function useModerationData(token) {
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({ pendingReviews: 0, resolvedToday: 0 });
    const [pendingReports, setPendingReports] = useState([]);
    const [approvedReports, setApprovedReports] = useState([]);

    const fetchData = async () => {
        if (!token) return;
        setLoading(true);
        try {
            const headers = { Authorization: `Bearer ${token}` };

            const [missingRes, foundRes, missingPubRes, foundPubRes] = await Promise.all([
                axios.get(`${API_URL}/missing-reports/admin/pending`, { headers }),
                axios.get(`${API_URL}/found-reports/admin/pending`, { headers }),
                axios.get(`${API_URL}/missing-reports/published`),
                axios.get(`${API_URL}/found-reports/published`),
            ]);

            const pending = [
                ...(Array.isArray(missingRes.data) ? missingRes.data : []).map(r => ({ ...r, origType: 'missing' })),
                ...(Array.isArray(foundRes.data) ? foundRes.data : []).map(r => ({ ...r, origType: 'found' })),
            ].sort((a, b) => new Date(b.date) - new Date(a.date));

            const approved = [
                ...(missingPubRes.data.reports || []).map(r => ({
                    id: r.id,
                    origType: 'missing',
                    title: `নিখোঁজ: ${r.name}`,
                    submittedBy: r.user?.email || '—',
                    date: r.lastSeenDate || r.createdAt?.split('T')[0],
                    district: r.district,
                    name: r.name,
                    age: r.age,
                    gender: r.gender,
                    photoUrl: r.photoUrl,
                    status: 'published',
                })),
                ...(foundPubRes.data.reports || []).map(r => ({
                    id: r.id,
                    origType: 'found',
                    title: `উদ্ধার: ${r.name}`,
                    submittedBy: r.user?.email || '—',
                    date: r.foundDate || r.createdAt?.split('T')[0],
                    district: r.district,
                    name: r.name,
                    age: r.age,
                    gender: r.gender,
                    photoUrl: r.photoUrl,
                    status: 'published',
                })),
            ].sort((a, b) => new Date(b.date) - new Date(a.date));

            setPendingReports(pending);
            setApprovedReports(approved);
            setStats({ pendingReviews: pending.length, resolvedToday: approved.length });
        } catch (error) {
            console.error('Moderation data fetch error:', error);
            toast.error('মডারেশন ডাটা আনতে সমস্যা হয়েছে');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchData(); }, [token]);

    return { loading, stats, pendingReports, approvedReports, refresh: fetchData };
}

/* ══════════════════════════════════════════
   STATS STRIP
══════════════════════════════════════════ */
function StatsStrip({ stats }) {
    return (
        <div className="grid grid-cols-2 gap-3 mb-6">
            <div className="flex items-center gap-3 p-4 rounded-2xl border bg-white shadow-sm border-amber-100">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-amber-50 text-amber-500">
                    <Inbox size={16} />
                </div>
                <div>
                    <p className="text-xl font-black text-gray-800">{stats.pendingReviews}</p>
                    <p className="text-[10px] text-gray-400 leading-tight">অপেক্ষমাণ পর্যালোচনা</p>
                </div>
            </div>
            <div className="flex items-center gap-3 p-4 rounded-2xl border bg-white shadow-sm border-emerald-100">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-emerald-50 text-emerald-500">
                    <CheckCircle size={16} />
                </div>
                <div>
                    <p className="text-xl font-black text-gray-800">{stats.resolvedToday}</p>
                    <p className="text-[10px] text-gray-400 leading-tight">মোট অনুমোদিত</p>
                </div>
            </div>
        </div>
    );
}

/* ══════════════════════════════════════════
   DETAIL SLIDE-IN PANEL (Full details)
══════════════════════════════════════════ */
function DetailPanel({ item, onClose, onAction }) {
    const [rejectionReason, setRejectionReason] = useState('');
    const [actioning, setActioning] = useState('');

    if (!item) return null;

    const isFound = item.origType === 'found';
    const isPending = item.status === 'pending' || !item.status;

    const handleApprove = async () => {
        setActioning('approve');
        await onAction(item.id, 'approve', '');
        setActioning('');
    };

    const handleReject = async () => {
        if (!rejectionReason.trim()) {
            toast.error('প্রত্যাখ্যানের কারণ লিখুন');
            return;
        }
        setActioning('reject');
        await onAction(item.id, 'reject', rejectionReason);
        setActioning('');
    };

    return (
        <>
            {/* Backdrop */}
            <div className="fixed inset-0 bg-black/40 z-40" onClick={onClose} />

            {/* Slide-in panel */}
            <aside className="fixed right-0 top-0 h-full w-full max-w-lg bg-white shadow-2xl z-50 flex flex-col border-l border-gray-100 overflow-hidden">
                {/* Header */}
                <div className={`flex items-center justify-between px-5 py-4 border-b ${isFound ? 'bg-teal-50 border-teal-100' : 'bg-red-50 border-red-100'}`}>
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${isFound ? 'bg-teal-500 text-white' : 'bg-red-500 text-white'}`}>
                                {isFound ? 'উদ্ধার রিপোর্ট' : 'নিখোঁজ রিপোর্ট'}
                            </span>
                            {isPending && (
                                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 border border-amber-200">
                                    অপেক্ষমাণ
                                </span>
                            )}
                        </div>
                        <h3 className="font-black text-gray-800 text-sm">{item.title}</h3>
                    </div>
                    <button onClick={onClose} className="w-8 h-8 flex items-center justify-center text-gray-400 hover:bg-gray-200 rounded-lg transition-colors">
                        <X size={16} />
                    </button>
                </div>

                {/* Scrollable content */}
                <div className="flex-1 overflow-y-auto">
                    {/* Photo */}
                    {item.photoUrl && (
                        <div className="relative h-48 bg-gray-100 overflow-hidden">
                            <img src={item.photoUrl} alt={item.name} className="w-full h-full object-cover" />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                            <div className="absolute bottom-3 left-4 text-white">
                                <p className="font-black text-lg">{item.name}</p>
                                <p className="text-sm opacity-80">{item.age ? `প্রায় ${item.age} বছর` : ''} {item.gender === 'male' ? '• পুরুষ' : item.gender === 'female' ? '• নারী' : ''}</p>
                            </div>
                        </div>
                    )}

                    <div className="p-5 space-y-4">
                        {/* No photo fallback name */}
                        {!item.photoUrl && (
                            <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-white text-2xl font-black ${isFound ? 'bg-teal-500' : 'bg-red-500'}`}>
                                {item.name?.[0] || '?'}
                            </div>
                        )}

                        {/* Meta grid */}
                        <div className="grid grid-cols-2 gap-3">
                            <div className="bg-gray-50 rounded-xl p-3">
                                <p className="text-[10px] text-gray-400 mb-0.5 flex items-center gap-1"><User size={10} /> জমাকারী</p>
                                <p className="text-xs font-bold text-gray-700 truncate">{item.submittedBy || '—'}</p>
                            </div>
                            <div className="bg-gray-50 rounded-xl p-3">
                                <p className="text-[10px] text-gray-400 mb-0.5 flex items-center gap-1"><Calendar size={10} /> তারিখ</p>
                                <p className="text-xs font-bold text-gray-700">{item.date || '—'}</p>
                            </div>
                            <div className="bg-gray-50 rounded-xl p-3">
                                <p className="text-[10px] text-gray-400 mb-0.5 flex items-center gap-1"><MapPin size={10} /> জেলা</p>
                                <p className="text-xs font-bold text-gray-700">{item.district || '—'}</p>
                            </div>
                            <div className="bg-gray-50 rounded-xl p-3">
                                <p className="text-[10px] text-gray-400 mb-0.5 flex items-center gap-1"><Info size={10} /> আইডি</p>
                                <p className="text-xs font-bold text-gray-700 font-mono">#{item.id}</p>
                            </div>
                        </div>

                        {/* Address */}
                        {item.address && (
                            <div className="bg-gray-50 rounded-xl p-3">
                                <p className="text-[10px] text-gray-400 mb-1 flex items-center gap-1"><MapPin size={10} /> বিস্তারিত ঠিকানা</p>
                                <p className="text-xs text-gray-700">{item.address}</p>
                            </div>
                        )}

                        {/* Clothing */}
                        {item.clothingDescription && (
                            <div className="bg-gray-50 rounded-xl p-3">
                                <p className="text-[10px] text-gray-400 mb-1 flex items-center gap-1"><Shirt size={10} /> পোশাকের বিবরণ</p>
                                <p className="text-xs text-gray-700">{item.clothingDescription}</p>
                            </div>
                        )}

                        {/* Description */}
                        {(item.description || item.reason) && (
                            <div className="bg-white border border-gray-100 rounded-xl p-4">
                                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-2">অতিরিক্ত তথ্য</p>
                                <p className="text-sm text-gray-600 leading-relaxed">
                                    {item.description || item.reason || 'কোনো বিবরণ নেই'}
                                </p>
                            </div>
                        )}

                        {/* Contact */}
                        {(item.contactPersonName || item.contactPhone) && (
                            <div className="bg-blue-50 border border-blue-100 rounded-xl p-3">
                                <p className="text-[10px] text-blue-400 font-bold uppercase tracking-wider mb-2 flex items-center gap-1"><Phone size={10} /> যোগাযোগ তথ্য</p>
                                <p className="text-xs font-bold text-gray-700">{item.contactPersonName}</p>
                                <p className="text-xs text-blue-600 mt-0.5">{item.contactPhone}</p>
                            </div>
                        )}

                        {/* Height */}
                        {item.height && (
                            <div className="bg-gray-50 rounded-xl p-3">
                                <p className="text-[10px] text-gray-400 mb-1">উচ্চতা</p>
                                <p className="text-xs font-bold text-gray-700">{item.height}</p>
                            </div>
                        )}

                        {/* Rejection reason textarea (only for pending) */}
                        {isPending && (
                            <div>
                                <label className="block text-xs font-bold text-gray-700 mb-1.5 flex items-center gap-1">
                                    <XCircle size={12} className="text-red-400" /> প্রত্যাখ্যানের কারণ
                                    <span className="text-red-500">*</span>
                                    <span className="text-gray-400 font-normal">(শুধু বাতিল করতে প্রয়োজন)</span>
                                </label>
                                <textarea
                                    value={rejectionReason}
                                    onChange={e => setRejectionReason(e.target.value)}
                                    rows={3}
                                    placeholder="কেন এই রিপোর্টটি বাতিল করা হচ্ছে তা লিখুন..."
                                    className="w-full px-3 py-2.5 text-xs border border-gray-200 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-red-200 focus:border-red-400"
                                />
                            </div>
                        )}
                    </div>
                </div>

                {/* Action footer — only for pending reports */}
                {isPending && (
                    <div className="p-4 border-t border-gray-100 bg-gray-50 flex gap-3">
                        <button
                            onClick={handleApprove}
                            disabled={!!actioning}
                            className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold bg-emerald-500 hover:bg-emerald-600 text-white transition-all disabled:opacity-60"
                        >
                            {actioning === 'approve' ? <Loader2 size={14} className="animate-spin" /> : <ThumbsUp size={14} />}
                            অনুমোদন করুন
                        </button>
                        <button
                            onClick={handleReject}
                            disabled={!!actioning}
                            className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold bg-red-500 hover:bg-red-600 text-white transition-all disabled:opacity-60"
                        >
                            {actioning === 'reject' ? <Loader2 size={14} className="animate-spin" /> : <ThumbsDown size={14} />}
                            প্রত্যাখ্যান করুন
                        </button>
                    </div>
                )}

                {/* Approved badge footer */}
                {!isPending && (
                    <div className="p-4 border-t border-gray-100 bg-emerald-50 flex items-center gap-2">
                        <CheckCircle size={16} className="text-emerald-500" />
                        <span className="text-sm font-bold text-emerald-700">এই রিপোর্টটি অনুমোদিত এবং প্রকাশিত</span>
                    </div>
                )}
            </aside>
        </>
    );
}

/* ══════════════════════════════════════════
   QUEUE TABLE
══════════════════════════════════════════ */
function QueueTable({ items, onReview, loading, emptyLabel }) {
    if (loading) {
        return (
            <div className="flex items-center justify-center py-24">
                <Loader2 size={28} className="animate-spin text-gray-300" />
            </div>
        );
    }

    if (!items.length) {
        return (
            <div className="flex flex-col items-center justify-center py-20 text-gray-300">
                <Inbox size={40} className="mb-3" />
                <p className="text-sm font-bold text-gray-400">{emptyLabel}</p>
            </div>
        );
    }

    return (
        <div className="overflow-x-auto">
            <table className="w-full text-sm">
                <thead>
                    <tr className="bg-gray-50">
                        {['আইডি', 'শিরোনাম', 'ধরন', 'জমাকারী', 'জেলা', 'তারিখ', 'অ্যাকশন'].map(h => (
                            <th key={h} className="px-4 py-3 text-left text-[11px] font-bold text-gray-400 uppercase tracking-wide whitespace-nowrap">{h}</th>
                        ))}
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                    {items.map(item => (
                        <tr key={`${item.origType}-${item.id}`} className="hover:bg-gray-50/60 transition-colors group">
                            <td className="px-4 py-3.5 text-xs text-gray-400 font-mono">#{item.id}</td>
                            <td className="px-4 py-3.5">
                                <div className="flex items-center gap-2.5 max-w-xs">
                                    {item.photoUrl ? (
                                        <img src={item.photoUrl} alt={item.name} className="w-8 h-8 rounded-xl object-cover flex-shrink-0" />
                                    ) : (
                                        <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-white text-xs font-black flex-shrink-0 ${item.origType === 'found' ? 'bg-teal-500' : 'bg-red-500'}`}>
                                            {item.name?.[0] || '?'}
                                        </div>
                                    )}
                                    <div className="min-w-0">
                                        <p className="text-xs font-bold text-gray-700 truncate">{item.name || item.title}</p>
                                        {item.age && <p className="text-[10px] text-gray-400">~{item.age} বছর</p>}
                                    </div>
                                </div>
                            </td>
                            <td className="px-4 py-3.5">
                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${item.origType === 'found' ? 'bg-teal-50 text-teal-600 border border-teal-200' : 'bg-red-50 text-red-600 border border-red-200'}`}>
                                    {item.origType === 'found' ? 'উদ্ধার' : 'নিখোঁজ'}
                                </span>
                            </td>
                            <td className="px-4 py-3.5 text-xs text-gray-500 whitespace-nowrap">{item.submittedBy || '—'}</td>
                            <td className="px-4 py-3.5 text-xs text-gray-500">{item.district || '—'}</td>
                            <td className="px-4 py-3.5 text-xs text-gray-400 whitespace-nowrap">{item.date || '—'}</td>
                            <td className="px-4 py-3.5">
                                <button
                                    onClick={() => onReview(item)}
                                    className="flex items-center gap-1 text-[10px] font-bold text-white bg-red-500 hover:bg-red-600 px-3 py-1.5 rounded-lg transition-colors"
                                >
                                    <Eye size={11} /> পর্যালোচনা
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

/* ══════════════════════════════════════════
   MAIN MODERATION SECTION
══════════════════════════════════════════ */
const TABS = [
    { id: 'pending', label: 'অপেক্ষমাণ রিপোর্ট', icon: AlertTriangle, emptyLabel: 'কোনো অপেক্ষমাণ রিপোর্ট নেই ✅' },
    { id: 'approved', label: 'অনুমোদিত রিপোর্ট', icon: CheckCircle, emptyLabel: 'কোনো অনুমোদিত রিপোর্ট নেই' },
];

export function ModerationSection() {
    const { token } = useAuth();
    const [activeTab, setActiveTab] = useState('pending');
    const [selectedItem, setSelectedItem] = useState(null);
    const [search, setSearch] = useState('');

    const { loading, stats, pendingReports, approvedReports, refresh } = useModerationData(token);

    const queueMap = { pending: pendingReports, approved: approvedReports };
    const rawQueue = queueMap[activeTab] ?? [];

    const filtered = rawQueue.filter(item => {
        const q = search.toLowerCase();
        return !search ||
            (item.name || item.title || '').toLowerCase().includes(q) ||
            String(item.id).includes(q) ||
            (item.district || '').toLowerCase().includes(q) ||
            (item.submittedBy || '').toLowerCase().includes(q);
    });

    const handleAction = async (id, action, note) => {
        const item = pendingReports.find(r => r.id === id);
        if (!item) return;

        try {
            const headers = { Authorization: `Bearer ${token}` };
            const endpoint = item.origType === 'missing' ? 'missing-reports' : 'found-reports';
            const body = action === 'reject' ? { reason: note || 'Rejected by admin' } : {};

            const resp = await axios.patch(`${API_URL}/${endpoint}/admin/${id}/${action}`, body, { headers });

            if (resp.data.success) {
                toast.success(action === 'approve' ? '✅ রিপোর্ট অনুমোদিত হয়েছে! ব্যবহারকারীকে বিজ্ঞপ্তি দেওয়া হয়েছে।' : '❌ রিপোর্ট প্রত্যাখ্যান করা হয়েছে।');
                refresh();
                setSelectedItem(null);
            }
        } catch (err) {
            console.error('Action error:', err);
            toast.error(err.response?.data?.message || 'অ্যাকশন নিতে সমস্যা হয়েছে');
        }
    };

    return (
        <main className="flex-1 overflow-y-auto">
            {/* Page heading */}
            <div className="flex items-center justify-between mb-5">
                <div>
                    <h1 className="text-xl font-black text-gray-800">মডারেশন প্যানেল</h1>
                    <p className="text-xs text-gray-400 mt-0.5">রিপোর্ট পর্যালোচনা করুন — অনুমোদন বা প্রত্যাখ্যান করুন</p>
                </div>
            </div>

            {/* Stats */}
            <StatsStrip stats={stats} />

            {/* Tab bar */}
            <div className="flex gap-1 bg-white border border-gray-100 rounded-2xl p-1 mb-4 shadow-sm w-fit">
                {TABS.map(tab => {
                    const count = queueMap[tab.id]?.length ?? 0;
                    return (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all whitespace-nowrap
                                ${activeTab === tab.id ? 'bg-red-500 text-white shadow-sm' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'}`}
                        >
                            <tab.icon size={13} />
                            {tab.label}
                            <span className={`text-[10px] font-black px-1.5 py-0.5 rounded-full ${activeTab === tab.id ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-400'}`}>
                                {count}
                            </span>
                        </button>
                    );
                })}
            </div>

            {/* Main card */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                {/* Search bar */}
                <div className="px-5 pt-4 pb-3 border-b border-gray-50">
                    <div className="relative max-w-sm">
                        <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                        <input
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            placeholder="নাম, আইডি, জেলা বা ইমেইল..."
                            className="w-full pl-9 pr-4 py-2 text-xs border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-200 focus:border-red-400 bg-white"
                        />
                    </div>
                </div>

                {/* Table */}
                <QueueTable
                    items={filtered}
                    onReview={setSelectedItem}
                    loading={loading}
                    emptyLabel={TABS.find(t => t.id === activeTab)?.emptyLabel}
                />
            </div>

            {/* Detail panel */}
            {selectedItem && (
                <DetailPanel
                    item={selectedItem}
                    onClose={() => setSelectedItem(null)}
                    onAction={handleAction}
                />
            )}
        </main>
    );
}

/* ══════════════════════════════════════════
   PAGE WRAPPER
══════════════════════════════════════════ */
export default function AdminModerationPage() {
    const navigate = useNavigate();
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);

    return (
        <div className="flex h-screen bg-gray-50 overflow-hidden">
            {/* Desktop sidebar */}
            <div className="hidden lg:flex">
                <AdminSidebar
                    active="moderation"
                    onNav={id => navigate(`/admin/${id}`)}
                    collapsed={sidebarCollapsed}
                    onToggle={() => setSidebarCollapsed(p => !p)}
                />
            </div>

            {/* Mobile sidebar */}
            {mobileOpen && (
                <div className="lg:hidden fixed inset-0 z-50 flex">
                    <div className="flex-shrink-0">
                        <AdminSidebar
                            active="moderation"
                            onNav={() => setMobileOpen(false)}
                            collapsed={false}
                            onToggle={() => setMobileOpen(false)}
                        />
                    </div>
                    <div className="flex-1 bg-black/50" onClick={() => setMobileOpen(false)} />
                </div>
            )}

            {/* Main area */}
            <div className="flex-1 flex flex-col overflow-hidden">
                <AdminNavbar breadcrumb="মডারেশন প্যানেল" onMobileMenu={() => setMobileOpen(true)} />
                <div className="p-4 lg:p-6 overflow-y-auto flex-1">
                    <ModerationSection />
                </div>
            </div>
        </div>
    );
}
