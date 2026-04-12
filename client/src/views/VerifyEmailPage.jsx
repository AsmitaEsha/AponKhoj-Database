import { useState, useRef, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Mail, CheckCircle2, Loader2 } from 'lucide-react';
import { useAuth } from '../helpers/AuthContext';
import toast from 'react-hot-toast';

const API = 'http://localhost:5000';

export default function VerifyEmailPage() {
    const { state } = useLocation();
    const navigate = useNavigate();
    const { login } = useAuth();

    const [email] = useState(state?.email || '');
    const [otpDigits, setOtpDigits] = useState(['', '', '', '']);
    const [loading, setLoading] = useState(false);
    const [resending, setResending] = useState(false);
    const [error, setError] = useState('');
    const [verified, setVerified] = useState(false);
    const otpInputsRef = useRef([]);

    const otp = otpDigits.join('');

    useEffect(() => {
        if (!email) navigate('/register');
    }, [email, navigate]);

    const handleVerify = async (e) => {
        e.preventDefault();
        setError('');
        if (otp.length < 4) { setError('সম্পূর্ণ ৪-ডিজিটের কোড প্রবেশ করান।'); return; }
        setLoading(true);
        try {
            const res = await fetch(`${API}/auth/verify-email`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, otp }),
            });
            const data = await res.json();
            if (!res.ok) { setError(data.error || 'কোডটি ভুল অথবা মেয়াদ শেষ হয়ে গেছে।'); return; }
            setVerified(true);
            login(data.user, data.token);
            toast.success('ইমেইল যাচাই সফল!');
            setTimeout(() => navigate('/dashboard'), 2000);
        } catch {
            setError('সার্ভারে সংযোগ সমস্যা। পরে চেষ্টা করুন।');
        } finally {
            setLoading(false);
        }
    };

    const handleResend = async () => {
        setError('');
        setOtpDigits(['', '', '', '']);
        setResending(true);
        try {
            const res = await fetch(`${API}/auth/resend-verification`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email }),
            });
            if (res.ok) toast.success('নতুন কোড পাঠানো হয়েছে।');
            else { const data = await res.json(); setError(data.error || 'পুনরায় কোড পাঠাতে সমস্যা হয়েছে।'); }
        } catch {
            setError('সার্ভারে সংযোগ সমস্যা।');
        } finally {
            setResending(false);
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

    if (verified) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center py-12 px-4">
                <div className="bg-white rounded-2xl shadow-md w-full max-w-md p-8 text-center">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <CheckCircle2 className="text-green-500 w-8 h-8" />
                    </div>
                    <h1 className="text-2xl font-bold text-gray-800 mb-2">যাচাই সফল!</h1>
                    <p className="text-gray-500 text-sm">আপনাকে ড্যাশবোর্ডে নিয়ে যাওয়া হচ্ছে...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background flex items-center justify-center py-12 px-4">
            <div className="bg-white rounded-2xl shadow-md w-full max-w-md p-8 text-center">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Mail className="text-primary w-6 h-6" />
                </div>
                <h1 className="text-2xl font-bold text-gray-800 mb-2">ইমেইল যাচাই করুন</h1>
                <p className="text-gray-500 text-sm mb-6 leading-relaxed">
                    আমরা <strong>{email}</strong> ঠিকানায় একটি ৪-ডিজিটের কোড পাঠিয়েছি।
                    কোডটি নিচে প্রবেশ করান।
                </p>

                {error && (
                    <p className="text-red-500 text-sm mb-4 bg-red-50 py-2 px-3 rounded-lg">{error}</p>
                )}

                <form onSubmit={handleVerify} className="space-y-6">
                    <div className="flex justify-center gap-3">
                        {otpDigits.map((digit, i) => (
                            <input
                                key={i}
                                ref={el => otpInputsRef.current[i] = el}
                                type="text"
                                inputMode="numeric"
                                maxLength={1}
                                value={digit}
                                onChange={e => handleOtpChange(i, e.target.value)}
                                onKeyDown={e => handleOtpKeyDown(i, e)}
                                className="w-12 h-14 text-center text-xl font-bold border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all bg-white"
                            />
                        ))}
                    </div>
                    <button
                        type="submit"
                        disabled={loading || otp.length < 4}
                        className="w-full bg-primary hover:bg-primary-dark text-white py-2.5 rounded-lg font-bold transition-all shadow-md shadow-primary/20 flex items-center justify-center gap-2 disabled:opacity-60"
                    >
                        {loading ? <><Loader2 size={16} className="animate-spin" /> যাচাই হচ্ছে...</> : 'ইমেইল যাচাই করুন'}
                    </button>
                </form>

                <div className="mt-6">
                    <p className="text-sm text-gray-500 mb-3">কোড পাননি?</p>
                    <button
                        type="button"
                        onClick={handleResend}
                        disabled={resending}
                        className="text-sm font-bold text-primary hover:underline disabled:opacity-60"
                    >
                        {resending ? 'পাঠানো হচ্ছে...' : 'আবার কোড পাঠান'}
                    </button>
                </div>
            </div>
        </div>
    );
}