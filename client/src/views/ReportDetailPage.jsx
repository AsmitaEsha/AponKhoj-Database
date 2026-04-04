import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import {
    ArrowLeft, MapPin, Calendar, Clock, Phone, User, Ruler,
    Shirt, Info, Share2, Flag, CheckCircle, AlertTriangle, Loader2
} from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const avatar = (seed, gender, age) => {
    if (!seed) return `https://api.dicebear.com/7.x/shapes/png?seed=unknown&size=300&backgroundColor=e8e0d5`;
    const isChild = age < 12;
    const style = gender === 'female'
        ? (isChild ? 'lorelei' : 'lorelei')
        : (isChild ? 'adventurer' : 'adventurer');
    const bg = gender === 'female' ? 'f7ede2' : 'd6e8f7';
    return `https://api.dicebear.com/7.x/${style}/png?seed=${encodeURIComponent(seed)}&size=400&backgroundColor=${bg}`;
};

const Field = ({ icon: Icon, label, value }) => {
    if (!value) return null;
    return (
        <div className="flex items-start gap-3 py-3 border-b border-gray-50 last:border-0">
            <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center flex-shrink-0">
                <Icon size={15} className="text-gray-400" />
            </div>
            <div>
                <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide mb-0.5">{label}</p>
                <p className="text-sm text-gray-700 font-medium leading-snug">{value}</p>
            </div>
        </div>
    );
};

