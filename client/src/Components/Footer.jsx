import { Link, useNavigate } from 'react-router-dom';
import { Phone, Mail, Search } from 'lucide-react';
import { useAuth } from '../helpers/AuthContext';

const Footer = () => {
    const { isAuthenticated } = useAuth();
    const navigate = useNavigate();

    // Protected link handler
    const handleProtectedLink = (e, path) => {
        if (!isAuthenticated) {
            e.preventDefault();
            navigate('/login', { state: { from: path } });
        }
    };

    return (
        <footer className="bg-primary text-white mt-auto">
            <div className="max-w-7xl mx-auto px-6 py-10">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                    {/* Logo & Description */}
                    <div className="md:col-span-1">
                        <div className="flex items-center gap-2 mb-3">
                            <div className="w-8 h-8 bg-white/20 rounded-md flex items-center justify-center">
                                <Search size={16} className="text-white" />
                            </div>
                            <span className="font-bold text-lg">আপনখোঁজ</span>
                        </div>
                        <p className="text-white/70 text-sm leading-relaxed">
                            হারিয়ে যাওয়া প্রিয়জনকে খুঁজে পেতে এবং উদ্ধারকৃত ব্যক্তিদের পরিবারের সাথে পুনর্মিলন ঘটাতে আমরা একটি নির্ভরযোগ্য ও মানবিক প্ল্যাটফর্ম হিসেবে কাজ করছি।
                        </p>
                    </div>

                    {/* Important Links */}
                    <div>
                        <h3 className="font-semibold text-sm mb-3 text-white/90">গুরুত্বপূর্ণ লিংক</h3>
                        <ul className="space-y-2 text-sm text-white/70">
                            {/* Protected links */}
                            <li>
                                <Link 
                                    to="/report-missing" 
                                    onClick={(e) => handleProtectedLink(e, '/report-missing')}
                                    className="hover:text-white transition-colors inline-flex items-center gap-1"
                                >
                                    নিখোঁজ রিপোর্ট করুন
                                    {!isAuthenticated && <span className="text-xs opacity-60"></span>}
                                </Link>
                            </li>
                            <li>
                                <Link 
                                    to="/report-found" 
                                    onClick={(e) => handleProtectedLink(e, '/report-found')}
                                    className="hover:text-white transition-colors inline-flex items-center gap-1"
                                >
                                    উদ্ধার তথ্য যোগ করুন
                                    {!isAuthenticated && <span className="text-xs opacity-60"></span>}
                                </Link>
                            </li>
                            <li>
                                <Link 
                                    to="/search" 
                                    onClick={(e) => handleProtectedLink(e, '/search')}
                                    className="hover:text-white transition-colors inline-flex items-center gap-1"
                                >
                                    অনুসন্ধান করুন
                                    {!isAuthenticated && <span className="text-xs opacity-60"></span>}
                                </Link>
                            </li>
                            {/* Public link */}
                            <li>
                                <Link to="/success-stories" className="hover:text-white transition-colors">
                                    সফলতার গল্প
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* About */}
                    <div>
                        <h3 className="font-semibold text-sm mb-3 text-white/90">আমাদের সম্পর্কে</h3>
                        <ul className="space-y-2 text-sm text-white/70">
                            <li><Link to="/about" className="hover:text-white transition-colors">আমাদের লক্ষ্য ও উদ্দেশ্য</Link></li>
                            <li><Link to="/help" className="hover:text-white transition-colors">সহায়তা কেন্দ্র</Link></li>
                            <li><Link to="/contact" className="hover:text-white transition-colors">যোগাযোগ</Link></li>
                        </ul>
                    </div>

                    {/* Contact */}
                    <div>
                        <h3 className="font-semibold text-sm mb-3 text-white/90">যোগাযোগ</h3>
                        <div className="space-y-3 text-sm text-white/70">
                            <div className="flex items-center gap-2">
                                <Phone size={14} className="text-secondary" />
                                <div>
                                    <a href="tel:999" className="text-white font-bold text-lg">999</a>
                                    <p className="text-xs text-white/50">পুলিশ নিয়ন্ত্রণ কক্ষ</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <Mail size={14} className="text-secondary" />
                                <a href="mailto:support@aponkhoj.com.bd" className="hover:text-white transition-colors text-xs">support@aponkhoj.com.bd</a>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="border-t border-white/10">
                <div className="max-w-7xl mx-auto px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-2">
                    <p className="text-white/50 text-xs">© ২০২৬ আপনখোঁজ। সকল স্বত্ব সংরক্ষিত।</p>
                    <div className="flex gap-4 text-xs text-white/50">
                        <Link to="/privacy" className="hover:text-white transition-colors">গোপনীয়তা নীতি</Link>
                        <Link to="/terms" className="hover:text-white transition-colors">শর্তাবলী</Link>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;