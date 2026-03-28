import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, ArrowLeft, KeyRound, Lock, EyeOff, Eye, CheckCircle2 } from 'lucide-react';

export default function ForgotPasswordPage() {
    const [step, setStep] = useState(1);
    const [email, setEmail] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const navigate = useNavigate();

    const handleSendCode = (e) => {
        e.preventDefault();
        if (email) setStep(2);
    };

    const handleVerify = (e) => {
        e.preventDefault();
        setStep(3);
    };

    const handleReset = (e) => {
        e.preventDefault();
        setStep(4);
        setTimeout(() => {
            navigate('/login');
        }, 2500);
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
                            কোনো চিন্তা নেই! আপনার অ্যাকাউন্টের সাথে যুক্ত ইমেইল ঠিকানা দিন। আমরা পাসওয়ার্ড রিসেট করার জন্য একটি কোড পাঠাবো।
                        </p>

                        <form onSubmit={handleSendCode} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">ইমেইল ঠিকানা</label>
                                <div className="relative">
                                    <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                    <input
                                        type="email"
                                        required
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder="your@email.com"
                                        className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                                    />
                                </div>
                            </div>
                            <button type="submit" className="w-full bg-primary hover:bg-primary-dark text-white py-2.5 rounded-lg font-bold transition-all shadow-md shadow-primary/20">
                                কোড পাঠান
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
                            আমরা <strong>{email}</strong> ঠিকানায় একটি 4-ডিজিটের কোড পাঠিয়েছি। কোডটি নিচে প্রবেশ করান।
                        </p>

                        <form onSubmit={handleVerify} className="space-y-6">
                            <div className="flex justify-center gap-3">
                                {[1, 2, 3, 4].map((i) => (
                                    <input
                                        key={i}
                                        type="text"
                                        maxLength={1}
                                        required
                                        className="w-12 h-14 text-center text-xl font-bold border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all bg-gray-50 bg-white"
                                    />
                                ))}
                            </div>
                            <button type="submit" className="w-full bg-primary hover:bg-primary-dark text-white py-2.5 rounded-lg font-bold transition-all shadow-md shadow-primary/20">
                                ভেরিফাই করুন
                            </button>
                        </form>

                        <div className="mt-6 text-center">
                            <p className="text-sm text-gray-500 mb-3">কোড পাননি?</p>
                            <button className="text-sm font-bold text-primary hover:underline">
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

                        <form onSubmit={handleReset} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">নতুন পাসওয়ার্ড</label>
                                <div className="relative">
                                    <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        required
                                        placeholder="••••••••"
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
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        required
                                        placeholder="••••••••"
                                        className="w-full pl-10 pr-10 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                                    />
                                </div>
                            </div>
                            <button type="submit" className="w-full bg-primary hover:bg-primary-dark text-white py-2.5 rounded-lg font-bold transition-all shadow-md shadow-primary/20 mt-2">
                                পাসওয়ার্ড পরিবর্তন করুন
                            </button>
                        </form>
                    </div>
                )}

                {step === 4 && (
                    <div className="animate-in fade-in zoom-in-95 duration-300 text-center py-6">
                        <div className="w-16 h-16 bg-accent-teal/10 rounded-full flex items-center justify-center mx-auto mb-4">
                            <CheckCircle2 className="text-accent-teal w-8 h-8" />
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