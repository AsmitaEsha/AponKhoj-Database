import { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
    FileText, Bell, Users, Clock,
    Search, MapPin, ChevronRight, Eye,
    UserCircle2, AlertTriangle, Settings, LayoutDashboard,
    CheckCircle2, XCircle, ChevronDown, ChevronUp, RefreshCw
} from 'lucide-react';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { useAuth } from '../helpers/AuthContext';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

/* ── Status Badge ── */
const StatusBadge = ({ status }) => {
    const map = {
        pending:   { cls: 'bg-amber-50 text-amber-600 border-amber-200',  label: 'অপেক্ষমাণ' },
        published: { cls: 'bg-emerald-50 text-emerald-600 border-emerald-200', label: 'অনুমোদিত' },
        rejected:  { cls: 'bg-red-50 text-red-500 border-red-200',        label: 'বাতিল' },
        closed:    { cls: 'bg-gray-50 text-gray-400 border-gray-200',     label: 'বন্ধ' },
    };
    const s = map[status] || map.pending;
    return (
        <span className={`inline-flex items-center text-[10px] font-bold px-2 py-0.5 rounded-full border ${s.cls}`}>
            {s.label}
        </span>
    );
};

/* ── Notification icon by type ── */
const NotifIcon = ({ type }) => {
    if (type === 'report_approved') return <CheckCircle2 size={14} className="text-emerald-500 flex-shrink-0" />;
    if (type === 'report_rejected') return <XCircle size={14} className="text-red-500 flex-shrink-0" />;
    return <Bell size={14} className="text-primary flex-shrink-0" />;
};

/* ── Skeleton ── */
const Sk = ({ className = '' }) => (
    <div className={`animate-pulse bg-gray-100 rounded-lg ${className}`} />
);

/* ── Initials ── */
const initials = (f, l) => {
    const a = f ? String(f)[0]?.toUpperCase() : '';
    const b = l ? String(l)[0]?.toUpperCase() : '';
    return (a + b) || '?';
};

/* ── Time ago ── */
const timeAgo = (iso) => {
    const diff = Date.now() - new Date(iso).getTime();
    const m = Math.floor(diff / 60000);
    const h = Math.floor(m / 60);
    const d = Math.floor(h / 24);
    if (d > 0) return `${d} দিন আগে`;
    if (h > 0) return `${h} ঘণ্টা আগে`;
    if (m > 0) return `${m} মিনিট আগে`;
    return 'এইমাত্র';
};

