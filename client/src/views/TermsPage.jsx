import { FileText, CheckCircle, XCircle, AlertTriangle, Mail, Scale } from 'lucide-react';
import { Link } from 'react-router-dom';

const TERMS = [
    {
        icon: CheckCircle,
        title: 'গ্রহণযোগ্য ব্যবহার',
        color: 'text-accent-teal bg-accent-teal/10',
        content: [
            'শুধুমাত্র প্রকৃত নিখোঁজ বা উদ্ধার হওয়া ব্যক্তির তথ্য জমা দিন।',
            'সঠিক ও যাচাইযোগ্য তথ্য প্রদান করুন।',
            'উদ্ধারকৃত ব্যক্তির পরিচয় নিশ্চিত হওয়ার পর দ্রুত আমাদের জানান।',
            'অন্য ব্যবহারকারীদের সাথে সম্মান ও সহযোগিতার মনোভাবে যোগাযোগ করুন।',
        ],
    },
    {
        icon: XCircle,
        title: 'নিষিদ্ধ কার্যক্রম',
        color: 'text-accent-red bg-accent-red/10',
        content: [
            'মিথ্যা বা বানোয়াট নিখোঁজ রিপোর্ট তৈরি করা।',
            'অন্যের ব্যক্তিগত তথ্য বা ছবি অনুমতি ছাড়া আপলোড করা।',
            'প্ল্যাটফর্মকে প্রতারণা, হয়রানি বা যেকোনো অবৈধ কাজে ব্যবহার করা।',
            'স্বয়ংক্রিয় বট বা স্ক্রিপট দিয়ে ডেটা সংগ্রহ বা স্প্যাম করা।',
            'অন্য ব্যবহারকারীর অ্যাকাউন্ট হ্যাক বা অনধিকার প্রবেশের চেষ্টা।',
        ],
    },
    {
        icon: FileText,
        title: 'কনটেন্ট নীতি',
        color: 'text-primary bg-primary/10',
        content: [
            'আপলোড করা ছবি স্পষ্ট, সাম্প্রতিক এবং প্রাসঙ্গিক হতে হবে।',
            'রিপোর্টে কোনো আপত্তিকর, হিংসাত্মক বা বৈষম্যমূলক ভাষা ব্যবহার নিষেধ।',
            'আমাদের দল যেকোনো সময় নিয়ম লঙ্ঘনকারী কনটেন্ট মুছে ফেলার অধিকার রাখে।',
            'মিথ্যা রিপোর্টের ক্ষেত্রে আইনি ব্যবস্থা নেওয়া হতে পারে।',
        ],
    },
    {
        icon: Scale,
        title: 'আইনি দায়বদ্ধতা',
        color: 'text-purple-600 bg-purple-100',
        content: [
            'আপনার প্রদান করা তথ্যের সত্যতার জন্য আপনি নিজে দায়ী।',
            'প্ল্যাটফর্মের মাধ্যমে পাওয়া যেকোনো তথ্য যাচাই না করে সম্পূর্ণ বিশ্বাস করা উচিত নয়।',
            'আপনখোঁজ কোনো পুলিশি তদন্তের বিকল্প নয়; সবসময় কর্তৃপক্ষকে অবহিত রাখুন।',
            'তৃতীয় পক্ষের ওয়েবসাইট বা সেবার জন্য আমরা দায়ী নই।',
        ],
    },
    {
        icon: AlertTriangle,
        title: 'অ্যাকাউন্ট স্থগিত ও বাতিল',
        color: 'text-orange-500 bg-orange-100',
        content: [
            'নিয়ম লঙ্ঘনের ক্ষেত্রে সতর্কতা ছাড়াই অ্যাকাউন্ট স্থগিত করা হতে পারে।',
            'পুনরাবৃত্তিমূলক লঙ্ঘনে স্থায়ীভাবে অ্যাকাউন্ট বাতিল করা হবে।',
            'অ্যাকাউন্ট বাতিলের পর সংশ্লিষ্ট সকল রিপোর্ট মুছে ফেলা হবে।',
            'বাতিলের সিদ্ধান্তের বিরুদ্ধে আপিলের সুযোগ একবার দেওয়া হবে।',
        ],
    },
];

