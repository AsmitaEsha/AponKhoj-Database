import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
    Phone, Mail, BookOpen,
    ChevronDown, ChevronUp, AlertTriangle, ChevronRight,
    CheckCircle, ArrowRight, FileText, Users, Search, Zap, Shield, X
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
    { 
        icon: FileText, 
        title: 'নিখোঁজ রিপোর্ট গাইড', 
        desc: 'সঠিকভাবে রিপোর্ট জমা দেওয়ার ধাপগুলো', 
        color: 'text-red-500 bg-red-50',
        headerBg: 'bg-red-500',
        details: [
            'আপনার ব্রাউজারের "নিখোঁজ রিপোর্ট করুন" বাটনে ক্লিক করুন।',
            'ব্যক্তির সঠিক নাম, বয়স এবং লিঙ্গ নির্ধারণ করুন।',
            'শেষ দেখার স্থান ও সময় নির্দিষ্ট করুন।',
            'পরিবারের সাথে যোগাযোগের নম্বরটি নিশ্চিত করুন।',
            'অন্তত একটি স্পষ্ট ছবি আপলোড করুন যা AI-এর জন্য সহায়ক হবে।',
            'সাবমিট করুন, ২৪ ঘণ্টার মধ্যে যাচাই শেষে রিপোর্টটি লাইভ হবে।'
        ]
    },
    { 
        icon: Search, 
        title: 'অনুসন্ধান গাইড', 
        desc: 'দ্রুত ও কার্যকরভাবে খুঁজার কৌশল', 
        color: 'text-emerald-600 bg-emerald-50',
        headerBg: 'bg-emerald-600',
        details: [
            'সার্চ ফিল্টারের মাধ্যমে বয়স ও জেলা নির্বাচন করুন।',
            'ছবি থাকলে AI ফেস ম্যাচিং ফিচার ব্যবহার করে খুঁজুন।',
            ' "উদ্ধার তালিকা" নিয়মিত চেক করুন।',
            'কোনো তথ্য মিললে সরাসরি রিপোর্টার বা পুলিশকে জানান।'
        ]
    },
    { 
        icon: Users, 
        title: 'NGO ও প্রতিষ্ঠান নির্দেশিকা', 
        desc: 'প্রাতিষ্ঠানিক অ্যাকাউন্ট ও উদ্ধার তথ্য যোগ', 
        color: 'text-teal-600 bg-teal-50',
        headerBg: 'bg-teal-600',
        details: [
            'এনজিও বা হাসপাতালের জন্য অর্গানাইজেশন অ্যাকাউন্ট খুলুন।',
            'পরিচয়পত্র ও নথিপত্র সংযুক্ত করে ভেরিফিকেশন আবেদন করুন।',
            'উদ্ধার হওয়া অজ্ঞাত ব্যক্তিদের তথ্য দ্রুত আপলোড করুন।',
            'ডাটাবেজ এক্সেস করার জন্য বিশেষ অনুমতি নিন।'
        ]
    },
    { 
        icon: Shield, 
        title: 'গোপনীয়তা নীতি', 
        desc: 'আপনার তথ্য কীভাবে সুরক্ষিত রাখা হয়', 
        color: 'text-purple-600 bg-purple-50',
        headerBg: 'bg-purple-600',
        details: [
            'আপনার সকল তথ্য এনক্রিপ্টেড সার্ভারে সুরক্ষিত।',
            'ফেস রিকগনিশন ডাটা শুধুমাত্র ম্যাচিং ছাড়া অন্য কাজে ব্যবহার হয় না।',
            'পুলিশ বা আইনি সংস্থা ছাড়া তৃতীয় পক্ষকে তথ্য দেওয়া হয় না।',
            'আপনি চাইলে যেকোনো সময় আপনার রিপোর্ট মুছে ফেলতে পারেন।'
        ]
    },
    { 
        icon: Zap, 
        title: 'AI ম্যাচিং ব্যাখ্যা', 
        desc: 'ফেস রিকগনিশন প্রযুক্তির কার্যপদ্ধতি', 
        color: 'text-amber-500 bg-amber-50',
        headerBg: 'bg-amber-500',
        details: [
            'সিস্টেম আপনার আপলোড করা ছবির বায়োমেট্রিক ডাটা বিশ্লেষণ করে।',
            'এটি ডাটাবেজে থাকা হাজার হাজার ছবির সাথে দ্রুত চেক করে।',
            'কোনো মিল পাওয়া গেলে রিপোর্টারকে ফোন/ইমেইলে অ্যালার্ট দেওয়া হয়।',
            'আপনিও ছবির মাধ্যমে যে কাউকে সার্চ করে দেখতে পারেন।'
        ]
    },
    { 
        icon: BookOpen, 
        title: 'আইনি সহায়তা', 
        desc: 'নিখোঁজ মামলায় পুলিশি পদক্ষেপ ও আইনি অধিকার', 
        color: 'text-slate-600 bg-slate-100',
        headerBg: 'bg-slate-600',
        details: [
            'নিখোঁজ হওয়ার সাথে সাথে আপনার স্থানীয় থানায় একটি জিডি ডায়েরি করুন।',
            'পুলিশের পাঠানো "ভিকটিম সাপোর্ট সেন্টারের" সাথে যোগাযোগ করুন।',
            '২৪ ঘণ্টা পার হলে সরাসরি আইনি মামলা (FIR) করতে পারেন।',
            'লিগ্যাল এড অফিস থেকে নিখোঁজদের অধিকার সম্পর্কে পরামর্শ নিন।'
        ]
    },
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
    const [selectedGuide, setSelectedGuide] = useState(null);

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
                    <p className="text-white/70 text-sm">আপনার যেকোনো প্রশ্নের উত্তর খুঁজুন অথবা আমাদের সাথে সরাসরি যোগাযোগ করুন</p>
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
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {GUIDES.map(g => (
                            <button
                                onClick={() => setSelectedGuide(g)}
                                key={g.title}
                                className="bg-white rounded-[24px] p-6 border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group flex items-center gap-5 text-left"
                            >
                                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0 ${g.color} transition-transform group-hover:scale-110`}>
                                    <g.icon size={24} />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="font-extrabold text-gray-900 text-base mb-1">{g.title}</p>
                                    <p className="text-sm text-gray-400 font-medium">{g.desc}</p>
                                </div>
                                <ChevronRight size={20} className="text-gray-300 group-hover:text-primary transition-colors flex-shrink-0" />
                            </button>
                        ))}
                    </div>
                </div>

                {/* Detailed Guide Modal */}
                {selectedGuide && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                        <div className="bg-white rounded-[32px] w-full max-w-lg overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-300">
                            <div className={`p-8 ${selectedGuide.headerBg} flex items-center justify-between`}>
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-white">
                                        <selectedGuide.icon size={24} />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-black text-white">{selectedGuide.title}</h3>
                                        <p className="text-white/80 text-xs font-bold uppercase tracking-wider">নির্দেশিকা</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setSelectedGuide(null)}
                                    className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
                                >
                                    <X size={20} />
                                </button>
                            </div>
                            <div className="p-8">
                                <ul className="space-y-4">
                                    {selectedGuide.details.map((step, i) => (
                                        <li key={i} className="flex gap-4 group">
                                            <div className="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-black flex-shrink-0 group-hover:bg-primary group-hover:text-white transition-colors">
                                                {i + 1}
                                            </div>
                                            <p className="text-sm text-gray-600 leading-relaxed font-medium">
                                                {step}
                                            </p>
                                        </li>
                                    ))}
                                </ul>
                                <button
                                    onClick={() => setSelectedGuide(null)}
                                    className={`w-full mt-8 ${selectedGuide.headerBg} text-white py-4 rounded-2xl font-bold text-sm hover:opacity-90 transition-all shadow-lg active:scale-95`}
                                >
                                    ঠিক আছে
                                </button>
                            </div>
                        </div>
                    </div>
                )}

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
                    <p className="text-sm text-gray-400 mb-6">সবচেয়ে বেশি জিজ্ঞাসিত প্রশ্নগুলো</p>
                    <div className="space-y-3">
                        {FAQS.map((f, i) => <FaqItem key={i} q={f.q} a={f.a} />)}
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