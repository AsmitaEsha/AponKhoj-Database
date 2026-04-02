import { useState, useRef, useEffect } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import {
    Menu, X, Search, ChevronDown, User, Settings, FileText,
    LogOut, Bell, LayoutDashboard, Shield
} from 'lucide-react';
import { useAuth } from '../helpers/AuthContext';

/* Avatar initials helper */
const NavAvatar = ({ user }) => {
    if (user?.avatarUrl) {
        return <img src={user.avatarUrl} alt={user.firstName}
            className="w-8 h-8 rounded-full object-cover border-2 border-primary/20" />;
    }
    
    // ✅ FIX: Use firstName and lastName instead of name
    const getInitials = () => {
        if (user?.firstName || user?.lastName) {
            const first = user.firstName ? user.firstName[0].toUpperCase() : '';
            const last = user.lastName ? user.lastName[0].toUpperCase() : '';
            return (first + last) || '?';
        }
        return '?';
    };
    
    const initials = getInitials();
    
    return (
        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center
                        text-primary font-black text-xs border-2 border-primary/20">
            {initials}
        </div>
    );
};

const Navbar = () => {
    const { user, isAuthenticated, isAdmin, logout } = useAuth();
    const navigate = useNavigate();
    const [menuOpen, setMenuOpen] = useState(false);
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const dropdownRef = useRef(null);

    const navLinks = [
        { to: '/search', label: 'নিখোঁজ তালিকা' },
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
        { to: '/profile?tab=reports', label: 'আমার রিপোর্ট', icon: FileText },
        { to: '/profile?tab=notifications', label: 'বিজ্ঞপ্তি', icon: Bell },
        { to: '/profile?tab=security', label: 'নিরাপত্তা', icon: Shield },
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

                    {/* ── Right Side: Auth or Profile ── */}
                    <div className="hidden md:flex items-center gap-2">
                        {isAuthenticated ? (
                            /* ── Profile Dropdown ── */
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
                    <button className="md:hidden p-2 text-gray-500" onClick={() => setMenuOpen(!menuOpen)}>
                        {menuOpen ? <X size={20} /> : <Menu size={20} />}
                    </button>
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

            {/* Dropdown animation style */}
            <style>{`
                @keyframes dropdownFade {
                    from { opacity: 0; transform: translateY(-6px); }
                    to   { opacity: 1; transform: translateY(0); }
                }
            `}</style>
        </nav>
    );
};

export default Navbar;