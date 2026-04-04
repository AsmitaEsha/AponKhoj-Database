import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
    User, Mail, Phone, Lock, Eye, EyeOff, CheckCircle, AlertTriangle,
    Shield, Settings, FileText, Key, Save, Loader2,
    ToggleLeft, ToggleRight, Clock, HelpCircle, ChevronRight
} from 'lucide-react';
import { useAuth } from '../helpers/AuthContext';
import { AdminSidebar } from '../Components/AdminSidebar';
import AdminNavbar from '../Components/AdminNavbar';


/* ─── Reusable field ─── */
const Field = ({ label, icon: Icon, children, hint }) => (
    <div>
        <label className="block text-sm font-semibold text-gray-700 mb-1.5">{label}</label>
        <div className="relative">
            {Icon && <Icon size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />}
            {children}
        </div>
        {hint && <p className="mt-1 text-xs text-gray-400">{hint}</p>}
    </div>
);

const inputCls = (disabled = false) =>
    `w-full pl-10 pr-4 py-2.5 border ${disabled ? 'border-gray-100 bg-gray-50 text-gray-400 cursor-not-allowed' : 'border-gray-200 bg-white'}
     rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-red-300 focus:border-red-400 transition-all`;

/* ─── Tab: Admin Info ─── */
function AdminInfoTab({ user, updateUser }) {
    const [form, setForm] = useState({
        name: user?.name || '',
        phone: user?.phone || '',
        designation: user?.designation || 'সিনিয়র অ্যাডমিন',
        department: user?.department || 'ব্যবস্থাপনা বিভাগ',
    });
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);

    const [error, setError] = useState('');

    const handleChange = e => {
        setError('');
        setForm(p => ({ ...p, [e.target.name]: e.target.value }));
    };

    const handleSave = async (e) => {
        e.preventDefault();
        setError('');

        // Strict Validation
        if (!form.name.trim() || !form.phone.trim() || !form.designation.trim() || !form.department.trim()) {
            setError('অনুগ্রহ করে সকল তথ্য ফিল্ড পূরণ করুন। কোনো ঘর খালি রাখা যাবে না।');
            return;
        }

        setSaving(true);
        await new Promise(r => setTimeout(r, 800));
        updateUser({ ...form });
        setSaving(false); setSaved(true);
        setTimeout(() => setSaved(false), 3000);
    };

    return (
        <div>
            <h2 className="text-xl font-black text-gray-800 mb-1">অ্যাডমিন তথ্য</h2>
            <p className="text-sm text-gray-400 mb-7">আপনার প্রশাসনিক প্রোফাইল আপডেট করুন</p>

            {/* Admin badge */}
            <div className="flex items-center gap-4 bg-red-50 border border-red-100 rounded-2xl p-4 mb-7">
                <div className="w-14 h-14 rounded-2xl bg-red-500/15 border border-red-200
                                flex items-center justify-center text-red-600 font-black text-xl">
                    {user?.name ? user.name[0].toUpperCase() : 'A'}
                </div>
                <div>
                    <p className="font-black text-gray-800">{user?.name || 'অ্যাডমিন'}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{user?.email}</p>
                    <span className="inline-flex items-center gap-1 text-[10px] font-black text-red-600
                                     bg-red-100 border border-red-200 px-2 py-0.5 rounded-full mt-1.5 uppercase tracking-wide">
                        <Shield size={9} /> Admin
                    </span>
                </div>
            </div>

            <form onSubmit={handleSave} className="space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <Field label="পূর্ণ নাম" icon={User}>
                        <input className={inputCls()} name="name" value={form.name}
                            onChange={handleChange} placeholder="আপনার পূর্ণ নাম" />
                    </Field>
                    <Field label="ইমেইল (পরিবর্তনযোগ্য নয়)" icon={Mail}>
                        <input className={inputCls(true)} value={user?.email || ''} readOnly />
                    </Field>
                    <Field label="ফোন নম্বর" icon={Phone}>
                        <input className={inputCls()} name="phone" value={form.phone}
                            onChange={handleChange} placeholder="01XXXXXXXXX" type="tel" />
                    </Field>
                    <Field label="পদবি" icon={User}>
                        <input className={inputCls()} name="designation" value={form.designation}
                            onChange={handleChange} placeholder="যেমন: সিনিয়র অ্যাডমিন" />
                    </Field>
                    <Field label="বিভাগ" icon={Settings} hint="আপনার কাজের বিভাগ লিখুন">
                        <input className={inputCls()} name="department" value={form.department}
                            onChange={handleChange} placeholder="যেমন: ব্যবস্থাপনা বিভাগ" />
                    </Field>
                </div>

                {error && (
                    <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-600 text-[11px] font-black px-4 py-3 rounded-xl mb-4 uppercase tracking-wider animate-pulse">
                        <AlertTriangle size={14} /> {error}
                    </div>
                )}

                <button type="submit" disabled={saving}
                    className="flex items-center justify-center gap-2 bg-red-500 hover:bg-red-600
                               text-white py-3 px-6 rounded-xl font-bold text-sm transition-all shadow-sm disabled:opacity-60">
                    {saving ? <><Loader2 size={15} className="animate-spin" /> সংরক্ষণ হচ্ছে...</>
                        : saved ? <><CheckCircle size={15} /> সংরক্ষিত হয়েছে!</>
                            : <><Save size={15} /> পরিবর্তন সংরক্ষণ করুন</>}
                </button>
            </form>
        </div>
    );
}

