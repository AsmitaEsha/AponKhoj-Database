import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
    ArrowLeft, MapPin, Calendar, Clock, Trophy, Users,
    Heart, Share2, AlertTriangle, Loader2, BookOpen, Sparkles
} from 'lucide-react';

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
const PLACEHOLDER_IMG = 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=1200&q=80';

function InfoBadge({ icon: Icon, label, value, color = 'text-gray-400' }) {
    if (!value) return null;
    return (
        <div className="flex items-center gap-2 text-sm text-gray-600">
            <Icon size={16} className={`flex-shrink-0 ${color}`} />
            <span className="text-xs text-gray-400">{label}:</span>
            <span className="font-semibold text-gray-700">{value}</span>
        </div>
    );
}

export default function SuccessStoryDetailPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [story, setStory] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [liked, setLiked] = useState(false);

    useEffect(() => {
        const fetchStory = async () => {
            setLoading(true);
            setError(null);
            try {
                const res = await fetch(`${API}/success-stories/${id}`);
                if (res.status === 404) throw new Error('not_found');
                if (!res.ok) throw new Error('server_error');
                const data = await res.json();
                setStory(data);
            } catch (err) {
                setError(err.message === 'not_found' ? 'not_found' : 'server_error');
            } finally {
                setLoading(false);
            }
        };
        fetchStory();
    }, [id]);

    const handleShare = async () => {
        if (navigator.share) {
            await navigator.share({ title: story?.title, url: window.location.href });
        } else {
            await navigator.clipboard.writeText(window.location.href);
            alert('লিংক কপি হয়েছে!');
        }
    };

    /* ── Loading ── */
    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="flex flex-col items-center gap-3 text-gray-400">
                    <Loader2 size={28} className="animate-spin" />
                    <p className="text-sm">গল্প লোড হচ্ছে...</p>
                </div>
            </div>
        );
    }

    /* ── Not Found ── */
    if (error === 'not_found') {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-10 text-center max-w-md w-full">
                    <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                        <BookOpen size={28} className="text-gray-200" />
                    </div>
                    <h2 className="text-lg font-black text-gray-800 mb-2">গল্পটি পাওয়া যায়নি</h2>
                    <p className="text-sm text-gray-400 mb-6">এই গল্পটি প্রকাশিত হয়নি বা মুছে ফেলা হয়েছে।</p>
                    <Link to="/success-stories"
                        className="inline-flex items-center gap-2 px-5 py-2.5 bg-red-500 text-white text-sm font-bold rounded-xl hover:bg-red-600 transition-colors">
                        <ArrowLeft size={14} /> সব গল্পে ফিরুন
                    </Link>
                </div>
            </div>
        );
    }

    /* ── Server Error ── */
    if (error) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-10 text-center max-w-md w-full">
                    <AlertTriangle size={32} className="text-red-300 mx-auto mb-4" />
                    <h2 className="text-base font-black text-gray-800 mb-2">তথ্য লোড ব্যর্থ</h2>
                    <p className="text-sm text-gray-400 mb-6">একটি সমস্যা হয়েছে। পরে আবার চেষ্টা করুন।</p>
                    <div className="flex gap-3 justify-center">
                        <button onClick={() => window.location.reload()}
                            className="px-5 py-2.5 bg-red-500 text-white text-sm font-bold rounded-xl hover:bg-red-600 transition-colors">
                            রিফ্রেশ করুন
                        </button>
                        <Link to="/success-stories"
                            className="px-5 py-2.5 border border-gray-200 text-gray-600 text-sm rounded-xl hover:bg-gray-50 transition-colors">
                            ফিরে যান
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    const adminName = story.admin ? `${story.admin.firstName} ${story.admin.lastName}` : 'আপনখোঁজ দল';

    return (
        <div className="bg-gray-50 min-h-screen">
            {/* ── Hero Image ── */}
            <div className="relative h-72 sm:h-96 overflow-hidden bg-gray-200">
                <img
                    src={story.photoUrl || PLACEHOLDER_IMG}
                    alt={story.title}
                    className="w-full h-full object-cover"
                    onError={e => { e.target.src = PLACEHOLDER_IMG; }}
                />
                {/* Gradient */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

                {/* Back button */}
                <button
                    onClick={() => navigate(-1)}
                    className="absolute top-4 left-4 flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-md border border-white/20 text-white rounded-xl text-sm font-semibold hover:bg-white/20 transition-colors"
                >
                    <ArrowLeft size={15} /> পেছনে
                </button>

                {/* Success badge */}
                <span className="absolute top-4 right-4 flex items-center gap-1.5 bg-emerald-500/90 backdrop-blur-sm text-white text-xs font-bold px-3 py-1.5 rounded-full border border-emerald-400/30 shadow">
                    <Trophy size={12} /> সফল পুনর্মিলন
                </span>

                {/* Bottom overlay text */}
                <div className="absolute bottom-0 left-0 right-0 p-6">
                    <div className="max-w-4xl mx-auto">
                        <div className="flex items-center gap-2 mb-2">
                            <MapPin size={13} className="text-red-300" />
                            <span className="text-red-200 text-xs font-medium">
                                {story.division}{story.district ? ` · ${story.district}` : ''}
                            </span>
                        </div>
                        <h1 className="text-2xl sm:text-3xl font-black text-white leading-tight">{story.title}</h1>
                    </div>
                </div>
            </div>

            {/* ── Content ── */}
            <div className="max-w-4xl mx-auto px-4 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                    {/* ── Main Article ── */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Summary card */}
                        {story.summary && (
                            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 flex gap-3">
                                <Sparkles size={18} className="text-amber-500 flex-shrink-0 mt-0.5" />
                                <p className="text-sm text-amber-800 leading-relaxed font-medium">{story.summary}</p>
                            </div>
                        )}

                        {/* Full content */}
                        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                            <h2 className="text-base font-black text-gray-800 mb-4 flex items-center gap-2">
                                <BookOpen size={18} className="text-red-400" /> পূর্ণ বিবরণ
                            </h2>
                            <div className="prose prose-sm max-w-none text-gray-600 leading-loose whitespace-pre-wrap">
                                {story.content}
                            </div>
                        </div>

                        {/* Action buttons */}
                        <div className="flex items-center gap-4">
                            <button
                                onClick={() => setLiked(l => !l)}
                                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl border text-sm font-semibold transition-all ${
                                    liked
                                        ? 'bg-pink-50 border-pink-300 text-pink-600'
                                        : 'border-gray-200 text-gray-500 hover:border-pink-300 hover:text-pink-400'
                                }`}
                            >
                                <Heart size={15} className={liked ? 'fill-current' : ''} />
                                {liked ? 'পছন্দ করেছেন' : 'পছন্দ করুন'}
                            </button>
                            <button
                                onClick={handleShare}
                                className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-500 font-semibold hover:border-blue-300 hover:text-blue-400 transition-all"
                            >
                                <Share2 size={15} /> শেয়ার করুন
                            </button>
                        </div>

                        {/* Back to list */}
                        <Link
                            to="/success-stories"
                            className="inline-flex items-center gap-2 text-sm text-red-500 font-semibold hover:underline"
                        >
                            <ArrowLeft size={14} /> সব সাফল্যের গল্প দেখুন
                        </Link>
                    </div>

                    {/* ── Sidebar Info ── */}
                    <div className="space-y-4">
                        {/* Person card */}
                        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                            <h3 className="text-sm font-black text-gray-800 mb-4 flex items-center gap-2">
                                <Users size={16} className="text-red-400" /> উদ্ধারকৃত ব্যক্তি
                            </h3>
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-red-400 to-rose-600 flex items-center justify-center text-white font-black text-lg flex-shrink-0">
                                    {story.personName?.[0]}
                                </div>
                                <div>
                                    <p className="font-bold text-gray-800">{story.personName}</p>
                                    <p className="text-xs text-gray-400">{story.division}</p>
                                </div>
                            </div>
                            <div className="space-y-2.5 border-t border-gray-50 pt-4">
                                <InfoBadge icon={MapPin} label="বিভাগ" value={story.division} color="text-red-400" />
                                {story.district && <InfoBadge icon={MapPin} label="জেলা" value={story.district} color="text-red-400" />}
                                {story.daysLost && (
                                    <InfoBadge icon={Clock} label="হারিয়ে ছিলেন" value={`${story.daysLost} দিন`} color="text-amber-400" />
                                )}
                                {story.reunionDate && (
                                    <InfoBadge icon={Calendar} label="পুনর্মিলন" value={new Date(story.reunionDate).toLocaleDateString('bn-BD')} color="text-emerald-500" />
                                )}
                            </div>
                        </div>

                        {/* Reunion highlight card */}
                        <div className="bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl p-5 text-white">
                            <div className="flex items-center gap-2 mb-3">
                                <Trophy size={18} className="text-yellow-300" />
                                <h3 className="font-black text-sm">পুনর্মিলন সফল!</h3>
                            </div>
                            <p className="text-xs text-emerald-100 leading-relaxed">
                                আপনখোঁজ প্ল্যাটফর্মের মাধ্যমে এই পরিবার আবার একত্রিত হয়েছে।
                                আমাদের প্রতিটি সাফল্য একটি পরিবারের আনন্দের গল্প।
                            </p>
                            {story.publishedAt && (
                                <p className="text-[10px] text-emerald-200/70 mt-3 flex items-center gap-1">
                                    <Calendar size={10} />
                                    প্রকাশিত: {new Date(story.publishedAt).toLocaleDateString('bn-BD')}
                                </p>
                            )}
                        </div>

                        {/* Missing report link if exists */}
                        {story.missingReport && (
                            <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4">
                                <p className="text-xs font-bold text-blue-600 mb-2">সংশ্লিষ্ট নিখোঁজ রিপোর্ট</p>
                                <Link
                                    to={`/report/${story.missingReportId}`}
                                    className="text-sm font-semibold text-blue-600 hover:underline"
                                >
                                    #{story.missingReport.id} — {story.missingReport.name}
                                </Link>
                            </div>
                        )}

                        {/* Published by */}
                        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
                            <p className="text-xs text-gray-400 mb-1">প্রকাশক</p>
                            <p className="text-sm font-bold text-gray-700">{adminName}</p>
                            {story.publishedAt && (
                                <p className="text-[10px] text-gray-400 mt-0.5">
                                    {new Date(story.publishedAt).toLocaleString('bn-BD')}
                                </p>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