export default function ReportDetailPage() {
    const { id } = useParams(); // format: "m-5" or "f-3"
    const navigate = useNavigate();
    const [report, setReport] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        const fetchReport = async () => {
            try {
                setLoading(true);
                const type = id?.startsWith('f-') ? 'found' : 'missing';
                const numericId = id?.replace(/^[mf]-/, '');

                let res;
                if (type === 'missing') {
                    res = await axios.get(`${API_URL}/missing-reports/published/${numericId}`);
                } else {
                    res = await axios.get(`${API_URL}/found-reports/published/${numericId}`);
                }

                setReport({ ...res.data.report, type });
            } catch (err) {
                console.error('Failed to load report', err);
                setError('রিপোর্টটি পাওয়া যায়নি বা মুছে ফেলা হয়েছে।');
            } finally {
                setLoading(false);
            }
        };

        if (id) fetchReport();
    }, [id]);

    const handleShare = () => {
        navigator.clipboard.writeText(window.location.href);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const isMissing = report?.type === 'missing';

    if (loading) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <Loader2 size={32} className="animate-spin text-primary" />
            </div>
        );
    }

    if (error || !report) {
        return (
            <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-4 px-4">
                <div className="w-16 h-16 rounded-2xl bg-red-50 flex items-center justify-center">
                    <AlertTriangle size={28} className="text-red-400" />
                </div>
                <h1 className="text-xl font-black text-gray-800">রিপোর্ট পাওয়া যায়নি</h1>
                <p className="text-sm text-gray-500 text-center max-w-xs">{error || 'এই রিপোর্টটি বিদ্যমান নেই।'}</p>
                <Link to="/search-page"
                    className="mt-2 flex items-center gap-2 bg-primary text-white px-5 py-2.5 rounded-xl text-sm font-bold">
                    <ArrowLeft size={14} /> অনুসন্ধানে ফিরুন
                </Link>
            </div>
        );
    }

    const photoUrl = report.photoUrl || avatar(report.name, report.gender, report.age);
    const statusColor = isMissing ? 'bg-secondary text-white' : 'bg-accent-teal text-white';
    const statusLabel = isMissing ? 'নিখোঁজ' : 'পাওয়া গেছে';
    const dateLabel = isMissing ? 'সর্বশেষ দেখা গেছে' : 'যেখানে পাওয়া গেছে';
    const reportDate = isMissing ? report.lastSeenDate : report.foundDate;
    const reportTime = isMissing ? report.lastSeenTime : report.foundTime;

    return (
        <div className="min-h-screen bg-background">
            <div className="max-w-4xl mx-auto px-4 py-6">
                {/* Back button */}
                <button
                    onClick={() => navigate(-1)}
                    className="flex items-center gap-2 text-sm text-gray-500 hover:text-primary transition-colors mb-6 group"
                >
                    <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
                    অনুসন্ধান পাতায় ফিরুন
                </button>

                <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                    {/* Left: Photo + status */}
                    <div className="lg:col-span-2 space-y-4">
                        {/* Photo card */}
                        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                            <div className="relative bg-[#f5ede2] aspect-[4/5] overflow-hidden">
                                <img
                                    src={photoUrl}
                                    alt={report.name}
                                    className="w-full h-full object-cover object-top"
                                    onError={e => { e.target.src = `https://api.dicebear.com/7.x/shapes/png?seed=${id}&size=400&backgroundColor=e8ddd4`; }}
                                />
                                <div className="absolute top-3 left-3">
                                    <span className={`text-xs font-bold px-3 py-1 rounded-full ${statusColor}`}>
                                        {statusLabel}
                                    </span>
                                </div>
                            </div>

                            <div className="p-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h1 className="text-xl font-black text-gray-800">{report.name}</h1>
                                        {report.age && (
                                            <p className="text-sm text-gray-400 mt-0.5">আনুমানিক {report.age} বছর বয়সী</p>
                                        )}
                                    </div>
                                    {report.gender && (
                                        <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-lg font-medium">
                                            {report.gender === 'male' ? 'পুরুষ' : report.gender === 'female' ? 'নারী' : report.gender}
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>

                  

                        {/* Quick info pills */}
                        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 space-y-3">
                            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wide">দ্রুত তথ্য</h3>
                            <div className="flex flex-wrap gap-2">
                                {report.district && (
                                    <div className="flex items-center gap-1.5 bg-gray-50 text-gray-600 text-xs px-3 py-1.5 rounded-lg font-medium">
                                        <MapPin size={11} className="text-secondary" /> {report.district}
                                    </div>
                                )}
                                {report.clothingDescription && (
                                    <div className="flex items-center gap-1.5 bg-gray-50 text-gray-600 text-xs px-3 py-1.5 rounded-lg font-medium">
                                        <Shirt size={11} className="text-primary" /> {report.clothingDescription}
                                    </div>
                                )}
                                {report.height && (
                                    <div className="flex items-center gap-1.5 bg-gray-50 text-gray-600 text-xs px-3 py-1.5 rounded-lg font-medium">
                                        <Ruler size={11} /> {report.height}
                                    </div>
                                )}
                                {reportDate && (
                                    <div className="flex items-center gap-1.5 bg-gray-50 text-gray-600 text-xs px-3 py-1.5 rounded-lg font-medium">
                                        <Calendar size={11} className="text-primary" /> {reportDate}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Right: Full details */}
                    <div className="lg:col-span-3 space-y-4">
                        {/* Incident details */}
                        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                            <h2 className="text-sm font-black text-gray-800 mb-1">
                                {isMissing ? 'নিখোঁজের বিবরণ' : 'উদ্ধারের বিবরণ'}
                            </h2>
                            <p className="text-xs text-gray-400 mb-4">
                                {isMissing ? 'নিখোঁজ হওয়ার সময় ও স্থানের তথ্য' : 'যেখানে ও কখন পাওয়া গেছে তার তথ্য'}
                            </p>
                            <div>
                                <Field icon={MapPin} label={dateLabel} value={report.district} />
                                <Field icon={MapPin} label="বিস্তারিত ঠিকানা" value={report.address} />
                                <Field icon={Calendar} label={isMissing ? 'নিখোঁজের তারিখ' : 'উদ্ধারের তারিখ'} value={reportDate} />
                                <Field icon={Clock} label={isMissing ? 'নিখোঁজের সময়' : 'উদ্ধারের সময়'} value={reportTime} />
                                <Field icon={Shirt} label="পোশাকের বিবরণ" value={report.clothingDescription} />
                            </div>
                        </div>

                        {/* Physical details */}
                        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                            <h2 className="text-sm font-black text-gray-800 mb-4">শারীরিক বিবরণ</h2>
                            <div>
                                <Field icon={User} label="নাম" value={report.name} />
                                <Field icon={User} label="বয়স" value={report.age ? `আনুমানিক ${report.age} বছর` : null} />
                                <Field icon={User} label="লিঙ্গ" value={report.gender === 'male' ? 'পুরুষ' : report.gender === 'female' ? 'নারী' : report.gender} />
                                <Field icon={Ruler} label="উচ্চতা" value={report.height} />
                            </div>
                        </div>

                        {/* Additional info */}
                        {report.additionalInfo && (
                            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                                <h2 className="text-sm font-black text-gray-800 mb-3">অতিরিক্ত তথ্য</h2>
                                <div className="flex gap-3">
                                    <Info size={15} className="text-primary flex-shrink-0 mt-0.5" />
                                    <p className="text-sm text-gray-600 leading-relaxed">{report.additionalInfo}</p>
                                </div>
                            </div>
                        )}

                        {/* Contact card */}
                        <div className="bg-gradient-to-br from-primary to-[#0c2e20] rounded-2xl p-5 text-white">
                            <h2 className="text-sm font-black mb-1">যোগাযোগের তথ্য</h2>
                            <p className="text-white/60 text-xs mb-4">তথ্য থাকলে এই নম্বরে যোগাযোগ করুন</p>
                            <div className="space-y-3">
                                {report.contactPersonName && (
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center flex-shrink-0">
                                            <User size={14} />
                                        </div>
                                        <div>
                                            <p className="text-[10px] text-white/50 uppercase tracking-wide">যোগাযোগকারী</p>
                                            <p className="text-sm font-bold">{report.contactPersonName}</p>
                                        </div>
                                    </div>
                                )}
                                {report.contactPhone && (
                                    <a
                                        href={`tel:${report.contactPhone}`}
                                        className="flex items-center gap-3 bg-white/10 hover:bg-white/20 rounded-xl px-4 py-3 transition-colors"
                                    >
                                        <Phone size={16} className="text-white/70" />
                                        <span className="text-sm font-bold tracking-wide">{report.contactPhone}</span>
                                    </a>
                                )}
                            </div>
                        </div>

                        {/* Urgency banner */}
                        <div className={`rounded-2xl p-4 flex items-start gap-3 ${isMissing ? 'bg-orange-50 border border-orange-100' : 'bg-emerald-50 border border-emerald-100'}`}>
                            {isMissing
                                ? <AlertTriangle size={18} className="text-secondary flex-shrink-0 mt-0.5" />
                                : <CheckCircle size={18} className="text-emerald-500 flex-shrink-0 mt-0.5" />
                            }
                            <div>
                                <p className={`text-xs font-bold ${isMissing ? 'text-secondary' : 'text-emerald-700'}`}>
                                    {isMissing ? 'আপনি কি এই ব্যক্তিকে চেনেন?' : 'এই ব্যক্তির পরিবার তাকে খুঁজছে'}
                                </p>
                                <p className={`text-[11px] mt-0.5 ${isMissing ? 'text-orange-600' : 'text-emerald-600'}`}>
                                    {isMissing
                                        ? 'যোগাযোগকারীর সাথে যোগাযোগ করুন বা পুলিশকে জানান।'
                                        : 'উপরের নম্বরে ফোন করে পরিবারকে তথ্য দিন।'
                                    }
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
