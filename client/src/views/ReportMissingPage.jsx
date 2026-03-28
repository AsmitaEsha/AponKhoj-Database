import { useState } from 'react';
import { Upload, User, MapPin, Calendar, FileText } from 'lucide-react';

const ReportMissingPage = () => {
    const [photo, setPhoto] = useState(null);

    return (
        <div className="min-h-screen bg-background py-10 px-4">
            <div className="max-w-2xl mx-auto">
                <div className="mb-8">
                    <h1 className="text-2xl font-bold text-gray-800">নিখোঁজ ব্যক্তির রিপোর্ট করুন</h1>
                    <p className="text-gray-500 text-sm mt-1">নিচের ফর্মটি পূরণ করে রিপোর্ট জমা দিন</p>
                </div>

                <div className="bg-white rounded-2xl shadow-sm p-6 space-y-6">
                    {/* Photo Upload */}
                    <div>
                        <h2 className="text-base font-semibold text-gray-700 mb-3 flex items-center gap-2"><Upload size={16} /> ছবি আপলোড করুন</h2>
                        <label className="border-2 border-dashed border-gray-200 rounded-xl p-8 flex flex-col items-center justify-center cursor-pointer hover:border-primary/50 transition-colors">
                            <input type="file" accept="image/*" className="hidden" onChange={e => setPhoto(e.target.files[0])} />
                            {photo ? (
                                <div className="text-center">
                                    <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-2">
                                        <User size={40} className="text-primary" />
                                    </div>
                                    <p className="text-sm text-primary font-medium">{photo.name}</p>
                                </div>
                            ) : (
                                <>
                                    <Upload size={32} className="text-gray-300 mb-2" />
                                    <p className="text-sm text-gray-500">ছবি টেনে আনুন বা ক্লিক করুন</p>
                                    <p className="text-xs text-gray-400 mt-1">JPG, PNG (সর্বোচ্চ 5MB)</p>
                                </>
                            )}
                        </label>
                    </div>

                    {/* Personal Info */}
                    <div>
                        <h2 className="text-base font-semibold text-gray-700 mb-3 flex items-center gap-2"><User size={16} /> ব্যক্তিগত তথ্য</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs text-gray-500 mb-1">নাম</label>
                                <input type="text" placeholder="পূর্ণ নাম" className="w-full border border-gray-200 rounded-lg p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
                            </div>
                            <div>
                                <label className="block text-xs text-gray-500 mb-1">বয়স</label>
                                <input type="number" placeholder="বয়স" className="w-full border border-gray-200 rounded-lg p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
                            </div>
                            <div>
                                <label className="block text-xs text-gray-500 mb-1">লিঙ্গ</label>
                                <select className="w-full border border-gray-200 rounded-lg p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 bg-white">
                                    <option>পুরুষ</option>
                                    <option>নারী</option>
                                    <option>অন্যান্য</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs text-gray-500 mb-1">উচ্চতা</label>
                                <input type="text" placeholder="যেমন: ৫ ফুট ৭ ইঞ্চি" className="w-full border border-gray-200 rounded-lg p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
                            </div>
                        </div>
                    </div>

                    {/* Last Seen */}
                    <div>
                        <h2 className="text-base font-semibold text-gray-700 mb-3 flex items-center gap-2"><MapPin size={16} /> শেষ দেখা যাওয়ার তথ্য</h2>
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
                        <div>
                            <label className="block text-xs text-gray-500 mb-1">পোশাকের বিবরণ</label>
                            <input type="text" placeholder="হারিয়ে যাওয়ার সময় কী পোশাক পরেছিলেন" className="w-full border border-gray-200 rounded-lg p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 mb-3" />
                        </div>
                        <div>
                            <label className="block text-xs text-gray-500 mb-1">অতিরিক্ত তথ্য</label>
                            <textarea rows={3} placeholder="অন্য কোনো গুরুত্বপূর্ণ তথ্য..." className="w-full border border-gray-200 rounded-lg p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none" />
                        </div>
                    </div>

                    {/* Contact */}
                    <div>
                        <h2 className="text-base font-semibold text-gray-700 mb-3">যোগাযোগের তথ্য</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs text-gray-500 mb-1">আপনার নাম</label>
                                <input type="text" placeholder="রিপোর্টকারীর নাম" className="w-full border border-gray-200 rounded-lg p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
                            </div>
                            <div>
                                <label className="block text-xs text-gray-500 mb-1">ফোন নম্বর</label>
                                <input type="tel" placeholder="01XXXXXXXXX" className="w-full border border-gray-200 rounded-lg p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
                            </div>
                        </div>
                    </div>

                    <button className="w-full bg-secondary hover:bg-secondary-dark text-white py-3 rounded-xl font-medium transition-colors">
                        রিপোর্ট জমা দিন
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ReportMissingPage;