/* ─── Tab: Security ─── */
function SecurityTab() {
    const [form, setForm] = useState({ current: '', newPass: '', confirm: '' });
    const [show, setShow] = useState({ current: false, newPass: false, confirm: false });
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);
    const [error, setError] = useState('');

    const toggle = k => setShow(p => ({ ...p, [k]: !p[k] }));
    const handleChange = e => setForm(p => ({ ...p, [e.target.name]: e.target.value }));
    const EyeBtn = ({ k }) => (
        <button type="button" onClick={() => toggle(k)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
            {show[k] ? <EyeOff size={14} /> : <Eye size={14} />}
        </button>
    );

    const handleSave = async (e) => {
        e.preventDefault();
        setError('');

        // Strict Validation
        if (!form.current.trim() || !form.newPass.trim() || !form.confirm.trim()) {
            setError('অনুগ্রহ করে সকল পাসওয়ার্ড ফিল্ড পূরণ করুন।');
            return;
        }

        if (form.newPass !== form.confirm) {
            setError('নতুন পাসওয়ার্ড এবং নিশ্চিত পাসওয়ার্ড মিলছে না।');
            return;
        }

        if (form.newPass.length < 8) {
            setError('পাসওয়ার্ড কমপক্ষে ৮ অক্ষর হতে হবে।');
            return;
        }

        setSaving(true);
        await new Promise(r => setTimeout(r, 900));
        setSaving(false); setSaved(true);
        setForm({ current: '', newPass: '', confirm: '' });
        setTimeout(() => setSaved(false), 3000);
    };

    return (
        <div>
            <h2 className="text-xl font-black text-gray-800 mb-1">নিরাপত্তা</h2>
            <p className="text-sm text-gray-400 mb-7">পাসওয়ার্ড ও সেশন ব্যবস্থাপনা</p>

            {error && (
                <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-xl mb-5">
                    <AlertTriangle size={14} /> {error}
                </div>
            )}

            <form onSubmit={handleSave} className="space-y-5 mb-8">
                <h3 className="font-bold text-gray-800 text-sm flex items-center gap-2"><Key size={14} className="text-red-500" /> পাসওয়ার্ড পরিবর্তন</h3>
                {[
                    { k: 'current', label: 'বর্তমান পাসওয়ার্ড' },
                    { k: 'newPass', label: 'নতুন পাসওয়ার্ড' },
                    { k: 'confirm', label: 'নতুন পাসওয়ার্ড নিশ্চিত' },
                ].map(({ k, label }) => (
                    <Field key={k} label={label} icon={Lock}>
                        <input className={inputCls()} name={k} type={show[k] ? 'text' : 'password'}
                            value={form[k]} onChange={handleChange} placeholder="••••••••" />
                        <EyeBtn k={k} />
                    </Field>
                ))}
                <button type="submit" disabled={saving}
                    className="flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white py-2.5 px-5 rounded-xl font-bold text-sm transition-all disabled:opacity-60">
                    {saving ? <><Loader2 size={14} className="animate-spin" /> আপডেট হচ্ছে...</>
                        : saved ? <><CheckCircle size={14} /> আপডেট হয়েছে!</>
                            : <><Key size={14} /> পাসওয়ার্ড পরিবর্তন করুন</>}
                </button>
            </form>

        </div>
    );
}



