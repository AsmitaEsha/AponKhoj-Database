import { Scale, Phone, FileText, AlertTriangle, CheckCircle, Shield, BookOpen, Mail } from 'lucide-react';
import { Link } from 'react-router-dom';

const STEPS = [
    { n: '১', title: 'জিডি (GD) করুন', desc: 'নিকটস্থ থানায় সাধারণ ডায়েরি (General Diary) করুন। এটি আইনি রেকর্ডের প্রথম ধাপ এবং যেকোনো তদন্তের ভিত্তি।', icon: FileText },
    { n: '২', title: 'মিসিং পারসন রিপোর্ট', desc: 'পুলিশ সুপারিনটেন্ডেন্ট বা জেলা পুলিশ প্রধানের কাছে আনুষ্ঠানিক নিখোঁজ ব্যক্তির রিপোর্ট করুন।', icon: Shield },
    { n: '৩', title: 'আপনখোঁজে রিপোর্ট', desc: 'ডিজিটাল ডেটাবেজে রিপোর্ট যোগ করুন — AI ম্যাচিং তাৎক্ষণিকভাবে শুরু হবে এবং এলাকায় SMS আলার্ট পাঠানো হবে।', icon: CheckCircle },
    { n: '৪', title: 'আইনজীবীর পরামর্শ', desc: 'প্রয়োজনে জেলা আইনি সহায়তা কমিটি (DLAC) থেকে বিনামূল্যে আইনজীবী পাওয়া যায়।', icon: Scale },
];

const RIGHTS = [
    { title: 'নিখোঁজ রিপোর্টের অধিকার', desc: 'যেকোনো নাগরিক যেকোনো থানায় নিখোঁজ ব্যক্তির জিডি করতে পারবেন — পুলিশ রিপোর্ট নিতে বাধ্য।' },
    { title: 'তদন্ত দাবির অধিকার', desc: 'জিডি করার পর ৭২ ঘণ্টার মধ্যে তদন্তে কোনো অগ্রগতি না হলে ঊর্ধ্বতন কর্মকর্তার কাছে অভিযোগ করুন।' },
    { title: 'বিনামূল্যে আইনি সহায়তা', desc: 'সুবিধাবঞ্চিত পরিবার জেলা আইনি সহায়তা কমিটি (DLAC) থেকে বিনামূল্যে আইনজীবী পাওয়ার অধিকারী।' },
    { title: 'শিশু অধিকার সুরক্ষা', desc: 'নিখোঁজ শিশুর ক্ষেত্রে শিশু অধিকার সংরক্ষণ আইন ২০১৩ অনুযায়ী তদন্ত আরো দ্রুত পরিচালিত হওয়া বাধ্যতামূলক।' },
    { title: 'আদালতের হস্তক্ষেপ', desc: 'পুলিশ যদি রিপোর্ট নিতে অস্বীকার করে তবে সরাসরি ম্যাজিস্ট্রেট আদালতে অভিযোগ দায়ের করা যাবে।' },
    { title: 'মানবাধিকার কমিশন', desc: 'জাতীয় মানবাধিকার কমিশনে অভিযোগ করলে স্বতন্ত্র তদন্তের ব্যবস্থা নেওয়া হয়।' },
];

const HOTLINES = [
    { label: 'জাতীয় জরুরি সেবা', number: '999', icon: '🚨', color: 'bg-accent-red/10 border-accent-red/20 text-accent-red' },
    { label: 'শিশু সহায়তা হেল্পলাইন', number: '1098', icon: '👶', color: 'bg-secondary/10 border-secondary/20 text-secondary' },
    { label: 'মহিলা সহায়তা হেল্পলাইন', number: '10921', icon: '👩', color: 'bg-purple-100 border-purple-200 text-purple-700' },
    { label: 'জাতীয় আইনি সহায়তা', number: '16430', icon: '⚖️', color: 'bg-accent-teal/10 border-accent-teal/20 text-accent-teal' },
    { label: 'দুর্নীতি দমন কমিশন', number: '106', icon: '🏛️', color: 'bg-primary/10 border-primary/20 text-primary' },
    { label: 'মানবাধিকার কমিশন', number: '16108', icon: '🤝', color: 'bg-gray-100 border-gray-200 text-gray-700' },
];

