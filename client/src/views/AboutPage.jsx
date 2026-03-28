import { Shield, Users, Zap, Heart, CheckCircle, MapPin } from 'lucide-react';
import { Link } from 'react-router-dom';

const TEAM = [
    { name: 'হুমায়রা বিনতে কাজল' },
    { name: 'অস্মিতা গুহ ঠাকুরতা' },
    { name: 'মৌফি আল দৌশারি' },
    { name: 'জামিলা মোহাম্মদ' },
];

const FEATURES = [
    { icon: Zap, title: 'AI-চালিত মিলকরণ', desc: 'উন্নত ফেস রিকগনিশন প্রযুক্তি ব্যবহার করে নিখোঁজ ও উদ্ধার হওয়া ব্যক্তিদের মধ্যে মিল খোঁজা হয়।', color: 'text-secondary bg-secondary/10' },
    { icon: Shield, title: 'নির্ভরযোগ্য যাচাইকরণ', desc: 'প্রতিটি রিপোর্ট পুলিশ ও এনজিও অংশীদারদের মাধ্যমে যাচাই করা হয়।', color: 'text-primary bg-primary/10' },
    { icon: Users, title: 'কমিউনিটি-চালিত', desc: 'সাধারণ মানুষ, পুলিশ, হাসপাতাল এবং এনজিও একসাথে কাজ করে।', color: 'text-accent-teal bg-accent-teal/10' },
    { icon: MapPin, title: 'আঞ্চলিক কভারেজ', desc: 'বাংলাদেশের সকল ৬৪টি জেলায় সক্রিয় নেটওয়ার্ক।', color: 'text-purple-600 bg-purple-100' },
    { icon: Heart, title: 'মানবিক সেবা', desc: 'পরিবারকে তাদের প্রিয়জনের সাথে পুনর্মিলিত করাই আমাদের মূল লক্ষ্য।', color: 'text-accent-red bg-accent-red/10' },
    { icon: CheckCircle, title: 'SMS আলার্ট', desc: 'আপনার জেলায় নতুন রিপোর্ট হলে সরাসরি মোবাইলে বিজ্ঞপ্তি পাবেন।', color: 'text-green-600 bg-green-100' },
];

const AboutPage = () => (
    <div className="min-h-screen bg-background">
        {/* Hero Section */}
        <div className="bg-primary text-white py-20 px-4 relative overflow-hidden">
            <div className="absolute inset-0 opacity-10">
                <div className="absolute top-10 left-10 w-64 h-64 bg-white rounded-full -translate-x-1/2 -translate-y-1/2" />
                <div className="absolute bottom-0 right-0 w-96 h-96 bg-secondary rounded-full translate-x-1/3 translate-y-1/3" />
            </div>
            <div className="max-w-4xl mx-auto text-center relative z-10">
                <h1 className="text-4xl md:text-5xl font-black mb-4">আমাদের সম্পর্কে</h1>
                <p className="text-lg text-white/80 max-w-2xl mx-auto leading-relaxed">
                    আপনখোঁজ হলো বাংলাদেশের প্রথম AI-চালিত নিখোঁজ ব্যক্তি অনুসন্ধান প্ল্যাটফর্ম
                    যা পরিবার, পুলিশ, হাসপাতাল ও এনজিওকে একত্রিত করে।
                </p>
            </div>
        </div>

        <div className="max-w-6xl mx-auto px-4 py-14">
            {/* Mission */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center mb-20">
                <div>
                    <h2 className="text-3xl font-black text-gray-800 mb-4">আমাদের লক্ষ্য</h2>
                    <p className="text-gray-600 leading-relaxed mb-4">
                        বাংলাদেশে প্রতি বছর হাজার হাজার মানুষ নিখোঁজ হন। ছড়িয়ে-ছিটিয়ে থাকা তথ্য এবং কেন্দ্রীয় রেকর্ডের অভাবে
                        পরিবারগুলো প্রিয়জনকে খুঁজে পেতে চরম কষ্ট পোহায়।
                    </p>
                    <p className="text-gray-600 leading-relaxed mb-6">
                        আপনখোঁজ এই সমস্যার সমাধান করতে এসেছে — একটি কেন্দ্রীয় ডিজিটাল প্ল্যাটফর্মের মাধ্যমে যেখানে
                        সকলে মিলে কাজ করতে পারবেন।
                    </p>
                    <Link to="/contact" className="inline-flex items-center gap-2 bg-primary text-white px-6 py-3 rounded-xl font-medium hover:bg-primary-dark transition-colors">
                        আমাদের সাথে যোগাযোগ করুন →
                    </Link>
                </div>
                <div className="grid grid-cols-2 gap-4">
                    {[['১,২০০+', 'রিপোর্ট জমা'], ['৮৫০+', 'সফল পুনর্মিলন'], ['৬৪', 'জেলা কভারেজ'], ['৩০+', 'NGO অংশীদার']].map(([v, l]) => (
                        <div key={l} className="bg-white rounded-2xl shadow-sm p-6 text-center border border-gray-100">
                            <p className="text-3xl font-black text-primary mb-1">{v}</p>
                            <p className="text-sm text-gray-500">{l}</p>
                        </div>
                    ))}
                </div>
            </div>

            {/* Features */}
            <div className="mb-12">
                <h2 className="text-3xl font-black text-gray-800 text-center mb-2">আমরা যা করি</h2>
                <p className="text-center text-gray-500 mb-10 text-sm">প্রযুক্তি ও মানবিক স্পর্শের মাধ্যমে পুনর্মিলন</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {FEATURES.map(f => (
                        <div key={f.title} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-4 ${f.color}`}>
                                <f.icon size={20} />
                            </div>
                            <h3 className="font-bold text-gray-800 mb-2">{f.title}</h3>
                            <p className="text-sm text-gray-500 leading-relaxed">{f.desc}</p>
                        </div>
                    ))}
                </div>
            </div>

            {/* Team */}
            <div>
                <h2 className="text-3xl font-black text-gray-800 text-center mb-2">আমাদের দল</h2>
        
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                    {TEAM.map(m => (
                        <div key={m.name} className="text-center">
                            <div className="w-20 h-20 rounded-full mx-auto mb-3 bg-gray-200 flex items-center justify-center shadow-sm">
                                <svg viewBox="0 0 24 24" className="w-11 h-11 text-gray-400" fill="currentColor">
                                    <path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z" />
                                </svg>
                            </div>
                            <p className="font-bold text-gray-800 text-sm">{m.name}</p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    </div>
);

export default AboutPage;