import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
    Search, Phone, Mail, FileText, Users, Shield,
    ChevronDown, ChevronUp, AlertTriangle, BookOpen,
    Zap, CheckCircle, ArrowRight
} from 'lucide-react';

const FAQS = [
    {
        q: 'কীভাবে নিখোঁজ ব্যক্তির রিপোর্ট করব?',
        a: 'উপরের মেনু থেকে "নিখোঁজ রিপোর্ট করুন" বাটনে ক্লিক করুন। প্রয়োজনীয় তথ্য যেমন নাম, বয়স, শেষ দেখার স্থান, ছবি ইত্যাদি পূরণ করে সাবমিট করুন। রিপোর্ট জমার পর আমাদের টিম ২৪ ঘণ্টার মধ্যে যাচাই করবে।'
    },
    {
        q: 'AI ফেস রিকগনিশন কীভাবে কাজ করে?',
        a: 'আপনি যখন ছবি আপলোড করেন, আমাদের AI সিস্টেম ডেটাবেজের সকল রিপোর্টের সাথে ফেস ম্যাচিং করে। মিল পাওয়া গেলে পরিবারকে তাৎক্ষণিক SMS ও ইমেইলে জানানো হয়। প্রযুক্তিটি সম্পূর্ণ গোপনীয় ও সুরক্ষিত।'
    },
    {
        q: 'রিপোর্ট করতে কি রেজিস্ট্রেশন বাধ্যতামূলক?',
        a: 'হ্যাঁ, রিপোর্টের সত্যতা নিশ্চিত করতে রেজিস্ট্রেশন প্রয়োজন। তবে অনুসন্ধান ও উদ্ধার তালিকা দেখতে রেজিস্ট্রেশন ছাড়াই ব্রাউজ করা যাবে।'
    },
    {
        q: 'SMS আলার্ট কীভাবে সক্রিয় করব?',
        a: '"আলার্ট সাবস্ক্রিপশন" পেজ থেকে আপনার মোবাইল নম্বর ও পছন্দের জেলা নির্বাচন করুন। সেই এলাকায় নতুন রিপোর্ট জমা হলে আপনি SMS পাবেন।'
    },
    {
        q: 'পুলিশ বা হাসপাতাল কীভাবে এই প্ল্যাটফর্ম ব্যবহার করতে পারে?',
        a: 'সরকারি প্রতিষ্ঠানের জন্য আলাদা অর্গানাইজেশন অ্যাকাউন্ট পাওয়া যায়। আপনার প্রতিষ্ঠানের নাম ও যোগাযোগ তথ্য দিয়ে আবেদন করুন — আমরা ৪৮ ঘণ্টার মধ্যে অ্যাক্সেস দেব।'
    },
    {
        q: 'রিপোর্ট করা তথ্য কি নিরাপদ থাকে?',
        a: 'হ্যাঁ, সকল তথ্য এনক্রিপ্টেড সার্ভারে সুরক্ষিত রাখা হয়। ছবি শুধুমাত্র AI ম্যাচিংয়ের জন্য ব্যবহার হয়, তৃতীয় পক্ষের সাথে শেয়ার করা হয় না।'
    },
    {
        q: 'ভুল রিপোর্ট দেওয়া হলে কী করব?',
        a: 'ড্যাশবোর্ড থেকে "আমার রিপোর্ট" বিভাগে গিয়ে রিপোর্টটি সম্পাদনা বা মুছে ফেলতে পারবেন। অথবা আমাদের সাথে সরাসরি যোগাযোগ করুন।'
    },
    {
        q: 'প্ল্যাটফর্মটি কি বিনামূল্যে?',
        a: 'হ্যাঁ, সাধারণ নাগরিকদের জন্য এই প্ল্যাটফর্ম সম্পূর্ণ বিনামূল্যে। NGO ও সরকারি প্রতিষ্ঠানের জন্য প্রিমিয়াম ফিচার পাওয়া যায়।'
    },
];

