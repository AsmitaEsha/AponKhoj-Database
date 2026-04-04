import { useNavigate } from 'react-router-dom';
import {
    LayoutDashboard, Settings, LogOut,
    Flag, ChevronRight, Menu, X, AlertTriangle
} from 'lucide-react';
import { useAuth } from '../helpers/AuthContext';

export function AdminSidebar({ active, onNav, collapsed, onToggle }) {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const NAV = [
        { id: 'overview',       label: 'ওভারভিউ',          icon: LayoutDashboard, path: '/admin/dashboard' },
        { id: 'moderation',     label: 'মডারেশন',           icon: Flag,            path: '/admin/moderation' },
        { id: 'systemReports',  label: 'সিস্টেম রিপোর্ট',  icon: AlertTriangle,   path: '/admin/reports' },
        { id: 'profile',        label: 'প্রোফাইল সেটিংস',  icon: Settings,        path: '/admin/profile' },
    ];

    // Added missing icon import in the map above
    const initials = user?.firstName
        ? (user.firstName[0] + (user.lastName?.[0] || '')).toUpperCase()
        : 'A';

    return (
        <aside className={`flex flex-col bg-gray-900 text-white transition-all duration-300 flex-shrink-0
                           ${collapsed ? 'w-16' : 'w-60'} min-h-screen border-r border-gray-800`}>

            {/* Logo */}
            <div className="flex items-center justify-between px-4 py-6 border-b border-gray-800/50">
                {!collapsed && (
                    <div>
                        <p className="font-black text-lg text-white leading-tight tracking-tight">আপনখোঁজ</p>
                        <p className="text-[10px] text-red-500 font-bold tracking-widest uppercase mt-0.5">Admin Panel v2</p>
                    </div>
                )}
                <button onClick={onToggle}
                    className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-800 text-gray-400 hover:text-white transition-colors">
                    {collapsed ? <Menu size={16} /> : <X size={16} />}
                </button>
            </div>

            {/* Nav items */}
            <nav className="flex-1 py-6 px-2 space-y-1.5 overflow-y-auto custom-scrollbar">
                {NAV.map(item => (
                    <button key={item.id} onClick={() => navigate(item.path)}
                        className={`flex items-center gap-3 w-full px-3 py-3 rounded-xl text-sm font-medium transition-all group
                                    ${active === item.id
                                ? 'bg-red-500 text-white shadow-lg shadow-red-500/20'
                                : 'text-gray-400 hover:bg-gray-800 hover:text-white'}`}>
                        <item.icon size={18} className={`flex-shrink-0 ${active === item.id ? 'text-white' : 'text-gray-500 group-hover:text-white'}`} />
                        {!collapsed && <span>{item.label}</span>}
                        {!collapsed && active === item.id && <ChevronRight size={14} className="ml-auto opacity-50" />}
                    </button>
                ))}
            </nav>

            {/* Admin info + logout */}
            <div className="border-t border-gray-800 p-3">
                {!collapsed && (
                    <div className="flex items-center gap-2.5 mb-3 px-1">
                        <div className="w-8 h-8 rounded-full bg-red-500/20 border border-red-500/30
                                        flex items-center justify-center text-red-400 font-black text-xs flex-shrink-0">
                            {initials}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-xs font-bold text-white truncate">{user?.firstName ? `${user.firstName} ${user.lastName}` : (user?.name || 'Admin User')}</p>
                            <p className="text-[10px] text-gray-500 truncate">{user?.email || ''}</p>
                        </div>
                    </div>
                )}
                <button onClick={() => { logout(); navigate('/'); }}
                    className="flex items-center gap-2.5 w-full px-3 py-2 rounded-xl text-sm text-red-400 hover:bg-red-500/10 transition-colors">
                    <LogOut size={14} className="flex-shrink-0" />
                    {!collapsed && 'লগআউট'}
                </button>
            </div>
        </aside>
    );
}


