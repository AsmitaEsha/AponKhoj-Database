import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
    User, Mail, Phone, Lock, Eye, EyeOff, CheckCircle, AlertTriangle,
    Shield, Settings, FileText, Key, Save, Loader2,
    ToggleLeft, ToggleRight, Clock, HelpCircle, ChevronRight
} from 'lucide-react';
import { useAuth } from '../helpers/AuthContext';
import { AdminSidebar } from './AdminDashboardPage';
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

    const handleChange = e => setForm(p => ({ ...p, [e.target.name]: e.target.value }));

    const handleSave = async (e) => {
        e.preventDefault();
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
        e.preventDefault(); setError('');
        if (form.newPass !== form.confirm) { setError('নতুন পাসওয়ার্ড মিলছে না'); return; }
        if (form.newPass.length < 8) { setError('পাসওয়ার্ড কমপক্ষে ৮ অক্ষর হতে হবে'); return; }
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

            {/* Active sessions */}
            <div className="bg-gray-50 border border-gray-100 rounded-2xl p-5">
                <h3 className="font-bold text-gray-800 text-sm mb-4 flex items-center gap-2">
                    <Shield size={14} className="text-red-500" /> সক্রিয় সেশন
                </h3>
                {[{ device: 'Chrome — Windows 11 (এই ডিভাইস)', time: 'এখন সক্রিয়', current: true },
                { device: 'Firefox — Android', time: '২ দিন আগে', current: false }].map((s, i) => (
                    <div key={i} className="flex items-center justify-between p-3 bg-white rounded-xl border border-gray-100 mb-2 last:mb-0">
                        <div>
                            <p className="text-xs font-semibold text-gray-700">{s.device}</p>
                            <p className="text-[10px] text-gray-400 mt-0.5">{s.time}</p>
                        </div>
                        {s.current
                            ? <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">বর্তমান</span>
                            : <button className="text-[10px] text-red-500 font-semibold hover:underline">লগআউট</button>}
                    </div>
                ))}
            </div>

            {/* 2FA */}
            <div className="mt-4 bg-white border border-gray-100 rounded-2xl p-5 flex items-center justify-between">
                <div>
                    <h3 className="font-bold text-gray-800 text-sm">দুই-ধাপ যাচাইকরণ (2FA)</h3>
                    <p className="text-xs text-gray-400 mt-0.5">OTP-ভিত্তিক অতিরিক্ত নিরাপত্তা</p>
                </div>
                <span className="text-[10px] font-bold text-amber-600 bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-full">শীঘ্রই</span>
            </div>
        </div>
    );
}

/* ─── Tab: Permissions ─── */
function PermissionsTab() {
    const permissions = [
        { label: 'রিপোর্ট যাচাই করুন', granted: true },
        { label: 'রিপোর্ট মুছে ফেলুন', granted: true },
        { label: 'ব্যবহারকারী পরিচালনা করুন', granted: true },
        { label: 'অ্যাডমিন নিয়োগ করুন', granted: false },
        { label: 'সিস্টেম সেটিংস পরিবর্তন করুন', granted: true },
        { label: 'ব্যাকআপ ও এক্সপোর্ট', granted: true },
        { label: 'AI ম্যাচিং নিয়ন্ত্রণ', granted: true },
        { label: 'সুপার অ্যাডমিন অ্যাক্সেস', granted: false },
    ];

    return (
        <div>
            <h2 className="text-xl font-black text-gray-800 mb-1">অনুমতি</h2>
            <p className="text-sm text-gray-400 mb-7">আপনার অ্যাডমিন অনুমতির তালিকা (শুধুমাত্র পড়ার জন্য)</p>

            <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm">
                {permissions.map((p, i) => (
                    <div key={i} className="flex items-center justify-between px-5 py-3.5 border-b border-gray-50 last:border-0">
                        <p className="text-sm font-semibold text-gray-700">{p.label}</p>
                        {p.granted
                            ? <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-600 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-full">
                                <CheckCircle size={10} /> অনুমোদিত
                            </span>
                            : <span className="text-[10px] font-bold text-gray-400 bg-gray-50 border border-gray-200 px-2.5 py-1 rounded-full">
                                অনুমোদিত নয়
                            </span>}
                    </div>
                ))}
            </div>

            <div className="mt-4 bg-blue-50 border border-blue-100 rounded-xl p-4 text-xs text-blue-600">
                <HelpCircle size={13} className="inline mr-1.5" />
                অনুমতি পরিবর্তন করতে সুপার অ্যাডমিনের সাথে যোগাযোগ করুন।
            </div>
        </div>
    );
}