export default function LegalAidPage() {
    return (
        <div className="bg-background min-h-screen">
            {/* Hero */}
            <div className="bg-primary text-white py-14 px-4 relative overflow-hidden">
                <div className="absolute inset-0 opacity-10">
                    <div className="absolute -top-20 -right-20 w-96 h-96 bg-secondary rounded-full" />
                    <div className="absolute -bottom-10 -left-10 w-64 h-64 bg-accent-teal rounded-full" />
                </div>
                <div className="max-w-3xl mx-auto relative z-10">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                            <Scale size={20} />
                        </div>
                        <h1 className="text-4xl font-black">আইনি সহায়তা</h1>
                    </div>
                    <p className="text-white/70 text-sm leading-relaxed">
                        নিখোঁজ মামলায় আপনার আইনি অধিকার, করণীয় পদক্ষেপ এবং কোথায় সাহায্য পাবেন —
                        সব তথ্য এক জায়গায়।
                    </p>
                </div>
            </div>

            <div className="max-w-3xl mx-auto px-4 py-12 space-y-10">

                {/* Emergency Notice */}
                <div className="bg-accent-red/5 border border-accent-red/20 rounded-2xl p-4 flex items-start gap-3">
                    <AlertTriangle size={18} className="text-accent-red flex-shrink-0 mt-0.5" />
                    <div>
                        <p className="font-bold text-accent-red text-sm mb-0.5">জরুরি পরিস্থিতিতে এখনই কল করুন</p>
                        <p className="text-xs text-gray-500">
                            নিখোঁজ হওয়ার সাথে সাথে পুলিশকে জানান —
                            <a href="tel:999" className="font-black text-accent-red ml-1">৯৯৯</a> অথবা
                            <a href="tel:1098" className="font-black text-accent-red ml-1">১০৯৮ (শিশু)</a>
                        </p>
                    </div>
                </div>

                {/* Step-by-Step */}
                <div>
                    <h2 className="text-2xl font-black text-gray-800 mb-2">কী করবেন — ধাপে ধাপে</h2>
                    <p className="text-sm text-gray-400 mb-6">নিখোঁজের পর সঠিক এবং কার্যকর পদক্ষেপ নেওয়া সময়মতো উদ্ধারের সম্ভাবনা বাড়ায়।</p>
                    <div className="space-y-4">
                        {STEPS.map(s => (
                            <div key={s.n} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex items-start gap-4">
                                <div className="w-10 h-10 bg-primary text-white rounded-xl flex items-center justify-center font-black text-base flex-shrink-0">
                                    {s.n}
                                </div>
                                <div>
                                    <div className="flex items-center gap-2 mb-1">
                                        <s.icon size={14} className="text-primary" />
                                        <h3 className="font-bold text-gray-800 text-sm">{s.title}</h3>
                                    </div>
                                    <p className="text-xs text-gray-500 leading-relaxed">{s.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Legal Rights */}
                <div>
                    <h2 className="text-2xl font-black text-gray-800 mb-2">আপনার আইনি অধিকার</h2>
                    <p className="text-sm text-gray-400 mb-6">বাংলাদেশের প্রচলিত আইনে নিখোঁজ মামলায় পরিবারের অধিকারগুলো জানুন।</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {RIGHTS.map(r => (
                            <div key={r.title} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
                                <div className="flex items-start gap-2">
                                    <CheckCircle size={14} className="text-accent-teal flex-shrink-0 mt-0.5" />
                                    <div>
                                        <p className="font-bold text-gray-800 text-sm mb-1">{r.title}</p>
                                        <p className="text-xs text-gray-500 leading-relaxed">{r.desc}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Hotlines */}
                <div>
                    <h2 className="text-2xl font-black text-gray-800 mb-2">জরুরি হেল্পলাইন</h2>
                    <p className="text-sm text-gray-400 mb-6">সংকটে সঠিক নম্বরে কল করুন — সব সেবা ২৪/৭ পাওয়া যায়।</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {HOTLINES.map(h => (
                            <a key={h.label} href={`tel:${h.number}`}
                                className={`flex items-center gap-3 p-4 rounded-2xl border bg-white transition-shadow hover:shadow-md ${h.color}`}>
                                <span className="text-2xl">{h.icon}</span>
                                <div className="flex-1 min-w-0">
                                    <p className="text-xs text-gray-500 mb-0.5">{h.label}</p>
                                    <p className="font-black text-lg">{h.number}</p>
                                </div>
                                <Phone size={14} className="opacity-50 flex-shrink-0" />
                            </a>
                        ))}
                    </div>
                </div>

                {/* Law References */}
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                    <div className="flex items-center gap-2 mb-4">
                        <BookOpen size={16} className="text-primary" />
                        <h2 className="font-black text-gray-800">প্রাসঙ্গিক আইন ও বিধিমালা</h2>
                    </div>
                    <ul className="space-y-2">
                        {[
                            'শিশু অধিকার সংরক্ষণ আইন, ২০১৩',
                            'নারী ও শিশু নির্যাতন দমন আইন, ২০০০ (সংশোধিত ২০০৩)',
                            'মানব পাচার প্রতিরোধ ও দমন আইন, ২০১২',
                            'জাতীয় আইনি সহায়তা প্রদান সংস্থা আইন, ২০০০',
                            'ফৌজদারি কার্যবিধি (CrPC) — ধারা ১৫৪ (FIR) ও ধারা ১৫৫ (GD)',
                        ].map((law, i) => (
                            <li key={i} className="flex items-start gap-3 text-sm text-gray-600 leading-relaxed">
                                <span className="w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0 mt-2" />
                                {law}
                            </li>
                        ))}
                    </ul>
                </div>

                {/* CTA */}
                <div className="bg-primary rounded-2xl p-6 text-white">
                    <h2 className="font-black text-lg mb-2">আরও সহায়তা দরকার?</h2>
                    <p className="text-white/70 text-sm mb-4">আমাদের সহায়তা দল আপনাকে সঠিক পদক্ষেপ নিতে সাহায্য করবে।</p>
                    <div className="flex flex-wrap gap-3">
                        <Link to="/contact" className="flex items-center gap-2 bg-secondary text-white px-5 py-2 rounded-xl text-sm font-bold hover:opacity-90 transition-opacity">
                            <Mail size={14} /> যোগাযোগ করুন
                        </Link>
                        <Link to="/help" className="flex items-center gap-2 bg-white/10 border border-white/20 text-white px-5 py-2 rounded-xl text-sm font-bold hover:bg-white/20 transition-colors">
                            সহায়তা কেন্দ্র →
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}