import { useState } from 'react';
import { Upload, MapPin, FileText, Zap } from 'lucide-react';

const ReportFoundPage = () => {
    const [photo, setPhoto] = useState(null);
    const [status, setStatus] = useState('healthy');

    return (
        <div className="min-h-screen bg-background py-10 px-4">
            <div className="max-w-2xl mx-auto">
                <div className="mb-8">
                    <h1 className="text-2xl font-bold text-gray-800">উদ্ধারকৃত ব্যক্তির তথ্য যোগ করুন</h1>
                    <p className="text-gray-500 text-sm mt-1">AI ফেস রিকগনিশনের মাধ্যমে মিলিয়ে দেখা হবে</p>
                </div>

                <div className="bg-white rounded-2xl shadow-sm p-6 space-y-6">
                    {/* AI Photo Upload */}
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <h2 className="text-base font-semibold text-gray-700">ছবি আপলোড করুন</h2>
                            <span className="bg-accent-teal/10 text-accent-teal text-xs px-2 py-0.5 rounded-full flex items-center gap-1"><Zap size={10} /> AI</span>
                        </div>
                        <p className="text-xs text-gray-400 mb-3">ছবি আপলোড করলে AI স্বয়ংক্রিয়ভাবে মিল খুঁজবে</p>
                        <label className="border-2 border-dashed border-accent-teal/40 rounded-xl p-8 flex flex-col items-center justify-center cursor-pointer hover:border-accent-teal/60 transition-colors bg-accent-teal/5">
                            <input type="file" accept="image/*" className="hidden" onChange={e => setPhoto(e.target.files[0])} />
                            {photo ? (
                                <p className="text-sm text-accent-teal font-medium">{photo.name}</p>
                            ) : (
                                <>
                                    <Upload size={32} className="text-accent-teal/40 mb-2" />
                                    <p className="text-sm text-gray-500">ছবি টেনে আনুন বা ক্লিক করুন</p>
                                    <p className="text-xs text-gray-400 mt-1">স্পষ্ট মুখের ছবি দিলে AI ভালো ফলাফল দেবে</p>
                                </>
                            )}
                        </label>
                    </div>

                    {/* Health Status */}
                    <div>
                        <h2 className="text-base font-semibold text-gray-700 mb-3">স্বাস্থ্য অবস্থা</h2>
                        <div className="flex gap-3">
                            {['healthy', 'sick', 'unknown'].map(s => (
                                <button
                                    key={s}
                                    onClick={() => setStatus(s)}
                                    className={`flex-1 py-2 rounded-lg border text-sm font-medium transition-colors ${status === s ? 'border-accent-teal bg-accent-teal/10 text-accent-teal' : 'border-gray-200 text-gray-500'}`}
                                >
                                    {s === 'healthy' ? 'সুস্থ' : s === 'sick' ? 'অসুস্থ' : 'অজানা'}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Location */}
                    <div>
                        <h2 className="text-base font-semibold text-gray-700 mb-3 flex items-center gap-2"><MapPin size={16} /> উদ্ধারের স্থান</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs text-gray-500 mb-1">তারিখ</label>
                                <input type="date" className="w-full border border-gray-200 rounded-lg p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
                            </div>
                            <div>
                                <label className="block text-xs text-gray-500 mb-1">জেলা</label>
                                <select className="w-full border border-gray-200 rounded-lg p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 bg-white">
                                    <option>ঢাকা</option>
                                    <option>চট্টগ্রাম</option>
                                    <option>রাজশাহী</option>
                                </select>
                            </div>
                            <div className="md:col-span-2">
                                <label className="block text-xs text-gray-500 mb-1">বিস্তারিত ঠিকানা</label>
                                <input type="text" placeholder="এলাকা / থানা / স্থানের নাম" className="w-full border border-gray-200 rounded-lg p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
                            </div>
                        </div>
                    </div>

                    {/* Description */}
                    <div>
                        <h2 className="text-base font-semibold text-gray-700 mb-3 flex items-center gap-2"><FileText size={16} /> বিবরণ</h2>
                        <textarea rows={3} placeholder="উদ্ধারকৃত ব্যক্তি সম্পর্কে যা জানেন..." className="w-full border border-gray-200 rounded-lg p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none" />
                    </div>

                    {/* Contact */}
                    <div>
                        <h2 className="text-base font-semibold text-gray-700 mb-3">যোগাযোগের তথ্য</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs text-gray-500 mb-1">প্রতিষ্ঠানের নাম</label>
                                <input type="text" className="w-full border border-gray-200 rounded-lg p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
                            </div>
                            <div>
                                <label className="block text-xs text-gray-500 mb-1">ফোন নম্বর</label>
                                <input type="tel" placeholder="01XXXXXXXXX" className="w-full border border-gray-200 rounded-lg p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
                            </div>
                        </div>
                    </div>

                    <button className="w-full bg-accent-teal hover:bg-teal-800 text-white py-3 rounded-xl font-medium transition-colors">
                        তথ্য জমা দিন ও AI ম্যাচ খুঁজুন
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ReportFoundPage;