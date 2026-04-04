import { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { useAuth } from '../helpers/AuthContext';
import { CheckCircle, XCircle, Clock, AlertTriangle, FileText } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const StatusBadge = ({ status }) => {
  const styles = {
    pending: 'bg-yellow-50 text-yellow-600 border-yellow-200',
    approved: 'bg-teal-50 text-teal-600 border-teal-200',
    declined: 'bg-red-50 text-red-600 border-red-200',
  };
  return (
    <span className={`inline-flex items-center text-xs font-bold px-2.5 py-1 rounded-full border ${styles[status] || styles.pending}`}>
      {status === 'pending' ? 'অপেক্ষমান' : status === 'approved' ? 'গৃহীত' : 'বাতিল'}
    </span>
  );
};

export default function AdminReportsPage() {
  const { token, user } = useAuth();
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchReports = async () => {
    try {
      const response = await axios.get(`${API_URL}/reports`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.data.success) {
        setReports(response.data.reports || []);
      }
    } catch (error) {
      toast.error('রিপোর্ট তালিকা লোড করতে সমস্যা হয়েছে');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token && user?.role === 'admin') {
      fetchReports();
    }
  }, [token, user]);

  const handleAction = async (id, action) => {
    try {
      const response = await axios.put(
        `${API_URL}/reports/${id}/${action}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (response.data.success) {
        toast.success(response.data.message);
        // Optimistic UI update
        setReports(reports.map(r => r.id === id ? { ...r, status: action === 'approve' ? 'approved' : 'declined' } : r));
      }
    } catch (error) {
      toast.error('অ্যাকশন সম্পন্ন করতে সমস্যা হয়েছে');
    }
  };

  if (loading) {
    return <div className="text-center py-20 text-gray-500">লোড হচ্ছে...</div>;
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 overflow-hidden">
      <div className="flex justify-between items-end mb-6 border-b pb-4">
        <div>
          <h2 className="text-xl font-bold flex items-center gap-2">
            <FileText size={24} className="text-primary" /> সিস্টেম রিপোর্ট রিভিউ
          </h2>
          <p className="text-sm text-gray-500 mt-1">ব্যবহারকারীদের দেওয়া সিস্টেম রিপোর্ট, বাগ ও মতামত</p>
        </div>
      </div>

      {reports.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <AlertTriangle size={48} className="mx-auto mb-3 text-gray-300" />
          <p className="text-lg font-medium text-gray-600">কোনো রিপোর্ট পাওয়া যায়নি</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/50">
                <th className="py-3 px-4 text-xs font-bold text-gray-500 uppercase">ব্যবহারকারী</th>
                <th className="py-3 px-4 text-xs font-bold text-gray-500 uppercase">রিপোর্ট</th>
                <th className="py-3 px-4 text-xs font-bold text-gray-500 uppercase">স্টেটাস</th>
                <th className="py-3 px-4 text-xs font-bold text-gray-500 uppercase text-right">অ্যাকশন</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {reports.map((r) => (
                <tr key={r.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="py-4 px-4 align-top w-1/4">
                    <p className="text-sm font-bold text-gray-800">{r.user?.firstName} {r.user?.lastName}</p>
                    <p className="text-xs text-gray-500 mt-1">{r.user?.email || r.user?.phone}</p>
                    <p className="text-[10px] text-gray-400 mt-1">
                      {new Date(r.createdAt).toLocaleDateString('bn-BD', {
                        day: 'numeric', month: 'long', year: 'numeric'
                      })}
                    </p>
                  </td>
                  <td className="py-4 px-4 align-top w-2/4">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-primary border border-primary/20 bg-primary/5 px-2 py-0.5 rounded">
                        {r.type}
                      </span>
                      <h3 className="text-sm font-bold text-gray-800">{r.title}</h3>
                    </div>
                    <p className="text-sm text-gray-600 leading-relaxed mt-2">{r.description}</p>
                  </td>
                  <td className="py-4 px-4 align-top w-1/8">
                    <StatusBadge status={r.status} />
                  </td>
                  <td className="py-4 px-4 align-top text-right w-1/8">
                    {r.status === 'pending' ? (
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleAction(r.id, 'approve')}
                          className="p-2 rounded-xl text-teal-600 bg-teal-50 hover:bg-teal-100 transition-colors"
                          title="গৃহীত করুন"
                        >
                          <CheckCircle size={18} />
                        </button>
                        <button
                          onClick={() => handleAction(r.id, 'decline')}
                          className="p-2 rounded-xl text-red-600 bg-red-50 hover:bg-red-100 transition-colors"
                          title="বাতিল করুন"
                        >
                          <XCircle size={18} />
                        </button>
                      </div>
                    ) : (
                      <span className="text-xs text-gray-400 border border-gray-200 px-2 py-1 rounded bg-gray-50">
                        {r.status === 'approved' ? 'গৃহীত' : 'বাতিলকৃত'}
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
