import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, Mail, Phone, MapPin, Lock, Eye, EyeOff, Search, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';


const RegistrationPage = () => {
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [form, setForm] = useState({ name: '', email: '', phone: '', location: '', password: '', password_confirmation: '' });
    const navigate = useNavigate();

    const handleChange = e => setForm(p => ({ ...p, [e.target.name]: e.target.value }));

    const handleRegister = async (e) => {
        e.preventDefault();

        // Validate password match
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
                    name: form.name,
                    email: form.email,
                    password: form.password,
                    // backend may ignore extra fields, but we include them
                    phone: form.phone,
                    location: form.location,
                }),
            });

            const data = await resp.json();

            if (!resp.ok) {
                toast.error(data.error || data.message || 'রেজিস্ট্রেশন ব্যর্থ হয়েছে');
                setLoading(false);
                return;
            }

            // store token if returned
            if (data.token) {
                localStorage.setItem('token', data.token);
            }

            // try to fetch profile from protected endpoint
            try {
                const token = data.token || localStorage.getItem('token');
                if (token) {
                    const meResp = await fetch('http://localhost:5000/api/me', {
                        headers: { Authorization: `Bearer ${token}` },
                    });
                    const meJson = await meResp.json();
                    if (meResp.ok && meJson.user) {
                        toast.success('রেজিস্ট্রেশন সফল হয়েছে!');
                        navigate('/dashboard');
                        setLoading(false);
                        return;
                    }
                }
            } catch (err) {
                // ignore profile fetch error, continue to success
            }

            toast.success('রেজিস্ট্রেশন সফল হয়েছে!');
            navigate('/dashboard');
        } catch (err) {
            console.error('Register error', err);
            toast.error('সার্ভারে সমস্যা, পরে চেষ্টা করুন');
        } finally {
            setLoading(false);
        }
    };

    const districts = ['ঢাকা', 'চট্টগ্রাম', 'রাজশাহী', 'খুলনা', 'বরিশাল', 'সিলেট', 'রংপুর', 'ময়মনসিংহ'];

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

                <form onSubmit={handleRegister} className="space-y-4">
                    {/* পূর্ণ নাম — always shown */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">পূর্ণ নাম</label>
                        <div className="relative">
                            <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                            <input type="text" name="name" value={form.name} onChange={handleChange}
                                placeholder="আপনার পূর্ণ নাম" required
                                className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary" />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">ইমেইল</label>
                        <div className="relative">
                            <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                            <input type="email" name="email" value={form.email} onChange={handleChange}
                                placeholder="example@email.com" required
                                className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary" />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">ফোন নম্বর</label>
                        <div className="relative">
                            <Phone size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                            <input type="tel" name="phone" value={form.phone} onChange={handleChange}
                                placeholder="01XXXXXXXXX"
                                className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary" />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">জেলা</label>
                        <div className="relative">
                            <MapPin size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                            <select name="location" value={form.location} onChange={handleChange}
                                className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary appearance-none bg-white">
                                <option value="">জেলা নির্বাচন করুন</option>
                                {districts.map(d => <option key={d}>{d}</option>)}
                            </select>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">পাসওয়ার্ড</label>
                        <div className="relative">
                            <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                            <input
                                type={showPassword ? 'text' : 'password'}
                                name="password" value={form.password} onChange={handleChange}
                                placeholder="••••••••" required minLength="8"
                                className="w-full pl-10 pr-10 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                            />
                            <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                            </button>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">পাসওয়ার্ড নিশ্চিত করুন</label>
                        <div className="relative">
                            <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                            <input
                                type={showConfirmPassword ? 'text' : 'password'}
                                name="password_confirmation" value={form.password_confirmation} onChange={handleChange}
                                placeholder="••••••••" required minLength="8"
                                className="w-full pl-10 pr-10 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                            />
                            <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                                {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                            </button>
                        </div>
                    </div>

                    <button type="submit" disabled={loading}
                        className="w-full bg-primary hover:bg-primary-dark text-white py-2.5 rounded-lg font-medium
                                   transition-colors mt-2 disabled:opacity-60 flex items-center justify-center gap-2">
                        {loading ? <><Loader2 size={16} className="animate-spin" /> রেজিস্ট্রেশন হচ্ছে...</> : 'রেজিস্ট্রেশন করুন'}
                    </button>
                </form>

                <p className="text-center text-sm text-gray-500 mt-6">
                    ইতিমধ্যে অ্যাকাউন্ট আছে?{' '}
                    <Link to="/login" className="text-primary font-medium hover:underline">লগইন করুন</Link>
                </p>
            </div>
        </div>
    );
};

export default RegistrationPage;