const GUIDES = [
    { icon: FileText, title: 'নিখোঁজ রিপোর্ট গাইড', desc: 'সঠিকভাবে রিপোর্ট জমা দেওয়ার ধাপগুলো', link: '/report-missing', color: 'text-secondary bg-secondary/10' },
    { icon: Search, title: 'অনুসন্ধান গাইড', desc: 'দ্রুত ও কার্যকরভাবে খোঁজার কৌশল', link: '/search', color: 'text-primary bg-primary/10' },
    { icon: Users, title: 'NGO ও প্রতিষ্ঠান নির্দেশিকা', desc: 'প্রাতিষ্ঠানিক অ্যাকাউন্ট ও উদ্ধার তথ্য যোগ', link: '/report-found', color: 'text-accent-teal bg-accent-teal/10' },
    { icon: Shield, title: 'গোপনীয়তা নীতি', desc: 'আপনার তথ্য কীভাবে সুরক্ষিত রাখা হয়', link: '/privacy', color: 'text-purple-600 bg-purple-100' },
    { icon: Zap, title: 'AI ম্যাচিং ব্যাখ্যা', desc: 'ফেস রিকগনিশন প্রযুক্তির কার্যপদ্ধতি', link: '/ai-match', color: 'text-orange-500 bg-orange-100' },
    { icon: BookOpen, title: 'আইনি সহায়তা', desc: 'নিখোঁজ মামলায় পুলিশি পদক্ষেপ ও আইনি অধিকার', link: '/legal', color: 'text-gray-600 bg-gray-100' },
];

const QUICK_ACTIONS = [
    { icon: FileText, label: 'নিখোঁজ রিপোর্ট করুন', link: '/report-missing', color: 'bg-primary text-white' },
    { icon: Users, label: 'উদ্ধার তথ্য দিন', link: '/report-found', color: 'bg-secondary text-white' },
    { icon: Search, label: 'অনুসন্ধান করুন', link: '/search-page', color: 'bg-accent-teal text-white' },
    { icon: Phone, label: 'জরুরি যোগাযোগ', link: '/contact', color: 'bg-accent-red text-white' },
];

const FaqItem = ({ q, a }) => {
    const [open, setOpen] = useState(false);
    return (
        <div className={`border rounded-2xl overflow-hidden transition-all ${open ? 'border-primary/30 bg-primary/5' : 'border-gray-100 bg-white'}`}>
            <button
                onClick={() => setOpen(o => !o)}
                className="w-full flex items-center justify-between gap-4 p-4 text-left"
            >
                <span className="font-bold text-gray-800 text-sm">{q}</span>
                {open ? <ChevronUp size={16} className="text-primary flex-shrink-0" /> : <ChevronDown size={16} className="text-gray-400 flex-shrink-0" />}
            </button>
            {open && (
                <div className="px-4 pb-4 text-sm text-gray-600 leading-relaxed border-t border-primary/10 pt-3">
                    {a}
                </div>
            )}
        </div>
    );
};

