import { useState, useRef } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import {
    User, Mail, Phone, MapPin, Lock, Eye, EyeOff,
    Bell, Shield, LogOut, Camera, CheckCircle, AlertTriangle,
    ChevronRight, Settings, Save, ArrowLeft, Loader2, Edit3,
    FileText, Key, Trash2, HelpCircle
} from 'lucide-react';
import { useAuth } from '../helpers/AuthContext';

/* ─────── reusable input ─────── */
const Field = ({ label, icon: Icon, error, children }) => (
    <div>
        <label className="block text-sm font-semibold text-gray-700 mb-1.5">{label}</label>
        <div className="relative">
            {Icon && <Icon size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />}
            {children}
        </div>
        {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
);

const inputCls = (hasIcon = true, hasError = false) =>
    `w-full ${hasIcon ? 'pl-10' : 'pl-3'} pr-4 py-2.5 border ${hasError ? 'border-red-400' : 'border-gray-200'} 
     rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all bg-white`;

/* ─────── avatar initials ─────── */
const Avatar = ({ user, size = 'lg' }) => {
    const sz = size === 'lg' ? 'w-20 h-20 text-2xl' : 'w-12 h-12 text-base';
    if (user?.avatarUrl) {
        return <img src={user.avatarUrl} alt={user.firstName}
            className={`${sz} rounded-full object-cover border-4 border-white shadow-md`} />;
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
        <div className={`${sz} rounded-full bg-primary/10 border-4 border-white shadow-md
                         flex items-center justify-center font-black text-primary`}>
            {initials}
        </div>
    );
};

/* ═══════════════════════════════════════════
   TAB: Personal Info
════��══════════════════════════════════════ */
function PersonalInfoTab({ user, updateUser }) {
    const [form, setForm] = useState({
        firstName: user?.firstName || '',
        lastName: user?.lastName || '',
        phone: user?.phone || '',
        location: user?.location || '',
    });
    const [errors, setErrors] = useState({});
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);
    const [avatar, setAvatar] = useState(user?.avatarUrl || null);
    const fileRef = useRef();

    const handleChange = e => setForm(p => ({ ...p, [e.target.name]: e.target.value }));

    const handleAvatarChange = e => {
        const file = e.target.files[0];
        if (!file) return;
        const url = URL.createObjectURL(file);
        setAvatar(url);
    };

    const handleSave = async (e) => {
        e.preventDefault();
        const newErrors = {};
        if (!form.firstName.trim()) newErrors.firstName = 'প্রথম নাম আবশ্যক';
        if (!form.lastName.trim()) newErrors.lastName = 'শেষ নাম আবশ্যক';
        if (!form.phone.trim()) newErrors.phone = 'ফোন নম্বর আবশ্যক';
        if (!form.location) newErrors.location = 'জেলা নির্বাচন করুন';

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        setErrors({});
        setSaving(true);
        // Simulate API call
        await new Promise(r => setTimeout(r, 1200)); 
        updateUser({ ...form, avatarUrl: avatar });
        setSaving(false);
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
    };

    return (
        <div>
            <h2 className="text-xl font-black text-gray-800 mb-1">ব্যক্তিগত তথ্য</h2>
            <p className="text-sm text-gray-400 mb-7">আপনার নাম, ফোন নম্বর এবং এলাকা আপডেট করুন</p>

            {/* Avatar */}
            <div className="flex items-center gap-5 mb-8 p-5 bg-gray-50 rounded-2xl border border-gray-100">
                <div className="relative">
                    <Avatar user={{ ...user, avatarUrl: avatar }} size="lg" />
                    <button
                        type="button"
                        onClick={() => fileRef.current.click()}
                        className="absolute -bottom-1 -right-1 w-7 h-7 bg-primary rounded-full
                                   flex items-center justify-center shadow-md border-2 border-white
                                   hover:bg-primary-dark transition-colors"
                    >
                        <Camera size={12} className="text-white" />
                    </button>
                    <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
                </div>
                <div>
                    <p className="font-bold text-gray-800">{user?.firstName && user?.lastName ? `${user.firstName} ${user.lastName}` : user?.firstName || '—'}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{user?.email || '—'}</p>
                    <p className="text-xs text-primary mt-1 cursor-pointer hover:underline"
                        onClick={() => fileRef.current.click()}>ছবি পরিবর্তন করুন</p>
                </div>
            </div>

            <form onSubmit={handleSave} className="space-y-5">
                <Field label="প্রথম নাম" icon={User} error={errors.firstName}>
                    <input className={inputCls(true, !!errors.firstName)} name="firstName" value={form.firstName}
                        onChange={handleChange} placeholder="আপনার প্রথম নাম" />
                </Field>

                <Field label="শেষ নাম" icon={User} error={errors.lastName}>
                    <input className={inputCls(true, !!errors.lastName)} name="lastName" value={form.lastName}
                        onChange={handleChange} placeholder="আপনার শেষ নাম" />
                </Field>

                <Field label="ইমেইল (পরিবর্তনযোগ্য নয়)" icon={Mail}>
                    <input className={`${inputCls()} bg-gray-50 cursor-not-allowed text-gray-400`}
                        value={user?.email || ''} readOnly />
                </Field>

                <Field label="ফোন নম্বর" icon={Phone} error={errors.phone}>
                    <input className={inputCls(true, !!errors.phone)} name="phone" value={form.phone}
                        onChange={handleChange} placeholder="01XXXXXXXXX" type="tel" />
                </Field>

                <Field label="জেলা / অবস্থান" icon={MapPin} error={errors.location}>
                    <select className={inputCls(true, !!errors.location)} name="location" value={form.location} onChange={handleChange}>
                        <option value="">জেলা নির্বাচন করুন</option>
                        {['ঢাকা', 'চট্টগ্রাম', 'রাজশাহী', 'খুলনা', 'বরিশাল', 'সিলেট', 'রংপুর', 'ময়মনসিংহ'].map(d =>
                            <option key={d} value={d}>{d}</option>
                        )}
                    </select>
                </Field>

                <button type="submit" disabled={saving}
                    className="flex items-center justify-center gap-2 w-full bg-primary hover:bg-primary-dark
                               text-white py-3 rounded-xl font-bold text-sm transition-all shadow-sm disabled:opacity-60">
                    {saving ? <><Loader2 size={16} className="animate-spin" /> সংরক্ষণ হচ্ছে...</>
                        : saved ? <><CheckCircle size={16} /> সংরক্ষিত হয়েছে!</>
                            : <><Save size={16} /> পরিবর্তন সংরক্ষণ করুন</>}
                </button>
            </form>
        </div>
    );
}

