import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { useAuth } from '../helpers/AuthContext';
import { FileText, Send, Clock, AlertTriangle, CheckCircle } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const StatusBadge = ({ status }) => {
  const styles = {
    pending: 'bg-yellow-50 text-yellow-600 border-yellow-200',
    approved: 'bg-teal-50 text-teal-600 border-teal-200',
    declined: 'bg-red-50 text-red-600 border-red-200',
  };
  return (
    <span className={`inline-flex items-center text-[10px] font-bold px-2 py-0.5 rounded-full border ${styles[status] || styles.pending}`}>
      {status === 'pending' ? 'অপেক্ষমান' : status === 'approved' ? 'গৃহীত' : 'বাতিল'}
    </span>
  );
};

export default function SystemReportPage() {
  const { user, token } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [reports, setReports] = useState([]);
  const [fetching, setFetching] = useState(true);

  const [formData, setFormData] = useState({
    type: 'bug',
    title: '',
    description: '',
    location: '',
  });

  useEffect(() => {
    if (!token) {
      toast.error('অনুগ্রহ করে লগইন করুন');
      navigate('/login');
      return;
    }

    const fetchReports = async () => {
      try {
        const response = await axios.get(`${API_URL}/reports`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setReports(response.data.reports || []);
      } catch (error) {
        console.error('Failed to fetch reports', error);
      } finally {
        setFetching(false);
      }
    };
    fetchReports();
  }, [token, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title || !formData.description) {
      toast.error('অনুগ্রহ করে সব তথ্য দিন');
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post(
        `${API_URL}/reports`,
        formData,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (response.data.success) {
        toast.success('রিপোর্ট সফলভাবে জমা হয়েছে');
        setFormData({ type: 'bug', title: '', description: '', location: '' });
        setReports([response.data.report, ...reports]);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'রিপোর্ট জমা দিতে সমস্যা হয়েছে');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-black text-gray-800">সিস্টেম রিপোর্ট</h1>
          <p className="text-gray-500 mt-2">যেকোনো সমস্যা বা মতামত আমাদের জানান</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Submit Form */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-xl font-bold flex items-center gap-2 mb-6">
              <FileText size={20} className="text-primary" /> নতুন রিপোর্ট জমা দিন
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">রিপোর্টের ধরন</label>
                <select
                  name="type"
                  value={formData.type}
                  onChange={handleChange}
                  className="w-full border-gray-200 rounded-xl focus:ring-primary focus:border-primary px-4 py-2 bg-gray-50 text-gray-700"
                >
                  <option value="bug">সিস্টেম সমস্যা (Bug)</option>
                  <option value="feedback">মতামত (Feedback)</option>
                  <option value="support">সহায়তা (Support)</option>
                  <option value="other">অন্যান্য</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">শিরোনাম <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  placeholder="রিপোর্টের শিরোনাম"
                  className="w-full border border-gray-200 rounded-xl px-4 py-2"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">বিস্তারিত <span className="text-red-500">*</span></label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows="4"
                  placeholder="বিস্তারিত সমস্যা বা মতামত লিখুন"
                  className="w-full border border-gray-200 rounded-xl px-4 py-2"
                  required
                ></textarea>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 bg-primary text-white font-bold py-3 px-4 rounded-xl hover:bg-primary/90 transition-colors"
              >
                {loading ? 'জমা হচ্ছে...' : <><Send size={18} /> রিপোর্ট করুন</>}
              </button>
            </form>
          </div>

          {/* User's Reports List */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col h-[500px]">
            <h2 className="text-xl font-bold flex items-center gap-2 mb-4">
              <Clock size={20} className="text-primary" /> আমার রিপোর্টসমূহ
            </h2>
            
            <div className="flex-1 overflow-y-auto pr-2 space-y-4">
              {fetching ? (
                <p className="text-center text-gray-500 mt-10">লোড হচ্ছে...</p>
              ) : reports.length === 0 ? (
                <div className="text-center py-10 text-gray-400">
                  <AlertTriangle size={32} className="mx-auto mb-2 text-gray-300" />
                  <p>আপনি এখনো কোনো রিপোর্ট করেননি</p>
                </div>
              ) : (
                reports.map((report) => (
                  <div key={report.id} className="border border-gray-100 rounded-xl p-4 bg-gray-50/50 hover:bg-gray-50 transition-colors">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-bold text-gray-800 text-sm">{report.title}</h3>
                      <StatusBadge status={report.status} />
                    </div>
                    <p className="text-xs text-gray-500 mt-1 mb-2 line-clamp-2">{report.description}</p>
                    <div className="flex items-center text-[10px] text-gray-400 font-medium">
                      <span className="capitalize">{report.type}</span>
                      <span className="mx-1">•</span>
                      <span>{new Date(report.createdAt).toLocaleDateString('bn-BD')}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
