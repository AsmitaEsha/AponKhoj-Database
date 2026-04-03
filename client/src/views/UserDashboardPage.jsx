import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
    FileText, Bell, Users, Clock,
    Search, MapPin, ChevronRight, Zap, Eye, Trash2,
    UserCircle2, AlertTriangle, Settings
} from 'lucide-react';
import { useAuth } from '../helpers/AuthContext';

// Status Badge
const StatusBadge = ({ status }) => {
    const styles = {
        pending: 'bg-yellow-50 text-yellow-600 border-yellow-200',
        verified: 'bg-teal-50 text-teal-600 border-teal-200',
        matched: 'bg-purple-50 text-purple-600 border-purple-200',
        closed: 'bg-gray-50 text-gray-500 border-gray-200',
    };
    const labels = {
        pending: 'αªàαª¬αºçαªòαºìαª╖αª«αª╛αªú',
        verified: 'αª»αª╛αªÜαª╛αªçαªòαºâαªñ',
        matched: 'αª«αºìαª»αª╛αªÜ αª¬αª╛αªôαª»αª╝αª╛',
        closed: 'αª¼αª¿αºìαªº',
    };
    return (
        <span className={`inline-flex items-center text-[10px] font-bold px-2 py-0.5 rounded-full border ${styles[status] || styles.pending}`}>
            {labels[status] || status}
        </span>
    );
};

// Skeleton Loader
const Skeleton = ({ className = '' }) => (
    <div className={`animate-pulse bg-gray-100 rounded-lg ${className}`} />
);

// Helper function to get user initials
const getInitials = (firstName, lastName) => {
    if (!firstName && !lastName) return '?';
    const first = firstName ? String(firstName)[0]?.toUpperCase() : '';
    const last = lastName ? String(lastName)[0]?.toUpperCase() : '';
    return (first + last) || '?';
};

