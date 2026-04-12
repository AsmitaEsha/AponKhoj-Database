import { useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, ArrowLeft, KeyRound, Lock, EyeOff, Eye, CheckCircle2, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

const API = 'http://localhost:5000';

export default function ForgotPasswordPage() {
    const [step, setStep] = useState(1);
    const [email, setEmail] = useState('');
    const [otpDigits, setOtpDigits] = useState(['', '', '', '']);
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const otpInputsRef = useRef([]);
    const navigate = useNavigate();

    const otp = otpDigits.join('');

    const handleSendCode = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            const res = await fetch(`${API}/auth/forgot-password`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email }),
            });
            const data = await res.json();
            if (!res.ok) { setError(data.error || 'কোড পাঠাতে সমস্যা হয়েছে।'); return; }
            setStep(2);
        } catch {
            setError('সার্ভারে সংযোগ সমস্যা। পরে চেষ্টা করুন।');
        } finally {
            setLoading(false);
        }
    };

    const handleVerify = async (e) => {
        e.preventDefault();
        setError('');
        if (otp.length < 4) { setError('সম্পূর্ণ ৪-ডিজিটের কোড প্রবেশ করান।'); return; }
        setLoading(true);
        try {
            const res = await fetch(`${API}/auth/verify-otp`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, otp }),
            });
            const data = await res.json();
            if (!res.ok) { setError(data.error || 'কোডটি ভুল অথবা মেয়াদ শেষ হয়ে গেছে।'); return; }
            setStep(3);
        } catch {
            setError('সার্ভারে সংযোগ সমস্যা। পরে চেষ্টা করুন।');
        } finally {
            setLoading(false);
        }
    };

    const handleReset = async (e) => {
        e.preventDefault();
        setError('');
        if (newPassword !== confirmPassword) { setError('পাসওয়ার্ড দুটি মিলছে না।'); return; }
        setLoading(true);
        try {
            const res = await fetch(`${API}/auth/reset-password`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, otp, newPassword }),
            });
            const data = await res.json();
            if (!res.ok) { setError(data.error || 'পাসওয়ার্ড পরিবর্তন করতে সমস্যা হয়েছে।'); return; }
            setStep(4);
            setTimeout(() => navigate('/login'), 2500);
        } catch {
            setError('সার্ভারে সংযোগ সমস্যা। পরে চেষ্টা করুন।');
        } finally {
            setLoading(false);
        }
    };

    const handleResend = async () => {
        setError('');
        setOtpDigits(['', '', '', '']);
        setLoading(true);
        try {
            const res = await fetch(`${API}/auth/forgot-password`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email }),
            });
            if (res.ok) { toast.success('নতুন কোড পাঠানো হয়েছে।'); }
            else { const data = await res.json(); setError(data.error || 'পুনরায় কোড পাঠাতে সমস্যা হয়েছে।'); }
        } catch {
            setError('সার্ভারে সংযোগ সমস্যা।');
        } finally {
            setLoading(false);
        }
    };

    const handleOtpChange = (index, value) => {
        const digit = value.replace(/\D/g, '').slice(-1);
        const next = [...otpDigits];
        next[index] = digit;
        setOtpDigits(next);
        if (digit && index < 3) otpInputsRef.current[index + 1]?.focus();
    };

    const handleOtpKeyDown = (index, e) => {
        if (e.key === 'Backspace' && !otpDigits[index] && index > 0) {
            otpInputsRef.current[index - 1]?.focus();
        }
    };

    return (
        <div className="min-h-screen bg-background flex items-center justify-center py-12 px-4">
            <div className="bg-white rounded-2xl shadow-md w-full max-w-md p-8">

                {step === 1 && (
                    <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                        <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                            <KeyRound className="text-primary w-6 h-6" />
                        </div>
                        <h1 className="text-2xl font-bold text-gray-800 text-center mb-2">পাসওয়ার্ড ভুলে গেছেন?</h1>
                        <p className="text-gray-500 text-sm text-center mb-6 leading-relaxed">
                            কোনো চিন্তা নেই! আপনার অ্যাকাউন্টের সাথে যুক্ত ইমেইল ঠিকানা দিন।
                            আমরা পাসওয়ার্ড রিসেট করার জন্য একটি কোড পাঠাবো।
                        </p>
                        {error && <p className="text-red-500 text-sm text-center mb-4 bg-red-50 py-2 px-3 rounded-lg">{error}</p>}
                        <form onSubmit={handleSendCode} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">ইমেইল ঠিকানা</label>
                                <div className="relative">
                                    <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                    <input
                                        type="email" required value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder="your@email.com"
                                        className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                                    />
                                </div>
                            </div>
                            <button type="submit" disabled={loading}
                                className="w-full bg-primary hover:bg-primary-dark text-white py-2.5 rounded-lg font-bold transition-all shadow-md shadow-primary/20 flex items-center justify-center gap-2 disabled:opacity-60">
                                {loading ? <><Loader2 size={16} className="animate-spin" /> পাঠানো হচ্ছে...</> : 'কোড পাঠান'}
                            </button>
                        </form>
                        <div className="mt-6 text-center">
                            <Link to="/login" className="inline-flex items-center gap-1.5 text-sm font-medium text-gray-500 hover:text-gray-800 transition-colors">
                                <ArrowLeft size={14} /> লগইন পেজে ফিরে যান
                            </Link>
                        </div>
                    </div>
                )}

                {step === 2 && (
                    <div className="animate-in fade-in slide-in-from-right-2 duration-300 text-center">
                        <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Mail className="text-primary w-6 h-6" />
                        </div>
                        <h1 className="text-2xl font-bold text-gray-800 mb-2">ইমেইল চেক করুন</h1>
                        <p className="text-gray-500 text-sm mb-6 leading-relaxed">
                            আমরা <strong>{email}</strong> ঠিকানায় একটি ৪-ডিজিটের কোড পাঠিয়েছি।
                        </p>
                        {error && <p className="text-red-500 text-sm mb-4 bg-red-50 py-2 px-3 rounded-lg">{error}</p>}
                        <form onSubmit={handleVerify} className="space-y-6">
                            <div className="flex justify-center gap-3">
                                {otpDigits.map((digit, i) => (
                                    <input key={i} ref={el => otpInputsRef.current[i] = el}
                                        type="text" inputMode="numeric" maxLength={1} value={digit}
                                        onChange={e => handleOtpChange(i, e.target.value)}
                                        onKeyDown={e => handleOtpKeyDown(i, e)}
                                        className="w-12 h-14 text-center text-xl font-bold border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all bg-white"
                                    />
                                ))}
                            </div>
                            <button type="submit" disabled={loading || otp.length < 4}
                                className="w-full bg-primary hover:bg-primary-dark text-white py-2.5 rounded-lg font-bold transition-all shadow-md shadow-primary/20 flex items-center justify-center gap-2 disabled:opacity-60">
                                {loading ? <><Loader2 size={16} className="animate-spin" /> যাচাই হচ্ছে...</> : 'ভেরিফাই করুন'}
                            </button>
                        </form>
                        <div className="mt-6 text-center">
                            <p className="text-sm text-gray-500 mb-3">কোড পাননি?</p>
                            <button type="button" onClick={handleResend} disabled={loading}
                                className="text-sm font-bold text-primary hover:underline disabled:opacity-60">
                                আবার কোড পাঠান
                            </button>
                        </div>
                    </div>
                )}

                {step === 3 && (
                    <div className="animate-in fade-in slide-in-from-right-2 duration-300">
                        <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Lock className="text-primary w-6 h-6" />
                        </div>
                        <h1 className="text-2xl font-bold text-gray-800 text-center mb-2">নতুন পাসওয়ার্ড সেট করুন</h1>
                        <p className="text-gray-500 text-sm text-center mb-6 leading-relaxed">
                            আপনার অ্যাকাউন্টের জন্য একটি শক্তিশালী নতুন পাসওয়ার্ড তৈরি করুন।
                        </p>
                        {error && <p className="text-red-500 text-sm text-center mb-4 bg-red-50 py-2 px-3 rounded-lg">{error}</p>}
                        <form onSubmit={handleReset} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">নতুন পাসওয়ার্ড</label>
                                <div className="relative">
                                    <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                    <input type={showPassword ? 'text' : 'password'} required value={newPassword}
                                        onChange={e => setNewPassword(e.target.value)} placeholder="••••••••"
                                        className="w-full pl-10 pr-10 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                                    />
                                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                                        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                    </button>
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">পাসওয়ার্ড নিশ্চিত করুন</label>
                                <div className="relative">
                                    <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                    <input type={showConfirmPassword ? 'text' : 'password'} required value={confirmPassword}
                                        onChange={e => setConfirmPassword(e.target.value)} placeholder="••••••••"
                                        className="w-full pl-10 pr-10 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                                    />
                                    <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                                        {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                    </button>
                                </div>
                            </div>
                            <p className="text-xs text-gray-400">৮+ অক্ষর, ১ বড়, ১ ছোট, ১ নম্বর, ১ বিশেষ চিহ্ন (@$!%*?&)</p>
                            <button type="submit" disabled={loading}
                                className="w-full bg-primary hover:bg-primary-dark text-white py-2.5 rounded-lg font-bold transition-all shadow-md shadow-primary/20 mt-2 flex items-center justify-center gap-2 disabled:opacity-60">
                                {loading ? <><Loader2 size={16} className="animate-spin" /> পরিবর্তন হচ্ছে...</> : 'পাসওয়ার্ড পরিবর্তন করুন'}
                            </button>
                        </form>
                    </div>
                )}

                {step === 4 && (
                    <div className="animate-in fade-in zoom-in-95 duration-300 text-center py-6">
                        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <CheckCircle2 className="text-green-500 w-8 h-8" />
                        </div>
                        <h1 className="text-2xl font-bold text-gray-800 mb-2">সফল!</h1>
                        <p className="text-gray-500 text-sm leading-relaxed mb-6">
                            আপনার পাসওয়ার্ড সফলভাবে পরিবর্তন করা হয়েছে। আপনাকে এখন লগইন পেজে নিয়ে যাওয়া হচ্ছে...
                        </p>
                    </div>
                )}

            </div>
        </div>
    );
}