/* ─── Tab: Activity Log ─── */
function ActivityLogTab() {
    // TODO: replace with real API call, e.g.:
    // useEffect(() => { apiClient.get('/admin/activity-log').then(r => setLogs(r.data)); }, []);
    const [logs, setLogs] = useState([]);

    const typeColor = {
        verify: 'bg-emerald-500',
        close: 'bg-amber-500',
        warn: 'bg-red-500',
        settings: 'bg-blue-500',
        ai: 'bg-purple-500',
        delete: 'bg-gray-400',
    };

    return (
        <div>
            <h2 className="text-xl font-black text-gray-800 mb-1">কার্যক্রম লগ</h2>
            <p className="text-sm text-gray-400 mb-7">আপনার সাম্প্রতিক অ্যাডমিন কার্যক্রম</p>

            <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
                {logs.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-16 text-gray-300">
                        <FileText size={32} className="mb-2" />
                        <p className="text-sm font-semibold">কোনো কার্যক্রম লগ নেই</p>
                    </div>
                ) : (
                    logs.map((log, i) => (
                        <div key={i} className="flex items-center gap-4 px-5 py-3.5 border-b border-gray-50 last:border-0 hover:bg-gray-50/50 transition-colors">
                            <div className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${typeColor[log.type] ?? 'bg-gray-300'}`} />
                            <div className="flex-1">
                                <p className="text-sm text-gray-700 font-medium">{log.action}</p>
                            </div>
                            <div className="flex items-center gap-1 text-[10px] text-gray-400 flex-shrink-0">
                                <Clock size={10} /> {log.time}
                            </div>
                            <ChevronRight size={12} className="text-gray-300" />
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}

/* ─── Tab: System Settings ─── */
function SystemSettingsTab() {
    const [settings, setSettings] = useState({
        maintenanceMode: false,
        registrationOpen: true,
        aiMatching: true,
        publicSearch: true,
        emailNotifications: true,
        autoVerify: false,
    });
    const [saved, setSaved] = useState(false);

    const toggle = key => setSettings(p => ({ ...p, [key]: !p[key] }));

    const items = [
        { key: 'maintenanceMode', label: 'মেইনটেন্যান্স মোড', desc: 'চালু করলে সাধারণ ব্যবহারকারীরা সাইট এক্সেস করতে পারবেন না', danger: true },
        { key: 'registrationOpen', label: 'নিবন্ধন চালু', desc: 'নতুন ব্যবহারকারী নিবন্ধন করতে পারবেন কিনা' },
        { key: 'aiMatching', label: 'AI ম্যাচিং সক্রিয়', desc: 'ফেস রিকগনিশন ভিত্তিক স্বয়ংক্রিয় ম্যাচিং' },
        { key: 'publicSearch', label: 'পাবলিক সার্চ', desc: 'লগইন ছাড়াই রিপোর্ট খুঁজে দেখা যাবে' },
        { key: 'emailNotifications', label: 'ইমেইল বিজ্ঞপ্তি', desc: 'সিস্টেম ইভেন্টের জন্য ইমেইল পাঠানো' },
        { key: 'autoVerify', label: 'স্বয়ংক্রিয় যাচাইকরণ', desc: 'নতুন রিপোর্ট স্বয়ংক্রিয়ভাবে যাচাইকৃত হবে', danger: true },
    ];

    return (
        <div>
            <h2 className="text-xl font-black text-gray-800 mb-1">সিস্টেম সেটিংস</h2>
            <p className="text-sm text-gray-400 mb-7">প্ল্যাটফর্মের বৈশ্বিক পরিচালনা নিয়ন্ত্রণ করুন</p>

            <div className="space-y-3">
                {items.map(item => (
                    <div key={item.key}
                        className={`flex items-center justify-between p-5 bg-white rounded-2xl border shadow-sm
                                    ${item.danger ? 'border-red-100' : 'border-gray-100'}`}>
                        <div className="flex-1 pr-4">
                            <p className={`text-sm font-bold ${item.danger ? 'text-red-700' : 'text-gray-800'}`}>{item.label}</p>
                            <p className="text-xs text-gray-400 mt-0.5">{item.desc}</p>
                        </div>
                        <button onClick={() => toggle(item.key)} type="button"
                            className={`relative w-12 h-6 rounded-full transition-all duration-300 flex-shrink-0
                                        ${settings[item.key]
                                    ? (item.danger ? 'bg-red-500' : 'bg-red-500')
                                    : 'bg-gray-200'}`}>
                            <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow
                                              transition-transform duration-300 ${settings[item.key] ? 'translate-x-6' : ''}`} />
                        </button>
                    </div>
                ))}
            </div>

            <button onClick={() => { setSaved(true); setTimeout(() => setSaved(false), 3000); }}
                className="mt-6 flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white
                           py-3 px-6 rounded-xl font-bold text-sm transition-all shadow-sm">
                {saved ? <><CheckCircle size={15} /> সংরক্ষিত হয়েছে!</> : <><Save size={15} /> সেটিংস সংরক্ষণ করুন</>}
            </button>
        </div>
    );
}

/* ─── MAIN PAGE ─── */
const TABS = [
    { id: 'info', label: 'অ্যাডমিন তথ্য', icon: User, Component: AdminInfoTab },
    { id: 'security', label: 'নিরাপত্তা', icon: Shield, Component: SecurityTab },
    { id: 'perms', label: 'অনুমতি', icon: Key, Component: PermissionsTab },
    { id: 'logs', label: 'কার্যক্রম লগ', icon: FileText, Component: ActivityLogTab },
    { id: 'system', label: 'সিস্টেম সেটিংস', icon: Settings, Component: SystemSettingsTab },
];

export default function AdminProfilePage() {
    const { user, updateUser } = useAuth();
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

    const rawTab = searchParams.get('tab');
    const activeTab = TABS.find(t => t.id === rawTab) ? rawTab : 'info';
    const setActiveTab = id => setSearchParams({ tab: id }, { replace: true });

    const { Component } = TABS.find(t => t.id === activeTab) || TABS[0];

    return (
        <div className="flex h-screen bg-gray-50 overflow-hidden">
            {/* Sidebar */}
            <div className="hidden lg:flex">
                <AdminSidebar active="settings" onNav={id => navigate(`/admin/dashboard#${id}`)}
                    collapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed(p => !p)} />
            </div>

            {/* Main */}
            <div className="flex-1 flex flex-col overflow-hidden">
                <AdminNavbar breadcrumb="প্রোফাইল সেটিংস" onMobileMenu={() => { }} />

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
