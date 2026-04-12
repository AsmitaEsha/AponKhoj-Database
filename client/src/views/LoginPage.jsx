import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, Search, Loader2 } from 'lucide-react';
import { useAuth } from '../helpers/AuthContext';
import toast from 'react-hot-toast';

const LoginPage = () => {
    const [showPassword, setShowPassword] = useState(false);
    const [loginType, setLoginType] = useState('user');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const { login } = useAuth();

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const resp = await fetch('http://localhost:5000/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
            });

            const data = await resp.json();

            if (!resp.ok) {
                if (data.error === 'emailNotVerified') {
                    toast.error('ইমেইল যাচাই করা হয়নি। কোড পাঠানো হচ্ছে...');
                    navigate('/verify-email', { state: { email: data.email } });
                    setLoading(false);
                    return;
                }
                toast.error(data.error || 'Login failed');
                setLoading(false);
                return;
            }

            if (loginType === 'admin' && data.user.role !== 'admin') {
                toast.error('Admin access denied');
                setLoading(false);
                return;
            }

            if (loginType === 'user' && data.user.role === 'admin') {
                toast.error('Please use admin login for admin account');
                setLoading(false);
                return;
            }

            login(data.user, data.token);
            toast.success('Login successful');
            navigate(loginType === 'admin' ? '/admin/dashboard' : '/dashboard');
        } catch (err) {
            console.error('Login error', err);
            toast.error('Server error, please try again');
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
                    <h1 className="text-2xl font-bold text-gray-800">লগইন করুন</h1>
                    <p className="text-gray-500 text-sm mt-1">আপনার অ্যাকাউন্টে প্রবেশ করুন</p>
                </div>

                {/* User/Admin Toggle */}
                <div className="flex gap-2 mb-6 bg-gray-100 p-1 rounded-lg">
                    <button
                        type="button"
                        onClick={() => setLoginType('user')}
                        className={`flex-1 py-2.5 px-4 rounded-md font-medium text-sm transition-all cursor-pointer ${
                            loginType === 'user'
                                ? 'bg-white text-gray-800 shadow-sm'
                                : 'bg-transparent text-gray-600 hover:text-gray-800'
                        }`}
                    >
                        সাধারণ ব্যবহারকারী
                    </button>
                    <button
                        type="button"
                        onClick={() => setLoginType('admin')}
                        className={`flex-1 py-2.5 px-4 rounded-md font-medium text-sm transition-all cursor-pointer ${
                            loginType === 'admin'
                                ? 'bg-white text-gray-800 shadow-sm'
                                : 'bg-transparent text-gray-600 hover:text-gray-800'
                        }`}
                    >
                        অ্যাডমিন
                    </button>
                </div>

                <form onSubmit={handleLogin} className="space-y-5" autoComplete="off">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">ইমেইল</label>
                        <div className="relative">
                            <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                            <input
                                type="email"
                                placeholder="example@email.com"
                                value={email}
                                onChange={e => setEmail(e.target.value)}
                                required
                                autoComplete="off"
                                className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                            />
                        </div>
                    </div>

                    <div>
                        <div className="flex items-center justify-between mb-1">
                            <label className="block text-sm font-medium text-gray-700">পাসওয়ার্ড</label>
                            <Link to="/forgot-password" className="text-xs text-primary hover:underline font-medium">
                                পাসওয়ার্ড ভুলে গেছেন?
                            </Link>
                        </div>
                        <div className="relative">
                            <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                            <input
                                type={showPassword ? 'text' : 'password'}
                                placeholder="••••••••"
                                value={password}
                                onChange={e => setPassword(e.target.value)}
                                required
                                autoComplete="new-password"
                                className="w-full pl-10 pr-10 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                            >
                                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
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
                                <Loader2 size={16} className="animate-spin" /> লগইন হচ্ছে...
                            </>
                        ) : (
                            'লগইন করুন'
                        )}
                    </button>
                </form>

                <p className="text-center text-sm text-gray-500 mt-6">
                    অ্যাকাউন্ট নেই?{' '}
                    <Link to="/register" className="text-primary font-medium hover:underline">
                        রেজিস্ট্রেশন করুন
                    </Link>
                </p>
            </div>
        </div>
    );
};

export default LoginPage;