/* ═══════════════════════════════════════════
   TAB: Change Password
═══════════════════════════════════════════ */
function PasswordTab() {
    const [form, setForm] = useState({ current: '', newPass: '', confirm: '' });
    const [show, setShow] = useState({ current: false, newPass: false, confirm: false });
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);
    const [error, setError] = useState('');

    const toggle = key => setShow(p => ({ ...p, [key]: !p[key] }));
    const handleChange = e => setForm(p => ({ ...p, [e.target.name]: e.target.value }));

    const handleSave = async (e) => {
        e.preventDefault();
        setError('');
        if (form.newPass !== form.confirm) { setError('নতুন পাসওয়ার্ড দুটি মিলছে না'); return; }
        if (form.newPass.length < 8) { setError('পাসওয়ার্ড কমপক্ষে ৮ অক্ষরের হতে হবে'); return; }
        setSaving(true);
        await new Promise(r => setTimeout(r, 900)); // replace with real API
        setSaving(false);
        setSaved(true);
        setForm({ current: '', newPass: '', confirm: '' });
        setTimeout(() => setSaved(false), 3000);
    };

    const EyeBtn = ({ k }) => (
        <button type="button" onClick={() => toggle(k)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
            {show[k] ? <EyeOff size={15} /> : <Eye size={15} />}
        </button>
    );

    return (
        <div>
            <h2 className="text-xl font-black text-gray-800 mb-1">পাসওয়ার্ড পরিবর্তন</h2>
            <p className="text-sm text-gray-400 mb-7">নিরাপদ থাকতে নিয়মিত পাসওয়ার্ড পরিবর্তন করুন</p>

            {error && (
                <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-600
                                text-sm px-4 py-3 rounded-xl mb-5">
                    <AlertTriangle size={15} /> {error}
                </div>
            )}

            <form onSubmit={handleSave} className="space-y-5">
                <Field label="বর্তমান পাসওয়ার্ড" icon={Lock}>
                    <input className={inputCls()} name="current" type={show.current ? 'text' : 'password'}
                        value={form.current} onChange={handleChange} placeholder="••••••••" />
                    <EyeBtn k="current" />
                </Field>
                <Field label="নতুন পাসওয়ার্ড" icon={Lock}>
                    <input className={inputCls()} name="newPass" type={show.newPass ? 'text' : 'password'}
                        value={form.newPass} onChange={handleChange} placeholder="••••••••" />
                    <EyeBtn k="newPass" />
                </Field>
                <Field label="নতুন পাসওয়ার্ড নিশ্চিত করুন" icon={Lock}>
                    <input className={inputCls()} name="confirm" type={show.confirm ? 'text' : 'password'}
                        value={form.confirm} onChange={handleChange} placeholder="••••••••" />
                    <EyeBtn k="confirm" />
                </Field>

                {/* Password strength hint */}
                <div className="bg-blue-50 border border-blue-100 rounded-xl px-4 py-3 text-xs text-blue-600 space-y-1">
                    <p className="font-semibold mb-1.5">শক্তিশালী পাসওয়ার্ডের জন্য:</p>
                    <p>✓ কমপক্ষে ৮টি অক্ষর ব্যবহার করুন</p>
                    <p>✓ বড় হাতের ও ছোট হাতের অক্ষর মিশিয়ে ব্যবহার করুন</p>
                    <p>✓ সংখ্যা ও বিশেষ চিহ্ন (!@#$) যোগ করুন</p>
                </div>

                <button type="submit" disabled={saving}
                    className="flex items-center justify-center gap-2 w-full bg-primary hover:bg-primary-dark
                               text-white py-3 rounded-xl font-bold text-sm transition-all shadow-sm disabled:opacity-60">
                    {saving ? <><Loader2 size={16} className="animate-spin" /> আপডেট হচ্ছে...</>
                        : saved ? <><CheckCircle size={16} /> পাসওয়ার্ড আপডেট হয়েছে!</>
                            : <><Key size={16} /> পাসওয়ার্ড পরিবর্তন করুন</>}
                </button>
            </form>
        </div>
    );
}

/* ═══════════════════════════════════════════
   TAB: Notifications
═══════════════════════════════════════════ */

/* ═══════════════════════════════════════════
   TAB: Security
═══════════════════════════════════════════ */
function SecurityTab() {
    const { logout } = useAuth();
    const navigate = useNavigate();

    const handleDeleteAccount = () => {
        if (window.confirm('আপনি কি নিশ্চিত যে আপনি আপনার অ্যাকাউন্টটি মুছে ফেলতে চান? এই কাজটি পূর্বাবস্থায় ফেরানো সম্ভব নয়।')) {
            logout();
            navigate('/');
        }
    };

    return (
        <div>
            <h2 className="text-xl font-black text-gray-800 mb-1">নিরাপত্তা</h2>
            <p className="text-sm text-gray-400 mb-7">আপনার অ্যাকাউন্টের নিরাপত্তা পর্যালোচনা করুন</p>

            <div className="space-y-4">
                {/* Active sessions */}
                <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
                    <h3 className="font-bold text-gray-800 text-sm mb-4 flex items-center gap-2">
                        <Shield size={15} className="text-primary" /> সক্রিয় সেশন
                    </h3>
                    <div className="space-y-3">
                        {[
                            { device: 'এই ডিভাইস (Chrome — Windows)', time: 'এখন সক্রিয়', current: true },
                        ].map((s, i) => (
                            <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                                <div>
                                    <p className="text-xs font-semibold text-gray-700">{s.device}</p>
                                    <p className="text-[10px] text-gray-400 mt-0.5">{s.time}</p>
                                </div>
                                {s.current
                                    ? <span className="text-[10px] font-bold text-teal-600 bg-teal-50 px-2 py-0.5 rounded-full">বর্তমান</span>
                                    : <button className="text-[10px] text-red-500 hover:underline">লগআউট</button>}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Two-factor (UI only for now) */}
                <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="font-bold text-gray-800 text-sm">দুই-ধাপ যাচাইকরণ</h3>
                            <p className="text-xs text-gray-400 mt-0.5">অতিরিক্ত নিরাপত্তার জন্য OTP চালু করুন</p>
                        </div>
                        <span className="text-[10px] font-bold text-yellow-600 bg-yellow-50 px-2 py-0.5 rounded-full border border-yellow-200">শীঘ্রই আসছে</span>
                    </div>
                </div>

                {/* Delete account warning */}
                <div className="bg-red-50 border border-red-200 rounded-2xl p-5">
                    <h3 className="font-bold text-red-700 text-sm flex items-center gap-2 mb-1">
                        <Trash2 size={15} /> অ্যাকাউন্ট মুছে ফেলুন
                    </h3>
                    <p className="text-xs text-red-500 mb-3">এই কাজটি পূর্বাবস্থায় ফেরানো সম্ভব নয়। আপনার সমস্ত তথ্য স্থায়ীভাবে মুছে যাবে।</p>
                    <button 
                        onClick={handleDeleteAccount}
                        className="text-xs font-bold text-red-600 border border-red-300 hover:bg-red-100
                                       px-4 py-2 rounded-lg transition-colors">
                        অ্যাকাউন্ট মুছুন
                    </button>
                </div>
            </div>
        </div>
    );
}

/* ═══════════════════════════════════════════
   TAB: My Reports (quick summary)
═══════════════════════════════════════════ */
function MyReportsTab() {
    return (
        <div>
            <h2 className="text-xl font-black text-gray-800 mb-1">আমার রিপোর্ট</h2>
            <p className="text-sm text-gray-400 mb-7">আপনার জমা দেওয়া সব রিপোর্ট এখানে দেখুন</p>

            <div className="text-center py-16 bg-gray-50 rounded-2xl border border-gray-100">
                <FileText size={36} className="text-gray-200 mx-auto mb-3" />
                <p className="text-sm font-semibold text-gray-500">এখনো কোনো রিপোর্ট নেই</p>
                <p className="text-xs text-gray-400 mt-1 mb-5">নিচের বাটন থেকে প্রথম রিপোর্ট জমা দিন</p>
                <Link to="/report/missing"
                    className="inline-flex items-center gap-2 bg-primary text-white text-xs font-bold
                               px-5 py-2.5 rounded-xl hover:bg-primary-dark transition-colors shadow-sm">
                    + নিখোঁজ রিপোর্ট করুন
                </Link>
            </div>
        </div>
    );
}

/* ═══════════════════════════════════════════
   TAB: Help
═══════════════════════════════════════════ */
function HelpTab() {
    const faqs = [
        { q: 'রিপোর্ট জমা দিতে কত সময় লাগে?', a: 'রিপোর্ট জমা দিতে মাত্র ৫ মিনিট সময় লাগে। সব তথ্য দিলে দ্রুত প্রক্রিয়া সম্পন্ন হয়।' },
        { q: 'AI ম্যাচিং কীভাবে কাজ করে?', a: 'আমাদের AI ফেস রিকগনিশন সিস্টেম জমা দেওয়��� ছবি বিশ্লেষণ করে এবং ডাটাবেজে থাকা অন্যান্য রিপোর্টের সাথে মিলিয়ে দেখে।' },
        { q: 'আমার ব্যক্তিগত তথ্য কি সুরক্ষিত?', a: 'হ্যাঁ, আমরা আপনার তথ্য সম্পূর্ণ সুরক্ষিত রাখি এবং তৃতীয় পক্ষের সাথে শেয়ার করি না।' },
        { q: 'কোনো সাফল্যের গল্প আছে কি?', a: 'হ্যাঁ, আমাদের প্ল্যাটফর্মের মাধ্যমে ইতিমধ্যে বেশ কিছু পরিবার পুনর্মিলিত হয়েছে।' },
    ];
    const [open, setOpen] = useState(null);
    return (
        <div>
            <h2 className="text-xl font-black text-gray-800 mb-1">সহায়তা কেন্দ্র</h2>
            <p className="text-sm text-gray-400 mb-7">সাধারণ প্রশ্ন ও উত্তর</p>

            <div className="space-y-3 mb-8">
                {faqs.map((f, i) => (
                    <div key={i} className="border border-gray-100 rounded-2xl overflow-hidden">
                        <button onClick={() => setOpen(open === i ? null : i)}
                            className="flex items-center justify-between w-full px-5 py-4 text-left hover:bg-gray-50 transition-colors">
                            <span className="text-sm font-semibold text-gray-800 flex items-center gap-2">
                                <HelpCircle size={14} className="text-primary flex-shrink-0" /> {f.q}
                            </span>
                            <ChevronRight size={14} className={`text-gray-400 flex-shrink-0 transition-transform ${open === i ? 'rotate-90' : ''}`} />
                        </button>
                        {open === i && (
                            <div className="px-5 pb-4 text-sm text-gray-500 leading-relaxed border-t border-gray-50 pt-3">
                                {f.a}
                            </div>
                        )}
                    </div>
                ))}
            </div>

            <div className="bg-primary/5 border border-primary/20 rounded-2xl p-5 text-center">
                <p className="text-sm font-bold text-primary mb-1">আরও সাহায্য দরকার?</p>
                <p className="text-xs text-gray-500 mb-3">আমাদের সাথে সরাসরি যোগাযোগ করুন</p>
                <a href="mailto:support@aponkhoj.com.bd"
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-primary
                               bg-white border border-primary/30 px-4 py-2 rounded-xl hover:bg-primary/5 transition-colors">
                    <Mail size={12} /> support@aponkhoj.com.bd
                </a>
            </div>
        </div>
    );
}

/* ═══════════════════════════════════════════
   MAIN PAGE
═══════════════════════════════════════════ */
const TABS = [
    { id: 'profile', label: 'ব্যক্তিগত তথ্য', icon: User, Component: PersonalInfoTab },
    { id: 'password', label: 'পাসওয়ার্ড', icon: Key, Component: PasswordTab },
    { id: 'reports', label: 'আমার রিপোর্ট', icon: FileText, Component: MyReportsTab },
    { id: 'security', label: 'নিরাপত্তা', icon: Shield, Component: SecurityTab },
    { id: 'help', label: 'সহায়তা', icon: HelpCircle, Component: HelpTab },
];

export default function UserProfilePage() {
    const { user, logout, updateUser, isAuthenticated } = useAuth();
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();

    // Read ?tab= from URL, fallback to 'profile'
    const VALID_TABS = TABS.map(t => t.id);
    const rawTab = searchParams.get('tab');
    const activeTab = VALID_TABS.includes(rawTab) ? rawTab : 'profile';

    // Update both state and URL when switching tabs
    const setActiveTab = (id) => setSearchParams({ tab: id }, { replace: true });
    const [sidebarOpen, setSidebarOpen] = useState(false); // mobile sidebar toggle

    // Redirect to login if not authenticated
    if (!isAuthenticated) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-background">
                <div className="w-14 h-14 bg-primary/10 rounded-full flex items-center justify-center">
                    <User size={26} className="text-primary" />
                </div>
                <p className="text-gray-600 font-semibold">প্রোফাইল দেখতে লগইন করুন</p>
                <Link to="/login"
                    className="bg-primary text-white text-sm font-bold px-6 py-2.5 rounded-xl hover:bg-primary-dark transition-colors">
                    লগইন করুন
                </Link>
            </div>
        );
    }

    const ActiveComp = TABS.find(t => t.id === activeTab)?.Component || PersonalInfoTab;

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    return (
        <div className="min-h-screen bg-background">

            {/* ── Page Header ── */}
            <div className="bg-white border-b border-gray-100 shadow-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center gap-3">
                    <button onClick={() => navigate(-1)}
                        className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-500
                                   hover:bg-gray-100 transition-colors flex-shrink-0">
                        <ArrowLeft size={16} />
                    </button>
                    <div>
                        <h1 className="text-base font-black text-gray-800">প্রোফাইল সেটিংস</h1>
                        <p className="text-xs text-gray-400">আপনার অ্যাকাউন্ট পরিচালনা করুন</p>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
                <div className="flex gap-6">

                    {/* ── Sidebar ── */}
                    <aside className="hidden lg:flex flex-col w-64 flex-shrink-0">

                        {/* Profile card */}
                        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 mb-4">
                            <div className="flex flex-col items-center text-center">
                                <Avatar user={user} size="lg" />
                                <p className="font-black text-gray-800 mt-3 text-sm">{user?.firstName && user?.lastName ? `${user.firstName} ${user.lastName}` : user?.firstName || '—'}</p>
                                <p className="text-xs text-gray-400 mt-0.5 break-all">{user?.email || '—'}</p>
                                {user?.location && (
                                    <span className="inline-flex items-center gap-1 text-[10px] text-primary
                                                     bg-primary/5 px-2 py-0.5 rounded-full mt-2">
                                        <MapPin size={9} /> {user.location}
                                    </span>
                                )}
                                {user?.joinDate && (
                                    <p className="text-[10px] text-gray-400 mt-2">
                                        যোগদান: {user.joinDate}
                                    </p>
                                )}
                            </div>
                        </div>

                        {/* Nav links */}
                        <nav className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex-1">
                            {TABS.map(tab => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`flex items-center gap-3 w-full px-4 py-3.5 text-left text-sm
                                                transition-all border-b border-gray-50 last:border-0
                                                ${activeTab === tab.id
                                            ? 'bg-primary/5 text-primary font-bold border-l-2 border-l-primary'
                                            : 'text-gray-600 hover:bg-gray-50 font-medium'}`}
                                >
                                    <tab.icon size={15} className="flex-shrink-0" />
                                    {tab.label}
                                    {activeTab === tab.id && <ChevronRight size={13} className="ml-auto" />}
                                </button>
                            ))}

                            {/* Logout */}
                            <button
                                onClick={handleLogout}
                                className="flex items-center gap-3 w-full px-4 py-3.5 text-left text-sm
                                           text-red-500 hover:bg-red-50 font-medium transition-colors border-t border-gray-100">
                                <LogOut size={15} className="flex-shrink-0" />
                                লগআউট
                            </button>
                        </nav>
                    </aside>

                    {/* ── Mobile Sidebar Toggle ── */}
                    <div className="lg:hidden w-full mb-4">
                        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
                            {/* Current tab select on mobile */}
                            <div className="flex items-center gap-3 p-4 border-b border-gray-50">
                                <Avatar user={user} size="sm" />
                                <div className="flex-1">
                                    <p className="text-sm font-bold text-gray-800">{user?.firstName && user?.lastName ? `${user.firstName} ${user.lastName}` : user?.firstName || '—'}</p>
                                    <p className="text-xs text-gray-400">{user?.email || '—'}</p>
                                </div>
                            </div>
                            <div className="flex overflow-x-auto gap-1 p-3 scrollbar-none">
                                {TABS.map(tab => (
                                    <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                                        className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-lg
                                                    whitespace-nowrap flex-shrink-0 transition-all
                                                    ${activeTab === tab.id
                                                ? 'bg-primary text-white shadow-sm'
                                                : 'bg-gray-50 text-gray-600 hover:bg-gray-100'}`}>
                                        <tab.icon size={12} /> {tab.label}
                                    </button>
                                ))}
                                <button onClick={handleLogout}
                                    className="flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-lg
                                               whitespace-nowrap flex-shrink-0 bg-red-50 text-red-500">
                                    <LogOut size={12} /> লগআউট
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* ── Main Content ── */}
                    <main className="flex-1 min-w-0">
                        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 lg:p-8">
                            <ActiveComp user={user} updateUser={updateUser} />
                        </div>

                        {/* Quick links */}
                        <div className="grid grid-cols-2 gap-3 mt-4">
                            <Link to="/dashboard"
                                className="flex items-center gap-2 bg-white border border-gray-100 rounded-2xl
                                           p-4 text-sm font-semibold text-gray-700 hover:border-primary hover:text-primary
                                           shadow-sm transition-all">
                                <Settings size={15} /> ড্যাশবোর্ড
                            </Link>
                            <Link to="/report/missing"
                                className="flex items-center gap-2 bg-white border border-gray-100 rounded-2xl
                                           p-4 text-sm font-semibold text-gray-700 hover:border-secondary hover:text-secondary
                                           shadow-sm transition-all">
                                <FileText size={15} /> নতুন রিপোর্ট
                            </Link>
                        </div>
                    </main>

                </div>
            </div>
        </div>
    );
}