// Main Component
export default function UserDashboardPage() {
    const { user } = useAuth();
    const [reports, setReports] = useState([]);
    const [notifications, setNotifications] = useState([]);
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    // ✅ NEW: Track user changes for debugging
    useEffect(() => {
        console.log('📊 Dashboard: User changed!');
        console.log('User object:', user);
        if (user?.firstName || user?.lastName) {
            console.log('Initials will be:', getInitials(user.firstName, user.lastName));
        } else {
            console.log('No firstName/lastName available');
        }
    }, [user]);

    // Loading state
    useEffect(() => {
        const timer = setTimeout(() => {
            setReports([]);
            setNotifications([]);
            setStats({
                totalReports: 0,
                activeAlerts: 0,
                successCount: 0,
                aiChecks: 0
            });
            setLoading(false);
        }, 600);
        return () => clearTimeout(timer);
    }, []);

    if (loading) {
        return (
            <div className="min-h-screen bg-background">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-6">
                    <Skeleton className="w-48 h-7" />
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                        {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-20 rounded-2xl" />)}
                    </div>
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <div className="lg:col-span-2 space-y-3">
                            {[1, 2, 3].map(i => <Skeleton key={i} className="h-16 rounded-2xl" />)}
                        </div>
                        <div className="space-y-4">
                            <Skeleton className="h-48 rounded-2xl" />
                            <Skeleton className="h-32 rounded-2xl" />
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
                <div className="mb-6">
                    <h1 className="text-2xl font-black text-gray-800">
                        স্বাগতম{user?.firstName ? `, ${user.firstName}` : ''}! 👋
                    </h1>
                    <p className="text-gray-500 text-sm mt-1">আপনার ড্যাশবোর্ড থেকে সব কার্যক্রম পরিচালনা করুন</p>
                </div>

                {/* ── AI Match Alert Banner (only shown if a match exists) ── */}
                {/* TODO: show when stats?.hasMatch === true */}
                {/* {stats?.hasMatch && ( */}
                {/*   <div className="bg-gradient-to-r from-purple-600 to-purple-500 rounded-2xl p-4 mb-6 ..."> ... </div> */}
                {/* )} */}

                {/* ── Stats ── */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                    {[
                        { icon: FileText, label: 'আমার রিপোর্ট', key: 'totalReports', light: 'bg-secondary/10 text-secondary' },
                        { icon: Bell, label: 'সক্রিয় আলার্ট', key: 'activeAlerts', light: 'bg-primary/10 text-primary' },
                        { icon: Users, label: 'সফল পুনর্মিলন', key: 'successCount', light: 'bg-teal-100 text-teal-600' },
                        { icon: Zap, label: 'AI ম্যাচ পরীক্ষা', key: 'aiChecks', light: 'bg-purple-100 text-purple-600' },
                    ].map(s => (
                        <div key={s.key} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex items-center gap-3">
                            <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${s.light}`}>
                                <s.icon size={20} />
                            </div>
                            <div>
                                <p className="text-xl font-black text-gray-800">{stats?.[s.key] ?? '—'}</p>
                                <p className="text-[11px] text-gray-400 leading-tight">{s.label}</p>
                            </div>
                        </div>
                    ))}
                </div>

                {/* ── Main Grid ── */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                    {/* ── Left: Reports + Quick Actions ── */}
                    <div className="lg:col-span-2 space-y-6">

                        {/* My Reports */}
                        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-50">
                                <h2 className="font-bold text-gray-800">আমার রিপোর্টসমূহ</h2>
                                <Link to="/my-reports" className="text-xs text-primary hover:underline flex items-center gap-1">
                                    সব দেখুন <ChevronRight size={12} />
                                </Link>
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
                                <div className="divide-y divide-gray-50">
                                    {reports.map(r => (
                                        <div key={r.id} className="flex items-center gap-3 px-5 py-3.5 hover:bg-gray-50/50 transition-colors group">
                                            <div className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-black ${r.type === 'missing' ? 'bg-red-50 text-secondary' : 'bg-teal-50 text-teal-600'}`}>
                                                {r.name?.[0] || '?'}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-baseline gap-2">
                                                    <p className="text-sm font-bold text-gray-800 truncate">{r.name}</p>
                                                    <span className="text-xs text-gray-400 flex-shrink-0">~{r.age} বছর</span>
                                                </div>
                                                <div className="flex items-center gap-1.5 mt-0.5">
                                                    <MapPin size={10} className="text-gray-300 flex-shrink-0" />
                                                    <span className="text-xs text-gray-400 truncate">{r.district}</span>
                                                    <span className="text-gray-200 text-xs">•</span>
                                                    <Clock size={10} className="text-gray-300 flex-shrink-0" />
                                                    <span className="text-xs text-gray-400 flex-shrink-0">{r.date}</span>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2 flex-shrink-0">
                                                <StatusBadge status={r.status} />
                                                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <button className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-gray-100 text-gray-400 hover:text-primary transition-colors">
                                                        <Eye size={13} />
                                                    </button>
                                                    <button className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-red-50 text-gray-400 hover:text-secondary transition-colors">
                                                        <Trash2 size={13} />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
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
                                { to: '/search', label: 'তালিকায় অনুসন্ধান', desc: 'নিখোঁজ তালিকা দেখুন', icon: Search, bg: 'bg-primary/5 border-primary/20', text: 'text-primary' },
                                { to: '/ai-match', label: 'AI ম্যাচ দেখুন', desc: 'মুখ শনাক্তকরণ ফলাফল', icon: Zap, bg: 'bg-purple-50 border-purple-200', text: 'text-purple-600' },
                                { to: '/profile', label: 'প্রোফাইল সম্পাদনা', desc: 'তথ্য আপডেট করুন', icon: UserCircle2, bg: 'bg-gray-50 border-gray-200', text: 'text-gray-600' },
                                { to: '/help', label: 'সহায়তা কেন্দ্র', desc: 'প্রশ্ন ও সাপোর্ট', icon: Settings, bg: 'bg-secondary/5 border-secondary/20', text: 'text-secondary' },
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
                        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden mb-5">
                            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-50 bg-gray-50/50">
                                <h2 className="font-bold text-gray-800 text-sm flex items-center gap-2">
                                    <Bell size={16} className="text-primary" /> বিজ্ঞপ্তি ও আপডেট
                                </h2>
                                {notifications.length > 0 && (
                                    <span className="bg-primary/10 text-primary text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                                        {notifications.length}
                                    </span>
                                )}
                            </div>
                            <div className="divide-y divide-gray-50 max-h-[300px] overflow-y-auto scrollbar-none">
                                {notifications.length === 0 ? (
                                    <div className="text-center py-8 px-4 text-gray-400 text-xs">
                                        কোনো নতুন বিজ্ঞপ্তি নেই
                                    </div>
                                ) : (
                                    notifications.map(n => (
                                        <div key={n.id} className={`flex items-start gap-3 px-4 py-3.5 hover:bg-gray-50 transition-colors group ${n.urgent ? 'bg-primary/[0.02]' : ''}`}>
                                            <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${n.urgent ? 'bg-primary shadow-[0_0_8px_rgba(239,68,68,0.4)]' : 'bg-gray-200'}`} />
                                            <div className="flex-1 min-w-0">
                                                <p className="text-xs text-gray-700 leading-relaxed font-medium">{n.text}</p>
                                                <p className="text-[10px] text-gray-400 mt-1 flex items-center gap-1">
                                                    <Clock size={10} /> {n.time}
                                                </p>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>


                        {/* Profile Card */}
                        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                            <h2 className="font-bold text-gray-800 text-sm mb-4">আমার তথ্য</h2>

                            {/* Avatar with Initials */}
                            <div className="flex justify-center mb-4">
                                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center text-white text-2xl font-black shadow-sm">
                                    {getInitials(user?.firstName, user?.lastName)}
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
                                <div className="flex items-center gap-2">
                                    <span className="text-gray-300 text-[11px]">📅</span>
                                    <span>যোগদান: {user?.joinDate || '৪ এপ্রিল ২০২৬'}</span>
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