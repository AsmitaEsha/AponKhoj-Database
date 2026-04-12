import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, Mail, Phone, MapPin, Lock, Eye, EyeOff, Search, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

const DISTRICTS = ['ঢাকা', 'চট্টগ্রাম', 'রাজশাহী', 'খুলনা', 'বরিশাল', 'সিলেট', 'রংপুর', 'ময়মনসিংহ'];

const RegistrationPage = () => {
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [form, setForm] = useState({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        district: '',
        password: '',
        password_confirmation: ''
    });
    const navigate = useNavigate();

    const handleChange = e => setForm(p => ({ ...p, [e.target.name]: e.target.value }));

    const handleRegister = async (e) => {
        e.preventDefault();

        if (!form.firstName.trim() || !form.lastName.trim()) {
            toast.error('নাম সঠিকভাবে প্রবেশ করুন');
            return;
        }

        if (!form.district) {
            toast.error('জেলা নির্বাচন করুন');
            return;
        }

        if (form.password !== form.password_confirmation) {
            toast.error('পাসওয়ার্ড এবং নিশ্চিত পাসওয়ার্ড মিলছে না');
            return;
        }

        setLoading(true);

        try {
            const resp = await fetch('http://localhost:5000/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...form,
                    location: form.district,
                    district: form.district,
                }),
            });

            const data = await resp.json();

            if (!resp.ok) {
                toast.error(data.error || 'রেজিস্ট্রেশন ব্যর্থ হয়েছে');
                setLoading(false);
                return;
            }

            toast.success('রেজিস্ট্রেশন সফল! ইমেইল যাচাই করুন।');
            navigate('/verify-email', { state: { email: data.email } });
        } catch (err) {
            console.error('Register error', err);
            toast.error('সার্ভারে সমস্যা, পরে চেষ্টা করুন');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-background flex items-center justify-center py-12 px-4">
            <div className="bg-white rounded-2xl shadow-md w-full max-w-md p-8">
                <div className="text-center mb-8">
                    <div className="flex items-center justify-center gap-2 mb-4">
                        <div className="w-8 h-8 bg-primary rounded-md flex items-center justify-center shadow-sm">
                            <Search size={16} className="text-white" />
                        </div>
                        <span className="font-bold text-lg text-primary tracking-tight">আপনখোঁজ</span>
                    </div>
                    <h1 className="text-2xl font-bold text-gray-800">রেজিস্ট্রেশন করুন</h1>
                    <p className="text-gray-500 text-sm mt-1">নতুন অ্যাকাউন্ট তৈরি করুন</p>
                </div>

                <form onSubmit={handleRegister} className="space-y-4" autoComplete="off">
                    {/* First Name */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">প্রথম নাম</label>
                        <div className="relative">
                            <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                            <input
                                type="text"
                                name="firstName"
                                placeholder="আপনার প্রথম নাম"
                                value={form.firstName}
                                onChange={handleChange}
                                required
                                autoComplete="off"
                                className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                            />
                        </div>
                    </div>

                    {/* Last Name */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">শেষ নাম</label>
                        <div className="relative">
                            <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                            <input
                                type="text"
                                name="lastName"
                                placeholder="আপনার শেষ নাম"
                                value={form.lastName}
                                onChange={handleChange}
                                required
                                autoComplete="off"
                                className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                            />
                        </div>
                    </div>

                    {/* Email */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">ইমেইল</label>
                        <div className="relative">
                            <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                            <input
                                type="email"
                                name="email"
                                placeholder="example@email.com"
                                value={form.email}
                                onChange={handleChange}
                                required
                                autoComplete="off"
                                className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                            />
                        </div>
                    </div>

                    {/* Phone */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">ফোন নম্বর</label>
                        <div className="relative">
                            <Phone size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                            <input
                                type="tel"
                                name="phone"
                                placeholder="01XXXXXXXXX"
                                value={form.phone}
                                onChange={handleChange}
                                required
                                autoComplete="off"
                                className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                            />
                        </div>
                        <p className="text-xs text-gray-400 mt-1">বাংলাদেশ ফরম্যাট: 01XXXXXXXXX</p>
                    </div>

                    {/* Location */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">জেলা/অবস্থান</label>
                        <div className="relative">
                            <MapPin size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                            <select
                                name="district"
                                value={form.district}
                                onChange={handleChange}
                                required
                                autoComplete="off"
                                className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                            >
                                <option value="">জেলা নির্বাচন করুন</option>
                                {DISTRICTS.map(d => (
                                    <option key={d} value={d}>{d}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Password */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">পাসওয়ার্ড</label>
                        <div className="relative">
                            <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                            <input
                                type={showPassword ? 'text' : 'password'}
                                name="password"
                                placeholder="••••••••"
                                value={form.password}
                                onChange={handleChange}
                                required
                                autoComplete="new-password"
                                className="w-full pl-10 pr-10 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                            >
                                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                            </button>
                        </div>
                        <p className="text-xs text-gray-400 mt-1">
                            ৮+ অক্ষর, ১ বড়, ১ ছোট, ১ নম্বর, ১ বিশেষ চিহ্ন (@$!%*?&)
                        </p>
                    </div>

                    {/* Confirm Password */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">পাসওয়ার্ড নিশ্চিত করুন</label>
                        <div className="relative">
                            <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                            <input
                                type={showConfirmPassword ? 'text' : 'password'}
                                name="password_confirmation"
                                placeholder="••••••••"
                                value={form.password_confirmation}
                                onChange={handleChange}
                                required
                                autoComplete="new-password"
                                className="w-full pl-10 pr-10 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                            />
                            <button
                                type="button"
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                            >
                                {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                            </button>
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-primary hover:bg-primary-dark text-white py-2.5 rounded-lg font-medium transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
                    >
                        {loading ? (
                            <>
                                <Loader2 size={16} className="animate-spin" /> রেজিস্ট্রেশন হচ্ছে...
                            </>
                        ) : (
                            'রেজিস্ট্রেশন করুন'
                        )}
                    </button>
                </form>

                <p className="text-center text-sm text-gray-500 mt-6">
                    অ্যাকাউন্ট আছে?{' '}
                    <Link to="/login" className="text-primary font-medium hover:underline">
                        লগইন করুন
                    </Link>
                </p>
            </div>
        </div>
    );
};

export default RegistrationPage;