/* ══════════════════════════════════════════
   REPORT CARD (expandable)
══════════════════════════════════════════ */
function ReportCard({ r }) {
    const [expanded, setExpanded] = useState(false);
    const isMissing = r.type === 'missing';

    return (
        <div className={`border rounded-2xl overflow-hidden transition-all ${r.status === 'rejected' ? 'border-red-100 bg-red-50/30' : r.status === 'published' ? 'border-emerald-100 bg-emerald-50/20' : 'border-gray-100 bg-white'}`}>
            {/* Summary row */}
            <div
                className="flex items-center gap-3 px-5 py-3.5 cursor-pointer hover:bg-gray-50/50 transition-colors"
                onClick={() => setExpanded(e => !e)}
            >
                <div className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-black ${isMissing ? 'bg-red-50 text-red-500' : 'bg-teal-50 text-teal-600'}`}>
                    {r.photoUrl
                        ? <img src={r.photoUrl} alt={r.name} className="w-9 h-9 rounded-full object-cover" />
                        : r.name?.[0] || '?'}
                </div>
                <div className="flex-1 min-w-0">
                    <div className="flex items-baseline gap-2">
                        <p className="text-sm font-bold text-gray-800 truncate">{r.name}</p>
                        {r.age && <span className="text-xs text-gray-400 flex-shrink-0">~{r.age} বছর</span>}
                        <span className={`text-[9px] font-bold flex-shrink-0 px-1.5 py-0.5 rounded-full ${isMissing ? 'bg-red-50 text-red-400' : 'bg-teal-50 text-teal-500'}`}>
                            {isMissing ? 'নিখোঁজ' : 'উদ্ধার'}
                        </span>
                    </div>
                    <div className="flex items-center gap-1.5 mt-0.5">
                        <MapPin size={10} className="text-gray-300 flex-shrink-0" />
                        <span className="text-xs text-gray-400 truncate">{r.district}</span>
                        <span className="text-gray-200 text-xs">•</span>
                        <Clock size={10} className="text-gray-300 flex-shrink-0" />
                        <span className="text-xs text-gray-400 flex-shrink-0">{r.createdAt?.split('T')[0]}</span>
                    </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                    <StatusBadge status={r.status} />
                    {expanded ? <ChevronUp size={14} className="text-gray-300" /> : <ChevronDown size={14} className="text-gray-300" />}
                </div>
            </div>

            {/* Expanded details */}
            {expanded && (
                <div className="px-5 pb-4 pt-0 border-t border-gray-100/80 space-y-2">
                    {r.address && (
                        <p className="text-xs text-gray-500"><span className="font-semibold">ঠিকানা:</span> {r.address}</p>
                    )}
                    {r.clothingDescription && (
                        <p className="text-xs text-gray-500"><span className="font-semibold">পোশাক:</span> {r.clothingDescription}</p>
                    )}
                    {(r.lastSeenDate || r.foundDate) && (
                        <p className="text-xs text-gray-500">
                            <span className="font-semibold">{isMissing ? 'শেষ দেখা:' : 'উদ্ধার হয়েছে:'}</span>{' '}
                            {r.lastSeenDate || r.foundDate}
                        </p>
                    )}
                    {r.additionalInfo && (
                        <p className="text-xs text-gray-500"><span className="font-semibold">অতিরিক্ত তথ্য:</span> {r.additionalInfo}</p>
                    )}
                    {r.contactPhone && (
                        <p className="text-xs text-gray-500"><span className="font-semibold">যোগাযোগ:</span> {r.contactPersonName} — {r.contactPhone}</p>
                    )}

                    {/* Rejection reason highlighted */}
                    {r.status === 'rejected' && r.rejectionReason && (
                        <div className="bg-red-50 border border-red-100 rounded-xl p-3 mt-2">
                            <p className="text-[10px] font-bold text-red-400 uppercase tracking-wider mb-1">প্রত্যাখ্যানের কারণ</p>
                            <p className="text-xs text-red-600">{r.rejectionReason}</p>
                        </div>
                    )}

                    {/* Status messages */}
                    {r.status === 'pending' && (
                        <div className="bg-amber-50 border border-amber-100 rounded-xl p-3 mt-2">
                            <p className="text-xs text-amber-600">⏳ আপনার রিপোর্টটি অ্যাডমিনের অনুমোদনের জন্য অপেক্ষমাণ। সাধারণত ২৪ ঘণ্টার মধ্যে পর্যালোচনা করা হয়।</p>
                        </div>
                    )}
                    {r.status === 'published' && (
                        <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-3 mt-2">
                            <p className="text-xs text-emerald-600">✅ আপনার রিপোর্ট অনুমোদিত হয়েছে এবং {isMissing ? 'সার্চ পেজে' : 'উদ্ধার তালিকায়'} দেখানো হচ্ছে।</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

/* ══════════════════════════════════════════
   MAIN PAGE
══════════════════════════════════════════ */
export default function UserDashboardPage() {
    const { user, token } = useAuth();
    const navigate = useNavigate();

    const [reports, setReports] = useState([]);
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [markingRead, setMarkingRead] = useState(false);

    const fetchData = useCallback(async () => {
        if (!token) { setLoading(false); return; }

        try {
            const headers = { Authorization: `Bearer ${token}` };

            const [missingRes, foundRes, notifRes] = await Promise.all([
                axios.get(`${API_URL}/missing-reports/my`, { headers }),
                axios.get(`${API_URL}/found-reports/my`, { headers }),
                axios.get(`${API_URL}/notifications`, { headers }),
            ]);

            const mReports = (missingRes.data.reports || []).map(r => ({ ...r, type: 'missing' }));
            const fReports = (foundRes.data.reports || []).map(r => ({ ...r, type: 'found' }));
            const all = [...mReports, ...fReports].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

            setReports(all);
            setStats({
                totalReports: all.length,
                activeAlerts: all.filter(r => r.status === 'pending').length,
                successCount: all.filter(r => r.status === 'published').length,
                rejectedCount: all.filter(r => r.status === 'rejected').length,
            });

            setNotifications(notifRes.data.notifications || []);
            setUnreadCount(notifRes.data.unreadCount || 0);
        } catch (err) {
            console.error('Dashboard fetch error:', err);
        } finally {
            setLoading(false);
        }
    }, [token]);

    useEffect(() => { fetchData(); }, [fetchData]);

    const markAllRead = async () => {
        if (!token || unreadCount === 0) return;
        setMarkingRead(true);
        try {
            await axios.patch(`${API_URL}/notifications/mark-all-read`, {}, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setUnreadCount(0);
            setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
            toast.success('সব বিজ্ঞপ্তি পঠিত হিসেবে চিহ্নিত হয়েছে');
        } catch (err) {
            toast.error('সমস্যা হয়েছে');
        } finally {
            setMarkingRead(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-background">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-6">
                    <Sk className="w-48 h-7" />
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                        {[1, 2, 3, 4].map(i => <Sk key={i} className="h-20 rounded-2xl" />)}
                    </div>
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <div className="lg:col-span-2 space-y-3">
                            {[1, 2, 3].map(i => <Sk key={i} className="h-16 rounded-2xl" />)}
                        </div>
                        <div className="space-y-4">
                            <Sk className="h-48 rounded-2xl" />
                            <Sk className="h-32 rounded-2xl" />
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">

                {/* ── Welcome ── */}
                <div className="mb-6 flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-black text-gray-800">
                            স্বাগতম{user?.firstName ? `, ${user.firstName}` : ''}! 👋
                        </h1>
                        <p className="text-gray-500 text-sm mt-1">আপনার ড্যাশবোর্ড থেকে সব কার্যক্রম পরিচালনা করুন</p>
                    </div>
                    <button
                        onClick={fetchData}
                        className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-primary transition-colors px-3 py-2 border border-gray-200 rounded-xl hover:border-primary"
                    >
                        <RefreshCw size={13} /> রিফ্রেশ
                    </button>
                </div>

                {/* ── Stats ── */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                    {[
                        { icon: FileText,    label: 'আমার রিপোর্ট',    val: stats?.totalReports,   light: 'bg-secondary/10 text-secondary' },
                        { icon: Clock,       label: 'অপেক্ষমাণ',        val: stats?.activeAlerts,   light: 'bg-amber-100 text-amber-600' },
                        { icon: Users,       label: 'অনুমোদিত',         val: stats?.successCount,   light: 'bg-emerald-100 text-emerald-600' },
                        { icon: Bell,        label: 'অপঠিত বিজ্ঞপ্তি', val: unreadCount,           light: 'bg-primary/10 text-primary' },
                    ].map((s, i) => (
                        <div key={i} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex items-center gap-3">
                            <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${s.light}`}>
                                <s.icon size={20} />
                            </div>
                            <div>
                                <p className="text-xl font-black text-gray-800">{s.val ?? '—'}</p>
                                <p className="text-[11px] text-gray-400 leading-tight">{s.label}</p>
                            </div>
                        </div>
                    ))}
                </div>

                {/* ── Main Grid ── */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                    {/* ── Left: Reports ── */}
                    <div className="lg:col-span-2 space-y-6">

                        {/* My Reports */}
                        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-50">
                                <h2 className="font-bold text-gray-800">আমার রিপোর্টসমূহ</h2>
                                <span className="text-xs text-gray-400">{reports.length}টি মোট</span>
                            </div>

                            {reports.length === 0 ? (
                                <div className="text-center py-12 px-4">
                                    <div className="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center mx-auto mb-3">
                                        <FileText size={22} className="text-gray-300" />
                                    </div>
                                    <p className="text-sm font-medium text-gray-500">এখনো কোনো রিপোর্ট জমা নেই</p>
                                    <p className="text-xs text-gray-400 mt-1">নিচের বাটন থেকে একটি নতুন রিপোর্ট তৈরি করুন</p>
                                </div>
                            ) : (
                                <div className="divide-y divide-gray-50 p-4 space-y-2">
                                    {reports.map(r => <ReportCard key={`${r.type}-${r.id}`} r={r} />)}
                                </div>
                            )}

                            <div className="px-5 py-3 border-t border-gray-50 flex gap-3">
                                <Link to="/report-missing" className="flex-1 text-center text-xs font-bold py-2 rounded-xl bg-secondary/5 text-secondary hover:bg-secondary/10 transition-colors">
                                    + নিখোঁজ রিপোর্ট
                                </Link>
                                <Link to="/report-found" className="flex-1 text-center text-xs font-bold py-2 rounded-xl bg-teal-50 text-teal-600 hover:bg-teal-100 transition-colors">
                                    + উদ্ধার তথ্য
                                </Link>
                            </div>
                        </div>

                        {/* Quick Actions */}
                        <div className="grid grid-cols-2 gap-3">
                            {[
                                { to: '/search-page', label: 'নিখোঁজ তালিকা', desc: 'অনুমোদিত রিপোর্ট দেখুন', icon: Search, bg: 'bg-primary/5 border-primary/20', text: 'text-primary' },
                                { to: '/found', label: 'উদ্ধার তালিকা', desc: 'পাওয়া ব্যক্তির তথ্য', icon: Users, bg: 'bg-teal-50 border-teal-200', text: 'text-teal-600' },
                                { to: '/profile', label: 'প্রোফাইল', desc: 'তথ্য আপডেট করুন', icon: UserCircle2, bg: 'bg-gray-50 border-gray-200', text: 'text-gray-600' },
                                { to: '/help', label: 'সহায়তা', desc: 'প্রশ্ন ও সাপোর্ট', icon: Settings, bg: 'bg-secondary/5 border-secondary/20', text: 'text-secondary' },
                            ].map(a => (
                                <Link key={a.to} to={a.to} className={`flex items-start gap-3 border rounded-2xl p-4 hover:shadow-sm transition-all ${a.bg}`}>
                                    <a.icon size={18} className={`mt-0.5 flex-shrink-0 ${a.text}`} />
                                    <div>
                                        <p className={`text-sm font-bold ${a.text}`}>{a.label}</p>
                                        <p className="text-xs text-gray-400 mt-0.5">{a.desc}</p>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </div>

                    {/* ── Right Sidebar ── */}
                    <div className="space-y-5">

                        {/* Notifications */}
                        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-50 bg-gray-50/50">
                                <h2 className="font-bold text-gray-800 text-sm flex items-center gap-2">
                                    <Bell size={16} className="text-primary" />
                                    বিজ্ঞপ্তি
                                    {unreadCount > 0 && (
                                        <span className="bg-red-500 text-white text-[9px] font-black px-1.5 py-0.5 rounded-full">
                                            {unreadCount}
                                        </span>
                                    )}
                                </h2>
                                {unreadCount > 0 && (
                                    <button
                                        onClick={markAllRead}
                                        disabled={markingRead}
                                        className="text-[10px] text-primary hover:underline font-medium disabled:opacity-50"
                                    >
                                        {markingRead ? '...' : 'সব পড়া'}
                                    </button>
                                )}
                            </div>

                            <div className="divide-y divide-gray-50 max-h-[320px] overflow-y-auto">
                                {notifications.length === 0 ? (
                                    <div className="text-center py-10 px-4">
                                        <Bell size={28} className="text-gray-200 mx-auto mb-2" />
                                        <p className="text-xs text-gray-400">কোনো বিজ্ঞপ্তি নেই</p>
                                        <p className="text-[10px] text-gray-300 mt-1">রিপোর্ট অনুমোদিত বা বাতিল হলে এখানে দেখাবে</p>
                                    </div>
                                ) : (
                                    notifications.map(n => (
                                        <div
                                            key={n.id}
                                            className={`flex items-start gap-3 px-4 py-3.5 hover:bg-gray-50 transition-colors ${!n.isRead ? 'bg-blue-50/40' : ''}`}
                                        >
                                            <NotifIcon type={n.type} />
                                            <div className="flex-1 min-w-0">
                                                <p className={`text-xs font-bold ${n.type === 'report_approved' ? 'text-emerald-700' : n.type === 'report_rejected' ? 'text-red-600' : 'text-gray-700'}`}>
                                                    {n.title}
                                                </p>
                                                <p className="text-[10px] text-gray-500 mt-0.5 leading-relaxed">{n.message}</p>
                                                <p className="text-[10px] text-gray-300 mt-1 flex items-center gap-1">
                                                    <Clock size={9} /> {timeAgo(n.createdAt)}
                                                </p>
                                            </div>
                                            {!n.isRead && (
                                                <div className="w-2 h-2 rounded-full bg-primary mt-1.5 flex-shrink-0" />
                                            )}
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>

                        {/* Profile Card */}
                        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                            <h2 className="font-bold text-gray-800 text-sm mb-4">আমার তথ্য</h2>

                            <div className="flex justify-center mb-4">
                                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center text-white text-2xl font-black shadow-sm">
                                    {initials(user?.firstName, user?.lastName)}
                                </div>
                            </div>

                            <div className="space-y-2.5 text-xs text-gray-500 mb-4">
                                <div className="flex items-center gap-2">
                                    <UserCircle2 size={13} className="text-gray-300 flex-shrink-0" />
                                    <span>{user?.firstName && user?.lastName ? `${user.firstName} ${user.lastName}` : user?.firstName || '—'}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <MapPin size={13} className="text-gray-300 flex-shrink-0" />
                                    <span>{user?.location || '—'}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="text-gray-300 text-[11px]">☎</span>
                                    <span>{user?.phone || '—'}</span>
                                </div>
                            </div>

                            <Link to="/profile" className="flex items-center justify-center gap-2 w-full border border-gray-200 text-gray-600 text-xs py-2 rounded-xl hover:border-primary hover:text-primary transition-colors font-medium">
                                <Settings size={12} /> প্রোফাইল সম্পাদনা
                            </Link>
                        </div>

                        {/* Emergency */}
                        <div className="bg-secondary/5 border border-secondary/20 rounded-2xl p-4">
                            <div className="flex items-center gap-2 mb-2">
                                <AlertTriangle size={16} className="text-secondary" />
                                <p className="text-sm font-bold text-secondary">জরুরি সহায়তা</p>
                            </div>
                            <p className="text-xs text-gray-500 mb-3">পুলিশ নিয়ন্ত্রণ কক্ষ বা জরুরি সেবা</p>
                            <a href="tel:999" className="text-2xl font-black text-secondary hover:scale-105 transition-transform inline-flex">
                                📞 999
                            </a>
                        </div>

                    </div>
                </div>
            </div>
        </div>
    );
}