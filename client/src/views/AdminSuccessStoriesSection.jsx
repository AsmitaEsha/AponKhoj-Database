import { useState, useEffect, useRef } from 'react';
import {
    Plus, Edit2, Trash2, Eye, EyeOff, Loader2, X, CheckCircle,
    AlertTriangle, Trophy, Calendar, MapPin, Clock, FileText, Image
} from 'lucide-react';
import { useAuth } from '../helpers/AuthContext';
import toast from 'react-hot-toast';

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const DIVISIONS = ['ঢাকা', 'চট্টগ্রাম', 'রাজশাহী', 'খুলনা', 'বরিশাল', 'সিলেট', 'রংপুর', 'ময়মনসিংহ'];

const STATUS_BADGE = {
    published: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    draft: 'bg-amber-50 text-amber-700 border-amber-200',
};

function EmptyState({ message }) {
    return (
        <div className="flex flex-col items-center justify-center py-16 text-gray-300">
            <Trophy size={36} className="mb-3" />
            <p className="text-sm font-semibold">{message}</p>
        </div>
    );
}

/* ── Story Form Modal ── */
function StoryModal({ story, onClose, onSaved }) {
    const { token } = useAuth();
    const [saving, setSaving] = useState(false);
    const [imgPreview, setImgPreview] = useState(story?.photoUrl || null);
    const [imageBase64, setImageBase64] = useState(null);
    const fileRef = useRef();

    const [form, setForm] = useState({
        title: story?.title || '',
        personName: story?.personName || '',
        division: story?.division || 'ঢাকা',
        district: story?.district || '',
        daysLost: story?.daysLost || '',
        reunionDate: story?.reunionDate ? story.reunionDate.slice(0, 10) : '',
        summary: story?.summary || '',
        content: story?.content || '',
        status: story?.status || 'draft',
    });

    const set = (k, v) => setForm(prev => ({ ...prev, [k]: v }));

    const handleImage = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        if (file.size > 5 * 1024 * 1024) { toast.error('ছবির আকার ৫MB এর বেশি হতে পারবে না'); return; }
        const reader = new FileReader();
        reader.onload = (ev) => {
            setImgPreview(ev.target.result);
            setImageBase64(ev.target.result);
        };
        reader.readAsDataURL(file);
    };

    const handleSave = async () => {
        if (!form.title.trim() || !form.personName.trim() || !form.content.trim()) {
            toast.error('শিরোনাম, ব্যক্তির নাম ও বিস্তারিত বিবরণ আবশ্যিক');
            return;
        }
        setSaving(true);
        try {
            const authToken = localStorage.getItem('aponkhoj_token');
            const method = story ? 'PUT' : 'POST';
            const url = story ? `${API}/success-stories/${story.id}` : `${API}/success-stories`;

            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${authToken}` },
                body: JSON.stringify({ ...form, ...(imageBase64 && { imageBase64 }) }),
            });

            if (!res.ok) {
                const err = await res.json();
                throw new Error(err.message || 'Failed to save');
            }

            const saved = await res.json();
            toast.success(story ? 'গল্প আপডেট করা হয়েছে' : 'গল্প সংরক্ষণ করা হয়েছে');
            onSaved(saved);
        } catch (err) {
            toast.error(err.message);
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-amber-50 flex items-center justify-center">
                            <Trophy size={18} className="text-amber-500" />
                        </div>
                        <div>
                            <h2 className="text-base font-black text-gray-800">
                                {story ? 'গল্প সম্পাদনা করুন' : 'নতুন সাফল্যের গল্প'}
                            </h2>
                            <p className="text-xs text-gray-400">প্রতিটি ক্ষেত্র সযত্নে পূরণ করুন</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 text-gray-400 hover:bg-gray-100 rounded-xl transition-colors">
                        <X size={18} />
                    </button>
                </div>

                <div className="p-6 space-y-5">
                    {/* Photo Upload */}
                    <div>
                        <label className="block text-xs font-bold text-gray-600 mb-2">ছবি আপলোড</label>
                        <div
                            onClick={() => fileRef.current?.click()}
                            className="relative border-2 border-dashed border-gray-200 rounded-xl overflow-hidden cursor-pointer hover:border-amber-400 transition-colors"
                            style={{ height: imgPreview ? 'auto' : '120px' }}
                        >
                            {imgPreview ? (
                                <img src={imgPreview} alt="preview" className="w-full h-48 object-cover" />
                            ) : (
                                <div className="flex flex-col items-center justify-center h-full text-gray-300 gap-2">
                                    <Image size={28} />
                                    <span className="text-xs">ছবি বেছে নিন (সর্বোচ্চ ৫MB)</span>
                                </div>
                            )}
                        </div>
                        <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleImage} />
                    </div>

                    {/* Title */}
                    <div>
                        <label className="block text-xs font-bold text-gray-600 mb-1.5">শিরোনাম *</label>
                        <input
                            value={form.title}
                            onChange={e => set('title', e.target.value)}
                            className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-300"
                            placeholder="উদাহরণ: ১৫ দিন পর বাড়ি ফিরলেন রায়হান"
                        />
                    </div>

                    {/* Person Name + Division + District row */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-gray-600 mb-1.5">উদ্ধারকৃত ব্যক্তির নাম *</label>
                            <input
                                value={form.personName}
                                onChange={e => set('personName', e.target.value)}
                                className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-300"
                                placeholder="নাম"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-600 mb-1.5">বিভাগ *</label>
                            <select
                                value={form.division}
                                onChange={e => set('division', e.target.value)}
                                className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-300 bg-white"
                            >
                                {DIVISIONS.map(d => <option key={d}>{d}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-600 mb-1.5">জেলা</label>
                            <input
                                value={form.district}
                                onChange={e => set('district', e.target.value)}
                                className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-300"
                                placeholder="জেলার নাম"
                            />
                        </div>
                    </div>

                    {/* Days Lost + Reunion Date row */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-gray-600 mb-1.5">হারিয়ে ছিলেন (দিন)</label>
                            <input
                                type="number" min="1"
                                value={form.daysLost}
                                onChange={e => set('daysLost', e.target.value)}
                                className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-300"
                                placeholder="৭"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-600 mb-1.5">পুনর্মিলনের তারিখ</label>
                            <input
                                type="date"
                                value={form.reunionDate}
                                onChange={e => set('reunionDate', e.target.value)}
                                className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-300"
                            />
                        </div>
                    </div>

                    {/* Summary */}
                    <div>
                        <label className="block text-xs font-bold text-gray-600 mb-1.5">সংক্ষিপ্ত বিবরণ (কার্ডে দেখাবে)</label>
                        <textarea
                            rows={2}
                            value={form.summary}
                            onChange={e => set('summary', e.target.value)}
                            className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-300 resize-none"
                            placeholder="গল্পের সংক্ষিপ্ত সারসংক্ষেপ..."
                        />
                    </div>

                    {/* Full Content */}
                    <div>
                        <label className="block text-xs font-bold text-gray-600 mb-1.5">পূর্ণ বিবরণ *</label>
                        <textarea
                            rows={7}
                            value={form.content}
                            onChange={e => set('content', e.target.value)}
                            className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-300 resize-none"
                            placeholder="সম্পূর্ণ গল্পটি এখানে লিখুন..."
                        />
                    </div>

                    {/* Status */}
                    <div>
                        <label className="block text-xs font-bold text-gray-600 mb-1.5">প্রকাশনার অবস্থা</label>
                        <div className="flex gap-3">
                            {[
                                { v: 'draft', label: 'খসড়া (Draft)', icon: Clock },
                                { v: 'published', label: 'প্রকাশিত (Published)', icon: CheckCircle },
                            ].map(({ v, label, icon: Icon }) => (
                                <button
                                    key={v}
                                    onClick={() => set('status', v)}
                                    className={`flex-1 flex items-center gap-2 px-4 py-3 rounded-xl border text-sm font-semibold transition-all ${
                                        form.status === v
                                            ? v === 'published' ? 'bg-emerald-50 border-emerald-300 text-emerald-700' : 'bg-amber-50 border-amber-300 text-amber-700'
                                            : 'border-gray-200 text-gray-500 hover:border-gray-300'
                                    }`}
                                >
                                    <Icon size={15} /> {label}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-100 bg-gray-50/50 rounded-b-2xl">
                    <button onClick={onClose} className="px-5 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-xl transition-colors">
                        বাতিল
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={saving}
                        className="flex items-center gap-2 px-6 py-2 bg-red-500 text-white text-sm font-bold rounded-xl hover:bg-red-600 transition-colors disabled:opacity-50"
                    >
                        {saving ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle size={14} />}
                        {saving ? 'সংরক্ষণ হচ্ছে...' : 'সংরক্ষণ করুন'}
                    </button>
                </div>
            </div>
        </div>
    );
}

/* ── Delete Confirm Modal ── */
function DeleteConfirm({ story, onCancel, onConfirm, deleting }) {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 text-center">
                <div className="w-14 h-14 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-4">
                    <Trash2 size={24} className="text-red-500" />
                </div>
                <h3 className="text-base font-black text-gray-800 mb-2">গল্পটি মুছে ফেলবেন?</h3>
                <p className="text-xs text-gray-500 mb-6">
                    <strong className="text-gray-700">"{story.title}"</strong> গল্পটি স্থায়ীভাবে মুছে যাবে। এটি পূর্বাবস্থায় ফেরানো সম্ভব হবে না।
                </p>
                <div className="flex gap-3">
                    <button onClick={onCancel} className="flex-1 py-2.5 text-sm text-gray-600 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors">
                        বাতিল
                    </button>
                    <button
                        onClick={onConfirm}
                        disabled={deleting}
                        className="flex-1 py-2.5 text-sm text-white bg-red-500 rounded-xl hover:bg-red-600 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                        {deleting ? <Loader2 size={13} className="animate-spin" /> : null}
                        মুছে ফেলুন
                    </button>
                </div>
            </div>
        </div>
    );
}

/* ── MAIN Admin Success Stories Section ── */
export default function AdminSuccessStoriesSection() {
    const { token } = useAuth();
    const [stories, setStories] = useState([]);
    const [stats, setStats] = useState({ total: 0, published: 0, drafts: 0 });
    const [loading, setLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState('all');
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [total, setTotal] = useState(0);

    const [modalOpen, setModalOpen] = useState(false);
    const [editingStory, setEditingStory] = useState(null);
    const [deleteTarget, setDeleteTarget] = useState(null);
    const [deleting, setDeleting] = useState(false);
    const [toggling, setToggling] = useState(null);

    const authHeaders = { Authorization: `Bearer ${localStorage.getItem('aponkhoj_token')}` };

    const fetchStories = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams({ page: String(page), limit: '10' });
            if (statusFilter !== 'all') params.set('status', statusFilter);

            const [storiesRes, statsRes] = await Promise.all([
                fetch(`${API}/success-stories/admin/all?${params}`, { headers: authHeaders }).then(r => r.json()),
                fetch(`${API}/success-stories/admin/stats`, { headers: authHeaders }).then(r => r.json()),
            ]);

            setStories(storiesRes.stories || []);
            setTotalPages(storiesRes.totalPages || 1);
            setTotal(storiesRes.total || 0);
            setStats(statsRes);
        } catch (err) {
            console.error(err);
            toast.error('তথ্য লোড করতে ব্যর্থ হয়েছে');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchStories(); }, [statusFilter, page]);

    const handleSaved = (saved) => {
        setModalOpen(false);
        setEditingStory(null);
        fetchStories();
    };

    const handleTogglePublish = async (story) => {
        setToggling(story.id);
        try {
            const res = await fetch(`${API}/success-stories/${story.id}/publish`, {
                method: 'PATCH',
                headers: authHeaders,
            });
            if (!res.ok) throw new Error();
            toast.success(story.status === 'published' ? 'গল্পটি খসড়ায় নেওয়া হয়েছে' : 'গল্পটি প্রকাশিত হয়েছে');
            fetchStories();
        } catch {
            toast.error('অবস্থা পরিবর্তন ব্যর্থ হয়েছে');
        } finally {
            setToggling(null);
        }
    };

    const handleDelete = async () => {
        setDeleting(true);
        try {
            const res = await fetch(`${API}/success-stories/${deleteTarget.id}`, {
                method: 'DELETE',
                headers: authHeaders,
            });
            if (!res.ok) throw new Error();
            toast.success('গল্পটি মুছে ফেলা হয়েছে');
            setDeleteTarget(null);
            fetchStories();
        } catch {
            toast.error('মুছে ফেলতে ব্যর্থ হয়েছে');
        } finally {
            setDeleting(false);
        }
    };

    const FILTERS = [
        { id: 'all', label: 'সব', count: stats.total },
        { id: 'published', label: 'প্রকাশিত', count: stats.published },
        { id: 'draft', label: 'খসড়া', count: stats.drafts },
    ];

    return (
        <div className="space-y-5">
            {/* Modals */}
            {modalOpen && (
                <StoryModal
                    story={editingStory}
                    onClose={() => { setModalOpen(false); setEditingStory(null); }}
                    onSaved={handleSaved}
                />
            )}
            {deleteTarget && (
                <DeleteConfirm
                    story={deleteTarget}
                    onCancel={() => setDeleteTarget(null)}
                    onConfirm={handleDelete}
                    deleting={deleting}
                />
            )}

            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                    <h2 className="text-xl font-black text-gray-800 flex items-center gap-2">
                        <Trophy size={20} className="text-amber-500" /> সাফল্যের গল্প ব্যবস্থাপনা
                    </h2>
                    <p className="text-xs text-gray-400 mt-0.5">উদ্ধারকৃত ব্যক্তিদের অনুপ্রেরণামূলক গল্প প্রকাশ করুন</p>
                </div>
                <button
                    onClick={() => { setEditingStory(null); setModalOpen(true); }}
                    className="flex items-center gap-2 px-5 py-2.5 bg-red-500 text-white text-sm font-bold rounded-xl hover:bg-red-600 transition-colors shadow-sm"
                >
                    <Plus size={16} /> নতুন গল্প যোগ করুন
                </button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-3 gap-4">
                {[
                    { label: 'মোট গল্প', value: stats.total, color: 'bg-blue-50 text-blue-600', icon: FileText },
                    { label: 'প্রকাশিত', value: stats.published, color: 'bg-emerald-50 text-emerald-600', icon: CheckCircle },
                    { label: 'খসড়া', value: stats.drafts, color: 'bg-amber-50 text-amber-600', icon: Clock },
                ].map(s => (
                    <div key={s.label} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex items-center gap-4">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${s.color}`}>
                            <s.icon size={18} />
                        </div>
                        <div>
                            <p className="text-xl font-black text-gray-800">{s.value}</p>
                            <p className="text-xs text-gray-400">{s.label}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Filter tabs */}
            <div className="flex gap-2">
                {FILTERS.map(f => (
                    <button
                        key={f.id}
                        onClick={() => { setStatusFilter(f.id); setPage(1); }}
                        className={`flex items-center gap-1.5 text-xs font-semibold px-4 py-2 rounded-xl transition-all
                                    ${statusFilter === f.id ? 'bg-red-500 text-white shadow-sm' : 'bg-white border border-gray-200 text-gray-600 hover:border-red-300'}`}
                    >
                        {f.label}
                        <span className={`text-[10px] font-black px-1.5 py-0.5 rounded-full
                                          ${statusFilter === f.id ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-500'}`}>
                            {f.count}
                        </span>
                    </button>
                ))}
            </div>

            {/* Table */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                {loading ? (
                    <div className="flex items-center justify-center py-20">
                        <Loader2 size={24} className="animate-spin text-gray-300" />
                    </div>
                ) : stories.length === 0 ? (
                    <EmptyState message="কোনো গল্প নেই" />
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="bg-gray-50 text-left">
                                    {['#', 'শিরোনাম', 'ব্যক্তির নাম', 'বিভাগ', 'অবস্থা', 'তারিখ', 'অ্যাকশন'].map(h => (
                                        <th key={h} className="px-4 py-3 text-[11px] font-bold text-gray-400 uppercase tracking-wide">{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {stories.map(story => (
                                    <tr key={story.id} className="hover:bg-gray-50/50 transition-colors">
                                        <td className="px-4 py-3.5 text-xs text-gray-400 font-mono">#{story.id}</td>
                                        <td className="px-4 py-3.5">
                                            <div className="flex items-center gap-3">
                                                {story.photoUrl ? (
                                                    <img src={story.photoUrl} alt={story.title}
                                                        className="w-8 h-8 rounded-lg object-cover flex-shrink-0" />
                                                ) : (
                                                    <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center flex-shrink-0">
                                                        <Trophy size={14} className="text-amber-400" />
                                                    </div>
                                                )}
                                                <span className="text-xs font-semibold text-gray-700 line-clamp-2 max-w-[200px]">
                                                    {story.title}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3.5">
                                            <div className="flex items-center gap-1.5">
                                                <div className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center text-[10px] font-black text-gray-500">
                                                    {story.personName?.[0]}
                                                </div>
                                                <span className="text-xs text-gray-600">{story.personName}</span>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3.5">
                                            <span className="flex items-center gap-1 text-xs text-gray-500">
                                                <MapPin size={10} className="text-gray-400" /> {story.division}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3.5">
                                            <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full border ${STATUS_BADGE[story.status]}`}>
                                                {story.status === 'published' ? 'প্রকাশিত' : 'খসড়া'}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3.5">
                                            <span className="flex items-center gap-1 text-xs text-gray-400">
                                                <Calendar size={10} />
                                                {new Date(story.createdAt).toLocaleDateString('bn-BD')}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3.5">
                                            <div className="flex items-center gap-1">
                                                {/* Edit */}
                                                <button
                                                    onClick={() => { setEditingStory(story); setModalOpen(true); }}
                                                    className="p-1.5 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"
                                                    title="সম্পাদনা"
                                                >
                                                    <Edit2 size={13} />
                                                </button>
                                                {/* Toggle Publish */}
                                                <button
                                                    onClick={() => handleTogglePublish(story)}
                                                    disabled={toggling === story.id}
                                                    className={`p-1.5 rounded-lg transition-colors ${
                                                        story.status === 'published'
                                                            ? 'text-amber-500 hover:bg-amber-50'
                                                            : 'text-emerald-500 hover:bg-emerald-50'
                                                    }`}
                                                    title={story.status === 'published' ? 'খসড়ায় নিন' : 'প্রকাশ করুন'}
                                                >
                                                    {toggling === story.id ? (
                                                        <Loader2 size={13} className="animate-spin" />
                                                    ) : story.status === 'published' ? (
                                                        <EyeOff size={13} />
                                                    ) : (
                                                        <Eye size={13} />
                                                    )}
                                                </button>
                                                {/* Delete */}
                                                <button
                                                    onClick={() => setDeleteTarget(story)}
                                                    className="p-1.5 text-red-400 hover:bg-red-50 rounded-lg transition-colors"
                                                    title="মুছে ফেলুন"
                                                >
                                                    <Trash2 size={13} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-400">মোট {total}টি গল্প</span>
                    <div className="flex items-center gap-1">
                        <button
                            disabled={page === 1}
                            onClick={() => setPage(p => p - 1)}
                            className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 text-gray-500 hover:border-red-300 disabled:opacity-30 text-sm transition-colors"
                        >‹</button>
                        {Array.from({ length: totalPages }, (_, i) => i + 1).map(n => (
                            <button
                                key={n}
                                onClick={() => setPage(n)}
                                className={`w-8 h-8 rounded-lg text-sm font-medium transition-all ${
                                    page === n ? 'bg-red-500 text-white' : 'border border-gray-200 text-gray-600 hover:border-red-300'
                                }`}
                            >{n}</button>
                        ))}
                        <button
                            disabled={page === totalPages}
                            onClick={() => setPage(p => p + 1)}
                            className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 text-gray-500 hover:border-red-300 disabled:opacity-30 text-sm transition-colors"
                        >›</button>
                    </div>
                </div>
            )}
        </div>
    );
}
