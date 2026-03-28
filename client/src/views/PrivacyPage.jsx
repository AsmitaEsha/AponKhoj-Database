import { Shield, Lock, Eye, Database, UserCheck, Mail } from 'lucide-react';
import { Link } from 'react-router-dom';

const SECTIONS = [
    {
        icon: Database,
        title: 'আমরা কী তথ্য সংগ্রহ করি',
        color: 'text-primary bg-primary/10',
        content: [
            'রেজিস্ট্রেশনের সময় নাম, মোবাইল নম্বর এবং ইমেইল ঠিকানা।',
            'নিখোঁজ বা উদ্ধার হওয়া ব্যক্তির তথ্য, ছবি ও অবস্থান।',
            'AI ফেস রিকগনিশনের জন্য আপলোড করা ছবির ডেটা।',
            'প্ল্যাটফর্ম ব্যবহারের লগ ও ব্রাউজার তথ্য (স্বয়ংক্রিয়ভাবে)।',
        ],
    },
    {
        icon: Eye,
        title: 'তথ্য কীভাবে ব্যবহার হয়',
        color: 'text-secondary bg-secondary/10',
        content: [
            'নিখোঁজ ও উদ্ধার হওয়া ব্যক্তির মধ্যে AI-চালিত ফেস ম্যাচিং।',
            'নতুন রিপোর্টের SMS ও ইমেইল আলার্ট পাঠানো।',
            'পুলিশ ও এনজিও অংশীদারদের সাথে রিপোর্ট যাচাই।',
            'প্ল্যাটফর্মের কার্যকারিতা উন্নত করতে পরিসংখ্যান বিশ্লেষণ।',
        ],
    },
    {
        icon: Lock,
        title: 'তথ্য সুরক্ষা',
        color: 'text-accent-teal bg-accent-teal/10',
        content: [
            'সকল তথ্য SSL/TLS এনক্রিপশনের মাধ্যমে স্থানান্তরিত হয়।',
            'ডেটাবেজে সংরক্ষিত তথ্য AES-256 এনক্রিপশনে সুরক্ষিত।',
            'ছবি শুধুমাত্র AI ম্যাচিংয়ের জন্য ব্যবহার হয়, বিজ্ঞাপনে নয়।',
            'নিয়মিত সিকিউরিটি অডিট ও পেনিট্রেশন টেস্ট পরিচালিত হয়।',
        ],
    },
    {
        icon: UserCheck,
        title: 'তৃতীয় পক্ষের সাথে তথ্য ভাগাভাগি',
        color: 'text-purple-600 bg-purple-100',
        content: [
            'আপনার ব্যক্তিগত তথ্য কোনো বিজ্ঞাপনদাতার সাথে শেয়ার করা হয় না।',
            'সরকারি কর্তৃপক্ষের আইনি অনুরোধে প্রাসঙ্গিক তথ্য প্রদান করা হতে পারে।',
            'যাচাইকৃত NGO ও পুলিশ অংশীদার শুধুমাত্র রিপোর্ট-সম্পর্কিত তথ্য দেখতে পারেন।',
            'আমরা কখনো ব্যবহারকারীর তথ্য বিক্রি করি না।',
        ],
    },
    {
        icon: Shield,
        title: 'আপনার অধিকার',
        color: 'text-orange-500 bg-orange-100',
        content: [
            'আপনার অ্যাকাউন্টের তথ্য যেকোনো সময় দেখা ও সম্পাদনার অধিকার।',
            'যেকোনো রিপোর্ট মুছে ফেলার অধিকার (পুলিশ মামলা চলমান না থাকলে)।',
            'SMS ও ইমেইল আলার্ট থেকে সদস্যপদ বাতিলের অধিকার।',
            'আমাদের কাছে জমা থাকা আপনার সকল তথ্যের কপি পাওয়ার অধিকার।',
        ],
    },
];

export default function PrivacyPage() {
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
                            <Lock size={20} />
                        </div>
                        <h1 className="text-4xl font-black">গোপনীয়তা নীতি</h1>
                    </div>
                    <p className="text-white/70 text-sm leading-relaxed">
                        সর্বশেষ আপডেট: ১ মার্চ, ২০২৬ · আপনার গোপনীয়তা আমাদের কাছে সর্বোচ্চ অগ্রাধিকার।
                        এই নীতিটি পড়ে জানুন আমরা আপনার তথ্য কীভাবে সংগ্রহ, ব্যবহার ও সুরক্ষা করি।
                    </p>
                </div>
            </div>

            <div className="max-w-3xl mx-auto px-4 py-12 space-y-6">
                {SECTIONS.map(s => (
                    <div key={s.title} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                        <div className="flex items-center gap-3 p-5 border-b border-gray-50">
                            <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${s.color}`}>
                                <s.icon size={17} />
                            </div>
                            <h2 className="font-black text-gray-800">{s.title}</h2>
                        </div>
                        <ul className="p-5 space-y-3">
                            {s.content.map((c, i) => (
                                <li key={i} className="flex items-start gap-3 text-sm text-gray-600 leading-relaxed">
                                    <span className="w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0 mt-2" />
                                    {c}
                                </li>
                            ))}
                        </ul>
                    </div>
                ))}

                {/* Cookies */}
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                    <h2 className="font-black text-gray-800 mb-3">কুকিজ নীতি</h2>
                    <p className="text-sm text-gray-600 leading-relaxed mb-3">
                        আমরা লগইন সেশন ও ব্যবহারকারীর পছন্দ মনে রাখতে প্রয়োজনীয় কুকিজ ব্যবহার করি।
                        বিশ্লেষণমূলক কুকিজ ব্যবহারকারীর অনুমতির ভিত্তিতে সক্রিয় হয়।
                    </p>
                    <p className="text-sm text-gray-600 leading-relaxed">
                        ব্রাউজারের সেটিংস থেকে যেকোনো সময় কুকিজ বন্ধ করা যাবে, তবে কিছু ফিচার
                        সীমিত হতে পারে।
                    </p>
                </div>

                {/* Contact */}
                <div className="bg-primary rounded-2xl p-6 text-white">
                    <h2 className="font-black text-lg mb-2">প্রশ্ন আছে?</h2>
                    <p className="text-white/70 text-sm mb-4">গোপনীয়তা সংক্রান্ত যেকোনো জিজ্ঞাসায় আমাদের সাথে যোগাযোগ করুন।</p>
                    <div className="flex flex-wrap gap-3">
                        <Link to="/contact" className="flex items-center gap-2 bg-secondary text-white px-5 py-2 rounded-xl text-sm font-bold hover:opacity-90 transition-opacity">
                            <Mail size={14} /> যোগাযোগ করুন
                        </Link>
                        <Link to="/terms" className="flex items-center gap-2 bg-white/10 border border-white/20 text-white px-5 py-2 rounded-xl text-sm font-bold hover:bg-white/20 transition-colors">
                            শর্তাবলী পড়ুন →
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}