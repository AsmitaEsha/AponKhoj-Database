import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Upload, User, MapPin, Calendar, FileText, Loader2 } from 'lucide-react';
import axios from 'axios';
import { toast } from 'react-hot-toast';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const ReportMissingPage = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [photo, setPhoto] = useState(null);
    const [preview, setPreview] = useState(null);
    const [form, setForm] = useState({
        name: '',
        age: '',
        gender: 'male',
        height: '',
        lastSeenDate: '',
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
            const resp = await axios.post(`${API_URL}/missing-reports`, data, {
                headers: { 
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data'
                }
            });
            if (resp.data.success) {
                toast.success("রিপোর্ট সফলভাবে জমা হয়েছে। মডারেশনের জন্য অপেক্ষা করুন।");
                navigate('/dashboard');
            }
        } catch (err) {
            console.error("Submission error", err);
            toast.error(err.response?.data?.message || "রিপোর্ট জমা দিতে সমস্যা হয়েছে");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-background py-10 px-4">
            <div className="max-w-2xl mx-auto">
                <div className="mb-8 text-center md:text-left">
                    <h1 className="text-2xl font-bold text-gray-800">নিখোঁজ ব্যক্তির রিপোর্ট করুন</h1>
                    <p className="text-gray-500 text-sm mt-1">সঠিক তথ্য দিয়ে নিখোঁজ ব্যক্তিকে খুঁজে পেতে সহায়তা করুন</p>
                </div>

                <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 md:p-8">
                    <form onSubmit={handleSubmit} className="space-y-8">
                        {/* Photo Upload */}
                        <div>
                            <h2 className="text-base font-bold text-gray-800 mb-4 flex items-center gap-2">
                                <span className="p-1.5 bg-red-50 text-red-500 rounded-lg"><Upload size={16} /></span>
                                ছবি আপলোড করুন
                            </h2>
                            <label className="group relative border-2 border-dashed border-gray-200 rounded-2xl p-8 flex flex-col items-center justify-center cursor-pointer hover:border-red-400 hover:bg-red-50/30 transition-all">
                                <input type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
                                {preview ? (
                                    <div className="text-center">
                                        <img src={preview} alt="Preview" className="w-40 h-40 object-cover rounded-xl shadow-md border-4 border-white mb-3" />
                                        <p className="text-sm text-red-500 font-bold">{photo.name}</p>
                                    </div>
                                ) : (
                                    <div className="text-center">
                                        <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
                                            <Upload size={32} className="text-gray-300" />
                                        </div>
                                        <p className="text-sm text-gray-500 font-medium">ছবি টেনে আনুন বা ক্লিক করুন</p>
                                        <p className="text-xs text-gray-400 mt-1">JPG, PNG (সর্বোচ্চ 5MB)</p>
                                    </div>
                                )}
                            </label>
                        </div>

                        {/* Personal Info */}
                        <div className="space-y-4">
                            <h2 className="text-base font-bold text-gray-800 mb-4 flex items-center gap-2">
                                <span className="p-1.5 bg-blue-50 text-blue-500 rounded-lg"><User size={16} /></span>
                                ব্যক্তিগত তথ্য
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-gray-500 ml-1">নাম <span className="text-red-500">*</span></label>
                                    <input name="name" value={form.name} onChange={handleChange} required type="text" placeholder="পূর্ণ নাম" className="w-full border border-gray-100 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 bg-gray-50/50" />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-gray-500 ml-1">বয়স</label>
                                    <input name="age" value={form.age} onChange={handleChange} type="number" placeholder="বয়স" className="w-full border border-gray-100 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 bg-gray-50/50" />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-gray-500 ml-1">লিঙ্গ</label>
                                    <select name="gender" value={form.gender} onChange={handleChange} className="w-full border border-gray-100 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 bg-white">
                                        <option value="male">পুরুষ</option>
                                        <option value="female">নারী</option>
                                        <option value="other">অন্যান্য</option>
                                    </select>
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-gray-500 ml-1">উচ্চতা</label>
                                    <input name="height" value={form.height} onChange={handleChange} type="text" placeholder="৫ ফুট ৭ ইঞ্চি" className="w-full border border-gray-100 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 bg-gray-50/50" />
                                </div>
                            </div>
                        </div>

                        {/* Location */}
                        <div className="space-y-4">
                            <h2 className="text-base font-bold text-gray-800 mb-4 flex items-center gap-2">
                                <span className="p-1.5 bg-amber-50 text-amber-500 rounded-lg"><MapPin size={16} /></span>
                                শেষ দেখা যাওয়ার তথ্য
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-gray-500 ml-1">তারিখ</label>
                                    <input name="lastSeenDate" value={form.lastSeenDate} onChange={handleChange} type="date" className="w-full border border-gray-100 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 bg-gray-50/50 text-gray-500" />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-gray-500 ml-1">জেলা <span className="text-red-500">*</span></label>
                                    <select name="district" value={form.district} onChange={handleChange} required className="w-full border border-gray-100 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 bg-white">
                                        {['ঢাকা', 'চট্টগ্রাম', 'রাজশাহী', 'খুলনা', 'বরিশাল', 'সিলেট', 'রংপুর', 'ময়মনসিংহ'].map(d => (
                                            <option key={d} value={d}>{d}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="md:col-span-2 space-y-1.5">
                                    <label className="text-xs font-bold text-gray-500 ml-1">বিস্তারিত ঠিকানা</label>
                                    <input name="address" value={form.address} onChange={handleChange} type="text" placeholder="যেমন: বাসস্ট্যান্ড, মিরপুর ১০" className="w-full border border-gray-100 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 bg-gray-50/50" />
                                </div>
                            </div>
                        </div>

                        {/* Additional Info */}
                        <div className="space-y-4">
                            <h2 className="text-base font-bold text-gray-800 mb-4 flex items-center gap-2">
                                <span className="p-1.5 bg-purple-50 text-purple-500 rounded-lg"><FileText size={16} /></span>
                                অন্যান্য বিবরণ
                            </h2>
                            <div className="space-y-4">
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-gray-500 ml-1">পোশাকের বিবরণ</label>
                                    <input name="clothingDescription" value={form.clothingDescription} onChange={handleChange} type="text" placeholder="গায়ের পোশাকের বিবরণ" className="w-full border border-gray-100 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 bg-gray-50/50" />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-gray-500 ml-1">অতিরিক্ত তথ্য</label>
                                    <textarea name="additionalInfo" value={form.additionalInfo} onChange={handleChange} rows={3} placeholder="চিহ্ন বা অন্য কোনো তথ্য..." className="w-full border border-gray-100 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 bg-gray-50/50 resize-none" />
                                </div>
                            </div>
                        </div>

                        {/* Contact */}
                        <div className="pt-4 border-t border-gray-50">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-gray-500 ml-1">আপনার নাম <span className="text-red-500">*</span></label>
                                    <input name="contactPersonName" value={form.contactPersonName} onChange={handleChange} required type="text" placeholder="নাম" className="w-full border border-gray-100 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 bg-gray-50/50" />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-gray-500 ml-1">ফোন নম্বর <span className="text-red-500">*</span></label>
                                    <input name="contactPhone" value={form.contactPhone} onChange={handleChange} required type="tel" placeholder="01XXXXXXXXX" className="w-full border border-gray-100 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 bg-gray-50/50" />
                                </div>
                            </div>
                        </div>

                        <button type="submit" disabled={loading} 
                            className="w-full bg-red-500 hover:bg-red-600 text-white py-4 rounded-2xl font-bold transition-all shadow-lg shadow-red-200 flex items-center justify-center gap-3 active:scale-[0.98] disabled:opacity-70">
                            {loading ? <Loader2 className="animate-spin" size={20} /> : null}
                            {loading ? 'প্রক্রিয়াকরণ হচ্ছে...' : 'রিপোর্ট জমা দিন'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default ReportMissingPage;