/* ─── MAIN PAGE ─── */
const TABS = [
    { id: 'info', label: 'অ্যাডমিন তথ্য', icon: User, Component: AdminInfoTab },
    { id: 'security', label: 'নিরাপত্তা', icon: Shield, Component: SecurityTab },
];

export default function AdminProfilePage() {
    const { user, updateUser } = useAuth();
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);

    const rawTab = searchParams.get('tab');
    const activeTab = TABS.find(t => t.id === rawTab) ? rawTab : 'info';
    const setActiveTab = id => setSearchParams({ tab: id }, { replace: true });

    const { Component } = TABS.find(t => t.id === activeTab) || TABS[0];

    return (
        <div className="flex h-screen bg-gray-50 overflow-hidden font-inter">
            {/* Sidebar Desktop */}
            <div className="hidden lg:flex">
                <AdminSidebar active="settings" onNav={id => navigate(`/admin/dashboard?tab=${id}`)}
                    collapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed(p => !p)} />
            </div>

            {/* Sidebar Mobile */}
            {mobileOpen && (
                <div className="lg:hidden fixed inset-0 z-50 flex">
                    <div className="flex-shrink-0">
                        <AdminSidebar active="settings"
                            onNav={id => { navigate(`/admin/dashboard?tab=${id}`); setMobileOpen(false); }}
                            collapsed={false} onToggle={() => setMobileOpen(false)} />
                    </div>
                    <div className="flex-1 bg-black/50" onClick={() => setMobileOpen(false)} />
                </div>
            )}

            {/* Main */}
            <div className="flex-1 flex flex-col overflow-hidden">
                <AdminNavbar breadcrumb="প্রোফাইল সেটিংস" onMobileMenu={() => setMobileOpen(true)} />

                <main className="flex-1 overflow-y-auto p-4 lg:p-6">
                    <div className="max-w-5xl mx-auto">
                        <div className="flex flex-col lg:flex-row gap-5">
                            {/* Profile sidebar */}
                            <aside className="lg:w-56 flex-shrink-0">
                                {/* Admin card */}
                                <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-4 mb-4 text-center">
                                    <div className="w-16 h-16 rounded-2xl bg-red-500/10 border border-red-200
                                                    flex items-center justify-center text-red-600 font-black text-2xl mx-auto mb-3">
                                        {user?.name ? user.name[0].toUpperCase() : 'A'}
                                    </div>
                                    <p className="font-black text-gray-800 text-sm">{user?.name || 'Admin'}</p>
                                    <p className="text-[10px] text-gray-400 mt-0.5 break-all">{user?.email}</p>
                                    <span className="inline-flex items-center gap-1 text-[9px] font-black text-red-600
                                                     bg-red-50 border border-red-200 px-2 py-0.5 rounded-full mt-2 uppercase">
                                        <Shield size={8} /> Admin
                                    </span>
                                </div>

                                {/* Tab nav */}
                                <nav className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
                                    {TABS.map(tab => (
                                        <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                                            className={`flex items-center gap-3 w-full px-4 py-3.5 text-left text-sm
                                                        transition-all border-b border-gray-50 last:border-0
                                                        ${activeTab === tab.id
                                                    ? 'bg-red-50 text-red-600 font-bold border-l-2 border-l-red-500'
                                                    : 'text-gray-600 hover:bg-gray-50 font-medium'}`}>
                                            <tab.icon size={14} className="flex-shrink-0" />
                                            {tab.label}
                                            {activeTab === tab.id && <ChevronRight size={12} className="ml-auto" />}
                                        </button>
                                    ))}
                                </nav>

                                {/* Mobile tab scroll */}
                                <div className="lg:hidden flex gap-2 overflow-x-auto pb-1 mt-4">
                                    {TABS.map(tab => (
                                        <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                                            className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-xl whitespace-nowrap
                                                        ${activeTab === tab.id ? 'bg-red-500 text-white' : 'bg-white border border-gray-200 text-gray-600'}`}>
                                            <tab.icon size={12} /> {tab.label}
                                        </button>
                                    ))}
                                </div>
                            </aside>

                            {/* Content */}
                            <main className="flex-1 bg-white border border-gray-100 rounded-2xl shadow-sm p-6">
                                <Component user={user} updateUser={updateUser} />
                            </main>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
}
