import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
    Bell, Search, Menu, Shield, ChevronDown,
    FileText, Users, Flag,
    AlertTriangle, X,
    Plus, UserCheck, BarChart2, RefreshCw
} from 'lucide-react';

import { useAuth } from '../helpers/AuthContext';

/* ─────────────────────────────────────────
   NOTIFICATION ITEM shape:
   { id, title, body, time, type, read }
   type: 'report' | 'user' | 'system' | 'alert'
───────────────────────────────────────── */
const NOTIF_ICON = {
    report: { icon: FileText, cls: 'text-blue-500   bg-blue-50' },
    user: { icon: UserCheck, cls: 'text-purple-500 bg-purple-50' },
    system: { icon: RefreshCw, cls: 'text-gray-500   bg-gray-100' },
    alert: { icon: AlertTriangle, cls: 'text-red-500    bg-red-50' },
};

/* ─────────────────────────────────────────
   QUICK ACTIONS
───────────────────────────────────────── */


/* ─────────────────────────────────────────
   NOTIFICATION PANEL
───────────────────────────────────────── */
function NotificationPanel({ notifications, onMarkAll, onClose }) {
    return (
        <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-2xl shadow-xl
                        border border-gray-100 z-50 overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-50">
                <h3 className="text-sm font-black text-gray-800">বিজ্ঞপ্তি</h3>
                <div className="flex items-center gap-2">
                    {notifications.length > 0 && (
                        <button onClick={onMarkAll}
                            className="text-[10px] font-semibold text-red-500 hover:underline">
                            সব পড়া হয়েছে
                        </button>
                    )}
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                        <X size={14} />
                    </button>
                </div>
            </div>

            {/* Body */}
            <div className="max-h-72 overflow-y-auto">
                {notifications.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-10 text-gray-300">
                        <Bell size={28} className="mb-2" />
                        <p className="text-xs font-semibold text-gray-400">কোনো বিজ্ঞপ্তি নেই</p>
                        <p className="text-[10px] text-gray-300 mt-0.5">নতুন কার্যক্রম দেখা দিলে এখানে দেখাবে</p>
                    </div>
                ) : (
                    notifications.map(n => {
                        const conf = NOTIF_ICON[n.type] ?? NOTIF_ICON.system;
                        const Icon = conf.icon;
                        return (
                            <div key={n.id}
                                className={`flex items-start gap-3 px-4 py-3 border-b border-gray-50
                                            hover:bg-gray-50/60 transition-colors cursor-pointer
                                            ${n.read ? 'opacity-60' : ''}`}>
                                <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 ${conf.cls}`}>
                                    <Icon size={14} />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-xs font-bold text-gray-800 leading-snug">{n.title}</p>
                                    <p className="text-[10px] text-gray-400 mt-0.5 leading-relaxed">{n.body}</p>
                                    <p className="text-[10px] text-gray-300 mt-1">{n.time}</p>
                                </div>
                                {!n.read && (
                                    <div className="w-2 h-2 rounded-full bg-red-500 flex-shrink-0 mt-1" />
                                )}
                            </div>
                        );
                    })
                )}
            </div>

            {/* Footer */}
            <div className="px-4 py-3 border-t border-gray-50 bg-gray-50/50">
                <Link to="/admin/dashboard" onClick={onClose}
                    className="text-xs font-semibold text-red-500 hover:underline">
                    সব বিজ্ঞপ্তি দেখুন →
                </Link>
            </div>
        </div>
    );
}

/* ─────────────────────────────────────────
   SEARCH BAR
───────────────────────────────────────── */
function SearchBar() {
    const [active, setActive] = useState(false);
    const [query, setQuery] = useState('');
    const inputRef = useRef(null);

    /* Ctrl+K shortcut */
    useEffect(() => {
        const handler = (e) => {
            if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
                e.preventDefault();
                setActive(true);
                setTimeout(() => inputRef.current?.focus(), 50);
            }
            if (e.key === 'Escape') { setActive(false); setQuery(''); }
        };
        window.addEventListener('keydown', handler);
        return () => window.removeEventListener('keydown', handler);
    }, []);

    return (
        <div className={`relative flex items-center transition-all duration-200
                         ${active ? 'w-72' : 'w-48'}`}>
            <Search size={13} className="absolute left-3 text-gray-400 pointer-events-none" />
            <input
                ref={inputRef}
                value={query}
                onChange={e => setQuery(e.target.value)}
                onFocus={() => setActive(true)}
                onBlur={() => { if (!query) setActive(false); }}
                placeholder="খুঁজুন…"
                className="w-full pl-8 pr-16 py-2 text-xs bg-gray-50 border border-gray-200
                           rounded-xl focus:outline-none focus:ring-2 focus:ring-red-200
                           focus:border-red-400 focus:bg-white transition-all" />
            <kbd className="absolute right-3 text-[9px] text-gray-300 font-mono hidden sm:block">
                Ctrl+K
            </kbd>
        </div>
    );
}

/* ─────────────────────────────────────────
   ADMIN NAVBAR
   Props:
     breadcrumb: string   (e.g. "ড্যাশবোর্ড")
     onMobileMenu: fn     (opens mobile sidebar)
───────────────────────────────────────── */
export default function AdminNavbar({ breadcrumb = 'ড্যাশবোর্ড', onMobileMenu }) {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    /* Notification state — wire up via API later */
    const [notifications, setNotifications] = useState([]);
    // TODO: fetch notifications on mount:
    // useEffect(() => {
    //   apiClient.get('/admin/notifications').then(r => setNotifications(r.data));
    // }, []);

    const unread = notifications.filter(n => !n.read).length;

    const [notifOpen, setNotifOpen] = useState(false);
    const [quickOpen, setQuickOpen] = useState(false);

    /* Close dropdowns on outside click */
    const notifRef = useRef(null);
    const quickRef = useRef(null);
    useEffect(() => {
        const handler = (e) => {
            if (notifRef.current && !notifRef.current.contains(e.target)) setNotifOpen(false);
            if (quickRef.current && !quickRef.current.contains(e.target)) setQuickOpen(false);
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    const markAllRead = () => setNotifications(p => p.map(n => ({ ...n, read: true })));

    return (
        <header className="flex items-center justify-between px-4 lg:px-6 py-3
                           bg-white border-b border-gray-100 shadow-sm flex-shrink-0 z-30">

            {/* ── Left: hamburger + breadcrumb ── */}
            <div className="flex items-center gap-3">
                {/* Mobile hamburger */}
                <button onClick={onMobileMenu}
                    className="lg:hidden w-8 h-8 flex items-center justify-center text-gray-500
                               hover:bg-gray-100 rounded-lg transition-colors">
                    <Menu size={18} />
                </button>

                {/* Breadcrumb */}
                <nav className="flex items-center gap-1.5 text-xs text-gray-400">
                    <Shield size={12} className="text-red-500 flex-shrink-0" />
                    <span className="font-bold text-red-500 hidden sm:block">ADMIN</span>
                    <span className="hidden sm:block">/</span>
                    <span className="font-bold text-gray-700">{breadcrumb}</span>
                </nav>
            </div>

            {/* ── Center: search (desktop only) ── */}
            <div className="hidden md:flex">
                <SearchBar />
            </div>

            {/* ── Right: actions + avatar ── */}
            <div className="flex items-center gap-1.5">

                {/* Mobile search toggle */}
                <button className="md:hidden w-8 h-8 flex items-center justify-center
                                   text-gray-500 hover:bg-gray-100 rounded-lg transition-colors">
                    <Search size={16} />
                </button>

                {/* Notification bell */}
                <div ref={notifRef} className="relative">
                    <button onClick={() => { setNotifOpen(p => !p); setQuickOpen(false); }}
                        className={`relative w-9 h-9 flex items-center justify-center rounded-xl
                                    transition-colors ${notifOpen ? 'bg-gray-100' : 'hover:bg-gray-100'}`}>
                        <Bell size={17} className="text-gray-500" />
                        {unread > 0 && (
                            <span className="absolute top-1.5 right-1.5 min-w-[14px] h-3.5 px-0.5
                                             bg-red-500 text-white text-[8px] font-black rounded-full
                                             flex items-center justify-center leading-none">
                                {unread > 9 ? '9+' : unread}
                            </span>
                        )}
                    </button>

                    {notifOpen && (
                        <NotificationPanel
                            notifications={notifications}
                            onMarkAll={markAllRead}
                            onClose={() => setNotifOpen(false)} />
                    )}
                </div>
            </div>
        </header>
    );
}