export default function TermsPage() {
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
                            <FileText size={20} />
                        </div>
                        <h1 className="text-4xl font-black">ব্যবহারের শর্তাবলী</h1>
                    </div>
                    <p className="text-white/70 text-sm leading-relaxed">
                        সর্বশেষ আপডেট: ১ মার্চ, ২০২৬ · আপনখোঁজ ব্যবহার করলে আপনি এই শর্তাবলীতে সম্মত বলে গণ্য হবেন।
                        দয়া করে মনোযোগ দিয়ে পড়ুন।
                    </p>
                </div>
            </div>

            <div className="max-w-3xl mx-auto px-4 py-12 space-y-6">
                {/* Intro */}
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                    <p className="text-sm text-gray-600 leading-relaxed">
                        আপনখোঁজ (Aponkhoj) একটি মানবিক উদ্যোগ যা নিখোঁজ ব্যক্তিদের পরিবারের সাথে পুনর্মিলনে সহায়তা
                        করে। প্ল্যাটফর্মটি ব্যবহার করে আপনি নিম্নলিখিত শর্তগুলো মেনে চলতে সম্মত হচ্ছেন।
                        এই শর্তাবলী বাংলাদেশের প্রযোজ্য আইন অনুযায়ী পরিচালিত।
                    </p>
                </div>

                {TERMS.map(t => (
                    <div key={t.title} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                        <div className="flex items-center gap-3 p-5 border-b border-gray-50">
                            <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${t.color}`}>
                                <t.icon size={17} />
                            </div>
                            <h2 className="font-black text-gray-800">{t.title}</h2>
                        </div>
                        <ul className="p-5 space-y-3">
                            {t.content.map((c, i) => (
                                <li key={i} className="flex items-start gap-3 text-sm text-gray-600 leading-relaxed">
                                    <span className="w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0 mt-2" />
                                    {c}
                                </li>
                            ))}
                        </ul>
                    </div>
                ))}

                {/* Changes */}
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                    <h2 className="font-black text-gray-800 mb-3">শর্তাবলী পরিবর্তন</h2>
                    <p className="text-sm text-gray-600 leading-relaxed">
                        আমরা যেকোনো সময় এই শর্তাবলী আপডেট করতে পারি। বড় পরিবর্তনের ক্ষেত্রে
                        ব্যবহারকারীদের SMS ও ইমেইলে জানানো হবে। পরিবর্তনের পরেও প্ল্যাটফর্ম
                        ব্যবহার অব্যাহত রাখলে নতুন শর্তে সম্মতি দেওয়া হয়েছে বলে বিবেচিত হবে।
                    </p>
                </div>

                {/* CTA */}
                <div className="bg-primary rounded-2xl p-6 text-white">
                    <h2 className="font-black text-lg mb-2">কোনো প্রশ্ন আছে?</h2>
                    <p className="text-white/70 text-sm mb-4">শর্তাবলী সম্পর্কে বিস্তারিত জানতে আমাদের সাথে যোগাযোগ করুন।</p>
                    <div className="flex flex-wrap gap-3">
                        <Link to="/contact" className="flex items-center gap-2 bg-secondary text-white px-5 py-2 rounded-xl text-sm font-bold hover:opacity-90 transition-opacity">
                            <Mail size={14} /> যোগাযোগ করুন
                        </Link>
                        <Link to="/privacy" className="flex items-center gap-2 bg-white/10 border border-white/20 text-white px-5 py-2 rounded-xl text-sm font-bold hover:bg-white/20 transition-colors">
                            গোপনীয়তা নীতি পড়ুন →
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}