export default function HelpPage() {
    const [search, setSearch] = useState('');
    const filtered = FAQS.filter(f => f.q.includes(search) || f.a.includes(search));

    return (
        <div className="bg-background min-h-screen">
            {/* Hero */}
            <div className="bg-primary text-white py-14 px-4 text-center relative overflow-hidden">
                <div className="absolute inset-0 opacity-10">
                    <div className="absolute top-0 right-0 w-72 h-72 bg-secondary rounded-full translate-x-1/3 -translate-y-1/2" />
                    <div className="absolute bottom-0 left-0 w-64 h-64 bg-accent-teal rounded-full -translate-x-1/3 translate-y-1/3" />
                </div>
                <div className="relative z-10 max-w-2xl mx-auto">
                    <h1 className="text-4xl font-black mb-3">সহায়তা কেন্দ্র</h1>
                    <p className="text-white/70 text-sm mb-6">আপনার যেকোনো প্রশ্নের উত্তর খুঁজুন অথবা আমাদের সাথে সরাসরি যোগাযোগ করুন</p>
                    {/* Search bar */}
                    <div className="relative max-w-md mx-auto">
                        <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            placeholder="প্রশ্ন খুঁজুন..."
                            className="w-full pl-10 pr-4 py-3 rounded-xl text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-white/30 shadow-md"
                        />
                    </div>
                </div>
            </div>

            <div className="max-w-6xl mx-auto px-4 py-12">

                {/* Emergency Notice */}
                <div className="bg-accent-red/5 border border-accent-red/20 rounded-2xl p-4 mb-10 flex items-start gap-3">
                    <AlertTriangle size={18} className="text-accent-red flex-shrink-0 mt-0.5" />
                    <div>
                        <p className="font-bold text-accent-red text-sm mb-0.5">জরুরি পরিস্থিতিতে এখনই কল করুন</p>
                        <p className="text-xs text-gray-500">নিখোঁজ হওয়ার সাথে সাথে পুলিশকে জানান —
                            <a href="tel:999" className="font-black text-accent-red ml-1">৯৯৯</a> অথবা
                            <a href="tel:16123" className="font-black text-accent-red ml-1">১৬১২৩</a>
                        </p>
                    </div>
                </div>

                {/* Quick Guides Grid */}
                <div className="mb-12">
                    <h2 className="text-2xl font-black text-gray-800 mb-2">দ্রুত নির্দেশিকা</h2>
                    <p className="text-sm text-gray-400 mb-6">সাধারণ কাজগুলো কীভাবে করবেন</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {GUIDES.map(g => (
                            <Link to={g.link} key={g.title}
                                className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm hover:shadow-md transition-shadow group flex items-start gap-4">
                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${g.color}`}>
                                    <g.icon size={18} />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="font-bold text-gray-800 text-sm mb-0.5">{g.title}</p>
                                    <p className="text-xs text-gray-400 line-clamp-2">{g.desc}</p>
                                </div>
                                <ArrowRight size={14} className="text-gray-300 group-hover:text-primary transition-colors flex-shrink-0 mt-1" />
                            </Link>
                        ))}
                    </div>
                </div>

                {/* How It Works Steps */}
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-12">
                    <h2 className="text-2xl font-black text-gray-800 mb-6">শুরু করার ৪টি ধাপ</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                        {[
                            { n: '১', title: 'রেজিস্ট্রেশন করুন', desc: 'ফোন নম্বর বা ইমেইল দিয়ে দ্রুত অ্যাকাউন্ট খুলুন', icon: Users },
                            { n: '২', title: 'রিপোর্ট করুন', desc: 'নিখোঁজ বা উদ্ধার হওয়া ব্যক্তির তথ্য ও ছবি যোগ করুন', icon: FileText },
                            { n: '৩', title: 'AI মিলিয়ে দেয়', desc: 'স্বয়ংক্রিয় ফেস রিকগনিশন ডেটাবেজ স্ক্যান করে', icon: Zap },
                            { n: '৪', title: 'পুনর্মিলন', desc: 'মিল পেলে SMS ও ইমেইলে তাৎক্ষণিক বিজ্ঞপ্তি পাবেন', icon: CheckCircle },
                        ].map(s => (
                            <div key={s.n} className="relative">
                                <div className="flex flex-col items-center text-center">
                                    <div className="w-12 h-12 bg-primary text-white rounded-2xl flex items-center justify-center font-black text-lg mb-3 shadow-sm">
                                        {s.n}
                                    </div>
                                    <h3 className="font-bold text-gray-800 text-sm mb-1">{s.title}</h3>
                                    <p className="text-xs text-gray-400 leading-relaxed">{s.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* FAQ Section */}
                <div className="mb-12">
                    <h2 className="text-2xl font-black text-gray-800 mb-2">সচরাচর জিজ্ঞাসা (FAQ)</h2>
                    <p className="text-sm text-gray-400 mb-6">
                        {search ? `"${search}" — ${filtered.length}টি ফলাফল` : `সবচেয়ে বেশি জিজ্ঞাসিত প্রশ্নগুলো`}
                    </p>
                    <div className="space-y-3">
                        {filtered.length > 0
                            ? filtered.map((f, i) => <FaqItem key={i} q={f.q} a={f.a} />)
                            : (<div className="text-center py-10 text-gray-400">
                                <Search size={28} className="mx-auto mb-2 opacity-30" />
                                <p className="text-sm">কোনো প্রশ্ন পাওয়া যায়নি।
                                    <button onClick={() => setSearch('')} className="text-primary ml-1 hover:underline">সব দেখুন</button>
                                </p>
                            </div>)
                        }
                    </div>
                </div>

                {/* Contact CTA */}
                <div className="bg-primary rounded-2xl p-8 text-center text-white">
                    <h2 className="text-2xl font-black mb-2">উত্তর খুঁজে পাননি?</h2>
                    <p className="text-white/70 text-sm mb-6">আমাদের সহায়তা দল আপনাকে সাহায্য করতে সর্বদা প্রস্তুত</p>
                    <div className="flex flex-wrap justify-center gap-3">
                        <Link to="/contact"
                            className="flex items-center gap-2 bg-secondary text-white px-6 py-2.5 rounded-xl text-sm font-bold hover:bg-secondary-dark transition-colors shadow-lg">
                            <Mail size={15} /> বার্তা পাঠান
                        </Link>
                        <a href="tel:01712345678"
                            className="flex items-center gap-2 bg-white/10 border border-white/20 text-white px-6 py-2.5 rounded-xl text-sm font-bold hover:bg-white/20 transition-colors">
                            <Phone size={15} /> সরাসরি কল করুন
                        </a>
                    </div>
                </div>
            </div>
        </div>
    );
}