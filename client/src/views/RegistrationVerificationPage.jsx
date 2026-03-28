import { useState, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Mail, CheckCircle2, Loader2 } from 'lucide-react';
import { useAuth } from '../helpers/AuthContext';
import toast from 'react-hot-toast';

export default function RegistrationVerificationPage() {
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [resending, setResending] = useState(false);
    const [code, setCode] = useState(['', '', '', '']);
    const inputRefs = [useRef(), useRef(), useRef(), useRef()];
    const navigate = useNavigate();
    const location = useLocation();
    const { login } = useAuth();
    
    // Get email from navigation state
    const email = location.state?.email || '';

    const handleCodeChange = (index, value) => {
        if (!/^\d*$/.test(value)) return; // Only allow digits
        
        const newCode = [...code];
        newCode[index] = value;
        setCode(newCode);

        // Auto-focus next input
        if (value && index < 3) {
            inputRefs[index + 1].current?.focus();
        }
    };

    const handleKeyDown = (index, e) => {
        // Handle backspace
        if (e.key === 'Backspace' && !code[index] && index > 0) {
            inputRefs[index - 1].current?.focus();
        }
    };

    const handleVerify = async (e) => {
        e.preventDefault();
        
        const verificationCode = code.join('');
        
        if (verificationCode.length !== 4) {
            toast.error('Please enter the complete 4-digit code');
            return;
        }

        if (!email) {
            toast.error('Email not found. Please register again.');
            navigate('/register');
            return;
        }

        setLoading(true);
        
        // TODO: Replace with real API call when backend is ready
        await new Promise(r => setTimeout(r, 800)); // simulate network
        const mockUser = {
            name: email.split('@')[0].replace(/[._]/g, ' ').replace(/\b\w/g, c => c.toUpperCase()),
            email,
            phone: '',
            location: '',
            role: 'user',
            joinDate: new Date().toLocaleDateString('bn-BD'),
        };
        login(mockUser, 'mock-token-' + Date.now());
        toast.success('Email verified successfully!');
        setStep(2);
        setLoading(false);
        setTimeout(() => { navigate('/dashboard'); }, 2000);
    };

    const handleResend = async () => {
        if (!email) {
            toast.error('Email not found. Please register again.');
            navigate('/register');
            return;
        }

        setResending(true);
        // TODO: Replace with real API call when backend is ready
        await new Promise(r => setTimeout(r, 600)); // simulate network
        toast.success('Verification code resent successfully!');
        setCode(['', '', '', '']);
        inputRefs[0].current?.focus();
        setResending(false);
    };

    return (
        <div className="min-h-screen bg-background flex items-center justify-center py-12 px-4">
            <div className="bg-white rounded-2xl shadow-md w-full max-w-md p-8">
                {step === 1 && (
                    <div className="animate-in fade-in slide-in-from-bottom-2 duration-300 text-center">
                        <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-5">
                            <Mail className="text-primary w-8 h-8" />
                        </div>
                        <h1 className="text-2xl font-bold text-gray-800 mb-2">ইমেইল যাচাই করুন</h1>
                        <p className="text-gray-500 text-sm mb-6 leading-relaxed">
                            আমরা আপনার ইমেইলে একটি 4-ডিজিটের ভেরিফিকেশন কোড পাঠিয়েছি। অনুগ্রহ করে কোডটি নিচে প্রবেশ করান।
                        </p>

                        <form onSubmit={handleVerify} className="space-y-6">
                            <div className="flex justify-center gap-3">
                                {[0, 1, 2, 3].map((i) => (
                                    <input
                                        key={i}
                                        ref={inputRefs[i]}
                                        type="text"
                                        maxLength={1}
                                        value={code[i]}
                                        onChange={(e) => handleCodeChange(i, e.target.value)}
                                        onKeyDown={(e) => handleKeyDown(i, e)}
                                        required
                                        disabled={loading}
                                        className="w-12 h-14 text-center text-xl font-bold border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all bg-gray-50 bg-white disabled:opacity-60"
                                    />
                                ))}
                            </div>
                            <button 
                                type="submit" 
                                disabled={loading}
                                className="w-full bg-primary hover:bg-primary-dark text-white py-2.5 rounded-lg font-bold transition-all shadow-md shadow-primary/20 disabled:opacity-60 flex items-center justify-center gap-2"
                            >
                                {loading ? (
                                    <>
                                        <Loader2 size={16} className="animate-spin" />
                                        যাচাই হচ্ছে...
                                    </>
                                ) : (
                                    'যাচাই করুন'
                                )}
                            </button>
                        </form>

                        <div className="mt-6">
                            <p className="text-sm text-gray-500 mb-3">ইমেইল পাননি?</p>
                            <button 
                                onClick={handleResend}
                                disabled={resending || loading}
                                className="text-sm font-bold text-primary hover:underline disabled:opacity-60"
                            >
                                {resending ? 'পাঠানো হচ্ছে...' : 'আবার কোড পাঠান'}
                            </button>
                        </div>
                    </div>
                )}

                {step === 2 && (
                    <div className="animate-in fade-in zoom-in-95 duration-300 text-center py-6">
                        <div className="w-16 h-16 bg-accent-teal/10 rounded-full flex items-center justify-center mx-auto mb-4">
                            <CheckCircle2 className="text-accent-teal w-8 h-8" />
                        </div>
                        <h1 className="text-2xl font-bold text-gray-800 mb-2">অভিনন্দন!</h1>
                        <p className="text-gray-500 text-sm leading-relaxed mb-6">
                            আপনার অ্যাকাউন্ট সফলভাবে যাচাই করা হয়েছে। আপনাকে ড্যাশবোর্ডে নিয়ে যাওয়া হচ্ছে...
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}
