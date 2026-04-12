import { useState, useRef, useEffect, useCallback } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import {
    Menu, X, Search, ChevronDown, User, Settings, FileText,
    LogOut, Bell, LayoutDashboard, Shield, MapPin
} from 'lucide-react';
import { useAuth } from '../helpers/AuthContext';
import axios from 'axios';

/* ─── Avatar initials helper ─── */
const NavAvatar = ({ user }) => {
    if (user?.avatarUrl) {
        return <img src={user.avatarUrl} alt={user.firstName}
            className="w-8 h-8 rounded-full object-cover border-2 border-primary/20" />;
    }
    const getInitials = () => {
        if (user?.firstName || user?.lastName) {
            const first = user.firstName ? user.firstName[0].toUpperCase() : '';
            const last = user.lastName ? user.lastName[0].toUpperCase() : '';
            return (first + last) || '?';
        }
        return '?';
    };
    return (
        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center
                        text-primary font-black text-xs border-2 border-primary/20">
            {getInitials()}
        </div>
    );
};

/* ─── Notification Bell ─── */
const NotificationBell = ({ token }) => {
    const navigate = useNavigate();
    const [open, setOpen] = useState(false);
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [loading, setLoading] = useState(false);
    const bellRef = useRef(null);

    const API = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
    const API_BASE = API.endsWith('/') ? API.slice(0, -1) : API;
    const notificationsEndpoint = API_BASE.endsWith('/api')
        ? `${API_BASE}/notifications`
        : `${API_BASE}/api/notifications`;

    const authHeaders = { headers: { Authorization: `Bearer ${token}` } };
    const alertScopeQuery = '?scope=alerts';

    // Fetch notifications
    const fetchNotifications = useCallback(async () => {
        if (!token) return;
        try {
            setLoading(true);
            const { data } = await axios.get(`${notificationsEndpoint}${alertScopeQuery}`, authHeaders);
            if (data.success) {
                setNotifications(data.notifications || []);
                setUnreadCount(data.unreadCount || 0);
            }
        } catch (err) {
            console.error('Failed to fetch notifications:', err);
        } finally {
            setLoading(false);
        }
    }, [token, notificationsEndpoint]);

    // Poll unread count every 30 s (lightweight)
    useEffect(() => {
        if (!token) return;
        const fetchCount = async () => {
            try {
                const { data } = await axios.get(`${notificationsEndpoint}/unread-count${alertScopeQuery}`, authHeaders);
                if (data.success) setUnreadCount(data.unreadCount || 0);
            } catch { /* silent */ }
        };
        fetchCount();
        const interval = setInterval(fetchCount, 30000);
        return () => clearInterval(interval);
    }, [token, notificationsEndpoint]);

    // Fetch full list when panel opens
    useEffect(() => {
        if (open) fetchNotifications();
    }, [open, fetchNotifications]);

    // Close when clicking outside
    useEffect(() => {
        const handle = (e) => {
            if (bellRef.current && !bellRef.current.contains(e.target)) setOpen(false);
        };
        document.addEventListener('mousedown', handle);
        return () => document.removeEventListener('mousedown', handle);
    }, []);

    // Mark single notification as read and navigate
    const handleNotificationClick = async (notif) => {
        try {
            if (!notif.isRead) {
                await axios.patch(`${notificationsEndpoint}/${notif.id}/read${alertScopeQuery}`, {}, authHeaders);
                setNotifications(prev => prev.map(n => n.id === notif.id ? { ...n, isRead: true } : n));
                setUnreadCount(prev => Math.max(0, prev - 1));
            }
        } catch { /* silent */ }

        setOpen(false);

        // Navigate to the report
        if (notif.reportType === 'missing_person') {
            navigate(`/report/${notif.reportId}`);
        } else if (notif.reportType === 'found_person') {
            navigate(`/found/${notif.reportId}`);
        }
    };

    // Clear all area alerts from dropdown
    const handleClearAlerts = async (e) => {
        e.stopPropagation();
        try {
            await axios.delete(`${notificationsEndpoint}/clear${alertScopeQuery}`, authHeaders);
            setNotifications([]);
            setUnreadCount(0);
        } catch { /* silent */ }
    };

    // Icon style per notification type
    const notifIcon = (type) => {
        if (type === 'area_alert') return { bg: 'bg-blue-50', text: 'text-blue-500', icon: MapPin };
        if (type === 'report_approved') return { bg: 'bg-green-50', text: 'text-green-500', icon: Bell };
        if (type === 'report_rejected') return { bg: 'bg-red-50', text: 'text-red-500', icon: Bell };
        return { bg: 'bg-gray-50', text: 'text-gray-500', icon: Bell };
    };

    const timeAgo = (isoDate) => {
        const diff = (Date.now() - new Date(isoDate)) / 1000;
        if (diff < 60) return 'এখনই';
        if (diff < 3600) return `${Math.floor(diff / 60)} মিনিট আগে`;
        if (diff < 86400) return `${Math.floor(diff / 3600)} ঘন্টা আগে`;
        return `${Math.floor(diff / 86400)} দিন আগে`;
    };

    return (
        <div className="relative" ref={bellRef}>
            {/* Bell button */}
            <button
                onClick={() => setOpen(p => !p)}
                className="relative p-2 rounded-lg text-gray-500 hover:text-primary hover:bg-gray-50
                           border border-transparent hover:border-gray-200 transition-all"
                aria-label="Notifications"
            >
                <Bell size={18} strokeWidth={2} />
                {unreadCount > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] bg-red-500 text-white
                                     text-[10px] font-black rounded-full flex items-center justify-center px-1
                                     leading-none shadow-sm">
                        {unreadCount > 99 ? '99+' : unreadCount}
                    </span>
                )}
            </button>

            {/* Dropdown panel */}
            {open && (
                <div
                    className="absolute right-0 top-full mt-2 w-80 bg-white border border-gray-100
                               rounded-2xl shadow-xl z-50 overflow-hidden"
                    style={{ animation: 'dropdownFade 0.15s ease-out' }}
                >
                    {/* Header */}
                    <div className="flex items-center justify-between px-4 py-3 bg-gray-50 border-b border-gray-100">
                        <div className="flex items-center gap-2">
                            <Bell size={14} className="text-primary" />
                            <span className="text-sm font-bold text-gray-800">নোটিফিকেশন</span>
                        </div>
                        {notifications.length > 0 && (
                            <button
                                onClick={handleClearAlerts}
                                className="text-xs text-gray-500 hover:text-red-500 font-medium transition-colors"
                                title="সব এলার্ট মুছুন"
                            >
                                পরিষ্কার করুন
                            </button>
                        )}
                    </div>

                    {/* List */}
                    <div className="max-h-[380px] overflow-y-auto divide-y divide-gray-50">
                        {loading ? (
                            <div className="py-8 text-center text-sm text-gray-400">লোড হচ্ছে...</div>
                        ) : notifications.length === 0 ? (
                            <div className="py-10 text-center">
                                <Bell size={28} className="mx-auto text-gray-200 mb-2" />
                                <p className="text-sm text-gray-400">কোনো এলার্ট নেই</p>
                            </div>
                        ) : (
                            notifications.map((notif) => {
                                const { bg, text, icon: Icon } = notifIcon(notif.type);
                                return (
                                    <button
                                        key={notif.id}
                                        onClick={() => handleNotificationClick(notif)}
                                        className={`w-full flex items-start gap-3 px-4 py-3 text-left
                                                   hover:bg-gray-50 transition-colors
                                                   ${!notif.isRead ? 'bg-blue-50/40' : ''}`}
                                    >
                                        {/* Icon */}
                                        <div className={`w-8 h-8 rounded-full ${bg} flex items-center justify-center shrink-0 mt-0.5`}>
                                            <Icon size={14} className={text} />
                                        </div>

                                        {/* Content */}
                                        <div className="flex-1 min-w-0">
                                            <p className={`text-xs font-bold truncate ${notif.isRead ? 'text-gray-600' : 'text-gray-800'}`}>
                                                {notif.title}
                                            </p>
                                            <p className="text-xs text-gray-500 mt-0.5 line-clamp-2 leading-relaxed">
                                                {notif.message}
                                            </p>
                                            <p className="text-[10px] text-gray-400 mt-1">
                                                {timeAgo(notif.createdAt)}
                                            </p>
                                        </div>

                                        {/* Unread dot */}
                                        {!notif.isRead && (
                                            <div className="w-2 h-2 bg-blue-500 rounded-full shrink-0 mt-1.5" />
                                        )}
                                    </button>
                                );
                            })
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

/* ─── Main Navbar ─── */
const Navbar = () => {
    const { user, token, isAuthenticated, isAdmin, logout } = useAuth();
    const navigate = useNavigate();
    const [menuOpen, setMenuOpen] = useState(false);
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const dropdownRef = useRef(null);

    const navLinks = [
        { to: '/search-page', label: 'নিখোঁজ তালিকা' },
        { to: '/found', label: 'উদ্ধারকৃত তালিকা' },
        { to: '/about', label: 'আমাদের সম্পর্কে' },
        { to: '/contact', label: 'যোগাযোগ' },
    ];

    // Close dropdown when clicking outside
    useEffect(() => {
        const handle = (e) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
                setDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handle);
        return () => document.removeEventListener('mousedown', handle);
    }, []);

    const handleLogout = () => {
        logout();
        setDropdownOpen(false);
        setMenuOpen(false);
        navigate('/');
    };

    /* ─── Profile Dropdown Menu Items ─── */
    const profileMenuItems = isAdmin ? [
        { to: '/admin/dashboard', label: 'অ্যাডমিন প্যানেল', icon: LayoutDashboard },
        { to: '/admin/profile', label: 'অ্যাডমিন প্রোফাইল', icon: Settings },
        { to: '/admin/profile?tab=logs', label: 'কার্যক্রম লগ', icon: FileText },
        { to: '/admin/profile?tab=system', label: 'সিস্টেম সেটিংস', icon: Shield },
    ] : [
        { to: '/dashboard', label: 'ড্যাশবোর্ড', icon: LayoutDashboard },
        { to: '/profile', label: 'প্রোফাইল সেটিংস', icon: Settings },
    ];

    return (
        <nav className="bg-white border-b border-gray-100 sticky top-0 z-50 shadow-sm">
            <div className="max-w-7xl mx-auto px-4 sm:px-6">
                <div className="flex items-center justify-between h-16">

                    {/* ── Logo ── */}
                    <Link to="/" className="flex items-center gap-2 font-bold text-gray-800 shrink-0">
                        <div className="w-8 h-8 bg-primary/10 rounded-md flex items-center justify-center shrink-0">
                            <Search size={18} className="text-primary" strokeWidth={2.5} />
                        </div>
                        <span className="text-base font-extrabold text-gray-800 whitespace-nowrap">আপনখোঁজ</span>
                    </Link>

                    {/* ── Desktop Nav Links ── */}
                    <div className="hidden md:flex items-center gap-1">
                        {navLinks.map(l => (
                            <NavLink
                                key={l.to}
                                to={l.to}
                                className={({ isActive }) =>
                                    `px-3 py-1.5 rounded-md text-sm font-medium transition-colors
                                     ${isActive ? 'text-primary bg-primary/5' : 'text-gray-600 hover:text-primary hover:bg-gray-50'}`
                                }
                            >
                                {l.label}
                            </NavLink>
                        ))}
                    </div>

                    {/* ── Right Side ── */}
                    <div className="hidden md:flex items-center gap-2">
                        {isAuthenticated ? (
                            <>
                                {/* 🔔 Notification Bell — only for logged-in users */}
                                <NotificationBell token={token} />

                                {/* Profile Dropdown */}
                                <div className="relative" ref={dropdownRef}>
                                    <button
                                        onClick={() => setDropdownOpen(p => !p)}
                                        className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-xl
                                                   hover:bg-gray-50 border border-transparent hover:border-gray-200
                                                   transition-all group"
                                        aria-label="User menu"
                                    >
                                        <NavAvatar user={user} />
                                        <span className="text-sm font-semibold text-gray-700 max-w-[110px] truncate">
                                            {user?.firstName || 'আমার অ্যাকাউন্ট'}
                                        </span>
                                        {isAdmin && (
                                            <span className="text-[9px] font-black text-red-600 bg-red-100
                                                             border border-red-200 px-1.5 py-0.5 rounded uppercase tracking-wide">
                                                ADMIN
                                            </span>
                                        )}
                                        <ChevronDown size={14} className={`text-gray-400 transition-transform duration-200 ${dropdownOpen ? 'rotate-180' : ''}`} />
                                    </button>

                                    {/* Dropdown Panel */}
                                    {dropdownOpen && (
                                        <div className="absolute right-0 top-full mt-2 w-60 bg-white border border-gray-100
                                                        rounded-2xl shadow-xl overflow-hidden z-50 animate-in"
                                            style={{ animation: 'dropdownFade 0.15s ease-out' }}>

                                            {/* Header */}
                                            <div className="px-4 py-3 bg-gray-50 border-b border-gray-100">
                                                <div className="flex items-center gap-2.5">
                                                    <NavAvatar user={user} />
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-sm font-bold text-gray-800 truncate">{user?.firstName && user?.lastName ? `${user.firstName} ${user.lastName}` : user?.firstName || '—'}</p>
                                                        <p className="text-xs text-gray-400 truncate">{user?.email || '—'}</p>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Menu Items */}
                                            <div className="py-1">
                                                {profileMenuItems.map(item => (
                                                    <Link
                                                        key={item.to}
                                                        to={item.to}
                                                        onClick={() => setDropdownOpen(false)}
                                                        className="flex items-center gap-3 px-4 py-2.5
                                                                   text-sm text-gray-600 hover:bg-gray-50 hover:text-primary
                                                                   transition-colors"
                                                    >
                                                        <item.icon size={15} className="flex-shrink-0 text-gray-400" />
                                                        {item.label}
                                                    </Link>
                                                ))}
                                            </div>

                                            {/* Logout */}
                                            <div className="border-t border-gray-100 py-1">
                                                <button
                                                    onClick={handleLogout}
                                                    className="flex items-center gap-3 w-full px-4 py-2.5
                                                               text-sm text-red-500 hover:bg-red-50 transition-colors"
                                                >
                                                    <LogOut size={15} className="flex-shrink-0" />
                                                    লগআউট
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </>
                        ) : (
                            /* ── Login / Register ── */
                            <>
                                <Link to="/login"
                                    className="text-sm text-gray-600 hover:text-primary px-3 py-1.5 rounded-md transition-colors font-medium">
                                    লগইন
                                </Link>
                                <Link to="/register"
                                    className="text-sm bg-primary text-white px-4 py-1.5 rounded-lg hover:bg-primary-dark transition-colors font-medium">
                                    রেজিস্ট্রেশন
                                </Link>
                            </>
                        )}
                    </div>

                    {/* ── Mobile Menu Toggle ── */}
                    <div className="md:hidden flex items-center gap-1">
                        {/* Mobile bell — only when logged in */}
                        {isAuthenticated && <NotificationBell token={token} />}
                        <button className="p-2 text-gray-500" onClick={() => setMenuOpen(!menuOpen)}>
                            {menuOpen ? <X size={20} /> : <Menu size={20} />}
                        </button>
                    </div>
                </div>

                {/* ── Mobile Menu ── */}
                {menuOpen && (
                    <div className="md:hidden pb-4 space-y-1 border-t border-gray-50 pt-3">
                        {navLinks.map(l => (
                            <Link key={l.to} to={l.to} onClick={() => setMenuOpen(false)}
                                className="block px-3 py-2 text-sm text-gray-600 hover:text-primary hover:bg-gray-50 rounded-md">
                                {l.label}
                            </Link>
                        ))}

                        {isAuthenticated ? (
                            <>
                                {/* Mobile profile info */}
                                <div className="flex items-center gap-2.5 px-3 py-2 border-t border-gray-50 mt-2 pt-3">
                                    <NavAvatar user={user} />
                                    <div>
                                        <p className="text-sm font-bold text-gray-800">{user?.firstName && user?.lastName ? `${user.firstName} ${user.lastName}` : user?.firstName || '—'}</p>
                                        <p className="text-xs text-gray-400">{user?.email || '—'}</p>
                                    </div>
                                </div>
                                <Link to="/dashboard" onClick={() => setMenuOpen(false)}
                                    className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 hover:text-primary hover:bg-gray-50 rounded-md">
                                    <LayoutDashboard size={14} /> ড্যাশবোর্ড
                                </Link>
                                <Link to="/profile" onClick={() => setMenuOpen(false)}
                                    className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 hover:text-primary hover:bg-gray-50 rounded-md">
                                    <User size={14} /> প্রোফাইল সেটিংস
                                </Link>
                                <button onClick={handleLogout}
                                    className="flex items-center gap-2 w-full px-3 py-2 text-sm text-red-500 hover:bg-red-50 rounded-md text-left mt-1">
                                    <LogOut size={14} /> লগআউট
                                </button>
                            </>
                        ) : (
                            <div className="flex gap-2 pt-2">
                                <Link to="/login" onClick={() => setMenuOpen(false)}
                                    className="flex-1 text-center text-sm text-primary border border-primary py-2 rounded-lg">লগইন</Link>
                                <Link to="/register" onClick={() => setMenuOpen(false)}
                                    className="flex-1 text-center text-sm bg-primary text-white py-2 rounded-lg">রেজিস্ট্রেশন</Link>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Dropdown animation */}
            <style>{`
                @keyframes dropdownFade {
                    from { opacity: 0; transform: translateY(-6px); }
                    to   { opacity: 1; transform: translateY(0); }
                }
                .line-clamp-2 {
                    display: -webkit-box;
                    -webkit-line-clamp: 2;
                    -webkit-box-orient: vertical;
                    overflow: hidden;
                }
            `}</style>
        </nav>
    );
};

export default Navbar;