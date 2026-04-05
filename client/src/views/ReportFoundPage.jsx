import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Upload, MapPin, FileText, Zap, Loader2, User } from 'lucide-react';
import axios from 'axios';
import { toast } from 'react-hot-toast';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const ReportFoundPage = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [photo, setPhoto] = useState(null);
    const [preview, setPreview] = useState(null);
    const [matchResult, setMatchResult] = useState(null); // AI match result
    const [form, setForm] = useState({
        name: 'অজানা ব্যক্তি',
        age: '',
        gender: 'male',
        height: '',
        foundDate: '',
        district: 'ঢাকা',
        address: '',
        clothingDescription: '',
        additionalInfo: '',
        contactPersonName: '',
        contactPhone: ''
    });

    const handleChange = e => setForm(p => ({ ...p, [e.target.name]: e.target.value }));
    const handleFileChange = e => {
        const file = e.target.files[0];
        if (file) {
            setPhoto(file);
            setPreview(URL.createObjectURL(file));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const token = localStorage.getItem('aponkhoj_token');
        if (!token) {
            toast.error("অনুগ্রহ করে লগইন করুন");
            navigate('/login');
            return;
        }

        setLoading(true);
        const data = new FormData();
        Object.keys(form).forEach(key => data.append(key, form[key]));
        if (photo) data.append('photo', photo);

        try {
            const resp = await axios.post(`${API_URL}/found-reports`, data, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data'
                }
            });

            if (resp.data.success) {
                const aiMatch = resp.data.aiMatch;

                if (aiMatch?.matched) {
                    // Show match popup
                    setMatchResult(aiMatch);
                } else {
                    // No match — show toast and go to dashboard
                    toast('কোনো মিল পাওয়া যায়নি। রিপোর্টটি অ্যাডমিনের কাছে পর্যালোচনার জন্য পাঠানো হয়েছে।', {
                        icon: 'ℹ️',
                        duration: 5000,
                    });
                    navigate('/dashboard');
                }
            }
        } catch (err) {
            console.error("Submission error", err);
            toast.error(err.response?.data?.message || "তথ্য জমা দিতে সমস্যা হয়েছে");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-background py-10 px-4">
            <div className="max-w-2xl mx-auto">
                <div className="mb-8 text-center md:text-left">
                    <h1 className="text-2xl font-bold text-gray-800">উদ্ধারকৃত ব্যক্তির তথ্য দিন</h1>
                    <p className="text-gray-500 text-sm mt-1">আপনার দেওয়া তথ্য কোনো পরিবারের মুখে হাসি ফোটাতে পারে</p>
                </div>

                <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 md:p-8">
                    <form onSubmit={handleSubmit} className="space-y-8">
                        {/* Photo Upload */}
                        <div>
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-base font-bold text-gray-800 flex items-center gap-2">
                                    <span className="p-1.5 bg-teal-50 text-teal-600 rounded-lg"><Upload size={16} /></span>
                                    ছবি আপলোড করুন
                                </h2>
                                <span className="bg-teal-500 text-white text-[10px] font-black px-2 py-1 rounded-full flex items-center gap-1 uppercase tracking-wider">
                                    <Zap size={10} fill="currentColor" /> AI Scanning
                                </span>
                            </div>

                            <label className="group relative border-2 border-dashed border-teal-100 rounded-2xl p-8 flex flex-col items-center justify-center cursor-pointer hover:border-teal-400 hover:bg-teal-50/50 transition-all">
                                <input type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
                                {preview ? (
                                    <div className="text-center">
                                        <img src={preview} alt="Preview" className="w-40 h-40 object-cover rounded-xl shadow-md border-4 border-white mb-3" />
                                        <p className="text-sm text-teal-600 font-bold">{photo.name}</p>
                                    </div>
                                ) : (
                                    <div className="text-center text-teal-800/40">
                                        <div className="w-16 h-16 bg-teal-50 rounded-2xl flex items-center justify-center mx-auto mb-3 group-hover:rotate-12 transition-transform">
                                            <Upload size={32} />
                                        </div>
                                        <p className="text-sm font-bold">স্পষ্ট ফেসিয়াল ছবি দিন</p>
                                        <p className="text-xs mt-1">AI স্বয়ংক্রিয়ভাবে মিল খুঁজবে</p>
                                    </div>
                                )}
                            </label>
                        </div>

                        {/* Basic Info */}
                        <div className="space-y-4">
                            <h2 className="text-base font-bold text-gray-800 mb-4 flex items-center gap-2">
                                <span className="p-1.5 bg-blue-50 text-blue-500 rounded-lg"><User size={16} /></span>
                                ব্যক্তির তথ্য (যদি জানা থাকে)
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-gray-500 ml-1">নাম (জানা না থাকলে 'অজানা')</label>
                                    <input name="name" value={form.name} onChange={handleChange} required type="text" placeholder="নাম" className="w-full border border-gray-100 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 bg-gray-50/50" />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-gray-500 ml-1">আনুমানিক বয়স</label>
                                    <input name="age" value={form.age} onChange={handleChange} type="number" placeholder="বয়স" className="w-full border border-gray-100 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 bg-gray-50/50" />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-gray-500 ml-1">লিঙ্গ</label>
                                    <select name="gender" value={form.gender} onChange={handleChange} className="w-full border border-gray-100 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 bg-white">
                                        <option value="male">পুরুষ</option>
                                        <option value="female">নারী</option>
                                        <option value="other">অন্যান্য</option>
                                    </select>
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-gray-500 ml-1">উচ্চতা (আনুমানিক)</label>
                                    <input name="height" value={form.height} onChange={handleChange} type="text" placeholder="যেমন: ৪ ফুট" className="w-full border border-gray-100 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 bg-gray-50/50" />
                                </div>
                            </div>
                        </div>

                        {/* Location */}
                        <div className="space-y-4">
                            <h2 className="text-base font-bold text-gray-800 mb-4 flex items-center gap-2">
                                <span className="p-1.5 bg-amber-50 text-amber-500 rounded-lg"><MapPin size={16} /></span>
                                উদ্ধারের স্থান ও সময়
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-gray-500 ml-1">উদ্ধারের তারিখ <span className="text-red-500">*</span></label>
                                    <input name="foundDate" value={form.foundDate} onChange={handleChange} required type="date" className="w-full border border-gray-100 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 bg-gray-50/50 text-gray-500" />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-gray-500 ml-1">জেলা <span className="text-red-500">*</span></label>
                                    <select name="district" value={form.district} onChange={handleChange} required className="w-full border border-gray-100 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 bg-white">
                                        {['ঢাকা', 'চট্টগ্রাম', 'রাজশাহী', 'খুলনা', 'বরিশাল', 'সিলেট', 'রংপুর', 'ময়মনসিংহ'].map(d => (
                                            <option key={d} value={d}>{d}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="md:col-span-2 space-y-1.5">
                                    <label className="text-xs font-bold text-gray-500 ml-1">বিস্তারিত ঠিকানা</label>
                                    <input name="address" value={form.address} onChange={handleChange} type="text" placeholder="এলাকা বা স্থানের নাম" className="w-full border border-gray-100 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 bg-gray-50/50" />
                                </div>
                            </div>
                        </div>

                        {/* Details */}
                        <div className="space-y-4">
                            <h2 className="text-base font-bold text-gray-800 mb-4 flex items-center gap-2">
                                <span className="p-1.5 bg-purple-50 text-purple-500 rounded-lg"><FileText size={16} /></span>
                                অন্যান্য বিবরণ
                            </h2>
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-gray-500 ml-1">পোশাকের বিবরণ</label>
                                <input name="clothingDescription" value={form.clothingDescription} onChange={handleChange} type="text" placeholder="পোশাকের রং ও ধরন" className="w-full border border-gray-100 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 bg-gray-50/50" />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-gray-500 ml-1">বর্তমান অবস্থা বা অতিরিক্ত তথ্য</label>
                                <textarea name="additionalInfo" value={form.additionalInfo} onChange={handleChange} rows={3} placeholder="ব্যক্তি সম্পর্কে অতিরিক্ত কোনো তথ্য..." className="w-full border border-gray-100 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 bg-gray-50/50 resize-none" />
                            </div>
                        </div>

                        {/* Contact */}
                        <div className="pt-4 border-t border-gray-50">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-gray-500 ml-1">আপনার/প্রতিষ্ঠানের নাম <span className="text-red-500">*</span></label>
                                    <input name="contactPersonName" value={form.contactPersonName} onChange={handleChange} required type="text" placeholder="নাম" className="w-full border border-gray-100 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 bg-gray-50/50" />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-gray-500 ml-1">যোগাযোগ নম্বর <span className="text-red-500">*</span></label>
                                    <input name="contactPhone" value={form.contactPhone} onChange={handleChange} required type="tel" placeholder="01XXXXXXXXX" className="w-full border border-gray-100 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 bg-gray-50/50" />
                                </div>
                            </div>
                        </div>

                        <button type="submit" disabled={loading}
                            className="w-full bg-teal-600 hover:bg-teal-700 text-white py-4 rounded-2xl font-bold transition-all shadow-lg shadow-teal-100 flex items-center justify-center gap-3 active:scale-[0.98] disabled:opacity-70">
                            {loading ? <Loader2 className="animate-spin" size={20} /> : null}
                            {loading ? 'AI ম্যাচ খোঁজা হচ্ছে...' : 'তথ্য জমা দিন ও AI ম্যাচ খুঁজুন'}
                        </button>
                    </form>
                </div>
            </div>

            {/* ── AI Match Result Modal ── */}
            {matchResult && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 px-4">
                    <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-6">

                        {/* Header */}
                        <div className="text-center mb-5">
                            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                                <span className="text-3xl">🎯</span>
                            </div>
                            <h2 className="text-xl font-bold text-gray-800">সম্ভাব্য মিল পাওয়া গেছে!</h2>
                            <p className="text-sm text-gray-500 mt-1">
                                AI একটি নিখোঁজ ব্যক্তির রিপোর্টের সাথে মিল খুঁজে পেয়েছে
                            </p>
                        </div>

                        {/* Photo */}
                        {matchResult.missingReport.photoUrl && (
                            <div className="flex justify-center mb-4">
                                <img
                                    src={matchResult.missingReport.photoUrl}
                                    alt="নিখোঁজ ব্যক্তি"
                                    className="w-28 h-28 rounded-2xl object-cover border-4 border-green-100 shadow-md"
                                />
                            </div>
                        )}

                        {/* Match Details */}
                        <div className="bg-green-50 rounded-2xl p-4 space-y-2.5 text-sm mb-4">
                            <div className="flex justify-between items-center">
                                <span className="text-gray-500 font-medium">নাম</span>
                                <span className="font-bold text-gray-800">{matchResult.missingReport.name}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-gray-500 font-medium">বয়স</span>
                                <span className="font-bold text-gray-800">{matchResult.missingReport.age ?? 'অজানা'}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-gray-500 font-medium">লিঙ্গ</span>
                                <span className="font-bold text-gray-800">
                                    {matchResult.missingReport.gender === 'male' ? 'পুরুষ' :
                                     matchResult.missingReport.gender === 'female' ? 'নারী' :
                                     matchResult.missingReport.gender ?? 'অজানা'}
                                </span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-gray-500 font-medium">জেলা</span>
                                <span className="font-bold text-gray-800">{matchResult.missingReport.district}</span>
                            </div>
                            <div className="pt-1 border-t border-green-100">
                                <p className="text-gray-500 font-medium mb-1">পরিবারের সাথে যোগাযোগ করুন</p>
                                <p className="font-bold text-gray-800">{matchResult.missingReport.contactPersonName}</p>
                                <p className="font-bold text-teal-700 text-base mt-0.5">📞 {matchResult.missingReport.contactPhone}</p>
                            </div>
                            {matchResult.confidence && (
                                <div className="flex justify-between items-center pt-1 border-t border-green-100">
                                    <span className="text-gray-500 font-medium">AI আস্থার মাত্রা</span>
                                    <span className={`font-bold px-2 py-0.5 rounded-full text-xs ${
                                        matchResult.confidence >= 75 ? 'bg-green-200 text-green-800' :
                                        matchResult.confidence >= 50 ? 'bg-yellow-200 text-yellow-800' :
                                        'bg-orange-200 text-orange-800'
                                    }`}>
                                        {matchResult.confidence}% মিল
                                    </span>
                                </div>
                            )}
                        </div>

                        {/* Note */}
                        <div className="bg-blue-50 rounded-xl p-3 mb-4">
                            <p className="text-xs text-blue-700 text-center">
                                ℹ️ আপনার রিপোর্টটি অ্যাডমিনের কাছে পর্যালোচনার জন্যও পাঠানো হয়েছে
                            </p>
                        </div>

                        {/* Buttons */}
                        <div className="flex gap-3">
                            <button
                                onClick={() => { setMatchResult(null); navigate('/dashboard'); }}
                                className="flex-1 bg-teal-600 hover:bg-teal-700 text-white py-3 rounded-2xl font-bold transition-all"
                            >
                                ঠিক আছে
                            </button>
                            <button
                                onClick={() => { setMatchResult(null); navigate('/dashboard'); }}
                                className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-3 rounded-2xl font-bold transition-all"
                            >
                                বন্ধ করুন
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ReportFoundPage;